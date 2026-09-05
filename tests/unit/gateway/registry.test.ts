import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import operations from "../../../src/gateway/operations.json";
import {
	type OperationCallback,
	createOperationRegistry,
	registerFlatTools,
} from "../../../src/gateway/registry.js";
import { installCatalogListing } from "../../../src/shared/catalog.js";
import { connect, fixtureMetadata, fixtureRegistry, result, server } from "./fixtures.js";

describe("operation recorder", () => {
	it("records every supported operation and keeps exact lookup within immutable filters", () => {
		const registry = createOperationRegistry();
		expect(registry.operations.map((op) => op.tool)).toEqual(operations.map((op) => op.tool));
		expect(Object.isFrozen(registry)).toBe(true);
		expect(Object.isFrozen(registry.operations)).toBe(true);
		expect(Object.isFrozen(registry.operations[0])).toBe(true);
		expect(registry.get("scaleway_instances_list_servers")).toBe(
			registry.get("instances_list_servers"),
		);
		for (const name of ["instances_list", "", "toString", "__proto__"])
			expect(registry.get(name)).toBeUndefined();
		vi.stubEnv("SCW_TOOLSETS", "not-real");
		try {
			expect(fixtureRegistry().operations.length).toBe(fixtureMetadata.length);
		} finally {
			vi.unstubAllEnvs();
		}
	});
	it("fails on duplicate, missing and mismatched metadata", () => {
		expect(() => createOperationRegistry({}, { metadata: [] })).toThrow();
		expect(() =>
			createOperationRegistry({}, { metadata: [fixtureMetadata[0], fixtureMetadata[0]] }),
		).toThrow("Duplicate operation metadata");
		expect(() =>
			createOperationRegistry({}, { metadata: [{ ...fixtureMetadata[2], readOnly: true }] }),
		).toThrow("Invalid read-only classification");
		expect(() =>
			createOperationRegistry({}, { metadata: [fixtureMetadata[0]], register() {} }),
		).toThrow("Metadata has no registered tool");
		expect(() =>
			createOperationRegistry(
				{},
				{
					metadata: [fixtureMetadata[0]],
					register(s) {
						s.tool("scaleway_unknown_tool", "Unknown", {}, () => result);
					},
				},
			),
		).toThrow("Missing operation metadata for registered tool scaleway_unknown_tool");
		expect(() =>
			createOperationRegistry(
				{},
				{
					metadata: [fixtureMetadata[0]],
					register(s) {
						s.tool(fixtureMetadata[0].tool, "List servers", {}, () => result);
						s.tool(fixtureMetadata[0].tool, "List servers", {}, () => result);
					},
				},
			),
		).toThrow("Duplicate tool registration");
	});
	it.each([
		[42, {}, () => result],
		["description", null, () => result],
		["description", {}, null],
	])("rejects unsupported registrar overloads %j", (...args) => {
		const register = (s: McpServer) => Reflect.apply(s.tool, s, [fixtureMetadata[0].tool, ...args]);
		expect(() => createOperationRegistry({}, { metadata: [fixtureMetadata[0]], register })).toThrow(
			"Unsupported registration",
		);
	});
	it("snapshots raw-shape maps and original callbacks", () => {
		const shape = { id: z.string() };
		const callback = vi.fn(() => result);
		const registry = createOperationRegistry(
			{},
			{
				metadata: [fixtureMetadata[0]],
				register(s) {
					s.tool(fixtureMetadata[0].tool, "List", shape, callback);
				},
			},
		);
		shape.id = z.string().min(20);
		expect(registry.operations[0].schema.safeParse({ id: "x" }).success).toBe(true);
		expect(registry.operations[0].callback).toBe(callback);
	});
});

describe("flat registration", () => {
	it("uses original SDK parsing/defaults and conservative annotations", async () => {
		const cb = vi.fn<OperationCallback>(() => result);
		const instance = server();
		const registry = fixtureRegistry(cb, { toolsets: ["instances", "dns"] });
		const definitions = registerFlatTools(instance, registry);
		installCatalogListing(instance, definitions);
		const client = await connect(instance);
		try {
			const { tools } = await client.listTools();
			expect(tools.map((t) => t.name)).toEqual(registry.operations.map((op) => op.tool));
			expect(tools.find((t) => t.name === "scaleway_dns_update_zone")?.annotations).toMatchObject({
				readOnlyHint: false,
				destructiveHint: true,
				idempotentHint: false,
			});
			expect(tools.find((t) => t.name === "scaleway_dns_get_zone")?.annotations).toMatchObject({
				readOnlyHint: true,
				destructiveHint: false,
			});
			expect(
				await client.callTool({
					name: "scaleway_instances_list_servers",
					arguments: { zone: "fr-par-1" },
				}),
			).toMatchObject(result);
			expect(cb.mock.calls[0][0]).toEqual({ zone: "fr-par-1", page: 1 });
			const invalid = await client.callTool({
				name: "scaleway_instances_list_servers",
				arguments: {},
			});
			expect(invalid.isError).toBe(true);
			expect(cb).toHaveBeenCalledTimes(1);
		} finally {
			await client.close();
			await instance.close();
		}
	});
});
