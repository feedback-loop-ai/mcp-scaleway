/**
 * Contract tests for Scaleway Data Lab for Apache Spark API
 *
 * Validates request/response shapes against specs/scaleway-api/data-lab/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 * Official reference: https://www.scaleway.com/en/developers/api/data-lab/
 * API: datalab v1beta1 (region-scoped)
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	Cluster,
	ClusterVersion,
	CreateClusterParams,
	Datalab,
	DatalabStatus,
	DeleteClusterParams,
	GetClusterParams,
	ListClusterVersionsParams,
	ListClustersParams,
	ListNodeTypesParams,
	ListNotebookVersionsParams,
	NodeType,
	NotebookVersion,
	UpdateClusterParams,
	Volume,
} from "../../../src/tools/data-lab/types.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_REGION = "fr-par";

const validCluster = {
	id: VALID_UUID,
	project_id: VALID_UUID,
	name: "analytics-lab",
	description: "spark analytics",
	tags: ["prod"],
	main: {
		node_type: "DL2S",
		spark_ui_url: "https://ui.example",
		spark_master_url: "spark://master:7077",
		root_volume: { type: "sbs", size: 53687091200 },
	},
	worker: {
		node_type: "DL2S",
		node_count: 3,
		root_volume: { type: "sbs", size: 53687091200 },
	},
	status: "ready" as const,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	region: VALID_REGION,
	has_notebook: true,
	notebook_url: "https://notebook.example",
	notebook_master_url: null,
	spark_version: "3.5.2",
	total_storage: { type: "sbs", size: 107374182400 },
	private_network_id: VALID_UUID,
};

const validNodeType = {
	stock_status: "available" as const,
	name: "DL2S",
	description: "Data Lab small worker",
	vcpus: 8,
	memory_gigabytes: 32,
	vram_gigabytes: 0,
	gpus: 0,
	disabled: false,
	beta: false,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-01-01T00:00:00Z",
	targets: ["worker" as const],
};

const validClusterVersion = {
	version: "3.5.2",
	end_of_life: "2027-01-01T00:00:00Z",
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-01-01T00:00:00Z",
	disabled: false,
	beta: false,
};

const validNotebookVersion = {
	version: "7.2.0",
	end_of_life: null,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-01-01T00:00:00Z",
	disabled: false,
	beta: false,
};

/**
 * API: GET /datalab/v1beta1/regions/{region}/datalabs
 * Spec: specs/scaleway-api/data-lab/api-reference.md#list-clusters
 */
describe("contract: ListClusters", () => {
	const ListClustersResponse = z.object({
		datalabs: z.array(Datalab),
		total_count: z.number().int(),
	});

	it("validates a list clusters response", () => {
		expect(() =>
			ListClustersResponse.parse({ datalabs: [validCluster], total_count: 1 }),
		).not.toThrow();
	});

	it("validates an empty response", () => {
		expect(() => ListClustersResponse.parse({ datalabs: [], total_count: 0 })).not.toThrow();
	});

	it("rejects a response missing the datalabs array", () => {
		expect(() => ListClustersResponse.parse({ total_count: 0 })).toThrow();
	});

	it("validates the request shape with all filters", () => {
		expect(() =>
			ListClustersParams.parse({
				region: VALID_REGION,
				projectId: VALID_UUID,
				name: "lab",
				tags: ["prod"],
				orderBy: "created_at_desc",
			}),
		).not.toThrow();
	});

	it("rejects an invalid order_by value", () => {
		expect(() => ListClustersParams.parse({ region: VALID_REGION, orderBy: "size_asc" })).toThrow();
	});
});

/**
 * API: GET /datalab/v1beta1/regions/{region}/datalabs/{datalab_id}
 * Spec: specs/scaleway-api/data-lab/api-reference.md#get-cluster
 */
describe("contract: GetCluster / Datalab entity", () => {
	it("validates a cluster response", () => {
		expect(() => Datalab.parse(validCluster)).not.toThrow();
	});

	it("validates all cluster statuses", () => {
		for (const status of [
			"unknown_status",
			"creating",
			"updating",
			"ready",
			"error",
			"deleting",
			"locked",
			"deleted",
		]) {
			expect(() => Datalab.parse({ ...validCluster, status })).not.toThrow();
			expect(() => DatalabStatus.parse(status)).not.toThrow();
		}
	});

	it("rejects an invalid cluster status", () => {
		expect(() => Datalab.parse({ ...validCluster, status: "running" })).toThrow();
	});

	it("validates a cluster without notebook and nullable optional fields", () => {
		const minimal = {
			id: VALID_UUID,
			project_id: VALID_UUID,
			name: "min",
			tags: [],
			status: "ready" as const,
			region: VALID_REGION,
			has_notebook: false,
			spark_version: "3.5.2",
		};
		expect(() => Datalab.parse(minimal)).not.toThrow();
	});

	it("validates the request shape", () => {
		expect(() =>
			GetClusterParams.parse({ region: VALID_REGION, datalabId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /datalab/v1beta1/regions/{region}/datalabs
 * Spec: specs/scaleway-api/data-lab/api-reference.md#create-cluster
 */
describe("contract: CreateCluster request shape", () => {
	it("validates a minimal create request", () => {
		expect(() =>
			CreateClusterParams.parse({
				region: VALID_REGION,
				name: "lab",
				sparkVersion: "3.5.2",
				worker: { nodeType: "DL2S", nodeCount: 2 },
			}),
		).not.toThrow();
	});

	it("validates a full create request", () => {
		expect(() =>
			CreateClusterParams.parse({
				region: VALID_REGION,
				name: "lab",
				sparkVersion: "3.5.2",
				worker: { nodeType: "DL2S", nodeCount: 2 },
				main: { nodeType: "DL2S" },
				description: "d",
				tags: ["t"],
				hasNotebook: true,
				totalStorage: { type: "sbs", size: 107374182400 },
				privateNetworkId: VALID_UUID,
				projectId: VALID_UUID,
			}),
		).not.toThrow();
	});

	it("rejects a create request missing required fields", () => {
		expect(() => CreateClusterParams.parse({ region: VALID_REGION })).toThrow();
		expect(() =>
			CreateClusterParams.parse({ region: VALID_REGION, name: "x", sparkVersion: "3.5.2" }),
		).toThrow();
	});

	it("rejects a worker node count of zero", () => {
		expect(() =>
			CreateClusterParams.parse({
				region: VALID_REGION,
				name: "lab",
				sparkVersion: "3.5.2",
				worker: { nodeType: "DL2S", nodeCount: 0 },
			}),
		).toThrow();
	});
});

/**
 * API: PATCH /datalab/v1beta1/regions/{region}/datalabs/{datalab_id}
 * Spec: specs/scaleway-api/data-lab/api-reference.md#update-cluster
 */
describe("contract: UpdateCluster request shape", () => {
	it("validates an update with all optional fields", () => {
		expect(() =>
			UpdateClusterParams.parse({
				region: VALID_REGION,
				datalabId: VALID_UUID,
				name: "new",
				description: "d",
				tags: ["t"],
				nodeCount: 5,
			}),
		).not.toThrow();
	});

	it("validates an update with no optional fields", () => {
		expect(() =>
			UpdateClusterParams.parse({ region: VALID_REGION, datalabId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: DELETE /datalab/v1beta1/regions/{region}/datalabs/{datalab_id}
 * Spec: specs/scaleway-api/data-lab/api-reference.md#delete-cluster
 */
describe("contract: DeleteCluster request shape", () => {
	it("validates a delete request", () => {
		expect(() =>
			DeleteClusterParams.parse({ region: VALID_REGION, datalabId: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects a delete request missing the datalab_id", () => {
		expect(() => DeleteClusterParams.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: GET /datalab/v1beta1/regions/{region}/node-types
 * Spec: specs/scaleway-api/data-lab/api-reference.md#list-node-types
 */
describe("contract: ListNodeTypes", () => {
	const ListNodeTypesResponse = z.object({
		node_types: z.array(NodeType),
		total_count: z.number().int(),
	});

	it("validates a node types response", () => {
		expect(() =>
			ListNodeTypesResponse.parse({ node_types: [validNodeType], total_count: 1 }),
		).not.toThrow();
	});

	it("validates all stock statuses", () => {
		for (const status of ["unknown_stock", "low_stock", "out_of_stock", "available"]) {
			expect(() => NodeType.parse({ ...validNodeType, stock_status: status })).not.toThrow();
		}
	});

	it("validates all node type targets", () => {
		for (const target of ["unknown_target", "notebook", "worker"]) {
			expect(() => NodeType.parse({ ...validNodeType, targets: [target] })).not.toThrow();
		}
	});

	it("rejects an invalid stock status", () => {
		expect(() => NodeType.parse({ ...validNodeType, stock_status: "sold_out" })).toThrow();
	});

	it("validates the request with order_by", () => {
		expect(() =>
			ListNodeTypesParams.parse({ region: VALID_REGION, orderBy: "gpus_desc" }),
		).not.toThrow();
	});
});

/**
 * API: GET /datalab/v1beta1/regions/{region}/cluster-versions
 * Spec: specs/scaleway-api/data-lab/api-reference.md#list-cluster-versions
 */
describe("contract: ListClusterVersions", () => {
	const ListClusterVersionsResponse = z.object({
		clusters: z.array(Cluster),
		total_count: z.number().int(),
	});

	const validClusterOffering = {
		name: "spark",
		description: "Apache Spark",
		versions: [validClusterVersion],
	};

	it("validates a cluster versions response", () => {
		expect(() =>
			ListClusterVersionsResponse.parse({ clusters: [validClusterOffering], total_count: 1 }),
		).not.toThrow();
	});

	it("validates the Cluster and ClusterVersion entities", () => {
		expect(() => Cluster.parse(validClusterOffering)).not.toThrow();
		expect(() => ClusterVersion.parse(validClusterVersion)).not.toThrow();
	});

	it("validates the request shape", () => {
		expect(() => ListClusterVersionsParams.parse({ region: VALID_REGION })).not.toThrow();
	});
});

/**
 * API: GET /datalab/v1beta1/regions/{region}/notebook-versions
 * Spec: specs/scaleway-api/data-lab/api-reference.md#list-notebook-versions
 */
describe("contract: ListNotebookVersions", () => {
	const ListNotebookVersionsResponse = z.object({
		notebooks: z.array(NotebookVersion),
		total_count: z.number().int(),
	});

	it("validates a notebook versions response", () => {
		expect(() =>
			ListNotebookVersionsResponse.parse({ notebooks: [validNotebookVersion], total_count: 1 }),
		).not.toThrow();
	});

	it("validates the NotebookVersion entity", () => {
		expect(() => NotebookVersion.parse(validNotebookVersion)).not.toThrow();
	});

	it("validates the request shape", () => {
		expect(() => ListNotebookVersionsParams.parse({ region: VALID_REGION })).not.toThrow();
	});
});

/**
 * Shared value object: Volume (storage)
 */
describe("contract: Volume entity", () => {
	it("validates a volume", () => {
		expect(() => Volume.parse({ type: "sbs", size: 53687091200 })).not.toThrow();
	});

	it("rejects a negative size", () => {
		expect(() => Volume.parse({ type: "sbs", size: -1 })).toThrow();
	});
});

// --- Pagination & auth contracts ---

describe("contract: pagination parameters", () => {
	it("applies default pagination values", () => {
		const result = ListClustersParams.parse({ region: VALID_REGION });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("accepts custom pagination", () => {
		const result = ListClustersParams.parse({ region: VALID_REGION, page: 3, pageSize: 25 });
		expect(result.page).toBe(3);
		expect(result.pageSize).toBe(25);
	});

	it("rejects a page size over 100", () => {
		expect(() => ListClustersParams.parse({ region: VALID_REGION, pageSize: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListClustersParams.parse({ region: VALID_REGION, page: 0 })).toThrow();
	});
});

describe("contract: authentication & region", () => {
	it("requires a region for all operations", () => {
		expect(() => ListClustersParams.parse({})).toThrow();
		expect(() => GetClusterParams.parse({ datalabId: VALID_UUID })).toThrow();
		expect(() => ListNodeTypesParams.parse({})).toThrow();
		expect(() => ListClusterVersionsParams.parse({})).toThrow();
		expect(() => ListNotebookVersionsParams.parse({})).toThrow();
	});

	it("validates the region format (xx-xxx)", () => {
		expect(() => ListClustersParams.parse({ region: "fr-par" })).not.toThrow();
		expect(() => ListClustersParams.parse({ region: "it-mil" })).not.toThrow();
		expect(() => ListClustersParams.parse({ region: "invalid-region" })).toThrow();
	});
});
