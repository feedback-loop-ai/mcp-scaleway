import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateHosting,
	handleDeleteHosting,
	handleGetDnsRecords,
	handleGetHosting,
	handleListControlPanels,
	handleListHostings,
	handleListOffers,
	handleRestoreHosting,
	handleUpdateHosting,
} from "./handlers.js";
import {
	CreateHostingInput,
	DeleteHostingInput,
	GetDnsRecordsInput,
	GetHostingInput,
	ListControlPanelsInput,
	ListHostingsInput,
	ListOffersInput,
	RestoreHostingInput,
	UpdateHostingInput,
} from "./types.js";

export function registerWebhostingTools(server: McpServer): void {
	server.tool(
		"scaleway_webhosting_list_hostings",
		"List web hostings with optional filters (region, project, domain, status, tags). Returns paginated results.",
		ListHostingsInput.shape,
		async (params) => handleListHostings(ListHostingsInput.parse(params)),
	);

	server.tool(
		"scaleway_webhosting_get_hosting",
		"Get details of a specific web hosting by ID, including status, domain, DNS status, and cPanel URLs.",
		GetHostingInput.shape,
		async (params) => handleGetHosting(GetHostingInput.parse(params)),
	);

	server.tool(
		"scaleway_webhosting_create_hosting",
		"Create a new web hosting with a domain and offer. Optionally configure DNS, tags, and options.",
		CreateHostingInput.shape,
		async (params) => handleCreateHosting(CreateHostingInput.parse(params)),
	);

	server.tool(
		"scaleway_webhosting_update_hosting",
		"Update an existing web hosting (email, tags, options, offer, protection).",
		UpdateHostingInput.shape,
		async (params) => handleUpdateHosting(UpdateHostingInput.parse(params)),
	);

	server.tool(
		"scaleway_webhosting_delete_hosting",
		"Delete a web hosting by ID.",
		DeleteHostingInput.shape,
		async (params) => handleDeleteHosting(DeleteHostingInput.parse(params)),
	);

	server.tool(
		"scaleway_webhosting_restore_hosting",
		"Restore a previously deleted web hosting by ID.",
		RestoreHostingInput.shape,
		async (params) => handleRestoreHosting(RestoreHostingInput.parse(params)),
	);

	server.tool(
		"scaleway_webhosting_get_dns_records",
		"Get DNS records for a web hosting, showing expected DNS configuration.",
		GetDnsRecordsInput.shape,
		async (params) => handleGetDnsRecords(GetDnsRecordsInput.parse(params)),
	);

	server.tool(
		"scaleway_webhosting_list_offers",
		"List available web hosting offers with pricing and quota info. Filter by control panel or option type.",
		ListOffersInput.shape,
		async (params) => handleListOffers(ListOffersInput.parse(params)),
	);

	server.tool(
		"scaleway_webhosting_list_control_panels",
		"List available control panels for web hosting (e.g., cPanel).",
		ListControlPanelsInput.shape,
		async (params) => handleListControlPanels(ListControlPanelsInput.parse(params)),
	);
}
