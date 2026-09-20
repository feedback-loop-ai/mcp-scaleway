/**
 * Wire contract: specs/064-remaining-remediation/contracts/response-validation.md.
 * API Reference entries and tested endpoints:
 * - specs/scaleway-api/instances/api-reference.md#list-servers:
 *   GET /instance/v1/zones/{zone}/servers (including the Pagination header contract).
 * - specs/scaleway-api/domain-registrar/api-reference.md#tlds, Get TLD:
 *   GET /domain/v2beta1/tlds?tlds={tld_name}.
 * - specs/scaleway-api/nats/api-reference.md#list-nats-credentials:
 *   GET /mnq/v1beta1/regions/{region}/nats-credentials?nats_account_id={id}.
 * - specs/scaleway-api/cockpit/api-reference.md#cockpit-regional-legacy-and-unverified:
 *   the activate-cockpit ID is locally unavailable. The final test's supplied legacy
 *   path is a preflight fixture, not an asserted or contacted Scaleway endpoint; see
 *   specs/064-remaining-remediation/contracts/unverified-operations.md.
 * Real Scaleway SDK request/parser/unmarshaller; only HTTP is replaced.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createScalewayClient, resetClient } from "../../src/shared/client.js";
import { guardedFetch, withRouteContext } from "../../src/shared/route-guard.js";

const http = vi.hoisted(() =>
	vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(),
);
vi.mock("@scaleway/sdk-client", async (importOriginal) => {
	const sdk = await importOriginal<typeof import("@scaleway/sdk-client")>();
	return {
		...sdk,
		createClient: (profile: Parameters<typeof sdk.createClient>[0]) =>
			sdk.createAdvancedClient(
				sdk.withProfile(profile ?? {}),
				sdk.withHTTPClient(http as unknown as typeof fetch),
				sdk.withAdditionalInterceptors(profile?.interceptors ?? []),
			),
	};
});

const config = {
	accessKey: "SCWXXXXXXXXXXXXXXXXX",
	secretKey: "11111111-1111-4111-8111-111111111111",
	defaultProjectId: "11111111-1111-4111-8111-111111111111",
	defaultRegion: "fr-par",
	defaultZone: "fr-par-1",
};
const api = "GET /instance/v1/zones/{zone}/servers";
const path = "/instance/v1/zones/fr-par-1/servers";
function request(unmarshaller?: (body: unknown) => unknown) {
	return withRouteContext("scaleway_instances_list_servers", api, () =>
		createScalewayClient(config).fetch({ method: "GET", path }, unmarshaller),
	);
}
beforeEach(() => {
	resetClient();
	http.mockReset();
});
afterEach(() => {
	resetClient();
	vi.unstubAllGlobals();
});

describe("response validation before SDK transformations", () => {
	it("passes validated wire data to the SDK unmarshaller and preserves new fields", async () => {
		http.mockResolvedValue(Response.json({ servers: [], future: { retained: true } }));
		const unmarshaller = vi.fn((body: unknown) => ({ sdk: body }));
		expect(await request(unmarshaller)).toEqual({
			sdk: { servers: [], future: { retained: true } },
		});
		expect(unmarshaller).toHaveBeenCalledOnce();
		const sent = http.mock.calls[0][0] as Request;
		expect(sent.url).toBe(`https://api.scaleway.com${path}`);
		expect(sent.headers.get("X-Auth-Token")).toBe(config.secretKey);
	});
	it("rejects malformed wire data before an unmarshaller can fabricate a valid-looking output", async () => {
		http.mockResolvedValue(Response.json({ servers: "private malformed value" }));
		const unmarshaller = vi.fn(() => ({ servers: [] }));
		await expect(request(unmarshaller)).rejects.toMatchObject({
			status: 502,
			message: "Invalid upstream response (invalid_schema)",
		});
		expect(unmarshaller).not.toHaveBeenCalled();
	});
	it("normalizes JSON charset parameters before the SDK MIME check", async () => {
		http.mockResolvedValue(
			new Response('{"servers":[]}', {
				headers: { "content-type": "application/json; charset=utf-8", "x-total-count": "3" },
			}),
		);
		expect(await request()).toEqual({ servers: [], total_count: 3 });
	});
	it("sanitizes broken JSON before SDK parse exceptions can echo its contents", async () => {
		http.mockResolvedValue(
			new Response("private upstream value", { headers: { "content-type": "application/json" } }),
		);
		await expect(request()).rejects.toMatchObject({
			status: 502,
			message: "Invalid upstream response (invalid_json)",
		});
	});
	it("uses actual SDK urlParams values for Registrar and NATS templated queries", async () => {
		for (const [operation, path, query, declaration, payload] of [
			[
				"scaleway_domain_registrar_get_tld",
				"/domain/v2beta1/tlds",
				{ tlds: "com" },
				"GET /domain/v2beta1/tlds?tlds={tld_name}",
				{ tlds: [], total_count: 0 },
			],
			[
				"scaleway_nats_list_credentials",
				"/mnq/v1beta1/regions/fr-par/nats-credentials",
				{ nats_account_id: "11111111-1111-4111-8111-111111111111" },
				"GET /mnq/v1beta1/regions/{region}/nats-credentials?nats_account_id={id}",
				{ nats_credentials: [], total_count: 0 },
			],
		] as const) {
			http.mockResolvedValue(Response.json(payload));
			const urlParams = new URLSearchParams(query);
			expect(
				await withRouteContext(operation, declaration, () =>
					createScalewayClient(config).fetch({ method: "GET", path, urlParams }),
				),
			).toEqual(payload);
			expect((http.mock.calls.at(-1)?.[0] as Request).url).toBe(
				`https://api.scaleway.com${path}?${urlParams}`,
			);
		}
	});
	it("blocks unavailable legacy mutations in both transports before any HTTP call", async () => {
		const unavailable = "scaleway_cockpit_activate_cockpit";
		const route = "POST /cockpit/v1/regions/{region}/cockpit/activate";
		const rawPath = "/cockpit/v1/regions/fr-par/cockpit/activate";
		expect(() =>
			withRouteContext(unavailable, route, () =>
				createScalewayClient(config).fetch({ method: "POST", path: rawPath }),
			),
		).toThrow("Operation unavailable");
		vi.stubGlobal("fetch", http);
		await expect(
			withRouteContext(unavailable, route, () =>
				guardedFetch(`https://api.scaleway.com${rawPath}`, { method: "POST" }),
			),
		).rejects.toMatchObject({ status: 501 });
		expect(http).not.toHaveBeenCalled();
	});
});
