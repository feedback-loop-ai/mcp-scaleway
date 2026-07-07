import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateCluster,
	handleCreateEndpoint,
	handleDeleteCluster,
	handleDeleteEndpoint,
	handleGetCluster,
	handleGetClusterCertificateAuthority,
	handleListClusters,
	handleListNodeTypes,
	handleListUsers,
	handleListVersions,
	handleRenewClusterCertificateAuthority,
	handleUpdateCluster,
	handleUpdateUser,
} from "./handlers.js";
import {
	CreateClusterParams,
	CreateEndpointParams,
	DeleteClusterParams,
	DeleteEndpointParams,
	GetClusterCertificateAuthorityParams,
	GetClusterParams,
	ListClustersParams,
	ListNodeTypesParams,
	ListUsersParams,
	ListVersionsParams,
	RenewClusterCertificateAuthorityParams,
	UpdateClusterParams,
	UpdateUserParams,
} from "./types.js";

export function registerKafkaTools(server: McpServer): void {
	server.tool(
		"scaleway_kafka_list_clusters",
		"List Clusters for Apache Kafka in a Scaleway region with optional filtering by project, organization, name, or tags",
		ListClustersParams.shape,
		async (params) => handleListClusters(ListClustersParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_get_cluster",
		"Get details of a specific Kafka cluster by ID",
		GetClusterParams.shape,
		async (params) => handleGetCluster(GetClusterParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_create_cluster",
		"Create a new Cluster for Apache Kafka with the given version, node type, node amount, and volume",
		CreateClusterParams.shape,
		async (params) => handleCreateCluster(CreateClusterParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_update_cluster",
		"Update a Kafka cluster (rename or replace tags)",
		UpdateClusterParams.shape,
		async (params) => handleUpdateCluster(UpdateClusterParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_delete_cluster",
		"Delete a Kafka cluster by ID",
		DeleteClusterParams.shape,
		async (params) => handleDeleteCluster(DeleteClusterParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_get_cluster_certificate_authority",
		"Get the TLS certificate authority (PEM) for a Kafka cluster",
		GetClusterCertificateAuthorityParams.shape,
		async (params) =>
			handleGetClusterCertificateAuthority(GetClusterCertificateAuthorityParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_renew_cluster_certificate_authority",
		"Renew the TLS certificate authority for a Kafka cluster",
		RenewClusterCertificateAuthorityParams.shape,
		async (params) =>
			handleRenewClusterCertificateAuthority(RenewClusterCertificateAuthorityParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_create_endpoint",
		"Create a new endpoint (private network or public network) for a Kafka cluster",
		CreateEndpointParams.shape,
		async (params) => handleCreateEndpoint(CreateEndpointParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_delete_endpoint",
		"Delete a Kafka cluster endpoint by ID",
		DeleteEndpointParams.shape,
		async (params) => handleDeleteEndpoint(DeleteEndpointParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_list_users",
		"List users of a Kafka cluster",
		ListUsersParams.shape,
		async (params) => handleListUsers(ListUsersParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_update_user",
		"Update a Kafka cluster user (e.g. change password)",
		UpdateUserParams.shape,
		async (params) => handleUpdateUser(UpdateUserParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_list_node_types",
		"List available node types for Clusters for Apache Kafka in a region",
		ListNodeTypesParams.shape,
		async (params) => handleListNodeTypes(ListNodeTypesParams.parse(params)),
	);

	server.tool(
		"scaleway_kafka_list_versions",
		"List available Apache Kafka versions in a region",
		ListVersionsParams.shape,
		async (params) => handleListVersions(ListVersionsParams.parse(params)),
	);
}
