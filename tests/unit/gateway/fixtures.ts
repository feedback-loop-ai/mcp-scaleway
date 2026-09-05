import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { OperationMetadata } from "../../../src/gateway/metadata.js";
import { type OperationCallback, createOperationRegistry } from "../../../src/gateway/registry.js";
import type { ToolsetConfig } from "../../../src/shared/toolsets.js";

export const result: CallToolResult = {
	content: [{ type: "text", text: "original result" }],
	_meta: { marker: "preserved" },
};
export const fixtureMetadata: OperationMetadata[] = [
	{
		tool: "scaleway_instances_list_servers",
		area: "instances",
		api: "GET /servers",
		readOnly: true,
	},
	{
		tool: "scaleway_instances_create_server",
		area: "instances",
		api: "POST /servers",
		readOnly: false,
	},
	{ tool: "scaleway_dns_update_zone", area: "dns", api: "PATCH /zones/{id}", readOnly: false },
	{ tool: "scaleway_dns_get_zone", area: "dns", api: "GET /zones/{id}", readOnly: true },
	{
		tool: "scaleway_secret_manager_access_secret_version",
		area: "secret-manager",
		api: "GET /secrets/{id}/access",
		readOnly: false,
	},
];
export function fixtureRegistry(
	callback: OperationCallback = () => result,
	filters: ToolsetConfig = {},
) {
	return createOperationRegistry(filters, {
		metadata: fixtureMetadata,
		register(server) {
			server.tool(
				fixtureMetadata[0].tool,
				"List servers by page.",
				{
					zone: z.string().regex(/^fr-par-\d$/),
					page: z.number().int().min(1).default(1),
					label: z.string().optional(),
				},
				callback,
			);
			server.tool(
				fixtureMetadata[1].tool,
				"Create a server; consumes resources.",
				{
					name: z.string().min(2),
					env: z
						.record(z.object({ description: z.string(), format: z.enum(["json", "text"]) }))
						.optional(),
				},
				callback,
			);
			server.tool(
				fixtureMetadata[2].tool,
				"Update DNS zone.",
				{
					id: z.string(),
					value: z.string().refine(async (value) => value === "valid", "Secret invalid"),
				},
				callback,
			);
			server.tool(fixtureMetadata[3].tool, "Get DNS zone; server lookup.", {}, callback);
			server.tool(fixtureMetadata[4].tool, "Access secret; may consume it.", {}, callback);
		},
	});
}
export async function connect(server: McpServer) {
	const client = new Client({ name: "gateway-test", version: "1" });
	const [a, b] = InMemoryTransport.createLinkedPair();
	await Promise.all([client.connect(a), server.connect(b)]);
	return client;
}
export function server() {
	return new McpServer({ name: "gateway-fixture", version: "1" });
}
export function textJson(result: Record<string, unknown>) {
	const content = z
		.array(z.object({ type: z.literal("text"), text: z.string() }))
		.parse(result.content);
	return JSON.parse(content[0].text);
}
