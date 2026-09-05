import { describe, expect, it } from "vitest";
import operations from "../../../src/gateway/operations.json";
import {
	TOOLSET_PRESETS,
	ToolsetConfigSchema,
	createToolFilter,
	operationId,
	resolveToolFilters,
} from "../../../src/shared/toolsets.js";
import { fixtureMetadata } from "../gateway/fixtures.js";

describe("tool filters", () => {
	it("validates explicit environment without mutating it", () => {
		const env = Object.freeze({
			SCW_TOOLSETS: "core, dns",
			SCW_TOOLS: "dns_get_zone",
			SCW_EXCLUDE_TOOLS: "*_delete_*",
			SCW_READ_ONLY: "1",
			OTHER: "untouched",
		});
		expect(resolveToolFilters(env)).toEqual({
			toolsets: ["core", "dns"],
			tools: ["dns_get_zone"],
			excludeTools: ["*_delete_*"],
			readOnly: true,
		});
		expect(env.SCW_TOOLSETS).toBe("core, dns");
		expect(resolveToolFilters({})).toEqual({ readOnly: false });
		for (const value of ["true", "1", "false", "0"])
			expect(resolveToolFilters({ SCW_READ_ONLY: value }).readOnly).toBe(
				["true", "1"].includes(value),
			);
	});
	it.each(["SCW_TOOLSETS", "SCW_TOOLS", "SCW_EXCLUDE_TOOLS"])(
		"fails closed for invalid %s lists",
		(key) => {
			for (const value of ["", " ", ",", "core,", ",dns", "dns,,iam"])
				expect(() => resolveToolFilters({ [key]: value })).toThrow();
		},
	);
	it("rejects invalid booleans, unknown config fields, empty explicit lists and unknown entries", () => {
		expect(() => resolveToolFilters({ SCW_READ_ONLY: "yes" })).toThrow();
		for (const config of [
			{ tools: [] },
			{ toolsets: [] },
			{ excludeTools: [] },
			{ readOnly: "true" },
			{ extra: true },
		])
			expect(() => ToolsetConfigSchema.parse(config)).toThrow();
		expect(() => createToolFilter({ toolsets: ["typo"] }, fixtureMetadata)).toThrow(
			"Unknown toolset",
		);
		expect(() => createToolFilter({ toolsets: ["__proto__"] }, fixtureMetadata)).toThrow(
			"Unknown toolset",
		);
		expect(() => createToolFilter({ tools: ["missing"] }, fixtureMetadata)).toThrow(
			"Unknown SCW_TOOLS",
		);
		expect(() => createToolFilter({ excludeTools: ["missing*"] }, fixtureMetadata)).toThrow(
			"Unknown SCW_EXCLUDE_TOOLS",
		);
		expect(() => createToolFilter({ excludeTools: ["dns.get_zone"] }, fixtureMetadata)).toThrow(
			"no supported operations match",
		);
		expect(() => createToolFilter({ excludeTools: ["*"] }, fixtureMetadata)).toThrow(
			"select no operations",
		);
		expect(() =>
			createToolFilter({ toolsets: ["secret-manager"], readOnly: true }, fixtureMetadata),
		).toThrow("select no operations");
	});
	it("supports all and documents exact core/family membership", () => {
		expect(TOOLSET_PRESETS.core).toEqual([
			"instances",
			"elastic-metal",
			"apple-silicon",
			"k8s",
			"registry",
			"functions",
			"containers",
			"jobs",
			"block-storage",
			"object-storage",
			"vpc",
			"dns",
			"iam",
			"marketplace",
		]);
		for (const [preset, areas] of Object.entries(TOOLSET_PRESETS)) {
			const allow = createToolFilter({ toolsets: [preset] }, operations);
			expect(operations.filter((op) => allow(op.tool))).toEqual(
				operations.filter((op) => areas.includes(op.area)),
			);
			expect(Object.isFrozen(areas)).toBe(true);
		}
		const allow = createToolFilter({}, fixtureMetadata);
		expect(fixtureMetadata.every((op) => allow(op.tool))).toBe(true);
	});
	it("applies additive IDs then excludes and read-only with immutable membership", () => {
		const config = {
			toolsets: ["instances"] as [string],
			tools: ["dns_get_zone", "scaleway_dns_update_zone"] as [string, string],
			excludeTools: ["instances_create_*"] as [string],
			readOnly: true,
		};
		const allow = createToolFilter(config, fixtureMetadata);
		config.toolsets[0] = "all";
		config.readOnly = false;
		expect(fixtureMetadata.filter((r) => allow(r.tool)).map((r) => r.tool)).toEqual([
			"scaleway_instances_list_servers",
			"scaleway_dns_get_zone",
		]);
		expect(
			createToolFilter(
				{ excludeTools: ["scaleway_dns_*"] },
				fixtureMetadata,
			)("scaleway_dns_get_zone"),
		).toBe(false);
		expect(
			createToolFilter(
				{ tools: ["dns_get_zone"] },
				fixtureMetadata,
			)("scaleway_instances_create_server"),
		).toBe(true);
		expect(operationId("scaleway_dns_get_zone")).toBe("dns_get_zone");
		expect(operationId("dns_get_zone")).toBe("dns_get_zone");
	});
});
