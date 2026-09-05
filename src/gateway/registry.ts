import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { inputSchemaFor } from "../shared/catalog.js";
import { withRouteContext } from "../shared/route-guard.js";
import { type ToolsetConfig, createToolFilter, operationId } from "../shared/toolsets.js";
import { registerAllTools } from "../tools/index.js";
import { type OperationMetadata, OperationMetadataSchema, isReadOnly } from "./metadata.js";
import generatedMetadata from "./operations.json";

export type OperationCallback = ToolCallback<z.ZodRawShape>;
export type OperationExtra = Parameters<OperationCallback>[1];
export interface Operation extends Readonly<OperationMetadata> {
	readonly op: string;
	readonly description: string;
	readonly shape: z.ZodRawShape;
	readonly schema: z.ZodObject<z.ZodRawShape>;
	readonly inputSchema: Tool["inputSchema"];
	readonly callback: OperationCallback;
}
export interface OperationRegistry {
	readonly operations: readonly Operation[];
	get(op: string): Operation | undefined;
}
export interface RegistryOptions {
	register?: (server: McpServer) => void;
	metadata?: readonly OperationMetadata[];
}

export function createOperationRegistry(
	filters: ToolsetConfig = {},
	{ register = registerAllTools, metadata = generatedMetadata }: RegistryOptions = {},
): OperationRegistry {
	const records = z.array(OperationMetadataSchema).nonempty().parse(metadata);
	const byName = new Map<string, OperationMetadata>();
	for (const record of records) {
		if (byName.has(record.tool)) throw new Error(`Duplicate operation metadata: ${record.tool}`);
		if (record.readOnly !== isReadOnly(record.tool, record.api)) {
			throw new Error(
				`Invalid read-only classification for ${record.tool}: regenerate operation metadata.`,
			);
		}
		byName.set(record.tool, record);
	}
	const recorded = new Map<string, Operation>();
	// Existing registrars use exactly the public four-argument overload. This is a recording
	// adapter, not an SDK instance; deliberately expose no other server facilities.
	const recorder = {
		tool(
			name: string,
			description: string,
			shape: z.ZodRawShape,
			callback: OperationCallback,
		): void {
			if (recorded.has(name)) throw new Error(`Duplicate tool registration: ${name}`);
			const record = byName.get(name);
			if (!record)
				throw new Error(
					`Missing operation metadata for registered tool ${name}. Run scripts/gen-operations.ts.`,
				);
			if (typeof description !== "string" || !shape || typeof callback !== "function") {
				throw new Error(
					`Unsupported registration for ${name}: expected tool(name, description, rawShape, callback).`,
				);
			}
			const snapshot = Object.freeze({ ...shape });
			recorded.set(
				name,
				Object.freeze({
					...record,
					op: operationId(name),
					description,
					shape: snapshot,
					schema: z.object(snapshot),
					inputSchema: inputSchemaFor(snapshot),
					callback,
				}),
			);
		},
	};
	register(recorder as unknown as McpServer);
	const missing = records.filter((record) => !recorded.has(record.tool));
	if (missing.length > 0)
		throw new Error(
			`Metadata has no registered tool: ${missing.map((r) => r.tool).join(", ")}. Regenerate operation metadata.`,
		);
	const allowed = createToolFilter(filters, records);
	const operations = Object.freeze(
		[...recorded.values()]
			.filter((op) => allowed(op.tool))
			.sort((a, b) => a.op.localeCompare(b.op)),
	);
	const lookup = new Map(operations.map((op) => [op.op, op]));
	return Object.freeze({ operations, get: (op: string) => lookup.get(operationId(op)) });
}

/** Writes stay potentially destructive/non-idempotent, including PATCH and composite operations. */
export function operationAnnotations(readOnly: boolean): NonNullable<Tool["annotations"]> {
	return {
		readOnlyHint: readOnly,
		destructiveHint: !readOnly,
		idempotentHint: readOnly,
		openWorldHint: true,
	};
}

/** The SDK still owns tools/call parsing. Install projected listing after all registrations. */
export function registerFlatTools(server: McpServer, registry: OperationRegistry): Tool[] {
	return registry.operations.map((op) => {
		const annotations = operationAnnotations(op.readOnly);
		server.registerTool(
			op.tool,
			{ description: op.description, inputSchema: op.shape, annotations },
			(args, extra) => withRouteContext(op.tool, op.api, () => op.callback(args, extra)),
		);
		return { name: op.tool, description: op.description, inputSchema: op.inputSchema, annotations };
	});
}
