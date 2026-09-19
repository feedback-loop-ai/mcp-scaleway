import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_JEV_MODEL, JEV_ENDPOINT, createJevProvider } from "../../../src/routing/jev.js";
import { type DecisionRequest, validateDecision } from "../../../src/routing/provider.js";

const request: DecisionRequest = {
	state: "List virtual machines",
	question: "Which operation?",
	choices: { list: "List servers", none: "Unsupported" },
	signal: new AbortController().signal,
};
const decision = { choice: "list", probabilities: { list: 0.9, none: 0.1 }, confidence: 0.8 };
const response = {
	model: DEFAULT_JEV_MODEL,
	answers: { route: { type: "choice", ...decision } },
	usage: { input_tokens: 23, output_tokens: 4 },
};
afterEach(() => vi.unstubAllGlobals());

describe("untrusted decision validation", () => {
	it("accepts a complete probability distribution and strips unexpected output fields", () => {
		expect(validateDecision(request.choices, { ...decision, secret: "private" })).toEqual(decision);
	});
	it.each([
		{ ...decision, choice: "disabled" },
		{ ...decision, probabilities: { list: 1 } },
		{ ...decision, probabilities: { list: 0.9, disabled: 0.1 } },
		{ ...decision, probabilities: { list: 0.9, none: 0.9 } },
		{ ...decision, probabilities: { list: 0.1, none: 0.9 } },
		{ ...decision, probabilities: { list: -0.1, none: 1.1 } },
		{ ...decision, confidence: Number.NaN },
		{ ...decision, confidence: 1.1 },
	])("rejects malformed, incomplete or inconsistent distributions %#", (value) => {
		expect(() => validateDecision(request.choices, value)).toThrow();
	});
	it("enforces the provider choice capacity", () => {
		expect(() =>
			validateDecision(
				{ list: "Only choice" },
				{ choice: "list", probabilities: { list: 1 }, confidence: 1 },
			),
		).toThrow();
		const choices = Object.fromEntries(
			Array.from({ length: 256 }, (_, i) => [`option_${i}`, "description"]),
		);
		expect(() => validateDecision(choices, decision)).toThrow();
	});
});

describe("native Jev adapter", () => {
	it.each([
		{ list: 0.8, none: 0.19 },
		{ list: 0.9, none: 0.11 },
	])(
		"normalizes native hundredth-rounded probabilities totaling 0.99 or 1.01",
		async (probabilities) => {
			const provider = createJevProvider({
				apiKey: "key",
				fetch: vi.fn().mockResolvedValue(
					Response.json({
						...response,
						answers: { route: { type: "choice", ...decision, probabilities } },
					}),
				),
			});
			const result = await provider.choose(request);
			const total = probabilities.list + probabilities.none;
			expect(result.choice).toBe("list");
			expect(result.probabilities.list).toBeCloseTo(probabilities.list / total);
			expect(Object.values(result.probabilities).reduce((sum, p) => sum + p, 0)).toBeCloseTo(1);
			expect(result.confidence).toBe(decision.confidence);
		},
	);
	it.each([
		{ list: 0.8, none: 0.18 },
		{ list: 0.501, none: 0.489 },
		{ list: 0.8, disabled: 0.19 },
	])(
		"does not normalize larger, non-rounded or unknown-choice distribution errors",
		async (probabilities) => {
			const provider = createJevProvider({
				apiKey: "key",
				fetch: vi.fn().mockResolvedValue(
					Response.json({
						...response,
						answers: { route: { type: "choice", ...decision, probabilities } },
					}),
				),
			});
			await expect(provider.choose(request)).rejects.toThrow("Jev routing is unavailable.");
		},
	);
	it("uses the documented Choice envelope, pinned model, dedicated credential and supplied cancellation", async () => {
		const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(response));
		const provider = createJevProvider({ apiKey: "typesafe-private-key", fetch: fetcher });
		expect(await provider.choose(request)).toEqual({
			...decision,
			model: DEFAULT_JEV_MODEL,
			usage: { inputTokens: 23, outputTokens: 4 },
		});
		expect(fetcher).toHaveBeenCalledWith(
			JEV_ENDPOINT,
			expect.objectContaining({
				method: "POST",
				redirect: "error",
				signal: request.signal,
				headers: {
					Authorization: "Bearer typesafe-private-key",
					"Content-Type": "application/json",
				},
			}),
		);
		const body = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
		expect(body).toEqual({
			state: request.state,
			model: DEFAULT_JEV_MODEL,
			questions: {
				route: { type: "choice", instructions: request.question, criteria: request.choices },
			},
		});
		expect(JSON.stringify(body)).not.toContain("private-key");
	});
	it("accepts an explicitly pinned model and defaults to the global fetch transport", async () => {
		const fetcher = vi.fn().mockResolvedValue(Response.json({ ...response, model: "jev-1.12.0" }));
		vi.stubGlobal("fetch", fetcher);
		expect(
			(await createJevProvider({ apiKey: "key", model: "jev-1.12.0" }).choose(request)).model,
		).toBe("jev-1.12.0");
	});
	it("rejects missing credentials and moving aliases before any request", () => {
		expect(() => createJevProvider({ apiKey: " " })).toThrow("TYPESAFE_API_KEY");
		expect(() => createJevProvider({ apiKey: "key", model: "jev-latest" })).toThrow(
			"pin a Jev version",
		);
	});
	it("rejects a direct over-capacity provider request before sending it", async () => {
		const fetcher = vi.fn();
		const provider = createJevProvider({ apiKey: "key", fetch: fetcher });
		const choices = Object.fromEntries(
			Array.from({ length: 256 }, (_, i) => [`option${i}`, "description"]),
		);
		await expect(provider.choose({ ...request, choices })).rejects.toThrow(
			"Jev routing is unavailable.",
		);
		expect(fetcher).not.toHaveBeenCalled();
	});
	it.each([
		new Response("PRIVATE provider details", { status: 429 }),
		new Response("not JSON"),
		Response.json({ ...response, model: "unexpected" }),
		Response.json({ ...response, answers: { route: { type: "noul", noul: 1 } } }),
		Response.json({
			...response,
			answers: { route: { type: "choice", ...decision, choice: "invented" } },
		}),
	])("sanitizes HTTP, JSON, protocol and model failures %#", async (result) => {
		const provider = createJevProvider({ apiKey: "key", fetch: vi.fn().mockResolvedValue(result) });
		await expect(provider.choose(request)).rejects.toThrow("Jev routing is unavailable.");
	});
	it("sanitizes rejected transport errors and does not retry", async () => {
		const fetcher = vi.fn().mockRejectedValue(new Error("PRIVATE REQUEST BODY"));
		const provider = createJevProvider({ apiKey: "key", fetch: fetcher });
		await expect(provider.choose(request)).rejects.toThrow("Jev routing is unavailable.");
		expect(fetcher).toHaveBeenCalledOnce();
	});
});
