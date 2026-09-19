import { afterEach, describe, expect, it, vi } from "vitest";
import type { OperationRegistry } from "../../../src/gateway/registry.js";
import { createOperationRegistry } from "../../../src/gateway/registry.js";
import {
	type Decision,
	type DecisionProvider,
	type DecisionRequest,
	RouteInput,
	createIntentRouter,
} from "../../../src/routing/index.js";
import { fixtureRegistry } from "../gateway/fixtures.js";

function answer(
	request: DecisionRequest,
	choice: string,
	probability = 1,
	confidence = 1,
): Decision {
	const keys = Object.keys(request.choices);
	return {
		choice,
		confidence,
		probabilities: Object.fromEntries(
			keys.map((key) => [
				key,
				key === choice ? probability : (1 - probability) / (keys.length - 1),
			]),
		),
	};
}
function provider(area = "instances", op = "instances_list_servers") {
	return {
		choose: vi
			.fn<DecisionProvider["choose"]>()
			.mockImplementationOnce(async (request) => answer(request, area))
			.mockImplementationOnce(async (request) => answer(request, op)),
	};
}
function syntheticRegistry(areaCount: number, operationsPerArea: number): OperationRegistry {
	const template = fixtureRegistry().operations[0];
	const operations = Array.from({ length: areaCount }, (_, area) =>
		Array.from({ length: operationsPerArea }, (_, id) => ({
			...template,
			op: `area${area}_op${id}`,
			area: `area${area}`,
		})),
	).flat();
	return { operations, get: (op) => operations.find((operation) => operation.op === op) };
}
afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllEnvs();
});

describe("optional intent router", () => {
	it("routes through area and operation choices without calling any cloud handler or forwarding credentials", async () => {
		vi.stubEnv("SCW_SECRET_KEY", "SCW_PRIVATE_SECRET");
		vi.stubEnv("TYPESAFE_API_KEY", "TYPESAFE_PRIVATE_SECRET");
		const callback = vi.fn();
		const registry = fixtureRegistry(callback);
		const injected = provider();
		const router = createIntentRouter(registry, { provider: injected });
		const result = await router.route({
			intent: "show my virtual machines",
			context: "Paris",
			limit: 2,
		});
		expect(result).toMatchObject({
			status: "matched",
			calibration: "uncalibrated",
			probabilityScope: "selected_areas",
			providerCalls: 2,
			confidence: 1,
		});
		expect(result.candidates[0]).toMatchObject({
			op: "instances_list_servers",
			required: ["zone"],
			readOnly: true,
			probability: 1,
		});
		expect(result.candidates).toHaveLength(1);
		expect(result.catalogVersion).toMatch(/^[a-f0-9]{64}$/);
		expect(callback).not.toHaveBeenCalled();
		const requests = injected.choose.mock.calls.map(([request]) => request);
		expect(JSON.parse(requests[0].state)).toEqual({
			intent: "show my virtual machines",
			context: "Paris",
		});
		expect(requests[0].choices.instances).toContain("Virtual machines");
		expect(Object.isFrozen(requests[0].choices)).toBe(true);
		expect(JSON.stringify(requests)).not.toMatch(
			/PRIVATE_SECRET|callback|inputSchema|Authorization/,
		);
	});
	it("only presents and returns the configured allowed registry", async () => {
		const registry = fixtureRegistry(undefined, { toolsets: ["instances"], readOnly: true });
		const injected = provider();
		const result = await createIntentRouter(registry, { provider: injected }).route({
			intent: "list VMs",
		});
		expect(Object.keys(injected.choose.mock.calls[0][0].choices)).toEqual([
			"instances",
			"none",
			"needs_plan",
		]);
		expect(Object.keys(injected.choose.mock.calls[1][0].choices)).toEqual([
			"instances_list_servers",
			"none",
			"needs_plan",
		]);
		expect(result.candidates.map((candidate) => candidate.op)).toEqual(["instances_list_servers"]);
	});
	it("fingerprints endpoint/schema changes and filters without sending full schemas", async () => {
		const original = fixtureRegistry();
		const changed = {
			...original,
			operations: original.operations.map((op) => ({
				...op,
				inputSchema: { ...op.inputSchema, required: ["additional"] },
			})),
		};
		const first = createIntentRouter(original, { provider: provider() });
		expect(first.catalogVersion).toBe(
			createIntentRouter(fixtureRegistry(), { provider: provider() }).catalogVersion,
		);
		expect(first.catalogVersion).not.toBe(
			createIntentRouter(changed, { provider: provider() }).catalogVersion,
		);
		expect(first.catalogVersion).not.toBe(
			createIntentRouter(fixtureRegistry(undefined, { readOnly: true }), { provider: provider() })
				.catalogVersion,
		);
		const result = await createIntentRouter(original, {
			provider: provider("dns", "dns_get_zone"),
		}).route({ intent: "get DNS zone" });
		expect(result.candidates[0].required).toEqual([]);
	});
	it("aggregates optional model and token receipts over both decisions", async () => {
		const injected = provider();
		injected.choose.mockReset().mockImplementation(async (request) => ({
			...answer(
				request,
				Object.hasOwn(request.choices, "instances") ? "instances" : "instances_list_servers",
			),
			model: "jev-1.13.0",
			usage: { inputTokens: 12, outputTokens: 3 },
		}));
		expect(
			await createIntentRouter(fixtureRegistry(), { provider: injected }).route({
				intent: "list VMs",
			}),
		).toMatchObject({ model: "jev-1.13.0", usage: { inputTokens: 24, outputTokens: 6 } });
	});
	it.each([
		["none", "unsupported"],
		["needs_plan", "needs_plan"],
	] as const)("handles confident %s at either decision stage", async (choice, status) => {
		for (const area of [true, false]) {
			const injected = area ? provider(choice) : provider("instances", choice);
			expect(
				await createIntentRouter(fixtureRegistry(), { provider: injected }).route({
					intent: "request",
				}),
			).toMatchObject({ status, candidates: [], providerCalls: area ? 1 : 2 });
		}
	});
	it.each([true, false])(
		"returns ambiguity for an uncertain sentinel at area stage=%s",
		async (area) => {
			const injected = provider();
			const uncertain = async (request: DecisionRequest) => answer(request, "none", 0.6, 0.5);
			if (area) injected.choose.mockReset().mockImplementationOnce(uncertain);
			else
				injected.choose
					.mockReset()
					.mockImplementationOnce(async (request) => answer(request, "instances"))
					.mockImplementationOnce(uncertain);
			expect(
				(
					await createIntentRouter(fixtureRegistry(), { provider: injected }).route({
						intent: "uncertain",
					})
				).status,
			).toBe("ambiguous");
		},
	);
	it.each([
		[0.9, 0.7],
		[0.7, 0.9],
	])(
		"abstains below confidence/probability thresholds (%s,%s)",
		async (probability, confidence) => {
			const injected = provider();
			injected.choose
				.mockReset()
				.mockImplementationOnce(async (request) => answer(request, "instances"))
				.mockImplementationOnce(async (request) =>
					answer(request, "instances_list_servers", probability, confidence),
				);
			const result = await createIntentRouter(fixtureRegistry(), { provider: injected }).route({
				intent: "list servers",
			});
			expect(result.status).toBe("ambiguous");
			expect(result.candidates[0].probability).toBe(probability);
		},
	);
	it("keeps three areas rather than greedily dropping plausible alternatives", async () => {
		const registry = syntheticRegistry(4, 1);
		const injected = provider();
		injected.choose
			.mockReset()
			.mockImplementationOnce(async () => ({
				choice: "area0",
				confidence: 0.9,
				probabilities: {
					area0: 0.26,
					area1: 0.25,
					area2: 0.25,
					area3: 0.24,
					none: 0,
					needs_plan: 0,
				},
			}))
			.mockImplementationOnce(async (request) => answer(request, "area1_op0"));
		const result = await createIntentRouter(registry, { provider: injected }).route({
			intent: "vague",
		});
		expect(result.status).toBe("ambiguous");
		expect(result.candidates[0].op).toBe("area1_op0");
		expect(injected.choose.mock.calls[1][0].choices).not.toHaveProperty("area3_op0");
	});
	it("does not turn a confident second-stage rejection into unsupported after uncertain area selection", async () => {
		const injected = provider();
		injected.choose
			.mockReset()
			.mockImplementationOnce(async (request) => answer(request, "instances", 0.6, 0.5))
			.mockImplementationOnce(async (request) => answer(request, "none"));
		expect(
			(
				await createIntentRouter(fixtureRegistry(), { provider: injected }).route({
					intent: "uncertain area",
				})
			).status,
		).toBe("ambiguous");
	});
	it("rejects invented and disabled IDs returned by an injected provider", async () => {
		const injected = provider("disabled");
		const result = await createIntentRouter(fixtureRegistry(), { provider: injected }).route({
			intent: "request",
		});
		expect(result).toMatchObject({
			status: "unavailable",
			reason: "provider_unavailable",
			candidates: [],
		});
		expect(JSON.stringify(result)).not.toContain("disabled");
	});
	it("returns sanitized unavailability and never executes fallback operations", async () => {
		const injected = { choose: vi.fn().mockRejectedValue(new Error("PRIVATE submitted text")) };
		const result = await createIntentRouter(fixtureRegistry(), { provider: injected }).route({
			intent: "request",
		});
		expect(result.reason).toBe("provider_unavailable");
		expect(JSON.stringify(result)).not.toContain("PRIVATE");
	});
	it("uses filtered local discovery when no provider is configured, without model probabilities", async () => {
		const callback = vi.fn();
		const registry = fixtureRegistry(callback, { readOnly: true, toolsets: ["instances"] });
		const result = await createIntentRouter(registry, {}).route({
			intent: "Show my virtual machines",
		});
		expect(result).toMatchObject({
			status: "ambiguous",
			source: "local",
			reason: "provider_not_configured",
			providerCalls: 0,
			probabilityScope: "not_applicable",
			candidates: [{ op: "instances_list_servers", readOnly: true, required: ["zone"] }],
		});
		expect(result.confidence).toBeUndefined();
		expect(result.model).toBeUndefined();
		expect(result.candidates[0]).not.toHaveProperty("probability");
		expect(callback).not.toHaveBeenCalled();
	});
	it("falls back after partial provider success without presenting stale model confidence", async () => {
		const callback = vi.fn();
		const injected = provider();
		injected.choose
			.mockReset()
			.mockImplementationOnce(async (request) => ({
				...answer(request, "instances"),
				model: "jev-1.13.0",
				usage: { inputTokens: 12, outputTokens: 3 },
			}))
			.mockRejectedValueOnce(new Error("PRIVATE provider error"));
		const result = await createIntentRouter(fixtureRegistry(callback), {
			provider: injected,
		}).route({ intent: "list servers", limit: 1 });
		expect(result).toMatchObject({
			source: "local",
			status: "ambiguous",
			reason: "provider_unavailable",
			providerCalls: 2,
			candidates: [{ op: "instances_list_servers" }],
			usage: { inputTokens: 12, outputTokens: 3 },
		});
		expect(result.model).toBeUndefined();
		expect(result.confidence).toBeUndefined();
		expect(result.candidates[0]).not.toHaveProperty("probability");
		expect(JSON.stringify(result)).not.toContain("PRIVATE");
		expect(callback).not.toHaveBeenCalled();
	});
	it("returns local candidates at the provider deadline without waiting for a hung service", async () => {
		vi.useFakeTimers();
		const injected = {
			choose: vi.fn<DecisionProvider["choose"]>().mockImplementation(() => new Promise(() => {})),
		};
		const result = createIntentRouter(fixtureRegistry(), {
			provider: injected,
			timeoutMs: 100,
		}).route({ intent: "list servers", limit: 1 });
		await vi.advanceTimersByTimeAsync(100);
		expect(await result).toMatchObject({
			source: "local",
			status: "ambiguous",
			reason: "provider_unavailable",
			candidates: [{ op: "instances_list_servers" }],
		});
	});
	it("does not produce fallback candidates for a cancelled caller", async () => {
		const controller = new AbortController();
		controller.abort();
		expect(
			await createIntentRouter(fixtureRegistry(), {}).route(
				{ intent: "list servers" },
				controller.signal,
			),
		).toMatchObject({
			status: "unavailable",
			reason: "cancelled",
			candidates: [],
			providerCalls: 0,
		});
	});
	it("bounds hanging providers even when they ignore cancellation", async () => {
		vi.useFakeTimers();
		const injected = {
			choose: vi.fn<DecisionProvider["choose"]>().mockImplementation(() => new Promise(() => {})),
		};
		const promise = createIntentRouter(fixtureRegistry(), {
			provider: injected,
			timeoutMs: 100,
		}).route({ intent: "request" });
		await vi.advanceTimersByTimeAsync(100);
		expect(await promise).toMatchObject({ status: "unavailable", reason: "provider_unavailable" });
		expect(injected.choose.mock.calls[0][0].signal.aborted).toBe(true);
	});
	it("handles cancellation both before and during a request", async () => {
		for (const before of [true, false]) {
			const controller = new AbortController();
			const injected = {
				choose: vi.fn<DecisionProvider["choose"]>().mockImplementation(() => new Promise(() => {})),
			};
			if (before) controller.abort();
			const promise = createIntentRouter(fixtureRegistry(), { provider: injected }).route(
				{ intent: "request" },
				controller.signal,
			);
			controller.abort();
			expect((await promise).status).toBe("unavailable");
			expect(injected.choose).toHaveBeenCalledTimes(before ? 0 : 1);
		}
	});
	it("refuses over-capacity catalogs instead of silently omitting choices", async () => {
		for (const registry of [syntheticRegistry(254, 1), syntheticRegistry(1, 254)]) {
			const injected = provider("area0");
			const result = await createIntentRouter(registry, { provider: injected }).route({
				intent: "request",
			});
			expect(result).toMatchObject({ status: "unavailable", reason: "catalog_capacity" });
			expect(
				injected.choose.mock.calls.every(([request]) => Object.keys(request.choices).length <= 255),
			).toBe(true);
		}
	});
	it("accepts the complete real catalog with bounded operation choices", async () => {
		const injected = provider("rdb", "rdb_list_databases");
		const result = await createIntentRouter(createOperationRegistry(), {
			provider: injected,
		}).route({ intent: "list Postgres databases" });
		expect(result.candidates[0].op).toBe("rdb_list_databases");
		expect(injected.choose.mock.calls[0][0].choices.rdb).toContain("Postgres");
		expect(
			injected.choose.mock.calls.every(([request]) => Object.keys(request.choices).length <= 255),
		).toBe(true);
	});
	it("bounds inputs before calling the provider and validates configuration", async () => {
		const injected = provider();
		const router = createIntentRouter(fixtureRegistry(), { provider: injected });
		for (const value of [
			{ intent: " " },
			{ intent: "x".repeat(2049) },
			{ intent: "valid", context: "x".repeat(2049) },
			{ intent: "valid", limit: 6 },
			{ intent: "valid", secret: "private" },
		]) {
			await expect(router.route(value)).rejects.toThrow();
		}
		expect(injected.choose).not.toHaveBeenCalled();
		expect(() =>
			createIntentRouter(fixtureRegistry(), { provider: injected, timeoutMs: 0 }),
		).toThrow();
		expect(RouteInput.parse({ intent: " list servers " }).intent).toBe("list servers");
	});
});
