import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// ── Enums ──────────────────────────────────────────────────────────────────

export const KeyAlgorithmSymmetricEncryption = z.enum([
	"unknown_symmetric_encryption",
	"aes_256_gcm",
]);

export const KeyAlgorithmAsymmetricEncryption = z.enum([
	"unknown_asymmetric_encryption",
	"rsa_oaep_2048_sha256",
	"rsa_oaep_3072_sha256",
	"rsa_oaep_4096_sha256",
]);

export const KeyAlgorithmAsymmetricSigning = z.enum([
	"unknown_asymmetric_signing",
	"ec_p256_sha256",
	"ec_p384_sha384",
	"rsa_pss_2048_sha256",
	"rsa_pss_3072_sha256",
	"rsa_pss_4096_sha256",
	"rsa_pkcs1_2048_sha256",
	"rsa_pkcs1_3072_sha256",
	"rsa_pkcs1_4096_sha256",
]);

export const DataKeyAlgorithmSymmetricEncryption = z.enum([
	"unknown_symmetric_encryption",
	"aes_256_gcm",
]);

export const KeyState = z.enum([
	"unknown_state",
	"enabled",
	"disabled",
	"pending_key_material",
	"scheduled_for_deletion",
]);

export const KeyOrigin = z.enum(["unknown_origin", "scaleway_kms", "external"]);

export const ListKeysOrderBy = z.enum([
	"name_asc",
	"name_desc",
	"created_at_asc",
	"created_at_desc",
	"updated_at_asc",
	"updated_at_desc",
]);

export const ListKeysUsage = z.enum([
	"unknown_usage",
	"symmetric_encryption",
	"asymmetric_encryption",
	"asymmetric_signing",
]);

// ── Nested schemas ─────────────────────────────────────────────────────────

export const KeyUsageSchema = z
	.object({
		symmetricEncryption: KeyAlgorithmSymmetricEncryption.optional().describe(
			"Symmetric encryption algorithm (one-of usage)",
		),
		asymmetricEncryption: KeyAlgorithmAsymmetricEncryption.optional().describe(
			"Asymmetric encryption algorithm (one-of usage)",
		),
		asymmetricSigning: KeyAlgorithmAsymmetricSigning.optional().describe(
			"Asymmetric signing algorithm (one-of usage)",
		),
	})
	.describe("Key usage - exactly one of the fields should be set");

export const RotationPolicySchema = z.object({
	rotationPeriod: z
		.string()
		.optional()
		.describe("Duration between rotations (e.g. '720h' for 30 days). Min 24h, max 876000h"),
	nextRotationAt: z.string().optional().describe("ISO 8601 timestamp of next scheduled rotation"),
});

// ── Tool input schemas ─────────────────────────────────────────────────────

export const ListKeysInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	organizationId: z.string().uuid().optional().describe("Filter by Organization ID"),
	projectId: z.string().uuid().optional().describe("Filter by Project ID"),
	orderBy: ListKeysOrderBy.optional().describe("Sort order for the list"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	name: z.string().optional().describe("Filter by key name"),
	usage: ListKeysUsage.optional().describe("Filter by key usage type"),
	scheduledForDeletion: z
		.boolean()
		.optional()
		.default(false)
		.describe("Include keys scheduled for deletion"),
	page: PaginationParams.shape.page,
	pageSize: PaginationParams.shape.pageSize,
});

export const GetKeyInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	keyId: z.string().uuid().describe("ID of the key to retrieve"),
});

export const CreateKeyInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("ID of the Project containing the key"),
	name: z.string().optional().describe("Name of the key"),
	usage: KeyUsageSchema.optional().describe("Key usage configuration"),
	description: z.string().optional().describe("Description of the key"),
	tags: z.array(z.string()).optional().describe("List of tags"),
	rotationPolicy: RotationPolicySchema.optional().describe("Rotation policy for the key"),
	unprotected: z
		.boolean()
		.optional()
		.default(false)
		.describe("Set to true to create an unprotected key"),
	origin: KeyOrigin.optional().describe("Key origin (scaleway_kms or external)"),
});

export const UpdateKeyInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	keyId: z.string().uuid().describe("ID of the key to update"),
	name: z.string().optional().describe("Updated name of the key"),
	description: z.string().optional().describe("Updated description of the key"),
	tags: z.array(z.string()).optional().describe("Updated list of tags"),
	rotationPolicy: RotationPolicySchema.optional().describe("Updated rotation policy"),
});

export const DeleteKeyInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	keyId: z.string().uuid().describe("ID of the key to delete"),
});

export const RotateKeyInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	keyId: z.string().uuid().describe("ID of the key to rotate"),
});

export const ProtectKeyInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	keyId: z.string().uuid().describe("ID of the key to protect"),
});

export const UnprotectKeyInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	keyId: z.string().uuid().describe("ID of the key to unprotect"),
});

export const EnableKeyInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	keyId: z.string().uuid().describe("ID of the key to enable"),
});

export const DisableKeyInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	keyId: z.string().uuid().describe("ID of the key to disable"),
});

export const EncryptInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	keyId: z.string().uuid().describe("ID of the key to use for encryption"),
	plaintext: z.string().min(1).describe("Base64-encoded data to encrypt (max 65535 bytes)"),
	associatedData: z
		.string()
		.optional()
		.describe("Additional authenticated data (only for symmetric keys)"),
});

export const DecryptInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	keyId: z.string().uuid().describe("ID of the key to use for decryption"),
	ciphertext: z.string().min(1).describe("Base64-encoded ciphertext to decrypt"),
	associatedData: z
		.string()
		.optional()
		.describe("Additional authenticated data used during encryption"),
});

export const GenerateDataKeyInput = z.object({
	region: ScalewayRegion.optional().describe("Region to target (e.g. fr-par)"),
	keyId: z.string().uuid().describe("ID of the key to generate a data key from"),
	algorithm: DataKeyAlgorithmSymmetricEncryption.optional().describe(
		"Symmetric encryption algorithm for the data key",
	),
	withoutPlaintext: z
		.boolean()
		.optional()
		.default(false)
		.describe("Set to true to omit plaintext from response"),
});
