import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateDatabaseParams,
	CreateDeploymentParams,
	CreateEndpointParams,
	CreateUserParams,
	DeleteDatabaseParams,
	DeleteDeploymentParams,
	DeleteEndpointParams,
	DeleteUserParams,
	GetDeploymentCertificateParams,
	GetDeploymentParams,
	ListDatabasesParams,
	ListDeploymentsParams,
	ListPresetsParams,
	ListUsersParams,
	ListVersionsParams,
	StartDeploymentParams,
	StopDeploymentParams,
	UpdateDeploymentParams,
	UpdateUserParams,
} from "./types.js";

const DW_API_PREFIX = "datawarehouse/v1beta1/regions";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// Maps an optional Private Network ID into a Data Warehouse endpoint spec.
// When a Private Network ID is provided a private endpoint is requested,
// otherwise a public endpoint is requested.
function endpointSpec(privateNetworkId?: string) {
	if (privateNetworkId) {
		return { private_network: { private_network_id: privateNetworkId } };
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
			path: `${DW_API_PREFIX}/${params.region}/deployments`,
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
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDeployment(params: CreateDeploymentParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = { name: params.name };
		if (params.projectId) {
			body.project_id = params.projectId;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		if (params.version) {
			body.version = params.version;
		}
		if (params.replicaCount !== undefined) {
			body.replica_count = params.replicaCount;
		}
		if (params.shardCount !== undefined) {
			body.shard_count = params.shardCount;
		}
		if (params.password) {
			body.password = params.password;
		}
		if (params.cpuMin !== undefined) {
			body.cpu_min = params.cpuMin;
		}
		if (params.cpuMax !== undefined) {
			body.cpu_max = params.cpuMax;
		}
		if (params.ramPerCpu !== undefined) {
			body.ram_per_cpu = params.ramPerCpu;
		}
		if (params.moveFactor !== undefined) {
			body.move_factor = params.moveFactor;
		}
		if (params.endpoints) {
			body.endpoints = params.endpoints.map((spec) => endpointSpec(spec.privateNetworkId));
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DW_API_PREFIX}/${params.region}/deployments`,
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
		if (params.cpuMin !== undefined) {
			body.cpu_min = params.cpuMin;
		}
		if (params.cpuMax !== undefined) {
			body.cpu_max = params.cpuMax;
		}
		if (params.replicaCount !== undefined) {
			body.replica_count = params.replicaCount;
		}
		if (params.moveFactor !== undefined) {
			body.move_factor = params.moveFactor;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}`,
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
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleStartDeployment(params: StartDeploymentParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/start`,
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleStopDeployment(params: StopDeploymentParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/stop`,
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDeploymentCertificate(params: GetDeploymentCertificateParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/certificate`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Database Handlers ---

export async function handleListDatabases(params: ListDatabasesParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			databases: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/databases`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["name", params.name],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.databases,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDatabase(params: CreateDatabaseParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/databases`,
			body: JSON.stringify({ name: params.name }),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDatabase(params: DeleteDatabaseParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/databases/${params.name}`,
		});
		return jsonResponse({ deleted: true, name: params.name });
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
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/users`,
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
		const body: Record<string, unknown> = {
			name: params.name,
			password: params.password,
		};
		if (params.isAdmin !== undefined) {
			body.is_admin = params.isAdmin;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/users`,
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
		if (params.isAdmin !== undefined) {
			body.is_admin = params.isAdmin;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/users/${params.name}`,
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
			path: `${DW_API_PREFIX}/${params.region}/deployments/${params.deploymentId}/users/${params.name}`,
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse({ deleted: true, name: params.name });
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
			endpoint: endpointSpec(params.privateNetworkId),
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DW_API_PREFIX}/${params.region}/endpoints`,
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
			path: `${DW_API_PREFIX}/${params.region}/endpoints/${params.endpointId}`,
		});
		return jsonResponse({ deleted: true, id: params.endpointId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Preset & Version Handlers ---

export async function handleListPresets(params: ListPresetsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			presets: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${DW_API_PREFIX}/${params.region}/presets`,
			urlParams: urlParams(["page", params.page], ["page_size", params.pageSize]),
		});
		return jsonResponse(
			buildPaginatedResponse(response.presets, response.total_count, params.page, params.pageSize),
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
			path: `${DW_API_PREFIX}/${params.region}/versions`,
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
