/** Routing evaluation only: never calls operation callbacks or cloud APIs. */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { z } from "zod";
import { searchOperations } from "../src/gateway/discovery.js";
import { type OperationRegistry, createOperationRegistry } from "../src/gateway/registry.js";
import {
	type RouteResult,
	type RouterOptions,
	RoutingPolicy,
	createIntentRouter,
} from "../src/routing/index.js";
import { DEFAULT_JEV_MODEL, JEV_ENDPOINT } from "../src/routing/jev.js";
import { resolveServerOptions } from "../src/shared/mode.js";
import { ToolsetConfigSchema } from "../src/shared/toolsets.js";
import fixtures from "../tests/fixtures/routing-cases.json";

const CaseSchema = z.object({
	id: z.string(),
	intent: z.string(),
	context: z.string().optional(),
	filters: ToolsetConfigSchema.optional(),
	expectedStatus: z.enum(["matched", "ambiguous", "unsupported", "needs_plan"]),
	expectedOps: z.array(z.string()),
});
export const routingCases = z.array(CaseSchema).parse(fixtures);
export interface EvaluationRow {
	id: string;
	expectedStatus: string;
	expectedOps: string[];
	status: string;
	candidates: string[];
	durationMs: number;
	disallowedCandidates: number;
	providerCalls: number;
	usage?: RouteResult["usage"];
	model?: string;
	intent?: string;
	context?: string;
	filters?: z.infer<typeof ToolsetConfigSchema>;
	confidence?: RouteResult["confidence"];
	candidateDetails?: RouteResult["candidates"];
	reason?: RouteResult["reason"];
	catalogVersion?: string;
	calibration?: RouteResult["calibration"];
	probabilityScope?: RouteResult["probabilityScope"];
	source?: "provider" | "local";
}

/** Preserve routing evidence without copying provider objects or configuration secrets. */
export function routeDiagnostics(
	result: RouteResult,
): Pick<
	EvaluationRow,
	| "confidence"
	| "candidateDetails"
	| "reason"
	| "catalogVersion"
	| "calibration"
	| "probabilityScope"
	| "source"
> {
	return {
		confidence: result.confidence,
		candidateDetails: result.candidates,
		reason: result.reason,
		catalogVersion: result.catalogVersion,
		calibration: result.calibration,
		probabilityScope: result.probabilityScope,
		source:
			"source" in result && (result.source === "provider" || result.source === "local")
				? result.source
				: undefined,
	};
}

export function evaluationConfiguration(options?: RouterOptions, requestedModel?: string) {
	return {
		candidateLimit: 3,
		filters: "per-case fixtures",
		jev: options
			? {
					endpoint: JEV_ENDPOINT,
					requestedModel: requestedModel ?? DEFAULT_JEV_MODEL,
					...RoutingPolicy.parse(options),
				}
			: null,
	};
}

// A deliberately small deterministic comparator, not a change to the public search contract.
const aliases: Readonly<Record<string, string>> = {
	vm: "server",
	vms: "server",
	machines: "server",
	machine: "server",
	show: "list",
	find: "list",
	retrieve: "get",
	provision: "create",
	postgres: "postgresql",
	s3: "object storage",
	restart: "action",
	reboot: "action",
};
const stopwords = new Set([
	"a",
	"an",
	"the",
	"my",
	"in",
	"of",
	"on",
	"for",
	"to",
	"at",
	"with",
	"me",
	"all",
	"virtual",
	"cloud",
	"existing",
	"this",
]);
function words(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean)
		.flatMap((word) => (aliases[word] ?? word).split(" "))
		.filter((word) => !stopwords.has(word))
		.map((word) => (word.endsWith("s") ? word.slice(0, -1) : word));
}
export function aliasCandidates(
	registry: OperationRegistry,
	intent: string,
	context = "",
): string[] {
	const query = [...new Set(words(`${intent} ${context}`))];
	return registry.operations
		.map((op) => {
			const identity = new Set(words(`${op.op} ${op.area}`));
			const description = new Set(words(op.description));
			const score = query.reduce(
				(sum, token) => sum + (identity.has(token) ? 3 : description.has(token) ? 1 : 0),
				0,
			);
			return { op: op.op, score };
		})
		.filter((hit) => hit.score > 0)
		.sort((a, b) => b.score - a.score || a.op.localeCompare(b.op))
		.slice(0, 3)
		.map((hit) => hit.op);
}

export function summarize(rows: EvaluationRow[]) {
	const single = rows.filter((row) => row.expectedStatus === "matched");
	const accepted = rows.filter((row) => row.status === "matched");
	const correct = (row: EvaluationRow) =>
		row.expectedStatus === "matched" && row.expectedOps.includes(row.candidates[0]);
	const durations = rows.map((row) => row.durationMs).sort((a, b) => a - b);
	const ratio = (numerator: number, denominator: number) =>
		denominator === 0 ? null : numerator / denominator;
	const percentile = (p: number) =>
		durations.length ? durations[Math.ceil(p * durations.length) - 1] : null;
	const receipts = rows.filter((row) => row.usage !== undefined);
	return {
		cases: rows.length,
		singleOperationCases: single.length,
		top1Accuracy: ratio(
			single.filter((row) => row.expectedOps.includes(row.candidates[0])).length,
			single.length,
		),
		recallAt3: ratio(
			single.filter((row) => row.candidates.slice(0, 3).some((op) => row.expectedOps.includes(op)))
				.length,
			single.length,
		),
		statusAccuracy: ratio(
			rows.filter((row) => row.status === row.expectedStatus).length,
			rows.length,
		),
		acceptedPrecision: ratio(accepted.filter(correct).length, accepted.length),
		acceptedCoverage: ratio(accepted.length, rows.length),
		unavailable: rows.filter((row) => row.status === "unavailable").length,
		localFallbacks: rows.filter((row) => row.source === "local").length,
		disallowedCandidates: rows.reduce((sum, row) => sum + row.disallowedCandidates, 0),
		latencyMs: { p50: percentile(0.5), p95: percentile(0.95) },
		providerCalls: rows.reduce((sum, row) => sum + row.providerCalls, 0),
		usage: receipts.length
			? {
					casesWithReceipts: receipts.length,
					inputTokens: receipts.reduce((sum, row) => sum + (row.usage?.inputTokens ?? 0), 0),
					outputTokens: receipts.reduce((sum, row) => sum + (row.usage?.outputTokens ?? 0), 0),
				}
			: null,
	};
}

/** A live benchmark must not silently count a local fallback as a provider response. */
export function evaluationFailed(rows: EvaluationRow[], requireProvider = false): boolean {
	return rows.some(
		(row) =>
			row.disallowedCandidates > 0 ||
			row.status === "unavailable" ||
			(requireProvider && row.source === "local"),
	);
}

async function main() {
	const args = process.argv.slice(2);
	if (args.some((arg) => arg !== "--jev" && !arg.startsWith("--output=")))
		throw new Error("Usage: bun run eval:routing [--jev] [--output=path.json]");
	const live = args.includes("--jev");
	const options = live
		? resolveServerOptions({ ...process.env, SCW_ROUTER: "jev" }).router
		: undefined;
	const configuration = evaluationConfiguration(options, process.env.SCW_ROUTER_MODEL);
	const results: Record<string, EvaluationRow[]> = {
		keyword: [],
		aliases: [],
		...(live ? { jev: [] } : {}),
	};
	for (const test of routingCases) {
		const registry = createOperationRegistry(test.filters);
		for (const method of Object.keys(results)) {
			const start = performance.now();
			let decision: Pick<RouteResult, "status" | "providerCalls" | "usage" | "model">;
			let diagnostics: ReturnType<typeof routeDiagnostics> | undefined;
			let candidates: string[];
			if (method === "jev" && options) {
				const result = await createIntentRouter(registry, options).route({
					intent: test.intent,
					context: test.context,
					limit: configuration.candidateLimit,
				});
				decision = result;
				diagnostics = routeDiagnostics(result);
				candidates = result.candidates.map((candidate) => candidate.op);
			} else {
				const found = searchOperations(registry, { query: test.intent, limit: 3 });
				candidates =
					method === "aliases"
						? aliasCandidates(registry, test.intent, test.context)
						: "operations" in found
							? found.operations.map((op) => op.op)
							: [];
				decision = { status: candidates.length ? "matched" : "unsupported", providerCalls: 0 };
			}
			results[method].push({
				id: test.id,
				intent: test.intent,
				context: test.context,
				filters: test.filters,
				expectedStatus: test.expectedStatus,
				expectedOps: test.expectedOps,
				status: decision.status,
				candidates,
				durationMs: performance.now() - start,
				disallowedCandidates: candidates.filter((op) => !registry.get(op)).length,
				providerCalls: decision.providerCalls,
				usage: decision.usage,
				model: decision.model,
				...diagnostics,
			});
		}
	}
	const report = {
		createdAt: new Date().toISOString(),
		liveJev: live,
		configuration,
		fixtureVersion: createHash("sha256").update(JSON.stringify(routingCases)).digest("hex"),
		calibration: "uncalibrated",
		note: "Synthetic development cases, not a held-out production benchmark. Keyword/alias baselines query intent directly; they do not measure an LLM client's query rewriting or task completion. No cloud operations execute. Token receipts do not establish billing; apply current provider pricing separately.",
		methods: Object.fromEntries(
			Object.entries(results).map(([name, rows]) => [name, { summary: summarize(rows), rows }]),
		),
	};
	const output = args.find((arg) => arg.startsWith("--output="))?.slice("--output=".length);
	if (output) writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
	console.log(
		JSON.stringify(
			{
				liveJev: live,
				configuration,
				note: report.note,
				methods: Object.fromEntries(
					Object.entries(report.methods).map(([name, value]) => [name, value.summary]),
				),
			},
			null,
			2,
		),
	);
	if (evaluationFailed(Object.values(results).flat(), live)) process.exitCode = 1;
}

if (import.meta.main) await main();
