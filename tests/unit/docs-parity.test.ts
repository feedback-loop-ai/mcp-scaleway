/**
 * Documentation parity (feature 060 SC-006 / FR-015): the parity matrix, the generated
 * runtime metadata, README's operation reference and the user-facing counts must agree.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import metadata from "../../src/gateway/operations.json";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const matrix = JSON.parse(readFileSync(resolve(root, "tests/parity-matrix.json"), "utf8"));
const readme = readFileSync(resolve(root, "README.md"), "utf8");
const claude = readFileSync(resolve(root, "CLAUDE.md"), "utf8");

const matrixTools = new Set<string>();
for (const [area, ops] of Object.entries<Record<string, { tool: string }>>(matrix)) {
	if (area === "meta") continue;
	for (const entry of Object.values(ops)) matrixTools.add(entry.tool);
}
const gatewayTools = new Set(
	(matrix.meta.gateway_tools as Array<{ tool: string }>).map((t) => t.tool),
);
const documented = new Set(
	readme.match(/`(scaleway_[a-z0-9_]+)`/g)?.map((m) => m.slice(1, -1)) ?? [],
);

describe("documentation parity", () => {
	it("README documents every operation in the parity matrix", () => {
		const missing = [...matrixTools].filter((t) => !documented.has(t));
		expect(missing, `operations missing from README: ${missing.join(", ")}`).toEqual([]);
	});
	it("README documents no operation that is not in the matrix (except the gateway tools)", () => {
		const stale = [...documented].filter((t) => !matrixTools.has(t) && !gatewayTools.has(t));
		expect(stale, `stale README entries: ${stale.join(", ")}`).toEqual([]);
	});
	it("generated runtime metadata matches the matrix exactly", () => {
		expect(metadata.map((m) => m.tool).sort()).toEqual([...matrixTools].sort());
	});
	it("user-facing operation counts match the matrix", () => {
		const n = String(matrixTools.size);
		expect(readme).toContain(`${n} operations`);
		expect(claude).toContain(`${n} supported operations`);
	});
});
