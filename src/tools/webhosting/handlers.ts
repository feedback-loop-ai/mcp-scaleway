import type { Client } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	CreateHostingInput,
	DeleteHostingInput,
	GetDnsRecordsInput,
	GetHostingInput,
	ListControlPanelsInput,
	ListHostingsInput,
	ListOffersInput,
	RestoreHostingInput,
	UpdateHostingInput,
} from "./types.js";

const API_PREFIX = "/webhosting/v1";

function getClient(): Client {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function resolveRegion(inputRegion: string | undefined): string {
	return inputRegion ?? loadAuthConfig().defaultRegion;
}

function formatSuccess(data: unknown) {
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(data, null, 2),
			},
		],
	};
}

export async function handleListHostings(input: ListHostingsInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);
		const { page, pageSize, ...filters } = input;
		const params = new URLSearchParams();

		const pq = paginationToQuery(page, pageSize);
		params.set("page", String(pq.page));
		params.set("page_size", String(pq.page_size));

		if (filters.order_by) params.set("order_by", filters.order_by);
		if (filters.project_id) params.set("project_id", filters.project_id);
		if (filters.domain) params.set("domain", filters.domain);
		if (filters.organization_id) params.set("organization_id", filters.organization_id);
		if (filters.tags) {
			for (const tag of filters.tags) params.append("tags", tag);
		}
		if (filters.statuses) {
			for (const s of filters.statuses) params.append("statuses", s);
		}
		if (filters.control_panels) {
			for (const cp of filters.control_panels) params.append("control_panels", cp);
		}

		const response = await client.fetch<{
			hostings: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${API_PREFIX}/regions/${region}/hostings`,
			urlParams: params,
		});

		const result = buildPaginatedResponse(response.hostings, response.total_count, page, pageSize);
		return formatSuccess(result);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetHosting(input: GetHostingInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);

		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${API_PREFIX}/regions/${region}/hostings/${input.hosting_id}`,
		});

		return formatSuccess(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateHosting(input: CreateHostingInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);

		const body: Record<string, unknown> = {
			offer_id: input.offer_id,
			domain: input.domain,
		};

		if (input.project_id) body.project_id = input.project_id;
		if (input.tags) body.tags = input.tags;
		if (input.option_ids) body.option_ids = input.option_ids;
		if (input.language) body.language = input.language;
		if (input.domain_configuration) body.domain_configuration = input.domain_configuration;
		if (input.skip_welcome_email !== undefined) body.skip_welcome_email = input.skip_welcome_email;

		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/regions/${region}/hostings`,
			body: JSON.stringify(body),
		});

		return formatSuccess(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateHosting(input: UpdateHostingInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);

		const body: Record<string, unknown> = {};
		if (input.email) body.email = input.email;
		if (input.tags) body.tags = input.tags;
		if (input.option_ids) body.option_ids = input.option_ids;
		if (input.offer_id) body.offer_id = input.offer_id;
		if (input.protected !== undefined) body.protected = input.protected;

		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${API_PREFIX}/regions/${region}/hostings/${input.hosting_id}`,
			body: JSON.stringify(body),
		});

		return formatSuccess(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteHosting(input: DeleteHostingInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);

		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: `${API_PREFIX}/regions/${region}/hostings/${input.hosting_id}`,
		});

		return formatSuccess(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRestoreHosting(input: RestoreHostingInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);

		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/regions/${region}/hostings/${input.hosting_id}/restore`,
		});

		return formatSuccess(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDnsRecords(input: GetDnsRecordsInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);

		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${API_PREFIX}/regions/${region}/hostings/${input.hosting_id}/dns-records`,
		});

		return formatSuccess(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListOffers(input: ListOffersInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);
		const params = new URLSearchParams();

		if (input.order_by) params.set("order_by", input.order_by);
		if (input.hosting_id) params.set("hosting_id", input.hosting_id);
		if (input.without_options !== undefined)
			params.set("without_options", String(input.without_options));
		if (input.only_options !== undefined) params.set("only_options", String(input.only_options));
		if (input.control_panels) {
			for (const cp of input.control_panels) params.append("control_panels", cp);
		}

		const response = await client.fetch<{ offers: unknown[] }>({
			method: "GET",
			path: `${API_PREFIX}/regions/${region}/offers`,
			urlParams: params,
		});

		return formatSuccess(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListControlPanels(input: ListControlPanelsInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);

		const response = await client.fetch<{ control_panels: unknown[] }>({
			method: "GET",
			path: `${API_PREFIX}/regions/${region}/control-panels`,
		});

		return formatSuccess(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
