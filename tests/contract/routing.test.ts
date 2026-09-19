/** Optional MCP routing contract: specs/061-intent-routing/contracts/route.md. No live model or cloud calls. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { type DecisionProvider, createJevProvider } from "../../src/routing/index.js";
import { createServer } from "../../src/server.js";
import { resolveServerOptions } from "../../src/shared/mode.js";
import { connect, textJson } from "../unit/gateway/fixtures.js";

afterEach(() => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});

describe("optional scaleway_route MCP contract", () => {
	it.each([401, 403, 429, 503])(
		"falls back through the native adapter on HTTP %i without failing the MCP call",
		async (status) => {
			const fetcher = vi.fn().mockResolvedValue(new Response("PRIVATE provider body", { status }));
			const server = createServer({
				filters: { toolsets: ["instances"], readOnly: true },
				router: { provider: createJevProvider({ apiKey: "test-key", fetch: fetcher }) },
			});
			const client = await connect(server);
			try {
				const response = await client.callTool({
					name: "scaleway_route",
					arguments: { intent: "Show my VMs", limit: 1 },
				});
				expect(response.isError).not.toBe(true);
				const result = textJson(response);
				expect(result).toMatchObject({
					source: "local",
					status: "ambiguous",
					reason: "provider_unavailable",
					providerCalls: 1,
					candidates: [{ op: "instances_list_servers" }],
				});
				expect(JSON.stringify(result)).not.toContain("PRIVATE");
				expect(result.candidates[0]).not.toHaveProperty("probability");
				expect(fetcher).toHaveBeenCalledOnce();
			} finally {
				await client.close();
				await server.close();
			}
		},
	);
	it("adds a fifth suggestion tool, retains local discovery and never executes handlers", async () => {
		const network = vi.fn(() => {
			throw new Error("Network forbidden");
		});
		vi.stubGlobal("fetch", network);
		const provider: DecisionProvider = {
			choose: vi.fn(async ({ choices }) => {
				const choice = Object.hasOwn(choices, "instances") ? "instances" : "instances_list_servers";
				return {
					choice,
					confidence: 1,
					probabilities: Object.fromEntries(
						Object.keys(choices).map((key) => [key, key === choice ? 1 : 0]),
					),
				};
			}),
		};
		const server = createServer({
			filters: { toolsets: ["instances"], readOnly: true },
			router: { provider },
		});
		const client = await connect(server);
		try {
			const tools = (await client.listTools()).tools;
			expect(tools).toHaveLength(5);
			expect(tools[4]).toMatchObject({
				name: "scaleway_route",
				annotations: {
					readOnlyHint: true,
					destructiveHint: false,
					idempotentHint: false,
					openWorldHint: true,
				},
			});
			expect(client.getInstructions()).toContain("confidence is uncalibrated");
			await client.callTool({ name: "scaleway_search", arguments: { query: "list servers" } });
			await client.callTool({
				name: "scaleway_describe",
				arguments: { ops: ["instances_list_servers"] },
			});
			expect(provider.choose).not.toHaveBeenCalled();
			const result = textJson(
				await client.callTool({
					name: "scaleway_route",
					arguments: { intent: "show my VMs", context: "Paris", limit: 1 },
				}),
			);
			expect(result).toMatchObject({
				status: "matched",
				providerCalls: 2,
				candidates: [{ op: "instances_list_servers", readOnly: true }],
			});
			expect(network).not.toHaveBeenCalled();
		} finally {
			await client.close();
			await server.close();
		}
	});
	it("reports provider failure without raw errors and leaves discovery available", async () => {
		const provider = { choose: vi.fn().mockRejectedValue(new Error("PRIVATE provider detail")) };
		const server = createServer({ router: { provider } });
		const client = await connect(server);
		try {
			const result = textJson(
				await client.callTool({ name: "scaleway_route", arguments: { intent: "list servers" } }),
			);
			expect(result).toMatchObject({
				status: "ambiguous",
				source: "local",
				reason: "provider_unavailable",
			});
			expect(result.candidates).toEqual(
				expect.arrayContaining([expect.objectContaining({ op: "instances_list_servers" })]),
			);
			expect(JSON.stringify(result)).not.toContain("PRIVATE");
			const search = textJson(
				await client.callTool({
					name: "scaleway_search",
					arguments: { query: "instances list servers" },
				}),
			);
			expect(search.operations[0].op).toBe("instances_list_servers");
			const invalid = await client.callTool({
				name: "scaleway_route",
				arguments: { intent: "", limit: 9 },
			});
			expect(invalid.isError).toBe(true);
		} finally {
			await client.close();
			await server.close();
		}
	});
	it("starts with missing Jev credentials and keeps routing, discovery and description usable offline", async () => {
		const network = vi.fn(() => {
			throw new Error("Network forbidden");
		});
		vi.stubGlobal("fetch", network);
		const server = createServer(
			resolveServerOptions({ SCW_ROUTER: "jev", SCW_TOOLSETS: "instances", SCW_READ_ONLY: "1" }),
		);
		const client = await connect(server);
		try {
			expect((await client.listTools()).tools).toHaveLength(5);
			const result = textJson(
				await client.callTool({
					name: "scaleway_route",
					arguments: { intent: "Show my virtual machines", limit: 1 },
				}),
			);
			expect(result).toMatchObject({
				status: "ambiguous",
				source: "local",
				reason: "provider_not_configured",
				providerCalls: 0,
				candidates: [{ op: "instances_list_servers", readOnly: true }],
			});
			expect(
				result.candidates.every(
					(candidate: { readOnly: boolean; probability?: number }) =>
						candidate.readOnly && candidate.probability === undefined,
				),
			).toBe(true);
			const search = textJson(
				await client.callTool({ name: "scaleway_search", arguments: { query: "list servers" } }),
			);
			expect(search.operations[0].op).toBe("instances_list_servers");
			const description = await client.callTool({
				name: "scaleway_describe",
				arguments: { ops: ["instances_list_servers"] },
			});
			expect(description.isError).not.toBe(true);
			expect(network).not.toHaveBeenCalled();
		} finally {
			await client.close();
			await server.close();
		}
	});
	it("keeps default listing independent of router environment and disallows flat-only routing", async () => {
		vi.stubEnv("SCW_ROUTER", "jev");
		vi.stubEnv("TYPESAFE_API_KEY", "private");
		const server = createServer();
		const client = await connect(server);
		try {
			expect((await client.listTools()).tools).toHaveLength(4);
		} finally {
			await client.close();
			await server.close();
		}
		expect(() => createServer({ mode: "flat", router: { provider: { choose: vi.fn() } } })).toThrow(
			"Routing requires gateway or both mode.",
		);
	});
});
