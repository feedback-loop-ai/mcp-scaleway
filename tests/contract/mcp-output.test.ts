/** Local MCP envelope and trace contracts: specs/064-remaining-remediation/mcp-contracts.md. */
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerGatewayTools } from "../../src/gateway/index.js";
import { registerFlatTools } from "../../src/gateway/registry.js";
import { registerRoutingTool } from "../../src/routing/index.js";
import { installCatalogListing } from "../../src/shared/catalog.js";
import { StructuredOutput, outputSchema } from "../../src/shared/output.js";
import { connect, fixtureRegistry, server } from "../unit/gateway/fixtures.js";

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllEnvs();
});

describe("structured MCP results and secret-free dispatch logs", () => {
	it.each(["gateway", "flat", "both"])("%s validates output and preserves text", async (mode) => {
		const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);
		const secret = "SECRET-PARAMETER-AND-RESPONSE";
		vi.stubEnv("SCW_SECRET_KEY", "SECRET-CREDENTIAL");
		vi.stubEnv("TYPESAFE_API_KEY", "SECRET-MODEL-CREDENTIAL");
		const original: CallToolResult = {
			content: [{ type: "text", text: JSON.stringify({ secret }) }],
			_meta: { original: true },
		};
		const callback = vi.fn(() => original);
		const registry = fixtureRegistry(callback, { toolsets: ["instances"], readOnly: true });
		const instance = server();
		const definitions = [
			...(mode !== "flat" ? registerGatewayTools(instance, registry) : []),
			...(mode !== "gateway" ? registerFlatTools(instance, registry) : []),
		];
		installCatalogListing(instance, definitions);
		const client = await connect(instance);
		try {
			const listed = await client.listTools();
			expect(
				listed.tools.every(
					(tool) => JSON.stringify(tool.outputSchema) === JSON.stringify(outputSchema),
				),
			).toBe(true);
			expect(stderr).not.toHaveBeenCalled();
			for (const surface of mode === "both" ? ["gateway", "flat"] : [mode]) {
				const params = { zone: "fr-par-1", label: secret };
				const result = await client.callTool({
					name: surface === "gateway" ? "scaleway_read" : "scaleway_instances_list_servers",
					arguments: surface === "gateway" ? { op: "instances_list_servers", params } : params,
				});
				expect(result.content).toEqual(original.content);
				expect(result._meta).toEqual(original._meta);
				expect(StructuredOutput.parse(result.structuredContent)).toEqual({
					format: "json",
					data: { secret },
				});
			}
			expect(stderr).toHaveBeenCalledTimes(mode === "both" ? 2 : 1);
			for (const [line] of stderr.mock.calls) {
				const event = JSON.parse(String(line));
				expect(event).toMatchObject({
					event: "operation",
					op: "instances_list_servers",
					outcome: "success",
				});
				expect(Object.keys(event).sort()).toEqual(["durationMs", "event", "op", "outcome"]);
				expect(String(line)).not.toContain("SECRET");
			}
		} finally {
			await client.close();
			await instance.close();
		}
	});
	it("logs safe identifiers on invalid parameters and unknown/filtered operations", async () => {
		const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);
		const callback = vi.fn(() => ({ content: [] }));
		const registry = fixtureRegistry(callback, { toolsets: ["instances"], readOnly: true });
		const instance = server();
		registerGatewayTools(instance, registry);
		const client = await connect(instance);
		try {
			for (const args of [
				{ op: "SECRET-UNKNOWN-OP", params: { password: "SECRET-VALUE" } },
				{ op: "instances_create_server", params: {} },
				{ op: "instances_list_servers", params: { zone: "SECRET-BAD-ZONE" } },
			]) {
				const result = await client.callTool({ name: "scaleway_read", arguments: args });
				expect(result.isError).toBe(true);
				expect(StructuredOutput.safeParse(result.structuredContent).success).toBe(true);
			}
			expect(callback).not.toHaveBeenCalled();
			expect(stderr).toHaveBeenCalledTimes(3);
			expect(stderr.mock.calls.map(([line]) => JSON.parse(String(line)).op)).toEqual([
				"scaleway_read",
				"scaleway_read",
				"instances_list_servers",
			]);
			expect(JSON.stringify(stderr.mock.calls)).not.toContain("SECRET");
		} finally {
			await client.close();
			await instance.close();
		}
	});
	it("keeps optional local routing structured and traces one recommendation without executing", async () => {
		const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);
		const callback = vi.fn(() => ({ content: [] }));
		const instance = server();
		const registry = fixtureRegistry(callback);
		installCatalogListing(instance, [registerRoutingTool(instance, registry, {})]);
		const client = await connect(instance);
		try {
			expect((await client.listTools()).tools[0].outputSchema).toEqual(outputSchema);
			const result = await client.callTool({
				name: "scaleway_route",
				arguments: { intent: "list servers" },
			});
			expect(result.structuredContent).toMatchObject({ format: "json", data: { source: "local" } });
			expect(stderr).toHaveBeenCalledOnce();
			expect(callback).not.toHaveBeenCalled();
		} finally {
			await client.close();
			await instance.close();
		}
	});
});
