/**
 * Schema re-fetch pass — re-download every cited schema.yml, re-hash, and list
 * which digests moved since the fetch this repository was verified against.
 *
 * This is the second-cycle instrument of the provenance ruling (D3): the matrix's
 * `meta.schemaFiles` rows record the exact upstream bytes each reference doc and
 * contract suite were verified against, and a later run that hashes a different
 * document proves Scaleway moved — with zero reference to our own files anywhere
 * in the comparison. This script writes **no state**: it fetches, hashes, reports,
 * and exits. When it lists a move, the follow-up is a decision for the operator
 * (re-verify the affected record and contracts, refresh the fetched copies, and
 * date the record's provenance block), never an automatic rewrite — the fetched
 * bytes belong to the record's claim, and a tool that rewrites the evidence of
 * its own check is the thing this project's whole method forbids.
 *
 * Run: bun scripts/fetch-schemas.ts   (network; report to stdout)
 * Exit 0 when the pass could run, whatever it finds — an alarm, like test:drift.
 */
const MATRIX = new URL("../tests/parity-matrix.json", import.meta.url).pathname;

const main = async () => {
	const matrix: Record<string, unknown> = JSON.parse(await Bun.file(MATRIX).text());
	const meta = (matrix.meta ?? {}) as {
		schemaFiles?: Record<string, { url: string; sha256: string }>;
	};
	const rows = meta.schemaFiles ?? {};
	const areas = Object.keys(rows).sort();
	const lines: string[] = [];
	const moved: string[] = [];
	const httpFailures: string[] = [];
	let unchanged = 0;

	for (const area of areas) {
		const { url, sha256 } = rows[area];
		let status = 0;
		let body: ArrayBuffer | null = null;
		try {
			const res = await fetch(url, { headers: { "User-Agent": "mcp-scaleway-provenance" } });
			status = res.status;
			if (res.ok) body = await res.arrayBuffer();
		} catch (e) {
			httpFailures.push(
				`\`${area}\` — the fetch itself did not complete (${(e as Error).name}); no comparison is made for this row`,
			);
			continue;
		}
		if (!res.ok || body === null) {
			httpFailures.push(
				`\`${area}\` — upstream answered ${status}; no comparison is made for this row`,
			);
			continue;
		}
		const now = new Bun.CryptoHasher("sha256").update(new Uint8Array(body)).digest("hex");
		if (now !== sha256) {
			moved.push(
				`\`${area}\` — the document hashes differently now: was ${sha256.slice(0, 16)}…, now ${now.slice(0, 16)}…`,
			);
			lines.push(moved.at(-1) as string);
			continue;
		}
		unchanged += 1;
	}

	console.log(
		`schema re-fetch pass — ${areas.length} cited URLs: ${unchanged} unchanged, ${moved.length} moved, ${httpFailures.length} not comparable`,
	);
	if (moved.length) {
		console.log("digests that moved:");
		for (const m of moved) console.log(`  - ${m}`);
	}
	if (httpFailures.length) {
		console.log("not comparable (no conclusion):");
		for (const f of httpFailures) console.log(`  - ${f}`);
	}
	if (moved.length)
		console.log(
			"a move is an event for a ruling, not a rewrite: re-verify the affected record and contract tests against the new document, refresh the fetched copies under .forge/scratch/, and date the record's provenance line — by hand, after reading the diff.",
		);
};
await main();
