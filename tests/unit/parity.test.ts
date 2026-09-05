/**
 * API parity gate (Constitution v1.1.0, Principle VIII).
 *
 * Validates that tests/parity-matrix.json is a complete, accurate map of
 * every MCP tool this server registers:
 *  - every registered tool has exactly one parity entry
 *  - every parity entry points at a registered tool
 *  - every parity entry references a contract test file that exists
 *  - every parity entry documents a well-formed API operation
 *
 * Run via `bun run test:parity` (vitest filename filter "parity").
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerAllTools } from "../../src/tools/index.js";

interface ParityEntry {
	api: string;
	tool: string;
	contract_test: string;
}

type ParityMatrix = Record<string, Record<string, ParityEntry>>;

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const matrix: ParityMatrix = JSON.parse(
	readFileSync(resolve(repoRoot, "tests/parity-matrix.json"), "utf-8"),
);

function registeredToolNames(): string[] {
	const names: string[] = [];
	const server = {
		tool: (name: string) => {
			names.push(name);
		},
	} as unknown as McpServer;
	registerAllTools(server);
	return names;
}

const registered = registeredToolNames();
const matrixEntries = Object.entries(matrix).flatMap(([area, ops]) =>
	Object.entries(ops).map(([op, entry]) => ({ area, op, entry })),
);

describe("parity matrix completeness", () => {
	it("registers at least one tool", () => {
		expect(registered.length).toBeGreaterThan(0);
	});

	it("has no duplicate registered tool names", () => {
		const dupes = registered.filter((n, i) => registered.indexOf(n) !== i);
		expect(dupes).toEqual([]);
	});

	it("covers every registered tool with exactly one parity entry", () => {
		const matrixTools = matrixEntries.map(({ entry }) => entry.tool);
		const matrixToolSet = new Set(matrixTools);
		const missing = registered.filter((name) => !matrixToolSet.has(name));
		expect(missing, `tools missing from parity matrix: ${missing.join(", ")}`).toEqual([]);
		const dupes = matrixTools.filter((n, i) => matrixTools.indexOf(n) !== i);
		expect(dupes, `tools with duplicate parity entries: ${dupes.join(", ")}`).toEqual([]);
	});

	it("maps every parity entry to a registered tool", () => {
		const registeredSet = new Set(registered);
		const stale = matrixEntries.filter(({ entry }) => !registeredSet.has(entry.tool));
		expect(
			stale.map(({ area, op }) => `${area}.${op}`),
			"parity entries for unregistered tools",
		).toEqual([]);
	});

	it("references an existing contract test file in every entry", () => {
		const missing = matrixEntries.filter(
			({ entry }) => !existsSync(resolve(repoRoot, entry.contract_test)),
		);
		expect(
			missing.map(({ area, op, entry }) => `${area}.${op} -> ${entry.contract_test}`),
			"parity entries pointing at nonexistent contract tests",
		).toEqual([]);
	});

	it("documents a well-formed API operation in every entry", () => {
		const malformed = matrixEntries.filter(
			({ entry }) =>
				!/^(GET|POST|PUT|PATCH|DELETE|HEAD) \S+/.test(entry.api) ||
				typeof entry.tool !== "string" ||
				entry.tool.length === 0,
		);
		expect(malformed.map(({ area, op }) => `${area}.${op}`)).toEqual([]);
	});
});
