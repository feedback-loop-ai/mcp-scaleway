import { type MockInstance, beforeEach, describe, expect, it, vi } from "vitest";

// Mock shared modules before importing handlers
vi.mock("../../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWTEST1234567890",
		secretKey: "secret-key-123",
		defaultProjectId: "proj-default",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	})),
}));

const mockFetch = vi.fn();
vi.mock("../../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn(() => ({ fetch: mockFetch })),
}));

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
} from "../../../../src/tools/domain-registrar/handlers.js";

interface ScwRequest {
	method: string;
	path: string;
	body?: string;
	headers?: Record<string, string>;
	urlParams?: URLSearchParams;
}

function parseContent(result: { content: { text: string }[] }) {
	return JSON.parse(result.content[0].text);
}

function getRequest(): ScwRequest {
	return (mockFetch as MockInstance).mock.calls[0][0] as ScwRequest;
}

beforeEach(() => {
	vi.clearAllMocks();
});

// ── Domain Handlers ────────────────────────────────────────────────────────

describe("handleListDomains", () => {
	it("returns paginated domains", async () => {
		const domains = [{ domain: "example.com" }, { domain: "test.fr" }];
		mockFetch.mockResolvedValue({ domains, total_count: 2 });
		const result = await handleListDomains({ page: 1, page_size: 50 });
		const data = parseContent(result);
		expect(data.items).toHaveLength(2);
		expect(data.totalCount).toBe(2);
		expect(data.page).toBe(1);
		expect(data.pageSize).toBe(50);
	});

	it("passes filters and order_by", async () => {
		mockFetch.mockResolvedValue({ domains: [], total_count: 0 });
		await handleListDomains({
			page: 1,
			page_size: 10,
			project_id: "proj-1",
			organization_id: "org-1",
			order_by: "domain_asc",
		});
		const req = getRequest();
		expect(req.urlParams?.get("project_id")).toBe("proj-1");
		expect(req.urlParams?.get("organization_id")).toBe("org-1");
		expect(req.urlParams?.get("order_by")).toBe("domain_asc");
	});

	it("omits undefined filters", async () => {
		mockFetch.mockResolvedValue({ domains: [], total_count: 0 });
		await handleListDomains({ page: 1, page_size: 50 });
		const req = getRequest();
		expect(req.urlParams?.has("project_id")).toBe(false);
	});

	it("returns error on API failure", async () => {
		const err = new Error("Internal Server Error");
		(err as unknown as Record<string, unknown>).statusCode = 500;
		mockFetch.mockRejectedValue(err);
		const result = await handleListDomains({ page: 1, page_size: 50 });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
		const data = parseContent(result);
		expect(data.error.type).toBe("server_error");
	});
});

describe("handleGetDomain", () => {
	it("returns domain details", async () => {
		const domain = { domain: "example.com", status: "active" };
		mockFetch.mockResolvedValue(domain);
		const result = await handleGetDomain({ domain: "example.com" });
		const data = parseContent(result);
		expect(data.domain).toBe("example.com");
	});

	it("returns error for non-existent domain", async () => {
		const err = new Error("Not Found");
		(err as unknown as Record<string, unknown>).statusCode = 404;
		mockFetch.mockRejectedValue(err);
		const result = await handleGetDomain({ domain: "nonexistent.com" });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
		const data = parseContent(result);
		expect(data.error.type).toBe("not_found");
	});
});

describe("handleRegisterDomain", () => {
	it("registers a domain successfully", async () => {
		const registered = { domain: "new.com", status: "pending_registration" };
		mockFetch.mockResolvedValue(registered);
		const result = await handleRegisterDomain({
			domain: "new.com",
			duration_in_years: 1,
			project_id: "proj-1",
			owner_contact_id: "c-1",
		});
		const data = parseContent(result);
		expect(data.domain).toBe("new.com");
	});

	it("sends optional contact IDs", async () => {
		mockFetch.mockResolvedValue({ domain: "new.com" });
		await handleRegisterDomain({
			domain: "new.com",
			duration_in_years: 2,
			project_id: "proj-1",
			owner_contact_id: "c-1",
			admin_contact_id: "c-2",
			tech_contact_id: "c-3",
		});
		const req = getRequest();
		const body = JSON.parse(req.body as string);
		expect(body.admin_contact_id).toBe("c-2");
		expect(body.tech_contact_id).toBe("c-3");
	});

	it("returns error on failure", async () => {
		const err = new Error("Bad Request");
		(err as unknown as Record<string, unknown>).statusCode = 400;
		mockFetch.mockRejectedValue(err);
		const result = await handleRegisterDomain({
			domain: "bad.com",
			duration_in_years: 1,
			project_id: "proj-1",
			owner_contact_id: "c-1",
		});
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
	});
});

describe("handleRenewDomain", () => {
	it("renews a domain successfully", async () => {
		mockFetch.mockResolvedValue({ domain: "example.com" });
		const result = await handleRenewDomain({ domain: "example.com", duration_in_years: 1 });
		const data = parseContent(result);
		expect(data.domain).toBe("example.com");
	});

	it("returns error on failure", async () => {
		const err = new Error("Not Found");
		(err as unknown as Record<string, unknown>).statusCode = 404;
		mockFetch.mockRejectedValue(err);
		const result = await handleRenewDomain({ domain: "gone.com", duration_in_years: 1 });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
	});
});

describe("handleTransferDomain", () => {
	it("transfers a domain successfully", async () => {
		mockFetch.mockResolvedValue({ domain: "transfer.com", status: "pending_transfer" });
		const result = await handleTransferDomain({
			domain: "transfer.com",
			auth_code: "EPP123",
			project_id: "proj-1",
			owner_contact_id: "c-1",
		});
		const data = parseContent(result);
		expect(data.status).toBe("pending_transfer");
	});

	it("sends correct body", async () => {
		mockFetch.mockResolvedValue({});
		await handleTransferDomain({
			domain: "transfer.com",
			auth_code: "EPP123",
			project_id: "proj-1",
			owner_contact_id: "c-1",
		});
		const req = getRequest();
		const body = JSON.parse(req.body as string);
		expect(body.auth_code).toBe("EPP123");
	});

	it("returns error on failure", async () => {
		const err = new Error("Forbidden");
		(err as unknown as Record<string, unknown>).statusCode = 403;
		mockFetch.mockRejectedValue(err);
		const result = await handleTransferDomain({
			domain: "locked.com",
			auth_code: "BAD",
			project_id: "proj-1",
			owner_contact_id: "c-1",
		});
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
		const data = parseContent(result);
		expect(data.error.type).toBe("permission_denied");
	});
});

describe("handleUpdateDomain", () => {
	it("updates domain contacts", async () => {
		mockFetch.mockResolvedValue({ domain: "example.com" });
		const result = await handleUpdateDomain({
			domain: "example.com",
			owner_contact_id: "c-new",
		});
		const data = parseContent(result);
		expect(data.domain).toBe("example.com");
	});

	it("sends PATCH with correct body (excludes domain)", async () => {
		mockFetch.mockResolvedValue({});
		await handleUpdateDomain({
			domain: "example.com",
			admin_contact_id: "c-2",
			tech_contact_id: "c-3",
		});
		const req = getRequest();
		expect(req.method).toBe("PATCH");
		const body = JSON.parse(req.body as string);
		expect(body.admin_contact_id).toBe("c-2");
		expect(body).not.toHaveProperty("domain");
	});

	it("returns error on failure", async () => {
		const err = new Error("Not Found");
		(err as unknown as Record<string, unknown>).statusCode = 404;
		mockFetch.mockRejectedValue(err);
		const result = await handleUpdateDomain({ domain: "nope.com" });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
	});
});

describe("handleEnableAutoRenew", () => {
	it("enables auto-renew successfully", async () => {
		mockFetch.mockResolvedValue({});
		const result = await handleEnableAutoRenew({ domain: "example.com" });
		expect((result as unknown as { isError?: boolean }).isError).toBeUndefined();
	});

	it("calls correct endpoint", async () => {
		mockFetch.mockResolvedValue({});
		await handleEnableAutoRenew({ domain: "example.com" });
		const req = getRequest();
		expect(req.path).toContain("/domains/example.com/enable-auto-renew");
	});

	it("returns error on failure", async () => {
		const err = new Error("Bad Request");
		(err as unknown as Record<string, unknown>).statusCode = 400;
		mockFetch.mockRejectedValue(err);
		const result = await handleEnableAutoRenew({ domain: "bad.com" });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
	});
});

describe("handleDisableAutoRenew", () => {
	it("disables auto-renew successfully", async () => {
		mockFetch.mockResolvedValue({});
		const result = await handleDisableAutoRenew({ domain: "example.com" });
		expect((result as unknown as { isError?: boolean }).isError).toBeUndefined();
	});

	it("calls correct endpoint", async () => {
		mockFetch.mockResolvedValue({});
		await handleDisableAutoRenew({ domain: "example.com" });
		const req = getRequest();
		expect(req.path).toContain("/domains/example.com/disable-auto-renew");
	});

	it("returns error on failure", async () => {
		const err = new Error("Rate Limited");
		(err as unknown as Record<string, unknown>).statusCode = 429;
		mockFetch.mockRejectedValue(err);
		const result = await handleDisableAutoRenew({ domain: "rate.com" });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
		const data = parseContent(result);
		expect(data.error.type).toBe("rate_limited");
	});
});

describe("handleCheckDomainAvailability", () => {
	it("returns availability info", async () => {
		mockFetch.mockResolvedValue({ domain: "check.com", available: true, tld: "com" });
		const result = await handleCheckDomainAvailability({ domain: "check.com" });
		const data = parseContent(result);
		expect(data.available).toBe(true);
	});

	it("passes domain as query param", async () => {
		mockFetch.mockResolvedValue({});
		await handleCheckDomainAvailability({ domain: "check.com" });
		const req = getRequest();
		expect(req.urlParams?.get("domain")).toBe("check.com");
	});

	it("returns error on failure", async () => {
		const err = new Error("Server Error");
		(err as unknown as Record<string, unknown>).statusCode = 500;
		mockFetch.mockRejectedValue(err);
		const result = await handleCheckDomainAvailability({ domain: "fail.com" });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
	});
});

// ── Contact Handlers ───────────────────────────────────────────────────────

describe("handleListContacts", () => {
	it("returns paginated contacts", async () => {
		const contacts = [{ id: "c-1" }, { id: "c-2" }];
		mockFetch.mockResolvedValue({ contacts, total_count: 2 });
		const result = await handleListContacts({ page: 1, page_size: 50 });
		const data = parseContent(result);
		expect(data.items).toHaveLength(2);
		expect(data.totalCount).toBe(2);
	});

	it("passes filters", async () => {
		mockFetch.mockResolvedValue({ contacts: [], total_count: 0 });
		await handleListContacts({
			page: 1,
			page_size: 10,
			domain: "example.com",
			project_id: "proj-1",
			organization_id: "org-1",
		});
		const req = getRequest();
		expect(req.urlParams?.get("domain")).toBe("example.com");
		expect(req.urlParams?.get("project_id")).toBe("proj-1");
	});

	it("omits undefined filters", async () => {
		mockFetch.mockResolvedValue({ contacts: [], total_count: 0 });
		await handleListContacts({ page: 1, page_size: 50 });
		const req = getRequest();
		expect(req.urlParams?.has("domain")).toBe(false);
	});

	it("returns error on failure", async () => {
		const err = new Error("Unauthorized");
		(err as unknown as Record<string, unknown>).statusCode = 401;
		mockFetch.mockRejectedValue(err);
		const result = await handleListContacts({ page: 1, page_size: 50 });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
		const data = parseContent(result);
		expect(data.error.type).toBe("permission_denied");
	});
});

describe("handleGetContact", () => {
	it("returns contact details", async () => {
		mockFetch.mockResolvedValue({ id: "c-1", firstname: "John" });
		const result = await handleGetContact({ contact_id: "c-1" });
		const data = parseContent(result);
		expect(data.firstname).toBe("John");
	});

	it("returns error for non-existent contact", async () => {
		const err = new Error("Not Found");
		(err as unknown as Record<string, unknown>).statusCode = 404;
		mockFetch.mockRejectedValue(err);
		const result = await handleGetContact({ contact_id: "c-missing" });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
	});
});

describe("handleCreateContact", () => {
	it("creates a contact successfully", async () => {
		const contact = { id: "c-new", firstname: "Jane" };
		mockFetch.mockResolvedValue(contact);
		const result = await handleCreateContact({
			firstname: "Jane",
			lastname: "Doe",
			email: "jane@example.com",
			phone: "+33612345678",
			address_line_1: "1 Rue",
			city: "Paris",
			zip: "75001",
			country: "FR",
		});
		const data = parseContent(result);
		expect(data.id).toBe("c-new");
	});

	it("sends correct body", async () => {
		mockFetch.mockResolvedValue({ id: "c-new" });
		await handleCreateContact({
			firstname: "Jane",
			lastname: "Doe",
			email: "jane@example.com",
			phone: "+33612345678",
			address_line_1: "1 Rue",
			city: "Paris",
			zip: "75001",
			country: "FR",
			company_name: "ACME",
			state: "IDF",
		});
		const req = getRequest();
		const body = JSON.parse(req.body as string);
		expect(body.company_name).toBe("ACME");
		expect(body.state).toBe("IDF");
	});

	it("returns error on failure", async () => {
		const err = new Error("Bad Request");
		(err as unknown as Record<string, unknown>).statusCode = 400;
		mockFetch.mockRejectedValue(err);
		const result = await handleCreateContact({
			firstname: "",
			lastname: "Doe",
			email: "bad@example.com",
			phone: "+33612345678",
			address_line_1: "1 Rue",
			city: "Paris",
			zip: "75001",
			country: "FR",
		});
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
	});
});

describe("handleUpdateContact", () => {
	it("updates a contact successfully", async () => {
		mockFetch.mockResolvedValue({ id: "c-1", firstname: "Updated" });
		const result = await handleUpdateContact({ contact_id: "c-1", firstname: "Updated" });
		const data = parseContent(result);
		expect(data.firstname).toBe("Updated");
	});

	it("sends PATCH with correct body (excludes contact_id)", async () => {
		mockFetch.mockResolvedValue({});
		await handleUpdateContact({
			contact_id: "c-1",
			lastname: "Smith",
			city: "Lyon",
		});
		const req = getRequest();
		expect(req.method).toBe("PATCH");
		const body = JSON.parse(req.body as string);
		expect(body.lastname).toBe("Smith");
		expect(body).not.toHaveProperty("contact_id");
	});

	it("returns error on failure", async () => {
		const err = new Error("Not Found");
		(err as unknown as Record<string, unknown>).statusCode = 404;
		mockFetch.mockRejectedValue(err);
		const result = await handleUpdateContact({ contact_id: "c-gone" });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
	});
});

// ── TLD Handlers ───────────────────────────────────────────────────────────

describe("handleListTlds", () => {
	it("returns paginated TLDs", async () => {
		const tlds = [{ name: "com" }, { name: "fr" }];
		mockFetch.mockResolvedValue({ tlds, total_count: 2 });
		const result = await handleListTlds({ page: 1, page_size: 50 });
		const data = parseContent(result);
		expect(data.items).toHaveLength(2);
		expect(data.totalCount).toBe(2);
	});

	it("returns error on failure", async () => {
		const err = new Error("Server Error");
		(err as unknown as Record<string, unknown>).statusCode = 500;
		mockFetch.mockRejectedValue(err);
		const result = await handleListTlds({ page: 1, page_size: 50 });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
	});
});

describe("handleGetTld", () => {
	it("returns TLD details", async () => {
		mockFetch.mockResolvedValue({ name: "com", dnssec_support: true, offers: [] });
		const result = await handleGetTld({ tld_name: "com" });
		const data = parseContent(result);
		expect(data.name).toBe("com");
	});

	it("returns error for non-existent TLD", async () => {
		const err = new Error("Not Found");
		(err as unknown as Record<string, unknown>).statusCode = 404;
		mockFetch.mockRejectedValue(err);
		const result = await handleGetTld({ tld_name: "zzz" });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
	});
});

// ── Error mapping edge cases ───────────────────────────────────────────────

describe("error handling edge cases", () => {
	it("handles non-Error throws", async () => {
		mockFetch.mockRejectedValue("string error");
		const result = await handleGetDomain({ domain: "throw.com" });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
		const data = parseContent(result);
		expect(data.error.type).toBe("server_error");
	});

	it("handles Error without statusCode", async () => {
		mockFetch.mockRejectedValue(new Error("network failure"));
		const result = await handleGetDomain({ domain: "network.com" });
		expect((result as unknown as { isError: boolean }).isError).toBe(true);
		const data = parseContent(result);
		expect(data.error.statusCode).toBe(500);
	});
});
