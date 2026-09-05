import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
	MAX_ERROR_SCHEMA_BYTES,
	executeOperation,
	registerGatewayTools,
} from "../../../src/gateway/index.js";
import {
	type OperationCallback,
	type OperationExtra,
	createOperationRegistry,
} from "../../../src/gateway/registry.js";
import { installCatalogListing } from "../../../src/shared/catalog.js";
import { connect, fixtureMetadata, fixtureRegistry, result, server, textJson } from "./fixtures.js";

const extra: OperationExtra = {
	signal: new AbortController().signal,
	requestId: 1,
	sendNotification: vi.fn(),
	sendRequest: vi.fn(),
};
afterEach(() => vi.restoreAllMocks());

describe("gateway execution", () => {
	it("applies defaults, async refinements and forwards extra to the same callback", async () => {
		const callback = vi.fn<OperationCallback>(() => result);
		const registry = fixtureRegistry(callback);
		expect(
			await executeOperation(
				registry,
				{ op: "instances_list_servers", params: { zone: "fr-par-1" } },
				extra,
				true,
			),
		).toBe(result);
		expect(callback).toHaveBeenLastCalledWith({ zone: "fr-par-1", page: 1 }, extra);
		expect(await executeOperation(registry, { op: "dns_get_zone" }, extra, false)).toBe(result);
		expect(callback).toHaveBeenLastCalledWith({}, extra);
		expect(
			await executeOperation(
				registry,
				{ op: "dns_update_zone", params: { id: "1", value: "valid" } },
				extra,
				false,
			),
		).toBe(result);
		const invalid = await executeOperation(
			registry,
			{ op: "dns_update_zone", params: { id: "1", value: "secret" } },
			extra,
			false,
		);
		expect(invalid.isError).toBe(true);
		expect(textJson(invalid)).toEqual({
			error: {
				type: "invalid_input",
				message:
					"Invalid operation parameters. Correct these fields using the schema; scaleway_describe returns the full contract.",
				statusCode: 400,
			},
			op: "dns_update_zone",
			issues: [{ code: "custom", field: "value" }],
			inputSchema: registry.get("dns_update_zone")?.inputSchema,
		});
		expect(callback).toHaveBeenCalledTimes(3);
	});
	it("validates record values, preserves original isError and does not double wrap results", async () => {
		const failure = { ...result, isError: true };
		const callback = vi.fn<OperationCallback>(() => failure);
		const registry = fixtureRegistry(callback);
		const params = { name: "server", env: { KEY: { description: "value", format: "json" } } };
		expect(
			await executeOperation(registry, { op: "instances_create_server", params }, extra, false),
		).toBe(failure);
		const invalid = await executeOperation(
			registry,
			{ op: "instances_create_server", params: { name: "server", env: { KEY: "value" } } },
			extra,
			false,
		);
		expect(invalid.isError).toBe(true);
		expect(callback).toHaveBeenCalledTimes(1);
	});
	it("rejects writes and ephemeral access via read before validation or execution", async () => {
		const callback = vi.fn<OperationCallback>(() => result);
		for (const op of ["instances_create_server", "secret_manager_access_secret_version"]) {
			const response = await executeOperation(fixtureRegistry(callback), { op }, extra, true);
			expect(response.isError).toBe(true);
			expect(textJson(response)).toEqual({
				error: {
					type: "permission_denied",
					message:
						"This operation is not read-only. Use scaleway_call if authorized; IAM and configured filters still apply.",
					statusCode: 403,
				},
				op,
			});
		}
		expect(callback).not.toHaveBeenCalled();
	});
	it("sanitizes thrown errors and thrown Zod errors including secret-bearing record paths", async () => {
		const secret = "DO_NOT_ECHO_SECRET";
		const callback = vi.fn<OperationCallback>(() => {
			throw new Error(secret);
		});
		const registry = fixtureRegistry(callback);
		const failure = await executeOperation(registry, { op: "dns_get_zone" }, extra, true);
		expect(JSON.stringify(failure)).not.toContain(secret);
		expect(failure.isError).toBe(true);
		expect(textJson(failure)).toEqual({
			error: {
				type: "server_error",
				message:
					"Operation failed. Check scaleway_describe for parameters, Scaleway IAM permissions and service availability before retrying.",
				statusCode: 500,
			},
			op: "dns_get_zone",
		});
		const issues: z.ZodIssue[] = [
			{ code: "custom", path: [secret], message: secret },
			{ code: "custom", path: [1], message: secret },
			{ code: "custom", path: [], message: secret },
		];
		callback.mockImplementation(() => {
			throw new z.ZodError(issues);
		});
		const invalid = await executeOperation(registry, { op: "dns_get_zone" }, extra, false);
		expect(JSON.stringify(invalid)).not.toContain(secret);
		expect(textJson(invalid).issues).toEqual(
			issues.map(() => ({ code: "custom", field: "params" })),
		);
	});
	it("bounds validation schema and issue counts, pointing to describe rather than corrupting schemas", async () => {
		const shape = Object.fromEntries(
			Array.from({ length: 500 }, (_, i) => [`field${i}`, z.string().describe("x".repeat(100))]),
		);
		const registry = createOperationRegistry(
			{},
			{
				metadata: [fixtureMetadata[0]],
				register(s) {
					s.tool(fixtureMetadata[0].tool, "Large", shape, () => result);
				},
			},
		);
		const invalid = await executeOperation(registry, { op: "instances_list_servers" }, extra, true);
		expect(textJson(invalid)).toMatchObject({
			error: { type: "invalid_input", statusCode: 400 },
			op: "instances_list_servers",
			schemaOmitted: true,
		});
		expect(textJson(invalid)).not.toHaveProperty("inputSchema");
		expect(textJson(invalid).issues).toHaveLength(10);
		expect(Buffer.byteLength(JSON.stringify(invalid))).toBeLessThan(MAX_ERROR_SCHEMA_BYTES);
	});
	it("does not expose submitted enum values or refinement exceptions", async () => {
		const registry = createOperationRegistry(
			{},
			{
				metadata: [fixtureMetadata[0]],
				register(s) {
					s.tool(
						fixtureMetadata[0].tool,
						"Test",
						{
							mode: z.enum(["one", "two"]),
							password: z.string().refine(async (value) => {
								throw value;
							}),
						},
						() => result,
					);
				},
			},
		);
		const invalid = await executeOperation(
			registry,
			{
				op: "instances_list_servers",
				params: { mode: "SECRET_ENUM", password: "SECRET_PASSWORD" },
			},
			extra,
			true,
		);
		expect(JSON.stringify(invalid)).not.toContain("SECRET_");
		expect(invalid.isError).toBe(true);
	});
	it("rejects unknown IDs without invoking a handler and validates envelope input", async () => {
		const callback = vi.fn<OperationCallback>(() => result);
		const registry = fixtureRegistry(callback);
		const unknown = await executeOperation(registry, { op: "dns_get_zones" }, extra, false);
		expect(unknown.isError).toBe(true);
		expect(textJson(unknown)).toEqual({
			error: {
				type: "not_found",
				message:
					"Unknown or disabled operation. Use scaleway_search to find an allowed ID; filters apply to execution too.",
				statusCode: 404,
			},
			suggestions: ["dns_get_zone", "dns_update_zone"],
		});
		// Envelope ({op, params}) validation stays an SDK-native thrown error, as for flat tools.
		await expect(executeOperation(registry, { op: "" }, extra, false)).rejects.toThrow(z.ZodError);
		expect(callback).not.toHaveBeenCalled();
	});
	it("uses one envelope shape across every gateway error class over MCP", async () => {
		const callback = vi.fn<OperationCallback>(() => {
			throw new Error("boom");
		});
		const instance = server();
		registerGatewayTools(
			instance,
			fixtureRegistry(callback, { excludeTools: ["dns_update_zone"] }),
		);
		const client = await connect(instance);
		try {
			const cases: Array<[string, Record<string, unknown>, string, number, string[]]> = [
				["scaleway_search", { area: "nope" }, "not_found", 404, ["areas"]],
				["scaleway_describe", { ops: ["dns_update_zone"] }, "not_found", 404, ["suggestions"]],
				["scaleway_read", { op: "dns_update_zone" }, "not_found", 404, ["suggestions"]],
				["scaleway_read", { op: "instances_create_server" }, "permission_denied", 403, ["op"]],
				[
					"scaleway_call",
					{ op: "instances_list_servers", params: { zone: "nope" } },
					"invalid_input",
					400,
					["op", "issues", "inputSchema"],
				],
				["scaleway_call", { op: "dns_get_zone" }, "server_error", 500, ["op"]],
			];
			for (const [name, args, type, statusCode, keys] of cases) {
				const response = await client.callTool({ name, arguments: args });
				expect(response.isError, name).toBe(true);
				const body = textJson(response);
				expect(body.error).toEqual({ type, message: expect.any(String), statusCode });
				expect(Object.keys(body).sort()).toEqual(["error", ...keys].sort());
			}
			// SDK-native outer validation of the envelope itself is deliberately left to the SDK.
			const native = await client.callTool({ name: "scaleway_read", arguments: { op: 1 } });
			expect(native.isError).toBe(true);
			expect(() => textJson(native)).toThrow();
		} finally {
			await client.close();
			await instance.close();
		}
	});
	it("exposes exactly four concise protocol tools with correct annotations and errors", async () => {
		const instance = server();
		installCatalogListing(instance, registerGatewayTools(instance, fixtureRegistry()));
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
			expect(listed.tools.map((t) => t.annotations?.readOnlyHint)).toEqual([
				true,
				true,
				true,
				false,
			]);
			expect(
				(await client.callTool({ name: "scaleway_search", arguments: { area: "missing" } }))
					.isError,
			).toBe(true);
			expect(
				(await client.callTool({ name: "scaleway_describe", arguments: { ops: ["missing"] } }))
					.isError,
			).toBe(true);
			expect(
				(await client.callTool({ name: "scaleway_search", arguments: { area: "dns" } })).isError,
			).not.toBe(true);
			expect(
				(await client.callTool({ name: "scaleway_describe", arguments: { ops: ["dns_get_zone"] } }))
					.isError,
			).not.toBe(true);
			expect(
				await client.callTool({ name: "scaleway_read", arguments: { op: "dns_get_zone" } }),
			).toMatchObject(result);
			expect(
				await client.callTool({ name: "scaleway_call", arguments: { op: "dns_get_zone" } }),
			).toMatchObject(result);
		} finally {
			await client.close();
			await instance.close();
		}
	});
});
