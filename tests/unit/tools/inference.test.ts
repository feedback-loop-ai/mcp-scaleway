import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerInferenceTools } from "../../../src/tools/inference/index.js";

describe("inference module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerInferenceTools(server)).not.toThrow();
	});
});
