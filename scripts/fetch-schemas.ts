/**
 * Public upstream freshness alarm. Changes exit 0; fetch/checker failures exit 1.
 * Never rewrites parity-matrix provenance or the reviewed semantic baseline.
 * Optional --output <directory> writes review artifacts only.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import {
	type SchemaObject,
	type SemanticDiff,
	diffSchemas,
	semanticSchema,
} from "./schema-diff.js";

const SourceSchema = z.object({
	url: z
		.string()
		.url()
		.refine((value) => {
			const url = new URL(value);
			return (
				url.protocol === "https:" &&
				url.hostname === "www.scaleway.com" &&
				!url.username &&
				!url.password &&
				!url.port &&
				!url.search &&
				!url.hash &&
				/^\/en\/developers\/api\/[a-z0-9/-]+\/schema\.yml$/.test(url.pathname)
			);
		}, "Expected an official public Scaleway schema URL"),
	sha256: z.string().regex(/^[a-f0-9]{64}$/),
});
export const SourcesSchema = z
	.record(z.string().regex(/^[a-z0-9-]+$/), SourceSchema)
	.refine((sources) => Object.keys(sources).length > 0, "No schema sources recorded");
export type Sources = z.infer<typeof SourcesSchema>;
export type Baselines = Record<string, { sha256: string; schema: SchemaObject }>;

export interface SchemaCheck {
	area: string;
	url: string;
	recordedSha256: string;
	currentSha256?: string;
	status: "unchanged" | "changed" | "failed";
	diff?: SemanticDiff;
	note?: string;
	error?: string;
}
export interface FreshnessReport {
	checkedAt: string;
	checks: SchemaCheck[];
	summary: { unchanged: number; changed: number; failed: number };
}

/** Dependency injection keeps transport regressions testable without cloud calls. */
export async function checkSchemas(
	input: Sources,
	baselines: Baselines,
	request: typeof fetch = fetch,
): Promise<FreshnessReport> {
	const sources = SourcesSchema.parse(input);
	const checks: SchemaCheck[] = [];
	const pending = Object.entries(sources).sort(([a], [b]) => a.localeCompare(b));
	async function worker() {
		for (;;) {
			const entry = pending.shift();
			if (!entry) return;
			const [area, { url, sha256 }] = entry;
			const check: SchemaCheck = { area, url, recordedSha256: sha256, status: "failed" };
			try {
				const response = await request(url, {
					headers: { "User-Agent": "mcp-scaleway-provenance" },
					signal: AbortSignal.timeout(30_000),
					redirect: "error",
				});
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				const bytes = new Uint8Array(await response.arrayBuffer());
				const schema = semanticSchema(new TextDecoder().decode(bytes));
				check.currentSha256 = createHash("sha256").update(bytes).digest("hex");
				check.status = check.currentSha256 === sha256 ? "unchanged" : "changed";
				const baseline = baselines[area];
				if (baseline?.sha256 === sha256) {
					check.diff = diffSchemas(baseline.schema, schema);
				} else {
					check.note =
						"No semantic baseline matching the recorded digest; only byte freshness is comparable.";
				}
			} catch (error) {
				check.status = "failed";
				check.error = error instanceof Error ? error.message : "Schema check failed";
			}
			checks.push(check);
		}
	}
	await Promise.all(Array.from({ length: Math.min(4, pending.length) }, () => worker()));
	checks.sort((a, b) => a.area.localeCompare(b.area));
	return {
		checkedAt: new Date().toISOString(),
		checks,
		summary: {
			unchanged: checks.filter((check) => check.status === "unchanged").length,
			changed: checks.filter((check) => check.status === "changed").length,
			failed: checks.filter((check) => check.status === "failed").length,
		},
	};
}

export function renderReport(report: FreshnessReport): string {
	const { unchanged, changed, failed } = report.summary;
	const lines = [
		"# Scaleway schema freshness",
		"",
		`Checked ${report.checkedAt}: ${unchanged} unchanged, ${changed} changed, ${failed} failed.`,
		"",
		"Upstream changes are an alarm for review; they do not update accepted provenance or fail this check. Fetch and checker failures do fail it.",
		"Field changes use JSON pointers and include request/response schemas, refs, required fields, enums and constraints. Prose and examples are omitted. Changes are not automatically classified as breaking.",
	];
	for (const check of report.checks) {
		if (check.status === "unchanged" && !check.note) continue;
		lines.push(
			"",
			`## ${check.area}: ${check.status}`,
			"",
			`[Official schema](${check.url})`,
			`Recorded: \`${check.recordedSha256}\`; current: \`${check.currentSha256 ?? "unavailable"}\`.`,
		);
		if (check.error) lines.push(`Failure: ${check.error}`);
		if (check.note) lines.push(check.note);
		if (check.diff) {
			lines.push(
				`Endpoints: +${check.diff.addedEndpoints.length} / -${check.diff.removedEndpoints.length}; field changes: ${check.diff.changedFields.length}.`,
				"",
			);
			for (const endpoint of check.diff.addedEndpoints) lines.push(`- Added \`${endpoint}\``);
			for (const endpoint of check.diff.removedEndpoints) lines.push(`- Removed \`${endpoint}\``);
			for (const field of check.diff.changedFields.slice(0, 100))
				lines.push(`- Changed \`${field.path}\``);
			if (check.diff.changedFields.length > 100)
				lines.push("- Remaining field changes are in report.json.");
		}
	}
	return `${lines.join("\n")}\n`;
}

export async function main(args = process.argv.slice(2)): Promise<number> {
	if (args.length && (args.length !== 2 || args[0] !== "--output" || !args[1])) {
		throw new Error("Usage: bun run fetch:schemas [--output <artifact-directory>]");
	}
	const matrix = JSON.parse(
		await readFile(new URL("../tests/parity-matrix.json", import.meta.url), "utf8"),
	);
	const sources = SourcesSchema.parse(matrix.meta?.schemaFiles);
	const baselines: Baselines = Object.fromEntries(
		await Promise.all(
			Object.keys(sources).map(async (area) => [
				area,
				JSON.parse(
					await readFile(new URL(`./schema-baselines/${area}.json`, import.meta.url), "utf8"),
				),
			]),
		),
	);
	const report = await checkSchemas(sources, baselines);
	const markdown = renderReport(report);
	if (args[1]) {
		const directory = resolve(args[1]);
		await mkdir(directory, { recursive: true });
		await writeFile(resolve(directory, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
		await writeFile(resolve(directory, "report.md"), markdown);
	}
	console.log(markdown);
	return report.summary.failed ? 1 : 0;
}

if (import.meta.main) {
	try {
		process.exitCode = await main();
	} catch (error) {
		console.error("Schema freshness checker failed:", error);
		process.exitCode = 1;
	}
}
