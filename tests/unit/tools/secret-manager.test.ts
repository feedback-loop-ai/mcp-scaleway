import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleAccessSecretVersion,
	handleAddSecretOwner,
	handleCreateSecret,
	handleCreateSecretVersion,
	handleDeleteSecret,
	handleDestroySecretVersion,
	handleDisableSecretVersion,
	handleEnableSecretVersion,
	handleGetSecret,
	handleGetSecretVersion,
	handleListSecretVersions,
	handleListSecrets,
	handleListTags,
	handleProtectSecret,
	handleUnprotectSecret,
	handleUpdateSecret,
} from "../../../src/tools/secret-manager/handlers.js";
import { registerSecretManagerTools } from "../../../src/tools/secret-manager/index.js";
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

// ── Mock setup ─────────────────────────────────────────────────────────────

const mockApi = {
	listSecrets: vi.fn(),
	getSecret: vi.fn(),
	createSecret: vi.fn(),
	updateSecret: vi.fn(),
	deleteSecret: vi.fn(),
	listSecretVersions: vi.fn(),
	getSecretVersion: vi.fn(),
	createSecretVersion: vi.fn(),
	accessSecretVersion: vi.fn(),
	disableSecretVersion: vi.fn(),
	enableSecretVersion: vi.fn(),
	deleteSecretVersion: vi.fn(),
	protectSecret: vi.fn(),
	unprotectSecret: vi.fn(),
	listTags: vi.fn(),
	addSecretOwner: vi.fn(),
};

vi.mock("@scaleway/sdk-secret", () => ({
	Secretv1beta1: {
		API: vi.fn().mockImplementation(() => mockApi),
	},
}));

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn().mockReturnValue({
		accessKey: "SCW-ACCESS",
		secretKey: "SCW-SECRET",
		defaultProjectId: "project-id",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn().mockReturnValue({}),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const SECRET_ID = "11111111-1111-1111-1111-111111111111";
const PROJECT_ID = "22222222-2222-2222-2222-222222222222";

function mockSecret(overrides = {}) {
	return {
		id: SECRET_ID,
		projectId: PROJECT_ID,
		name: "my-secret",
		status: "ready",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-02"),
		tags: ["env:prod"],
		versionCount: 2,
		description: "A test secret",
		managed: false,
		protected: false,
		type: "opaque",
		path: "/",
		usedBy: [],
		region: "fr-par",
		...overrides,
	};
}

function mockSecretVersion(overrides = {}) {
	return {
		revision: 1,
		secretId: SECRET_ID,
		status: "enabled",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-01"),
		description: "v1",
		latest: true,
		region: "fr-par",
		...overrides,
	};
}

// biome-ignore lint/suspicious/noExplicitAny: test helper with loose typing
function parseResult(result: any) {
	return JSON.parse(result.content[0].text);
}

// biome-ignore lint/suspicious/noExplicitAny: test helper with loose typing
function expectError(result: any) {
	expect(result.isError).toBe(true);
	return parseResult(result);
}

function createApiError(statusCode: number, message: string) {
	const err = new Error(message);
	(err as Error & { statusCode: number }).statusCode = statusCode;
	return err;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("secret-manager module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerSecretManagerTools(server)).not.toThrow();
	});
});

describe("secret-manager types", () => {
	describe("enums", () => {
		it("SecretType accepts valid values", () => {
			for (const v of [
				"unknown_type",
				"opaque",
				"certificate",
				"key_value",
				"basic_credentials",
				"database_credentials",
				"ssh_key",
			]) {
				expect(SecretType.parse(v)).toBe(v);
			}
		});

		it("SecretType rejects invalid value", () => {
			expect(() => SecretType.parse("invalid")).toThrow();
		});

		it("SecretStatus accepts valid values", () => {
			for (const v of ["unknown_status", "ready", "locked"]) {
				expect(SecretStatus.parse(v)).toBe(v);
			}
		});

		it("SecretStatus rejects invalid value", () => {
			expect(() => SecretStatus.parse("invalid")).toThrow();
		});

		it("SecretVersionStatus accepts valid values", () => {
			for (const v of [
				"unknown_status",
				"enabled",
				"disabled",
				"deleted",
				"scheduled_for_deletion",
			]) {
				expect(SecretVersionStatus.parse(v)).toBe(v);
			}
		});

		it("SecretVersionStatus rejects invalid value", () => {
			expect(() => SecretVersionStatus.parse("invalid")).toThrow();
		});

		it("EphemeralPolicyAction accepts valid values", () => {
			for (const v of ["unknown_action", "delete", "disable"]) {
				expect(EphemeralPolicyAction.parse(v)).toBe(v);
			}
		});

		it("EphemeralPolicyAction rejects invalid value", () => {
			expect(() => EphemeralPolicyAction.parse("invalid")).toThrow();
		});

		it("Product accepts valid values", () => {
			for (const v of ["unknown_product", "edge_services", "s2s_vpn"]) {
				expect(Product.parse(v)).toBe(v);
			}
		});

		it("Product rejects invalid value", () => {
			expect(() => Product.parse("invalid")).toThrow();
		});

		it("ListSecretsOrderBy accepts valid values", () => {
			for (const v of [
				"name_asc",
				"name_desc",
				"created_at_asc",
				"created_at_desc",
				"updated_at_asc",
				"updated_at_desc",
			]) {
				expect(ListSecretsOrderBy.parse(v)).toBe(v);
			}
		});

		it("ListSecretsOrderBy rejects invalid value", () => {
			expect(() => ListSecretsOrderBy.parse("invalid")).toThrow();
		});
	});

	describe("EphemeralPolicyInput", () => {
		it("parses valid ephemeral policy with all fields", () => {
			const result = EphemeralPolicyInput.parse({
				timeToLive: "3600s",
				expiresOnceAccessed: true,
				action: "delete",
			});
			expect(result).toEqual({
				timeToLive: "3600s",
				expiresOnceAccessed: true,
				action: "delete",
			});
		});

		it("parses minimal ephemeral policy (action only)", () => {
			const result = EphemeralPolicyInput.parse({ action: "disable" });
			expect(result.action).toBe("disable");
			expect(result.timeToLive).toBeUndefined();
			expect(result.expiresOnceAccessed).toBeUndefined();
		});

		it("rejects missing action", () => {
			expect(() => EphemeralPolicyInput.parse({})).toThrow();
		});
	});

	describe("ListSecretsInput", () => {
		it("parses with defaults", () => {
			const result = ListSecretsInput.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("parses with all optional fields", () => {
			const result = ListSecretsInput.parse({
				region: "fr-par",
				organizationId: SECRET_ID,
				projectId: PROJECT_ID,
				orderBy: "name_asc",
				tags: ["env:prod"],
				name: "my-secret",
				path: "/app",
				ephemeral: false,
				type: "opaque",
				page: 2,
				pageSize: 25,
			});
			expect(result.region).toBe("fr-par");
			expect(result.name).toBe("my-secret");
			expect(result.page).toBe(2);
		});

		it("rejects invalid region format", () => {
			expect(() => ListSecretsInput.parse({ region: "invalid" })).toThrow();
		});

		it("rejects page < 1", () => {
			expect(() => ListSecretsInput.parse({ page: 0 })).toThrow();
		});

		it("rejects pageSize > 100", () => {
			expect(() => ListSecretsInput.parse({ pageSize: 101 })).toThrow();
		});
	});

	describe("GetSecretInput", () => {
		it("parses valid input", () => {
			const result = GetSecretInput.parse({ secretId: SECRET_ID });
			expect(result.secretId).toBe(SECRET_ID);
		});

		it("rejects non-uuid secretId", () => {
			expect(() => GetSecretInput.parse({ secretId: "bad" })).toThrow();
		});

		it("rejects missing secretId", () => {
			expect(() => GetSecretInput.parse({})).toThrow();
		});
	});

	describe("CreateSecretInput", () => {
		it("parses with required fields", () => {
			const result = CreateSecretInput.parse({ name: "my-secret" });
			expect(result.name).toBe("my-secret");
			expect(result.isProtected).toBe(false);
		});

		it("parses with all fields", () => {
			const result = CreateSecretInput.parse({
				region: "nl-ams",
				projectId: PROJECT_ID,
				name: "my-secret",
				tags: ["env:staging"],
				description: "test",
				type: "key_value",
				path: "/app/config",
				ephemeralPolicy: { action: "delete", timeToLive: "86400s" },
				isProtected: true,
			});
			expect(result.isProtected).toBe(true);
			expect(result.type).toBe("key_value");
		});

		it("rejects empty name", () => {
			expect(() => CreateSecretInput.parse({ name: "" })).toThrow();
		});
	});

	describe("UpdateSecretInput", () => {
		it("parses with secretId only", () => {
			const result = UpdateSecretInput.parse({ secretId: SECRET_ID });
			expect(result.secretId).toBe(SECRET_ID);
		});

		it("parses with all optional fields", () => {
			const result = UpdateSecretInput.parse({
				secretId: SECRET_ID,
				name: "new-name",
				tags: ["updated"],
				description: "updated desc",
				path: "/new/path",
				ephemeralPolicy: { action: "disable" },
			});
			expect(result.name).toBe("new-name");
		});
	});

	describe("DeleteSecretInput", () => {
		it("parses valid input", () => {
			const result = DeleteSecretInput.parse({ secretId: SECRET_ID });
			expect(result.secretId).toBe(SECRET_ID);
		});
	});

	describe("ListSecretVersionsInput", () => {
		it("parses with required fields", () => {
			const result = ListSecretVersionsInput.parse({ secretId: SECRET_ID });
			expect(result.secretId).toBe(SECRET_ID);
			expect(result.page).toBe(1);
		});

		it("parses with status filter", () => {
			const result = ListSecretVersionsInput.parse({
				secretId: SECRET_ID,
				status: ["enabled", "disabled"],
			});
			expect(result.status).toEqual(["enabled", "disabled"]);
		});
	});

	describe("GetSecretVersionInput", () => {
		it("parses valid input", () => {
			const result = GetSecretVersionInput.parse({ secretId: SECRET_ID, revision: "latest" });
			expect(result.revision).toBe("latest");
		});

		it("parses numeric revision", () => {
			const result = GetSecretVersionInput.parse({ secretId: SECRET_ID, revision: "1" });
			expect(result.revision).toBe("1");
		});
	});

	describe("CreateSecretVersionInput", () => {
		it("parses with required fields", () => {
			const result = CreateSecretVersionInput.parse({
				secretId: SECRET_ID,
				data: "aGVsbG8=",
			});
			expect(result.data).toBe("aGVsbG8=");
		});

		it("parses with all fields", () => {
			const result = CreateSecretVersionInput.parse({
				secretId: SECRET_ID,
				data: "aGVsbG8=",
				description: "v2",
				disablePrevious: true,
				dataCrc32: 123456,
			});
			expect(result.disablePrevious).toBe(true);
		});

		it("rejects empty data", () => {
			expect(() => CreateSecretVersionInput.parse({ secretId: SECRET_ID, data: "" })).toThrow();
		});
	});

	describe("AccessSecretVersionInput", () => {
		it("parses valid input", () => {
			const result = AccessSecretVersionInput.parse({
				secretId: SECRET_ID,
				revision: "latest_enabled",
			});
			expect(result.revision).toBe("latest_enabled");
		});
	});

	describe("DisableSecretVersionInput", () => {
		it("parses valid input", () => {
			const result = DisableSecretVersionInput.parse({ secretId: SECRET_ID, revision: "1" });
			expect(result.revision).toBe("1");
		});
	});

	describe("EnableSecretVersionInput", () => {
		it("parses valid input", () => {
			const result = EnableSecretVersionInput.parse({ secretId: SECRET_ID, revision: "1" });
			expect(result.revision).toBe("1");
		});
	});

	describe("DestroySecretVersionInput", () => {
		it("parses valid input", () => {
			const result = DestroySecretVersionInput.parse({ secretId: SECRET_ID, revision: "1" });
			expect(result.revision).toBe("1");
		});
	});

	describe("ProtectSecretInput", () => {
		it("parses valid input", () => {
			const result = ProtectSecretInput.parse({ secretId: SECRET_ID });
			expect(result.secretId).toBe(SECRET_ID);
		});
	});

	describe("UnprotectSecretInput", () => {
		it("parses valid input", () => {
			const result = UnprotectSecretInput.parse({ secretId: SECRET_ID });
			expect(result.secretId).toBe(SECRET_ID);
		});
	});

	describe("ListTagsInput", () => {
		it("parses with defaults", () => {
			const result = ListTagsInput.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("parses with projectId", () => {
			const result = ListTagsInput.parse({ projectId: PROJECT_ID, region: "fr-par" });
			expect(result.projectId).toBe(PROJECT_ID);
		});
	});

	describe("AddSecretOwnerInput", () => {
		it("parses valid input", () => {
			const result = AddSecretOwnerInput.parse({
				secretId: SECRET_ID,
				product: "edge_services",
			});
			expect(result.product).toBe("edge_services");
		});

		it("parses without optional product", () => {
			const result = AddSecretOwnerInput.parse({ secretId: SECRET_ID });
			expect(result.product).toBeUndefined();
		});
	});
});

describe("secret-manager handlers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ── List Secrets ─────────────────────────────────────────────────────

	describe("handleListSecrets", () => {
		it("returns paginated secrets on success", async () => {
			const secrets = [mockSecret()];
			mockApi.listSecrets.mockResolvedValue({ secrets, totalCount: 1 });

			const result = await handleListSecrets({ page: 1, pageSize: 50 });
			const data = parseResult(result);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
			expect(data.page).toBe(1);
			expect(data.pageSize).toBe(50);
			expect(mockApi.listSecrets).toHaveBeenCalledWith(
				expect.objectContaining({ page: 1, pageSize: 50, scheduledForDeletion: false }),
			);
		});

		it("passes optional filters to API", async () => {
			mockApi.listSecrets.mockResolvedValue({ secrets: [], totalCount: 0 });

			await handleListSecrets({
				page: 1,
				pageSize: 10,
				region: "fr-par",
				name: "test",
				tags: ["env:prod"],
				type: "opaque",
				path: "/app",
				ephemeral: true,
			});

			expect(mockApi.listSecrets).toHaveBeenCalledWith(
				expect.objectContaining({
					region: "fr-par",
					name: "test",
					tags: ["env:prod"],
					type: "opaque",
					path: "/app",
					ephemeral: true,
				}),
			);
		});

		it("forwards a non-default page size as camelCase pageSize (SDK contract)", async () => {
			mockApi.listSecrets.mockResolvedValue({ secrets: [], totalCount: 0 });

			await handleListSecrets({ page: 2, pageSize: 9 });

			const request = mockApi.listSecrets.mock.lastCall?.[0] as Record<string, unknown>;
			expect(request.page).toBe(2);
			expect(request.pageSize).toBe(9);
			expect(request).not.toHaveProperty("page_size");
		});

		it("returns error response on API failure", async () => {
			mockApi.listSecrets.mockRejectedValue(createApiError(403, "forbidden"));

			const result = await handleListSecrets({ page: 1, pageSize: 50 });
			const data = expectError(result);
			expect(data.error.type).toBe("permission_denied");
		});
	});

	// ── Get Secret ───────────────────────────────────────────────────────

	describe("handleGetSecret", () => {
		it("returns secret on success", async () => {
			const secret = mockSecret();
			mockApi.getSecret.mockResolvedValue(secret);

			const result = await handleGetSecret({ secretId: SECRET_ID });
			const data = parseResult(result);
			expect(data.id).toBe(SECRET_ID);
			expect(data.name).toBe("my-secret");
		});

		it("passes region to API", async () => {
			mockApi.getSecret.mockResolvedValue(mockSecret());

			await handleGetSecret({ secretId: SECRET_ID, region: "nl-ams" });
			expect(mockApi.getSecret).toHaveBeenCalledWith({ secretId: SECRET_ID, region: "nl-ams" });
		});

		it("returns error on not found", async () => {
			mockApi.getSecret.mockRejectedValue(createApiError(404, "not found"));

			const result = await handleGetSecret({ secretId: SECRET_ID });
			const data = expectError(result);
			expect(data.error.type).toBe("not_found");
		});
	});

	// ── Create Secret ────────────────────────────────────────────────────

	describe("handleCreateSecret", () => {
		it("creates secret and returns it", async () => {
			const secret = mockSecret();
			mockApi.createSecret.mockResolvedValue(secret);

			const result = await handleCreateSecret({ name: "my-secret", isProtected: false });
			const data = parseResult(result);
			expect(data.id).toBe(SECRET_ID);
			expect(mockApi.createSecret).toHaveBeenCalledWith(
				expect.objectContaining({ name: "my-secret", protected: false }),
			);
		});

		it("maps isProtected to protected field", async () => {
			mockApi.createSecret.mockResolvedValue(mockSecret({ protected: true }));

			await handleCreateSecret({ name: "protected-secret", isProtected: true });
			expect(mockApi.createSecret).toHaveBeenCalledWith(
				expect.objectContaining({ protected: true }),
			);
		});

		it("passes all optional fields", async () => {
			mockApi.createSecret.mockResolvedValue(mockSecret());

			await handleCreateSecret({
				name: "full-secret",
				isProtected: false,
				region: "fr-par",
				projectId: PROJECT_ID,
				tags: ["tag1"],
				description: "desc",
				type: "key_value",
				path: "/app",
				ephemeralPolicy: { action: "delete", timeToLive: "3600s" },
			});

			expect(mockApi.createSecret).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "full-secret",
					projectId: PROJECT_ID,
					tags: ["tag1"],
					description: "desc",
					type: "key_value",
					path: "/app",
					ephemeralPolicy: { action: "delete", timeToLive: "3600s" },
				}),
			);
		});

		it("returns error on failure", async () => {
			mockApi.createSecret.mockRejectedValue(createApiError(400, "bad request"));

			const result = await handleCreateSecret({ name: "bad", isProtected: false });
			expectError(result);
		});
	});

	// ── Update Secret ────────────────────────────────────────────────────

	describe("handleUpdateSecret", () => {
		it("updates and returns secret", async () => {
			const updated = mockSecret({ name: "updated-name" });
			mockApi.updateSecret.mockResolvedValue(updated);

			const result = await handleUpdateSecret({ secretId: SECRET_ID, name: "updated-name" });
			const data = parseResult(result);
			expect(data.name).toBe("updated-name");
		});

		it("returns error on failure", async () => {
			mockApi.updateSecret.mockRejectedValue(createApiError(404, "not found"));

			const result = await handleUpdateSecret({ secretId: SECRET_ID });
			expectError(result);
		});
	});

	// ── Delete Secret ────────────────────────────────────────────────────

	describe("handleDeleteSecret", () => {
		it("deletes and returns success", async () => {
			mockApi.deleteSecret.mockResolvedValue(undefined);

			const result = await handleDeleteSecret({ secretId: SECRET_ID });
			const data = parseResult(result);
			expect(data.success).toBe(true);
			expect(data.secretId).toBe(SECRET_ID);
		});

		it("returns error on failure", async () => {
			mockApi.deleteSecret.mockRejectedValue(createApiError(403, "protected"));

			const result = await handleDeleteSecret({ secretId: SECRET_ID });
			expectError(result);
		});
	});

	// ── List Secret Versions ─────────────────────────────────────────────

	describe("handleListSecretVersions", () => {
		it("returns paginated versions", async () => {
			const versions = [mockSecretVersion()];
			mockApi.listSecretVersions.mockResolvedValue({ versions, totalCount: 1 });

			const result = await handleListSecretVersions({
				secretId: SECRET_ID,
				page: 1,
				pageSize: 50,
			});
			const data = parseResult(result);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
		});

		it("passes status filter", async () => {
			mockApi.listSecretVersions.mockResolvedValue({ versions: [], totalCount: 0 });

			await handleListSecretVersions({
				secretId: SECRET_ID,
				page: 1,
				pageSize: 50,
				status: ["enabled"],
			});

			expect(mockApi.listSecretVersions).toHaveBeenCalledWith(
				expect.objectContaining({ status: ["enabled"] }),
			);
		});

		it("forwards page and pageSize as camelCase to the SDK", async () => {
			mockApi.listSecretVersions.mockResolvedValue({ versions: [], totalCount: 0 });

			await handleListSecretVersions({ secretId: SECRET_ID, page: 4, pageSize: 3 });

			const request = mockApi.listSecretVersions.mock.lastCall?.[0] as Record<string, unknown>;
			expect(request.secretId).toBe(SECRET_ID);
			expect(request.page).toBe(4);
			expect(request.pageSize).toBe(3);
			expect(request).not.toHaveProperty("page_size");
		});

		it("returns error on failure", async () => {
			mockApi.listSecretVersions.mockRejectedValue(createApiError(404, "not found"));

			const result = await handleListSecretVersions({
				secretId: SECRET_ID,
				page: 1,
				pageSize: 50,
			});
			expectError(result);
		});
	});

	// ── Get Secret Version ───────────────────────────────────────────────

	describe("handleGetSecretVersion", () => {
		it("returns version on success", async () => {
			mockApi.getSecretVersion.mockResolvedValue(mockSecretVersion());

			const result = await handleGetSecretVersion({ secretId: SECRET_ID, revision: "latest" });
			const data = parseResult(result);
			expect(data.revision).toBe(1);
			expect(data.latest).toBe(true);
		});

		it("returns error on failure", async () => {
			mockApi.getSecretVersion.mockRejectedValue(createApiError(404, "not found"));

			const result = await handleGetSecretVersion({ secretId: SECRET_ID, revision: "99" });
			expectError(result);
		});
	});

	// ── Create Secret Version ────────────────────────────────────────────

	describe("handleCreateSecretVersion", () => {
		it("creates version and returns it", async () => {
			mockApi.createSecretVersion.mockResolvedValue(mockSecretVersion({ revision: 2 }));

			const result = await handleCreateSecretVersion({
				secretId: SECRET_ID,
				data: "aGVsbG8=",
			});
			const data = parseResult(result);
			expect(data.revision).toBe(2);
		});

		it("passes all optional fields", async () => {
			mockApi.createSecretVersion.mockResolvedValue(mockSecretVersion());

			await handleCreateSecretVersion({
				secretId: SECRET_ID,
				data: "aGVsbG8=",
				description: "v2",
				disablePrevious: true,
				dataCrc32: 123456,
			});

			expect(mockApi.createSecretVersion).toHaveBeenCalledWith(
				expect.objectContaining({
					data: "aGVsbG8=",
					description: "v2",
					disablePrevious: true,
					dataCrc32: 123456,
				}),
			);
		});

		it("returns error on failure", async () => {
			mockApi.createSecretVersion.mockRejectedValue(createApiError(400, "bad data"));

			const result = await handleCreateSecretVersion({
				secretId: SECRET_ID,
				data: "bad",
			});
			expectError(result);
		});
	});

	// ── Access Secret Version ────────────────────────────────────────────

	describe("handleAccessSecretVersion", () => {
		it("returns secret data on success", async () => {
			mockApi.accessSecretVersion.mockResolvedValue({
				secretId: SECRET_ID,
				revision: 1,
				data: "aGVsbG8=",
				type: "opaque",
			});

			const result = await handleAccessSecretVersion({
				secretId: SECRET_ID,
				revision: "latest",
			});
			const data = parseResult(result);
			expect(data.data).toBe("aGVsbG8=");
			expect(data.secretId).toBe(SECRET_ID);
		});

		it("returns error on failure", async () => {
			mockApi.accessSecretVersion.mockRejectedValue(createApiError(404, "not found"));

			const result = await handleAccessSecretVersion({
				secretId: SECRET_ID,
				revision: "1",
			});
			expectError(result);
		});
	});

	// ── Disable Secret Version ───────────────────────────────────────────

	describe("handleDisableSecretVersion", () => {
		it("disables version and returns it", async () => {
			mockApi.disableSecretVersion.mockResolvedValue(mockSecretVersion({ status: "disabled" }));

			const result = await handleDisableSecretVersion({
				secretId: SECRET_ID,
				revision: "1",
			});
			const data = parseResult(result);
			expect(data.status).toBe("disabled");
		});

		it("returns error on failure", async () => {
			mockApi.disableSecretVersion.mockRejectedValue(createApiError(404, "not found"));

			const result = await handleDisableSecretVersion({
				secretId: SECRET_ID,
				revision: "1",
			});
			expectError(result);
		});
	});

	// ── Enable Secret Version ────────────────────────────────────────────

	describe("handleEnableSecretVersion", () => {
		it("enables version and returns it", async () => {
			mockApi.enableSecretVersion.mockResolvedValue(mockSecretVersion({ status: "enabled" }));

			const result = await handleEnableSecretVersion({
				secretId: SECRET_ID,
				revision: "1",
			});
			const data = parseResult(result);
			expect(data.status).toBe("enabled");
		});

		it("returns error on failure", async () => {
			mockApi.enableSecretVersion.mockRejectedValue(createApiError(404, "not found"));

			const result = await handleEnableSecretVersion({
				secretId: SECRET_ID,
				revision: "1",
			});
			expectError(result);
		});
	});

	// ── Destroy Secret Version ───────────────────────────────────────────

	describe("handleDestroySecretVersion", () => {
		it("destroys version and returns success", async () => {
			mockApi.deleteSecretVersion.mockResolvedValue(undefined);

			const result = await handleDestroySecretVersion({
				secretId: SECRET_ID,
				revision: "1",
			});
			const data = parseResult(result);
			expect(data.success).toBe(true);
			expect(data.secretId).toBe(SECRET_ID);
			expect(data.revision).toBe("1");
		});

		it("returns error on failure", async () => {
			mockApi.deleteSecretVersion.mockRejectedValue(createApiError(404, "not found"));

			const result = await handleDestroySecretVersion({
				secretId: SECRET_ID,
				revision: "1",
			});
			expectError(result);
		});
	});

	// ── Protect Secret ───────────────────────────────────────────────────

	describe("handleProtectSecret", () => {
		it("protects secret and returns it", async () => {
			mockApi.protectSecret.mockResolvedValue(mockSecret({ protected: true }));

			const result = await handleProtectSecret({ secretId: SECRET_ID });
			const data = parseResult(result);
			expect(data.protected).toBe(true);
		});

		it("returns error on failure", async () => {
			mockApi.protectSecret.mockRejectedValue(createApiError(404, "not found"));

			const result = await handleProtectSecret({ secretId: SECRET_ID });
			expectError(result);
		});
	});

	// ── Unprotect Secret ─────────────────────────────────────────────────

	describe("handleUnprotectSecret", () => {
		it("unprotects secret and returns it", async () => {
			mockApi.unprotectSecret.mockResolvedValue(mockSecret({ protected: false }));

			const result = await handleUnprotectSecret({ secretId: SECRET_ID });
			const data = parseResult(result);
			expect(data.protected).toBe(false);
		});

		it("returns error on failure", async () => {
			mockApi.unprotectSecret.mockRejectedValue(createApiError(404, "not found"));

			const result = await handleUnprotectSecret({ secretId: SECRET_ID });
			expectError(result);
		});
	});

	// ── List Tags ────────────────────────────────────────────────────────

	describe("handleListTags", () => {
		it("returns paginated tags", async () => {
			mockApi.listTags.mockResolvedValue({ tags: ["env:prod", "team:backend"], totalCount: 2 });

			const result = await handleListTags({ page: 1, pageSize: 50 });
			const data = parseResult(result);
			expect(data.items).toEqual(["env:prod", "team:backend"]);
			expect(data.totalCount).toBe(2);
		});

		it("passes region and projectId", async () => {
			mockApi.listTags.mockResolvedValue({ tags: [], totalCount: 0 });

			await handleListTags({ page: 1, pageSize: 50, region: "fr-par", projectId: PROJECT_ID });
			expect(mockApi.listTags).toHaveBeenCalledWith(
				expect.objectContaining({ region: "fr-par", projectId: PROJECT_ID }),
			);
		});

		it("forwards page and pageSize as camelCase to the SDK", async () => {
			mockApi.listTags.mockResolvedValue({ tags: [], totalCount: 0 });

			await handleListTags({ page: 5, pageSize: 11 });

			const request = mockApi.listTags.mock.lastCall?.[0] as Record<string, unknown>;
			expect(request.page).toBe(5);
			expect(request.pageSize).toBe(11);
			expect(request).not.toHaveProperty("page_size");
		});

		it("returns error on failure", async () => {
			mockApi.listTags.mockRejectedValue(createApiError(500, "internal error"));

			const result = await handleListTags({ page: 1, pageSize: 50 });
			expectError(result);
		});
	});

	// ── Add Secret Owner ─────────────────────────────────────────────────

	describe("handleAddSecretOwner", () => {
		it("adds owner and returns success", async () => {
			mockApi.addSecretOwner.mockResolvedValue(undefined);

			const result = await handleAddSecretOwner({
				secretId: SECRET_ID,
				product: "edge_services",
			});
			const data = parseResult(result);
			expect(data.success).toBe(true);
			expect(data.secretId).toBe(SECRET_ID);
		});

		it("returns error on failure", async () => {
			mockApi.addSecretOwner.mockRejectedValue(createApiError(404, "not found"));

			const result = await handleAddSecretOwner({ secretId: SECRET_ID });
			expectError(result);
		});
	});
});
