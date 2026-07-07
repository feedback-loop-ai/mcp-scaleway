import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleAddACLRules,
	handleAddEndpoints,
	handleCreateCluster,
	handleDeleteACLRules,
	handleDeleteCluster,
	handleDeleteEndpoints,
	handleGetCluster,
	handleGetClusterCertificate,
	handleGetClusterMetrics,
	handleListClusterVersions,
	handleListClusters,
	handleListNodeTypes,
	handleRenewClusterCertificate,
	handleSetACLRules,
	handleSetEndpoints,
	handleUpdateCluster,
} from "./handlers.js";
import {
	AddACLRulesInput,
	AddEndpointsInput,
	CreateClusterInput,
	DeleteACLRulesInput,
	DeleteClusterInput,
	DeleteEndpointsInput,
	GetClusterCertificateInput,
	GetClusterInput,
	GetClusterMetricsInput,
	ListClusterVersionsInput,
	ListClustersInput,
	ListNodeTypesInput,
	RenewClusterCertificateInput,
	SetACLRulesInput,
	SetEndpointsInput,
	UpdateClusterInput,
} from "./types.js";

export function registerRedisTools(server: McpServer): void {
	// === Cluster CRUD ===

	server.tool(
		"scaleway_redis_list_clusters",
		"List Redis clusters in a Scaleway zone with filtering and pagination",
		ListClustersInput.shape,
		async (params) => handleListClusters(ListClustersInput.parse(params)),
	);

	server.tool(
		"scaleway_redis_get_cluster",
		"Get details of a specific Redis cluster",
		GetClusterInput.shape,
		async (params) => handleGetCluster(GetClusterInput.parse(params)),
	);

	server.tool(
		"scaleway_redis_create_cluster",
		"Create a new Redis cluster in a Scaleway zone",
		CreateClusterInput.shape,
		async (params) => handleCreateCluster(CreateClusterInput.parse(params)),
	);

	server.tool(
		"scaleway_redis_update_cluster",
		"Update an existing Redis cluster (name, tags, user credentials)",
		UpdateClusterInput.shape,
		async (params) => handleUpdateCluster(UpdateClusterInput.parse(params)),
	);

	server.tool(
		"scaleway_redis_delete_cluster",
		"Delete a Redis cluster",
		DeleteClusterInput.shape,
		async (params) => handleDeleteCluster(DeleteClusterInput.parse(params)),
	);

	// === Metrics & Certificate ===

	server.tool(
		"scaleway_redis_list_cluster_metrics",
		"Get metrics for a Redis cluster (CPU, memory, connections, etc.)",
		GetClusterMetricsInput.shape,
		async (params) => handleGetClusterMetrics(GetClusterMetricsInput.parse(params)),
	);

	server.tool(
		"scaleway_redis_get_cluster_certificate",
		"Get the TLS certificate for a Redis cluster",
		GetClusterCertificateInput.shape,
		async (params) => handleGetClusterCertificate(GetClusterCertificateInput.parse(params)),
	);

	server.tool(
		"scaleway_redis_renew_cluster_certificate",
		"Renew the TLS certificate for a Redis cluster",
		RenewClusterCertificateInput.shape,
		async (params) => handleRenewClusterCertificate(RenewClusterCertificateInput.parse(params)),
	);

	// === ACL Rules ===

	server.tool(
		"scaleway_redis_add_acl_rules",
		"Add ACL rules to a Redis cluster",
		AddACLRulesInput.shape,
		async (params) => handleAddACLRules(AddACLRulesInput.parse(params)),
	);

	server.tool(
		"scaleway_redis_delete_acl_rules",
		"Delete a single Redis ACL rule by its ID",
		DeleteACLRulesInput.shape,
		async (params) => handleDeleteACLRules(DeleteACLRulesInput.parse(params)),
	);

	server.tool(
		"scaleway_redis_set_acl_rules",
		"Set (replace all) ACL rules on a Redis cluster",
		SetACLRulesInput.shape,
		async (params) => handleSetACLRules(SetACLRulesInput.parse(params)),
	);

	// === Endpoints ===

	server.tool(
		"scaleway_redis_add_endpoints",
		"Add endpoints to a Redis cluster",
		AddEndpointsInput.shape,
		async (params) => handleAddEndpoints(AddEndpointsInput.parse(params)),
	);

	server.tool(
		"scaleway_redis_delete_endpoints",
		"Delete an endpoint from a Redis cluster",
		DeleteEndpointsInput.shape,
		async (params) => handleDeleteEndpoints(DeleteEndpointsInput.parse(params)),
	);

	server.tool(
		"scaleway_redis_set_endpoints",
		"Set (replace all) endpoints on a Redis cluster",
		SetEndpointsInput.shape,
		async (params) => handleSetEndpoints(SetEndpointsInput.parse(params)),
	);

	// === Discovery ===

	server.tool(
		"scaleway_redis_list_node_types",
		"List available Redis node types in a zone",
		ListNodeTypesInput.shape,
		async (params) => handleListNodeTypes(ListNodeTypesInput.parse(params)),
	);

	server.tool(
		"scaleway_redis_list_cluster_versions",
		"List available Redis cluster versions in a zone",
		ListClusterVersionsInput.shape,
		async (params) => handleListClusterVersions(ListClusterVersionsInput.parse(params)),
	);
}
