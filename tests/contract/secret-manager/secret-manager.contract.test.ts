/**
 * Contract tests for Scaleway Secret Manager API (v1beta1)
 *
 * Validates request/response shapes against specs/scaleway-api/secret-manager/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * Secret Manager is implemented via the @scaleway/sdk-secret package (Secretv1beta1.API),
 * so these contract tests validate the zod parameter schemas exposed by the MCP tools
 * plus the documented response shapes (Secret, SecretVersion, AccessSecretVersionResponse,
 * ListSecrets/ListSecretVersions/ListTags responses) taken from the SDK type definitions.
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	AccessSecretVersionInput,
	AddSecretOwnerInput,
	CreateSecretInput,
	CreateSecretVersionInput,
	DeleteSecretInput,
	DestroySecretVersionInput,
	DisableSecretVersionInput,
	EnableSecretVersionInput,
	EphemeralPolicyAction,
	EphemeralPolicyInput,
	GetSecretInput,
	GetSecretVersionInput,
	ListSecretVersionsInput,
	ListSecretsInput,
	ListSecretsOrderBy,
	ListTagsInput,
	Product,
	ProtectSecretInput,
	SecretStatus,
	SecretType,
	SecretVersionStatus,
	UnprotectSecretInput,
	UpdateSecretInput,
} from "../../../src/tools/secret-manager/types.js";

// --- Shared fixtures ---

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_REGION = "fr-par";

// Documented response entity shapes (from @scaleway/sdk-secret types.gen.d.ts).
// Kept local to the contract test so it documents the API contract independently.
const EphemeralPolicy = z.object({
	timeToLive: z.string().optional(),
	expiresOnceAccessed: z.boolean().optional(),
	action: EphemeralPolicyAction,
});

const Secret = z.object({
	id: z.string(),
	projectId: z.string(),
	name: z.string(),
	status: SecretStatus,
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
	tags: z.array(z.string()),
	versionCount: z.number().int(),
	description: z.string().optional(),
	managed: z.boolean(),
	protected: z.boolean(),
	type: SecretType,
	path: z.string(),
	ephemeralPolicy: EphemeralPolicy.optional(),
	usedBy: z.array(Product),
	deletionRequestedAt: z.string().optional(),
	keyId: z.string().optional(),
	region: z.string(),
});

const SecretVersion = z.object({
	revision: z.number().int(),
	secretId: z.string(),
	status: SecretVersionStatus,
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
	deletedAt: z.string().optional(),
	description: z.string().optional(),
	latest: z.boolean(),
	deletionRequestedAt: z.string().optional(),
	region: z.string(),
});

const AccessSecretVersionResponse = z.object({
	secretId: z.string(),
	revision: z.number().int(),
	data: z.string(),
	dataCrc32: z.number().optional(),
	type: SecretType,
});

const validSecret = {
	id: VALID_UUID,
	projectId: VALID_UUID,
	name: "db-password",
	status: "ready" as const,
	createdAt: "2025-06-01T12:00:00Z",
	updatedAt: "2025-06-01T12:30:00Z",
	tags: ["production"],
	versionCount: 2,
	description: "Database password",
	managed: false,
	protected: false,
	type: "opaque" as const,
	path: "/",
	usedBy: [],
	region: VALID_REGION,
};

const validSecretVersion = {
	revision: 1,
	secretId: VALID_UUID,
	status: "enabled" as const,
	createdAt: "2025-06-01T12:00:00Z",
	updatedAt: "2025-06-01T12:00:00Z",
	latest: true,
	region: VALID_REGION,
};

// --- Enum contracts ---

describe("contract: SecretType enum", () => {
	it("accepts all documented secret types", () => {
		for (const t of [
			"unknown_type",
			"opaque",
			"certificate",
			"key_value",
			"basic_credentials",
			"database_credentials",
			"ssh_key",
		]) {
			expect(() => SecretType.parse(t)).not.toThrow();
		}
	});

	it("rejects an unknown secret type", () => {
		expect(() => SecretType.parse("random")).toThrow();
	});
});

describe("contract: SecretStatus enum", () => {
	it("accepts all documented statuses", () => {
		for (const s of ["unknown_status", "ready", "locked"]) {
			expect(() => SecretStatus.parse(s)).not.toThrow();
		}
	});

	it("rejects an invalid status", () => {
		expect(() => SecretStatus.parse("deleting")).toThrow();
	});
});

describe("contract: SecretVersionStatus enum", () => {
	it("accepts all documented version statuses", () => {
		for (const s of [
			"unknown_status",
			"enabled",
			"disabled",
			"deleted",
			"scheduled_for_deletion",
		]) {
			expect(() => SecretVersionStatus.parse(s)).not.toThrow();
		}
	});

	it("rejects an invalid version status", () => {
		expect(() => SecretVersionStatus.parse("locked")).toThrow();
	});
});

describe("contract: Product enum", () => {
	it("accepts all documented products", () => {
		for (const p of ["unknown_product", "edge_services", "s2s_vpn"]) {
			expect(() => Product.parse(p)).not.toThrow();
		}
	});

	it("rejects an invalid product", () => {
		expect(() => Product.parse("object_storage")).toThrow();
	});
});

describe("contract: EphemeralPolicyAction enum", () => {
	it("accepts all documented actions", () => {
		for (const a of ["unknown_action", "delete", "disable"]) {
			expect(() => EphemeralPolicyAction.parse(a)).not.toThrow();
		}
	});

	it("rejects an invalid action", () => {
		expect(() => EphemeralPolicyAction.parse("destroy")).toThrow();
	});
});

describe("contract: ListSecretsOrderBy enum", () => {
	it("accepts all documented order-by values", () => {
		for (const o of [
			"name_asc",
			"name_desc",
			"created_at_asc",
			"created_at_desc",
			"updated_at_asc",
			"updated_at_desc",
		]) {
			expect(() => ListSecretsOrderBy.parse(o)).not.toThrow();
		}
	});

	it("rejects an invalid order-by value", () => {
		expect(() => ListSecretsOrderBy.parse("size_asc")).toThrow();
	});
});

describe("contract: EphemeralPolicyInput shape", () => {
	it("validates a minimal policy (action only)", () => {
		expect(() => EphemeralPolicyInput.parse({ action: "delete" })).not.toThrow();
	});

	it("validates a full policy", () => {
		expect(() =>
			EphemeralPolicyInput.parse({
				timeToLive: "3600s",
				expiresOnceAccessed: true,
				action: "disable",
			}),
		).not.toThrow();
	});

	it("rejects a policy missing the required action", () => {
		expect(() => EphemeralPolicyInput.parse({ timeToLive: "3600s" })).toThrow();
	});
});

// --- Request shape contracts ---

/**
 * API: GET /secret-manager/v1beta1/regions/{region}/secrets
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#list-secrets
 */
describe("contract: ListSecrets request shape", () => {
	it("validates an empty request (all optional, region optional)", () => {
		expect(() => ListSecretsInput.parse({})).not.toThrow();
	});

	it("applies default pagination", () => {
		const result = ListSecretsInput.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("validates a fully filtered request", () => {
		const input = {
			region: VALID_REGION,
			organizationId: VALID_UUID,
			projectId: VALID_UUID,
			orderBy: "name_asc",
			tags: ["prod"],
			name: "db",
			path: "/apps",
			ephemeral: false,
			type: "opaque",
			page: 2,
			pageSize: 25,
		};
		expect(() => ListSecretsInput.parse(input)).not.toThrow();
	});

	it("rejects a non-UUID projectId", () => {
		expect(() => ListSecretsInput.parse({ projectId: "not-a-uuid" })).toThrow();
	});

	it("rejects an invalid region format", () => {
		expect(() => ListSecretsInput.parse({ region: "invalid" })).toThrow();
	});
});

/**
 * API: GET /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#get-secret
 */
describe("contract: GetSecret request shape", () => {
	it("validates a get request", () => {
		expect(() => GetSecretInput.parse({ secretId: VALID_UUID })).not.toThrow();
	});

	it("rejects a missing secretId", () => {
		expect(() => GetSecretInput.parse({ region: VALID_REGION })).toThrow();
	});

	it("rejects a non-UUID secretId", () => {
		expect(() => GetSecretInput.parse({ secretId: "abc" })).toThrow();
	});
});

/**
 * API: POST /secret-manager/v1beta1/regions/{region}/secrets
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#create-secret
 */
describe("contract: CreateSecret request shape", () => {
	it("validates a minimal create request", () => {
		expect(() => CreateSecretInput.parse({ name: "my-secret" })).not.toThrow();
	});

	it("defaults isProtected to false", () => {
		const result = CreateSecretInput.parse({ name: "my-secret" });
		expect(result.isProtected).toBe(false);
	});

	it("validates a full create request", () => {
		const input = {
			region: VALID_REGION,
			projectId: VALID_UUID,
			name: "my-secret",
			tags: ["a", "b"],
			description: "desc",
			type: "key_value",
			path: "/apps",
			ephemeralPolicy: { timeToLive: "3600s", action: "delete" },
			isProtected: true,
		};
		expect(() => CreateSecretInput.parse(input)).not.toThrow();
	});

	it("rejects a create request with an empty name", () => {
		expect(() => CreateSecretInput.parse({ name: "" })).toThrow();
	});

	it("rejects a create request missing the name", () => {
		expect(() => CreateSecretInput.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: PATCH /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#update-secret
 */
describe("contract: UpdateSecret request shape", () => {
	it("validates an update with only the secretId", () => {
		expect(() => UpdateSecretInput.parse({ secretId: VALID_UUID })).not.toThrow();
	});

	it("validates an update with all optional fields", () => {
		const input = {
			region: VALID_REGION,
			secretId: VALID_UUID,
			name: "renamed",
			tags: ["x"],
			description: "new desc",
			path: "/new",
			ephemeralPolicy: { action: "disable" },
		};
		expect(() => UpdateSecretInput.parse(input)).not.toThrow();
	});

	it("rejects an update missing the secretId", () => {
		expect(() => UpdateSecretInput.parse({ name: "x" })).toThrow();
	});
});

/**
 * API: DELETE /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#delete-secret
 */
describe("contract: DeleteSecret request shape", () => {
	it("validates a delete request", () => {
		expect(() => DeleteSecretInput.parse({ secretId: VALID_UUID })).not.toThrow();
	});

	it("rejects a delete missing the secretId", () => {
		expect(() => DeleteSecretInput.parse({})).toThrow();
	});
});

/**
 * API: GET /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#list-secret-versions
 */
describe("contract: ListSecretVersions request shape", () => {
	it("validates a request with only the secretId", () => {
		expect(() => ListSecretVersionsInput.parse({ secretId: VALID_UUID })).not.toThrow();
	});

	it("validates a request with a status filter", () => {
		const input = {
			region: VALID_REGION,
			secretId: VALID_UUID,
			status: ["enabled", "disabled"],
			page: 1,
			pageSize: 20,
		};
		expect(() => ListSecretVersionsInput.parse(input)).not.toThrow();
	});

	it("rejects an invalid status value", () => {
		expect(() =>
			ListSecretVersionsInput.parse({ secretId: VALID_UUID, status: ["bogus"] }),
		).toThrow();
	});

	it("rejects a request missing the secretId", () => {
		expect(() => ListSecretVersionsInput.parse({})).toThrow();
	});
});

/**
 * API: GET /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions/{revision}
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#get-secret-version
 */
describe("contract: GetSecretVersion request shape", () => {
	it("validates a numeric revision", () => {
		expect(() =>
			GetSecretVersionInput.parse({ secretId: VALID_UUID, revision: "1" }),
		).not.toThrow();
	});

	it("validates the latest/latest_enabled aliases", () => {
		for (const revision of ["latest", "latest_enabled"]) {
			expect(() => GetSecretVersionInput.parse({ secretId: VALID_UUID, revision })).not.toThrow();
		}
	});

	it("rejects a request missing the revision", () => {
		expect(() => GetSecretVersionInput.parse({ secretId: VALID_UUID })).toThrow();
	});
});

/**
 * API: POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#create-secret-version
 */
describe("contract: CreateSecretVersion request shape", () => {
	it("validates a minimal create-version request", () => {
		expect(() =>
			CreateSecretVersionInput.parse({ secretId: VALID_UUID, data: "aGVsbG8=" }),
		).not.toThrow();
	});

	it("validates a full create-version request", () => {
		const input = {
			region: VALID_REGION,
			secretId: VALID_UUID,
			data: "aGVsbG8=",
			description: "v2",
			disablePrevious: true,
			dataCrc32: 123456,
		};
		expect(() => CreateSecretVersionInput.parse(input)).not.toThrow();
	});

	it("rejects an empty data payload", () => {
		expect(() => CreateSecretVersionInput.parse({ secretId: VALID_UUID, data: "" })).toThrow();
	});
});

/**
 * API: GET /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions/{revision}/access
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#access-secret-version
 */
describe("contract: AccessSecretVersion request shape", () => {
	it("validates an access request", () => {
		expect(() =>
			AccessSecretVersionInput.parse({ secretId: VALID_UUID, revision: "latest" }),
		).not.toThrow();
	});

	it("rejects a request missing the revision", () => {
		expect(() => AccessSecretVersionInput.parse({ secretId: VALID_UUID })).toThrow();
	});
});

/**
 * API: POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions/{revision}/disable
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#disable-secret-version
 */
describe("contract: DisableSecretVersion request shape", () => {
	it("validates a disable request", () => {
		expect(() =>
			DisableSecretVersionInput.parse({ secretId: VALID_UUID, revision: "2" }),
		).not.toThrow();
	});

	it("rejects a request missing the revision", () => {
		expect(() => DisableSecretVersionInput.parse({ secretId: VALID_UUID })).toThrow();
	});
});

/**
 * API: POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions/{revision}/enable
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#enable-secret-version
 */
describe("contract: EnableSecretVersion request shape", () => {
	it("validates an enable request", () => {
		expect(() =>
			EnableSecretVersionInput.parse({ secretId: VALID_UUID, revision: "2" }),
		).not.toThrow();
	});

	it("rejects a request missing the revision", () => {
		expect(() => EnableSecretVersionInput.parse({ secretId: VALID_UUID })).toThrow();
	});
});

/**
 * API: DELETE /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions/{revision}
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#destroy-secret-version
 */
describe("contract: DestroySecretVersion request shape", () => {
	it("validates a destroy request", () => {
		expect(() =>
			DestroySecretVersionInput.parse({ secretId: VALID_UUID, revision: "3" }),
		).not.toThrow();
	});

	it("rejects a request missing the revision", () => {
		expect(() => DestroySecretVersionInput.parse({ secretId: VALID_UUID })).toThrow();
	});
});

/**
 * API: POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/protect
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#protect-secret
 */
describe("contract: ProtectSecret request shape", () => {
	it("validates a protect request", () => {
		expect(() => ProtectSecretInput.parse({ secretId: VALID_UUID })).not.toThrow();
	});

	it("rejects a protect missing the secretId", () => {
		expect(() => ProtectSecretInput.parse({})).toThrow();
	});
});

/**
 * API: POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/unprotect
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#unprotect-secret
 */
describe("contract: UnprotectSecret request shape", () => {
	it("validates an unprotect request", () => {
		expect(() => UnprotectSecretInput.parse({ secretId: VALID_UUID })).not.toThrow();
	});

	it("rejects an unprotect missing the secretId", () => {
		expect(() => UnprotectSecretInput.parse({})).toThrow();
	});
});

/**
 * API: GET /secret-manager/v1beta1/regions/{region}/tags
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#list-tags
 */
describe("contract: ListTags request shape", () => {
	it("validates an empty request", () => {
		expect(() => ListTagsInput.parse({})).not.toThrow();
	});

	it("validates a request with a projectId filter and pagination", () => {
		expect(() =>
			ListTagsInput.parse({ region: VALID_REGION, projectId: VALID_UUID, page: 1, pageSize: 10 }),
		).not.toThrow();
	});

	it("rejects a non-UUID projectId", () => {
		expect(() => ListTagsInput.parse({ projectId: "x" })).toThrow();
	});
});

/**
 * API: POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/add-owner
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#add-secret-owner
 */
describe("contract: AddSecretOwner request shape", () => {
	it("validates a request without a product (optional)", () => {
		expect(() => AddSecretOwnerInput.parse({ secretId: VALID_UUID })).not.toThrow();
	});

	it("validates a request with a product", () => {
		expect(() =>
			AddSecretOwnerInput.parse({ secretId: VALID_UUID, product: "edge_services" }),
		).not.toThrow();
	});

	it("rejects an invalid product", () => {
		expect(() =>
			AddSecretOwnerInput.parse({ secretId: VALID_UUID, product: "instances" }),
		).toThrow();
	});
});

// --- Response shape contracts ---

/**
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#secret-entity
 */
describe("contract: Secret response entity", () => {
	it("validates a full secret", () => {
		expect(() => Secret.parse(validSecret)).not.toThrow();
	});

	it("validates a secret with an ephemeral policy and usedBy products", () => {
		expect(() =>
			Secret.parse({
				...validSecret,
				ephemeralPolicy: { timeToLive: "3600s", action: "delete" },
				usedBy: ["edge_services"],
				keyId: VALID_UUID,
			}),
		).not.toThrow();
	});

	it("rejects a secret missing versionCount", () => {
		const { versionCount, ...rest } = validSecret;
		void versionCount;
		expect(() => Secret.parse(rest)).toThrow();
	});
});

/**
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#secretversion-entity
 */
describe("contract: SecretVersion response entity", () => {
	it("validates a version", () => {
		expect(() => SecretVersion.parse(validSecretVersion)).not.toThrow();
	});

	it("rejects a version with an invalid status", () => {
		expect(() => SecretVersion.parse({ ...validSecretVersion, status: "ready" })).toThrow();
	});
});

/**
 * Spec: specs/scaleway-api/secret-manager/api-reference.md#access-secret-version
 */
describe("contract: AccessSecretVersion response shape", () => {
	it("validates an access response", () => {
		const response = {
			secretId: VALID_UUID,
			revision: 1,
			data: "aGVsbG8=",
			type: "opaque",
		};
		expect(() => AccessSecretVersionResponse.parse(response)).not.toThrow();
	});

	it("validates an access response with a CRC32 checksum", () => {
		const response = {
			secretId: VALID_UUID,
			revision: 1,
			data: "aGVsbG8=",
			dataCrc32: 987654,
			type: "opaque",
		};
		expect(() => AccessSecretVersionResponse.parse(response)).not.toThrow();
	});
});

describe("contract: ListSecrets response shape", () => {
	const ListSecretsResponse = z.object({
		secrets: z.array(Secret),
		totalCount: z.number().int(),
	});

	it("validates a list response", () => {
		expect(() =>
			ListSecretsResponse.parse({ secrets: [validSecret], totalCount: 1 }),
		).not.toThrow();
	});

	it("validates an empty list response", () => {
		expect(() => ListSecretsResponse.parse({ secrets: [], totalCount: 0 })).not.toThrow();
	});
});

describe("contract: ListSecretVersions response shape", () => {
	const ListSecretVersionsResponse = z.object({
		versions: z.array(SecretVersion),
		totalCount: z.number().int(),
	});

	it("validates a list-versions response", () => {
		expect(() =>
			ListSecretVersionsResponse.parse({ versions: [validSecretVersion], totalCount: 1 }),
		).not.toThrow();
	});
});

describe("contract: ListTags response shape", () => {
	const ListTagsResponse = z.object({
		tags: z.array(z.string()),
		totalCount: z.number().int(),
	});

	it("validates a tags response", () => {
		expect(() => ListTagsResponse.parse({ tags: ["prod", "db"], totalCount: 2 })).not.toThrow();
	});
});

// --- Pagination contracts ---

describe("contract: pagination parameters", () => {
	it("accepts custom pagination", () => {
		const result = ListSecretsInput.parse({ page: 3, pageSize: 25 });
		expect(result.page).toBe(3);
		expect(result.pageSize).toBe(25);
	});

	it("rejects a page size over 100", () => {
		expect(() => ListSecretsInput.parse({ pageSize: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListSecretsInput.parse({ page: 0 })).toThrow();
	});
});

// --- Auth / region contract ---

describe("contract: region targeting", () => {
	it("treats region as optional across operations (falls back to config default)", () => {
		expect(() => GetSecretInput.parse({ secretId: VALID_UUID })).not.toThrow();
		expect(() => ListTagsInput.parse({})).not.toThrow();
	});

	it("validates region format when supplied (xx-xxx)", () => {
		expect(() => GetSecretInput.parse({ region: "nl-ams", secretId: VALID_UUID })).not.toThrow();
		expect(() => GetSecretInput.parse({ region: "pl-waw", secretId: VALID_UUID })).not.toThrow();
		expect(() => GetSecretInput.parse({ region: "not-a-region", secretId: VALID_UUID })).toThrow();
	});
});
