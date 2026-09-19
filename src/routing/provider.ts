import { z } from "zod";

export const MAX_CHOICES = 255;
export interface DecisionRequest {
	state: string;
	question: string;
	choices: Readonly<Record<string, string>>;
	signal: AbortSignal;
}
export const DecisionSchema = z.object({
	choice: z.string(),
	probabilities: z.record(z.number().finite().min(0).max(1)),
	confidence: z.number().finite().min(0).max(1),
	model: z.string().optional(),
	usage: z
		.object({
			inputTokens: z.number().int().nonnegative(),
			outputTokens: z.number().int().nonnegative(),
		})
		.optional(),
});
export type Decision = z.infer<typeof DecisionSchema>;
export interface DecisionProvider {
	choose(request: DecisionRequest): Promise<Decision>;
}

export function validateChoices(choices: DecisionRequest["choices"]): void {
	const count = Object.keys(choices).length;
	if (count < 2 || count > MAX_CHOICES) throw new Error("Invalid routing choice count");
}

/** Validate untrusted model output even when a custom provider is injected. */
export function validateDecision(choices: DecisionRequest["choices"], value: unknown): Decision {
	validateChoices(choices);
	const decision = DecisionSchema.parse(value);
	const keys = Object.keys(choices);
	const probabilities = Object.values(decision.probabilities);
	if (
		!Object.hasOwn(choices, decision.choice) ||
		Object.keys(decision.probabilities).length !== keys.length ||
		keys.some((key) => !Object.hasOwn(decision.probabilities, key)) ||
		Math.abs(probabilities.reduce((sum, probability) => sum + probability, 0) - 1) > 0.001 ||
		decision.probabilities[decision.choice] < Math.max(...probabilities)
	)
		throw new Error("Invalid routing decision");
	return decision;
}
