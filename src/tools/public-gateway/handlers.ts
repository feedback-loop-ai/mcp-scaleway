import type { z } from "zod";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	CreateGatewayNetworkParams,
	CreateGatewayParams,
	CreateIPParams,
	CreatePatRuleParams,
	DeleteGatewayNetworkParams,
	DeleteGatewayParams,
	DeleteIPParams,
	DeletePatRuleParams,
	GetGatewayNetworkParams,
	GetGatewayParams,
	GetIPParams,
	GetPatRuleParams,
	ListGatewayNetworksParams,
	ListGatewayTypesParams,
	ListGatewaysParams,
	ListIPsParams,
	ListPatRulesParams,
	UpdateGatewayNetworkParams,
	UpdateGatewayParams,
	UpdateIPParams,
	UpdatePatRuleParams,
} from "./types.js";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function buildUrl(zone: string | undefined, path: string): string {
	const resolvedZone = zone ?? process.env.SCW_DEFAULT_ZONE ?? "fr-par-1";
	return `/vpc-gw/v2/zones/${resolvedZone}${path}`;
}

export function toURLSearchParams(params: Record<string, unknown>): URLSearchParams {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;
		if (Array.isArray(value)) {
			for (const item of value) {
				searchParams.append(key, String(item));
			}
		} else {
			searchParams.set(key, String(value));
		}
	}
	return searchParams;
}

function formatResponse(data: unknown): {
	[x: string]: unknown;
	content: { type: "text"; text: string }[];
	isError?: boolean;
} {
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(data, null, 2),
			},
		],
	};
}

// ─── Gateway Handlers ────────────────────────────────────────────────────────

export async function handleListGateways(params: z.infer<typeof ListGatewaysParams>) {
	try {
		const client = getClient();
		const { page, pageSize, zone, ...filters } = params;
		const queryParams: Record<string, unknown> = {
			...paginationToQuery(page, pageSize),
		};
		if (filters.orderBy) queryParams.order_by = filters.orderBy;
		if (filters.organizationId) queryParams.organization_id = filters.organizationId;
		if (filters.projectId) queryParams.project_id = filters.projectId;
		if (filters.name) queryParams.name = filters.name;
		if (filters.tags) queryParams.tags = filters.tags;
		if (filters.types) queryParams.types = filters.types;
		if (filters.status) queryParams.status = filters.status;
		if (filters.privateNetworkIds) queryParams.private_network_ids = filters.privateNetworkIds;
		if (filters.includeLegacy !== undefined) queryParams.include_legacy = filters.includeLegacy;

		const response = (await client.fetch({
			method: "GET",
			path: buildUrl(zone, "/gateways"),
			urlParams: toURLSearchParams(queryParams),
		})) as { gateways: unknown[]; total_count: number };

		return formatResponse(
			buildPaginatedResponse(response.gateways, response.total_count, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetGateway(params: z.infer<typeof GetGatewayParams>) {
	try {
		const client = getClient();
		const response = await client.fetch({
			method: "GET",
			path: buildUrl(params.zone, `/gateways/${params.gatewayId}`),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateGateway(params: z.infer<typeof CreateGatewayParams>) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			type: params.type,
			enable_smtp: params.enableSmtp,
			enable_bastion: params.enableBastion,
		};
		if (params.projectId) body.project_id = params.projectId;
		if (params.name) body.name = params.name;
		if (params.tags) body.tags = params.tags;
		if (params.ipId) body.ip_id = params.ipId;
		if (params.bastionPort !== undefined) body.bastion_port = params.bastionPort;

		const response = await client.fetch({
			method: "POST",
			path: buildUrl(params.zone, "/gateways"),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateGateway(params: z.infer<typeof UpdateGatewayParams>) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.name !== undefined) body.name = params.name;
		if (params.tags !== undefined) body.tags = params.tags;
		if (params.enableBastion !== undefined) body.enable_bastion = params.enableBastion;
		if (params.bastionPort !== undefined) body.bastion_port = params.bastionPort;
		if (params.enableSmtp !== undefined) body.enable_smtp = params.enableSmtp;

		const response = await client.fetch({
			method: "PATCH",
			path: buildUrl(params.zone, `/gateways/${params.gatewayId}`),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteGateway(params: z.infer<typeof DeleteGatewayParams>) {
	try {
		const client = getClient();
		const response = await client.fetch({
			method: "DELETE",
			path: buildUrl(params.zone, `/gateways/${params.gatewayId}`),
			urlParams: toURLSearchParams({ delete_ip: params.deleteIp }),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── Gateway Network Handlers ────────────────────────────────────────────────

export async function handleListGatewayNetworks(params: z.infer<typeof ListGatewayNetworksParams>) {
	try {
		const client = getClient();
		const { page, pageSize, zone, ...filters } = params;
		const queryParams: Record<string, unknown> = {
			...paginationToQuery(page, pageSize),
		};
		if (filters.orderBy) queryParams.order_by = filters.orderBy;
		if (filters.status) queryParams.status = filters.status;
		if (filters.gatewayIds) queryParams.gateway_ids = filters.gatewayIds;
		if (filters.privateNetworkIds) queryParams.private_network_ids = filters.privateNetworkIds;
		if (filters.masqueradeEnabled !== undefined)
			queryParams.masquerade_enabled = filters.masqueradeEnabled;

		const response = (await client.fetch({
			method: "GET",
			path: buildUrl(zone, "/gateway-networks"),
			urlParams: toURLSearchParams(queryParams),
		})) as { gateway_networks: unknown[]; total_count: number };

		return formatResponse(
			buildPaginatedResponse(response.gateway_networks, response.total_count, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetGatewayNetwork(params: z.infer<typeof GetGatewayNetworkParams>) {
	try {
		const client = getClient();
		const response = await client.fetch({
			method: "GET",
			path: buildUrl(params.zone, `/gateway-networks/${params.gatewayNetworkId}`),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateGatewayNetwork(
	params: z.infer<typeof CreateGatewayNetworkParams>,
) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			gateway_id: params.gatewayId,
			private_network_id: params.privateNetworkId,
			enable_masquerade: params.enableMasquerade,
			push_default_route: params.pushDefaultRoute,
		};
		if (params.ipamIpId) body.ipam_ip_id = params.ipamIpId;

		const response = await client.fetch({
			method: "POST",
			path: buildUrl(params.zone, "/gateway-networks"),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateGatewayNetwork(
	params: z.infer<typeof UpdateGatewayNetworkParams>,
) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.enableMasquerade !== undefined) body.enable_masquerade = params.enableMasquerade;
		if (params.pushDefaultRoute !== undefined) body.push_default_route = params.pushDefaultRoute;
		if (params.ipamIpId !== undefined) body.ipam_ip_id = params.ipamIpId;

		const response = await client.fetch({
			method: "PATCH",
			path: buildUrl(params.zone, `/gateway-networks/${params.gatewayNetworkId}`),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteGatewayNetwork(
	params: z.infer<typeof DeleteGatewayNetworkParams>,
) {
	try {
		const client = getClient();
		const response = await client.fetch({
			method: "DELETE",
			path: buildUrl(params.zone, `/gateway-networks/${params.gatewayNetworkId}`),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── PAT Rule Handlers ──────────────────────────────────────────────────────

export async function handleListPatRules(params: z.infer<typeof ListPatRulesParams>) {
	try {
		const client = getClient();
		const { page, pageSize, zone, ...filters } = params;
		const queryParams: Record<string, unknown> = {
			...paginationToQuery(page, pageSize),
		};
		if (filters.orderBy) queryParams.order_by = filters.orderBy;
		if (filters.gatewayIds) queryParams.gateway_ids = filters.gatewayIds;
		if (filters.privateIps) queryParams.private_ips = filters.privateIps;
		if (filters.protocol) queryParams.protocol = filters.protocol;

		const response = (await client.fetch({
			method: "GET",
			path: buildUrl(zone, "/pat-rules"),
			urlParams: toURLSearchParams(queryParams),
		})) as { pat_rules: unknown[]; total_count: number };

		return formatResponse(
			buildPaginatedResponse(response.pat_rules, response.total_count, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetPatRule(params: z.infer<typeof GetPatRuleParams>) {
	try {
		const client = getClient();
		const response = await client.fetch({
			method: "GET",
			path: buildUrl(params.zone, `/pat-rules/${params.patRuleId}`),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreatePatRule(params: z.infer<typeof CreatePatRuleParams>) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			gateway_id: params.gatewayId,
			public_port: params.publicPort,
			private_ip: params.privateIp,
			private_port: params.privatePort,
		};
		if (params.protocol) body.protocol = params.protocol;

		const response = await client.fetch({
			method: "POST",
			path: buildUrl(params.zone, "/pat-rules"),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdatePatRule(params: z.infer<typeof UpdatePatRuleParams>) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.publicPort !== undefined) body.public_port = params.publicPort;
		if (params.privateIp !== undefined) body.private_ip = params.privateIp;
		if (params.privatePort !== undefined) body.private_port = params.privatePort;
		if (params.protocol !== undefined) body.protocol = params.protocol;

		const response = await client.fetch({
			method: "PATCH",
			path: buildUrl(params.zone, `/pat-rules/${params.patRuleId}`),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeletePatRule(params: z.infer<typeof DeletePatRuleParams>) {
	try {
		const client = getClient();
		await client.fetch({
			method: "DELETE",
			path: buildUrl(params.zone, `/pat-rules/${params.patRuleId}`),
		});
		return formatResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── IP Handlers ─────────────────────────────────────────────────────────────

export async function handleListIPs(params: z.infer<typeof ListIPsParams>) {
	try {
		const client = getClient();
		const { page, pageSize, zone, ...filters } = params;
		const queryParams: Record<string, unknown> = {
			...paginationToQuery(page, pageSize),
		};
		if (filters.orderBy) queryParams.order_by = filters.orderBy;
		if (filters.organizationId) queryParams.organization_id = filters.organizationId;
		if (filters.projectId) queryParams.project_id = filters.projectId;
		if (filters.tags) queryParams.tags = filters.tags;
		if (filters.reverse) queryParams.reverse = filters.reverse;
		if (filters.isFree !== undefined) queryParams.is_free = filters.isFree;

		const response = (await client.fetch({
			method: "GET",
			path: buildUrl(zone, "/ips"),
			urlParams: toURLSearchParams(queryParams),
		})) as { ips: unknown[]; total_count: number };

		return formatResponse(
			buildPaginatedResponse(response.ips, response.total_count, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetIP(params: z.infer<typeof GetIPParams>) {
	try {
		const client = getClient();
		const response = await client.fetch({
			method: "GET",
			path: buildUrl(params.zone, `/ips/${params.ipId}`),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateIP(params: z.infer<typeof CreateIPParams>) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.projectId) body.project_id = params.projectId;
		if (params.tags) body.tags = params.tags;

		const response = await client.fetch({
			method: "POST",
			path: buildUrl(params.zone, "/ips"),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateIP(params: z.infer<typeof UpdateIPParams>) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.tags !== undefined) body.tags = params.tags;
		if (params.reverse !== undefined) body.reverse = params.reverse;
		if (params.gatewayId !== undefined) body.gateway_id = params.gatewayId;

		const response = await client.fetch({
			method: "PATCH",
			path: buildUrl(params.zone, `/ips/${params.ipId}`),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteIP(params: z.infer<typeof DeleteIPParams>) {
	try {
		const client = getClient();
		await client.fetch({
			method: "DELETE",
			path: buildUrl(params.zone, `/ips/${params.ipId}`),
		});
		return formatResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── Gateway Types Handler ───────────────────────────────────────────────────

export async function handleListGatewayTypes(params: z.infer<typeof ListGatewayTypesParams>) {
	try {
		const client = getClient();
		const response = await client.fetch({
			method: "GET",
			path: buildUrl(params.zone, "/gateway-types"),
		});
		return formatResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
