import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerDataLabTools } from "../../../src/tools/data-lab/index.js";

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

const CLUSTER_ID = "00000000-0000-0000-0000-000000000010";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";
const PN_ID = "00000000-0000-0000-0000-000000000002";

const sampleCluster = {
	id: CLUSTER_ID,
	project_id: PROJECT_ID,
	name: "my-lab",
	description: "analytics",
	tags: ["prod"],
	main: { node_type: "DL2S", spark_ui_url: null, spark_master_url: null },
	worker: { node_type: "DL2S", node_count: 3 },
	status: "ready",
	created_at: "2025-01-01T00:00:00+00:00",
	updated_at: "2025-01-01T00:00:00+00:00",
	region: "fr-par",
	has_notebook: true,
	notebook_url: "https://notebook.example",
	notebook_master_url: null,
	spark_version: "3.5.2",
	total_storage: { type: "sbs", size: 107374182400 },
	private_network_id: PN_ID,
};

describe("data-lab module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerDataLabTools(server)).not.toThrow();
	});

	it("registers all 8 Data Lab tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerDataLabTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(8);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toEqual([
			"scaleway_data_lab_list_clusters",
			"scaleway_data_lab_get_cluster",
			"scaleway_data_lab_create_cluster",
			"scaleway_data_lab_update_cluster",
			"scaleway_data_lab_delete_cluster",
			"scaleway_data_lab_list_node_types",
			"scaleway_data_lab_list_cluster_versions",
			"scaleway_data_lab_list_notebook_versions",
		]);
	});
});

describe("data-lab handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListClusters", () => {
		it("returns paginated list of clusters", async () => {
			const { handleListClusters } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockResolvedValue({ datalabs: [sampleCluster], total_count: 1 });

			const result = await handleListClusters({ region: "fr-par", page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "datalab/v1beta1/regions/fr-par/datalabs",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items[0].name).toBe("my-lab");
		});

		it("passes optional filters", async () => {
			const { handleListClusters } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockResolvedValue({ datalabs: [], total_count: 0 });

			await handleListClusters({
				region: "fr-par",
				page: 2,
				pageSize: 10,
				projectId: PROJECT_ID,
				name: "lab",
				tags: ["prod", "spark"],
				orderBy: "name_asc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("page")).toBe("2");
			expect(callArgs.urlParams.get("page_size")).toBe("10");
			expect(callArgs.urlParams.get("project_id")).toBe(PROJECT_ID);
			expect(callArgs.urlParams.get("name")).toBe("lab");
			expect(callArgs.urlParams.get("order_by")).toBe("name_asc");
			expect(callArgs.urlParams.getAll("tags")).toEqual(["prod", "spark"]);
		});

		it("returns error on failure", async () => {
			const { handleListClusters } = await import("../../../src/tools/data-lab/handlers.js");
			const err = new Error("Unauthorized");
			(err as unknown as { statusCode: number }).statusCode = 401;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleListClusters({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleGetCluster", () => {
		it("returns cluster details", async () => {
			const { handleGetCluster } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockResolvedValue(sampleCluster);

			const result = await handleGetCluster({ region: "fr-par", datalabId: CLUSTER_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `datalab/v1beta1/regions/fr-par/datalabs/${CLUSTER_ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("my-lab");
		});

		it("returns error on 404", async () => {
			const { handleGetCluster } = await import("../../../src/tools/data-lab/handlers.js");
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleGetCluster({
				region: "fr-par",
				datalabId: CLUSTER_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleCreateCluster", () => {
		it("creates a cluster with all optional fields", async () => {
			const { handleCreateCluster } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockResolvedValue({ ...sampleCluster, status: "creating" });

			const result = await handleCreateCluster({
				region: "fr-par",
				name: "my-lab",
				sparkVersion: "3.5.2",
				worker: { nodeType: "DL2S", nodeCount: 3 },
				main: { nodeType: "DL2S" },
				description: "analytics",
				tags: ["prod"],
				hasNotebook: true,
				totalStorage: { type: "sbs", size: 107374182400 },
				privateNetworkId: PN_ID,
				projectId: PROJECT_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "datalab/v1beta1/regions/fr-par/datalabs",
				body: JSON.stringify({
					name: "my-lab",
					spark_version: "3.5.2",
					worker: { node_type: "DL2S", node_count: 3 },
					main: { node_type: "DL2S" },
					description: "analytics",
					tags: ["prod"],
					has_notebook: true,
					total_storage: { type: "sbs", size: 107374182400 },
					private_network_id: PN_ID,
					project_id: PROJECT_ID,
				}),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).status).toBe("creating");
		});

		it("creates a minimal cluster with only required fields", async () => {
			const { handleCreateCluster } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockResolvedValue({ id: CLUSTER_ID });

			await handleCreateCluster({
				region: "fr-par",
				name: "minimal",
				sparkVersion: "3.5.2",
				worker: { nodeType: "DL2S", nodeCount: 2 },
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "datalab/v1beta1/regions/fr-par/datalabs",
				body: JSON.stringify({
					name: "minimal",
					spark_version: "3.5.2",
					worker: { node_type: "DL2S", node_count: 2 },
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateCluster } = await import("../../../src/tools/data-lab/handlers.js");
			const err = new Error("Bad request");
			(err as unknown as { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleCreateCluster({
				region: "fr-par",
				name: "bad",
				sparkVersion: "3.5.2",
				worker: { nodeType: "DL2S", nodeCount: 1 },
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateCluster", () => {
		it("updates all mutable fields", async () => {
			const { handleUpdateCluster } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockResolvedValue({ ...sampleCluster, name: "renamed" });

			const result = await handleUpdateCluster({
				region: "fr-par",
				datalabId: CLUSTER_ID,
				name: "renamed",
				description: "new desc",
				tags: ["updated"],
				nodeCount: 5,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `datalab/v1beta1/regions/fr-par/datalabs/${CLUSTER_ID}`,
				body: JSON.stringify({
					name: "renamed",
					description: "new desc",
					tags: ["updated"],
					node_count: 5,
				}),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).name).toBe("renamed");
		});

		it("sends empty body when no fields provided", async () => {
			const { handleUpdateCluster } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockResolvedValue({ id: CLUSTER_ID });

			await handleUpdateCluster({ region: "fr-par", datalabId: CLUSTER_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `datalab/v1beta1/regions/fr-par/datalabs/${CLUSTER_ID}`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateCluster } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockRejectedValue(new Error("Server error"));

			const result: ErrorResult = await handleUpdateCluster({
				region: "fr-par",
				datalabId: CLUSTER_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("server_error");
		});
	});

	describe("handleDeleteCluster", () => {
		it("deletes a cluster and returns the deleting object", async () => {
			const { handleDeleteCluster } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockResolvedValue({ ...sampleCluster, status: "deleting" });

			const result = await handleDeleteCluster({ region: "fr-par", datalabId: CLUSTER_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `datalab/v1beta1/regions/fr-par/datalabs/${CLUSTER_ID}`,
			});
			expect(JSON.parse(result.content[0].text).status).toBe("deleting");
		});

		it("returns error on failure", async () => {
			const { handleDeleteCluster } = await import("../../../src/tools/data-lab/handlers.js");
			const err = new Error("Forbidden");
			(err as unknown as { statusCode: number }).statusCode = 403;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleDeleteCluster({
				region: "fr-par",
				datalabId: CLUSTER_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleListNodeTypes", () => {
		it("returns paginated node types with order_by", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockResolvedValue({
				node_types: [
					{
						stock_status: "available",
						name: "DL2S",
						description: "Data Lab small",
						vcpus: 8,
						memory_gigabytes: 32,
						vram_gigabytes: 0,
						gpus: 0,
						disabled: false,
						beta: false,
						targets: ["worker"],
					},
				],
				total_count: 1,
			});

			const result = await handleListNodeTypes({
				region: "fr-par",
				page: 1,
				pageSize: 50,
				orderBy: "vcpus_desc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.method).toBe("GET");
			expect(callArgs.path).toBe("datalab/v1beta1/regions/fr-par/node-types");
			expect(callArgs.urlParams.get("order_by")).toBe("vcpus_desc");
			expect(JSON.parse(result.content[0].text).items[0].name).toBe("DL2S");
		});

		it("returns error on failure", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/data-lab/handlers.js");
			const err = new Error("Rate limited");
			(err as unknown as { statusCode: number }).statusCode = 429;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleListNodeTypes({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("rate_limited");
		});
	});

	describe("handleListClusterVersions", () => {
		it("returns paginated cluster versions", async () => {
			const { handleListClusterVersions } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockResolvedValue({
				clusters: [
					{
						name: "spark",
						description: "Apache Spark",
						versions: [{ version: "3.5.2", disabled: false, beta: false }],
					},
				],
				total_count: 1,
			});

			const result = await handleListClusterVersions({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "datalab/v1beta1/regions/fr-par/cluster-versions",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			expect(JSON.parse(result.content[0].text).items[0].name).toBe("spark");
		});

		it("returns error on failure", async () => {
			const { handleListClusterVersions } = await import("../../../src/tools/data-lab/handlers.js");
			mockFetch.mockRejectedValue(new Error("boom"));

			const result: ErrorResult = await handleListClusterVersions({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
		});
	});

	describe("handleListNotebookVersions", () => {
		it("returns paginated notebook versions", async () => {
			const { handleListNotebookVersions } = await import(
				"../../../src/tools/data-lab/handlers.js"
			);
			mockFetch.mockResolvedValue({
				notebooks: [{ version: "7.2.0", disabled: false, beta: false }],
				total_count: 1,
			});

			const result = await handleListNotebookVersions({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "datalab/v1beta1/regions/fr-par/notebook-versions",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			expect(JSON.parse(result.content[0].text).items[0].version).toBe("7.2.0");
		});

		it("returns error on failure", async () => {
			const { handleListNotebookVersions } = await import(
				"../../../src/tools/data-lab/handlers.js"
			);
			mockFetch.mockRejectedValue(new Error("boom"));

			const result: ErrorResult = await handleListNotebookVersions({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
		});
	});
});
