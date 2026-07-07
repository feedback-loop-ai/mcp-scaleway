import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

export const ClusterStatus = z.enum([
	"unknown_status",
	"ready",
	"creating",
	"configuring",
	"deleting",
	"error",
	"locked",
	"stopped",
]);
export type ClusterStatus = z.infer<typeof ClusterStatus>;

export const VolumeType = z.enum(["unknown_type", "sbs_5k", "sbs_15k"]);
export type VolumeType = z.infer<typeof VolumeType>;

export const NodeTypeStock = z.enum(["unknown_stock", "low_stock", "out_of_stock", "available"]);
export type NodeTypeStock = z.infer<typeof NodeTypeStock>;

export const ClustersOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"name_asc",
	"name_desc",
	"status_asc",
	"status_desc",
]);
export type ClustersOrderBy = z.infer<typeof ClustersOrderBy>;

export const UsersOrderBy = z.enum(["name_asc", "name_desc"]);
export type UsersOrderBy = z.infer<typeof UsersOrderBy>;

// --- Entity Schemas ---

export const Volume = z.object({
	type: VolumeType,
	size_bytes: z.number().int().nonnegative(),
});
export type Volume = z.infer<typeof Volume>;

export const ClusterSetting = z.object({
	name: z.string(),
	bool_value: z.boolean().nullish(),
	string_value: z.string().nullish(),
	int_value: z.number().int().nullish(),
	float_value: z.number().nullish(),
});
export type ClusterSetting = z.infer<typeof ClusterSetting>;

export const EndpointPrivateNetworkDetails = z.object({
	private_network_id: z.string().uuid(),
});
export type EndpointPrivateNetworkDetails = z.infer<typeof EndpointPrivateNetworkDetails>;

export const EndpointPublicDetails = z.object({}).passthrough();
export type EndpointPublicDetails = z.infer<typeof EndpointPublicDetails>;

export const Endpoint = z.object({
	id: z.string().uuid(),
	dns_records: z.array(z.string()).optional(),
	port: z.number().int().optional(),
	private_network: EndpointPrivateNetworkDetails.nullish(),
	public_network: EndpointPublicDetails.nullish(),
});
export type Endpoint = z.infer<typeof Endpoint>;

export const Cluster = z.object({
	id: z.string().uuid(),
	name: z.string(),
	project_id: z.string().uuid(),
	organization_id: z.string().uuid(),
	status: ClusterStatus,
	version: z.string(),
	tags: z.array(z.string()),
	settings: z.array(ClusterSetting).optional(),
	node_amount: z.number().int(),
	node_type: z.string(),
	volume: Volume.nullish(),
	endpoints: z.array(Endpoint).optional(),
	created_at: z.string().datetime({ offset: true }).nullish(),
	updated_at: z.string().datetime({ offset: true }).nullish(),
	region: z.string(),
});
export type Cluster = z.infer<typeof Cluster>;

export const User = z.object({
	username: z.string(),
});
export type User = z.infer<typeof User>;

export const NodeTypeVolumeType = z.object({
	type: VolumeType,
	description: z.string(),
	min_size_bytes: z.number().int().nonnegative(),
	max_size_bytes: z.number().int().nonnegative(),
	chunk_size_bytes: z.number().int().nonnegative(),
});
export type NodeTypeVolumeType = z.infer<typeof NodeTypeVolumeType>;

export const NodeType = z.object({
	name: z.string(),
	stock_status: NodeTypeStock,
	description: z.string(),
	vcpus: z.number().int(),
	memory_bytes: z.number().int().nonnegative(),
	available_volume_types: z.array(NodeTypeVolumeType).optional(),
	disabled: z.boolean(),
	beta: z.boolean(),
	cluster_range: z.string().optional(),
});
export type NodeType = z.infer<typeof NodeType>;

export const VersionAvailableSetting = z.object({
	name: z.string(),
	hot_configurable: z.boolean(),
	description: z.string(),
});
export type VersionAvailableSetting = z.infer<typeof VersionAvailableSetting>;

export const Version = z.object({
	version: z.string(),
	end_of_life_at: z.string().datetime({ offset: true }).nullish(),
	available_settings: z.array(VersionAvailableSetting).optional(),
});
export type Version = z.infer<typeof Version>;

// --- Reusable input shape: endpoint spec ---

export const EndpointSpec = z
	.object({
		privateNetworkId: z
			.string()
			.uuid()
			.optional()
			.describe("Attach the endpoint to this Private Network"),
		publicNetwork: z
			.boolean()
			.optional()
			.describe("Set to true to request a public network endpoint"),
	})
	.describe("Endpoint specification (choose private network or public network)");
export type EndpointSpec = z.infer<typeof EndpointSpec>;

// --- Cluster Tool Params ---

export const ListClustersParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list clusters in (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Filter by Project ID"),
	organizationId: z.string().uuid().optional().describe("Filter by Organization ID"),
	name: z.string().optional().describe("Filter by cluster name"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	orderBy: ClustersOrderBy.optional().describe("Order results by field"),
});
export type ListClustersParams = z.infer<typeof ListClustersParams>;

export const ListClustersResponse = z.object({
	clusters: z.array(Cluster),
	total_count: z.number().int().nonnegative(),
});
export type ListClustersResponse = z.infer<typeof ListClustersResponse>;

export const GetClusterParams = z.object({
	region: ScalewayRegion.describe("Region of the cluster"),
	clusterId: z.string().uuid().describe("ID of the Kafka cluster"),
});
export type GetClusterParams = z.infer<typeof GetClusterParams>;

export const CreateClusterParams = z.object({
	region: ScalewayRegion.describe("Region for the cluster"),
	name: z.string().min(1).describe("Name of the Kafka cluster"),
	version: z.string().min(1).describe("Kafka version (see list_versions)"),
	nodeType: z.string().min(1).describe("Node type (see list_node_types)"),
	nodeAmount: z.number().int().positive().describe("Number of nodes (brokers) in the cluster"),
	volumeSizeBytes: z.number().int().positive().describe("Volume size per node, in bytes"),
	volumeType: VolumeType.describe("Volume type (e.g. sbs_5k, sbs_15k)"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags to apply to the cluster"),
	userName: z.string().optional().describe("Name of the initial admin user"),
	password: z.string().optional().describe("Password for the initial admin user"),
	endpoints: z
		.array(EndpointSpec)
		.optional()
		.describe("Endpoints to create with the cluster (e.g. private network attachment)"),
});
export type CreateClusterParams = z.infer<typeof CreateClusterParams>;

export const UpdateClusterParams = z.object({
	region: ScalewayRegion.describe("Region of the cluster"),
	clusterId: z.string().uuid().describe("ID of the Kafka cluster"),
	name: z.string().min(1).optional().describe("New name for the cluster"),
	tags: z.array(z.string()).optional().describe("New set of tags (replaces existing)"),
});
export type UpdateClusterParams = z.infer<typeof UpdateClusterParams>;

export const DeleteClusterParams = z.object({
	region: ScalewayRegion.describe("Region of the cluster"),
	clusterId: z.string().uuid().describe("ID of the Kafka cluster to delete"),
});
export type DeleteClusterParams = z.infer<typeof DeleteClusterParams>;

export const GetClusterCertificateAuthorityParams = z.object({
	region: ScalewayRegion.describe("Region of the cluster"),
	clusterId: z.string().uuid().describe("ID of the Kafka cluster"),
});
export type GetClusterCertificateAuthorityParams = z.infer<
	typeof GetClusterCertificateAuthorityParams
>;

export const RenewClusterCertificateAuthorityParams = z.object({
	region: ScalewayRegion.describe("Region of the cluster"),
	clusterId: z.string().uuid().describe("ID of the Kafka cluster"),
});
export type RenewClusterCertificateAuthorityParams = z.infer<
	typeof RenewClusterCertificateAuthorityParams
>;

// --- Endpoint Tool Params ---

export const CreateEndpointParams = z.object({
	region: ScalewayRegion.describe("Region of the cluster"),
	clusterId: z.string().uuid().describe("ID of the Kafka cluster"),
	privateNetworkId: z
		.string()
		.uuid()
		.optional()
		.describe("Attach the endpoint to this Private Network"),
	publicNetwork: z
		.boolean()
		.optional()
		.describe("Set to true to request a public network endpoint"),
});
export type CreateEndpointParams = z.infer<typeof CreateEndpointParams>;

export const DeleteEndpointParams = z.object({
	region: ScalewayRegion.describe("Region of the endpoint"),
	endpointId: z.string().uuid().describe("ID of the endpoint to delete"),
});
export type DeleteEndpointParams = z.infer<typeof DeleteEndpointParams>;

// --- User Tool Params ---

export const ListUsersParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region of the cluster"),
	clusterId: z.string().uuid().describe("ID of the Kafka cluster"),
	name: z.string().optional().describe("Filter by username"),
	orderBy: UsersOrderBy.optional().describe("Order results by field"),
});
export type ListUsersParams = z.infer<typeof ListUsersParams>;

export const ListUsersResponse = z.object({
	users: z.array(User),
	total_count: z.number().int().nonnegative(),
});
export type ListUsersResponse = z.infer<typeof ListUsersResponse>;

export const UpdateUserParams = z.object({
	region: ScalewayRegion.describe("Region of the cluster"),
	clusterId: z.string().uuid().describe("ID of the Kafka cluster"),
	username: z.string().min(1).describe("Name of the user to update"),
	password: z.string().optional().describe("New password for the user"),
});
export type UpdateUserParams = z.infer<typeof UpdateUserParams>;

// --- Catalog Tool Params ---

export const ListNodeTypesParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list node types in"),
	includeDisabledTypes: z
		.boolean()
		.optional()
		.describe("Include disabled node types in the results"),
});
export type ListNodeTypesParams = z.infer<typeof ListNodeTypesParams>;

export const ListNodeTypesResponse = z.object({
	node_types: z.array(NodeType),
	total_count: z.number().int().nonnegative(),
});
export type ListNodeTypesResponse = z.infer<typeof ListNodeTypesResponse>;

export const ListVersionsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list versions in"),
	version: z.string().optional().describe("Filter by a specific version"),
});
export type ListVersionsParams = z.infer<typeof ListVersionsParams>;

export const ListVersionsResponse = z.object({
	versions: z.array(Version),
	total_count: z.number().int().nonnegative(),
});
export type ListVersionsResponse = z.infer<typeof ListVersionsResponse>;
