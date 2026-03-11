import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetClient } from "../../../src/shared/client.js";
import { registerAppleSiliconTools } from "../../../src/tools/apple-silicon/index.js";

const TEST_ENV = {
	SCW_ACCESS_KEY: "SCWXXXXXXXXXXXXXXXXX",
	SCW_SECRET_KEY: "11111111-1111-1111-1111-111111111111",
	SCW_DEFAULT_PROJECT_ID: "22222222-2222-2222-2222-222222222222",
};

describe("apple-silicon module", () => {
	beforeEach(() => {
		Object.assign(process.env, TEST_ENV);
	});

	afterEach(() => {
		for (const key of Object.keys(TEST_ENV)) {
			delete process.env[key];
		}
		resetClient();
	});

	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerAppleSiliconTools(server)).not.toThrow();
	});
});
