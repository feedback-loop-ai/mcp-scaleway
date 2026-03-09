import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerSecretManagerTools } from "../../../src/tools/secret-manager/index.js";

describe("secret-manager module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerSecretManagerTools(server)).not.toThrow();
	});
});
