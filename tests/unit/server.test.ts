import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, startServer } from "../../src/server.js";
import { resetClient } from "../../src/shared/client.js";

const TEST_ENV = {
	SCW_ACCESS_KEY: "SCWXXXXXXXXXXXXXXXXX",
	SCW_SECRET_KEY: "11111111-1111-1111-1111-111111111111",
	SCW_DEFAULT_PROJECT_ID: "22222222-2222-2222-2222-222222222222",
};

describe("createServer", () => {
	beforeEach(() => {
		Object.assign(process.env, TEST_ENV);
	});

	afterEach(() => {
		for (const key of Object.keys(TEST_ENV)) {
			delete process.env[key];
		}
		resetClient();
	});

	it("returns an McpServer instance", () => {
		const server = createServer();
		expect(server).toBeInstanceOf(McpServer);
	});

	it("registers all tools without throwing", () => {
		expect(() => createServer()).not.toThrow();
	});
});

describe("startServer", () => {
	beforeEach(() => {
		Object.assign(process.env, TEST_ENV);
	});

	afterEach(() => {
		for (const key of Object.keys(TEST_ENV)) {
			delete process.env[key];
		}
		resetClient();
	});

	it("creates server and connects transport", async () => {
		const mockConnect = vi.fn().mockResolvedValue(undefined);
		vi.spyOn(McpServer.prototype, "connect").mockImplementation(mockConnect);

		await startServer();

		expect(mockConnect).toHaveBeenCalledOnce();
		vi.restoreAllMocks();
	});
});
