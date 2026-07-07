import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

export const DeploymentStatus = z.enum([
	"unknown_status",
	"ready",
	"creating",
	"configuring",
	"deleting",
	"error",
	"locked",
	"locking",
	"unlocking",
	"deploying",
	"stopping",
	"starting",
	"stopped",
]);
export type DeploymentStatus = z.infer<typeof DeploymentStatus>;

export const EndpointProtocol = z.enum(["unknown_protocol", "tcp", "https", "mysql"]);
export type EndpointProtocol = z.infer<typeof EndpointProtocol>;

export const DeploymentOrderBy = z.enum([
	"created_at_desc",
	"created_at_asc",
	"name_asc",
	"name_desc",
]);
export type DeploymentOrderBy = z.infer<typeof DeploymentOrderBy>;

export const DatabaseOrderBy = z.enum(["name_asc", "name_desc", "size_asc", "size_desc"]);
export type DatabaseOrderBy = z.infer<typeof DatabaseOrderBy>;

export const UserOrderBy = z.enum(["name_asc", "name_desc"]);
export type UserOrderBy = z.infer<typeof UserOrderBy>;

// --- Response object schemas ---

export const EndpointService = z.object({
	protocol: EndpointProtocol,
	port: z.number().int(),
});
export type EndpointService = z.infer<typeof EndpointService>;

export const Endpoint = z.object({
	id: z.string().uuid(),
	dns_record: z.string().optional(),
	services: z.array(EndpointService).optional(),
	private_network: z.object({ private_network_id: z.string().uuid() }).nullable().optional(),
	public: z.object({}).passthrough().nullable().optional(),
});
export type Endpoint = z.infer<typeof Endpoint>;

export const Deployment = z.object({
	id: z.string().uuid(),
	name: z.string(),
	organization_id: z.string().uuid(),
	project_id: z.string().uuid(),
	status: DeploymentStatus,
	tags: z.array(z.string()).optional(),
	created_at: z.string().datetime({ offset: true }).nullable().optional(),
	updated_at: z.string().datetime({ offset: true }).nullable().optional(),
	version: z.string().optional(),
	replica_count: z.number().int().optional(),
	shard_count: z.number().int().optional(),
	cpu_min: z.number().int().optional(),
	cpu_max: z.number().int().optional(),
	endpoints: z.array(Endpoint).optional(),
	ram_per_cpu: z.number().int().optional(),
	move_factor: z.number().optional(),
	region: z.string(),
});
export type Deployment = z.infer<typeof Deployment>;

export const Database = z.object({
	name: z.string(),
	size: z.number().int().nonnegative(),
});
export type Database = z.infer<typeof Database>;

export const User = z.object({
	name: z.string(),
	is_admin: z.boolean(),
});
export type User = z.infer<typeof User>;

export const Preset = z.object({
	name: z.string(),
	category: z.string(),
	cpu_min: z.number().int(),
	cpu_max: z.number().int(),
	ram_per_cpu: z.number().int(),
	replica_count: z.number().int(),
	shard_count: z.number().int(),
});
export type Preset = z.infer<typeof Preset>;

export const Version = z.object({
	version: z.string(),
	end_of_life_at: z.string().datetime({ offset: true }).nullable().optional(),
});
export type Version = z.infer<typeof Version>;

export const CertificateFile = z.object({
	name: z.string(),
	content_type: z.string(),
	content: z.string(),
});
export type CertificateFile = z.infer<typeof CertificateFile>;

export const ListDeploymentsResponse = z.object({
	deployments: z.array(Deployment),
	total_count: z.number().int().nonnegative(),
});
export type ListDeploymentsResponse = z.infer<typeof ListDeploymentsResponse>;

export const ListDatabasesResponse = z.object({
	databases: z.array(Database),
	total_count: z.number().int().nonnegative(),
});
export type ListDatabasesResponse = z.infer<typeof ListDatabasesResponse>;

export const ListUsersResponse = z.object({
	users: z.array(User),
	total_count: z.number().int().nonnegative(),
});
export type ListUsersResponse = z.infer<typeof ListUsersResponse>;

export const ListPresetsResponse = z.object({
	presets: z.array(Preset),
	total_count: z.number().int().nonnegative(),
});
export type ListPresetsResponse = z.infer<typeof ListPresetsResponse>;

export const ListVersionsResponse = z.object({
	versions: z.array(Version),
	total_count: z.number().int().nonnegative(),
});
export type ListVersionsResponse = z.infer<typeof ListVersionsResponse>;

// --- Endpoint spec (shared request shape) ---

export const EndpointSpecParams = z.object({
	privateNetworkId: z
		.string()
		.uuid()
		.optional()
		.describe("UUID of the Private Network. If omitted, a public endpoint is created."),
});
export type EndpointSpecParams = z.infer<typeof EndpointSpecParams>;

// --- Deployment tool params ---

export const ListDeploymentsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to target (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Filter by Project ID"),
	organizationId: z.string().uuid().optional().describe("Filter by Organization ID"),
	name: z.string().optional().describe("Filter deployments matching a name pattern"),
	tags: z.array(z.string()).optional().describe("Filter deployments by tag"),
	orderBy: DeploymentOrderBy.optional().describe("Ordering of the deployment list"),
});
export type ListDeploymentsParams = z.infer<typeof ListDeploymentsParams>;

export const GetDeploymentParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment"),
});
export type GetDeploymentParams = z.infer<typeof GetDeploymentParams>;

export const CreateDeploymentParams = z.object({
	region: ScalewayRegion.describe("Region for the deployment"),
	name: z.string().min(1).describe("Name of the deployment"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags to apply to the deployment"),
	version: z.string().optional().describe("ClickHouse® version to use"),
	replicaCount: z.number().int().positive().optional().describe("Number of replicas"),
	shardCount: z.number().int().positive().optional().describe("Number of shards"),
	password: z.string().optional().describe("Password for the initial admin user"),
	cpuMin: z.number().int().positive().optional().describe("Minimum CPU count"),
	cpuMax: z.number().int().positive().optional().describe("Maximum CPU count"),
	ramPerCpu: z.number().int().positive().optional().describe("RAM per CPU count (in GB)"),
	moveFactor: z
		.number()
		.min(0)
		.max(1)
		.optional()
		.describe("Tiered storage move factor between 0 and 1 (default 0.1)"),
	endpoints: z
		.array(EndpointSpecParams)
		.optional()
		.describe("Endpoints to associate with the deployment"),
});
export type CreateDeploymentParams = z.infer<typeof CreateDeploymentParams>;

export const UpdateDeploymentParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment to update"),
	name: z.string().min(1).optional().describe("New name for the deployment"),
	tags: z.array(z.string()).optional().describe("New tags for the deployment"),
	cpuMin: z.number().int().positive().optional().describe("New minimum CPU count"),
	cpuMax: z.number().int().positive().optional().describe("New maximum CPU count"),
	replicaCount: z.number().int().positive().optional().describe("New number of replicas"),
	moveFactor: z
		.number()
		.min(0)
		.max(1)
		.optional()
		.describe("Tiered storage move factor between 0 and 1"),
});
export type UpdateDeploymentParams = z.infer<typeof UpdateDeploymentParams>;

export const DeleteDeploymentParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment to delete"),
});
export type DeleteDeploymentParams = z.infer<typeof DeleteDeploymentParams>;

export const StartDeploymentParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment to start"),
});
export type StartDeploymentParams = z.infer<typeof StartDeploymentParams>;

export const StopDeploymentParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment to stop"),
});
export type StopDeploymentParams = z.infer<typeof StopDeploymentParams>;

export const GetDeploymentCertificateParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment"),
});
export type GetDeploymentCertificateParams = z.infer<typeof GetDeploymentCertificateParams>;

// --- Database tool params ---

export const ListDatabasesParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment"),
	name: z.string().optional().describe("Filter databases by name"),
	orderBy: DatabaseOrderBy.optional().describe("Ordering of the database list"),
});
export type ListDatabasesParams = z.infer<typeof ListDatabasesParams>;

export const CreateDatabaseParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment"),
	name: z.string().min(1).describe("Name of the database to create"),
});
export type CreateDatabaseParams = z.infer<typeof CreateDatabaseParams>;

export const DeleteDatabaseParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment"),
	name: z.string().min(1).describe("Name of the database to delete"),
});
export type DeleteDatabaseParams = z.infer<typeof DeleteDatabaseParams>;

// --- User tool params ---

export const ListUsersParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment"),
	name: z.string().optional().describe("Filter users by name"),
	orderBy: UserOrderBy.optional().describe("Ordering of the user list"),
});
export type ListUsersParams = z.infer<typeof ListUsersParams>;

export const CreateUserParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment"),
	name: z.string().min(1).describe("Name of the user to create"),
	password: z.string().min(1).describe("Password for the user"),
	isAdmin: z.boolean().optional().describe("Whether the user is an administrator"),
});
export type CreateUserParams = z.infer<typeof CreateUserParams>;

export const UpdateUserParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment"),
	name: z.string().min(1).describe("Name of the user to update"),
	password: z.string().min(1).optional().describe("New password for the user"),
	isAdmin: z.boolean().optional().describe("Update the user administrator permissions"),
});
export type UpdateUserParams = z.infer<typeof UpdateUserParams>;

export const DeleteUserParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment"),
	name: z.string().min(1).describe("Name of the user to delete"),
});
export type DeleteUserParams = z.infer<typeof DeleteUserParams>;

// --- Endpoint tool params ---

export const CreateEndpointParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	deploymentId: z.string().uuid().describe("UUID of the deployment"),
	privateNetworkId: z
		.string()
		.uuid()
		.optional()
		.describe("UUID of the Private Network. If omitted, a public endpoint is created."),
});
export type CreateEndpointParams = z.infer<typeof CreateEndpointParams>;

export const DeleteEndpointParams = z.object({
	region: ScalewayRegion.describe("Region of the deployment"),
	endpointId: z.string().uuid().describe("UUID of the endpoint to delete"),
});
export type DeleteEndpointParams = z.infer<typeof DeleteEndpointParams>;

// --- Preset & Version tool params ---

export const ListPresetsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to target"),
});
export type ListPresetsParams = z.infer<typeof ListPresetsParams>;

export const ListVersionsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to target"),
	version: z.string().optional().describe("Filter by a specific version"),
});
export type ListVersionsParams = z.infer<typeof ListVersionsParams>;
