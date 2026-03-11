import { z } from "zod";
import { PaginationParams } from "../../shared/types.js";

// ── Enums ──────────────────────────────────────────────────────────────────

export const PipelineStatus = z.enum([
	"unknown_status",
	"ready",
	"error",
	"pending",
	"warning",
	"locked",
]);

export const PurgeRequestStatus = z.enum(["unknown_status", "done", "error", "pending"]);

export const DNSStageType = z.enum(["unknown_type", "auto", "managed", "custom"]);

export const ListPipelinesOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"name_asc",
	"name_desc",
]);

export const ListStagesOrderBy = z.enum(["created_at_asc", "created_at_desc"]);

// ── Pipeline Schemas ───────────────────────────────────────────────────────

export const ListPipelinesParams = PaginationParams.extend({
	name: z.string().optional().describe("Filter pipelines by name"),
	projectId: z.string().optional().describe("Filter by project ID"),
	organizationId: z.string().optional().describe("Filter by organization ID"),
	orderBy: ListPipelinesOrderBy.optional().describe("Sort order"),
});

export const GetPipelineParams = z.object({
	pipelineId: z.string().describe("ID of the pipeline"),
});

export const CreatePipelineParams = z.object({
	name: z.string().describe("Name of the pipeline"),
	description: z.string().describe("Description of the pipeline"),
	projectId: z.string().optional().describe("Project ID"),
});

export const UpdatePipelineParams = z.object({
	pipelineId: z.string().describe("ID of the pipeline to update"),
	name: z.string().optional().describe("New name"),
	description: z.string().optional().describe("New description"),
});

export const DeletePipelineParams = z.object({
	pipelineId: z.string().describe("ID of the pipeline to delete"),
});

// ── DNS Stage Schemas ──────────────────────────────────────────────────────

export const ListDNSStagesParams = PaginationParams.extend({
	pipelineId: z.string().describe("Pipeline ID to filter for"),
	orderBy: ListStagesOrderBy.optional().describe("Sort order"),
	fqdn: z.string().optional().describe("Filter by FQDN"),
});

export const GetDNSStageParams = z.object({
	dnsStageId: z.string().describe("ID of the DNS stage"),
});

export const CreateDNSStageParams = z.object({
	pipelineId: z.string().describe("Pipeline ID"),
	fqdns: z.array(z.string()).optional().describe("Custom Fully Qualified Domain Names"),
	tlsStageId: z.string().optional().describe("Next TLS stage ID"),
	cacheStageId: z.string().optional().describe("Next cache stage ID"),
	backendStageId: z.string().optional().describe("Next backend stage ID"),
});

export const UpdateDNSStageParams = z.object({
	dnsStageId: z.string().describe("ID of the DNS stage to update"),
	fqdns: z.array(z.string()).optional().describe("Custom FQDNs"),
	tlsStageId: z.string().optional().describe("Next TLS stage ID"),
	cacheStageId: z.string().optional().describe("Next cache stage ID"),
	backendStageId: z.string().optional().describe("Next backend stage ID"),
});

export const DeleteDNSStageParams = z.object({
	dnsStageId: z.string().describe("ID of the DNS stage to delete"),
});

// ── TLS Stage Schemas ──────────────────────────────────────────────────────

export const TLSSecretSchema = z.object({
	secretId: z.string().describe("ID of the Secret in Scaleway Secret Manager"),
	region: z.string().describe("Region of the Secret"),
});

export const ListTLSStagesParams = PaginationParams.extend({
	pipelineId: z.string().describe("Pipeline ID to filter for"),
	orderBy: ListStagesOrderBy.optional().describe("Sort order"),
	secretId: z.string().optional().describe("Filter by secret ID"),
	secretRegion: z.string().optional().describe("Filter by secret region"),
});

export const GetTLSStageParams = z.object({
	tlsStageId: z.string().describe("ID of the TLS stage"),
});

export const CreateTLSStageParams = z.object({
	pipelineId: z.string().describe("Pipeline ID"),
	secrets: z.array(TLSSecretSchema).optional().describe("Custom TLS certificate secrets"),
	managedCertificate: z
		.boolean()
		.optional()
		.describe("Use Scaleway-managed Let's Encrypt certificate"),
	cacheStageId: z.string().optional().describe("Next cache stage ID"),
	backendStageId: z.string().optional().describe("Next backend stage ID"),
	routeStageId: z.string().optional().describe("Next route stage ID"),
	wafStageId: z.string().optional().describe("Next WAF stage ID"),
});

export const UpdateTLSStageParams = z.object({
	tlsStageId: z.string().describe("ID of the TLS stage to update"),
	managedCertificate: z.boolean().optional().describe("Use managed certificate"),
	tlsSecretsConfig: z
		.object({
			tlsSecrets: z.array(TLSSecretSchema),
		})
		.optional()
		.describe("TLS secrets configuration"),
	cacheStageId: z.string().optional().describe("Next cache stage ID"),
	backendStageId: z.string().optional().describe("Next backend stage ID"),
	routeStageId: z.string().optional().describe("Next route stage ID"),
	wafStageId: z.string().optional().describe("Next WAF stage ID"),
});

export const DeleteTLSStageParams = z.object({
	tlsStageId: z.string().describe("ID of the TLS stage to delete"),
});

// ── Cache Stage Schemas ────────────────────────────────────────────────────

export const ListCacheStagesParams = PaginationParams.extend({
	pipelineId: z.string().describe("Pipeline ID to filter for"),
	orderBy: ListStagesOrderBy.optional().describe("Sort order"),
});

export const GetCacheStageParams = z.object({
	cacheStageId: z.string().describe("ID of the cache stage"),
});

export const CreateCacheStageParams = z.object({
	pipelineId: z.string().describe("Pipeline ID"),
	fallbackTtl: z.string().optional().describe("TTL in seconds for cached content"),
	includeCookies: z.boolean().optional().describe("Cache responses with cookies"),
	backendStageId: z.string().optional().describe("Next backend stage ID"),
	wafStageId: z.string().optional().describe("Next WAF stage ID"),
	routeStageId: z.string().optional().describe("Next route stage ID"),
});

export const UpdateCacheStageParams = z.object({
	cacheStageId: z.string().describe("ID of the cache stage to update"),
	fallbackTtl: z.string().optional().describe("TTL in seconds"),
	includeCookies: z.boolean().optional().describe("Cache responses with cookies"),
	backendStageId: z.string().optional().describe("Next backend stage ID"),
	wafStageId: z.string().optional().describe("Next WAF stage ID"),
	routeStageId: z.string().optional().describe("Next route stage ID"),
});

export const DeleteCacheStageParams = z.object({
	cacheStageId: z.string().describe("ID of the cache stage to delete"),
});

// ── Backend Stage Schemas ──────────────────────────────────────────────────

export const ScalewayS3ConfigSchema = z.object({
	bucketName: z.string().optional().describe("S3 bucket name"),
	bucketRegion: z.string().optional().describe("S3 bucket region"),
	isWebsite: z.boolean().optional().describe("Whether bucket website feature is enabled"),
});

export const ScalewayLbSchema = z.object({
	id: z.string().describe("Load Balancer ID"),
	zone: z.string().describe("Load Balancer zone"),
	frontendId: z.string().describe("Frontend ID"),
	isSsl: z.boolean().optional().describe("Frontend handles SSL"),
	domainName: z.string().optional().describe("FQDN for HTTP requests to the LB"),
	hasWebsocket: z.boolean().optional().describe("Forward websocket requests"),
});

export const ScalewayLbConfigSchema = z.object({
	lbs: z.array(ScalewayLbSchema).describe("Load Balancer configuration"),
});

export const ListBackendStagesParams = PaginationParams.extend({
	pipelineId: z.string().describe("Pipeline ID to filter for"),
	orderBy: ListStagesOrderBy.optional().describe("Sort order"),
	bucketName: z.string().optional().describe("Filter by bucket name"),
	bucketRegion: z.string().optional().describe("Filter by bucket region"),
	lbId: z.string().optional().describe("Filter by Load Balancer ID"),
});

export const GetBackendStageParams = z.object({
	backendStageId: z.string().describe("ID of the backend stage"),
});

export const CreateBackendStageParams = z.object({
	pipelineId: z.string().describe("Pipeline ID"),
	scalewayS3: ScalewayS3ConfigSchema.optional().describe("S3 bucket origin"),
	scalewayLb: ScalewayLbConfigSchema.optional().describe("Load Balancer origin"),
});

export const UpdateBackendStageParams = z.object({
	backendStageId: z.string().describe("ID of the backend stage to update"),
	pipelineId: z.string().describe("Pipeline ID"),
	scalewayS3: ScalewayS3ConfigSchema.optional().describe("S3 bucket origin"),
	scalewayLb: ScalewayLbConfigSchema.optional().describe("Load Balancer origin"),
});

export const DeleteBackendStageParams = z.object({
	backendStageId: z.string().describe("ID of the backend stage to delete"),
});

// ── Purge Request Schemas ──────────────────────────────────────────────────

export const ListPurgeRequestsOrderBy = z.enum(["created_at_asc", "created_at_desc"]);

export const CreatePurgeRequestParams = z.object({
	pipelineId: z.string().describe("Pipeline ID to purge cache for"),
	assets: z.array(z.string()).optional().describe("Specific asset URLs to purge"),
	all: z.boolean().optional().describe("Purge all cached content"),
});

export const ListPurgeRequestsParams = PaginationParams.extend({
	pipelineId: z.string().optional().describe("Filter by pipeline ID"),
	projectId: z.string().optional().describe("Filter by project ID"),
	organizationId: z.string().optional().describe("Filter by organization ID"),
	orderBy: ListPurgeRequestsOrderBy.optional().describe("Sort order"),
});

export const GetPurgeRequestParams = z.object({
	purgeRequestId: z.string().describe("ID of the purge request"),
});
