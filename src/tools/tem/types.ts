import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Domain schemas ---

export const DkimConfig = z.object({
	public_key: z.string(),
	selector: z.string(),
});
export type DkimConfig = z.infer<typeof DkimConfig>;

export const SpfConfig = z.object({
	is_valid: z.boolean(),
});
export type SpfConfig = z.infer<typeof SpfConfig>;

export const DomainStatistics = z.object({
	total_count: z.number(),
	sent_count: z.number(),
	failed_count: z.number(),
	canceled_count: z.number(),
});
export type DomainStatistics = z.infer<typeof DomainStatistics>;

export const DomainStatus = z.enum([
	"unknown",
	"checked",
	"unchecked",
	"invalid",
	"locked",
	"revoked",
	"pending",
]);
export type DomainStatus = z.infer<typeof DomainStatus>;

export const Domain = z.object({
	id: z.string(),
	name: z.string(),
	region: z.string(),
	project_id: z.string(),
	status: DomainStatus,
	created_at: z.string().nullable().optional(),
	next_check_at: z.string().nullable().optional(),
	last_valid_at: z.string().nullable().optional(),
	dkim_config: DkimConfig.nullable().optional(),
	spf_config: SpfConfig.nullable().optional(),
	statistics: DomainStatistics.nullable().optional(),
	revoked_at: z.string().nullable().optional(),
	last_error: z.string().nullable().optional(),
	autoconfig: z.boolean().optional(),
});
export type Domain = z.infer<typeof Domain>;

export const ListDomainsParams = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	project_id: z.string().optional().describe("Filter by project ID"),
	status: DomainStatus.optional().describe("Filter by domain status"),
	name: z.string().optional().describe("Filter by domain name"),
	organization_id: z.string().optional().describe("Filter by organization ID"),
});
export type ListDomainsParams = z.infer<typeof ListDomainsParams>;

export const GetDomainParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	domain_id: z.string().describe("Domain ID"),
});
export type GetDomainParams = z.infer<typeof GetDomainParams>;

export const CreateDomainParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	project_id: z.string().describe("Project ID"),
	domain_name: z.string().describe("Domain name to register for TEM"),
	accept_tos: z.boolean().describe("Accept Scaleway TEM terms of service"),
	autoconfig: z.boolean().optional().describe("Enable DNS autoconfig"),
});
export type CreateDomainParams = z.infer<typeof CreateDomainParams>;

export const RevokeDomainParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	domain_id: z.string().describe("Domain ID to revoke"),
});
export type RevokeDomainParams = z.infer<typeof RevokeDomainParams>;

export const CheckDomainParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	domain_id: z.string().describe("Domain ID to check"),
});
export type CheckDomainParams = z.infer<typeof CheckDomainParams>;

export const GetDomainLastStatusParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	domain_id: z.string().describe("Domain ID"),
});
export type GetDomainLastStatusParams = z.infer<typeof GetDomainLastStatusParams>;

export const DomainLastStatus = z.object({
	domain_id: z.string(),
	spf_record: z.object({ status: z.string(), value: z.string().optional() }).optional(),
	dkim_record: z.object({ status: z.string(), value: z.string().optional() }).optional(),
	dmarc_record: z.object({ status: z.string(), value: z.string().optional() }).optional(),
});
export type DomainLastStatus = z.infer<typeof DomainLastStatus>;

// --- Email schemas ---

export const EmailStatus = z.enum(["unknown", "new", "sending", "sent", "failed", "canceled"]);
export type EmailStatus = z.infer<typeof EmailStatus>;

export const Email = z.object({
	id: z.string(),
	message_id: z.string().optional(),
	project_id: z.string(),
	status: EmailStatus,
	created_at: z.string().nullable().optional(),
	updated_at: z.string().nullable().optional(),
	mail_from: z.string(),
	rcpt_to: z.string().nullable().optional(),
	subject: z.string().nullable().optional(),
	try_count: z.number().optional(),
	last_tries: z
		.array(
			z.object({
				rank: z.number(),
				tried_at: z.string().nullable().optional(),
				code: z.number(),
				message: z.string(),
			}),
		)
		.optional(),
});
export type Email = z.infer<typeof Email>;

export const ListEmailsParams = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	project_id: z.string().optional().describe("Filter by project ID"),
	domain_id: z.string().optional().describe("Filter by domain ID"),
	status: EmailStatus.optional().describe("Filter by email status"),
	mail_from: z.string().optional().describe("Filter by sender"),
	mail_to: z.string().optional().describe("Filter by recipient"),
	subject: z.string().optional().describe("Filter by subject (contains)"),
	search: z.string().optional().describe("Search term"),
	message_id: z.string().optional().describe("Filter by message ID"),
	since: z.string().optional().describe("Filter emails created after this date (RFC 3339)"),
	until: z.string().optional().describe("Filter emails created before this date (RFC 3339)"),
});
export type ListEmailsParams = z.infer<typeof ListEmailsParams>;

export const GetEmailParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	email_id: z.string().describe("Email ID"),
});
export type GetEmailParams = z.infer<typeof GetEmailParams>;

export const CreateEmailParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	from: z
		.object({
			email: z.string().describe("Sender email address"),
			name: z.string().optional().describe("Sender display name"),
		})
		.describe("Sender information"),
	to: z
		.array(
			z.object({
				email: z.string().describe("Recipient email address"),
				name: z.string().optional().describe("Recipient display name"),
			}),
		)
		.min(1)
		.describe("Recipient list"),
	subject: z.string().describe("Email subject"),
	text: z.string().optional().describe("Plain text body"),
	html: z.string().optional().describe("HTML body"),
	project_id: z.string().describe("Project ID"),
	attachments: z
		.array(
			z.object({
				name: z.string().describe("Attachment filename"),
				type: z.string().describe("MIME type"),
				content: z.string().describe("Base64-encoded content"),
			}),
		)
		.optional()
		.describe("Email attachments"),
});
export type CreateEmailParams = z.infer<typeof CreateEmailParams>;

export const CancelEmailParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	email_id: z.string().describe("Email ID to cancel"),
});
export type CancelEmailParams = z.infer<typeof CancelEmailParams>;

// --- Statistics schemas ---

export const GetStatisticsParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	project_id: z.string().optional().describe("Filter by project ID"),
	domain_id: z.string().optional().describe("Filter by domain ID"),
	since: z.string().optional().describe("Start date (RFC 3339)"),
	until: z.string().optional().describe("End date (RFC 3339)"),
	mail_from: z.string().optional().describe("Filter by sender"),
});
export type GetStatisticsParams = z.infer<typeof GetStatisticsParams>;

export const Statistics = z.object({
	total_count: z.number(),
	new_count: z.number(),
	sending_count: z.number(),
	sent_count: z.number(),
	failed_count: z.number(),
	canceled_count: z.number(),
});
export type Statistics = z.infer<typeof Statistics>;

// --- Webhook schemas ---

export const WebhookEventType = z.enum([
	"unknown_type",
	"email_queued",
	"email_dropped",
	"email_deferred",
	"email_delivered",
	"email_spam",
	"email_mailbox_not_found",
]);
export type WebhookEventType = z.infer<typeof WebhookEventType>;

export const Webhook = z.object({
	id: z.string(),
	domain_id: z.string(),
	name: z.string(),
	event_types: z.array(WebhookEventType),
	sns_arn: z.string(),
	created_at: z.string().nullable().optional(),
	updated_at: z.string().nullable().optional(),
});
export type Webhook = z.infer<typeof Webhook>;

export const ListWebhooksParams = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	domain_id: z.string().describe("Domain ID"),
	organization_id: z.string().optional().describe("Filter by organization ID"),
});
export type ListWebhooksParams = z.infer<typeof ListWebhooksParams>;

export const CreateWebhookParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	domain_id: z.string().describe("Domain ID"),
	name: z.string().describe("Webhook name"),
	event_types: z.array(WebhookEventType).min(1).describe("Event types to subscribe to"),
	sns_arn: z.string().describe("SNS ARN endpoint"),
});
export type CreateWebhookParams = z.infer<typeof CreateWebhookParams>;

export const UpdateWebhookParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	webhook_id: z.string().describe("Webhook ID"),
	name: z.string().optional().describe("New webhook name"),
	event_types: z.array(WebhookEventType).optional().describe("New event types"),
	sns_arn: z.string().optional().describe("New SNS ARN"),
});
export type UpdateWebhookParams = z.infer<typeof UpdateWebhookParams>;

export const DeleteWebhookParams = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g., fr-par)"),
	webhook_id: z.string().describe("Webhook ID to delete"),
});
export type DeleteWebhookParams = z.infer<typeof DeleteWebhookParams>;
