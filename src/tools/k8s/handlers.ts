import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	CreateClusterInput,
	CreatePoolInput,
	DeleteClusterInput,
	DeletePoolInput,
	GetClusterInput,
	GetClusterKubeconfigInput,
	GetPoolInput,
	ListClusterAvailableVersionsInput,
	ListClustersInput,
	ListPoolsInput,
	UpdatePoolInput,
	UpgradeClusterInput,
	UpgradePoolInput,
} from "./types.js";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function buildUrl(region: string, path: string): string {
	return `https://api.scaleway.com/k8s/v1/regions/${region}${path}`;
}

async function apiRequest(
	method: string,
	url: string,
	body?: Record<string, unknown>,
): Promise<unknown> {
	const client = getClient();
	const request = { method, url, body };
	const response = await (client as unknown as { send: (r: unknown) => Promise<unknown> }).send(
		request,
	);
	return response;
}

function formatSuccess(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- Cluster Handlers ---

export async function handleListClusters(input: ListClustersInput) {
	try {
		const { region, page, pageSize, ...filters } = input;
		const queryParams = new URLSearchParams();
		const pagination = paginationToQuery(page, pageSize);
		queryParams.set("page", String(pagination.page));
		queryParams.set("page_size", String(pagination.page_size));
		if (filters.project_id) queryParams.set("project_id", filters.project_id);
		if (filters.name) queryParams.set("name", filters.name);
		if (filters.status) queryParams.set("status", filters.status);
		if (filters.type) queryParams.set("type", filters.type);

		const url = `${buildUrl(region, "/clusters")}?${queryParams.toString()}`;
		const response = (await apiRequest("GET", url)) as {
			clusters: unknown[];
			total_count: number;
		};

		const result = buildPaginatedResponse(response.clusters, response.total_count, page, pageSize);
		return formatSuccess(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetCluster(input: GetClusterInput) {
	try {
		const url = buildUrl(input.region, `/clusters/${input.cluster_id}`);
		const response = await apiRequest("GET", url);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateCluster(input: CreateClusterInput) {
	try {
		const { region, ...body } = input;
		const url = buildUrl(region, "/clusters");
		const response = await apiRequest("POST", url, body as Record<string, unknown>);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteCluster(input: DeleteClusterInput) {
	try {
		const { region, cluster_id, with_additional_resources } = input;
		const queryParams = new URLSearchParams();
		if (with_additional_resources !== undefined) {
			queryParams.set("with_additional_resources", String(with_additional_resources));
		}
		const qs = queryParams.toString();
		const url = `${buildUrl(region, `/clusters/${cluster_id}`)}${qs ? `?${qs}` : ""}`;
		const response = await apiRequest("DELETE", url);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpgradeCluster(input: UpgradeClusterInput) {
	try {
		const { region, cluster_id, ...body } = input;
		const url = buildUrl(region, `/clusters/${cluster_id}/upgrade`);
		const response = await apiRequest("POST", url, body as Record<string, unknown>);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListClusterAvailableVersions(input: ListClusterAvailableVersionsInput) {
	try {
		const url = buildUrl(input.region, `/clusters/${input.cluster_id}/available-versions`);
		const response = await apiRequest("GET", url);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetClusterKubeconfig(input: GetClusterKubeconfigInput) {
	try {
		const url = buildUrl(input.region, `/clusters/${input.cluster_id}/kubeconfig`);
		const response = await apiRequest("GET", url);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Node Pool Handlers ---

export async function handleListPools(input: ListPoolsInput) {
	try {
		const { region, cluster_id, page, pageSize, ...filters } = input;
		const queryParams = new URLSearchParams();
		const pagination = paginationToQuery(page, pageSize);
		queryParams.set("page", String(pagination.page));
		queryParams.set("page_size", String(pagination.page_size));
		if (filters.name) queryParams.set("name", filters.name);
		if (filters.status) queryParams.set("status", filters.status);

		const url = `${buildUrl(region, `/clusters/${cluster_id}/pools`)}?${queryParams.toString()}`;
		const response = (await apiRequest("GET", url)) as {
			nodes: unknown[];
			total_count: number;
		};

		const result = buildPaginatedResponse(response.nodes, response.total_count, page, pageSize);
		return formatSuccess(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetPool(input: GetPoolInput) {
	try {
		const url = buildUrl(input.region, `/pools/${input.pool_id}`);
		const response = await apiRequest("GET", url);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreatePool(input: CreatePoolInput) {
	try {
		const { region, cluster_id, ...body } = input;
		const url = buildUrl(region, `/clusters/${cluster_id}/pools`);
		const response = await apiRequest("POST", url, body as Record<string, unknown>);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdatePool(input: UpdatePoolInput) {
	try {
		const { region, pool_id, ...body } = input;
		const url = buildUrl(region, `/pools/${pool_id}`);
		const response = await apiRequest("PATCH", url, body as Record<string, unknown>);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeletePool(input: DeletePoolInput) {
	try {
		const url = buildUrl(input.region, `/pools/${input.pool_id}`);
		const response = await apiRequest("DELETE", url);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpgradePool(input: UpgradePoolInput) {
	try {
		const { region, pool_id, ...body } = input;
		const url = buildUrl(region, `/pools/${pool_id}/upgrade`);
		const response = await apiRequest("POST", url, body as Record<string, unknown>);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
