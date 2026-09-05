import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ListToolsRequestSchema, type Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const SCHEMA_MAPS = new Set([
	"properties",
	"patternProperties",
	"definitions",
	"$defs",
	"dependentSchemas",
	"dependencies",
]);
const SCHEMA_CHILDREN = new Set([
	"items",
	"additionalItems",
	"additionalProperties",
	"contains",
	"propertyNames",
	"not",
	"if",
	"then",
	"else",
	"unevaluatedProperties",
	"unevaluatedItems",
	"contentSchema",
]);
const SCHEMA_ARRAYS = new Set(["allOf", "anyOf", "oneOf", "prefixItems"]);
const REDUNDANT_DESCRIPTIONS: Readonly<Record<string, readonly string[]>> = {
	page: ["Page number"],
	pageSize: ["Items per page"],
	page_size: ["Items per page"],
	region: ["Region", "Scaleway region"],
	zone: ["Zone", "Availability zone"],
};

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function walkSchema(node: unknown, property = ""): unknown {
	if (!isObject(node)) return node;
	return Object.fromEntries(
		Object.entries(node).flatMap(([key, value]) => {
			if (key === "$schema") return [];
			if (
				key === "description" &&
				typeof value === "string" &&
				Object.hasOwn(REDUNDANT_DESCRIPTIONS, property) &&
				REDUNDANT_DESCRIPTIONS[property].includes(value)
			)
				return [];
			if (SCHEMA_MAPS.has(key) && isObject(value)) {
				return [
					[
						key,
						Object.fromEntries(
							Object.entries(value).map(([name, child]) => [
								name,
								walkSchema(child, key === "properties" ? name : ""),
							]),
						),
					],
				];
			}
			if (SCHEMA_CHILDREN.has(key)) {
				return [
					[key, Array.isArray(value) ? value.map((child) => walkSchema(child)) : walkSchema(value)],
				];
			}
			if (SCHEMA_ARRAYS.has(key) && Array.isArray(value)) {
				return [[key, value.map((child) => walkSchema(child))]];
			}
			return [[key, value]];
		}),
	);
}

/** Only schema positions are visited; defaults, enums and user field names are data. */
export function projectSchema(schema: Tool["inputSchema"]): Tool["inputSchema"] {
	return walkSchema(structuredClone(schema)) as Tool["inputSchema"];
}

export function inputSchemaFor(shape: z.ZodRawShape): Tool["inputSchema"] {
	return projectSchema(
		zodToJsonSchema(z.object(shape), {
			target: "jsonSchema7",
			strictUnions: true,
			pipeStrategy: "input",
			$refStrategy: "root",
		}) as Tool["inputSchema"],
	);
}

/** Call after all registrations. Uses our definitions; never reads SDK internals. */
export function installCatalogListing(server: McpServer, definitions: readonly Tool[]): void {
	const tools = definitions.map((tool) => ({
		...structuredClone(tool),
		inputSchema: projectSchema(tool.inputSchema),
	}));
	server.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
}
