import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateDeployment,
	handleCreateEndpoint,
	handleCreateUser,
	handleDeleteDeployment,
	handleDeleteEndpoint,
	handleDeleteUser,
	handleGetCertificateAuthority,
	handleGetDeployment,
	handleListDeployments,
	handleListNodeTypes,
	handleListUsers,
	handleListVersions,
	handleUpdateDeployment,
	handleUpdateUser,
	handleUpgradeDeployment,
} from "./handlers.js";
import {
	CreateDeploymentParams,
	CreateEndpointParams,
	CreateUserParams,
	DeleteDeploymentParams,
	DeleteEndpointParams,
	DeleteUserParams,
	GetCertificateAuthorityParams,
	GetDeploymentParams,
	ListDeploymentsParams,
	ListNodeTypesParams,
	ListUsersParams,
	ListVersionsParams,
	UpdateDeploymentParams,
	UpdateUserParams,
	UpgradeDeploymentParams,
} from "./types.js";

export function registerOpensearchTools(server: McpServer): void {
	// --- Deployments ---
	server.tool(
		"scaleway_opensearch_list_deployments",
		"List Cloud Essentials for OpenSearch deployments in a Scaleway region, with optional filtering by project, organization, name or tags",
		ListDeploymentsParams.shape,
		async (params) => handleListDeployments(ListDeploymentsParams.parse(params)),
	);

	server.tool(
		"scaleway_opensearch_get_deployment",
		"Get details of a specific OpenSearch deployment by ID",
		GetDeploymentParams.shape,
		async (params) => handleGetDeployment(GetDeploymentParams.parse(params)),
	);

	server.tool(
		"scaleway_opensearch_create_deployment",
		"Create a new OpenSearch deployment with a node type, version, optional volume and endpoints",
		CreateDeploymentParams.shape,
		async (params) => handleCreateDeployment(CreateDeploymentParams.parse(params)),
	);

	server.tool(
		"scaleway_opensearch_update_deployment",
		"Update an OpenSearch deployment (rename or change tags)",
		UpdateDeploymentParams.shape,
		async (params) => handleUpdateDeployment(UpdateDeploymentParams.parse(params)),
	);

	server.tool(
		"scaleway_opensearch_upgrade_deployment",
		"Upgrade an OpenSearch deployment by scaling node count or increasing volume size (exactly one)",
		UpgradeDeploymentParams.shape,
		async (params) => handleUpgradeDeployment(UpgradeDeploymentParams.parse(params)),
	);

	server.tool(
		"scaleway_opensearch_delete_deployment",
		"Delete an OpenSearch deployment by ID",
		DeleteDeploymentParams.shape,
		async (params) => handleDeleteDeployment(DeleteDeploymentParams.parse(params)),
	);

	server.tool(
		"scaleway_opensearch_get_certificate_authority",
		"Download the Certificate Authority (CA) of an OpenSearch deployment",
		GetCertificateAuthorityParams.shape,
		async (params) => handleGetCertificateAuthority(GetCertificateAuthorityParams.parse(params)),
	);

	// --- Node types & versions ---
	server.tool(
		"scaleway_opensearch_list_node_types",
		"List available OpenSearch node types in a region with their specs and stock status",
		ListNodeTypesParams.shape,
		async (params) => handleListNodeTypes(ListNodeTypesParams.parse(params)),
	);

	server.tool(
		"scaleway_opensearch_list_versions",
		"List available OpenSearch versions in a region",
		ListVersionsParams.shape,
		async (params) => handleListVersions(ListVersionsParams.parse(params)),
	);

	// --- Users ---
	server.tool(
		"scaleway_opensearch_list_users",
		"List users of an OpenSearch deployment",
		ListUsersParams.shape,
		async (params) => handleListUsers(ListUsersParams.parse(params)),
	);

	server.tool(
		"scaleway_opensearch_create_user",
		"Create a new user on an OpenSearch deployment",
		CreateUserParams.shape,
		async (params) => handleCreateUser(CreateUserParams.parse(params)),
	);

	server.tool(
		"scaleway_opensearch_update_user",
		"Update an OpenSearch deployment user (e.g. change password)",
		UpdateUserParams.shape,
		async (params) => handleUpdateUser(UpdateUserParams.parse(params)),
	);

	server.tool(
		"scaleway_opensearch_delete_user",
		"Delete a user from an OpenSearch deployment",
		DeleteUserParams.shape,
		async (params) => handleDeleteUser(DeleteUserParams.parse(params)),
	);

	// --- Endpoints ---
	server.tool(
		"scaleway_opensearch_create_endpoint",
		"Create a new endpoint (public or Private Network) on an OpenSearch deployment",
		CreateEndpointParams.shape,
		async (params) => handleCreateEndpoint(CreateEndpointParams.parse(params)),
	);

	server.tool(
		"scaleway_opensearch_delete_endpoint",
		"Delete an endpoint from an OpenSearch deployment",
		DeleteEndpointParams.shape,
		async (params) => handleDeleteEndpoint(DeleteEndpointParams.parse(params)),
	);
}
