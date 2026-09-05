/**
 * Endpoint confinement contract: specs/059-discovery-token-reduction/contracts/gateway-tools.md
 * (Endpoint confinement). Every dispatched request must stay on the operation's declared
 * endpoint from tests/parity-matrix.json, checked on the RAW path before URL normalization.
 * Real createServer, registry, schemas, handlers and SDK; only HTTP is replaced.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "../../src/server.js";
import { resetClient } from "../../src/shared/client.js";
import type { ServerMode } from "../../src/shared/mode.js";
import { connect } from "../unit/gateway/fixtures.js";

const UUID = "11111111-1111-4111-8111-111111111111";
const SECRET_ACCESS = `../../../../../secret-manager/v1beta1/regions/fr-par/secrets/${UUID}/versions/1/access`;

const blockedFetch = vi.hoisted(() => {
	const forbidden = () => {
		throw new Error("network forbidden");
	};
	return Object.assign(vi.fn<(...args: Parameters<typeof fetch>) => Promise<Response>>(forbidden), {
		preconnect: forbidden,
	}) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
});
vi.mock("@scaleway/sdk-client", async (importOriginal) => {
	const sdk = await importOriginal<typeof import("@scaleway/sdk-client")>();
	return {
		...sdk,
		createClient: (profile: Parameters<typeof sdk.createClient>[0]) =>
			sdk.createAdvancedClient(sdk.withProfile(profile ?? {}), sdk.withHTTPClient(blockedFetch)),
	};
});

// Reviewer-reproduced escapes: each value drives a different handler/interpolation style.
const escapes: Array<{ op: string; params: Record<string, unknown> }> = [
	{ op: "rdb_get_instance", params: { region: "fr-par", instance_id: SECRET_ACCESS } },
	{ op: "rdb_get_instance", params: { region: "fr-par", instance_id: "1/../../instances/2" } },
	{ op: "marketplace_get_image", params: { imageId: "../../../iam/v1alpha1/api-keys" } },
	{
		op: "redis_get_cluster",
		params: { zone: "fr-par-1", cluster_id: "../../../../iam/v1alpha1/api-keys" },
	},
	{
		op: "tem_get_domain",
		params: { region: "fr-par", domain_id: "../../../iam/v1alpha1/api-keys" },
	},
	{
		op: "webhosting_get_hosting",
		params: { region: "fr-par", hosting_id: "../../iam/v1alpha1/api-keys" },
	},
	{
		op: "apple_silicon_get_server",
		params: { zone: "fr-par-1", server_id: "../../../iam/v1alpha1/api-keys" },
	},
	{ op: "domain_registrar_get_domain", params: { domain: "../../iam/v1alpha1/api-keys" } },
	{ op: "edge_services_get_pipeline", params: { pipelineId: "../../../iam/v1alpha1/api-keys" } },
	{
		op: "sns_get_credentials",
		params: {
			region: "fr-par",
			snsCredentialsId: `../../secret-manager/v1beta1/regions/fr-par/secrets/${UUID}/versions/latest/access`,
		},
	},
	{
		op: "object_storage_get_bucket_versioning",
		params: { region: "fr-par", bucket: "../../other-bucket" },
	},
	{
		op: "object_storage_get_bucket_versioning",
		params: { region: "fr-par", bucket: "mine?policy" },
	},
	{ op: "iam_get_user", params: { user_id: "%2e%2e%2fgroups%2fabc" } },
];

beforeEach(() => {
	resetClient();
	blockedFetch.mockReset();
	vi.stubGlobal("fetch", blockedFetch);
	vi.stubEnv("SCW_ACCESS_KEY", "SCWXXXXXXXXXXXXXXXXX");
	vi.stubEnv("SCW_SECRET_KEY", UUID);
	vi.stubEnv("SCW_DEFAULT_PROJECT_ID", UUID);
	vi.stubEnv("SCW_DEFAULT_REGION", "fr-par");
	vi.stubEnv("SCW_DEFAULT_ZONE", "fr-par-1");
});
afterEach(() => {
	resetClient();
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});

function calls(mode: ServerMode, op: string, params: Record<string, unknown>) {
	const gateway = [
		{ name: "scaleway_read", arguments: { op, params } },
		{ name: "scaleway_call", arguments: { op, params } },
	];
	const flat = { name: `scaleway_${op}`, arguments: params };
	return mode === "flat" ? [flat] : mode === "gateway" ? gateway : [...gateway, flat];
}

describe.each(["gateway", "flat", "both"] as const)("endpoint confinement (%s)", (mode) => {
	it("blocks every path escape before HTTP, across all read-only areas", async () => {
		const instance = createServer({ mode, filters: { readOnly: true } });
		const client = await connect(instance);
		try {
			for (const { op, params } of escapes) {
				for (const call of calls(mode, op, params)) {
					const result = await client.callTool(call);
					expect(result.isError, `${op} ${JSON.stringify(params)}`).toBe(true);
					// The blocking error never echoes the injected value back to the caller.
					expect(JSON.stringify(result)).not.toContain("api-keys");
				}
			}
			expect(blockedFetch).not.toHaveBeenCalled();
		} finally {
			await client.close();
			await instance.close();
		}
	});

	it("still dispatches honest identifiers to exactly the declared endpoint", async () => {
		blockedFetch.mockImplementation(
			async () =>
				new Response(JSON.stringify({ id: UUID }), {
					headers: { "content-type": "application/json" },
				}),
		);
		const instance = createServer({ mode, filters: { readOnly: true } });
		const client = await connect(instance);
		try {
			const honest = [
				{
					op: "rdb_get_instance",
					params: { region: "fr-par", instance_id: UUID },
					path: `/rdb/v1/regions/fr-par/instances/${UUID}`,
				},
				{
					op: "marketplace_get_image",
					params: { imageId: UUID },
					path: `/marketplace/v2/images/${UUID}`,
				},
				{
					op: "domain_registrar_get_domain",
					params: { domain: "example.com" },
					path: "/domain/v2beta1/domains/example.com",
				},
			];
			for (const { op, params, path } of honest) {
				for (const call of calls(mode, op, params)) {
					blockedFetch.mockClear();
					const result = await client.callTool(call);
					expect(result.isError, `${op}`).not.toBe(true);
					const request = blockedFetch.mock.calls[0][0] as Request;
					expect(new URL(request.url).pathname).toBe(path);
				}
			}
		} finally {
			await client.close();
			await instance.close();
		}
	});
});
