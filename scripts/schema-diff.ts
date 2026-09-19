import { parse } from "yaml";

export type SchemaValue = null | boolean | number | string | SchemaValue[] | SchemaObject;
export interface SchemaObject {
	[key: string]: SchemaValue;
}

export interface SemanticDiff {
	addedEndpoints: string[];
	removedEndpoints: string[];
	changedFields: Array<{ path: string; before?: SchemaValue; after?: SchemaValue }>;
}

const METHODS = new Set(["get", "head", "post", "put", "patch", "delete", "options", "trace"]);
const PROSE = new Set(["description", "summary", "externalDocs", "example", "examples"]);
const LITERALS = new Set(["default", "enum", "const"]);
const DICTIONARIES = new Set([
	"paths",
	"properties",
	"schemas",
	"definitions",
	"parameters",
	"responses",
	"content",
	"headers",
	"securitySchemes",
	"requestBodies",
]);

function isObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalize(value: unknown, dictionary = false, literal = false): SchemaValue {
	if (Array.isArray(value)) return value.map((child) => normalize(child, false, literal));
	if (isObject(value)) {
		return Object.fromEntries(
			Object.entries(value)
				.filter(([key]) => literal || dictionary || (!PROSE.has(key) && !key.startsWith("x-")))
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([key, child]) => [
					key,
					normalize(
						child,
						!dictionary && DICTIONARIES.has(key),
						literal || (!dictionary && LITERALS.has(key)),
					),
				]),
		);
	}
	if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
		return value as null | boolean | number | string;
	}
	throw new Error("Unsupported value in OpenAPI schema");
}

/** Retain endpoint and field contracts, including refs, required, enum and constraints. */
export function semanticSchema(source: string): SchemaObject {
	const document: unknown = parse(source, { maxAliasCount: 100 });
	if (
		!isObject(document) ||
		!(typeof document.openapi === "string" || document.swagger === "2.0") ||
		!isObject(document.paths)
	) {
		throw new Error("Response is not an OpenAPI document with paths");
	}
	return normalize(
		Object.fromEntries(
			[
				"paths",
				"components",
				"definitions",
				"parameters",
				"responses",
				"security",
				"servers",
				"host",
				"basePath",
				"schemes",
			]
				.filter((key) => document[key] !== undefined)
				.map((key) => [key, document[key]]),
		),
	) as SchemaObject;
}

function endpoints(schema: SchemaObject): string[] {
	return Object.entries(schema.paths as SchemaObject)
		.flatMap(([path, methods]) =>
			Object.keys(methods as SchemaObject)
				.filter((method) => METHODS.has(method))
				.map((method) => `${method.toUpperCase()} ${path}`),
		)
		.sort();
}

const pointer = (value: string) => value.replaceAll("~", "~0").replaceAll("/", "~1");

/** JSON-pointer changes identify fields and constraints; this is not a compatibility verdict. */
export function diffSchemas(before: SchemaObject, after: SchemaObject): SemanticDiff {
	const oldEndpoints = new Set(endpoints(before));
	const newEndpoints = new Set(endpoints(after));
	const changedFields: SemanticDiff["changedFields"] = [];
	function compare(old: SchemaValue | undefined, current: SchemaValue | undefined, path: string) {
		if (JSON.stringify(old) === JSON.stringify(current)) return;
		if (isObject(old) && isObject(current)) {
			for (const key of [...new Set([...Object.keys(old), ...Object.keys(current)])].sort()) {
				compare(old[key] as SchemaValue, current[key] as SchemaValue, `${path}/${pointer(key)}`);
			}
		} else {
			changedFields.push({
				path,
				...(old !== undefined && { before: old }),
				...(current !== undefined && { after: current }),
			});
		}
	}
	compare(before, after, "");
	return {
		addedEndpoints: [...newEndpoints].filter((endpoint) => !oldEndpoints.has(endpoint)),
		removedEndpoints: [...oldEndpoints].filter((endpoint) => !newEndpoints.has(endpoint)),
		changedFields,
	};
}
