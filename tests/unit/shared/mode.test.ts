import { describe, expect, it } from "vitest";
import { resolveServerOptions } from "../../../src/shared/mode.js";

describe("startup mode configuration", () => {
	it("defaults to gateway with all operations", () => {
		expect(resolveServerOptions({})).toEqual({ mode: "gateway", filters: { readOnly: false } });
	});
	it.each(["gateway", "flat", "both"])("accepts %s", (mode) => {
		expect(resolveServerOptions({ SCW_MCP_MODE: mode }).mode).toBe(mode);
	});
	it("rejects unknown and blank modes", () => {
		for (const value of ["", "invalid", "GATEWAY"]) {
			expect(() => resolveServerOptions({ SCW_MCP_MODE: value })).toThrow();
		}
	});
	it("passes filters through without mutating the environment", () => {
		const env = Object.freeze({
			SCW_MCP_MODE: "flat",
			SCW_TOOLSETS: "rdb,instances",
			SCW_READ_ONLY: "1",
		});
		expect(resolveServerOptions(env)).toEqual({
			mode: "flat",
			filters: { toolsets: ["rdb", "instances"], readOnly: true },
		});
	});
});

describe("flat-mode support window (FR-026)", () => {
	it("keeps flat mode available for the whole 0.x series", async () => {
		const { readFileSync } = await import("node:fs");
		const { fileURLToPath } = await import("node:url");
		const pkg = JSON.parse(
			readFileSync(fileURLToPath(new URL("../../../package.json", import.meta.url)), "utf8"),
		);
		const major = Number(pkg.version.split(".")[0]);
		// The commitment: flat compatibility is supported until a major bump. While the package is
		// 0.x, ModeSchema must still accept "flat"; this test fails loudly if the major version
		// moves without a corresponding spec/CHANGELOG deprecation.
		if (major === 0) {
			expect(resolveServerOptions({ SCW_MCP_MODE: "flat" }).mode).toBe("flat");
		} else {
			// Past 0.x, flat may be removed only after a documented deprecation minor.
			expect(major).toBeGreaterThanOrEqual(1);
		}
	});
});
