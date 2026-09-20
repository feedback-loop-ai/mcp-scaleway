import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { inputSchemaFor } from "./catalog.js";

/** MCP envelope only; upstream response validation is a separate transport contract. */
export const StructuredOutput = z.object({
	format: z.enum(["json", "text", "content"]),
	data: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.null(),
		z.array(z.unknown()),
		z.record(z.unknown()),
	]),
});
export const outputSchema = inputSchemaFor(StructuredOutput.shape);

/** Preserve legacy content exactly, including non-JSON and non-text responses. */
export function withStructuredOutput(result: CallToolResult): CallToolResult {
	const first = result.content[0];
	let envelope: z.infer<typeof StructuredOutput>;
	if (result.content.length === 1 && first.type === "text") {
		try {
			envelope = { format: "json", data: JSON.parse(first.text) };
		} catch {
			envelope = { format: "text", data: first.text };
		}
	} else {
		envelope = { format: "content", data: result.content };
	}
	return { ...result, structuredContent: envelope };
}
