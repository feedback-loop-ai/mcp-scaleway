import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateDatabase,
	handleCreateDeployment,
	handleCreateEndpoint,
	handleCreateUser,
	handleDeleteDatabase,
	handleDeleteDeployment,
	handleDeleteEndpoint,
	handleDeleteUser,
	handleGetDeployment,
	handleGetDeploymentCertificate,
	handleListDatabases,
	handleListDeployments,
	handleListPresets,
	handleListUsers,
	handleListVersions,
	handleStartDeployment,
	handleStopDeployment,
	handleUpdateDeployment,
	handleUpdateUser,
} from "./handlers.js";
import {
	CreateDatabaseParams,
	CreateDeploymentParams,
	CreateEndpointParams,
	CreateUserParams,
	DeleteDatabaseParams,
	DeleteDeploymentParams,
	DeleteEndpointParams,
	DeleteUserParams,
	GetDeploymentCertificateParams,
	GetDeploymentParams,
	ListDatabasesParams,
	ListDeploymentsParams,
	ListPresetsParams,
	ListUsersParams,
	ListVersionsParams,
	StartDeploymentParams,
	StopDeploymentParams,
	UpdateDeploymentParams,
	UpdateUserParams,
} from "./types.js";

export function registerDataWarehouseTools(server: McpServer): void {
	// --- Deployments ---
	server.tool(
		"scaleway_data_warehouse_list_deployments",
		"List Data Warehouse for ClickHouse® deployments in a region, with optional filtering by project, organization, name, tags, and ordering",
		ListDeploymentsParams.shape,
		async (params) => handleListDeployments(ListDeploymentsParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_get_deployment",
		"Get details of a specific Data Warehouse deployment by ID",
		GetDeploymentParams.shape,
		async (params) => handleGetDeployment(GetDeploymentParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_create_deployment",
		"Create a new Data Warehouse for ClickHouse® deployment",
		CreateDeploymentParams.shape,
		async (params) => handleCreateDeployment(CreateDeploymentParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_update_deployment",
		"Update a Data Warehouse deployment (name, tags, CPU range, replicas, move factor)",
		UpdateDeploymentParams.shape,
		async (params) => handleUpdateDeployment(UpdateDeploymentParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_delete_deployment",
		"Delete a Data Warehouse deployment by ID (permanent, all data is lost)",
		DeleteDeploymentParams.shape,
		async (params) => handleDeleteDeployment(DeleteDeploymentParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_start_deployment",
		"Start a stopped Data Warehouse deployment",
		StartDeploymentParams.shape,
		async (params) => handleStartDeployment(StartDeploymentParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_stop_deployment",
		"Stop a running Data Warehouse deployment",
		StopDeploymentParams.shape,
		async (params) => handleStopDeployment(StopDeploymentParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_get_deployment_certificate",
		"Retrieve the TLS certificate associated with a Data Warehouse deployment",
		GetDeploymentCertificateParams.shape,
		async (params) => handleGetDeploymentCertificate(GetDeploymentCertificateParams.parse(params)),
	);

	// --- Databases ---
	server.tool(
		"scaleway_data_warehouse_list_databases",
		"List databases within a Data Warehouse deployment",
		ListDatabasesParams.shape,
		async (params) => handleListDatabases(ListDatabasesParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_create_database",
		"Create a new database within a Data Warehouse deployment",
		CreateDatabaseParams.shape,
		async (params) => handleCreateDatabase(CreateDatabaseParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_delete_database",
		"Delete a database from a Data Warehouse deployment by name",
		DeleteDatabaseParams.shape,
		async (params) => handleDeleteDatabase(DeleteDatabaseParams.parse(params)),
	);

	// --- Users ---
	server.tool(
		"scaleway_data_warehouse_list_users",
		"List users associated with a Data Warehouse deployment",
		ListUsersParams.shape,
		async (params) => handleListUsers(ListUsersParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_create_user",
		"Create a new user for a Data Warehouse deployment",
		CreateUserParams.shape,
		async (params) => handleCreateUser(CreateUserParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_update_user",
		"Update an existing Data Warehouse user's password or admin permissions",
		UpdateUserParams.shape,
		async (params) => handleUpdateUser(UpdateUserParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_delete_user",
		"Delete a user from a Data Warehouse deployment by name",
		DeleteUserParams.shape,
		async (params) => handleDeleteUser(DeleteUserParams.parse(params)),
	);

	// --- Endpoints ---
	server.tool(
		"scaleway_data_warehouse_create_endpoint",
		"Create a new public or Private Network endpoint for a Data Warehouse deployment",
		CreateEndpointParams.shape,
		async (params) => handleCreateEndpoint(CreateEndpointParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_delete_endpoint",
		"Delete an endpoint from a Data Warehouse deployment by ID",
		DeleteEndpointParams.shape,
		async (params) => handleDeleteEndpoint(DeleteEndpointParams.parse(params)),
	);

	// --- Presets & Versions ---
	server.tool(
		"scaleway_data_warehouse_list_presets",
		"List available Data Warehouse deployment configuration presets in a region",
		ListPresetsParams.shape,
		async (params) => handleListPresets(ListPresetsParams.parse(params)),
	);

	server.tool(
		"scaleway_data_warehouse_list_versions",
		"List available ClickHouse® versions for Data Warehouse deployments in a region",
		ListVersionsParams.shape,
		async (params) => handleListVersions(ListVersionsParams.parse(params)),
	);
}
