import { afterEach, describe, expect, it, vi } from "vitest";

const { startServer } = vi.hoisted(() => ({ startServer: vi.fn() }));
vi.mock("../../src/server.js", () => ({ startServer }));

afterEach(() => {
	vi.resetModules();
	vi.restoreAllMocks();
	startServer.mockReset();
});

describe("main entry point", () => {
	it("starts the stdio server on import", async () => {
		startServer.mockResolvedValue(undefined);
		await import("../../src/main.js");
		expect(startServer).toHaveBeenCalledOnce();
	});

	it("reports a startup failure on stderr and exits non-zero", async () => {
		const failure = new Error("SCW_ACCESS_KEY environment variable is required");
		startServer.mockRejectedValue(failure);
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
		await import("../../src/main.js");
		await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(1));
		expect(error).toHaveBeenCalledWith("Failed to start MCP server:", failure);
	});
});
