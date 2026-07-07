import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleAttachRoutingPolicy,
	handleAttachVpc,
	handleCreateLink,
	handleCreateRoutingPolicy,
	handleDeleteLink,
	handleDeleteRoutingPolicy,
	handleDetachRoutingPolicy,
	handleDetachVpc,
	handleDisableRoutePropagation,
	handleEnableRoutePropagation,
	handleGetDedicatedConnection,
	handleGetLink,
	handleGetPartner,
	handleGetPop,
	handleGetRoutingPolicy,
	handleListDedicatedConnections,
	handleListLinks,
	handleListPartners,
	handleListPops,
	handleListRoutingPolicies,
	handleSetRoutingPolicy,
	handleUpdateLink,
	handleUpdateRoutingPolicy,
} from "./handlers.js";
import {
	AttachRoutingPolicyParams,
	AttachVpcParams,
	CreateLinkParams,
	CreateRoutingPolicyParams,
	DeleteLinkParams,
	DeleteRoutingPolicyParams,
	DetachRoutingPolicyParams,
	DetachVpcParams,
	DisableRoutePropagationParams,
	EnableRoutePropagationParams,
	GetDedicatedConnectionParams,
	GetLinkParams,
	GetPartnerParams,
	GetPopParams,
	GetRoutingPolicyParams,
	ListDedicatedConnectionsParams,
	ListLinksParams,
	ListPartnersParams,
	ListPopsParams,
	ListRoutingPoliciesParams,
	SetRoutingPolicyParams,
	UpdateLinkParams,
	UpdateRoutingPolicyParams,
} from "./types.js";

export function registerInterlinkTools(server: McpServer): void {
	// --- Links ---
	server.tool(
		"scaleway_interlink_list_links",
		"List InterLink links (BGP peering sessions) in a region with optional filtering",
		ListLinksParams.shape,
		async (params) => handleListLinks(ListLinksParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_get_link",
		"Get details of a specific InterLink link, including BGP session status and configuration",
		GetLinkParams.shape,
		async (params) => handleGetLink(GetLinkParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_create_link",
		"Create a new InterLink link (hosted via a partner or self-hosted via a dedicated connection)",
		CreateLinkParams.shape,
		async (params) => handleCreateLink(CreateLinkParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_update_link",
		"Update an InterLink link's name, tags, or peer ASN",
		UpdateLinkParams.shape,
		async (params) => handleUpdateLink(UpdateLinkParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_delete_link",
		"Delete an InterLink link by ID",
		DeleteLinkParams.shape,
		async (params) => handleDeleteLink(DeleteLinkParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_attach_vpc",
		"Attach a VPC to an InterLink link to route traffic into it",
		AttachVpcParams.shape,
		async (params) => handleAttachVpc(AttachVpcParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_detach_vpc",
		"Detach the VPC currently attached to an InterLink link",
		DetachVpcParams.shape,
		async (params) => handleDetachVpc(DetachVpcParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_attach_routing_policy",
		"Attach a routing policy to an InterLink link (IPv4 or IPv6 based on the policy)",
		AttachRoutingPolicyParams.shape,
		async (params) => handleAttachRoutingPolicy(AttachRoutingPolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_detach_routing_policy",
		"Detach a routing policy from an InterLink link",
		DetachRoutingPolicyParams.shape,
		async (params) => handleDetachRoutingPolicy(DetachRoutingPolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_set_routing_policy",
		"Set (replace) the routing policy on an InterLink link",
		SetRoutingPolicyParams.shape,
		async (params) => handleSetRoutingPolicy(SetRoutingPolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_enable_route_propagation",
		"Enable route propagation on an InterLink link so allowed prefixes are advertised",
		EnableRoutePropagationParams.shape,
		async (params) => handleEnableRoutePropagation(EnableRoutePropagationParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_disable_route_propagation",
		"Disable route propagation on an InterLink link",
		DisableRoutePropagationParams.shape,
		async (params) => handleDisableRoutePropagation(DisableRoutePropagationParams.parse(params)),
	);

	// --- Routing policies ---
	server.tool(
		"scaleway_interlink_list_routing_policies",
		"List InterLink routing policies in a region with optional filtering",
		ListRoutingPoliciesParams.shape,
		async (params) => handleListRoutingPolicies(ListRoutingPoliciesParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_get_routing_policy",
		"Get details of a specific InterLink routing policy by ID",
		GetRoutingPolicyParams.shape,
		async (params) => handleGetRoutingPolicy(GetRoutingPolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_create_routing_policy",
		"Create an InterLink routing policy defining inbound/outbound IP prefix filters",
		CreateRoutingPolicyParams.shape,
		async (params) => handleCreateRoutingPolicy(CreateRoutingPolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_update_routing_policy",
		"Update an InterLink routing policy's name, tags, or prefix filters",
		UpdateRoutingPolicyParams.shape,
		async (params) => handleUpdateRoutingPolicy(UpdateRoutingPolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_delete_routing_policy",
		"Delete an InterLink routing policy by ID",
		DeleteRoutingPolicyParams.shape,
		async (params) => handleDeleteRoutingPolicy(DeleteRoutingPolicyParams.parse(params)),
	);

	// --- Partners ---
	server.tool(
		"scaleway_interlink_list_partners",
		"List InterLink partners (hosting providers offering connectivity) in a region",
		ListPartnersParams.shape,
		async (params) => handleListPartners(ListPartnersParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_get_partner",
		"Get details of a specific InterLink partner by ID",
		GetPartnerParams.shape,
		async (params) => handleGetPartner(GetPartnerParams.parse(params)),
	);

	// --- Points of Presence ---
	server.tool(
		"scaleway_interlink_list_pops",
		"List InterLink Points of Presence (PoPs / datacenter locations) in a region",
		ListPopsParams.shape,
		async (params) => handleListPops(ListPopsParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_get_pop",
		"Get details of a specific InterLink Point of Presence by ID",
		GetPopParams.shape,
		async (params) => handleGetPop(GetPopParams.parse(params)),
	);

	// --- Dedicated connections ---
	server.tool(
		"scaleway_interlink_list_dedicated_connections",
		"List InterLink dedicated (self-hosted) connections in a region with optional filtering",
		ListDedicatedConnectionsParams.shape,
		async (params) => handleListDedicatedConnections(ListDedicatedConnectionsParams.parse(params)),
	);

	server.tool(
		"scaleway_interlink_get_dedicated_connection",
		"Get details of a specific InterLink dedicated connection by ID",
		GetDedicatedConnectionParams.shape,
		async (params) => handleGetDedicatedConnection(GetDedicatedConnectionParams.parse(params)),
	);
}
