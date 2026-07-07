import type { Client } from "@scaleway/sdk-client";
import type { z } from "zod";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { paginationToQuery } from "../../shared/pagination.js";
import type {
	AddServerPrivateNetworkParams,
	CreateServerParams,
	DeleteServerParams,
	DeleteServerPrivateNetworkParams,
	GetServerParams,
	GetServerPrivateNetworkParams,
	ListOSParams,
	ListServerPrivateNetworksParams,
	ListServerTypesParams,
	ListServersParams,
	RebootServerParams,
	ReinstallServerParams,
	SetServerPrivateNetworksParams,
} from "./types.js";

const BASE_PATH = "/apple-silicon/v1alpha1/zones";

function buildUrl(zone: string, ...segments: string[]): string {
	return `${BASE_PATH}/${zone}/${segments.join("/")}`;
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

export function createAppleSiliconHandlers(client: Client, defaultZone: string) {
	return {
		async listServers(params: z.infer<typeof ListServersParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				const response = await client.fetch<{
					servers: unknown[];
					total_count: number;
				}>({
					method: "GET",
					path: buildUrl(zone, "servers"),
					urlParams: new URLSearchParams(
						Object.entries({
							...(params.order_by ? { order_by: params.order_by } : {}),
							...(params.project_id ? { project_id: params.project_id } : {}),
							...(params.organization_id ? { organization_id: params.organization_id } : {}),
							...Object.fromEntries(
								Object.entries(paginationToQuery(params.page, params.pageSize)).map(([k, v]) => [
									k,
									String(v),
								]),
							),
						}),
					),
				});
				return jsonResponse(response);
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async getServer(params: z.infer<typeof GetServerParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				const response = await client.fetch<unknown>({
					method: "GET",
					path: buildUrl(zone, "servers", params.server_id),
				});
				return jsonResponse(response);
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async createServer(params: z.infer<typeof CreateServerParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				const body: Record<string, unknown> = {
					type: params.type,
					enable_vpc: params.enable_vpc ?? false,
					enable_kext: params.enable_kext ?? false,
				};
				if (params.name !== undefined) body.name = params.name;
				if (params.project_id !== undefined) body.project_id = params.project_id;
				if (params.os_id !== undefined) body.os_id = params.os_id;
				if (params.commitment_type !== undefined) body.commitment_type = params.commitment_type;
				if (params.public_bandwidth_bps !== undefined)
					body.public_bandwidth_bps = params.public_bandwidth_bps;

				const response = await client.fetch<unknown>({
					method: "POST",
					path: buildUrl(zone, "servers"),
					body: JSON.stringify(body),
					headers: { "Content-Type": "application/json" },
				});
				return jsonResponse(response);
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async deleteServer(params: z.infer<typeof DeleteServerParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				await client.fetch<void>({
					method: "DELETE",
					path: buildUrl(zone, "servers", params.server_id),
				});
				return jsonResponse({ message: "Server deleted successfully" });
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async rebootServer(params: z.infer<typeof RebootServerParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				const response = await client.fetch<unknown>({
					method: "POST",
					path: buildUrl(zone, "servers", params.server_id, "reboot"),
					body: "{}",
					headers: { "Content-Type": "application/json" },
				});
				return jsonResponse(response);
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async reinstallServer(params: z.infer<typeof ReinstallServerParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				const body: Record<string, unknown> = {
					enable_kext: params.enable_kext ?? false,
				};
				if (params.os_id !== undefined) body.os_id = params.os_id;

				const response = await client.fetch<unknown>({
					method: "POST",
					path: buildUrl(zone, "servers", params.server_id, "reinstall"),
					body: JSON.stringify(body),
					headers: { "Content-Type": "application/json" },
				});
				return jsonResponse(response);
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async listServerTypes(params: z.infer<typeof ListServerTypesParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				const response = await client.fetch<{ server_types: unknown[] }>({
					method: "GET",
					path: buildUrl(zone, "server-types"),
				});
				return jsonResponse(response);
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async listOS(params: z.infer<typeof ListOSParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				const response = await client.fetch<{
					os: unknown[];
					total_count: number;
				}>({
					method: "GET",
					path: buildUrl(zone, "os"),
					urlParams: new URLSearchParams(
						Object.entries({
							...(params.server_type ? { server_type: params.server_type } : {}),
							...(params.name ? { name: params.name } : {}),
							...Object.fromEntries(
								Object.entries(paginationToQuery(params.page, params.pageSize)).map(([k, v]) => [
									k,
									String(v),
								]),
							),
						}),
					),
				});
				return jsonResponse(response);
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async listServerPrivateNetworks(params: z.infer<typeof ListServerPrivateNetworksParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				const urlParams = new URLSearchParams(
					Object.entries({
						...(params.order_by ? { order_by: params.order_by } : {}),
						...(params.server_id ? { server_id: params.server_id } : {}),
						...(params.private_network_id ? { private_network_id: params.private_network_id } : {}),
						...(params.organization_id ? { organization_id: params.organization_id } : {}),
						...(params.project_id ? { project_id: params.project_id } : {}),
						...Object.fromEntries(
							Object.entries(paginationToQuery(params.page, params.pageSize)).map(([k, v]) => [
								k,
								String(v),
							]),
						),
					}),
				);
				if (params.ipam_ip_ids) {
					for (const id of params.ipam_ip_ids) {
						urlParams.append("ipam_ip_ids", id);
					}
				}
				const response = await client.fetch<{
					server_private_networks: unknown[];
					total_count: number;
				}>({
					method: "GET",
					path: buildUrl(zone, "server-private-networks"),
					urlParams,
				});
				return jsonResponse(response);
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async getServerPrivateNetwork(params: z.infer<typeof GetServerPrivateNetworkParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				const response = await client.fetch<unknown>({
					method: "GET",
					path: buildUrl(
						zone,
						"servers",
						params.server_id,
						"private-networks",
						params.private_network_id,
					),
				});
				return jsonResponse(response);
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async addServerPrivateNetwork(params: z.infer<typeof AddServerPrivateNetworkParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				const body: Record<string, unknown> = {
					private_network_id: params.private_network_id,
				};
				if (params.ipam_ip_ids !== undefined) body.ipam_ip_ids = params.ipam_ip_ids;

				const response = await client.fetch<unknown>({
					method: "POST",
					path: buildUrl(zone, "servers", params.server_id, "private-networks"),
					body: JSON.stringify(body),
					headers: { "Content-Type": "application/json" },
				});
				return jsonResponse(response);
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async setServerPrivateNetworks(params: z.infer<typeof SetServerPrivateNetworksParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				const response = await client.fetch<unknown>({
					method: "PUT",
					path: buildUrl(zone, "servers", params.server_id, "private-networks"),
					body: JSON.stringify({
						per_private_network_ipam_ip_ids: params.per_private_network_ipam_ip_ids,
					}),
					headers: { "Content-Type": "application/json" },
				});
				return jsonResponse(response);
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},

		async deleteServerPrivateNetwork(params: z.infer<typeof DeleteServerPrivateNetworkParams>) {
			try {
				const zone = params.zone ?? defaultZone;
				await client.fetch<void>({
					method: "DELETE",
					path: buildUrl(
						zone,
						"servers",
						params.server_id,
						"private-networks",
						params.private_network_id,
					),
				});
				return jsonResponse({ message: "Private Network detached successfully" });
			} catch (error) {
				return formatErrorResponse(mapScalewayError(error));
			}
		},
	};
}
