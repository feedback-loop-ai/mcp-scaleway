/**
 * Contract tests for Scaleway Web Hosting API (v1)
 *
 * Validates request/response shapes against specs/scaleway-api/webhosting/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * Web Hosting is implemented via raw client.fetch calls (no dedicated Scaleway SDK
 * package), so these contract tests validate the zod parameter schemas exposed by the
 * MCP tools plus the documented response entity shapes (Hosting, Offer, ControlPanel,
 * DnsRecord) defined in src/tools/webhosting/types.ts.
 */
import { createAdvancedClient, withProfile } from "@scaleway/sdk-client";
import { createScalewayClient } from "../../../src/shared/client.js";
import * as httpHandlers from "../../../src/tools/webhosting/handlers.js";

import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
	ControlPanel,
	CreateHostingInput,
	DeleteHostingInput,
	DnsRecord,
	GetDnsRecordsInput,
	GetHostingInput,
	Hosting,
	HostingDnsStatus,
	HostingStatus,
	ListControlPanelsInput,
	ListHostingsInput,
	ListHostingsOrderBy,
	ListOffersInput,
	Offer,
	OfferQuotaWarning,
	RestoreHostingInput,
	UpdateHostingInput,
} from "../../../src/tools/webhosting/types.js";

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({ defaultRegion: "fr-par" })),
}));
vi.mock("../../../src/shared/client.js", () => ({ createScalewayClient: vi.fn() }));

// --- Shared fixtures ---

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_REGION = "fr-par";

const validHosting = {
	id: VALID_UUID,
	region: VALID_REGION,
	project_id: VALID_UUID,
	status: "ready" as const,
	platform_hostname: "node001.webhosting.fr-par.scw.cloud",
	platform_number: 1,
	offer_id: VALID_UUID,
	offer_name: "Personal",
	domain: "example.com",
	tags: ["prod"],
	updated_at: "2025-06-01T12:30:00Z",
	created_at: "2025-06-01T12:00:00Z",
	dns_status: "valid" as const,
	cpanel_urls: {
		dashboard: "https://cpanel.example.com",
		webmail: "https://webmail.example.com",
	},
	username: "user001",
	offer_end_date: "2026-06-01T00:00:00Z",
	contact_email: "owner@example.com",
	platform_group: "default",
	ipv4: "51.15.0.1",
	ipv6: "2001:bc8::1",
	protected: false,
	one_time_password: "otp-secret",
};

const validOffer = {
	id: VALID_UUID,
	billing_operation_path: "webhosting.hosting.personal",
	product: { name: "Personal", option: false },
	price: { currency_code: "EUR", units: 5, nanos: 0 },
	available: true,
	quota_warnings: [],
	end_of_life: false,
	control_panel_name: "cpanel",
};

const validControlPanel = {
	name: "cpanel",
	available: true,
	logo_url: "https://scaleway.com/cpanel.png",
};

const validDnsRecord = {
	name: "example.com",
	type: "A",
	ttl: 3600,
	value: "51.15.0.1",
	priority: 0,
	status: "valid",
};

// --- Enum contracts ---

describe("contract: HostingStatus enum", () => {
	it("accepts all documented statuses", () => {
		for (const s of [
			"unknown_status",
			"delivering",
			"ready",
			"deleting",
			"error",
			"locked",
			"migrating",
		]) {
			expect(() => HostingStatus.parse(s)).not.toThrow();
		}
	});

	it("rejects an invalid status", () => {
		expect(() => HostingStatus.parse("running")).toThrow();
	});
});

describe("contract: HostingDnsStatus enum", () => {
	it("accepts all documented DNS statuses", () => {
		for (const s of ["unknown_dns_status", "valid", "invalid", "pending"]) {
			expect(() => HostingDnsStatus.parse(s)).not.toThrow();
		}
	});

	it("rejects an invalid DNS status", () => {
		expect(() => HostingDnsStatus.parse("expired")).toThrow();
	});
});

describe("contract: ListHostingsOrderBy enum", () => {
	it("accepts documented order-by values", () => {
		for (const o of ["created_at_asc", "created_at_desc"]) {
			expect(() => ListHostingsOrderBy.parse(o)).not.toThrow();
		}
	});

	it("rejects an invalid order-by value", () => {
		expect(() => ListHostingsOrderBy.parse("name_asc")).toThrow();
	});
});

describe("contract: OfferQuotaWarning enum", () => {
	it("accepts all documented quota warnings", () => {
		for (const w of [
			"unknown_quota_warning",
			"email_count_exceeded",
			"database_count_exceeded",
			"disk_usage_exceeded",
		]) {
			expect(() => OfferQuotaWarning.parse(w)).not.toThrow();
		}
	});

	it("rejects an invalid quota warning", () => {
		expect(() => OfferQuotaWarning.parse("cpu_exceeded")).toThrow();
	});
});

// --- Request shape contracts ---

/**
 * API: GET /webhosting/v1/regions/{region}/hostings
 * Spec: specs/scaleway-api/webhosting/api-reference.md#list-hostings
 */
describe("contract: ListHostings request shape", () => {
	it("validates an empty request", () => {
		expect(() => ListHostingsInput.parse({})).not.toThrow();
	});

	it("applies default pagination", () => {
		const result = ListHostingsInput.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("validates a fully filtered request", () => {
		const input = {
			region: VALID_REGION,
			order_by: "created_at_desc",
			project_id: VALID_UUID,
			tags: ["prod"],
			statuses: ["ready", "migrating"],
			domain: "example.com",
			organization_id: VALID_UUID,
			control_panels: ["cpanel"],
			page: 2,
			pageSize: 25,
		};
		expect(() => ListHostingsInput.parse(input)).not.toThrow();
	});

	it("rejects an invalid status filter", () => {
		expect(() => ListHostingsInput.parse({ statuses: ["bogus"] })).toThrow();
	});

	it("rejects an invalid region format", () => {
		expect(() => ListHostingsInput.parse({ region: "invalid" })).toThrow();
	});
});

/**
 * API: GET /webhosting/v1/regions/{region}/hostings/{hosting_id}
 * Spec: specs/scaleway-api/webhosting/api-reference.md#get-hosting
 */
describe("contract: GetHosting request shape", () => {
	it("validates a get request", () => {
		expect(() => GetHostingInput.parse({ hosting_id: VALID_UUID })).not.toThrow();
	});

	it("rejects a request missing the hosting_id", () => {
		expect(() => GetHostingInput.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: POST /webhosting/v1/regions/{region}/hostings
 * Spec: specs/scaleway-api/webhosting/api-reference.md#create-hosting
 */
describe("contract: CreateHosting request shape", () => {
	it("validates a minimal create request", () => {
		expect(() =>
			CreateHostingInput.parse({ offer_id: VALID_UUID, domain: "example.com" }),
		).not.toThrow();
	});

	it("validates a full create request", () => {
		const input = {
			region: VALID_REGION,
			project_id: VALID_UUID,
			offer_id: VALID_UUID,
			domain: "example.com",
			tags: ["prod"],
			option_ids: [VALID_UUID],
			language: "fr_FR",
			domain_configuration: {
				update_nameservers: true,
				update_web_record: true,
				update_mail_record: false,
				update_all_records: false,
			},
			skip_welcome_email: true,
		};
		expect(() => CreateHostingInput.parse(input)).not.toThrow();
	});

	it("rejects a create request missing the offer_id", () => {
		expect(() => CreateHostingInput.parse({ domain: "example.com" })).toThrow();
	});

	it("rejects a create request missing the domain", () => {
		expect(() => CreateHostingInput.parse({ offer_id: VALID_UUID })).toThrow();
	});
});

/**
 * API: PATCH /webhosting/v1/regions/{region}/hostings/{hosting_id}
 * Spec: specs/scaleway-api/webhosting/api-reference.md#update-hosting
 */
describe("contract: UpdateHosting request shape", () => {
	it("validates an update with only the hosting_id", () => {
		expect(() => UpdateHostingInput.parse({ hosting_id: VALID_UUID })).not.toThrow();
	});

	it("validates an update with all optional fields", () => {
		const input = {
			region: VALID_REGION,
			hosting_id: VALID_UUID,
			email: "new@example.com",
			tags: ["x"],
			option_ids: [VALID_UUID],
			offer_id: VALID_UUID,
			protected: true,
		};
		expect(() => UpdateHostingInput.parse(input)).not.toThrow();
	});

	it("rejects an update missing the hosting_id", () => {
		expect(() => UpdateHostingInput.parse({ email: "x@example.com" })).toThrow();
	});
});

/**
 * API: DELETE /webhosting/v1/regions/{region}/hostings/{hosting_id}
 * Spec: specs/scaleway-api/webhosting/api-reference.md#delete-hosting
 */
describe("contract: DeleteHosting request shape", () => {
	it("validates a delete request", () => {
		expect(() => DeleteHostingInput.parse({ hosting_id: VALID_UUID })).not.toThrow();
	});

	it("rejects a delete missing the hosting_id", () => {
		expect(() => DeleteHostingInput.parse({})).toThrow();
	});
});

/**
 * API: POST /webhosting/v1/regions/{region}/hostings/{hosting_id}/restore
 * Spec: specs/scaleway-api/webhosting/api-reference.md#restore-hosting
 */
describe("contract: RestoreHosting request shape", () => {
	it("validates a restore request", () => {
		expect(() => RestoreHostingInput.parse({ hosting_id: VALID_UUID })).not.toThrow();
	});

	it("rejects a restore missing the hosting_id", () => {
		expect(() => RestoreHostingInput.parse({})).toThrow();
	});
});

/**
 * API: GET /webhosting/v1/regions/{region}/hostings/{hosting_id}/dns-records
 * Spec: specs/scaleway-api/webhosting/api-reference.md#get-dns-records
 */
describe("contract: GetDnsRecords request shape", () => {
	it("validates a get-dns-records request", () => {
		expect(() => GetDnsRecordsInput.parse({ hosting_id: VALID_UUID })).not.toThrow();
	});

	it("rejects a request missing the hosting_id", () => {
		expect(() => GetDnsRecordsInput.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: GET /webhosting/v1/regions/{region}/offers
 * Spec: specs/scaleway-api/webhosting/api-reference.md#list-offers
 */
describe("contract: ListOffers request shape", () => {
	it("validates an empty request", () => {
		expect(() => ListOffersInput.parse({})).not.toThrow();
	});

	it("validates a fully filtered request", () => {
		const input = {
			region: VALID_REGION,
			order_by: "price_asc",
			hosting_id: VALID_UUID,
			control_panels: ["cpanel"],
			without_options: true,
			only_options: false,
		};
		expect(() => ListOffersInput.parse(input)).not.toThrow();
	});

	it("rejects an invalid order-by value", () => {
		expect(() => ListOffersInput.parse({ order_by: "price_desc" })).toThrow();
	});
});

/**
 * API: GET /webhosting/v1/regions/{region}/control-panels
 * Spec: specs/scaleway-api/webhosting/api-reference.md#list-control-panels
 */
describe("contract: ListControlPanels request shape", () => {
	it("validates an empty request", () => {
		expect(() => ListControlPanelsInput.parse({})).not.toThrow();
	});

	it("validates a request with a region", () => {
		expect(() => ListControlPanelsInput.parse({ region: VALID_REGION })).not.toThrow();
	});

	it("rejects an invalid region format", () => {
		expect(() => ListControlPanelsInput.parse({ region: "bad" })).toThrow();
	});
});

// --- Response shape contracts ---

/**
 * Spec: specs/scaleway-api/webhosting/api-reference.md#hosting-entity
 */
describe("contract: Hosting response entity", () => {
	it("validates a full hosting", () => {
		expect(() => Hosting.parse(validHosting)).not.toThrow();
	});

	it("validates a minimal hosting (only required fields)", () => {
		const minimal = {
			id: VALID_UUID,
			region: VALID_REGION,
			project_id: VALID_UUID,
			status: "ready",
			platform_hostname: "node.scw.cloud",
			offer_id: VALID_UUID,
			offer_name: "Personal",
			domain: "example.com",
			tags: [],
			dns_status: "pending",
			username: "user001",
			contact_email: "owner@example.com",
			platform_group: "default",
		};
		expect(() => Hosting.parse(minimal)).not.toThrow();
	});

	it("validates all hosting statuses", () => {
		for (const status of [
			"unknown_status",
			"delivering",
			"ready",
			"deleting",
			"error",
			"locked",
			"migrating",
		]) {
			expect(() => Hosting.parse({ ...validHosting, status })).not.toThrow();
		}
	});

	it("rejects a hosting with an invalid dns_status", () => {
		expect(() => Hosting.parse({ ...validHosting, dns_status: "expired" })).toThrow();
	});

	it("rejects a hosting missing the id", () => {
		const { id, ...rest } = validHosting;
		void id;
		expect(() => Hosting.parse(rest)).toThrow();
	});
});

/**
 * Spec: specs/scaleway-api/webhosting/api-reference.md#offer-entity
 */
describe("contract: Offer response entity", () => {
	it("validates a full offer", () => {
		expect(() => Offer.parse(validOffer)).not.toThrow();
	});

	it("validates a minimal offer (only required fields)", () => {
		const minimal = {
			id: VALID_UUID,
			billing_operation_path: "webhosting.hosting.personal",
			available: true,
			end_of_life: false,
			control_panel_name: "cpanel",
		};
		expect(() => Offer.parse(minimal)).not.toThrow();
	});

	it("validates an offer with quota warnings", () => {
		expect(() =>
			Offer.parse({ ...validOffer, quota_warnings: ["disk_usage_exceeded"] }),
		).not.toThrow();
	});

	it("rejects an offer with an invalid quota warning", () => {
		expect(() => Offer.parse({ ...validOffer, quota_warnings: ["bad"] })).toThrow();
	});
});

/**
 * Spec: specs/scaleway-api/webhosting/api-reference.md#controlpanel-entity
 */
describe("contract: ControlPanel response entity", () => {
	it("validates a control panel", () => {
		expect(() => ControlPanel.parse(validControlPanel)).not.toThrow();
	});

	it("rejects a control panel missing the name", () => {
		const { name, ...rest } = validControlPanel;
		void name;
		expect(() => ControlPanel.parse(rest)).toThrow();
	});
});

/**
 * Spec: specs/scaleway-api/webhosting/api-reference.md#dnsrecord-entity
 */
describe("contract: DnsRecord response entity", () => {
	it("validates a full DNS record", () => {
		expect(() => DnsRecord.parse(validDnsRecord)).not.toThrow();
	});

	it("validates a DNS record without optional fields", () => {
		const minimal = { name: "example.com", type: "A", ttl: 3600, value: "51.15.0.1" };
		expect(() => DnsRecord.parse(minimal)).not.toThrow();
	});

	it("rejects a DNS record missing the value", () => {
		const { value, ...rest } = validDnsRecord;
		void value;
		expect(() => DnsRecord.parse(rest)).toThrow();
	});
});

// --- List response shape contracts ---

describe("contract: ListHostings response shape", () => {
	const ListHostingsResponse = z.object({
		hostings: z.array(Hosting),
		total_count: z.number().int(),
	});

	it("validates a list response", () => {
		expect(() =>
			ListHostingsResponse.parse({ hostings: [validHosting], total_count: 1 }),
		).not.toThrow();
	});

	it("validates an empty list response", () => {
		expect(() => ListHostingsResponse.parse({ hostings: [], total_count: 0 })).not.toThrow();
	});
});

describe("contract: ListOffers response shape", () => {
	const ListOffersResponse = z.object({ offers: z.array(Offer) });

	it("validates an offers response", () => {
		expect(() => ListOffersResponse.parse({ offers: [validOffer] })).not.toThrow();
	});
});

describe("contract: ListControlPanels response shape", () => {
	const ListControlPanelsResponse = z.object({
		control_panels: z.array(ControlPanel),
		total_count: z.number().int().optional(),
	});

	it("validates a control panels response", () => {
		expect(() =>
			ListControlPanelsResponse.parse({ control_panels: [validControlPanel], total_count: 1 }),
		).not.toThrow();
	});
});

describe("contract: GetDnsRecords response shape", () => {
	const DnsRecordsResponse = z.object({
		records: z.array(DnsRecord).optional(),
		name_servers: z
			.array(z.object({ hostname: z.string(), is_default: z.boolean().optional() }))
			.optional(),
	});

	it("validates a DNS records response", () => {
		expect(() =>
			DnsRecordsResponse.parse({
				records: [validDnsRecord],
				name_servers: [{ hostname: "ns0.example.com", is_default: true }],
			}),
		).not.toThrow();
	});
});

// --- Pagination contracts ---

describe("contract: pagination parameters", () => {
	it("accepts custom pagination", () => {
		const result = ListHostingsInput.parse({ page: 3, pageSize: 25 });
		expect(result.page).toBe(3);
		expect(result.pageSize).toBe(25);
	});

	it("rejects a page size over 100", () => {
		expect(() => ListHostingsInput.parse({ pageSize: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListHostingsInput.parse({ page: 0 })).toThrow();
	});
});

// --- Region contract ---

describe("contract: region targeting", () => {
	it("treats region as optional (falls back to config default)", () => {
		expect(() => GetHostingInput.parse({ hosting_id: VALID_UUID })).not.toThrow();
		expect(() => ListControlPanelsInput.parse({})).not.toThrow();
	});

	it("validates region format when supplied (xx-xxx)", () => {
		expect(() => ListHostingsInput.parse({ region: "fr-par" })).not.toThrow();
		expect(() => ListHostingsInput.parse({ region: "not-a-region" })).toThrow();
	});
});

// Exercise the installed SDK's Request construction, JSON parsing, and real HTTP errors.
// Only the HTTP transport is replaced: no environment credentials or network calls.
describe("SDK HTTP request contracts", () => {
	function recordingClient(
		response: unknown = { id: "http-response", status: "ready" },
		status = 200,
	) {
		const requests: Request[] = [];
		const client = createAdvancedClient(
			withProfile({
				accessKey: "SCWXXXXXXXXXXXXXXXXX",
				secretKey: "00000000-0000-0000-0000-000000000000",
			}),
			(settings) => ({
				...settings,
				apiURL: "https://scaleway.invalid",
				httpClient: (async (input: RequestInfo | URL, init?: RequestInit) => {
					requests.push(new Request(input, init));
					return new Response(status === 204 ? null : JSON.stringify(response), {
						status,
						headers: { "Content-Type": "application/json" },
					});
				}) as typeof fetch,
			}),
		);
		vi.mocked(createScalewayClient).mockReturnValue(client);
		return { client, requests };
	}

	const jsonCases = [
		{
			name: "CreateHosting",
			method: "POST",
			path: "/webhosting/v1/regions/fr-par/hostings",
			call: () =>
				httpHandlers.handleCreateHosting({
					region: "fr-par",
					offer_id: "11111111-1111-1111-1111-111111111111",
					domain: "example.test",
					skip_welcome_email: false,
				}),
			body: {
				offer_id: "11111111-1111-1111-1111-111111111111",
				domain: "example.test",
				skip_welcome_email: false,
			},
		},
		{
			name: "UpdateHosting",
			method: "PATCH",
			path: "/webhosting/v1/regions/fr-par/hostings/11111111-1111-1111-1111-111111111111",
			call: () =>
				httpHandlers.handleUpdateHosting({
					region: "fr-par",
					hosting_id: "11111111-1111-1111-1111-111111111111",
					protected: false,
					tags: [],
				}),
			body: { protected: false, tags: [] },
		},
	];

	it.each(jsonCases)(
		"$name: $method $path sends application/json",
		async ({ call, method, path, body }) => {
			const response = { id: "http-response", status: "ready" };
			const { requests } = recordingClient(response);
			const result = await call();
			expect(requests).toHaveLength(1);
			const [request] = requests;
			expect(request.url).toBe(`https://scaleway.invalid${path}`);
			expect(request.method).toBe(method);
			expect(request.headers.get("Content-Type")).toBe("application/json");
			expect(request.headers.get("Accept")).toBe("application/json");
			expect(request.headers.get("X-Auth-Token")).toBe("00000000-0000-0000-0000-000000000000");
			expect(JSON.parse(await request.text())).toEqual(body);
			expect(result).toEqual({
				content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
			});
		},
	);

	it.each([
		[400, "invalid_input"],
		[401, "permission_denied"],
		[403, "permission_denied"],
		[404, "not_found"],
		[429, "rate_limited"],
		[500, "server_error"],
	] as const)("maps SDK HTTP %i errors to %s", async (status, type) => {
		const { requests } = recordingClient({ message: "HTTP contract error" }, status);
		const result = await jsonCases[0].call();
		expect(requests).toHaveLength(1);
		expect(result).toMatchObject({ isError: true });
		expect(JSON.parse(result.content[0].text)).toMatchObject({
			error: { type, statusCode: status },
		});
	});

	// These DELETE endpoints return HTTP 200 JSON resource bodies, not HTTP 204.
	it("DeleteHosting preserves the HTTP 200 resource response", async () => {
		const response = { id: "11111111-1111-1111-1111-111111111111", status: "deleting" };
		const { requests } = recordingClient(response);
		const result = await httpHandlers.handleDeleteHosting({
			region: "fr-par",
			hosting_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(requests).toHaveLength(1);
		expect(requests[0].method).toBe("DELETE");
		expect(new URL(requests[0].url).pathname).toBe(
			"/webhosting/v1/regions/fr-par/hostings/11111111-1111-1111-1111-111111111111",
		);
		expect(requests[0].body).toBeNull();
		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
		});
	});
});
