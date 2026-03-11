import { z } from "zod";
import { PaginationParams, ScalewayZone } from "../../shared/types.js";

// --- Volume Schemas ---

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
]);
export type VolumeStatus = z.infer<typeof VolumeStatus>;

export const VolumeType = z.enum(["unknown_type", "b_ssd", "sbs_5k", "sbs_15k"]);
export type VolumeType = z.infer<typeof VolumeType>;

export const VolumeSpecifications = z.object({
	perfIops: z.number().optional().describe("The maximum IO/s expected"),
	class: z.string().optional().describe("The storage class of the volume"),
});
export type VolumeSpecifications = z.infer<typeof VolumeSpecifications>;

export const Volume = z.object({
	id: z.string().uuid(),
	name: z.string(),
	type: VolumeType,
	size: z.number().describe("Volume size in bytes"),
	zone: z.string(),
	status: VolumeStatus,
	specs: VolumeSpecifications.optional(),
	lastDetachedAt: z.string().nullable().optional().describe("ISO 8601 timestamp"),
	projectId: z.string().uuid(),
	tags: z.array(z.string()),
	parentSnapshotId: z.string().uuid().nullable().optional(),
	createdAt: z.string().optional().describe("ISO 8601 timestamp"),
	updatedAt: z.string().optional().describe("ISO 8601 timestamp"),
});
export type Volume = z.infer<typeof Volume>;

export const ListVolumesParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to list volumes in (e.g., fr-par-1)"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by volume name"),
	status: VolumeStatus.optional().describe("Filter by volume status"),
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
	perfIops: z.number().int().positive().optional().describe("Maximum IOPS"),
	tags: z.array(z.string()).optional().describe("Tags for the volume"),
});
export type CreateVolumeParams = z.infer<typeof CreateVolumeParams>;

export const UpdateVolumeParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the volume (e.g., fr-par-1)"),
	volumeId: z.string().uuid().describe("ID of the volume to update"),
	name: z.string().min(1).optional().describe("New name for the volume"),
	size: z.number().int().positive().optional().describe("New size in bytes (can only grow)"),
	perfIops: z.number().int().positive().optional().describe("New IOPS limit"),
	tags: z.array(z.string()).optional().describe("New tags for the volume"),
});
export type UpdateVolumeParams = z.infer<typeof UpdateVolumeParams>;

export const DeleteVolumeParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the volume (e.g., fr-par-1)"),
	volumeId: z.string().uuid().describe("ID of the volume to delete"),
});
export type DeleteVolumeParams = z.infer<typeof DeleteVolumeParams>;

// --- Snapshot Schemas ---

export const SnapshotStatus = z.enum([
	"unknown_status",
	"creating",
	"available",
	"deleting",
	"deleted",
	"error",
	"in_use",
	"locked",
]);
export type SnapshotStatus = z.infer<typeof SnapshotStatus>;

export const SnapshotClass = z.enum(["unknown_class", "standard", "instant"]);
export type SnapshotClass = z.infer<typeof SnapshotClass>;

export const Snapshot = z.object({
	id: z.string().uuid(),
	name: z.string(),
	volumeId: z.string().uuid().nullable().optional(),
	size: z.number().describe("Snapshot size in bytes"),
	zone: z.string(),
	status: SnapshotStatus,
	projectId: z.string().uuid(),
	tags: z.array(z.string()),
	class: SnapshotClass.optional(),
	createdAt: z.string().optional().describe("ISO 8601 timestamp"),
	updatedAt: z.string().optional().describe("ISO 8601 timestamp"),
	parentVolume: z
		.object({
			id: z.string().uuid(),
			name: z.string(),
			type: VolumeType,
			status: VolumeStatus,
		})
		.nullable()
		.optional(),
});
export type Snapshot = z.infer<typeof Snapshot>;

export const ListSnapshotsParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to list snapshots in (e.g., fr-par-1)"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by snapshot name"),
	volumeId: z.string().uuid().optional().describe("Filter by source volume ID"),
	status: SnapshotStatus.optional().describe("Filter by snapshot status"),
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
});
export type CreateSnapshotParams = z.infer<typeof CreateSnapshotParams>;

export const UpdateSnapshotParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the snapshot (e.g., fr-par-1)"),
	snapshotId: z.string().uuid().describe("ID of the snapshot to update"),
	name: z.string().min(1).optional().describe("New name for the snapshot"),
	tags: z.array(z.string()).optional().describe("New tags for the snapshot"),
});
export type UpdateSnapshotParams = z.infer<typeof UpdateSnapshotParams>;

export const DeleteSnapshotParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the snapshot (e.g., fr-par-1)"),
	snapshotId: z.string().uuid().describe("ID of the snapshot to delete"),
});
export type DeleteSnapshotParams = z.infer<typeof DeleteSnapshotParams>;

// --- Volume Type Schemas ---

export const VolumeTypePricing = z.object({
	pricePerHour: z.number().optional().describe("Price per hour in currency units"),
});
export type VolumeTypePricing = z.infer<typeof VolumeTypePricing>;

export const VolumeTypeSpecs = z.object({
	minSize: z.number().optional().describe("Minimum volume size in bytes"),
	maxSize: z.number().optional().describe("Maximum volume size in bytes"),
	minIops: z.number().optional().describe("Minimum IOPS"),
	maxIops: z.number().optional().describe("Maximum IOPS"),
});
export type VolumeTypeSpecs = z.infer<typeof VolumeTypeSpecs>;

export const VolumeTypeInfo = z.object({
	name: z.string(),
	pricing: VolumeTypePricing.optional(),
	snapshotPricing: VolumeTypePricing.optional(),
	specs: VolumeTypeSpecs.optional(),
});
export type VolumeTypeInfo = z.infer<typeof VolumeTypeInfo>;

export const ListVolumeTypesParams = z.object({
	zone: ScalewayZone.optional().describe("Zone to list volume types for (e.g., fr-par-1)"),
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	pageSize: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
});
export type ListVolumeTypesParams = z.infer<typeof ListVolumeTypesParams>;
