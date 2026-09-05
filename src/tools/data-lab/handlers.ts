import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateClusterParams,
	DeleteClusterParams,
	GetClusterParams,
	ListClusterVersionsParams,
	ListClustersParams,
	ListNodeTypesParams,
	ListNotebookVersionsParams,
	UpdateClusterParams,
} from "./types.js";

const DATA_LAB_API_PREFIX = "/datalab/v1beta1/regions";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- Cluster (Datalab) Handlers ---

export async function handleListClusters(params: ListClustersParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			datalabs: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${DATA_LAB_API_PREFIX}/${params.region}/datalabs`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["name", params.name],
				["order_by", params.orderBy],
				["tags", params.tags],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.datalabs, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetCluster(params: GetClusterParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${DATA_LAB_API_PREFIX}/${params.region}/datalabs/${params.datalabId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateCluster(params: CreateClusterParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: params.name,
			spark_version: params.sparkVersion,
			worker: {
				node_type: params.worker.nodeType,
				node_count: params.worker.nodeCount,
			},
		};
		if (params.main) {
			body.main = { node_type: params.main.nodeType };
		}
		if (params.description !== undefined) {
			body.description = params.description;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		if (params.hasNotebook !== undefined) {
			body.has_notebook = params.hasNotebook;
		}
		if (params.totalStorage) {
			body.total_storage = {
				type: params.totalStorage.type,
				size: params.totalStorage.size,
			};
		}
		if (params.privateNetworkId) {
			body.private_network_id = params.privateNetworkId;
		}
		if (params.projectId) {
			body.project_id = params.projectId;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DATA_LAB_API_PREFIX}/${params.region}/datalabs`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateCluster(params: UpdateClusterParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.name !== undefined) {
			body.name = params.name;
		}
		if (params.description !== undefined) {
			body.description = params.description;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		if (params.nodeCount !== undefined) {
			body.node_count = params.nodeCount;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${DATA_LAB_API_PREFIX}/${params.region}/datalabs/${params.datalabId}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteCluster(params: DeleteClusterParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: `${DATA_LAB_API_PREFIX}/${params.region}/datalabs/${params.datalabId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Node Types Handler ---

export async function handleListNodeTypes(params: ListNodeTypesParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			node_types: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${DATA_LAB_API_PREFIX}/${params.region}/node-types`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.node_types,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Cluster Versions Handler ---

export async function handleListClusterVersions(params: ListClusterVersionsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			clusters: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${DATA_LAB_API_PREFIX}/${params.region}/cluster-versions`,
			urlParams: urlParams(["page", params.page], ["page_size", params.pageSize]),
		});
		return jsonResponse(
			buildPaginatedResponse(response.clusters, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Notebook Versions Handler ---

export async function handleListNotebookVersions(params: ListNotebookVersionsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			notebooks: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${DATA_LAB_API_PREFIX}/${params.region}/notebook-versions`,
			urlParams: urlParams(["page", params.page], ["page_size", params.pageSize]),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.notebooks,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
