import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateDeploymentInput,
	CreateEndpointInput,
	CreateUserInput,
	DeleteDeploymentInput,
	DeleteEndpointInput,
	DeleteUserInput,
	EndpointSpecInput,
	GetDeploymentCertificateInput,
	GetDeploymentInput,
	ListDeploymentsInput,
	ListNodeTypesInput,
	ListUsersInput,
	ListVersionsInput,
	UpdateDeploymentInput,
	UpdateUserInput,
	UpgradeDeploymentInput,
} from "./types.js";

const RABBITMQ_API_PREFIX = "/messageq/v1alpha1/regions";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

function toEndpointSpec(spec: EndpointSpecInput): Record<string, unknown> {
	if (spec.private_network_id) {
		return { private_network: { private_network_id: spec.private_network_id } };
	}
	return { public: {} };
}

// --- Deployment Handlers ---

export async function handleListDeployments(params: ListDeploymentsInput) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			deployments: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/deployments`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["organization_id", params.organization_id],
				["project_id", params.project_id],
				["name", params.name],
				["tags", params.tags],
				["order_by", params.order_by],
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

export async function handleGetDeployment(params: GetDeploymentInput) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/deployments/${params.deployment_id}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDeployment(params: CreateDeploymentInput) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: params.name,
			node_type: params.node_type,
			node_count: params.node_count,
			version: params.version,
		};
		if (params.project_id) {
			body.project_id = params.project_id;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		if (params.user_name) {
			body.user_name = params.user_name;
		}
		if (params.password) {
			body.password = params.password;
		}
		if (params.volume) {
			body.volume = params.volume;
		}
		if (params.endpoints) {
			body.endpoints = params.endpoints.map(toEndpointSpec);
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/deployments`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateDeployment(params: UpdateDeploymentInput) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.name !== undefined) {
			body.name = params.name;
		}
		if (params.tags !== undefined) {
			body.tags = params.tags;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/deployments/${params.deployment_id}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpgradeDeployment(params: UpgradeDeploymentInput) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.node_count !== undefined) {
			body.node_count = params.node_count;
		}
		if (params.volume_size_bytes !== undefined) {
			body.volume_size_bytes = params.volume_size_bytes;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/deployments/${params.deployment_id}/upgrade`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDeployment(params: DeleteDeploymentInput) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/deployments/${params.deployment_id}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDeploymentCertificate(params: GetDeploymentCertificateInput) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/deployments/${params.deployment_id}/certificate-authority`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- User Handlers ---

export async function handleListUsers(params: ListUsersInput) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			users: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/deployments/${params.deployment_id}/users`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["order_by", params.order_by],
				["name", params.name],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.users, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateUser(params: CreateUserInput) {
	try {
		const client = getClient();
		const body = {
			username: params.username,
			password: params.password,
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/deployments/${params.deployment_id}/users`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateUser(params: UpdateUserInput) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.password !== undefined) {
			body.password = params.password;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/deployments/${params.deployment_id}/users/${params.username}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteUser(params: DeleteUserInput) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/deployments/${params.deployment_id}/users/${params.username}`,
		});
		return jsonResponse({ deleted: true, username: params.username });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Endpoint Handlers ---

export async function handleCreateEndpoint(params: CreateEndpointInput) {
	try {
		const client = getClient();
		const body = {
			deployment_id: params.deployment_id,
			endpoint_spec: toEndpointSpec({
				is_public: params.is_public,
				private_network_id: params.private_network_id,
			}),
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/endpoints`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteEndpoint(params: DeleteEndpointInput) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/endpoints/${params.endpoint_id}`,
		});
		return jsonResponse({ deleted: true, id: params.endpoint_id });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Node Type & Version Handlers ---

export async function handleListNodeTypes(params: ListNodeTypesInput) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			node_types: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/node-types`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["order_by", params.order_by],
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

export async function handleListVersions(params: ListVersionsInput) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			versions: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${RABBITMQ_API_PREFIX}/${params.region}/versions`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["order_by", params.order_by],
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
