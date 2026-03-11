import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetClient } from "../../../src/shared/client.js";
import { getClient, registerFunctionsTools } from "../../../src/tools/functions/index.js";

describe("functions module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerFunctionsTools(server)).not.toThrow();
	});

	describe("getClient", () => {
		beforeEach(() => {
			process.env.SCW_ACCESS_KEY = "SCW00000000000000000";
			process.env.SCW_SECRET_KEY = "11111111-1111-1111-1111-111111111111";
			process.env.SCW_DEFAULT_PROJECT_ID = "22222222-2222-2222-2222-222222222222";
			resetClient();
		});

		afterEach(() => {
			process.env.SCW_ACCESS_KEY = undefined;
			process.env.SCW_SECRET_KEY = undefined;
			process.env.SCW_DEFAULT_PROJECT_ID = undefined;
			resetClient();
		});

		it("returns a Scaleway client", () => {
			const client = getClient();
			expect(client).toBeDefined();
			expect(client.fetch).toBeDefined();
		});

		it("throws when env vars are missing", () => {
			process.env.SCW_ACCESS_KEY = "";
			resetClient();
			expect(() => getClient()).toThrow("SCW_ACCESS_KEY environment variable is required");
		});
	});
});
