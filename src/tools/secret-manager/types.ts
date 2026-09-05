import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// ── Enums ──────────────────────────────────────────────────────────────────

export const SecretType = z
	.enum([
		"unknown_type",
		"opaque",
		"certificate",
		"key_value",
		"basic_credentials",
		"database_credentials",
		"ssh_key",
	])
	.describe("Type of the secret");

export const SecretStatus = z
	.enum(["unknown_status", "ready", "locked"])
	.describe("Status of the secret");

export const SecretVersionStatus = z
	.enum(["unknown_status", "enabled", "disabled", "deleted", "scheduled_for_deletion"])
	.describe("Status of the secret version");

export const EphemeralPolicyAction = z
	.enum(["unknown_action", "delete", "disable"])
	.describe("Action to perform when the ephemeral policy expires");

export const Product = z
	.enum(["unknown_product", "edge_services", "s2s_vpn"])
	.describe("Scaleway product that can own a secret");

export const ListSecretsOrderBy = z
	.enum([
		"name_asc",
		"name_desc",
		"created_at_asc",
		"created_at_desc",
		"updated_at_asc",
		"updated_at_desc",
	])
	.describe("Field to order secrets by");

// ── Reusable sub-schemas ───────────────────────────────────────────────────

export const EphemeralPolicyInput = z.object({
	timeToLive: z
		.string()
		.optional()
		.describe("Time frame during which the secret's versions are valid (e.g. '3600s')"),
	expiresOnceAccessed: z
		.boolean()
		.optional()
		.describe("If true, the version expires after a single user access"),
	action: EphemeralPolicyAction.describe("Action to perform once the version expires"),
});

// ── Tool Input Schemas ─────────────────────────────────────────────────────

export const ListSecretsInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	organizationId: z.string().uuid().optional().describe("Organization ID"),
	projectId: z.string().uuid().optional().describe("Project ID"),
	orderBy: ListSecretsOrderBy.optional().describe("Order results by field"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	name: z.string().optional().describe("Filter by secret name"),
	path: z.string().optional().describe("Filter by exact path"),
	ephemeral: z.boolean().optional().describe("Filter ephemeral / non-ephemeral secrets"),
	type: SecretType.optional().describe("Filter by secret type"),
});

export const GetSecretInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
});

export const CreateSecretInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Project ID"),
	name: z.string().min(1).describe("Name of the secret"),
	tags: z.array(z.string()).optional().describe("Tags for the secret"),
	description: z.string().optional().describe("Description of the secret"),
	type: SecretType.optional().describe("Type of secret (default: opaque)"),
	path: z.string().optional().describe("Location in the directory structure (default: /)"),
	ephemeralPolicy: EphemeralPolicyInput.optional().describe(
		"Policy defining when secret versions expire",
	),
	isProtected: z
		.boolean()
		.optional()
		.default(false)
		.describe("If true, the secret cannot be deleted"),
});

export const UpdateSecretInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
	name: z.string().optional().describe("Updated name"),
	tags: z.array(z.string()).optional().describe("Updated tags"),
	description: z.string().optional().describe("Updated description"),
	path: z.string().optional().describe("Updated path"),
	ephemeralPolicy: EphemeralPolicyInput.optional().describe("Updated ephemeral policy"),
});

export const DeleteSecretInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
});

export const ListSecretVersionsInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
	status: z.array(SecretVersionStatus).optional().describe("Filter by version status"),
});

const SecretRevision = z
	.string()
	.regex(/^(?:[0-9]+|latest|latest_enabled)$/, "Use a decimal revision, latest or latest_enabled")
	.describe("Revision number, latest, or latest_enabled");

export const GetSecretVersionInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
	revision: SecretRevision,
});

export const CreateSecretVersionInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
	data: z.string().min(1).describe("Base64-encoded secret payload"),
	description: z.string().optional().describe("Description of the version"),
	disablePrevious: z.boolean().optional().describe("Disable the previous version"),
	dataCrc32: z.number().optional().describe("CRC32 checksum for integrity"),
});

export const AccessSecretVersionInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
	revision: SecretRevision,
});

export const DisableSecretVersionInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
	revision: SecretRevision,
});

export const EnableSecretVersionInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
	revision: SecretRevision,
});

export const DestroySecretVersionInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
	revision: SecretRevision,
});

export const ProtectSecretInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
});

export const UnprotectSecretInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
});

export const ListTagsInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Project ID"),
});

export const AddSecretOwnerInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	secretId: z.string().uuid().describe("ID of the secret"),
	product: Product.optional().describe("Scaleway product to grant access to"),
});
