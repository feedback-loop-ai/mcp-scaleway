import { describe, expect, it } from "vitest";
import {
	GATEWAY_ERROR_STATUS,
	describeOperations,
	gatewayError,
	lookupError,
	searchOperations,
} from "../../../src/gateway/discovery.js";
import type { OperationRegistry } from "../../../src/gateway/registry.js";
import { createOperationRegistry } from "../../../src/gateway/registry.js";
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
		expect(searchOperations(registry, { area: "unknown" })).toEqual({
			error: {
				type: "not_found",
				message: "Unknown or disabled area. Use an enabled area slug or omit area to list them.",
				statusCode: 404,
			},
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
		expect(describeOperations(registry, { ops: ["dns"] })).toEqual({
			error: {
				type: "not_found",
				message:
					"Unknown or disabled operation. Use scaleway_search to find an allowed ID; filters apply to execution too.",
				statusCode: 404,
			},
			suggestions: ["dns_get_zone", "dns_update_zone"],
		});
		const limited = fixtureRegistry(undefined, { toolsets: ["instances"] });
		expect(describeOperations(limited, { ops: ["dns"] })).toMatchObject({ suggestions: [] });
		for (const ops of [[], [""], Array(11).fill("dns_get_zone")])
			expect(() => describeOperations(registry, { ops })).toThrow();
	});
	it("suggests partial-token overlaps for typos only when exact-token matches are empty", () => {
		const suggestions = (registry: OperationRegistry, requested: string) =>
			lookupError(registry, requested).suggestions;
		// Identifier-token overlap is ranked first, so "server" returns the two instances_*server*
		// ops and not dns_get_zone (which only mentions servers in its description).
		expect(suggestions(registry, "server")).toEqual([
			"instances_create_server",
			"instances_list_servers",
		]);
		// Shared four-character prefix ("servrs" ~ "servers"); ties prefer more exact ID tokens.
		expect(suggestions(registry, "instances_list_servrs")).toEqual([
			"instances_list_servers",
			"instances_create_server",
		]);
		// Query word contains an ID token ("zones" ~ "zone").
		expect(suggestions(registry, "dns_get_zones")).toEqual(["dns_get_zone", "dns_update_zone"]);
		// ID token contains the query word ("instance" ~ "instances").
		expect(suggestions(registry, "instance")).toEqual([
			"instances_create_server",
			"instances_list_servers",
		]);
		// Unrelated typo tokens ("zne") add nothing; remaining exact tokens still rank.
		expect(suggestions(registry, "dns_get_zne")).toEqual(["dns_get_zone", "dns_update_zone"]);
		// Tokens shorter than four characters ("dns", "zon") and unknown words never partial-match.
		for (const requested of ["ab", "dn", "zon", "dnz", "zzzz", "sec-ver", "kubernetes"])
			expect(suggestions(registry, requested)).toEqual([]);
		// At most five suggestions even when many IDs overlap.
		expect(suggestions(registry, "instances dns secret zone server").length).toBeLessThanOrEqual(5);
		// Partial suggestions cover only the allowed registry: disabled operations never leak.
		expect(suggestions(registry, "secrt version")).toEqual([
			"secret_manager_access_secret_version",
		]);
		const filtered = fixtureRegistry(undefined, {
			excludeTools: ["secret_manager_access_secret_version"],
		});
		expect(suggestions(filtered, "secrt version")).toEqual([]);
		expect(suggestions(fixtureRegistry(undefined, { toolsets: ["dns"] }), "instance")).toEqual([]);
	});
	it("classifies gateway errors with the shared error shape", () => {
		expect(gatewayError("invalid_input", "m", {})).toEqual({
			error: { type: "invalid_input", message: "m", statusCode: 400 },
		});
		expect(gatewayError("permission_denied", "m", { op: "x" })).toEqual({
			error: { type: "permission_denied", message: "m", statusCode: 403 },
			op: "x",
		});
		expect(gatewayError("not_found", "m", {}).error.statusCode).toBe(404);
		expect(gatewayError("server_error", "m", {}).error.statusCode).toBe(500);
		expect(GATEWAY_ERROR_STATUS).toEqual({
			invalid_input: 400,
			permission_denied: 403,
			not_found: 404,
			server_error: 500,
		});
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

	it("ranks lookup suggestions by identifier overlap first, so typos surface the intended op", () => {
		// Regression: description-token matches used to outrank the mistyped identifier.
		const real = createOperationRegistry();
		const sug = (q: string) => lookupError(real, q).suggestions as unknown as string[];
		expect(sug("iam_create_rules")[0]).toBe("iam_create_rule");
		expect(sug("dns_list_zone")).toContain("dns_list_zones");
		expect(sug("rdb_list_database")).toContain("rdb_list_databases");
		expect(sug("k8s_list_cluster")).toContain("k8s_list_clusters");
		// A query with no identifier overlap still falls back to description matches.
		expect(sug("totally_unknown_word").length).toBeLessThanOrEqual(5);
	});
});
