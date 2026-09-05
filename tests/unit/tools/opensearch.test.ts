import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerOpensearchTools } from "../../../src/tools/opensearch/index.js";

// Mock the shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

interface ErrorResult {
	content: { type: "text"; text: string }[];
	isError?: boolean;
}

const DEPLOYMENT_ID = "00000000-0000-0000-0000-000000000010";
const ENDPOINT_ID = "00000000-0000-0000-0000-000000000020";
const PN_ID = "00000000-0000-0000-0000-000000000030";

function errorWith(status?: number) {
	const err = new Error("boom");
	if (status !== undefined) {
		(err as unknown as { statusCode: number }).statusCode = status;
	}
	return err;
}

describe("opensearch module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerOpensearchTools(server)).not.toThrow();
	});

	it("registers all 15 OpenSearch tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerOpensearchTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(15);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toEqual([
			"scaleway_opensearch_list_deployments",
			"scaleway_opensearch_get_deployment",
			"scaleway_opensearch_create_deployment",
			"scaleway_opensearch_update_deployment",
			"scaleway_opensearch_upgrade_deployment",
			"scaleway_opensearch_delete_deployment",
			"scaleway_opensearch_get_certificate_authority",
			"scaleway_opensearch_list_node_types",
			"scaleway_opensearch_list_versions",
			"scaleway_opensearch_list_users",
			"scaleway_opensearch_create_user",
			"scaleway_opensearch_update_user",
			"scaleway_opensearch_delete_user",
			"scaleway_opensearch_create_endpoint",
			"scaleway_opensearch_delete_endpoint",
		]);
	});

	it("invokes a registered tool callback end-to-end", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const handlers: Record<string, (args: unknown) => Promise<unknown>> = {};
		vi.spyOn(server, "tool").mockImplementation(((name: string, ..._rest: unknown[]) => {
			const cb = _rest[_rest.length - 1] as (args: unknown) => Promise<unknown>;
			handlers[name] = cb;
			return undefined as never;
		}) as never);
		registerOpensearchTools(server);
		mockFetch.mockResolvedValue({ deployments: [], total_count: 0 });
		const result = (await handlers.scaleway_opensearch_list_deployments({
			region: "fr-par",
		})) as { content: { text: string }[] };
		expect(JSON.parse(result.content[0].text).totalCount).toBe(0);
	});
});

describe("opensearch handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	// --- Deployments ---

	describe("handleListDeployments", () => {
		it("returns paginated deployments with defaults", async () => {
			const { handleListDeployments } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({
				deployments: [{ id: DEPLOYMENT_ID, name: "os" }],
				total_count: 1,
			});

			const result = await handleListDeployments({ region: "fr-par", page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/searchdb/v1alpha1/regions/fr-par/deployments",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes all optional filters", async () => {
			const { handleListDeployments } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ deployments: [], total_count: 0 });

			await handleListDeployments({
				region: "fr-par",
				page: 2,
				pageSize: 10,
				organizationId: "00000000-0000-0000-0000-000000000002",
				projectId: "00000000-0000-0000-0000-000000000001",
				name: "os",
				tags: ["prod"],
				orderBy: "name_asc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("page")).toBe("2");
			expect(callArgs.urlParams.get("page_size")).toBe("10");
			expect(callArgs.urlParams.get("organization_id")).toBe(
				"00000000-0000-0000-0000-000000000002",
			);
			expect(callArgs.urlParams.get("project_id")).toBe("00000000-0000-0000-0000-000000000001");
			expect(callArgs.urlParams.get("name")).toBe("os");
			expect(callArgs.urlParams.get("order_by")).toBe("name_asc");
		});

		it("returns error on failure", async () => {
			const { handleListDeployments } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(401));

			const result: ErrorResult = await handleListDeployments({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleGetDeployment", () => {
		it("returns deployment details", async () => {
			const { handleGetDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, name: "os" });

			const result = await handleGetDeployment({ region: "fr-par", deploymentId: DEPLOYMENT_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("os");
		});

		it("returns error on 404", async () => {
			const { handleGetDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(404));

			const result: ErrorResult = await handleGetDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleCreateDeployment", () => {
		it("creates with all optional fields including public and private endpoints", async () => {
			const { handleCreateDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, name: "os" });

			const result = await handleCreateDeployment({
				region: "fr-par",
				name: "os",
				nodeType: "SEARCHDB-SHARED-2C-8G",
				version: "2.0",
				projectId: "00000000-0000-0000-0000-000000000001",
				tags: ["prod"],
				nodeCount: 3,
				userName: "admin",
				password: "secret",
				volume: { type: "sbs_5k", sizeBytes: 5000000000 },
				endpoints: [{ public: true }, { privateNetworkId: PN_ID }],
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "/searchdb/v1alpha1/regions/fr-par/deployments",
				body: JSON.stringify({
					name: "os",
					node_type: "SEARCHDB-SHARED-2C-8G",
					version: "2.0",
					project_id: "00000000-0000-0000-0000-000000000001",
					tags: ["prod"],
					node_count: 3,
					user_name: "admin",
					password: "secret",
					volume: { type: "sbs_5k", size_bytes: 5000000000 },
					endpoints: [{ public: {} }, { private_network: { private_network_id: PN_ID } }],
				}),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).name).toBe("os");
		});

		it("creates with only required fields", async () => {
			const { handleCreateDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID });

			await handleCreateDeployment({
				region: "fr-par",
				name: "os",
				nodeType: "SEARCHDB-SHARED-2C-8G",
				version: "2.0",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "/searchdb/v1alpha1/regions/fr-par/deployments",
				body: JSON.stringify({
					name: "os",
					node_type: "SEARCHDB-SHARED-2C-8G",
					version: "2.0",
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(400));

			const result: ErrorResult = await handleCreateDeployment({
				region: "fr-par",
				name: "os",
				nodeType: "x",
				version: "2.0",
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateDeployment", () => {
		it("updates name and tags", async () => {
			const { handleUpdateDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, name: "renamed" });

			await handleUpdateDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "renamed",
				tags: ["a"],
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
				body: JSON.stringify({ name: "renamed", tags: ["a"] }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends empty body when nothing provided", async () => {
			const { handleUpdateDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID });

			await handleUpdateDeployment({ region: "fr-par", deploymentId: DEPLOYMENT_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith());

			const result: ErrorResult = await handleUpdateDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("server_error");
		});
	});

	describe("handleUpgradeDeployment", () => {
		it("upgrades by node count", async () => {
			const { handleUpgradeDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID });

			await handleUpgradeDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				nodeCount: 5,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/upgrade`,
				body: JSON.stringify({ node_count: 5 }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("upgrades by volume size", async () => {
			const { handleUpgradeDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID });

			await handleUpgradeDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				volumeSizeBytes: 10000000000,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/upgrade`,
				body: JSON.stringify({ volume_size_bytes: 10000000000 }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpgradeDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(403));

			const result: ErrorResult = await handleUpgradeDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				nodeCount: 2,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleDeleteDeployment", () => {
		it("deletes and returns the API response", async () => {
			const { handleDeleteDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, status: "deleting" });

			const result = await handleDeleteDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
			});
			expect(JSON.parse(result.content[0].text).status).toBe("deleting");
		});

		it("returns error on failure", async () => {
			const { handleDeleteDeployment } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(404));

			const result: ErrorResult = await handleDeleteDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleGetCertificateAuthority", () => {
		it("returns the CA payload", async () => {
			const { handleGetCertificateAuthority } = await import(
				"../../../src/tools/opensearch/handlers.js"
			);
			mockFetch.mockResolvedValue({ name: "ca.pem", content: "PEM" });

			const result = await handleGetCertificateAuthority({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/certificate-authority`,
			});
			expect(JSON.parse(result.content[0].text).content).toBe("PEM");
		});

		it("returns error on failure", async () => {
			const { handleGetCertificateAuthority } = await import(
				"../../../src/tools/opensearch/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(404));

			const result: ErrorResult = await handleGetCertificateAuthority({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	// --- Node types & versions ---

	describe("handleListNodeTypes", () => {
		it("returns paginated node types with orderBy", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ node_types: [{ name: "x" }], total_count: 1 });

			await handleListNodeTypes({
				region: "fr-par",
				page: 1,
				pageSize: 20,
				orderBy: "vcpus_desc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.method).toBe("GET");
			expect(callArgs.path).toBe("/searchdb/v1alpha1/regions/fr-par/node-types");
			expect(callArgs.urlParams.get("order_by")).toBe("vcpus_desc");
		});

		it("returns error on failure", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(429));

			const result: ErrorResult = await handleListNodeTypes({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("rate_limited");
		});
	});

	describe("handleListVersions", () => {
		it("returns paginated versions with filter", async () => {
			const { handleListVersions } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ versions: [{ version: "2.0" }], total_count: 1 });

			const result = await handleListVersions({
				region: "fr-par",
				page: 1,
				pageSize: 50,
				version: "2.0",
				orderBy: "version_desc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toBe("/searchdb/v1alpha1/regions/fr-par/versions");
			expect(callArgs.urlParams.get("version")).toBe("2.0");
			expect(callArgs.urlParams.get("order_by")).toBe("version_desc");
			expect(JSON.parse(result.content[0].text).items[0].version).toBe("2.0");
		});

		it("returns error on failure", async () => {
			const { handleListVersions } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith());

			const result: ErrorResult = await handleListVersions({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
		});
	});

	// --- Users ---

	describe("handleListUsers", () => {
		it("returns paginated users with filter", async () => {
			const { handleListUsers } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ users: [{ username: "admin" }], total_count: 1 });

			await handleListUsers({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				page: 1,
				pageSize: 50,
				name: "adm",
				orderBy: "name_desc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toBe(
				`/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users`,
			);
			expect(callArgs.urlParams.get("name")).toBe("adm");
			expect(callArgs.urlParams.get("order_by")).toBe("name_desc");
		});

		it("returns error on failure", async () => {
			const { handleListUsers } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(403));

			const result: ErrorResult = await handleListUsers({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleCreateUser", () => {
		it("creates a user", async () => {
			const { handleCreateUser } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ username: "admin" });

			const result = await handleCreateUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				username: "admin",
				password: "secret",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users`,
				body: JSON.stringify({ username: "admin", password: "secret" }),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).username).toBe("admin");
		});

		it("returns error on failure", async () => {
			const { handleCreateUser } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(400));

			const result: ErrorResult = await handleCreateUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				username: "admin",
				password: "secret",
			});

			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateUser", () => {
		it("updates user password", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ username: "admin" });

			await handleUpdateUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				username: "admin",
				password: "newpass",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users/admin`,
				body: JSON.stringify({ password: "newpass" }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends empty body when no password provided", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ username: "admin" });

			await handleUpdateUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				username: "admin",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users/admin`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(404));

			const result: ErrorResult = await handleUpdateUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				username: "admin",
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleDeleteUser", () => {
		it("deletes a user and returns confirmation", async () => {
			const { handleDeleteUser } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				username: "admin",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `/searchdb/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users/admin`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.username).toBe("admin");
		});

		it("returns error on failure", async () => {
			const { handleDeleteUser } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(403));

			const result: ErrorResult = await handleDeleteUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				username: "admin",
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	// --- Endpoints ---

	describe("handleCreateEndpoint", () => {
		it("creates a public endpoint", async () => {
			const { handleCreateEndpoint } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ id: ENDPOINT_ID });

			await handleCreateEndpoint({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				public: true,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "/searchdb/v1alpha1/regions/fr-par/endpoints",
				body: JSON.stringify({
					deployment_id: DEPLOYMENT_ID,
					endpoint_spec: { public: {} },
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("creates a private network endpoint", async () => {
			const { handleCreateEndpoint } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue({ id: ENDPOINT_ID });

			const result = await handleCreateEndpoint({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				privateNetworkId: PN_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "/searchdb/v1alpha1/regions/fr-par/endpoints",
				body: JSON.stringify({
					deployment_id: DEPLOYMENT_ID,
					endpoint_spec: { private_network: { private_network_id: PN_ID } },
				}),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).id).toBe(ENDPOINT_ID);
		});

		it("returns error on failure", async () => {
			const { handleCreateEndpoint } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(400));

			const result: ErrorResult = await handleCreateEndpoint({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				public: true,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleDeleteEndpoint", () => {
		it("deletes an endpoint and returns confirmation", async () => {
			const { handleDeleteEndpoint } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteEndpoint({ region: "fr-par", endpointId: ENDPOINT_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `/searchdb/v1alpha1/regions/fr-par/endpoints/${ENDPOINT_ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.id).toBe(ENDPOINT_ID);
		});

		it("returns error on failure", async () => {
			const { handleDeleteEndpoint } = await import("../../../src/tools/opensearch/handlers.js");
			mockFetch.mockRejectedValue(errorWith(404));

			const result: ErrorResult = await handleDeleteEndpoint({
				region: "fr-par",
				endpointId: ENDPOINT_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});
});
