import { describe, expect, it } from "vitest";
import { Milliseconds, normalizeLbTimeouts } from "../../../src/shared/milliseconds.js";

describe("Load Balancer duration wire units", () => {
	it("converts explicit legacy ms/s strings and preserves numeric milliseconds", () => {
		const input = {
			timeout_client: "3000ms",
			timeout_server: "1.5s",
			timeout_connect: 0,
			health_check: { port: 80, check_delay: "3s", check_timeout: 1000 },
			untouched: "example",
		};
		expect(normalizeLbTimeouts(input)).toEqual({
			timeout_client: 3000,
			timeout_server: 1500,
			timeout_connect: 0,
			health_check: { port: 80, check_delay: 3000, check_timeout: 1000 },
			untouched: "example",
		});
		expect(input.timeout_client).toBe("3000ms");
		expect(normalizeLbTimeouts({ timeout_server: undefined })).toEqual({
			timeout_server: undefined,
		});
	});
	it.each(["nonsense", "1000", "1h", "-1ms", -1, Number.POSITIVE_INFINITY, null, true])(
		"rejects malformed duration %j",
		(value) => {
			expect(Milliseconds.safeParse(value).success).toBe(false);
			expect(() => normalizeLbTimeouts({ timeout_server: value })).toThrow();
		},
	);
	it("rejects malformed nested health configuration", () => {
		expect(() => normalizeLbTimeouts({ health_check: "invalid" })).toThrow();
	});
});
