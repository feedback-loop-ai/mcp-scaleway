import generated from "../gateway/examples.json";
import { operationAvailability } from "./availability.js";

const catalog: Readonly<Record<string, Record<string, unknown>>> = generated;
export function operationExamples(tool: string) {
	return catalog[tool]
		? [{ params: structuredClone(catalog[tool]), synthetic: true as const }]
		: [];
}

export function descriptionWithExample(tool: string, description: string): string {
	const [example] = operationExamples(tool);
	const availability = operationAvailability(tool);
	const notice = availability
		? `\nTemporarily unavailable: ${availability.reason} ${availability.migration}`
		: "";
	return example
		? `${description}\nSynthetic input example (replace example values): ${JSON.stringify(example.params)}${notice}`
		: `${description}${notice}`;
}
