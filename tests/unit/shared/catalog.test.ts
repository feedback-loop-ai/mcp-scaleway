import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	inputSchemaFor,
	installCatalogListing,
	projectSchema,
} from "../../../src/shared/catalog.js";
import { connect, server } from "../gateway/fixtures.js";

describe("schema projection", () => {
	it("visits schema positions, never data or property names, and leaves input untouched", () => {
		const schema = {
			type: "object" as const,
			$schema: "draft",
			additionalProperties: { type: "string", format: "uuid" },
			properties: {
				description: { type: "string", description: "User field description" },
				format: { type: "string", format: "date-time" },
				default: {
					type: "object",
					default: { $schema: "data", description: "data", format: "data" },
				},
				additionalProperties: { type: "string" },
				properties: { type: "string" },
				page: { type: "integer", minimum: 1, default: 1, description: "Page number" },
				pageSize: { type: "integer", maximum: 100, description: "Items per page" },
				zone: { type: "string", description: "Availability zone", pattern: "^fr" },
				region: { type: "string", description: "Region (e.g. fr-par). Defaults to project region" },
				custom: { description: 42 },
			},
			required: ["description", "format"],
			definitions: { Model: { type: "object", properties: { value: { type: "string" } } } },
			$defs: { Shared: { $ref: "#/definitions/Model" } },
			dependentSchemas: { description: { properties: { x: { type: "boolean" } } } },
			dependencies: { format: ["description"], requiredObject: { type: "object" } },
			patternProperties: { ".*": { $ref: "#/definitions/Model" } },
			items: [{ type: "string" }, { type: "number" }],
			additionalItems: false,
			allOf: [{ type: "object" }],
			anyOf: [{ type: "string" }, { type: "null" }],
			oneOf: [{ const: "one" }, { const: "two" }],
			prefixItems: [{ type: "string" }],
			not: { type: "null" },
			if: { const: 1 },
			else: { const: 3 },
			propertyNames: { pattern: "x" },
			contains: { const: 1 },
			unevaluatedProperties: false,
			unevaluatedItems: false,
			contentSchema: { type: "string" },
			enum: [{ $schema: "value", properties: { description: "value" } }],
		};
		const before = structuredClone(schema);
		const projected = projectSchema(schema);
		const expected = structuredClone(schema) as Record<string, unknown>;
		Reflect.deleteProperty(expected, "$schema");
		const props = expected.properties as Record<string, Record<string, unknown>>;
		for (const key of ["page", "pageSize", "zone"])
			Reflect.deleteProperty(props[key], "description");
		expect(projected).toEqual(expected);
		expect(schema).toEqual(before);
	});
	it("retains record schemas, recursive refs, formats, unions, bounds, defaults and substantive descriptions", () => {
		const recursive: z.ZodType<unknown> = z.lazy(() => z.object({ children: z.array(recursive) }));
		const input = inputSchemaFor({
			id: z.string().uuid(),
			at: z.string().datetime(),
			env: z.record(
				z.string().min(1),
				z.object({ description: z.string(), format: z.enum(["json", "text"]) }),
			),
			page: z.number().int().min(1).max(20).default(2).describe("Page number (1-indexed)"),
			amount: z.number().positive().describe("Size in bytes; cannot shrink"),
			choice: z.union([z.string(), z.number()]),
			list: z.array(z.string()).min(1).max(4),
			optional: z.string().optional(),
			tree: recursive,
		});
		expect(input.required).toContain("env");
		expect(input.required).not.toContain("optional");
		expect(input.required).not.toContain("page");
		expect(input.properties?.id).toMatchObject({ format: "uuid" });
		expect(input.properties?.at).toMatchObject({ format: "date-time" });
		expect(input.properties?.env).toMatchObject({
			additionalProperties: {
				properties: { description: { type: "string" }, format: { enum: ["json", "text"] } },
			},
		});
		expect(input.properties?.page).toMatchObject({
			default: 2,
			minimum: 1,
			maximum: 20,
			description: "Page number (1-indexed)",
		});
		expect(input.properties?.amount).toMatchObject({ description: "Size in bytes; cannot shrink" });
		expect(JSON.stringify(input.properties?.tree)).toContain("$ref");
	});
	it("ignores malformed non-schema metadata without corrupting it", () => {
		const schema = {
			type: "object" as const,
			allOf: false,
			properties: undefined,
			items: true,
			$defs: null,
		};
		expect(projectSchema(schema)).toEqual(schema);
	});
	it("installs a listing from snapshots using public protocol handlers", async () => {
		const instance = server();
		instance.registerTool("example", { inputSchema: { name: z.string() } }, () => ({
			content: [],
		}));
		const definitions = [{ name: "example", inputSchema: inputSchemaFor({ name: z.string() }) }];
		installCatalogListing(instance, definitions);
		definitions[0].name = "mutated";
		const client = await connect(instance);
		try {
			expect((await client.listTools()).tools[0].name).toBe("example");
		} finally {
			await client.close();
			await instance.close();
		}
	});
});
