/** Generate synthetic input examples; the registered strict Zod schema remains the gate. */
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createOperationRegistry } from "../src/gateway/registry.js";
import catalogJson from "../src/shared/response-contracts.json";
import { responseSchema } from "../src/shared/response-validation.js";
import { sampleInput } from "./sample-input.js";

const overrides: Record<string, Record<string, unknown>> = {
	scaleway_rabbitmq_upgrade_deployment: { node_count: 3 },
};

const examples: Record<string, Record<string, unknown>> = {};
const errors: string[] = [];
const catalog = catalogJson as unknown as {
	routes: Record<string, Array<{ area: string; sourcePath: string; method: string }>>;
	documents: Record<
		string,
		{
			paths: Record<
				string,
				Record<
					string,
					{ parameters?: Array<{ in: string; name: string; schema: Record<string, unknown> }> }
				>
			>;
		}
	>;
};
for (const op of createOperationRegistry().operations) {
	try {
		const input: Record<string, unknown> = {
			...(sampleInput(op.schema, op.op) as object),
			...overrides[op.tool],
		};
		// Explicit source-valid locations keep examples useful even when the generic account
		// default zone is outside an operation's recorded availability. Do not alter runtime config.
		for (const locality of ["zone", "region"]) {
			if (!op.shape[locality]) continue;
			const constraints = (catalog.routes[op.tool] ?? []).flatMap((route) => {
				const parameters =
					catalog.documents[route.area].paths[route.sourcePath]?.[route.method.toLowerCase()]
						?.parameters ?? [];
				return parameters
					.filter((parameter) => parameter.in === "path" && parameter.name === locality)
					.map((parameter) => ({ area: route.area, schema: parameter.schema }));
			});
			if (!constraints.length) continue;
			const candidates = [
				input[locality] ?? (locality === "zone" ? "fr-par-1" : "fr-par"),
				...constraints.flatMap(({ schema }) => (Array.isArray(schema.enum) ? schema.enum : [])),
			];
			const selected = candidates.find(
				(value) =>
					op.shape[locality].safeParse(value).success &&
					constraints.every(
						({ area, schema }) => responseSchema(area, schema).safeParse(value).success,
					),
			);
			if (selected === undefined)
				throw new Error(`No source-valid example location for ${locality}`);
			input[locality] = selected;
		}
		const parsed = await op.schema.strict().safeParseAsync(input);
		if (!parsed.success) throw new Error(JSON.stringify(parsed.error.issues));
		examples[op.tool] = input;
	} catch (error) {
		errors.push(`${op.tool}: ${String(error)}`);
	}
}
if (errors.length) throw new Error(errors.join("\n"));
await writeFile(
	new URL("../src/gateway/examples.json", import.meta.url),
	`${JSON.stringify(examples, null, "\t")}\n`,
);
execFileSync(
	"bun",
	[
		"x",
		"biome",
		"format",
		"--write",
		fileURLToPath(new URL("../src/gateway/examples.json", import.meta.url)),
	],
	{ stdio: "pipe" },
);
console.log(`Generated ${Object.keys(examples).length} schema-valid synthetic operation examples.`);
