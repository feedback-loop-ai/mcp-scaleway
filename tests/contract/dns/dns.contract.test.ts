/**
 * Contract tests for Scaleway Domains & DNS API
 *
 * Validates request/response shapes against specs/scaleway-api/dns/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * API base: https://api.scaleway.com/domain/v2beta1
 */
import { createAdvancedClient, withProfile } from "@scaleway/sdk-client";
import { createScalewayClient } from "../../../src/shared/client.js";
import * as httpHandlers from "../../../src/tools/dns/handlers.js";

import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
	ClearDnsRecordsParams,
	CloneDnsZoneParams,
	CreateDnsZoneParams,
	CreateSslCertificateParams,
	DeleteDnsZoneParams,
	DeleteSslCertificateParams,
	DeleteTsigKeyParams,
	ExportRawDnsZoneParams,
	GetSslCertificateParams,
	GetTsigKeyParams,
	ImportRawDnsZoneParams,
	ListDnsRecordsParams,
	ListDnsZonesParams,
	ListNameserversParams,
	RecordChange,
	RecordInput,
	RecordType,
	RefreshDnsZoneParams,
	UpdateDnsRecordsParams,
	UpdateDnsZoneParams,
	UpdateNameserversParams,
} from "../../../src/tools/dns/types.js";

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({ defaultRegion: "fr-par" })),
}));
vi.mock("../../../src/shared/client.js", () => ({ createScalewayClient: vi.fn() }));

// --- Shared fixtures ---

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const ZONE = "example.com";

// --- Response shape contracts (documented Scaleway shapes) ---

const DnsZone = z.object({
	domain: z.string(),
	subdomain: z.string(),
	ns: z.array(z.string()),
	ns_default: z.array(z.string()),
	ns_master: z.array(z.string()),
	status: z.string(),
	message: z.string().nullable(),
	updated_at: z.string(),
	project_id: z.string(),
});

const DnsRecord = z.object({
	id: z.string(),
	name: z.string(),
	type: z.string(),
	data: z.string(),
	ttl: z.number().int(),
	priority: z.number().int().optional(),
	comment: z.string().nullable().optional(),
});

const validZone = {
	domain: "example.com",
	subdomain: "",
	ns: ["ns0.dom.scw.cloud", "ns1.dom.scw.cloud"],
	ns_default: ["ns0.dom.scw.cloud"],
	ns_master: [],
	status: "active",
	message: null,
	updated_at: "2025-06-01T12:00:00Z",
	project_id: VALID_UUID,
};

const validRecord = {
	id: VALID_UUID,
	name: "www",
	type: "A",
	data: "1.2.3.4",
	ttl: 300,
	priority: 0,
};

/**
 * API: GET /domain/v2beta1/dns-zones
 * Spec: specs/scaleway-api/dns/api-reference.md#list-dns-zones
 */
describe("contract: ListDnsZones", () => {
	const ListDnsZonesResponse = z.object({
		dns_zones: z.array(DnsZone),
		total_count: z.number().int(),
	});

	it("validates a list dns zones response", () => {
		const response = { dns_zones: [validZone], total_count: 1 };
		expect(() => ListDnsZonesResponse.parse(response)).not.toThrow();
	});

	it("validates empty response", () => {
		expect(() => ListDnsZonesResponse.parse({ dns_zones: [], total_count: 0 })).not.toThrow();
	});

	it("validates minimal request", () => {
		expect(() => ListDnsZonesParams.parse({})).not.toThrow();
	});

	it("validates request with all filters", () => {
		const input = {
			domain: "example.com",
			project_id: VALID_UUID,
			order_by: "domain_asc",
			dns_zones: "example.com,test.com",
			page: 2,
			pageSize: 25,
		};
		expect(() => ListDnsZonesParams.parse(input)).not.toThrow();
	});

	it("rejects invalid order_by", () => {
		expect(() => ListDnsZonesParams.parse({ order_by: "bogus" })).toThrow();
	});
});

/**
 * API: POST /domain/v2beta1/dns-zones
 * Spec: specs/scaleway-api/dns/api-reference.md#create-dns-zone
 */
describe("contract: CreateDnsZone", () => {
	it("validates minimal create (subdomain defaults to empty)", () => {
		const result = CreateDnsZoneParams.parse({ domain: "example.com", project_id: VALID_UUID });
		expect(result.subdomain).toBe("");
	});

	it("validates full create", () => {
		const input = { domain: "example.com", subdomain: "sub", project_id: VALID_UUID };
		expect(() => CreateDnsZoneParams.parse(input)).not.toThrow();
	});

	it("rejects missing project_id", () => {
		expect(() => CreateDnsZoneParams.parse({ domain: "example.com" })).toThrow();
	});

	it("rejects empty domain", () => {
		expect(() => CreateDnsZoneParams.parse({ domain: "", project_id: VALID_UUID })).toThrow();
	});
});

/**
 * API: PATCH /domain/v2beta1/dns-zones/{dns_zone}
 * Spec: specs/scaleway-api/dns/api-reference.md#update-dns-zone
 */
describe("contract: UpdateDnsZone", () => {
	it("validates update with new zone and project", () => {
		const input = { dns_zone: ZONE, new_dns_zone: "new.example.com", project_id: VALID_UUID };
		expect(() => UpdateDnsZoneParams.parse(input)).not.toThrow();
	});

	it("validates update with only zone", () => {
		expect(() => UpdateDnsZoneParams.parse({ dns_zone: ZONE })).not.toThrow();
	});

	it("rejects missing dns_zone", () => {
		expect(() => UpdateDnsZoneParams.parse({})).toThrow();
	});
});

/**
 * API: DELETE /domain/v2beta1/dns-zones/{dns_zone}
 * Spec: specs/scaleway-api/dns/api-reference.md#delete-dns-zone
 */
describe("contract: DeleteDnsZone", () => {
	it("validates delete request", () => {
		expect(() =>
			DeleteDnsZoneParams.parse({ dns_zone: ZONE, project_id: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects missing project_id", () => {
		expect(() => DeleteDnsZoneParams.parse({ dns_zone: ZONE })).toThrow();
	});
});

/**
 * API: POST /domain/v2beta1/dns-zones/{dns_zone}/clone
 * Spec: specs/scaleway-api/dns/api-reference.md#clone-dns-zone
 */
describe("contract: CloneDnsZone", () => {
	it("applies overwrite default", () => {
		const result = CloneDnsZoneParams.parse({ dns_zone: ZONE, dest_dns_zone: "copy.example.com" });
		expect(result.overwrite).toBe(false);
	});

	it("validates full clone", () => {
		const input = {
			dns_zone: ZONE,
			dest_dns_zone: "copy.example.com",
			overwrite: true,
			project_id: VALID_UUID,
		};
		expect(() => CloneDnsZoneParams.parse(input)).not.toThrow();
	});

	it("rejects missing dest_dns_zone", () => {
		expect(() => CloneDnsZoneParams.parse({ dns_zone: ZONE })).toThrow();
	});
});

/**
 * API: POST /domain/v2beta1/dns-zones/{dns_zone}/refresh
 * Spec: specs/scaleway-api/dns/api-reference.md#refresh-dns-zone
 */
describe("contract: RefreshDnsZone", () => {
	it("applies recreate defaults", () => {
		const result = RefreshDnsZoneParams.parse({ dns_zone: ZONE });
		expect(result.recreate_dns_zone).toBe(false);
		expect(result.recreate_sub_dns_zone).toBe(false);
	});

	it("validates explicit recreate flags", () => {
		const input = { dns_zone: ZONE, recreate_dns_zone: true, recreate_sub_dns_zone: true };
		expect(() => RefreshDnsZoneParams.parse(input)).not.toThrow();
	});
});

/**
 * API: GET /domain/v2beta1/dns-zones/{dns_zone}/records
 * Spec: specs/scaleway-api/dns/api-reference.md#list-dns-records
 */
describe("contract: ListDnsRecords", () => {
	const ListDnsRecordsResponse = z.object({
		records: z.array(DnsRecord),
		total_count: z.number().int(),
	});

	it("validates a records response", () => {
		expect(() =>
			ListDnsRecordsResponse.parse({ records: [validRecord], total_count: 1 }),
		).not.toThrow();
	});

	it("validates request with all filters", () => {
		const input = {
			dns_zone: ZONE,
			name: "www",
			type: "A",
			id: VALID_UUID,
			project_id: VALID_UUID,
			order_by: "name_asc",
		};
		expect(() => ListDnsRecordsParams.parse(input)).not.toThrow();
	});

	it("rejects missing dns_zone", () => {
		expect(() => ListDnsRecordsParams.parse({})).toThrow();
	});

	it("rejects invalid record type filter", () => {
		expect(() => ListDnsRecordsParams.parse({ dns_zone: ZONE, type: "BOGUS" })).toThrow();
	});
});

/**
 * API: PATCH /domain/v2beta1/dns-zones/{dns_zone}/records
 * Spec: specs/scaleway-api/dns/api-reference.md#update-dns-records
 */
describe("contract: UpdateDnsRecords", () => {
	it("validates add change", () => {
		const input = {
			dns_zone: ZONE,
			changes: [{ add: { records: [{ name: "www", type: "A", data: "1.2.3.4", ttl: 300 }] } }],
		};
		expect(() => UpdateDnsRecordsParams.parse(input)).not.toThrow();
	});

	it("validates set change", () => {
		const input = {
			dns_zone: ZONE,
			changes: [
				{
					set: {
						id_fields: { name: "www", type: "A" },
						records: [{ name: "www", type: "A", data: "5.6.7.8", ttl: 60 }],
					},
				},
			],
		};
		expect(() => UpdateDnsRecordsParams.parse(input)).not.toThrow();
	});

	it("validates delete change by id", () => {
		const input = { dns_zone: ZONE, changes: [{ delete: { id: VALID_UUID } }] };
		expect(() => UpdateDnsRecordsParams.parse(input)).not.toThrow();
	});

	it("validates clear change with defaults applied", () => {
		const result = UpdateDnsRecordsParams.parse({ dns_zone: ZONE, changes: [{ clear: {} }] });
		expect(result.disallow_new_zone_creation).toBe(false);
		expect(result.return_all_records).toBe(false);
	});

	it("validates full options", () => {
		const input = {
			dns_zone: ZONE,
			changes: [{ clear: {} }],
			disallow_new_zone_creation: true,
			return_all_records: true,
			serial: 42,
		};
		expect(() => UpdateDnsRecordsParams.parse(input)).not.toThrow();
	});

	it("rejects empty changes array", () => {
		expect(() => UpdateDnsRecordsParams.parse({ dns_zone: ZONE, changes: [] })).toThrow();
	});
});

/**
 * API: DELETE /domain/v2beta1/dns-zones/{dns_zone}/records
 * Spec: specs/scaleway-api/dns/api-reference.md#clear-dns-records
 */
describe("contract: ClearDnsRecords", () => {
	it("validates clear request", () => {
		expect(() => ClearDnsRecordsParams.parse({ dns_zone: ZONE })).not.toThrow();
	});

	it("rejects empty dns_zone", () => {
		expect(() => ClearDnsRecordsParams.parse({ dns_zone: "" })).toThrow();
	});
});

/**
 * API: GET /domain/v2beta1/dns-zones/{dns_zone}/raw (export)
 * Spec: specs/scaleway-api/dns/api-reference.md#export-raw-dns-zone
 */
describe("contract: ExportRawDnsZone", () => {
	it("applies format default of bind", () => {
		const result = ExportRawDnsZoneParams.parse({ dns_zone: ZONE });
		expect(result.format).toBe("bind");
	});

	it("rejects invalid format", () => {
		expect(() => ExportRawDnsZoneParams.parse({ dns_zone: ZONE, format: "yaml" })).toThrow();
	});
});

/**
 * API: POST /domain/v2beta1/dns-zones/{dns_zone}/raw (import)
 * Spec: specs/scaleway-api/dns/api-reference.md#import-raw-dns-zone
 */
describe("contract: ImportRawDnsZone", () => {
	it("validates import request", () => {
		const input = { dns_zone: ZONE, content: "$ORIGIN example.com.", project_id: VALID_UUID };
		expect(() => ImportRawDnsZoneParams.parse(input)).not.toThrow();
	});

	it("rejects empty content", () => {
		expect(() => ImportRawDnsZoneParams.parse({ dns_zone: ZONE, content: "" })).toThrow();
	});
});

/**
 * API: GET /domain/v2beta1/dns-zones/{dns_zone}/nameservers
 * Spec: specs/scaleway-api/dns/api-reference.md#list-nameservers
 */
describe("contract: ListNameservers", () => {
	const ListNameserversResponse = z.object({
		ns: z.array(z.object({ name: z.string(), ip: z.array(z.string()).optional() })),
	});

	it("validates nameservers response", () => {
		const response = { ns: [{ name: "ns0.dom.scw.cloud", ip: ["1.2.3.4"] }] };
		expect(() => ListNameserversResponse.parse(response)).not.toThrow();
	});

	it("validates request with project filter", () => {
		expect(() =>
			ListNameserversParams.parse({ dns_zone: ZONE, project_id: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects missing dns_zone", () => {
		expect(() => ListNameserversParams.parse({})).toThrow();
	});
});

/**
 * API: PUT /domain/v2beta1/dns-zones/{dns_zone}/nameservers
 * Spec: specs/scaleway-api/dns/api-reference.md#update-nameservers
 */
describe("contract: UpdateNameservers", () => {
	it("validates update with nameservers", () => {
		const input = {
			dns_zone: ZONE,
			ns: [{ name: "ns0.example.com", ip: ["1.2.3.4"] }, { name: "ns1.example.com" }],
		};
		expect(() => UpdateNameserversParams.parse(input)).not.toThrow();
	});

	it("rejects empty ns array", () => {
		expect(() => UpdateNameserversParams.parse({ dns_zone: ZONE, ns: [] })).toThrow();
	});
});

/**
 * API: GET/POST/DELETE /domain/v2beta1/ssl-certificates (TLS certificate)
 * Spec: specs/scaleway-api/dns/api-reference.md#ssl-certificates
 */
describe("contract: SSL certificates", () => {
	it("validates get request", () => {
		expect(() => GetSslCertificateParams.parse({ dns_zone: ZONE })).not.toThrow();
	});

	it("applies alternative_dns_zones default on create", () => {
		const result = CreateSslCertificateParams.parse({ dns_zone: ZONE });
		expect(result.alternative_dns_zones).toEqual([]);
	});

	it("validates create with alternative zones", () => {
		const input = { dns_zone: ZONE, alternative_dns_zones: ["alt.example.com"] };
		expect(() => CreateSslCertificateParams.parse(input)).not.toThrow();
	});

	it("validates delete request", () => {
		expect(() => DeleteSslCertificateParams.parse({ dns_zone: ZONE })).not.toThrow();
	});
});

/**
 * API: GET/DELETE /domain/v2beta1/dns-zones/{dns_zone}/tsig-key
 * Spec: specs/scaleway-api/dns/api-reference.md#tsig-keys
 */
describe("contract: TSIG keys", () => {
	it("validates get request", () => {
		expect(() => GetTsigKeyParams.parse({ dns_zone: ZONE })).not.toThrow();
	});

	it("validates delete request", () => {
		expect(() => DeleteTsigKeyParams.parse({ dns_zone: ZONE })).not.toThrow();
	});

	it("rejects empty dns_zone", () => {
		expect(() => GetTsigKeyParams.parse({ dns_zone: "" })).toThrow();
	});
});

// --- Enum & entity contracts ---

describe("contract: RecordType enum", () => {
	it("accepts all documented record types", () => {
		for (const t of [
			"A",
			"AAAA",
			"CNAME",
			"TXT",
			"SRV",
			"TLSA",
			"MX",
			"NS",
			"CAA",
			"DNAME",
			"HTTPS",
			"SVCB",
		]) {
			expect(() => RecordType.parse(t)).not.toThrow();
		}
	});

	it("rejects unknown record type", () => {
		expect(() => RecordType.parse("BOGUS")).toThrow();
	});
});

describe("contract: RecordInput shape", () => {
	it("validates a full record input", () => {
		const input = {
			name: "www",
			type: "MX",
			data: "mail.example.com",
			ttl: 300,
			priority: 10,
			comment: "primary",
		};
		expect(() => RecordInput.parse(input)).not.toThrow();
	});

	it("rejects ttl below 60", () => {
		expect(() => RecordInput.parse({ name: "www", type: "A", data: "1.2.3.4", ttl: 30 })).toThrow();
	});
});

describe("contract: RecordChange union", () => {
	it("accepts add/set/delete/clear variants", () => {
		expect(() =>
			RecordChange.parse({
				add: { records: [{ name: "a", type: "A", data: "1.2.3.4", ttl: 60 }] },
			}),
		).not.toThrow();
		expect(() =>
			RecordChange.parse({
				set: {
					id_fields: { name: "a", type: "A" },
					records: [{ name: "a", type: "A", data: "1.2.3.4", ttl: 60 }],
				},
			}),
		).not.toThrow();
		expect(() =>
			RecordChange.parse({ delete: { id_fields: { name: "a", type: "A" } } }),
		).not.toThrow();
		expect(() => RecordChange.parse({ clear: {} })).not.toThrow();
	});
});

// --- Pagination contract ---

describe("contract: pagination", () => {
	it("applies default pagination on list zones", () => {
		const result = ListDnsZonesParams.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("rejects page size over 100", () => {
		expect(() => ListDnsRecordsParams.parse({ dns_zone: ZONE, pageSize: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListDnsZonesParams.parse({ page: 0 })).toThrow();
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
			name: "CreateDnsZone",
			method: "POST",
			path: "/domain/v2beta1/dns-zones",
			call: () =>
				httpHandlers.handleCreateDnsZone({
					domain: "example.test",
					subdomain: "",
					project_id: "11111111-1111-1111-1111-111111111111",
				}),
			body: {
				domain: "example.test",
				subdomain: "",
				project_id: "11111111-1111-1111-1111-111111111111",
			},
		},
		{
			name: "UpdateDnsZone",
			method: "PATCH",
			path: "/domain/v2beta1/dns-zones/example.test",
			call: () =>
				httpHandlers.handleUpdateDnsZone({
					dns_zone: "example.test",
					new_dns_zone: "sub.example.test",
				}),
			body: { new_dns_zone: "sub.example.test" },
		},
		{
			name: "CloneDnsZone",
			method: "POST",
			path: "/domain/v2beta1/dns-zones/example.test/clone",
			call: () =>
				httpHandlers.handleCloneDnsZone({
					dns_zone: "example.test",
					dest_dns_zone: "copy.test",
					overwrite: false,
				}),
			body: { dest_dns_zone: "copy.test", overwrite: false },
		},
		{
			name: "RefreshDnsZone",
			method: "POST",
			path: "/domain/v2beta1/dns-zones/example.test/refresh",
			call: () =>
				httpHandlers.handleRefreshDnsZone({
					dns_zone: "example.test",
					recreate_dns_zone: false,
					recreate_sub_dns_zone: false,
				}),
			body: { recreate_dns_zone: false, recreate_sub_dns_zone: false },
		},
		{
			name: "UpdateDnsRecords",
			method: "PATCH",
			path: "/domain/v2beta1/dns-zones/example.test/records",
			call: () =>
				httpHandlers.handleUpdateDnsRecords({
					dns_zone: "example.test",
					changes: [{ clear: {} }],
					disallow_new_zone_creation: true,
					return_all_records: false,
					serial: 0,
				}),
			body: {
				changes: [{ clear: {} }],
				disallow_new_zone_creation: true,
				return_all_records: false,
				serial: 0,
			},
		},
		{
			name: "ImportRawDnsZone",
			method: "POST",
			path: "/domain/v2beta1/dns-zones/example.test/raw",
			call: () =>
				httpHandlers.handleImportRawDnsZone({
					dns_zone: "example.test",
					content: "@ 3600 IN A 192.0.2.1",
				}),
			body: { bind_source: { content: "@ 3600 IN A 192.0.2.1" } },
		},
		{
			name: "UpdateNameservers",
			method: "PUT",
			path: "/domain/v2beta1/dns-zones/example.test/nameservers",
			call: () =>
				httpHandlers.handleUpdateNameservers({
					dns_zone: "example.test",
					ns: [{ name: "ns.example.test", ip: ["192.0.2.1"] }],
				}),
			body: { ns: [{ name: "ns.example.test", ip: ["192.0.2.1"] }] },
		},
		{
			name: "CreateSslCertificate",
			method: "POST",
			path: "/domain/v2beta1/ssl-certificates",
			call: () =>
				httpHandlers.handleCreateSslCertificate({
					dns_zone: "example.test",
					alternative_dns_zones: [],
				}),
			body: { dns_zone: "example.test", alternative_dns_zones: [] },
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
});
