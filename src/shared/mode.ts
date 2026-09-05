import { z } from "zod";
import { type ToolsetConfig, resolveToolFilters } from "./toolsets.js";

export const ModeSchema = z.enum(["gateway", "flat", "both"]);
export type ServerMode = z.infer<typeof ModeSchema>;
export interface ServerOptions {
	mode?: ServerMode;
	filters?: ToolsetConfig;
}

/** Explicit environment boundary, called only by startServer. */
export function resolveServerOptions(env: Record<string, string | undefined>): ServerOptions {
	return {
		mode: ModeSchema.parse(env.SCW_MCP_MODE ?? "gateway"),
		filters: resolveToolFilters(env),
	};
}
