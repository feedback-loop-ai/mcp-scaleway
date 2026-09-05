/**
 * Contract tests for Edge Services API.
 *
 * Validates that Zod schemas match the Scaleway Edge Services API shapes
 * as defined in @scaleway/sdk-edge-services v1beta1 types.
 *
 * API Reference: specs/scaleway-api/ (Edge Services)
 * SDK Package: @scaleway/sdk-edge-services
 * Parity Matrix: tests/parity-matrix.json -> edge-services
 */
import { describe, expect, it, vi } from "vitest";
import {
	handleListBackendStages,
	handleListCacheStages,
	handleListDNSStages,
	handleListPipelines,
	handleListPurgeRequests,
	handleListTLSStages,
} from "../../src/tools/edge-services/handlers.js";
import {
	CreateBackendStageParams,
	CreateCacheStageParams,
	CreateDNSStageParams,
	CreatePipelineParams,
	CreatePurgeRequestParams,
	CreateTLSStageParams,
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
	ListPipelinesParams,
	ListPurgeRequestsParams,
	ListTLSStagesParams,
	UpdateBackendStageParams,
	UpdateCacheStageParams,
	UpdateDNSStageParams,
	UpdatePipelineParams,
	UpdateTLSStageParams,
} from "../../src/tools/edge-services/types.js";

// Wire-level fixtures: the real @scaleway/sdk-edge-services marshaller runs
// against a fake client so the query string it builds can be asserted directly.
vi.mock("../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS",
		secretKey: "SCW-SECRET",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../src/shared/client.js", () => ({
	createScalewayClient: () => ({
		fetch: mockFetch,
		settings: {
			defaultRegion: "fr-par",
			defaultZone: "fr-par-1",
			defaultProjectId: "00000000-0000-0000-0000-000000000001",
		},
	}),
}));

function lastRequest(): { method: string; path: string; urlParams: URLSearchParams } {
	return mockFetch.mock.lastCall?.[0] as {
		method: string;
		path: string;
		urlParams: URLSearchParams;
	};
}

describe("edge-services contract tests", () => {
	// ── Pipeline Contracts ─────────────────────────────────────────────────

	describe("GET /edge-services/v1beta1/pipelines (list_pipelines)", () => {
		it("accepts valid pagination params", () => {
			const result = ListPipelinesParams.parse({ page: 1, pageSize: 20 });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(20);
		});

		it("accepts optional name filter matching SDK ListPipelinesRequest.name", () => {
			const result = ListPipelinesParams.parse({ name: "my-pipeline" });
			expect(result.name).toBe("my-pipeline");
		});

		it("accepts optional projectId filter matching SDK ListPipelinesRequest.projectId", () => {
			const result = ListPipelinesParams.parse({ projectId: "proj-abc" });
			expect(result.projectId).toBe("proj-abc");
		});

		it("accepts optional organizationId filter matching SDK ListPipelinesRequest.organizationId", () => {
			const result = ListPipelinesParams.parse({ organizationId: "org-abc" });
			expect(result.organizationId).toBe("org-abc");
		});

		it("accepts orderBy matching SDK ListPipelinesRequestOrderBy", () => {
			for (const orderBy of [
				"created_at_asc",
				"created_at_desc",
				"name_asc",
				"name_desc",
			] as const) {
				const result = ListPipelinesParams.parse({ orderBy });
				expect(result.orderBy).toBe(orderBy);
			}
		});

		it("rejects unknown orderBy values", () => {
			expect(() => ListPipelinesParams.parse({ orderBy: "invalid" })).toThrow();
		});

		it("applies default pagination matching SDK defaults", () => {
			const result = ListPipelinesParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});
	});

	describe("GET /edge-services/v1beta1/pipelines/{pipeline_id} (get_pipeline)", () => {
		it("requires pipelineId matching SDK GetPipelineRequest.pipelineId", () => {
			const result = GetPipelineParams.parse({ pipelineId: "uuid-123" });
			expect(result.pipelineId).toBe("uuid-123");
		});

		it("rejects missing pipelineId", () => {
			expect(() => GetPipelineParams.parse({})).toThrow();
		});
	});

	describe("POST /edge-services/v1beta1/pipelines (create_pipeline)", () => {
		it("requires name and description matching SDK CreatePipelineRequest", () => {
			const result = CreatePipelineParams.parse({
				name: "my-pipeline",
				description: "CDN pipeline",
			});
			expect(result.name).toBe("my-pipeline");
			expect(result.description).toBe("CDN pipeline");
		});

		it("accepts optional projectId matching SDK CreatePipelineRequest.projectId", () => {
			const result = CreatePipelineParams.parse({
				name: "test",
				description: "desc",
				projectId: "proj-123",
			});
			expect(result.projectId).toBe("proj-123");
		});

		it("rejects missing required fields", () => {
			expect(() => CreatePipelineParams.parse({})).toThrow();
			expect(() => CreatePipelineParams.parse({ name: "test" })).toThrow();
		});
	});

	describe("PATCH /edge-services/v1beta1/pipelines/{pipeline_id} (update_pipeline)", () => {
		it("requires pipelineId matching SDK UpdatePipelineRequest.pipelineId", () => {
			const result = UpdatePipelineParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});

		it("accepts optional name and description matching SDK UpdatePipelineRequest", () => {
			const result = UpdatePipelineParams.parse({
				pipelineId: "pipe-123",
				name: "new-name",
				description: "new-desc",
			});
			expect(result.name).toBe("new-name");
			expect(result.description).toBe("new-desc");
		});
	});

	describe("DELETE /edge-services/v1beta1/pipelines/{pipeline_id} (delete_pipeline)", () => {
		it("requires pipelineId matching SDK DeletePipelineRequest.pipelineId", () => {
			const result = DeletePipelineParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});
	});

	// ── DNS Stage Contracts ────────────────────────────────────────────────

	describe("GET /edge-services/v1beta1/dns-stages (list_dns_stages)", () => {
		it("requires pipelineId matching SDK ListDNSStagesRequest.pipelineId", () => {
			const result = ListDNSStagesParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});

		it("accepts optional fqdn filter matching SDK ListDNSStagesRequest.fqdn", () => {
			const result = ListDNSStagesParams.parse({
				pipelineId: "pipe-123",
				fqdn: "cdn.example.com",
			});
			expect(result.fqdn).toBe("cdn.example.com");
		});

		it("accepts orderBy matching SDK ListDNSStagesRequestOrderBy", () => {
			for (const orderBy of ["created_at_asc", "created_at_desc"] as const) {
				const result = ListDNSStagesParams.parse({ pipelineId: "p", orderBy });
				expect(result.orderBy).toBe(orderBy);
			}
		});
	});

	describe("GET /edge-services/v1beta1/dns-stages/{dns_stage_id} (get_dns_stage)", () => {
		it("requires dnsStageId matching SDK GetDNSStageRequest.dnsStageId", () => {
			const result = GetDNSStageParams.parse({ dnsStageId: "dns-123" });
			expect(result.dnsStageId).toBe("dns-123");
		});
	});

	describe("POST /edge-services/v1beta1/dns-stages (create_dns_stage)", () => {
		it("requires pipelineId matching SDK CreateDNSStageRequest.pipelineId", () => {
			const result = CreateDNSStageParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});

		it("accepts optional fqdns matching SDK CreateDNSStageRequest.fqdns", () => {
			const result = CreateDNSStageParams.parse({
				pipelineId: "pipe-123",
				fqdns: ["cdn.example.com"],
			});
			expect(result.fqdns).toEqual(["cdn.example.com"]);
		});

		it("accepts one-of next stage IDs matching SDK CreateDNSStageRequest", () => {
			const r1 = CreateDNSStageParams.parse({
				pipelineId: "p",
				tlsStageId: "tls-1",
			});
			expect(r1.tlsStageId).toBe("tls-1");

			const r2 = CreateDNSStageParams.parse({
				pipelineId: "p",
				cacheStageId: "cache-1",
			});
			expect(r2.cacheStageId).toBe("cache-1");

			const r3 = CreateDNSStageParams.parse({
				pipelineId: "p",
				backendStageId: "be-1",
			});
			expect(r3.backendStageId).toBe("be-1");
		});
	});

	describe("PATCH /edge-services/v1beta1/dns-stages/{dns_stage_id} (update_dns_stage)", () => {
		it("requires dnsStageId matching SDK UpdateDNSStageRequest.dnsStageId", () => {
			const result = UpdateDNSStageParams.parse({ dnsStageId: "dns-123" });
			expect(result.dnsStageId).toBe("dns-123");
		});

		it("accepts optional fqdns and next stage IDs", () => {
			const result = UpdateDNSStageParams.parse({
				dnsStageId: "dns-123",
				fqdns: ["new.example.com"],
				tlsStageId: "tls-1",
			});
			expect(result.fqdns).toEqual(["new.example.com"]);
		});
	});

	describe("DELETE /edge-services/v1beta1/dns-stages/{dns_stage_id} (delete_dns_stage)", () => {
		it("requires dnsStageId matching SDK DeleteDNSStageRequest.dnsStageId", () => {
			const result = DeleteDNSStageParams.parse({ dnsStageId: "dns-123" });
			expect(result.dnsStageId).toBe("dns-123");
		});
	});

	// ── TLS Stage Contracts ────────────────────────────────────────────────

	describe("GET /edge-services/v1beta1/tls-stages (list_tls_stages)", () => {
		it("requires pipelineId matching SDK ListTLSStagesRequest.pipelineId", () => {
			const result = ListTLSStagesParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});

		it("accepts optional secretId and secretRegion filters", () => {
			const result = ListTLSStagesParams.parse({
				pipelineId: "pipe-123",
				secretId: "secret-1",
				secretRegion: "fr-par",
			});
			expect(result.secretId).toBe("secret-1");
			expect(result.secretRegion).toBe("fr-par");
		});
	});

	describe("GET /edge-services/v1beta1/tls-stages/{tls_stage_id} (get_tls_stage)", () => {
		it("requires tlsStageId matching SDK GetTLSStageRequest.tlsStageId", () => {
			const result = GetTLSStageParams.parse({ tlsStageId: "tls-123" });
			expect(result.tlsStageId).toBe("tls-123");
		});
	});

	describe("POST /edge-services/v1beta1/tls-stages (create_tls_stage)", () => {
		it("requires pipelineId matching SDK CreateTLSStageRequest.pipelineId", () => {
			const result = CreateTLSStageParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});

		it("accepts managedCertificate matching SDK CreateTLSStageRequest.managedCertificate", () => {
			const result = CreateTLSStageParams.parse({
				pipelineId: "pipe-123",
				managedCertificate: true,
			});
			expect(result.managedCertificate).toBe(true);
		});

		it("accepts secrets array matching SDK CreateTLSStageRequest.secrets shape", () => {
			const result = CreateTLSStageParams.parse({
				pipelineId: "pipe-123",
				secrets: [{ secretId: "s-1", region: "fr-par" }],
			});
			expect(result.secrets?.[0].secretId).toBe("s-1");
			expect(result.secrets?.[0].region).toBe("fr-par");
		});

		it("accepts one-of next stage IDs matching SDK CreateTLSStageRequest", () => {
			const result = CreateTLSStageParams.parse({
				pipelineId: "p",
				cacheStageId: "c-1",
				backendStageId: "b-1",
				routeStageId: "r-1",
				wafStageId: "w-1",
			});
			expect(result.cacheStageId).toBe("c-1");
		});
	});

	describe("PATCH /edge-services/v1beta1/tls-stages/{tls_stage_id} (update_tls_stage)", () => {
		it("requires tlsStageId matching SDK UpdateTLSStageRequest.tlsStageId", () => {
			const result = UpdateTLSStageParams.parse({ tlsStageId: "tls-123" });
			expect(result.tlsStageId).toBe("tls-123");
		});

		it("accepts tlsSecretsConfig matching SDK UpdateTLSStageRequest.tlsSecretsConfig", () => {
			const result = UpdateTLSStageParams.parse({
				tlsStageId: "tls-123",
				tlsSecretsConfig: {
					tlsSecrets: [{ secretId: "s-1", region: "fr-par" }],
				},
			});
			expect(result.tlsSecretsConfig?.tlsSecrets[0].secretId).toBe("s-1");
		});
	});

	describe("DELETE /edge-services/v1beta1/tls-stages/{tls_stage_id} (delete_tls_stage)", () => {
		it("requires tlsStageId matching SDK DeleteTLSStageRequest.tlsStageId", () => {
			const result = DeleteTLSStageParams.parse({ tlsStageId: "tls-123" });
			expect(result.tlsStageId).toBe("tls-123");
		});
	});

	// ── Cache Stage Contracts ──────────────────────────────────────────────

	describe("GET /edge-services/v1beta1/cache-stages (list_cache_stages)", () => {
		it("requires pipelineId matching SDK ListCacheStagesRequest.pipelineId", () => {
			const result = ListCacheStagesParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});
	});

	describe("GET /edge-services/v1beta1/cache-stages/{cache_stage_id} (get_cache_stage)", () => {
		it("requires cacheStageId matching SDK GetCacheStageRequest.cacheStageId", () => {
			const result = GetCacheStageParams.parse({ cacheStageId: "cache-123" });
			expect(result.cacheStageId).toBe("cache-123");
		});
	});

	describe("POST /edge-services/v1beta1/cache-stages (create_cache_stage)", () => {
		it("requires pipelineId matching SDK CreateCacheStageRequest.pipelineId", () => {
			const result = CreateCacheStageParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});

		it("accepts fallbackTtl matching SDK CreateCacheStageRequest.fallbackTtl", () => {
			const result = CreateCacheStageParams.parse({
				pipelineId: "pipe-123",
				fallbackTtl: "3600",
			});
			expect(result.fallbackTtl).toBe("3600");
		});

		it("accepts includeCookies matching SDK CreateCacheStageRequest.includeCookies", () => {
			const result = CreateCacheStageParams.parse({
				pipelineId: "pipe-123",
				includeCookies: true,
			});
			expect(result.includeCookies).toBe(true);
		});

		it("accepts one-of next stage IDs", () => {
			const result = CreateCacheStageParams.parse({
				pipelineId: "p",
				backendStageId: "b-1",
				wafStageId: "w-1",
				routeStageId: "r-1",
			});
			expect(result.backendStageId).toBe("b-1");
		});
	});

	describe("PATCH /edge-services/v1beta1/cache-stages/{cache_stage_id} (update_cache_stage)", () => {
		it("requires cacheStageId matching SDK UpdateCacheStageRequest.cacheStageId", () => {
			const result = UpdateCacheStageParams.parse({ cacheStageId: "cache-123" });
			expect(result.cacheStageId).toBe("cache-123");
		});
	});

	describe("DELETE /edge-services/v1beta1/cache-stages/{cache_stage_id} (delete_cache_stage)", () => {
		it("requires cacheStageId matching SDK DeleteCacheStageRequest.cacheStageId", () => {
			const result = DeleteCacheStageParams.parse({ cacheStageId: "cache-123" });
			expect(result.cacheStageId).toBe("cache-123");
		});
	});

	// ── Backend Stage Contracts ────────────────────────────────────────────

	describe("GET /edge-services/v1beta1/backend-stages (list_backend_stages)", () => {
		it("requires pipelineId matching SDK ListBackendStagesRequest.pipelineId", () => {
			const result = ListBackendStagesParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});

		it("accepts optional bucket and LB filters matching SDK request", () => {
			const result = ListBackendStagesParams.parse({
				pipelineId: "pipe-123",
				bucketName: "my-bucket",
				bucketRegion: "fr-par",
				lbId: "lb-123",
			});
			expect(result.bucketName).toBe("my-bucket");
			expect(result.lbId).toBe("lb-123");
		});
	});

	describe("GET /edge-services/v1beta1/backend-stages/{backend_stage_id} (get_backend_stage)", () => {
		it("requires backendStageId matching SDK GetBackendStageRequest.backendStageId", () => {
			const result = GetBackendStageParams.parse({ backendStageId: "be-123" });
			expect(result.backendStageId).toBe("be-123");
		});
	});

	describe("POST /edge-services/v1beta1/backend-stages (create_backend_stage)", () => {
		it("requires pipelineId matching SDK CreateBackendStageRequest.pipelineId", () => {
			const result = CreateBackendStageParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});

		it("accepts scalewayS3 matching SDK CreateBackendStageRequest.scalewayS3 shape", () => {
			const result = CreateBackendStageParams.parse({
				pipelineId: "pipe-123",
				scalewayS3: {
					bucketName: "my-bucket",
					bucketRegion: "fr-par",
					isWebsite: false,
				},
			});
			expect(result.scalewayS3?.bucketName).toBe("my-bucket");
		});

		it("accepts scalewayLb matching SDK CreateBackendStageRequest.scalewayLb shape", () => {
			const result = CreateBackendStageParams.parse({
				pipelineId: "pipe-123",
				scalewayLb: {
					lbs: [
						{
							id: "lb-1",
							zone: "fr-par-1",
							frontendId: "fe-1",
							isSsl: true,
							domainName: "lb.example.com",
							hasWebsocket: false,
						},
					],
				},
			});
			expect(result.scalewayLb?.lbs[0].id).toBe("lb-1");
			expect(result.scalewayLb?.lbs[0].isSsl).toBe(true);
		});
	});

	describe("PATCH /edge-services/v1beta1/backend-stages/{backend_stage_id} (update_backend_stage)", () => {
		it("requires backendStageId and pipelineId matching SDK UpdateBackendStageRequest", () => {
			const result = UpdateBackendStageParams.parse({
				backendStageId: "be-123",
				pipelineId: "pipe-123",
			});
			expect(result.backendStageId).toBe("be-123");
			expect(result.pipelineId).toBe("pipe-123");
		});
	});

	describe("DELETE /edge-services/v1beta1/backend-stages/{backend_stage_id} (delete_backend_stage)", () => {
		it("requires backendStageId matching SDK DeleteBackendStageRequest.backendStageId", () => {
			const result = DeleteBackendStageParams.parse({ backendStageId: "be-123" });
			expect(result.backendStageId).toBe("be-123");
		});
	});

	// ── Purge Request Contracts ────────────────────────────────────────────

	describe("POST /edge-services/v1beta1/purge-requests (purge_cache)", () => {
		it("requires pipelineId matching SDK CreatePurgeRequestRequest.pipelineId", () => {
			const result = CreatePurgeRequestParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});

		it("accepts assets matching SDK CreatePurgeRequestRequest.assets", () => {
			const result = CreatePurgeRequestParams.parse({
				pipelineId: "pipe-123",
				assets: ["/css/style.css", "/js/app.js"],
			});
			expect(result.assets).toEqual(["/css/style.css", "/js/app.js"]);
		});

		it("accepts all flag matching SDK CreatePurgeRequestRequest.all", () => {
			const result = CreatePurgeRequestParams.parse({
				pipelineId: "pipe-123",
				all: true,
			});
			expect(result.all).toBe(true);
		});
	});

	describe("GET /edge-services/v1beta1/purge-requests (list_purge_requests)", () => {
		it("accepts optional pipelineId matching SDK ListPurgeRequestsRequest.pipelineId", () => {
			const result = ListPurgeRequestsParams.parse({ pipelineId: "pipe-123" });
			expect(result.pipelineId).toBe("pipe-123");
		});

		it("accepts optional projectId matching SDK ListPurgeRequestsRequest.projectId", () => {
			const result = ListPurgeRequestsParams.parse({ projectId: "proj-123" });
			expect(result.projectId).toBe("proj-123");
		});

		it("accepts orderBy matching SDK ListPurgeRequestsRequestOrderBy", () => {
			for (const orderBy of ["created_at_asc", "created_at_desc"] as const) {
				const result = ListPurgeRequestsParams.parse({ orderBy });
				expect(result.orderBy).toBe(orderBy);
			}
		});
	});

	describe("GET /edge-services/v1beta1/purge-requests/{purge_request_id} (get_purge_request)", () => {
		it("requires purgeRequestId matching SDK GetPurgeRequestRequest.purgeRequestId", () => {
			const result = GetPurgeRequestParams.parse({ purgeRequestId: "purge-123" });
			expect(result.purgeRequestId).toBe("purge-123");
		});
	});
});

// ── Wire contract: pagination reaches the Scaleway API ───────────────────
// specs/scaleway-api/edge-services/api-reference.md — every list endpoint
// takes `page` and `page_size` (SDK `page` / `pageSize`). The handlers must
// hand the SDK camelCase `pageSize` so it is marshalled to `page_size`.

describe("contract: list endpoints marshal page/page_size to the wire", () => {
	const PIPELINE_ID = "11111111-1111-1111-1111-111111111111";
	const emptyStages = { stages: [], totalCount: 0 };

	it("GET /edge-services/v1beta1/pipelines", async () => {
		mockFetch.mockResolvedValueOnce({ pipelines: [], totalCount: 0 });
		await handleListPipelines({ page: 3, pageSize: 7, name: "cdn" });
		const request = lastRequest();
		expect(request.method).toBe("GET");
		expect(request.path).toBe("/edge-services/v1beta1/pipelines");
		expect(request.urlParams).toBeInstanceOf(URLSearchParams);
		expect(request.urlParams.get("page")).toBe("3");
		expect(request.urlParams.get("page_size")).toBe("7");
		expect(request.urlParams.get("name")).toBe("cdn");
	});

	it("GET /edge-services/v1beta1/pipelines/{pipeline_id}/dns-stages", async () => {
		mockFetch.mockResolvedValueOnce(emptyStages);
		await handleListDNSStages({ pipelineId: PIPELINE_ID, page: 2, pageSize: 5 });
		const request = lastRequest();
		expect(request.path).toBe(`/edge-services/v1beta1/pipelines/${PIPELINE_ID}/dns-stages`);
		expect(request.urlParams.get("page")).toBe("2");
		expect(request.urlParams.get("page_size")).toBe("5");
	});

	it("GET /edge-services/v1beta1/pipelines/{pipeline_id}/tls-stages", async () => {
		mockFetch.mockResolvedValueOnce(emptyStages);
		await handleListTLSStages({ pipelineId: PIPELINE_ID, page: 2, pageSize: 6 });
		const request = lastRequest();
		expect(request.path).toBe(`/edge-services/v1beta1/pipelines/${PIPELINE_ID}/tls-stages`);
		expect(request.urlParams.get("page")).toBe("2");
		expect(request.urlParams.get("page_size")).toBe("6");
	});

	it("GET /edge-services/v1beta1/pipelines/{pipeline_id}/cache-stages", async () => {
		mockFetch.mockResolvedValueOnce(emptyStages);
		await handleListCacheStages({ pipelineId: PIPELINE_ID, page: 4, pageSize: 8 });
		const request = lastRequest();
		expect(request.path).toBe(`/edge-services/v1beta1/pipelines/${PIPELINE_ID}/cache-stages`);
		expect(request.urlParams.get("page")).toBe("4");
		expect(request.urlParams.get("page_size")).toBe("8");
	});

	it("GET /edge-services/v1beta1/pipelines/{pipeline_id}/backend-stages", async () => {
		mockFetch.mockResolvedValueOnce(emptyStages);
		await handleListBackendStages({ pipelineId: PIPELINE_ID, page: 2, pageSize: 4 });
		const request = lastRequest();
		expect(request.path).toBe(`/edge-services/v1beta1/pipelines/${PIPELINE_ID}/backend-stages`);
		expect(request.urlParams.get("page")).toBe("2");
		expect(request.urlParams.get("page_size")).toBe("4");
	});

	it("GET /edge-services/v1beta1/purge-requests", async () => {
		mockFetch.mockResolvedValueOnce({ purgeRequests: [], totalCount: 0 });
		await handleListPurgeRequests({ page: 6, pageSize: 12, pipelineId: PIPELINE_ID });
		const request = lastRequest();
		expect(request.path).toBe("/edge-services/v1beta1/purge-requests");
		expect(request.urlParams.get("page")).toBe("6");
		expect(request.urlParams.get("page_size")).toBe("12");
		expect(request.urlParams.get("pipeline_id")).toBe(PIPELINE_ID);
	});
});
