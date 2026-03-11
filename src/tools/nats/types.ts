import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- NATS Account Schemas ---

export const NatsAccountStatus = z.enum([
	"unknown_status",
	"ready",
	"error",
	"creating",
	"deleting",
]);
export type NatsAccountStatus = z.infer<typeof NatsAccountStatus>;

export const NatsAccount = z.object({
	id: z.string().uuid(),
	name: z.string(),
	endpoint: z.string(),
	project_id: z.string().uuid(),
	region: z.string(),
	status: NatsAccountStatus,
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
});
export type NatsAccount = z.infer<typeof NatsAccount>;

export const ListNatsAccountsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list accounts in (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by account name"),
	orderBy: z
		.enum([
			"created_at_asc",
			"created_at_desc",
			"updated_at_asc",
			"updated_at_desc",
			"name_asc",
			"name_desc",
		])
		.optional()
		.describe("Order results by field"),
});
export type ListNatsAccountsParams = z.infer<typeof ListNatsAccountsParams>;

export const ListNatsAccountsResponse = z.object({
	nats_accounts: z.array(NatsAccount),
	total_count: z.number().int().nonnegative(),
});
export type ListNatsAccountsResponse = z.infer<typeof ListNatsAccountsResponse>;

export const GetNatsAccountParams = z.object({
	region: ScalewayRegion.describe("Region of the NATS account"),
	natsAccountId: z.string().uuid().describe("ID of the NATS account"),
});
export type GetNatsAccountParams = z.infer<typeof GetNatsAccountParams>;

export const CreateNatsAccountParams = z.object({
	region: ScalewayRegion.describe("Region for the NATS account"),
	name: z.string().min(1).describe("Name for the NATS account"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
});
export type CreateNatsAccountParams = z.infer<typeof CreateNatsAccountParams>;

export const UpdateNatsAccountParams = z.object({
	region: ScalewayRegion.describe("Region of the NATS account"),
	natsAccountId: z.string().uuid().describe("ID of the NATS account"),
	name: z.string().min(1).optional().describe("New name for the account"),
});
export type UpdateNatsAccountParams = z.infer<typeof UpdateNatsAccountParams>;

export const DeleteNatsAccountParams = z.object({
	region: ScalewayRegion.describe("Region of the NATS account"),
	natsAccountId: z.string().uuid().describe("ID of the NATS account to delete"),
});
export type DeleteNatsAccountParams = z.infer<typeof DeleteNatsAccountParams>;

// --- NATS Credentials Schemas ---

export const NatsCredentials = z.object({
	id: z.string().uuid(),
	name: z.string(),
	nats_account_id: z.string().uuid(),
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
	checksum: z.string(),
});
export type NatsCredentials = z.infer<typeof NatsCredentials>;

export const NatsCredentialsContent = z.object({
	id: z.string().uuid(),
	name: z.string(),
	nats_account_id: z.string().uuid(),
	created_at: z.string().datetime({ offset: true }),
	updated_at: z.string().datetime({ offset: true }),
	checksum: z.string(),
	credentials: z.object({
		content: z.string(),
	}),
});
export type NatsCredentialsContent = z.infer<typeof NatsCredentialsContent>;

export const ListNatsCredentialsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region of the NATS account"),
	natsAccountId: z.string().uuid().describe("ID of the NATS account"),
	orderBy: z
		.enum([
			"created_at_asc",
			"created_at_desc",
			"updated_at_asc",
			"updated_at_desc",
			"name_asc",
			"name_desc",
		])
		.optional()
		.describe("Order results by field"),
});
export type ListNatsCredentialsParams = z.infer<typeof ListNatsCredentialsParams>;

export const ListNatsCredentialsResponse = z.object({
	nats_credentials: z.array(NatsCredentials),
	total_count: z.number().int().nonnegative(),
});
export type ListNatsCredentialsResponse = z.infer<typeof ListNatsCredentialsResponse>;

export const GetNatsCredentialsParams = z.object({
	region: ScalewayRegion.describe("Region of the NATS account"),
	natsCredentialsId: z.string().uuid().describe("ID of the NATS credentials"),
});
export type GetNatsCredentialsParams = z.infer<typeof GetNatsCredentialsParams>;

export const CreateNatsCredentialsParams = z.object({
	region: ScalewayRegion.describe("Region of the NATS account"),
	natsAccountId: z.string().uuid().describe("ID of the NATS account"),
	name: z.string().min(1).describe("Name for the credentials"),
});
export type CreateNatsCredentialsParams = z.infer<typeof CreateNatsCredentialsParams>;

export const DeleteNatsCredentialsParams = z.object({
	region: ScalewayRegion.describe("Region of the NATS account"),
	natsCredentialsId: z.string().uuid().describe("ID of the NATS credentials to delete"),
});
export type DeleteNatsCredentialsParams = z.infer<typeof DeleteNatsCredentialsParams>;
