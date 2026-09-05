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

/**
 * Resolve credentials and build the handler set lazily, at tool-call time.
 * Registration must never require SCW_* environment variables so that
 * registerAllTools() (and the parity gate) can run without credentials.
 */
export function getHandlers(): ReturnType<typeof createAppleSiliconHandlers> {
	const config = loadAuthConfig();
	const client = createScalewayClient(config);
	return createAppleSiliconHandlers(client, config.defaultZone);
}

export function registerAppleSiliconTools(server: McpServer): void {
	server.tool(
		"scaleway_apple_silicon_list_servers",
		"List all Apple Silicon servers in your Scaleway account. Supports pagination and filtering by project.",
		ListServersParams.shape,
		async (params) => getHandlers().listServers(ListServersParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_get_server",
		"Get details of a specific Apple Silicon server including status, IP, OS, and connection info.",
		GetServerParams.shape,
		async (params) => getHandlers().getServer(GetServerParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_create_server",
		"Create a new Apple Silicon server (Mac mini as-a-Service). Requires a server type. 24h minimum lease.",
		CreateServerParams.shape,
		async (params) => getHandlers().createServer(CreateServerParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_delete_server",
		"Delete an Apple Silicon server. Cannot delete before the 24h minimum allocation period.",
		DeleteServerParams.shape,
		async (params) => getHandlers().deleteServer(DeleteServerParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_reboot_server",
		"Reboot an Apple Silicon server.",
		RebootServerParams.shape,
		async (params) => getHandlers().rebootServer(RebootServerParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_reinstall_server",
		"Reinstall the OS on an Apple Silicon server. All data on disk will be erased.",
		ReinstallServerParams.shape,
		async (params) => getHandlers().reinstallServer(ReinstallServerParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_list_server_types",
		"List available Apple Silicon server types with CPU, memory, disk, and stock information.",
		ListServerTypesParams.shape,
		async (params) => getHandlers().listServerTypes(ListServerTypesParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_list_os",
		"List available macOS versions for Apple Silicon servers. Filter by server type or name.",
		ListOSParams.shape,
		async (params) => getHandlers().listOS(ListOSParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_list_server_private_networks",
		"List Private Network attachments for Apple Silicon servers. Filter by server, Private Network, organization, or project.",
		ListServerPrivateNetworksParams.shape,
		async (params) =>
			getHandlers().listServerPrivateNetworks(ListServerPrivateNetworksParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_get_server_private_network",
		"Get a single Private Network attachment for an Apple Silicon server, including VLAN and IPAM IP details.",
		GetServerPrivateNetworkParams.shape,
		async (params) =>
			getHandlers().getServerPrivateNetwork(GetServerPrivateNetworkParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_add_server_private_network",
		"Attach an Apple Silicon server to a Private Network. Optionally provide IPAM IP IDs to assign.",
		AddServerPrivateNetworkParams.shape,
		async (params) =>
			getHandlers().addServerPrivateNetwork(AddServerPrivateNetworkParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_set_server_private_networks",
		"Set the complete list of Private Networks on an Apple Silicon server, replacing any existing attachments.",
		SetServerPrivateNetworksParams.shape,
		async (params) =>
			getHandlers().setServerPrivateNetworks(SetServerPrivateNetworksParams.parse(params)),
	);

	server.tool(
		"scaleway_apple_silicon_delete_server_private_network",
		"Detach an Apple Silicon server from a Private Network.",
		DeleteServerPrivateNetworkParams.shape,
		async (params) =>
			getHandlers().deleteServerPrivateNetwork(DeleteServerPrivateNetworkParams.parse(params)),
	);
}
