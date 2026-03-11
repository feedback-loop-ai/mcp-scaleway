import { z } from "zod";
import { PaginationParams, ScalewayZone } from "../../shared/types.js";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const GatewayStatus = z.enum([
	"unknown_status",
	"stopped",
	"allocating",
	"configuring",
	"running",
	"stopping",
	"failed",
	"deleting",
	"locked",
]);

export const GatewayNetworkStatus = z.enum([
	"unknown_status",
	"created",
	"attaching",
	"configuring",
	"ready",
	"detaching",
]);

export const PatRuleProtocol = z.enum(["unknown_protocol", "both", "tcp", "udp"]);

export const ListGatewaysOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"name_asc",
	"name_desc",
	"type_asc",
	"type_desc",
	"status_asc",
	"status_desc",
]);

export const ListGatewayNetworksOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"status_asc",
	"status_desc",
]);

export const ListPatRulesOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"public_port_asc",
	"public_port_desc",
]);

export const ListIPsOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"address_asc",
	"address_desc",
	"reverse_asc",
	"reverse_desc",
]);

export const ListDHCPsOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"subnet_asc",
	"subnet_desc",
]);

// ─── Gateway Schemas ─────────────────────────────────────────────────────────

export const ListGatewaysParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	orderBy: ListGatewaysOrderBy.optional().describe("Order in which to return results"),
	organizationId: z.string().uuid().optional().describe("Filter by Organization ID"),
	projectId: z.string().uuid().optional().describe("Filter by Project ID"),
	name: z.string().optional().describe("Filter by gateway name (partial match)"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	types: z.array(z.string()).optional().describe("Filter by gateway types"),
	status: z.array(GatewayStatus).optional().describe("Filter by status"),
	privateNetworkIds: z
		.array(z.string().uuid())
		.optional()
		.describe("Filter by attached Private Network IDs"),
	includeLegacy: z.boolean().optional().describe("Include legacy gateways"),
});

export const GetGatewayParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	gatewayId: z.string().uuid().describe("ID of the gateway to fetch"),
});

export const CreateGatewayParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	projectId: z.string().uuid().optional().describe("Project to create the gateway in"),
	name: z.string().optional().describe("Name for the gateway"),
	tags: z.array(z.string()).optional().describe("Tags for the gateway"),
	type: z.string().describe("Gateway type (commercial offer type, e.g., VPC-GW-S)"),
	ipId: z.string().uuid().optional().describe("Existing IP address ID to attach"),
	enableSmtp: z.boolean().describe("Allow SMTP traffic through the gateway"),
	enableBastion: z.boolean().describe("Enable SSH bastion on the gateway"),
	bastionPort: z.number().int().optional().describe("Port for the SSH bastion"),
});

export const UpdateGatewayParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	gatewayId: z.string().uuid().describe("ID of the gateway to update"),
	name: z.string().optional().describe("New name for the gateway"),
	tags: z.array(z.string()).optional().describe("New tags for the gateway"),
	enableBastion: z.boolean().optional().describe("Enable/disable SSH bastion"),
	bastionPort: z.number().int().optional().describe("Port for the SSH bastion"),
	enableSmtp: z.boolean().optional().describe("Allow/disallow SMTP traffic"),
});

export const DeleteGatewayParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	gatewayId: z.string().uuid().describe("ID of the gateway to delete"),
	deleteIp: z.boolean().describe("Whether to also delete the gateway's IP address"),
});

// ─── Gateway Network Schemas ─────────────────────────────────────────────────

export const ListGatewayNetworksParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	orderBy: ListGatewayNetworksOrderBy.optional().describe("Order in which to return results"),
	status: z.array(GatewayNetworkStatus).optional().describe("Filter by status"),
	gatewayIds: z.array(z.string().uuid()).optional().describe("Filter by gateway IDs"),
	privateNetworkIds: z
		.array(z.string().uuid())
		.optional()
		.describe("Filter by Private Network IDs"),
	masqueradeEnabled: z.boolean().optional().describe("Filter by masquerade setting"),
});

export const GetGatewayNetworkParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	gatewayNetworkId: z.string().uuid().describe("ID of the GatewayNetwork to fetch"),
});

export const CreateGatewayNetworkParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	gatewayId: z.string().uuid().describe("Public Gateway to connect"),
	privateNetworkId: z.string().uuid().describe("Private Network to connect"),
	enableMasquerade: z.boolean().describe("Enable masquerade (dynamic NAT)"),
	pushDefaultRoute: z.boolean().describe("Push default route (also enables masquerading)"),
	ipamIpId: z
		.string()
		.uuid()
		.optional()
		.describe("IPAM-booked IP ID for the Gateway in this Private Network"),
});

export const UpdateGatewayNetworkParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	gatewayNetworkId: z.string().uuid().describe("ID of the GatewayNetwork to update"),
	enableMasquerade: z.boolean().optional().describe("Enable/disable masquerade (dynamic NAT)"),
	pushDefaultRoute: z.boolean().optional().describe("Enable/disable default route push"),
	ipamIpId: z.string().uuid().optional().describe("IPAM-booked IP ID"),
});

export const DeleteGatewayNetworkParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	gatewayNetworkId: z.string().uuid().describe("ID of the GatewayNetwork to delete"),
});

// ─── DHCP Schemas (v1 API) ───────────────────────────────────────────────────

export const ListDHCPsParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	orderBy: ListDHCPsOrderBy.optional().describe("Order in which to return results"),
	organizationId: z.string().uuid().optional().describe("Filter by Organization ID"),
	projectId: z.string().uuid().optional().describe("Filter by Project ID"),
	address: z.string().optional().describe("Filter by DHCP server IP address"),
	hasAddress: z.string().optional().describe("Filter for subnets containing this IP"),
});

export const GetDHCPParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	dhcpId: z.string().uuid().describe("ID of the DHCP configuration to fetch"),
});

export const CreateDHCPParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	projectId: z.string().uuid().optional().describe("Project to create the DHCP configuration in"),
	subnet: z.string().describe("Subnet for the DHCP server (CIDR notation)"),
	address: z.string().optional().describe("IP address of the DHCP server in the Private Network"),
	poolLow: z.string().optional().describe("Low IP (inclusive) of the dynamic address pool"),
	poolHigh: z.string().optional().describe("High IP (inclusive) of the dynamic address pool"),
	enableDynamic: z.boolean().optional().describe("Enable dynamic pooling of IPs"),
	validLifetime: z.string().optional().describe("How long DHCP entries will be valid for"),
	renewTimer: z.string().optional().describe("After how long a renew will be attempted"),
	rebindTimer: z
		.string()
		.optional()
		.describe("After how long a DHCP client will query for a new lease"),
	pushDefaultRoute: z.boolean().optional().describe("Push a default route to DHCP clients"),
	pushDnsServer: z.boolean().optional().describe("Push custom DNS servers to clients"),
	dnsServersOverride: z
		.array(z.string())
		.optional()
		.describe("DNS server IPs to override the default list"),
	dnsSearch: z.array(z.string()).optional().describe("Search paths for DNS configuration"),
	dnsLocalName: z.string().optional().describe("TLD for hostnames in Private Networks"),
});

export const UpdateDHCPParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	dhcpId: z.string().uuid().describe("ID of the DHCP configuration to update"),
	subnet: z.string().optional().describe("Subnet for the DHCP server"),
	address: z.string().optional().describe("IP address of the DHCP server"),
	poolLow: z.string().optional().describe("Low IP of the dynamic address pool"),
	poolHigh: z.string().optional().describe("High IP of the dynamic address pool"),
	enableDynamic: z.boolean().optional().describe("Enable dynamic pooling"),
	validLifetime: z.string().optional().describe("DHCP entry validity duration"),
	renewTimer: z.string().optional().describe("Renew attempt interval"),
	rebindTimer: z.string().optional().describe("Rebind query interval"),
	pushDefaultRoute: z.boolean().optional().describe("Push default route to clients"),
	pushDnsServer: z.boolean().optional().describe("Push DNS servers to clients"),
	dnsServersOverride: z.array(z.string()).optional().describe("Override DNS server list"),
	dnsSearch: z.array(z.string()).optional().describe("DNS search paths"),
	dnsLocalName: z.string().optional().describe("TLD for Private Network hostnames"),
});

export const DeleteDHCPParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	dhcpId: z.string().uuid().describe("ID of the DHCP configuration to delete"),
});

// ─── PAT Rule Schemas ────────────────────────────────────────────────────────

export const ListPatRulesParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	orderBy: ListPatRulesOrderBy.optional().describe("Order in which to return results"),
	gatewayIds: z.array(z.string().uuid()).optional().describe("Filter by gateway IDs"),
	privateIps: z.array(z.string()).optional().describe("Filter by private IPs"),
	protocol: PatRuleProtocol.optional().describe("Filter by protocol"),
});

export const GetPatRuleParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	patRuleId: z.string().uuid().describe("ID of the PAT rule to fetch"),
});

export const CreatePatRuleParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	gatewayId: z.string().uuid().describe("ID of the Gateway to create the rule on"),
	publicPort: z.number().int().min(1).max(65535).describe("Public port to listen on"),
	privateIp: z.string().describe("Private IP to forward data to"),
	privatePort: z.number().int().min(1).max(65535).describe("Private port to translate to"),
	protocol: PatRuleProtocol.optional().describe("Protocol the rule applies to"),
});

export const UpdatePatRuleParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	patRuleId: z.string().uuid().describe("ID of the PAT rule to update"),
	publicPort: z.number().int().min(1).max(65535).optional().describe("Public port to listen on"),
	privateIp: z.string().optional().describe("Private IP to forward data to"),
	privatePort: z
		.number()
		.int()
		.min(1)
		.max(65535)
		.optional()
		.describe("Private port to translate to"),
	protocol: PatRuleProtocol.optional().describe("Protocol the rule applies to"),
});

export const DeletePatRuleParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	patRuleId: z.string().uuid().describe("ID of the PAT rule to delete"),
});

// ─── IP Schemas ──────────────────────────────────────────────────────────────

export const ListIPsParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	orderBy: ListIPsOrderBy.optional().describe("Order in which to return results"),
	organizationId: z.string().uuid().optional().describe("Filter by Organization ID"),
	projectId: z.string().uuid().optional().describe("Filter by Project ID"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	reverse: z.string().optional().describe("Filter by reverse DNS (partial match)"),
	isFree: z.boolean().optional().describe("Filter for unattached IPs"),
});

export const GetIPParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	ipId: z.string().uuid().describe("ID of the IP address to fetch"),
});

export const CreateIPParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	projectId: z.string().uuid().optional().describe("Project to create the IP in"),
	tags: z.array(z.string()).optional().describe("Tags for the IP address"),
});

export const UpdateIPParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	ipId: z.string().uuid().describe("ID of the IP address to update"),
	tags: z.array(z.string()).optional().describe("Tags for the IP address"),
	reverse: z.string().optional().describe("Reverse DNS (empty string to unset)"),
	gatewayId: z.string().optional().describe("Gateway ID to attach (empty string to detach)"),
});

export const DeleteIPParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
	ipId: z.string().uuid().describe("ID of the IP address to delete"),
});

// ─── Gateway Types Schema ────────────────────────────────────────────────────

export const ListGatewayTypesParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-1)"),
});
