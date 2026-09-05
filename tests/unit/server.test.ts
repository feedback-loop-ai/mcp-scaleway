import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, startServer } from "../../src/server.js";
import { resetClient } from "../../src/shared/client.js";

const TEST_ENV = {
	SCW_ACCESS_KEY: "SCWXXXXXXXXXXXXXXXXX",
	SCW_SECRET_KEY: "11111111-1111-1111-1111-111111111111",
	SCW_DEFAULT_PROJECT_ID: "22222222-2222-2222-2222-222222222222",
};

const SCW_ENV_KEYS = [...Object.keys(TEST_ENV), "SCW_DEFAULT_ORGANIZATION_ID"];

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const packageVersion: string = JSON.parse(
	readFileSync(resolve(repoRoot, "package.json"), "utf-8"),
).version;

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

	it("registers all tools without credentials in the environment", () => {
		const saved = new Map<string, string | undefined>();
		for (const key of SCW_ENV_KEYS) {
			saved.set(key, process.env[key]);
			delete process.env[key];
		}
		try {
			expect(() => createServer()).not.toThrow();
		} finally {
			for (const [key, value] of saved) {
				if (value !== undefined) {
					process.env[key] = value;
				}
			}
		}
	});

	describe("serverInfo over a real MCP handshake", () => {
		let client: Client;

		beforeEach(async () => {
			const server = createServer();
			const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
			client = new Client({ name: "test-client", version: "0.0.1" });
			await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
		});

		afterEach(async () => {
			await client.close();
		});

		it("advertises the package.json version and the mcp-scaleway name", () => {
			const info = client.getServerVersion();
			expect(info).toBeDefined();
			expect(info?.name).toBe("mcp-scaleway");
			expect(info?.version).toBe(packageVersion);
			expect(info?.version).toMatch(/^\d+\.\d+\.\d+/);
		});

		it("exposes tools through the connected client", async () => {
			const { tools } = await client.listTools();
			expect(tools.length).toBeGreaterThan(0);
			expect(tools.map((t) => t.name)).toContain("scaleway_apple_silicon_list_servers");
		});
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
