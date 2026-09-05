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
