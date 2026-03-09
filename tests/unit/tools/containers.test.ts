import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerContainersTools } from "../../../src/tools/containers/index.js";

describe("containers module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerContainersTools(server)).not.toThrow();
	});
});
