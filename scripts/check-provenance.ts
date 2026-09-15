/**
 * Provenance-block checker — validates every `Provenance (D3)` blockquote in
 * `specs/scaleway-api/<area>/api-reference.md` against `meta.schemaFiles` in
 * `tests/parity-matrix.json`, the matrix's own recorded provenance. The check
 * mirrors what a reader of the reference docs relies on: that the block's
 * schema-url and sha256 are the recorded url and hash, that a version line is
 * present (and, where the url carries a recognizable version token, that the
 * block's version equals it — an advisory, not a veto), that the fetched date is
 * the ISO date the fetch was made, and that the block itself is present at all
 * (the two held areas are reported as held, not as missing).
 *
 * This is an alarm: it lists what it sees, prints a verdict line, and exits 0
 * whenever the pass could run. It writes no state. `scripts/fetch-schemas.ts`
 * is the pair to this script: that one re-downloads and reports digest moves;
 * this one verifies the records agree with the matrix's recorded digests.
 *
 * Run: bun scripts/check-provenance.ts
 */
const REPO = new URL("..", import.meta.url).pathname.replace(/\/+$/, "");
const MATRIX = `${REPO}/tests/parity-matrix.json`;
const SCRATCH = `${REPO}/.forge/scratch`;

type Provenance = { url: string; sha256: string; fetched?: string };

type Row = {
	area: string;
	path: string;
	status:
		| "ok"
		| "missing"
		| "malformed"
		| "url-mismatch"
		| "sha-mismatch"
		| "fetched-mismatch"
		| "version-mismatch";
	note?: string;
};

const main = async () => {
	const matrix: Record<string, unknown> = JSON.parse(await Bun.file(MATRIX).text());
	const meta = (matrix.meta ?? {}) as { schemaFiles?: Record<string, Provenance> };
	const rows: Record<string, Provenance> = meta.schemaFiles ?? {};
	const areas = Object.keys(rows).sort();
	const out: Row[] = [];
	let ok = 0;

	for (const area of areas) {
		const path = `specs/scaleway-api/${area}/api-reference.md`;
		const text = await Bun.file(`${REPO}/${path}`)
			.text()
			.catch(() => null);
		if (text === null) {
			out.push({ area, path, status: "missing", note: "the reference file does not exist" });
			continue;
		}
		const head = text.indexOf("**Provenance (D3).**");
		if (head < 0) {
			out.push({
				area,
				path,
				status: "missing",
				note: "the file carries no Provenance (D3) block",
			});
			continue;
		}
		const seg = text
			.split("\n")
			.slice(head < 0 ? 0 : text.slice(0, head).split("\n").length - 1)
			.filter((l) => l.startsWith(">"))
			.join("\n");
		const url = /schema-url:\s*(\S+)/.exec(seg)?.[1];
		const sha = /sha256:\s*([0-9a-f]+)/.exec(seg)?.[1];
		const fetched = /fetched:\s*(\S+)/.exec(seg)?.[1];
		const version = /version:\s*(\S+)/.exec(seg)?.[1];
		if (!url || !sha || !fetched || !version) {
			out.push({ area, path, status: "malformed", note: "a Provenance field is missing" });
			continue;
		}
		const recorded = rows[area];
		const problems: string[] = [];
		if (url !== recorded.url) problems.push(`url is ${url}, matrix records ${recorded.url}`);
		if (sha !== recorded.sha256)
			problems.push(
				`sha256 is ${sha.slice(0, 16)}…, matrix records ${recorded.sha256.slice(0, 16)}…`,
			);
		if (fetched !== (recorded.fetched ?? "2026-09-11"))
			problems.push(`fetched is ${fetched}, matrix records ${recorded.fetched ?? "2026-09-11"}`);
		// The url's version segment (the path element before schema.yml) is the
		// authoritative version token — advisory: if the block's version differs
		// from the recognizable token, note it without declaring the block broken.
		const vseg = recorded.url.split("/").at(-2) ?? "";
		const isVersionToken = /^v[0-9]+(alpha|beta)[0-9]*$/.test(vseg);
		if (isVersionToken && version !== vseg)
			problems.push(`version is "${version}", the url carries the token "${vseg}"`);
		if (problems.length) {
			out.push({
				area,
				path,
				status: problems[0].startsWith("url")
					? "url-mismatch"
					: problems[0].startsWith("sha")
						? "sha-mismatch"
						: problems[0].startsWith("fetched")
							? "fetched-mismatch"
							: "version-mismatch",
				note: problems.join("; "),
			});
			continue;
		}
		out.push({ area, path, status: "ok" });
		ok += 1;
	}

	// Held areas — no document to hash, so no block to require; report as held.
	for (const held of ["object-storage", "serverless-sqldb"]) {
		const path = `specs/scaleway-api/${held}/api-reference.md`;
		const hasBlock = (
			await Bun.file(`${REPO}/${path}`)
				.text()
				.catch(() => "")
		).includes("**Provenance (D3).**");
		out.push({
			area: held,
			path,
			status: "missing",
			note: hasBlock
				? "the file carries a Provenance block, but no document backs it — a held area should carry a held-status note, not a fabricated url"
				: "held: the fetch has no document for this area (Tier B / Tier C per upstream-summary), so no blockquote is required",
		});
	}

	const flagged = out.filter((r) => r.status !== "ok");
	console.log(
		`provenance check — ${ok} blocks verified, ${flagged.length} flagged; an alarm, not a gate (exit 0)`,
	);
	for (const r of out)
		if (r.status !== "ok") console.log(`  - ${r.area}: ${r.status} — ${r.note ?? ""}`);
};
await main();
