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
		"List serverless container namespaces in a region with pagination. Example: {region: 'fr-par'}",
		ListNamespacesParams.shape,
		async (params) => handleListNamespaces(ListNamespacesParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_get_namespace",
		"Get details of a serverless container namespace. Example: {namespaceId: '11111111-1111-4111-8111-111111111111'}",
		GetNamespaceParams.shape,
		async (params) => handleGetNamespace(GetNamespaceParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_create_namespace",
		"Create a new serverless container namespace. Example: {name: 'api', region: 'fr-par'}",
		CreateNamespaceParams.shape,
		async (params) => handleCreateNamespace(CreateNamespaceParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_update_namespace",
		"Update a serverless container namespace. Example: {namespaceId: '11111111-1111-4111-8111-111111111111', description: 'prod'}",
		UpdateNamespaceParams.shape,
		async (params) => handleUpdateNamespace(UpdateNamespaceParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_delete_namespace",
		"Delete a serverless container namespace. Example: {namespaceId: '11111111-1111-4111-8111-111111111111'}",
		DeleteNamespaceParams.shape,
		async (params) => handleDeleteNamespace(DeleteNamespaceParams.parse(params)),
	);

	// ─── Container Tools ──────────────────────────────────────────

	server.tool(
		"scaleway_containers_list_containers",
		"List serverless containers in a namespace with pagination. Example: {namespaceId: '11111111-1111-4111-8111-111111111111'}",
		ListContainersParams.shape,
		async (params) => handleListContainers(ListContainersParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_get_container",
		"Get details of a serverless container (raw v1 fields: image, memory_limit_bytes, mvcpu_limit, public_endpoint). Example: {containerId: '11111111-1111-4111-8111-111111111111'}",
		GetContainerParams.shape,
		async (params) => handleGetContainer(GetContainerParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_create_container",
		"Create a new serverless container in a namespace. Example: {namespaceId: '11111111-1111-4111-8111-111111111111', name: 'web', registryImage: 'rg.fr-par.scw.cloud/ns/web:1.0', memoryLimit: 512}",
		CreateContainerParams.shape,
		async (params) => handleCreateContainer(CreateContainerParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_update_container",
		"Update a serverless container configuration. Example: {containerId: '11111111-1111-4111-8111-111111111111', minScale: 1, maxScale: 3}",
		UpdateContainerParams.shape,
		async (params) => handleUpdateContainer(UpdateContainerParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_delete_container",
		"Delete a serverless container. Example: {containerId: '11111111-1111-4111-8111-111111111111'}",
		DeleteContainerParams.shape,
		async (params) => handleDeleteContainer(DeleteContainerParams.parse(params)),
	);

	// ─── Cron Tools ───────────────────────────────────────────────

	server.tool(
		"scaleway_containers_list_crons",
		"List cron triggers for a serverless container. Example: {containerId: '11111111-1111-4111-8111-111111111111'}",
		ListCronsParams.shape,
		async (params) => handleListCrons(ListCronsParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_create_cron",
		"Create a v1 cron trigger; JSON args are POSTed to / in UTC unless timezone is specified. Example: {containerId: '11111111-1111-4111-8111-111111111111', schedule: '0 * * * *', args: {job: 'sync'}}",
		CreateCronParams.shape,
		async (params) => handleCreateCron(CreateCronParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_update_cron",
		"Update a v1 cron trigger by trigger ID; retargeting containerId is unsupported. Example: {cronId: '11111111-1111-4111-8111-111111111111', schedule: '*/15 * * * *'}",
		UpdateCronParams.shape,
		async (params) => handleUpdateCron(UpdateCronParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_delete_cron",
		"Delete a cron trigger for a serverless container. Example: {cronId: '11111111-1111-4111-8111-111111111111'}",
		DeleteCronParams.shape,
		async (params) => handleDeleteCron(DeleteCronParams.parse(params)),
	);

	// ─── Domain Tools ─────────────────────────────────────────────

	server.tool(
		"scaleway_containers_list_domains",
		"List custom domains for a serverless container. Example: {containerId: '11111111-1111-4111-8111-111111111111'}",
		ListDomainsParams.shape,
		async (params) => handleListDomains(ListDomainsParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_create_domain",
		"Create a custom domain mapping for a serverless container. Example: {containerId: '11111111-1111-4111-8111-111111111111', hostname: 'app.example.com'}",
		CreateDomainParams.shape,
		async (params) => handleCreateDomain(CreateDomainParams.parse(params)),
	);

	server.tool(
		"scaleway_containers_delete_domain",
		"Delete a custom domain mapping for a serverless container. Example: {domainId: '11111111-1111-4111-8111-111111111111'}",
		DeleteDomainParams.shape,
		async (params) => handleDeleteDomain(DeleteDomainParams.parse(params)),
	);
}
