import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const LinkStatus = z.enum([
	"unknown_link_status",
	"configuring",
	"failed",
	"requested",
	"refused",
	"expired",
	"provisioning",
	"active",
	"limited_connectivity",
	"all_down",
	"deprovisioning",
	"deleted",
	"locked",
	"ready",
]);
export type LinkStatus = z.infer<typeof LinkStatus>;

export const BgpStatus = z.enum(["unknown_bgp_status", "up", "down", "disabled"]);
export type BgpStatus = z.infer<typeof BgpStatus>;

export const LinkKind = z.enum(["hosted", "self_hosted"]);
export type LinkKind = z.infer<typeof LinkKind>;

export const DedicatedConnectionStatus = z.enum([
	"unknown_status",
	"created",
	"configuring",
	"failed",
	"active",
	"disabled",
	"deleted",
	"locked",
]);
export type DedicatedConnectionStatus = z.infer<typeof DedicatedConnectionStatus>;

export const ListLinksOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"name_asc",
	"name_desc",
	"status_asc",
	"status_desc",
]);
export type ListLinksOrderBy = z.infer<typeof ListLinksOrderBy>;

export const ListRoutingPoliciesOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"name_asc",
	"name_desc",
]);
export type ListRoutingPoliciesOrderBy = z.infer<typeof ListRoutingPoliciesOrderBy>;

export const ListPartnersOrderBy = z.enum(["name_asc", "name_desc"]);
export type ListPartnersOrderBy = z.infer<typeof ListPartnersOrderBy>;

export const ListPopsOrderBy = z.enum(["name_asc", "name_desc"]);
export type ListPopsOrderBy = z.infer<typeof ListPopsOrderBy>;

export const ListDedicatedConnectionsOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"updated_at_asc",
	"updated_at_desc",
	"name_asc",
	"name_desc",
	"status_asc",
	"status_desc",
]);
export type ListDedicatedConnectionsOrderBy = z.infer<typeof ListDedicatedConnectionsOrderBy>;

// ---------------------------------------------------------------------------
// Response entity schemas
// ---------------------------------------------------------------------------

export const BgpConfig = z.object({
	asn: z.number().int().nonnegative(),
	ipv4: z.string(),
	ipv6: z.string(),
});
export type BgpConfig = z.infer<typeof BgpConfig>;

export const Range = z.object({
	start: z.number().int().nonnegative(),
	end: z.number().int().nonnegative(),
});
export type Range = z.infer<typeof Range>;

export const PartnerHost = z.object({
	partner_id: z.string(),
	pairing_key: z.string(),
	disapproved_reason: z.string().nullable().optional(),
});
export type PartnerHost = z.infer<typeof PartnerHost>;

export const SelfHost = z.object({
	connection_id: z.string(),
});
export type SelfHost = z.infer<typeof SelfHost>;

export const Link = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	organization_id: z.string().uuid(),
	name: z.string(),
	tags: z.array(z.string()),
	pop_id: z.string().uuid(),
	bandwidth_mbps: z.number().int().nonnegative(),
	status: LinkStatus,
	bgp_v4_status: BgpStatus,
	bgp_v6_status: BgpStatus,
	vpc_id: z.string().uuid().nullable().optional(),
	// Deprecated in favor of routing_policy_v4_id / routing_policy_v6_id.
	routing_policy_id: z.string().uuid().nullable().optional(),
	enable_route_propagation: z.boolean(),
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
	partner: PartnerHost.nullable().optional(),
	self: SelfHost.nullable().optional(),
	vlan: z.number().int().nonnegative(),
	scw_bgp_config: BgpConfig.nullable().optional(),
	peer_bgp_config: BgpConfig.nullable().optional(),
	routing_policy_v4_id: z.string().uuid().nullable().optional(),
	routing_policy_v6_id: z.string().uuid().nullable().optional(),
	region: z.string(),
});
export type Link = z.infer<typeof Link>;

export const Partner = z.object({
	id: z.string().uuid(),
	name: z.string(),
	contact_email: z.string(),
	logo_url: z.string(),
	portal_url: z.string(),
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
});
export type Partner = z.infer<typeof Partner>;

export const Pop = z.object({
	id: z.string().uuid(),
	name: z.string(),
	hosting_provider_name: z.string(),
	address: z.string(),
	city: z.string(),
	logo_url: z.string(),
	available_link_bandwidths_mbps: z.array(z.number().int().nonnegative()),
	display_name: z.string(),
	region: z.string(),
});
export type Pop = z.infer<typeof Pop>;

export const RoutingPolicy = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	organization_id: z.string().uuid(),
	name: z.string(),
	tags: z.array(z.string()),
	prefix_filter_in: z.array(z.string()),
	prefix_filter_out: z.array(z.string()),
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
	is_ipv6: z.boolean(),
	region: z.string(),
});
export type RoutingPolicy = z.infer<typeof RoutingPolicy>;

export const DedicatedConnection = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	organization_id: z.string().uuid(),
	status: DedicatedConnectionStatus,
	name: z.string(),
	tags: z.array(z.string()),
	pop_id: z.string().uuid(),
	bandwidth_mbps: z.number().int().nonnegative(),
	available_link_bandwidths: z.array(z.number().int().nonnegative()),
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
	demarcation_info: z.string().nullable().optional(),
	vlan_range: Range.nullable().optional(),
	region: z.string(),
});
export type DedicatedConnection = z.infer<typeof DedicatedConnection>;

// ---------------------------------------------------------------------------
// Link request params
// ---------------------------------------------------------------------------

export const ListLinksParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list links in (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Filter by Project ID"),
	organizationId: z.string().uuid().optional().describe("Filter by Organization ID"),
	name: z.string().optional().describe("Filter by link name"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	status: LinkStatus.optional().describe("Filter by link status"),
	bgpV4Status: BgpStatus.optional().describe("Filter by IPv4 BGP session status"),
	bgpV6Status: BgpStatus.optional().describe("Filter by IPv6 BGP session status"),
	popId: z.string().uuid().optional().describe("Filter by Point of Presence ID"),
	bandwidthMbps: z.number().int().positive().optional().describe("Filter by bandwidth in Mbps"),
	partnerId: z.string().uuid().optional().describe("Filter by partner ID"),
	vpcId: z.string().uuid().optional().describe("Filter by attached VPC ID"),
	routingPolicyId: z.string().uuid().optional().describe("Filter by attached routing policy ID"),
	pairingKey: z.string().optional().describe("Filter by pairing key (hosted links)"),
	kind: LinkKind.optional().describe("Filter by link kind (hosted or self_hosted)"),
	connectionId: z
		.string()
		.uuid()
		.optional()
		.describe("Filter by dedicated connection ID (self-hosted links)"),
	orderBy: ListLinksOrderBy.optional().describe("Sort order for results"),
});
export type ListLinksParams = z.infer<typeof ListLinksParams>;

export const GetLinkParams = z.object({
	region: ScalewayRegion.describe("Region of the link"),
	linkId: z.string().uuid().describe("ID of the link"),
});
export type GetLinkParams = z.infer<typeof GetLinkParams>;

export const CreateLinkParams = z.object({
	region: ScalewayRegion.describe("Region to create the link in"),
	name: z.string().min(1).describe("Name of the link"),
	popId: z.string().uuid().describe("ID of the Point of Presence to connect to"),
	bandwidthMbps: z.number().int().positive().describe("Bandwidth of the link in Mbps"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags to apply to the link"),
	connectionId: z
		.string()
		.uuid()
		.optional()
		.describe("Dedicated connection ID for a self-hosted link"),
	partnerId: z.string().uuid().optional().describe("Partner ID for a partner-hosted link"),
	peerAsn: z.number().int().nonnegative().optional().describe("BGP ASN of the peer"),
	vlan: z.number().int().nonnegative().optional().describe("VLAN ID for a self-hosted link"),
	routingPolicyV4Id: z
		.string()
		.uuid()
		.optional()
		.describe("IPv4 routing policy ID to attach on creation"),
	routingPolicyV6Id: z
		.string()
		.uuid()
		.optional()
		.describe("IPv6 routing policy ID to attach on creation"),
});
export type CreateLinkParams = z.infer<typeof CreateLinkParams>;

export const UpdateLinkParams = z.object({
	region: ScalewayRegion.describe("Region of the link"),
	linkId: z.string().uuid().describe("ID of the link to update"),
	name: z.string().min(1).optional().describe("New name for the link"),
	tags: z.array(z.string()).optional().describe("New set of tags for the link"),
	peerAsn: z.number().int().nonnegative().optional().describe("New BGP ASN of the peer"),
});
export type UpdateLinkParams = z.infer<typeof UpdateLinkParams>;

export const DeleteLinkParams = z.object({
	region: ScalewayRegion.describe("Region of the link"),
	linkId: z.string().uuid().describe("ID of the link to delete"),
});
export type DeleteLinkParams = z.infer<typeof DeleteLinkParams>;

export const AttachVpcParams = z.object({
	region: ScalewayRegion.describe("Region of the link"),
	linkId: z.string().uuid().describe("ID of the link"),
	vpcId: z.string().uuid().describe("ID of the VPC to attach"),
});
export type AttachVpcParams = z.infer<typeof AttachVpcParams>;

export const DetachVpcParams = z.object({
	region: ScalewayRegion.describe("Region of the link"),
	linkId: z.string().uuid().describe("ID of the link to detach the VPC from"),
});
export type DetachVpcParams = z.infer<typeof DetachVpcParams>;

export const AttachRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region of the link"),
	linkId: z.string().uuid().describe("ID of the link"),
	routingPolicyId: z.string().uuid().describe("ID of the routing policy to attach"),
});
export type AttachRoutingPolicyParams = z.infer<typeof AttachRoutingPolicyParams>;

export const DetachRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region of the link"),
	linkId: z.string().uuid().describe("ID of the link"),
	routingPolicyId: z.string().uuid().describe("ID of the routing policy to detach"),
});
export type DetachRoutingPolicyParams = z.infer<typeof DetachRoutingPolicyParams>;

export const SetRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region of the link"),
	linkId: z.string().uuid().describe("ID of the link"),
	routingPolicyId: z.string().uuid().describe("ID of the routing policy to set on the link"),
});
export type SetRoutingPolicyParams = z.infer<typeof SetRoutingPolicyParams>;

export const EnableRoutePropagationParams = z.object({
	region: ScalewayRegion.describe("Region of the link"),
	linkId: z.string().uuid().describe("ID of the link"),
});
export type EnableRoutePropagationParams = z.infer<typeof EnableRoutePropagationParams>;

export const DisableRoutePropagationParams = z.object({
	region: ScalewayRegion.describe("Region of the link"),
	linkId: z.string().uuid().describe("ID of the link"),
});
export type DisableRoutePropagationParams = z.infer<typeof DisableRoutePropagationParams>;

// ---------------------------------------------------------------------------
// Routing policy request params
// ---------------------------------------------------------------------------

export const ListRoutingPoliciesParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list routing policies in"),
	projectId: z.string().uuid().optional().describe("Filter by Project ID"),
	organizationId: z.string().uuid().optional().describe("Filter by Organization ID"),
	name: z.string().optional().describe("Filter by routing policy name"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	ipv6: z.boolean().optional().describe("Filter by IPv6 policies when true, IPv4 when false"),
	orderBy: ListRoutingPoliciesOrderBy.optional().describe("Sort order for results"),
});
export type ListRoutingPoliciesParams = z.infer<typeof ListRoutingPoliciesParams>;

export const GetRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region of the routing policy"),
	routingPolicyId: z.string().uuid().describe("ID of the routing policy"),
});
export type GetRoutingPolicyParams = z.infer<typeof GetRoutingPolicyParams>;

export const CreateRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region to create the routing policy in"),
	name: z.string().min(1).describe("Name of the routing policy"),
	isIpv6: z
		.boolean()
		.describe("Whether the policy applies to IPv6 (true) or IPv4 (false) prefixes"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags to apply to the routing policy"),
	prefixFilterIn: z
		.array(z.string())
		.optional()
		.describe("IP prefixes to accept from the peer (inbound)"),
	prefixFilterOut: z
		.array(z.string())
		.optional()
		.describe("IP prefixes to advertise to the peer (outbound)"),
});
export type CreateRoutingPolicyParams = z.infer<typeof CreateRoutingPolicyParams>;

export const UpdateRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region of the routing policy"),
	routingPolicyId: z.string().uuid().describe("ID of the routing policy to update"),
	name: z.string().min(1).optional().describe("New name for the routing policy"),
	tags: z.array(z.string()).optional().describe("New set of tags"),
	prefixFilterIn: z.array(z.string()).optional().describe("New inbound prefix filter"),
	prefixFilterOut: z.array(z.string()).optional().describe("New outbound prefix filter"),
});
export type UpdateRoutingPolicyParams = z.infer<typeof UpdateRoutingPolicyParams>;

export const DeleteRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region of the routing policy"),
	routingPolicyId: z.string().uuid().describe("ID of the routing policy to delete"),
});
export type DeleteRoutingPolicyParams = z.infer<typeof DeleteRoutingPolicyParams>;

// ---------------------------------------------------------------------------
// Partner request params
// ---------------------------------------------------------------------------

export const ListPartnersParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list partners in"),
	popIds: z.array(z.string().uuid()).optional().describe("Filter by Points of Presence IDs"),
	orderBy: ListPartnersOrderBy.optional().describe("Sort order for results"),
});
export type ListPartnersParams = z.infer<typeof ListPartnersParams>;

export const GetPartnerParams = z.object({
	region: ScalewayRegion.describe("Region of the partner"),
	partnerId: z.string().uuid().describe("ID of the partner"),
});
export type GetPartnerParams = z.infer<typeof GetPartnerParams>;

// ---------------------------------------------------------------------------
// PoP request params
// ---------------------------------------------------------------------------

export const ListPopsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list Points of Presence in"),
	name: z.string().optional().describe("Filter by PoP name"),
	hostingProviderName: z.string().optional().describe("Filter by hosting provider name"),
	partnerId: z.string().uuid().optional().describe("Filter by partner ID available at the PoP"),
	linkBandwidthMbps: z
		.number()
		.int()
		.positive()
		.optional()
		.describe("Filter by supported link bandwidth in Mbps"),
	dedicatedAvailable: z
		.boolean()
		.optional()
		.describe("Filter PoPs where dedicated connections are available"),
	orderBy: ListPopsOrderBy.optional().describe("Sort order for results"),
});
export type ListPopsParams = z.infer<typeof ListPopsParams>;

export const GetPopParams = z.object({
	region: ScalewayRegion.describe("Region of the PoP"),
	popId: z.string().uuid().describe("ID of the Point of Presence"),
});
export type GetPopParams = z.infer<typeof GetPopParams>;

// ---------------------------------------------------------------------------
// Dedicated connection request params
// ---------------------------------------------------------------------------

export const ListDedicatedConnectionsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list dedicated connections in"),
	projectId: z.string().uuid().optional().describe("Filter by Project ID"),
	organizationId: z.string().uuid().optional().describe("Filter by Organization ID"),
	name: z.string().optional().describe("Filter by connection name"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	status: DedicatedConnectionStatus.optional().describe("Filter by connection status"),
	bandwidthMbps: z.number().int().positive().optional().describe("Filter by bandwidth in Mbps"),
	popId: z.string().uuid().optional().describe("Filter by Point of Presence ID"),
	orderBy: ListDedicatedConnectionsOrderBy.optional().describe("Sort order for results"),
});
export type ListDedicatedConnectionsParams = z.infer<typeof ListDedicatedConnectionsParams>;

export const GetDedicatedConnectionParams = z.object({
	region: ScalewayRegion.describe("Region of the dedicated connection"),
	connectionId: z.string().uuid().describe("ID of the dedicated connection"),
});
export type GetDedicatedConnectionParams = z.infer<typeof GetDedicatedConnectionParams>;
