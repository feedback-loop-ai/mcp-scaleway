import { describe, expect, it } from "vitest";
import { StructuredOutput, withStructuredOutput } from "../../../src/shared/output.js";

it.each([{}, [], null, false, 1, "example"])(
	"publishes parsed JSON %j without changing text",
	(data) => {
		const original = {
			content: [{ type: "text" as const, text: JSON.stringify(data) }],
			_meta: { kept: true },
		};
		const result = withStructuredOutput(original);
		expect(result.content).toBe(original.content);
		expect(result._meta).toBe(original._meta);
		expect(result.structuredContent).toEqual({ format: "json", data });
		expect(StructuredOutput.parse(result.structuredContent)).toEqual(result.structuredContent);
	},
);

describe("non-JSON and error output compatibility", () => {
	it("keeps text responses and error flags", () => {
		const result = withStructuredOutput({
			content: [{ type: "text", text: "Completed." }],
			isError: true,
		});
		expect(result.structuredContent).toEqual({ format: "text", data: "Completed." });
		expect(result.isError).toBe(true);
	});
	it.each(
		[
			[],
			[
				{ type: "text" as const, text: "one" },
				{ type: "text" as const, text: "two" },
			],
			[{ type: "image" as const, data: "AA==", mimeType: "image/png" }],
		].map((content) => ({ content })),
	)("keeps arbitrary MCP content blocks", ({ content }) => {
		const result = withStructuredOutput({ content });
		expect(result.content).toBe(content);
		expect(result.structuredContent).toEqual({ format: "content", data: content });
		expect(StructuredOutput.safeParse(result.structuredContent).success).toBe(true);
	});
	it("requires a data field in the public envelope", () => {
		expect(StructuredOutput.safeParse({ format: "json" }).success).toBe(false);
	});
});
