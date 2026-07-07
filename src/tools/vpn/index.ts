import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleChangeConnectionPsk,
	handleCreateConnection,
	handleCreateCustomerGateway,
	handleCreateRoutingPolicy,
	handleCreateVpnGateway,
	handleDeleteConnection,
	handleDeleteCustomerGateway,
	handleDeleteRoutingPolicy,
	handleDeleteVpnGateway,
	handleDetachConnectionRoutingPolicy,
	handleDisableRoutePropagation,
	handleEnableRoutePropagation,
	handleGetConnection,
	handleGetCustomerGateway,
	handleGetRoutingPolicy,
	handleGetVpnGateway,
	handleListConnections,
	handleListCustomerGateways,
	handleListRoutingPolicies,
	handleListVpnGatewayTypes,
	handleListVpnGateways,
	handleRenewConnectionPsk,
	handleSetConnectionRoutingPolicy,
	handleUpdateConnection,
	handleUpdateCustomerGateway,
	handleUpdateRoutingPolicy,
	handleUpdateVpnGateway,
} from "./handlers.js";
import {
	ChangeConnectionPskParams,
	CreateConnectionParams,
	CreateCustomerGatewayParams,
	CreateRoutingPolicyParams,
	CreateVpnGatewayParams,
	DeleteConnectionParams,
	DeleteCustomerGatewayParams,
	DeleteRoutingPolicyParams,
	DeleteVpnGatewayParams,
	DetachConnectionRoutingPolicyParams,
	GetConnectionParams,
	GetCustomerGatewayParams,
	GetRoutingPolicyParams,
	GetVpnGatewayParams,
	ListConnectionsParams,
	ListCustomerGatewaysParams,
	ListRoutingPoliciesParams,
	ListVpnGatewayTypesParams,
	ListVpnGatewaysParams,
	RenewConnectionPskParams,
	RoutePropagationParams,
	SetConnectionRoutingPolicyParams,
	UpdateConnectionParams,
	UpdateCustomerGatewayParams,
	UpdateRoutingPolicyParams,
	UpdateVpnGatewayParams,
} from "./types.js";

export function registerVpnTools(server: McpServer): void {
	// --- VPN Gateways ---
	server.tool(
		"scaleway_vpn_list_gateways",
		"List Site-to-Site VPN gateways in a Scaleway region with optional filtering",
		ListVpnGatewaysParams.shape,
		async (params) => handleListVpnGateways(ListVpnGatewaysParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_get_gateway",
		"Get details of a specific Site-to-Site VPN gateway by ID",
		GetVpnGatewayParams.shape,
		async (params) => handleGetVpnGateway(GetVpnGatewayParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_create_gateway",
		"Create a Site-to-Site VPN gateway attached to a Private Network",
		CreateVpnGatewayParams.shape,
		async (params) => handleCreateVpnGateway(CreateVpnGatewayParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_update_gateway",
		"Update a Site-to-Site VPN gateway's name or tags",
		UpdateVpnGatewayParams.shape,
		async (params) => handleUpdateVpnGateway(UpdateVpnGatewayParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_delete_gateway",
		"Delete a Site-to-Site VPN gateway by ID",
		DeleteVpnGatewayParams.shape,
		async (params) => handleDeleteVpnGateway(DeleteVpnGatewayParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_list_gateway_types",
		"List available Site-to-Site VPN gateway commercial types in a region",
		ListVpnGatewayTypesParams.shape,
		async (params) => handleListVpnGatewayTypes(ListVpnGatewayTypesParams.parse(params)),
	);

	// --- Customer Gateways ---
	server.tool(
		"scaleway_vpn_list_customer_gateways",
		"List customer gateways (remote network devices) in a Scaleway region",
		ListCustomerGatewaysParams.shape,
		async (params) => handleListCustomerGateways(ListCustomerGatewaysParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_get_customer_gateway",
		"Get details of a specific customer gateway by ID",
		GetCustomerGatewayParams.shape,
		async (params) => handleGetCustomerGateway(GetCustomerGatewayParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_create_customer_gateway",
		"Create a customer gateway representing a remote network device",
		CreateCustomerGatewayParams.shape,
		async (params) => handleCreateCustomerGateway(CreateCustomerGatewayParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_update_customer_gateway",
		"Update a customer gateway's name, tags, public IPs, or ASN",
		UpdateCustomerGatewayParams.shape,
		async (params) => handleUpdateCustomerGateway(UpdateCustomerGatewayParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_delete_customer_gateway",
		"Delete a customer gateway by ID",
		DeleteCustomerGatewayParams.shape,
		async (params) => handleDeleteCustomerGateway(DeleteCustomerGatewayParams.parse(params)),
	);

	// --- Connections ---
	server.tool(
		"scaleway_vpn_list_connections",
		"List Site-to-Site VPN connections (IPsec tunnels) in a region with optional filtering",
		ListConnectionsParams.shape,
		async (params) => handleListConnections(ListConnectionsParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_get_connection",
		"Get details of a specific Site-to-Site VPN connection by ID",
		GetConnectionParams.shape,
		async (params) => handleGetConnection(GetConnectionParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_create_connection",
		"Create a Site-to-Site VPN connection (IPsec tunnel) between a VPN and customer gateway",
		CreateConnectionParams.shape,
		async (params) => handleCreateConnection(CreateConnectionParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_update_connection",
		"Update a Site-to-Site VPN connection's name or tags",
		UpdateConnectionParams.shape,
		async (params) => handleUpdateConnection(UpdateConnectionParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_delete_connection",
		"Delete a Site-to-Site VPN connection by ID",
		DeleteConnectionParams.shape,
		async (params) => handleDeleteConnection(DeleteConnectionParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_renew_connection_psk",
		"Renew (regenerate) the pre-shared key of a VPN connection",
		RenewConnectionPskParams.shape,
		async (params) => handleRenewConnectionPsk(RenewConnectionPskParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_change_connection_psk",
		"Change the pre-shared key of a VPN connection to a Secret Manager secret",
		ChangeConnectionPskParams.shape,
		async (params) => handleChangeConnectionPsk(ChangeConnectionPskParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_set_connection_routing_policy",
		"Attach IPv4 and/or IPv6 routing policies to a VPN connection",
		SetConnectionRoutingPolicyParams.shape,
		async (params) =>
			handleSetConnectionRoutingPolicy(SetConnectionRoutingPolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_detach_connection_routing_policy",
		"Detach IPv4 and/or IPv6 routing policies from a VPN connection",
		DetachConnectionRoutingPolicyParams.shape,
		async (params) =>
			handleDetachConnectionRoutingPolicy(DetachConnectionRoutingPolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_enable_route_propagation",
		"Enable BGP dynamic route propagation on a VPN connection",
		RoutePropagationParams.shape,
		async (params) => handleEnableRoutePropagation(RoutePropagationParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_disable_route_propagation",
		"Disable BGP dynamic route propagation on a VPN connection",
		RoutePropagationParams.shape,
		async (params) => handleDisableRoutePropagation(RoutePropagationParams.parse(params)),
	);

	// --- Routing Policies ---
	server.tool(
		"scaleway_vpn_list_routing_policies",
		"List Site-to-Site VPN routing policies in a region with optional filtering",
		ListRoutingPoliciesParams.shape,
		async (params) => handleListRoutingPolicies(ListRoutingPoliciesParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_get_routing_policy",
		"Get details of a specific routing policy by ID",
		GetRoutingPolicyParams.shape,
		async (params) => handleGetRoutingPolicy(GetRoutingPolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_create_routing_policy",
		"Create a routing policy defining allowed inbound/outbound IPv4 or IPv6 prefixes",
		CreateRoutingPolicyParams.shape,
		async (params) => handleCreateRoutingPolicy(CreateRoutingPolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_update_routing_policy",
		"Update a routing policy's name, tags, or prefix filters",
		UpdateRoutingPolicyParams.shape,
		async (params) => handleUpdateRoutingPolicy(UpdateRoutingPolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_vpn_delete_routing_policy",
		"Delete a routing policy by ID",
		DeleteRoutingPolicyParams.shape,
		async (params) => handleDeleteRoutingPolicy(DeleteRoutingPolicyParams.parse(params)),
	);
}
