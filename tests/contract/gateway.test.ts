/**
 * Local MCP meta contracts: scaleway_search, scaleway_describe, scaleway_read, scaleway_call.
 * Contract: specs/059-discovery-token-reduction/contracts/gateway-tools.md.
 * Underlying endpoint/area traceability is generated from tests/parity-matrix.json and
 * specs/scaleway-api/<area>/api-reference.md; these four tools are not cloud endpoints.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	DISCOVERY_FLOW_BYTE_BUDGET,
	measureDiscoveryFlow,
} from "../../scripts/measure-discovery.js";
import { registerGatewayTools } from "../../src/gateway/index.js";
import metadata from "../../src/gateway/operations.json";
import {
	type OperationCallback,
	type OperationRegistry,
	createOperationRegistry,
	registerFlatTools,
} from "../../src/gateway/registry.js";
import { installCatalogListing } from "../../src/shared/catalog.js";
import { connect, fixtureRegistry, result, server, textJson } from "../unit/gateway/fixtures.js";

beforeEach(() =>
	vi.stubGlobal(
		"fetch",
		vi.fn(() => {
			throw new Error("Network forbidden in gateway contracts");
		}),
	),
);
afterEach(() => {
	expect(fetch).not.toHaveBeenCalled();
	vi.unstubAllGlobals();
});

describe("scaleway_search contract", () => {
	it("reaches every actual operation through bounded protocol pages and exposes exactly four tools", async () => {
		const registry = createOperationRegistry();
		const instance = server();
		installCatalogListing(instance, registerGatewayTools(instance, registry));
		const client = await connect(instance);
		try {
			const listed = await client.listTools();
			expect(listed.tools.map((t) => t.name)).toEqual([
				"scaleway_search",
				"scaleway_describe",
				"scaleway_read",
				"scaleway_call",
			]);
			expect(Buffer.byteLength(JSON.stringify(listed))).toBeLessThan(12_000);
			const discovered = new Set<string>();
			const areas: string[] = [];
			let areaOffset = 0;
			while (true) {
				const page = textJson(
					await client.callTool({
						name: "scaleway_search",
						arguments: { limit: 7, offset: areaOffset },
					}),
				);
				expect(page.areas.length).toBeLessThanOrEqual(7);
				areas.push(...page.areas.map((a: { area: string }) => a.area));
				if (page.nextOffset === undefined) break;
				expect(page.nextOffset).toBeGreaterThan(areaOffset);
				areaOffset = page.nextOffset;
			}
			for (const area of areas) {
				let offset = 0;
				let seen = 0;
				while (true) {
					const page = textJson(
						await client.callTool({
							name: "scaleway_search",
							arguments: { area, limit: 3, offset },
						}),
					);
					expect(page.operations.length).toBeLessThanOrEqual(3);
					for (const op of page.operations) {
						expect(op).not.toHaveProperty("inputSchema");
						expect(op.description.length).toBeLessThanOrEqual(180);
						discovered.add(`scaleway_${op.op}`);
						seen++;
					}
					if (page.nextOffset === undefined) {
						expect(seen).toBe(page.total);
						break;
					}
					expect(page.nextOffset).toBeGreaterThan(offset);
					offset = page.nextOffset;
				}
			}
			expect([...discovered].sort()).toEqual(metadata.map((r) => r.tool).sort());
		} finally {
			await client.close();
			await instance.close();
		}
	});
	it("lists byte-identical gateway tool definitions for the fixture registry and the real catalog", async () => {
		const listings: string[] = [];
		for (const registry of [fixtureRegistry(), createOperationRegistry()] as OperationRegistry[]) {
			const instance = server();
			installCatalogListing(instance, registerGatewayTools(instance, registry));
			const client = await connect(instance);
			try {
				listings.push(JSON.stringify(await client.listTools()));
			} finally {
				await client.close();
				await instance.close();
			}
		}
		expect(listings[0]).toBe(listings[1]);
		expect(Buffer.byteLength(listings[1])).toBeLessThan(12_000);
	});
	it("keeps the representative offline search->describe flow inside its byte budget", async () => {
		// Measured 2026-09: search 310 B + describe 1051 B = 1361 B over the in-memory transport.
		// Bytes are not tokens and no operation is executed; this guards discovery payload drift only.
		const flow = await measureDiscoveryFlow("rdb list databases", "rdb_list_databases");
		expect(flow.searchHits).toContain("rdb_list_databases");
		expect(flow.describedOps).toEqual(["rdb_list_databases"]);
		expect(flow.searchBytes).toBeGreaterThan(0);
		expect(flow.describeBytes).toBeGreaterThan(flow.searchBytes);
		expect(flow.totalBytes).toBe(flow.searchBytes + flow.describeBytes);
		expect(flow.totalBytes).toBeLessThanOrEqual(DISCOVERY_FLOW_BYTE_BUDGET);
		expect(DISCOVERY_FLOW_BYTE_BUDGET).toBe(2_048);
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe("scaleway_describe contract", () => {
	it("serves actual faithful schemas and errors for unknown IDs and oversized batches", async () => {
		const registry = createOperationRegistry();
		const instance = server();
		registerGatewayTools(instance, registry);
		const client = await connect(instance);
		try {
			const response = textJson(
				await client.callTool({
					name: "scaleway_describe",
					arguments: {
						ops: ["containers_create_namespace", "instances_list_servers", "dns_update_records"],
					},
				}),
			);
			for (const described of response.operations)
				expect(described.inputSchema).toEqual(registry.get(described.op)?.inputSchema);
			expect(
				response.operations[0].inputSchema.properties.environmentVariables.additionalProperties,
			).toEqual({ type: "string" });
			expect(response.operations[1].inputSchema.properties.page.default).toBe(1);
			expect(JSON.stringify(response.operations[2].inputSchema)).toContain("anyOf");
			// Oversized batches are SDK-native outer validation errors (left to the SDK on purpose).
			const oversized = await client.callTool({
				name: "scaleway_describe",
				arguments: { ops: Array(11).fill("instances_list_servers") },
			});
			expect(oversized.isError).toBe(true);
			expect(() => textJson(oversized)).toThrow();
			const unknown = await client.callTool({
				name: "scaleway_describe",
				arguments: { ops: ["not_real"] },
			});
			expect(unknown.isError).toBe(true);
			expect(textJson(unknown)).toEqual({
				error: {
					type: "not_found",
					message:
						"Unknown or disabled operation. Use scaleway_search to find an allowed ID; filters apply to execution too.",
					statusCode: 404,
				},
				suggestions: [],
			});
			const typo = textJson(
				await client.callTool({
					name: "scaleway_describe",
					arguments: { ops: ["rdb_list_databse"] },
				}),
			);
			expect(typo.error).toMatchObject({ type: "not_found", statusCode: 404 });
			expect(typo.suggestions[0]).toBe("rdb_list_databases");
			expect(typo.suggestions.length).toBeLessThanOrEqual(5);
			const badArea = await client.callTool({
				name: "scaleway_search",
				arguments: { area: "not-real" },
			});
			expect(badArea.isError).toBe(true);
			expect(textJson(badArea)).toMatchObject({
				error: {
					type: "not_found",
					message: "Unknown or disabled area. Use an enabled area slug or omit area to list them.",
					statusCode: 404,
				},
				areas: expect.arrayContaining(["rdb", "instances"]),
			});
		} finally {
			await client.close();
			await instance.close();
		}
	});
});

describe("scaleway_read and scaleway_call contracts", () => {
	it("validates original inputs, applies defaults and preserves read/mutation/error results over MCP", async () => {
		const callback = vi.fn<OperationCallback>(() => result);
		const instance = server();
		registerGatewayTools(instance, fixtureRegistry(callback));
		const client = await connect(instance);
		try {
			expect(
				await client.callTool({
					name: "scaleway_read",
					arguments: { op: "instances_list_servers", params: { zone: "fr-par-1" } },
				}),
			).toMatchObject(result);
			expect(callback.mock.calls[0][0]).toEqual({ page: 1, zone: "fr-par-1" });
			expect(callback.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
			const params = {
				name: "server",
				env: { API: { description: "string-value", format: "json" } },
			};
			expect(
				await client.callTool({
					name: "scaleway_call",
					arguments: { op: "instances_create_server", params },
				}),
			).toMatchObject(result);
			expect(callback.mock.calls[1][0]).toEqual(params);
			for (const args of [
				{ op: "instances_list_servers", params: { zone: "invalid" } },
				{ op: "instances_create_server", params: { name: "x" } },
				{
					op: "instances_create_server",
					params: { name: "ok", env: { SECRET_KEY: "SECRET_VALUE" } },
				},
				{ op: "dns_update_zone", params: { id: "a", value: "SECRET_VALUE" } },
			]) {
				const invalid = await client.callTool({ name: "scaleway_call", arguments: args });
				expect(invalid.isError).toBe(true);
				expect(JSON.stringify(invalid)).not.toContain("SECRET_");
				const body = textJson(invalid);
				expect(body).toMatchObject({
					error: {
						type: "invalid_input",
						message: expect.stringContaining("Invalid operation parameters"),
						statusCode: 400,
					},
					op: args.op,
					issues: expect.arrayContaining([{ code: expect.any(String), field: expect.any(String) }]),
				});
				expect(body).toHaveProperty("inputSchema");
				expect(Object.keys(body).sort()).toEqual(["error", "inputSchema", "issues", "op"]);
			}
			expect(callback).toHaveBeenCalledTimes(2);
			// Handler-produced results, including their own error bodies, are never re-wrapped.
			callback.mockReturnValue({ ...result, isError: true });
			expect(
				await client.callTool({ name: "scaleway_read", arguments: { op: "dns_get_zone" } }),
			).toMatchObject({ ...result, isError: true });
			const refused = await client.callTool({
				name: "scaleway_read",
				arguments: { op: "instances_create_server" },
			});
			expect(refused.isError).toBe(true);
			expect(textJson(refused)).toEqual({
				error: {
					type: "permission_denied",
					message:
						"This operation is not read-only. Use scaleway_call if authorized; IAM and configured filters still apply.",
					statusCode: 403,
				},
				op: "instances_create_server",
			});
			callback.mockImplementation(() => {
				throw new Error("credential-sensitive error");
			});
			const thrown = await client.callTool({
				name: "scaleway_read",
				arguments: { op: "dns_get_zone" },
			});
			expect(thrown.isError).toBe(true);
			expect(JSON.stringify(thrown)).not.toContain("credential-sensitive");
			expect(textJson(thrown)).toEqual({
				error: {
					type: "server_error",
					message:
						"Operation failed. Check scaleway_describe for parameters, Scaleway IAM permissions and service availability before retrying.",
					statusCode: 500,
				},
				op: "dns_get_zone",
			});
			// The {op, params} envelope itself stays SDK-native validation, as for flat tools.
			const native = await client.callTool({ name: "scaleway_call", arguments: { op: "" } });
			expect(native.isError).toBe(true);
			expect(() => textJson(native)).toThrow();
		} finally {
			await client.close();
			await instance.close();
		}
	});
	it.each(["gateway", "flat", "both"])(
		"cannot bypass filters in %s mode with call/read or legacy names",
		async (mode) => {
			const callback = vi.fn<OperationCallback>(() => result);
			const registry = fixtureRegistry(callback, {
				toolsets: ["instances"],
				tools: ["dns_get_zone", "dns_update_zone"],
				excludeTools: ["dns_get_zone"],
				readOnly: true,
			});
			const instance = server();
			const flat = mode === "gateway" ? [] : registerFlatTools(instance, registry);
			const gateway = mode === "flat" ? [] : registerGatewayTools(instance, registry);
			installCatalogListing(instance, [...flat, ...gateway]);
			const client = await connect(instance);
			try {
				const listed = await client.listTools();
				expect(listed.tools).toHaveLength(mode === "gateway" ? 4 : mode === "flat" ? 1 : 5);
				if (mode !== "flat") {
					const areaPage = textJson(
						await client.callTool({ name: "scaleway_search", arguments: {} }),
					);
					expect(areaPage.areas).toEqual([{ area: "instances", total: 1 }]);
					for (const id of [
						"instances_create_server",
						"dns_get_zone",
						"dns_update_zone",
						"secret_manager_access_secret_version",
					]) {
						for (const op of [id, `scaleway_${id}`]) {
							for (const tool of ["scaleway_read", "scaleway_call"]) {
								const denied = await client.callTool({ name: tool, arguments: { op } });
								expect(denied.isError).toBe(true);
								expect(textJson(denied)).toMatchObject({
									error: { type: "not_found", statusCode: 404 },
								});
							}
							const described = await client.callTool({
								name: "scaleway_describe",
								arguments: { ops: [op] },
							});
							expect(described.isError).toBe(true);
							// Suggestions rank only the allowed registry: disabled IDs never leak.
							const body = textJson(described);
							expect(body).toEqual({
								error: { type: "not_found", message: expect.any(String), statusCode: 404 },
								suggestions: expect.any(Array),
							});
							expect(body.suggestions.length).toBeLessThanOrEqual(5);
							for (const suggested of body.suggestions) {
								expect(suggested).toBe("instances_list_servers");
							}
						}
					}
				}
				for (const name of [
					"scaleway_instances_create_server",
					"scaleway_dns_get_zone",
					"scaleway_dns_update_zone",
					"scaleway_secret_manager_access_secret_version",
				])
					expect((await client.callTool({ name, arguments: {} })).isError).toBe(true);
				expect(callback).not.toHaveBeenCalled();
			} finally {
				await client.close();
				await instance.close();
			}
		},
	);
	it("keeps ephemeral secret GET access out of read-only routes", async () => {
		const callback = vi.fn<OperationCallback>(() => result);
		const instance = server();
		registerGatewayTools(instance, fixtureRegistry(callback));
		const client = await connect(instance);
		try {
			const op = "secret_manager_access_secret_version";
			expect((await client.callTool({ name: "scaleway_read", arguments: { op } })).isError).toBe(
				true,
			);
			expect(callback).not.toHaveBeenCalled();
			expect(await client.callTool({ name: "scaleway_call", arguments: { op } })).toMatchObject(
				result,
			);
			expect(callback).toHaveBeenCalledOnce();
		} finally {
			await client.close();
			await instance.close();
		}
	});
});

describe("read-only endpoint confinement", () => {
	it.each(["gateway", "flat", "both"] as const)(
		"%s rejects revision path injection before dispatch",
		async (mode) => {
			const registry = createOperationRegistry({
				toolsets: ["secret-manager"],
				readOnly: true,
				excludeTools: ["secret_manager_access_secret_version"],
			});
			const instance = server();
			const definitions = [];
			if (mode !== "flat") definitions.push(...registerGatewayTools(instance, registry));
			if (mode !== "gateway") definitions.push(...registerFlatTools(instance, registry));
			installCatalogListing(instance, definitions);
			const client = await connect(instance);
			try {
				for (const revision of [
					"1/access",
					"1%2faccess",
					"../1/access",
					"latest?x=1",
					"1#access",
				]) {
					const params = { secretId: "11111111-1111-4111-8111-111111111111", revision };
					for (const name of mode === "flat"
						? ["scaleway_secret_manager_get_secret_version"]
						: ["scaleway_read", "scaleway_call"]) {
						const response = await client.callTool({
							name,
							arguments: name.startsWith("scaleway_secret")
								? params
								: { op: "secret_manager_get_secret_version", params },
						});
						expect(response.isError).toBe(true);
					}
				}
			} finally {
				await client.close();
				await instance.close();
			}
		},
	);
});
