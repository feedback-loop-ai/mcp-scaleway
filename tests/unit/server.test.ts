import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import pkg from "../../package.json";
import { createServer, startServer } from "../../src/server.js";
import type { ServerOptions } from "../../src/shared/mode.js";

const connections: Array<{ client: Client; server: McpServer }> = [];
async function connect(options?: ServerOptions) {
	const server = createServer(options);
	const client = new Client({ name: "test", version: "1" });
	const [ct, st] = InMemoryTransport.createLinkedPair();
	await Promise.all([client.connect(ct), server.connect(st)]);
	connections.push({ client, server });
	return client;
}
afterEach(async () => {
	await Promise.all(
		connections.splice(0).map(async ({ client, server }) => {
			await client.close();
			await server.close();
		}),
	);
	vi.restoreAllMocks();
	vi.unstubAllEnvs();
});

describe("server surface modes", () => {
	it("defaults to four compact tools without credentials", async () => {
		for (const name of ["SCW_ACCESS_KEY", "SCW_SECRET_KEY", "SCW_DEFAULT_PROJECT_ID"])
			vi.stubEnv(name, undefined);
		const client = await connect();
		const { tools } = await client.listTools();
		expect(tools.map((t) => t.name)).toEqual([
			"scaleway_search",
			"scaleway_describe",
			"scaleway_read",
			"scaleway_call",
		]);
		expect(Buffer.byteLength(JSON.stringify(tools))).toBeLessThan(12000);
		expect(client.getServerVersion()).toMatchObject({ name: "mcp-scaleway", version: pkg.version });
		expect(client.getInstructions()).toContain("Use scaleway_search");
		expect(Buffer.byteLength(client.getInstructions() ?? "")).toBeLessThan(2048);
	});
	it("keeps explicit createServer independent of shell filters", async () => {
		vi.stubEnv("SCW_MCP_MODE", "flat");
		vi.stubEnv("SCW_TOOLSETS", "invalid");
		const client = await connect();
		expect((await client.listTools()).tools).toHaveLength(4);
	});
	it("flat mode lists only configured operations and retains SDK validation", async () => {
		const client = await connect({ mode: "flat", filters: { toolsets: ["rdb"] } });
		const { tools } = await client.listTools();
		expect(tools).toHaveLength(27);
		expect(tools.every((t) => t.name.startsWith("scaleway_rdb_"))).toBe(true);
		expect(client.getInstructions()).toContain("Use the listed tools directly");
		const invalid = await client.callTool({ name: "scaleway_rdb_get_instance", arguments: {} });
		expect(invalid.isError).toBe(true);
	});
	it("both mode exposes gateway and selected legacy tools", async () => {
		const client = await connect({ mode: "both", filters: { toolsets: ["rdb"], readOnly: true } });
		const { tools } = await client.listTools();
		expect(tools.slice(0, 4).map((t) => t.name)).toContain("scaleway_search");
		expect(tools.length).toBeGreaterThan(4);
		expect(tools.some((t) => t.name === "scaleway_rdb_create_instance")).toBe(false);
		const result = await client.callTool({
			name: "scaleway_call",
			arguments: { op: "rdb_create_instance", params: {} },
		});
		expect(result.isError).toBe(true);
	});
	it("rejects invalid explicit modes and filters", () => {
		expect(() => createServer({ mode: "invalid" as ServerOptions["mode"] })).toThrow(
			"Invalid SCW_MCP_MODE",
		);
		expect(() => createServer({ filters: { toolsets: ["invalid"] } })).toThrow("Unknown toolset");
	});
	it("startServer reads environment only at startup", async () => {
		vi.stubEnv("SCW_MCP_MODE", "flat");
		vi.stubEnv("SCW_TOOLSETS", "rdb");
		const spy = vi.spyOn(McpServer.prototype, "connect").mockResolvedValue(undefined);
		await startServer();
		expect(spy).toHaveBeenCalledOnce();
	});
});
