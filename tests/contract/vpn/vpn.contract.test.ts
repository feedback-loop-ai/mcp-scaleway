/**
 * Contract tests for Scaleway Site-to-Site VPN API (s2s-vpn/v1alpha1)
 *
 * Validates request/response shapes against specs/scaleway-api/vpn/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	ChangeConnectionPskParams,
	Connection,
	ConnectionCipher,
	CreateConnectionParams,
	CreateCustomerGatewayParams,
	CreateRoutingPolicyParams,
	CreateVpnGatewayParams,
	CustomerGateway,
	DeleteConnectionParams,
	DeleteCustomerGatewayParams,
	DeleteRoutingPolicyParams,
	DeleteVpnGatewayParams,
	DetachConnectionRoutingPolicyParams,
	GetConnectionParams,
	GetCustomerGatewayParams,
	GetRoutingPolicyParams,
	GetVpnGatewayParams,
	ListConnectionsParams,
	ListConnectionsResponse,
	ListCustomerGatewaysParams,
	ListCustomerGatewaysResponse,
	ListRoutingPoliciesParams,
	ListRoutingPoliciesResponse,
	ListVpnGatewayTypesParams,
	ListVpnGatewayTypesResponse,
	ListVpnGatewaysParams,
	ListVpnGatewaysResponse,
	RenewConnectionPskParams,
	RoutePropagationParams,
	RoutingPolicy,
	SetConnectionRoutingPolicyParams,
	UpdateConnectionParams,
	UpdateCustomerGatewayParams,
	UpdateRoutingPolicyParams,
	UpdateVpnGatewayParams,
	VpnGateway,
	VpnGatewayType,
} from "../../../src/tools/vpn/types.js";

const UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const REGION = "fr-par";

// --- Fixtures ---

const validVpnGateway = {
	id: UUID,
	project_id: UUID,
	organization_id: UUID,
	name: "my-gateway",
	tags: ["prod"],
	status: "active" as const,
	gateway_type: "VGW-S",
	private_network_id: UUID,
	asn: 12876,
	connection_ids: [UUID],
	zone: "fr-par-1",
	region: REGION,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
};

const validGatewayType = {
	name: "VGW-S",
	bandwidth: 100000000,
	allowed_connections: 10,
	zones: ["fr-par-1"],
	region: REGION,
};

const validCustomerGateway = {
	id: UUID,
	project_id: UUID,
	organization_id: UUID,
	name: "my-customer-gw",
	tags: ["prod"],
	public_ipv4: "1.2.3.4",
	public_ipv6: null,
	asn: 65000,
	connection_ids: [UUID],
	region: REGION,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
};

const validConnection = {
	id: UUID,
	project_id: UUID,
	organization_id: UUID,
	name: "my-connection",
	tags: [],
	status: "active" as const,
	is_ipv6: false,
	initiation_policy: "vpn_gateway" as const,
	secret_id: UUID,
	secret_revision: 1,
	ikev2_ciphers: [{ encryption: "aes256", integrity: "sha256", dh_group: "modp2048" }],
	esp_ciphers: [{ encryption: "aes256gcm" }],
	route_propagation_enabled: true,
	vpn_gateway_id: UUID,
	customer_gateway_id: UUID,
	region: REGION,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
};

const validRoutingPolicy = {
	id: UUID,
	project_id: UUID,
	organization_id: UUID,
	name: "my-policy",
	tags: ["prod"],
	is_ipv6: false,
	prefix_filter_in: ["10.0.0.0/8"],
	prefix_filter_out: ["192.168.0.0/16"],
	region: REGION,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
};

// --- VPN Gateways ---

/**
 * API: GET /s2s-vpn/v1alpha1/regions/{region}/vpn-gateways
 * Spec: specs/scaleway-api/vpn/api-reference.md#list-vpn-gateways
 */
describe("contract: ListVpnGateways", () => {
	it("validates response shape", () => {
		expect(() =>
			ListVpnGatewaysResponse.parse({ vpn_gateways: [validVpnGateway], total_count: 1 }),
		).not.toThrow();
	});

	it("validates empty response", () => {
		expect(() => ListVpnGatewaysResponse.parse({ vpn_gateways: [], total_count: 0 })).not.toThrow();
	});

	it("rejects missing array", () => {
		expect(() => ListVpnGatewaysResponse.parse({ total_count: 0 })).toThrow();
	});

	it("validates request with filters", () => {
		expect(() =>
			ListVpnGatewaysParams.parse({
				region: REGION,
				projectId: UUID,
				name: "gw",
				orderBy: "status_desc",
			}),
		).not.toThrow();
	});

	it("validates all gateway statuses", () => {
		for (const status of [
			"unknown_status",
			"configuring",
			"failed",
			"provisioning",
			"active",
			"deprovisioning",
			"locked",
		]) {
			expect(() => VpnGateway.parse({ ...validVpnGateway, status })).not.toThrow();
		}
	});

	it("rejects invalid status", () => {
		expect(() => VpnGateway.parse({ ...validVpnGateway, status: "running" })).toThrow();
	});

	it("allows null private_network_id", () => {
		expect(() => VpnGateway.parse({ ...validVpnGateway, private_network_id: null })).not.toThrow();
	});
});

/**
 * API: GET /s2s-vpn/v1alpha1/regions/{region}/vpn-gateways/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#get-vpn-gateway
 */
describe("contract: GetVpnGateway", () => {
	it("validates entity", () => {
		expect(() => VpnGateway.parse(validVpnGateway)).not.toThrow();
	});
	it("validates request", () => {
		expect(() => GetVpnGatewayParams.parse({ region: REGION, gatewayId: UUID })).not.toThrow();
	});
	it("rejects missing id", () => {
		expect(() => GetVpnGatewayParams.parse({ region: REGION })).toThrow();
	});
});

/**
 * API: POST /s2s-vpn/v1alpha1/regions/{region}/vpn-gateways
 * Spec: specs/scaleway-api/vpn/api-reference.md#create-vpn-gateway
 */
describe("contract: CreateVpnGateway", () => {
	it("validates minimal request", () => {
		expect(() =>
			CreateVpnGatewayParams.parse({
				region: REGION,
				name: "gw",
				gatewayType: "VGW-S",
				privateNetworkId: UUID,
			}),
		).not.toThrow();
	});
	it("validates full request", () => {
		expect(() =>
			CreateVpnGatewayParams.parse({
				region: REGION,
				name: "gw",
				gatewayType: "VGW-S",
				privateNetworkId: UUID,
				projectId: UUID,
				tags: ["t"],
				zone: "fr-par-1",
				ipamPrivateIpv4Id: UUID,
				ipamPrivateIpv6Id: UUID,
			}),
		).not.toThrow();
	});
	it("rejects missing required fields", () => {
		expect(() => CreateVpnGatewayParams.parse({ region: REGION, name: "gw" })).toThrow();
	});
});

/**
 * API: PATCH /s2s-vpn/v1alpha1/regions/{region}/vpn-gateways/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#update-vpn-gateway
 */
describe("contract: UpdateVpnGateway", () => {
	it("validates update with fields", () => {
		expect(() =>
			UpdateVpnGatewayParams.parse({ region: REGION, gatewayId: UUID, name: "x", tags: ["t"] }),
		).not.toThrow();
	});
	it("validates update with no optional fields", () => {
		expect(() => UpdateVpnGatewayParams.parse({ region: REGION, gatewayId: UUID })).not.toThrow();
	});
});

/**
 * API: DELETE /s2s-vpn/v1alpha1/regions/{region}/vpn-gateways/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#delete-vpn-gateway
 */
describe("contract: DeleteVpnGateway", () => {
	it("validates request", () => {
		expect(() => DeleteVpnGatewayParams.parse({ region: REGION, gatewayId: UUID })).not.toThrow();
	});
});

/**
 * API: GET /s2s-vpn/v1alpha1/regions/{region}/vpn-gateway-types
 * Spec: specs/scaleway-api/vpn/api-reference.md#list-vpn-gateway-types
 */
describe("contract: ListVpnGatewayTypes", () => {
	it("validates response shape", () => {
		expect(() =>
			ListVpnGatewayTypesResponse.parse({ gateway_types: [validGatewayType], total_count: 1 }),
		).not.toThrow();
	});
	it("validates gateway type entity", () => {
		expect(() => VpnGatewayType.parse(validGatewayType)).not.toThrow();
	});
	it("validates request", () => {
		expect(() => ListVpnGatewayTypesParams.parse({ region: REGION })).not.toThrow();
	});
});

// --- Customer Gateways ---

/**
 * API: GET /s2s-vpn/v1alpha1/regions/{region}/customer-gateways
 * Spec: specs/scaleway-api/vpn/api-reference.md#list-customer-gateways
 */
describe("contract: ListCustomerGateways", () => {
	it("validates response shape", () => {
		expect(() =>
			ListCustomerGatewaysResponse.parse({
				customer_gateways: [validCustomerGateway],
				total_count: 1,
			}),
		).not.toThrow();
	});
	it("validates request with filters", () => {
		expect(() =>
			ListCustomerGatewaysParams.parse({
				region: REGION,
				projectId: UUID,
				name: "cg",
				orderBy: "name_desc",
			}),
		).not.toThrow();
	});
	it("allows null public IPs", () => {
		expect(() =>
			CustomerGateway.parse({ ...validCustomerGateway, public_ipv4: null, public_ipv6: null }),
		).not.toThrow();
	});
});

/**
 * API: GET /s2s-vpn/v1alpha1/regions/{region}/customer-gateways/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#get-customer-gateway
 */
describe("contract: GetCustomerGateway", () => {
	it("validates entity", () => {
		expect(() => CustomerGateway.parse(validCustomerGateway)).not.toThrow();
	});
	it("validates request", () => {
		expect(() =>
			GetCustomerGatewayParams.parse({ region: REGION, customerGatewayId: UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /s2s-vpn/v1alpha1/regions/{region}/customer-gateways
 * Spec: specs/scaleway-api/vpn/api-reference.md#create-customer-gateway
 */
describe("contract: CreateCustomerGateway", () => {
	it("validates minimal request", () => {
		expect(() =>
			CreateCustomerGatewayParams.parse({ region: REGION, name: "cg", asn: 65000 }),
		).not.toThrow();
	});
	it("validates full request", () => {
		expect(() =>
			CreateCustomerGatewayParams.parse({
				region: REGION,
				name: "cg",
				asn: 65000,
				projectId: UUID,
				tags: ["t"],
				ipv4Public: "1.2.3.4",
				ipv6Public: "2001:db8::1",
			}),
		).not.toThrow();
	});
	it("rejects missing asn", () => {
		expect(() => CreateCustomerGatewayParams.parse({ region: REGION, name: "cg" })).toThrow();
	});
});

/**
 * API: PATCH /s2s-vpn/v1alpha1/regions/{region}/customer-gateways/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#update-customer-gateway
 */
describe("contract: UpdateCustomerGateway", () => {
	it("validates update with all fields", () => {
		expect(() =>
			UpdateCustomerGatewayParams.parse({
				region: REGION,
				customerGatewayId: UUID,
				name: "x",
				tags: ["t"],
				ipv4Public: "1.2.3.4",
				ipv6Public: "2001:db8::1",
				asn: 65001,
			}),
		).not.toThrow();
	});
	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateCustomerGatewayParams.parse({ region: REGION, customerGatewayId: UUID }),
		).not.toThrow();
	});
});

/**
 * API: DELETE /s2s-vpn/v1alpha1/regions/{region}/customer-gateways/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#delete-customer-gateway
 */
describe("contract: DeleteCustomerGateway", () => {
	it("validates request", () => {
		expect(() =>
			DeleteCustomerGatewayParams.parse({ region: REGION, customerGatewayId: UUID }),
		).not.toThrow();
	});
});

// --- Connections ---

/**
 * API: GET /s2s-vpn/v1alpha1/regions/{region}/connections
 * Spec: specs/scaleway-api/vpn/api-reference.md#list-connections
 */
describe("contract: ListConnections", () => {
	it("validates response shape", () => {
		expect(() =>
			ListConnectionsResponse.parse({ connections: [validConnection], total_count: 1 }),
		).not.toThrow();
	});
	it("validates request with filters", () => {
		expect(() =>
			ListConnectionsParams.parse({
				region: REGION,
				projectId: UUID,
				name: "conn",
				isIpv6: true,
				vpnGatewayId: UUID,
				customerGatewayId: UUID,
				orderBy: "created_at_asc",
			}),
		).not.toThrow();
	});
	it("validates all connection statuses", () => {
		for (const status of ["unknown_status", "active", "limited_connectivity", "down", "locked"]) {
			expect(() => Connection.parse({ ...validConnection, status })).not.toThrow();
		}
	});
	it("rejects invalid status", () => {
		expect(() => Connection.parse({ ...validConnection, status: "bogus" })).toThrow();
	});
	it("allows null secret_id", () => {
		expect(() => Connection.parse({ ...validConnection, secret_id: null })).not.toThrow();
	});
});

/**
 * API: GET /s2s-vpn/v1alpha1/regions/{region}/connections/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#get-connection
 */
describe("contract: GetConnection", () => {
	it("validates entity", () => {
		expect(() => Connection.parse(validConnection)).not.toThrow();
	});
	it("validates request", () => {
		expect(() => GetConnectionParams.parse({ region: REGION, connectionId: UUID })).not.toThrow();
	});
});

/**
 * API: POST /s2s-vpn/v1alpha1/regions/{region}/connections
 * Spec: specs/scaleway-api/vpn/api-reference.md#create-connection
 */
describe("contract: CreateConnection", () => {
	const cipher = { encryption: "aes256", integrity: "sha256" };

	it("validates minimal request", () => {
		expect(() =>
			CreateConnectionParams.parse({
				region: REGION,
				name: "conn",
				initiationPolicy: "vpn_gateway",
				ikev2Ciphers: [cipher],
				espCiphers: [cipher],
				vpnGatewayId: UUID,
				customerGatewayId: UUID,
			}),
		).not.toThrow();
	});
	it("validates full request with BGP config", () => {
		expect(() =>
			CreateConnectionParams.parse({
				region: REGION,
				name: "conn",
				initiationPolicy: "customer_gateway",
				ikev2Ciphers: [cipher],
				espCiphers: [cipher],
				vpnGatewayId: UUID,
				customerGatewayId: UUID,
				projectId: UUID,
				tags: ["t"],
				isIpv6: true,
				enableRoutePropagation: true,
				bgpConfigIpv4: { routing_policy_id: UUID, private_ip: "10.0.0.1/32" },
				bgpConfigIpv6: { routing_policy_id: UUID },
			}),
		).not.toThrow();
	});
	it("rejects empty cipher list", () => {
		expect(() =>
			CreateConnectionParams.parse({
				region: REGION,
				name: "conn",
				initiationPolicy: "vpn_gateway",
				ikev2Ciphers: [],
				espCiphers: [cipher],
				vpnGatewayId: UUID,
				customerGatewayId: UUID,
			}),
		).toThrow();
	});
	it("validates all cipher enum values", () => {
		for (const encryption of [
			"aes128",
			"aes192",
			"aes256",
			"aes128gcm",
			"aes192gcm",
			"aes256gcm",
			"aes128ccm",
			"aes256ccm",
			"chacha20poly1305",
		]) {
			expect(() => ConnectionCipher.parse({ encryption })).not.toThrow();
		}
		for (const dh_group of [
			"modp2048",
			"modp3072",
			"modp4096",
			"ecp256",
			"ecp384",
			"ecp521",
			"curve25519",
		]) {
			expect(() =>
				ConnectionCipher.parse({ encryption: "aes256", integrity: "sha512", dh_group }),
			).not.toThrow();
		}
	});
	it("rejects invalid encryption", () => {
		expect(() => ConnectionCipher.parse({ encryption: "des" })).toThrow();
	});
});

/**
 * API: PATCH /s2s-vpn/v1alpha1/regions/{region}/connections/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#update-connection
 */
describe("contract: UpdateConnection", () => {
	it("validates update with fields", () => {
		expect(() =>
			UpdateConnectionParams.parse({ region: REGION, connectionId: UUID, name: "x", tags: ["t"] }),
		).not.toThrow();
	});
	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateConnectionParams.parse({ region: REGION, connectionId: UUID }),
		).not.toThrow();
	});
});

/**
 * API: DELETE /s2s-vpn/v1alpha1/regions/{region}/connections/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#delete-connection
 */
describe("contract: DeleteConnection", () => {
	it("validates request", () => {
		expect(() =>
			DeleteConnectionParams.parse({ region: REGION, connectionId: UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /s2s-vpn/v1alpha1/regions/{region}/connections/{id}/renew-psk
 * Spec: specs/scaleway-api/vpn/api-reference.md#renew-connection-psk
 */
describe("contract: RenewConnectionPsk", () => {
	it("validates request", () => {
		expect(() =>
			RenewConnectionPskParams.parse({ region: REGION, connectionId: UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /s2s-vpn/v1alpha1/regions/{region}/connections/{id}/change-psk
 * Spec: specs/scaleway-api/vpn/api-reference.md#change-connection-psk
 */
describe("contract: ChangeConnectionPsk", () => {
	it("validates request with revision", () => {
		expect(() =>
			ChangeConnectionPskParams.parse({
				region: REGION,
				connectionId: UUID,
				secretId: UUID,
				secretRevision: 2,
			}),
		).not.toThrow();
	});
	it("validates request without revision", () => {
		expect(() =>
			ChangeConnectionPskParams.parse({ region: REGION, connectionId: UUID, secretId: UUID }),
		).not.toThrow();
	});
	it("rejects missing secretId", () => {
		expect(() => ChangeConnectionPskParams.parse({ region: REGION, connectionId: UUID })).toThrow();
	});
});

/**
 * API: POST /s2s-vpn/v1alpha1/regions/{region}/connections/{id}/set-routing-policy
 * Spec: specs/scaleway-api/vpn/api-reference.md#set-connection-routing-policy
 */
describe("contract: SetConnectionRoutingPolicy", () => {
	it("validates request with both policies", () => {
		expect(() =>
			SetConnectionRoutingPolicyParams.parse({
				region: REGION,
				connectionId: UUID,
				routingPolicyV4: UUID,
				routingPolicyV6: UUID,
			}),
		).not.toThrow();
	});
	it("validates request with no policy", () => {
		expect(() =>
			SetConnectionRoutingPolicyParams.parse({ region: REGION, connectionId: UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /s2s-vpn/v1alpha1/regions/{region}/connections/{id}/detach-routing-policy
 * Spec: specs/scaleway-api/vpn/api-reference.md#detach-connection-routing-policy
 */
describe("contract: DetachConnectionRoutingPolicy", () => {
	it("validates request", () => {
		expect(() =>
			DetachConnectionRoutingPolicyParams.parse({
				region: REGION,
				connectionId: UUID,
				routingPolicyV4: UUID,
			}),
		).not.toThrow();
	});
});

/**
 * API: POST /s2s-vpn/v1alpha1/regions/{region}/connections/{id}/enable-route-propagation
 *      POST /s2s-vpn/v1alpha1/regions/{region}/connections/{id}/disable-route-propagation
 * Spec: specs/scaleway-api/vpn/api-reference.md#route-propagation
 */
describe("contract: RoutePropagation", () => {
	it("validates request", () => {
		expect(() =>
			RoutePropagationParams.parse({ region: REGION, connectionId: UUID }),
		).not.toThrow();
	});
	it("rejects missing connectionId", () => {
		expect(() => RoutePropagationParams.parse({ region: REGION })).toThrow();
	});
});

// --- Routing Policies ---

/**
 * API: GET /s2s-vpn/v1alpha1/regions/{region}/routing-policies
 * Spec: specs/scaleway-api/vpn/api-reference.md#list-routing-policies
 */
describe("contract: ListRoutingPolicies", () => {
	it("validates response shape", () => {
		expect(() =>
			ListRoutingPoliciesResponse.parse({ routing_policies: [validRoutingPolicy], total_count: 1 }),
		).not.toThrow();
	});
	it("validates request with filters", () => {
		expect(() =>
			ListRoutingPoliciesParams.parse({
				region: REGION,
				projectId: UUID,
				name: "rp",
				isIpv6: true,
			}),
		).not.toThrow();
	});
});

/**
 * API: GET /s2s-vpn/v1alpha1/regions/{region}/routing-policies/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#get-routing-policy
 */
describe("contract: GetRoutingPolicy", () => {
	it("validates entity", () => {
		expect(() => RoutingPolicy.parse(validRoutingPolicy)).not.toThrow();
	});
	it("validates request", () => {
		expect(() =>
			GetRoutingPolicyParams.parse({ region: REGION, routingPolicyId: UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /s2s-vpn/v1alpha1/regions/{region}/routing-policies
 * Spec: specs/scaleway-api/vpn/api-reference.md#create-routing-policy
 */
describe("contract: CreateRoutingPolicy", () => {
	it("validates minimal request", () => {
		expect(() =>
			CreateRoutingPolicyParams.parse({
				region: REGION,
				name: "rp",
				isIpv6: false,
				prefixFilterIn: [],
				prefixFilterOut: [],
			}),
		).not.toThrow();
	});
	it("validates full request", () => {
		expect(() =>
			CreateRoutingPolicyParams.parse({
				region: REGION,
				name: "rp",
				isIpv6: true,
				prefixFilterIn: ["fd00::/8"],
				prefixFilterOut: ["2001:db8::/32"],
				projectId: UUID,
				tags: ["t"],
			}),
		).not.toThrow();
	});
	it("rejects missing is_ipv6", () => {
		expect(() =>
			CreateRoutingPolicyParams.parse({
				region: REGION,
				name: "rp",
				prefixFilterIn: [],
				prefixFilterOut: [],
			}),
		).toThrow();
	});
});

/**
 * API: PATCH /s2s-vpn/v1alpha1/regions/{region}/routing-policies/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#update-routing-policy
 */
describe("contract: UpdateRoutingPolicy", () => {
	it("validates update with all fields", () => {
		expect(() =>
			UpdateRoutingPolicyParams.parse({
				region: REGION,
				routingPolicyId: UUID,
				name: "x",
				tags: ["t"],
				prefixFilterIn: ["10.0.0.0/8"],
				prefixFilterOut: ["192.168.0.0/16"],
			}),
		).not.toThrow();
	});
	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateRoutingPolicyParams.parse({ region: REGION, routingPolicyId: UUID }),
		).not.toThrow();
	});
});

/**
 * API: DELETE /s2s-vpn/v1alpha1/regions/{region}/routing-policies/{id}
 * Spec: specs/scaleway-api/vpn/api-reference.md#delete-routing-policy
 */
describe("contract: DeleteRoutingPolicy", () => {
	it("validates request", () => {
		expect(() =>
			DeleteRoutingPolicyParams.parse({ region: REGION, routingPolicyId: UUID }),
		).not.toThrow();
	});
});

// --- Pagination & auth contracts ---

describe("contract: pagination", () => {
	it("applies default pagination", () => {
		const r = ListVpnGatewaysParams.parse({ region: REGION });
		expect(r.page).toBe(1);
		expect(r.pageSize).toBe(50);
	});
	it("rejects page size over 100", () => {
		expect(() => ListVpnGatewaysParams.parse({ region: REGION, pageSize: 101 })).toThrow();
	});
	it("rejects page 0", () => {
		expect(() => ListVpnGatewaysParams.parse({ region: REGION, page: 0 })).toThrow();
	});
});

describe("contract: authentication and region", () => {
	it("requires region for all list operations", () => {
		expect(() => ListVpnGatewaysParams.parse({})).toThrow();
		expect(() => ListConnectionsParams.parse({})).toThrow();
		expect(() => ListRoutingPoliciesParams.parse({})).toThrow();
	});
	it("validates region format", () => {
		expect(() => ListVpnGatewaysParams.parse({ region: "fr-par" })).not.toThrow();
		expect(() => ListVpnGatewaysParams.parse({ region: "invalid-region" })).toThrow();
	});
});
