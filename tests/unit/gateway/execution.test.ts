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
		expect(textJson(invalid).issues).toEqual([{ code: "custom", field: "value" }]);
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
			expect(textJson(response).error).toContain("not read-only");
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
		expect(textJson(invalid)).toMatchObject({ schemaOmitted: true });
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
		expect((await executeOperation(registry, { op: "unknown" }, extra, false)).isError).toBe(true);
		await expect(executeOperation(registry, { op: "" }, extra, false)).rejects.toThrow();
		expect(callback).not.toHaveBeenCalled();
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
