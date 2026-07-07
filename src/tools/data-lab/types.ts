import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Shared value objects ---

/**
 * Storage volume attached to a Data Lab cluster (root or total storage).
 * `size` is expressed in bytes; `type` is a Scaleway Block Storage volume class.
 */
export const Volume = z.object({
	type: z.string(),
	size: z.number().int().nonnegative(),
});
export type Volume = z.infer<typeof Volume>;

// --- Cluster (Datalab) status ---

export const DatalabStatus = z.enum([
	"unknown_status",
	"creating",
	"updating",
	"ready",
	"error",
	"deleting",
	"locked",
	"deleted",
]);
export type DatalabStatus = z.infer<typeof DatalabStatus>;

// --- Node configuration objects ---

export const DatalabSparkMain = z.object({
	node_type: z.string(),
	spark_ui_url: z.string().nullish(),
	spark_master_url: z.string().nullish(),
	root_volume: Volume.nullish(),
});
export type DatalabSparkMain = z.infer<typeof DatalabSparkMain>;

export const DatalabSparkWorker = z.object({
	node_type: z.string(),
	node_count: z.number().int().nonnegative(),
	root_volume: Volume.nullish(),
});
export type DatalabSparkWorker = z.infer<typeof DatalabSparkWorker>;

// --- Cluster (Datalab) entity ---

export const Datalab = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	name: z.string(),
	description: z.string().nullish(),
	tags: z.array(z.string()),
	main: DatalabSparkMain.nullish(),
	worker: DatalabSparkWorker.nullish(),
	status: DatalabStatus,
	created_at: z.string().datetime({ offset: true }).nullish(),
	updated_at: z.string().datetime({ offset: true }).nullish(),
	region: z.string(),
	has_notebook: z.boolean(),
	notebook_url: z.string().nullish(),
	notebook_master_url: z.string().nullish(),
	spark_version: z.string(),
	total_storage: Volume.nullish(),
	private_network_id: z.string().nullish(),
});
export type Datalab = z.infer<typeof Datalab>;

// --- Node types ---

export const NodeTypeStock = z.enum(["unknown_stock", "low_stock", "out_of_stock", "available"]);
export type NodeTypeStock = z.infer<typeof NodeTypeStock>;

export const NodeTypeTarget = z.enum(["unknown_target", "notebook", "worker"]);
export type NodeTypeTarget = z.infer<typeof NodeTypeTarget>;

export const NodeType = z.object({
	stock_status: NodeTypeStock,
	name: z.string(),
	description: z.string(),
	vcpus: z.number().int().nonnegative(),
	memory_gigabytes: z.number().int().nonnegative(),
	vram_gigabytes: z.number().int().nonnegative(),
	gpus: z.number().int().nonnegative(),
	disabled: z.boolean(),
	beta: z.boolean(),
	created_at: z.string().datetime({ offset: true }).nullish(),
	updated_at: z.string().datetime({ offset: true }).nullish(),
	targets: z.array(NodeTypeTarget),
});
export type NodeType = z.infer<typeof NodeType>;

// --- Cluster versions ---

export const ClusterVersion = z.object({
	version: z.string(),
	end_of_life: z.string().datetime({ offset: true }).nullish(),
	created_at: z.string().datetime({ offset: true }).nullish(),
	updated_at: z.string().datetime({ offset: true }).nullish(),
	disabled: z.boolean(),
	beta: z.boolean(),
});
export type ClusterVersion = z.infer<typeof ClusterVersion>;

/**
 * A cluster (Spark) offering: a named software family with its available versions.
 */
export const Cluster = z.object({
	name: z.string(),
	description: z.string().nullish(),
	versions: z.array(ClusterVersion),
});
export type Cluster = z.infer<typeof Cluster>;

// --- Notebook versions ---

export const NotebookVersion = z.object({
	version: z.string(),
	end_of_life: z.string().datetime({ offset: true }).nullish(),
	created_at: z.string().datetime({ offset: true }).nullish(),
	updated_at: z.string().datetime({ offset: true }).nullish(),
	disabled: z.boolean(),
	beta: z.boolean(),
});
export type NotebookVersion = z.infer<typeof NotebookVersion>;

// --- Order-by enums ---

export const ListClustersOrderBy = z.enum([
	"name_asc",
	"name_desc",
	"created_at_asc",
	"created_at_desc",
	"updated_at_asc",
	"updated_at_desc",
]);
export type ListClustersOrderBy = z.infer<typeof ListClustersOrderBy>;

export const ListNodeTypesOrderBy = z.enum([
	"name_asc",
	"name_desc",
	"vcpus_asc",
	"vcpus_desc",
	"memory_gigabytes_asc",
	"memory_gigabytes_desc",
	"vram_bytes_asc",
	"vram_bytes_desc",
	"gpus_asc",
	"gpus_desc",
]);
export type ListNodeTypesOrderBy = z.infer<typeof ListNodeTypesOrderBy>;

// --- Request params ---

export const ListClustersParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list clusters in (e.g. fr-par)"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter clusters by name"),
	tags: z.array(z.string()).optional().describe("Filter clusters by tags"),
	orderBy: ListClustersOrderBy.optional().describe("Order results by field"),
});
export type ListClustersParams = z.infer<typeof ListClustersParams>;

export const ListClustersResponse = z.object({
	datalabs: z.array(Datalab),
	total_count: z.number().int().nonnegative(),
});
export type ListClustersResponse = z.infer<typeof ListClustersResponse>;

export const GetClusterParams = z.object({
	region: ScalewayRegion.describe("Region of the cluster"),
	datalabId: z.string().uuid().describe("ID of the Data Lab cluster"),
});
export type GetClusterParams = z.infer<typeof GetClusterParams>;

const CreateWorkerConfig = z.object({
	nodeType: z.string().min(1).describe("Node type name for worker nodes"),
	nodeCount: z.number().int().positive().describe("Number of worker nodes"),
});

const CreateMainConfig = z.object({
	nodeType: z.string().min(1).describe("Node type name for the main node"),
});

const StorageConfig = z.object({
	type: z.string().min(1).describe("Storage volume type"),
	size: z.number().int().positive().describe("Storage size in bytes"),
});

export const CreateClusterParams = z.object({
	region: ScalewayRegion.describe("Region for the cluster"),
	name: z.string().min(1).describe("Name for the cluster"),
	sparkVersion: z.string().min(1).describe("Spark version to run (see list cluster versions)"),
	worker: CreateWorkerConfig.describe("Worker node configuration"),
	main: CreateMainConfig.optional().describe("Main node configuration"),
	description: z.string().optional().describe("Cluster description"),
	tags: z.array(z.string()).optional().describe("Tags to attach to the cluster"),
	hasNotebook: z.boolean().optional().describe("Whether to provision a notebook"),
	totalStorage: StorageConfig.optional().describe("Total storage configuration"),
	privateNetworkId: z.string().uuid().optional().describe("Private network to attach"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
});
export type CreateClusterParams = z.infer<typeof CreateClusterParams>;

export const UpdateClusterParams = z.object({
	region: ScalewayRegion.describe("Region of the cluster"),
	datalabId: z.string().uuid().describe("ID of the Data Lab cluster"),
	name: z.string().min(1).optional().describe("New name for the cluster"),
	description: z.string().optional().describe("New description for the cluster"),
	tags: z.array(z.string()).optional().describe("Replacement tags for the cluster"),
	nodeCount: z.number().int().positive().optional().describe("New worker node count (scale)"),
});
export type UpdateClusterParams = z.infer<typeof UpdateClusterParams>;

export const DeleteClusterParams = z.object({
	region: ScalewayRegion.describe("Region of the cluster"),
	datalabId: z.string().uuid().describe("ID of the Data Lab cluster to delete"),
});
export type DeleteClusterParams = z.infer<typeof DeleteClusterParams>;

export const ListNodeTypesParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list node types in"),
	orderBy: ListNodeTypesOrderBy.optional().describe("Order results by field"),
});
export type ListNodeTypesParams = z.infer<typeof ListNodeTypesParams>;

export const ListNodeTypesResponse = z.object({
	node_types: z.array(NodeType),
	total_count: z.number().int().nonnegative(),
});
export type ListNodeTypesResponse = z.infer<typeof ListNodeTypesResponse>;

export const ListClusterVersionsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list cluster versions in"),
});
export type ListClusterVersionsParams = z.infer<typeof ListClusterVersionsParams>;

export const ListClusterVersionsResponse = z.object({
	clusters: z.array(Cluster),
	total_count: z.number().int().nonnegative(),
});
export type ListClusterVersionsResponse = z.infer<typeof ListClusterVersionsResponse>;

export const ListNotebookVersionsParams = PaginationParams.extend({
	region: ScalewayRegion.describe("Region to list notebook versions in"),
});
export type ListNotebookVersionsParams = z.infer<typeof ListNotebookVersionsParams>;

export const ListNotebookVersionsResponse = z.object({
	notebooks: z.array(NotebookVersion),
	total_count: z.number().int().nonnegative(),
});
export type ListNotebookVersionsResponse = z.infer<typeof ListNotebookVersionsResponse>;
