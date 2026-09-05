import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import pkg from "../package.json";
import { registerGatewayTools } from "./gateway/index.js";
import { createOperationRegistry, registerFlatTools } from "./gateway/registry.js";
import { installCatalogListing } from "./shared/catalog.js";
import { type ServerOptions, resolveServerOptions } from "./shared/mode.js";

export function createServer({ mode = "gateway", filters = {} }: ServerOptions = {}): McpServer {
	// Validate explicit callers as well as environment configuration.
	if (mode !== "gateway" && mode !== "flat" && mode !== "both") {
		throw new Error("Invalid SCW_MCP_MODE. Use gateway, flat or both.");
	}
	const registry = createOperationRegistry(filters);
	const areas = [...new Set(registry.operations.map((op) => op.area))].sort();
	const instructions = [
		`Scaleway: ${registry.operations.length} allowed operations across ${areas.length} areas. Mode: ${mode}.`,
		mode === "flat"
			? "Use the listed tools directly; only configured operations are registered."
			: "Use scaleway_search with product/resource/action keywords or area. Follow nextOffset for more results. Use scaleway_describe for exact input schemas, then scaleway_read or scaleway_call. Operation IDs omit the scaleway_ prefix of legacy tools.",
		"Filters apply to discovery and execution. Read may reveal sensitive data; approval is not automatic. Obtain authorization before changes. Scaleway IAM always applies.",
		"Region/zone/project defaults apply only where the operation schema allows omission. Check required fields and units with describe. Credentials come from SCW_* environment variables, not operation parameters.",
		`Enabled areas: ${areas.join(", ")}.`,
	].join("\n");
	const server = new McpServer({ name: "mcp-scaleway", version: pkg.version }, { instructions });
	const definitions: Tool[] = [];
	if (mode !== "flat") definitions.push(...registerGatewayTools(server, registry));
	if (mode !== "gateway") definitions.push(...registerFlatTools(server, registry));
	installCatalogListing(server, definitions);
	return server;
}

export async function startServer(): Promise<void> {
	const server = createServer(resolveServerOptions(process.env));
	const transport = new StdioServerTransport();
	await server.connect(transport);
}
