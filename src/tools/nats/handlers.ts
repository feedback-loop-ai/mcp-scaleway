import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateNatsAccountParams,
	CreateNatsCredentialsParams,
	DeleteNatsAccountParams,
	DeleteNatsCredentialsParams,
	GetNatsAccountParams,
	GetNatsCredentialsParams,
	ListNatsAccountsParams,
	ListNatsCredentialsParams,
	UpdateNatsAccountParams,
} from "./types.js";

const NATS_API_PREFIX = "/mnq/v1beta1/regions";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- Account Handlers ---

export async function handleListNatsAccounts(params: ListNatsAccountsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			nats_accounts: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${NATS_API_PREFIX}/${params.region}/nats-accounts`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["name", params.name],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.nats_accounts,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetNatsAccount(params: GetNatsAccountParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${NATS_API_PREFIX}/${params.region}/nats-accounts/${params.natsAccountId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateNatsAccount(params: CreateNatsAccountParams) {
	try {
		const client = getClient();
		const body: Record<string, string> = { name: params.name };
		if (params.projectId) {
			body.project_id = params.projectId;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${NATS_API_PREFIX}/${params.region}/nats-accounts`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateNatsAccount(params: UpdateNatsAccountParams) {
	try {
		const client = getClient();
		const body: Record<string, string> = {};
		if (params.name) {
			body.name = params.name;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${NATS_API_PREFIX}/${params.region}/nats-accounts/${params.natsAccountId}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteNatsAccount(params: DeleteNatsAccountParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${NATS_API_PREFIX}/${params.region}/nats-accounts/${params.natsAccountId}`,
		});
		return jsonResponse({ deleted: true, id: params.natsAccountId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Credentials Handlers ---

export async function handleListNatsCredentials(params: ListNatsCredentialsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			nats_credentials: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${NATS_API_PREFIX}/${params.region}/nats-credentials`,
			urlParams: urlParams(
				["nats_account_id", params.natsAccountId],
				["page", params.page],
				["page_size", params.pageSize],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.nats_credentials,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetNatsCredentials(params: GetNatsCredentialsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${NATS_API_PREFIX}/${params.region}/nats-credentials/${params.natsCredentialsId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateNatsCredentials(params: CreateNatsCredentialsParams) {
	try {
		const client = getClient();
		const body = {
			nats_account_id: params.natsAccountId,
			name: params.name,
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${NATS_API_PREFIX}/${params.region}/nats-credentials`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteNatsCredentials(params: DeleteNatsCredentialsParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${NATS_API_PREFIX}/${params.region}/nats-credentials/${params.natsCredentialsId}`,
		});
		return jsonResponse({
			deleted: true,
			id: params.natsCredentialsId,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
