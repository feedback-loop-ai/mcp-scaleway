import type { z } from "zod";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function buildUrlParams(query?: Record<string, unknown>): URLSearchParams | undefined {
	if (!query) return undefined;
	const params = new URLSearchParams();
	for (const [k, v] of Object.entries(query)) {
		if (v !== undefined) {
			params.set(k, String(v));
		}
	}
	return params;
}

async function apiCall(
	method: "GET" | "POST" | "PATCH" | "DELETE",
	region: string,
	path: string,
	body?: unknown,
	query?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
	const client = getClient();
	const result = await client.fetch<Record<string, unknown>>({
		method,
		path: `/inference/v1/regions/${region}${path}`,
		headers: body ? { "Content-Type": "application/json" } : undefined,
		body: body ? JSON.stringify(body) : undefined,
		urlParams: buildUrlParams(query),
	});
	return result ?? {};
}

// --- Deployment Handlers ---

export async function handleListDeployments(
	input: z.infer<typeof import("./types.js").ListDeploymentsInput>,
) {
	try {
		const { region, page, pageSize, ...filters } = input;
		const query = { ...paginationToQuery(page, pageSize), ...filters };
		const data = await apiCall("GET", region, "/deployments", undefined, query);
		const result = buildPaginatedResponse(
			(data.deployments as unknown[]) ?? [],
			(data.total_count as number) ?? 0,
			page,
			pageSize,
		);
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDeployment(
	input: z.infer<typeof import("./types.js").GetDeploymentInput>,
) {
	try {
		const data = await apiCall("GET", input.region, `/deployments/${input.deployment_id}`);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDeployment(
	input: z.infer<typeof import("./types.js").CreateDeploymentInput>,
) {
	try {
		const { region, ...body } = input;
		const data = await apiCall("POST", region, "/deployments", body);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateDeployment(
	input: z.infer<typeof import("./types.js").UpdateDeploymentInput>,
) {
	try {
		const { region, deployment_id, ...body } = input;
		const data = await apiCall("PATCH", region, `/deployments/${deployment_id}`, body);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDeployment(
	input: z.infer<typeof import("./types.js").DeleteDeploymentInput>,
) {
	try {
		const data = await apiCall("DELETE", input.region, `/deployments/${input.deployment_id}`);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListDeploymentEvents(
	input: z.infer<typeof import("./types.js").ListDeploymentEventsInput>,
) {
	try {
		const { region, deployment_id, page, pageSize } = input;
		const query = paginationToQuery(page, pageSize);
		const data = await apiCall(
			"GET",
			region,
			`/deployments/${deployment_id}/events`,
			undefined,
			query,
		);
		const result = buildPaginatedResponse(
			(data.events as unknown[]) ?? [],
			(data.total_count as number) ?? 0,
			page,
			pageSize,
		);
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Endpoint Handlers ---

export async function handleListEndpoints(
	input: z.infer<typeof import("./types.js").ListEndpointsInput>,
) {
	try {
		const { region, page, pageSize, ...filters } = input;
		const query = { ...paginationToQuery(page, pageSize), ...filters };
		const data = await apiCall("GET", region, "/endpoints", undefined, query);
		const result = buildPaginatedResponse(
			(data.endpoints as unknown[]) ?? [],
			(data.total_count as number) ?? 0,
			page,
			pageSize,
		);
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateEndpoint(
	input: z.infer<typeof import("./types.js").CreateEndpointInput>,
) {
	try {
		const { region, ...body } = input;
		const data = await apiCall("POST", region, "/endpoints", body);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateEndpoint(
	input: z.infer<typeof import("./types.js").UpdateEndpointInput>,
) {
	try {
		const { region, endpoint_id, ...body } = input;
		const data = await apiCall("PATCH", region, `/endpoints/${endpoint_id}`, body);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteEndpoint(
	input: z.infer<typeof import("./types.js").DeleteEndpointInput>,
) {
	try {
		await apiCall("DELETE", input.region, `/endpoints/${input.endpoint_id}`);
		return jsonResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Model Handlers ---

export async function handleListModels(
	input: z.infer<typeof import("./types.js").ListModelsInput>,
) {
	try {
		const { region, page, pageSize, ...filters } = input;
		const query = { ...paginationToQuery(page, pageSize), ...filters };
		const data = await apiCall("GET", region, "/models", undefined, query);
		const result = buildPaginatedResponse(
			(data.models as unknown[]) ?? [],
			(data.total_count as number) ?? 0,
			page,
			pageSize,
		);
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetModel(input: z.infer<typeof import("./types.js").GetModelInput>) {
	try {
		const data = await apiCall("GET", input.region, `/models/${input.model_id}`);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Node Type Handlers ---

export async function handleListNodeTypes(
	input: z.infer<typeof import("./types.js").ListNodeTypesInput>,
) {
	try {
		const { region, page, pageSize } = input;
		const query = paginationToQuery(page, pageSize);
		const data = await apiCall("GET", region, "/node-types", undefined, query);
		const result = buildPaginatedResponse(
			(data.node_types as unknown[]) ?? [],
			(data.total_count as number) ?? 0,
			page,
			pageSize,
		);
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- EULA Handlers ---

export async function handleGetEula(input: z.infer<typeof import("./types.js").GetEulaInput>) {
	try {
		const data = await apiCall("GET", input.region, `/models/${input.model_id}/eula`);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleAcceptEula(
	input: z.infer<typeof import("./types.js").AcceptEulaInput>,
) {
	try {
		await apiCall("POST", input.region, `/models/${input.model_id}/eula`);
		return jsonResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
