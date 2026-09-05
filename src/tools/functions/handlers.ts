import type { Client } from "@scaleway/sdk-client";
import type { z } from "zod";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import type {
	CreateCronInput,
	CreateDomainInput,
	CreateFunctionInput,
	CreateNamespaceInput,
	CreateTokenInput,
	DeleteCronInput,
	DeleteDomainInput,
	DeleteFunctionInput,
	DeleteNamespaceInput,
	DeleteTokenInput,
	DeployFunctionInput,
	GetFunctionInput,
	GetNamespaceInput,
	ListCronsInput,
	ListDomainsInput,
	ListFunctionsInput,
	ListNamespacesInput,
	UpdateCronInput,
	UpdateFunctionInput,
	UpdateNamespaceInput,
} from "./types.js";

const API_PREFIX = "/functions/v1beta1/regions";

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- Namespace Handlers ---

export async function handleListNamespaces(
	client: Client,
	input: z.infer<typeof ListNamespacesInput>,
) {
	try {
		const { region, page, page_size, project_id, name, order_by } = input;
		const params = new URLSearchParams();
		params.set("page", String(page));
		params.set("page_size", String(page_size));
		if (project_id) params.set("project_id", project_id);
		if (name) params.set("name", name);
		if (order_by) params.set("order_by", order_by);

		const result = await client.fetch<{ namespaces: unknown[]; total_count: number }>({
			method: "GET",
			path: `${API_PREFIX}/${region}/namespaces`,
			urlParams: params,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetNamespace(client: Client, input: z.infer<typeof GetNamespaceInput>) {
	try {
		const result = await client.fetch<unknown>({
			method: "GET",
			path: `${API_PREFIX}/${input.region}/namespaces/${input.namespace_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateNamespace(
	client: Client,
	input: z.infer<typeof CreateNamespaceInput>,
) {
	try {
		const { region, ...body } = input;
		const result = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/${region}/namespaces`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateNamespace(
	client: Client,
	input: z.infer<typeof UpdateNamespaceInput>,
) {
	try {
		const { region, namespace_id, ...body } = input;
		const result = await client.fetch<unknown>({
			method: "PATCH",
			path: `${API_PREFIX}/${region}/namespaces/${namespace_id}`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteNamespace(
	client: Client,
	input: z.infer<typeof DeleteNamespaceInput>,
) {
	try {
		const result = await client.fetch<unknown>({
			method: "DELETE",
			path: `${API_PREFIX}/${input.region}/namespaces/${input.namespace_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Function Handlers ---

export async function handleListFunctions(
	client: Client,
	input: z.infer<typeof ListFunctionsInput>,
) {
	try {
		const { region, namespace_id, page, page_size, name, order_by, project_id } = input;
		const params = new URLSearchParams();
		params.set("namespace_id", namespace_id);
		params.set("page", String(page));
		params.set("page_size", String(page_size));
		if (name) params.set("name", name);
		if (order_by) params.set("order_by", order_by);
		if (project_id) params.set("project_id", project_id);

		const result = await client.fetch<{ functions: unknown[]; total_count: number }>({
			method: "GET",
			path: `${API_PREFIX}/${region}/functions`,
			urlParams: params,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetFunction(client: Client, input: z.infer<typeof GetFunctionInput>) {
	try {
		const result = await client.fetch<unknown>({
			method: "GET",
			path: `${API_PREFIX}/${input.region}/functions/${input.function_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateFunction(
	client: Client,
	input: z.infer<typeof CreateFunctionInput>,
) {
	try {
		const { region, ...body } = input;
		const result = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/${region}/functions`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateFunction(
	client: Client,
	input: z.infer<typeof UpdateFunctionInput>,
) {
	try {
		const { region, function_id, ...body } = input;
		const result = await client.fetch<unknown>({
			method: "PATCH",
			path: `${API_PREFIX}/${region}/functions/${function_id}`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteFunction(
	client: Client,
	input: z.infer<typeof DeleteFunctionInput>,
) {
	try {
		const result = await client.fetch<unknown>({
			method: "DELETE",
			path: `${API_PREFIX}/${input.region}/functions/${input.function_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeployFunction(
	client: Client,
	input: z.infer<typeof DeployFunctionInput>,
) {
	try {
		const result = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/${input.region}/functions/${input.function_id}/deploy`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Cron Handlers ---

export async function handleListCrons(client: Client, input: z.infer<typeof ListCronsInput>) {
	try {
		const { region, function_id, page, page_size, order_by } = input;
		const params = new URLSearchParams();
		params.set("function_id", function_id);
		params.set("page", String(page));
		params.set("page_size", String(page_size));
		if (order_by) params.set("order_by", order_by);

		const result = await client.fetch<{ crons: unknown[]; total_count: number }>({
			method: "GET",
			path: `${API_PREFIX}/${region}/crons`,
			urlParams: params,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateCron(client: Client, input: z.infer<typeof CreateCronInput>) {
	try {
		const { region, ...body } = input;
		const result = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/${region}/crons`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateCron(client: Client, input: z.infer<typeof UpdateCronInput>) {
	try {
		const { region, cron_id, ...body } = input;
		const result = await client.fetch<unknown>({
			method: "PATCH",
			path: `${API_PREFIX}/${region}/crons/${cron_id}`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteCron(client: Client, input: z.infer<typeof DeleteCronInput>) {
	try {
		const result = await client.fetch<unknown>({
			method: "DELETE",
			path: `${API_PREFIX}/${input.region}/crons/${input.cron_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Domain Handlers ---

export async function handleListDomains(client: Client, input: z.infer<typeof ListDomainsInput>) {
	try {
		const { region, function_id, page, page_size, order_by } = input;
		const params = new URLSearchParams();
		params.set("function_id", function_id);
		params.set("page", String(page));
		params.set("page_size", String(page_size));
		if (order_by) params.set("order_by", order_by);

		const result = await client.fetch<{ domains: unknown[]; total_count: number }>({
			method: "GET",
			path: `${API_PREFIX}/${region}/domains`,
			urlParams: params,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDomain(client: Client, input: z.infer<typeof CreateDomainInput>) {
	try {
		const { region, ...body } = input;
		const result = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/${region}/domains`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDomain(client: Client, input: z.infer<typeof DeleteDomainInput>) {
	try {
		const result = await client.fetch<unknown>({
			method: "DELETE",
			path: `${API_PREFIX}/${input.region}/domains/${input.domain_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Token Handlers ---

export async function handleCreateToken(client: Client, input: z.infer<typeof CreateTokenInput>) {
	try {
		const { region, ...body } = input;
		const result = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/${region}/tokens`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteToken(client: Client, input: z.infer<typeof DeleteTokenInput>) {
	try {
		const result = await client.fetch<unknown>({
			method: "DELETE",
			path: `${API_PREFIX}/${input.region}/tokens/${input.token_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
