import { z } from "zod";
import { type RouterOptions, RoutingPolicy, createJevProvider } from "../routing/index.js";
import { type ToolsetConfig, resolveToolFilters } from "./toolsets.js";

export const ModeSchema = z.enum(["gateway", "flat", "both"]);
export type ServerMode = z.infer<typeof ModeSchema>;
const NumericEnvironmentValue = z.string().trim().min(1).transform(Number).optional();
export interface ServerOptions {
	mode?: ServerMode;
	filters?: ToolsetConfig;
	router?: RouterOptions;
}

/** Explicit environment boundary, called only by startServer. */
export function resolveServerOptions(env: Record<string, string | undefined>): ServerOptions {
	const router = z.enum(["off", "jev"]).parse(env.SCW_ROUTER ?? "off");
	return {
		mode: ModeSchema.parse(env.SCW_MCP_MODE ?? "gateway"),
		filters: resolveToolFilters(env),
		...(router === "jev"
			? {
					router: {
						...(env.TYPESAFE_API_KEY?.trim()
							? {
									provider: createJevProvider({
										apiKey: env.TYPESAFE_API_KEY.trim(),
										model: env.SCW_ROUTER_MODEL,
									}),
								}
							: {}),
						...RoutingPolicy.parse({
							minConfidence: NumericEnvironmentValue.parse(env.SCW_ROUTER_MIN_CONFIDENCE),
							minProbability: NumericEnvironmentValue.parse(env.SCW_ROUTER_MIN_PROBABILITY),
							timeoutMs: NumericEnvironmentValue.parse(env.SCW_ROUTER_TIMEOUT_MS),
						}),
					},
				}
			: {}),
	};
}
