import { describe, expect, it } from "vitest";
import {
	type EvaluationRow,
	aliasCandidates,
	evaluationConfiguration,
	evaluationFailed,
	routeDiagnostics,
	routingCases,
	summarize,
} from "../../scripts/evaluate-routing.js";
import { createOperationRegistry } from "../../src/gateway/registry.js";
import type { RouteResult } from "../../src/routing/index.js";

describe("routing evaluation", () => {
	it("uses unique case IDs and real permitted reference operations", () => {
		expect(new Set(routingCases.map((test) => test.id)).size).toBe(routingCases.length);
		for (const test of routingCases) {
			const registry = createOperationRegistry(test.filters);
			for (const op of test.expectedOps)
				expect(registry.get(op), `${test.id}: ${op}`).toBeDefined();
		}
	});
	it("keeps alias retrieval inside the filtered registry", () => {
		const registry = createOperationRegistry({ toolsets: ["instances"], readOnly: true });
		const candidates = aliasCandidates(registry, "Show my virtual machines");
		expect(candidates[0]).toBe("instances_list_servers");
		for (const op of candidates) expect(registry.get(op)?.readOnly).toBe(true);
	});
	it("separates candidate accuracy from acceptance and abstention", () => {
		const base: EvaluationRow = {
			id: "one",
			expectedStatus: "matched",
			expectedOps: ["right"],
			status: "matched",
			candidates: ["right"],
			durationMs: 10,
			disallowedCandidates: 0,
			providerCalls: 2,
		};
		const report = summarize([
			base,
			{ ...base, id: "two", status: "ambiguous", candidates: ["wrong", "right"], durationMs: 20 },
			{
				...base,
				id: "three",
				expectedStatus: "unsupported",
				expectedOps: [],
				status: "unsupported",
				candidates: [],
				durationMs: 30,
			},
		]);
		expect(report.top1Accuracy).toBe(0.5);
		expect(report.recallAt3).toBe(1);
		expect(report.acceptedPrecision).toBe(1);
		expect(report.acceptedCoverage).toBeCloseTo(1 / 3);
		expect(report.statusAccuracy).toBeCloseTo(2 / 3);
		expect(report.latencyMs).toEqual({ p50: 20, p95: 30 });
		expect(report.usage).toBeNull();
		expect(report.localFallbacks).toBe(0);
		expect(summarize([{ ...base, source: "local" }]).localFallbacks).toBe(1);
		expect(evaluationFailed([base], true)).toBe(false);
		expect(evaluationFailed([{ ...base, source: "local" }], true)).toBe(true);
		expect(evaluationFailed([{ ...base, source: "local" }])).toBe(false);
		expect(evaluationFailed([{ ...base, disallowedCandidates: 1 }])).toBe(true);
		expect(evaluationFailed([{ ...base, status: "unavailable" }], true)).toBe(true);
		expect(summarize([]).top1Accuracy).toBeNull();
	});
	it("preserves evidence needed to explain provider abstentions in a saved report", () => {
		const result: RouteResult & { source: "provider" } = {
			status: "ambiguous",
			confidence: 0.67,
			candidates: [
				{
					op: "instances_list_servers",
					area: "instances",
					description: "List servers",
					readOnly: true,
					required: ["zone"],
					probability: 0.76,
				},
			],
			catalogVersion: "test-catalog-version",
			calibration: "uncalibrated",
			probabilityScope: "selected_areas",
			providerCalls: 2,
			source: "provider",
		};
		const saved = JSON.parse(JSON.stringify(routeDiagnostics(result)));
		expect(saved).toMatchObject({
			confidence: 0.67,
			candidateDetails: result.candidates,
			catalogVersion: "test-catalog-version",
			calibration: "uncalibrated",
			probabilityScope: "selected_areas",
			source: "provider",
		});
		expect(
			routeDiagnostics({
				...result,
				status: "unavailable",
				candidates: [],
				reason: "provider_unavailable",
			}),
		).toMatchObject({ reason: "provider_unavailable", candidateDetails: [] });
	});
	it("records effective policy and pinned model without serializing provider secrets", () => {
		const options = {
			provider: {
				choose: async () => {
					throw new Error("evaluation configuration must not call the provider");
				},
				apiKey: "test-provider-secret",
			},
			minConfidence: 0.9,
			timeoutMs: 8_000,
			apiKey: "test-top-level-secret",
		};
		const configuration = evaluationConfiguration(options, "jev-1.13.0");
		expect(configuration).toEqual({
			candidateLimit: 3,
			filters: "per-case fixtures",
			jev: {
				endpoint: "https://api.typesafe.ai/v1/systemone",
				requestedModel: "jev-1.13.0",
				minConfidence: 0.9,
				minProbability: 0.8,
				timeoutMs: 8_000,
			},
		});
		expect(JSON.stringify(configuration)).not.toContain("secret");
		expect(evaluationConfiguration(options).jev?.requestedModel).toBe("jev-1.13.0");
		expect(evaluationConfiguration().jev).toBeNull();
	});
});
