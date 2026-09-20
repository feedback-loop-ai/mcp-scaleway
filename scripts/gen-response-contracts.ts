import { execFileSync } from "node:child_process";
/** Generate wire contracts from independently fetched public schemas, retaining provenance. */
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { type SchemaObject, semanticSchema } from "./schema-diff.js";

const root = resolve(import.meta.dir, "..");
const evidenceDirectory = resolve(root, ".forge/reports/remaining-remediation");
type Source = { id: string; url: string; sha256: string; fetchedAt: string; kind?: string };
type Route = {
	method: string;
	path: string;
	host: string;
	query?: string;
	area: string;
	sourcePath: string;
};
const canonical = (path: string) => path.replace(/\{[^}]+\}/g, "{}");
// The committed snapshot is the offline regeneration input. --refresh fetches its public
// source URLs and records new digests; reviewed SDK/protocol projections live separately.
const previous = JSON.parse(
	await readFile(resolve(root, "src/shared/response-contracts.json"), "utf8"),
);
const sources: Record<string, Omit<Source, "id">> = Object.fromEntries(
	Object.entries(previous.sources as Record<string, Omit<Source, "id">>).filter(
		([, source]) => source.kind === "official-openapi",
	),
);
const documents: Record<string, SchemaObject> = Object.fromEntries(
	Object.keys(sources).map((id) => [id, previous.documents[id]]),
);
if (process.argv.includes("--refresh")) {
	for (const [id, source] of Object.entries(sources)) {
		if (source.kind !== "official-openapi") continue;
		const response = await fetch(source.url, {
			redirect: "error",
			signal: AbortSignal.timeout(30_000),
		});
		if (!response.ok) throw new Error(`Public schema fetch failed: ${id} (${response.status})`);
		const raw = await response.text();
		documents[id] = semanticSchema(raw);
		sources[id] = {
			...source,
			sha256: createHash("sha256").update(raw).digest("hex"),
			fetchedAt: new Date().toISOString(),
		};
	}
}
for (const file of (await readdir(resolve(root, "scripts/contract-overrides"))).sort()) {
	if (!file.endsWith(".json")) continue;
	const override = JSON.parse(
		await readFile(resolve(root, "scripts/contract-overrides", file), "utf8"),
	);
	const { id, ...source } = override.source;
	if (
		(source.baseSource ||
			source.kind === "official-js-sdk-augmented-openapi" ||
			source.kind === "documented-compatibility-overlay") &&
		(!source.baseSource || !/^[a-f0-9]{64}$/.test(source.baseSha256 ?? ""))
	)
		throw new Error(`Supplemental contract lacks a pinned base receipt: ${id}`);
	if (source.baseSha256 && sources[source.baseSource]?.sha256 !== source.baseSha256)
		throw new Error(
			`Supplemental contract base changed: ${id}; review the overlay before regeneration`,
		);
	sources[id] = source;
	documents[id] = override.document;
}

const unavailable = JSON.parse(
	await readFile(resolve(root, "src/shared/unavailable-operations.json"), "utf8"),
);
const matrix = JSON.parse(await readFile(resolve(root, "tests/parity-matrix.json"), "utf8"));
const routes: Record<string, Route[]> = {};
const unresolved: Array<{ tool: string; api: string; reason: string }> = [];
for (const [area, operations] of Object.entries(matrix)) {
	if (area === "meta") continue;
	for (const operation of Object.values(
		operations as Record<string, { tool: string; api: string }>,
	)) {
		routes[operation.tool] = [];
		for (const api of operation.api.replace(/\s+\([^)]*\)/g, "").split(/\s+\+\s+/)) {
			const parsed =
				/^(GET|HEAD|POST|PUT|PATCH|DELETE) (?:https:\/\/([^/]+))?(\/[^?]*)(?:\?(.*))?$/.exec(api);
			if (!parsed) throw new Error(`Unparseable route: ${operation.tool}`);
			const [, method, authority, path, query] = parsed;
			const host =
				authority ?? (area === "object-storage" ? "s3.{region}.scw.cloud" : "api.scaleway.com");
			const candidates = Object.keys(documents).sort(
				(a, b) =>
					Number(b === `${area}-compat`) - Number(a === `${area}-compat`) ||
					Number(b === `${area}-sdk`) - Number(a === `${area}-sdk`) ||
					Number(b === area) - Number(a === area) ||
					a.localeCompare(b),
			);
			let matched = false;
			if (area === "object-storage") {
				routes[operation.tool].push({
					method,
					path,
					host,
					...(query !== undefined ? { query } : {}),
					area: "s3",
					sourcePath: path,
				});
				continue;
			}
			for (const document of candidates) {
				// The inference host is a distinct protocol surface from api.scaleway.com.
				if ((host === "api.scaleway.ai") !== document.startsWith("generative-apis")) continue;
				if (area === "object-storage") continue;
				const sourcePath = Object.keys(documents[document].paths as SchemaObject).find(
					(candidate) => {
						const methods = (documents[document].paths as SchemaObject)[candidate] as SchemaObject;
						return (
							canonical(candidate) === canonical(path) &&
							methods[method.toLowerCase()] !== undefined
						);
					},
				);
				if (!sourcePath) continue;
				routes[operation.tool].push({
					method,
					path,
					host,
					...(query !== undefined ? { query } : {}),
					area: document,
					sourcePath,
				});
				matched = true;
				break;
			}
			if (!matched)
				unresolved.push({
					tool: operation.tool,
					api,
					reason:
						area === "object-storage"
							? "S3 protocol adapter"
							: "No matching authoritative contract yet",
				});
		}
	}
}
const unexpected = unresolved.filter((row) => !(row.tool in unavailable));
if (unexpected.length)
	throw new Error(
		`Missing authoritative contracts: ${unexpected.map((row) => row.tool).join(", ")}`,
	);
for (const tool of Object.keys(unavailable)) {
	if (!(tool in routes) || routes[tool].length !== 0)
		throw new Error(`Stale unavailable operation: ${tool}`);
}
const contractEvidence = Object.fromEntries(
	Object.entries(routes).map(([tool, legs]) => [
		tool,
		{
			status: tool in unavailable ? "unavailable" : "supported",
			sources: legs.map((leg) => ({
				document: leg.area,
				method: leg.method,
				path: leg.sourcePath,
			})),
			dimensions:
				tool in unavailable ? [] : ["request", "response", "pagination", "auth", "errors"],
			test: "tests/contract/transport/catalog-evidence.contract.test.ts",
		},
	]),
);
await writeFile(
	resolve(root, "tests/contract-evidence.json"),
	`${JSON.stringify(contractEvidence, null, "\t")}\n`,
);
await mkdir(resolve(root, "src/shared"), { recursive: true });
await writeFile(
	resolve(root, "src/shared/response-contracts.json"),
	`${JSON.stringify({ version: 1, sources, documents, routes }, null, "\t")}\n`,
);
await mkdir(evidenceDirectory, { recursive: true });
await writeFile(
	resolve(evidenceDirectory, "unresolved-contracts.json"),
	`${JSON.stringify(unresolved, null, 2)}\n`,
);
console.log(
	JSON.stringify(
		{
			sources: Object.keys(sources).length,
			operations: Object.keys(routes).length,
			matchedLegs: Object.values(routes).reduce((sum, rows) => sum + rows.length, 0),
			unresolved,
		},
		null,
		2,
	),
);

execFileSync(
	"bun",
	[
		"x",
		"biome",
		"format",
		"--write",
		resolve(root, "src/shared/response-contracts.json"),
		resolve(root, "tests/contract-evidence.json"),
	],
	{ stdio: "pipe" },
);
