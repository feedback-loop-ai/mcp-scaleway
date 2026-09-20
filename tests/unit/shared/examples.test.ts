import { describe, expect, it } from "vitest";
import { describeOperations } from "../../../src/gateway/discovery.js";
import examples from "../../../src/gateway/examples.json";
import { createOperationRegistry, registerFlatTools } from "../../../src/gateway/registry.js";
import { descriptionWithExample, operationExamples } from "../../../src/shared/examples.js";
import { server } from "../gateway/fixtures.js";

const registry = createOperationRegistry();
const catalog: Record<string, Record<string, unknown>> = examples;

describe("whole-catalog synthetic examples", () => {
	it("covers exactly the advertised operation catalog", () => {
		expect(Object.keys(examples).sort()).toEqual(registry.operations.map((op) => op.tool).sort());
	});
	it.each(registry.operations)(
		"$tool accepts its example without undeclared parameters",
		async (op) => {
			expect(await op.schema.strict().safeParseAsync(catalog[op.tool])).toMatchObject({
				success: true,
			});
			const described = describeOperations(registry, { ops: [op.op] });
			expect(described).toMatchObject({
				operations: [{ examples: [{ params: catalog[op.tool], synthetic: true }] }],
			});
		},
	);
	it("exposes identical examples on flat descriptions and describe without mutating the catalog", () => {
		const filtered = createOperationRegistry({ toolsets: ["instances"] });
		const [tool] = registerFlatTools(server(), filtered);
		const source = tool.description?.split("Synthetic input example (replace example values): ")[1];
		expect(JSON.parse(source ?? "null")).toEqual(catalog[tool.name]);
		const first = operationExamples(tool.name);
		first[0].params.name = "mutated";
		expect(operationExamples(tool.name)).not.toEqual(first);
	});
	it("custom registries without a generated example retain their description", () => {
		expect(operationExamples("custom_test_tool")).toEqual([]);
		expect(descriptionWithExample("custom_test_tool", "custom")).toBe("custom");
	});
});
