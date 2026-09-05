import { randomUUID } from "node:crypto";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	CreateContainerParams,
	CreateCronParams,
	CreateDomainParams,
	CreateNamespaceParams,
	DeleteContainerParams,
	DeleteCronParams,
	DeleteDomainParams,
	DeleteNamespaceParams,
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

// Verified against @scaleway/sdk-container@2.13.1 and the v1 OpenAPI.
function basePath(region: string): string {
	return `/containers/v1/regions/${region}`;
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiRequestOptions {
	body?: Record<string, unknown>;
	query?: URLSearchParams;
}

/**
 * Issue an authenticated request through the `@scaleway/sdk-client` fetcher.
 *
 * The SDK prefixes `path` with `https://api.scaleway.com`, appends `query` as
 * the URL search string, and adds the `X-Auth-Token` header itself. Non-2xx
 * responses throw a `ScalewayError` (numeric `.status`), which propagates to
 * the caller's `catch` and is mapped by `mapScalewayError`. A `204 No Content`
 * response resolves to `undefined`, which is normalised to `{}` so callers
 * always receive a JSON-serialisable object.
 */
async function apiRequest(
	method: HttpMethod,
	path: string,
	options: ApiRequestOptions = {},
): Promise<unknown> {
	const config = loadAuthConfig();
	const client = createScalewayClient(config);

	const data = await client.fetch<unknown>({
		method,
		path,
		...(options.query ? { urlParams: options.query } : {}),
		...(options.body !== undefined
			? {
					body: JSON.stringify(options.body),
					headers: { "Content-Type": "application/json" },
				}
			: {}),
	});

	return data ?? {};
}

function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value === undefined) continue;
		const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
		if (key === "secretEnvironmentVariables") {
			const entries = value as { key: string; value: string }[];
			if (new Set(entries.map((entry) => entry.key)).size !== entries.length) {
				throw Object.assign(
					new Error("Duplicate secret environment variable keys are not supported"),
					{ status: 400 },
				);
			}
			result[snakeKey] = Object.fromEntries(entries.map((entry) => [entry.key, entry.value]));
		} else {
			result[snakeKey] = value;
		}
	}
	return result;
}

/** Preserve public units and names without guessing incompatible v1 semantics. */
function containerBody(
	params:
		| Omit<CreateContainerParams, "region">
		| Omit<UpdateContainerParams, "region" | "containerId">,
	update: boolean,
) {
	const { registryImage, memoryLimit, cpuLimit, httpOption, httpsConnectionsOnly, ...rest } =
		params;
	if (httpOption !== undefined && httpOption !== "enabled") {
		throw Object.assign(
			new Error(
				`httpOption=${httpOption} is unsupported in containers v1. Use httpsConnectionsOnly explicitly; HTTPS-only access does not promise HTTP redirection.`,
			),
			{ status: 400 },
		);
	}
	if (httpOption === "enabled" && httpsConnectionsOnly === true) {
		throw Object.assign(new Error("httpOption=enabled conflicts with httpsConnectionsOnly=true"), {
			status: 400,
		});
	}
	const body = toSnakeCase(rest);
	if (registryImage !== undefined) body.image = registryImage;
	if (memoryLimit !== undefined) body.memory_limit_bytes = memoryLimit * 1_048_576;
	if (cpuLimit !== undefined) body.mvcpu_limit = cpuLimit;
	if (httpsConnectionsOnly !== undefined || httpOption === "enabled") {
		// The singular PATCH spelling is intentional in both OpenAPI and SDK.
		body[update ? "https_connection_only" : "https_connections_only"] =
			httpsConnectionsOnly ?? false;
	}
	return body;
}

function unsupported(message: string) {
	return {
		...formatResponse({ error: { type: "unsupported_operation", message, statusCode: 501 } }),
		isError: true,
	};
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

		const data = (await apiRequest("GET", `${basePath(region)}/namespaces`, { query })) as {
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
		const data = await apiRequest("GET", `${basePath(region)}/namespaces/${params.namespaceId}`);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateNamespace(params: CreateNamespaceParams) {
	try {
		const region = getRegion(params.region);
		const { region: _, ...rest } = params;
		const body = toSnakeCase({
			...rest,
			projectId: params.projectId ?? loadAuthConfig().defaultProjectId,
		});
		const data = await apiRequest("POST", `${basePath(region)}/namespaces`, { body });
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
		const data = await apiRequest("PATCH", `${basePath(region)}/namespaces/${namespaceId}`, {
			body,
		});
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteNamespace(params: DeleteNamespaceParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest("DELETE", `${basePath(region)}/namespaces/${params.namespaceId}`);
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

		const data = (await apiRequest("GET", `${basePath(region)}/containers`, { query })) as {
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
		const data = await apiRequest("GET", `${basePath(region)}/containers/${params.containerId}`);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateContainer(params: CreateContainerParams) {
	try {
		const { region: _, ...rest } = params;
		const body = containerBody(rest, false);
		const region = getRegion(params.region);
		const data = await apiRequest("POST", `${basePath(region)}/containers`, { body });
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateContainer(params: UpdateContainerParams) {
	try {
		const { region: _, containerId, ...rest } = params;
		const body = containerBody(rest, true);
		const region = getRegion(params.region);
		const data = await apiRequest("PATCH", `${basePath(region)}/containers/${containerId}`, {
			body,
		});
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteContainer(params: DeleteContainerParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest("DELETE", `${basePath(region)}/containers/${params.containerId}`);
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
		query.set("trigger_type", "cron");

		const data = (await apiRequest("GET", `${basePath(region)}/triggers`, { query })) as {
			triggers: unknown[];
			total_count: number;
		};

		return formatResponse(
			buildPaginatedResponse(data.triggers, data.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateCron(params: CreateCronParams) {
	try {
		const region = getRegion(params.region);
		const body = {
			container_id: params.containerId,
			name: params.name ?? `cron-${randomUUID()}`,
			destination_config: { http_path: "/", http_method: "post" },
			cron_config: {
				schedule: params.schedule,
				timezone: params.timezone ?? "UTC",
				body: JSON.stringify(params.args ?? {}),
				headers: { "Content-Type": "application/json" },
			},
		};
		const data = await apiRequest("POST", `${basePath(region)}/triggers`, { body });
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateCron(params: UpdateCronParams) {
	if (params.containerId !== undefined) {
		return unsupported(
			"Containers v1 cannot retarget a trigger to another container. Omit containerId to update cron configuration, or intentionally create a new trigger. No request was sent.",
		);
	}
	try {
		const region = getRegion(params.region);
		const body: Record<string, unknown> = {};
		if (params.name !== undefined) body.name = params.name;
		const cron: Record<string, unknown> = {};
		if (params.schedule !== undefined) cron.schedule = params.schedule;
		if (params.timezone !== undefined) cron.timezone = params.timezone;
		if (params.args !== undefined) cron.body = JSON.stringify(params.args);
		if (Object.keys(cron).length > 0) body.cron_config = cron;
		const data = await apiRequest("PATCH", `${basePath(region)}/triggers/${params.cronId}`, {
			body,
		});
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteCron(params: DeleteCronParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest("DELETE", `${basePath(region)}/triggers/${params.cronId}`);
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

		const data = (await apiRequest("GET", `${basePath(region)}/domains`, { query })) as {
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
		const data = await apiRequest("POST", `${basePath(region)}/domains`, { body });
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDomain(params: DeleteDomainParams) {
	try {
		const region = getRegion(params.region);
		const data = await apiRequest("DELETE", `${basePath(region)}/domains/${params.domainId}`);
		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
