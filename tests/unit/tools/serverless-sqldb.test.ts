import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerServerlessSqldbTools } from "../../../src/tools/serverless-sqldb/index.js";

describe("serverless-sqldb module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerServerlessSqldbTools(server)).not.toThrow();
	});
});
