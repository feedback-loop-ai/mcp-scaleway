import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

export const ResourceType = z.enum([
	"unknown_type",
	"custom",
	"instance_server",
	"instance_ip",
	"instance_private_nic",
	"lb_server",
	"fip_ip",
	"vpc_gateway",
	"vpc_gateway_network",
	"k8s_node",
	"k8s_cluster",
	"rdb_instance",
	"redis_cluster",
	"baremetal_server",
	"baremetal_private_nic",
	"llm_deployment",
	"mgdb_instance",
	"apple_silicon_server",
	"apple_silicon_private_nic",
]);
export type ResourceType = z.infer<typeof ResourceType>;

export const ListIPsOrderBy = z.enum([
	"created_at_desc",
	"created_at_asc",
	"updated_at_desc",
	"updated_at_asc",
	"attached_at_desc",
	"attached_at_asc",
]);
export type ListIPsOrderBy = z.infer<typeof ListIPsOrderBy>;

// --- Nested objects ---

export const Source = z.object({
	zonal: z.string().nullable().optional().describe("Zone identifier"),
	private_network_id: z.string().uuid().nullable().optional().describe("Private network ID"),
	subnet_id: z.string().uuid().nullable().optional().describe("Subnet ID"),
});
export type Source = z.infer<typeof Source>;

export const Resource = z.object({
	type: ResourceType.describe("Resource type"),
	id: z.string().uuid().describe("Resource ID"),
	mac_address: z.string().nullable().optional().describe("MAC address"),
	name: z.string().nullable().optional().describe("Resource name"),
});
export type Resource = z.infer<typeof Resource>;

export const Reverse = z.object({
	hostname: z.string().describe("Reverse DNS hostname"),
	address: z.string().nullable().optional().describe("IP address for the reverse"),
});
export type Reverse = z.infer<typeof Reverse>;

export const CustomResource = z.object({
	mac_address: z.string().describe("MAC address for the custom resource"),
	name: z.string().optional().describe("Optional name for the custom resource"),
});
export type CustomResource = z.infer<typeof CustomResource>;

// --- Tool input schemas ---

export const ListIPsInput = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list IPs in (e.g., fr-par)"),
	order_by: ListIPsOrderBy.optional().default("created_at_desc").describe("Sort order"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	zonal: z.string().optional().describe("Filter by zone"),
	private_network_id: z.string().uuid().optional().describe("Filter by private network ID"),
	subnet_id: z.string().uuid().optional().describe("Filter by subnet ID"),
	vpc_id: z.string().uuid().optional().describe("Filter by VPC ID"),
	attached: z
		.boolean()
		.optional()
		.describe("Filter by attached status (true=attached, false=detached)"),
	resource_type: ResourceType.optional().describe("Filter by resource type"),
	resource_id: z.string().uuid().optional().describe("Filter by resource ID"),
	mac_address: z.string().optional().describe("Filter by MAC address"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	is_ipv6: z.boolean().optional().describe("Filter by IPv6 status"),
	resource_name: z.string().optional().describe("Filter by resource name"),
	organization_id: z.string().uuid().optional().describe("Filter by organization ID"),
});
export type ListIPsInput = z.infer<typeof ListIPsInput>;

export const GetIPInput = z.object({
	region: ScalewayRegion.describe("Region of the IP (e.g., fr-par)"),
	ip_id: z.string().uuid().describe("ID of the IP to retrieve"),
});
export type GetIPInput = z.infer<typeof GetIPInput>;

export const BookIPInput = z.object({
	region: ScalewayRegion.describe("Region to book the IP in (e.g., fr-par)"),
	project_id: z.string().uuid().describe("Project ID to book the IP in"),
	source: Source.describe("Source for the IP (zonal, private_network_id, or subnet_id)"),
	is_ipv6: z.boolean().optional().default(false).describe("Whether to book an IPv6 address"),
	address: z
		.string()
		.optional()
		.describe(
			"Specific IP address to book (CIDR notation). If not set, an address is auto-allocated",
		),
	tags: z.array(z.string()).optional().default([]).describe("Tags for the IP"),
	resource: CustomResource.optional().describe(
		"Custom resource to attach the IP to (only for type=custom)",
	),
});
export type BookIPInput = z.infer<typeof BookIPInput>;

export const ReleaseIPInput = z.object({
	region: ScalewayRegion.describe("Region of the IP (e.g., fr-par)"),
	ip_id: z.string().uuid().describe("ID of the IP to release"),
});
export type ReleaseIPInput = z.infer<typeof ReleaseIPInput>;

export const UpdateIPInput = z.object({
	region: ScalewayRegion.describe("Region of the IP (e.g., fr-par)"),
	ip_id: z.string().uuid().describe("ID of the IP to update"),
	tags: z.array(z.string()).optional().describe("New tags for the IP"),
	reverses: z.array(Reverse).optional().describe("New reverse DNS entries for the IP"),
});
export type UpdateIPInput = z.infer<typeof UpdateIPInput>;
