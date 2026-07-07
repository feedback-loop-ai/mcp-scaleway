import type { Client } from "@scaleway/sdk-client";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { paginationToQuery } from "../../shared/pagination.js";
import type {
	DownloadInvoiceParams,
	GetInvoiceParams,
	ListChargesParams,
	ListConsumptionsParams,
	ListDiscountsParams,
	ListInvoicesParams,
} from "./types.js";

const BILLING_API_BASE = "/billing/v2beta1";

function buildUrlParams(params: Record<string, unknown>): URLSearchParams {
	const urlParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) {
			continue;
		}
		if (Array.isArray(value)) {
			for (const item of value) {
				urlParams.append(key, String(item));
			}
		} else {
			urlParams.set(key, String(value));
		}
	}
	return urlParams;
}

function formatJsonResponse(data: unknown) {
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(data, null, 2),
			},
		],
	};
}

export async function handleListConsumptions(client: Client, params: ListConsumptionsParams) {
	try {
		const pagination = paginationToQuery(params.page, params.pageSize);
		const urlParams = buildUrlParams({
			...pagination,
			order_by: params.order_by,
			organization_id: params.organization_id,
			project_id: params.project_id,
			category_name: params.category_name,
			billing_period: params.billing_period,
		});
		const response = await client.fetch<Record<string, unknown>>({
			method: "GET",
			path: `${BILLING_API_BASE}/consumptions`,
			urlParams,
		});
		return formatJsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListInvoices(client: Client, params: ListInvoicesParams) {
	try {
		const pagination = paginationToQuery(params.page, params.pageSize);
		const urlParams = buildUrlParams({
			...pagination,
			organization_id: params.organization_id,
			billing_period_start_after: params.billing_period_start_after,
			billing_period_start_before: params.billing_period_start_before,
			invoice_type: params.invoice_type,
			order_by: params.order_by,
		});
		const response = await client.fetch<Record<string, unknown>>({
			method: "GET",
			path: `${BILLING_API_BASE}/invoices`,
			urlParams,
		});
		return formatJsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetInvoice(client: Client, params: GetInvoiceParams) {
	try {
		const response = await client.fetch<Record<string, unknown>>({
			method: "GET",
			path: `${BILLING_API_BASE}/invoices/${encodeURIComponent(params.invoice_id)}`,
		});
		return formatJsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDownloadInvoice(client: Client, params: DownloadInvoiceParams) {
	try {
		const urlParams = buildUrlParams({
			file_type: params.file_type,
		});
		const response = await client.fetch<Record<string, unknown>>({
			method: "GET",
			path: `${BILLING_API_BASE}/invoices/${encodeURIComponent(params.invoice_id)}/download`,
			urlParams,
		});
		return formatJsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListCharges(client: Client, params: ListChargesParams) {
	try {
		const urlParams = buildUrlParams({
			organization_id: params.organization_id,
			order_by: params.order_by,
			page_size: params.page_size,
			page_token: params.page_token,
			start_date_after: params.start_date_after,
			end_date_before: params.end_date_before,
			clamp_to_time_range: params.clamp_to_time_range,
			invoice_ids: params.invoice_ids,
			project_ids: params.project_ids,
			resource_ids: params.resource_ids,
			resource_names: params.resource_names,
			skus: params.skus,
		});
		const response = await client.fetch<Record<string, unknown>>({
			method: "GET",
			path: `${BILLING_API_BASE}/charges`,
			urlParams,
		});
		return formatJsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListDiscounts(client: Client, params: ListDiscountsParams) {
	try {
		const pagination = paginationToQuery(params.page, params.pageSize);
		const urlParams = buildUrlParams({
			...pagination,
			organization_id: params.organization_id,
			order_by: params.order_by,
		});
		const response = await client.fetch<Record<string, unknown>>({
			method: "GET",
			path: `${BILLING_API_BASE}/discounts`,
			urlParams,
		});
		return formatJsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
