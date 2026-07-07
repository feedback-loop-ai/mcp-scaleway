import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

export const InstanceStatus = z.enum([
	"unknown_status",
	"ready",
	"provisioning",
	"configuring",
	"deleting",
	"error",
	"initializing",
	"locked",
	"snapshotting",
]);

export const SnapshotStatus = z.enum([
	"unknown_status",
	"creating",
	"ready",
	"restoring",
	"deleting",
	"error",
	"locked",
]);

export const VolumeType = z.enum(["sbs_5k", "sbs_15k"]);

// --- Shared sub-schemas ---

// v1 Volume detail: `type` (VolumeType) + `size_bytes`
const VolumeSpec = z
	.object({
		type: VolumeType.describe("Volume type"),
		size_bytes: z.number().int().min(1).describe("Volume size in bytes"),
	})
	.describe("Volume configuration");

// v1 EndpointSpec for instance creation
const EndpointSpec = z
	.object({
		private_network: z
			.object({
				private_network_id: z.string().uuid().describe("Private Network ID"),
			})
			.optional()
			.describe("Private Network endpoint spec"),
		public_network: z.object({}).optional().describe("Public Network endpoint spec"),
	})
	.describe("Endpoint specification");

// --- Instance Schemas ---

export const ListInstancesParams = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	name: z.string().optional().describe("Filter by instance name"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	organization_id: z.string().uuid().optional().describe("Filter by organization ID"),
	order_by: z
		.enum([
			"created_at_asc",
			"created_at_desc",
			"name_asc",
			"name_desc",
			"status_asc",
			"status_desc",
		])
		.optional()
		.describe("Sort order"),
});
// z.input: page/pageSize carry zod defaults, so they are optional on the
// handler input (defaults are applied by `.parse()` in index.ts at call time).
export type ListInstancesParams = z.input<typeof ListInstancesParams>;

export const GetInstanceParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
});
export type GetInstanceParams = z.infer<typeof GetInstanceParams>;

export const CreateInstanceParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	project_id: z.string().uuid().optional().describe("Project ID"),
	name: z.string().min(1).describe("Instance name"),
	version: z.string().min(1).describe("MongoDB version (e.g., 7.0.12)"),
	node_type: z.string().min(1).describe("Node type (e.g., MGDB-PLAY2-NANO)"),
	node_amount: z.number().int().min(1).describe("Number of nodes"),
	user_name: z.string().min(1).describe("Initial admin username"),
	password: z.string().min(1).describe("Initial admin password"),
	tags: z.array(z.string()).optional().describe("Tags"),
	volume: VolumeSpec.optional(),
	endpoints: z.array(EndpointSpec).optional().describe("Endpoints to expose the instance on"),
});
export type CreateInstanceParams = z.infer<typeof CreateInstanceParams>;

export const UpdateInstanceParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().min(1).optional().describe("New instance name"),
	tags: z.array(z.string()).optional().describe("New tags"),
	snapshot_schedule_frequency_hours: z
		.number()
		.int()
		.positive()
		.optional()
		.describe("Snapshot schedule frequency in hours"),
	snapshot_schedule_retention_days: z
		.number()
		.int()
		.positive()
		.optional()
		.describe("Snapshot schedule retention in days"),
	is_snapshot_schedule_enabled: z
		.boolean()
		.optional()
		.describe("Whether the snapshot schedule is enabled"),
});
export type UpdateInstanceParams = z.infer<typeof UpdateInstanceParams>;

export const DeleteInstanceParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
});
export type DeleteInstanceParams = z.infer<typeof DeleteInstanceParams>;

// --- User Schemas ---

export const ListUsersParams = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().optional().describe("Filter by user name"),
	order_by: z.enum(["name_asc", "name_desc"]).optional().describe("Sort order"),
});
export type ListUsersParams = z.input<typeof ListUsersParams>;

export const CreateUserParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().min(1).describe("Username"),
	password: z.string().min(1).describe("Password"),
});
export type CreateUserParams = z.infer<typeof CreateUserParams>;

export const UpdateUserParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().min(1).describe("Username"),
	password: z.string().min(1).optional().describe("New password"),
});
export type UpdateUserParams = z.infer<typeof UpdateUserParams>;

export const DeleteUserParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().min(1).describe("Username"),
});
export type DeleteUserParams = z.infer<typeof DeleteUserParams>;

// --- Snapshot Schemas ---

export const ListSnapshotsParams = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().optional().describe("Filter by instance ID"),
	name: z.string().optional().describe("Filter by snapshot name"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	organization_id: z.string().uuid().optional().describe("Filter by organization ID"),
	order_by: z
		.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
		.optional()
		.describe("Sort order"),
});
export type ListSnapshotsParams = z.input<typeof ListSnapshotsParams>;

export const CreateSnapshotParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().min(1).describe("Snapshot name"),
	expires_at: z.string().datetime().optional().describe("Expiration date (ISO 8601)"),
});
export type CreateSnapshotParams = z.infer<typeof CreateSnapshotParams>;

export const RestoreSnapshotParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	snapshot_id: z.string().uuid().describe("Snapshot ID"),
	instance_name: z.string().min(1).describe("Name for the restored instance"),
	node_type: z.string().min(1).describe("Node type for restored instance"),
	node_amount: z.number().int().min(1).describe("Number of nodes for restored instance"),
	volume_type: VolumeType.optional().describe("Volume type for the restored instance"),
});
export type RestoreSnapshotParams = z.infer<typeof RestoreSnapshotParams>;

export const DeleteSnapshotParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	snapshot_id: z.string().uuid().describe("Snapshot ID"),
});
export type DeleteSnapshotParams = z.infer<typeof DeleteSnapshotParams>;

// --- Node Type & Version Schemas ---

export const ListNodeTypesParams = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	include_disabled: z.boolean().optional().describe("Include disabled node types"),
});
export type ListNodeTypesParams = z.input<typeof ListNodeTypesParams>;

export const ListVersionsParams = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	version: z.string().optional().describe("Filter by version string"),
});
export type ListVersionsParams = z.input<typeof ListVersionsParams>;
