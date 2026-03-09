import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerJobsTools } from "../../../src/tools/jobs/index.js";

describe("jobs module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerJobsTools(server)).not.toThrow();
	});
});
