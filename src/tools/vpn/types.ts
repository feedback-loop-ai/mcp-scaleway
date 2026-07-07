import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Shared enums ---

export const GatewayOrderBy = z
	.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc", "status_asc", "status_desc"])
	.describe("Order results by field");
export type GatewayOrderBy = z.infer<typeof GatewayOrderBy>;

export const NameOrderBy = z
	.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
	.describe("Order results by field");
export type NameOrderBy = z.infer<typeof NameOrderBy>;

// --- VPN Gateway ---

export const VpnGatewayStatus = z.enum([
	"unknown_status",
	"configuring",
	"failed",
	"provisioning",
	"active",
	"deprovisioning",
	"locked",
]);
export type VpnGatewayStatus = z.infer<typeof VpnGatewayStatus>;

export const VpnGateway = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	organization_id: z.string().uuid(),
	name: z.string(),
	tags: z.array(z.string()),
	status: VpnGatewayStatus,
	gateway_type: z.string(),
	private_network_id: z.string().uuid().nullable(),
	asn: z.number().int().nonnegative().optional(),
	connection_ids: z.array(z.string()).optional(),
	zone: z.string().optional(),
	region: z.string(),
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
});
export type VpnGateway = z.infer<typeof VpnGateway>;

export const ListVpnGatewaysParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list VPN gateways in (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by gateway name"),
	orderBy: GatewayOrderBy.optional(),
});
export type ListVpnGatewaysParams = z.infer<typeof ListVpnGatewaysParams>;

export const ListVpnGatewaysResponse = z.object({
	vpn_gateways: z.array(VpnGateway),
	total_count: z.number().int().nonnegative(),
});
export type ListVpnGatewaysResponse = z.infer<typeof ListVpnGatewaysResponse>;

export const GetVpnGatewayParams = z.object({
	region: ScalewayRegion.describe("Region of the VPN gateway"),
	gatewayId: z.string().uuid().describe("ID of the VPN gateway"),
});
export type GetVpnGatewayParams = z.infer<typeof GetVpnGatewayParams>;

export const CreateVpnGatewayParams = z.object({
	region: ScalewayRegion.describe("Region for the VPN gateway"),
	name: z.string().min(1).describe("Name for the VPN gateway"),
	gatewayType: z.string().min(1).describe("Gateway commercial type (e.g. VGW-S)"),
	privateNetworkId: z
		.string()
		.uuid()
		.describe("ID of the Private Network to attach the gateway to"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags to apply to the gateway"),
	zone: z.string().optional().describe("Availability zone to provision the gateway in"),
	ipamPrivateIpv4Id: z
		.string()
		.uuid()
		.optional()
		.describe("IPAM ID of a reserved private IPv4 address"),
	ipamPrivateIpv6Id: z
		.string()
		.uuid()
		.optional()
		.describe("IPAM ID of a reserved private IPv6 address"),
});
export type CreateVpnGatewayParams = z.infer<typeof CreateVpnGatewayParams>;

export const UpdateVpnGatewayParams = z.object({
	region: ScalewayRegion.describe("Region of the VPN gateway"),
	gatewayId: z.string().uuid().describe("ID of the VPN gateway"),
	name: z.string().min(1).optional().describe("New name for the gateway"),
	tags: z.array(z.string()).optional().describe("New tags for the gateway"),
});
export type UpdateVpnGatewayParams = z.infer<typeof UpdateVpnGatewayParams>;

export const DeleteVpnGatewayParams = z.object({
	region: ScalewayRegion.describe("Region of the VPN gateway"),
	gatewayId: z.string().uuid().describe("ID of the VPN gateway to delete"),
});
export type DeleteVpnGatewayParams = z.infer<typeof DeleteVpnGatewayParams>;

// --- VPN Gateway Types ---

export const VpnGatewayType = z.object({
	name: z.string(),
	bandwidth: z.number().int().nonnegative(),
	allowed_connections: z.number().int().nonnegative(),
	zones: z.array(z.string()).optional(),
	region: z.string(),
});
export type VpnGatewayType = z.infer<typeof VpnGatewayType>;

export const ListVpnGatewayTypesParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list gateway types in (e.g. fr-par)"),
});
export type ListVpnGatewayTypesParams = z.infer<typeof ListVpnGatewayTypesParams>;

export const ListVpnGatewayTypesResponse = z.object({
	gateway_types: z.array(VpnGatewayType),
	total_count: z.number().int().nonnegative(),
});
export type ListVpnGatewayTypesResponse = z.infer<typeof ListVpnGatewayTypesResponse>;

// --- Customer Gateway ---

export const CustomerGateway = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	organization_id: z.string().uuid(),
	name: z.string(),
	tags: z.array(z.string()),
	public_ipv4: z.string().nullable(),
	public_ipv6: z.string().nullable(),
	asn: z.number().int().nonnegative(),
	connection_ids: z.array(z.string()).optional(),
	region: z.string(),
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
});
export type CustomerGateway = z.infer<typeof CustomerGateway>;

export const ListCustomerGatewaysParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list customer gateways in (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by customer gateway name"),
	orderBy: NameOrderBy.optional(),
});
export type ListCustomerGatewaysParams = z.infer<typeof ListCustomerGatewaysParams>;

export const ListCustomerGatewaysResponse = z.object({
	customer_gateways: z.array(CustomerGateway),
	total_count: z.number().int().nonnegative(),
});
export type ListCustomerGatewaysResponse = z.infer<typeof ListCustomerGatewaysResponse>;

export const GetCustomerGatewayParams = z.object({
	region: ScalewayRegion.describe("Region of the customer gateway"),
	customerGatewayId: z.string().uuid().describe("ID of the customer gateway"),
});
export type GetCustomerGatewayParams = z.infer<typeof GetCustomerGatewayParams>;

export const CreateCustomerGatewayParams = z.object({
	region: ScalewayRegion.describe("Region for the customer gateway"),
	name: z.string().min(1).describe("Name for the customer gateway"),
	asn: z.number().int().nonnegative().describe("BGP Autonomous System Number (cannot be 12876)"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags to apply"),
	ipv4Public: z.string().optional().describe("Public IPv4 address of the remote device"),
	ipv6Public: z.string().optional().describe("Public IPv6 address of the remote device"),
});
export type CreateCustomerGatewayParams = z.infer<typeof CreateCustomerGatewayParams>;

export const UpdateCustomerGatewayParams = z.object({
	region: ScalewayRegion.describe("Region of the customer gateway"),
	customerGatewayId: z.string().uuid().describe("ID of the customer gateway"),
	name: z.string().min(1).optional().describe("New name"),
	tags: z.array(z.string()).optional().describe("New tags"),
	ipv4Public: z.string().optional().describe("New public IPv4 address"),
	ipv6Public: z.string().optional().describe("New public IPv6 address"),
	asn: z.number().int().nonnegative().optional().describe("New BGP ASN"),
});
export type UpdateCustomerGatewayParams = z.infer<typeof UpdateCustomerGatewayParams>;

export const DeleteCustomerGatewayParams = z.object({
	region: ScalewayRegion.describe("Region of the customer gateway"),
	customerGatewayId: z.string().uuid().describe("ID of the customer gateway to delete"),
});
export type DeleteCustomerGatewayParams = z.infer<typeof DeleteCustomerGatewayParams>;

// --- Connection ciphers & BGP config ---

export const ConnectionEncryption = z.enum([
	"unknown_encryption",
	"aes128",
	"aes192",
	"aes256",
	"aes128gcm",
	"aes192gcm",
	"aes256gcm",
	"aes128ccm",
	"aes256ccm",
	"chacha20poly1305",
]);
export type ConnectionEncryption = z.infer<typeof ConnectionEncryption>;

export const ConnectionIntegrity = z.enum(["unknown_integrity", "sha256", "sha384", "sha512"]);
export type ConnectionIntegrity = z.infer<typeof ConnectionIntegrity>;

export const ConnectionDhGroup = z.enum([
	"unknown_dhgroup",
	"modp2048",
	"modp3072",
	"modp4096",
	"ecp256",
	"ecp384",
	"ecp521",
	"curve25519",
]);
export type ConnectionDhGroup = z.infer<typeof ConnectionDhGroup>;

export const ConnectionCipher = z.object({
	encryption: ConnectionEncryption.describe("Encryption algorithm"),
	integrity: ConnectionIntegrity.optional().describe("Integrity algorithm"),
	dh_group: ConnectionDhGroup.optional().describe("Diffie-Hellman group"),
});
export type ConnectionCipher = z.infer<typeof ConnectionCipher>;

export const BgpConfig = z.object({
	routing_policy_id: z.string().uuid().describe("ID of the routing policy to apply"),
	private_ip: z.string().optional().describe("Private IP (CIDR) of the gateway for BGP"),
	peer_private_ip: z.string().optional().describe("Private IP (CIDR) of the peer for BGP"),
});
export type BgpConfig = z.infer<typeof BgpConfig>;

export const ConnectionInitiationPolicy = z.enum([
	"unknown_initiation_policy",
	"vpn_gateway",
	"customer_gateway",
]);
export type ConnectionInitiationPolicy = z.infer<typeof ConnectionInitiationPolicy>;

// --- Connection ---

export const ConnectionStatus = z.enum([
	"unknown_status",
	"active",
	"limited_connectivity",
	"down",
	"locked",
]);
export type ConnectionStatus = z.infer<typeof ConnectionStatus>;

export const Connection = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	organization_id: z.string().uuid(),
	name: z.string(),
	tags: z.array(z.string()),
	status: ConnectionStatus,
	is_ipv6: z.boolean(),
	initiation_policy: ConnectionInitiationPolicy,
	secret_id: z.string().uuid().nullable(),
	secret_revision: z.number().int().nonnegative().optional(),
	ikev2_ciphers: z.array(ConnectionCipher),
	esp_ciphers: z.array(ConnectionCipher),
	route_propagation_enabled: z.boolean(),
	vpn_gateway_id: z.string().uuid(),
	customer_gateway_id: z.string().uuid(),
	region: z.string(),
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
});
export type Connection = z.infer<typeof Connection>;

export const ListConnectionsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list connections in (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by connection name"),
	isIpv6: z.boolean().optional().describe("Filter by IP version"),
	vpnGatewayId: z.string().uuid().optional().describe("Filter by VPN gateway ID"),
	customerGatewayId: z.string().uuid().optional().describe("Filter by customer gateway ID"),
	orderBy: GatewayOrderBy.optional(),
});
export type ListConnectionsParams = z.infer<typeof ListConnectionsParams>;

export const ListConnectionsResponse = z.object({
	connections: z.array(Connection),
	total_count: z.number().int().nonnegative(),
});
export type ListConnectionsResponse = z.infer<typeof ListConnectionsResponse>;

export const GetConnectionParams = z.object({
	region: ScalewayRegion.describe("Region of the connection"),
	connectionId: z.string().uuid().describe("ID of the connection"),
});
export type GetConnectionParams = z.infer<typeof GetConnectionParams>;

export const CreateConnectionParams = z.object({
	region: ScalewayRegion.describe("Region for the connection"),
	name: z.string().min(1).describe("Name for the connection"),
	initiationPolicy: ConnectionInitiationPolicy.describe("Which peer initiates the IKE negotiation"),
	ikev2Ciphers: z.array(ConnectionCipher).min(1).describe("IKEv2 cipher proposals"),
	espCiphers: z.array(ConnectionCipher).min(1).describe("ESP cipher proposals"),
	vpnGatewayId: z.string().uuid().describe("ID of the VPN gateway"),
	customerGatewayId: z.string().uuid().describe("ID of the customer gateway"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags to apply"),
	isIpv6: z.boolean().optional().describe("Whether the tunnel uses IPv6"),
	enableRoutePropagation: z.boolean().optional().describe("Enable BGP dynamic route propagation"),
	bgpConfigIpv4: BgpConfig.optional().describe("BGP configuration for IPv4"),
	bgpConfigIpv6: BgpConfig.optional().describe("BGP configuration for IPv6"),
});
export type CreateConnectionParams = z.infer<typeof CreateConnectionParams>;

export const UpdateConnectionParams = z.object({
	region: ScalewayRegion.describe("Region of the connection"),
	connectionId: z.string().uuid().describe("ID of the connection"),
	name: z.string().min(1).optional().describe("New name"),
	tags: z.array(z.string()).optional().describe("New tags"),
});
export type UpdateConnectionParams = z.infer<typeof UpdateConnectionParams>;

export const DeleteConnectionParams = z.object({
	region: ScalewayRegion.describe("Region of the connection"),
	connectionId: z.string().uuid().describe("ID of the connection to delete"),
});
export type DeleteConnectionParams = z.infer<typeof DeleteConnectionParams>;

export const RenewConnectionPskParams = z.object({
	region: ScalewayRegion.describe("Region of the connection"),
	connectionId: z.string().uuid().describe("ID of the connection"),
});
export type RenewConnectionPskParams = z.infer<typeof RenewConnectionPskParams>;

export const ChangeConnectionPskParams = z.object({
	region: ScalewayRegion.describe("Region of the connection"),
	connectionId: z.string().uuid().describe("ID of the connection"),
	secretId: z.string().uuid().describe("Secret Manager secret ID holding the new pre-shared key"),
	secretRevision: z
		.number()
		.int()
		.nonnegative()
		.optional()
		.describe("Secret revision to use (defaults to latest)"),
});
export type ChangeConnectionPskParams = z.infer<typeof ChangeConnectionPskParams>;

export const SetConnectionRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region of the connection"),
	connectionId: z.string().uuid().describe("ID of the connection"),
	routingPolicyV4: z.string().uuid().optional().describe("ID of the IPv4 routing policy to set"),
	routingPolicyV6: z.string().uuid().optional().describe("ID of the IPv6 routing policy to set"),
});
export type SetConnectionRoutingPolicyParams = z.infer<typeof SetConnectionRoutingPolicyParams>;

export const DetachConnectionRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region of the connection"),
	connectionId: z.string().uuid().describe("ID of the connection"),
	routingPolicyV4: z.string().uuid().optional().describe("ID of the IPv4 routing policy to detach"),
	routingPolicyV6: z.string().uuid().optional().describe("ID of the IPv6 routing policy to detach"),
});
export type DetachConnectionRoutingPolicyParams = z.infer<
	typeof DetachConnectionRoutingPolicyParams
>;

export const RoutePropagationParams = z.object({
	region: ScalewayRegion.describe("Region of the connection"),
	connectionId: z.string().uuid().describe("ID of the connection"),
});
export type RoutePropagationParams = z.infer<typeof RoutePropagationParams>;

// --- Routing Policy ---

export const RoutingPolicy = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	organization_id: z.string().uuid(),
	name: z.string(),
	tags: z.array(z.string()),
	is_ipv6: z.boolean(),
	prefix_filter_in: z.array(z.string()),
	prefix_filter_out: z.array(z.string()),
	region: z.string(),
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
});
export type RoutingPolicy = z.infer<typeof RoutingPolicy>;

export const ListRoutingPoliciesParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list routing policies in (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by routing policy name"),
	isIpv6: z.boolean().optional().describe("Filter by IP version"),
});
export type ListRoutingPoliciesParams = z.infer<typeof ListRoutingPoliciesParams>;

export const ListRoutingPoliciesResponse = z.object({
	routing_policies: z.array(RoutingPolicy),
	total_count: z.number().int().nonnegative(),
});
export type ListRoutingPoliciesResponse = z.infer<typeof ListRoutingPoliciesResponse>;

export const GetRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region of the routing policy"),
	routingPolicyId: z.string().uuid().describe("ID of the routing policy"),
});
export type GetRoutingPolicyParams = z.infer<typeof GetRoutingPolicyParams>;

export const CreateRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region for the routing policy"),
	name: z.string().min(1).describe("Name for the routing policy"),
	isIpv6: z.boolean().describe("Whether this policy applies to IPv6 prefixes"),
	prefixFilterIn: z.array(z.string()).describe("CIDR prefixes to accept from the peer (inbound)"),
	prefixFilterOut: z
		.array(z.string())
		.describe("CIDR prefixes to advertise to the peer (outbound)"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags to apply"),
});
export type CreateRoutingPolicyParams = z.infer<typeof CreateRoutingPolicyParams>;

export const UpdateRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region of the routing policy"),
	routingPolicyId: z.string().uuid().describe("ID of the routing policy"),
	name: z.string().min(1).optional().describe("New name"),
	tags: z.array(z.string()).optional().describe("New tags"),
	prefixFilterIn: z.array(z.string()).optional().describe("New inbound CIDR prefixes"),
	prefixFilterOut: z.array(z.string()).optional().describe("New outbound CIDR prefixes"),
});
export type UpdateRoutingPolicyParams = z.infer<typeof UpdateRoutingPolicyParams>;

export const DeleteRoutingPolicyParams = z.object({
	region: ScalewayRegion.describe("Region of the routing policy"),
	routingPolicyId: z.string().uuid().describe("ID of the routing policy to delete"),
});
export type DeleteRoutingPolicyParams = z.infer<typeof DeleteRoutingPolicyParams>;
