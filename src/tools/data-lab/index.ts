import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateCluster,
	handleDeleteCluster,
	handleGetCluster,
	handleListClusterVersions,
	handleListClusters,
	handleListNodeTypes,
	handleListNotebookVersions,
	handleUpdateCluster,
} from "./handlers.js";
import {
	CreateClusterParams,
	DeleteClusterParams,
	GetClusterParams,
	ListClusterVersionsParams,
	ListClustersParams,
	ListNodeTypesParams,
	ListNotebookVersionsParams,
	UpdateClusterParams,
} from "./types.js";

export function registerDataLabTools(server: McpServer): void {
	server.tool(
		"scaleway_data_lab_list_clusters",
		"List Data Lab for Apache Spark clusters in a Scaleway region, with optional filtering by project, name, or tags",
		ListClustersParams.shape,
		async (params) => handleListClusters(ListClustersParams.parse(params)),
	);

	server.tool(
		"scaleway_data_lab_get_cluster",
		"Get details of a specific Data Lab Spark cluster by ID",
		GetClusterParams.shape,
		async (params) => handleGetCluster(GetClusterParams.parse(params)),
	);

	server.tool(
		"scaleway_data_lab_create_cluster",
		"Create a new Data Lab for Apache Spark cluster with worker (and optional main) node configuration",
		CreateClusterParams.shape,
		async (params) => handleCreateCluster(CreateClusterParams.parse(params)),
	);

	server.tool(
		"scaleway_data_lab_update_cluster",
		"Update a Data Lab Spark cluster (rename, retag, or scale the worker node count)",
		UpdateClusterParams.shape,
		async (params) => handleUpdateCluster(UpdateClusterParams.parse(params)),
	);

	server.tool(
		"scaleway_data_lab_delete_cluster",
		"Delete a Data Lab Spark cluster by ID",
		DeleteClusterParams.shape,
		async (params) => handleDeleteCluster(DeleteClusterParams.parse(params)),
	);

	server.tool(
		"scaleway_data_lab_list_node_types",
		"List available Data Lab node types (worker and notebook node configurations) in a region",
		ListNodeTypesParams.shape,
		async (params) => handleListNodeTypes(ListNodeTypesParams.parse(params)),
	);

	server.tool(
		"scaleway_data_lab_list_cluster_versions",
		"List available Apache Spark cluster versions in a region",
		ListClusterVersionsParams.shape,
		async (params) => handleListClusterVersions(ListClusterVersionsParams.parse(params)),
	);

	server.tool(
		"scaleway_data_lab_list_notebook_versions",
		"List available notebook software versions in a region",
		ListNotebookVersionsParams.shape,
		async (params) => handleListNotebookVersions(ListNotebookVersionsParams.parse(params)),
	);
}
