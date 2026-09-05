import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateContainer,
	handleCreateCron,
	handleCreateDomain,
	handleCreateNamespace,
	handleDeleteContainer,
	handleDeleteCron,
	handleDeleteDomain,
	handleDeleteNamespace,
	handleGetContainer,
	handleGetNamespace,
	handleListContainers,
	handleListCrons,
	handleListDomains,
	handleListNamespaces,
	handleUpdateContainer,
	handleUpdateCron,
	handleUpdateNamespace,
} from "./handlers.js";
import {
	CreateContainerParams,
	CreateCronParams,
	CreateDomainParams,
	CreateNamespaceParams,
	DeleteContainerParams,
	DeleteCronParams,
	DeleteDomainParams,
	DeleteNamespaceParams,
	GetContainerParams,
	GetNamespaceParams,
	ListContainersParams,
	ListCronsParams,
	ListDomainsParams,
	ListNamespacesParams,
	UpdateContainerParams,
	UpdateCronParams,
	UpdateNamespaceParams,
} from "./types.js";

export function registerContainersTools(server: McpServer): void {
	// ─── Namespace Tools ──────────────────────────────────────────

	server.tool(
		"scaleway_containers_list_namespaces",
		"List serverless container namespaces in a region with pagination",
		ListNamespacesParams.shape,
		async (params) => handleListNamespaces(ListNamespacesParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_get_namespace",
		"Get details of a serverless container namespace",
		GetNamespaceParams.shape,
		async (params) => handleGetNamespace(GetNamespaceParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_create_namespace",
		"Create a new serverless container namespace",
		CreateNamespaceParams.shape,
		async (params) => handleCreateNamespace(CreateNamespaceParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_update_namespace",
		"Update a serverless container namespace",
		UpdateNamespaceParams.shape,
		async (params) => handleUpdateNamespace(UpdateNamespaceParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_delete_namespace",
		"Delete a serverless container namespace",
		DeleteNamespaceParams.shape,
		async (params) => handleDeleteNamespace(DeleteNamespaceParams.parse(params)),
	);

	// ─── Container Tools ──────────────────────────────────────────

	server.tool(
		"scaleway_containers_list_containers",
		"List serverless containers in a namespace with pagination",
		ListContainersParams.shape,
		async (params) => handleListContainers(ListContainersParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_get_container",
		"Get details of a serverless container (raw v1 fields: image, memory_limit_bytes, mvcpu_limit, public_endpoint)",
		GetContainerParams.shape,
		async (params) => handleGetContainer(GetContainerParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_create_container",
		"Create a new serverless container in a namespace",
		CreateContainerParams.shape,
		async (params) => handleCreateContainer(CreateContainerParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_update_container",
		"Update a serverless container configuration",
		UpdateContainerParams.shape,
		async (params) => handleUpdateContainer(UpdateContainerParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_delete_container",
		"Delete a serverless container",
		DeleteContainerParams.shape,
		async (params) => handleDeleteContainer(DeleteContainerParams.parse(params)),
	);

	// ─── Cron Tools ───────────────────────────────────────────────

	server.tool(
		"scaleway_containers_list_crons",
		"List cron triggers for a serverless container",
		ListCronsParams.shape,
		async (params) => handleListCrons(ListCronsParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_create_cron",
		"Create a v1 cron trigger; JSON args are POSTed to / in UTC unless timezone is specified",
		CreateCronParams.shape,
		async (params) => handleCreateCron(CreateCronParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_update_cron",
		"Update a v1 cron trigger by trigger ID; retargeting containerId is unsupported",
		UpdateCronParams.shape,
		async (params) => handleUpdateCron(UpdateCronParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_delete_cron",
		"Delete a cron trigger for a serverless container",
		DeleteCronParams.shape,
		async (params) => handleDeleteCron(DeleteCronParams.parse(params)),
	);

	// ─── Domain Tools ─────────────────────────────────────────────

	server.tool(
		"scaleway_containers_list_domains",
		"List custom domains for a serverless container",
		ListDomainsParams.shape,
		async (params) => handleListDomains(ListDomainsParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_create_domain",
		"Create a custom domain mapping for a serverless container",
		CreateDomainParams.shape,
		async (params) => handleCreateDomain(CreateDomainParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_delete_domain",
		"Delete a custom domain mapping for a serverless container",
		DeleteDomainParams.shape,
		async (params) => handleDeleteDomain(DeleteDomainParams.parse(params)),
	);
}
