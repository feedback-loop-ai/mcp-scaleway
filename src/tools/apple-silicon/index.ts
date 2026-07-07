import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { createAppleSiliconHandlers } from "./handlers.js";
import {
	AddServerPrivateNetworkParams,
	CreateServerParams,
	DeleteServerParams,
	DeleteServerPrivateNetworkParams,
	GetServerParams,
	GetServerPrivateNetworkParams,
	ListOSParams,
	ListServerPrivateNetworksParams,
	ListServerTypesParams,
	ListServersParams,
	RebootServerParams,
	ReinstallServerParams,
	SetServerPrivateNetworksParams,
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

	server.tool(
		"scaleway_apple_silicon_list_server_private_networks",
		"List Private Network attachments for Apple Silicon servers. Filter by server, Private Network, organization, or project.",
		ListServerPrivateNetworksParams.shape,
		async (params) =>
			handlers.listServerPrivateNetworks(ListServerPrivateNetworksParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_get_server_private_network",
		"Get a single Private Network attachment for an Apple Silicon server, including VLAN and IPAM IP details.",
		GetServerPrivateNetworkParams.shape,
		async (params) => handlers.getServerPrivateNetwork(GetServerPrivateNetworkParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_add_server_private_network",
		"Attach an Apple Silicon server to a Private Network. Optionally provide IPAM IP IDs to assign.",
		AddServerPrivateNetworkParams.shape,
		async (params) => handlers.addServerPrivateNetwork(AddServerPrivateNetworkParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_set_server_private_networks",
		"Set the complete list of Private Networks on an Apple Silicon server, replacing any existing attachments.",
		SetServerPrivateNetworksParams.shape,
		async (params) =>
			handlers.setServerPrivateNetworks(SetServerPrivateNetworksParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_delete_server_private_network",
		"Detach an Apple Silicon server from a Private Network.",
		DeleteServerPrivateNetworkParams.shape,
		async (params) =>
			handlers.deleteServerPrivateNetwork(DeleteServerPrivateNetworkParams.parse(params)),
	);
}
