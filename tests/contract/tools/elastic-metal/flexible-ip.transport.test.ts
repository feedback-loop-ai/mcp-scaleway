/**
 * GET/POST /flexible-ip/v1alpha1/zones/{zone}/fips;
 * DELETE /flexible-ip/v1alpha1/zones/{zone}/fips/{fip_id}.
 * Contract: specs/scaleway-api/elastic-metal/api-reference.md, Flexible IPs.
 * Real SDK request construction and parsing with isolated dummy HTTP transport.
 */
import { createAdvancedClient, withHTTPClient, withProfile } from "@scaleway/sdk-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleCreateIp,
	handleDeleteIp,
	handleListIps,
} from "../../../../src/tools/elastic-metal/handlers.js";
const ID = "11111111-1111-4111-8111-111111111111";
const { http, factory } = vi.hoisted(() => ({ http: vi.fn(), factory: vi.fn() }));
vi.mock("../../../../src/shared/client.js", () => ({ createScalewayClient: factory }));
vi.mock("../../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "00000000-0000-4000-8000-000000000000",
		defaultProjectId: "11111111-1111-4111-8111-111111111111",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));
beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn(() => {
			throw new Error("Unexpected network");
		}),
	);
	http.mockReset();
	factory.mockReturnValue(
		createAdvancedClient(
			withProfile({
				accessKey: "SCWXXXXXXXXXXXXXXXXX",
				secretKey: "00000000-0000-4000-8000-000000000000",
				defaultProjectId: ID,
			}),
			withHTTPClient(http as unknown as typeof fetch),
		),
	);
});
afterEach(() => vi.unstubAllGlobals());
const ok = (data: unknown) =>
	new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });
function request() {
	const r = http.mock.calls[0][0] as Request;
	expect(r.headers.get("x-auth-token")).toBe("00000000-0000-4000-8000-000000000000");
	expect(new URL(r.url).origin).toBe("https://api.scaleway.com");
	return r;
}
describe("Flexible IP HTTP contract", () => {
	it("lists flexible_ips with server_ids and pagination", async () => {
		http.mockResolvedValue(ok({ flexible_ips: [{ id: ID }], total_count: 1 }));
		const result = await handleListIps({
			zone: "fr-par-1",
			project_id: ID,
			server_id: ID,
			page: 2,
			pageSize: 7,
			order_by: "created_at_desc",
		});
		const r = request();
		const url = new URL(r.url);
		expect(r.method).toBe("GET");
		expect(url.pathname).toBe("/flexible-ip/v1alpha1/zones/fr-par-1/fips");
		expect(Object.fromEntries(url.searchParams)).toEqual({
			project_id: ID,
			server_ids: ID,
			page: "2",
			page_size: "7",
			order_by: "created_at_desc",
		});
		expect(JSON.parse(result.content[0].text)).toEqual({
			items: [{ id: ID }],
			totalCount: 1,
			page: 2,
			pageSize: 7,
		});
	});
	it("creates with authenticated JSON body and preserves the object", async () => {
		http.mockResolvedValue(ok({ id: ID, status: "ready" }));
		const result = await handleCreateIp({
			zone: "fr-par-1",
			project_id: ID,
			server_id: ID,
			description: "test",
			tags: ["regression"],
		});
		const r = request();
		expect(r.method).toBe("POST");
		expect(new URL(r.url).pathname).toBe("/flexible-ip/v1alpha1/zones/fr-par-1/fips");
		expect(r.headers.get("content-type")).toContain("application/json");
		expect(await r.json()).toEqual({
			project_id: ID,
			server_id: ID,
			description: "test",
			tags: ["regression"],
		});
		expect(JSON.parse(result.content[0].text)).toEqual({ id: ID, status: "ready" });
	});
	it("deletes the fip_id and normalizes HTTP 204", async () => {
		http.mockResolvedValue(new Response(null, { status: 204 }));
		const result = await handleDeleteIp({ zone: "fr-par-1", ip_id: ID });
		const r = request();
		expect(r.method).toBe("DELETE");
		expect(new URL(r.url).pathname).toBe(`/flexible-ip/v1alpha1/zones/fr-par-1/fips/${ID}`);
		expect(JSON.parse(result.content[0].text)).toEqual({});
	});
	it.each([400, 401, 403, 404, 429, 500])("maps SDK HTTP %i", async (status) => {
		http.mockResolvedValue(
			new Response(JSON.stringify({ message: "rejected" }), {
				status,
				headers: { "content-type": "application/json" },
			}),
		);
		const result = await handleListIps({ zone: "fr-par-1" });
		expect(result).toMatchObject({ isError: true });
		expect(JSON.parse(result.content[0].text).error.statusCode).toBe(status);
	});
});
