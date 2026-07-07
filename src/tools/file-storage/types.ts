import { z } from "zod";
import { PaginationParams, ScalewayRegion, ScalewayZone } from "../../shared/types.js";

// --- Enums ---

export const FileSystemStatus = z.enum([
	"unknown_status",
	"available",
	"error",
	"creating",
	"updating",
]);
export type FileSystemStatus = z.infer<typeof FileSystemStatus>;

export const AttachmentResourceType = z.enum(["unknown_resource_type", "instance_server"]);
export type AttachmentResourceType = z.infer<typeof AttachmentResourceType>;

export const ListFileSystemsOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"name_asc",
	"name_desc",
]);
export type ListFileSystemsOrderBy = z.infer<typeof ListFileSystemsOrderBy>;

// --- Entity Schemas ---

export const FileSystem = z.object({
	id: z.string().uuid(),
	name: z.string(),
	size: z.number().int().nonnegative(),
	status: FileSystemStatus,
	project_id: z.string().uuid(),
	organization_id: z.string().uuid(),
	tags: z.array(z.string()),
	number_of_attachments: z.number().int().nonnegative(),
	region: z.string(),
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
});
export type FileSystem = z.infer<typeof FileSystem>;

export const Attachment = z.object({
	id: z.string().uuid(),
	filesystem_id: z.string().uuid(),
	resource_id: z.string().uuid(),
	resource_type: AttachmentResourceType,
	zone: z.string().nullable(),
});
export type Attachment = z.infer<typeof Attachment>;

// --- Request Schemas ---

export const ListFileSystemsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list file systems in (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	organizationId: z.string().uuid().optional().describe("Filter by organization ID"),
	name: z.string().optional().describe("Filter by file system name"),
	tags: z.array(z.string()).optional().describe("Filter by tags (repeatable)"),
	orderBy: ListFileSystemsOrderBy.optional().describe("Order results by field"),
});
export type ListFileSystemsParams = z.infer<typeof ListFileSystemsParams>;

export const ListFileSystemsResponse = z.object({
	filesystems: z.array(FileSystem),
	total_count: z.number().int().nonnegative(),
});
export type ListFileSystemsResponse = z.infer<typeof ListFileSystemsResponse>;

export const GetFileSystemParams = z.object({
	region: ScalewayRegion.describe("Region of the file system"),
	filesystemId: z.string().uuid().describe("ID of the file system"),
});
export type GetFileSystemParams = z.infer<typeof GetFileSystemParams>;

export const CreateFileSystemParams = z.object({
	region: ScalewayRegion.describe("Region for the file system"),
	name: z.string().min(1).describe("Name for the file system"),
	size: z
		.number()
		.int()
		.positive()
		.describe("Size of the file system in bytes (must respect product min/max)"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags to apply to the file system"),
});
export type CreateFileSystemParams = z.infer<typeof CreateFileSystemParams>;

export const UpdateFileSystemParams = z.object({
	region: ScalewayRegion.describe("Region of the file system"),
	filesystemId: z.string().uuid().describe("ID of the file system"),
	name: z.string().min(1).optional().describe("New name for the file system"),
	size: z
		.number()
		.int()
		.positive()
		.optional()
		.describe("New size in bytes (can only be increased)"),
	tags: z.array(z.string()).optional().describe("Replacement set of tags"),
});
export type UpdateFileSystemParams = z.infer<typeof UpdateFileSystemParams>;

export const DeleteFileSystemParams = z.object({
	region: ScalewayRegion.describe("Region of the file system"),
	filesystemId: z.string().uuid().describe("ID of the file system to delete"),
});
export type DeleteFileSystemParams = z.infer<typeof DeleteFileSystemParams>;

export const ListAttachmentsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list attachments in (e.g. fr-par)"),
	filesystemId: z.string().uuid().optional().describe("Filter by file system ID"),
	resourceId: z.string().uuid().optional().describe("Filter by attached resource ID"),
	resourceType: AttachmentResourceType.optional().describe("Filter by attached resource type"),
	zone: ScalewayZone.optional().describe("Filter by zone of the attached resource"),
});
export type ListAttachmentsParams = z.infer<typeof ListAttachmentsParams>;

export const ListAttachmentsResponse = z.object({
	attachments: z.array(Attachment),
	total_count: z.number().int().nonnegative(),
});
export type ListAttachmentsResponse = z.infer<typeof ListAttachmentsResponse>;
