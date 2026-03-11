import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleClearDnsRecords,
	handleCloneDnsZone,
	handleCreateDnsZone,
	handleCreateSslCertificate,
	handleDeleteDnsZone,
	handleDeleteSslCertificate,
	handleDeleteTsigKey,
	handleExportRawDnsZone,
	handleGetSslCertificate,
	handleGetTsigKey,
	handleImportRawDnsZone,
	handleListDnsRecords,
	handleListDnsZones,
	handleListNameservers,
	handleRefreshDnsZone,
	handleUpdateDnsRecords,
	handleUpdateDnsZone,
	handleUpdateNameservers,
} from "./handlers.js";
import {
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

export function registerDnsTools(server: McpServer): void {
	// --- DNS Zones ---

	server.tool(
		"scaleway_dns_list_zones",
		"List DNS zones with optional filtering by domain, project, and sorting",
		ListDnsZonesParams.shape,
		async (params) => handleListDnsZones(ListDnsZonesParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_create_zone",
		"Create a new DNS zone for a domain",
		CreateDnsZoneParams.shape,
		async (params) => handleCreateDnsZone(CreateDnsZoneParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_update_zone",
		"Update a DNS zone (rename subdomain or reassign project)",
		UpdateDnsZoneParams.shape,
		async (params) => handleUpdateDnsZone(UpdateDnsZoneParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_delete_zone",
		"Delete a DNS zone and all its records",
		DeleteDnsZoneParams.shape,
		async (params) => handleDeleteDnsZone(DeleteDnsZoneParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_clone_zone",
		"Clone a DNS zone to a new destination zone",
		CloneDnsZoneParams.shape,
		async (params) => handleCloneDnsZone(CloneDnsZoneParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_refresh_zone",
		"Refresh a DNS zone, optionally recreating it and sub-zones",
		RefreshDnsZoneParams.shape,
		async (params) => handleRefreshDnsZone(RefreshDnsZoneParams.parse(params)),
	);

	// --- DNS Records ---

	server.tool(
		"scaleway_dns_list_records",
		"List DNS records in a zone with optional filtering by name, type, or ID",
		ListDnsRecordsParams.shape,
		async (params) => handleListDnsRecords(ListDnsRecordsParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_update_records",
		"Batch update DNS records using add/set/delete/clear operations",
		UpdateDnsRecordsParams.shape,
		async (params) => handleUpdateDnsRecords(UpdateDnsRecordsParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_clear_records",
		"Clear all DNS records from a zone",
		ClearDnsRecordsParams.shape,
		async (params) => handleClearDnsRecords(ClearDnsRecordsParams.parse(params)),
	);

	// --- Raw Zone ---

	server.tool(
		"scaleway_dns_export_raw_zone",
		"Export a DNS zone as a raw BIND zone file",
		ExportRawDnsZoneParams.shape,
		async (params) => handleExportRawDnsZone(ExportRawDnsZoneParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_import_raw_zone",
		"Import a raw BIND zone file into a DNS zone",
		ImportRawDnsZoneParams.shape,
		async (params) => handleImportRawDnsZone(ImportRawDnsZoneParams.parse(params)),
	);

	// --- Nameservers ---

	server.tool(
		"scaleway_dns_list_nameservers",
		"List nameservers for a DNS zone",
		ListNameserversParams.shape,
		async (params) => handleListNameservers(ListNameserversParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_update_nameservers",
		"Update nameservers for a DNS zone",
		UpdateNameserversParams.shape,
		async (params) => handleUpdateNameservers(UpdateNameserversParams.parse(params)),
	);

	// --- SSL Certificates ---

	server.tool(
		"scaleway_dns_get_ssl_certificate",
		"Get the SSL certificate for a DNS zone",
		GetSslCertificateParams.shape,
		async (params) => handleGetSslCertificate(GetSslCertificateParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_create_ssl_certificate",
		"Create an SSL certificate for a DNS zone",
		CreateSslCertificateParams.shape,
		async (params) => handleCreateSslCertificate(CreateSslCertificateParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_delete_ssl_certificate",
		"Delete the SSL certificate for a DNS zone",
		DeleteSslCertificateParams.shape,
		async (params) => handleDeleteSslCertificate(DeleteSslCertificateParams.parse(params)),
	);

	// --- TSIG Keys ---

	server.tool(
		"scaleway_dns_get_tsig_key",
		"Get the TSIG key for a DNS zone",
		GetTsigKeyParams.shape,
		async (params) => handleGetTsigKey(GetTsigKeyParams.parse(params)),
	);

	server.tool(
		"scaleway_dns_delete_tsig_key",
		"Delete the TSIG key for a DNS zone",
		DeleteTsigKeyParams.shape,
		async (params) => handleDeleteTsigKey(DeleteTsigKeyParams.parse(params)),
	);
}
