import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerRedisTools } from "../../../src/tools/redis/index.js";

// Mock shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
		defaultProjectId: "project-id",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

describe("redis module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerRedisTools(server)).not.toThrow();
	});
});

describe("redis handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// Helper to import handlers fresh
	async function importHandlers() {
		return await import("../../../src/tools/redis/handlers.js");
	}

	// === Cluster CRUD ===

	describe("handleListClusters", () => {
		it("lists clusters with default pagination", async () => {
			const { handleListClusters } = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				clusters: [{ id: "cluster-1", name: "my-redis" }],
				total_count: 1,
			});

			const result = await handleListClusters({ page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: expect.stringContaining("/redis/v1/zones/fr-par-1/clusters"),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.page).toBe(1);
		});

		it("passes all filter parameters", async () => {
			const { handleListClusters } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ clusters: [], total_count: 0 });

			await handleListClusters({
				page: 2,
				pageSize: 10,
				zone: "nl-ams-1",
				project_id: "proj-123",
				name: "test-redis",
				order_by: "name_asc",
				organization_id: "org-456",
				tags: ["env:prod", "team:backend"],
			});

			const callPath = mockFetch.mock.calls[0][0].path;
			expect(callPath).toContain("/zones/nl-ams-1/");
			expect(callPath).toContain("project_id=proj-123");
			expect(callPath).toContain("name=test-redis");
			expect(callPath).toContain("order_by=name_asc");
			expect(callPath).toContain("organization_id=org-456");
			expect(callPath).toContain("tags=env%3Aprod");
			expect(callPath).toContain("tags=team%3Abackend");
			expect(callPath).toContain("page=2");
			expect(callPath).toContain("page_size=10");
		});

		it("handles API errors", async () => {
			const { handleListClusters } = await importHandlers();
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValueOnce(err);

			const result = await handleListClusters({ page: 1, pageSize: 50 });

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleGetCluster", () => {
		it("gets cluster by ID", async () => {
			const { handleGetCluster } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "cluster-1", name: "my-redis", status: "ready" });

			const result = await handleGetCluster({ cluster_id: "cluster-1" });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/redis/v1/zones/fr-par-1/clusters/cluster-1",
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("cluster-1");
		});

		it("uses provided zone", async () => {
			const { handleGetCluster } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "cluster-1" });

			await handleGetCluster({ cluster_id: "cluster-1", zone: "nl-ams-1" });

			expect(mockFetch.mock.calls[0][0].path).toContain("/zones/nl-ams-1/");
		});

		it("handles errors", async () => {
			const { handleGetCluster } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("server error"));

			const result = await handleGetCluster({ cluster_id: "cluster-1" });

			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleCreateCluster", () => {
		it("creates a cluster with required fields", async () => {
			const { handleCreateCluster } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "new-cluster", status: "provisioning" });

			const result = await handleCreateCluster({
				project_id: "proj-123",
				name: "my-redis",
				version: "7.0",
				node_type: "RED1-XS",
				cluster_size: 1,
				user_name: "admin",
				password: "secret123",
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/redis/v1/zones/fr-par-1/clusters",
					headers: { "Content-Type": "application/json" },
				}),
			);
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project_id).toBe("proj-123");
			expect(body.name).toBe("my-redis");
			expect(body.version).toBe("7.0");
			expect(body.node_type).toBe("RED1-XS");
			expect(body.cluster_size).toBe(1);

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("new-cluster");
		});

		it("creates a cluster with all optional fields", async () => {
			const { handleCreateCluster } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "new-cluster" });

			await handleCreateCluster({
				zone: "nl-ams-1",
				project_id: "proj-123",
				name: "my-redis",
				version: "7.0",
				node_type: "RED1-XS",
				cluster_size: 3,
				user_name: "admin",
				password: "secret123",
				tags: ["env:prod"],
				tls_enabled: true,
				cluster_settings: [{ name: "maxmemory-policy", value: "allkeys-lru" }],
				acl_rules: [{ ip_cidr: "0.0.0.0/0", description: "Allow all" }],
				endpoints: [{ public: {} }],
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.tags).toEqual(["env:prod"]);
			expect(body.tls_enabled).toBe(true);
			expect(body.cluster_settings).toEqual([{ name: "maxmemory-policy", value: "allkeys-lru" }]);
			expect(body.acl_rules).toEqual([{ ip_cidr: "0.0.0.0/0", description: "Allow all" }]);
			expect(body.endpoints).toEqual([{ public: {} }]);
		});

		it("handles errors", async () => {
			const { handleCreateCluster } = await importHandlers();
			const err = new Error("bad request");
			(err as Error & { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValueOnce(err);

			const result = await handleCreateCluster({
				project_id: "proj-123",
				name: "my-redis",
				version: "7.0",
				node_type: "RED1-XS",
				cluster_size: 1,
				user_name: "admin",
				password: "secret123",
			});

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateCluster", () => {
		it("updates cluster name", async () => {
			const { handleUpdateCluster } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "cluster-1", name: "renamed" });

			const result = await handleUpdateCluster({
				cluster_id: "cluster-1",
				name: "renamed",
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "PATCH",
					path: "/redis/v1/zones/fr-par-1/clusters/cluster-1",
				}),
			);
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBe("renamed");
		});

		it("updates all optional fields", async () => {
			const { handleUpdateCluster } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "cluster-1" });

			await handleUpdateCluster({
				cluster_id: "cluster-1",
				zone: "nl-ams-1",
				name: "new-name",
				tags: ["tag1"],
				user_name: "newuser",
				password: "newpass",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBe("new-name");
			expect(body.tags).toEqual(["tag1"]);
			expect(body.user_name).toBe("newuser");
			expect(body.password).toBe("newpass");
		});

		it("sends empty body when no optional fields provided", async () => {
			const { handleUpdateCluster } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "cluster-1" });

			await handleUpdateCluster({ cluster_id: "cluster-1" });

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toEqual({});
		});

		it("handles errors", async () => {
			const { handleUpdateCluster } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleUpdateCluster({ cluster_id: "cluster-1" });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteCluster", () => {
		it("deletes a cluster", async () => {
			const { handleDeleteCluster } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "cluster-1", status: "deleting" });

			const result = await handleDeleteCluster({ cluster_id: "cluster-1" });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: "/redis/v1/zones/fr-par-1/clusters/cluster-1",
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("deleting");
		});

		it("handles errors", async () => {
			const { handleDeleteCluster } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleDeleteCluster({ cluster_id: "cluster-1" });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// === Metrics & Certificate ===

	describe("handleGetClusterMetrics", () => {
		it("gets cluster metrics without filters", async () => {
			const { handleGetClusterMetrics } = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				timeseries: [{ name: "cpu_usage", points: [] }],
			});

			const result = await handleGetClusterMetrics({ cluster_id: "cluster-1" });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/redis/v1/zones/fr-par-1/clusters/cluster-1/metrics",
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.timeseries).toHaveLength(1);
		});

		it("passes metric filters", async () => {
			const { handleGetClusterMetrics } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ timeseries: [] });

			await handleGetClusterMetrics({
				cluster_id: "cluster-1",
				zone: "nl-ams-1",
				start_at: "2024-01-01T00:00:00Z",
				end_at: "2024-01-02T00:00:00Z",
				metric_name: "cpu_usage",
			});

			const callPath = mockFetch.mock.calls[0][0].path;
			expect(callPath).toContain("/zones/nl-ams-1/");
			expect(callPath).toContain("start_at=");
			expect(callPath).toContain("end_at=");
			expect(callPath).toContain("metric_name=cpu_usage");
		});

		it("handles errors", async () => {
			const { handleGetClusterMetrics } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleGetClusterMetrics({ cluster_id: "cluster-1" });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleGetClusterCertificate", () => {
		it("gets cluster certificate", async () => {
			const { handleGetClusterCertificate } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ content: "-----BEGIN CERTIFICATE-----" });

			const result = await handleGetClusterCertificate({ cluster_id: "cluster-1" });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/redis/v1/zones/fr-par-1/clusters/cluster-1/certificate",
				}),
			);
			expect(result.content[0].text).toContain("BEGIN CERTIFICATE");
		});

		it("handles errors", async () => {
			const { handleGetClusterCertificate } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleGetClusterCertificate({ cluster_id: "cluster-1" });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleRenewClusterCertificate", () => {
		it("renews cluster certificate", async () => {
			const { handleRenewClusterCertificate } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "cluster-1", status: "configuring" });

			const result = await handleRenewClusterCertificate({ cluster_id: "cluster-1" });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/redis/v1/zones/fr-par-1/clusters/cluster-1/renew-certificate",
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("configuring");
		});

		it("handles errors", async () => {
			const { handleRenewClusterCertificate } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleRenewClusterCertificate({ cluster_id: "cluster-1" });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// === ACL Rules ===

	describe("handleAddACLRules", () => {
		it("adds ACL rules", async () => {
			const { handleAddACLRules } = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				acl_rules: [{ id: "acl-1", ip_cidr: "10.0.0.0/8", description: "internal" }],
			});

			const result = await handleAddACLRules({
				cluster_id: "cluster-1",
				acl_rules: [{ ip_cidr: "10.0.0.0/8", description: "internal" }],
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/redis/v1/zones/fr-par-1/clusters/cluster-1/acls",
				}),
			);
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.acl_rules).toHaveLength(1);
		});

		it("handles errors", async () => {
			const { handleAddACLRules } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleAddACLRules({
				cluster_id: "cluster-1",
				acl_rules: [{ ip_cidr: "10.0.0.0/8", description: "internal" }],
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteACLRules", () => {
		it("deletes a single ACL rule by ID", async () => {
			const { handleDeleteACLRules } = await importHandlers();
			mockFetch.mockResolvedValueOnce({});

			const result = await handleDeleteACLRules({
				acl_id: "acl-1",
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: "/redis/v1/zones/fr-par-1/acls/acl-1",
				}),
			);
			expect(mockFetch.mock.calls[0][0].body).toBeUndefined();
			expect(result.content).toBeDefined();
		});

		it("uses provided zone", async () => {
			const { handleDeleteACLRules } = await importHandlers();
			mockFetch.mockResolvedValueOnce({});

			await handleDeleteACLRules({ acl_id: "acl-1", zone: "nl-ams-1" });

			expect(mockFetch.mock.calls[0][0].path).toBe("/redis/v1/zones/nl-ams-1/acls/acl-1");
		});

		it("handles errors", async () => {
			const { handleDeleteACLRules } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleDeleteACLRules({
				acl_id: "acl-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleSetACLRules", () => {
		it("sets ACL rules (replace all)", async () => {
			const { handleSetACLRules } = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				acl_rules: [{ id: "acl-new", ip_cidr: "0.0.0.0/0", description: "all" }],
			});

			const result = await handleSetACLRules({
				cluster_id: "cluster-1",
				acl_rules: [{ ip_cidr: "0.0.0.0/0", description: "all" }],
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "PUT",
					path: "/redis/v1/zones/fr-par-1/clusters/cluster-1/acls",
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.acl_rules).toHaveLength(1);
		});

		it("handles errors", async () => {
			const { handleSetACLRules } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleSetACLRules({
				cluster_id: "cluster-1",
				acl_rules: [],
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// === Endpoints ===

	describe("handleAddEndpoints", () => {
		it("adds endpoints", async () => {
			const { handleAddEndpoints } = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				endpoints: [{ id: "ep-1", ips: ["10.0.0.1"], port: 6379 }],
			});

			const result = await handleAddEndpoints({
				cluster_id: "cluster-1",
				endpoints: [{ public: {} }],
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/redis/v1/zones/fr-par-1/clusters/cluster-1/endpoints",
				}),
			);
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.endpoints).toHaveLength(1);
		});

		it("handles errors", async () => {
			const { handleAddEndpoints } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleAddEndpoints({
				cluster_id: "cluster-1",
				endpoints: [{ public: {} }],
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteEndpoints", () => {
		it("deletes an endpoint by ID", async () => {
			const { handleDeleteEndpoints } = await importHandlers();
			mockFetch.mockResolvedValueOnce({});

			const result = await handleDeleteEndpoints({
				endpoint_id: "ep-1",
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: "/redis/v1/zones/fr-par-1/endpoints/ep-1",
				}),
			);
			expect(result.content).toBeDefined();
		});

		it("uses provided zone", async () => {
			const { handleDeleteEndpoints } = await importHandlers();
			mockFetch.mockResolvedValueOnce({});

			await handleDeleteEndpoints({ endpoint_id: "ep-1", zone: "nl-ams-1" });

			expect(mockFetch.mock.calls[0][0].path).toBe("/redis/v1/zones/nl-ams-1/endpoints/ep-1");
		});

		it("handles errors", async () => {
			const { handleDeleteEndpoints } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleDeleteEndpoints({
				endpoint_id: "ep-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleSetEndpoints", () => {
		it("sets endpoints (replace all)", async () => {
			const { handleSetEndpoints } = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				endpoints: [{ id: "ep-new", ips: ["10.0.0.2"], port: 6379 }],
			});

			const result = await handleSetEndpoints({
				cluster_id: "cluster-1",
				endpoints: [
					{
						private_network: {
							id: "pn-123",
							service_ips: ["10.0.0.2"],
						},
					},
				],
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "PUT",
					path: "/redis/v1/zones/fr-par-1/clusters/cluster-1/endpoints",
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.endpoints).toHaveLength(1);
		});

		it("handles errors", async () => {
			const { handleSetEndpoints } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleSetEndpoints({
				cluster_id: "cluster-1",
				endpoints: [],
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// === Discovery ===

	describe("handleListNodeTypes", () => {
		it("lists node types with pagination", async () => {
			const { handleListNodeTypes } = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				node_types: [{ name: "RED1-XS", memory: 1073741824 }],
				total_count: 1,
			});

			const result = await handleListNodeTypes({ page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: expect.stringContaining("/redis/v1/zones/fr-par-1/node-types"),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.totalCount).toBe(1);
		});

		it("passes include_disabled_types parameter", async () => {
			const { handleListNodeTypes } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ node_types: [], total_count: 0 });

			await handleListNodeTypes({
				page: 1,
				pageSize: 50,
				zone: "nl-ams-1",
				include_disabled_types: true,
			});

			const callPath = mockFetch.mock.calls[0][0].path;
			expect(callPath).toContain("include_disabled_types=true");
			expect(callPath).toContain("/zones/nl-ams-1/");
		});

		it("handles errors", async () => {
			const { handleListNodeTypes } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleListNodeTypes({ page: 1, pageSize: 50 });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleListClusterVersions", () => {
		it("lists versions with pagination", async () => {
			const { handleListClusterVersions } = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				versions: [{ version: "7.0", available_settings: [] }],
				total_count: 1,
			});

			const result = await handleListClusterVersions({ page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: expect.stringContaining("/redis/v1/zones/fr-par-1/cluster-versions"),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes all filter parameters", async () => {
			const { handleListClusterVersions } = await importHandlers();
			mockFetch.mockResolvedValueOnce({ versions: [], total_count: 0 });

			await handleListClusterVersions({
				page: 1,
				pageSize: 50,
				zone: "pl-waw-1",
				include_disabled: true,
				include_beta: true,
				include_deprecated: false,
				version: "7.0",
			});

			const callPath = mockFetch.mock.calls[0][0].path;
			expect(callPath).toContain("/zones/pl-waw-1/");
			expect(callPath).toContain("include_disabled=true");
			expect(callPath).toContain("include_beta=true");
			expect(callPath).toContain("include_deprecated=false");
			expect(callPath).toContain("version=7.0");
		});

		it("handles errors", async () => {
			const { handleListClusterVersions } = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handleListClusterVersions({ page: 1, pageSize: 50 });
			expect("isError" in result && result.isError).toBe(true);
		});
	});
});

describe("redis tool registration", () => {
	it("registers all 16 tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");

		registerRedisTools(server);

		expect(toolSpy).toHaveBeenCalledTimes(16);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toContain("scaleway_redis_list_clusters");
		expect(toolNames).toContain("scaleway_redis_get_cluster");
		expect(toolNames).toContain("scaleway_redis_create_cluster");
		expect(toolNames).toContain("scaleway_redis_update_cluster");
		expect(toolNames).toContain("scaleway_redis_delete_cluster");
		expect(toolNames).toContain("scaleway_redis_list_cluster_metrics");
		expect(toolNames).toContain("scaleway_redis_get_cluster_certificate");
		expect(toolNames).toContain("scaleway_redis_renew_cluster_certificate");
		expect(toolNames).toContain("scaleway_redis_add_acl_rules");
		expect(toolNames).toContain("scaleway_redis_delete_acl_rules");
		expect(toolNames).toContain("scaleway_redis_set_acl_rules");
		expect(toolNames).toContain("scaleway_redis_add_endpoints");
		expect(toolNames).toContain("scaleway_redis_delete_endpoints");
		expect(toolNames).toContain("scaleway_redis_set_endpoints");
		expect(toolNames).toContain("scaleway_redis_list_node_types");
		expect(toolNames).toContain("scaleway_redis_list_cluster_versions");
	});
});
