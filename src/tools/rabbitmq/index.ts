import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateDeployment,
	handleCreateEndpoint,
	handleCreateUser,
	handleDeleteDeployment,
	handleDeleteEndpoint,
	handleDeleteUser,
	handleGetDeployment,
	handleGetDeploymentCertificate,
	handleListDeployments,
	handleListNodeTypes,
	handleListUsers,
	handleListVersions,
	handleUpdateDeployment,
	handleUpdateUser,
	handleUpgradeDeployment,
} from "./handlers.js";
import {
	CreateDeploymentInput,
	CreateEndpointInput,
	CreateUserInput,
	DeleteDeploymentInput,
	DeleteEndpointInput,
	DeleteUserInput,
	GetDeploymentCertificateInput,
	GetDeploymentInput,
	ListDeploymentsInput,
	ListNodeTypesInput,
	ListUsersInput,
	ListVersionsInput,
	UpdateDeploymentInput,
	UpdateUserInput,
	UpgradeDeploymentInput,
	UpgradeDeploymentShape,
} from "./types.js";

export function registerRabbitmqTools(server: McpServer): void {
	// --- Deployments ---
	server.tool(
		"scaleway_rabbitmq_list_deployments",
		"List Scaleway RabbitMQ (Cloud Essentials MessageQ) deployments in a region with optional filtering",
		ListDeploymentsInput.shape,
		async (params) => handleListDeployments(ListDeploymentsInput.parse(params)),
	);

	server.tool(
		"scaleway_rabbitmq_get_deployment",
		"Get details of a specific RabbitMQ deployment by ID",
		GetDeploymentInput.shape,
		async (params) => handleGetDeployment(GetDeploymentInput.parse(params)),
	);

	server.tool(
		"scaleway_rabbitmq_create_deployment",
		"Create a new RabbitMQ deployment (node type, node count, version, optional user and endpoints)",
		CreateDeploymentInput.shape,
		async (params) => handleCreateDeployment(CreateDeploymentInput.parse(params)),
	);

	server.tool(
		"scaleway_rabbitmq_update_deployment",
		"Update a RabbitMQ deployment (rename or update tags)",
		UpdateDeploymentInput.shape,
		async (params) => handleUpdateDeployment(UpdateDeploymentInput.parse(params)),
	);

	server.tool(
		"scaleway_rabbitmq_upgrade_deployment",
		"Upgrade a RabbitMQ deployment by scaling node count or volume size (exactly one)",
		UpgradeDeploymentShape,
		async (params) => handleUpgradeDeployment(UpgradeDeploymentInput.parse(params)),
	);

	server.tool(
		"scaleway_rabbitmq_delete_deployment",
		"Delete a RabbitMQ deployment by ID",
		DeleteDeploymentInput.shape,
		async (params) => handleDeleteDeployment(DeleteDeploymentInput.parse(params)),
	);

	server.tool(
		"scaleway_rabbitmq_get_deployment_certificate",
		"Download the certificate authority for a RabbitMQ deployment",
		GetDeploymentCertificateInput.shape,
		async (params) => handleGetDeploymentCertificate(GetDeploymentCertificateInput.parse(params)),
	);

	// --- Users ---
	server.tool(
		"scaleway_rabbitmq_list_users",
		"List users of a RabbitMQ deployment",
		ListUsersInput.shape,
		async (params) => handleListUsers(ListUsersInput.parse(params)),
	);

	server.tool(
		"scaleway_rabbitmq_create_user",
		"Create a new user on a RabbitMQ deployment",
		CreateUserInput.shape,
		async (params) => handleCreateUser(CreateUserInput.parse(params)),
	);

	server.tool(
		"scaleway_rabbitmq_update_user",
		"Update a RabbitMQ deployment user (e.g. change password)",
		UpdateUserInput.shape,
		async (params) => handleUpdateUser(UpdateUserInput.parse(params)),
	);

	server.tool(
		"scaleway_rabbitmq_delete_user",
		"Delete a user from a RabbitMQ deployment",
		DeleteUserInput.shape,
		async (params) => handleDeleteUser(DeleteUserInput.parse(params)),
	);

	// --- Endpoints ---
	server.tool(
		"scaleway_rabbitmq_create_endpoint",
		"Create a new endpoint (public or private network) for a RabbitMQ deployment",
		CreateEndpointInput.shape,
		async (params) => handleCreateEndpoint(CreateEndpointInput.parse(params)),
	);

	server.tool(
		"scaleway_rabbitmq_delete_endpoint",
		"Delete an endpoint from a RabbitMQ deployment",
		DeleteEndpointInput.shape,
		async (params) => handleDeleteEndpoint(DeleteEndpointInput.parse(params)),
	);

	// --- Node types & versions ---
	server.tool(
		"scaleway_rabbitmq_list_node_types",
		"List available node types for RabbitMQ deployments in a region",
		ListNodeTypesInput.shape,
		async (params) => handleListNodeTypes(ListNodeTypesInput.parse(params)),
	);

	server.tool(
		"scaleway_rabbitmq_list_versions",
		"List available RabbitMQ (MessageQ) versions in a region",
		ListVersionsInput.shape,
		async (params) => handleListVersions(ListVersionsInput.parse(params)),
	);
}
