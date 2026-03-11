import { z } from "zod";
import { ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

export const NamespaceStatus = z.enum(["ready", "deleting", "error", "locked", "unknown"]);
export type NamespaceStatus = z.infer<typeof NamespaceStatus>;

export const ImageStatus = z.enum(["unknown", "ready", "deleting", "error", "locked"]);
export type ImageStatus = z.infer<typeof ImageStatus>;

export const ImageVisibility = z.enum(["visibility_unknown", "inherit", "public", "private"]);
export type ImageVisibility = z.infer<typeof ImageVisibility>;

export const TagStatus = z.enum(["unknown", "ready", "deleting", "error", "locked"]);
export type TagStatus = z.infer<typeof TagStatus>;

// --- Response Schemas ---

export const NamespaceSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string(),
	organization_id: z.string().uuid(),
	project_id: z.string().uuid(),
	status: NamespaceStatus,
	status_message: z.string(),
	endpoint: z.string(),
	is_public: z.boolean(),
	size: z.number(),
	image_count: z.number().int(),
	region: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
});
export type Namespace = z.infer<typeof NamespaceSchema>;

export const ImageSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	namespace_id: z.string().uuid(),
	status: ImageStatus,
	visibility: ImageVisibility,
	size: z.number(),
	tags: z.array(z.string()),
	created_at: z.string(),
	updated_at: z.string(),
});
export type Image = z.infer<typeof ImageSchema>;

export const TagSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	image_id: z.string().uuid(),
	status: TagStatus,
	digest: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
});
export type Tag = z.infer<typeof TagSchema>;

// --- Input Schemas ---

export const ListNamespacesInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	page: z.number().int().positive().optional().describe("Page number (1-indexed)"),
	page_size: z.number().int().min(1).max(100).optional().describe("Items per page (max 100)"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by namespace name"),
	order_by: z.string().optional().describe("Order results (e.g., created_at_asc)"),
});

export const GetNamespaceInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	namespace_id: z.string().uuid().describe("Namespace unique identifier"),
});

export const CreateNamespaceInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	name: z.string().min(1).describe("Namespace name"),
	project_id: z.string().uuid().optional().describe("Project ID"),
	description: z.string().optional().describe("Namespace description"),
	is_public: z.boolean().optional().describe("Whether the namespace is publicly accessible"),
});

export const UpdateNamespaceInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	namespace_id: z.string().uuid().describe("Namespace unique identifier"),
	description: z.string().optional().describe("Updated description"),
	is_public: z.boolean().optional().describe("Updated public visibility"),
});

export const DeleteNamespaceInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	namespace_id: z.string().uuid().describe("Namespace unique identifier"),
});

export const ListImagesInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	page: z.number().int().positive().optional().describe("Page number (1-indexed)"),
	page_size: z.number().int().min(1).max(100).optional().describe("Items per page (max 100)"),
	namespace_id: z.string().uuid().optional().describe("Filter by namespace ID"),
	name: z.string().optional().describe("Filter by image name"),
	order_by: z.string().optional().describe("Order results"),
});

export const GetImageInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	image_id: z.string().uuid().describe("Image unique identifier"),
});

export const UpdateImageInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	image_id: z.string().uuid().describe("Image unique identifier"),
	visibility: ImageVisibility.optional().describe("Updated image visibility"),
});

export const DeleteImageInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	image_id: z.string().uuid().describe("Image unique identifier"),
});

export const ListTagsInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	image_id: z.string().uuid().describe("Image unique identifier"),
	page: z.number().int().positive().optional().describe("Page number (1-indexed)"),
	page_size: z.number().int().min(1).max(100).optional().describe("Items per page (max 100)"),
	name: z.string().optional().describe("Filter by tag name"),
	order_by: z.string().optional().describe("Order results"),
});

export const GetTagInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	tag_id: z.string().uuid().describe("Tag unique identifier"),
});

export const DeleteTagInput = z.object({
	region: ScalewayRegion.describe("Region (e.g., fr-par, nl-ams, pl-waw)"),
	tag_id: z.string().uuid().describe("Tag unique identifier"),
});
