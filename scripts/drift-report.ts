import { createHash } from "node:crypto";
/**
 * Drift report — the parity matrix read against the fetched OpenAPI documents.
 *
 * This is the comparison the existing parity gate cannot make:
 * `bun run test:parity` checks `tests/parity-matrix.json` against itself, so
 * nothing in the loop can observe Scaleway move. This script reads each row's
 * `api` string ("<VERB> /path") directly against the fetched schema document
 * for its area (`.forge/scratch/scw-<area>.yml` — the very documents the
 * three-way scan resolved against), and re-hashes every document against the
 * digest recorded next to it in the matrix (`<area>_schema: {url, sha256}` rows).
 *
 * It reports five things and asserts none of them:
 *  - rows that resolve to a published path+verb of their own area's document;
 *  - schema-surface rows: the matrix ships an api whose verb the area's fetched
 *    document does not carry (webhosting is the worked example the proposals
 *    settled — three of its verbs exist in no paths: block). Class: a question —
 *    the route moved, the download predates it, or it lives on a different head
 *    — never a verdict;
 *  - bookkeeping rows whose `api` string is not well-formed "<VERB> /path";
 *  - documents whose sha256 moved since the digest recorded next to them: proof
 *    that Scaleway moved, established with no reference to our own files;
 *  - coverage observations: areas whose rows exist but whose document is not on
 *    disk (not checkable at all), and documents named by no operation row.
 *
 * Exit code is 0 whenever the report could be written, whatever it finds.
 * A gate that asserts outcomes is not an auditor: it becomes an adversary and
 * gets worked around. This is an alarm.
 *
 * Run: bun scripts/drift-report.ts   (writes .forge/reports/drift-report.md)
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/+$/, "");
const MATRIX = join(ROOT, "tests", "parity-matrix.json");
const SCRATCH = join(ROOT, ".forge", "scratch");
const OUT = join(ROOT, ".forge", "reports", "drift-report.md");
const METHODS = new Set(["get", "post", "put", "patch", "delete", "head", "options"]);
const up = (s: string): string =>
	s
		.split("")
		.map((c) => (c >= "a" && c <= "z" ? String.fromCharCode(c.charCodeAt(0) - 32) : c))
		.join("");
const low = (s: string): string =>
	s
		.split("")
		.map((c) => (c >= "A" && c <= "Z" ? String.fromCodePoint(c.codePointAt(0) + 32) : c))
		.join("");
const SCW_YML = /^scw-(.+)\.yml$/;

/** Same structural reader as the scan's openapi-reader: a top-level
 *  `paths:` block, path keys at indent 2, HTTP methods at indent 4.
 *  Deliberately tiny; not a YAML parser and does not pretend to be. */
async function publishedPaths(area: string): Promise<Set<string>> {
	const text = await readFile(join(SCRATCH, `scw-${area}.yml`), "utf8");
	const paths = new Set<string>();
	let inPaths = false;
	let cur: string | null = null;
	for (const raw of text.split("\n")) {
		if (!raw.trim()) continue;
		if (/^paths:(\s+(?:#.*)?)?$/.test(raw)) {
			inPaths = true;
			cur = null;
			continue;
		}
		if (!inPaths) continue;
		// another top-level key ends the block
		if (/^[^\s#]/.test(raw)) break;
		// indent 2: a path key (a quoted key may contain the colon)
		if (raw.startsWith("  ") && !raw.startsWith("   ")) {
			const rest = raw.slice(2);
			if (rest.startsWith('"')) {
				try {
					const v: string = JSON.parse(rest.slice(0, rest.lastIndexOf('"') + 1));
					cur = v;
					continue;
				} catch {
					/* fall through to the plain split */
				}
			}
			cur = rest.split(":")[0];
			continue;
		}
		// indent 4 (or deeper): a method key, only while a path is open
		if (
			cur &&
			raw.startsWith("    ") &&
			/^ {4}(get|post|put|patch|delete|head|options):(?:\s|$)/.test(raw)
		) {
			const verb = raw.trimStart().split(":")[0];
			paths.add(`${up(verb)} ${cur}`);
		}
	}
	return paths;
}

type Row = { area: string; op: string; api: string; tool: string };

const main = async () => {
	const matrix: Record<string, unknown> = JSON.parse(await readFile(MATRIX, "utf8"));
	const rows: Row[] = [];
	const schemaRows: Record<string, { url: string; sha256: string }> = {};
	for (const [area, val] of Object.entries(matrix)) {
		if (area === "meta") continue;
		if (
			typeof val === "object" &&
			val !== null &&
			"url" in (val as Record<string, unknown>) &&
			"sha256" in (val as Record<string, unknown>)
		) {
			schemaRows[area] = val as { url: string; sha256: string };
			continue;
		}
		for (const [op, raw] of Object.entries(val as Record<string, unknown>)) {
			const row = raw as { api?: unknown; tool?: unknown } | null;
			if (row && typeof row.api === "string" && typeof row.tool === "string")
				rows.push({ area, op, api: row.api, tool: row.tool });
		}
	}

	const onDisk = new Set(await readdir(SCRATCH));
	const published: Record<string, Set<string> | null> = {};
	for (const area of Object.keys(matrix)) {
		if (area === "meta" || area.endsWith("_schema")) continue;
		published[area] = onDisk.has(`scw-${area}.yml`) ? await publishedPaths(area) : null;
	}

	const bookkeeping: Array<Row & { why: string }> = [];
	const schemaSurface: Row[] = [];
	let resolvable = 0;
	let resolving = 0;
	for (const r of rows) {
		const m = /^([A-Z]+) (\S.*)$/.exec(r.api);
		if (!m) {
			bookkeeping.push({ ...r, why: 'api is not "VERB /path"' });
			continue;
		}
		const verb = low(m[1]);
		if (!METHODS.has(verb)) {
			bookkeeping.push({ ...r, why: `unknown verb "${m[1]}"` });
			continue;
		}
		const doc = published[r.area];
		if (doc === null || doc === undefined) continue; // the held class, counted later
		resolvable += 1;
		if (doc.has(`${up(verb)} ${m[2]}`)) {
			resolving += 1;
			continue;
		}
		schemaSurface.push(r);
	}

	const moved: Array<{ file: string; recorded: string; current: string }> = [];
	let unchanged = 0;
	const notRefetched: string[] = [];
	const unusedFiles: string[] = [];
	for (const [areaName, meta] of Object.entries(schemaRows)) {
		const file = `scw-${areaName.replace(/_schema$/, "")}.yml`;
		const name = onDisk.has(file) ? file : null;
		if (name === null) {
			notRefetched.push(meta.url);
			continue;
		}
		const now = createHash("sha256")
			.update(await readFile(join(SCRATCH, name)))
			.digest("hex");
		if (now !== meta.sha256) moved.push({ file: name, recorded: meta.sha256, current: now });
		else unchanged += 1;
		const areas = new Set(rows.map((r) => r.area));
		if (!areas.has(name.slice(4, -4))) unusedFiles.push(name);
	}

	const areasNoDoc = Object.keys(published)
		.filter((a) => published[a] === null)
		.filter((a) => matrix[a] && Object.keys(matrix[a] as object).length > 0);
	const heldRows = rows.filter(
		(r) => published[r.area] === undefined || published[r.area] === null,
	).length;

	const stamp = new Date().toISOString();
	const L: string[] = [];
	L.push("# Drift report — the parity matrix read against the fetched documents");
	L.push("");
	L.push(`generated ${stamp} by \`scripts/drift-report.ts\` — a listing, never a gate.`);
	L.push("");
	L.push("## The measure");
	L.push("");
	L.push("| | |");
	L.push("|---|---|");
	L.push(`| matrix operation rows | ${rows.length} |`);
	L.push(`| rows resolvable against a fetched document | ${resolvable} |`);
	L.push(`| — of those, resolving to a published path+verb of their own area | ${resolving} |`);
	L.push(`| schema documents recorded next to matrix rows | ${Object.keys(schemaRows).length} |`);
	L.push(`| documents whose sha256 moved since the recorded digest | ${moved.length} |`);
	L.push("");
	L.push("## What it found");
	L.push("");
	L.push(
		`- **rows the fetched document does not carry (class: schema-surface): ${schemaSurface.length}.**`,
	);
	L.push(
		`  The matrix's own ` +
			"`api` string ships a verb the area's document does not publish. Three readings stand, and this report cannot tell them: the route moved out of the published set, the download predates it, or it lives on a different head. The proposals",
	);
	L.push(
		`  settled webhosting's group as the worked example. Each one is a question for a live hand check, not a code edit.`,
	);
	for (const r of schemaSurface)
		L.push(`  - \`${r.area}\` ${r.op} \`${r.tool}\` — matrix: \`${r.api}\``);
	L.push(`- **rows that are not well-formed bookkeeping: ${bookkeeping.length}.**`);
	for (const r of bookkeeping.slice(0, 12))
		L.push(`  - \`${r.area}\` ${r.op} — \`${r.api}\` (${r.why})`);
	if (bookkeeping.length > 12) L.push(`  - … ${bookkeeping.length - 12} more`);
	L.push(
		`- **areas with rows but no document on disk: ${areasNoDoc.length}.** Their ${heldRows} rows are not checkable against a document at all — a hold item for the next fetch, not a finding (${areasNoDoc.join(", ") || "none"}).`,
	);
	L.push(
		`- **provenance: ${unchanged} of ${Object.keys(schemaRows).length} recorded digests unchanged; ${moved.length} moved.** A move proves Scaleway moved without any reference to our own files; the record's citation is due the new digest then.`,
	);
	for (const m of moved)
		L.push(
			`  - \`${m.file}\` recorded ${m.recorded.slice(0, 12)}…, now ${m.current.slice(0, 12)}…`,
		);
	if (notRefetched.length)
		L.push(`  - not on disk, no comparison made: ${notRefetched.length} recorded URL(s)`);
	if (unusedFiles.length)
		L.push(
			`- **fetched documents named by no operation row: ${unusedFiles.length}** (${unusedFiles.join(", ")}) — coverage observation only; a record-coverage gap belongs to the record, not to the matrix.`,
		);
	L.push("");
	L.push("## Why this cannot be a gate");
	L.push("");
	L.push("The parity gate passes a self-comparison and certifies drift as correct.");
	L.push("This reads the matrix against an external fetched document, so it can see");
	L.push("Scaleway move with zero reference to our own files. But every class above");
	L.push("has at least one benign reading, so the script exits 0 whenever the report");
	L.push("could be written. The day a row here deserves a red build, the operator");
	L.push("rules it so — by hand, where it stays.");
	L.push("");
	await writeFile(OUT, `${L.join("\n")}\n`);
	console.log(
		`drift report: ${OUT} — ${resolving}/${resolvable} of ${rows.length} rows resolve, ` +
			`${schemaSurface.length} schema-surface, ${moved.length} digests moved; exit 0 (an alarm)`,
	);
};
await main();
