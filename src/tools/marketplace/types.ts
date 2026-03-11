import { z } from "zod";

// --- Enums ---

export const ListImagesOrderBy = z
	.enum([
		"name_asc",
		"name_desc",
		"created_at_asc",
		"created_at_desc",
		"updated_at_asc",
		"updated_at_desc",
	])
	.optional()
	.describe("Sort order for images");

export const ListLocalImagesOrderBy = z
	.enum(["type_asc", "type_desc", "created_at_asc", "created_at_desc"])
	.optional()
	.describe("Sort order for local images");

export const ListVersionsOrderBy = z
	.enum(["created_at_asc", "created_at_desc"])
	.optional()
	.describe("Sort order for versions");

export const LocalImageType = z
	.enum(["unknown_type", "instance_local", "instance_sbs"])
	.optional()
	.describe("Type of local image");

// --- Response schemas ---

export const CategorySchema = z.object({
	id: z.string().describe("Category UUID"),
	name: z.string().describe("Category name"),
	description: z.string().describe("Category description"),
});
export type Category = z.infer<typeof CategorySchema>;

export const ImageSchema = z.object({
	id: z.string().describe("Image UUID"),
	name: z.string().describe("Image name"),
	description: z.string().describe("Image description"),
	logo: z.string().describe("Logo URL"),
	categories: z.array(z.string()).describe("Category IDs"),
	createdAt: z.string().optional().describe("Creation timestamp"),
	updatedAt: z.string().optional().describe("Last update timestamp"),
	validUntil: z.string().optional().describe("End-of-life date"),
	label: z.string().describe("Image label"),
});
export type Image = z.infer<typeof ImageSchema>;

export const LocalImageSchema = z.object({
	id: z.string().describe("Local image UUID"),
	compatibleCommercialTypes: z.array(z.string()).describe("Compatible instance types"),
	arch: z.string().describe("CPU architecture"),
	zone: z.string().describe("Availability zone"),
	label: z.string().describe("Image label"),
	type: z.string().describe("Image type"),
});
export type LocalImage = z.infer<typeof LocalImageSchema>;

export const VersionSchema = z.object({
	id: z.string().describe("Version UUID"),
	name: z.string().describe("Version name"),
	createdAt: z.string().optional().describe("Creation timestamp"),
	updatedAt: z.string().optional().describe("Last update timestamp"),
	publishedAt: z.string().optional().describe("Publish timestamp"),
});
export type Version = z.infer<typeof VersionSchema>;

// --- Request input schemas ---

export const ListImagesInput = z.object({
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	pageSize: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	orderBy: ListImagesOrderBy,
	arch: z.string().optional().describe("Filter by CPU architecture (e.g., x86_64, arm64)"),
	category: z.string().optional().describe("Filter by category ID"),
	includeEol: z
		.boolean()
		.optional()
		.default(false)
		.describe("Include end-of-life images in results"),
});
export type ListImagesInput = z.infer<typeof ListImagesInput>;

export const GetImageInput = z.object({
	imageId: z.string().describe("UUID of the marketplace image"),
});
export type GetImageInput = z.infer<typeof GetImageInput>;

export const ListLocalImagesInput = z.object({
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	pageSize: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	orderBy: ListLocalImagesOrderBy,
	zone: z.string().optional().describe("Filter by availability zone (e.g., fr-par-1)"),
	arch: z.string().optional().describe("Filter by CPU architecture"),
	imageId: z.string().optional().describe("Filter by parent image UUID"),
	versionId: z.string().optional().describe("Filter by version UUID"),
	imageLabel: z.string().optional().describe("Filter by image label"),
	type: LocalImageType,
});
export type ListLocalImagesInput = z.infer<typeof ListLocalImagesInput>;

export const GetLocalImageInput = z.object({
	localImageId: z.string().describe("UUID of the local image"),
});
export type GetLocalImageInput = z.infer<typeof GetLocalImageInput>;

export const ListCategoriesInput = z.object({
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	pageSize: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
});
export type ListCategoriesInput = z.infer<typeof ListCategoriesInput>;

export const GetCategoryInput = z.object({
	categoryId: z.string().describe("UUID of the category"),
});
export type GetCategoryInput = z.infer<typeof GetCategoryInput>;

export const ListVersionsInput = z.object({
	imageId: z.string().describe("UUID of the parent image (required)"),
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	pageSize: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	orderBy: ListVersionsOrderBy,
});
export type ListVersionsInput = z.infer<typeof ListVersionsInput>;

export const GetVersionInput = z.object({
	versionId: z.string().describe("UUID of the version"),
});
export type GetVersionInput = z.infer<typeof GetVersionInput>;
