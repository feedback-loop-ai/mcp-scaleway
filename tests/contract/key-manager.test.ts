/**
 * Contract tests for Scaleway Key Manager API (v1alpha1)
 *
 * Validates request/response shapes, pagination, auth requirements, and error codes
 * against the Scaleway Key Manager API specification.
 *
 * API Reference: https://www.scaleway.com/en/developers/api/key-manager/
 * SDK: @scaleway/sdk-key-manager v1alpha1
 * Spec: specs/scaleway-api/ (Key Manager section)
 */

import type { Client } from "@scaleway/sdk-client";
import { describe, expect, it, vi } from "vitest";
import { handleListKeys } from "../../src/tools/key-manager/handlers.js";
import {
	CreateKeyInput,
	DataKeyAlgorithmSymmetricEncryption,
	DecryptInput,
	DeleteKeyInput,
	DisableKeyInput,
	EnableKeyInput,
	EncryptInput,
	GenerateDataKeyInput,
	GetKeyInput,
	KeyAlgorithmAsymmetricEncryption,
	KeyAlgorithmAsymmetricSigning,
	KeyAlgorithmSymmetricEncryption,
	KeyOrigin,
	KeyState,
	KeyUsageSchema,
	ListKeysInput,
	ListKeysOrderBy,
	ListKeysUsage,
	ProtectKeyInput,
	RotateKeyInput,
	RotationPolicySchema,
	UnprotectKeyInput,
	UpdateKeyInput,
} from "../../src/tools/key-manager/types.js";

const VALID_UUID = "00000000-0000-0000-0000-000000000001";

// ── Enum contract tests ──────────────────────────────────────────────────

describe("contract: Key Manager enums", () => {
	// Endpoint: N/A (shared enums across all Key Manager endpoints)
	// Spec: specs/scaleway-api/ Key Manager types

	it("KeyAlgorithmSymmetricEncryption matches API spec", () => {
		const values = KeyAlgorithmSymmetricEncryption.options;
		expect(values).toContain("unknown_symmetric_encryption");
		expect(values).toContain("aes_256_gcm");
		expect(values).toHaveLength(2);
	});

	it("KeyAlgorithmAsymmetricEncryption matches API spec", () => {
		const values = KeyAlgorithmAsymmetricEncryption.options;
		expect(values).toContain("unknown_asymmetric_encryption");
		expect(values).toContain("rsa_oaep_2048_sha256");
		expect(values).toContain("rsa_oaep_3072_sha256");
		expect(values).toContain("rsa_oaep_4096_sha256");
		expect(values).toHaveLength(4);
	});

	it("KeyAlgorithmAsymmetricSigning matches API spec", () => {
		const values = KeyAlgorithmAsymmetricSigning.options;
		expect(values).toContain("unknown_asymmetric_signing");
		expect(values).toContain("ec_p256_sha256");
		expect(values).toContain("ec_p384_sha384");
		expect(values).toContain("rsa_pss_2048_sha256");
		expect(values).toContain("rsa_pss_3072_sha256");
		expect(values).toContain("rsa_pss_4096_sha256");
		expect(values).toContain("rsa_pkcs1_2048_sha256");
		expect(values).toContain("rsa_pkcs1_3072_sha256");
		expect(values).toContain("rsa_pkcs1_4096_sha256");
		expect(values).toHaveLength(9);
	});

	it("DataKeyAlgorithmSymmetricEncryption matches API spec", () => {
		const values = DataKeyAlgorithmSymmetricEncryption.options;
		expect(values).toContain("unknown_symmetric_encryption");
		expect(values).toContain("aes_256_gcm");
		expect(values).toHaveLength(2);
	});

	it("KeyState matches API spec", () => {
		const values = KeyState.options;
		expect(values).toContain("unknown_state");
		expect(values).toContain("enabled");
		expect(values).toContain("disabled");
		expect(values).toContain("pending_key_material");
		expect(values).toContain("scheduled_for_deletion");
		expect(values).toHaveLength(5);
	});

	it("KeyOrigin matches API spec", () => {
		const values = KeyOrigin.options;
		expect(values).toContain("unknown_origin");
		expect(values).toContain("scaleway_kms");
		expect(values).toContain("external");
		expect(values).toHaveLength(3);
	});

	it("ListKeysOrderBy matches API spec", () => {
		const values = ListKeysOrderBy.options;
		expect(values).toContain("name_asc");
		expect(values).toContain("name_desc");
		expect(values).toContain("created_at_asc");
		expect(values).toContain("created_at_desc");
		expect(values).toContain("updated_at_asc");
		expect(values).toContain("updated_at_desc");
		expect(values).toHaveLength(6);
	});

	it("ListKeysUsage matches API spec", () => {
		const values = ListKeysUsage.options;
		expect(values).toContain("unknown_usage");
		expect(values).toContain("symmetric_encryption");
		expect(values).toContain("asymmetric_encryption");
		expect(values).toContain("asymmetric_signing");
		expect(values).toHaveLength(4);
	});
});

// ── Nested object contract tests ─────────────────────────────────────────

describe("contract: KeyUsage shape", () => {
	// Validates one-of pattern: exactly one of symmetricEncryption, asymmetricEncryption, asymmetricSigning

	it("accepts symmetric encryption usage", () => {
		const result = KeyUsageSchema.parse({ symmetricEncryption: "aes_256_gcm" });
		expect(result.symmetricEncryption).toBe("aes_256_gcm");
	});

	it("accepts asymmetric encryption usage", () => {
		const result = KeyUsageSchema.parse({ asymmetricEncryption: "rsa_oaep_2048_sha256" });
		expect(result.asymmetricEncryption).toBe("rsa_oaep_2048_sha256");
	});

	it("accepts asymmetric signing usage", () => {
		const result = KeyUsageSchema.parse({ asymmetricSigning: "ec_p256_sha256" });
		expect(result.asymmetricSigning).toBe("ec_p256_sha256");
	});

	it("rejects invalid algorithm values", () => {
		expect(() => KeyUsageSchema.parse({ symmetricEncryption: "invalid" })).toThrow();
	});
});

describe("contract: RotationPolicy shape", () => {
	it("accepts rotation period", () => {
		const result = RotationPolicySchema.parse({ rotationPeriod: "720h" });
		expect(result.rotationPeriod).toBe("720h");
	});

	it("accepts full rotation policy", () => {
		const result = RotationPolicySchema.parse({
			rotationPeriod: "720h",
			nextRotationAt: "2025-06-01T00:00:00Z",
		});
		expect(result.rotationPeriod).toBe("720h");
		expect(result.nextRotationAt).toBe("2025-06-01T00:00:00Z");
	});

	it("accepts empty rotation policy", () => {
		const result = RotationPolicySchema.parse({});
		expect(result.rotationPeriod).toBeUndefined();
	});
});

// ── ListKeys contract ────────────────────────────────────────────────────

describe("contract: POST /key-manager/v1alpha1/regions/{region}/keys (ListKeys)", () => {
	// Endpoint: GET /key-manager/v1alpha1/regions/{region}/keys
	// Spec: ListKeysRequest -> ListKeysResponse

	it("request shape: accepts all documented parameters", () => {
		const input = ListKeysInput.parse({
			region: "fr-par",
			organizationId: VALID_UUID,
			projectId: VALID_UUID,
			orderBy: "name_asc",
			tags: ["prod"],
			name: "my-key",
			usage: "symmetric_encryption",
			scheduledForDeletion: false,
			page: 1,
			pageSize: 50,
		});
		expect(input.region).toBe("fr-par");
		expect(input.orderBy).toBe("name_asc");
		expect(input.usage).toBe("symmetric_encryption");
	});

	it("request shape: pagination defaults", () => {
		const input = ListKeysInput.parse({});
		expect(input.page).toBe(1);
		expect(input.pageSize).toBe(50);
		expect(input.scheduledForDeletion).toBe(false);
	});

	it("request shape: rejects invalid region", () => {
		expect(() => ListKeysInput.parse({ region: "invalid-region-123" })).toThrow();
	});

	it("request shape: rejects invalid orderBy", () => {
		expect(() => ListKeysInput.parse({ orderBy: "invalid_order" })).toThrow();
	});

	it("request shape: rejects invalid usage", () => {
		expect(() => ListKeysInput.parse({ usage: "invalid_usage" })).toThrow();
	});

	it("pagination: pageSize max is 100", () => {
		expect(() => ListKeysInput.parse({ pageSize: 101 })).toThrow();
	});

	it("pagination: pageSize min is 1", () => {
		expect(() => ListKeysInput.parse({ pageSize: 0 })).toThrow();
	});

	it("pagination: page must be positive", () => {
		expect(() => ListKeysInput.parse({ page: 0 })).toThrow();
	});
});

// ── GetKey contract ──────────────────────────────────────────────────────

describe("contract: GET /key-manager/v1alpha1/regions/{region}/keys/{key_id} (GetKey)", () => {
	// Endpoint: GET /key-manager/v1alpha1/regions/{region}/keys/{key_id}
	// Spec: GetKeyRequest -> Key

	it("request shape: requires keyId as UUID", () => {
		const input = GetKeyInput.parse({ keyId: VALID_UUID });
		expect(input.keyId).toBe(VALID_UUID);
	});

	it("request shape: accepts optional region", () => {
		const input = GetKeyInput.parse({ keyId: VALID_UUID, region: "nl-ams" });
		expect(input.region).toBe("nl-ams");
	});

	it("request shape: rejects non-UUID keyId", () => {
		expect(() => GetKeyInput.parse({ keyId: "not-a-uuid" })).toThrow();
	});

	it("request shape: rejects missing keyId", () => {
		expect(() => GetKeyInput.parse({})).toThrow();
	});
});

// ── CreateKey contract ───────────────────────────────────────────────────

describe("contract: POST /key-manager/v1alpha1/regions/{region}/keys (CreateKey)", () => {
	// Endpoint: POST /key-manager/v1alpha1/regions/{region}/keys
	// Spec: CreateKeyRequest -> Key

	it("request shape: accepts all documented parameters", () => {
		const input = CreateKeyInput.parse({
			region: "fr-par",
			projectId: VALID_UUID,
			name: "my-key",
			usage: { symmetricEncryption: "aes_256_gcm" },
			description: "A test key",
			tags: ["test"],
			rotationPolicy: { rotationPeriod: "720h" },
			unprotected: false,
			origin: "scaleway_kms",
		});
		expect(input.name).toBe("my-key");
		expect(input.usage?.symmetricEncryption).toBe("aes_256_gcm");
		expect(input.origin).toBe("scaleway_kms");
	});

	it("request shape: all fields are optional except unprotected defaults false", () => {
		const input = CreateKeyInput.parse({});
		expect(input.unprotected).toBe(false);
		expect(input.name).toBeUndefined();
		expect(input.projectId).toBeUndefined();
	});

	it("request shape: rejects invalid origin", () => {
		expect(() => CreateKeyInput.parse({ origin: "aws_kms" })).toThrow();
	});

	it("request shape: rejects invalid usage algorithm", () => {
		expect(() => CreateKeyInput.parse({ usage: { symmetricEncryption: "des_cbc" } })).toThrow();
	});
});

// ── UpdateKey contract ───────────────────────────────────────────────────

describe("contract: PATCH /key-manager/v1alpha1/regions/{region}/keys/{key_id} (UpdateKey)", () => {
	// Endpoint: PATCH /key-manager/v1alpha1/regions/{region}/keys/{key_id}
	// Spec: UpdateKeyRequest -> Key

	it("request shape: requires keyId", () => {
		const input = UpdateKeyInput.parse({ keyId: VALID_UUID });
		expect(input.keyId).toBe(VALID_UUID);
	});

	it("request shape: accepts all updatable fields", () => {
		const input = UpdateKeyInput.parse({
			keyId: VALID_UUID,
			name: "updated-name",
			description: "updated desc",
			tags: ["v2"],
			rotationPolicy: { rotationPeriod: "720h", nextRotationAt: "2025-12-01T00:00:00Z" },
		});
		expect(input.name).toBe("updated-name");
		expect(input.rotationPolicy?.rotationPeriod).toBe("720h");
	});

	it("request shape: rejects missing keyId", () => {
		expect(() => UpdateKeyInput.parse({ name: "test" })).toThrow();
	});
});

// ── DeleteKey contract ───────────────────────────────────────────────────

describe("contract: DELETE /key-manager/v1alpha1/regions/{region}/keys/{key_id} (DeleteKey)", () => {
	// Endpoint: DELETE /key-manager/v1alpha1/regions/{region}/keys/{key_id}
	// Spec: DeleteKeyRequest -> void

	it("request shape: requires keyId", () => {
		const input = DeleteKeyInput.parse({ keyId: VALID_UUID });
		expect(input.keyId).toBe(VALID_UUID);
	});

	it("request shape: accepts optional region", () => {
		const input = DeleteKeyInput.parse({ keyId: VALID_UUID, region: "fr-par" });
		expect(input.region).toBe("fr-par");
	});

	it("request shape: rejects missing keyId", () => {
		expect(() => DeleteKeyInput.parse({})).toThrow();
	});
});

// ── RotateKey contract ───────────────────────────────────────────────────

describe("contract: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/rotate (RotateKey)", () => {
	// Endpoint: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/rotate
	// Spec: RotateKeyRequest -> Key

	it("request shape: requires keyId", () => {
		const input = RotateKeyInput.parse({ keyId: VALID_UUID });
		expect(input.keyId).toBe(VALID_UUID);
	});

	it("request shape: rejects missing keyId", () => {
		expect(() => RotateKeyInput.parse({})).toThrow();
	});
});

// ── ProtectKey contract ──────────────────────────────────────────────────

describe("contract: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/protect (ProtectKey)", () => {
	// Endpoint: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/protect
	// Spec: ProtectKeyRequest -> Key

	it("request shape: requires keyId", () => {
		const input = ProtectKeyInput.parse({ keyId: VALID_UUID });
		expect(input.keyId).toBe(VALID_UUID);
	});

	it("request shape: rejects missing keyId", () => {
		expect(() => ProtectKeyInput.parse({})).toThrow();
	});
});

// ── UnprotectKey contract ────────────────────────────────────────────────

describe("contract: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/unprotect (UnprotectKey)", () => {
	// Endpoint: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/unprotect
	// Spec: UnprotectKeyRequest -> Key

	it("request shape: requires keyId", () => {
		const input = UnprotectKeyInput.parse({ keyId: VALID_UUID });
		expect(input.keyId).toBe(VALID_UUID);
	});

	it("request shape: rejects missing keyId", () => {
		expect(() => UnprotectKeyInput.parse({})).toThrow();
	});
});

// ── EnableKey contract ───────────────────────────────────────────────────

describe("contract: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/enable (EnableKey)", () => {
	// Endpoint: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/enable
	// Spec: EnableKeyRequest -> Key

	it("request shape: requires keyId", () => {
		const input = EnableKeyInput.parse({ keyId: VALID_UUID });
		expect(input.keyId).toBe(VALID_UUID);
	});

	it("request shape: rejects missing keyId", () => {
		expect(() => EnableKeyInput.parse({})).toThrow();
	});
});

// ── DisableKey contract ──────────────────────────────────────────────────

describe("contract: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/disable (DisableKey)", () => {
	// Endpoint: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/disable
	// Spec: DisableKeyRequest -> Key

	it("request shape: requires keyId", () => {
		const input = DisableKeyInput.parse({ keyId: VALID_UUID });
		expect(input.keyId).toBe(VALID_UUID);
	});

	it("request shape: rejects missing keyId", () => {
		expect(() => DisableKeyInput.parse({})).toThrow();
	});
});

// ── Encrypt contract ─────────────────────────────────────────────────────

describe("contract: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/encrypt (Encrypt)", () => {
	// Endpoint: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/encrypt
	// Spec: EncryptRequest -> EncryptResponse

	it("request shape: requires keyId and plaintext", () => {
		const input = EncryptInput.parse({ keyId: VALID_UUID, plaintext: "aGVsbG8=" });
		expect(input.keyId).toBe(VALID_UUID);
		expect(input.plaintext).toBe("aGVsbG8=");
	});

	it("request shape: accepts optional associatedData", () => {
		const input = EncryptInput.parse({
			keyId: VALID_UUID,
			plaintext: "aGVsbG8=",
			associatedData: "context",
		});
		expect(input.associatedData).toBe("context");
	});

	it("request shape: rejects empty plaintext", () => {
		expect(() => EncryptInput.parse({ keyId: VALID_UUID, plaintext: "" })).toThrow();
	});

	it("request shape: rejects missing keyId", () => {
		expect(() => EncryptInput.parse({ plaintext: "aGVsbG8=" })).toThrow();
	});
});

// ── Decrypt contract ─────────────────────────────────────────────────────

describe("contract: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/decrypt (Decrypt)", () => {
	// Endpoint: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/decrypt
	// Spec: DecryptRequest -> DecryptResponse

	it("request shape: requires keyId and ciphertext", () => {
		const input = DecryptInput.parse({ keyId: VALID_UUID, ciphertext: "encrypted==" });
		expect(input.keyId).toBe(VALID_UUID);
		expect(input.ciphertext).toBe("encrypted==");
	});

	it("request shape: accepts optional associatedData", () => {
		const input = DecryptInput.parse({
			keyId: VALID_UUID,
			ciphertext: "encrypted==",
			associatedData: "context",
		});
		expect(input.associatedData).toBe("context");
	});

	it("request shape: rejects empty ciphertext", () => {
		expect(() => DecryptInput.parse({ keyId: VALID_UUID, ciphertext: "" })).toThrow();
	});

	it("request shape: rejects missing keyId", () => {
		expect(() => DecryptInput.parse({ ciphertext: "encrypted==" })).toThrow();
	});
});

// ── GenerateDataKey contract ─────────────────────────────────────────────

describe("contract: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/generate-data-key (GenerateDataKey)", () => {
	// Endpoint: POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/generate-data-key
	// Spec: GenerateDataKeyRequest -> DataKey

	it("request shape: requires keyId", () => {
		const input = GenerateDataKeyInput.parse({ keyId: VALID_UUID });
		expect(input.keyId).toBe(VALID_UUID);
		expect(input.withoutPlaintext).toBe(false);
	});

	it("request shape: accepts algorithm and withoutPlaintext", () => {
		const input = GenerateDataKeyInput.parse({
			keyId: VALID_UUID,
			algorithm: "aes_256_gcm",
			withoutPlaintext: true,
		});
		expect(input.algorithm).toBe("aes_256_gcm");
		expect(input.withoutPlaintext).toBe(true);
	});

	it("request shape: rejects invalid algorithm", () => {
		expect(() => GenerateDataKeyInput.parse({ keyId: VALID_UUID, algorithm: "invalid" })).toThrow();
	});

	it("request shape: rejects missing keyId", () => {
		expect(() => GenerateDataKeyInput.parse({})).toThrow();
	});
});

// ── Wire contract: pagination reaches the Scaleway API ───────────────────
// specs/scaleway-api/key-manager/api-reference.md — "List Keys" query params
// `page` (int) and `page_size` (int). The handler must hand the SDK camelCase
// `pageSize` so that @scaleway/sdk-key-manager marshals it to `page_size`.

describe("contract: GET /keys pagination is marshalled to the wire", () => {
	const mockFetch = vi.fn();
	const fakeClient = {
		fetch: mockFetch,
		settings: {
			defaultRegion: "fr-par",
			defaultZone: "fr-par-1",
			defaultProjectId: VALID_UUID,
		},
	} as unknown as Client;

	it("sends page and page_size query parameters through the real SDK marshaller", async () => {
		mockFetch.mockResolvedValueOnce({ keys: [], totalCount: 0 });

		await handleListKeys(fakeClient, { page: 3, pageSize: 7, scheduledForDeletion: false });

		expect(mockFetch).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "GET",
				path: "/key-manager/v1alpha1/regions/fr-par/keys",
			}),
			expect.any(Function),
		);
		const request = mockFetch.mock.lastCall?.[0] as { urlParams: URLSearchParams };
		expect(request.urlParams).toBeInstanceOf(URLSearchParams);
		expect(request.urlParams.get("page")).toBe("3");
		expect(request.urlParams.get("page_size")).toBe("7");
		expect(request.urlParams.get("scheduled_for_deletion")).toBe("false");
	});

	it("honours the caller's region and forwards it into the path", async () => {
		mockFetch.mockResolvedValueOnce({ keys: [], totalCount: 0 });

		await handleListKeys(fakeClient, {
			region: "nl-ams",
			page: 1,
			pageSize: 100,
			scheduledForDeletion: true,
		});

		const request = mockFetch.mock.lastCall?.[0] as { path: string; urlParams: URLSearchParams };
		expect(request.path).toBe("/key-manager/v1alpha1/regions/nl-ams/keys");
		expect(request.urlParams.get("page_size")).toBe("100");
		expect(request.urlParams.get("scheduled_for_deletion")).toBe("true");
	});
});
