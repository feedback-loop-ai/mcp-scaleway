import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerK8sTools } from "../../../src/tools/k8s/index.js";

describe("k8s module", () => {
	it("registers all 13 tools without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerK8sTools(server)).not.toThrow();
	});
});
