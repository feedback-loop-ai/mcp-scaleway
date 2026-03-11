import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateBackendStage,
	handleCreateCacheStage,
	handleCreateDNSStage,
	handleCreatePipeline,
	handleCreateTLSStage,
	handleDeleteBackendStage,
	handleDeleteCacheStage,
	handleDeleteDNSStage,
	handleDeletePipeline,
	handleDeleteTLSStage,
	handleGetBackendStage,
	handleGetCacheStage,
	handleGetDNSStage,
	handleGetPipeline,
	handleGetPurgeRequest,
	handleGetTLSStage,
	handleListBackendStages,
	handleListCacheStages,
	handleListDNSStages,
	handleListPipelines,
	handleListPurgeRequests,
	handleListTLSStages,
	handlePurgeCache,
	handleUpdateBackendStage,
	handleUpdateCacheStage,
	handleUpdateDNSStage,
	handleUpdatePipeline,
	handleUpdateTLSStage,
} from "./handlers.js";
import {
	CreateBackendStageParams,
	CreateCacheStageParams,
	CreateDNSStageParams,
	CreatePipelineParams,
	CreatePurgeRequestParams,
	CreateTLSStageParams,
	DeleteBackendStageParams,
	DeleteCacheStageParams,
	DeleteDNSStageParams,
	DeletePipelineParams,
	DeleteTLSStageParams,
	GetBackendStageParams,
	GetCacheStageParams,
	GetDNSStageParams,
	GetPipelineParams,
	GetPurgeRequestParams,
	GetTLSStageParams,
	ListBackendStagesParams,
	ListCacheStagesParams,
	ListDNSStagesParams,
	ListPipelinesParams,
	ListPurgeRequestsParams,
	ListTLSStagesParams,
	UpdateBackendStageParams,
	UpdateCacheStageParams,
	UpdateDNSStageParams,
	UpdatePipelineParams,
	UpdateTLSStageParams,
} from "./types.js";

export function registerEdgeServicesTools(server: McpServer): void {
	// ── Pipeline Tools ──────────────────────────────────────────────────────

	server.tool(
		"scaleway_edge_services_list_pipelines",
		"List all Edge Services pipelines with optional filtering by name and project",
		ListPipelinesParams.shape,
		handleListPipelines,
	);

	server.tool(
		"scaleway_edge_services_get_pipeline",
		"Get details of a specific Edge Services pipeline",
		GetPipelineParams.shape,
		handleGetPipeline,
	);

	server.tool(
		"scaleway_edge_services_create_pipeline",
		"Create a new Edge Services pipeline",
		CreatePipelineParams.shape,
		handleCreatePipeline,
	);

	server.tool(
		"scaleway_edge_services_update_pipeline",
		"Update an existing Edge Services pipeline",
		UpdatePipelineParams.shape,
		handleUpdatePipeline,
	);

	server.tool(
		"scaleway_edge_services_delete_pipeline",
		"Delete an Edge Services pipeline and all linked stages",
		DeletePipelineParams.shape,
		handleDeletePipeline,
	);

	// ── DNS Stage Tools ─────────────────────────────────────────────────────

	server.tool(
		"scaleway_edge_services_list_dns_stages",
		"List all DNS stages for a pipeline",
		ListDNSStagesParams.shape,
		handleListDNSStages,
	);

	server.tool(
		"scaleway_edge_services_get_dns_stage",
		"Get details of a specific DNS stage",
		GetDNSStageParams.shape,
		handleGetDNSStage,
	);

	server.tool(
		"scaleway_edge_services_create_dns_stage",
		"Create a new DNS stage with custom domain names",
		CreateDNSStageParams.shape,
		handleCreateDNSStage,
	);

	server.tool(
		"scaleway_edge_services_update_dns_stage",
		"Update an existing DNS stage",
		UpdateDNSStageParams.shape,
		handleUpdateDNSStage,
	);

	server.tool(
		"scaleway_edge_services_delete_dns_stage",
		"Delete an existing DNS stage",
		DeleteDNSStageParams.shape,
		handleDeleteDNSStage,
	);

	// ── TLS Stage Tools ─────────────────────────────────────────────────────

	server.tool(
		"scaleway_edge_services_list_tls_stages",
		"List all TLS stages for a pipeline",
		ListTLSStagesParams.shape,
		handleListTLSStages,
	);

	server.tool(
		"scaleway_edge_services_get_tls_stage",
		"Get details of a specific TLS stage",
		GetTLSStageParams.shape,
		handleGetTLSStage,
	);

	server.tool(
		"scaleway_edge_services_create_tls_stage",
		"Create a new TLS stage with managed or custom certificate",
		CreateTLSStageParams.shape,
		handleCreateTLSStage,
	);

	server.tool(
		"scaleway_edge_services_update_tls_stage",
		"Update an existing TLS stage",
		UpdateTLSStageParams.shape,
		handleUpdateTLSStage,
	);

	server.tool(
		"scaleway_edge_services_delete_tls_stage",
		"Delete an existing TLS stage",
		DeleteTLSStageParams.shape,
		handleDeleteTLSStage,
	);

	// ── Cache Stage Tools ───────────────────────────────────────────────────

	server.tool(
		"scaleway_edge_services_list_cache_stages",
		"List all cache stages for a pipeline",
		ListCacheStagesParams.shape,
		handleListCacheStages,
	);

	server.tool(
		"scaleway_edge_services_get_cache_stage",
		"Get details of a specific cache stage",
		GetCacheStageParams.shape,
		handleGetCacheStage,
	);

	server.tool(
		"scaleway_edge_services_create_cache_stage",
		"Create a new cache stage with TTL and cookie settings",
		CreateCacheStageParams.shape,
		handleCreateCacheStage,
	);

	server.tool(
		"scaleway_edge_services_update_cache_stage",
		"Update an existing cache stage",
		UpdateCacheStageParams.shape,
		handleUpdateCacheStage,
	);

	server.tool(
		"scaleway_edge_services_delete_cache_stage",
		"Delete an existing cache stage",
		DeleteCacheStageParams.shape,
		handleDeleteCacheStage,
	);

	// ── Backend Stage Tools ─────────────────────────────────────────────────

	server.tool(
		"scaleway_edge_services_list_backend_stages",
		"List all backend stages for a pipeline",
		ListBackendStagesParams.shape,
		handleListBackendStages,
	);

	server.tool(
		"scaleway_edge_services_get_backend_stage",
		"Get details of a specific backend stage",
		GetBackendStageParams.shape,
		handleGetBackendStage,
	);

	server.tool(
		"scaleway_edge_services_create_backend_stage",
		"Create a new backend stage linked to S3 or Load Balancer origin",
		CreateBackendStageParams.shape,
		handleCreateBackendStage,
	);

	server.tool(
		"scaleway_edge_services_update_backend_stage",
		"Update an existing backend stage",
		UpdateBackendStageParams.shape,
		handleUpdateBackendStage,
	);

	server.tool(
		"scaleway_edge_services_delete_backend_stage",
		"Delete an existing backend stage",
		DeleteBackendStageParams.shape,
		handleDeleteBackendStage,
	);

	// ── Purge Request Tools ─────────────────────────────────────────────────

	server.tool(
		"scaleway_edge_services_purge_cache",
		"Purge cached content for specific assets or all content in a pipeline",
		CreatePurgeRequestParams.shape,
		handlePurgeCache,
	);

	server.tool(
		"scaleway_edge_services_list_purge_requests",
		"List all cache purge requests with optional filtering",
		ListPurgeRequestsParams.shape,
		handleListPurgeRequests,
	);

	server.tool(
		"scaleway_edge_services_get_purge_request",
		"Get details of a specific cache purge request",
		GetPurgeRequestParams.shape,
		handleGetPurgeRequest,
	);
}
