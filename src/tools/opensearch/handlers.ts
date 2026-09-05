import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateDeploymentParams,
	CreateEndpointParams,
	CreateUserParams,
	DeleteDeploymentParams,
	DeleteEndpointParams,
	DeleteUserParams,
	EndpointSpecInput,
	GetCertificateAuthorityParams,
	GetDeploymentParams,
	ListDeploymentsParams,
	ListNodeTypesParams,
	ListUsersParams,
	ListVersionsParams,
	UpdateDeploymentParams,
	UpdateUserParams,
	UpgradeDeploymentParams,
} from "./types.js";

const OPENSEARCH_API_PREFIX = "/searchdb/v1alpha1/regions";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

function toEndpointSpec(spec: EndpointSpecInput) {
	if (spec.privateNetworkId) {
		return { private_network: { private_network_id: spec.privateNetworkId } };
	}
	return { public: {} };
}

// --- Deployment Handlers ---

export async function handleListDeployments(params: ListDeploymentsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			deployments: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/deployments`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["organization_id", params.organizationId],
				["project_id", params.projectId],
				["name", params.name],
				["tags", params.tags],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.deployments,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDeployment(params: GetDeploymentParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/deployments/${params.deploymentId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDeployment(params: CreateDeploymentParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: params.name,
			node_type: params.nodeType,
			version: params.version,
		};
		if (params.projectId) {
			body.project_id = params.projectId;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		if (params.nodeCount !== undefined) {
			body.node_count = params.nodeCount;
		}
		if (params.userName) {
			body.user_name = params.userName;
		}
		if (params.password) {
			body.password = params.password;
		}
		if (params.volume) {
			body.volume = { type: params.volume.type, size_bytes: params.volume.sizeBytes };
		}
		if (params.endpoints) {
			body.endpoints = params.endpoints.map(toEndpointSpec);
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/deployments`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateDeployment(params: UpdateDeploymentParams) {
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
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/deployments/${params.deploymentId}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpgradeDeployment(params: UpgradeDeploymentParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.nodeCount !== undefined) {
			body.node_count = params.nodeCount;
		}
		if (params.volumeSizeBytes !== undefined) {
			body.volume_size_bytes = params.volumeSizeBytes;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/upgrade`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDeployment(params: DeleteDeploymentParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/deployments/${params.deploymentId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetCertificateAuthority(params: GetCertificateAuthorityParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/certificate-authority`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Node Type & Version Handlers ---

export async function handleListNodeTypes(params: ListNodeTypesParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			node_types: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/node-types`,
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

export async function handleListVersions(params: ListVersionsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			versions: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/versions`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["version", params.version],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.versions, response.total_count, params.page, params.pageSize),
		);
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
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/users`,
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

export async function handleCreateUser(params: CreateUserParams) {
	try {
		const client = getClient();
		const body = { username: params.username, password: params.password };
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/users`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
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
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/users/${params.username}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteUser(params: DeleteUserParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/users/${params.username}`,
		});
		return jsonResponse({ deleted: true, username: params.username });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Endpoint Handlers ---

export async function handleCreateEndpoint(params: CreateEndpointParams) {
	try {
		const client = getClient();
		const body = {
			deployment_id: params.deploymentId,
			endpoint_spec: toEndpointSpec({
				public: params.public,
				privateNetworkId: params.privateNetworkId,
			}),
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/endpoints`,
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
			path: `${OPENSEARCH_API_PREFIX}/${params.region}/endpoints/${params.endpointId}`,
		});
		return jsonResponse({ deleted: true, id: params.endpointId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
