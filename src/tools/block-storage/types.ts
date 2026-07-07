import { z } from "zod";
import { PaginationParams, ScalewayZone } from "../../shared/types.js";

// --- Enums (block/v1) ---

export const VolumeStatus = z.enum([
	"unknown_status",
	"creating",
	"available",
	"in_use",
	"deleting",
	"deleted",
	"resizing",
	"error",
	"snapshotting",
	"locked",
	"updating",
]);
export type VolumeStatus = z.infer<typeof VolumeStatus>;

export const SnapshotStatus = z.enum([
	"unknown_status",
	"creating",
	"available",
	"error",
	"deleting",
	"deleted",
	"in_use",
	"locked",
	"exporting",
]);
export type SnapshotStatus = z.infer<typeof SnapshotStatus>;

// Storage class (block/v1 renamed from v1alpha1 SnapshotClass values)
export const StorageClass = z.enum(["unknown_storage_class", "unspecified", "bssd", "sbs"]);
export type StorageClass = z.infer<typeof StorageClass>;

export const ReferenceType = z.enum(["unknown_type", "link", "exclusive", "read_only"]);
export type ReferenceType = z.infer<typeof ReferenceType>;

export const ReferenceStatus = z.enum([
	"unknown_status",
	"attaching",
	"attached",
	"detaching",
	"detached",
	"creating",
	"error",
]);
export type ReferenceStatus = z.infer<typeof ReferenceStatus>;

export const BlockOrderBy = z.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"]);
export type BlockOrderBy = z.infer<typeof BlockOrderBy>;

// --- Shared response objects ---

export const Reference = z.object({
	id: z.string().uuid(),
	product_resource_type: z.string(),
	product_resource_id: z.string(),
	created_at: z.string().nullable().optional().describe("RFC 3339 timestamp"),
	type: ReferenceType,
	status: ReferenceStatus,
});
export type Reference = z.infer<typeof Reference>;

// --- Volume response schema (block/v1) ---

export const VolumeSpecifications = z.object({
	perf_iops: z.number().nullable().optional().describe("Maximum IO/s expected (5000 | 15000)"),
	class: StorageClass.optional().describe("Storage class of the volume"),
});
export type VolumeSpecifications = z.infer<typeof VolumeSpecifications>;

export const Volume = z.object({
	id: z.string().uuid(),
	name: z.string(),
	type: z.string().describe("Volume type (e.g. sbs_5k, sbs_15k)"),
	size: z.number().describe("Volume size in bytes"),
	project_id: z.string().uuid(),
	created_at: z.string().nullable().optional().describe("RFC 3339 timestamp"),
	updated_at: z.string().nullable().optional().describe("RFC 3339 timestamp"),
	references: z.array(Reference).optional(),
	parent_snapshot_id: z.string().uuid().nullable().optional(),
	status: VolumeStatus,
	tags: z.array(z.string()),
	zone: z.string(),
	specs: VolumeSpecifications.optional(),
	last_detached_at: z.string().nullable().optional().describe("RFC 3339 timestamp"),
	kms_key_id: z.string().uuid().nullable().optional(),
});
export type Volume = z.infer<typeof Volume>;

// --- Snapshot response schema (block/v1) ---

export const SnapshotParentVolume = z.object({
	id: z.string().uuid(),
	name: z.string(),
	type: z.string(),
	status: VolumeStatus,
});
export type SnapshotParentVolume = z.infer<typeof SnapshotParentVolume>;

export const Snapshot = z.object({
	id: z.string().uuid(),
	name: z.string(),
	parent_volume: SnapshotParentVolume.nullable().optional(),
	size: z.number().describe("Snapshot size in bytes"),
	project_id: z.string().uuid(),
	created_at: z.string().nullable().optional().describe("RFC 3339 timestamp"),
	updated_at: z.string().nullable().optional().describe("RFC 3339 timestamp"),
	references: z.array(Reference).optional(),
	status: SnapshotStatus,
	tags: z.array(z.string()),
	zone: z.string(),
	class: StorageClass.optional(),
	public: z.boolean().optional(),
});
export type Snapshot = z.infer<typeof Snapshot>;

// --- VolumeType response schema (block/v1) ---

export const Money = z.object({
	currency_code: z.string().optional(),
	units: z.number().optional(),
	nanos: z.number().optional(),
});
export type Money = z.infer<typeof Money>;

export const VolumeTypeInfo = z.object({
	type: z.string(),
	pricing: Money.optional().describe("Price of the volume billed in GB/hour"),
	snapshot_pricing: Money.optional().describe("Price of the snapshot billed in GB/hour"),
	specs: VolumeSpecifications.optional(),
	zone: z.string().optional(),
});
export type VolumeTypeInfo = z.infer<typeof VolumeTypeInfo>;

// --- Volume request params ---

export const ListVolumesParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to list volumes in (e.g., fr-par-1)"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	organizationId: z.string().uuid().optional().describe("Filter by organization ID"),
	name: z.string().optional().describe("Filter by volume name"),
	orderBy: BlockOrderBy.optional().describe("Ordering of the returned list"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	productResourceId: z
		.string()
		.optional()
		.describe("Filter by a linked product resource ID (e.g. an Instance ID)"),
	volumeType: z.string().optional().describe("Filter by volume type"),
	includeDeleted: z
		.boolean()
		.optional()
		.default(false)
		.describe("Display deleted volumes not erased yet"),
});
export type ListVolumesParams = z.infer<typeof ListVolumesParams>;

export const GetVolumeParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the volume (e.g., fr-par-1)"),
	volumeId: z.string().uuid().describe("ID of the volume to retrieve"),
});
export type GetVolumeParams = z.infer<typeof GetVolumeParams>;

export const CreateVolumeParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to create the volume in (e.g., fr-par-1)"),
	name: z.string().min(1).describe("Name of the volume"),
	projectId: z.string().uuid().optional().describe("Project ID to own the volume"),
	perfIops: z.number().int().positive().optional().describe("Maximum IO/s (5000 | 15000)"),
	fromEmpty: z
		.object({
			size: z.number().int().positive().describe("Volume size in bytes"),
		})
		.optional()
		.describe("Create an empty volume with given size"),
	fromSnapshot: z
		.object({
			snapshotId: z.string().uuid().describe("Source snapshot ID"),
			size: z.number().int().positive().optional().describe("Override size in bytes"),
		})
		.optional()
		.describe("Create a volume from a snapshot"),
	tags: z.array(z.string()).optional().describe("Tags for the volume"),
	kmsKeyId: z.string().uuid().optional().describe("KMS key used to protect encryption"),
});
export type CreateVolumeParams = z.infer<typeof CreateVolumeParams>;

export const UpdateVolumeParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the volume (e.g., fr-par-1)"),
	volumeId: z.string().uuid().describe("ID of the volume to update"),
	name: z.string().min(1).optional().describe("New name for the volume"),
	size: z.number().int().positive().optional().describe("New size in bytes (can only grow)"),
	perfIops: z.number().int().positive().optional().describe("New IO/s limit (5000 | 15000)"),
	tags: z.array(z.string()).optional().describe("New tags for the volume"),
});
export type UpdateVolumeParams = z.infer<typeof UpdateVolumeParams>;

export const DeleteVolumeParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the volume (e.g., fr-par-1)"),
	volumeId: z.string().uuid().describe("ID of the volume to delete"),
});
export type DeleteVolumeParams = z.infer<typeof DeleteVolumeParams>;

// --- Snapshot request params ---

export const ListSnapshotsParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to list snapshots in (e.g., fr-par-1)"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	organizationId: z.string().uuid().optional().describe("Filter by organization ID"),
	name: z.string().optional().describe("Filter by snapshot name"),
	orderBy: BlockOrderBy.optional().describe("Ordering of the returned list"),
	volumeId: z.string().uuid().optional().describe("Filter by source volume ID"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	includeDeleted: z
		.boolean()
		.optional()
		.default(false)
		.describe("Display deleted snapshots not erased yet"),
});
export type ListSnapshotsParams = z.infer<typeof ListSnapshotsParams>;

export const GetSnapshotParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the snapshot (e.g., fr-par-1)"),
	snapshotId: z.string().uuid().describe("ID of the snapshot to retrieve"),
});
export type GetSnapshotParams = z.infer<typeof GetSnapshotParams>;

export const CreateSnapshotParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to create the snapshot in (e.g., fr-par-1)"),
	name: z.string().min(1).describe("Name of the snapshot"),
	projectId: z.string().uuid().optional().describe("Project ID to own the snapshot"),
	volumeId: z.string().uuid().describe("ID of the volume to snapshot"),
	tags: z.array(z.string()).optional().describe("Tags for the snapshot"),
	public: z.boolean().optional().describe("Whether the snapshot can be used by anyone"),
});
export type CreateSnapshotParams = z.infer<typeof CreateSnapshotParams>;

export const UpdateSnapshotParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the snapshot (e.g., fr-par-1)"),
	snapshotId: z.string().uuid().describe("ID of the snapshot to update"),
	name: z.string().min(1).optional().describe("New name for the snapshot"),
	tags: z.array(z.string()).optional().describe("New tags for the snapshot"),
	public: z.boolean().optional().describe("Whether the snapshot can be used by anyone"),
});
export type UpdateSnapshotParams = z.infer<typeof UpdateSnapshotParams>;

export const DeleteSnapshotParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the snapshot (e.g., fr-par-1)"),
	snapshotId: z.string().uuid().describe("ID of the snapshot to delete"),
});
export type DeleteSnapshotParams = z.infer<typeof DeleteSnapshotParams>;

// --- Volume Type request params ---

export const ListVolumeTypesParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to list volume types for (e.g., fr-par-1)"),
});
export type ListVolumeTypesParams = z.infer<typeof ListVolumeTypesParams>;
