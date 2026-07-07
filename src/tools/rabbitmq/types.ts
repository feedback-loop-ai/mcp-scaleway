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

export const VolumeType = z.enum(["unknown_type", "sbs_5k", "sbs_15k"]);
export type VolumeType = z.infer<typeof VolumeType>;

export const NodeTypeStockStatus = z.enum([
	"unknown_stock",
	"low_stock",
	"out_of_stock",
	"available",
]);
export type NodeTypeStockStatus = z.infer<typeof NodeTypeStockStatus>;

export const ListDeploymentsOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"name_asc",
	"name_desc",
	"updated_at_asc",
	"updated_at_desc",
]);
export type ListDeploymentsOrderBy = z.infer<typeof ListDeploymentsOrderBy>;

export const ListNodeTypesOrderBy = z.enum([
	"name_asc",
	"name_desc",
	"vcpus_asc",
	"vcpus_desc",
	"memory_asc",
	"memory_desc",
]);
export type ListNodeTypesOrderBy = z.infer<typeof ListNodeTypesOrderBy>;

export const ListUsersOrderBy = z.enum(["name_asc", "name_desc"]);
export type ListUsersOrderBy = z.infer<typeof ListUsersOrderBy>;

export const ListVersionsOrderBy = z.enum(["version_asc", "version_desc"]);
export type ListVersionsOrderBy = z.infer<typeof ListVersionsOrderBy>;

// --- Response entities ---

export const Volume = z.object({
	type: VolumeType,
	size_bytes: z.number().int().nonnegative(),
});
export type Volume = z.infer<typeof Volume>;

export const EndpointService = z.object({
	name: z.string(),
	port: z.number().int(),
	url: z.string(),
});
export type EndpointService = z.infer<typeof EndpointService>;

export const Endpoint = z.object({
	id: z.string().uuid(),
	dns_record: z.string().nullable().optional(),
	services: z.array(EndpointService),
	public: z.object({}).nullable().optional(),
	private_network: z.object({ private_network_id: z.string() }).nullable().optional(),
});
export type Endpoint = z.infer<typeof Endpoint>;

export const Deployment = z.object({
	id: z.string().uuid(),
	name: z.string(),
	organization_id: z.string().uuid(),
	project_id: z.string().uuid(),
	status: DeploymentStatus,
	tags: z.array(z.string()),
	node_count: z.number().int(),
	node_type: z.string(),
	volume: Volume.nullable(),
	endpoints: z.array(Endpoint),
	created_at: z.string(),
	updated_at: z.string(),
	version: z.string(),
	region: z.string(),
});
export type Deployment = z.infer<typeof Deployment>;

export const NodeTypeVolumeType = z.object({
	type: VolumeType,
	description: z.string(),
	min_size_bytes: z.number().int(),
	max_size_bytes: z.number().int(),
	chunk_size_bytes: z.number().int(),
});
export type NodeTypeVolumeType = z.infer<typeof NodeTypeVolumeType>;

export const NodeType = z.object({
	stock_status: NodeTypeStockStatus,
	name: z.string(),
	description: z.string(),
	vcpus: z.number().int(),
	memory_bytes: z.number().int(),
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
	end_of_life: z.string().nullable().optional(),
	disabled: z.boolean(),
	beta: z.boolean(),
});
export type Version = z.infer<typeof Version>;

// --- Shared input fragments ---

export const VolumeInput = z.object({
	type: VolumeType.describe("Volume type (sbs_5k or sbs_15k)"),
	size_bytes: z.number().int().nonnegative().describe("Volume size in bytes"),
});

export const EndpointSpecInput = z.object({
	is_public: z
		.boolean()
		.optional()
		.describe("Create a public endpoint (mutually exclusive with private_network_id)"),
	private_network_id: z
		.string()
		.uuid()
		.optional()
		.describe("Private Network ID to attach a private endpoint to"),
});
export type EndpointSpecInput = z.infer<typeof EndpointSpecInput>;

// --- Deployment input schemas ---

export const ListDeploymentsInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	organization_id: z.string().uuid().optional().describe("Filter by Organization ID"),
	project_id: z.string().uuid().optional().describe("Filter by Project ID"),
	name: z.string().optional().describe("Filter by deployment name substring"),
	tags: z.array(z.string()).optional().describe("Filter by matching tags"),
	order_by: ListDeploymentsOrderBy.optional().describe("Sort order for the results"),
	...PaginationParams.shape,
});
export type ListDeploymentsInput = z.infer<typeof ListDeploymentsInput>;

export const GetDeploymentInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	deployment_id: z.string().uuid().describe("ID of the deployment"),
});
export type GetDeploymentInput = z.infer<typeof GetDeploymentInput>;

export const CreateDeploymentInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	name: z.string().min(1).describe("Name of the deployment"),
	node_type: z.string().min(1).describe("Node type to use (see list_node_types)"),
	node_count: z.number().int().positive().describe("Number of nodes"),
	version: z.string().min(1).describe("RabbitMQ (MessageQ) version to deploy"),
	project_id: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags to apply to the deployment"),
	user_name: z.string().optional().describe("Username for the initial deployment user"),
	password: z.string().optional().describe("Password for the initial deployment user"),
	volume: VolumeInput.optional().describe("Volume for storing data"),
	endpoints: z
		.array(EndpointSpecInput)
		.optional()
		.describe("Endpoints to expose the deployment on"),
});
export type CreateDeploymentInput = z.infer<typeof CreateDeploymentInput>;

export const UpdateDeploymentInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	deployment_id: z.string().uuid().describe("ID of the deployment"),
	name: z.string().min(1).optional().describe("New name for the deployment"),
	tags: z.array(z.string()).optional().describe("New tags for the deployment"),
});
export type UpdateDeploymentInput = z.infer<typeof UpdateDeploymentInput>;

export const UpgradeDeploymentShape = {
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	deployment_id: z.string().uuid().describe("ID of the deployment"),
	node_count: z
		.number()
		.int()
		.positive()
		.optional()
		.describe("Target number of nodes (mutually exclusive with volume_size_bytes)"),
	volume_size_bytes: z
		.number()
		.int()
		.positive()
		.optional()
		.describe("Target volume size in bytes (mutually exclusive with node_count)"),
};

export const UpgradeDeploymentInput = z
	.object(UpgradeDeploymentShape)
	.refine((data) => (data.node_count === undefined) !== (data.volume_size_bytes === undefined), {
		message: "Exactly one of node_count or volume_size_bytes must be provided",
	});
export type UpgradeDeploymentInput = z.infer<typeof UpgradeDeploymentInput>;

export const DeleteDeploymentInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	deployment_id: z.string().uuid().describe("ID of the deployment to delete"),
});
export type DeleteDeploymentInput = z.infer<typeof DeleteDeploymentInput>;

export const GetDeploymentCertificateInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	deployment_id: z.string().uuid().describe("ID of the deployment"),
});
export type GetDeploymentCertificateInput = z.infer<typeof GetDeploymentCertificateInput>;

// --- User input schemas ---

export const ListUsersInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	deployment_id: z.string().uuid().describe("ID of the deployment"),
	name: z.string().optional().describe("Filter by username substring"),
	order_by: ListUsersOrderBy.optional().describe("Sort order for the results"),
	...PaginationParams.shape,
});
export type ListUsersInput = z.infer<typeof ListUsersInput>;

export const CreateUserInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	deployment_id: z.string().uuid().describe("ID of the deployment"),
	username: z.string().min(1).describe("Username of the deployment user"),
	password: z.string().min(1).describe("Password of the deployment user"),
});
export type CreateUserInput = z.infer<typeof CreateUserInput>;

export const UpdateUserInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	deployment_id: z.string().uuid().describe("ID of the deployment"),
	username: z.string().min(1).describe("Username of the deployment user"),
	password: z.string().min(1).optional().describe("New password for the user"),
});
export type UpdateUserInput = z.infer<typeof UpdateUserInput>;

export const DeleteUserInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	deployment_id: z.string().uuid().describe("ID of the deployment"),
	username: z.string().min(1).describe("Username of the deployment user to delete"),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInput>;

// --- Endpoint input schemas ---

export const CreateEndpointInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	deployment_id: z.string().uuid().describe("ID of the deployment"),
	is_public: z
		.boolean()
		.optional()
		.describe("Create a public endpoint (mutually exclusive with private_network_id)"),
	private_network_id: z
		.string()
		.uuid()
		.optional()
		.describe("Private Network ID for a private endpoint"),
});
export type CreateEndpointInput = z.infer<typeof CreateEndpointInput>;

export const DeleteEndpointInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	endpoint_id: z.string().uuid().describe("ID of the endpoint to delete"),
});
export type DeleteEndpointInput = z.infer<typeof DeleteEndpointInput>;

// --- Node type & version input schemas ---

export const ListNodeTypesInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	order_by: ListNodeTypesOrderBy.optional().describe("Sort order for the results"),
	...PaginationParams.shape,
});
export type ListNodeTypesInput = z.infer<typeof ListNodeTypesInput>;

export const ListVersionsInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (currently fr-par)"),
	version: z.string().optional().describe("Filter by engine version"),
	order_by: ListVersionsOrderBy.optional().describe("Sort order for the results"),
	...PaginationParams.shape,
});
export type ListVersionsInput = z.infer<typeof ListVersionsInput>;

// --- Response wrappers (for contract validation) ---

export const ListDeploymentsResponse = z.object({
	deployments: z.array(Deployment),
	total_count: z.number().int().nonnegative(),
});
export type ListDeploymentsResponse = z.infer<typeof ListDeploymentsResponse>;

export const ListUsersResponse = z.object({
	users: z.array(User),
	total_count: z.number().int().nonnegative(),
});
export type ListUsersResponse = z.infer<typeof ListUsersResponse>;

export const ListNodeTypesResponse = z.object({
	node_types: z.array(NodeType),
	total_count: z.number().int().nonnegative(),
});
export type ListNodeTypesResponse = z.infer<typeof ListNodeTypesResponse>;

export const ListVersionsResponse = z.object({
	versions: z.array(Version),
	total_count: z.number().int().nonnegative(),
});
export type ListVersionsResponse = z.infer<typeof ListVersionsResponse>;
