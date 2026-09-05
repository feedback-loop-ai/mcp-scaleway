import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	ActivateSqsInput,
	CreateSqsCredentialsInput,
	DeactivateSqsInput,
	DeleteSqsCredentialsInput,
	GetSqsCredentialsInput,
	GetSqsInfoInput,
	ListSqsCredentialsInput,
	UpdateSqsCredentialsInput,
} from "./types.js";

const SQS_API_PREFIX = "/mnq/v1beta1/regions";

const JSON_HEADERS = { "Content-Type": "application/json" };

function getClient() {
	const config = loadAuthConfig();
	return { client: createScalewayClient(config), config };
}

function formatResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// `client.fetch` (@scaleway/sdk-client) resolves to the already-parsed JSON body
// (or `undefined` on 204) and throws a ScalewayError on non-2xx responses, so the
// handlers below use the resolved value directly instead of a `Response` object.

export async function handleActivateSqs(input: ActivateSqsInput) {
	try {
		const { client, config } = getClient();
		const region = input.region ?? config.defaultRegion;
		const projectId = input.project_id ?? config.defaultProjectId;

		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${SQS_API_PREFIX}/${region}/activate-sqs`,
			body: JSON.stringify({ project_id: projectId }),
			headers: JSON_HEADERS,
		});
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeactivateSqs(input: DeactivateSqsInput) {
	try {
		const { client, config } = getClient();
		const region = input.region ?? config.defaultRegion;
		const projectId = input.project_id ?? config.defaultProjectId;

		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${SQS_API_PREFIX}/${region}/deactivate-sqs`,
			body: JSON.stringify({ project_id: projectId }),
			headers: JSON_HEADERS,
		});
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetSqsInfo(input: GetSqsInfoInput) {
	try {
		const { client, config } = getClient();
		const region = input.region ?? config.defaultRegion;
		const projectId = input.project_id ?? config.defaultProjectId;

		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${SQS_API_PREFIX}/${region}/sqs-info`,
			urlParams: new URLSearchParams({ project_id: projectId }),
		});
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateSqsCredentials(input: CreateSqsCredentialsInput) {
	try {
		const { client, config } = getClient();
		const region = input.region ?? config.defaultRegion;
		const projectId = input.project_id ?? config.defaultProjectId;

		const body: Record<string, unknown> = {
			project_id: projectId,
			name: input.name,
		};
		if (input.permissions) {
			body.permissions = input.permissions;
		}

		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${SQS_API_PREFIX}/${region}/sqs-credentials`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteSqsCredentials(input: DeleteSqsCredentialsInput) {
	try {
		const { client, config } = getClient();
		const region = input.region ?? config.defaultRegion;

		await client.fetch({
			method: "DELETE",
			path: `${SQS_API_PREFIX}/${region}/sqs-credentials/${input.credential_id}`,
		});
		return formatResponse({ message: "Credentials deleted successfully" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetSqsCredentials(input: GetSqsCredentialsInput) {
	try {
		const { client, config } = getClient();
		const region = input.region ?? config.defaultRegion;

		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${SQS_API_PREFIX}/${region}/sqs-credentials/${input.credential_id}`,
		});
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListSqsCredentials(input: ListSqsCredentialsInput) {
	try {
		const { client, config } = getClient();
		const region = input.region ?? config.defaultRegion;
		const projectId = input.project_id ?? config.defaultProjectId;
		const { page, page_size: pageSize } = paginationToQuery(input.page, input.page_size);

		const urlParams = new URLSearchParams({
			project_id: projectId,
			page: String(page),
			page_size: String(pageSize),
			order_by: input.order_by,
		});

		const data = await client.fetch<{ sqs_credentials?: unknown[]; total_count?: number }>({
			method: "GET",
			path: `${SQS_API_PREFIX}/${region}/sqs-credentials`,
			urlParams,
		});

		return formatResponse(
			buildPaginatedResponse(
				data.sqs_credentials ?? [],
				data.total_count ?? 0,
				input.page,
				input.page_size,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateSqsCredentials(input: UpdateSqsCredentialsInput) {
	try {
		const { client, config } = getClient();
		const region = input.region ?? config.defaultRegion;

		const body: Record<string, unknown> = {};
		if (input.name !== undefined) {
			body.name = input.name;
		}
		if (input.permissions !== undefined) {
			body.permissions = input.permissions;
		}

		const data = await client.fetch<unknown>({
			method: "PATCH",
			path: `${SQS_API_PREFIX}/${region}/sqs-credentials/${input.credential_id}`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
