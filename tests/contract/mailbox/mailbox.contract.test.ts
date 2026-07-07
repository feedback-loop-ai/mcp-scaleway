/**
 * Contract tests for Scaleway Mailbox API (v1alpha1, global scope)
 *
 * Validates request/response shapes against specs/scaleway-api/mailbox/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	Alias,
	CreateAliasParams,
	CreateDomainParams,
	CreateMailboxesParams,
	DeleteAliasParams,
	DeleteDomainParams,
	DeleteMailboxParams,
	Domain,
	DomainRecord,
	GetAliasParams,
	GetDomainParams,
	GetDomainRecordsParams,
	GetDomainRecordsResponse,
	GetMailboxParams,
	ListAliasesParams,
	ListAliasesResponse,
	ListDomainsParams,
	ListDomainsResponse,
	ListMailboxesParams,
	ListMailboxesResponse,
	Mailbox,
	RestoreMailboxParams,
	UpdateMailboxParams,
	ValidateDomainRecordsParams,
} from "../../../src/tools/mailbox/types.js";

// --- Shared fixtures ---

const DOMAIN_ID = "00000000-0000-0000-0000-0000000000d1";
const MAILBOX_ID = "00000000-0000-0000-0000-0000000000b1";
const ALIAS_ID = "00000000-0000-0000-0000-0000000000a1";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";

const validDomain = {
	id: DOMAIN_ID,
	project_id: PROJECT_ID,
	name: "example.com",
	status: "ready" as const,
	mailbox_total_count: 3,
	created_at: "2026-01-01T00:00:00+00:00",
	updated_at: "2026-01-02T00:00:00+00:00",
	webmail_url: "https://webmail.tem.scaleway.com",
	imap_url: "imap.tem.scaleway.com",
	pop3_url: "pop3.tem.scaleway.com",
	smtp_url: "smtp.tem.scaleway.com",
};

const validMailbox = {
	id: MAILBOX_ID,
	domain_id: DOMAIN_ID,
	email: "john@example.com",
	status: "ready" as const,
	subscription_period: "monthly" as const,
	subscription_period_started_at: "2026-01-01T00:00:00+00:00",
	next_subscription_period: "monthly" as const,
	next_subscription_period_starts_at: "2026-02-01T00:00:00+00:00",
	created_at: "2026-01-01T00:00:00+00:00",
	updated_at: "2026-01-01T00:00:00+00:00",
	deletion_scheduled_at: null,
};

const validAlias = {
	id: ALIAS_ID,
	email: "sales@example.com",
	mailbox_id: MAILBOX_ID,
	description: "Sales inbox",
	status: "ready" as const,
	created_at: "2026-01-01T00:00:00+00:00",
	updated_at: "2026-01-01T00:00:00+00:00",
};

const validDomainRecord = {
	id: "00000000-0000-0000-0000-0000000000c1",
	domain_id: DOMAIN_ID,
	status: "valid" as const,
	level: "required" as const,
	dns_type: "mx_dns_type" as const,
	dns_name: "example.com",
	dns_value: "mail.example.com",
	error: null,
	created_at: "2026-01-01T00:00:00+00:00",
	updated_at: "2026-01-01T00:00:00+00:00",
};

// --- Domain contracts ---

/**
 * API: GET /mailbox/v1alpha1/domains
 * Spec: specs/scaleway-api/mailbox/api-reference.md#list-domains
 */
describe("contract: ListDomains", () => {
	it("validates a list response", () => {
		expect(() =>
			ListDomainsResponse.parse({ domains: [validDomain], total_count: 1 }),
		).not.toThrow();
	});

	it("validates an empty response", () => {
		expect(() => ListDomainsResponse.parse({ domains: [], total_count: 0 })).not.toThrow();
	});

	it("rejects a response missing the domains array", () => {
		expect(() => ListDomainsResponse.parse({ total_count: 0 })).toThrow();
	});

	it("validates a request with all filters", () => {
		expect(() =>
			ListDomainsParams.parse({
				projectId: PROJECT_ID,
				statuses: ["ready", "creating"],
				search: "example",
				orderBy: "mailbox_total_count_desc",
			}),
		).not.toThrow();
	});
});

/**
 * API: GET /mailbox/v1alpha1/domains/{domain_id}
 * Spec: specs/scaleway-api/mailbox/api-reference.md#get-domain
 */
describe("contract: Domain entity + GetDomain", () => {
	it("validates a domain object", () => {
		expect(() => Domain.parse(validDomain)).not.toThrow();
	});

	it("validates all documented domain statuses", () => {
		for (const status of [
			"unknown_status",
			"creating",
			"waiting_validation",
			"validating",
			"validation_failed",
			"provisioning",
			"ready",
			"deleting",
		]) {
			expect(() => Domain.parse({ ...validDomain, status })).not.toThrow();
		}
	});

	it("rejects an invalid domain status", () => {
		expect(() => Domain.parse({ ...validDomain, status: "archived" })).toThrow();
	});

	it("validates the request shape", () => {
		expect(() => GetDomainParams.parse({ domainId: DOMAIN_ID })).not.toThrow();
		expect(() => GetDomainParams.parse({ domainId: "not-a-uuid" })).toThrow();
	});
});

/**
 * API: POST /mailbox/v1alpha1/domains
 * Spec: specs/scaleway-api/mailbox/api-reference.md#create-domain
 */
describe("contract: CreateDomain", () => {
	it("validates a request with a project ID", () => {
		expect(() =>
			CreateDomainParams.parse({ name: "example.com", projectId: PROJECT_ID }),
		).not.toThrow();
	});

	it("validates a request without a project ID", () => {
		expect(() => CreateDomainParams.parse({ name: "example.com" })).not.toThrow();
	});

	it("rejects a request without a name", () => {
		expect(() => CreateDomainParams.parse({ projectId: PROJECT_ID })).toThrow();
	});
});

/**
 * API: DELETE /mailbox/v1alpha1/domains/{domain_id}
 * Spec: specs/scaleway-api/mailbox/api-reference.md#delete-domain
 */
describe("contract: DeleteDomain", () => {
	it("validates the request shape", () => {
		expect(() => DeleteDomainParams.parse({ domainId: DOMAIN_ID })).not.toThrow();
	});

	it("rejects a missing domain ID", () => {
		expect(() => DeleteDomainParams.parse({})).toThrow();
	});
});

/**
 * API: GET /mailbox/v1alpha1/domains/{domain_id}/records
 * Spec: specs/scaleway-api/mailbox/api-reference.md#get-domain-records
 */
describe("contract: GetDomainRecords", () => {
	it("validates the DomainRecord entity", () => {
		expect(() => DomainRecord.parse(validDomainRecord)).not.toThrow();
	});

	it("validates all documented record statuses and levels and DNS types", () => {
		for (const status of ["unknown_status", "validating", "valid", "invalid", "not_found"]) {
			expect(() => DomainRecord.parse({ ...validDomainRecord, status })).not.toThrow();
		}
		for (const level of ["unknown_level", "required", "recommended", "optional"]) {
			expect(() => DomainRecord.parse({ ...validDomainRecord, level })).not.toThrow();
		}
		for (const dns_type of [
			"unknown_dns_type",
			"cname_dns_type",
			"mx_dns_type",
			"srv_dns_type",
			"txt_dns_type",
		]) {
			expect(() => DomainRecord.parse({ ...validDomainRecord, dns_type })).not.toThrow();
		}
	});

	it("validates the records response with nullable record slots", () => {
		const response = {
			autoconfig: null,
			autodiscover: null,
			caldav: null,
			carddav: null,
			dkim: validDomainRecord,
			dmarc: validDomainRecord,
			domain_validation: validDomainRecord,
			imap: null,
			mx: validDomainRecord,
			pop3: null,
			spf: validDomainRecord,
			submission: null,
		};
		expect(() => GetDomainRecordsResponse.parse(response)).not.toThrow();
	});

	it("validates the request shape", () => {
		expect(() => GetDomainRecordsParams.parse({ domainId: DOMAIN_ID })).not.toThrow();
	});
});

/**
 * API: POST /mailbox/v1alpha1/domains/{domain_id}/validate-records
 * Spec: specs/scaleway-api/mailbox/api-reference.md#validate-domain-records
 */
describe("contract: ValidateDomainRecords", () => {
	it("validates the request shape", () => {
		expect(() => ValidateDomainRecordsParams.parse({ domainId: DOMAIN_ID })).not.toThrow();
	});
});

// --- Mailbox contracts ---

/**
 * API: POST /mailbox/v1alpha1/batch-create-mailboxes
 * Spec: specs/scaleway-api/mailbox/api-reference.md#create-mailboxes
 */
describe("contract: CreateMailboxes (batch)", () => {
	it("validates the batch-create response", () => {
		const BatchResponse = z.object({ mailboxes: z.array(Mailbox) });
		expect(() => BatchResponse.parse({ mailboxes: [validMailbox] })).not.toThrow();
	});

	it("validates a request with one or more mailboxes", () => {
		expect(() =>
			CreateMailboxesParams.parse({
				domainId: DOMAIN_ID,
				subscriptionPeriod: "yearly",
				mailboxes: [{ localPart: "john", password: "s3cret!" }],
			}),
		).not.toThrow();
	});

	it("rejects an empty mailboxes array", () => {
		expect(() =>
			CreateMailboxesParams.parse({
				domainId: DOMAIN_ID,
				subscriptionPeriod: "monthly",
				mailboxes: [],
			}),
		).toThrow();
	});

	it("rejects an invalid subscription period", () => {
		expect(() =>
			CreateMailboxesParams.parse({
				domainId: DOMAIN_ID,
				subscriptionPeriod: "weekly",
				mailboxes: [{ localPart: "john", password: "s3cret!" }],
			}),
		).toThrow();
	});
});

/**
 * API: GET /mailbox/v1alpha1/mailboxes
 * Spec: specs/scaleway-api/mailbox/api-reference.md#list-mailboxes
 */
describe("contract: ListMailboxes", () => {
	it("validates a list response", () => {
		expect(() =>
			ListMailboxesResponse.parse({ mailboxes: [validMailbox], total_count: 1 }),
		).not.toThrow();
	});

	it("validates a request with all filters", () => {
		expect(() =>
			ListMailboxesParams.parse({
				domainId: DOMAIN_ID,
				projectId: PROJECT_ID,
				statuses: ["ready", "locked"],
				search: "john",
				orderBy: "email_asc",
			}),
		).not.toThrow();
	});
});

/**
 * API: GET /mailbox/v1alpha1/mailboxes/{mailbox_id}
 * Spec: specs/scaleway-api/mailbox/api-reference.md#get-mailbox
 */
describe("contract: Mailbox entity + GetMailbox", () => {
	it("validates a mailbox object", () => {
		expect(() => Mailbox.parse(validMailbox)).not.toThrow();
	});

	it("validates a mailbox with a scheduled deletion timestamp", () => {
		expect(() =>
			Mailbox.parse({
				...validMailbox,
				status: "deletion_scheduled",
				deletion_scheduled_at: "2026-03-01T00:00:00+00:00",
			}),
		).not.toThrow();
	});

	it("validates all documented mailbox statuses", () => {
		for (const status of [
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
		]) {
			expect(() => Mailbox.parse({ ...validMailbox, status })).not.toThrow();
		}
	});

	it("rejects an invalid mailbox status", () => {
		expect(() => Mailbox.parse({ ...validMailbox, status: "suspended" })).toThrow();
	});

	it("validates the request shape", () => {
		expect(() => GetMailboxParams.parse({ mailboxId: MAILBOX_ID })).not.toThrow();
	});
});

/**
 * API: PATCH /mailbox/v1alpha1/mailboxes/{mailbox_id}
 * Spec: specs/scaleway-api/mailbox/api-reference.md#update-mailbox
 */
describe("contract: UpdateMailbox", () => {
	it("validates an update with a subscription period", () => {
		expect(() =>
			UpdateMailboxParams.parse({ mailboxId: MAILBOX_ID, subscriptionPeriod: "yearly" }),
		).not.toThrow();
	});

	it("validates an update with a new password", () => {
		expect(() =>
			UpdateMailboxParams.parse({ mailboxId: MAILBOX_ID, newPassword: "n3wp4ss!" }),
		).not.toThrow();
	});

	it("validates an update with no optional fields", () => {
		expect(() => UpdateMailboxParams.parse({ mailboxId: MAILBOX_ID })).not.toThrow();
	});

	it("validates canceling a subscription", () => {
		expect(() =>
			UpdateMailboxParams.parse({ mailboxId: MAILBOX_ID, subscriptionPeriod: "canceled" }),
		).not.toThrow();
	});
});

/**
 * API: DELETE /mailbox/v1alpha1/mailboxes/{mailbox_id}
 * Spec: specs/scaleway-api/mailbox/api-reference.md#delete-mailbox
 */
describe("contract: DeleteMailbox", () => {
	it("validates the request shape", () => {
		expect(() => DeleteMailboxParams.parse({ mailboxId: MAILBOX_ID })).not.toThrow();
	});
});

/**
 * API: POST /mailbox/v1alpha1/mailboxes/{mailbox_id}/restore
 * Spec: specs/scaleway-api/mailbox/api-reference.md#restore-mailbox
 */
describe("contract: RestoreMailbox", () => {
	it("validates the request shape", () => {
		expect(() => RestoreMailboxParams.parse({ mailboxId: MAILBOX_ID })).not.toThrow();
	});
});

// --- Alias contracts ---

/**
 * API: POST /mailbox/v1alpha1/aliases
 * Spec: specs/scaleway-api/mailbox/api-reference.md#create-alias
 */
describe("contract: CreateAlias", () => {
	it("validates a request with a description", () => {
		expect(() =>
			CreateAliasParams.parse({
				mailboxId: MAILBOX_ID,
				localPart: "sales",
				description: "Sales inbox",
			}),
		).not.toThrow();
	});

	it("validates a request without a description", () => {
		expect(() =>
			CreateAliasParams.parse({ mailboxId: MAILBOX_ID, localPart: "sales" }),
		).not.toThrow();
	});

	it("rejects a request without a local part", () => {
		expect(() => CreateAliasParams.parse({ mailboxId: MAILBOX_ID })).toThrow();
	});
});

/**
 * API: GET /mailbox/v1alpha1/aliases
 * Spec: specs/scaleway-api/mailbox/api-reference.md#list-aliases
 */
describe("contract: ListAliases + Alias entity", () => {
	it("validates the Alias entity", () => {
		expect(() => Alias.parse(validAlias)).not.toThrow();
	});

	it("validates all documented alias statuses", () => {
		for (const status of ["unknown_status", "provisioning", "deleting", "ready"]) {
			expect(() => Alias.parse({ ...validAlias, status })).not.toThrow();
		}
	});

	it("rejects an invalid alias status", () => {
		expect(() => Alias.parse({ ...validAlias, status: "paused" })).toThrow();
	});

	it("validates a list response", () => {
		expect(() =>
			ListAliasesResponse.parse({ aliases: [validAlias], total_count: 1 }),
		).not.toThrow();
	});

	it("validates a request with all filters", () => {
		expect(() =>
			ListAliasesParams.parse({
				mailboxId: MAILBOX_ID,
				projectId: PROJECT_ID,
				status: "ready",
				orderBy: "name_desc",
			}),
		).not.toThrow();
	});
});

/**
 * API: GET /mailbox/v1alpha1/aliases/{alias_id}
 * Spec: specs/scaleway-api/mailbox/api-reference.md#get-alias
 */
describe("contract: GetAlias", () => {
	it("validates the request shape", () => {
		expect(() => GetAliasParams.parse({ aliasId: ALIAS_ID })).not.toThrow();
	});
});

/**
 * API: DELETE /mailbox/v1alpha1/aliases/{alias_id}
 * Spec: specs/scaleway-api/mailbox/api-reference.md#delete-alias
 */
describe("contract: DeleteAlias", () => {
	it("validates the request shape", () => {
		expect(() => DeleteAliasParams.parse({ aliasId: ALIAS_ID })).not.toThrow();
	});
});

// --- Pagination & global-scope contracts ---

describe("contract: pagination defaults", () => {
	it("applies default pagination to domain listing", () => {
		const result = ListDomainsParams.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("rejects a page size over 100", () => {
		expect(() => ListMailboxesParams.parse({ pageSize: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListAliasesParams.parse({ page: 0 })).toThrow();
	});
});

describe("contract: global scope (no region parameter)", () => {
	it("does not require a region for list operations", () => {
		expect(() => ListDomainsParams.parse({})).not.toThrow();
		expect(() => ListMailboxesParams.parse({})).not.toThrow();
		expect(() => ListAliasesParams.parse({})).not.toThrow();
	});
});
