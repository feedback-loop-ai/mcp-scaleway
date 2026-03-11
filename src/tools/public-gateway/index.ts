import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateDHCP,
	handleCreateGateway,
	handleCreateGatewayNetwork,
	handleCreateIP,
	handleCreatePatRule,
	handleDeleteDHCP,
	handleDeleteGateway,
	handleDeleteGatewayNetwork,
	handleDeleteIP,
	handleDeletePatRule,
	handleGetDHCP,
	handleGetGateway,
	handleGetGatewayNetwork,
	handleGetIP,
	handleGetPatRule,
	handleListDHCPs,
	handleListGatewayNetworks,
	handleListGatewayTypes,
	handleListGateways,
	handleListIPs,
	handleListPatRules,
	handleUpdateDHCP,
	handleUpdateGateway,
	handleUpdateGatewayNetwork,
	handleUpdateIP,
	handleUpdatePatRule,
} from "./handlers.js";
import {
	CreateDHCPParams,
	CreateGatewayNetworkParams,
	CreateGatewayParams,
	CreateIPParams,
	CreatePatRuleParams,
	DeleteDHCPParams,
	DeleteGatewayNetworkParams,
	DeleteGatewayParams,
	DeleteIPParams,
	DeletePatRuleParams,
	GetDHCPParams,
	GetGatewayNetworkParams,
	GetGatewayParams,
	GetIPParams,
	GetPatRuleParams,
	ListDHCPsParams,
	ListGatewayNetworksParams,
	ListGatewayTypesParams,
	ListGatewaysParams,
	ListIPsParams,
	ListPatRulesParams,
	UpdateDHCPParams,
	UpdateGatewayNetworkParams,
	UpdateGatewayParams,
	UpdateIPParams,
	UpdatePatRuleParams,
} from "./types.js";

export function registerPublicGatewayTools(server: McpServer): void {
	// ─── Gateway CRUD ────────────────────────────────────────────────────────

	server.tool(
		"scaleway_public_gateway_list_gateways",
		"List Public Gateways in a given zone. Supports filtering by project, name, tags, types, status, and attached Private Networks. Returns paginated results.",
		ListGatewaysParams.shape,
		handleListGateways,
	);

	server.tool(
		"scaleway_public_gateway_get_gateway",
		"Get details of a Public Gateway by ID, including name, type, status, IP, bastion config, and attached networks.",
		GetGatewayParams.shape,
		handleGetGateway,
	);

	server.tool(
		"scaleway_public_gateway_create_gateway",
		"Create a new Public Gateway with specified type, bastion and SMTP settings. Optionally attach an existing IP.",
		CreateGatewayParams.shape,
		handleCreateGateway,
	);

	server.tool(
		"scaleway_public_gateway_update_gateway",
		"Update a Public Gateway's name, tags, bastion configuration, or SMTP settings.",
		UpdateGatewayParams.shape,
		handleUpdateGateway,
	);

	server.tool(
		"scaleway_public_gateway_delete_gateway",
		"Delete a Public Gateway. Optionally delete its associated IP address.",
		DeleteGatewayParams.shape,
		handleDeleteGateway,
	);

	// ─── Gateway Network ─────────────────────────────────────────────────────

	server.tool(
		"scaleway_public_gateway_list_gateway_networks",
		"List connections between Public Gateways and Private Networks. Filter by gateway IDs, Private Network IDs, status, or masquerade setting.",
		ListGatewayNetworksParams.shape,
		handleListGatewayNetworks,
	);

	server.tool(
		"scaleway_public_gateway_get_gateway_network",
		"Get details of a Public Gateway connection to a Private Network (GatewayNetwork).",
		GetGatewayNetworkParams.shape,
		handleGetGatewayNetwork,
	);

	server.tool(
		"scaleway_public_gateway_create_gateway_network",
		"Attach a Public Gateway to a Private Network with masquerade and default route settings.",
		CreateGatewayNetworkParams.shape,
		handleCreateGatewayNetwork,
	);

	server.tool(
		"scaleway_public_gateway_update_gateway_network",
		"Update a Public Gateway's connection to a Private Network (masquerade, default route, IPAM IP).",
		UpdateGatewayNetworkParams.shape,
		handleUpdateGatewayNetwork,
	);

	server.tool(
		"scaleway_public_gateway_delete_gateway_network",
		"Detach a Public Gateway from a Private Network by deleting the GatewayNetwork.",
		DeleteGatewayNetworkParams.shape,
		handleDeleteGatewayNetwork,
	);

	// ─── DHCP ────────────────────────────────────────────────────────────────

	server.tool(
		"scaleway_public_gateway_list_dhcps",
		"List DHCP configurations for Public Gateways (v1 API). Filter by project, address, or subnet.",
		ListDHCPsParams.shape,
		handleListDHCPs,
	);

	server.tool(
		"scaleway_public_gateway_get_dhcp",
		"Get a DHCP configuration by ID, including subnet, pool range, DNS settings, and timers.",
		GetDHCPParams.shape,
		handleGetDHCP,
	);

	server.tool(
		"scaleway_public_gateway_create_dhcp",
		"Create a DHCP configuration for a Private Network with subnet, address pool, DNS, and lease settings.",
		CreateDHCPParams.shape,
		handleCreateDHCP,
	);

	server.tool(
		"scaleway_public_gateway_update_dhcp",
		"Update a DHCP configuration's subnet, pool range, DNS settings, or lease timers.",
		UpdateDHCPParams.shape,
		handleUpdateDHCP,
	);

	server.tool(
		"scaleway_public_gateway_delete_dhcp",
		"Delete a DHCP configuration by ID.",
		DeleteDHCPParams.shape,
		handleDeleteDHCP,
	);

	// ─── PAT Rules ───────────────────────────────────────────────────────────

	server.tool(
		"scaleway_public_gateway_list_pat_rules",
		"List PAT (Port Address Translation) rules. Filter by gateway IDs, private IPs, or protocol.",
		ListPatRulesParams.shape,
		handleListPatRules,
	);

	server.tool(
		"scaleway_public_gateway_get_pat_rule",
		"Get a PAT rule by ID, including public/private port mapping, IP, and protocol.",
		GetPatRuleParams.shape,
		handleGetPatRule,
	);

	server.tool(
		"scaleway_public_gateway_create_pat_rule",
		"Create a PAT rule on a gateway to forward traffic from a public port to a private IP and port.",
		CreatePatRuleParams.shape,
		handleCreatePatRule,
	);

	server.tool(
		"scaleway_public_gateway_update_pat_rule",
		"Update a PAT rule's port mapping, private IP, or protocol.",
		UpdatePatRuleParams.shape,
		handleUpdatePatRule,
	);

	server.tool(
		"scaleway_public_gateway_delete_pat_rule",
		"Delete a PAT rule by ID.",
		DeletePatRuleParams.shape,
		handleDeletePatRule,
	);

	// ─── IPs ─────────────────────────────────────────────────────────────────

	server.tool(
		"scaleway_public_gateway_list_ips",
		"List flexible IP addresses for Public Gateways. Filter by project, tags, reverse DNS, or attachment status.",
		ListIPsParams.shape,
		handleListIPs,
	);

	server.tool(
		"scaleway_public_gateway_get_ip",
		"Get details of a Public Gateway flexible IP address by ID.",
		GetIPParams.shape,
		handleGetIP,
	);

	server.tool(
		"scaleway_public_gateway_create_ip",
		"Reserve a new flexible IP address for use with a Public Gateway.",
		CreateIPParams.shape,
		handleCreateIP,
	);

	server.tool(
		"scaleway_public_gateway_update_ip",
		"Update a flexible IP address's tags, reverse DNS, or gateway attachment.",
		UpdateIPParams.shape,
		handleUpdateIP,
	);

	server.tool(
		"scaleway_public_gateway_delete_ip",
		"Delete (release) a flexible IP address.",
		DeleteIPParams.shape,
		handleDeleteIP,
	);

	// ─── Gateway Types ───────────────────────────────────────────────────────

	server.tool(
		"scaleway_public_gateway_list_gateway_types",
		"List available Public Gateway commercial offer types with their bandwidth specs.",
		ListGatewayTypesParams.shape,
		handleListGatewayTypes,
	);
}
