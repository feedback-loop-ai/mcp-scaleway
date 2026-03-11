import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as authModule from "../../../src/shared/auth.js";
import * as clientModule from "../../../src/shared/client.js";
import * as handlers from "../../../src/tools/dns/handlers.js";
import { registerDnsTools } from "../../../src/tools/dns/index.js";

// Mock the auth and client modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWTEST1234567890123",
		secretKey: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
		defaultProjectId: "11111111-1111-1111-1111-111111111111",
		defaultOrganizationId: "22222222-2222-2222-2222-222222222222",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	})),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn(() => ({ fetch: mockFetch })),
	resetClient: vi.fn(),
}));

describe("dns module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerDnsTools(server)).not.toThrow();
	});

	it("registers all 18 DNS tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerDnsTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(18);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toEqual([
			"scaleway_dns_list_zones",
			"scaleway_dns_create_zone",
			"scaleway_dns_update_zone",
			"scaleway_dns_delete_zone",
			"scaleway_dns_clone_zone",
			"scaleway_dns_refresh_zone",
			"scaleway_dns_list_records",
			"scaleway_dns_update_records",
			"scaleway_dns_clear_records",
			"scaleway_dns_export_raw_zone",
			"scaleway_dns_import_raw_zone",
			"scaleway_dns_list_nameservers",
			"scaleway_dns_update_nameservers",
			"scaleway_dns_get_ssl_certificate",
			"scaleway_dns_create_ssl_certificate",
			"scaleway_dns_delete_ssl_certificate",
			"scaleway_dns_get_tsig_key",
			"scaleway_dns_delete_tsig_key",
		]);
	});
});

describe("dns handlers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- DNS Zones ---

	describe("handleListDnsZones", () => {
		it("returns paginated DNS zones", async () => {
			mockFetch.mockResolvedValueOnce({
				dns_zones: [
					{
						domain: "example.com",
						subdomain: "",
						ns: ["ns1.example.com"],
						ns_default: ["ns0.dom.scw.cloud"],
						ns_master: [],
						status: "active",
						project_id: "11111111-1111-1111-1111-111111111111",
						updated_at: "2025-01-01T00:00:00Z",
					},
				],
				total_count: 1,
			});

			const result = await handlers.handleListDnsZones({
				page: 1,
				pageSize: 50,
			});

			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.items[0].domain).toBe("example.com");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/domain/v2beta1/dns-zones",
				}),
			);
		});

		it("passes optional filters", async () => {
			mockFetch.mockResolvedValueOnce({ dns_zones: [], total_count: 0 });

			await handlers.handleListDnsZones({
				page: 1,
				pageSize: 10,
				domain: "example.com",
				project_id: "11111111-1111-1111-1111-111111111111",
				order_by: "domain_asc",
				dns_zones: "a.example.com,b.example.com",
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("domain")).toBe("example.com");
			expect(call.urlParams.get("project_id")).toBe("11111111-1111-1111-1111-111111111111");
			expect(call.urlParams.get("order_by")).toBe("domain_asc");
			expect(call.urlParams.get("dns_zones")).toBe("a.example.com,b.example.com");
		});

		it("returns error on API failure", async () => {
			const error = new Error("Forbidden");
			Object.assign(error, { statusCode: 403 });
			mockFetch.mockRejectedValueOnce(error);

			const result = await handlers.handleListDnsZones({ page: 1, pageSize: 50 });
			expect((result as Record<string, unknown>).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleCreateDnsZone", () => {
		it("creates a DNS zone", async () => {
			mockFetch.mockResolvedValueOnce({
				domain: "example.com",
				subdomain: "",
				status: "pending",
			});

			const result = await handlers.handleCreateDnsZone({
				domain: "example.com",
				subdomain: "",
				project_id: "11111111-1111-1111-1111-111111111111",
			});

			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.domain).toBe("example.com");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/domain/v2beta1/dns-zones",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Bad request"));

			const result = await handlers.handleCreateDnsZone({
				domain: "example.com",
				subdomain: "",
				project_id: "11111111-1111-1111-1111-111111111111",
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleUpdateDnsZone", () => {
		it("updates a DNS zone", async () => {
			mockFetch.mockResolvedValueOnce({ domain: "example.com", subdomain: "new" });

			const result = await handlers.handleUpdateDnsZone({
				dns_zone: "example.com",
				new_dns_zone: "new.example.com",
				project_id: "11111111-1111-1111-1111-111111111111",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.subdomain).toBe("new");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "PATCH",
					path: "/domain/v2beta1/dns-zones/example.com",
				}),
			);
		});

		it("sends only provided fields in body", async () => {
			mockFetch.mockResolvedValueOnce({ domain: "example.com" });

			await handlers.handleUpdateDnsZone({
				dns_zone: "example.com",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toEqual({});
		});

		it("returns error on failure", async () => {
			const error = new Error("Not found");
			Object.assign(error, { statusCode: 404 });
			mockFetch.mockRejectedValueOnce(error);

			const result = await handlers.handleUpdateDnsZone({ dns_zone: "missing.com" });
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleDeleteDnsZone", () => {
		it("deletes a DNS zone", async () => {
			mockFetch.mockResolvedValueOnce(undefined);

			const result = await handlers.handleDeleteDnsZone({
				dns_zone: "example.com",
				project_id: "11111111-1111-1111-1111-111111111111",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("deleted");
			expect(parsed.dns_zone).toBe("example.com");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: "/domain/v2beta1/dns-zones/example.com",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Server error"));

			const result = await handlers.handleDeleteDnsZone({
				dns_zone: "example.com",
				project_id: "11111111-1111-1111-1111-111111111111",
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleCloneDnsZone", () => {
		it("clones a DNS zone", async () => {
			mockFetch.mockResolvedValueOnce({
				domain: "clone.example.com",
				status: "pending",
			});

			const result = await handlers.handleCloneDnsZone({
				dns_zone: "example.com",
				dest_dns_zone: "clone.example.com",
				overwrite: false,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.domain).toBe("clone.example.com");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/domain/v2beta1/dns-zones/example.com/clone",
				}),
			);
		});

		it("passes project_id when provided", async () => {
			mockFetch.mockResolvedValueOnce({});

			await handlers.handleCloneDnsZone({
				dns_zone: "example.com",
				dest_dns_zone: "clone.example.com",
				overwrite: true,
				project_id: "11111111-1111-1111-1111-111111111111",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project_id).toBe("11111111-1111-1111-1111-111111111111");
			expect(body.overwrite).toBe(true);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleCloneDnsZone({
				dns_zone: "example.com",
				dest_dns_zone: "clone.example.com",
				overwrite: false,
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleRefreshDnsZone", () => {
		it("refreshes a DNS zone", async () => {
			mockFetch.mockResolvedValueOnce({ domain: "example.com", status: "active" });

			const result = await handlers.handleRefreshDnsZone({
				dns_zone: "example.com",
				recreate_dns_zone: false,
				recreate_sub_dns_zone: false,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("active");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/domain/v2beta1/dns-zones/example.com/refresh",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleRefreshDnsZone({
				dns_zone: "example.com",
				recreate_dns_zone: false,
				recreate_sub_dns_zone: false,
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	// --- DNS Records ---

	describe("handleListDnsRecords", () => {
		it("returns paginated records", async () => {
			mockFetch.mockResolvedValueOnce({
				records: [
					{
						id: "rec-1",
						name: "www",
						type: "A",
						data: "1.2.3.4",
						ttl: 300,
						priority: 0,
						comment: "",
					},
				],
				total_count: 1,
			});

			const result = await handlers.handleListDnsRecords({
				dns_zone: "example.com",
				page: 1,
				pageSize: 50,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items[0].name).toBe("www");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/domain/v2beta1/dns-zones/example.com/records",
				}),
			);
		});

		it("passes optional filters", async () => {
			mockFetch.mockResolvedValueOnce({ records: [], total_count: 0 });

			await handlers.handleListDnsRecords({
				dns_zone: "example.com",
				page: 1,
				pageSize: 10,
				name: "www",
				type: "A",
				id: "rec-1",
				project_id: "11111111-1111-1111-1111-111111111111",
				order_by: "name_asc",
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("name")).toBe("www");
			expect(call.urlParams.get("type")).toBe("A");
			expect(call.urlParams.get("id")).toBe("rec-1");
			expect(call.urlParams.get("order_by")).toBe("name_asc");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleListDnsRecords({
				dns_zone: "example.com",
				page: 1,
				pageSize: 50,
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleUpdateDnsRecords", () => {
		it("batch updates DNS records", async () => {
			mockFetch.mockResolvedValueOnce({
				records: [{ id: "rec-1", name: "www", type: "A", data: "1.2.3.4", ttl: 300 }],
			});

			const result = await handlers.handleUpdateDnsRecords({
				dns_zone: "example.com",
				changes: [
					{
						add: {
							records: [{ name: "www", type: "A", data: "1.2.3.4", ttl: 300 }],
						},
					},
				],
				disallow_new_zone_creation: false,
				return_all_records: false,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.records).toHaveLength(1);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "PATCH",
					path: "/domain/v2beta1/dns-zones/example.com/records",
				}),
			);
		});

		it("passes serial for conflict detection", async () => {
			mockFetch.mockResolvedValueOnce({ records: [] });

			await handlers.handleUpdateDnsRecords({
				dns_zone: "example.com",
				changes: [{ clear: {} }],
				disallow_new_zone_creation: false,
				return_all_records: false,
				serial: 12345,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.serial).toBe(12345);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleUpdateDnsRecords({
				dns_zone: "example.com",
				changes: [{ clear: {} }],
				disallow_new_zone_creation: false,
				return_all_records: false,
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleClearDnsRecords", () => {
		it("clears all records", async () => {
			mockFetch.mockResolvedValueOnce(undefined);

			const result = await handlers.handleClearDnsRecords({
				dns_zone: "example.com",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("cleared");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: "/domain/v2beta1/dns-zones/example.com/records",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleClearDnsRecords({ dns_zone: "example.com" });
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	// --- Raw Zone ---

	describe("handleExportRawDnsZone", () => {
		it("exports a raw zone", async () => {
			mockFetch.mockResolvedValueOnce("$ORIGIN example.com.\n@ 300 IN A 1.2.3.4\n");

			const result = await handlers.handleExportRawDnsZone({
				dns_zone: "example.com",
				format: "bind",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.content).toContain("$ORIGIN");
			expect(parsed.dns_zone).toBe("example.com");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/domain/v2beta1/dns-zones/example.com/raw",
					responseType: "text",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleExportRawDnsZone({
				dns_zone: "example.com",
				format: "bind",
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleImportRawDnsZone", () => {
		it("imports a raw zone", async () => {
			mockFetch.mockResolvedValueOnce({ records: [{ name: "www", type: "A" }] });

			const result = await handlers.handleImportRawDnsZone({
				dns_zone: "example.com",
				content: "$ORIGIN example.com.\n@ 300 IN A 1.2.3.4\n",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.records).toBeDefined();
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/domain/v2beta1/dns-zones/example.com/raw",
				}),
			);
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.bind_source.content).toContain("$ORIGIN");
		});

		it("passes project_id when provided", async () => {
			mockFetch.mockResolvedValueOnce({});

			await handlers.handleImportRawDnsZone({
				dns_zone: "example.com",
				content: "zone data",
				project_id: "11111111-1111-1111-1111-111111111111",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project_id).toBe("11111111-1111-1111-1111-111111111111");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleImportRawDnsZone({
				dns_zone: "example.com",
				content: "data",
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	// --- Nameservers ---

	describe("handleListNameservers", () => {
		it("lists nameservers", async () => {
			mockFetch.mockResolvedValueOnce({
				ns: [
					{ name: "ns0.dom.scw.cloud", is_default: true },
					{ name: "ns1.dom.scw.cloud", is_default: true },
				],
			});

			const result = await handlers.handleListNameservers({
				dns_zone: "example.com",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.ns).toHaveLength(2);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/domain/v2beta1/dns-zones/example.com/nameservers",
				}),
			);
		});

		it("passes project_id when provided", async () => {
			mockFetch.mockResolvedValueOnce({ ns: [] });

			await handlers.handleListNameservers({
				dns_zone: "example.com",
				project_id: "11111111-1111-1111-1111-111111111111",
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("project_id")).toBe("11111111-1111-1111-1111-111111111111");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleListNameservers({ dns_zone: "example.com" });
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleUpdateNameservers", () => {
		it("updates nameservers", async () => {
			mockFetch.mockResolvedValueOnce({
				ns: [{ name: "ns1.custom.com", is_default: false }],
			});

			const result = await handlers.handleUpdateNameservers({
				dns_zone: "example.com",
				ns: [{ name: "ns1.custom.com" }],
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.ns).toHaveLength(1);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "PUT",
					path: "/domain/v2beta1/dns-zones/example.com/nameservers",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleUpdateNameservers({
				dns_zone: "example.com",
				ns: [{ name: "ns1.custom.com" }],
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	// --- SSL Certificates ---

	describe("handleGetSslCertificate", () => {
		it("gets an SSL certificate", async () => {
			mockFetch.mockResolvedValueOnce({
				dns_zone: "example.com",
				status: "ready",
				certificate_chain: "-----BEGIN CERTIFICATE-----",
			});

			const result = await handlers.handleGetSslCertificate({
				dns_zone: "example.com",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.dns_zone).toBe("example.com");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/domain/v2beta1/ssl-certificates/example.com",
				}),
			);
		});

		it("returns error on failure", async () => {
			const error = new Error("Not found");
			Object.assign(error, { statusCode: 404 });
			mockFetch.mockRejectedValueOnce(error);

			const result = await handlers.handleGetSslCertificate({ dns_zone: "missing.com" });
			expect((result as Record<string, unknown>).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleCreateSslCertificate", () => {
		it("creates an SSL certificate", async () => {
			mockFetch.mockResolvedValueOnce({
				dns_zone: "example.com",
				alternative_dns_zones: ["www.example.com"],
				status: "pending",
			});

			const result = await handlers.handleCreateSslCertificate({
				dns_zone: "example.com",
				alternative_dns_zones: ["www.example.com"],
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("pending");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/domain/v2beta1/ssl-certificates",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleCreateSslCertificate({
				dns_zone: "example.com",
				alternative_dns_zones: [],
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleDeleteSslCertificate", () => {
		it("deletes an SSL certificate", async () => {
			mockFetch.mockResolvedValueOnce(undefined);

			const result = await handlers.handleDeleteSslCertificate({
				dns_zone: "example.com",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("deleted");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: "/domain/v2beta1/ssl-certificates/example.com",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleDeleteSslCertificate({ dns_zone: "example.com" });
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	// --- TSIG Keys ---

	describe("handleGetTsigKey", () => {
		it("gets a TSIG key", async () => {
			mockFetch.mockResolvedValueOnce({
				name: "tsig-key-1",
				key: "base64encodedkey==",
				algorithm: "hmac-sha256",
			});

			const result = await handlers.handleGetTsigKey({
				dns_zone: "example.com",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("tsig-key-1");
			expect(parsed.algorithm).toBe("hmac-sha256");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/domain/v2beta1/dns-zones/example.com/tsig-key",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleGetTsigKey({ dns_zone: "example.com" });
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleDeleteTsigKey", () => {
		it("deletes a TSIG key", async () => {
			mockFetch.mockResolvedValueOnce(undefined);

			const result = await handlers.handleDeleteTsigKey({
				dns_zone: "example.com",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("deleted");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: "/domain/v2beta1/dns-zones/example.com/tsig-key",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleDeleteTsigKey({ dns_zone: "example.com" });
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});
});

describe("dns types validation", () => {
	const { z } = require("zod");

	it("validates ListDnsZonesParams", async () => {
		const { ListDnsZonesParams } = await import("../../../src/tools/dns/types.js");
		expect(() => ListDnsZonesParams.parse({})).not.toThrow();
		expect(() =>
			ListDnsZonesParams.parse({ page: 1, pageSize: 10, domain: "example.com" }),
		).not.toThrow();
		expect(() => ListDnsZonesParams.parse({ page: -1 })).toThrow();
	});

	it("validates CreateDnsZoneParams", async () => {
		const { CreateDnsZoneParams } = await import("../../../src/tools/dns/types.js");
		expect(() =>
			CreateDnsZoneParams.parse({
				domain: "example.com",
				project_id: "11111111-1111-1111-1111-111111111111",
			}),
		).not.toThrow();
		expect(() => CreateDnsZoneParams.parse({ domain: "" })).toThrow();
	});

	it("validates RecordType enum", async () => {
		const { RecordType } = await import("../../../src/tools/dns/types.js");
		expect(RecordType.parse("A")).toBe("A");
		expect(RecordType.parse("AAAA")).toBe("AAAA");
		expect(RecordType.parse("MX")).toBe("MX");
		expect(() => RecordType.parse("INVALID")).toThrow();
	});

	it("validates DnsZoneStatus enum", async () => {
		const { DnsZoneStatus } = await import("../../../src/tools/dns/types.js");
		expect(DnsZoneStatus.parse("active")).toBe("active");
		expect(DnsZoneStatus.parse("pending")).toBe("pending");
		expect(() => DnsZoneStatus.parse("invalid")).toThrow();
	});

	it("validates RecordChange union", async () => {
		const { RecordChange } = await import("../../../src/tools/dns/types.js");
		expect(() =>
			RecordChange.parse({
				add: { records: [{ name: "www", type: "A", data: "1.2.3.4", ttl: 300 }] },
			}),
		).not.toThrow();
		expect(() =>
			RecordChange.parse({
				set: {
					id_fields: { name: "www", type: "A" },
					records: [{ name: "www", type: "A", data: "1.2.3.4", ttl: 300 }],
				},
			}),
		).not.toThrow();
		expect(() =>
			RecordChange.parse({
				delete: { id: "rec-1" },
			}),
		).not.toThrow();
		expect(() => RecordChange.parse({ clear: {} })).not.toThrow();
	});

	it("validates UpdateDnsRecordsParams", async () => {
		const { UpdateDnsRecordsParams } = await import("../../../src/tools/dns/types.js");
		expect(() =>
			UpdateDnsRecordsParams.parse({
				dns_zone: "example.com",
				changes: [{ clear: {} }],
			}),
		).not.toThrow();
	});

	it("validates ExportRawDnsZoneParams defaults", async () => {
		const { ExportRawDnsZoneParams } = await import("../../../src/tools/dns/types.js");
		const parsed = ExportRawDnsZoneParams.parse({ dns_zone: "example.com" });
		expect(parsed.format).toBe("bind");
	});

	it("validates UpdateNameserversParams", async () => {
		const { UpdateNameserversParams } = await import("../../../src/tools/dns/types.js");
		expect(() =>
			UpdateNameserversParams.parse({
				dns_zone: "example.com",
				ns: [{ name: "ns1.example.com" }],
			}),
		).not.toThrow();
		expect(() =>
			UpdateNameserversParams.parse({
				dns_zone: "example.com",
				ns: [],
			}),
		).toThrow();
	});

	it("validates CreateSslCertificateParams defaults", async () => {
		const { CreateSslCertificateParams } = await import("../../../src/tools/dns/types.js");
		const parsed = CreateSslCertificateParams.parse({ dns_zone: "example.com" });
		expect(parsed.alternative_dns_zones).toEqual([]);
	});

	it("validates CloneDnsZoneParams defaults", async () => {
		const { CloneDnsZoneParams } = await import("../../../src/tools/dns/types.js");
		const parsed = CloneDnsZoneParams.parse({
			dns_zone: "example.com",
			dest_dns_zone: "clone.example.com",
		});
		expect(parsed.overwrite).toBe(false);
	});

	it("validates RefreshDnsZoneParams defaults", async () => {
		const { RefreshDnsZoneParams } = await import("../../../src/tools/dns/types.js");
		const parsed = RefreshDnsZoneParams.parse({ dns_zone: "example.com" });
		expect(parsed.recreate_dns_zone).toBe(false);
		expect(parsed.recreate_sub_dns_zone).toBe(false);
	});

	it("validates DeleteDnsZoneParams", async () => {
		const { DeleteDnsZoneParams } = await import("../../../src/tools/dns/types.js");
		expect(() =>
			DeleteDnsZoneParams.parse({
				dns_zone: "example.com",
				project_id: "11111111-1111-1111-1111-111111111111",
			}),
		).not.toThrow();
		expect(() => DeleteDnsZoneParams.parse({ dns_zone: "example.com" })).toThrow();
	});

	it("validates ImportRawDnsZoneParams", async () => {
		const { ImportRawDnsZoneParams } = await import("../../../src/tools/dns/types.js");
		expect(() =>
			ImportRawDnsZoneParams.parse({
				dns_zone: "example.com",
				content: "zone data",
			}),
		).not.toThrow();
		expect(() =>
			ImportRawDnsZoneParams.parse({
				dns_zone: "example.com",
				content: "",
			}),
		).toThrow();
	});

	it("validates ListDnsRecordsParams", async () => {
		const { ListDnsRecordsParams } = await import("../../../src/tools/dns/types.js");
		expect(() => ListDnsRecordsParams.parse({ dns_zone: "example.com" })).not.toThrow();
		expect(() =>
			ListDnsRecordsParams.parse({
				dns_zone: "example.com",
				name: "www",
				type: "A",
				order_by: "name_asc",
			}),
		).not.toThrow();
	});

	it("validates RecordInput", async () => {
		const { RecordInput } = await import("../../../src/tools/dns/types.js");
		expect(() =>
			RecordInput.parse({ name: "www", type: "A", data: "1.2.3.4", ttl: 300 }),
		).not.toThrow();
		expect(() =>
			RecordInput.parse({
				name: "mail",
				type: "MX",
				data: "mail.example.com",
				ttl: 300,
				priority: 10,
				comment: "Mail server",
			}),
		).not.toThrow();
		expect(() => RecordInput.parse({ name: "www", type: "A", data: "1.2.3.4", ttl: 30 })).toThrow(); // ttl min 60
	});

	it("validates ClearDnsRecordsParams", async () => {
		const { ClearDnsRecordsParams } = await import("../../../src/tools/dns/types.js");
		expect(() => ClearDnsRecordsParams.parse({ dns_zone: "example.com" })).not.toThrow();
		expect(() => ClearDnsRecordsParams.parse({ dns_zone: "" })).toThrow();
	});

	it("validates ListNameserversParams", async () => {
		const { ListNameserversParams } = await import("../../../src/tools/dns/types.js");
		expect(() => ListNameserversParams.parse({ dns_zone: "example.com" })).not.toThrow();
	});

	it("validates GetSslCertificateParams", async () => {
		const { GetSslCertificateParams } = await import("../../../src/tools/dns/types.js");
		expect(() => GetSslCertificateParams.parse({ dns_zone: "example.com" })).not.toThrow();
	});

	it("validates DeleteSslCertificateParams", async () => {
		const { DeleteSslCertificateParams } = await import("../../../src/tools/dns/types.js");
		expect(() => DeleteSslCertificateParams.parse({ dns_zone: "example.com" })).not.toThrow();
	});

	it("validates GetTsigKeyParams", async () => {
		const { GetTsigKeyParams } = await import("../../../src/tools/dns/types.js");
		expect(() => GetTsigKeyParams.parse({ dns_zone: "example.com" })).not.toThrow();
	});

	it("validates DeleteTsigKeyParams", async () => {
		const { DeleteTsigKeyParams } = await import("../../../src/tools/dns/types.js");
		expect(() => DeleteTsigKeyParams.parse({ dns_zone: "example.com" })).not.toThrow();
	});

	it("validates UpdateDnsZoneParams", async () => {
		const { UpdateDnsZoneParams } = await import("../../../src/tools/dns/types.js");
		expect(() => UpdateDnsZoneParams.parse({ dns_zone: "example.com" })).not.toThrow();
		expect(() => UpdateDnsZoneParams.parse({ dns_zone: "" })).toThrow();
	});
});
