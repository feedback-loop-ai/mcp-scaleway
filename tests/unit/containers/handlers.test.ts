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

// Mock the shared modules
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

const UUID1 = "00000000-0000-0000-0000-000000000001";
const UUID2 = "00000000-0000-0000-0000-000000000002";

let mockFetch: Mock;

function mockOkResponse(body: unknown) {
	return {
		ok: true,
		status: 200,
		text: async () => JSON.stringify(body),
	};
}

function mockErrorResponse(status: number, message: string) {
	return {
		ok: false,
		status,
		text: async () => message,
	};
}

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

async function expectError(promise: Promise<unknown>) {
	const result = (await promise) as HandlerResult;
	expect(result.isError).toBe(true);
	return result;
}

describe("containers/handlers", () => {
	// ─── Namespace Handlers ─────────────────────────────────────────

	describe("handleListNamespaces", () => {
		it("returns paginated namespaces", async () => {
			mockFetch.mockResolvedValueOnce(
				mockOkResponse({ namespaces: [{ id: UUID1, name: "ns1" }], total_count: 1 }),
			);

			const result = await handleListNamespaces({ page: 1, pageSize: 50 });
			const data = parseContent(result);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
			expect(data.page).toBe(1);
			expect(data.pageSize).toBe(50);
		});

		it("passes name filter in query", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ namespaces: [], total_count: 0 }));

			await handleListNamespaces({ page: 1, pageSize: 50, name: "test" });
			const url = mockFetch.mock.calls[0][0] as string;
			expect(url).toContain("name=test");
		});

		it("passes projectId filter", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ namespaces: [], total_count: 0 }));

			await handleListNamespaces({ page: 1, pageSize: 50, projectId: UUID1 });
			const url = mockFetch.mock.calls[0][0] as string;
			expect(url).toContain(`project_id=${UUID1}`);
		});

		it("passes organizationId filter", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ namespaces: [], total_count: 0 }));

			await handleListNamespaces({ page: 1, pageSize: 50, organizationId: UUID2 });
			const url = mockFetch.mock.calls[0][0] as string;
			expect(url).toContain(`organization_id=${UUID2}`);
		});

		it("uses custom region", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ namespaces: [], total_count: 0 }));

			await handleListNamespaces({ page: 1, pageSize: 50, region: "nl-ams" });
			const url = mockFetch.mock.calls[0][0] as string;
			expect(url).toContain("/regions/nl-ams/");
		});

		it("returns error on API failure", async () => {
			mockFetch.mockResolvedValueOnce(mockErrorResponse(403, "Forbidden"));

			const result = (await handleListNamespaces({ page: 1, pageSize: 50 })) as HandlerResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetNamespace", () => {
		it("returns namespace details", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1, name: "ns1", status: "ready" }));

			const result = await handleGetNamespace({ namespaceId: UUID1 });
			const data = parseContent(result);
			expect(data.id).toBe(UUID1);
		});

		it("returns 404 error", async () => {
			mockFetch.mockResolvedValueOnce(mockErrorResponse(404, "Not found"));

			const result = (await handleGetNamespace({ namespaceId: UUID1 })) as HandlerResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateNamespace", () => {
		it("creates namespace with required fields", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1, name: "ns1" }));

			const result = await handleCreateNamespace({ name: "ns1" });
			const data = parseContent(result);
			expect(data.id).toBe(UUID1);

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain("/namespaces");
			expect(opts.method).toBe("POST");
			expect(JSON.parse(opts.body)).toEqual({ name: "ns1" });
		});

		it("sends snake_case body", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1 }));

			await handleCreateNamespace({
				name: "ns1",
				projectId: UUID1,
				environmentVariables: { FOO: "bar" },
			});

			const body = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(body.project_id).toBe(UUID1);
			expect(body.environment_variables).toEqual({ FOO: "bar" });
		});
	});

	describe("handleUpdateNamespace", () => {
		it("updates namespace", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1, description: "updated" }));

			const result = await handleUpdateNamespace({
				namespaceId: UUID1,
				description: "updated",
			});
			const data = parseContent(result);
			expect(data.description).toBe("updated");

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`/namespaces/${UUID1}`);
			expect(opts.method).toBe("PATCH");
		});

		it("strips undefined values from body", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1 }));

			await handleUpdateNamespace({
				namespaceId: UUID1,
				description: undefined,
				environmentVariables: undefined,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(body).not.toHaveProperty("description");
			expect(body).not.toHaveProperty("environment_variables");
		});
	});

	describe("handleDeleteNamespace", () => {
		it("deletes namespace", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({}));

			const result = await handleDeleteNamespace({ namespaceId: UUID1 });
			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`/namespaces/${UUID1}`);
			expect(opts.method).toBe("DELETE");
			expect(result.content).toBeDefined();
		});
	});

	// ─── Container Handlers ─────────────────────────────────────────

	describe("handleListContainers", () => {
		it("returns paginated containers", async () => {
			mockFetch.mockResolvedValueOnce(
				mockOkResponse({ containers: [{ id: UUID1 }], total_count: 1 }),
			);

			const result = await handleListContainers({
				namespaceId: UUID1,
				page: 1,
				pageSize: 50,
			});
			const data = parseContent(result);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
		});

		it("passes namespace_id and name filter", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ containers: [], total_count: 0 }));

			await handleListContainers({
				namespaceId: UUID1,
				name: "web",
				page: 1,
				pageSize: 50,
			});
			const url = mockFetch.mock.calls[0][0] as string;
			expect(url).toContain(`namespace_id=${UUID1}`);
			expect(url).toContain("name=web");
		});
	});

	describe("handleGetContainer", () => {
		it("returns container details", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1, name: "web", status: "ready" }));

			const result = await handleGetContainer({ containerId: UUID1 });
			const data = parseContent(result);
			expect(data.name).toBe("web");
		});
	});

	describe("handleCreateContainer", () => {
		it("creates container", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1, name: "web" }));

			const result = await handleCreateContainer({
				namespaceId: UUID1,
				name: "web",
				registryImage: "rg.fr-par.scw.cloud/ns/img:latest",
			});
			const data = parseContent(result);
			expect(data.id).toBe(UUID1);

			const body = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(body.namespace_id).toBe(UUID1);
			expect(body.registry_image).toBe("rg.fr-par.scw.cloud/ns/img:latest");
		});

		it("sends all optional fields as snake_case", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1 }));

			await handleCreateContainer({
				namespaceId: UUID1,
				name: "web",
				registryImage: "img",
				minScale: 1,
				maxScale: 10,
				memoryLimit: 512,
				cpuLimit: 1000,
				httpOption: "redirected",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(body.min_scale).toBe(1);
			expect(body.max_scale).toBe(10);
			expect(body.memory_limit).toBe(512);
			expect(body.cpu_limit).toBe(1000);
			expect(body.http_option).toBe("redirected");
		});
	});

	describe("handleUpdateContainer", () => {
		it("updates container", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1, memory_limit: 1024 }));

			const result = await handleUpdateContainer({
				containerId: UUID1,
				memoryLimit: 1024,
			});
			const data = parseContent(result);
			expect(data.memory_limit).toBe(1024);

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`/containers/${UUID1}`);
			expect(opts.method).toBe("PATCH");
		});
	});

	describe("handleDeleteContainer", () => {
		it("deletes container", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({}));

			await handleDeleteContainer({ containerId: UUID1 });
			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`/containers/${UUID1}`);
			expect(opts.method).toBe("DELETE");
		});
	});

	describe("handleDeployContainer", () => {
		it("deploys container", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1, status: "deploying" }));

			const result = await handleDeployContainer({ containerId: UUID1 });
			const data = parseContent(result);
			expect(data.status).toBe("deploying");

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`/containers/${UUID1}/deploy`);
			expect(opts.method).toBe("POST");
		});
	});

	// ─── Cron Handlers ──────────────────────────────────────────────

	describe("handleListCrons", () => {
		it("returns paginated crons", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ crons: [{ id: UUID1 }], total_count: 1 }));

			const result = await handleListCrons({
				containerId: UUID1,
				page: 1,
				pageSize: 50,
			});
			const data = parseContent(result);
			expect(data.items).toHaveLength(1);
		});

		it("passes container_id in query", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ crons: [], total_count: 0 }));

			await handleListCrons({ containerId: UUID1, page: 1, pageSize: 50 });
			const url = mockFetch.mock.calls[0][0] as string;
			expect(url).toContain(`container_id=${UUID1}`);
		});
	});

	describe("handleCreateCron", () => {
		it("creates cron", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1, schedule: "0 * * * *" }));

			const result = await handleCreateCron({
				containerId: UUID1,
				schedule: "0 * * * *",
			});
			const data = parseContent(result);
			expect(data.schedule).toBe("0 * * * *");

			const body = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(body.container_id).toBe(UUID1);
		});
	});

	describe("handleUpdateCron", () => {
		it("updates cron", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1, schedule: "*/5 * * * *" }));

			const result = await handleUpdateCron({
				cronId: UUID1,
				schedule: "*/5 * * * *",
			});
			const data = parseContent(result);
			expect(data.schedule).toBe("*/5 * * * *");

			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`/crons/${UUID1}`);
			expect(opts.method).toBe("PATCH");
		});
	});

	describe("handleDeleteCron", () => {
		it("deletes cron", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({}));

			await handleDeleteCron({ cronId: UUID1 });
			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`/crons/${UUID1}`);
			expect(opts.method).toBe("DELETE");
		});
	});

	// ─── Domain Handlers ────────────────────────────────────────────

	describe("handleListDomains", () => {
		it("returns paginated domains", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ domains: [{ id: UUID1 }], total_count: 1 }));

			const result = await handleListDomains({
				containerId: UUID1,
				page: 1,
				pageSize: 50,
			});
			const data = parseContent(result);
			expect(data.items).toHaveLength(1);
		});
	});

	describe("handleCreateDomain", () => {
		it("creates domain", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1, hostname: "app.example.com" }));

			const result = await handleCreateDomain({
				containerId: UUID1,
				hostname: "app.example.com",
			});
			const data = parseContent(result);
			expect(data.hostname).toBe("app.example.com");

			const body = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(body.container_id).toBe(UUID1);
		});
	});

	describe("handleDeleteDomain", () => {
		it("deletes domain", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({}));

			await handleDeleteDomain({ domainId: UUID1 });
			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`/domains/${UUID1}`);
			expect(opts.method).toBe("DELETE");
		});
	});

	// ─── Token Handlers ─────────────────────────────────────────────

	describe("handleCreateToken", () => {
		it("creates token with containerId", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1, token: "scw-token-xxx" }));

			const result = await handleCreateToken({
				containerId: UUID1,
				description: "test",
			});
			const data = parseContent(result);
			expect(data.token).toBe("scw-token-xxx");

			const body = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(body.container_id).toBe(UUID1);
		});

		it("creates token with namespaceId", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({ id: UUID1 }));

			await handleCreateToken({ namespaceId: UUID2 });
			const body = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(body.namespace_id).toBe(UUID2);
		});
	});

	describe("handleDeleteToken", () => {
		it("deletes token", async () => {
			mockFetch.mockResolvedValueOnce(mockOkResponse({}));

			await handleDeleteToken({ tokenId: UUID1 });
			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain(`/tokens/${UUID1}`);
			expect(opts.method).toBe("DELETE");
		});
	});

	// ─── Error handling ─────────────────────────────────────────────

	describe("error handling", () => {
		it("handles 400 errors", async () => {
			mockFetch.mockResolvedValueOnce(mockErrorResponse(400, "Bad request"));
			const result = await expectError(handleGetContainer({ containerId: UUID1 }));
			const data = parseContent(result);
			expect(data.error.type).toBe("invalid_input");
			expect(data.error.statusCode).toBe(400);
		});

		it("handles 401 errors", async () => {
			mockFetch.mockResolvedValueOnce(mockErrorResponse(401, "Unauthorized"));
			const result = await expectError(handleGetContainer({ containerId: UUID1 }));
			const data = parseContent(result);
			expect(data.error.type).toBe("permission_denied");
		});

		it("handles 404 errors", async () => {
			mockFetch.mockResolvedValueOnce(mockErrorResponse(404, "Not found"));
			const result = await expectError(handleGetContainer({ containerId: UUID1 }));
			const data = parseContent(result);
			expect(data.error.type).toBe("not_found");
		});

		it("handles 429 errors", async () => {
			mockFetch.mockResolvedValueOnce(mockErrorResponse(429, "Rate limited"));
			const result = await expectError(handleGetContainer({ containerId: UUID1 }));
			const data = parseContent(result);
			expect(data.error.type).toBe("rate_limited");
		});

		it("handles 500 errors", async () => {
			mockFetch.mockResolvedValueOnce(mockErrorResponse(500, "Server error"));
			const result = await expectError(handleGetContainer({ containerId: UUID1 }));
			const data = parseContent(result);
			expect(data.error.type).toBe("server_error");
		});

		it("handles network errors", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));
			await expectError(handleGetContainer({ containerId: UUID1 }));
		});

		it("handles non-Error throws", async () => {
			mockFetch.mockRejectedValueOnce("string error");
			await expectError(handleGetContainer({ containerId: UUID1 }));
		});

		it("handles empty response body", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 204,
				text: async () => "",
			});
			const result = await handleDeleteNamespace({ namespaceId: UUID1 });
			const data = parseContent(result as HandlerResult);
			expect(data).toEqual({});
		});

		// Cover catch blocks of every handler
		it("handleCreateNamespace error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleCreateNamespace({ name: "ns" }));
		});

		it("handleUpdateNamespace error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleUpdateNamespace({ namespaceId: UUID1 }));
		});

		it("handleDeleteNamespace error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleDeleteNamespace({ namespaceId: UUID1 }));
		});

		it("handleListContainers error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleListContainers({ namespaceId: UUID1, page: 1, pageSize: 50 }));
		});

		it("handleCreateContainer error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(
				handleCreateContainer({ namespaceId: UUID1, name: "c1", registryImage: "img" }),
			);
		});

		it("handleUpdateContainer error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleUpdateContainer({ containerId: UUID1 }));
		});

		it("handleDeleteContainer error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleDeleteContainer({ containerId: UUID1 }));
		});

		it("handleDeployContainer error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleDeployContainer({ containerId: UUID1 }));
		});

		it("handleListCrons error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleListCrons({ containerId: UUID1, page: 1, pageSize: 50 }));
		});

		it("handleCreateCron error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleCreateCron({ containerId: UUID1, schedule: "* * * * *" }));
		});

		it("handleUpdateCron error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleUpdateCron({ cronId: UUID1 }));
		});

		it("handleDeleteCron error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleDeleteCron({ cronId: UUID1 }));
		});

		it("handleListDomains error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleListDomains({ containerId: UUID1, page: 1, pageSize: 50 }));
		});

		it("handleCreateDomain error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleCreateDomain({ containerId: UUID1, hostname: "app.example.com" }));
		});

		it("handleDeleteDomain error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleDeleteDomain({ domainId: UUID1 }));
		});

		it("handleCreateToken error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleCreateToken({ containerId: UUID1 }));
		});

		it("handleDeleteToken error", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			await expectError(handleDeleteToken({ tokenId: UUID1 }));
		});
	});
});
