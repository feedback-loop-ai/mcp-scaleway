import { z } from "zod";
const UUID = "00000000-0000-4000-8000-000000000001";

export function sampleInput(schema: z.ZodTypeAny, field: string): unknown {
	const def = schema._def;
	if (schema instanceof z.ZodOptional) return undefined;
	if (schema instanceof z.ZodDefault) return def.defaultValue();
	if (schema instanceof z.ZodEffects) return sampleInput(def.schema, field);
	if (schema instanceof z.ZodNullable) return sampleInput(def.innerType, field);
	if (schema instanceof z.ZodObject) {
		return Object.fromEntries(
			Object.entries(schema.shape as z.ZodRawShape)
				.map(([name, child]) => [name, sampleInput(child, name)])
				.filter(([, value]) => value !== undefined),
		);
	}
	if (schema instanceof z.ZodArray) {
		return Array.from({ length: Math.max(1, def.minLength?.value ?? 0) }, () =>
			sampleInput(def.type, field),
		);
	}
	if (schema instanceof z.ZodUnion) {
		for (const option of def.options) {
			const value = sampleInput(option, field);
			if (option.safeParse(value).success) return value;
		}
		throw new Error(`No valid union example for ${field}`);
	}
	if (schema instanceof z.ZodEnum) return schema.options[0];
	if (schema instanceof z.ZodLiteral) return def.value;
	if (schema instanceof z.ZodBoolean) return false;
	if (schema instanceof z.ZodRecord || schema instanceof z.ZodAny || schema instanceof z.ZodUnknown)
		return {};
	if (schema instanceof z.ZodNumber) {
		const values = [1, 0, ...(def.checks as Array<{ value?: number }>).map((check) => check.value)];
		const valid = values.find((value) => schema.safeParse(value).success);
		if (valid !== undefined) return valid;
	}
	if (schema instanceof z.ZodString) {
		const values = [
			...(field === "region" ? ["fr-par"] : []),
			...(field === "zone" ? ["fr-par-1"] : []),
			...(field === "revision" ? ["1"] : []),
			...(field.toLowerCase().includes("email") ? ["example@example.com"] : []),
			...(field.toLowerCase().includes("domain") ? ["example.com"] : []),
			...(field.toLowerCase().includes("password") ? ["Example-only-password-42!"] : []),
			...(field.toLowerCase().includes("url") ? ["https://example.com"] : []),
			...(field.toLowerCase().includes("id") ? [UUID] : []),
			"example",
			UUID,
			"example@example.com",
			"https://example.com",
			"2026-01-01T00:00:00Z",
			"fr-par",
			"fr-par-1",
			"1",
			"1s",
			"FR",
			"x".repeat(Math.max(1, schema.minLength ?? 1)),
		];
		const valid = values.find((value) => schema.safeParse(value).success);
		if (valid !== undefined) return valid;
	}
	throw new Error(`No supported synthetic example for ${field}: ${def.typeName}`);
}
