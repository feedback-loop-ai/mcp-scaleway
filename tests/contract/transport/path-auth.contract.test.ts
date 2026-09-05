/**
 * Real SDK HTTP-boundary regressions for the paths documented in
 * specs/scaleway-api/<area>/api-reference.md and tests/parity-matrix.json.
 * No client.fetch mock: the actual SDK composes URL/auth and parses responses.
 * All network requests terminate at an injected HTTP client with dummy credentials.
 */
import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createAdvancedClient, withHTTPClient, withProfile } from "@scaleway/sdk-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { registerAllTools } from "../../../src/tools/index.js";

const ID = "11111111-1111-4111-8111-111111111111";
const { http, getClient } = vi.hoisted(() => ({ http: vi.fn(), getClient: vi.fn() }));
vi.mock("../../../src/shared/client.js", () => ({ createScalewayClient: getClient }));
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "00000000-0000-4000-8000-000000000000",
		defaultProjectId: "11111111-1111-4111-8111-111111111111",
		defaultOrganizationId: "11111111-1111-4111-8111-111111111111",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const records = new Map<string, { shape: z.ZodRawShape; callback: ToolCallback<z.ZodRawShape> }>();
registerAllTools({
	tool(
		name: string,
		_description: string,
		shape: z.ZodRawShape,
		callback: ToolCallback<z.ZodRawShape>,
	) {
		records.set(name, { shape, callback });
	},
} as unknown as McpServer);

async function call(name: string) {
	const record = records.get(`scaleway_${name}`);
	if (!record) throw new Error(`Missing regression target ${name}`);
	const values: Record<string, unknown> = { region: "fr-par", zone: "fr-par-1" };
	for (const [key, schema] of Object.entries(record.shape)) {
		if (!schema.isOptional() && !(key in values)) values[key] = ID;
	}
	if (name === "dedibox_get_bmc_access") values.serverId = 123;
	return record.callback(
		z.object(record.shape).parse(values),
		{} as Parameters<typeof record.callback>[1],
	);
}

beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn(() => {
			throw new Error("Unexpected real network access");
		}),
	);
	http.mockReset();
	http.mockImplementation(
		async () =>
			new Response(JSON.stringify({ id: ID, events: [], products: [], total_count: 0 }), {
				headers: { "content-type": "application/json" },
			}),
	);
	getClient.mockReturnValue(
		createAdvancedClient(
			withProfile({
				accessKey: "SCWXXXXXXXXXXXXXXXXX",
				secretKey: "00000000-0000-4000-8000-000000000000",
				defaultProjectId: ID,
				defaultOrganizationId: ID,
				defaultRegion: "fr-par",
				defaultZone: "fr-par-1",
			}),
			withHTTPClient(http as unknown as typeof fetch),
		),
	);
});
afterEach(() => vi.unstubAllGlobals());

const cases = [
	["audit_trail_list_events", "/audit-trail/v1alpha1/regions/fr-par/events"],
	["data_lab_get_cluster", `/datalab/v1beta1/regions/fr-par/datalabs/${ID}`],
	["data_warehouse_get_deployment", `/datawarehouse/v1beta1/regions/fr-par/deployments/${ID}`],
	["dedibox_get_bmc_access", "/dedibox/v1/zones/fr-par-1/servers/123/bmc-access"],
	["file_storage_get_filesystem", `/file/v1alpha1/regions/fr-par/filesystems/${ID}`],
	[
		"interlink_get_dedicated_connection",
		`/interlink/v1beta1/regions/fr-par/dedicated-connections/${ID}`,
	],
	["kafka_get_cluster", `/kafka/v1alpha1/regions/fr-par/clusters/${ID}`],
	["mailbox_get_alias", `/mailbox/v1alpha1/aliases/${ID}`],
	["nats_get_account", `/mnq/v1beta1/regions/fr-par/nats-accounts/${ID}`],
	["opensearch_get_deployment", `/searchdb/v1alpha1/regions/fr-par/deployments/${ID}`],
	["rabbitmq_get_deployment", `/messageq/v1alpha1/regions/fr-par/deployments/${ID}`],
	["tem_get_domain", `/transactional-email/v1alpha1/regions/fr-par/domains/${ID}`],
	["vpn_get_connection", `/s2s-vpn/v1alpha1/regions/fr-par/connections/${ID}`],
	["product_catalog_list_products", "/product-catalog/v2alpha1/public-catalog/products"],
	["rdb_get_instance", `/rdb/v1/regions/fr-par/instances/${ID}`],
	["elastic_metal_get_server", `/baremetal/v1/zones/fr-par-1/servers/${ID}`],
	["sqs_get_credentials", `/mnq/v1beta1/regions/fr-par/sqs-credentials/${ID}`],
] as const;

describe("documented GET endpoints through the real SDK", () => {
	it.each(cases)("%s constructs authenticated URL and parses the result", async (name, path) => {
		const result = await call(name);
		expect(result.isError).not.toBe(true);
		expect(http).toHaveBeenCalledOnce();
		const request = http.mock.calls[0][0] as Request;
		const url = new URL(request.url);
		expect(url.origin).toBe("https://api.scaleway.com");
		expect(url.pathname).toBe(path);
		expect(request.method).toBe("GET");
		expect(request.headers.get("x-auth-token")).toBe("00000000-0000-4000-8000-000000000000");
		expect(result.content[0].type).toBe("text");
		const block = result.content[0];
		if (block.type !== "text") throw new Error("Expected text result");
		expect(() => JSON.parse(block.text)).not.toThrow();
	});
	it.each([400, 401, 403, 404, 429, 500])("maps actual SDK HTTP %i errors", async (status) => {
		http.mockResolvedValue(
			new Response(JSON.stringify({ message: "upstream rejected request" }), {
				status,
				headers: { "content-type": "application/json" },
			}),
		);
		const result = await call("rdb_get_instance");
		expect(result.isError).toBe(true);
		const block = result.content[0];
		if (block.type !== "text") throw new Error("Expected error text");
		expect(JSON.parse(block.text).error.statusCode).toBe(status);
	});
});
