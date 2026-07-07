import { z } from "zod";
import { ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

/**
 * Resource types that can appear on an audit event.
 * Source: Scaleway Audit Trail SDK `ResourceType` enum (v1alpha1).
 */
export const AuditTrailResourceType = z.enum([
	"unknown_type",
	"secm_secret",
	"secm_secret_version",
	"kube_cluster",
	"kube_pool",
	"kube_node",
	"kube_acl",
	"keym_key",
	"iam_user",
	"iam_application",
	"iam_group",
	"iam_policy",
	"iam_api_key",
	"iam_ssh_key",
	"iam_rule",
	"iam_saml",
	"iam_saml_certificate",
	"iam_scim",
	"iam_scim_token",
	"secret_manager_secret",
	"secret_manager_version",
	"key_manager_key",
	"account_user",
	"account_organization",
	"account_project",
	"account_contract_signature",
	"instance_server",
	"instance_placement_group",
	"instance_security_group",
	"instance_volume",
	"instance_snapshot",
	"instance_image",
	"instance_template",
	"apple_silicon_server",
	"baremetal_server",
	"baremetal_setting",
	"ipam_ip",
	"sbs_volume",
	"sbs_snapshot",
	"load_balancer_lb",
	"load_balancer_ip",
	"load_balancer_frontend",
	"load_balancer_backend",
	"load_balancer_route",
	"load_balancer_acl",
	"load_balancer_certificate",
	"sfs_filesystem",
	"vpc_private_network",
	"vpc_vpc",
	"vpc_subnet",
	"vpc_route",
	"vpc_acl",
	"edge_services_plan",
	"edge_services_pipeline",
	"edge_services_dns_stage",
	"edge_services_tls_stage",
	"edge_services_cache_stage",
	"edge_services_route_stage",
	"edge_services_route_rules",
	"edge_services_waf_stage",
	"edge_services_backend_stage",
	"s2s_vpn_gateway",
	"s2s_customer_gateway",
	"s2s_routing_policy",
	"s2s_connection",
	"vpc_gw_gateway",
	"vpc_gw_gateway_network",
	"vpc_gw_dhcp",
	"vpc_gw_dhcp_entry",
	"vpc_gw_pat_rule",
	"vpc_gw_ip",
	"audit_trail_export_job",
	"rdb_instance",
	"rdb_instance_backup",
	"rdb_instance_endpoint",
	"rdb_instance_logs",
	"rdb_instance_read_replica",
	"rdb_instance_snapshot",
]);
export type AuditTrailResourceType = z.infer<typeof AuditTrailResourceType>;

export const ListEventsOrderBy = z.enum(["recorded_at_desc", "recorded_at_asc"]);
export type ListEventsOrderBy = z.infer<typeof ListEventsOrderBy>;

export const ListExportJobsOrderBy = z.enum(["created_at_asc", "created_at_desc"]);
export type ListExportJobsOrderBy = z.infer<typeof ListExportJobsOrderBy>;

// --- Entity schemas (response shapes) ---

export const EventPrincipal = z.object({
	id: z.string(),
});
export type EventPrincipal = z.infer<typeof EventPrincipal>;

/**
 * A resource referenced by an audit event. Beyond the common fields, the API
 * attaches a product-specific `*_info` object (one per resource type); those
 * extra keys are tolerated by the schema (unknown keys are stripped, not rejected).
 */
export const AuditTrailResource = z.object({
	id: z.string(),
	type: AuditTrailResourceType,
	name: z.string().nullable().optional(),
	created_at: z.string().datetime({ offset: true }).nullable().optional(),
	updated_at: z.string().datetime({ offset: true }).nullable().optional(),
	deleted_at: z.string().datetime({ offset: true }).nullable().optional(),
});
export type AuditTrailResource = z.infer<typeof AuditTrailResource>;

export const AuditEvent = z.object({
	id: z.string(),
	recorded_at: z.string().datetime({ offset: true }).nullable().optional(),
	locality: z.string(),
	principal: EventPrincipal.nullable().optional(),
	organization_id: z.string().uuid(),
	project_id: z.string().uuid().nullable().optional(),
	source_ip: z.string(),
	user_agent: z.string().nullable().optional(),
	product_name: z.string(),
	service_name: z.string(),
	method_name: z.string(),
	resources: z.array(AuditTrailResource),
	request_id: z.string(),
	request_body: z.record(z.unknown()).nullable().optional(),
	status_code: z.number().int(),
});
export type AuditEvent = z.infer<typeof AuditEvent>;

export const ListEventsResponse = z.object({
	events: z.array(AuditEvent),
	next_page_token: z.string().nullable().optional(),
});
export type ListEventsResponse = z.infer<typeof ListEventsResponse>;

export const ProductService = z.object({
	name: z.string(),
	methods: z.array(z.string()),
});
export type ProductService = z.infer<typeof ProductService>;

export const Product = z.object({
	title: z.string(),
	name: z.string(),
	services: z.array(ProductService),
});
export type Product = z.infer<typeof Product>;

export const ListProductsResponse = z.object({
	products: z.array(Product),
	total_count: z.number().int().nonnegative(),
});
export type ListProductsResponse = z.infer<typeof ListProductsResponse>;

export const ExportJobS3 = z.object({
	bucket: z.string(),
	region: z.string(),
	prefix: z.string().nullable().optional(),
	project_id: z.string().uuid().nullable().optional(),
});
export type ExportJobS3 = z.infer<typeof ExportJobS3>;

export const ExportJobStatus = z.object({
	status_code: z.string(),
});
export type ExportJobStatus = z.infer<typeof ExportJobStatus>;

export const ExportJob = z.object({
	id: z.string().uuid(),
	organization_id: z.string().uuid(),
	name: z.string(),
	s3: ExportJobS3.nullable().optional(),
	created_at: z.string().datetime({ offset: true }).nullable().optional(),
	last_run_at: z.string().datetime({ offset: true }).nullable().optional(),
	tags: z.array(z.string()),
	last_status: ExportJobStatus.nullable().optional(),
});
export type ExportJob = z.infer<typeof ExportJob>;

export const ListExportJobsResponse = z.object({
	export_jobs: z.array(ExportJob),
	total_count: z.number().int().nonnegative(),
});
export type ListExportJobsResponse = z.infer<typeof ListExportJobsResponse>;

// --- Tool input schemas ---

export const ListAuditTrailEventsParams = z.object({
	region: ScalewayRegion.describe("Region to query events in (fr-par, nl-ams, pl-waw)"),
	organizationId: z.string().uuid().describe("Organization ID to list events for"),
	projectId: z.string().uuid().optional().describe("Filter events by project ID"),
	resourceType: AuditTrailResourceType.optional().describe("Filter by resource type"),
	methodName: z.string().optional().describe("Filter by API method name (e.g. CreateServer)"),
	status: z
		.number()
		.int()
		.optional()
		.describe("Filter by HTTP status code of the request (e.g. 200, 403)"),
	recordedAfter: z
		.string()
		.datetime({ offset: true })
		.optional()
		.describe("Only return events recorded after this RFC3339 timestamp"),
	recordedBefore: z
		.string()
		.datetime({ offset: true })
		.optional()
		.describe("Only return events recorded before this RFC3339 timestamp"),
	productName: z.string().optional().describe("Filter by Scaleway product name (e.g. instance)"),
	serviceName: z.string().optional().describe("Filter by API service name"),
	resourceId: z.string().optional().describe("Filter by a specific resource ID"),
	principalId: z.string().optional().describe("Filter by the principal (user/application) ID"),
	sourceIp: z.string().optional().describe("Filter by the source IP address of the request"),
	orderBy: ListEventsOrderBy.optional().describe("Sort order (default recorded_at_desc)"),
	pageSize: z
		.number()
		.int()
		.min(1)
		.max(100)
		.optional()
		.describe("Number of events to return (1-100)"),
	pageToken: z.string().optional().describe("Pagination cursor returned by a previous call"),
});
export type ListAuditTrailEventsParams = z.infer<typeof ListAuditTrailEventsParams>;

export const ListAuditTrailProductsParams = z.object({
	region: ScalewayRegion.describe("Region to query products in (fr-par, nl-ams, pl-waw)"),
	organizationId: z.string().uuid().describe("Organization ID to list integrated products for"),
});
export type ListAuditTrailProductsParams = z.infer<typeof ListAuditTrailProductsParams>;

export const ListAuditTrailExportJobsParams = z.object({
	region: ScalewayRegion.describe("Region of the export jobs (fr-par, nl-ams, pl-waw)"),
	organizationId: z.string().uuid().describe("Organization ID to list export jobs for"),
	name: z.string().optional().describe("Filter export jobs by name"),
	tags: z.array(z.string()).optional().describe("Filter export jobs by tags"),
	orderBy: ListExportJobsOrderBy.optional().describe("Sort order (default created_at_desc)"),
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	pageSize: z
		.number()
		.int()
		.min(1)
		.max(100)
		.optional()
		.default(50)
		.describe("Items per page (1-100)"),
});
export type ListAuditTrailExportJobsParams = z.infer<typeof ListAuditTrailExportJobsParams>;

export const CreateAuditTrailExportJobParams = z.object({
	region: ScalewayRegion.describe("Region to create the export job in (fr-par, nl-ams, pl-waw)"),
	organizationId: z.string().uuid().describe("Organization ID owning the export job"),
	name: z.string().min(1).describe("Name for the export job"),
	s3Bucket: z.string().min(1).describe("Destination Object Storage bucket name"),
	s3Region: ScalewayRegion.describe("Region of the destination Object Storage bucket"),
	s3Prefix: z.string().optional().describe("Optional key prefix within the bucket"),
	s3ProjectId: z
		.string()
		.uuid()
		.optional()
		.describe("Project ID owning the destination bucket (defaults to organization default)"),
	tags: z.array(z.string()).optional().describe("Tags to attach to the export job"),
});
export type CreateAuditTrailExportJobParams = z.infer<typeof CreateAuditTrailExportJobParams>;

export const DeleteAuditTrailExportJobParams = z.object({
	region: ScalewayRegion.describe("Region of the export job (fr-par, nl-ams, pl-waw)"),
	exportJobId: z.string().uuid().describe("ID of the export job to delete"),
});
export type DeleteAuditTrailExportJobParams = z.infer<typeof DeleteAuditTrailExportJobParams>;
