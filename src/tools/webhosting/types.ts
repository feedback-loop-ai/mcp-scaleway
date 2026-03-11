import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// ── Enums ──────────────────────────────────────────────────────────────

export const HostingStatus = z.enum([
	"unknown_status",
	"delivering",
	"ready",
	"deleting",
	"error",
	"locked",
	"migrating",
]);
export type HostingStatus = z.infer<typeof HostingStatus>;

export const HostingDnsStatus = z.enum(["unknown_dns_status", "valid", "invalid", "pending"]);
export type HostingDnsStatus = z.infer<typeof HostingDnsStatus>;

export const ListHostingsOrderBy = z.enum(["created_at_asc", "created_at_desc"]);
export type ListHostingsOrderBy = z.infer<typeof ListHostingsOrderBy>;

export const OfferQuotaWarning = z.enum([
	"unknown_quota_warning",
	"email_count_exceeded",
	"database_count_exceeded",
	"disk_usage_exceeded",
]);
export type OfferQuotaWarning = z.infer<typeof OfferQuotaWarning>;

// ── Nested schemas ─────────────────────────────────────────────────────

export const CpanelUrls = z.object({
	dashboard: z.string().optional(),
	webmail: z.string().optional(),
});

export const HostingOption = z.object({
	id: z.string(),
	name: z.string(),
});

// ── Response entity schemas ────────────────────────────────────────────

export const Hosting = z.object({
	id: z.string(),
	region: z.string(),
	project_id: z.string(),
	status: HostingStatus,
	platform_hostname: z.string(),
	platform_number: z.number().optional(),
	offer_id: z.string(),
	offer_name: z.string(),
	domain: z.string(),
	tags: z.array(z.string()),
	updated_at: z.string().optional(),
	created_at: z.string().optional(),
	dns_status: HostingDnsStatus,
	cpanel_urls: CpanelUrls.optional(),
	username: z.string(),
	offer_end_date: z.string().optional(),
	contact_email: z.string(),
	platform_group: z.string(),
	ipv4: z.string().optional(),
	ipv6: z.string().optional(),
	protected: z.boolean().optional(),
	one_time_password: z.string().optional(),
});
export type Hosting = z.infer<typeof Hosting>;

export const Offer = z.object({
	id: z.string(),
	billing_operation_path: z.string(),
	product: z
		.object({
			name: z.string().optional(),
			option: z.boolean().optional(),
		})
		.optional(),
	price: z
		.object({
			currency_code: z.string().optional(),
			units: z.number().optional(),
			nanos: z.number().optional(),
		})
		.optional(),
	available: z.boolean(),
	quota_warnings: z.array(OfferQuotaWarning).optional(),
	end_of_life: z.boolean(),
	control_panel_name: z.string(),
});
export type Offer = z.infer<typeof Offer>;

export const ControlPanel = z.object({
	name: z.string(),
	available: z.boolean(),
	logo_url: z.string(),
});
export type ControlPanel = z.infer<typeof ControlPanel>;

export const DnsRecord = z.object({
	name: z.string(),
	type: z.string(),
	ttl: z.number(),
	value: z.string(),
	priority: z.number().optional(),
	status: z.string().optional(),
});
export type DnsRecord = z.infer<typeof DnsRecord>;

export const NameServer = z.object({
	hostname: z.string(),
	is_default: z.boolean().optional(),
	status: z.string().optional(),
});

// ── Input schemas (tool parameters) ────────────────────────────────────

export const ListHostingsInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region to list hostings in (e.g., fr-par)"),
	order_by: ListHostingsOrderBy.optional().describe("Sort order"),
	project_id: z.string().optional().describe("Filter by project ID"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	statuses: z.array(HostingStatus).optional().describe("Filter by statuses"),
	domain: z.string().optional().describe("Filter by domain name"),
	organization_id: z.string().optional().describe("Filter by organization ID"),
	control_panels: z.array(z.string()).optional().describe("Filter by control panel names"),
});
export type ListHostingsInput = z.infer<typeof ListHostingsInput>;

export const GetHostingInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the hosting"),
	hosting_id: z.string().describe("ID of the hosting to retrieve"),
});
export type GetHostingInput = z.infer<typeof GetHostingInput>;

export const CreateHostingInput = z.object({
	region: ScalewayRegion.optional().describe("Region for the hosting"),
	project_id: z.string().optional().describe("Project ID"),
	offer_id: z.string().describe("Offer ID to use for the hosting"),
	domain: z.string().describe("Domain name for the hosting"),
	tags: z.array(z.string()).optional().describe("Tags to associate with the hosting"),
	option_ids: z.array(z.string()).optional().describe("Option IDs to enable"),
	language: z.string().optional().describe("Language for the hosting (e.g., fr_FR)"),
	domain_configuration: z
		.object({
			update_nameservers: z.boolean().optional(),
			update_web_record: z.boolean().optional(),
			update_mail_record: z.boolean().optional(),
			update_all_records: z.boolean().optional(),
		})
		.optional()
		.describe("DNS domain configuration"),
	skip_welcome_email: z.boolean().optional().describe("Skip welcome email"),
});
export type CreateHostingInput = z.infer<typeof CreateHostingInput>;

export const UpdateHostingInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the hosting"),
	hosting_id: z.string().describe("ID of the hosting to update"),
	email: z.string().optional().describe("New contact email"),
	tags: z.array(z.string()).optional().describe("New tags"),
	option_ids: z.array(z.string()).optional().describe("New option IDs to set"),
	offer_id: z.string().optional().describe("New offer ID to switch to"),
	protected: z.boolean().optional().describe("Protection against deletion"),
});
export type UpdateHostingInput = z.infer<typeof UpdateHostingInput>;

export const DeleteHostingInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the hosting"),
	hosting_id: z.string().describe("ID of the hosting to delete"),
});
export type DeleteHostingInput = z.infer<typeof DeleteHostingInput>;

export const RestoreHostingInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the hosting"),
	hosting_id: z.string().describe("ID of the hosting to restore"),
});
export type RestoreHostingInput = z.infer<typeof RestoreHostingInput>;

export const GetDnsRecordsInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the hosting"),
	hosting_id: z.string().describe("ID of the hosting"),
});
export type GetDnsRecordsInput = z.infer<typeof GetDnsRecordsInput>;

export const ListOffersInput = z.object({
	region: ScalewayRegion.optional().describe("Region to list offers in (e.g., fr-par)"),
	order_by: z.enum(["price_asc"]).optional().describe("Sort order"),
	hosting_id: z.string().optional().describe("Filter by hosting ID"),
	control_panels: z.array(z.string()).optional().describe("Filter by control panel names"),
	without_options: z.boolean().optional().describe("Exclude option offers"),
	only_options: z.boolean().optional().describe("Only include option offers"),
});
export type ListOffersInput = z.infer<typeof ListOffersInput>;

export const ListControlPanelsInput = z.object({
	region: ScalewayRegion.optional().describe("Region to list control panels in (e.g., fr-par)"),
});
export type ListControlPanelsInput = z.infer<typeof ListControlPanelsInput>;
