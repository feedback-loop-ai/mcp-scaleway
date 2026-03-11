import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	CreateContainerParams,
	CreateCronParams,
	CreateDomainParams,
	CreateNamespaceParams,
	CreateTokenParams,
	DeleteContainerParams,
	DeleteCronParams,
	DeleteDomainParams,
	DeleteNamespaceParams,
	DeleteTokenParams,
	DeployContainerParams,
	GetContainerParams,
	GetNamespaceParams,
	ListContainersParams,
	ListCronsParams,
	ListDomainsParams,
	ListNamespacesParams,
	UpdateContainerParams,
	UpdateCronParams,
	UpdateNamespaceParams,
} from "./types.js";

function getRegion(region?: string): string {
	const config = loadAuthConfig();
	return region ?? config.defaultRegion;
}

function baseUrl(region: string): string {
	return `https://api.scaleway.com/containers/v1beta1/regions/${region}`;
}

async function apiRequest(
	method: string,
	url: string,
	body?: Record<string, unknown>,
): Promise<unknown> {
	const config = loadAuthConfig();
	const client = createScalewayClient(config);

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	const fetchFn = (client as { httpClient?: typeof fetch }).httpClient ?? fetch;
	const response = await fetchFn(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const errorBody = await response.text();
		const error = new Error(errorBody) as Error & { statusCode: number };
		error.statusCode = response.status;
		throw error;
	}

	const text = await response.text();
	return text ? JSON.parse(text) : {};
}

function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value === undefined) continue;
		const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
		result[snakeKey] = value;
	}
	return result;
}

function formatResponse(data: unknown) {
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(data, null, 2),
			},
		],
	};
}

// ─── Namespace Handlers ──────────────────────────────────────────────

export async function handleListNamespaces(params: ListNamespacesParams) {
	try {
		const region = getRegion(params.region);
		const query = new URLSearchParams();
		const pagination = paginationToQuery(params.page, params.pageSize);
		query.set("page", String(pagination.page));
		query.set("page_size", String(pagination.page_size));
		if (params.name) query.set("name", params.name);
		if (params.projectId) query.set("project_id", params.projectId);
		if (params.organizationId) query.set("organization_id", params.organizationId);

		const data = (await apiRequest("GET", `${baseUrl(region)}/namespaces?${query.toString()}`)) as {
			namespaces: unknown[];
			total_count: number;
		};

		return formatResponse(
			buildPaginatedResponse(data.namespaces, data.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetNamespace(params: GetNamespaceParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest("GET", `${baseUrl(region)}/namespaces/${params.namespaceId}`);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateNamespace(params: CreateNamespaceParams) {
	try {
		const region = getRegion(params.region);
		const { region: _, ...rest } = params;
		const body = toSnakeCase(rest as Record<string, unknown>);
		const data = await apiRequest("POST", `${baseUrl(region)}/namespaces`, body);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateNamespace(params: UpdateNamespaceParams) {
	try {
		const region = getRegion(params.region);
		const { region: _, namespaceId, ...rest } = params;
		const body = toSnakeCase(rest as Record<string, unknown>);
		const data = await apiRequest("PATCH", `${baseUrl(region)}/namespaces/${namespaceId}`, body);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteNamespace(params: DeleteNamespaceParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest("DELETE", `${baseUrl(region)}/namespaces/${params.namespaceId}`);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── Container Handlers ─────────────────────────────────────────────

export async function handleListContainers(params: ListContainersParams) {
	try {
		const region = getRegion(params.region);
		const query = new URLSearchParams();
		const pagination = paginationToQuery(params.page, params.pageSize);
		query.set("page", String(pagination.page));
		query.set("page_size", String(pagination.page_size));
		query.set("namespace_id", params.namespaceId);
		if (params.name) query.set("name", params.name);

		const data = (await apiRequest("GET", `${baseUrl(region)}/containers?${query.toString()}`)) as {
			containers: unknown[];
			total_count: number;
		};

		return formatResponse(
			buildPaginatedResponse(data.containers, data.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetContainer(params: GetContainerParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest("GET", `${baseUrl(region)}/containers/${params.containerId}`);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateContainer(params: CreateContainerParams) {
	try {
		const region = getRegion(params.region);
		const { region: _, ...rest } = params;
		const body = toSnakeCase(rest as Record<string, unknown>);
		const data = await apiRequest("POST", `${baseUrl(region)}/containers`, body);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateContainer(params: UpdateContainerParams) {
	try {
		const region = getRegion(params.region);
		const { region: _, containerId, ...rest } = params;
		const body = toSnakeCase(rest as Record<string, unknown>);
		const data = await apiRequest("PATCH", `${baseUrl(region)}/containers/${containerId}`, body);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteContainer(params: DeleteContainerParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest("DELETE", `${baseUrl(region)}/containers/${params.containerId}`);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeployContainer(params: DeployContainerParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest(
			"POST",
			`${baseUrl(region)}/containers/${params.containerId}/deploy`,
			{},
		);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── Cron Handlers ───────────────────────────────────────────────────

export async function handleListCrons(params: ListCronsParams) {
	try {
		const region = getRegion(params.region);
		const query = new URLSearchParams();
		const pagination = paginationToQuery(params.page, params.pageSize);
		query.set("page", String(pagination.page));
		query.set("page_size", String(pagination.page_size));
		query.set("container_id", params.containerId);

		const data = (await apiRequest("GET", `${baseUrl(region)}/crons?${query.toString()}`)) as {
			crons: unknown[];
			total_count: number;
		};

		return formatResponse(
			buildPaginatedResponse(data.crons, data.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateCron(params: CreateCronParams) {
	try {
		const region = getRegion(params.region);
		const { region: _, ...rest } = params;
		const body = toSnakeCase(rest as Record<string, unknown>);
		const data = await apiRequest("POST", `${baseUrl(region)}/crons`, body);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateCron(params: UpdateCronParams) {
	try {
		const region = getRegion(params.region);
		const { region: _, cronId, ...rest } = params;
		const body = toSnakeCase(rest as Record<string, unknown>);
		const data = await apiRequest("PATCH", `${baseUrl(region)}/crons/${cronId}`, body);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteCron(params: DeleteCronParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest("DELETE", `${baseUrl(region)}/crons/${params.cronId}`);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── Domain Handlers ─────────────────────────────────────────────────

export async function handleListDomains(params: ListDomainsParams) {
	try {
		const region = getRegion(params.region);
		const query = new URLSearchParams();
		const pagination = paginationToQuery(params.page, params.pageSize);
		query.set("page", String(pagination.page));
		query.set("page_size", String(pagination.page_size));
		query.set("container_id", params.containerId);

		const data = (await apiRequest("GET", `${baseUrl(region)}/domains?${query.toString()}`)) as {
			domains: unknown[];
			total_count: number;
		};

		return formatResponse(
			buildPaginatedResponse(data.domains, data.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDomain(params: CreateDomainParams) {
	try {
		const region = getRegion(params.region);
		const { region: _, ...rest } = params;
		const body = toSnakeCase(rest as Record<string, unknown>);
		const data = await apiRequest("POST", `${baseUrl(region)}/domains`, body);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDomain(params: DeleteDomainParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest("DELETE", `${baseUrl(region)}/domains/${params.domainId}`);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── Token Handlers ──────────────────────────────────────────────────

export async function handleCreateToken(params: CreateTokenParams) {
	try {
		const region = getRegion(params.region);
		const { region: _, ...rest } = params;
		const body = toSnakeCase(rest as Record<string, unknown>);
		const data = await apiRequest("POST", `${baseUrl(region)}/tokens`, body);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteToken(params: DeleteTokenParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest("DELETE", `${baseUrl(region)}/tokens/${params.tokenId}`);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
