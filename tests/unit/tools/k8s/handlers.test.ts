import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as auth from "../../../../src/shared/auth.js";
import * as client from "../../../../src/shared/client.js";
import {
	handleCreateCluster,
	handleCreatePool,
	handleDeleteCluster,
	handleDeletePool,
	handleGetCluster,
	handleGetClusterKubeconfig,
	handleGetPool,
	handleListClusterAvailableVersions,
	handleListClusters,
	handleListPools,
	handleUpdatePool,
	handleUpgradeCluster,
	handleUpgradePool,
} from "../../../../src/tools/k8s/handlers.js";

vi.mock("../../../../src/shared/auth.js");
vi.mock("../../../../src/shared/client.js");

const MOCK_CONFIG = {
	accessKey: "SCWXXXXXXXXXXXXXXXXX",
	secretKey: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
	defaultProjectId: "11111111-1111-1111-1111-111111111111",
	defaultRegion: "fr-par",
	defaultZone: "fr-par-1",
};

const CLUSTER_ID = "22222222-2222-2222-2222-222222222222";
const POOL_ID = "33333333-3333-3333-3333-333333333333";

const mockCluster = {
	id: CLUSTER_ID,
	name: "test-cluster",
	status: "ready",
	version: "1.30.2",
	region: "fr-par",
	cni: "cilium",
	project_id: MOCK_CONFIG.defaultProjectId,
	tags: [],
	type: "kapsule",
	description: "A test cluster",
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-01-01T00:00:00Z",
};

const mockPool = {
	id: POOL_ID,
	cluster_id: CLUSTER_ID,
	name: "default-pool",
	node_type: "DEV1-M",
	size: 3,
	min_size: 1,
	max_size: 5,
	status: "ready",
	autoscaling: true,
	autohealing: true,
	version: "1.30.2",
	tags: [],
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-01-01T00:00:00Z",
};

describe("k8s handlers", () => {
	let mockFetch: Mock;

	beforeEach(() => {
		mockFetch = vi.fn();
		(auth.loadAuthConfig as Mock).mockReturnValue(MOCK_CONFIG);
		(client.createScalewayClient as Mock).mockReturnValue({ fetch: mockFetch });
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// --- Cluster handlers ---

	describe("handleListClusters", () => {
		it("returns paginated clusters", async () => {
			mockFetch.mockResolvedValue({ clusters: [mockCluster], total_count: 1 });

			const result = await handleListClusters({ region: "fr-par", page: 1, pageSize: 50 });

			expect(result.content[0].type).toBe("text");
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
			expect(data.page).toBe(1);
			expect(data.pageSize).toBe(50);
			expect(mockFetch).toHaveBeenCalledOnce();
		});

		it("passes filter parameters", async () => {
			mockFetch.mockResolvedValue({ clusters: [], total_count: 0 });

			await handleListClusters({
				region: "fr-par",
				page: 1,
				pageSize: 50,
				name: "prod",
				status: "ready",
				type: "kapsule",
				project_id: MOCK_CONFIG.defaultProjectId,
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toContain("/k8s/v1/regions/fr-par/clusters");
			const params = call.urlParams as URLSearchParams;
			expect(params.get("name")).toBe("prod");
			expect(params.get("status")).toBe("ready");
			expect(params.get("type")).toBe("kapsule");
			expect(params.get("project_id")).toBe(MOCK_CONFIG.defaultProjectId);
		});

		it("handles API errors", async () => {
			const error = Object.assign(new Error("Not found"), { statusCode: 404 });
			mockFetch.mockRejectedValue(error);

			const result = await handleListClusters({ region: "fr-par", page: 1, pageSize: 50 });

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("not_found");
		});
	});

	describe("handleGetCluster", () => {
		it("returns cluster details", async () => {
			mockFetch.mockResolvedValue(mockCluster);

			const result = await handleGetCluster({ region: "fr-par", cluster_id: CLUSTER_ID });

			const data = JSON.parse(result.content[0].text);
			expect(data.id).toBe(CLUSTER_ID);
			expect(data.name).toBe("test-cluster");
		});

		it("handles not found error", async () => {
			const error = Object.assign(new Error("Cluster not found"), { statusCode: 404 });
			mockFetch.mockRejectedValue(error);

			const result = await handleGetCluster({ region: "fr-par", cluster_id: CLUSTER_ID });

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateCluster", () => {
		it("creates a cluster", async () => {
			mockFetch.mockResolvedValue(mockCluster);

			const result = await handleCreateCluster({
				region: "fr-par",
				name: "test-cluster",
				version: "1.30.2",
				cni: "cilium",
			});

			const data = JSON.parse(result.content[0].text);
			expect(data.name).toBe("test-cluster");
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			const body = JSON.parse(call.body);
			expect(body).toEqual({
				name: "test-cluster",
				version: "1.30.2",
				cni: "cilium",
			});
		});

		it("passes optional fields", async () => {
			mockFetch.mockResolvedValue(mockCluster);

			await handleCreateCluster({
				region: "fr-par",
				name: "test-cluster",
				version: "1.30.2",
				cni: "cilium",
				description: "My cluster",
				tags: ["env:prod"],
				type: "kapsule",
				project_id: MOCK_CONFIG.defaultProjectId,
			});

			const call = mockFetch.mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.description).toBe("My cluster");
			expect(body.tags).toEqual(["env:prod"]);
			expect(body.type).toBe("kapsule");
			expect(body.project_id).toBe(MOCK_CONFIG.defaultProjectId);
		});

		it("handles validation errors", async () => {
			const error = Object.assign(new Error("Bad request"), { statusCode: 400 });
			mockFetch.mockRejectedValue(error);

			const result = await handleCreateCluster({
				region: "fr-par",
				name: "test",
				version: "1.30.2",
				cni: "cilium",
			});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("invalid_input");
		});
	});

	describe("handleDeleteCluster", () => {
		it("deletes a cluster", async () => {
			mockFetch.mockResolvedValue(mockCluster);

			const result = await handleDeleteCluster({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("DELETE");
			expect(call.path).toContain(`/clusters/${CLUSTER_ID}`);
			expect(result.content[0].type).toBe("text");
		});

		it("passes with_additional_resources param", async () => {
			mockFetch.mockResolvedValue(mockCluster);

			await handleDeleteCluster({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
				with_additional_resources: true,
			});

			const call = mockFetch.mock.calls[0][0];
			const params = call.urlParams as URLSearchParams;
			expect(params.get("with_additional_resources")).toBe("true");
		});

		it("handles errors", async () => {
			const error = Object.assign(new Error("Forbidden"), { statusCode: 403 });
			mockFetch.mockRejectedValue(error);

			const result = await handleDeleteCluster({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
			});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("permission_denied");
		});
	});

	describe("handleUpgradeCluster", () => {
		it("upgrades a cluster", async () => {
			mockFetch.mockResolvedValue({ ...mockCluster, version: "1.31.0" });

			const result = await handleUpgradeCluster({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
				version: "1.31.0",
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toContain("/upgrade");
			const body = JSON.parse(call.body);
			expect(body.version).toBe("1.31.0");
			const data = JSON.parse(result.content[0].text);
			expect(data.version).toBe("1.31.0");
		});

		it("passes upgrade_pools option", async () => {
			mockFetch.mockResolvedValue(mockCluster);

			await handleUpgradeCluster({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
				version: "1.31.0",
				upgrade_pools: true,
			});

			const call = mockFetch.mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.upgrade_pools).toBe(true);
		});

		it("handles errors", async () => {
			const error = Object.assign(new Error("Rate limited"), { statusCode: 429 });
			mockFetch.mockRejectedValue(error);

			const result = await handleUpgradeCluster({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
				version: "1.31.0",
			});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("rate_limited");
		});
	});

	describe("handleListClusterAvailableVersions", () => {
		it("returns available versions", async () => {
			const versions = { versions: [{ name: "1.31.0" }, { name: "1.30.3" }] };
			mockFetch.mockResolvedValue(versions);

			const result = await handleListClusterAvailableVersions({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
			});

			const data = JSON.parse(result.content[0].text);
			expect(data.versions).toHaveLength(2);
		});

		it("handles errors", async () => {
			const error = Object.assign(new Error("Unauthorized"), { statusCode: 401 });
			mockFetch.mockRejectedValue(error);

			const result = await handleListClusterAvailableVersions({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
			});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetClusterKubeconfig", () => {
		it("returns kubeconfig", async () => {
			const kubeconfig = { content: "YXBpVmVyc2lvbjogdjE=" };
			mockFetch.mockResolvedValue(kubeconfig);

			const result = await handleGetClusterKubeconfig({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
			});

			const data = JSON.parse(result.content[0].text);
			expect(data.content).toBe("YXBpVmVyc2lvbjogdjE=");
		});

		it("handles errors", async () => {
			const error = new Error("Unknown failure");
			mockFetch.mockRejectedValue(error);

			const result = await handleGetClusterKubeconfig({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
			});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("server_error");
		});
	});

	// --- Node Pool handlers ---

	describe("handleListPools", () => {
		it("returns paginated pools", async () => {
			mockFetch.mockResolvedValue({ nodes: [mockPool], total_count: 1 });

			const result = await handleListPools({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
				page: 1,
				pageSize: 50,
			});

			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
		});

		it("passes filter parameters", async () => {
			mockFetch.mockResolvedValue({ nodes: [], total_count: 0 });

			await handleListPools({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
				page: 1,
				pageSize: 50,
				name: "default",
				status: "ready",
			});

			const call = mockFetch.mock.calls[0][0];
			const params = call.urlParams as URLSearchParams;
			expect(params.get("name")).toBe("default");
			expect(params.get("status")).toBe("ready");
		});

		it("handles errors", async () => {
			const error = Object.assign(new Error("Not found"), { statusCode: 404 });
			mockFetch.mockRejectedValue(error);

			const result = await handleListPools({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
				page: 1,
				pageSize: 50,
			});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleGetPool", () => {
		it("returns pool details", async () => {
			mockFetch.mockResolvedValue(mockPool);

			const result = await handleGetPool({ region: "fr-par", pool_id: POOL_ID });

			const data = JSON.parse(result.content[0].text);
			expect(data.id).toBe(POOL_ID);
			expect(data.name).toBe("default-pool");
		});

		it("handles errors", async () => {
			const error = Object.assign(new Error("Not found"), { statusCode: 404 });
			mockFetch.mockRejectedValue(error);

			const result = await handleGetPool({ region: "fr-par", pool_id: POOL_ID });

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreatePool", () => {
		it("creates a pool", async () => {
			mockFetch.mockResolvedValue(mockPool);

			const result = await handleCreatePool({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
				name: "default-pool",
				node_type: "DEV1-M",
				size: 3,
			});

			const data = JSON.parse(result.content[0].text);
			expect(data.name).toBe("default-pool");
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			const body = JSON.parse(call.body);
			expect(body.name).toBe("default-pool");
			expect(body.node_type).toBe("DEV1-M");
			expect(body.size).toBe(3);
		});

		it("passes optional autoscaling fields", async () => {
			mockFetch.mockResolvedValue(mockPool);

			await handleCreatePool({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
				name: "auto-pool",
				node_type: "DEV1-M",
				size: 3,
				min_size: 1,
				max_size: 10,
				autoscaling: true,
				autohealing: true,
				tags: ["env:prod"],
			});

			const call = mockFetch.mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.autoscaling).toBe(true);
			expect(body.autohealing).toBe(true);
			expect(body.min_size).toBe(1);
			expect(body.max_size).toBe(10);
			expect(body.tags).toEqual(["env:prod"]);
		});

		it("handles errors", async () => {
			const error = Object.assign(new Error("Bad request"), { statusCode: 400 });
			mockFetch.mockRejectedValue(error);

			const result = await handleCreatePool({
				region: "fr-par",
				cluster_id: CLUSTER_ID,
				name: "pool",
				node_type: "DEV1-M",
				size: 3,
			});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpdatePool", () => {
		it("updates a pool", async () => {
			const updated = { ...mockPool, size: 5 };
			mockFetch.mockResolvedValue(updated);

			const result = await handleUpdatePool({
				region: "fr-par",
				pool_id: POOL_ID,
				size: 5,
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("PATCH");
			const body = JSON.parse(call.body);
			expect(body.size).toBe(5);
			const data = JSON.parse(result.content[0].text);
			expect(data.size).toBe(5);
		});

		it("passes all optional fields", async () => {
			mockFetch.mockResolvedValue(mockPool);

			await handleUpdatePool({
				region: "fr-par",
				pool_id: POOL_ID,
				size: 5,
				min_size: 2,
				max_size: 10,
				autoscaling: false,
				autohealing: false,
				tags: ["updated"],
			});

			const call = mockFetch.mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.min_size).toBe(2);
			expect(body.max_size).toBe(10);
			expect(body.autoscaling).toBe(false);
			expect(body.autohealing).toBe(false);
			expect(body.tags).toEqual(["updated"]);
		});

		it("handles errors", async () => {
			const error = Object.assign(new Error("Not found"), { statusCode: 404 });
			mockFetch.mockRejectedValue(error);

			const result = await handleUpdatePool({
				region: "fr-par",
				pool_id: POOL_ID,
				size: 5,
			});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeletePool", () => {
		it("deletes a pool", async () => {
			mockFetch.mockResolvedValue(mockPool);

			const result = await handleDeletePool({ region: "fr-par", pool_id: POOL_ID });

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("DELETE");
			expect(call.path).toContain(`/pools/${POOL_ID}`);
			expect(result.content[0].type).toBe("text");
		});

		it("handles errors", async () => {
			const error = Object.assign(new Error("Forbidden"), { statusCode: 403 });
			mockFetch.mockRejectedValue(error);

			const result = await handleDeletePool({ region: "fr-par", pool_id: POOL_ID });

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpgradePool", () => {
		it("upgrades a pool", async () => {
			const upgraded = { ...mockPool, version: "1.31.0" };
			mockFetch.mockResolvedValue(upgraded);

			const result = await handleUpgradePool({
				region: "fr-par",
				pool_id: POOL_ID,
				version: "1.31.0",
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toContain("/upgrade");
			const body = JSON.parse(call.body);
			expect(body.version).toBe("1.31.0");
			const data = JSON.parse(result.content[0].text);
			expect(data.version).toBe("1.31.0");
		});

		it("handles errors", async () => {
			const error = "string error";
			mockFetch.mockRejectedValue(error);

			const result = await handleUpgradePool({
				region: "fr-par",
				pool_id: POOL_ID,
				version: "1.31.0",
			});

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("server_error");
			expect(data.error.message).toBe("string error");
		});
	});
});
