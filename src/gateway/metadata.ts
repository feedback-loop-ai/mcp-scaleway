import { z } from "zod";

const ApiSchema = z.string().regex(/^(GET|HEAD|POST|PUT|PATCH|DELETE|OPTIONS) (\/|https:\/\/)\S+/);
const ToolNameSchema = z.string().regex(/^scaleway_[a-z][a-z0-9_]+$/);
const AreaSchema = z.string().regex(/^[a-z][a-z0-9-]*$/);
const MatrixEntrySchema = z.object({ tool: ToolNameSchema, api: ApiSchema });

export const OperationMetadataSchema = MatrixEntrySchema.extend({
	area: AreaSchema,
	readOnly: z.boolean(),
}).strict();
export type OperationMetadata = z.infer<typeof OperationMetadataSchema>;

/** GET access may consume, disable or delete an ephemeral secret. Never route it through read. */
export const READ_ONLY_OVERRIDES: Readonly<Record<string, false>> = Object.freeze({
	scaleway_secret_manager_access_secret_version: false,
});

export function isReadOnly(tool: string, api: string): boolean {
	return (
		READ_ONLY_OVERRIDES[tool] !== false &&
		api.split(/\s+\+\s+/).every((part) => /^(GET|HEAD) (\/|https:\/\/)\S+/.test(part))
	);
}

/** Pure generation boundary. Runtime imports the generated JSON, not this matrix. */
export function deriveOperationMetadata(matrix: unknown): OperationMetadata[] {
	const areas = z.record(z.unknown()).parse(matrix);
	const records: OperationMetadata[] = [];
	const seen = new Set<string>();
	for (const [area, entries] of Object.entries(areas)) {
		if (area === "meta") continue;
		AreaSchema.parse(area);
		for (const entry of Object.values(z.record(MatrixEntrySchema).parse(entries))) {
			if (seen.has(entry.tool)) throw new Error(`Duplicate operation metadata: ${entry.tool}`);
			seen.add(entry.tool);
			records.push({ ...entry, area, readOnly: isReadOnly(entry.tool, entry.api) });
		}
	}
	return records.sort((a, b) => a.tool.localeCompare(b.tool));
}
