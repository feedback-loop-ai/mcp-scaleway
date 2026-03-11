import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { registerGenerativeApisTools } from "../../../../src/tools/generative-apis/index.js";

describe("generative-apis/index", () => {
	it("should register all four generative APIs tools", () => {
		const server = new McpServer({ name: "test", version: "0.1.0" });
		const toolSpy = vi.spyOn(server, "tool");

		registerGenerativeApisTools(server);

		expect(toolSpy).toHaveBeenCalledTimes(4);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toContain("scaleway_generative_apis_list_models");
		expect(toolNames).toContain("scaleway_generative_apis_get_model");
		expect(toolNames).toContain("scaleway_generative_apis_chat_completion");
		expect(toolNames).toContain("scaleway_generative_apis_create_embedding");
	});
});
