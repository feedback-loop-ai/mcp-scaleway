import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCheckDomainAvailability,
	handleCreateContact,
	handleDisableAutoRenew,
	handleEnableAutoRenew,
	handleGetContact,
	handleGetDomain,
	handleGetTld,
	handleListContacts,
	handleListDomains,
	handleListTlds,
	handleRegisterDomain,
	handleRenewDomain,
	handleTransferDomain,
	handleUpdateContact,
	handleUpdateDomain,
} from "./handlers.js";
import {
	CheckDomainAvailabilityInput,
	CreateContactInput,
	DisableAutoRenewInput,
	EnableAutoRenewInput,
	GetContactInput,
	GetDomainInput,
	GetTldInput,
	ListContactsInput,
	ListDomainsInput,
	ListTldsInput,
	RegisterDomainInput,
	RenewDomainInput,
	TransferDomainInput,
	UpdateContactInput,
	UpdateDomainInput,
} from "./types.js";

export function registerDomainRegistrarTools(server: McpServer): void {
	// ── Domain Tools ───────────────────────────────────────────────────────

	server.tool(
		"scaleway_domain_registrar_list_domains",
		"List all domains in your Scaleway account with pagination and filtering",
		ListDomainsInput.shape,
		async (params) => handleListDomains(ListDomainsInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_get_domain",
		"Get detailed information about a specific domain",
		GetDomainInput.shape,
		async (params) => handleGetDomain(GetDomainInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_register_domain",
		"Register a new domain name",
		RegisterDomainInput.shape,
		async (params) => handleRegisterDomain(RegisterDomainInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_renew_domain",
		"Renew an existing domain registration",
		RenewDomainInput.shape,
		async (params) => handleRenewDomain(RenewDomainInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_transfer_domain",
		"Transfer a domain from another registrar to Scaleway",
		TransferDomainInput.shape,
		async (params) => handleTransferDomain(TransferDomainInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_update_domain",
		"Update domain contacts",
		UpdateDomainInput.shape,
		async (params) => handleUpdateDomain(UpdateDomainInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_enable_auto_renew",
		"Enable auto-renewal for a domain",
		EnableAutoRenewInput.shape,
		async (params) => handleEnableAutoRenew(EnableAutoRenewInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_disable_auto_renew",
		"Disable auto-renewal for a domain",
		DisableAutoRenewInput.shape,
		async (params) => handleDisableAutoRenew(DisableAutoRenewInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_check_domain_availability",
		"Check whether a domain name is available for registration",
		CheckDomainAvailabilityInput.shape,
		async (params) => handleCheckDomainAvailability(CheckDomainAvailabilityInput.parse(params)),
	);

	// ── Contact Tools ──────────────────────────────────────────────────────

	server.tool(
		"scaleway_domain_registrar_list_contacts",
		"List all domain registration contacts with pagination and filtering",
		ListContactsInput.shape,
		async (params) => handleListContacts(ListContactsInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_get_contact",
		"Get detailed information about a specific contact",
		GetContactInput.shape,
		async (params) => handleGetContact(GetContactInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_create_contact",
		"Create a new domain registration contact",
		CreateContactInput.shape,
		async (params) => handleCreateContact(CreateContactInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_update_contact",
		"Update an existing domain registration contact",
		UpdateContactInput.shape,
		async (params) => handleUpdateContact(UpdateContactInput.parse(params)),
	);

	// ── TLD Tools ──────────────────────────────────────────────────────────

	server.tool(
		"scaleway_domain_registrar_list_tlds",
		"List available top-level domains (TLDs) with pricing information",
		ListTldsInput.shape,
		async (params) => handleListTlds(ListTldsInput.parse(params)),
	);

	server.tool(
		"scaleway_domain_registrar_get_tld",
		"Get detailed information about a specific TLD including pricing",
		GetTldInput.shape,
		async (params) => handleGetTld(GetTldInput.parse(params)),
	);
}
