import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateClusterParams,
	CreateEndpointParams,
	DeleteClusterParams,
	DeleteEndpointParams,
	EndpointSpec,
	GetClusterCertificateAuthorityParams,
	GetClusterParams,
	ListClustersParams,
	ListNodeTypesParams,
	ListUsersParams,
	ListVersionsParams,
	RenewClusterCertificateAuthorityParams,
	UpdateClusterParams,
	UpdateUserParams,
} from "./types.js";

const KAFKA_API_PREFIX = "kafka/v1alpha1/regions";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

function buildEndpointSpec(spec: EndpointSpec): Record<string, unknown> {
	if (spec.privateNetworkId) {
		return { private_network: { private_network_id: spec.privateNetworkId } };
	}
	return { public_network: {} };
}

// --- Cluster Handlers ---

export async function handleListClusters(params: ListClustersParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			clusters: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${KAFKA_API_PREFIX}/${params.region}/clusters`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["organization_id", params.organizationId],
				["name", params.name],
				["tags", params.tags],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.clusters, response.total_count, params.page, params.pageSize),
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
			path: `${KAFKA_API_PREFIX}/${params.region}/clusters/${params.clusterId}`,
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
			version: params.version,
			node_type: params.nodeType,
			node_amount: params.nodeAmount,
			volume: {
				size_bytes: params.volumeSizeBytes,
				type: params.volumeType,
			},
		};
		if (params.projectId) {
			body.project_id = params.projectId;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		if (params.userName) {
			body.user_name = params.userName;
		}
		if (params.password) {
			body.password = params.password;
		}
		if (params.endpoints) {
			body.endpoints = params.endpoints.map(buildEndpointSpec);
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${KAFKA_API_PREFIX}/${params.region}/clusters`,
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
		if (params.name) {
			body.name = params.name;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${KAFKA_API_PREFIX}/${params.region}/clusters/${params.clusterId}`,
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
			path: `${KAFKA_API_PREFIX}/${params.region}/clusters/${params.clusterId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetClusterCertificateAuthority(
	params: GetClusterCertificateAuthorityParams,
) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${KAFKA_API_PREFIX}/${params.region}/clusters/${params.clusterId}/certificate-authority`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRenewClusterCertificateAuthority(
	params: RenewClusterCertificateAuthorityParams,
) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${KAFKA_API_PREFIX}/${params.region}/clusters/${params.clusterId}/renew-certificate-authority`,
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Endpoint Handlers ---

export async function handleCreateEndpoint(params: CreateEndpointParams) {
	try {
		const client = getClient();
		const body = {
			cluster_id: params.clusterId,
			endpoint: buildEndpointSpec({
				privateNetworkId: params.privateNetworkId,
				publicNetwork: params.publicNetwork,
			}),
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${KAFKA_API_PREFIX}/${params.region}/endpoints`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteEndpoint(params: DeleteEndpointParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${KAFKA_API_PREFIX}/${params.region}/endpoints/${params.endpointId}`,
		});
		return jsonResponse({ deleted: true, id: params.endpointId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- User Handlers ---

export async function handleListUsers(params: ListUsersParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			users: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${KAFKA_API_PREFIX}/${params.region}/clusters/${params.clusterId}/users`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["name", params.name],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.users, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateUser(params: UpdateUserParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.password) {
			body.password = params.password;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${KAFKA_API_PREFIX}/${params.region}/clusters/${params.clusterId}/users/${params.username}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Catalog Handlers ---

export async function handleListNodeTypes(params: ListNodeTypesParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			node_types: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${KAFKA_API_PREFIX}/${params.region}/node-types`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["include_disabled_types", params.includeDisabledTypes],
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

export async function handleListVersions(params: ListVersionsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			versions: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${KAFKA_API_PREFIX}/${params.region}/versions`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["version", params.version],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.versions, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
