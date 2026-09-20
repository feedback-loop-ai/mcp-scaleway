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
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import generatedMetadata from "../../src/gateway/operations.json";
import { createServer } from "../../src/server.js";
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
const matrixEntries = Object.entries(matrix)
	.filter(([area]) => area !== "meta")
	.flatMap(([area, ops]) => Object.entries(ops).map(([op, entry]) => ({ area, op, entry })));

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

describe("gateway traceability", () => {
	it("maps optional routing to its contract and checks the enabled surface", async () => {
		const meta = JSON.parse(
			readFileSync(resolve(repoRoot, "tests/parity-matrix.json"), "utf8"),
		).meta;
		const optional = meta.optional_gateway_tools as Array<{ tool: string; contract_test: string }>;
		expect(optional.map((entry) => entry.tool)).toEqual(["scaleway_route"]);
		for (const entry of optional)
			expect(existsSync(resolve(repoRoot, entry.contract_test))).toBe(true);
		const server = createServer({
			router: {
				provider: {
					async choose() {
						throw new Error("Discovery must not invoke inference");
					},
				},
			},
		});
		const client = new Client({ name: "optional-parity", version: "1" });
		const [ct, st] = InMemoryTransport.createLinkedPair();
		try {
			await Promise.all([client.connect(ct), server.connect(st)]);
			expect((await client.listTools()).tools.map((tool) => tool.name).sort()).toEqual(
				[...meta.gateway_tools, ...optional].map((entry: { tool: string }) => entry.tool).sort(),
			);
		} finally {
			await client.close();
			await server.close();
		}
	});
	it("keeps all underlying operations in generated runtime metadata", () => {
		expect(generatedMetadata.map((entry) => entry.tool).sort()).toEqual([...registered].sort());
	});
	it("maps every gateway tool to its contract test", async () => {
		const meta = JSON.parse(readFileSync(resolve(repoRoot, "tests/parity-matrix.json"), "utf8"))
			.meta.gateway_tools as Array<{ tool: string; contract_test: string }>;
		expect(meta).toHaveLength(4);
		for (const entry of meta) expect(existsSync(resolve(repoRoot, entry.contract_test))).toBe(true);
		const server = createServer();
		const client = new Client({ name: "parity", version: "1" });
		const [ct, st] = InMemoryTransport.createLinkedPair();
		try {
			await Promise.all([client.connect(ct), server.connect(st)]);
			expect((await client.listTools()).tools.map((t) => t.name).sort()).toEqual(
				meta.map((t) => t.tool).sort(),
			);
		} finally {
			await client.close();
			await server.close();
		}
	});
});

describe("authoritative operation contract evidence", () => {
	const catalog = JSON.parse(
		readFileSync(resolve(repoRoot, "src/shared/response-contracts.json"), "utf8"),
	);
	const evidence = JSON.parse(
		readFileSync(resolve(repoRoot, "tests/contract-evidence.json"), "utf8"),
	);
	const unavailable = JSON.parse(
		readFileSync(resolve(repoRoot, "src/shared/unavailable-operations.json"), "utf8"),
	);
	it("accounts for every ID without counting unavailable capabilities as validated", () => {
		expect(Object.keys(catalog.routes).sort()).toEqual([...registered].sort());
		expect(Object.keys(evidence).sort()).toEqual([...registered].sort());
		for (const tool of registered) {
			const row = evidence[tool];
			expect(row.test).toBe("tests/contract/transport/catalog-evidence.contract.test.ts");
			expect(existsSync(resolve(repoRoot, row.test))).toBe(true);
			if (tool in unavailable) {
				expect(row.status).toBe("unavailable");
				expect(row.dimensions).toEqual([]);
				expect(catalog.routes[tool]).toEqual([]);
				expect(unavailable[tool].reason.length).toBeGreaterThan(0);
				expect(unavailable[tool].sources.length).toBeGreaterThan(0);
			} else {
				expect(row.status).toBe("supported");
				expect(row.dimensions).toEqual(["request", "response", "pagination", "auth", "errors"]);
				expect(row.sources.length, tool).toBeGreaterThan(0);
				expect(row.sources).toEqual(
					catalog.routes[tool].map(
						(route: { area: string; method: string; sourcePath: string }) => ({
							document: route.area,
							method: route.method,
							path: route.sourcePath,
						}),
					),
				);
			}
		}
		expect(Object.keys(unavailable).every((tool) => registered.includes(tool))).toBe(true);
	});
	it("resolves every supported method/path against independently recorded upstream sources", () => {
		for (const [tool, routes] of Object.entries(catalog.routes)) {
			for (const route of routes as Array<{ area: string; sourcePath: string; method: string }>) {
				const source = catalog.sources[route.area];
				expect(source.url, tool).toMatch(
					/^https:\/\/(www\.scaleway\.com|raw\.githubusercontent\.com\/scaleway\/|unpkg\.com\/@scaleway\/)/,
				);
				expect(source.sha256, tool).toMatch(/^[a-f0-9]{64}$/);
				if (route.area === "s3") {
					expect(source.kind).toBe("s3-protocol");
					expect(Object.keys(catalog.documents.s3.protocolReferences)).toHaveLength(14);
				} else {
					const upstream =
						catalog.documents[route.area].paths[route.sourcePath][route.method.toLowerCase()];
					expect(upstream, tool).toBeDefined();
					expect(
						Object.keys(upstream.responses).some((status) => status.startsWith("2")),
						tool,
					).toBe(true);
				}
			}
		}
	});
});
