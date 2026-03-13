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

function buildPath(region: string, path: string): string {
	return `/k8s/v1/regions/${region}${path}`;
}

function buildParams(params: Record<string, unknown>): URLSearchParams {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			search.set(key, String(value));
		}
	}
	return search;
}

function formatSuccess(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- Cluster Handlers ---

export async function handleListClusters(input: ListClustersInput) {
	try {
		const client = getClient();
		const { region, page, pageSize, ...filters } = input;
		const pagination = paginationToQuery(page, pageSize);

		const response = (await client.fetch<{
			clusters: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: buildPath(region, "/clusters"),
			urlParams: buildParams({
				...pagination,
				project_id: filters.project_id,
				name: filters.name,
				status: filters.status,
				type: filters.type,
			}),
		})) as { clusters: unknown[]; total_count: number };

		const result = buildPaginatedResponse(response.clusters, response.total_count, page, pageSize);
		return formatSuccess(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetCluster(input: GetClusterInput) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: buildPath(input.region, `/clusters/${input.cluster_id}`),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateCluster(input: CreateClusterInput) {
	try {
		const client = getClient();
		const { region, ...body } = input;
		const response = await client.fetch<unknown>({
			method: "POST",
			path: buildPath(region, "/clusters"),
			body: JSON.stringify(body),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteCluster(input: DeleteClusterInput) {
	try {
		const client = getClient();
		const { region, cluster_id, with_additional_resources } = input;
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: buildPath(region, `/clusters/${cluster_id}`),
			urlParams: buildParams({ with_additional_resources }),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpgradeCluster(input: UpgradeClusterInput) {
	try {
		const client = getClient();
		const { region, cluster_id, ...body } = input;
		const response = await client.fetch<unknown>({
			method: "POST",
			path: buildPath(region, `/clusters/${cluster_id}/upgrade`),
			body: JSON.stringify(body),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListClusterAvailableVersions(input: ListClusterAvailableVersionsInput) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: buildPath(input.region, `/clusters/${input.cluster_id}/available-versions`),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetClusterKubeconfig(input: GetClusterKubeconfigInput) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: buildPath(input.region, `/clusters/${input.cluster_id}/kubeconfig`),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Node Pool Handlers ---

export async function handleListPools(input: ListPoolsInput) {
	try {
		const client = getClient();
		const { region, cluster_id, page, pageSize, ...filters } = input;
		const pagination = paginationToQuery(page, pageSize);

		const response = (await client.fetch<{
			nodes: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: buildPath(region, `/clusters/${cluster_id}/pools`),
			urlParams: buildParams({
				...pagination,
				name: filters.name,
				status: filters.status,
			}),
		})) as { nodes: unknown[]; total_count: number };

		const result = buildPaginatedResponse(response.nodes, response.total_count, page, pageSize);
		return formatSuccess(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetPool(input: GetPoolInput) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: buildPath(input.region, `/pools/${input.pool_id}`),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreatePool(input: CreatePoolInput) {
	try {
		const client = getClient();
		const { region, cluster_id, ...body } = input;
		const response = await client.fetch<unknown>({
			method: "POST",
			path: buildPath(region, `/clusters/${cluster_id}/pools`),
			body: JSON.stringify(body),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdatePool(input: UpdatePoolInput) {
	try {
		const client = getClient();
		const { region, pool_id, ...body } = input;
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: buildPath(region, `/pools/${pool_id}`),
			body: JSON.stringify(body),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeletePool(input: DeletePoolInput) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: buildPath(input.region, `/pools/${input.pool_id}`),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpgradePool(input: UpgradePoolInput) {
	try {
		const client = getClient();
		const { region, pool_id, ...body } = input;
		const response = await client.fetch<unknown>({
			method: "POST",
			path: buildPath(region, `/pools/${pool_id}/upgrade`),
			body: JSON.stringify(body),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
