import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCancelServerInstall,
	handleDeleteServer,
	handleGetBmcAccess,
	handleGetOS,
	handleGetOffer,
	handleGetServer,
	handleGetServerInstall,
	handleInstallServer,
	handleListOS,
	handleListOffers,
	handleListServers,
	handleRebootServer,
	handleStartBmcAccess,
	handleStartServer,
	handleStopBmcAccess,
	handleStopServer,
	handleUpdateServer,
} from "./handlers.js";
import {
	CancelServerInstallParams,
	DeleteServerParams,
	GetBmcAccessParams,
	GetOSParams,
	GetOfferParams,
	GetServerInstallParams,
	GetServerParams,
	InstallServerParams,
	ListOSParams,
	ListOffersParams,
	ListServersParams,
	RebootServerParams,
	StartBmcAccessParams,
	StartServerParams,
	StopBmcAccessParams,
	StopServerParams,
	UpdateServerParams,
} from "./types.js";

export function registerDediboxTools(server: McpServer): void {
	server.tool(
		"scaleway_dedibox_list_servers",
		"List Dedibox dedicated servers in a zone, with optional filtering by project or hostname",
		ListServersParams.shape,
		async (params) => handleListServers(ListServersParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_get_server",
		"Get details of a specific Dedibox server by its numeric ID",
		GetServerParams.shape,
		async (params) => handleGetServer(GetServerParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_update_server",
		"Update a Dedibox server (hostname, enable/disable IPv6)",
		UpdateServerParams.shape,
		async (params) => handleUpdateServer(UpdateServerParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_reboot_server",
		"Reboot a Dedibox server",
		RebootServerParams.shape,
		async (params) => handleRebootServer(RebootServerParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_start_server",
		"Start a Dedibox server",
		StartServerParams.shape,
		async (params) => handleStartServer(StartServerParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_stop_server",
		"Stop a Dedibox server",
		StopServerParams.shape,
		async (params) => handleStopServer(StopServerParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_delete_server",
		"Delete (terminate) a Dedibox server by its numeric ID",
		DeleteServerParams.shape,
		async (params) => handleDeleteServer(DeleteServerParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_install_server",
		"Install an operating system on a Dedibox server",
		InstallServerParams.shape,
		async (params) => handleInstallServer(InstallServerParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_get_server_install",
		"Get the current installation status of a Dedibox server",
		GetServerInstallParams.shape,
		async (params) => handleGetServerInstall(GetServerInstallParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_cancel_server_install",
		"Cancel an ongoing Dedibox server installation",
		CancelServerInstallParams.shape,
		async (params) => handleCancelServerInstall(CancelServerInstallParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_list_offers",
		"List available Dedibox offers in a zone",
		ListOffersParams.shape,
		async (params) => handleListOffers(ListOffersParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_get_offer",
		"Get details of a specific Dedibox offer by its numeric ID",
		GetOfferParams.shape,
		async (params) => handleGetOffer(GetOfferParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_list_os",
		"List operating systems available for Dedibox servers in a zone",
		ListOSParams.shape,
		async (params) => handleListOS(ListOSParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_get_os",
		"Get details of a specific Dedibox operating system by its numeric ID",
		GetOSParams.shape,
		async (params) => handleGetOS(GetOSParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_get_bmc_access",
		"Get BMC (Baseboard Management Controller) console access details for a Dedibox server",
		GetBmcAccessParams.shape,
		async (params) => handleGetBmcAccess(GetBmcAccessParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_start_bmc_access",
		"Start BMC (Baseboard Management Controller) console access for a Dedibox server",
		StartBmcAccessParams.shape,
		async (params) => handleStartBmcAccess(StartBmcAccessParams.parse(params)),
	);

	server.tool(
		"scaleway_dedibox_stop_bmc_access",
		"Stop BMC (Baseboard Management Controller) console access for a Dedibox server",
		StopBmcAccessParams.shape,
		async (params) => handleStopBmcAccess(StopBmcAccessParams.parse(params)),
	);
}
