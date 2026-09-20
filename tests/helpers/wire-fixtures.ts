/** Synthetic wire values derived exclusively from recorded public contracts, never handlers. */
import catalogJson from "../../src/shared/response-contracts.json";
import { responseSchema } from "../../src/shared/response-validation.js";

export type Schema = boolean | Record<string, unknown>;
export interface WireOperation {
	parameters?: Array<{ in: string; name: string; required?: boolean; schema: Schema }>;
	requestBody?: { required?: boolean; content: Record<string, { schema: Schema }> };
	responses: Record<string, { content?: Record<string, { schema: Schema }> }>;
}
export interface WireDocument {
	components?: Record<string, unknown>;
	paths: Record<string, Record<string, WireOperation>>;
}
export const wireCatalog = catalogJson as unknown as {
	documents: Record<string, WireDocument>;
	sources: Record<string, { url: string; sha256: string; kind: string }>;
	routes: Record<
		string,
		Array<{
			method: string;
			path: string;
			host: string;
			query?: string;
			area: string;
			sourcePath: string;
		}>
	>;
};

export function resolveSchema(document: string, schema: Schema): Schema {
	if (typeof schema === "boolean" || typeof schema.$ref !== "string") return schema;
	let target: unknown = wireCatalog.documents[document];
	for (const part of schema.$ref.replace(/^#\//, "").split("/"))
		target = (target as Record<string, unknown>)[part.replace(/~1/g, "/").replace(/~0/g, "~")];
	if (!target) throw new Error(`Unresolved source reference in ${document}: ${schema.$ref}`);
	return {
		...(target as Record<string, unknown>),
		...Object.fromEntries(Object.entries(schema).filter(([key]) => key !== "$ref")),
	};
}

export function wireValue(document: string, raw: Schema, depth = 0): unknown {
	const schema = resolveSchema(document, raw);
	if (schema === true) return {};
	if (schema === false) throw new Error("Cannot synthesize false schema");
	if ("const" in schema) return schema.const;
	if (Array.isArray(schema.enum)) return schema.enum[0];
	for (const union of ["oneOf", "anyOf"]) {
		if (Array.isArray(schema[union])) {
			const choices = schema[union] as Schema[];
			for (const option of choices) {
				try {
					const value = wireValue(
						document,
						{ ...schema, [union]: undefined, ...(typeof option === "boolean" ? {} : option) },
						depth + 1,
					);
					if (responseSchema(document, schema).safeParse(value).success) return value;
				} catch {
					/* Try the next documented variant. */
				}
			}
			throw new Error(`Cannot synthesize ${union} in ${document}`);
		}
	}
	if (Array.isArray(schema.allOf)) {
		return Object.assign(
			{},
			...schema.allOf.map((part) => wireValue(document, part as Schema, depth + 1)),
		);
	}
	const types = Array.isArray(schema.type) ? schema.type : [schema.type];
	const type =
		types.find((t) => t !== "null") ??
		(schema.properties ? "object" : schema.items ? "array" : types[0]);
	if (schema.nullable === true && depth > 5) return null;
	switch (type) {
		case "null":
			return null;
		case "boolean":
			return false;
		case "integer":
		case "number":
			return Math.max(
				typeof schema.minimum === "number" ? schema.minimum : 0,
				typeof schema.exclusiveMinimum === "number" ? schema.exclusiveMinimum + 1 : 0,
			);
		case "string": {
			if (schema.format === "date-time") return "2026-01-01T00:00:00Z";
			if (schema.format === "binary") return "example";
			return "example"
				.padEnd(typeof schema.minLength === "number" ? schema.minLength : 0, "x")
				.slice(0, typeof schema.maxLength === "number" ? schema.maxLength : undefined);
		}
		case "array":
			return Array.from({ length: typeof schema.minItems === "number" ? schema.minItems : 0 }, () =>
				wireValue(document, schema.items as Schema, depth + 1),
			);
		case "object": {
			const out: Record<string, unknown> = {};
			const required = Array.isArray(schema.required) ? schema.required : [];
			for (const [key, value] of Object.entries(
				(schema.properties ?? {}) as Record<string, Schema>,
			)) {
				if (depth > 6 && !required.includes(key)) continue;
				out[key] = wireValue(document, value, depth + 1);
			}
			return out;
		}
		default:
			return {};
	}
}

export function successFixture(
	document: string,
	operation: WireOperation,
): { status: number; body: string | null; headers: Record<string, string>; schema?: Schema } {
	const entry = Object.entries(operation.responses).find(([status]) => status.startsWith("2"));
	if (!entry) throw new Error(`No success response in ${document}`);
	const [status, response] = entry;
	const content = Object.entries(response.content ?? {})[0];
	if (!content) return { status: status === "2XX" ? 200 : Number(status), body: null, headers: {} };
	const [media, { schema }] = content;
	const value = wireValue(document, schema);
	const result = responseSchema(document, schema).safeParse(value);
	if (!result.success) throw new Error(`Invalid synthetic source fixture: ${document}`);
	return {
		status: status === "2XX" ? 200 : Number(status),
		body: media === "application/json" ? JSON.stringify(value) : String(value),
		headers: { "content-type": media },
		schema,
	};
}
