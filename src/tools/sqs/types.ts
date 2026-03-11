import { z } from "zod";

// --- Shared Enums ---

export const SqsStatus = z.enum(["unknown_status", "enabled", "disabled"]);
export type SqsStatus = z.infer<typeof SqsStatus>;

export const SqsCredentialsOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"name_asc",
	"name_desc",
	"updated_at_asc",
	"updated_at_desc",
]);
export type SqsCredentialsOrderBy = z.infer<typeof SqsCredentialsOrderBy>;

// --- Permissions ---

export const SqsPermissions = z.object({
	can_publish: z.boolean().optional().default(false).describe("Allow publishing messages"),
	can_receive: z.boolean().optional().default(false).describe("Allow receiving messages"),
	can_manage: z.boolean().optional().default(false).describe("Allow managing queues"),
});
export type SqsPermissions = z.infer<typeof SqsPermissions>;

// --- Response Models ---

export const SqsInfo = z.object({
	project_id: z.string().describe("Project ID"),
	region: z.string().describe("Region"),
	status: SqsStatus.describe("Service status"),
	sqs_endpoint_url: z.string().describe("SQS-compatible endpoint URL"),
	created_at: z.string().nullable().describe("ISO 8601 creation timestamp"),
	updated_at: z.string().nullable().describe("ISO 8601 update timestamp"),
});
export type SqsInfo = z.infer<typeof SqsInfo>;

export const SqsCredentials = z.object({
	id: z.string().describe("Credential ID"),
	name: z.string().describe("Credential name"),
	project_id: z.string().describe("Project ID"),
	region: z.string().describe("Region"),
	access_key: z.string().describe("SQS access key"),
	secret_key: z.string().describe("SQS secret key"),
	created_at: z.string().nullable().describe("ISO 8601 creation timestamp"),
	updated_at: z.string().nullable().describe("ISO 8601 update timestamp"),
	permissions: SqsPermissions.nullable().describe("Permission set"),
});
export type SqsCredentials = z.infer<typeof SqsCredentials>;

// --- Input Schemas ---

export const ActivateSqsInput = z.object({
	region: z.string().optional().describe("Scaleway region (e.g., fr-par)"),
	project_id: z.string().uuid().optional().describe("Project ID"),
});
export type ActivateSqsInput = z.infer<typeof ActivateSqsInput>;

export const DeactivateSqsInput = z.object({
	region: z.string().optional().describe("Scaleway region (e.g., fr-par)"),
	project_id: z.string().uuid().optional().describe("Project ID"),
});
export type DeactivateSqsInput = z.infer<typeof DeactivateSqsInput>;

export const GetSqsInfoInput = z.object({
	region: z.string().optional().describe("Scaleway region (e.g., fr-par)"),
	project_id: z.string().uuid().optional().describe("Project ID"),
});
export type GetSqsInfoInput = z.infer<typeof GetSqsInfoInput>;

export const CreateSqsCredentialsInput = z.object({
	region: z.string().optional().describe("Scaleway region (e.g., fr-par)"),
	project_id: z.string().uuid().optional().describe("Project ID"),
	name: z.string().describe("Credential name"),
	permissions: SqsPermissions.optional().describe("Permission set"),
});
export type CreateSqsCredentialsInput = z.infer<typeof CreateSqsCredentialsInput>;

export const DeleteSqsCredentialsInput = z.object({
	region: z.string().optional().describe("Scaleway region (e.g., fr-par)"),
	credential_id: z.string().uuid().describe("Credential ID to delete"),
});
export type DeleteSqsCredentialsInput = z.infer<typeof DeleteSqsCredentialsInput>;

export const GetSqsCredentialsInput = z.object({
	region: z.string().optional().describe("Scaleway region (e.g., fr-par)"),
	credential_id: z.string().uuid().describe("Credential ID"),
});
export type GetSqsCredentialsInput = z.infer<typeof GetSqsCredentialsInput>;

export const ListSqsCredentialsInput = z.object({
	region: z.string().optional().describe("Scaleway region (e.g., fr-par)"),
	project_id: z.string().uuid().optional().describe("Project ID"),
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	order_by: SqsCredentialsOrderBy.optional().default("created_at_asc").describe("Order by field"),
});
export type ListSqsCredentialsInput = z.infer<typeof ListSqsCredentialsInput>;

export const UpdateSqsCredentialsInput = z.object({
	region: z.string().optional().describe("Scaleway region (e.g., fr-par)"),
	credential_id: z.string().uuid().describe("Credential ID"),
	name: z.string().optional().describe("New credential name"),
	permissions: SqsPermissions.optional().describe("Updated permission set"),
});
export type UpdateSqsCredentialsInput = z.infer<typeof UpdateSqsCredentialsInput>;
