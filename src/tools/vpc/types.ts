import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- VPC Schemas ---

export const ListVpcsInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par)"),
	...PaginationParams.shape,
	name: z.string().optional().describe("Filter by VPC name"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
});
export type ListVpcsInput = z.infer<typeof ListVpcsInput>;

export const GetVpcInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par)"),
	vpc_id: z.string().uuid().describe("VPC ID"),
});
export type GetVpcInput = z.infer<typeof GetVpcInput>;

export const CreateVpcInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par)"),
	name: z.string().min(1).describe("VPC name"),
	project_id: z.string().uuid().describe("Project ID"),
	tags: z.array(z.string()).optional().describe("Tags for the VPC"),
});
export type CreateVpcInput = z.infer<typeof CreateVpcInput>;

export const UpdateVpcInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par)"),
	vpc_id: z.string().uuid().describe("VPC ID"),
	name: z.string().min(1).optional().describe("New VPC name"),
	tags: z.array(z.string()).optional().describe("New tags for the VPC"),
});
export type UpdateVpcInput = z.infer<typeof UpdateVpcInput>;

export const DeleteVpcInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par)"),
	vpc_id: z.string().uuid().describe("VPC ID"),
});
export type DeleteVpcInput = z.infer<typeof DeleteVpcInput>;

// --- Private Network Schemas ---

export const ListPrivateNetworksInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par)"),
	...PaginationParams.shape,
	name: z.string().optional().describe("Filter by private network name"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	vpc_id: z.string().uuid().optional().describe("Filter by VPC ID"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
});
export type ListPrivateNetworksInput = z.infer<typeof ListPrivateNetworksInput>;

export const GetPrivateNetworkInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par)"),
	private_network_id: z.string().uuid().describe("Private Network ID"),
});
export type GetPrivateNetworkInput = z.infer<typeof GetPrivateNetworkInput>;

export const CreatePrivateNetworkInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par)"),
	name: z.string().min(1).describe("Private network name"),
	project_id: z.string().uuid().describe("Project ID"),
	vpc_id: z.string().uuid().describe("VPC ID to attach the private network to"),
	tags: z.array(z.string()).optional().describe("Tags for the private network"),
	subnets: z.array(z.string()).optional().describe("CIDR subnets (e.g., ['192.168.1.0/24'])"),
});
export type CreatePrivateNetworkInput = z.infer<typeof CreatePrivateNetworkInput>;

export const UpdatePrivateNetworkInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par)"),
	private_network_id: z.string().uuid().describe("Private Network ID"),
	name: z.string().min(1).optional().describe("New private network name"),
	tags: z.array(z.string()).optional().describe("New tags"),
	subnets: z.array(z.string()).optional().describe("New CIDR subnets (e.g., ['192.168.1.0/24'])"),
});
export type UpdatePrivateNetworkInput = z.infer<typeof UpdatePrivateNetworkInput>;

export const DeletePrivateNetworkInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par)"),
	private_network_id: z.string().uuid().describe("Private Network ID"),
});
export type DeletePrivateNetworkInput = z.infer<typeof DeletePrivateNetworkInput>;

// --- Response types ---

export interface Vpc {
	id: string;
	name: string;
	region: string;
	project_id: string;
	tags: string[];
	is_default: boolean;
	private_network_count: number;
	created_at: string;
	updated_at: string;
}

export interface Subnet {
	id: string;
	subnet: string;
	created_at: string;
	updated_at: string;
}

export interface PrivateNetwork {
	id: string;
	name: string;
	vpc_id: string;
	region: string;
	project_id: string;
	tags: string[];
	subnets: Subnet[];
	created_at: string;
	updated_at: string;
}
