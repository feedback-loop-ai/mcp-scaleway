import type { Client } from "@scaleway/sdk-client";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	BookIPInput,
	GetIPInput,
	ListIPsInput,
	ReleaseIPInput,
	UpdateIPInput,
} from "./types.js";

const IPAM_API = "ipam/v1";

function ipamUrl(region: string, path: string): string {
	return `/${IPAM_API}/regions/${region}${path}`;
}

const unmarshal = <T>(obj: unknown): T => obj as T;

export function buildUrlParams(params: Record<string, unknown>): URLSearchParams {
	const urlParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) continue;
		if (Array.isArray(value)) {
			for (const item of value) {
				urlParams.append(key, String(item));
			}
		} else {
			urlParams.set(key, String(value));
		}
	}
	return urlParams;
}

interface ListIPsApiResponse {
	ips: unknown[];
	total_count: number;
}

export async function handleListIPs(client: Client, input: ListIPsInput) {
	try {
		const {
			region,
			page,
			pageSize,
			order_by,
			project_id,
			zonal,
			private_network_id,
			subnet_id,
			vpc_id,
			attached,
			resource_type,
			resource_id,
			mac_address,
			tags,
			is_ipv6,
			resource_name,
			organization_id,
		} = input;

		const params: Record<string, unknown> = {
			...paginationToQuery(page, pageSize),
			order_by,
		};

		if (project_id !== undefined) params.project_id = project_id;
		if (zonal !== undefined) params.zonal = zonal;
		if (private_network_id !== undefined) params.private_network_id = private_network_id;
		if (subnet_id !== undefined) params.subnet_id = subnet_id;
		if (vpc_id !== undefined) params.vpc_id = vpc_id;
		if (attached !== undefined) params.attached = attached;
		if (resource_type !== undefined) params.resource_type = resource_type;
		if (resource_id !== undefined) params.resource_id = resource_id;
		if (mac_address !== undefined) params.mac_address = mac_address;
		if (tags !== undefined) params.tags = tags;
		if (is_ipv6 !== undefined) params.is_ipv6 = is_ipv6;
		if (resource_name !== undefined) params.resource_name = resource_name;
		if (organization_id !== undefined) params.organization_id = organization_id;

		const response = await client.fetch<ListIPsApiResponse>(
			{
				method: "GET",
				path: ipamUrl(region, "/ips"),
				urlParams: buildUrlParams(params),
			},
			unmarshal,
		);

		const paginated = buildPaginatedResponse(response.ips, response.total_count, page, pageSize);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(paginated, null, 2),
				},
			],
		};
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetIP(client: Client, input: GetIPInput) {
	try {
		const { region, ip_id } = input;

		const response = await client.fetch<unknown>(
			{
				method: "GET",
				path: ipamUrl(region, `/ips/${ip_id}`),
			},
			unmarshal,
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response, null, 2),
				},
			],
		};
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleBookIP(client: Client, input: BookIPInput) {
	try {
		const { region, project_id, source, is_ipv6, address, tags, resource } = input;

		const body: Record<string, unknown> = {
			project_id,
			source,
			is_ipv6,
			tags,
		};

		if (address !== undefined) body.address = address;
		if (resource !== undefined) body.resource = resource;

		const response = await client.fetch<unknown>(
			{
				method: "POST",
				path: ipamUrl(region, "/ips"),
				body: JSON.stringify(body),
				headers: { "Content-Type": "application/json" },
			},
			unmarshal,
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response, null, 2),
				},
			],
		};
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleReleaseIP(client: Client, input: ReleaseIPInput) {
	try {
		const { region, ip_id } = input;

		await client.fetch<void>(
			{
				method: "DELETE",
				path: ipamUrl(region, `/ips/${ip_id}`),
			},
			() => undefined,
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify({ success: true, ip_id }, null, 2),
				},
			],
		};
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateIP(client: Client, input: UpdateIPInput) {
	try {
		const { region, ip_id, tags, reverses } = input;

		const body: Record<string, unknown> = {};
		if (tags !== undefined) body.tags = tags;
		if (reverses !== undefined) body.reverses = reverses;

		const response = await client.fetch<unknown>(
			{
				method: "PATCH",
				path: ipamUrl(region, `/ips/${ip_id}`),
				body: JSON.stringify(body),
				headers: { "Content-Type": "application/json" },
			},
			unmarshal,
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response, null, 2),
				},
			],
		};
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
