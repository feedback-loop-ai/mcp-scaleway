import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { createAppleSiliconHandlers } from "./handlers.js";
import {
	CreateServerParams,
	DeleteServerParams,
	GetServerParams,
	ListOSParams,
	ListServerTypesParams,
	ListServersParams,
	RebootServerParams,
	ReinstallServerParams,
} from "./types.js";

export function registerAppleSiliconTools(server: McpServer): void {
	const config = loadAuthConfig();
	const client = createScalewayClient(config);
	const handlers = createAppleSiliconHandlers(client, config.defaultZone);

	server.tool(
		"scaleway_apple_silicon_list_servers",
		"List all Apple Silicon servers in your Scaleway account. Supports pagination and filtering by project.",
		ListServersParams.shape,
		async (params) => handlers.listServers(ListServersParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_get_server",
		"Get details of a specific Apple Silicon server including status, IP, OS, and connection info.",
		GetServerParams.shape,
		async (params) => handlers.getServer(GetServerParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_create_server",
		"Create a new Apple Silicon server (Mac mini as-a-Service). Requires a server type. 24h minimum lease.",
		CreateServerParams.shape,
		async (params) => handlers.createServer(CreateServerParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_delete_server",
		"Delete an Apple Silicon server. Cannot delete before the 24h minimum allocation period.",
		DeleteServerParams.shape,
		async (params) => handlers.deleteServer(DeleteServerParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_reboot_server",
		"Reboot an Apple Silicon server.",
		RebootServerParams.shape,
		async (params) => handlers.rebootServer(RebootServerParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_reinstall_server",
		"Reinstall the OS on an Apple Silicon server. All data on disk will be erased.",
		ReinstallServerParams.shape,
		async (params) => handlers.reinstallServer(ReinstallServerParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_list_server_types",
		"List available Apple Silicon server types with CPU, memory, disk, and stock information.",
		ListServerTypesParams.shape,
		async (params) => handlers.listServerTypes(ListServerTypesParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_list_os",
		"List available macOS versions for Apple Silicon servers. Filter by server type or name.",
		ListOSParams.shape,
		async (params) => handlers.listOS(ListOSParams.parse(params)),
	);
}
