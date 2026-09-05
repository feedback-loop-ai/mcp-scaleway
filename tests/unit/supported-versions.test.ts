/**
 * Feature 060 SC-002 automated proxy: no registered operation may target an upstream
 * product/version pair that is not in the maintained live-version allow-list, and none may
 * target a pair recorded as superseded. This test does not prove live availability; the inventory is recorded in
 * specs/scaleway-api/supported-versions.json.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const matrix = JSON.parse(readFileSync(resolve(root, "tests/parity-matrix.json"), "utf8"));
const live = JSON.parse(
	readFileSync(resolve(root, "specs/scaleway-api/supported-versions.json"), "utf8"),
);
const allowed = new Set<string>(live.pairs);
const superseded = new Set<string>(Object.keys(live.superseded));

function pairsOf(api: string): string[] {
	return [...api.matchAll(/\/([a-z0-9-]+)\/(v\d+(?:alpha\d+|beta\d+)?)\//g)].map(
		(m) => `${m[1]}/${m[2]}`,
	);
}

describe("upstream API versions", () => {
	const entries = Object.entries<Record<string, { tool: string; api: string }>>(matrix)
		.filter(([area]) => area !== "meta")
		.flatMap(([, ops]) => Object.values(ops));

	it("every versioned endpoint uses a documented supported product/version pair", () => {
		const offenders = entries.flatMap((e) =>
			pairsOf(e.api)
				.filter((p) => !allowed.has(p))
				.map((p) => `${e.tool} -> ${p}`),
		);
		expect(offenders).toEqual([]);
	});
	it("no endpoint uses a superseded pair", () => {
		const offenders = entries.flatMap((e) =>
			pairsOf(e.api)
				.filter((p) => superseded.has(p))
				.map((p) => `${e.tool} -> ${p}`),
		);
		expect(offenders).toEqual([]);
	});
	it("the allow-list has no stale entries no operation uses", () => {
		const used = new Set(entries.flatMap((e) => pairsOf(e.api)));
		expect([...allowed].filter((p) => !used.has(p))).toEqual([]);
	});
});
