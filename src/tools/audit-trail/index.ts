import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateAuditTrailExportJob,
	handleDeleteAuditTrailExportJob,
	handleListAuditTrailEvents,
	handleListAuditTrailExportJobs,
	handleListAuditTrailProducts,
} from "./handlers.js";
import {
	CreateAuditTrailExportJobParams,
	DeleteAuditTrailExportJobParams,
	ListAuditTrailEventsParams,
	ListAuditTrailExportJobsParams,
	ListAuditTrailProductsParams,
} from "./types.js";

export function registerAuditTrailTools(server: McpServer): void {
	server.tool(
		"scaleway_audit_trail_list_events",
		"List Scaleway Audit Trail events for an organization, with rich filters (resource type, method, HTTP status, date ranges, principal, product/service, source IP). Cursor-paginated.",
		ListAuditTrailEventsParams.shape,
		async (params) => handleListAuditTrailEvents(ListAuditTrailEventsParams.parse(params)),
	);

	server.tool(
		"scaleway_audit_trail_list_products",
		"List the Scaleway products integrated with Audit Trail for an organization, including their services and tracked methods",
		ListAuditTrailProductsParams.shape,
		async (params) => handleListAuditTrailProducts(ListAuditTrailProductsParams.parse(params)),
	);

	server.tool(
		"scaleway_audit_trail_list_export_jobs",
		"List Audit Trail export jobs (scheduled exports of events to Object Storage) for an organization",
		ListAuditTrailExportJobsParams.shape,
		async (params) => handleListAuditTrailExportJobs(ListAuditTrailExportJobsParams.parse(params)),
	);

	server.tool(
		"scaleway_audit_trail_create_export_job",
		"Create an Audit Trail export job that exports events to a Scaleway Object Storage (S3) bucket",
		CreateAuditTrailExportJobParams.shape,
		async (params) =>
			handleCreateAuditTrailExportJob(CreateAuditTrailExportJobParams.parse(params)),
	);

	server.tool(
		"scaleway_audit_trail_delete_export_job",
		"Delete an Audit Trail export job by ID",
		DeleteAuditTrailExportJobParams.shape,
		async (params) =>
			handleDeleteAuditTrailExportJob(DeleteAuditTrailExportJobParams.parse(params)),
	);
}
