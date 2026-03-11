/**
 * Contract tests for Scaleway Serverless Containers API
 *
 * Validates request shapes, response shapes, pagination, auth, and error codes
 * against the Scaleway Containers API v1beta1.
 *
 * API Reference: https://www.scaleway.com/en/developers/api/serverless-containers/
 * Spec: specs/scaleway-api/
 * Parity Matrix: tests/parity-matrix.json#containers
 */
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleCreateContainer,
	handleCreateCron,
	handleCreateDomain,
	handleCreateNamespace,
	handleCreateToken,
	handleDeleteContainer,
	handleDeleteCron,
	handleDeleteDomain,
	handleDeleteNamespace,
	handleDeleteToken,
	handleDeployContainer,
	handleGetContainer,
	handleGetNamespace,
	handleListContainers,
	handleListCrons,
	handleListDomains,
	handleListNamespaces,
	handleUpdateContainer,
	handleUpdateCron,
	handleUpdateNamespace,
} from "../../../src/tools/containers/handlers.js";

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "00000000-0000-0000-0000-000000000000",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({}),
}));

const BASE_URL = "https://api.scaleway.com/containers/v1beta1/regions/fr-par";
const UUID = "00000000-0000-0000-0000-000000000001";

let mockFetch: Mock;

beforeEach(() => {
	mockFetch = vi.fn();
	vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
	vi.restoreAllMocks();
});

interface HandlerResult {
	content: { type: string; text: string }[];
	isError?: boolean;
}

function parseContent(result: HandlerResult) {
	return JSON.parse(result.content[0].text);
}

function mockOk(body: unknown) {
	return { ok: true, status: 200, text: async () => JSON.stringify(body) };
}

function mockErr(status: number) {
	return { ok: false, status, text: async () => `{"message":"error","type":"test"}` };
}

describe("Containers API Contract Tests", () => {
	// ─── Namespace Contracts ────────────────────────────────────────
	// Endpoint: GET /containers/v1beta1/regions/{region}/namespaces

	describe("ListNamespaces contract", () => {
		it("sends GET to /namespaces with pagination query params", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ namespaces: [], total_count: 0 }));

			await handleListNamespaces({ page: 2, pageSize: 25 });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/namespaces?page=2&page_size=25`);
			expect(opts.method).toBe("GET");
		});

		it("response shape contains items, totalCount, page, pageSize", async () => {
			mockFetch.mockResolvedValueOnce(
				mockOk({
					namespaces: [{ id: UUID, name: "ns1", status: "ready" }],
					total_count: 1,
				}),
			);

			const result = await handleListNamespaces({ page: 1, pageSize: 50 });
			const data = parseContent(result);
			expect(data).toHaveProperty("items");
			expect(data).toHaveProperty("totalCount");
			expect(data).toHaveProperty("page");
			expect(data).toHaveProperty("pageSize");
		});

		it("returns error response on 401", async () => {
			mockFetch.mockResolvedValueOnce(mockErr(401));

			const result = (await handleListNamespaces({ page: 1, pageSize: 50 })) as HandlerResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("permission_denied");
			expect(data.error.statusCode).toBe(401);
		});
	});

	// Endpoint: GET /containers/v1beta1/regions/{region}/namespaces/{namespace_id}
	describe("GetNamespace contract", () => {
		it("sends GET to /namespaces/{id}", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ id: UUID }));

			await handleGetNamespace({ namespaceId: UUID });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/namespaces/${UUID}`);
			expect(opts.method).toBe("GET");
		});

		it("returns 404 on not found", async () => {
			mockFetch.mockResolvedValueOnce(mockErr(404));

			const result = (await handleGetNamespace({ namespaceId: UUID })) as HandlerResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("not_found");
		});
	});

	// Endpoint: POST /containers/v1beta1/regions/{region}/namespaces
	describe("CreateNamespace contract", () => {
		it("sends POST to /namespaces with snake_case body", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ id: UUID }));

			await handleCreateNamespace({
				name: "ns1",
				projectId: UUID,
				description: "test",
				environmentVariables: { KEY: "val" },
				secretEnvironmentVariables: [{ key: "S", value: "v" }],
			});

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/namespaces`);
			expect(opts.method).toBe("POST");
			const body = JSON.parse(opts.body);
			expect(body).toHaveProperty("name", "ns1");
			expect(body).toHaveProperty("project_id", UUID);
			expect(body).toHaveProperty("environment_variables");
			expect(body).toHaveProperty("secret_environment_variables");
		});

		it("returns error on 400", async () => {
			mockFetch.mockResolvedValueOnce(mockErr(400));

			const result = (await handleCreateNamespace({ name: "ns1" })) as HandlerResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("invalid_input");
		});
	});

	// Endpoint: PATCH /containers/v1beta1/regions/{region}/namespaces/{namespace_id}
	describe("UpdateNamespace contract", () => {
		it("sends PATCH to /namespaces/{id} with snake_case body", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ id: UUID }));

			await handleUpdateNamespace({
				namespaceId: UUID,
				description: "updated",
				environmentVariables: { NEW: "val" },
			});

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/namespaces/${UUID}`);
			expect(opts.method).toBe("PATCH");
			const body = JSON.parse(opts.body);
			expect(body).toHaveProperty("description", "updated");
			expect(body).toHaveProperty("environment_variables");
			expect(body).not.toHaveProperty("namespace_id");
		});
	});

	// Endpoint: DELETE /containers/v1beta1/regions/{region}/namespaces/{namespace_id}
	describe("DeleteNamespace contract", () => {
		it("sends DELETE to /namespaces/{id}", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({}));

			await handleDeleteNamespace({ namespaceId: UUID });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/namespaces/${UUID}`);
			expect(opts.method).toBe("DELETE");
		});
	});

	// ─── Container Contracts ────────────────────────────────────────
	// Endpoint: GET /containers/v1beta1/regions/{region}/containers

	describe("ListContainers contract", () => {
		it("sends GET to /containers with namespace_id and pagination", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ containers: [], total_count: 0 }));

			await handleListContainers({ namespaceId: UUID, page: 1, pageSize: 20 });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`${BASE_URL}/containers?`);
			expect(url).toContain(`namespace_id=${UUID}`);
			expect(url).toContain("page=1");
			expect(url).toContain("page_size=20");
			expect(opts.method).toBe("GET");
		});

		it("response shape has paginated items", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ containers: [{ id: UUID }], total_count: 1 }));

			const result = await handleListContainers({
				namespaceId: UUID,
				page: 1,
				pageSize: 50,
			});
			const data = parseContent(result);
			expect(data.items).toBeInstanceOf(Array);
			expect(data.totalCount).toBe(1);
		});
	});

	// Endpoint: GET /containers/v1beta1/regions/{region}/containers/{container_id}
	describe("GetContainer contract", () => {
		it("sends GET to /containers/{id}", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ id: UUID }));

			await handleGetContainer({ containerId: UUID });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/containers/${UUID}`);
			expect(opts.method).toBe("GET");
		});
	});

	// Endpoint: POST /containers/v1beta1/regions/{region}/containers
	describe("CreateContainer contract", () => {
		it("sends POST to /containers with snake_case body", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ id: UUID }));

			await handleCreateContainer({
				namespaceId: UUID,
				name: "web",
				registryImage: "rg.fr-par.scw.cloud/ns/img:latest",
				port: 8080,
				minScale: 0,
				maxScale: 10,
				memoryLimit: 256,
				cpuLimit: 140,
				timeout: "300s",
				privacy: "public",
				protocol: "http1",
				httpOption: "enabled",
				description: "web app",
				environmentVariables: { NODE_ENV: "production" },
				secretEnvironmentVariables: [{ key: "DB", value: "pass" }],
			});

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/containers`);
			expect(opts.method).toBe("POST");
			const body = JSON.parse(opts.body);
			expect(body.namespace_id).toBe(UUID);
			expect(body.registry_image).toBe("rg.fr-par.scw.cloud/ns/img:latest");
			expect(body.port).toBe(8080);
			expect(body.min_scale).toBe(0);
			expect(body.max_scale).toBe(10);
			expect(body.memory_limit).toBe(256);
			expect(body.cpu_limit).toBe(140);
			expect(body.timeout).toBe("300s");
			expect(body.privacy).toBe("public");
			expect(body.protocol).toBe("http1");
			expect(body.http_option).toBe("enabled");
			expect(body.environment_variables).toEqual({ NODE_ENV: "production" });
			expect(body.secret_environment_variables).toEqual([{ key: "DB", value: "pass" }]);
		});
	});

	// Endpoint: PATCH /containers/v1beta1/regions/{region}/containers/{container_id}
	describe("UpdateContainer contract", () => {
		it("sends PATCH to /containers/{id} with snake_case body", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ id: UUID }));

			await handleUpdateContainer({
				containerId: UUID,
				memoryLimit: 1024,
				maxScale: 20,
				privacy: "private",
			});

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/containers/${UUID}`);
			expect(opts.method).toBe("PATCH");
			const body = JSON.parse(opts.body);
			expect(body.memory_limit).toBe(1024);
			expect(body.max_scale).toBe(20);
			expect(body.privacy).toBe("private");
			expect(body).not.toHaveProperty("container_id");
		});
	});

	// Endpoint: DELETE /containers/v1beta1/regions/{region}/containers/{container_id}
	describe("DeleteContainer contract", () => {
		it("sends DELETE to /containers/{id}", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({}));

			await handleDeleteContainer({ containerId: UUID });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/containers/${UUID}`);
			expect(opts.method).toBe("DELETE");
		});
	});

	// Endpoint: POST /containers/v1beta1/regions/{region}/containers/{container_id}/deploy
	describe("DeployContainer contract", () => {
		it("sends POST to /containers/{id}/deploy", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ id: UUID, status: "deploying" }));

			await handleDeployContainer({ containerId: UUID });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/containers/${UUID}/deploy`);
			expect(opts.method).toBe("POST");
		});
	});

	// ─── Cron Contracts ─────────────────────────────────────────────
	// Endpoint: GET /containers/v1beta1/regions/{region}/crons

	describe("ListCrons contract", () => {
		it("sends GET to /crons with container_id and pagination", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ crons: [], total_count: 0 }));

			await handleListCrons({ containerId: UUID, page: 1, pageSize: 10 });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`${BASE_URL}/crons?`);
			expect(url).toContain(`container_id=${UUID}`);
			expect(url).toContain("page=1");
			expect(url).toContain("page_size=10");
			expect(opts.method).toBe("GET");
		});
	});

	// Endpoint: POST /containers/v1beta1/regions/{region}/crons
	describe("CreateCron contract", () => {
		it("sends POST to /crons with snake_case body", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ id: UUID }));

			await handleCreateCron({
				containerId: UUID,
				schedule: "0 * * * *",
				args: { payload: "test" },
				name: "hourly",
			});

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/crons`);
			expect(opts.method).toBe("POST");
			const body = JSON.parse(opts.body);
			expect(body.container_id).toBe(UUID);
			expect(body.schedule).toBe("0 * * * *");
			expect(body.args).toEqual({ payload: "test" });
		});
	});

	// Endpoint: PATCH /containers/v1beta1/regions/{region}/crons/{cron_id}
	describe("UpdateCron contract", () => {
		it("sends PATCH to /crons/{id}", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ id: UUID }));

			await handleUpdateCron({
				cronId: UUID,
				schedule: "*/5 * * * *",
				name: "every-5-min",
			});

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/crons/${UUID}`);
			expect(opts.method).toBe("PATCH");
			const body = JSON.parse(opts.body);
			expect(body.schedule).toBe("*/5 * * * *");
			expect(body).not.toHaveProperty("cron_id");
		});
	});

	// Endpoint: DELETE /containers/v1beta1/regions/{region}/crons/{cron_id}
	describe("DeleteCron contract", () => {
		it("sends DELETE to /crons/{id}", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({}));

			await handleDeleteCron({ cronId: UUID });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/crons/${UUID}`);
			expect(opts.method).toBe("DELETE");
		});
	});

	// ─── Domain Contracts ───────────────────────────────────────────
	// Endpoint: GET /containers/v1beta1/regions/{region}/domains

	describe("ListDomains contract", () => {
		it("sends GET to /domains with container_id and pagination", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ domains: [], total_count: 0 }));

			await handleListDomains({ containerId: UUID, page: 1, pageSize: 50 });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`${BASE_URL}/domains?`);
			expect(url).toContain(`container_id=${UUID}`);
			expect(opts.method).toBe("GET");
		});
	});

	// Endpoint: POST /containers/v1beta1/regions/{region}/domains
	describe("CreateDomain contract", () => {
		it("sends POST to /domains with snake_case body", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ id: UUID }));

			await handleCreateDomain({
				containerId: UUID,
				hostname: "app.example.com",
			});

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/domains`);
			expect(opts.method).toBe("POST");
			const body = JSON.parse(opts.body);
			expect(body.container_id).toBe(UUID);
			expect(body.hostname).toBe("app.example.com");
		});
	});

	// Endpoint: DELETE /containers/v1beta1/regions/{region}/domains/{domain_id}
	describe("DeleteDomain contract", () => {
		it("sends DELETE to /domains/{id}", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({}));

			await handleDeleteDomain({ domainId: UUID });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/domains/${UUID}`);
			expect(opts.method).toBe("DELETE");
		});
	});

	// ─── Token Contracts ────────────────────────────────────────────
	// Endpoint: POST /containers/v1beta1/regions/{region}/tokens

	describe("CreateToken contract", () => {
		it("sends POST to /tokens with snake_case body", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ id: UUID, token: "xxx" }));

			await handleCreateToken({
				containerId: UUID,
				description: "api token",
				expiresAt: "2026-12-31T23:59:59Z",
			});

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/tokens`);
			expect(opts.method).toBe("POST");
			const body = JSON.parse(opts.body);
			expect(body.container_id).toBe(UUID);
			expect(body.description).toBe("api token");
			expect(body.expires_at).toBe("2026-12-31T23:59:59Z");
		});
	});

	// Endpoint: DELETE /containers/v1beta1/regions/{region}/tokens/{token_id}
	describe("DeleteToken contract", () => {
		it("sends DELETE to /tokens/{id}", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({}));

			await handleDeleteToken({ tokenId: UUID });

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toBe(`${BASE_URL}/tokens/${UUID}`);
			expect(opts.method).toBe("DELETE");
		});
	});

	// ─── Auth contract ──────────────────────────────────────────────

	describe("Auth contract", () => {
		it("includes Content-Type header", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ namespaces: [], total_count: 0 }));

			await handleListNamespaces({ page: 1, pageSize: 50 });

			const opts = mockFetch.mock.calls[0][1];
			expect(opts.headers["Content-Type"]).toBe("application/json");
		});
	});

	// ─── Region routing contract ────────────────────────────────────

	describe("Region routing contract", () => {
		it("uses default region (fr-par) when not specified", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ namespaces: [], total_count: 0 }));

			await handleListNamespaces({ page: 1, pageSize: 50 });

			const url = mockFetch.mock.calls[0][0];
			expect(url).toContain("/regions/fr-par/");
		});

		it("uses custom region when specified", async () => {
			mockFetch.mockResolvedValueOnce(mockOk({ namespaces: [], total_count: 0 }));

			await handleListNamespaces({ page: 1, pageSize: 50, region: "nl-ams" });

			const url = mockFetch.mock.calls[0][0];
			expect(url).toContain("/regions/nl-ams/");
		});
	});
});
