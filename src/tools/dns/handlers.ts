import type { Client } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	ClearDnsRecordsParams,
	CloneDnsZoneParams,
	CreateDnsZoneParams,
	CreateSslCertificateParams,
	DeleteDnsZoneParams,
	DeleteSslCertificateParams,
	DeleteTsigKeyParams,
	ExportRawDnsZoneParams,
	GetSslCertificateParams,
	GetTsigKeyParams,
	ImportRawDnsZoneParams,
	ListDnsRecordsParams,
	ListDnsZonesParams,
	ListNameserversParams,
	RefreshDnsZoneParams,
	UpdateDnsRecordsParams,
	UpdateDnsZoneParams,
	UpdateNameserversParams,
} from "./types.js";

const API_PREFIX = "/domain/v2beta1";

function getClient(): Client {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- DNS Zones ---

export async function handleListDnsZones(params: ListDnsZonesParams) {
	try {
		const client = getClient();
		const query = new URLSearchParams();
		const pq = paginationToQuery(params.page, params.pageSize);
		query.set("page", String(pq.page));
		query.set("page_size", String(pq.page_size));
		if (params.domain) query.set("domain", params.domain);
		if (params.project_id) query.set("project_id", params.project_id);
		if (params.order_by) query.set("order_by", params.order_by);
		if (params.dns_zones) query.set("dns_zones", params.dns_zones);

		const response = await client.fetch<{
			dns_zones: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${API_PREFIX}/dns-zones`,
			urlParams: query,
		});

		return jsonResponse(
			buildPaginatedResponse(
				response.dns_zones,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDnsZone(params: CreateDnsZoneParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/dns-zones`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				domain: params.domain,
				subdomain: params.subdomain,
				project_id: params.project_id,
			}),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateDnsZone(params: UpdateDnsZoneParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.new_dns_zone !== undefined) body.new_dns_zone = params.new_dns_zone;
		if (params.project_id !== undefined) body.project_id = params.project_id;

		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDnsZone(params: DeleteDnsZoneParams) {
	try {
		const client = getClient();
		const query = new URLSearchParams();
		query.set("project_id", params.project_id);

		await client.fetch<void>({
			method: "DELETE",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}`,
			urlParams: query,
		});
		return jsonResponse({ status: "deleted", dns_zone: params.dns_zone });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCloneDnsZone(params: CloneDnsZoneParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			dest_dns_zone: params.dest_dns_zone,
			overwrite: params.overwrite,
		};
		if (params.project_id) body.project_id = params.project_id;

		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}/clone`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRefreshDnsZone(params: RefreshDnsZoneParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}/refresh`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				recreate_dns_zone: params.recreate_dns_zone,
				recreate_sub_dns_zone: params.recreate_sub_dns_zone,
			}),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- DNS Records ---

export async function handleListDnsRecords(params: ListDnsRecordsParams) {
	try {
		const client = getClient();
		const query = new URLSearchParams();
		const pq = paginationToQuery(params.page, params.pageSize);
		query.set("page", String(pq.page));
		query.set("page_size", String(pq.page_size));
		if (params.name) query.set("name", params.name);
		if (params.type) query.set("type", params.type);
		if (params.id) query.set("id", params.id);
		if (params.project_id) query.set("project_id", params.project_id);
		if (params.order_by) query.set("order_by", params.order_by);

		const response = await client.fetch<{
			records: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}/records`,
			urlParams: query,
		});

		return jsonResponse(
			buildPaginatedResponse(response.records, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateDnsRecords(params: UpdateDnsRecordsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}/records`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				changes: params.changes,
				disallow_new_zone_creation: params.disallow_new_zone_creation,
				return_all_records: params.return_all_records,
				serial: params.serial,
			}),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleClearDnsRecords(params: ClearDnsRecordsParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}/records`,
		});
		return jsonResponse({ status: "cleared", dns_zone: params.dns_zone });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Raw Zone ---

export async function handleExportRawDnsZone(params: ExportRawDnsZoneParams) {
	try {
		const client = getClient();
		const query = new URLSearchParams();
		query.set("format", params.format);

		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}/raw`,
			urlParams: query,
			responseType: "text",
		});
		return jsonResponse({ content: response, dns_zone: params.dns_zone, format: params.format });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleImportRawDnsZone(params: ImportRawDnsZoneParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			bind_source: { content: params.content },
		};
		if (params.project_id) body.project_id = params.project_id;

		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}/raw`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Nameservers ---

export async function handleListNameservers(params: ListNameserversParams) {
	try {
		const client = getClient();
		const query = new URLSearchParams();
		if (params.project_id) query.set("project_id", params.project_id);

		const response = await client.fetch<{
			ns: unknown[];
		}>({
			method: "GET",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}/nameservers`,
			urlParams: query,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateNameservers(params: UpdateNameserversParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "PUT",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}/nameservers`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ns: params.ns }),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- SSL Certificates ---

export async function handleGetSslCertificate(params: GetSslCertificateParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${API_PREFIX}/ssl-certificates/${encodeURIComponent(params.dns_zone)}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateSslCertificate(params: CreateSslCertificateParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/ssl-certificates`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				dns_zone: params.dns_zone,
				alternative_dns_zones: params.alternative_dns_zones,
			}),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteSslCertificate(params: DeleteSslCertificateParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${API_PREFIX}/ssl-certificates/${encodeURIComponent(params.dns_zone)}`,
		});
		return jsonResponse({ status: "deleted", dns_zone: params.dns_zone });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- TSIG Keys ---

export async function handleGetTsigKey(params: GetTsigKeyParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}/tsig-key`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteTsigKey(params: DeleteTsigKeyParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${API_PREFIX}/dns-zones/${encodeURIComponent(params.dns_zone)}/tsig-key`,
		});
		return jsonResponse({ status: "deleted", dns_zone: params.dns_zone });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
