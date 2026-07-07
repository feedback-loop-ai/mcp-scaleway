import { z } from "zod";
import { PaginationParams } from "../../shared/types.js";

// ---------------------------------------------------------------------------
// Scaleway Mailbox API (v1alpha1, global scope) — request & response schemas.
// Reference: specs/scaleway-api/mailbox/api-reference.md
// ---------------------------------------------------------------------------

// --- Enums ---

export const DomainStatus = z.enum([
	"unknown_status",
	"creating",
	"waiting_validation",
	"validating",
	"validation_failed",
	"provisioning",
	"ready",
	"deleting",
]);
export type DomainStatus = z.infer<typeof DomainStatus>;

export const MailboxStatus = z.enum([
	"unknown_status",
	"creating",
	"waiting_payment",
	"waiting_domain",
	"ready",
	"deletion_scheduled",
	"locked",
	"renewing",
	"deleting",
	"restoring",
	"payment_failed",
]);
export type MailboxStatus = z.infer<typeof MailboxStatus>;

export const AliasStatus = z.enum(["unknown_status", "provisioning", "deleting", "ready"]);
export type AliasStatus = z.infer<typeof AliasStatus>;

export const MailboxSubscriptionPeriod = z.enum([
	"unknown_subscription_period",
	"canceled",
	"monthly",
	"yearly",
]);
export type MailboxSubscriptionPeriod = z.infer<typeof MailboxSubscriptionPeriod>;

export const DomainRecordStatus = z.enum([
	"unknown_status",
	"validating",
	"valid",
	"invalid",
	"not_found",
]);
export type DomainRecordStatus = z.infer<typeof DomainRecordStatus>;

export const DomainRecordLevel = z.enum(["unknown_level", "required", "recommended", "optional"]);
export type DomainRecordLevel = z.infer<typeof DomainRecordLevel>;

export const DomainRecordDNSType = z.enum([
	"unknown_dns_type",
	"cname_dns_type",
	"mx_dns_type",
	"srv_dns_type",
	"txt_dns_type",
]);
export type DomainRecordDNSType = z.infer<typeof DomainRecordDNSType>;

export const ListDomainsOrderBy = z.enum([
	"created_at_desc",
	"created_at_asc",
	"updated_at_desc",
	"updated_at_asc",
	"name_desc",
	"name_asc",
	"mailbox_total_count_desc",
	"mailbox_total_count_asc",
]);
export type ListDomainsOrderBy = z.infer<typeof ListDomainsOrderBy>;

export const ListMailboxesOrderBy = z.enum([
	"created_at_desc",
	"created_at_asc",
	"updated_at_desc",
	"updated_at_asc",
	"email_desc",
	"email_asc",
]);
export type ListMailboxesOrderBy = z.infer<typeof ListMailboxesOrderBy>;

export const ListAliasesOrderBy = z.enum([
	"created_at_desc",
	"created_at_asc",
	"updated_at_desc",
	"updated_at_asc",
	"name_desc",
	"name_asc",
]);
export type ListAliasesOrderBy = z.infer<typeof ListAliasesOrderBy>;

// --- Response entities ---

export const Domain = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	name: z.string(),
	status: DomainStatus,
	mailbox_total_count: z.number().int().nonnegative(),
	created_at: z.string().datetime({ offset: true }).nullable(),
	updated_at: z.string().datetime({ offset: true }).nullable(),
	webmail_url: z.string(),
	imap_url: z.string(),
	pop3_url: z.string(),
	smtp_url: z.string(),
});
export type Domain = z.infer<typeof Domain>;

export const Mailbox = z.object({
	id: z.string().uuid(),
	domain_id: z.string().uuid(),
	email: z.string(),
	status: MailboxStatus,
	subscription_period: MailboxSubscriptionPeriod,
	subscription_period_started_at: z.string().datetime({ offset: true }).nullable(),
	next_subscription_period: MailboxSubscriptionPeriod,
	next_subscription_period_starts_at: z.string().datetime({ offset: true }).nullable(),
	created_at: z.string().datetime({ offset: true }).nullable(),
	updated_at: z.string().datetime({ offset: true }).nullable(),
	deletion_scheduled_at: z.string().datetime({ offset: true }).nullable(),
});
export type Mailbox = z.infer<typeof Mailbox>;

export const Alias = z.object({
	id: z.string().uuid(),
	email: z.string(),
	mailbox_id: z.string().uuid(),
	description: z.string(),
	status: AliasStatus,
	created_at: z.string().datetime({ offset: true }).nullable(),
	updated_at: z.string().datetime({ offset: true }).nullable(),
});
export type Alias = z.infer<typeof Alias>;

export const DomainRecord = z.object({
	id: z.string().uuid(),
	domain_id: z.string().uuid(),
	status: DomainRecordStatus,
	level: DomainRecordLevel,
	dns_type: DomainRecordDNSType,
	dns_name: z.string(),
	dns_value: z.string(),
	error: z.string().nullable(),
	created_at: z.string().datetime({ offset: true }).nullable(),
	updated_at: z.string().datetime({ offset: true }).nullable(),
});
export type DomainRecord = z.infer<typeof DomainRecord>;

export const GetDomainRecordsResponse = z.object({
	autoconfig: DomainRecord.nullable(),
	autodiscover: DomainRecord.nullable(),
	caldav: DomainRecord.nullable(),
	carddav: DomainRecord.nullable(),
	dkim: DomainRecord.nullable(),
	dmarc: DomainRecord.nullable(),
	domain_validation: DomainRecord.nullable(),
	imap: DomainRecord.nullable(),
	mx: DomainRecord.nullable(),
	pop3: DomainRecord.nullable(),
	spf: DomainRecord.nullable(),
	submission: DomainRecord.nullable(),
});
export type GetDomainRecordsResponse = z.infer<typeof GetDomainRecordsResponse>;

export const ListDomainsResponse = z.object({
	domains: z.array(Domain),
	total_count: z.number().int().nonnegative(),
});
export type ListDomainsResponse = z.infer<typeof ListDomainsResponse>;

export const ListMailboxesResponse = z.object({
	mailboxes: z.array(Mailbox),
	total_count: z.number().int().nonnegative(),
});
export type ListMailboxesResponse = z.infer<typeof ListMailboxesResponse>;

export const ListAliasesResponse = z.object({
	aliases: z.array(Alias),
	total_count: z.number().int().nonnegative(),
});
export type ListAliasesResponse = z.infer<typeof ListAliasesResponse>;

export const BatchCreateMailboxesResponse = z.object({
	mailboxes: z.array(Mailbox),
});
export type BatchCreateMailboxesResponse = z.infer<typeof BatchCreateMailboxesResponse>;

// --- Domain request params ---

export const ListDomainsParams = PaginationParams.extend({
	projectId: z.string().uuid().optional().describe("Filter domains by project ID"),
	statuses: z.array(DomainStatus).optional().describe("Filter domains by one or more statuses"),
	search: z.string().optional().describe("Search term to filter domains by name"),
	orderBy: ListDomainsOrderBy.optional().describe("Order results by field"),
});
export type ListDomainsParams = z.infer<typeof ListDomainsParams>;

export const GetDomainParams = z.object({
	domainId: z.string().uuid().describe("ID of the domain to retrieve"),
});
export type GetDomainParams = z.infer<typeof GetDomainParams>;

export const CreateDomainParams = z.object({
	name: z.string().min(1).describe("Fully qualified domain name to register"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default project if omitted)"),
});
export type CreateDomainParams = z.infer<typeof CreateDomainParams>;

export const DeleteDomainParams = z.object({
	domainId: z.string().uuid().describe("ID of the domain to delete"),
});
export type DeleteDomainParams = z.infer<typeof DeleteDomainParams>;

export const GetDomainRecordsParams = z.object({
	domainId: z.string().uuid().describe("ID of the domain whose DNS records to retrieve"),
});
export type GetDomainRecordsParams = z.infer<typeof GetDomainRecordsParams>;

export const ValidateDomainRecordsParams = z.object({
	domainId: z.string().uuid().describe("ID of the domain whose DNS records to validate"),
});
export type ValidateDomainRecordsParams = z.infer<typeof ValidateDomainRecordsParams>;

// --- Mailbox request params ---

export const MailboxParameters = z.object({
	localPart: z.string().min(1).describe("Local part of the email address (before the @)"),
	password: z.string().min(1).describe("Password for the mailbox"),
});
export type MailboxParameters = z.infer<typeof MailboxParameters>;

export const CreateMailboxesParams = z.object({
	domainId: z.string().uuid().describe("ID of the domain in which to create the mailboxes"),
	subscriptionPeriod: z
		.enum(["monthly", "yearly"])
		.describe("Subscription renewal period (monthly or yearly)"),
	mailboxes: z
		.array(MailboxParameters)
		.min(1)
		.describe("One or more mailboxes to create in the domain"),
});
export type CreateMailboxesParams = z.infer<typeof CreateMailboxesParams>;

export const ListMailboxesParams = PaginationParams.extend({
	domainId: z.string().uuid().optional().describe("Filter mailboxes by domain ID"),
	projectId: z.string().uuid().optional().describe("Filter mailboxes by project ID"),
	statuses: z.array(MailboxStatus).optional().describe("Filter mailboxes by one or more statuses"),
	search: z.string().optional().describe("Search term to filter mailboxes by name or local part"),
	orderBy: ListMailboxesOrderBy.optional().describe("Order results by field"),
});
export type ListMailboxesParams = z.infer<typeof ListMailboxesParams>;

export const GetMailboxParams = z.object({
	mailboxId: z.string().uuid().describe("ID of the mailbox to retrieve"),
});
export type GetMailboxParams = z.infer<typeof GetMailboxParams>;

export const UpdateMailboxParams = z.object({
	mailboxId: z.string().uuid().describe("ID of the mailbox to update"),
	subscriptionPeriod: z
		.enum(["monthly", "yearly", "canceled"])
		.optional()
		.describe("New subscription period for the mailbox"),
	newPassword: z.string().min(1).optional().describe("New password for the mailbox"),
});
export type UpdateMailboxParams = z.infer<typeof UpdateMailboxParams>;

export const DeleteMailboxParams = z.object({
	mailboxId: z.string().uuid().describe("ID of the mailbox to delete"),
});
export type DeleteMailboxParams = z.infer<typeof DeleteMailboxParams>;

export const RestoreMailboxParams = z.object({
	mailboxId: z
		.string()
		.uuid()
		.describe("ID of the mailbox (in deletion_scheduled status) to restore"),
});
export type RestoreMailboxParams = z.infer<typeof RestoreMailboxParams>;

// --- Alias request params ---

export const CreateAliasParams = z.object({
	mailboxId: z.string().uuid().describe("ID of the mailbox to associate with the alias"),
	localPart: z.string().min(1).describe("Local part of the alias email address (before the @)"),
	description: z.string().optional().describe("Optional description of the alias"),
});
export type CreateAliasParams = z.infer<typeof CreateAliasParams>;

export const ListAliasesParams = PaginationParams.extend({
	mailboxId: z.string().uuid().optional().describe("Filter aliases by mailbox ID"),
	projectId: z.string().uuid().optional().describe("Filter aliases by project ID"),
	status: AliasStatus.optional().describe("Filter aliases by status"),
	orderBy: ListAliasesOrderBy.optional().describe("Order results by field"),
});
export type ListAliasesParams = z.infer<typeof ListAliasesParams>;

export const GetAliasParams = z.object({
	aliasId: z.string().uuid().describe("ID of the alias to retrieve"),
});
export type GetAliasParams = z.infer<typeof GetAliasParams>;

export const DeleteAliasParams = z.object({
	aliasId: z.string().uuid().describe("ID of the alias to delete"),
});
export type DeleteAliasParams = z.infer<typeof DeleteAliasParams>;
