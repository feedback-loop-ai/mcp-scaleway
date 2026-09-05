import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { inputSchemaFor } from "../shared/catalog.js";
import {
	DescribeInput,
	ExecuteInput,
	SearchInput,
	describeOperations,
	lookupError,
	searchOperations,
} from "./discovery.js";
import {
	type Operation,
	type OperationExtra,
	type OperationRegistry,
	operationAnnotations,
} from "./registry.js";

export const MAX_ERROR_SCHEMA_BYTES = 12_000;

function jsonResult(value: object, isError = false): CallToolResult {
	return {
		content: [{ type: "text", text: JSON.stringify(value) }],
		...(isError ? { isError: true } : {}),
	};
}

function validationError(op: Operation, error: z.ZodError): CallToolResult {
	// Messages/received values/custom refinement data and record keys can contain submitted
	// secrets. Return only stable issue codes and declared top-level field names.
	const issues = error.issues.slice(0, 10).map((issue) => ({
		code: issue.code,
		field:
			typeof issue.path[0] === "string" && Object.hasOwn(op.shape, issue.path[0])
				? issue.path[0]
				: "params",
	}));
	const schemaFits = Buffer.byteLength(JSON.stringify(op.inputSchema)) <= MAX_ERROR_SCHEMA_BYTES;
	return jsonResult(
		{
			error:
				"Invalid operation parameters. Correct these fields using the schema; scaleway_describe returns the full contract.",
			op: op.op,
			issues,
			...(schemaFits ? { inputSchema: op.inputSchema } : { schemaOmitted: true }),
		},
		true,
	);
}

export async function executeOperation(
	registry: OperationRegistry,
	input: z.input<typeof ExecuteInput>,
	extra: OperationExtra,
	readOnly: boolean,
): Promise<CallToolResult> {
	const { op: id, params = {} } = ExecuteInput.parse(input);
	const op = registry.get(id);
	if (!op) return jsonResult(lookupError(registry, id), true);
	if (readOnly && !op.readOnly) {
		return jsonResult(
			{
				error:
					"This operation is not read-only. Use scaleway_call if authorized; IAM and configured filters still apply.",
			},
			true,
		);
	}
	try {
		const parsed = await op.schema.safeParseAsync(params);
		if (!parsed.success) return validationError(op, parsed.error);
		return await op.callback(parsed.data, extra);
	} catch (error) {
		if (error instanceof z.ZodError) return validationError(op, error);
		// Raw exception text can contain credentials or request bodies. Existing structured
		// handler results are preserved above; unhandled exceptions are deliberately sanitized.
		return jsonResult(
			{
				error:
					"Operation failed. Check scaleway_describe for parameters, Scaleway IAM permissions and service availability before retrying.",
				op: op.op,
			},
			true,
		);
	}
}

/** Returns our projected definitions; installCatalogListing can combine these with flat ones. */
export function registerGatewayTools(server: McpServer, registry: OperationRegistry): Tool[] {
	const tools: Tool[] = [];
	function register<S extends z.ZodRawShape>(
		name: string,
		description: string,
		shape: S,
		readOnly: boolean,
		callback: ToolCallback<S>,
	) {
		const annotations = operationAnnotations(readOnly);
		server.registerTool(name, { description, inputSchema: shape, annotations }, callback);
		tools.push({ name, description, inputSchema: inputSchemaFor(shape), annotations });
	}
	register(
		"scaleway_search",
		"Find allowed Scaleway operations, e.g. query='list servers' or area='instances'. Omit both for area totals. Follow nextOffset to page; describe IDs before calling.",
		SearchInput.shape,
		true,
		(params) => {
			const result = searchOperations(registry, params);
			return jsonResult(result, "error" in result);
		},
	);
	register(
		"scaleway_describe",
		"Get exact input schemas and endpoints for 1–10 allowed operation IDs, e.g. ops=['instances_list_servers']. Use scaleway_search to discover IDs.",
		DescribeInput.shape,
		true,
		(params) => {
			const result = describeOperations(registry, params);
			return jsonResult(result, "error" in result);
		},
	);
	register(
		"scaleway_read",
		"Run a permitted read, e.g. op='instances_list_servers', params={zone:'fr-par-1'}. Describe first. May return sensitive data; IAM applies and approval is not automatic.",
		ExecuteInput.shape,
		true,
		(params, extra) => executeOperation(registry, params, extra, true),
	);
	register(
		"scaleway_call",
		"Run any allowed operation, including destructive writes, e.g. op='instances_create_server' with described params. IAM and configured filters apply; obtain authorization for changes.",
		ExecuteInput.shape,
		false,
		(params, extra) => executeOperation(registry, params, extra, false),
	);
	return tools;
}
