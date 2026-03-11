import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleAddBackendServers,
	handleCreateBackend,
	handleCreateCertificate,
	handleCreateFrontend,
	handleCreateLb,
	handleCreateRoute,
	handleDeleteBackend,
	handleDeleteCertificate,
	handleDeleteFrontend,
	handleDeleteLb,
	handleDeleteRoute,
	handleGetBackend,
	handleGetCertificate,
	handleGetFrontend,
	handleGetLb,
	handleGetLbStats,
	handleGetRoute,
	handleListBackends,
	handleListCertificates,
	handleListFrontends,
	handleListLbTypes,
	handleListLbs,
	handleListRoutes,
	handleMigrateLb,
	handleRemoveBackendServers,
	handleSetBackendServers,
	handleUpdateBackend,
	handleUpdateCertificate,
	handleUpdateFrontend,
	handleUpdateLb,
	handleUpdateRoute,
} from "./handlers.js";
import {
	AddBackendServersParams,
	CreateBackendParams,
	CreateCertificateParams,
	CreateFrontendParams,
	CreateLbParams,
	CreateRouteParams,
	DeleteBackendParams,
	DeleteCertificateParams,
	DeleteFrontendParams,
	DeleteLbParams,
	DeleteRouteParams,
	GetBackendParams,
	GetCertificateParams,
	GetFrontendParams,
	GetLbParams,
	GetLbStatsParams,
	GetRouteParams,
	ListBackendsParams,
	ListCertificatesParams,
	ListFrontendsParams,
	ListLbTypesParams,
	ListLbsParams,
	ListRoutesParams,
	MigrateLbParams,
	RemoveBackendServersParams,
	SetBackendServersParams,
	UpdateBackendParams,
	UpdateCertificateParams,
	UpdateFrontendParams,
	UpdateLbParams,
	UpdateRouteParams,
} from "./types.js";

export function registerLbTools(server: McpServer): void {
	// ─── LB CRUD ────────────────────────────────────────────────────────────

	server.tool(
		"scaleway_lb_list_lbs",
		"List load balancers in a zone with optional filters",
		ListLbsParams.shape,
		handleListLbs,
	);

	server.tool(
		"scaleway_lb_get_lb",
		"Get a specific load balancer by ID",
		GetLbParams.shape,
		handleGetLb,
	);

	server.tool(
		"scaleway_lb_create_lb",
		"Create a new load balancer",
		CreateLbParams.shape,
		handleCreateLb,
	);

	server.tool(
		"scaleway_lb_update_lb",
		"Update an existing load balancer",
		UpdateLbParams.shape,
		handleUpdateLb,
	);

	server.tool(
		"scaleway_lb_delete_lb",
		"Delete a load balancer",
		DeleteLbParams.shape,
		handleDeleteLb,
	);

	server.tool(
		"scaleway_lb_migrate_lb",
		"Migrate a load balancer to a different type",
		MigrateLbParams.shape,
		handleMigrateLb,
	);

	// ─── Frontend management ────────────────────────────────────────────────

	server.tool(
		"scaleway_lb_list_frontends",
		"List frontends for a load balancer",
		ListFrontendsParams.shape,
		handleListFrontends,
	);

	server.tool(
		"scaleway_lb_get_frontend",
		"Get a specific frontend by ID",
		GetFrontendParams.shape,
		handleGetFrontend,
	);

	server.tool(
		"scaleway_lb_create_frontend",
		"Create a frontend for a load balancer",
		CreateFrontendParams.shape,
		handleCreateFrontend,
	);

	server.tool(
		"scaleway_lb_update_frontend",
		"Update an existing frontend",
		UpdateFrontendParams.shape,
		handleUpdateFrontend,
	);

	server.tool(
		"scaleway_lb_delete_frontend",
		"Delete a frontend",
		DeleteFrontendParams.shape,
		handleDeleteFrontend,
	);

	// ─── Backend management ────────────────────────────────────────────────

	server.tool(
		"scaleway_lb_list_backends",
		"List backends for a load balancer",
		ListBackendsParams.shape,
		handleListBackends,
	);

	server.tool(
		"scaleway_lb_get_backend",
		"Get a specific backend by ID",
		GetBackendParams.shape,
		handleGetBackend,
	);

	server.tool(
		"scaleway_lb_create_backend",
		"Create a backend for a load balancer",
		CreateBackendParams.shape,
		handleCreateBackend,
	);

	server.tool(
		"scaleway_lb_update_backend",
		"Update an existing backend",
		UpdateBackendParams.shape,
		handleUpdateBackend,
	);

	server.tool(
		"scaleway_lb_delete_backend",
		"Delete a backend",
		DeleteBackendParams.shape,
		handleDeleteBackend,
	);

	server.tool(
		"scaleway_lb_add_backend_servers",
		"Add server IPs to a backend",
		AddBackendServersParams.shape,
		handleAddBackendServers,
	);

	server.tool(
		"scaleway_lb_remove_backend_servers",
		"Remove server IPs from a backend",
		RemoveBackendServersParams.shape,
		handleRemoveBackendServers,
	);

	server.tool(
		"scaleway_lb_set_backend_servers",
		"Set the complete list of server IPs for a backend",
		SetBackendServersParams.shape,
		handleSetBackendServers,
	);

	// ─── Route management ──────────────────────────────────────────────────

	server.tool(
		"scaleway_lb_list_routes",
		"List routes with optional frontend filter",
		ListRoutesParams.shape,
		handleListRoutes,
	);

	server.tool(
		"scaleway_lb_get_route",
		"Get a specific route by ID",
		GetRouteParams.shape,
		handleGetRoute,
	);

	server.tool(
		"scaleway_lb_create_route",
		"Create a route for a frontend",
		CreateRouteParams.shape,
		handleCreateRoute,
	);

	server.tool(
		"scaleway_lb_update_route",
		"Update an existing route",
		UpdateRouteParams.shape,
		handleUpdateRoute,
	);

	server.tool(
		"scaleway_lb_delete_route",
		"Delete a route",
		DeleteRouteParams.shape,
		handleDeleteRoute,
	);

	// ─── Certificate management ────────────────────────────────────────────

	server.tool(
		"scaleway_lb_list_certificates",
		"List certificates for a load balancer",
		ListCertificatesParams.shape,
		handleListCertificates,
	);

	server.tool(
		"scaleway_lb_get_certificate",
		"Get a specific certificate by ID",
		GetCertificateParams.shape,
		handleGetCertificate,
	);

	server.tool(
		"scaleway_lb_create_certificate",
		"Create a certificate for a load balancer",
		CreateCertificateParams.shape,
		handleCreateCertificate,
	);

	server.tool(
		"scaleway_lb_update_certificate",
		"Update a certificate name",
		UpdateCertificateParams.shape,
		handleUpdateCertificate,
	);

	server.tool(
		"scaleway_lb_delete_certificate",
		"Delete a certificate",
		DeleteCertificateParams.shape,
		handleDeleteCertificate,
	);

	// ─── Stats & Types ─────────────────────────────────────────────────────

	server.tool(
		"scaleway_lb_get_lb_stats",
		"Get statistics for a load balancer",
		GetLbStatsParams.shape,
		handleGetLbStats,
	);

	server.tool(
		"scaleway_lb_list_lb_types",
		"List available load balancer types in a zone",
		ListLbTypesParams.shape,
		handleListLbTypes,
	);
}
