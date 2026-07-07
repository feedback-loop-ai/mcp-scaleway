import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import type {
	DownloadImpactReportParams,
	GetImpactDataParams,
	GetReportAvailabilityParams,
} from "./types.js";

const EF_API_PREFIX = "/environmental-footprint/v1alpha1";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

export async function handleGetImpactData(params: GetImpactDataParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${EF_API_PREFIX}/data/query`,
			urlParams: urlParams(
				["organization_id", params.organizationId],
				["start_date", params.startDate],
				["end_date", params.endDate],
				["regions", params.regions],
				["zones", params.zones],
				["project_ids", params.projectIds],
				["service_categories", params.serviceCategories],
				["product_categories", params.productCategories],
			),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetReportAvailability(params: GetReportAvailabilityParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${EF_API_PREFIX}/reports/availability`,
			urlParams: urlParams(
				["organization_id", params.organizationId],
				["start_date", params.startDate],
				["end_date", params.endDate],
			),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDownloadImpactReport(params: DownloadImpactReportParams) {
	try {
		const client = getClient();
		const body: Record<string, string> = {
			date: params.date,
			type: params.type,
		};
		if (params.organizationId) {
			body.organization_id = params.organizationId;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${EF_API_PREFIX}/reports/download`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
