import type { Client } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import {
	CreateIpInput,
	CreateServerInput,
	DeleteIpInput,
	DeleteServerInput,
	GetBmcAccessInput,
	GetServerInput,
	InstallServerInput,
	ListIpsInput,
	ListOffersInput,
	ListOssInput,
	ListServersInput,
	RebootServerInput,
	StartServerInput,
	StopServerInput,
} from "./types.js";

const BASE_URL = "https://api.scaleway.com/baremetal/v1/zones";

function paginationSearchParams(page: number, pageSize: number): URLSearchParams {
	return new URLSearchParams({
		page: String(page),
		page_size: String(pageSize),
	});
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

export async function apiCall(
	client: Client,
	method: string,
	url: string,
	body?: unknown,
): Promise<unknown> {
	const fetchFn = client as unknown as {
		fetch: (url: string, init: RequestInit) => Promise<Response>;
	};
	const init: RequestInit = {
		method,
		headers: { "Content-Type": "application/json" },
	};
	if (body !== undefined) {
		init.body = JSON.stringify(body);
	}
	const response = await fetchFn.fetch(url, init);
	if (!response.ok) {
		const errorBody = await response.text();
		const error = new Error(errorBody || `HTTP ${response.status}`);
		(error as unknown as { statusCode: number }).statusCode = response.status;
		throw error;
	}
	if (response.status === 204) {
		return {};
	}
	return response.json();
}

function getClient(): Client {
	return createScalewayClient(loadAuthConfig());
}

// --- US1: Server CRUD ---

export async function handleListServers(params: Record<string, unknown>) {
	const input = ListServersInput.parse(params);
	try {
		const client = getClient();
		const searchParams = paginationSearchParams(input.page, input.pageSize);
		if (input.project_id) searchParams.set("project_id", input.project_id);
		if (input.name) searchParams.set("name", input.name);
		if (input.tags) {
			for (const tag of input.tags) searchParams.append("tags", tag);
		}
		if (input.status) searchParams.set("status", input.status);
		if (input.order_by) searchParams.set("order_by", input.order_by);

		const data = (await apiCall(
			client,
			"GET",
			`${BASE_URL}/${input.zone}/servers?${searchParams.toString()}`,
		)) as { servers: unknown[]; total_count: number };

		return jsonResponse(
			buildPaginatedResponse(data.servers, data.total_count, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetServer(params: Record<string, unknown>) {
	const input = GetServerInput.parse(params);
	try {
		const client = getClient();
		const data = await apiCall(
			client,
			"GET",
			`${BASE_URL}/${input.zone}/servers/${input.server_id}`,
		);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateServer(params: Record<string, unknown>) {
	const input = CreateServerInput.parse(params);
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			offer_id: input.offer_id,
			name: input.name,
			description: input.description,
			tags: input.tags,
		};
		if (input.project_id) body.project_id = input.project_id;

		const data = await apiCall(client, "POST", `${BASE_URL}/${input.zone}/servers`, body);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteServer(params: Record<string, unknown>) {
	const input = DeleteServerInput.parse(params);
	try {
		const client = getClient();
		const data = await apiCall(
			client,
			"DELETE",
			`${BASE_URL}/${input.zone}/servers/${input.server_id}`,
		);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- US2: Server Actions ---

export async function handleInstallServer(params: Record<string, unknown>) {
	const input = InstallServerInput.parse(params);
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			os_id: input.os_id,
			hostname: input.hostname,
			ssh_key_ids: input.ssh_key_ids,
		};
		if (input.password) body.password = input.password;
		if (input.service_user) body.service_user = input.service_user;
		if (input.service_password) body.service_password = input.service_password;

		const data = await apiCall(
			client,
			"POST",
			`${BASE_URL}/${input.zone}/servers/${input.server_id}/install`,
			body,
		);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRebootServer(params: Record<string, unknown>) {
	const input = RebootServerInput.parse(params);
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (input.boot_type) body.boot_type = input.boot_type;

		const data = await apiCall(
			client,
			"POST",
			`${BASE_URL}/${input.zone}/servers/${input.server_id}/reboot`,
			body,
		);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleStartServer(params: Record<string, unknown>) {
	const input = StartServerInput.parse(params);
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (input.boot_type) body.boot_type = input.boot_type;

		const data = await apiCall(
			client,
			"POST",
			`${BASE_URL}/${input.zone}/servers/${input.server_id}/start`,
			body,
		);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleStopServer(params: Record<string, unknown>) {
	const input = StopServerInput.parse(params);
	try {
		const client = getClient();
		const data = await apiCall(
			client,
			"POST",
			`${BASE_URL}/${input.zone}/servers/${input.server_id}/stop`,
			{},
		);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- US3: Offers, OS, BMC ---

export async function handleListOffers(params: Record<string, unknown>) {
	const input = ListOffersInput.parse(params);
	try {
		const client = getClient();
		const searchParams = paginationSearchParams(input.page, input.pageSize);
		if (input.subscription_period)
			searchParams.set("subscription_period", input.subscription_period);

		const data = (await apiCall(
			client,
			"GET",
			`${BASE_URL}/${input.zone}/offers?${searchParams.toString()}`,
		)) as { offers: unknown[]; total_count: number };

		return jsonResponse(
			buildPaginatedResponse(data.offers, data.total_count, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListOss(params: Record<string, unknown>) {
	const input = ListOssInput.parse(params);
	try {
		const client = getClient();
		const searchParams = paginationSearchParams(input.page, input.pageSize);
		if (input.offer_id) searchParams.set("offer_id", input.offer_id);

		const data = (await apiCall(
			client,
			"GET",
			`${BASE_URL}/${input.zone}/oss?${searchParams.toString()}`,
		)) as { oss: unknown[]; total_count: number };

		return jsonResponse(
			buildPaginatedResponse(data.oss, data.total_count, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetBmcAccess(params: Record<string, unknown>) {
	const input = GetBmcAccessInput.parse(params);
	try {
		const client = getClient();
		const data = await apiCall(
			client,
			"GET",
			`${BASE_URL}/${input.zone}/servers/${input.server_id}/bmc-access`,
		);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- US4: Flexible IPs ---

export async function handleListIps(params: Record<string, unknown>) {
	const input = ListIpsInput.parse(params);
	try {
		const client = getClient();
		const searchParams = paginationSearchParams(input.page, input.pageSize);
		if (input.project_id) searchParams.set("project_id", input.project_id);
		if (input.server_id) searchParams.set("server_id", input.server_id);
		if (input.order_by) searchParams.set("order_by", input.order_by);

		const data = (await apiCall(
			client,
			"GET",
			`${BASE_URL}/${input.zone}/ips?${searchParams.toString()}`,
		)) as { ips: unknown[]; total_count: number };

		return jsonResponse(
			buildPaginatedResponse(data.ips, data.total_count, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateIp(params: Record<string, unknown>) {
	const input = CreateIpInput.parse(params);
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			project_id: input.project_id,
			description: input.description,
			tags: input.tags,
		};
		if (input.server_id) body.server_id = input.server_id;

		const data = await apiCall(client, "POST", `${BASE_URL}/${input.zone}/ips`, body);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteIp(params: Record<string, unknown>) {
	const input = DeleteIpInput.parse(params);
	try {
		const client = getClient();
		const data = await apiCall(client, "DELETE", `${BASE_URL}/${input.zone}/ips/${input.ip_id}`);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
