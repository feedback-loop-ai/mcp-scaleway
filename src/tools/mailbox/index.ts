import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateAlias,
	handleCreateDomain,
	handleCreateMailboxes,
	handleDeleteAlias,
	handleDeleteDomain,
	handleDeleteMailbox,
	handleGetAlias,
	handleGetDomain,
	handleGetDomainRecords,
	handleGetMailbox,
	handleListAliases,
	handleListDomains,
	handleListMailboxes,
	handleRestoreMailbox,
	handleUpdateMailbox,
	handleValidateDomainRecords,
} from "./handlers.js";
import {
	CreateAliasParams,
	CreateDomainParams,
	CreateMailboxesParams,
	DeleteAliasParams,
	DeleteDomainParams,
	DeleteMailboxParams,
	GetAliasParams,
	GetDomainParams,
	GetDomainRecordsParams,
	GetMailboxParams,
	ListAliasesParams,
	ListDomainsParams,
	ListMailboxesParams,
	RestoreMailboxParams,
	UpdateMailboxParams,
	ValidateDomainRecordsParams,
} from "./types.js";

export function registerMailboxTools(server: McpServer): void {
	// --- Domains ---
	server.tool(
		"scaleway_mailbox_list_domains",
		"List Scaleway Mailbox domains, optionally filtered by project, status, or search term",
		ListDomainsParams.shape,
		async (params) => handleListDomains(ListDomainsParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_get_domain",
		"Get details of a specific Mailbox domain by ID",
		GetDomainParams.shape,
		async (params) => handleGetDomain(GetDomainParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_create_domain",
		"Register a domain for use with Scaleway Mailbox in a project",
		CreateDomainParams.shape,
		async (params) => handleCreateDomain(CreateDomainParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_delete_domain",
		"Delete a Mailbox domain by ID",
		DeleteDomainParams.shape,
		async (params) => handleDeleteDomain(DeleteDomainParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_get_domain_records",
		"Get the DNS records required to configure a Mailbox domain",
		GetDomainRecordsParams.shape,
		async (params) => handleGetDomainRecords(GetDomainRecordsParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_validate_domain_records",
		"Trigger validation of a Mailbox domain's DNS records",
		ValidateDomainRecordsParams.shape,
		async (params) => handleValidateDomainRecords(ValidateDomainRecordsParams.parse(params)),
	);

	// --- Mailboxes ---
	server.tool(
		"scaleway_mailbox_create_mailboxes",
		"Create one or more mailboxes in a domain (batch create)",
		CreateMailboxesParams.shape,
		async (params) => handleCreateMailboxes(CreateMailboxesParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_list_mailboxes",
		"List mailboxes, optionally filtered by domain, project, status, or search term",
		ListMailboxesParams.shape,
		async (params) => handleListMailboxes(ListMailboxesParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_get_mailbox",
		"Get details of a specific mailbox by ID",
		GetMailboxParams.shape,
		async (params) => handleGetMailbox(GetMailboxParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_update_mailbox",
		"Update a mailbox's subscription period or password",
		UpdateMailboxParams.shape,
		async (params) => handleUpdateMailbox(UpdateMailboxParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_delete_mailbox",
		"Delete a mailbox by ID",
		DeleteMailboxParams.shape,
		async (params) => handleDeleteMailbox(DeleteMailboxParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_restore_mailbox",
		"Restore a mailbox that is scheduled for deletion",
		RestoreMailboxParams.shape,
		async (params) => handleRestoreMailbox(RestoreMailboxParams.parse(params)),
	);

	// --- Aliases ---
	server.tool(
		"scaleway_mailbox_create_alias",
		"Create an email alias for a mailbox",
		CreateAliasParams.shape,
		async (params) => handleCreateAlias(CreateAliasParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_list_aliases",
		"List aliases, optionally filtered by mailbox, project, or status",
		ListAliasesParams.shape,
		async (params) => handleListAliases(ListAliasesParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_get_alias",
		"Get details of a specific alias by ID",
		GetAliasParams.shape,
		async (params) => handleGetAlias(GetAliasParams.parse(params)),
	);

	server.tool(
		"scaleway_mailbox_delete_alias",
		"Delete an email alias by ID",
		DeleteAliasParams.shape,
		async (params) => handleDeleteAlias(DeleteAliasParams.parse(params)),
	);
}
