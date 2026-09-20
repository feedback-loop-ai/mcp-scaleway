/** Contract: specs/064-remaining-remediation/contracts/pagination-consumption.md. */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import examplesJson from "../../src/gateway/examples.json";
import { createServer } from "../../src/server.js";
import { resetClient } from "../../src/shared/client.js";
import { connect } from "../unit/gateway/fixtures.js";

const examples = examplesJson as Record<string, Record<string, unknown>>;

const http = vi.hoisted(() =>
	vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(),
);
vi.mock("@scaleway/sdk-client", async (importOriginal) => {
	const sdk = await importOriginal<typeof import("@scaleway/sdk-client")>();
	return {
		...sdk,
		createClient: (profile: Parameters<typeof sdk.createClient>[0]) =>
			sdk.createAdvancedClient(
				sdk.withProfile(profile ?? {}),
				sdk.withHTTPClient(http as unknown as typeof fetch),
				sdk.withAdditionalInterceptors(profile?.interceptors ?? []),
			),
	};
});

beforeEach(() => {
	resetClient();
	http.mockReset();
	vi.stubEnv("SCW_ACCESS_KEY", "SCWXXXXXXXXXXXXXXXXX");
	vi.stubEnv("SCW_SECRET_KEY", "11111111-1111-4111-8111-111111111111");
	vi.stubEnv("SCW_DEFAULT_PROJECT_ID", "11111111-1111-4111-8111-111111111111");
	vi.spyOn(process.stderr, "write").mockReturnValue(true);
});
afterEach(() => {
	resetClient();
	vi.restoreAllMocks();
	vi.unstubAllEnvs();
});

describe("pagination consumption through registered gateway dispatch", () => {
	it.each([undefined, null, []])(
		"RDB endpoints distinguishes omission from empty %#",
		async (endpoints) => {
			http.mockResolvedValue(Response.json({ endpoints }));
			const server = createServer();
			const client = await connect(server);
			try {
				const result = await client.callTool({
					name: "scaleway_read",
					arguments: { op: "rdb_list_endpoints", params: examples.scaleway_rdb_list_endpoints },
				});
				expect(http).toHaveBeenCalledOnce();
				if (endpoints === undefined || endpoints === null) {
					expect(result.isError).toBe(true);
					expect(result.structuredContent).toMatchObject({ data: { error: { statusCode: 502 } } });
				} else {
					expect(result.isError).not.toBe(true);
					expect(result.structuredContent).toEqual({ format: "json", data: { endpoints: [] } });
				}
			} finally {
				await client.close();
				await server.close();
			}
		},
	);

	it.each([
		["vpc_list_vpcs", "vpcs"],
		["vpc_list_private_networks", "private_networks"],
		["sqs_list_credentials", "sqs_credentials"],
		["cockpit_list_data_sources", "data_sources"],
		["cockpit_list_tokens", "tokens"],
		["cockpit_list_grafana_users", "grafana_users"],
		["cockpit_list_contact_points", "contact_points"],
		["cockpit_list_managed_alerts_contact_points", "contact_points"],
		["inference_list_deployments", "deployments"],
		["inference_list_models", "models"],
		["inference_list_node_types", "node_types"],
	])("%s does not invent missing list data", async (op, field) => {
		const server = createServer();
		const client = await connect(server);
		try {
			for (const body of [{ [field]: [] }, { total_count: 0 }]) {
				http.mockResolvedValue(Response.json(body));
				const result = await client.callTool({
					name: "scaleway_read",
					arguments: { op, params: examples[`scaleway_${op}`] },
				});
				expect(result.isError).toBe(true);
				expect(result.structuredContent).toMatchObject({
					data: {
						error: { statusCode: 502, message: "Invalid upstream response (invalid_schema)" },
					},
				});
			}
			expect(http).toHaveBeenCalledTimes(2);
		} finally {
			await client.close();
			await server.close();
		}
	});

	it.each([
		["k8s_list_pools", "pools"],
		["vpn_list_gateways", "gateways"],
		["vpn_list_customer_gateways", "gateways"],
	])("%s preserves the documented result array", async (op, field) => {
		const items = [
			{
				id: "11111111-1111-4111-8111-111111111111",
				future: "retained",
				...(op === "k8s_list_pools" ? { node_type: "DEV1-M", size: 1 } : {}),
			},
		];
		http.mockResolvedValue(Response.json({ [field]: items, total_count: 1 }));
		const server = createServer();
		const client = await connect(server);
		try {
			const result = await client.callTool({
				name: "scaleway_read",
				arguments: { op, params: examples[`scaleway_${op}`] },
			});
			expect(result.isError).not.toBe(true);
			expect(result.structuredContent).toMatchObject({ data: { items, totalCount: 1 } });
			expect(http).toHaveBeenCalledOnce();
		} finally {
			await client.close();
			await server.close();
		}
	});

	it.each([{}, { clusters: [] }, { total_count: 0 }, { future: "PRIVATE_BODY_CANARY" }])(
		"returns a safe error for partial upstream list %#",
		async (body) => {
			http.mockResolvedValue(Response.json(body));
			const server = createServer({ filters: { toolsets: ["k8s"] } });
			const client = await connect(server);
			try {
				const result = await client.callTool({
					name: "scaleway_read",
					arguments: { op: "k8s_list_clusters", params: { region: "fr-par" } },
				});
				expect(http).toHaveBeenCalledOnce();
				expect(result.isError).toBe(true);
				expect(result.structuredContent).toEqual({
					format: "json",
					data: {
						error: {
							type: "server_error",
							statusCode: 502,
							message: "Invalid upstream response (invalid_schema)",
						},
					},
				});
				expect(JSON.stringify(result)).not.toContain("PRIVATE_BODY_CANARY");
			} finally {
				await client.close();
				await server.close();
			}
		},
	);

	it("preserves an empty but complete list", async () => {
		http.mockResolvedValue(Response.json({ clusters: [], total_count: 0 }));
		const server = createServer({ filters: { toolsets: ["k8s"] } });
		const client = await connect(server);
		try {
			const result = await client.callTool({
				name: "scaleway_read",
				arguments: { op: "k8s_list_clusters", params: { region: "fr-par" } },
			});
			expect(result.isError).not.toBe(true);
			expect(result.structuredContent).toEqual({
				format: "json",
				data: { items: [], totalCount: 0, page: 1, pageSize: 50 },
			});
		} finally {
			await client.close();
			await server.close();
		}
	});
});
