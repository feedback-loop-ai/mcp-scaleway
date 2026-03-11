import type { Client } from "@scaleway/sdk-client";
import type { z } from "zod";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { paginationToQuery } from "../../shared/pagination.js";
import type {
	CreateServerParams,
	DeleteServerParams,
	GetServerParams,
	ListOSParams,
	ListServerTypesParams,
	ListServersParams,
	RebootServerParams,
	ReinstallServerParams,
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
	};
}
