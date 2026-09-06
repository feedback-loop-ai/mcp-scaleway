/**
 * Constitution I: tool descriptions MUST include usage examples.
 * Enforced for every area whose descriptions were (re)authored in feature 060;
 * extending this list is how the repo-wide follow-up (059 T058) gets tracked.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { registerAutoscalingTools } from "../../../src/tools/autoscaling/index.js";
import { registerCockpitTools } from "../../../src/tools/cockpit/index.js";
import { registerContainersTools } from "../../../src/tools/containers/index.js";

const EXAMPLE = /\. Example: \{[^}]*\}/;

function descriptionsOf(register: (server: McpServer) => void): Map<string, string> {
	const out = new Map<string, string>();
	register({
		tool: (name: string, description: string) => {
			out.set(name, description);
		},
	} as unknown as McpServer);
	return out;
}

describe("usage examples in tool descriptions", () => {
	it.each([
		["autoscaling", registerAutoscalingTools, 15],
		["containers", registerContainersTools, 17],
	] as const)("%s: every description carries an example", (_area, register, count) => {
		const descriptions = descriptionsOf(register);
		expect(descriptions.size).toBe(count);
		for (const [name, description] of descriptions) {
			expect(description, name).toMatch(EXAMPLE);
		}
	});

	it("cockpit: every deprecated description carries an example", () => {
		const deprecated = [...descriptionsOf(registerCockpitTools)].filter(([, d]) =>
			d.includes("(deprecated upstream)"),
		);
		expect(deprecated).toHaveLength(6);
		for (const [name, description] of deprecated) {
			expect(description, name).toMatch(EXAMPLE);
		}
	});
});

describe("examples validate against the registered contract", () => {
	it.each([registerAutoscalingTools, registerContainersTools, registerCockpitTools])(
		"validates required fields and rejects invented keys",
		(register) => {
			register({
				tool(name: string, description: string, shape: z.ZodRawShape) {
					const marker = ". Example: ";
					if (!description.includes(marker)) return;
					// Parse the deliberately restricted object-literal examples as JSON, never eval.
					const source = description.slice(description.indexOf(marker) + marker.length);
					const json = source
						.replace(/'/g, '"')
						.replace(/([{,]\s*)([a-zA-Z_$][\w$]*):/g, '$1"$2":');
					const args = JSON.parse(json);
					const result = z.object(shape).strict().safeParse(args);
					expect(result.success, name).toBe(true);
				},
			} as unknown as McpServer);
		},
	);
});
