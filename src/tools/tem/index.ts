import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCancelEmail,
	handleCheckDomain,
	handleCreateDomain,
	handleCreateEmail,
	handleCreateWebhook,
	handleDeleteWebhook,
	handleGetDomain,
	handleGetDomainLastStatus,
	handleGetEmail,
	handleGetStatistics,
	handleListDomains,
	handleListEmails,
	handleListWebhooks,
	handleRevokeDomain,
	handleUpdateWebhook,
} from "./handlers.js";
import {
	CancelEmailParams,
	CheckDomainParams,
	CreateDomainParams,
	CreateEmailParams,
	CreateWebhookParams,
	DeleteWebhookParams,
	GetDomainLastStatusParams,
	GetDomainParams,
	GetEmailParams,
	GetStatisticsParams,
	ListDomainsParams,
	ListEmailsParams,
	ListWebhooksParams,
	RevokeDomainParams,
	UpdateWebhookParams,
} from "./types.js";

export function registerTemTools(server: McpServer): void {
	// --- Domain tools ---
	server.tool(
		"scaleway_tem_list_domains",
		"List transactional email domains with optional filters for status, name, project, and pagination",
		ListDomainsParams.shape,
		async (params) => handleListDomains(params),
	);

	server.tool(
		"scaleway_tem_get_domain",
		"Get details of a specific transactional email domain by ID",
		GetDomainParams.shape,
		async (params) => handleGetDomain(params),
	);

	server.tool(
		"scaleway_tem_create_domain",
		"Register a new domain for transactional email sending",
		CreateDomainParams.shape,
		async (params) => handleCreateDomain(params),
	);

	server.tool(
		"scaleway_tem_revoke_domain",
		"Revoke a transactional email domain, stopping all email sending",
		RevokeDomainParams.shape,
		async (params) => handleRevokeDomain(params),
	);

	server.tool(
		"scaleway_tem_check_domain",
		"Trigger a DNS check on a transactional email domain to verify DKIM/SPF configuration",
		CheckDomainParams.shape,
		async (params) => handleCheckDomain(params),
	);

	server.tool(
		"scaleway_tem_get_domain_last_status",
		"Get the last DNS verification status for a transactional email domain",
		GetDomainLastStatusParams.shape,
		async (params) => handleGetDomainLastStatus(params),
	);

	// --- Email tools ---
	server.tool(
		"scaleway_tem_list_emails",
		"List transactional emails with filters for status, sender, recipient, domain, and date range",
		ListEmailsParams.shape,
		async (params) => handleListEmails(params),
	);

	server.tool(
		"scaleway_tem_get_email",
		"Get details of a specific transactional email by ID",
		GetEmailParams.shape,
		async (params) => handleGetEmail(params),
	);

	server.tool(
		"scaleway_tem_create_email",
		"Send a new transactional email with HTML/text body and optional attachments",
		CreateEmailParams.shape,
		async (params) => handleCreateEmail(params),
	);

	server.tool(
		"scaleway_tem_cancel_email",
		"Cancel a queued transactional email before it is sent",
		CancelEmailParams.shape,
		async (params) => handleCancelEmail(params),
	);

	// --- Statistics tool ---
	server.tool(
		"scaleway_tem_get_statistics",
		"Get email sending statistics filtered by project, domain, date range, or sender",
		GetStatisticsParams.shape,
		async (params) => handleGetStatistics(params),
	);

	// --- Webhook tools ---
	server.tool(
		"scaleway_tem_list_webhooks",
		"List webhooks configured for a transactional email domain",
		ListWebhooksParams.shape,
		async (params) => handleListWebhooks(params),
	);

	server.tool(
		"scaleway_tem_create_webhook",
		"Create a webhook to receive email event notifications via SNS",
		CreateWebhookParams.shape,
		async (params) => handleCreateWebhook(params),
	);

	server.tool(
		"scaleway_tem_update_webhook",
		"Update webhook name, event types, or SNS ARN",
		UpdateWebhookParams.shape,
		async (params) => handleUpdateWebhook(params),
	);

	server.tool(
		"scaleway_tem_delete_webhook",
		"Delete a transactional email webhook",
		DeleteWebhookParams.shape,
		async (params) => handleDeleteWebhook(params),
	);
}
