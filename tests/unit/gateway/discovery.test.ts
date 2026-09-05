import { describe, expect, it } from "vitest";
import { describeOperations, searchOperations } from "../../../src/gateway/discovery.js";
import { fixtureRegistry } from "./fixtures.js";

describe("bounded deterministic discovery", () => {
	const registry = fixtureRegistry();
	it("returns paginated area totals on an empty query", () => {
		expect(searchOperations(registry, {})).toEqual({
			areas: [
				{ area: "dns", total: 2 },
				{ area: "instances", total: 2 },
				{ area: "secret-manager", total: 1 },
			],
			total: 3,
			totalOperations: 5,
		});
		expect(searchOperations(registry, { limit: 1 })).toMatchObject({ total: 3, nextOffset: 1 });
		expect(searchOperations(registry, { limit: 1, offset: 2 })).not.toHaveProperty("nextOffset");
		expect(searchOperations(registry, { offset: 100 })).toMatchObject({ areas: [] });
	});
	it("ranks exact IDs first, uses all query tokens and breaks ties by ID", () => {
		expect(searchOperations(registry, { query: "scaleway_instances_list_servers" })).toMatchObject({
			operations: [{ op: "instances_list_servers" }],
		});
		expect(searchOperations(registry, { query: "instances_list_servers" })).toMatchObject({
			operations: [{ op: "instances_list_servers" }],
		});
		expect(searchOperations(registry, { query: " LIST servers " })).toMatchObject({ total: 1 });
		expect(searchOperations(registry, { query: "server" })).toMatchObject({
			operations: [{ op: "instances_create_server" }, { op: "dns_get_zone" }],
		});
		expect(searchOperations(registry, { query: "dns" })).toMatchObject({
			operations: [{ op: "dns_get_zone" }, { op: "dns_update_zone" }],
		});
		expect(searchOperations(registry, { query: "not found" })).toEqual({
			operations: [],
			total: 0,
		});
	});
	it("keeps area paging reachable, exposes required/optional names not full schemas", () => {
		expect(searchOperations(registry, { area: "instances", limit: 1 })).toMatchObject({
			total: 2,
			nextOffset: 1,
		});
		const next = searchOperations(registry, { area: "instances", limit: 1, offset: 1 });
		expect(next).toEqual({
			total: 2,
			operations: [
				{
					op: "instances_list_servers",
					description: "List servers by page.",
					readOnly: true,
					required: ["zone"],
					optional: ["page", "label"],
				},
			],
		});
		expect(searchOperations(registry, { area: "instances", query: "not found" })).toEqual({
			operations: [],
			total: 0,
		});
		expect(searchOperations(registry, { area: "dns", offset: 100 })).toMatchObject({
			operations: [],
		});
		expect(searchOperations(registry, { area: "unknown" })).toMatchObject({
			error: expect.stringContaining("Unknown or disabled area"),
			areas: ["dns", "instances", "secret-manager"],
		});
	});
	it("exactly describes up to ten operations or returns a filtered lookup error", () => {
		const described = describeOperations(registry, {
			ops: ["instances_list_servers", "scaleway_dns_get_zone"],
		});
		expect(described).toMatchObject({
			operations: [
				{ op: "instances_list_servers", api: "GET /servers", inputSchema: { type: "object" } },
				{ op: "dns_get_zone" },
			],
		});
		expect(describeOperations(registry, { ops: ["dns"] })).toMatchObject({
			error: expect.any(String),
			suggestions: ["dns_get_zone", "dns_update_zone"],
		});
		const limited = fixtureRegistry(undefined, { toolsets: ["instances"] });
		expect(describeOperations(limited, { ops: ["dns"] })).toMatchObject({ suggestions: [] });
		for (const ops of [[], [""], Array(11).fill("dns_get_zone")])
			expect(() => describeOperations(registry, { ops })).toThrow();
	});
	it("enforces bounds before searching", () => {
		for (const input of [
			{ limit: 0 },
			{ limit: 51 },
			{ offset: -1 },
			{ limit: 1.5 },
			{ offset: Number.POSITIVE_INFINITY },
			{ query: "x".repeat(513) },
			{ area: "" },
		])
			expect(() => searchOperations(registry, input)).toThrow();
	});
});
