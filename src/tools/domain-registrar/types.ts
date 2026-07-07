import { z } from "zod";

// ── Enums ──────────────────────────────────────────────────────────────────

export const AutoRenewStatus = z.enum(["enabled", "disabled", "not_supported"]);
export type AutoRenewStatus = z.infer<typeof AutoRenewStatus>;

export const DnssecStatus = z.enum(["enabled", "disabled"]);
export type DnssecStatus = z.infer<typeof DnssecStatus>;

export const RegistrarLockStatus = z.enum(["locked", "unlocked"]);
export type RegistrarLockStatus = z.infer<typeof RegistrarLockStatus>;

export const DomainStatus = z.enum([
	"active",
	"expired",
	"pending_transfer",
	"pending_registration",
	"redemption",
	"deleting",
]);
export type DomainStatus = z.infer<typeof DomainStatus>;

export const TransferStatus = z.enum([
	"pending",
	"waiting_transfer",
	"processing",
	"done",
	"failed",
]);
export type TransferStatus = z.infer<typeof TransferStatus>;

// ── Domain Entity ──────────────────────────────────────────────────────────

export const Domain = z.object({
	domain: z.string().describe("Fully qualified domain name"),
	registrar: z.string().describe("Registrar managing the domain"),
	status: DomainStatus.describe("Current domain status"),
	auto_renew_status: AutoRenewStatus.describe("Auto-renewal status"),
	dnssec_status: DnssecStatus.describe("DNSSEC configuration status"),
	epp_code: z.string().optional().describe("EPP authorization code for transfer"),
	expired_at: z.string().optional().describe("Expiration date (ISO 8601)"),
	updated_at: z.string().describe("Last update date (ISO 8601)"),
	registrar_lock_status: RegistrarLockStatus.describe("Registrar lock status"),
	organization_id: z.string().describe("Organization ID"),
	project_id: z.string().describe("Project ID"),
});
export type Domain = z.infer<typeof Domain>;

// ── Contact Entity ─────────────────────────────────────────────────────────

export const Contact = z.object({
	id: z.string().describe("Contact unique identifier"),
	firstname: z.string().describe("First name"),
	lastname: z.string().describe("Last name"),
	email: z.string().email().describe("Email address"),
	phone_number: z.string().describe("Phone number"),
	company_name: z.string().optional().describe("Company name"),
	address_line_1: z.string().describe("Address line 1"),
	city: z.string().describe("City"),
	zip: z.string().describe("ZIP/postal code"),
	country: z.string().describe("Country code (ISO 3166-1 alpha-2)"),
	state: z.string().optional().describe("State or province"),
});
export type Contact = z.infer<typeof Contact>;

// ── TLD Entity ─────────────────────────────────────────────────────────────

export const TldOffer = z.object({
	action: z.string().describe("Action (create, renew, transfer, redemption...)"),
	operation_path: z.string().describe("Path to the pricing operation"),
	price: z
		.object({
			currency_code: z.string().optional(),
			units: z.number().optional(),
			nanos: z.number().optional(),
		})
		.describe("Price of the offer"),
});
export type TldOffer = z.infer<typeof TldOffer>;

export const Tld = z.object({
	name: z.string().describe("TLD name (e.g., com, fr, io)"),
	dnssec_support: z.boolean().describe("Whether DNSSEC is supported"),
	duration_in_years_min: z.number().describe("Minimum registration duration in years"),
	duration_in_years_max: z.number().describe("Maximum registration duration in years"),
	idn_support: z.boolean().describe("Whether IDN (internationalized domain names) is supported"),
	offers: z.record(TldOffer).describe("Available offers for this TLD, keyed by action"),
	specifications: z.record(z.string()).describe("TLD-specific specifications"),
});
export type Tld = z.infer<typeof Tld>;

// ── Domain Availability Entity ─────────────────────────────────────────────

export const AvailableDomain = z.object({
	domain: z.string().describe("Fully qualified domain name"),
	available: z.boolean().describe("Whether the domain is available"),
	tld: Tld.optional().describe("TLD details for the domain"),
});
export type AvailableDomain = z.infer<typeof AvailableDomain>;

export const SearchAvailableDomainsResponse = z.object({
	available_domains: z.array(AvailableDomain).describe("Array of searched domains"),
	exact_match_domain: AvailableDomain.optional().describe("Exact match, if requested and found"),
});
export type SearchAvailableDomainsResponse = z.infer<typeof SearchAvailableDomainsResponse>;

// ── Order Response Entity (buy / renew / transfer) ─────────────────────────

export const OrderResponse = z.object({
	domains: z.array(z.string()).describe("Domains affected by the order"),
	organization_id: z.string().describe("Organization ID"),
	project_id: z.string().describe("Project ID"),
	task_id: z.string().describe("ID of the created task"),
	created_at: z.string().nullable().optional().describe("Order creation date (ISO 8601)"),
});
export type OrderResponse = z.infer<typeof OrderResponse>;

// ── Tool Input Schemas ─────────────────────────────────────────────────────

export const ListDomainsInput = z.object({
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	project_id: z.string().optional().describe("Filter by project ID"),
	organization_id: z.string().optional().describe("Filter by organization ID"),
	order_by: z
		.enum(["domain_asc", "domain_desc", "expired_at_asc", "expired_at_desc"])
		.optional()
		.describe("Sort order"),
});
export type ListDomainsInput = z.infer<typeof ListDomainsInput>;

export const GetDomainInput = z.object({
	domain: z.string().min(1).describe("Fully qualified domain name"),
});
export type GetDomainInput = z.infer<typeof GetDomainInput>;

export const RegisterDomainInput = z.object({
	domain: z.string().min(1).describe("Domain name to register"),
	duration_in_years: z
		.number()
		.int()
		.min(1)
		.max(10)
		.optional()
		.default(1)
		.describe("Registration duration in years"),
	project_id: z.string().describe("Project ID"),
	owner_contact_id: z.string().describe("Owner contact ID"),
	admin_contact_id: z.string().optional().describe("Admin contact ID (defaults to owner)"),
	tech_contact_id: z.string().optional().describe("Technical contact ID (defaults to owner)"),
});
export type RegisterDomainInput = z.infer<typeof RegisterDomainInput>;

export const RenewDomainInput = z.object({
	domain: z.string().min(1).describe("Domain name to renew"),
	duration_in_years: z
		.number()
		.int()
		.min(1)
		.max(10)
		.optional()
		.default(1)
		.describe("Renewal duration in years"),
});
export type RenewDomainInput = z.infer<typeof RenewDomainInput>;

export const TransferDomainInput = z.object({
	domain: z.string().min(1).describe("Domain name to transfer"),
	auth_code: z.string().min(1).describe("Authorization/EPP code from current registrar"),
	project_id: z.string().describe("Project ID"),
	owner_contact_id: z.string().describe("Owner contact ID"),
});
export type TransferDomainInput = z.infer<typeof TransferDomainInput>;

export const UpdateDomainInput = z.object({
	domain: z.string().min(1).describe("Domain name to update"),
	owner_contact_id: z.string().optional().describe("New owner contact ID"),
	admin_contact_id: z.string().optional().describe("New admin contact ID"),
	tech_contact_id: z.string().optional().describe("New technical contact ID"),
});
export type UpdateDomainInput = z.infer<typeof UpdateDomainInput>;

export const EnableAutoRenewInput = z.object({
	domain: z.string().min(1).describe("Domain name to enable auto-renew for"),
});
export type EnableAutoRenewInput = z.infer<typeof EnableAutoRenewInput>;

export const DisableAutoRenewInput = z.object({
	domain: z.string().min(1).describe("Domain name to disable auto-renew for"),
});
export type DisableAutoRenewInput = z.infer<typeof DisableAutoRenewInput>;

export const CheckDomainAvailabilityInput = z.object({
	domain: z.string().min(1).describe("Domain name to check availability for"),
});
export type CheckDomainAvailabilityInput = z.infer<typeof CheckDomainAvailabilityInput>;

export const ListContactsInput = z.object({
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	domain: z.string().optional().describe("Filter contacts by domain"),
	project_id: z.string().optional().describe("Filter by project ID"),
	organization_id: z.string().optional().describe("Filter by organization ID"),
});
export type ListContactsInput = z.infer<typeof ListContactsInput>;

export const GetContactInput = z.object({
	contact_id: z.string().min(1).describe("Contact unique identifier"),
});
export type GetContactInput = z.infer<typeof GetContactInput>;

export const UpdateContactInput = z.object({
	contact_id: z.string().min(1).describe("Contact unique identifier"),
	email: z.string().email().optional().describe("Email address"),
	phone_number: z.string().min(1).optional().describe("Phone number"),
	address_line_1: z.string().min(1).optional().describe("Address line 1"),
	city: z.string().min(1).optional().describe("City"),
	zip: z.string().min(1).optional().describe("ZIP/postal code"),
	country: z.string().length(2).optional().describe("Country code (ISO 3166-1 alpha-2)"),
	state: z.string().optional().describe("State or province"),
});
export type UpdateContactInput = z.infer<typeof UpdateContactInput>;

export const ListTldsInput = z.object({
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
});
export type ListTldsInput = z.infer<typeof ListTldsInput>;

export const GetTldInput = z.object({
	tld_name: z.string().min(1).describe("TLD name (e.g., com, fr, io)"),
});
export type GetTldInput = z.infer<typeof GetTldInput>;
