/** Local-only discovery benchmark. No cloud requests, credentials or model API calls. */
import { writeFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createServer } from "../src/server.js";
import type { ServerMode } from "../src/shared/mode.js";

/**
 * Upper bound (bytes) for the representative offline flow measured by measureDiscoveryFlow:
 * scaleway_search query "rdb list databases" followed by scaleway_describe of rdb_list_databases.
 * Measured 2026-09 at 310 B + 1051 B = 1361 B over the in-memory transport. Bytes are not tokens;
 * nothing is executed, so this says nothing about task or execution savings.
 */
export const DISCOVERY_FLOW_BYTE_BUDGET = 2_048;

export interface DiscoveryFlowMeasurement {
	query: string;
	op: string;
	searchBytes: number;
	describeBytes: number;
	totalBytes: number;
	searchHits: string[];
	describedOps: string[];
}

function textBytes(result: CallToolResult): { bytes: number; body: Record<string, unknown> } {
	const first = result.content[0];
	if (!first || first.type !== "text") throw new Error("Expected a text result");
	return { bytes: Buffer.byteLength(first.text), body: JSON.parse(first.text) };
}

async function withClient<T>(mode: ServerMode, body: (client: Client) => Promise<T>): Promise<T> {
	const server = createServer({ mode });
	const client = new Client({ name: "discovery-benchmark", version: "1" });
	const [ct, st] = InMemoryTransport.createLinkedPair();
	try {
		await Promise.all([server.connect(st), client.connect(ct)]);
		return await body(client);
	} finally {
		await client.close();
		await server.close();
	}
}

/** Offline search->describe byte measurement over MCP. Never calls scaleway_read/scaleway_call. */
export async function measureDiscoveryFlow(
	query: string,
	op: string,
): Promise<DiscoveryFlowMeasurement> {
	return withClient("gateway", async (client) => {
		const search = textBytes(
			(await client.callTool({ name: "scaleway_search", arguments: { query } })) as CallToolResult,
		);
		const describe = textBytes(
			(await client.callTool({
				name: "scaleway_describe",
				arguments: { ops: [op] },
			})) as CallToolResult,
		);
		const ids = (rows: unknown) =>
			Array.isArray(rows) ? rows.map((row) => String((row as { op: unknown }).op)) : [];
		return {
			query,
			op,
			searchBytes: search.bytes,
			describeBytes: describe.bytes,
			totalBytes: search.bytes + describe.bytes,
			searchHits: ids(search.body.operations),
			describedOps: ids(describe.body.operations),
		};
	});
}

async function main(): Promise<void> {
	const output: Record<string, unknown> = {};
	for (const mode of ["gateway", "flat", "both"] satisfies ServerMode[]) {
		output[mode] = await withClient(mode, async (client) => {
			const { tools, nextCursor } = await client.listTools();
			if (nextCursor)
				throw new Error("Benchmark needs pagination support before counting this listing");
			const instructions = client.getInstructions() ?? "";
			return {
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
		});
	}
	const flow = await measureDiscoveryFlow("rdb list databases", "rdb_list_databases");
	output.discoveryFlow = { ...flow, budgetBytes: DISCOVERY_FLOW_BYTE_BUDGET };
	if (process.argv[2]) writeFileSync(process.argv[2], `${JSON.stringify(output, null, 2)}\n`);
	for (const mode of ["gateway", "flat", "both"]) {
		const { toolCount, toolBytes, instructionBytes } = output[mode] as Record<string, unknown>;
		console.log(JSON.stringify({ mode, toolCount, toolBytes, instructionBytes }));
	}
	console.log(JSON.stringify({ discoveryFlow: output.discoveryFlow }));
	console.log(
		"Bytes are not tokens. Use the model's count_tokens endpoint on the exported tool definitions for model-specific counts. The discovery flow is offline (search+describe only); it does not measure execution.",
	);
}

if (import.meta.main) await main();
