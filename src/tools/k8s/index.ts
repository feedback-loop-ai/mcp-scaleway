import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
} from "./handlers.js";
import {
	ListClusterAvailableVersionsInput as AvailableVersionsInput,
	CreateClusterInput,
	CreatePoolInput,
	DeleteClusterInput,
	DeletePoolInput,
	GetClusterInput,
	GetClusterKubeconfigInput,
	GetPoolInput,
	ListClustersInput,
	ListPoolsInput,
	UpdatePoolInput,
	UpgradeClusterInput,
	UpgradePoolInput,
} from "./types.js";

export function registerK8sTools(server: McpServer): void {
	// --- Cluster Tools ---

	server.tool(
		"scaleway_k8s_list_clusters",
		"List Kubernetes clusters in a Scaleway region. Supports pagination and filtering by name, status, type, and project.",
		ListClustersInput.shape,
		async (params) => handleListClusters(ListClustersInput.parse(params)),
	);

	server.tool(
		"scaleway_k8s_get_cluster",
		"Get details of a specific Kubernetes cluster by its ID.",
		GetClusterInput.shape,
		async (params) => handleGetCluster(GetClusterInput.parse(params)),
	);

	server.tool(
		"scaleway_k8s_create_cluster",
		"Create a new Kubernetes cluster (Kapsule or Kosmos) with the specified version, CNI, and configuration.",
		CreateClusterInput.shape,
		async (params) => handleCreateCluster(CreateClusterInput.parse(params)),
	);

	server.tool(
		"scaleway_k8s_delete_cluster",
		"Delete a Kubernetes cluster. Optionally delete associated resources like load balancers and volumes.",
		DeleteClusterInput.shape,
		async (params) => handleDeleteCluster(DeleteClusterInput.parse(params)),
	);

	server.tool(
		"scaleway_k8s_upgrade_cluster",
		"Upgrade a Kubernetes cluster to a newer version. Optionally upgrade all node pools simultaneously.",
		UpgradeClusterInput.shape,
		async (params) => handleUpgradeCluster(UpgradeClusterInput.parse(params)),
	);

	server.tool(
		"scaleway_k8s_list_cluster_available_versions",
		"List available Kubernetes versions that a cluster can be upgraded to.",
		AvailableVersionsInput.shape,
		async (params) => handleListClusterAvailableVersions(AvailableVersionsInput.parse(params)),
	);

	server.tool(
		"scaleway_k8s_get_cluster_kubeconfig",
		"Retrieve the kubeconfig file content for a Kubernetes cluster.",
		GetClusterKubeconfigInput.shape,
		async (params) => handleGetClusterKubeconfig(GetClusterKubeconfigInput.parse(params)),
	);

	// --- Node Pool Tools ---

	server.tool(
		"scaleway_k8s_list_pools",
		"List node pools for a Kubernetes cluster. Supports pagination and filtering by name and status.",
		ListPoolsInput.shape,
		async (params) => handleListPools(ListPoolsInput.parse(params)),
	);

	server.tool(
		"scaleway_k8s_get_pool",
		"Get details of a specific node pool by its ID.",
		GetPoolInput.shape,
		async (params) => handleGetPool(GetPoolInput.parse(params)),
	);

	server.tool(
		"scaleway_k8s_create_pool",
		"Create a new node pool in a Kubernetes cluster with the specified node type, size, and autoscaling configuration.",
		CreatePoolInput.shape,
		async (params) => handleCreatePool(CreatePoolInput.parse(params)),
	);

	server.tool(
		"scaleway_k8s_update_pool",
		"Update a node pool's size, autoscaling configuration, or tags.",
		UpdatePoolInput.shape,
		async (params) => handleUpdatePool(UpdatePoolInput.parse(params)),
	);

	server.tool(
		"scaleway_k8s_delete_pool",
		"Delete a node pool from a Kubernetes cluster.",
		DeletePoolInput.shape,
		async (params) => handleDeletePool(DeletePoolInput.parse(params)),
	);

	server.tool(
		"scaleway_k8s_upgrade_pool",
		"Upgrade a node pool to a specific Kubernetes version.",
		UpgradePoolInput.shape,
		async (params) => handleUpgradePool(UpgradePoolInput.parse(params)),
	);
}
