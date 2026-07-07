import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateAuditTrailExportJobParams,
	DeleteAuditTrailExportJobParams,
	ListAuditTrailEventsParams,
	ListAuditTrailExportJobsParams,
	ListAuditTrailProductsParams,
} from "./types.js";

const AUDIT_TRAIL_API_PREFIX = "audit-trail/v1alpha1/regions";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- Events ---

export async function handleListAuditTrailEvents(params: ListAuditTrailEventsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			events: unknown[];
			next_page_token?: string | null;
		}>({
			method: "GET",
			path: `${AUDIT_TRAIL_API_PREFIX}/${params.region}/events`,
			urlParams: urlParams(
				["organization_id", params.organizationId],
				["project_id", params.projectId],
				["resource_type", params.resourceType],
				["method_name", params.methodName],
				["status", params.status],
				["recorded_after", params.recordedAfter],
				["recorded_before", params.recordedBefore],
				["product_name", params.productName],
				["service_name", params.serviceName],
				["resource_id", params.resourceId],
				["principal_id", params.principalId],
				["source_ip", params.sourceIp],
				["order_by", params.orderBy],
				["page_size", params.pageSize],
				["page_token", params.pageToken],
			),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Products ---

export async function handleListAuditTrailProducts(params: ListAuditTrailProductsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			products: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${AUDIT_TRAIL_API_PREFIX}/${params.region}/products`,
			urlParams: urlParams(["organization_id", params.organizationId]),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Export jobs ---

export async function handleListAuditTrailExportJobs(params: ListAuditTrailExportJobsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			export_jobs: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${AUDIT_TRAIL_API_PREFIX}/${params.region}/export-jobs`,
			urlParams: urlParams(
				["organization_id", params.organizationId],
				["name", params.name],
				["tags", params.tags],
				["order_by", params.orderBy],
				["page", params.page],
				["page_size", params.pageSize],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.export_jobs,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateAuditTrailExportJob(params: CreateAuditTrailExportJobParams) {
	try {
		const client = getClient();
		const s3: Record<string, string> = {
			bucket: params.s3Bucket,
			region: params.s3Region,
		};
		if (params.s3Prefix !== undefined) {
			s3.prefix = params.s3Prefix;
		}
		if (params.s3ProjectId !== undefined) {
			s3.project_id = params.s3ProjectId;
		}
		const body: Record<string, unknown> = {
			organization_id: params.organizationId,
			name: params.name,
			s3,
		};
		if (params.tags !== undefined) {
			body.tags = params.tags;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${AUDIT_TRAIL_API_PREFIX}/${params.region}/export-jobs`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteAuditTrailExportJob(params: DeleteAuditTrailExportJobParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${AUDIT_TRAIL_API_PREFIX}/${params.region}/export-jobs/${params.exportJobId}`,
		});
		return jsonResponse({ deleted: true, id: params.exportJobId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
