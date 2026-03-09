import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerObjectStorageTools } from "../../../src/tools/object-storage/index.js";

describe("object-storage module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerObjectStorageTools(server)).not.toThrow();
	});
});
