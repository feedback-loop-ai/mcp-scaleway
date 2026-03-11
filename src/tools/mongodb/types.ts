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

export const GetInstanceParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
});

export const CreateInstanceParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	project_id: z.string().uuid().optional().describe("Project ID"),
	name: z.string().min(1).describe("Instance name"),
	version: z.string().min(1).describe("MongoDB version (e.g., 7.0.12)"),
	node_type: z.string().min(1).describe("Node type (e.g., MGDB-PLAY2-NANO)"),
	node_number: z.number().int().min(1).describe("Number of nodes"),
	user_name: z.string().min(1).describe("Initial admin username"),
	password: z.string().min(1).describe("Initial admin password"),
	tags: z.array(z.string()).optional().describe("Tags"),
	volume: z
		.object({
			volume_type: z.enum(["sbs_5k", "sbs_15k"]).describe("Volume type"),
			volume_size: z.number().int().min(1).describe("Volume size in bytes"),
		})
		.optional()
		.describe("Volume configuration"),
});

export const UpdateInstanceParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().min(1).optional().describe("New instance name"),
	tags: z.array(z.string()).optional().describe("New tags"),
});

export const DeleteInstanceParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
});

// --- User Schemas ---

export const ListUsersParams = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().optional().describe("Filter by user name"),
	order_by: z.enum(["name_asc", "name_desc"]).optional().describe("Sort order"),
});

export const CreateUserParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().min(1).describe("Username"),
	password: z.string().min(1).describe("Password"),
});

export const UpdateUserParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().min(1).describe("Username"),
	password: z.string().min(1).optional().describe("New password"),
});

export const DeleteUserParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().min(1).describe("Username"),
});

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

export const CreateSnapshotParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	instance_id: z.string().uuid().describe("Instance ID"),
	name: z.string().min(1).describe("Snapshot name"),
	expires_at: z.string().datetime().optional().describe("Expiration date (ISO 8601)"),
});

export const RestoreSnapshotParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	snapshot_id: z.string().uuid().describe("Snapshot ID"),
	instance_name: z.string().min(1).describe("Name for the restored instance"),
	node_type: z.string().min(1).describe("Node type for restored instance"),
	node_number: z.number().int().min(1).describe("Number of nodes for restored instance"),
	volume: z
		.object({
			volume_type: z.enum(["sbs_5k", "sbs_15k"]).describe("Volume type"),
			volume_size: z.number().int().min(1).describe("Volume size in bytes"),
		})
		.optional()
		.describe("Volume configuration for restored instance"),
});

export const DeleteSnapshotParams = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	snapshot_id: z.string().uuid().describe("Snapshot ID"),
});

// --- Node Type & Version Schemas ---

export const ListNodeTypesParams = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	include_disabled_types: z.boolean().optional().describe("Include disabled node types"),
});

export const ListVersionsParams = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	version: z.string().optional().describe("Filter by version string"),
});
