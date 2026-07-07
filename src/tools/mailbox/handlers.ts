import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateAliasParams,
	CreateDomainParams,
	CreateMailboxesParams,
	DeleteAliasParams,
	DeleteDomainParams,
	DeleteMailboxParams,
	GetAliasParams,
	GetDomainParams,
	GetDomainRecordsParams,
	GetMailboxParams,
	ListAliasesParams,
	ListDomainsParams,
	ListMailboxesParams,
	RestoreMailboxParams,
	UpdateMailboxParams,
	ValidateDomainRecordsParams,
} from "./types.js";

const MAILBOX_API_PREFIX = "mailbox/v1alpha1";
const JSON_HEADERS = { "Content-Type": "application/json" };

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- Domain Handlers ---

export async function handleListDomains(params: ListDomainsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			domains: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${MAILBOX_API_PREFIX}/domains`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["statuses", params.statuses],
				["search", params.search],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.domains, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDomain(params: GetDomainParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${MAILBOX_API_PREFIX}/domains/${params.domainId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDomain(params: CreateDomainParams) {
	try {
		const client = getClient();
		const body: Record<string, string> = { name: params.name };
		if (params.projectId) {
			body.project_id = params.projectId;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${MAILBOX_API_PREFIX}/domains`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDomain(params: DeleteDomainParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: `${MAILBOX_API_PREFIX}/domains/${params.domainId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDomainRecords(params: GetDomainRecordsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${MAILBOX_API_PREFIX}/domains/${params.domainId}/records`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleValidateDomainRecords(params: ValidateDomainRecordsParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "POST",
			path: `${MAILBOX_API_PREFIX}/domains/${params.domainId}/validate-records`,
		});
		return jsonResponse({ validated: true, domainId: params.domainId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Mailbox Handlers ---

export async function handleCreateMailboxes(params: CreateMailboxesParams) {
	try {
		const client = getClient();
		const body = {
			domain_id: params.domainId,
			subscription_period: params.subscriptionPeriod,
			mailboxes: params.mailboxes.map((mailbox) => ({
				local_part: mailbox.localPart,
				password: mailbox.password,
			})),
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${MAILBOX_API_PREFIX}/batch-create-mailboxes`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListMailboxes(params: ListMailboxesParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			mailboxes: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${MAILBOX_API_PREFIX}/mailboxes`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["domain_id", params.domainId],
				["project_id", params.projectId],
				["statuses", params.statuses],
				["search", params.search],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.mailboxes,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetMailbox(params: GetMailboxParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${MAILBOX_API_PREFIX}/mailboxes/${params.mailboxId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateMailbox(params: UpdateMailboxParams) {
	try {
		const client = getClient();
		const body: Record<string, string> = {};
		if (params.subscriptionPeriod) {
			body.subscription_period = params.subscriptionPeriod;
		}
		if (params.newPassword) {
			body.new_password = params.newPassword;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${MAILBOX_API_PREFIX}/mailboxes/${params.mailboxId}`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteMailbox(params: DeleteMailboxParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: `${MAILBOX_API_PREFIX}/mailboxes/${params.mailboxId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRestoreMailbox(params: RestoreMailboxParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${MAILBOX_API_PREFIX}/mailboxes/${params.mailboxId}/restore`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Alias Handlers ---

export async function handleCreateAlias(params: CreateAliasParams) {
	try {
		const client = getClient();
		const body: Record<string, string> = {
			mailbox_id: params.mailboxId,
			local_part: params.localPart,
		};
		if (params.description !== undefined) {
			body.description = params.description;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${MAILBOX_API_PREFIX}/aliases`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListAliases(params: ListAliasesParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			aliases: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${MAILBOX_API_PREFIX}/aliases`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["mailbox_id", params.mailboxId],
				["project_id", params.projectId],
				["status", params.status],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.aliases, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetAlias(params: GetAliasParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${MAILBOX_API_PREFIX}/aliases/${params.aliasId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteAlias(params: DeleteAliasParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: `${MAILBOX_API_PREFIX}/aliases/${params.aliasId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
