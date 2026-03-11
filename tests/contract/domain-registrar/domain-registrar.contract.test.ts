/**
 * Contract tests for Domain Registrar API.
 *
 * Validates request shapes, response shapes, pagination, auth, and error codes
 * against the Scaleway Domain Registrar v2beta1 API.
 *
 * API Reference: specs/scaleway-api/ (domain registrar section)
 * Parity Matrix: tests/parity-matrix.json -> domain-registrar
 */
import { type MockInstance, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWTEST1234567890",
		secretKey: "secret-key-contract",
		defaultProjectId: "proj-contract",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	})),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
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
} from "../../../src/tools/domain-registrar/handlers.js";

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

// ── Contract: List Domains (GET /domains) ──────────────────────────────────

describe("Contract: GET /domains (list_domains)", () => {
	it("sends GET to /domains with pagination query", async () => {
		mockFetch.mockResolvedValue({ domains: [], total_count: 0 });
		await handleListDomains({ page: 2, page_size: 25 });

		const req = getRequest();
		expect(req.method).toBe("GET");
		expect(req.path).toBe("/domain/v2beta1/domains");
		expect(req.urlParams?.get("page")).toBe("2");
		expect(req.urlParams?.get("page_size")).toBe("25");
	});

	it("response shape: { items, totalCount, page, pageSize }", async () => {
		mockFetch.mockResolvedValue({
			domains: [{ domain: "example.com" }],
			total_count: 1,
		});
		const result = await handleListDomains({ page: 1, page_size: 50 });
		const data = parseContent(result);
		expect(data).toHaveProperty("items");
		expect(data).toHaveProperty("totalCount");
		expect(data).toHaveProperty("page");
		expect(data).toHaveProperty("pageSize");
		expect(Array.isArray(data.items)).toBe(true);
	});

	it("returns 401 as permission_denied error", async () => {
		const err = new Error("Unauthorized");
		(err as unknown as Record<string, unknown>).statusCode = 401;
		mockFetch.mockRejectedValue(err);
		const result = await handleListDomains({ page: 1, page_size: 50 });
		const data = parseContent(result);
		expect(data.error.type).toBe("permission_denied");
		expect(data.error.statusCode).toBe(401);
	});
});

// ── Contract: Get Domain (GET /domains/{domain}) ───────────────────────────

describe("Contract: GET /domains/{domain} (get_domain)", () => {
	it("sends GET to /domains/{domain}", async () => {
		mockFetch.mockResolvedValue({ domain: "example.com" });
		await handleGetDomain({ domain: "example.com" });

		const req = getRequest();
		expect(req.method).toBe("GET");
		expect(req.path).toBe("/domain/v2beta1/domains/example.com");
	});

	it("returns 404 as not_found", async () => {
		const err = new Error("Not Found");
		(err as unknown as Record<string, unknown>).statusCode = 404;
		mockFetch.mockRejectedValue(err);
		const result = await handleGetDomain({ domain: "nope.com" });
		const data = parseContent(result);
		expect(data.error.type).toBe("not_found");
		expect(data.error.statusCode).toBe(404);
	});
});

// ── Contract: Register Domain (POST /domains) ─────────────────────────────

describe("Contract: POST /domains (register_domain)", () => {
	it("sends POST to /domains with request body", async () => {
		mockFetch.mockResolvedValue({ domain: "new.com" });
		await handleRegisterDomain({
			domain: "new.com",
			duration_in_years: 2,
			project_id: "proj-1",
			owner_contact_id: "c-1",
		});

		const req = getRequest();
		expect(req.method).toBe("POST");
		expect(req.path).toBe("/domain/v2beta1/domains");
		expect(req.headers).toEqual({ "Content-Type": "application/json" });
		const body = JSON.parse(req.body as string);
		expect(body).toEqual({
			domain: "new.com",
			duration_in_years: 2,
			project_id: "proj-1",
			owner_contact_id: "c-1",
			admin_contact_id: undefined,
			tech_contact_id: undefined,
		});
	});

	it("returns 400 as invalid_input", async () => {
		const err = new Error("Bad Request");
		(err as unknown as Record<string, unknown>).statusCode = 400;
		mockFetch.mockRejectedValue(err);
		const result = await handleRegisterDomain({
			domain: "",
			duration_in_years: 1,
			project_id: "p",
			owner_contact_id: "c",
		});
		const data = parseContent(result);
		expect(data.error.type).toBe("invalid_input");
	});
});

// ── Contract: Renew Domain (POST /domains/{domain}/renew) ──────────────────

describe("Contract: POST /domains/{domain}/renew (renew_domain)", () => {
	it("sends POST to /domains/{domain}/renew", async () => {
		mockFetch.mockResolvedValue({ domain: "example.com" });
		await handleRenewDomain({ domain: "example.com", duration_in_years: 3 });

		const req = getRequest();
		expect(req.method).toBe("POST");
		expect(req.path).toBe("/domain/v2beta1/domains/example.com/renew");
		const body = JSON.parse(req.body as string);
		expect(body.duration_in_years).toBe(3);
	});
});

// ── Contract: Transfer Domain (POST /domains/transfer) ─────────────────────

describe("Contract: POST /domains/transfer (transfer_domain)", () => {
	it("sends POST to /domains/transfer", async () => {
		mockFetch.mockResolvedValue({ domain: "transfer.com" });
		await handleTransferDomain({
			domain: "transfer.com",
			auth_code: "EPP123",
			project_id: "proj-1",
			owner_contact_id: "c-1",
		});

		const req = getRequest();
		expect(req.method).toBe("POST");
		expect(req.path).toBe("/domain/v2beta1/domains/transfer");
		const body = JSON.parse(req.body as string);
		expect(body.auth_code).toBe("EPP123");
	});

	it("returns 403 as permission_denied", async () => {
		const err = new Error("Forbidden");
		(err as unknown as Record<string, unknown>).statusCode = 403;
		mockFetch.mockRejectedValue(err);
		const result = await handleTransferDomain({
			domain: "d",
			auth_code: "x",
			project_id: "p",
			owner_contact_id: "c",
		});
		const data = parseContent(result);
		expect(data.error.type).toBe("permission_denied");
		expect(data.error.statusCode).toBe(403);
	});
});

// ── Contract: Update Domain (PATCH /domains/{domain}) ──────────────────────

describe("Contract: PATCH /domains/{domain} (update_domain)", () => {
	it("sends PATCH to /domains/{domain}", async () => {
		mockFetch.mockResolvedValue({ domain: "example.com" });
		await handleUpdateDomain({ domain: "example.com", owner_contact_id: "c-new" });

		const req = getRequest();
		expect(req.method).toBe("PATCH");
		expect(req.path).toBe("/domain/v2beta1/domains/example.com");
	});
});

// ── Contract: Enable Auto-Renew (POST /domains/{domain}/enable-auto-renew) ─

describe("Contract: POST /domains/{domain}/enable-auto-renew", () => {
	it("sends POST to correct endpoint", async () => {
		mockFetch.mockResolvedValue({});
		await handleEnableAutoRenew({ domain: "example.com" });

		const req = getRequest();
		expect(req.method).toBe("POST");
		expect(req.path).toBe("/domain/v2beta1/domains/example.com/enable-auto-renew");
	});
});

// ── Contract: Disable Auto-Renew (POST /domains/{domain}/disable-auto-renew)

describe("Contract: POST /domains/{domain}/disable-auto-renew", () => {
	it("sends POST to correct endpoint", async () => {
		mockFetch.mockResolvedValue({});
		await handleDisableAutoRenew({ domain: "example.com" });

		const req = getRequest();
		expect(req.method).toBe("POST");
		expect(req.path).toBe("/domain/v2beta1/domains/example.com/disable-auto-renew");
	});

	it("returns 429 as rate_limited", async () => {
		const err = new Error("Too Many Requests");
		(err as unknown as Record<string, unknown>).statusCode = 429;
		mockFetch.mockRejectedValue(err);
		const result = await handleDisableAutoRenew({ domain: "rate.com" });
		const data = parseContent(result);
		expect(data.error.type).toBe("rate_limited");
		expect(data.error.statusCode).toBe(429);
	});
});

// ── Contract: Check Availability (GET /domains/availability) ───────────────

describe("Contract: GET /domains/availability (check_domain_availability)", () => {
	it("sends GET to /domains/availability with domain query", async () => {
		mockFetch.mockResolvedValue({ domain: "d.com", available: true, tld: "com" });
		await handleCheckDomainAvailability({ domain: "d.com" });

		const req = getRequest();
		expect(req.method).toBe("GET");
		expect(req.path).toBe("/domain/v2beta1/domains/availability");
		expect(req.urlParams?.get("domain")).toBe("d.com");
	});
});

// ── Contract: List Contacts (GET /contacts) ────────────────────────────────

describe("Contract: GET /contacts (list_contacts)", () => {
	it("sends GET to /contacts with pagination", async () => {
		mockFetch.mockResolvedValue({ contacts: [], total_count: 0 });
		await handleListContacts({ page: 1, page_size: 20 });

		const req = getRequest();
		expect(req.method).toBe("GET");
		expect(req.path).toBe("/domain/v2beta1/contacts");
		expect(req.urlParams?.get("page_size")).toBe("20");
	});

	it("response shape includes paginated items", async () => {
		mockFetch.mockResolvedValue({ contacts: [{ id: "c-1" }], total_count: 1 });
		const result = await handleListContacts({ page: 1, page_size: 50 });
		const data = parseContent(result);
		expect(data).toHaveProperty("items");
		expect(data).toHaveProperty("totalCount");
	});
});

// ── Contract: Get Contact (GET /contacts/{contact_id}) ─────────────────────

describe("Contract: GET /contacts/{contact_id} (get_contact)", () => {
	it("sends GET to /contacts/{contact_id}", async () => {
		mockFetch.mockResolvedValue({ id: "c-1" });
		await handleGetContact({ contact_id: "c-1" });

		const req = getRequest();
		expect(req.method).toBe("GET");
		expect(req.path).toBe("/domain/v2beta1/contacts/c-1");
	});
});

// ── Contract: Create Contact (POST /contacts) ─────────────────────────────

describe("Contract: POST /contacts (create_contact)", () => {
	it("sends POST to /contacts with body", async () => {
		const input = {
			firstname: "Jane",
			lastname: "Doe",
			email: "jane@example.com",
			phone: "+33612345678",
			address_line_1: "1 Rue",
			city: "Paris",
			zip: "75001",
			country: "FR",
		};
		mockFetch.mockResolvedValue({ id: "c-new", ...input });
		await handleCreateContact(input);

		const req = getRequest();
		expect(req.method).toBe("POST");
		expect(req.path).toBe("/domain/v2beta1/contacts");
		expect(req.headers).toEqual({ "Content-Type": "application/json" });
	});
});

// ── Contract: Update Contact (PATCH /contacts/{contact_id}) ────────────────

describe("Contract: PATCH /contacts/{contact_id} (update_contact)", () => {
	it("sends PATCH to /contacts/{contact_id}", async () => {
		mockFetch.mockResolvedValue({ id: "c-1" });
		await handleUpdateContact({ contact_id: "c-1", firstname: "Updated" });

		const req = getRequest();
		expect(req.method).toBe("PATCH");
		expect(req.path).toBe("/domain/v2beta1/contacts/c-1");
	});
});

// ── Contract: List TLDs (GET /tlds) ────────────────────────────────────────

describe("Contract: GET /tlds (list_tlds)", () => {
	it("sends GET to /tlds with pagination", async () => {
		mockFetch.mockResolvedValue({ tlds: [], total_count: 0 });
		await handleListTlds({ page: 1, page_size: 50 });

		const req = getRequest();
		expect(req.method).toBe("GET");
		expect(req.path).toBe("/domain/v2beta1/tlds");
	});

	it("response shape includes paginated items", async () => {
		mockFetch.mockResolvedValue({ tlds: [{ name: "com" }], total_count: 1 });
		const result = await handleListTlds({ page: 1, page_size: 50 });
		const data = parseContent(result);
		expect(data).toHaveProperty("items");
		expect(data).toHaveProperty("totalCount");
	});
});

// ── Contract: Get TLD (GET /tlds/{tld_name}) ──────────────────────────────

describe("Contract: GET /tlds/{tld_name} (get_tld)", () => {
	it("sends GET to /tlds/{tld_name}", async () => {
		mockFetch.mockResolvedValue({ name: "com" });
		await handleGetTld({ tld_name: "com" });

		const req = getRequest();
		expect(req.method).toBe("GET");
		expect(req.path).toBe("/domain/v2beta1/tlds/com");
	});

	it("returns 404 as not_found for unknown TLD", async () => {
		const err = new Error("Not Found");
		(err as unknown as Record<string, unknown>).statusCode = 404;
		mockFetch.mockRejectedValue(err);
		const result = await handleGetTld({ tld_name: "zzz" });
		const data = parseContent(result);
		expect(data.error.type).toBe("not_found");
	});
});

// ── Cross-cutting contract: No body on GET requests ────────────────────────

describe("Contract: GET requests have no body", () => {
	it("list_domains has no body", async () => {
		mockFetch.mockResolvedValue({ domains: [], total_count: 0 });
		await handleListDomains({ page: 1, page_size: 50 });
		const req = getRequest();
		expect(req.body).toBeUndefined();
		expect(req.headers).toBeUndefined();
	});

	it("get_domain has no body", async () => {
		mockFetch.mockResolvedValue({});
		await handleGetDomain({ domain: "example.com" });
		const req = getRequest();
		expect(req.body).toBeUndefined();
	});

	it("check_domain_availability has no body", async () => {
		mockFetch.mockResolvedValue({});
		await handleCheckDomainAvailability({ domain: "d.com" });
		const req = getRequest();
		expect(req.body).toBeUndefined();
	});
});

// ── Cross-cutting contract: POST/PATCH have Content-Type header ────────────

describe("Contract: POST/PATCH requests include Content-Type", () => {
	it("register_domain includes Content-Type", async () => {
		mockFetch.mockResolvedValue({});
		await handleRegisterDomain({
			domain: "d.com",
			duration_in_years: 1,
			project_id: "p",
			owner_contact_id: "c",
		});
		const req = getRequest();
		expect(req.headers).toEqual({ "Content-Type": "application/json" });
	});

	it("create_contact includes Content-Type", async () => {
		mockFetch.mockResolvedValue({});
		await handleCreateContact({
			firstname: "J",
			lastname: "D",
			email: "j@e.com",
			phone: "+1",
			address_line_1: "1",
			city: "C",
			zip: "0",
			country: "FR",
		});
		const req = getRequest();
		expect(req.headers).toEqual({ "Content-Type": "application/json" });
	});
});

// ── Cross-cutting contract: API base path ──────────────────────────────────

describe("Contract: all requests use correct API base path", () => {
	it("uses v2beta1 base path", async () => {
		mockFetch.mockResolvedValue({ domains: [], total_count: 0 });
		await handleListDomains({ page: 1, page_size: 50 });
		const req = getRequest();
		expect(req.path).toMatch(/^\/domain\/v2beta1\//);
	});
});
