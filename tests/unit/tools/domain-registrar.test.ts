import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerDomainRegistrarTools } from "../../../src/tools/domain-registrar/index.js";

describe("domain-registrar module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerDomainRegistrarTools(server)).not.toThrow();
	});
});
