import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { registerKeyManagerTools } from "../../../src/tools/key-manager/index.js";

// Mock modules before any imports that use them
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ mockClient: true }),
}));

// Create mock API methods
const mockListKeys = vi.fn();
const mockGetKey = vi.fn();
const mockCreateKey = vi.fn();
const mockUpdateKey = vi.fn();
const mockDeleteKey = vi.fn();
const mockRotateKey = vi.fn();
const mockProtectKey = vi.fn();
const mockUnprotectKey = vi.fn();
const mockEnableKey = vi.fn();
const mockDisableKey = vi.fn();
const mockEncrypt = vi.fn();
const mockDecrypt = vi.fn();
const mockGenerateDataKey = vi.fn();

vi.mock("@scaleway/sdk-key-manager", () => ({
	KeyManagerv1alpha1: {
		API: vi.fn().mockImplementation(() => ({
			listKeys: mockListKeys,
			getKey: mockGetKey,
			createKey: mockCreateKey,
			updateKey: mockUpdateKey,
			deleteKey: mockDeleteKey,
			rotateKey: mockRotateKey,
			protectKey: mockProtectKey,
			unprotectKey: mockUnprotectKey,
			enableKey: mockEnableKey,
			disableKey: mockDisableKey,
			encrypt: mockEncrypt,
			decrypt: mockDecrypt,
			generateDataKey: mockGenerateDataKey,
		})),
	},
}));

import {
	handleCreateKey,
	handleDecrypt,
	handleDeleteKey,
	handleDisableKey,
	handleEnableKey,
	handleEncrypt,
	handleGenerateDataKey,
	handleGetKey,
	handleListKeys,
	handleProtectKey,
	handleRotateKey,
	handleUnprotectKey,
	handleUpdateKey,
} from "../../../src/tools/key-manager/handlers.js";

const fakeClient = { mockClient: true } as never;
const TEST_KEY_ID = "00000000-0000-0000-0000-000000000099";

const sampleKey = {
	id: TEST_KEY_ID,
	projectId: "00000000-0000-0000-0000-000000000001",
	name: "my-key",
	usage: { symmetricEncryption: "aes_256_gcm" },
	state: "enabled",
	rotationCount: 1,
	createdAt: "2025-01-01T00:00:00Z",
	updatedAt: "2025-01-01T00:00:00Z",
	protected: true,
	locked: false,
	description: "Test key",
	tags: ["test"],
	origin: "scaleway_kms",
	region: "fr-par",
};

function parseContent(result: { content: { text: string }[] }) {
	return JSON.parse(result.content[0].text);
}

describe("key-manager module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerKeyManagerTools(server)).not.toThrow();
	});
});

describe("key-manager handlers", () => {
	// ── listKeys ──────────────────────────────────────────────────────

	describe("handleListKeys", () => {
		it("returns paginated keys on success", async () => {
			mockListKeys.mockResolvedValueOnce({
				keys: [sampleKey],
				totalCount: 1,
			});
			const result = await handleListKeys(fakeClient, {
				page: 1,
				pageSize: 50,
				scheduledForDeletion: false,
			});
			const data = parseContent(result);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
			expect(data.page).toBe(1);
			expect(data.pageSize).toBe(50);
			expect(mockListKeys).toHaveBeenCalledWith(
				expect.objectContaining({ page: 1, page_size: 50, scheduledForDeletion: false }),
			);
		});

		it("passes optional filters", async () => {
			mockListKeys.mockResolvedValueOnce({ keys: [], totalCount: 0 });
			await handleListKeys(fakeClient, {
				region: "nl-ams",
				organizationId: "00000000-0000-0000-0000-000000000002",
				projectId: "00000000-0000-0000-0000-000000000001",
				orderBy: "name_asc",
				tags: ["production"],
				name: "my-key",
				usage: "symmetric_encryption",
				scheduledForDeletion: true,
				page: 2,
				pageSize: 10,
			});
			expect(mockListKeys).toHaveBeenCalledWith(
				expect.objectContaining({
					region: "nl-ams",
					organizationId: "00000000-0000-0000-0000-000000000002",
					projectId: "00000000-0000-0000-0000-000000000001",
					orderBy: "name_asc",
					tags: ["production"],
					name: "my-key",
					usage: "symmetric_encryption",
					scheduledForDeletion: true,
					page: 2,
					page_size: 10,
				}),
			);
		});

		it("returns error on failure", async () => {
			mockListKeys.mockRejectedValueOnce(new Error("network error"));
			const result = await handleListKeys(fakeClient, {
				page: 1,
				pageSize: 50,
				scheduledForDeletion: false,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("server_error");
		});
	});

	// ── getKey ────────────────────────────────────────────────────────

	describe("handleGetKey", () => {
		it("returns key on success", async () => {
			mockGetKey.mockResolvedValueOnce(sampleKey);
			const result = await handleGetKey(fakeClient, { keyId: TEST_KEY_ID });
			const data = parseContent(result);
			expect(data.id).toBe(TEST_KEY_ID);
			expect(mockGetKey).toHaveBeenCalledWith({ keyId: TEST_KEY_ID, region: undefined });
		});

		it("passes region", async () => {
			mockGetKey.mockResolvedValueOnce(sampleKey);
			await handleGetKey(fakeClient, { keyId: TEST_KEY_ID, region: "nl-ams" });
			expect(mockGetKey).toHaveBeenCalledWith({ keyId: TEST_KEY_ID, region: "nl-ams" });
		});

		it("returns error on 404", async () => {
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockGetKey.mockRejectedValueOnce(err);
			const result = await handleGetKey(fakeClient, { keyId: TEST_KEY_ID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("not_found");
		});
	});

	// ── createKey ─────────────────────────────────────────────────────

	describe("handleCreateKey", () => {
		it("creates key with minimal params", async () => {
			mockCreateKey.mockResolvedValueOnce(sampleKey);
			const result = await handleCreateKey(fakeClient, { unprotected: false });
			const data = parseContent(result);
			expect(data.id).toBe(TEST_KEY_ID);
			expect(mockCreateKey).toHaveBeenCalledWith(expect.objectContaining({ unprotected: false }));
		});

		it("creates key with all params including rotation policy", async () => {
			mockCreateKey.mockResolvedValueOnce(sampleKey);
			await handleCreateKey(fakeClient, {
				region: "fr-par",
				projectId: "00000000-0000-0000-0000-000000000001",
				name: "my-key",
				usage: { symmetricEncryption: "aes_256_gcm" },
				description: "Test key",
				tags: ["test"],
				rotationPolicy: {
					rotationPeriod: "720h",
					nextRotationAt: "2025-06-01T00:00:00Z",
				},
				unprotected: false,
				origin: "scaleway_kms",
			});
			expect(mockCreateKey).toHaveBeenCalledWith(
				expect.objectContaining({
					region: "fr-par",
					projectId: "00000000-0000-0000-0000-000000000001",
					name: "my-key",
					usage: { symmetricEncryption: "aes_256_gcm" },
					description: "Test key",
					tags: ["test"],
					rotationPolicy: {
						rotationPeriod: "720h",
						nextRotationAt: new Date("2025-06-01T00:00:00Z"),
					},
					unprotected: false,
					origin: "scaleway_kms",
				}),
			);
		});

		it("creates key with rotation policy without nextRotationAt", async () => {
			mockCreateKey.mockResolvedValueOnce(sampleKey);
			await handleCreateKey(fakeClient, {
				rotationPolicy: { rotationPeriod: "720h" },
				unprotected: true,
			});
			expect(mockCreateKey).toHaveBeenCalledWith(
				expect.objectContaining({
					rotationPolicy: { rotationPeriod: "720h", nextRotationAt: undefined },
				}),
			);
		});

		it("returns error on failure", async () => {
			mockCreateKey.mockRejectedValueOnce(new Error("bad request"));
			const result = await handleCreateKey(fakeClient, { unprotected: false });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── updateKey ─────────────────────────────────────────────────────

	describe("handleUpdateKey", () => {
		it("updates key metadata", async () => {
			mockUpdateKey.mockResolvedValueOnce({ ...sampleKey, name: "updated" });
			const result = await handleUpdateKey(fakeClient, {
				keyId: TEST_KEY_ID,
				name: "updated",
				description: "new desc",
				tags: ["updated"],
			});
			const data = parseContent(result);
			expect(data.name).toBe("updated");
		});

		it("updates key with rotation policy including nextRotationAt", async () => {
			mockUpdateKey.mockResolvedValueOnce(sampleKey);
			await handleUpdateKey(fakeClient, {
				keyId: TEST_KEY_ID,
				rotationPolicy: {
					rotationPeriod: "720h",
					nextRotationAt: "2025-06-01T00:00:00Z",
				},
			});
			expect(mockUpdateKey).toHaveBeenCalledWith(
				expect.objectContaining({
					rotationPolicy: {
						rotationPeriod: "720h",
						nextRotationAt: new Date("2025-06-01T00:00:00Z"),
					},
				}),
			);
		});

		it("updates key with rotation policy without nextRotationAt", async () => {
			mockUpdateKey.mockResolvedValueOnce(sampleKey);
			await handleUpdateKey(fakeClient, {
				keyId: TEST_KEY_ID,
				rotationPolicy: { rotationPeriod: "720h" },
			});
			expect(mockUpdateKey).toHaveBeenCalledWith(
				expect.objectContaining({
					rotationPolicy: { rotationPeriod: "720h", nextRotationAt: undefined },
				}),
			);
		});

		it("updates key without rotation policy", async () => {
			mockUpdateKey.mockResolvedValueOnce(sampleKey);
			await handleUpdateKey(fakeClient, { keyId: TEST_KEY_ID, name: "new" });
			expect(mockUpdateKey).toHaveBeenCalledWith(
				expect.objectContaining({ rotationPolicy: undefined }),
			);
		});

		it("returns error on failure", async () => {
			mockUpdateKey.mockRejectedValueOnce(new Error("fail"));
			const result = await handleUpdateKey(fakeClient, { keyId: TEST_KEY_ID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── deleteKey ─────────────────────────────────────────────────────

	describe("handleDeleteKey", () => {
		it("deletes key successfully", async () => {
			mockDeleteKey.mockResolvedValueOnce(undefined);
			const result = await handleDeleteKey(fakeClient, { keyId: TEST_KEY_ID });
			const data = parseContent(result);
			expect(data.message).toContain("successfully deleted");
			expect(data.keyId).toBe(TEST_KEY_ID);
		});

		it("passes region", async () => {
			mockDeleteKey.mockResolvedValueOnce(undefined);
			await handleDeleteKey(fakeClient, { keyId: TEST_KEY_ID, region: "nl-ams" });
			expect(mockDeleteKey).toHaveBeenCalledWith({ keyId: TEST_KEY_ID, region: "nl-ams" });
		});

		it("returns error on failure", async () => {
			mockDeleteKey.mockRejectedValueOnce(new Error("fail"));
			const result = await handleDeleteKey(fakeClient, { keyId: TEST_KEY_ID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── rotateKey ─────────────────────────────────────────────────────

	describe("handleRotateKey", () => {
		it("rotates key successfully", async () => {
			mockRotateKey.mockResolvedValueOnce({ ...sampleKey, rotationCount: 2 });
			const result = await handleRotateKey(fakeClient, { keyId: TEST_KEY_ID });
			const data = parseContent(result);
			expect(data.rotationCount).toBe(2);
		});

		it("returns error on failure", async () => {
			mockRotateKey.mockRejectedValueOnce(new Error("fail"));
			const result = await handleRotateKey(fakeClient, { keyId: TEST_KEY_ID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── protectKey ────────────────────────────────────────────────────

	describe("handleProtectKey", () => {
		it("protects key successfully", async () => {
			mockProtectKey.mockResolvedValueOnce({ ...sampleKey, protected: true });
			const result = await handleProtectKey(fakeClient, { keyId: TEST_KEY_ID });
			const data = parseContent(result);
			expect(data.protected).toBe(true);
		});

		it("returns error on failure", async () => {
			mockProtectKey.mockRejectedValueOnce(new Error("fail"));
			const result = await handleProtectKey(fakeClient, { keyId: TEST_KEY_ID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── unprotectKey ──────────────────────────────────────────────────

	describe("handleUnprotectKey", () => {
		it("unprotects key successfully", async () => {
			mockUnprotectKey.mockResolvedValueOnce({ ...sampleKey, protected: false });
			const result = await handleUnprotectKey(fakeClient, { keyId: TEST_KEY_ID });
			const data = parseContent(result);
			expect(data.protected).toBe(false);
		});

		it("returns error on failure", async () => {
			mockUnprotectKey.mockRejectedValueOnce(new Error("fail"));
			const result = await handleUnprotectKey(fakeClient, { keyId: TEST_KEY_ID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── enableKey ─────────────────────────────────────────────────────

	describe("handleEnableKey", () => {
		it("enables key successfully", async () => {
			mockEnableKey.mockResolvedValueOnce({ ...sampleKey, state: "enabled" });
			const result = await handleEnableKey(fakeClient, { keyId: TEST_KEY_ID });
			const data = parseContent(result);
			expect(data.state).toBe("enabled");
		});

		it("returns error on failure", async () => {
			mockEnableKey.mockRejectedValueOnce(new Error("fail"));
			const result = await handleEnableKey(fakeClient, { keyId: TEST_KEY_ID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── disableKey ────────────────────────────────────────────────────

	describe("handleDisableKey", () => {
		it("disables key successfully", async () => {
			mockDisableKey.mockResolvedValueOnce({ ...sampleKey, state: "disabled" });
			const result = await handleDisableKey(fakeClient, { keyId: TEST_KEY_ID });
			const data = parseContent(result);
			expect(data.state).toBe("disabled");
		});

		it("returns error on failure", async () => {
			mockDisableKey.mockRejectedValueOnce(new Error("fail"));
			const result = await handleDisableKey(fakeClient, { keyId: TEST_KEY_ID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── encrypt ───────────────────────────────────────────────────────

	describe("handleEncrypt", () => {
		it("encrypts data successfully", async () => {
			mockEncrypt.mockResolvedValueOnce({ keyId: TEST_KEY_ID, ciphertext: "encrypted" });
			const result = await handleEncrypt(fakeClient, {
				keyId: TEST_KEY_ID,
				plaintext: "aGVsbG8=",
			});
			const data = parseContent(result);
			expect(data.ciphertext).toBe("encrypted");
		});

		it("passes associated data for symmetric keys", async () => {
			mockEncrypt.mockResolvedValueOnce({ keyId: TEST_KEY_ID, ciphertext: "encrypted" });
			await handleEncrypt(fakeClient, {
				keyId: TEST_KEY_ID,
				plaintext: "aGVsbG8=",
				associatedData: "context",
			});
			expect(mockEncrypt).toHaveBeenCalledWith(
				expect.objectContaining({ associatedData: "context" }),
			);
		});

		it("returns error on failure", async () => {
			mockEncrypt.mockRejectedValueOnce(new Error("fail"));
			const result = await handleEncrypt(fakeClient, {
				keyId: TEST_KEY_ID,
				plaintext: "aGVsbG8=",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── decrypt ───────────────────────────────────────────────────────

	describe("handleDecrypt", () => {
		it("decrypts data successfully", async () => {
			mockDecrypt.mockResolvedValueOnce({ keyId: TEST_KEY_ID, plaintext: "decrypted" });
			const result = await handleDecrypt(fakeClient, {
				keyId: TEST_KEY_ID,
				ciphertext: "encrypted",
			});
			const data = parseContent(result);
			expect(data.plaintext).toBe("decrypted");
		});

		it("passes associated data", async () => {
			mockDecrypt.mockResolvedValueOnce({ keyId: TEST_KEY_ID, plaintext: "decrypted" });
			await handleDecrypt(fakeClient, {
				keyId: TEST_KEY_ID,
				ciphertext: "encrypted",
				associatedData: "context",
			});
			expect(mockDecrypt).toHaveBeenCalledWith(
				expect.objectContaining({ associatedData: "context" }),
			);
		});

		it("returns error on failure", async () => {
			mockDecrypt.mockRejectedValueOnce(new Error("fail"));
			const result = await handleDecrypt(fakeClient, {
				keyId: TEST_KEY_ID,
				ciphertext: "encrypted",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── generateDataKey ───────────────────────────────────────────────

	describe("handleGenerateDataKey", () => {
		it("generates data key with plaintext", async () => {
			mockGenerateDataKey.mockResolvedValueOnce({
				keyId: TEST_KEY_ID,
				algorithm: "aes_256_gcm",
				ciphertext: "encrypted-dek",
				plaintext: "plaintext-dek",
			});
			const result = await handleGenerateDataKey(fakeClient, {
				keyId: TEST_KEY_ID,
				withoutPlaintext: false,
			});
			const data = parseContent(result);
			expect(data.plaintext).toBe("plaintext-dek");
			expect(data.ciphertext).toBe("encrypted-dek");
		});

		it("generates data key without plaintext", async () => {
			mockGenerateDataKey.mockResolvedValueOnce({
				keyId: TEST_KEY_ID,
				algorithm: "aes_256_gcm",
				ciphertext: "encrypted-dek",
			});
			const result = await handleGenerateDataKey(fakeClient, {
				keyId: TEST_KEY_ID,
				withoutPlaintext: true,
			});
			const data = parseContent(result);
			expect(data.plaintext).toBeUndefined();
		});

		it("passes algorithm parameter", async () => {
			mockGenerateDataKey.mockResolvedValueOnce({
				keyId: TEST_KEY_ID,
				algorithm: "aes_256_gcm",
				ciphertext: "encrypted-dek",
			});
			await handleGenerateDataKey(fakeClient, {
				keyId: TEST_KEY_ID,
				algorithm: "aes_256_gcm",
				withoutPlaintext: false,
			});
			expect(mockGenerateDataKey).toHaveBeenCalledWith(
				expect.objectContaining({ algorithm: "aes_256_gcm" }),
			);
		});

		it("returns error on failure", async () => {
			mockGenerateDataKey.mockRejectedValueOnce(new Error("fail"));
			const result = await handleGenerateDataKey(fakeClient, {
				keyId: TEST_KEY_ID,
				withoutPlaintext: false,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});
});

import {
	CreateKeyInput,
	DeleteKeyInput,
	GetKeyInput,
	ListKeysInput,
	UpdateKeyInput,
} from "../../../src/tools/key-manager/types.js";

describe("key-manager types validation", () => {
	it("ListKeysInput defaults page and pageSize", () => {
		const result = ListKeysInput.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
		expect(result.scheduledForDeletion).toBe(false);
	});

	it("GetKeyInput requires valid UUID keyId", () => {
		expect(() => GetKeyInput.parse({ keyId: "not-a-uuid" })).toThrow();
		expect(() => GetKeyInput.parse({ keyId: TEST_KEY_ID })).not.toThrow();
	});

	it("CreateKeyInput defaults unprotected to false", () => {
		const result = CreateKeyInput.parse({});
		expect(result.unprotected).toBe(false);
	});

	it("UpdateKeyInput requires valid UUID keyId", () => {
		expect(() => UpdateKeyInput.parse({ keyId: "bad" })).toThrow();
	});

	it("DeleteKeyInput requires keyId", () => {
		expect(() => DeleteKeyInput.parse({})).toThrow();
	});

	it("ListKeysInput rejects invalid region format", () => {
		expect(() => ListKeysInput.parse({ region: "invalid" })).toThrow();
	});

	it("ListKeysInput accepts valid region", () => {
		const result = ListKeysInput.parse({ region: "fr-par" });
		expect(result.region).toBe("fr-par");
	});
});
