import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CancelServerInstallParams,
	DeleteServerParams,
	GetBmcAccessParams,
	GetOSParams,
	GetOfferParams,
	GetServerInstallParams,
	GetServerParams,
	InstallServerParams,
	ListOSParams,
	ListOffersParams,
	ListServersParams,
	RebootServerParams,
	StartBmcAccessParams,
	StartServerParams,
	StopBmcAccessParams,
	StopServerParams,
	UpdateServerParams,
} from "./types.js";

const DEDIBOX_API_PREFIX = "dedibox/v1/zones";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- Server handlers ---

export async function handleListServers(params: ListServersParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			servers: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["search", params.search],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.servers, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetServer(params: GetServerParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateServer(params: UpdateServerParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}`,
			body: JSON.stringify({
				hostname: params.hostname,
				enable_ipv6: params.enableIpv6,
			}),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRebootServer(params: RebootServerParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}/reboot`,
			body: "{}",
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleStartServer(params: StartServerParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}/start`,
			body: "{}",
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleStopServer(params: StopServerParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}/stop`,
			body: "{}",
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteServer(params: DeleteServerParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}`,
		});
		return jsonResponse({ message: "Server deleted successfully" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Install handlers ---

export async function handleInstallServer(params: InstallServerParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}/install`,
			body: JSON.stringify({
				os_id: params.osId,
				hostname: params.hostname,
				user_login: params.userLogin,
				user_password: params.userPassword,
				panel_password: params.panelPassword,
				root_password: params.rootPassword,
				partitions: params.partitions?.map((partition) => ({
					file_system: partition.fileSystem,
					mount_point: partition.mountPoint,
					raid_level: partition.raidLevel,
					capacity: partition.capacity,
					connectors: partition.connectors,
				})),
				ssh_key_ids: params.sshKeyIds,
				license_offer_id: params.licenseOfferId,
				ip_id: params.ipId,
			}),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetServerInstall(params: GetServerInstallParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}/install`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCancelServerInstall(params: CancelServerInstallParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}/cancel-install`,
			body: "{}",
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Offer handlers ---

export async function handleListOffers(params: ListOffersParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			offers: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/offers`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["order_by", params.orderBy],
				["commercial_range", params.commercialRange],
				["catalog", params.catalog],
				["project_id", params.projectId],
				["available_only", params.availableOnly],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.offers, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetOffer(params: GetOfferParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/offers/${params.offerId}`,
			urlParams: urlParams(["project_id", params.projectId]),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- OS handlers ---

export async function handleListOS(params: ListOSParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			os: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/os`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["order_by", params.orderBy],
				["type", params.type],
				["server_id", params.serverId],
				["project_id", params.projectId],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.os, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetOS(params: GetOSParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/os/${params.osId}`,
			urlParams: urlParams(["server_id", params.serverId], ["project_id", params.projectId]),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- BMC access handlers ---

export async function handleGetBmcAccess(params: GetBmcAccessParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}/bmc-access`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleStartBmcAccess(params: StartBmcAccessParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}/bmc-access`,
			body: JSON.stringify({ ip: params.ip }),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleStopBmcAccess(params: StopBmcAccessParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${DEDIBOX_API_PREFIX}/${params.zone}/servers/${params.serverId}/bmc-access`,
		});
		return jsonResponse({ message: "BMC access stopped successfully" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
