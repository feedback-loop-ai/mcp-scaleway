import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleAddServerPrivateNetwork,
	handleCreateIp,
	handleCreateServer,
	handleDeleteIp,
	handleDeleteServer,
	handleDeleteServerPrivateNetwork,
	handleGetBmcAccess,
	handleGetServer,
	handleInstallServer,
	handleListIps,
	handleListOffers,
	handleListOss,
	handleListServerPrivateNetworks,
	handleListServers,
	handleRebootServer,
	handleSetServerPrivateNetworks,
	handleStartServer,
	handleStopServer,
} from "./handlers.js";
import {
	AddServerPrivateNetworkInput,
	CreateIpInput,
	CreateServerInput,
	DeleteIpInput,
	DeleteServerInput,
	DeleteServerPrivateNetworkInput,
	GetBmcAccessInput,
	GetServerInput,
	InstallServerInput,
	ListIpsInput,
	ListOffersInput,
	ListOssInput,
	ListServerPrivateNetworksInput,
	ListServersInput,
	RebootServerInput,
	SetServerPrivateNetworksInput,
	StartServerInput,
	StopServerInput,
} from "./types.js";

export function registerElasticMetalTools(server: McpServer): void {
	server.tool(
		"scaleway_elastic_metal_list_servers",
		"List Elastic Metal servers in a zone with optional filters and pagination",
		ListServersInput.shape,
		handleListServers,
	);

	server.tool(
		"scaleway_elastic_metal_get_server",
		"Get detailed information about a specific Elastic Metal server",
		GetServerInput.shape,
		handleGetServer,
	);

	server.tool(
		"scaleway_elastic_metal_create_server",
		"Create a new Elastic Metal dedicated server",
		CreateServerInput.shape,
		handleCreateServer,
	);

	server.tool(
		"scaleway_elastic_metal_delete_server",
		"Delete an Elastic Metal server",
		DeleteServerInput.shape,
		handleDeleteServer,
	);

	server.tool(
		"scaleway_elastic_metal_install_server",
		"Install an operating system on an Elastic Metal server",
		InstallServerInput.shape,
		handleInstallServer,
	);

	server.tool(
		"scaleway_elastic_metal_reboot_server",
		"Reboot an Elastic Metal server",
		RebootServerInput.shape,
		handleRebootServer,
	);

	server.tool(
		"scaleway_elastic_metal_start_server",
		"Start a stopped Elastic Metal server",
		StartServerInput.shape,
		handleStartServer,
	);

	server.tool(
		"scaleway_elastic_metal_stop_server",
		"Stop a running Elastic Metal server",
		StopServerInput.shape,
		handleStopServer,
	);

	server.tool(
		"scaleway_elastic_metal_list_offers",
		"List available Elastic Metal server offers in a zone",
		ListOffersInput.shape,
		handleListOffers,
	);

	server.tool(
		"scaleway_elastic_metal_list_oss",
		"List available operating systems for Elastic Metal servers",
		ListOssInput.shape,
		handleListOss,
	);

	server.tool(
		"scaleway_elastic_metal_get_bmc_access",
		"Get BMC (Baseboard Management Controller) access credentials for a server. Access is time-limited.",
		GetBmcAccessInput.shape,
		handleGetBmcAccess,
	);

	server.tool(
		"scaleway_elastic_metal_list_ips",
		"List flexible IPs for Elastic Metal servers in a zone",
		ListIpsInput.shape,
		handleListIps,
	);

	server.tool(
		"scaleway_elastic_metal_create_ip",
		"Create a new flexible IP for Elastic Metal servers",
		CreateIpInput.shape,
		handleCreateIp,
	);

	server.tool(
		"scaleway_elastic_metal_delete_ip",
		"Delete a flexible IP",
		DeleteIpInput.shape,
		handleDeleteIp,
	);

	server.tool(
		"scaleway_elastic_metal_list_server_private_networks",
		"List Private Network attachments for Elastic Metal servers in a zone, with optional filters and pagination",
		ListServerPrivateNetworksInput.shape,
		handleListServerPrivateNetworks,
	);

	server.tool(
		"scaleway_elastic_metal_add_server_private_network",
		"Attach an Elastic Metal server to a Private Network (max 8 per server)",
		AddServerPrivateNetworkInput.shape,
		handleAddServerPrivateNetwork,
	);

	server.tool(
		"scaleway_elastic_metal_set_server_private_networks",
		"Set the complete list of Private Networks attached to an Elastic Metal server, replacing existing attachments",
		SetServerPrivateNetworksInput.shape,
		handleSetServerPrivateNetworks,
	);

	server.tool(
		"scaleway_elastic_metal_delete_server_private_network",
		"Detach an Elastic Metal server from a Private Network",
		DeleteServerPrivateNetworkInput.shape,
		handleDeleteServerPrivateNetwork,
	);
}
