import { z } from "zod";
import type { OperationMetadata } from "../gateway/metadata.js";

// Exact, versioned membership; these are convenience selections, not permission grants.
export const TOOLSET_PRESETS = Object.freeze({
	core: Object.freeze([
		"instances",
		"elastic-metal",
		"apple-silicon",
		"k8s",
		"registry",
		"functions",
		"containers",
		"jobs",
		"block-storage",
		"object-storage",
		"vpc",
		"dns",
		"iam",
		"marketplace",
	]),
	compute: Object.freeze(["instances", "elastic-metal", "apple-silicon", "autoscaling", "dedibox"]),
	storage: Object.freeze(["block-storage", "object-storage", "file-storage"]),
	networking: Object.freeze([
		"vpc",
		"lb",
		"public-gateway",
		"dns",
		"domain-registrar",
		"ipam",
		"edge-services",
		"vpn",
		"interlink",
	]),
	security: Object.freeze(["iam", "secret-manager", "key-manager"]),
	serverless: Object.freeze([
		"k8s",
		"registry",
		"functions",
		"containers",
		"jobs",
		"serverless-sqldb",
	]),
	data: Object.freeze([
		"rdb",
		"redis",
		"mongodb",
		"kafka",
		"data-warehouse",
		"data-lab",
		"opensearch",
	]),
	ai: Object.freeze(["inference", "generative-apis"]),
	messaging: Object.freeze(["nats", "sqs", "sns", "rabbitmq", "tem", "iot"]),
	observability: Object.freeze(["cockpit", "audit-trail", "environmental-footprint"]),
	business: Object.freeze([
		"account",
		"billing",
		"marketplace",
		"product-catalog",
		"webhosting",
		"mailbox",
	]),
});

const SelectionSchema = z.array(z.string().trim().min(1)).nonempty();
export const ToolsetConfigSchema = z
	.object({
		toolsets: SelectionSchema.optional(),
		tools: SelectionSchema.optional(),
		excludeTools: SelectionSchema.optional(),
		readOnly: z.boolean().optional(),
	})
	.strict();
export type ToolsetConfig = z.infer<typeof ToolsetConfigSchema>;

const CsvSchema = z
	.string()
	.transform((s) => s.split(","))
	.pipe(SelectionSchema)
	.optional();
const EnvironmentSchema = z.object({
	SCW_TOOLSETS: CsvSchema,
	SCW_TOOLS: CsvSchema,
	SCW_EXCLUDE_TOOLS: CsvSchema,
	SCW_READ_ONLY: z.enum(["true", "1", "false", "0"]).optional(),
});

/** Explicit input only: the caller decides whether to pass process.env. Never mutates it. */
export function resolveToolFilters(env: Record<string, string | undefined>): ToolsetConfig {
	const parsed = EnvironmentSchema.parse(env);
	return ToolsetConfigSchema.parse({
		toolsets: parsed.SCW_TOOLSETS,
		tools: parsed.SCW_TOOLS,
		excludeTools: parsed.SCW_EXCLUDE_TOOLS,
		readOnly: parsed.SCW_READ_ONLY === "true" || parsed.SCW_READ_ONLY === "1",
	});
}

export function operationId(tool: string): string {
	return tool.replace(/^scaleway_/, "");
}

/** An immutable membership predicate shared by listing, discovery and execution. */
export function createToolFilter(config: ToolsetConfig, metadata: readonly OperationMetadata[]) {
	const parsed = ToolsetConfigSchema.parse(config);
	const areas = new Set(metadata.map((record) => record.area));
	const includedAreas = new Set<string>();
	for (const selection of parsed.toolsets ?? ["all"]) {
		if (selection === "all") {
			for (const area of areas) includedAreas.add(area);
		} else if (Object.hasOwn(TOOLSET_PRESETS, selection)) {
			for (const area of TOOLSET_PRESETS[selection as keyof typeof TOOLSET_PRESETS]) {
				includedAreas.add(area);
			}
		} else if (areas.has(selection)) {
			includedAreas.add(selection);
		} else {
			throw new Error(
				`Unknown toolset "${selection}". Use all, core, a family preset or a supported area slug.`,
			);
		}
	}
	const explicit = new Set<string>();
	for (const name of parsed.tools ?? []) {
		const match = metadata.find((r) => r.tool === name || operationId(r.tool) === name);
		if (!match)
			throw new Error(
				`Unknown SCW_TOOLS entry "${name}". Use an exact supported tool name or operation ID.`,
			);
		explicit.add(match.tool);
	}
	const excluded = new Set<string>();
	for (const pattern of parsed.excludeTools ?? []) {
		const regex = new RegExp(
			`^${pattern
				.split("*")
				.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
				.join(".*")}$`,
		);
		const matches = metadata.filter((r) => regex.test(r.tool) || regex.test(operationId(r.tool)));
		if (matches.length === 0)
			throw new Error(
				`Unknown SCW_EXCLUDE_TOOLS pattern "${pattern}": no supported operations match. Use * for a glob.`,
			);
		for (const match of matches) excluded.add(match.tool);
	}
	const allowed = new Set(
		metadata
			.filter(
				(r) =>
					(includedAreas.has(r.area) || explicit.has(r.tool)) &&
					!excluded.has(r.tool) &&
					(!parsed.readOnly || r.readOnly),
			)
			.map((r) => r.tool),
	);
	if (allowed.size === 0)
		throw new Error(
			"Tool filters select no operations. Check toolsets, exclusions and read-only settings.",
		);
	return (tool: string): boolean => allowed.has(tool);
}
