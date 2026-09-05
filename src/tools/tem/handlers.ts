import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CancelEmailParams,
	CheckDomainParams,
	CreateDomainParams,
	CreateEmailParams,
	CreateWebhookParams,
	DeleteWebhookParams,
	GetDomainLastStatusParams,
	GetDomainParams,
	GetEmailParams,
	GetStatisticsParams,
	ListDomainsParams,
	ListEmailsParams,
	ListWebhooksParams,
	RevokeDomainParams,
	UpdateWebhookParams,
} from "./types.js";

const TEM_API_PREFIX = "/transactional-email/v1alpha1";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function resolveRegion(region?: string): string {
	return region ?? process.env.SCW_DEFAULT_REGION ?? "fr-par";
}

function formatResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

export function buildUrlParams(
	params: Record<string, string | number | undefined>,
): URLSearchParams {
	const urlParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			urlParams.set(key, String(value));
		}
	}
	return urlParams;
}

// --- Domain handlers ---

export async function handleListDomains(params: ListDomainsParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const { page, pageSize } = params;
		const response = await client.fetch<{
			domains: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${TEM_API_PREFIX}/regions/${region}/domains`,
			urlParams: buildUrlParams({
				page,
				page_size: pageSize,
				project_id: params.project_id,
				status: params.status,
				name: params.name,
				organization_id: params.organization_id,
			}),
		});
		return formatResponse(
			buildPaginatedResponse(response.domains, response.total_count, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDomain(params: GetDomainParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${TEM_API_PREFIX}/regions/${region}/domains/${params.domain_id}`,
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDomain(params: CreateDomainParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${TEM_API_PREFIX}/regions/${region}/domains`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				project_id: params.project_id,
				domain_name: params.domain_name,
				accept_tos: params.accept_tos,
				...(params.autoconfig !== undefined && { autoconfig: params.autoconfig }),
			}),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRevokeDomain(params: RevokeDomainParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${TEM_API_PREFIX}/regions/${region}/domains/${params.domain_id}/revoke`,
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCheckDomain(params: CheckDomainParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${TEM_API_PREFIX}/regions/${region}/domains/${params.domain_id}/check`,
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDomainLastStatus(params: GetDomainLastStatusParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${TEM_API_PREFIX}/regions/${region}/domains/${params.domain_id}/verification`,
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Email handlers ---

export async function handleListEmails(params: ListEmailsParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const { page, pageSize } = params;
		const response = await client.fetch<{
			emails: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${TEM_API_PREFIX}/regions/${region}/emails`,
			urlParams: buildUrlParams({
				page,
				page_size: pageSize,
				project_id: params.project_id,
				domain_id: params.domain_id,
				status: params.status,
				mail_from: params.mail_from,
				mail_to: params.mail_to,
				subject: params.subject,
				search: params.search,
				message_id: params.message_id,
				since: params.since,
				until: params.until,
			}),
		});
		return formatResponse(
			buildPaginatedResponse(response.emails, response.total_count, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetEmail(params: GetEmailParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${TEM_API_PREFIX}/regions/${region}/emails/${params.email_id}`,
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateEmail(params: CreateEmailParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${TEM_API_PREFIX}/regions/${region}/emails`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				from: params.from,
				to: params.to,
				subject: params.subject,
				...(params.text && { text: params.text }),
				...(params.html && { html: params.html }),
				project_id: params.project_id,
				...(params.attachments && { attachments: params.attachments }),
			}),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCancelEmail(params: CancelEmailParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${TEM_API_PREFIX}/regions/${region}/emails/${params.email_id}/cancel`,
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Statistics handler ---

export async function handleGetStatistics(params: GetStatisticsParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${TEM_API_PREFIX}/regions/${region}/statistics`,
			urlParams: buildUrlParams({
				project_id: params.project_id,
				domain_id: params.domain_id,
				since: params.since,
				until: params.until,
				mail_from: params.mail_from,
			}),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Webhook handlers ---

export async function handleListWebhooks(params: ListWebhooksParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const { page, pageSize } = params;
		const response = await client.fetch<{
			webhooks: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${TEM_API_PREFIX}/regions/${region}/webhooks`,
			urlParams: buildUrlParams({
				page,
				page_size: pageSize,
				domain_id: params.domain_id,
				organization_id: params.organization_id,
			}),
		});
		return formatResponse(
			buildPaginatedResponse(response.webhooks, response.total_count, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateWebhook(params: CreateWebhookParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${TEM_API_PREFIX}/regions/${region}/webhooks`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				domain_id: params.domain_id,
				name: params.name,
				event_types: params.event_types,
				sns_arn: params.sns_arn,
			}),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateWebhook(params: UpdateWebhookParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${TEM_API_PREFIX}/regions/${region}/webhooks/${params.webhook_id}`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				...(params.name !== undefined && { name: params.name }),
				...(params.event_types !== undefined && { event_types: params.event_types }),
				...(params.sns_arn !== undefined && { sns_arn: params.sns_arn }),
			}),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteWebhook(params: DeleteWebhookParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		await client.fetch<void>({
			method: "DELETE",
			path: `${TEM_API_PREFIX}/regions/${region}/webhooks/${params.webhook_id}`,
		});
		return formatResponse({ message: "Webhook deleted successfully" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
