import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Client } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import {
	handleCreateCron,
	handleCreateDomain,
	handleCreateFunction,
	handleCreateNamespace,
	handleCreateToken,
	handleDeleteCron,
	handleDeleteDomain,
	handleDeleteFunction,
	handleDeleteNamespace,
	handleDeleteToken,
	handleDeployFunction,
	handleGetFunction,
	handleGetNamespace,
	handleListCrons,
	handleListDomains,
	handleListFunctions,
	handleListNamespaces,
	handleUpdateCron,
	handleUpdateFunction,
	handleUpdateNamespace,
} from "./handlers.js";
import {
	CreateCronInput,
	CreateDomainInput,
	CreateFunctionInput,
	CreateNamespaceInput,
	CreateTokenInput,
	DeleteCronInput,
	DeleteDomainInput,
	DeleteFunctionInput,
	DeleteNamespaceInput,
	DeleteTokenInput,
	DeployFunctionInput,
	GetFunctionInput,
	GetNamespaceInput,
	ListCronsInput,
	ListDomainsInput,
	ListFunctionsInput,
	ListNamespacesInput,
	UpdateCronInput,
	UpdateFunctionInput,
	UpdateNamespaceInput,
} from "./types.js";

export function getClient(): Client {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

export function registerFunctionsTools(server: McpServer): void {
	// --- Namespace Tools ---

	server.tool(
		"scaleway_functions_list_namespaces",
		"List all function namespaces in a region",
		ListNamespacesInput.shape,
		async (params) => handleListNamespaces(getClient(), ListNamespacesInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_get_namespace",
		"Get details of a specific function namespace",
		GetNamespaceInput.shape,
		async (params) => handleGetNamespace(getClient(), GetNamespaceInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_create_namespace",
		"Create a new function namespace",
		CreateNamespaceInput.shape,
		async (params) => handleCreateNamespace(getClient(), CreateNamespaceInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_update_namespace",
		"Update an existing function namespace",
		UpdateNamespaceInput.shape,
		async (params) => handleUpdateNamespace(getClient(), UpdateNamespaceInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_delete_namespace",
		"Delete a function namespace",
		DeleteNamespaceInput.shape,
		async (params) => handleDeleteNamespace(getClient(), DeleteNamespaceInput.parse(params)),
	);

	// --- Function Tools ---

	server.tool(
		"scaleway_functions_list_functions",
		"List all functions in a namespace",
		ListFunctionsInput.shape,
		async (params) => handleListFunctions(getClient(), ListFunctionsInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_get_function",
		"Get details of a specific function",
		GetFunctionInput.shape,
		async (params) => handleGetFunction(getClient(), GetFunctionInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_create_function",
		"Create a new function in a namespace",
		CreateFunctionInput.shape,
		async (params) => handleCreateFunction(getClient(), CreateFunctionInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_update_function",
		"Update an existing function",
		UpdateFunctionInput.shape,
		async (params) => handleUpdateFunction(getClient(), UpdateFunctionInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_delete_function",
		"Delete a function",
		DeleteFunctionInput.shape,
		async (params) => handleDeleteFunction(getClient(), DeleteFunctionInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_deploy_function",
		"Deploy a function (trigger build and deployment)",
		DeployFunctionInput.shape,
		async (params) => handleDeployFunction(getClient(), DeployFunctionInput.parse(params)),
	);

	// --- Cron Tools ---

	server.tool(
		"scaleway_functions_list_crons",
		"List all cron triggers for functions",
		ListCronsInput.shape,
		async (params) => handleListCrons(getClient(), ListCronsInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_create_cron",
		"Create a cron trigger for a function",
		CreateCronInput.shape,
		async (params) => handleCreateCron(getClient(), CreateCronInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_update_cron",
		"Update a cron trigger",
		UpdateCronInput.shape,
		async (params) => handleUpdateCron(getClient(), UpdateCronInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_delete_cron",
		"Delete a cron trigger",
		DeleteCronInput.shape,
		async (params) => handleDeleteCron(getClient(), DeleteCronInput.parse(params)),
	);

	// --- Domain Tools ---

	server.tool(
		"scaleway_functions_list_domains",
		"List custom domains attached to functions",
		ListDomainsInput.shape,
		async (params) => handleListDomains(getClient(), ListDomainsInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_create_domain",
		"Attach a custom domain to a function",
		CreateDomainInput.shape,
		async (params) => handleCreateDomain(getClient(), CreateDomainInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_delete_domain",
		"Remove a custom domain from a function",
		DeleteDomainInput.shape,
		async (params) => handleDeleteDomain(getClient(), DeleteDomainInput.parse(params)),
	);

	// --- Token Tools ---

	server.tool(
		"scaleway_functions_create_token",
		"Create an access token for a function",
		CreateTokenInput.shape,
		async (params) => handleCreateToken(getClient(), CreateTokenInput.parse(params)),
	);

	server.tool(
		"scaleway_functions_delete_token",
		"Revoke and delete a function access token",
		DeleteTokenInput.shape,
		async (params) => handleDeleteToken(getClient(), DeleteTokenInput.parse(params)),
	);
}
