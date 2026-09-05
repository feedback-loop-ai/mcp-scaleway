/** Local-only discovery benchmark. No cloud requests, credentials or model API calls. */
import { writeFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";
import type { ServerMode } from "../src/shared/mode.js";

const output: Record<string, unknown> = {};
for (const mode of ["gateway", "flat", "both"] satisfies ServerMode[]) {
	const server = createServer({ mode });
	const client = new Client({ name: "discovery-benchmark", version: "1" });
	const [ct, st] = InMemoryTransport.createLinkedPair();
	try {
		await Promise.all([server.connect(st), client.connect(ct)]);
		const { tools, nextCursor } = await client.listTools();
		if (nextCursor)
			throw new Error("Benchmark needs pagination support before counting this listing");
		const instructions = client.getInstructions() ?? "";
		output[mode] = {
			toolCount: tools.length,
			toolBytes: Buffer.byteLength(JSON.stringify(tools)),
			instructionBytes: Buffer.byteLength(instructions),
			instructions,
			tools: tools.map(({ name, description, inputSchema }) => ({
				name: `mcp__scaleway__${name}`,
				description,
				input_schema: inputSchema,
			})),
		};
	} finally {
		await client.close();
		await server.close();
	}
}
if (process.argv[2]) writeFileSync(process.argv[2], `${JSON.stringify(output, null, 2)}\n`);
for (const [mode, result] of Object.entries(output)) {
	const { toolCount, toolBytes, instructionBytes } = result as Record<string, unknown>;
	console.log(JSON.stringify({ mode, toolCount, toolBytes, instructionBytes }));
}
console.log(
	"Bytes are not tokens. Use the model's count_tokens endpoint on the exported tool definitions for model-specific counts.",
);
