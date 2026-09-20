import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withStructuredOutput } from "./output.js";

/** Only call with a registry-owned identifier, never an unvalidated submitted identifier. */
export async function dispatch(
	op: string,
	callback: () => CallToolResult | Promise<CallToolResult>,
): Promise<CallToolResult> {
	const start = performance.now();
	let outcome = "error";
	try {
		const result = withStructuredOutput(await callback());
		outcome = result.isError ? "error" : "success";
		return result;
	} finally {
		try {
			process.stderr.write(
				`${JSON.stringify({
					event: "operation",
					op,
					outcome,
					durationMs: Math.round((performance.now() - start) * 1000) / 1000,
				})}\n`,
			);
		} catch {
			// A closed client log stream cannot change operation success or obscure an error.
		}
	}
}
