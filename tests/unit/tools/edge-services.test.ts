import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	handleCreateBackendStage,
	handleCreateCacheStage,
	handleCreateDNSStage,
	handleCreatePipeline,
	handleCreateTLSStage,
	handleDeleteBackendStage,
	handleDeleteCacheStage,
	handleDeleteDNSStage,
	handleDeletePipeline,
	handleDeleteTLSStage,
	handleGetBackendStage,
	handleGetCacheStage,
	handleGetDNSStage,
	handleGetPipeline,
	handleGetPurgeRequest,
	handleGetTLSStage,
	handleListBackendStages,
	handleListCacheStages,
	handleListDNSStages,
	handleListPipelines,
	handleListPurgeRequests,
	handleListTLSStages,
	handlePurgeCache,
	handleUpdateBackendStage,
	handleUpdateCacheStage,
	handleUpdateDNSStage,
	handleUpdatePipeline,
	handleUpdateTLSStage,
} from "../../../src/tools/edge-services/handlers.js";
import { registerEdgeServicesTools } from "../../../src/tools/edge-services/index.js";
import {
	CreateBackendStageParams,
	CreateCacheStageParams,
	CreateDNSStageParams,
	CreatePipelineParams,
	CreatePurgeRequestParams,
	CreateTLSStageParams,
	DNSStageType,
	DeleteBackendStageParams,
	DeleteCacheStageParams,
	DeleteDNSStageParams,
	DeletePipelineParams,
	DeleteTLSStageParams,
	GetBackendStageParams,
	GetCacheStageParams,
	GetDNSStageParams,
	GetPipelineParams,
	GetPurgeRequestParams,
	GetTLSStageParams,
	ListBackendStagesParams,
	ListCacheStagesParams,
	ListDNSStagesParams,
	ListPipelinesOrderBy,
	ListPipelinesParams,
	ListPurgeRequestsOrderBy,
	ListPurgeRequestsParams,
	ListStagesOrderBy,
	ListTLSStagesParams,
	PipelineStatus,
	PurgeRequestStatus,
	ScalewayLbConfigSchema,
	ScalewayLbSchema,
	ScalewayS3ConfigSchema,
	TLSSecretSchema,
	UpdateBackendStageParams,
	UpdateCacheStageParams,
	UpdateDNSStageParams,
	UpdatePipelineParams,
	UpdateTLSStageParams,
} from "../../../src/tools/edge-services/types.js";

type ErrorResult = { isError: boolean; content: { type: string; text: string }[] };

// Mock the SDK
const mockListPipelines = vi.fn();
const mockGetPipeline = vi.fn();
const mockCreatePipeline = vi.fn();
const mockUpdatePipeline = vi.fn();
const mockDeletePipeline = vi.fn();
const mockListDNSStages = vi.fn();
const mockGetDNSStage = vi.fn();
const mockCreateDNSStage = vi.fn();
const mockUpdateDNSStage = vi.fn();
const mockDeleteDNSStage = vi.fn();
const mockListTLSStages = vi.fn();
const mockGetTLSStage = vi.fn();
const mockCreateTLSStage = vi.fn();
const mockUpdateTLSStage = vi.fn();
const mockDeleteTLSStage = vi.fn();
const mockListCacheStages = vi.fn();
const mockGetCacheStage = vi.fn();
const mockCreateCacheStage = vi.fn();
const mockUpdateCacheStage = vi.fn();
const mockDeleteCacheStage = vi.fn();
const mockListBackendStages = vi.fn();
const mockGetBackendStage = vi.fn();
const mockCreateBackendStage = vi.fn();
const mockUpdateBackendStage = vi.fn();
const mockDeleteBackendStage = vi.fn();
const mockCreatePurgeRequest = vi.fn();
const mockListPurgeRequests = vi.fn();
const mockGetPurgeRequest = vi.fn();

vi.mock("@scaleway/sdk-edge-services/v1beta1", () => ({
	API: vi.fn().mockImplementation(() => ({
		listPipelines: mockListPipelines,
		getPipeline: mockGetPipeline,
		createPipeline: mockCreatePipeline,
		updatePipeline: mockUpdatePipeline,
		deletePipeline: mockDeletePipeline,
		listDNSStages: mockListDNSStages,
		getDNSStage: mockGetDNSStage,
		createDNSStage: mockCreateDNSStage,
		updateDNSStage: mockUpdateDNSStage,
		deleteDNSStage: mockDeleteDNSStage,
		listTLSStages: mockListTLSStages,
		getTLSStage: mockGetTLSStage,
		createTLSStage: mockCreateTLSStage,
		updateTLSStage: mockUpdateTLSStage,
		deleteTLSStage: mockDeleteTLSStage,
		listCacheStages: mockListCacheStages,
		getCacheStage: mockGetCacheStage,
		createCacheStage: mockCreateCacheStage,
		updateCacheStage: mockUpdateCacheStage,
		deleteCacheStage: mockDeleteCacheStage,
		listBackendStages: mockListBackendStages,
		getBackendStage: mockGetBackendStage,
		createBackendStage: mockCreateBackendStage,
		updateBackendStage: mockUpdateBackendStage,
		deleteBackendStage: mockDeleteBackendStage,
		createPurgeRequest: mockCreatePurgeRequest,
		listPurgeRequests: mockListPurgeRequests,
		getPurgeRequest: mockGetPurgeRequest,
	})),
}));

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn().mockReturnValue({
		accessKey: "SCWTEST",
		secretKey: "test-secret",
		defaultProjectId: "test-project-id",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn().mockReturnValue({}),
}));

afterEach(() => {
	vi.clearAllMocks();
});

describe("edge-services module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerEdgeServicesTools(server)).not.toThrow();
	});

	it("registers 28 tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerEdgeServicesTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(28);
	});
});

// ── Zod Schema Tests ─────────────────────────────────────────────────────────

describe("edge-services types", () => {
	describe("PipelineStatus", () => {
		it("accepts valid statuses", () => {
			for (const status of ["unknown_status", "ready", "error", "pending", "warning", "locked"]) {
				expect(PipelineStatus.parse(status)).toBe(status);
			}
		});

		it("rejects invalid status", () => {
			expect(() => PipelineStatus.parse("invalid")).toThrow();
		});
	});

	describe("PurgeRequestStatus", () => {
		it("accepts valid statuses", () => {
			for (const status of ["unknown_status", "done", "error", "pending"]) {
				expect(PurgeRequestStatus.parse(status)).toBe(status);
			}
		});

		it("rejects invalid status", () => {
			expect(() => PurgeRequestStatus.parse("invalid")).toThrow();
		});
	});

	describe("DNSStageType", () => {
		it("accepts valid types", () => {
			for (const type of ["unknown_type", "auto", "managed", "custom"]) {
				expect(DNSStageType.parse(type)).toBe(type);
			}
		});

		it("rejects invalid type", () => {
			expect(() => DNSStageType.parse("invalid")).toThrow();
		});
	});

	describe("ListPipelinesOrderBy", () => {
		it("accepts valid order values", () => {
			for (const order of ["created_at_asc", "created_at_desc", "name_asc", "name_desc"]) {
				expect(ListPipelinesOrderBy.parse(order)).toBe(order);
			}
		});

		it("rejects invalid order", () => {
			expect(() => ListPipelinesOrderBy.parse("invalid")).toThrow();
		});
	});

	describe("ListStagesOrderBy", () => {
		it("accepts valid order values", () => {
			for (const order of ["created_at_asc", "created_at_desc"]) {
				expect(ListStagesOrderBy.parse(order)).toBe(order);
			}
		});

		it("rejects invalid order", () => {
			expect(() => ListStagesOrderBy.parse("name_asc")).toThrow();
		});
	});

	describe("ListPurgeRequestsOrderBy", () => {
		it("accepts valid order values", () => {
			for (const order of ["created_at_asc", "created_at_desc"]) {
				expect(ListPurgeRequestsOrderBy.parse(order)).toBe(order);
			}
		});

		it("rejects invalid order", () => {
			expect(() => ListPurgeRequestsOrderBy.parse("invalid")).toThrow();
		});
	});

	describe("ListPipelinesParams", () => {
		it("accepts valid params with defaults", () => {
			const result = ListPipelinesParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts all optional fields", () => {
			const result = ListPipelinesParams.parse({
				name: "test",
				projectId: "proj-123",
				organizationId: "org-123",
				orderBy: "name_asc",
				page: 2,
				pageSize: 25,
			});
			expect(result.name).toBe("test");
			expect(result.projectId).toBe("proj-123");
			expect(result.organizationId).toBe("org-123");
			expect(result.orderBy).toBe("name_asc");
			expect(result.page).toBe(2);
			expect(result.pageSize).toBe(25);
		});

		it("rejects invalid page", () => {
			expect(() => ListPipelinesParams.parse({ page: 0 })).toThrow();
		});

		it("rejects invalid pageSize", () => {
			expect(() => ListPipelinesParams.parse({ pageSize: 101 })).toThrow();
		});
	});

	describe("GetPipelineParams", () => {
		it("requires pipelineId", () => {
			expect(() => GetPipelineParams.parse({})).toThrow();
		});

		it("accepts valid pipelineId", () => {
			const result = GetPipelineParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});
	});

	describe("CreatePipelineParams", () => {
		it("requires name and description", () => {
			expect(() => CreatePipelineParams.parse({})).toThrow();
			expect(() => CreatePipelineParams.parse({ name: "test" })).toThrow();
		});

		it("accepts valid params", () => {
			const result = CreatePipelineParams.parse({
				name: "test-pipeline",
				description: "A test pipeline",
				projectId: "proj-123",
			});
			expect(result.name).toBe("test-pipeline");
			expect(result.description).toBe("A test pipeline");
			expect(result.projectId).toBe("proj-123");
		});

		it("projectId is optional", () => {
			const result = CreatePipelineParams.parse({
				name: "test",
				description: "desc",
			});
			expect(result.projectId).toBeUndefined();
		});
	});

	describe("UpdatePipelineParams", () => {
		it("requires pipelineId", () => {
			expect(() => UpdatePipelineParams.parse({})).toThrow();
		});

		it("accepts partial update", () => {
			const result = UpdatePipelineParams.parse({
				pipelineId: "pipe-123",
				name: "new-name",
			});
			expect(result.name).toBe("new-name");
			expect(result.description).toBeUndefined();
		});
	});

	describe("DeletePipelineParams", () => {
		it("requires pipelineId", () => {
			expect(() => DeletePipelineParams.parse({})).toThrow();
		});

		it("accepts valid pipelineId", () => {
			const result = DeletePipelineParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});
	});

	describe("ListDNSStagesParams", () => {
		it("requires pipelineId", () => {
			expect(() => ListDNSStagesParams.parse({})).toThrow();
		});

		it("accepts valid params with defaults", () => {
			const result = ListDNSStagesParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts optional fqdn filter", () => {
			const result = ListDNSStagesParams.parse({
				pipelineId: "pipe-123",
				fqdn: "cdn.example.com",
			});
			expect(result.fqdn).toBe("cdn.example.com");
		});
	});

	describe("GetDNSStageParams", () => {
		it("requires dnsStageId", () => {
			expect(() => GetDNSStageParams.parse({})).toThrow();
		});
	});

	describe("CreateDNSStageParams", () => {
		it("requires pipelineId", () => {
			expect(() => CreateDNSStageParams.parse({})).toThrow();
		});

		it("accepts fqdns array", () => {
			const result = CreateDNSStageParams.parse({
				pipelineId: "pipe-123",
				fqdns: ["cdn.example.com", "cdn2.example.com"],
				tlsStageId: "tls-123",
			});
			expect(result.fqdns).toEqual(["cdn.example.com", "cdn2.example.com"]);
			expect(result.tlsStageId).toBe("tls-123");
		});
	});

	describe("UpdateDNSStageParams", () => {
		it("requires dnsStageId", () => {
			expect(() => UpdateDNSStageParams.parse({})).toThrow();
		});

		it("accepts partial update", () => {
			const result = UpdateDNSStageParams.parse({
				dnsStageId: "dns-123",
				fqdns: ["new.example.com"],
			});
			expect(result.fqdns).toEqual(["new.example.com"]);
		});
	});

	describe("DeleteDNSStageParams", () => {
		it("requires dnsStageId", () => {
			expect(() => DeleteDNSStageParams.parse({})).toThrow();
		});
	});

	describe("TLSSecretSchema", () => {
		it("requires secretId and region", () => {
			expect(() => TLSSecretSchema.parse({})).toThrow();
		});

		it("accepts valid secret", () => {
			const result = TLSSecretSchema.parse({
				secretId: "secret-123",
				region: "fr-par",
			});
			expect(result.secretId).toBe("secret-123");
			expect(result.region).toBe("fr-par");
		});
	});

	describe("ListTLSStagesParams", () => {
		it("requires pipelineId", () => {
			expect(() => ListTLSStagesParams.parse({})).toThrow();
		});

		it("accepts optional filters", () => {
			const result = ListTLSStagesParams.parse({
				pipelineId: "pipe-123",
				secretId: "secret-123",
				secretRegion: "fr-par",
			});
			expect(result.secretId).toBe("secret-123");
			expect(result.secretRegion).toBe("fr-par");
		});
	});

	describe("GetTLSStageParams", () => {
		it("requires tlsStageId", () => {
			expect(() => GetTLSStageParams.parse({})).toThrow();
		});
	});

	describe("CreateTLSStageParams", () => {
		it("requires pipelineId", () => {
			expect(() => CreateTLSStageParams.parse({})).toThrow();
		});

		it("accepts managed certificate", () => {
			const result = CreateTLSStageParams.parse({
				pipelineId: "pipe-123",
				managedCertificate: true,
				cacheStageId: "cache-123",
			});
			expect(result.managedCertificate).toBe(true);
		});

		it("accepts custom secrets", () => {
			const result = CreateTLSStageParams.parse({
				pipelineId: "pipe-123",
				secrets: [{ secretId: "s-123", region: "fr-par" }],
			});
			expect(result.secrets).toHaveLength(1);
		});
	});

	describe("UpdateTLSStageParams", () => {
		it("requires tlsStageId", () => {
			expect(() => UpdateTLSStageParams.parse({})).toThrow();
		});

		it("accepts tlsSecretsConfig", () => {
			const result = UpdateTLSStageParams.parse({
				tlsStageId: "tls-123",
				tlsSecretsConfig: {
					tlsSecrets: [{ secretId: "s-123", region: "fr-par" }],
				},
			});
			expect(result.tlsSecretsConfig?.tlsSecrets).toHaveLength(1);
		});
	});

	describe("DeleteTLSStageParams", () => {
		it("requires tlsStageId", () => {
			expect(() => DeleteTLSStageParams.parse({})).toThrow();
		});
	});

	describe("ListCacheStagesParams", () => {
		it("requires pipelineId", () => {
			expect(() => ListCacheStagesParams.parse({})).toThrow();
		});
	});

	describe("GetCacheStageParams", () => {
		it("requires cacheStageId", () => {
			expect(() => GetCacheStageParams.parse({})).toThrow();
		});
	});

	describe("CreateCacheStageParams", () => {
		it("requires pipelineId", () => {
			expect(() => CreateCacheStageParams.parse({})).toThrow();
		});

		it("accepts TTL and cookie settings", () => {
			const result = CreateCacheStageParams.parse({
				pipelineId: "pipe-123",
				fallbackTtl: "3600",
				includeCookies: false,
				backendStageId: "backend-123",
			});
			expect(result.fallbackTtl).toBe("3600");
			expect(result.includeCookies).toBe(false);
		});
	});

	describe("UpdateCacheStageParams", () => {
		it("requires cacheStageId", () => {
			expect(() => UpdateCacheStageParams.parse({})).toThrow();
		});
	});

	describe("DeleteCacheStageParams", () => {
		it("requires cacheStageId", () => {
			expect(() => DeleteCacheStageParams.parse({})).toThrow();
		});
	});

	describe("ScalewayS3ConfigSchema", () => {
		it("accepts empty object (all optional)", () => {
			const result = ScalewayS3ConfigSchema.parse({});
			expect(result).toBeDefined();
		});

		it("accepts full config", () => {
			const result = ScalewayS3ConfigSchema.parse({
				bucketName: "my-bucket",
				bucketRegion: "fr-par",
				isWebsite: true,
			});
			expect(result.bucketName).toBe("my-bucket");
		});
	});

	describe("ScalewayLbSchema", () => {
		it("requires id, zone, frontendId", () => {
			expect(() => ScalewayLbSchema.parse({})).toThrow();
		});

		it("accepts valid LB config", () => {
			const result = ScalewayLbSchema.parse({
				id: "lb-123",
				zone: "fr-par-1",
				frontendId: "fe-123",
				isSsl: true,
				domainName: "lb.example.com",
				hasWebsocket: false,
			});
			expect(result.id).toBe("lb-123");
		});
	});

	describe("ScalewayLbConfigSchema", () => {
		it("requires lbs array", () => {
			expect(() => ScalewayLbConfigSchema.parse({})).toThrow();
		});

		it("accepts valid LB config", () => {
			const result = ScalewayLbConfigSchema.parse({
				lbs: [{ id: "lb-123", zone: "fr-par-1", frontendId: "fe-123" }],
			});
			expect(result.lbs).toHaveLength(1);
		});
	});

	describe("ListBackendStagesParams", () => {
		it("requires pipelineId", () => {
			expect(() => ListBackendStagesParams.parse({})).toThrow();
		});

		it("accepts optional filters", () => {
			const result = ListBackendStagesParams.parse({
				pipelineId: "pipe-123",
				bucketName: "my-bucket",
				lbId: "lb-123",
			});
			expect(result.bucketName).toBe("my-bucket");
			expect(result.lbId).toBe("lb-123");
		});
	});

	describe("GetBackendStageParams", () => {
		it("requires backendStageId", () => {
			expect(() => GetBackendStageParams.parse({})).toThrow();
		});
	});

	describe("CreateBackendStageParams", () => {
		it("requires pipelineId", () => {
			expect(() => CreateBackendStageParams.parse({})).toThrow();
		});

		it("accepts S3 backend", () => {
			const result = CreateBackendStageParams.parse({
				pipelineId: "pipe-123",
				scalewayS3: { bucketName: "my-bucket", bucketRegion: "fr-par" },
			});
			expect(result.scalewayS3?.bucketName).toBe("my-bucket");
		});

		it("accepts LB backend", () => {
			const result = CreateBackendStageParams.parse({
				pipelineId: "pipe-123",
				scalewayLb: {
					lbs: [{ id: "lb-123", zone: "fr-par-1", frontendId: "fe-123" }],
				},
			});
			expect(result.scalewayLb?.lbs).toHaveLength(1);
		});
	});

	describe("UpdateBackendStageParams", () => {
		it("requires backendStageId and pipelineId", () => {
			expect(() => UpdateBackendStageParams.parse({})).toThrow();
			expect(() => UpdateBackendStageParams.parse({ backendStageId: "b-123" })).toThrow();
		});
	});

	describe("DeleteBackendStageParams", () => {
		it("requires backendStageId", () => {
			expect(() => DeleteBackendStageParams.parse({})).toThrow();
		});
	});

	describe("CreatePurgeRequestParams", () => {
		it("requires pipelineId", () => {
			expect(() => CreatePurgeRequestParams.parse({})).toThrow();
		});

		it("accepts assets list", () => {
			const result = CreatePurgeRequestParams.parse({
				pipelineId: "pipe-123",
				assets: ["/path/to/file.css", "/images/*"],
			});
			expect(result.assets).toHaveLength(2);
		});

		it("accepts purge all", () => {
			const result = CreatePurgeRequestParams.parse({
				pipelineId: "pipe-123",
				all: true,
			});
			expect(result.all).toBe(true);
		});
	});

	describe("ListPurgeRequestsParams", () => {
		it("accepts empty params with defaults", () => {
			const result = ListPurgeRequestsParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts optional filters", () => {
			const result = ListPurgeRequestsParams.parse({
				pipelineId: "pipe-123",
				projectId: "proj-123",
				orderBy: "created_at_desc",
			});
			expect(result.pipelineId).toBe("pipe-123");
		});
	});

	describe("GetPurgeRequestParams", () => {
		it("requires purgeRequestId", () => {
			expect(() => GetPurgeRequestParams.parse({})).toThrow();
		});
	});
});

// ── Handler Tests ────────────────────────────────────────────────────────────

describe("edge-services handlers", () => {
	// ── Pipeline Handlers ──────────────────────────────────────────────────

	describe("handleListPipelines", () => {
		it("returns paginated pipelines on success", async () => {
			mockListPipelines.mockResolvedValue({
				pipelines: [{ id: "pipe-1", name: "test" }],
				totalCount: 1,
			});
			const result = await handleListPipelines({ page: 1, pageSize: 50 });
			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.page).toBe(1);
			expect(parsed.pageSize).toBe(50);
		});

		it("passes filters to SDK", async () => {
			mockListPipelines.mockResolvedValue({ pipelines: [], totalCount: 0 });
			await handleListPipelines({
				page: 2,
				pageSize: 10,
				name: "test",
				projectId: "proj-123",
				organizationId: "org-123",
				orderBy: "name_asc" as const,
			});
			expect(mockListPipelines).toHaveBeenCalledWith({
				page: 2,
				page_size: 10,
				name: "test",
				projectId: "proj-123",
				organizationId: "org-123",
				orderBy: "name_asc",
			});
		});

		it("returns error response on failure", async () => {
			const err = new Error("API error");
			(err as unknown as { statusCode: number }).statusCode = 403;
			mockListPipelines.mockRejectedValue(err);
			const result = await handleListPipelines({ page: 1, pageSize: 50 });
			expect((result as ErrorResult).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetPipeline", () => {
		it("returns pipeline on success", async () => {
			mockGetPipeline.mockResolvedValue({ id: "pipe-1", name: "test" });
			const result = await handleGetPipeline({ pipelineId: "pipe-1" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("pipe-1");
		});

		it("returns error on 404", async () => {
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockGetPipeline.mockRejectedValue(err);
			const result = await handleGetPipeline({ pipelineId: "bad-id" });
			expect((result as ErrorResult).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleCreatePipeline", () => {
		it("returns created pipeline", async () => {
			mockCreatePipeline.mockResolvedValue({
				id: "pipe-new",
				name: "new-pipeline",
				description: "desc",
			});
			const result = await handleCreatePipeline({
				name: "new-pipeline",
				description: "desc",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("new-pipeline");
		});

		it("passes projectId when provided", async () => {
			mockCreatePipeline.mockResolvedValue({ id: "pipe-new" });
			await handleCreatePipeline({
				name: "test",
				description: "desc",
				projectId: "proj-123",
			});
			expect(mockCreatePipeline).toHaveBeenCalledWith({
				name: "test",
				description: "desc",
				projectId: "proj-123",
			});
		});

		it("returns error on failure", async () => {
			const err = new Error("Bad request");
			(err as unknown as { statusCode: number }).statusCode = 400;
			mockCreatePipeline.mockRejectedValue(err);
			const result = await handleCreatePipeline({ name: "", description: "" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleUpdatePipeline", () => {
		it("returns updated pipeline", async () => {
			mockUpdatePipeline.mockResolvedValue({ id: "pipe-1", name: "updated" });
			const result = await handleUpdatePipeline({
				pipelineId: "pipe-1",
				name: "updated",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("updated");
		});

		it("returns error on failure", async () => {
			mockUpdatePipeline.mockRejectedValue(new Error("fail"));
			const result = await handleUpdatePipeline({ pipelineId: "pipe-1" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleDeletePipeline", () => {
		it("returns success on delete", async () => {
			mockDeletePipeline.mockResolvedValue(undefined);
			const result = await handleDeletePipeline({ pipelineId: "pipe-1" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
		});

		it("returns error on failure", async () => {
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockDeletePipeline.mockRejectedValue(err);
			const result = await handleDeletePipeline({ pipelineId: "bad-id" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	// ── DNS Stage Handlers ─────────────────────────────────────────────────

	describe("handleListDNSStages", () => {
		it("returns paginated DNS stages", async () => {
			mockListDNSStages.mockResolvedValue({
				stages: [{ id: "dns-1" }],
				totalCount: 1,
			});
			const result = await handleListDNSStages({
				pipelineId: "pipe-1",
				page: 1,
				pageSize: 50,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes fqdn filter", async () => {
			mockListDNSStages.mockResolvedValue({ stages: [], totalCount: 0 });
			await handleListDNSStages({
				pipelineId: "pipe-1",
				page: 1,
				pageSize: 50,
				fqdn: "cdn.example.com",
			});
			expect(mockListDNSStages).toHaveBeenCalledWith(
				expect.objectContaining({ fqdn: "cdn.example.com" }),
			);
		});

		it("returns error on failure", async () => {
			mockListDNSStages.mockRejectedValue(new Error("fail"));
			const result = await handleListDNSStages({
				pipelineId: "pipe-1",
				page: 1,
				pageSize: 50,
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleGetDNSStage", () => {
		it("returns DNS stage", async () => {
			mockGetDNSStage.mockResolvedValue({ id: "dns-1", fqdns: ["cdn.example.com"] });
			const result = await handleGetDNSStage({ dnsStageId: "dns-1" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("dns-1");
		});

		it("returns error on failure", async () => {
			mockGetDNSStage.mockRejectedValue(new Error("fail"));
			const result = await handleGetDNSStage({ dnsStageId: "bad" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleCreateDNSStage", () => {
		it("creates DNS stage with all params", async () => {
			mockCreateDNSStage.mockResolvedValue({ id: "dns-new" });
			const result = await handleCreateDNSStage({
				pipelineId: "pipe-1",
				fqdns: ["cdn.example.com"],
				tlsStageId: "tls-1",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("dns-new");
			expect(mockCreateDNSStage).toHaveBeenCalledWith(
				expect.objectContaining({
					pipelineId: "pipe-1",
					fqdns: ["cdn.example.com"],
					tlsStageId: "tls-1",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockCreateDNSStage.mockRejectedValue(new Error("fail"));
			const result = await handleCreateDNSStage({ pipelineId: "pipe-1" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleUpdateDNSStage", () => {
		it("updates DNS stage", async () => {
			mockUpdateDNSStage.mockResolvedValue({ id: "dns-1" });
			const result = await handleUpdateDNSStage({
				dnsStageId: "dns-1",
				fqdns: ["new.example.com"],
				backendStageId: "be-1",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("dns-1");
		});

		it("returns error on failure", async () => {
			mockUpdateDNSStage.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateDNSStage({ dnsStageId: "dns-1" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleDeleteDNSStage", () => {
		it("deletes DNS stage", async () => {
			mockDeleteDNSStage.mockResolvedValue(undefined);
			const result = await handleDeleteDNSStage({ dnsStageId: "dns-1" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
		});

		it("returns error on failure", async () => {
			mockDeleteDNSStage.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteDNSStage({ dnsStageId: "bad" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	// ── TLS Stage Handlers ─────────────────────────────────────────────────

	describe("handleListTLSStages", () => {
		it("returns paginated TLS stages", async () => {
			mockListTLSStages.mockResolvedValue({
				stages: [{ id: "tls-1" }],
				totalCount: 1,
			});
			const result = await handleListTLSStages({
				pipelineId: "pipe-1",
				page: 1,
				pageSize: 50,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes optional filters", async () => {
			mockListTLSStages.mockResolvedValue({ stages: [], totalCount: 0 });
			await handleListTLSStages({
				pipelineId: "pipe-1",
				page: 1,
				pageSize: 50,
				secretId: "s-1",
				secretRegion: "fr-par",
			});
			expect(mockListTLSStages).toHaveBeenCalledWith(
				expect.objectContaining({ secretId: "s-1", secretRegion: "fr-par" }),
			);
		});

		it("returns error on failure", async () => {
			mockListTLSStages.mockRejectedValue(new Error("fail"));
			const result = await handleListTLSStages({
				pipelineId: "pipe-1",
				page: 1,
				pageSize: 50,
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleGetTLSStage", () => {
		it("returns TLS stage", async () => {
			mockGetTLSStage.mockResolvedValue({ id: "tls-1", managedCertificate: true });
			const result = await handleGetTLSStage({ tlsStageId: "tls-1" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("tls-1");
		});

		it("returns error on failure", async () => {
			mockGetTLSStage.mockRejectedValue(new Error("fail"));
			const result = await handleGetTLSStage({ tlsStageId: "bad" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleCreateTLSStage", () => {
		it("creates TLS stage with managed cert", async () => {
			mockCreateTLSStage.mockResolvedValue({ id: "tls-new", managedCertificate: true });
			const result = await handleCreateTLSStage({
				pipelineId: "pipe-1",
				managedCertificate: true,
				cacheStageId: "cache-1",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.managedCertificate).toBe(true);
		});

		it("creates TLS stage with custom secrets", async () => {
			mockCreateTLSStage.mockResolvedValue({ id: "tls-new" });
			await handleCreateTLSStage({
				pipelineId: "pipe-1",
				secrets: [{ secretId: "s-1", region: "fr-par" }],
			});
			expect(mockCreateTLSStage).toHaveBeenCalledWith(
				expect.objectContaining({
					secrets: [{ secretId: "s-1", region: "fr-par" }],
				}),
			);
		});

		it("returns error on failure", async () => {
			mockCreateTLSStage.mockRejectedValue(new Error("fail"));
			const result = await handleCreateTLSStage({ pipelineId: "pipe-1" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleUpdateTLSStage", () => {
		it("updates TLS stage", async () => {
			mockUpdateTLSStage.mockResolvedValue({ id: "tls-1" });
			const result = await handleUpdateTLSStage({
				tlsStageId: "tls-1",
				managedCertificate: false,
				tlsSecretsConfig: {
					tlsSecrets: [{ secretId: "s-1", region: "fr-par" }],
				},
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("tls-1");
		});

		it("returns error on failure", async () => {
			mockUpdateTLSStage.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateTLSStage({ tlsStageId: "tls-1" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleDeleteTLSStage", () => {
		it("deletes TLS stage", async () => {
			mockDeleteTLSStage.mockResolvedValue(undefined);
			const result = await handleDeleteTLSStage({ tlsStageId: "tls-1" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
		});

		it("returns error on failure", async () => {
			mockDeleteTLSStage.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteTLSStage({ tlsStageId: "bad" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	// ── Cache Stage Handlers ───────────────────────────────────────────────

	describe("handleListCacheStages", () => {
		it("returns paginated cache stages", async () => {
			mockListCacheStages.mockResolvedValue({
				stages: [{ id: "cache-1" }],
				totalCount: 1,
			});
			const result = await handleListCacheStages({
				pipelineId: "pipe-1",
				page: 1,
				pageSize: 50,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
		});

		it("returns error on failure", async () => {
			mockListCacheStages.mockRejectedValue(new Error("fail"));
			const result = await handleListCacheStages({
				pipelineId: "pipe-1",
				page: 1,
				pageSize: 50,
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleGetCacheStage", () => {
		it("returns cache stage", async () => {
			mockGetCacheStage.mockResolvedValue({ id: "cache-1", fallbackTtl: "3600" });
			const result = await handleGetCacheStage({ cacheStageId: "cache-1" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("cache-1");
		});

		it("returns error on failure", async () => {
			mockGetCacheStage.mockRejectedValue(new Error("fail"));
			const result = await handleGetCacheStage({ cacheStageId: "bad" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleCreateCacheStage", () => {
		it("creates cache stage", async () => {
			mockCreateCacheStage.mockResolvedValue({ id: "cache-new", fallbackTtl: "7200" });
			const result = await handleCreateCacheStage({
				pipelineId: "pipe-1",
				fallbackTtl: "7200",
				includeCookies: false,
				backendStageId: "be-1",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.fallbackTtl).toBe("7200");
		});

		it("returns error on failure", async () => {
			mockCreateCacheStage.mockRejectedValue(new Error("fail"));
			const result = await handleCreateCacheStage({ pipelineId: "pipe-1" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleUpdateCacheStage", () => {
		it("updates cache stage", async () => {
			mockUpdateCacheStage.mockResolvedValue({ id: "cache-1" });
			const result = await handleUpdateCacheStage({
				cacheStageId: "cache-1",
				fallbackTtl: "1800",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("cache-1");
		});

		it("returns error on failure", async () => {
			mockUpdateCacheStage.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateCacheStage({ cacheStageId: "cache-1" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleDeleteCacheStage", () => {
		it("deletes cache stage", async () => {
			mockDeleteCacheStage.mockResolvedValue(undefined);
			const result = await handleDeleteCacheStage({ cacheStageId: "cache-1" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
		});

		it("returns error on failure", async () => {
			mockDeleteCacheStage.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteCacheStage({ cacheStageId: "bad" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	// ── Backend Stage Handlers ─────────────────────────────────────────────

	describe("handleListBackendStages", () => {
		it("returns paginated backend stages", async () => {
			mockListBackendStages.mockResolvedValue({
				stages: [{ id: "be-1" }],
				totalCount: 1,
			});
			const result = await handleListBackendStages({
				pipelineId: "pipe-1",
				page: 1,
				pageSize: 50,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes optional filters", async () => {
			mockListBackendStages.mockResolvedValue({ stages: [], totalCount: 0 });
			await handleListBackendStages({
				pipelineId: "pipe-1",
				page: 1,
				pageSize: 50,
				bucketName: "my-bucket",
				bucketRegion: "fr-par",
				lbId: "lb-123",
			});
			expect(mockListBackendStages).toHaveBeenCalledWith(
				expect.objectContaining({
					bucketName: "my-bucket",
					bucketRegion: "fr-par",
					lbId: "lb-123",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockListBackendStages.mockRejectedValue(new Error("fail"));
			const result = await handleListBackendStages({
				pipelineId: "pipe-1",
				page: 1,
				pageSize: 50,
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleGetBackendStage", () => {
		it("returns backend stage", async () => {
			mockGetBackendStage.mockResolvedValue({ id: "be-1" });
			const result = await handleGetBackendStage({ backendStageId: "be-1" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("be-1");
		});

		it("returns error on failure", async () => {
			mockGetBackendStage.mockRejectedValue(new Error("fail"));
			const result = await handleGetBackendStage({ backendStageId: "bad" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleCreateBackendStage", () => {
		it("creates S3 backend stage", async () => {
			mockCreateBackendStage.mockResolvedValue({
				id: "be-new",
				scalewayS3: { bucketName: "my-bucket" },
			});
			const result = await handleCreateBackendStage({
				pipelineId: "pipe-1",
				scalewayS3: { bucketName: "my-bucket", bucketRegion: "fr-par" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.scalewayS3.bucketName).toBe("my-bucket");
		});

		it("creates LB backend stage", async () => {
			mockCreateBackendStage.mockResolvedValue({ id: "be-new" });
			await handleCreateBackendStage({
				pipelineId: "pipe-1",
				scalewayLb: {
					lbs: [{ id: "lb-1", zone: "fr-par-1", frontendId: "fe-1" }],
				},
			});
			expect(mockCreateBackendStage).toHaveBeenCalledWith(
				expect.objectContaining({
					scalewayLb: {
						lbs: [{ id: "lb-1", zone: "fr-par-1", frontendId: "fe-1" }],
					},
				}),
			);
		});

		it("returns error on failure", async () => {
			mockCreateBackendStage.mockRejectedValue(new Error("fail"));
			const result = await handleCreateBackendStage({ pipelineId: "pipe-1" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleUpdateBackendStage", () => {
		it("updates backend stage", async () => {
			mockUpdateBackendStage.mockResolvedValue({ id: "be-1" });
			const result = await handleUpdateBackendStage({
				backendStageId: "be-1",
				pipelineId: "pipe-1",
				scalewayS3: { bucketName: "new-bucket" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("be-1");
		});

		it("returns error on failure", async () => {
			mockUpdateBackendStage.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateBackendStage({
				backendStageId: "be-1",
				pipelineId: "pipe-1",
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleDeleteBackendStage", () => {
		it("deletes backend stage", async () => {
			mockDeleteBackendStage.mockResolvedValue(undefined);
			const result = await handleDeleteBackendStage({ backendStageId: "be-1" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
		});

		it("returns error on failure", async () => {
			mockDeleteBackendStage.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteBackendStage({ backendStageId: "bad" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	// ── Purge Request Handlers ─────────────────────────────────────────────

	describe("handlePurgeCache", () => {
		it("creates purge request with assets", async () => {
			mockCreatePurgeRequest.mockResolvedValue({
				id: "purge-1",
				status: "pending",
				assets: ["/path/file.css"],
			});
			const result = await handlePurgeCache({
				pipelineId: "pipe-1",
				assets: ["/path/file.css"],
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("pending");
		});

		it("creates purge all request", async () => {
			mockCreatePurgeRequest.mockResolvedValue({
				id: "purge-2",
				status: "pending",
				all: true,
			});
			await handlePurgeCache({ pipelineId: "pipe-1", all: true });
			expect(mockCreatePurgeRequest).toHaveBeenCalledWith({
				pipelineId: "pipe-1",
				assets: undefined,
				all: true,
			});
		});

		it("returns error on failure", async () => {
			mockCreatePurgeRequest.mockRejectedValue(new Error("fail"));
			const result = await handlePurgeCache({ pipelineId: "pipe-1" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleListPurgeRequests", () => {
		it("returns paginated purge requests", async () => {
			mockListPurgeRequests.mockResolvedValue({
				purgeRequests: [{ id: "purge-1" }],
				totalCount: 1,
			});
			const result = await handleListPurgeRequests({ page: 1, pageSize: 50 });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes filters to SDK", async () => {
			mockListPurgeRequests.mockResolvedValue({
				purgeRequests: [],
				totalCount: 0,
			});
			await handleListPurgeRequests({
				page: 1,
				pageSize: 50,
				pipelineId: "pipe-1",
				projectId: "proj-1",
				organizationId: "org-1",
				orderBy: "created_at_desc" as const,
			});
			expect(mockListPurgeRequests).toHaveBeenCalledWith(
				expect.objectContaining({
					pipelineId: "pipe-1",
					projectId: "proj-1",
					organizationId: "org-1",
					orderBy: "created_at_desc",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockListPurgeRequests.mockRejectedValue(new Error("fail"));
			const result = await handleListPurgeRequests({ page: 1, pageSize: 50 });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleGetPurgeRequest", () => {
		it("returns purge request", async () => {
			mockGetPurgeRequest.mockResolvedValue({
				id: "purge-1",
				status: "done",
			});
			const result = await handleGetPurgeRequest({ purgeRequestId: "purge-1" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("done");
		});

		it("returns error on failure", async () => {
			mockGetPurgeRequest.mockRejectedValue(new Error("fail"));
			const result = await handleGetPurgeRequest({ purgeRequestId: "bad" });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	// ── Error handling edge cases ──────────────────────────────────────────

	describe("error handling", () => {
		it("handles non-Error thrown values", async () => {
			mockGetPipeline.mockRejectedValue("string error");
			const result = await handleGetPipeline({ pipelineId: "pipe-1" });
			expect((result as ErrorResult).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});

		it("handles 429 rate limit errors", async () => {
			const err = new Error("Rate limited");
			(err as unknown as { statusCode: number }).statusCode = 429;
			mockListPipelines.mockRejectedValue(err);
			const result = await handleListPipelines({ page: 1, pageSize: 50 });
			expect((result as ErrorResult).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
		});

		it("handles 401 permission denied errors", async () => {
			const err = new Error("Unauthorized");
			(err as unknown as { statusCode: number }).statusCode = 401;
			mockCreatePipeline.mockRejectedValue(err);
			const result = await handleCreatePipeline({ name: "t", description: "d" });
			expect((result as ErrorResult).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});
});
