/**
 * Contract tests for IPAM API shape validation.
 *
 * These tests validate that our Zod schemas and handler request shapes
 * match the Scaleway IPAM API contract as documented in:
 * - Scaleway API: GET/POST/PATCH/DELETE /ipam/v1/regions/{region}/ips
 * - specs/021-ipam/spec.md
 *
 * Parity matrix entries:
 * - ipam.list_ips -> scaleway_ipam_list_ips
 * - ipam.get_ip -> scaleway_ipam_get_ip
 * - ipam.book_ip -> scaleway_ipam_book_ip
 * - ipam.release_ip -> scaleway_ipam_release_ip
 * - ipam.update_ip -> scaleway_ipam_update_ip
 */

import { type Mock, describe, expect, it, vi } from "vitest";
import {
	handleBookIP,
	handleGetIP,
	handleListIPs,
	handleReleaseIP,
	handleUpdateIP,
} from "../../src/tools/ipam/handlers.js";
import {
	BookIPInput,
	GetIPInput,
	ListIPsInput,
	ReleaseIPInput,
	UpdateIPInput,
} from "../../src/tools/ipam/types.js";

function createMockClient(fetchMock: Mock) {
	return { fetch: fetchMock, settings: {} } as never;
}

const FULL_IP_RESPONSE = {
	id: "11111111-1111-1111-1111-111111111111",
	address: "10.0.0.1/32",
	project_id: "22222222-2222-2222-2222-222222222222",
	is_ipv6: false,
	created_at: "2025-01-01T00:00:00.000000+00:00",
	updated_at: "2025-01-01T12:00:00.000000+00:00",
	source: {
		zonal: "fr-par-1",
		private_network_id: null,
		subnet_id: null,
	},
	resource: {
		type: "instance_server",
		id: "33333333-3333-3333-3333-333333333333",
		mac_address: "de:ad:be:ef:00:01",
		name: "web-server-1",
	},
	tags: ["env:prod", "team:infra"],
	reverses: [{ hostname: "web1.example.com", address: "10.0.0.1" }],
	region: "fr-par",
	zone: "fr-par-1",
};

describe("IPAM API contract tests", () => {
	// --- ListIPs contract: GET /ipam/v1/regions/{region}/ips ---

	describe("ListIPs - GET /ipam/v1/regions/{region}/ips", () => {
		it("sends correct request path and method", async () => {
			const fetchMock = vi.fn().mockResolvedValue({ ips: [], total_count: 0 });
			const client = createMockClient(fetchMock);
			const input = ListIPsInput.parse({ region: "fr-par" });

			await handleListIPs(client, input);

			const [request] = fetchMock.mock.calls[0];
			expect(request.method).toBe("GET");
			expect(request.path).toBe("/ipam/v1/regions/fr-par/ips");
		});

		it("sends pagination as page and page_size URL params", async () => {
			const fetchMock = vi.fn().mockResolvedValue({ ips: [], total_count: 0 });
			const client = createMockClient(fetchMock);
			const input = ListIPsInput.parse({ region: "fr-par", page: 3, pageSize: 20 });

			await handleListIPs(client, input);

			const [request] = fetchMock.mock.calls[0];
			const urlParams: URLSearchParams = request.urlParams;
			expect(urlParams.get("page")).toBe("3");
			expect(urlParams.get("page_size")).toBe("20");
		});

		it("response shape contains ips array and total_count", async () => {
			const fetchMock = vi.fn().mockResolvedValue({
				ips: [FULL_IP_RESPONSE],
				total_count: 1,
			});
			const client = createMockClient(fetchMock);
			const input = ListIPsInput.parse({ region: "fr-par" });

			const result = await handleListIPs(client, input);

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed).toHaveProperty("items");
			expect(parsed).toHaveProperty("totalCount");
			expect(parsed).toHaveProperty("page");
			expect(parsed).toHaveProperty("pageSize");
			expect(Array.isArray(parsed.items)).toBe(true);
			expect(typeof parsed.totalCount).toBe("number");
		});

		it("IP object in response matches expected shape", async () => {
			const fetchMock = vi.fn().mockResolvedValue({
				ips: [FULL_IP_RESPONSE],
				total_count: 1,
			});
			const client = createMockClient(fetchMock);
			const input = ListIPsInput.parse({ region: "fr-par" });

			const result = await handleListIPs(client, input);
			const parsed = JSON.parse(result.content[0].text);
			const ip = parsed.items[0];

			expect(ip).toHaveProperty("id");
			expect(ip).toHaveProperty("address");
			expect(ip).toHaveProperty("project_id");
			expect(ip).toHaveProperty("is_ipv6");
			expect(ip).toHaveProperty("created_at");
			expect(ip).toHaveProperty("updated_at");
			expect(ip).toHaveProperty("source");
			expect(ip).toHaveProperty("resource");
			expect(ip).toHaveProperty("tags");
			expect(ip).toHaveProperty("reverses");
			expect(ip).toHaveProperty("region");
			expect(ip).toHaveProperty("zone");
		});

		it("sends filter params in URL query", async () => {
			const fetchMock = vi.fn().mockResolvedValue({ ips: [], total_count: 0 });
			const client = createMockClient(fetchMock);
			const input = ListIPsInput.parse({
				region: "fr-par",
				project_id: "22222222-2222-2222-2222-222222222222",
				attached: true,
				resource_type: "instance_server",
				is_ipv6: false,
				tags: ["env:prod"],
			});

			await handleListIPs(client, input);

			const [request] = fetchMock.mock.calls[0];
			const urlParams: URLSearchParams = request.urlParams;
			expect(urlParams.get("project_id")).toBe("22222222-2222-2222-2222-222222222222");
			expect(urlParams.get("attached")).toBe("true");
			expect(urlParams.get("resource_type")).toBe("instance_server");
			expect(urlParams.get("is_ipv6")).toBe("false");
			expect(urlParams.get("tags")).toBe("env:prod");
		});

		it("returns error response on 401", async () => {
			const err = new Error("unauthorized");
			(err as Error & { statusCode: number }).statusCode = 401;
			const fetchMock = vi.fn().mockRejectedValue(err);
			const client = createMockClient(fetchMock);
			const input = ListIPsInput.parse({ region: "fr-par" });

			const result = await handleListIPs(client, input);

			expect((result as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
			expect(parsed.error.statusCode).toBe(401);
		});
	});

	// --- GetIP contract: GET /ipam/v1/regions/{region}/ips/{ip_id} ---

	describe("GetIP - GET /ipam/v1/regions/{region}/ips/{ip_id}", () => {
		it("sends correct request path and method", async () => {
			const fetchMock = vi.fn().mockResolvedValue(FULL_IP_RESPONSE);
			const client = createMockClient(fetchMock);
			const input = GetIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});

			await handleGetIP(client, input);

			const [request] = fetchMock.mock.calls[0];
			expect(request.method).toBe("GET");
			expect(request.path).toBe("/ipam/v1/regions/fr-par/ips/11111111-1111-1111-1111-111111111111");
		});

		it("response contains full IP shape", async () => {
			const fetchMock = vi.fn().mockResolvedValue(FULL_IP_RESPONSE);
			const client = createMockClient(fetchMock);
			const input = GetIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});

			const result = await handleGetIP(client, input);
			const parsed = JSON.parse(result.content[0].text);

			expect(parsed.id).toBe("11111111-1111-1111-1111-111111111111");
			expect(parsed.source).toHaveProperty("zonal");
			expect(parsed.resource).toHaveProperty("type");
			expect(parsed.resource).toHaveProperty("id");
			expect(parsed.resource).toHaveProperty("mac_address");
			expect(Array.isArray(parsed.reverses)).toBe(true);
		});

		it("returns error response on 404", async () => {
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			const fetchMock = vi.fn().mockRejectedValue(err);
			const client = createMockClient(fetchMock);
			const input = GetIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});

			const result = await handleGetIP(client, input);

			expect((result as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
			expect(parsed.error.statusCode).toBe(404);
		});
	});

	// --- BookIP contract: POST /ipam/v1/regions/{region}/ips ---

	describe("BookIP - POST /ipam/v1/regions/{region}/ips", () => {
		it("sends correct request path, method, and body", async () => {
			const fetchMock = vi.fn().mockResolvedValue(FULL_IP_RESPONSE);
			const client = createMockClient(fetchMock);
			const input = BookIPInput.parse({
				region: "fr-par",
				project_id: "22222222-2222-2222-2222-222222222222",
				source: { zonal: "fr-par-1" },
			});

			await handleBookIP(client, input);

			const [request] = fetchMock.mock.calls[0];
			expect(request.method).toBe("POST");
			expect(request.path).toBe("/ipam/v1/regions/fr-par/ips");
			expect(request.headers?.["Content-Type"]).toBe("application/json");

			const body = JSON.parse(request.body);
			expect(body).toHaveProperty("project_id");
			expect(body).toHaveProperty("source");
			expect(body).toHaveProperty("is_ipv6");
			expect(body).toHaveProperty("tags");
		});

		it("request body contains source with zonal", async () => {
			const fetchMock = vi.fn().mockResolvedValue(FULL_IP_RESPONSE);
			const client = createMockClient(fetchMock);
			const input = BookIPInput.parse({
				region: "fr-par",
				project_id: "22222222-2222-2222-2222-222222222222",
				source: { zonal: "fr-par-1" },
			});

			await handleBookIP(client, input);

			const body = JSON.parse(fetchMock.mock.calls[0][0].body);
			expect(body.source.zonal).toBe("fr-par-1");
		});

		it("request body contains optional address and resource", async () => {
			const fetchMock = vi.fn().mockResolvedValue(FULL_IP_RESPONSE);
			const client = createMockClient(fetchMock);
			const input = BookIPInput.parse({
				region: "fr-par",
				project_id: "22222222-2222-2222-2222-222222222222",
				source: { private_network_id: "44444444-4444-4444-4444-444444444444" },
				address: "10.0.0.5/32",
				resource: { mac_address: "de:ad:be:ef:00:01" },
			});

			await handleBookIP(client, input);

			const body = JSON.parse(fetchMock.mock.calls[0][0].body);
			expect(body.address).toBe("10.0.0.5/32");
			expect(body.resource.mac_address).toBe("de:ad:be:ef:00:01");
		});

		it("returns error response on 400", async () => {
			const err = new Error("invalid request");
			(err as Error & { statusCode: number }).statusCode = 400;
			const fetchMock = vi.fn().mockRejectedValue(err);
			const client = createMockClient(fetchMock);
			const input = BookIPInput.parse({
				region: "fr-par",
				project_id: "22222222-2222-2222-2222-222222222222",
				source: { zonal: "fr-par-1" },
			});

			const result = await handleBookIP(client, input);

			expect((result as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
			expect(parsed.error.statusCode).toBe(400);
		});
	});

	// --- ReleaseIP contract: DELETE /ipam/v1/regions/{region}/ips/{ip_id} ---

	describe("ReleaseIP - DELETE /ipam/v1/regions/{region}/ips/{ip_id}", () => {
		it("sends correct request path and method", async () => {
			const fetchMock = vi.fn().mockResolvedValue(undefined);
			const client = createMockClient(fetchMock);
			const input = ReleaseIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});

			await handleReleaseIP(client, input);

			const [request] = fetchMock.mock.calls[0];
			expect(request.method).toBe("DELETE");
			expect(request.path).toBe("/ipam/v1/regions/fr-par/ips/11111111-1111-1111-1111-111111111111");
		});

		it("returns success response", async () => {
			const fetchMock = vi.fn().mockResolvedValue(undefined);
			const client = createMockClient(fetchMock);
			const input = ReleaseIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});

			const result = await handleReleaseIP(client, input);

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
			expect(parsed.ip_id).toBe("11111111-1111-1111-1111-111111111111");
		});

		it("returns error response on 404", async () => {
			const err = new Error("ip not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			const fetchMock = vi.fn().mockRejectedValue(err);
			const client = createMockClient(fetchMock);
			const input = ReleaseIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});

			const result = await handleReleaseIP(client, input);

			expect((result as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	// --- UpdateIP contract: PATCH /ipam/v1/regions/{region}/ips/{ip_id} ---

	describe("UpdateIP - PATCH /ipam/v1/regions/{region}/ips/{ip_id}", () => {
		it("sends correct request path, method, and body", async () => {
			const fetchMock = vi.fn().mockResolvedValue(FULL_IP_RESPONSE);
			const client = createMockClient(fetchMock);
			const input = UpdateIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
				tags: ["env:staging"],
			});

			await handleUpdateIP(client, input);

			const [request] = fetchMock.mock.calls[0];
			expect(request.method).toBe("PATCH");
			expect(request.path).toBe("/ipam/v1/regions/fr-par/ips/11111111-1111-1111-1111-111111111111");
			expect(request.headers?.["Content-Type"]).toBe("application/json");

			const body = JSON.parse(request.body);
			expect(body.tags).toEqual(["env:staging"]);
		});

		it("request body can contain reverses", async () => {
			const fetchMock = vi.fn().mockResolvedValue(FULL_IP_RESPONSE);
			const client = createMockClient(fetchMock);
			const input = UpdateIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
				reverses: [{ hostname: "ptr.example.com", address: "10.0.0.1" }],
			});

			await handleUpdateIP(client, input);

			const body = JSON.parse(fetchMock.mock.calls[0][0].body);
			expect(body.reverses).toEqual([{ hostname: "ptr.example.com", address: "10.0.0.1" }]);
		});

		it("returns updated IP response", async () => {
			const updatedIP = { ...FULL_IP_RESPONSE, tags: ["new-tag"] };
			const fetchMock = vi.fn().mockResolvedValue(updatedIP);
			const client = createMockClient(fetchMock);
			const input = UpdateIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
				tags: ["new-tag"],
			});

			const result = await handleUpdateIP(client, input);
			const parsed = JSON.parse(result.content[0].text);

			expect(parsed.tags).toEqual(["new-tag"]);
			expect(parsed.id).toBe("11111111-1111-1111-1111-111111111111");
		});

		it("returns error response on 429", async () => {
			const err = new Error("rate limited");
			(err as Error & { statusCode: number }).statusCode = 429;
			const fetchMock = vi.fn().mockRejectedValue(err);
			const client = createMockClient(fetchMock);
			const input = UpdateIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
				tags: ["test"],
			});

			const result = await handleUpdateIP(client, input);

			expect((result as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
			expect(parsed.error.statusCode).toBe(429);
		});
	});
});
