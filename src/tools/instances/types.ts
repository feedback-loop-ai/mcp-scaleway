import { z } from "zod";
import { PaginationParams, ScalewayZone } from "../../shared/types.js";

// ── Server Schemas ──

export const ListServersInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	page: PaginationParams.shape.page,
	page_size: PaginationParams.shape.pageSize,
	project: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by server name"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	state: z
		.enum(["running", "stopped", "stopped in place", "starting", "stopping", "locked"])
		.optional()
		.describe("Filter by server state"),
});
export type ListServersInput = z.infer<typeof ListServersInput>;

export const GetServerInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	server_id: z.string().uuid().describe("Server UUID"),
});
export type GetServerInput = z.infer<typeof GetServerInput>;

export const CreateServerInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	name: z.string().min(1).describe("Server name"),
	commercial_type: z.string().min(1).describe("Instance type (e.g., DEV1-S, GP1-XS)"),
	image: z.string().uuid().describe("Image UUID to use"),
	project: z.string().uuid().optional().describe("Project ID"),
	tags: z.array(z.string()).optional().describe("Tags for the server"),
	dynamic_ip_required: z.boolean().optional().describe("Whether to assign a dynamic public IP"),
});
export type CreateServerInput = z.infer<typeof CreateServerInput>;

export const DeleteServerInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	server_id: z.string().uuid().describe("Server UUID"),
});
export type DeleteServerInput = z.infer<typeof DeleteServerInput>;

export const ServerActionInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	server_id: z.string().uuid().describe("Server UUID"),
	action: z
		.enum(["poweron", "poweroff", "reboot", "terminate", "stop_in_place", "backup"])
		.describe("Action to perform on the server"),
});
export type ServerActionInput = z.infer<typeof ServerActionInput>;

// ── Volume Schemas ──

export const ListVolumesInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	page: PaginationParams.shape.page,
	page_size: PaginationParams.shape.pageSize,
	name: z.string().optional().describe("Filter by volume name"),
	volume_type: z.enum(["l_ssd", "b_ssd"]).optional().describe("Filter by volume type"),
	project: z.string().uuid().optional().describe("Filter by project ID"),
});
export type ListVolumesInput = z.infer<typeof ListVolumesInput>;

export const GetVolumeInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	volume_id: z.string().uuid().describe("Volume UUID"),
});
export type GetVolumeInput = z.infer<typeof GetVolumeInput>;

export const CreateVolumeInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	name: z.string().min(1).describe("Volume name"),
	size: z.number().int().positive().describe("Volume size in bytes"),
	volume_type: z.enum(["l_ssd", "b_ssd"]).describe("Volume type"),
	project: z.string().uuid().optional().describe("Project ID"),
	tags: z.array(z.string()).optional().describe("Tags for the volume"),
});
export type CreateVolumeInput = z.infer<typeof CreateVolumeInput>;

export const DeleteVolumeInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	volume_id: z.string().uuid().describe("Volume UUID"),
});
export type DeleteVolumeInput = z.infer<typeof DeleteVolumeInput>;

// ── Security Group Schemas ──

export const ListSecurityGroupsInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	page: PaginationParams.shape.page,
	page_size: PaginationParams.shape.pageSize,
	name: z.string().optional().describe("Filter by security group name"),
	project: z.string().uuid().optional().describe("Filter by project ID"),
});
export type ListSecurityGroupsInput = z.infer<typeof ListSecurityGroupsInput>;

export const GetSecurityGroupInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	security_group_id: z.string().uuid().describe("Security group UUID"),
});
export type GetSecurityGroupInput = z.infer<typeof GetSecurityGroupInput>;

export const CreateSecurityGroupInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	name: z.string().min(1).describe("Security group name"),
	description: z.string().optional().describe("Description"),
	inbound_default_policy: z
		.enum(["accept", "drop"])
		.optional()
		.default("accept")
		.describe("Default inbound policy"),
	outbound_default_policy: z
		.enum(["accept", "drop"])
		.optional()
		.default("accept")
		.describe("Default outbound policy"),
	stateful: z.boolean().optional().default(true).describe("Whether the group is stateful"),
	project: z.string().uuid().optional().describe("Project ID"),
});
export type CreateSecurityGroupInput = z.infer<typeof CreateSecurityGroupInput>;

export const DeleteSecurityGroupInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	security_group_id: z.string().uuid().describe("Security group UUID"),
});
export type DeleteSecurityGroupInput = z.infer<typeof DeleteSecurityGroupInput>;

// ── IP Schemas ──

export const ListIpsInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	page: PaginationParams.shape.page,
	page_size: PaginationParams.shape.pageSize,
	name: z.string().optional().describe("Filter by IP name"),
	project: z.string().uuid().optional().describe("Filter by project ID"),
	type: z.enum(["routed_ipv4", "routed_ipv6"]).optional().describe("Filter by IP type"),
});
export type ListIpsInput = z.infer<typeof ListIpsInput>;

export const CreateIpInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	project: z.string().uuid().optional().describe("Project ID"),
	type: z
		.enum(["routed_ipv4", "routed_ipv6"])
		.optional()
		.default("routed_ipv4")
		.describe("IP type"),
	server: z.string().uuid().optional().describe("Server UUID to attach to"),
	tags: z.array(z.string()).optional().describe("Tags for the IP"),
});
export type CreateIpInput = z.infer<typeof CreateIpInput>;

export const DeleteIpInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	ip_id: z.string().uuid().describe("IP UUID"),
});
export type DeleteIpInput = z.infer<typeof DeleteIpInput>;

export const AttachIpInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	ip_id: z.string().uuid().describe("IP UUID"),
	server_id: z.string().uuid().describe("Server UUID to attach the IP to"),
});
export type AttachIpInput = z.infer<typeof AttachIpInput>;

// ── Snapshot Schemas ──

export const ListSnapshotsInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	page: PaginationParams.shape.page,
	page_size: PaginationParams.shape.pageSize,
	name: z.string().optional().describe("Filter by snapshot name"),
	project: z.string().uuid().optional().describe("Filter by project ID"),
});
export type ListSnapshotsInput = z.infer<typeof ListSnapshotsInput>;

export const CreateSnapshotInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	name: z.string().min(1).describe("Snapshot name"),
	volume_id: z.string().uuid().describe("Source volume UUID"),
	project: z.string().uuid().optional().describe("Project ID"),
	tags: z.array(z.string()).optional().describe("Tags for the snapshot"),
});
export type CreateSnapshotInput = z.infer<typeof CreateSnapshotInput>;

export const DeleteSnapshotInput = z.object({
	zone: ScalewayZone.describe("Availability zone (e.g., fr-par-1)"),
	snapshot_id: z.string().uuid().describe("Snapshot UUID"),
});
export type DeleteSnapshotInput = z.infer<typeof DeleteSnapshotInput>;
