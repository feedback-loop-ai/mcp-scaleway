/**
 * Contract tests for Scaleway InterLink API (v1beta1)
 *
 * Validates request/response shapes against specs/scaleway-api/interlink/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * API slug: interlink, version v1beta1, region-scoped.
 * Source: https://www.scaleway.com/en/developers/api/interlink/
 */
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({ defaultRegion: "fr-par" })),
}));
vi.mock("../../../src/shared/client.js", () => ({ createScalewayClient: vi.fn() }));
import { createAdvancedClient, withProfile } from "@scaleway/sdk-client";
import { createScalewayClient } from "../../../src/shared/client.js";
import * as httpHandlers from "../../../src/tools/interlink/handlers.js";

import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
	AttachRoutingPolicyParams,
	AttachVpcParams,
	BgpStatus,
	CreateLinkParams,
	CreateRoutingPolicyParams,
	DedicatedConnection,
	DedicatedConnectionStatus,
	DeleteLinkParams,
	DeleteRoutingPolicyParams,
	DetachRoutingPolicyParams,
	DetachVpcParams,
	DisableRoutePropagationParams,
	EnableRoutePropagationParams,
	GetDedicatedConnectionParams,
	GetLinkParams,
	GetPartnerParams,
	GetPopParams,
	GetRoutingPolicyParams,
	Link,
	LinkKind,
	LinkStatus,
	ListDedicatedConnectionsParams,
	ListLinksParams,
	ListPartnersParams,
	ListPopsParams,
	ListRoutingPoliciesParams,
	Partner,
	Pop,
	RoutingPolicy,
	SetRoutingPolicyParams,
	UpdateLinkParams,
	UpdateRoutingPolicyParams,
} from "../../../src/tools/interlink/types.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_REGION = "fr-par";

// --- Fixtures ---

const validLink = {
	id: VALID_UUID,
	project_id: VALID_UUID,
	organization_id: VALID_UUID,
	name: "my-link",
	tags: ["prod"],
	pop_id: VALID_UUID,
	bandwidth_mbps: 1000,
	status: "active" as const,
	bgp_v4_status: "up" as const,
	bgp_v6_status: "down" as const,
	vpc_id: VALID_UUID,
	routing_policy_id: null,
	enable_route_propagation: true,
	created_at: "2025-06-01T12:00:00+00:00",
	updated_at: "2025-06-01T12:30:00+00:00",
	partner: { partner_id: VALID_UUID, pairing_key: "pk-1", disapproved_reason: null },
	self: null,
	vlan: 100,
	scw_bgp_config: { asn: 12876, ipv4: "10.0.0.1/30", ipv6: "fd00::1/126" },
	peer_bgp_config: { asn: 65000, ipv4: "10.0.0.2/30", ipv6: "fd00::2/126" },
	routing_policy_v4_id: VALID_UUID,
	routing_policy_v6_id: VALID_UUID,
	region: VALID_REGION,
};

const validRoutingPolicy = {
	id: VALID_UUID,
	project_id: VALID_UUID,
	organization_id: VALID_UUID,
	name: "rp",
	tags: ["net"],
	prefix_filter_in: ["10.0.0.0/8"],
	prefix_filter_out: ["192.168.0.0/16"],
	created_at: "2025-06-01T12:00:00+00:00",
	updated_at: "2025-06-01T12:30:00+00:00",
	is_ipv6: false,
	region: VALID_REGION,
};

const validPartner = {
	id: VALID_UUID,
	name: "Equinix",
	contact_email: "partner@example.com",
	logo_url: "https://example.com/logo.png",
	portal_url: "https://portal.example.com",
	created_at: "2025-06-01T12:00:00+00:00",
	updated_at: "2025-06-01T12:30:00+00:00",
};

const validPop = {
	id: VALID_UUID,
	name: "PAR1",
	hosting_provider_name: "Equinix",
	address: "114 Rue Ambroise Croizat",
	city: "Saint-Denis",
	logo_url: "https://example.com/logo.png",
	available_link_bandwidths_mbps: [50, 100, 1000],
	display_name: "Equinix PAR1",
	region: VALID_REGION,
};

const validConnection = {
	id: VALID_UUID,
	project_id: VALID_UUID,
	organization_id: VALID_UUID,
	status: "active" as const,
	name: "my-conn",
	tags: ["z"],
	pop_id: VALID_UUID,
	bandwidth_mbps: 10000,
	available_link_bandwidths: [1000, 5000, 10000],
	created_at: "2025-06-01T12:00:00+00:00",
	updated_at: "2025-06-01T12:30:00+00:00",
	demarcation_info: "rack A12, port 3",
	vlan_range: { start: 100, end: 200 },
	region: VALID_REGION,
};

// --- Links ---

/**
 * API: GET /interlink/v1beta1/regions/{region}/links
 * Spec: specs/scaleway-api/interlink/api-reference.md#list-links
 */
describe("contract: ListLinks", () => {
	const ListLinksResponse = z.object({
		links: z.array(Link),
		total_count: z.number().int(),
	});

	it("validates a list response", () => {
		expect(() => ListLinksResponse.parse({ links: [validLink], total_count: 1 })).not.toThrow();
	});

	it("validates an empty response", () => {
		expect(() => ListLinksResponse.parse({ links: [], total_count: 0 })).not.toThrow();
	});

	it("validates a self-hosted link (partner null, self set)", () => {
		const selfHosted = { ...validLink, partner: null, self: { connection_id: VALID_UUID } };
		expect(() => Link.parse(selfHosted)).not.toThrow();
	});

	it("validates all link statuses", () => {
		for (const status of [
			"unknown_link_status",
			"configuring",
			"failed",
			"requested",
			"refused",
			"expired",
			"provisioning",
			"active",
			"limited_connectivity",
			"all_down",
			"deprovisioning",
			"deleted",
			"locked",
			"ready",
		]) {
			expect(() => Link.parse({ ...validLink, status })).not.toThrow();
		}
	});

	it("rejects an invalid link status", () => {
		expect(() => Link.parse({ ...validLink, status: "running" })).toThrow();
	});

	it("validates request with all filters", () => {
		expect(() =>
			ListLinksParams.parse({
				region: VALID_REGION,
				projectId: VALID_UUID,
				organizationId: VALID_UUID,
				name: "x",
				tags: ["t"],
				status: "active",
				bgpV4Status: "up",
				bgpV6Status: "disabled",
				popId: VALID_UUID,
				bandwidthMbps: 1000,
				partnerId: VALID_UUID,
				vpcId: VALID_UUID,
				routingPolicyId: VALID_UUID,
				pairingKey: "pk",
				kind: "self_hosted",
				connectionId: VALID_UUID,
				orderBy: "status_asc",
			}),
		).not.toThrow();
	});
});

/**
 * API: GET /interlink/v1beta1/regions/{region}/links/{link_id}
 * Spec: specs/scaleway-api/interlink/api-reference.md#get-link
 */
describe("contract: GetLink", () => {
	it("validates the link entity", () => {
		expect(() => Link.parse(validLink)).not.toThrow();
	});

	it("validates request shape", () => {
		expect(() => GetLinkParams.parse({ region: VALID_REGION, linkId: VALID_UUID })).not.toThrow();
	});

	it("rejects a missing link_id", () => {
		expect(() => GetLinkParams.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: POST /interlink/v1beta1/regions/{region}/links
 * Spec: specs/scaleway-api/interlink/api-reference.md#create-link
 */
describe("contract: CreateLink", () => {
	it("validates a minimal create request", () => {
		expect(() =>
			CreateLinkParams.parse({
				region: VALID_REGION,
				name: "l",
				popId: VALID_UUID,
				bandwidthMbps: 500,
			}),
		).not.toThrow();
	});

	it("validates a full create request", () => {
		expect(() =>
			CreateLinkParams.parse({
				region: VALID_REGION,
				name: "l",
				popId: VALID_UUID,
				bandwidthMbps: 1000,
				projectId: VALID_UUID,
				tags: ["t"],
				connectionId: VALID_UUID,
				partnerId: VALID_UUID,
				peerAsn: 65000,
				vlan: 100,
				routingPolicyV4Id: VALID_UUID,
				routingPolicyV6Id: VALID_UUID,
			}),
		).not.toThrow();
	});

	it("rejects a create missing required fields", () => {
		expect(() => CreateLinkParams.parse({ region: VALID_REGION, name: "l" })).toThrow();
	});
});

/**
 * API: PATCH /interlink/v1beta1/regions/{region}/links/{link_id}
 * Spec: specs/scaleway-api/interlink/api-reference.md#update-link
 */
describe("contract: UpdateLink", () => {
	it("validates update with all optional fields", () => {
		expect(() =>
			UpdateLinkParams.parse({
				region: VALID_REGION,
				linkId: VALID_UUID,
				name: "n",
				tags: ["t"],
				peerAsn: 64500,
			}),
		).not.toThrow();
	});

	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateLinkParams.parse({ region: VALID_REGION, linkId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: DELETE /interlink/v1beta1/regions/{region}/links/{link_id}
 * Spec: specs/scaleway-api/interlink/api-reference.md#delete-link
 */
describe("contract: DeleteLink", () => {
	it("validates delete request", () => {
		expect(() =>
			DeleteLinkParams.parse({ region: VALID_REGION, linkId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /interlink/v1beta1/regions/{region}/links/{link_id}/attach-vpc
 *      POST .../detach-vpc
 * Spec: specs/scaleway-api/interlink/api-reference.md#attach-vpc
 */
describe("contract: Attach/Detach VPC", () => {
	it("validates attach-vpc request", () => {
		expect(() =>
			AttachVpcParams.parse({ region: VALID_REGION, linkId: VALID_UUID, vpcId: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects attach-vpc missing vpc_id", () => {
		expect(() => AttachVpcParams.parse({ region: VALID_REGION, linkId: VALID_UUID })).toThrow();
	});

	it("validates detach-vpc request", () => {
		expect(() => DetachVpcParams.parse({ region: VALID_REGION, linkId: VALID_UUID })).not.toThrow();
	});
});

/**
 * API: POST .../attach-routing-policy, .../detach-routing-policy, .../set-routing-policy
 * Spec: specs/scaleway-api/interlink/api-reference.md#attach-routing-policy
 */
describe("contract: routing policy attach/detach/set on link", () => {
	const body = { region: VALID_REGION, linkId: VALID_UUID, routingPolicyId: VALID_UUID };

	it("validates attach-routing-policy request", () => {
		expect(() => AttachRoutingPolicyParams.parse(body)).not.toThrow();
	});

	it("validates detach-routing-policy request", () => {
		expect(() => DetachRoutingPolicyParams.parse(body)).not.toThrow();
	});

	it("validates set-routing-policy request", () => {
		expect(() => SetRoutingPolicyParams.parse(body)).not.toThrow();
	});

	it("rejects requests missing routing_policy_id", () => {
		expect(() =>
			AttachRoutingPolicyParams.parse({ region: VALID_REGION, linkId: VALID_UUID }),
		).toThrow();
	});
});

/**
 * API: POST .../enable-route-propagation, .../disable-route-propagation
 * Spec: specs/scaleway-api/interlink/api-reference.md#enable-route-propagation
 */
describe("contract: route propagation toggles", () => {
	it("validates enable-route-propagation request", () => {
		expect(() =>
			EnableRoutePropagationParams.parse({ region: VALID_REGION, linkId: VALID_UUID }),
		).not.toThrow();
	});

	it("validates disable-route-propagation request", () => {
		expect(() =>
			DisableRoutePropagationParams.parse({ region: VALID_REGION, linkId: VALID_UUID }),
		).not.toThrow();
	});
});

// --- Routing policies ---

/**
 * API: GET /interlink/v1beta1/regions/{region}/routing-policies
 * Spec: specs/scaleway-api/interlink/api-reference.md#list-routing-policies
 */
describe("contract: ListRoutingPolicies", () => {
	const ListRoutingPoliciesResponse = z.object({
		routing_policies: z.array(RoutingPolicy),
		total_count: z.number().int(),
	});

	it("validates a list response", () => {
		expect(() =>
			ListRoutingPoliciesResponse.parse({
				routing_policies: [validRoutingPolicy],
				total_count: 1,
			}),
		).not.toThrow();
	});

	it("validates request with filters", () => {
		expect(() =>
			ListRoutingPoliciesParams.parse({
				region: VALID_REGION,
				projectId: VALID_UUID,
				organizationId: VALID_UUID,
				name: "rp",
				tags: ["t"],
				ipv6: true,
				orderBy: "name_desc",
			}),
		).not.toThrow();
	});
});

/**
 * API: GET .../routing-policies/{routing_policy_id}
 * Spec: specs/scaleway-api/interlink/api-reference.md#get-routing-policy
 */
describe("contract: GetRoutingPolicy", () => {
	it("validates the routing policy entity", () => {
		expect(() => RoutingPolicy.parse(validRoutingPolicy)).not.toThrow();
	});

	it("validates request shape", () => {
		expect(() =>
			GetRoutingPolicyParams.parse({ region: VALID_REGION, routingPolicyId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST .../routing-policies
 * Spec: specs/scaleway-api/interlink/api-reference.md#create-routing-policy
 */
describe("contract: CreateRoutingPolicy", () => {
	it("validates a minimal create request", () => {
		expect(() =>
			CreateRoutingPolicyParams.parse({ region: VALID_REGION, name: "rp", isIpv6: false }),
		).not.toThrow();
	});

	it("validates a full create request", () => {
		expect(() =>
			CreateRoutingPolicyParams.parse({
				region: VALID_REGION,
				name: "rp",
				isIpv6: true,
				projectId: VALID_UUID,
				tags: ["t"],
				prefixFilterIn: ["10.0.0.0/8"],
				prefixFilterOut: ["0.0.0.0/0"],
			}),
		).not.toThrow();
	});

	it("rejects create missing is_ipv6", () => {
		expect(() => CreateRoutingPolicyParams.parse({ region: VALID_REGION, name: "rp" })).toThrow();
	});
});

/**
 * API: PATCH .../routing-policies/{routing_policy_id}
 * Spec: specs/scaleway-api/interlink/api-reference.md#update-routing-policy
 */
describe("contract: UpdateRoutingPolicy", () => {
	it("validates update with all optional fields", () => {
		expect(() =>
			UpdateRoutingPolicyParams.parse({
				region: VALID_REGION,
				routingPolicyId: VALID_UUID,
				name: "rp2",
				tags: ["t"],
				prefixFilterIn: ["10.0.0.0/8"],
				prefixFilterOut: ["0.0.0.0/0"],
			}),
		).not.toThrow();
	});

	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateRoutingPolicyParams.parse({ region: VALID_REGION, routingPolicyId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: DELETE .../routing-policies/{routing_policy_id}
 * Spec: specs/scaleway-api/interlink/api-reference.md#delete-routing-policy
 */
describe("contract: DeleteRoutingPolicy", () => {
	it("validates delete request", () => {
		expect(() =>
			DeleteRoutingPolicyParams.parse({ region: VALID_REGION, routingPolicyId: VALID_UUID }),
		).not.toThrow();
	});
});

// --- Partners ---

/**
 * API: GET /interlink/v1beta1/regions/{region}/partners
 * Spec: specs/scaleway-api/interlink/api-reference.md#list-partners
 */
describe("contract: ListPartners", () => {
	const ListPartnersResponse = z.object({
		partners: z.array(Partner),
		total_count: z.number().int(),
	});

	it("validates a list response", () => {
		expect(() =>
			ListPartnersResponse.parse({ partners: [validPartner], total_count: 1 }),
		).not.toThrow();
	});

	it("validates the partner entity", () => {
		expect(() => Partner.parse(validPartner)).not.toThrow();
	});

	it("validates request with pop_ids filter", () => {
		expect(() =>
			ListPartnersParams.parse({
				region: VALID_REGION,
				popIds: [VALID_UUID],
				orderBy: "name_asc",
			}),
		).not.toThrow();
	});
});

/**
 * API: GET .../partners/{partner_id}
 * Spec: specs/scaleway-api/interlink/api-reference.md#get-partner
 */
describe("contract: GetPartner", () => {
	it("validates request shape", () => {
		expect(() =>
			GetPartnerParams.parse({ region: VALID_REGION, partnerId: VALID_UUID }),
		).not.toThrow();
	});
});

// --- PoPs ---

/**
 * API: GET /interlink/v1beta1/regions/{region}/pops
 * Spec: specs/scaleway-api/interlink/api-reference.md#list-pops
 */
describe("contract: ListPops", () => {
	const ListPopsResponse = z.object({
		pops: z.array(Pop),
		total_count: z.number().int(),
	});

	it("validates a list response", () => {
		expect(() => ListPopsResponse.parse({ pops: [validPop], total_count: 1 })).not.toThrow();
	});

	it("validates the pop entity", () => {
		expect(() => Pop.parse(validPop)).not.toThrow();
	});

	it("validates request with filters", () => {
		expect(() =>
			ListPopsParams.parse({
				region: VALID_REGION,
				name: "PAR1",
				hostingProviderName: "Equinix",
				partnerId: VALID_UUID,
				linkBandwidthMbps: 1000,
				dedicatedAvailable: true,
				orderBy: "name_asc",
			}),
		).not.toThrow();
	});
});

/**
 * API: GET .../pops/{pop_id}
 * Spec: specs/scaleway-api/interlink/api-reference.md#get-pop
 */
describe("contract: GetPop", () => {
	it("validates request shape", () => {
		expect(() => GetPopParams.parse({ region: VALID_REGION, popId: VALID_UUID })).not.toThrow();
	});
});

// --- Dedicated connections ---

/**
 * API: GET /interlink/v1beta1/regions/{region}/dedicated-connections
 * Spec: specs/scaleway-api/interlink/api-reference.md#list-dedicated-connections
 */
describe("contract: ListDedicatedConnections", () => {
	const ListDedicatedConnectionsResponse = z.object({
		connections: z.array(DedicatedConnection),
		total_count: z.number().int(),
	});

	it("validates a list response", () => {
		expect(() =>
			ListDedicatedConnectionsResponse.parse({ connections: [validConnection], total_count: 1 }),
		).not.toThrow();
	});

	it("validates all dedicated connection statuses", () => {
		for (const status of [
			"unknown_status",
			"created",
			"configuring",
			"failed",
			"active",
			"disabled",
			"deleted",
			"locked",
		]) {
			expect(() => DedicatedConnection.parse({ ...validConnection, status })).not.toThrow();
		}
	});

	it("rejects an invalid connection status", () => {
		expect(() => DedicatedConnection.parse({ ...validConnection, status: "bogus" })).toThrow();
	});

	it("validates request with filters", () => {
		expect(() =>
			ListDedicatedConnectionsParams.parse({
				region: VALID_REGION,
				projectId: VALID_UUID,
				organizationId: VALID_UUID,
				name: "conn",
				tags: ["t"],
				status: "active",
				bandwidthMbps: 10000,
				popId: VALID_UUID,
				orderBy: "created_at_asc",
			}),
		).not.toThrow();
	});
});

/**
 * API: GET .../dedicated-connections/{connection_id}
 * Spec: specs/scaleway-api/interlink/api-reference.md#get-dedicated-connection
 */
describe("contract: GetDedicatedConnection", () => {
	it("validates request shape", () => {
		expect(() =>
			GetDedicatedConnectionParams.parse({ region: VALID_REGION, connectionId: VALID_UUID }),
		).not.toThrow();
	});
});

// --- Enums ---

describe("contract: enums", () => {
	it("validates BGP statuses", () => {
		for (const s of ["unknown_bgp_status", "up", "down", "disabled"]) {
			expect(() => BgpStatus.parse(s)).not.toThrow();
		}
		expect(() => BgpStatus.parse("flapping")).toThrow();
	});

	it("validates link kinds", () => {
		expect(() => LinkKind.parse("hosted")).not.toThrow();
		expect(() => LinkKind.parse("self_hosted")).not.toThrow();
		expect(() => LinkKind.parse("dedicated")).toThrow();
	});

	it("exposes the LinkStatus and DedicatedConnectionStatus enums", () => {
		expect(() => LinkStatus.parse("ready")).not.toThrow();
		expect(() => DedicatedConnectionStatus.parse("active")).not.toThrow();
	});
});

// --- Pagination & auth ---

describe("contract: pagination", () => {
	it("applies default pagination values", () => {
		const result = ListLinksParams.parse({ region: VALID_REGION });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("rejects page size over 100", () => {
		expect(() => ListLinksParams.parse({ region: VALID_REGION, pageSize: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListLinksParams.parse({ region: VALID_REGION, page: 0 })).toThrow();
	});
});

describe("contract: authentication / region", () => {
	it("requires a region for all operations", () => {
		expect(() => ListLinksParams.parse({})).toThrow();
		expect(() => ListPopsParams.parse({})).toThrow();
	});

	it("validates region format (xx-xxx)", () => {
		expect(() => ListLinksParams.parse({ region: "fr-par" })).not.toThrow();
		expect(() => ListLinksParams.parse({ region: "nl-ams" })).not.toThrow();
		expect(() => ListLinksParams.parse({ region: "invalid" })).toThrow();
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
			name: "CreateRoutingPolicy",
			method: "POST",
			path: "/interlink/v1beta1/regions/fr-par/routing-policies",
			call: () =>
				httpHandlers.handleCreateRoutingPolicy({
					region: "fr-par",
					name: "test",
					isIpv6: false,
					prefixFilterIn: [],
					prefixFilterOut: [],
				}),
			body: { name: "test", is_ipv6: false, prefix_filter_in: [], prefix_filter_out: [] },
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

	// Official InterLink v1beta1 OpenAPI: DeleteRoutingPolicy has only a 204 response.
	// DELETE /interlink/v1beta1/regions/{region}/routing-policies/{routing_policy_id}
	it("DeleteRoutingPolicy returns valid MCP text after SDK parses HTTP 204 as undefined", async () => {
		const { requests } = recordingClient(undefined, 204);
		const result = await httpHandlers.handleDeleteRoutingPolicy({
			region: VALID_REGION,
			routingPolicyId: VALID_UUID,
		});
		expect(requests).toHaveLength(1);
		expect(requests[0].method).toBe("DELETE");
		expect(requests[0].url).toBe(
			`https://scaleway.invalid/interlink/v1beta1/regions/fr-par/routing-policies/${VALID_UUID}`,
		);
		expect(requests[0].body).toBeNull();
		expect(CallToolResultSchema.parse(result)).toEqual({
			content: [
				{
					type: "text",
					text: JSON.stringify({ message: "Routing policy deleted successfully" }, null, 2),
				},
			],
		});
	});

	it("DeleteRoutingPolicy propagates SDK HTTP 403 instead of acknowledging deletion", async () => {
		const { requests } = recordingClient({ message: "Denied" }, 403);
		const result = await httpHandlers.handleDeleteRoutingPolicy({
			region: VALID_REGION,
			routingPolicyId: VALID_UUID,
		});
		expect(requests).toHaveLength(1);
		expect(result).toMatchObject({ isError: true });
		expect(JSON.parse(result.content[0].text)).toMatchObject({
			error: { type: "permission_denied", statusCode: 403 },
		});
	});

	// These DELETE endpoints return HTTP 200 JSON resource bodies, not HTTP 204.
	it("DeleteLink preserves the HTTP 200 resource response", async () => {
		const response = { id: "11111111-1111-1111-1111-111111111111", status: "deleting" };
		const { requests } = recordingClient(response);
		const result = await httpHandlers.handleDeleteLink({
			region: "fr-par",
			linkId: "11111111-1111-1111-1111-111111111111",
		});
		expect(requests).toHaveLength(1);
		expect(requests[0].method).toBe("DELETE");
		expect(new URL(requests[0].url).pathname).toBe(
			"/interlink/v1beta1/regions/fr-par/links/11111111-1111-1111-1111-111111111111",
		);
		expect(requests[0].body).toBeNull();
		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
		});
	});
});
