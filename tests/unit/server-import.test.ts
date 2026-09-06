/** SC-010: importing the library must neither construct nor connect a stdio transport. */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
	vi.doUnmock("@modelcontextprotocol/sdk/server/stdio.js");
	vi.restoreAllMocks();
	vi.resetModules();
});

describe("library import safety", () => {
	it("does not construct or connect a transport on import", async () => {
		const transportConstructor = vi.fn();
		const connect = vi.spyOn(McpServer.prototype, "connect").mockResolvedValue(undefined);
		vi.doMock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
			StdioServerTransport: transportConstructor,
		}));
		vi.resetModules();
		const mod = await import("../../src/server.js");
		expect(typeof mod.createServer).toBe("function");
		expect(typeof mod.startServer).toBe("function");
		expect(transportConstructor).not.toHaveBeenCalled();
		expect(connect).not.toHaveBeenCalled();
	});
});
