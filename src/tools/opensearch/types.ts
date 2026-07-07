import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

export const DeploymentStatus = z.enum([
	"unknown_status",
	"ready",
	"creating",
	"initializing",
	"upgrading",
	"deleting",
	"error",
	"locked",
	"locking",
	"unlocking",
]);
export type DeploymentStatus = z.infer<typeof DeploymentStatus>;

export const NodeTypeStockStatus = z.enum([
	"unknown_stock",
	"low_stock",
	"out_of_stock",
	"available",
]);
export type NodeTypeStockStatus = z.infer<typeof NodeTypeStockStatus>;

export const VolumeType = z.enum(["unknown_type", "sbs_5k", "sbs_15k"]);
export type VolumeType = z.infer<typeof VolumeType>;

export const DeploymentOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"name_asc",
	"name_desc",
	"updated_at_asc",
	"updated_at_desc",
]);
export type DeploymentOrderBy = z.infer<typeof DeploymentOrderBy>;

export const NodeTypeOrderBy = z.enum([
	"name_asc",
	"name_desc",
	"vcpus_asc",
	"vcpus_desc",
	"memory_asc",
	"memory_desc",
]);
export type NodeTypeOrderBy = z.infer<typeof NodeTypeOrderBy>;

export const UserOrderBy = z.enum(["name_asc", "name_desc"]);
export type UserOrderBy = z.infer<typeof UserOrderBy>;

export const VersionOrderBy = z.enum(["version_asc", "version_desc"]);
export type VersionOrderBy = z.infer<typeof VersionOrderBy>;

// --- Entity schemas (response shapes) ---

export const Volume = z.object({
	type: VolumeType,
	size_bytes: z.number().int().nonnegative(),
});
export type Volume = z.infer<typeof Volume>;

export const EndpointService = z.object({
	name: z.string(),
	port: z.number().int().nonnegative(),
	url: z.string(),
});
export type EndpointService = z.infer<typeof EndpointService>;

export const EndpointPrivateNetworkDetails = z.object({
	private_network_id: z.string(),
});
export type EndpointPrivateNetworkDetails = z.infer<typeof EndpointPrivateNetworkDetails>;

export const Endpoint = z.object({
	id: z.string().uuid(),
	dns_record: z.string().nullable().optional(),
	services: z.array(EndpointService),
	public: z.object({}).optional(),
	private_network: EndpointPrivateNetworkDetails.optional(),
});
export type Endpoint = z.infer<typeof Endpoint>;

export const Deployment = z.object({
	id: z.string().uuid(),
	name: z.string(),
	organization_id: z.string().uuid(),
	project_id: z.string().uuid(),
	status: DeploymentStatus,
	tags: z.array(z.string()),
	node_amount: z.number().int().nonnegative().optional(),
	node_count: z.number().int().nonnegative(),
	node_type: z.string(),
	volume: Volume.nullable(),
	endpoints: z.array(Endpoint),
	created_at: z.string().datetime({ offset: true }).nullable(),
	updated_at: z.string().datetime({ offset: true }).nullable(),
	version: z.string(),
	region: z.string(),
});
export type Deployment = z.infer<typeof Deployment>;

export const NodeTypeVolumeType = z.object({
	type: VolumeType,
	description: z.string(),
	min_size_bytes: z.number().int().nonnegative(),
	max_size_bytes: z.number().int().nonnegative(),
	chunk_size_bytes: z.number().int().nonnegative(),
});
export type NodeTypeVolumeType = z.infer<typeof NodeTypeVolumeType>;

export const NodeType = z.object({
	stock_status: NodeTypeStockStatus,
	name: z.string(),
	description: z.string(),
	vcpus: z.number().int().nonnegative(),
	memory_bytes: z.number().int().nonnegative(),
	disabled: z.boolean(),
	beta: z.boolean(),
	instance_range: z.string(),
	available_volume_types: z.array(NodeTypeVolumeType),
});
export type NodeType = z.infer<typeof NodeType>;

export const User = z.object({
	username: z.string(),
});
export type User = z.infer<typeof User>;

export const Version = z.object({
	version: z.string(),
	end_of_life: z.string().datetime({ offset: true }).nullable().optional(),
	disabled: z.boolean(),
	beta: z.boolean(),
});
export type Version = z.infer<typeof Version>;

// --- Shared input building blocks ---

export const VolumeInput = z.object({
	type: VolumeType.describe("Volume type (sbs_5k or sbs_15k)"),
	sizeBytes: z.number().int().positive().describe("Volume size in bytes"),
});
export type VolumeInput = z.infer<typeof VolumeInput>;

export const EndpointSpecInput = z
	.object({
		public: z
			.boolean()
			.optional()
			.describe("Set true to expose a public endpoint accessible from the internet"),
		privateNetworkId: z
			.string()
			.uuid()
			.optional()
			.describe("Private Network ID for a Private Network endpoint"),
	})
	.describe("Endpoint specification: exactly one of a public or private network endpoint");
export type EndpointSpecInput = z.infer<typeof EndpointSpecInput>;

// --- Deployment tool params ---

export const ListDeploymentsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list deployments in (e.g. fr-par)"),
	organizationId: z.string().uuid().optional().describe("Filter by organization ID"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by deployment name"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	orderBy: DeploymentOrderBy.optional().describe("Order results by field"),
});
export type ListDeploymentsParams = z.infer<typeof ListDeploymentsParams>;

export const GetDeploymentParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("ID of the deployment"),
});
export type GetDeploymentParams = z.infer<typeof GetDeploymentParams>;

export const CreateDeploymentParams = z.object({
	region: ScalewayRegion.describe("Region for the deployment"),
	name: z.string().min(1).describe("Name of the deployment"),
	nodeType: z.string().min(1).describe("Node type (e.g. SEARCHDB-SHARED-2C-8G)"),
	version: z.string().min(1).describe("OpenSearch version to use (e.g. 2.0)"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags to attach to the deployment"),
	nodeCount: z.number().int().positive().optional().describe("Number of nodes to allocate"),
	userName: z.string().optional().describe("Username of the initial deployment user"),
	password: z.string().optional().describe("Password of the initial deployment user"),
	volume: VolumeInput.optional().describe("Volume type and size"),
	endpoints: z
		.array(EndpointSpecInput)
		.optional()
		.describe("Endpoints to expose for the deployment"),
});
export type CreateDeploymentParams = z.infer<typeof CreateDeploymentParams>;

export const UpdateDeploymentParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("ID of the deployment to update"),
	name: z.string().min(1).optional().describe("New name for the deployment"),
	tags: z.array(z.string()).optional().describe("New tags for the deployment"),
});
export type UpdateDeploymentParams = z.infer<typeof UpdateDeploymentParams>;

export const UpgradeDeploymentParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("ID of the deployment to upgrade"),
	nodeCount: z
		.number()
		.int()
		.positive()
		.optional()
		.describe(
			"Target number of nodes for the upgrade (set exactly one of nodeCount or volumeSizeBytes)",
		),
	volumeSizeBytes: z
		.number()
		.int()
		.positive()
		.optional()
		.describe(
			"Target volume size in bytes for the upgrade (set exactly one of nodeCount or volumeSizeBytes)",
		),
});
export type UpgradeDeploymentParams = z.infer<typeof UpgradeDeploymentParams>;

export const DeleteDeploymentParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("ID of the deployment to delete"),
});
export type DeleteDeploymentParams = z.infer<typeof DeleteDeploymentParams>;

export const GetCertificateAuthorityParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("ID of the deployment"),
});
export type GetCertificateAuthorityParams = z.infer<typeof GetCertificateAuthorityParams>;

// --- Node types & versions tool params ---

export const ListNodeTypesParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list node types in"),
	orderBy: NodeTypeOrderBy.optional().describe("Order results by field"),
});
export type ListNodeTypesParams = z.infer<typeof ListNodeTypesParams>;

export const ListVersionsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list versions in"),
	version: z.string().optional().describe("Filter by version"),
	orderBy: VersionOrderBy.optional().describe("Order results by field"),
});
export type ListVersionsParams = z.infer<typeof ListVersionsParams>;

// --- User tool params ---

export const ListUsersParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("ID of the deployment"),
	name: z.string().optional().describe("Filter by username"),
	orderBy: UserOrderBy.optional().describe("Order results by field"),
});
export type ListUsersParams = z.infer<typeof ListUsersParams>;

export const CreateUserParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("ID of the deployment"),
	username: z.string().min(1).describe("Username of the deployment user"),
	password: z.string().min(1).describe("Password of the deployment user"),
});
export type CreateUserParams = z.infer<typeof CreateUserParams>;

export const UpdateUserParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("ID of the deployment"),
	username: z.string().min(1).describe("Username of the deployment user to update"),
	password: z.string().min(1).optional().describe("New password for the user"),
});
export type UpdateUserParams = z.infer<typeof UpdateUserParams>;

export const DeleteUserParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("ID of the deployment"),
	username: z.string().min(1).describe("Username of the deployment user to delete"),
});
export type DeleteUserParams = z.infer<typeof DeleteUserParams>;

// --- Endpoint tool params ---

export const CreateEndpointParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("ID of the deployment to create the endpoint for"),
	public: z
		.boolean()
		.optional()
		.describe("Set true to expose a public endpoint accessible from the internet"),
	privateNetworkId: z
		.string()
		.uuid()
		.optional()
		.describe("Private Network ID for a Private Network endpoint"),
});
export type CreateEndpointParams = z.infer<typeof CreateEndpointParams>;

export const DeleteEndpointParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	endpointId: z.string().uuid().describe("ID of the endpoint to delete"),
});
export type DeleteEndpointParams = z.infer<typeof DeleteEndpointParams>;

// --- List response schemas (for contract tests) ---

export const ListDeploymentsResponse = z.object({
	deployments: z.array(Deployment),
	total_count: z.number().int().nonnegative(),
});
export type ListDeploymentsResponse = z.infer<typeof ListDeploymentsResponse>;

export const ListNodeTypesResponse = z.object({
	node_types: z.array(NodeType),
	total_count: z.number().int().nonnegative(),
});
export type ListNodeTypesResponse = z.infer<typeof ListNodeTypesResponse>;

export const ListUsersResponse = z.object({
	users: z.array(User),
	total_count: z.number().int().nonnegative(),
});
export type ListUsersResponse = z.infer<typeof ListUsersResponse>;

export const ListVersionsResponse = z.object({
	versions: z.array(Version),
	total_count: z.number().int().nonnegative(),
});
export type ListVersionsResponse = z.infer<typeof ListVersionsResponse>;
