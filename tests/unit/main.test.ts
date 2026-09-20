import { afterEach, describe, expect, it, vi } from "vitest";

const { startServer, checkHealth } = vi.hoisted(() => ({
	startServer: vi.fn(),
	checkHealth: vi.fn(),
}));
vi.mock("../../src/server.js", () => ({ startServer, checkHealth }));
const originalArgv = process.argv;
afterEach(() => {
	process.argv = originalArgv;
	vi.resetModules();
	vi.restoreAllMocks();
	startServer.mockReset();
	checkHealth.mockReset();
});

describe("main entry point", () => {
	it("starts the stdio server on import", async () => {
		startServer.mockResolvedValue(undefined);
		await import("../../src/main.js");
		expect(startServer).toHaveBeenCalledOnce();
		expect(checkHealth).not.toHaveBeenCalled();
	});
	it("reports a sanitized startup failure on stderr and exits non-zero", async () => {
		startServer.mockRejectedValue(new Error("SECRET-EXCEPTION"));
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
		await import("../../src/main.js");
		await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(1));
		expect(error).toHaveBeenCalledWith('{"status":"error","check":"startup"}');
	});
	it("reports local health on stdout without opening stdio", async () => {
		process.argv = ["node", "main.js", "--health"];
		checkHealth.mockResolvedValue({ status: "ok", check: "local", version: "test" });
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		await import("../../src/main.js");
		await vi.waitFor(() => expect(log).toHaveBeenCalledOnce());
		expect(JSON.parse(log.mock.calls[0][0])).toEqual({
			status: "ok",
			check: "local",
			version: "test",
		});
		expect(startServer).not.toHaveBeenCalled();
	});
	it("exits nonzero for invalid health configuration without leaking exceptions", async () => {
		process.argv = ["node", "main.js", "--health"];
		checkHealth.mockRejectedValue(new Error("SECRET-CONFIG"));
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
		await import("../../src/main.js");
		await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(1));
		expect(log).toHaveBeenCalledWith('{"status":"error","check":"local"}');
		expect(startServer).not.toHaveBeenCalled();
	});
});
