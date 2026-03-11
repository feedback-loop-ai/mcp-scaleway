import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerSnsTools } from "../../../src/tools/sns/index.js";

// Mock the SDK module
vi.mock("@scaleway/sdk-mnq", () => {
	const mockActivateSns = vi.fn();
	const mockDeactivateSns = vi.fn();
	const mockGetSnsInfo = vi.fn();
	const mockListSnsCredentials = vi.fn();
	const mockGetSnsCredentials = vi.fn();
	const mockCreateSnsCredentials = vi.fn();
	const mockUpdateSnsCredentials = vi.fn();
	const mockDeleteSnsCredentials = vi.fn();

	return {
		Mnqv1beta1: {
			SnsAPI: vi.fn().mockImplementation(() => ({
				activateSns: mockActivateSns,
				deactivateSns: mockDeactivateSns,
				getSnsInfo: mockGetSnsInfo,
				listSnsCredentials: mockListSnsCredentials,
				getSnsCredentials: mockGetSnsCredentials,
				createSnsCredentials: mockCreateSnsCredentials,
				updateSnsCredentials: mockUpdateSnsCredentials,
				deleteSnsCredentials: mockDeleteSnsCredentials,
			})),
		},
	};
});

// Mock auth and client
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn().mockReturnValue({
		accessKey: "SCW_TEST_ACCESS_KEY",
		secretKey: "SCW_TEST_SECRET_KEY",
		defaultProjectId: "test-project-id",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn().mockReturnValue({}),
}));

// Import handlers after mocks
import { Mnqv1beta1 } from "@scaleway/sdk-mnq";
import {
	handleActivateSns,
	handleCreateSnsCredentials,
	handleDeactivateSns,
	handleDeleteSnsCredentials,
	handleGetSnsCredentials,
	handleGetSnsInfo,
	handleListSnsCredentials,
	handleUpdateSnsCredentials,
} from "../../../src/tools/sns/handlers.js";
import {
	ActivateSnsSchema,
	CreateSnsCredentialsSchema,
	DeactivateSnsSchema,
	DeleteSnsCredentialsSchema,
	GetSnsCredentialsSchema,
	GetSnsInfoSchema,
	ListSnsCredentialsOrderBy,
	ListSnsCredentialsSchema,
	SnsCredentialsSchema,
	SnsInfoSchema,
	SnsInfoStatus,
	SnsPermissionsSchema,
	UpdateSnsCredentialsSchema,
} from "../../../src/tools/sns/types.js";

function getMockApi() {
	const instance = vi.mocked(Mnqv1beta1.SnsAPI);
	return (
		instance.mock.results[instance.mock.results.length - 1]?.value ??
		new Mnqv1beta1.SnsAPI({} as never)
	);
}

const MOCK_SNS_INFO = {
	projectId: "test-project-id",
	region: "fr-par",
	createdAt: new Date("2025-01-01T00:00:00Z"),
	updatedAt: new Date("2025-01-02T00:00:00Z"),
	status: "enabled" as const,
	snsEndpointUrl: "https://sns.mnq.fr-par.scaleway.com",
};

const MOCK_SNS_CREDENTIALS = {
	id: "cred-id-123",
	name: "my-creds",
	projectId: "test-project-id",
	region: "fr-par",
	createdAt: new Date("2025-01-01T00:00:00Z"),
	updatedAt: new Date("2025-01-02T00:00:00Z"),
	accessKey: "ak-123",
	secretKey: "sk-456",
	secretChecksum: "checksum-789",
	permissions: {
		canPublish: true,
		canReceive: false,
		canManage: true,
	},
};

describe("sns module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerSnsTools(server)).not.toThrow();
	});
});

describe("sns types", () => {
	describe("SnsInfoStatus", () => {
		it("accepts valid statuses", () => {
			expect(SnsInfoStatus.parse("enabled")).toBe("enabled");
			expect(SnsInfoStatus.parse("disabled")).toBe("disabled");
			expect(SnsInfoStatus.parse("unknown_status")).toBe("unknown_status");
		});

		it("rejects invalid status", () => {
			expect(() => SnsInfoStatus.parse("invalid")).toThrow();
		});
	});

	describe("ListSnsCredentialsOrderBy", () => {
		it("accepts valid order values", () => {
			expect(ListSnsCredentialsOrderBy.parse("created_at_asc")).toBe("created_at_asc");
			expect(ListSnsCredentialsOrderBy.parse("name_desc")).toBe("name_desc");
		});

		it("rejects invalid order", () => {
			expect(() => ListSnsCredentialsOrderBy.parse("invalid")).toThrow();
		});
	});

	describe("SnsPermissionsSchema", () => {
		it("validates permissions", () => {
			const result = SnsPermissionsSchema.parse({
				canPublish: true,
				canReceive: false,
				canManage: true,
			});
			expect(result.canPublish).toBe(true);
			expect(result.canReceive).toBe(false);
			expect(result.canManage).toBe(true);
		});

		it("allows empty permissions", () => {
			const result = SnsPermissionsSchema.parse({});
			expect(result.canPublish).toBeUndefined();
		});
	});

	describe("SnsInfoSchema", () => {
		it("validates sns info", () => {
			const result = SnsInfoSchema.parse({
				projectId: "proj-123",
				region: "fr-par",
				status: "enabled",
				snsEndpointUrl: "https://sns.example.com",
			});
			expect(result.projectId).toBe("proj-123");
			expect(result.status).toBe("enabled");
		});
	});

	describe("SnsCredentialsSchema", () => {
		it("validates credentials", () => {
			const result = SnsCredentialsSchema.parse({
				id: "cred-123",
				name: "my-creds",
				projectId: "proj-123",
				region: "fr-par",
				accessKey: "ak-123",
				secretKey: "sk-456",
				secretChecksum: "cs-789",
				permissions: { canPublish: true },
			});
			expect(result.id).toBe("cred-123");
			expect(result.permissions?.canPublish).toBe(true);
		});
	});

	describe("ActivateSnsSchema", () => {
		it("validates with region and projectId", () => {
			const result = ActivateSnsSchema.parse({ region: "fr-par", projectId: "proj-123" });
			expect(result.region).toBe("fr-par");
		});

		it("allows empty input", () => {
			const result = ActivateSnsSchema.parse({});
			expect(result.region).toBeUndefined();
		});
	});

	describe("DeactivateSnsSchema", () => {
		it("validates with region and projectId", () => {
			const result = DeactivateSnsSchema.parse({ region: "fr-par", projectId: "proj-123" });
			expect(result.region).toBe("fr-par");
		});

		it("allows empty input", () => {
			const result = DeactivateSnsSchema.parse({});
			expect(result.region).toBeUndefined();
		});
	});

	describe("GetSnsInfoSchema", () => {
		it("validates with region and projectId", () => {
			const result = GetSnsInfoSchema.parse({ region: "fr-par", projectId: "proj-123" });
			expect(result.projectId).toBe("proj-123");
		});

		it("allows empty input", () => {
			const result = GetSnsInfoSchema.parse({});
			expect(result.projectId).toBeUndefined();
		});
	});

	describe("ListSnsCredentialsSchema", () => {
		it("validates with all fields", () => {
			const result = ListSnsCredentialsSchema.parse({
				region: "fr-par",
				projectId: "proj-123",
				orderBy: "created_at_desc",
				page: 2,
				pageSize: 25,
			});
			expect(result.page).toBe(2);
			expect(result.pageSize).toBe(25);
			expect(result.orderBy).toBe("created_at_desc");
		});

		it("uses pagination defaults", () => {
			const result = ListSnsCredentialsSchema.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});
	});

	describe("GetSnsCredentialsSchema", () => {
		it("validates with required fields", () => {
			const result = GetSnsCredentialsSchema.parse({ snsCredentialsId: "cred-123" });
			expect(result.snsCredentialsId).toBe("cred-123");
		});

		it("rejects missing snsCredentialsId", () => {
			expect(() => GetSnsCredentialsSchema.parse({})).toThrow();
		});
	});

	describe("CreateSnsCredentialsSchema", () => {
		it("validates with all fields", () => {
			const result = CreateSnsCredentialsSchema.parse({
				region: "fr-par",
				projectId: "proj-123",
				name: "my-creds",
				permissions: { canPublish: true, canReceive: false, canManage: true },
			});
			expect(result.name).toBe("my-creds");
			expect(result.permissions?.canPublish).toBe(true);
		});

		it("allows empty input", () => {
			const result = CreateSnsCredentialsSchema.parse({});
			expect(result.name).toBeUndefined();
		});
	});

	describe("UpdateSnsCredentialsSchema", () => {
		it("validates with all fields", () => {
			const result = UpdateSnsCredentialsSchema.parse({
				snsCredentialsId: "cred-123",
				name: "updated-name",
				permissions: { canManage: false },
			});
			expect(result.snsCredentialsId).toBe("cred-123");
			expect(result.name).toBe("updated-name");
		});

		it("rejects missing snsCredentialsId", () => {
			expect(() => UpdateSnsCredentialsSchema.parse({})).toThrow();
		});
	});

	describe("DeleteSnsCredentialsSchema", () => {
		it("validates with required fields", () => {
			const result = DeleteSnsCredentialsSchema.parse({ snsCredentialsId: "cred-123" });
			expect(result.snsCredentialsId).toBe("cred-123");
		});

		it("rejects missing snsCredentialsId", () => {
			expect(() => DeleteSnsCredentialsSchema.parse({})).toThrow();
		});
	});
});

describe("sns handlers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("handleActivateSns", () => {
		it("activates SNS and returns info", async () => {
			const api = getMockApi();
			vi.mocked(api.activateSns).mockResolvedValue(MOCK_SNS_INFO);

			const result = await handleActivateSns({ region: "fr-par", projectId: "test-project-id" });

			expect(api.activateSns).toHaveBeenCalledWith({
				region: "fr-par",
				projectId: "test-project-id",
			});
			expect(result.content[0].type).toBe("text");
			const data = JSON.parse(result.content[0].text);
			expect(data.status).toBe("enabled");
			expect(data.snsEndpointUrl).toBe("https://sns.mnq.fr-par.scaleway.com");
			expect(data.createdAt).toBe("2025-01-01T00:00:00.000Z");
		});

		it("handles errors", async () => {
			const api = getMockApi();
			const error = Object.assign(new Error("forbidden"), { statusCode: 403 });
			vi.mocked(api.activateSns).mockRejectedValue(error);

			const result = await handleActivateSns({});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("permission_denied");
		});
	});

	describe("handleDeactivateSns", () => {
		it("deactivates SNS and returns info", async () => {
			const api = getMockApi();
			const disabledInfo = { ...MOCK_SNS_INFO, status: "disabled" as const };
			vi.mocked(api.deactivateSns).mockResolvedValue(disabledInfo);

			const result = await handleDeactivateSns({
				region: "fr-par",
				projectId: "test-project-id",
			});

			expect(api.deactivateSns).toHaveBeenCalledWith({
				region: "fr-par",
				projectId: "test-project-id",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.status).toBe("disabled");
		});

		it("handles errors", async () => {
			const api = getMockApi();
			vi.mocked(api.deactivateSns).mockRejectedValue(new Error("server error"));

			const result = await handleDeactivateSns({});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleGetSnsInfo", () => {
		it("returns SNS info", async () => {
			const api = getMockApi();
			vi.mocked(api.getSnsInfo).mockResolvedValue(MOCK_SNS_INFO);

			const result = await handleGetSnsInfo({ region: "fr-par", projectId: "test-project-id" });

			expect(api.getSnsInfo).toHaveBeenCalledWith({
				region: "fr-par",
				projectId: "test-project-id",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.projectId).toBe("test-project-id");
			expect(data.snsEndpointUrl).toBe("https://sns.mnq.fr-par.scaleway.com");
		});

		it("handles info without dates", async () => {
			const api = getMockApi();
			vi.mocked(api.getSnsInfo).mockResolvedValue({
				...MOCK_SNS_INFO,
				createdAt: undefined,
				updatedAt: undefined,
			});

			const result = await handleGetSnsInfo({});

			const data = JSON.parse(result.content[0].text);
			expect(data.createdAt).toBeUndefined();
			expect(data.updatedAt).toBeUndefined();
		});

		it("handles errors", async () => {
			const api = getMockApi();
			const error = Object.assign(new Error("not found"), { statusCode: 404 });
			vi.mocked(api.getSnsInfo).mockRejectedValue(error);

			const result = await handleGetSnsInfo({});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("not_found");
		});
	});

	describe("handleListSnsCredentials", () => {
		it("returns paginated credentials list", async () => {
			const api = getMockApi();
			vi.mocked(api.listSnsCredentials).mockResolvedValue({
				totalCount: 1,
				snsCredentials: [MOCK_SNS_CREDENTIALS],
			});

			const result = await handleListSnsCredentials({
				region: "fr-par",
				projectId: "test-project-id",
				orderBy: "created_at_desc",
				page: 1,
				pageSize: 50,
			});

			expect(api.listSnsCredentials).toHaveBeenCalledWith({
				region: "fr-par",
				projectId: "test-project-id",
				orderBy: "created_at_desc",
				page: 1,
				page_size: 50,
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.totalCount).toBe(1);
			expect(data.items).toHaveLength(1);
			expect(data.items[0].id).toBe("cred-id-123");
			expect(data.items[0].createdAt).toBe("2025-01-01T00:00:00.000Z");
			expect(data.page).toBe(1);
			expect(data.pageSize).toBe(50);
		});

		it("handles errors", async () => {
			const api = getMockApi();
			vi.mocked(api.listSnsCredentials).mockRejectedValue(new Error("rate limited"));

			const result = await handleListSnsCredentials({ page: 1, pageSize: 50 });

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleGetSnsCredentials", () => {
		it("returns credentials by ID", async () => {
			const api = getMockApi();
			vi.mocked(api.getSnsCredentials).mockResolvedValue(MOCK_SNS_CREDENTIALS);

			const result = await handleGetSnsCredentials({
				region: "fr-par",
				snsCredentialsId: "cred-id-123",
			});

			expect(api.getSnsCredentials).toHaveBeenCalledWith({
				region: "fr-par",
				snsCredentialsId: "cred-id-123",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.id).toBe("cred-id-123");
			expect(data.permissions.canPublish).toBe(true);
		});

		it("handles credentials without dates", async () => {
			const api = getMockApi();
			vi.mocked(api.getSnsCredentials).mockResolvedValue({
				...MOCK_SNS_CREDENTIALS,
				createdAt: undefined,
				updatedAt: undefined,
			});

			const result = await handleGetSnsCredentials({ snsCredentialsId: "cred-id-123" });

			const data = JSON.parse(result.content[0].text);
			expect(data.createdAt).toBeUndefined();
			expect(data.updatedAt).toBeUndefined();
		});

		it("handles errors", async () => {
			const api = getMockApi();
			const error = Object.assign(new Error("not found"), { statusCode: 404 });
			vi.mocked(api.getSnsCredentials).mockRejectedValue(error);

			const result = await handleGetSnsCredentials({ snsCredentialsId: "invalid" });

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateSnsCredentials", () => {
		it("creates credentials with permissions", async () => {
			const api = getMockApi();
			vi.mocked(api.createSnsCredentials).mockResolvedValue(MOCK_SNS_CREDENTIALS);

			const result = await handleCreateSnsCredentials({
				region: "fr-par",
				projectId: "test-project-id",
				name: "my-creds",
				permissions: { canPublish: true, canReceive: false, canManage: true },
			});

			expect(api.createSnsCredentials).toHaveBeenCalledWith({
				region: "fr-par",
				projectId: "test-project-id",
				name: "my-creds",
				permissions: { canPublish: true, canReceive: false, canManage: true },
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.accessKey).toBe("ak-123");
			expect(data.secretKey).toBe("sk-456");
		});

		it("handles errors", async () => {
			const api = getMockApi();
			const error = Object.assign(new Error("invalid input"), { statusCode: 400 });
			vi.mocked(api.createSnsCredentials).mockRejectedValue(error);

			const result = await handleCreateSnsCredentials({});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateSnsCredentials", () => {
		it("updates credentials name and permissions", async () => {
			const api = getMockApi();
			const updated = { ...MOCK_SNS_CREDENTIALS, name: "updated-name" };
			vi.mocked(api.updateSnsCredentials).mockResolvedValue(updated);

			const result = await handleUpdateSnsCredentials({
				region: "fr-par",
				snsCredentialsId: "cred-id-123",
				name: "updated-name",
				permissions: { canManage: false },
			});

			expect(api.updateSnsCredentials).toHaveBeenCalledWith({
				region: "fr-par",
				snsCredentialsId: "cred-id-123",
				name: "updated-name",
				permissions: { canManage: false },
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.name).toBe("updated-name");
		});

		it("handles errors", async () => {
			const api = getMockApi();
			vi.mocked(api.updateSnsCredentials).mockRejectedValue(new Error("server error"));

			const result = await handleUpdateSnsCredentials({ snsCredentialsId: "cred-id-123" });

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteSnsCredentials", () => {
		it("deletes credentials and returns success", async () => {
			const api = getMockApi();
			vi.mocked(api.deleteSnsCredentials).mockResolvedValue(undefined);

			const result = await handleDeleteSnsCredentials({
				region: "fr-par",
				snsCredentialsId: "cred-id-123",
			});

			expect(api.deleteSnsCredentials).toHaveBeenCalledWith({
				region: "fr-par",
				snsCredentialsId: "cred-id-123",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.success).toBe(true);
		});

		it("handles errors", async () => {
			const api = getMockApi();
			const error = Object.assign(new Error("unauthorized"), { statusCode: 401 });
			vi.mocked(api.deleteSnsCredentials).mockRejectedValue(error);

			const result = await handleDeleteSnsCredentials({ snsCredentialsId: "invalid" });

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("permission_denied");
		});
	});

	describe("error mapping", () => {
		it("handles non-Error thrown values", async () => {
			const api = getMockApi();
			vi.mocked(api.activateSns).mockRejectedValue("string error");

			const result = await handleActivateSns({});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("server_error");
			expect(data.error.message).toBe("string error");
		});

		it("handles 429 rate limited", async () => {
			const api = getMockApi();
			const error = Object.assign(new Error("rate limited"), { statusCode: 429 });
			vi.mocked(api.activateSns).mockRejectedValue(error);

			const result = await handleActivateSns({});

			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("rate_limited");
		});

		it("handles unknown status codes", async () => {
			const api = getMockApi();
			const error = Object.assign(new Error("conflict"), { statusCode: 409 });
			vi.mocked(api.activateSns).mockRejectedValue(error);

			const result = await handleActivateSns({});

			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("server_error");
		});
	});
});
