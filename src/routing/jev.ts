import { z } from "zod";
import {
	type DecisionProvider,
	DecisionSchema,
	validateChoices,
	validateDecision,
} from "./provider.js";

export const JEV_ENDPOINT = "https://api.typesafe.ai/v1/systemone";
export const DEFAULT_JEV_MODEL = "jev-1.13.0";
const ModelSchema = z.string().regex(/^jev-\d+\.\d+\.\d+$/);
const ResponseSchema = z.object({
	model: z.string(),
	answers: z.object({ route: z.object({ type: z.literal("choice") }).passthrough() }),
	usage: z.object({
		input_tokens: z.number().int().nonnegative(),
		output_tokens: z.number().int().nonnegative(),
	}),
});

/** Native Choice API; no OpenAI compatibility layer or Scaleway credentials. */
export function createJevProvider({
	apiKey,
	model = DEFAULT_JEV_MODEL,
	fetch: fetcher = fetch,
}: {
	apiKey: string;
	model?: string;
	fetch?: (input: string, init: RequestInit) => Promise<Response>;
}): DecisionProvider {
	if (!apiKey.trim()) throw new Error("TYPESAFE_API_KEY is required to create the Jev provider.");
	if (!ModelSchema.safeParse(model).success)
		throw new Error("SCW_ROUTER_MODEL must pin a Jev version, for example jev-1.13.0.");
	return {
		async choose({ state, question, choices, signal }) {
			try {
				validateChoices(choices);
				const response = await fetcher(JEV_ENDPOINT, {
					method: "POST",
					headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
					body: JSON.stringify({
						state,
						model,
						questions: { route: { type: "choice", instructions: question, criteria: choices } },
					}),
					signal,
					redirect: "error",
				});
				if (!response.ok) throw new Error("Jev request failed");
				const result = ResponseSchema.parse(await response.json());
				if (result.model !== model) throw new Error("Unexpected Jev model");
				const decision = DecisionSchema.parse({
					...result.answers.route,
					model: result.model,
					usage: {
						inputTokens: result.usage.input_tokens,
						outputTokens: result.usage.output_tokens,
					},
				});
				const probabilities = Object.values(decision.probabilities);
				const total = probabilities.reduce((sum, probability) => sum + probability, 0);
				// Native live responses can round each probability to hundredths and total 0.99/1.01.
				// Repair only that narrow rounding case; generic providers still require a unit sum.
				if (
					Math.abs(total - 1) > 0.001 &&
					Math.abs(total - 1) <= 0.010000001 &&
					probabilities.every((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8)
				) {
					decision.probabilities = Object.fromEntries(
						Object.entries(decision.probabilities).map(([choice, probability]) => [
							choice,
							probability / total,
						]),
					);
				}
				return validateDecision(choices, decision);
			} catch {
				// Provider error bodies, network exceptions and Zod messages may include submitted text.
				throw new Error("Jev routing is unavailable.");
			}
		},
	};
}
