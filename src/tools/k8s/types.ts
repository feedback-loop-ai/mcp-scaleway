import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

export const ClusterStatus = z.enum([
	"unknown",
	"creating",
	"ready",
	"deleting",
	"deleted",
	"updating",
	"locked",
	"pool_required",
]);
export type ClusterStatus = z.infer<typeof ClusterStatus>;

export const ClusterCni = z.enum(["unknown_cni", "cilium", "calico", "kilo", "flannel", "none"]);
export type ClusterCni = z.infer<typeof ClusterCni>;

export const ClusterType = z.enum(["unknown", "kapsule", "multicloud"]);
export type ClusterType = z.infer<typeof ClusterType>;

export const PoolStatus = z.enum([
	"unknown",
	"ready",
	"deleting",
	"creating",
	"scaling",
	"warning",
	"locked",
	"upgrading",
]);
export type PoolStatus = z.infer<typeof PoolStatus>;

// --- Tool Input Schemas ---

export const ListClustersInput = PaginationParams.extend({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par, nl-ams, pl-waw)"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by cluster name"),
	status: ClusterStatus.optional().describe("Filter by cluster status"),
	type: ClusterType.optional().describe("Filter by cluster type"),
});
export type ListClustersInput = z.infer<typeof ListClustersInput>;

export const GetClusterInput = z.object({
	region: ScalewayRegion.describe("Scaleway region"),
	cluster_id: z.string().uuid().describe("Cluster unique identifier"),
});
export type GetClusterInput = z.infer<typeof GetClusterInput>;

export const CreateClusterInput = z.object({
	region: ScalewayRegion.describe("Scaleway region"),
	name: z.string().min(1).describe("Cluster name"),
	version: z.string().min(1).describe("Kubernetes version (e.g., 1.30.2)"),
	cni: ClusterCni.describe("Container Network Interface plugin"),
	description: z.string().optional().describe("Cluster description"),
	tags: z.array(z.string()).optional().describe("User-defined tags"),
	type: ClusterType.optional().describe("Cluster type (kapsule or multicloud)"),
	project_id: z.string().uuid().optional().describe("Project ID (uses default if not provided)"),
});
export type CreateClusterInput = z.infer<typeof CreateClusterInput>;

export const DeleteClusterInput = z.object({
	region: ScalewayRegion.describe("Scaleway region"),
	cluster_id: z.string().uuid().describe("Cluster unique identifier"),
	with_additional_resources: z
		.boolean()
		.optional()
		.describe("Delete additional resources (LBs, volumes)"),
});
export type DeleteClusterInput = z.infer<typeof DeleteClusterInput>;

export const UpgradeClusterInput = z.object({
	region: ScalewayRegion.describe("Scaleway region"),
	cluster_id: z.string().uuid().describe("Cluster unique identifier"),
	version: z.string().min(1).describe("Target Kubernetes version"),
	upgrade_pools: z.boolean().optional().describe("Also upgrade all pools to the new version"),
});
export type UpgradeClusterInput = z.infer<typeof UpgradeClusterInput>;

export const ListClusterAvailableVersionsInput = z.object({
	region: ScalewayRegion.describe("Scaleway region"),
	cluster_id: z.string().uuid().describe("Cluster unique identifier"),
});
export type ListClusterAvailableVersionsInput = z.infer<typeof ListClusterAvailableVersionsInput>;

export const GetClusterKubeconfigInput = z.object({
	region: ScalewayRegion.describe("Scaleway region"),
	cluster_id: z.string().uuid().describe("Cluster unique identifier"),
});
export type GetClusterKubeconfigInput = z.infer<typeof GetClusterKubeconfigInput>;

// --- Node Pool Inputs ---

export const ListPoolsInput = PaginationParams.extend({
	region: ScalewayRegion.describe("Scaleway region"),
	cluster_id: z.string().uuid().describe("Cluster unique identifier"),
	name: z.string().optional().describe("Filter by pool name"),
	status: PoolStatus.optional().describe("Filter by pool status"),
});
export type ListPoolsInput = z.infer<typeof ListPoolsInput>;

export const GetPoolInput = z.object({
	region: ScalewayRegion.describe("Scaleway region"),
	pool_id: z.string().uuid().describe("Node pool unique identifier"),
});
export type GetPoolInput = z.infer<typeof GetPoolInput>;

export const CreatePoolInput = z.object({
	region: ScalewayRegion.describe("Scaleway region"),
	cluster_id: z.string().uuid().describe("Cluster unique identifier"),
	name: z.string().min(1).describe("Node pool name"),
	node_type: z.string().min(1).describe("Commercial node type (e.g., DEV1-M, GP1-S)"),
	size: z.number().int().min(1).describe("Number of nodes"),
	min_size: z.number().int().min(0).optional().describe("Minimum nodes for autoscaling"),
	max_size: z.number().int().min(1).optional().describe("Maximum nodes for autoscaling"),
	autoscaling: z.boolean().optional().describe("Enable autoscaling"),
	autohealing: z.boolean().optional().describe("Enable autohealing"),
	tags: z.array(z.string()).optional().describe("User-defined tags"),
});
export type CreatePoolInput = z.infer<typeof CreatePoolInput>;

export const UpdatePoolInput = z.object({
	region: ScalewayRegion.describe("Scaleway region"),
	pool_id: z.string().uuid().describe("Node pool unique identifier"),
	size: z.number().int().min(0).optional().describe("Number of nodes"),
	min_size: z.number().int().min(0).optional().describe("Minimum nodes for autoscaling"),
	max_size: z.number().int().min(1).optional().describe("Maximum nodes for autoscaling"),
	autoscaling: z.boolean().optional().describe("Enable autoscaling"),
	autohealing: z.boolean().optional().describe("Enable autohealing"),
	tags: z.array(z.string()).optional().describe("User-defined tags"),
});
export type UpdatePoolInput = z.infer<typeof UpdatePoolInput>;

export const DeletePoolInput = z.object({
	region: ScalewayRegion.describe("Scaleway region"),
	pool_id: z.string().uuid().describe("Node pool unique identifier"),
});
export type DeletePoolInput = z.infer<typeof DeletePoolInput>;

export const UpgradePoolInput = z.object({
	region: ScalewayRegion.describe("Scaleway region"),
	pool_id: z.string().uuid().describe("Node pool unique identifier"),
	version: z.string().min(1).describe("Target Kubernetes version"),
});
export type UpgradePoolInput = z.infer<typeof UpgradePoolInput>;
