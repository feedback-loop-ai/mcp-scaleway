import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { createServer, startServer } from "../../src/server.js";

describe("createServer", () => {
	it("returns an McpServer instance", () => {
		const server = createServer();
		expect(server).toBeInstanceOf(McpServer);
	});

	it("registers all tools without throwing", () => {
		expect(() => createServer()).not.toThrow();
	});
});

describe("startServer", () => {
	it("creates server and connects transport", async () => {
		const mockConnect = vi.fn().mockResolvedValue(undefined);
		vi.spyOn(McpServer.prototype, "connect").mockImplementation(mockConnect);

		await startServer();

		expect(mockConnect).toHaveBeenCalledOnce();
		vi.restoreAllMocks();
	});
});
