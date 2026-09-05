import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import pkg from "../package.json";
import { registerAllTools } from "./tools/index.js";

export function createServer(): McpServer {
	const server = new McpServer({
		name: "mcp-scaleway",
		version: pkg.version,
	});

	registerAllTools(server);

	return server;
}

export async function startServer(): Promise<void> {
	const server = createServer();
	const transport = new StdioServerTransport();
	await server.connect(transport);
}
