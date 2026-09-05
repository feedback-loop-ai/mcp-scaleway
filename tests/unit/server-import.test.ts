/**
 * SC-010: importing the server library entry must not connect a stdio transport. Only
 * main.ts (the bin entry) starts the server. This keeps `import { createServer } from
 * "mcp-scaleway"` safe for programmatic consumers of the published dist/server.js.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

describe("library import safety", () => {
	it("does not connect a stdio transport when src/server.js is imported", async () => {
		const connect = vi.fn();
		vi.doMock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
			StdioServerTransport: vi.fn(() => ({ connect })),
		}));
		vi.resetModules();
		const mod = await import("../../src/server.js");
		expect(typeof mod.createServer).toBe("function");
		expect(typeof mod.startServer).toBe("function");
		// Importing alone must not have constructed or connected a transport.
		expect(connect).not.toHaveBeenCalled();
		vi.doUnmock("@modelcontextprotocol/sdk/server/stdio.js");
	});
});
