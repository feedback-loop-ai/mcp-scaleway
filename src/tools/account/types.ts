import { z } from "zod";

// --- Enums ---

export const ListProjectsOrderBy = z
	.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
	.optional()
	.default("created_at_asc")
	.describe("Sort order for returned projects");

// --- Schemas ---

export const ListProjectsParams = z.object({
	organization_id: z.string().uuid().optional().describe("Organization ID to filter projects by"),
	name: z.string().optional().describe("Name filter - returns projects matching this name"),
	project_ids: z.array(z.string().uuid()).optional().describe("Filter by specific project IDs"),
	order_by: ListProjectsOrderBy,
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	page_size: z
		.number()
		.int()
		.min(1)
		.max(100)
		.optional()
		.default(50)
		.describe("Items per page (1-100)"),
});
export type ListProjectsParams = z.infer<typeof ListProjectsParams>;

export const GetProjectParams = z.object({
	project_id: z.string().uuid().describe("ID of the project to retrieve"),
});
export type GetProjectParams = z.infer<typeof GetProjectParams>;

export const CreateProjectParams = z.object({
	name: z
		.string()
		.min(1)
		.max(64)
		.optional()
		.describe("Name of the project (auto-generated if omitted)"),
	organization_id: z
		.string()
		.uuid()
		.optional()
		.describe("Organization ID for the project (uses default if omitted)"),
	description: z.string().max(200).describe("Description of the project"),
});
export type CreateProjectParams = z.infer<typeof CreateProjectParams>;

export const UpdateProjectParams = z.object({
	project_id: z.string().uuid().describe("ID of the project to update"),
	name: z.string().min(1).max(64).optional().describe("New name for the project"),
	description: z.string().max(200).optional().describe("New description for the project"),
});
export type UpdateProjectParams = z.infer<typeof UpdateProjectParams>;

export const DeleteProjectParams = z.object({
	project_id: z.string().uuid().describe("ID of the project to delete (must be empty)"),
});
export type DeleteProjectParams = z.infer<typeof DeleteProjectParams>;

// --- Response types ---

export interface ProjectResponse {
	id: string;
	name: string;
	organization_id: string;
	description: string;
	created_at: string | null;
	updated_at: string | null;
}

export interface ListProjectsApiResponse {
	projects: ProjectResponse[];
	total_count: number;
	page: number;
	page_size: number;
}
