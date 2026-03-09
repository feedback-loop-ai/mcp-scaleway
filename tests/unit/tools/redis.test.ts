import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerRedisTools } from "../../../src/tools/redis/index.js";

describe("redis module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerRedisTools(server)).not.toThrow();
	});
});
