/**
 * Contract: specs/064-remaining-remediation/contracts/pagination-consumption.md.
 * API Reference entries below identify each table-driven operation. All endpoints are GET;
 * paths shown relative to a reference's stated base URL use that same published prefix.
 * - specs/scaleway-api/rdb/api-reference.md#endpoints: rdb_list_endpoints reads the
 *   endpoints field from /rdb/v1/regions/{region}/instances/{instance_id} (Get Instance).
 * - specs/scaleway-api/vpc/api-reference.md#vpcs and #private-networks: List VPCs and
 *   List Private Networks, /vpc/v2/regions/{region}/{vpcs|private-networks}.
 * - specs/scaleway-api/sqs/api-reference.md#list-sqs-credentials:
 *   /mnq/v1beta1/regions/{region}/sqs-credentials.
 * - specs/scaleway-api/cockpit/api-reference.md: Data Sources (regional), Tokens
 *   (regional), Grafana Users (global), Contact Points (regional), and Managed Alerts.
 *   Paths: /cockpit/v1/regions/{region}/data-sources, /tokens and
 *   /alert-manager/contact-points under that regional prefix; global
 *   /cockpit/v1/grafana/users. The managed-alerts list ID aliases List Contact Points.
 * - specs/scaleway-api/inference/api-reference.md#deployments, #models and #node-types:
 *   List Deployments, List Models and List Node Types, respectively
 *   /inference/v1/regions/{region}/{deployments|models|node-types}.
 * - specs/scaleway-api/k8s/api-reference.md#list-clusters and #list-pools:
 *   /k8s/v1/regions/{region}/clusters and /clusters/{cluster_id}/pools under that prefix.
 * - specs/scaleway-api/vpn/api-reference.md#list-vpn-gateways and #list-customer-gateways:
 *   /s2s-vpn/v1alpha1/regions/{region}/{vpn-gateways|customer-gateways}.
 * Full method/path mappings and source response schemas: tests/contract-evidence.json
 * and src/shared/response-contracts.json, keyed by each case's scaleway_${op} ID.
 */
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
