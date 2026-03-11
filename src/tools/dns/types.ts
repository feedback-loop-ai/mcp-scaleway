import { z } from "zod";
import { PaginationParams } from "../../shared/types.js";

// --- Enums ---

export const DnsZoneStatus = z.enum(["unknown", "active", "pending", "error", "locked"]);
export type DnsZoneStatus = z.infer<typeof DnsZoneStatus>;

export const RecordType = z.enum([
	"A",
	"AAAA",
	"CNAME",
	"TXT",
	"SRV",
	"TLSA",
	"MX",
	"NS",
	"PTR",
	"CAA",
	"ALIAS",
	"LOC",
	"SSHFP",
	"HINFO",
	"RP",
	"URI",
	"DS",
	"NAPTR",
	"DNAME",
	"HTTPS",
	"SVCB",
]);
export type RecordType = z.infer<typeof RecordType>;

// --- DNS Zone Schemas ---

export const ListDnsZonesParams = PaginationParams.extend({
	domain: z.string().optional().describe("Filter by domain name"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	order_by: z
		.enum([
			"domain_asc",
			"domain_desc",
			"subdomain_asc",
			"subdomain_desc",
			"created_at_asc",
			"created_at_desc",
			"updated_at_asc",
			"updated_at_desc",
		])
		.optional()
		.describe("Sort order"),
	dns_zones: z.string().optional().describe("Comma-separated list of DNS zone names to filter"),
});
export type ListDnsZonesParams = z.infer<typeof ListDnsZonesParams>;

export const CreateDnsZoneParams = z.object({
	domain: z.string().min(1).describe("Domain name for the DNS zone"),
	subdomain: z.string().optional().default("").describe("Subdomain (empty for root zone)"),
	project_id: z.string().uuid().describe("Project ID to own the DNS zone"),
});
export type CreateDnsZoneParams = z.infer<typeof CreateDnsZoneParams>;

export const UpdateDnsZoneParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name to update (e.g. example.com)"),
	new_dns_zone: z.string().optional().describe("New DNS zone name (for renaming the subdomain)"),
	project_id: z.string().uuid().optional().describe("New project ID"),
});
export type UpdateDnsZoneParams = z.infer<typeof UpdateDnsZoneParams>;

export const DeleteDnsZoneParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name to delete"),
	project_id: z.string().uuid().describe("Project ID that owns the DNS zone"),
});
export type DeleteDnsZoneParams = z.infer<typeof DeleteDnsZoneParams>;

export const CloneDnsZoneParams = z.object({
	dns_zone: z.string().min(1).describe("Source DNS zone name to clone"),
	dest_dns_zone: z.string().min(1).describe("Destination DNS zone name"),
	overwrite: z.boolean().optional().default(false).describe("Overwrite destination if it exists"),
	project_id: z.string().uuid().optional().describe("Project ID for the destination zone"),
});
export type CloneDnsZoneParams = z.infer<typeof CloneDnsZoneParams>;

export const RefreshDnsZoneParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name to refresh"),
	recreate_dns_zone: z
		.boolean()
		.optional()
		.default(false)
		.describe("Recreate the DNS zone if needed"),
	recreate_sub_dns_zone: z.boolean().optional().default(false).describe("Recreate sub DNS zones"),
});
export type RefreshDnsZoneParams = z.infer<typeof RefreshDnsZoneParams>;

// --- DNS Record Schemas ---

export const ListDnsRecordsParams = PaginationParams.extend({
	dns_zone: z.string().min(1).describe("DNS zone name"),
	name: z.string().optional().describe("Filter by record name"),
	type: RecordType.optional().describe("Filter by record type"),
	id: z.string().optional().describe("Filter by record ID"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	order_by: z
		.enum(["name_asc", "name_desc", "type_asc", "type_desc"])
		.optional()
		.describe("Sort order"),
});
export type ListDnsRecordsParams = z.infer<typeof ListDnsRecordsParams>;

export const RecordInput = z.object({
	name: z.string().describe("Record name (e.g. www, @, sub.domain)"),
	type: RecordType.describe("DNS record type"),
	data: z.string().describe("Record data (e.g. IP address, CNAME target)"),
	ttl: z.number().int().min(60).describe("Time to live in seconds"),
	priority: z.number().int().optional().describe("Priority (for MX, SRV records)"),
	comment: z.string().optional().describe("Optional comment"),
});
export type RecordInput = z.infer<typeof RecordInput>;

export const RecordChangeAdd = z.object({
	add: z.object({
		records: z.array(RecordInput).min(1).describe("Records to add"),
	}),
});

export const RecordChangeSet = z.object({
	set: z.object({
		id_fields: z.object({
			name: z.string().describe("Record name to match"),
			type: RecordType.describe("Record type to match"),
		}),
		records: z.array(RecordInput).min(1).describe("Records to set"),
	}),
});

export const RecordChangeDelete = z.object({
	delete: z.object({
		id: z.string().optional().describe("Record ID to delete"),
		id_fields: z
			.object({
				name: z.string().describe("Record name to match"),
				type: RecordType.describe("Record type to match"),
			})
			.optional()
			.describe("Alternative: match by name and type"),
	}),
});

export const RecordChangeClear = z.object({
	clear: z.object({}),
});

export const RecordChange = z.union([
	RecordChangeAdd,
	RecordChangeSet,
	RecordChangeDelete,
	RecordChangeClear,
]);
export type RecordChange = z.infer<typeof RecordChange>;

export const UpdateDnsRecordsParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name"),
	changes: z.array(RecordChange).min(1).describe("List of record changes (add/set/delete/clear)"),
	disallow_new_zone_creation: z
		.boolean()
		.optional()
		.default(false)
		.describe("Prevent creating new zones during update"),
	return_all_records: z
		.boolean()
		.optional()
		.default(false)
		.describe("Return all records after update"),
	serial: z.number().int().optional().describe("Zone serial for conflict detection"),
});
export type UpdateDnsRecordsParams = z.infer<typeof UpdateDnsRecordsParams>;

export const ClearDnsRecordsParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name to clear all records from"),
});
export type ClearDnsRecordsParams = z.infer<typeof ClearDnsRecordsParams>;

// --- Raw Zone ---

export const ExportRawDnsZoneParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name to export"),
	format: z.enum(["bind"]).optional().default("bind").describe("Export format"),
});
export type ExportRawDnsZoneParams = z.infer<typeof ExportRawDnsZoneParams>;

export const ImportRawDnsZoneParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name to import into"),
	content: z.string().min(1).describe("Raw zone file content (BIND format)"),
	project_id: z.string().uuid().optional().describe("Project ID"),
});
export type ImportRawDnsZoneParams = z.infer<typeof ImportRawDnsZoneParams>;

// --- Nameservers ---

export const ListNameserversParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
});
export type ListNameserversParams = z.infer<typeof ListNameserversParams>;

export const UpdateNameserversParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name"),
	ns: z
		.array(
			z.object({
				name: z.string().min(1).describe("Nameserver hostname"),
				ip: z.array(z.string()).optional().describe("Nameserver IP addresses"),
			}),
		)
		.min(1)
		.describe("New nameservers"),
});
export type UpdateNameserversParams = z.infer<typeof UpdateNameserversParams>;

// --- SSL Certificates ---

export const GetSslCertificateParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name"),
});
export type GetSslCertificateParams = z.infer<typeof GetSslCertificateParams>;

export const CreateSslCertificateParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name"),
	alternative_dns_zones: z
		.array(z.string())
		.optional()
		.default([])
		.describe("Alternative DNS zones for the certificate"),
});
export type CreateSslCertificateParams = z.infer<typeof CreateSslCertificateParams>;

export const DeleteSslCertificateParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name"),
});
export type DeleteSslCertificateParams = z.infer<typeof DeleteSslCertificateParams>;

// --- TSIG Keys ---

export const GetTsigKeyParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name"),
});
export type GetTsigKeyParams = z.infer<typeof GetTsigKeyParams>;

export const DeleteTsigKeyParams = z.object({
	dns_zone: z.string().min(1).describe("DNS zone name"),
});
export type DeleteTsigKeyParams = z.infer<typeof DeleteTsigKeyParams>;
