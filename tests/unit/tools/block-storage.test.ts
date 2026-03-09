import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerBlockStorageTools } from "../../../src/tools/block-storage/index.js";

describe("block-storage module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerBlockStorageTools(server)).not.toThrow();
	});
});
