import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

export const SnsInfoStatus = z.enum(["unknown_status", "enabled", "disabled"]);
export type SnsInfoStatus = z.infer<typeof SnsInfoStatus>;

export const ListSnsCredentialsOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"updated_at_asc",
	"updated_at_desc",
	"name_asc",
	"name_desc",
]);
export type ListSnsCredentialsOrderBy = z.infer<typeof ListSnsCredentialsOrderBy>;

// --- Embedded Objects ---

export const SnsPermissionsSchema = z.object({
	canPublish: z
		.boolean()
		.optional()
		.describe("Whether the credentials bearer can publish messages to topics"),
	canReceive: z
		.boolean()
		.optional()
		.describe("Whether the credentials bearer can receive messages (configure subscriptions)"),
	canManage: z
		.boolean()
		.optional()
		.describe("Whether the credentials bearer can manage topics or subscriptions"),
});
export type SnsPermissions = z.infer<typeof SnsPermissionsSchema>;

// --- Response Schemas ---

export const SnsInfoSchema = z.object({
	projectId: z.string().describe("Project ID of the Project containing the service"),
	region: z.string().describe("Region of the service"),
	createdAt: z.string().optional().describe("Topics and Events creation date"),
	updatedAt: z.string().optional().describe("Topics and Events last modification date"),
	status: SnsInfoStatus.describe("Topics and Events activation status"),
	snsEndpointUrl: z
		.string()
		.describe("Endpoint of the Topics and Events service for this region and project"),
});
export type SnsInfo = z.infer<typeof SnsInfoSchema>;

export const SnsCredentialsSchema = z.object({
	id: z.string().describe("ID of the credentials"),
	name: z.string().describe("Name of the credentials"),
	projectId: z.string().describe("Project ID of the Project containing the credentials"),
	region: z.string().describe("Region where the credentials exist"),
	createdAt: z.string().optional().describe("Credentials creation date"),
	updatedAt: z.string().optional().describe("Credentials last modification date"),
	accessKey: z.string().describe("Access key ID"),
	secretKey: z.string().describe("Secret key ID (only returned on create)"),
	secretChecksum: z.string().describe("Checksum of the secret key"),
	permissions: SnsPermissionsSchema.optional().describe(
		"Permissions associated with these credentials",
	),
});
export type SnsCredentials = z.infer<typeof SnsCredentialsSchema>;

// --- Request Schemas ---

export const ActivateSnsSchema = z.object({
	region: ScalewayRegion.optional().describe(
		"Region to target. If none is passed will use default region from the config",
	),
	projectId: z
		.string()
		.optional()
		.describe("Project on which to activate the Topics and Events service"),
});
export type ActivateSnsInput = z.infer<typeof ActivateSnsSchema>;

export const DeactivateSnsSchema = z.object({
	region: ScalewayRegion.optional().describe(
		"Region to target. If none is passed will use default region from the config",
	),
	projectId: z
		.string()
		.optional()
		.describe("Project on which to deactivate the Topics and Events service"),
});
export type DeactivateSnsInput = z.infer<typeof DeactivateSnsSchema>;

export const GetSnsInfoSchema = z.object({
	region: ScalewayRegion.optional().describe(
		"Region to target. If none is passed will use default region from the config",
	),
	projectId: z.string().optional().describe("Project to retrieve Topics and Events info from"),
});
export type GetSnsInfoInput = z.infer<typeof GetSnsInfoSchema>;

export const ListSnsCredentialsSchema = z
	.object({
		region: ScalewayRegion.optional().describe(
			"Region to target. If none is passed will use default region from the config",
		),
		projectId: z
			.string()
			.optional()
			.describe("Include only Topics and Events credentials in this Project"),
		orderBy: ListSnsCredentialsOrderBy.optional().describe("Order in which to return results"),
	})
	.merge(PaginationParams);
export type ListSnsCredentialsInput = z.infer<typeof ListSnsCredentialsSchema>;

export const GetSnsCredentialsSchema = z.object({
	region: ScalewayRegion.optional().describe(
		"Region to target. If none is passed will use default region from the config",
	),
	snsCredentialsId: z.string().describe("ID of the Topics and Events credentials to get"),
});
export type GetSnsCredentialsInput = z.infer<typeof GetSnsCredentialsSchema>;

export const CreateSnsCredentialsSchema = z.object({
	region: ScalewayRegion.optional().describe(
		"Region to target. If none is passed will use default region from the config",
	),
	projectId: z.string().optional().describe("Project containing the Topics and Events credentials"),
	name: z.string().optional().describe("Name of the credentials"),
	permissions: SnsPermissionsSchema.optional().describe(
		"Permissions associated with these credentials",
	),
});
export type CreateSnsCredentialsInput = z.infer<typeof CreateSnsCredentialsSchema>;

export const UpdateSnsCredentialsSchema = z.object({
	region: ScalewayRegion.optional().describe(
		"Region to target. If none is passed will use default region from the config",
	),
	snsCredentialsId: z.string().describe("ID of the Topics and Events credentials to update"),
	name: z.string().optional().describe("Name of the credentials"),
	permissions: SnsPermissionsSchema.optional().describe(
		"Permissions associated with these credentials",
	),
});
export type UpdateSnsCredentialsInput = z.infer<typeof UpdateSnsCredentialsSchema>;

export const DeleteSnsCredentialsSchema = z.object({
	region: ScalewayRegion.optional().describe(
		"Region to target. If none is passed will use default region from the config",
	),
	snsCredentialsId: z.string().describe("ID of the credentials to delete"),
});
export type DeleteSnsCredentialsInput = z.infer<typeof DeleteSnsCredentialsSchema>;
