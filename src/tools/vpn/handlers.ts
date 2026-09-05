import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	ChangeConnectionPskParams,
	CreateConnectionParams,
	CreateCustomerGatewayParams,
	CreateRoutingPolicyParams,
	CreateVpnGatewayParams,
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
	ListCustomerGatewaysParams,
	ListRoutingPoliciesParams,
	ListVpnGatewayTypesParams,
	ListVpnGatewaysParams,
	RenewConnectionPskParams,
	RoutePropagationParams,
	SetConnectionRoutingPolicyParams,
	UpdateConnectionParams,
	UpdateCustomerGatewayParams,
	UpdateRoutingPolicyParams,
	UpdateVpnGatewayParams,
} from "./types.js";

const VPN_API_PREFIX = "/s2s-vpn/v1alpha1/regions";
const JSON_HEADERS = { "Content-Type": "application/json" };

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- VPN Gateway Handlers ---

export async function handleListVpnGateways(params: ListVpnGatewaysParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			vpn_gateways: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${VPN_API_PREFIX}/${params.region}/vpn-gateways`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["name", params.name],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.vpn_gateways,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetVpnGateway(params: GetVpnGatewayParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${VPN_API_PREFIX}/${params.region}/vpn-gateways/${params.gatewayId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateVpnGateway(params: CreateVpnGatewayParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: params.name,
			gateway_type: params.gatewayType,
			private_network_id: params.privateNetworkId,
		};
		if (params.projectId) {
			body.project_id = params.projectId;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		if (params.zone) {
			body.zone = params.zone;
		}
		if (params.ipamPrivateIpv4Id) {
			body.ipam_private_ipv4_id = params.ipamPrivateIpv4Id;
		}
		if (params.ipamPrivateIpv6Id) {
			body.ipam_private_ipv6_id = params.ipamPrivateIpv6Id;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${VPN_API_PREFIX}/${params.region}/vpn-gateways`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateVpnGateway(params: UpdateVpnGatewayParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.name) {
			body.name = params.name;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${VPN_API_PREFIX}/${params.region}/vpn-gateways/${params.gatewayId}`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteVpnGateway(params: DeleteVpnGatewayParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${VPN_API_PREFIX}/${params.region}/vpn-gateways/${params.gatewayId}`,
		});
		return jsonResponse({ deleted: true, id: params.gatewayId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListVpnGatewayTypes(params: ListVpnGatewayTypesParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			gateway_types: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${VPN_API_PREFIX}/${params.region}/vpn-gateway-types`,
			urlParams: urlParams(["page", params.page], ["page_size", params.pageSize]),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.gateway_types,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Customer Gateway Handlers ---

export async function handleListCustomerGateways(params: ListCustomerGatewaysParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			customer_gateways: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${VPN_API_PREFIX}/${params.region}/customer-gateways`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["name", params.name],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.customer_gateways,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetCustomerGateway(params: GetCustomerGatewayParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${VPN_API_PREFIX}/${params.region}/customer-gateways/${params.customerGatewayId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateCustomerGateway(params: CreateCustomerGatewayParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: params.name,
			asn: params.asn,
		};
		if (params.projectId) {
			body.project_id = params.projectId;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		if (params.ipv4Public) {
			body.ipv4_public = params.ipv4Public;
		}
		if (params.ipv6Public) {
			body.ipv6_public = params.ipv6Public;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${VPN_API_PREFIX}/${params.region}/customer-gateways`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateCustomerGateway(params: UpdateCustomerGatewayParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.name) {
			body.name = params.name;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		if (params.ipv4Public) {
			body.ipv4_public = params.ipv4Public;
		}
		if (params.ipv6Public) {
			body.ipv6_public = params.ipv6Public;
		}
		if (params.asn !== undefined) {
			body.asn = params.asn;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${VPN_API_PREFIX}/${params.region}/customer-gateways/${params.customerGatewayId}`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteCustomerGateway(params: DeleteCustomerGatewayParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${VPN_API_PREFIX}/${params.region}/customer-gateways/${params.customerGatewayId}`,
		});
		return jsonResponse({ deleted: true, id: params.customerGatewayId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Connection Handlers ---

export async function handleListConnections(params: ListConnectionsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			connections: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${VPN_API_PREFIX}/${params.region}/connections`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["name", params.name],
				["is_ipv6", params.isIpv6],
				["vpn_gateway_ids", params.vpnGatewayId],
				["customer_gateway_ids", params.customerGatewayId],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.connections,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetConnection(params: GetConnectionParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${VPN_API_PREFIX}/${params.region}/connections/${params.connectionId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateConnection(params: CreateConnectionParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: params.name,
			initiation_policy: params.initiationPolicy,
			ikev2_ciphers: params.ikev2Ciphers,
			esp_ciphers: params.espCiphers,
			vpn_gateway_id: params.vpnGatewayId,
			customer_gateway_id: params.customerGatewayId,
		};
		if (params.projectId) {
			body.project_id = params.projectId;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		if (params.isIpv6 !== undefined) {
			body.is_ipv6 = params.isIpv6;
		}
		if (params.enableRoutePropagation !== undefined) {
			body.enable_route_propagation = params.enableRoutePropagation;
		}
		if (params.bgpConfigIpv4) {
			body.bgp_config_ipv4 = params.bgpConfigIpv4;
		}
		if (params.bgpConfigIpv6) {
			body.bgp_config_ipv6 = params.bgpConfigIpv6;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${VPN_API_PREFIX}/${params.region}/connections`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateConnection(params: UpdateConnectionParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.name) {
			body.name = params.name;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${VPN_API_PREFIX}/${params.region}/connections/${params.connectionId}`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteConnection(params: DeleteConnectionParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${VPN_API_PREFIX}/${params.region}/connections/${params.connectionId}`,
		});
		return jsonResponse({ deleted: true, id: params.connectionId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRenewConnectionPsk(params: RenewConnectionPskParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${VPN_API_PREFIX}/${params.region}/connections/${params.connectionId}/renew-psk`,
			body: JSON.stringify({}),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleChangeConnectionPsk(params: ChangeConnectionPskParams) {
	try {
		const client = getClient();
		const secret: Record<string, unknown> = { id: params.secretId };
		if (params.secretRevision !== undefined) {
			secret.revision = params.secretRevision;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${VPN_API_PREFIX}/${params.region}/connections/${params.connectionId}/change-psk`,
			body: JSON.stringify({ secret }),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleSetConnectionRoutingPolicy(params: SetConnectionRoutingPolicyParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.routingPolicyV4) {
			body.routing_policy_v4 = params.routingPolicyV4;
		}
		if (params.routingPolicyV6) {
			body.routing_policy_v6 = params.routingPolicyV6;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${VPN_API_PREFIX}/${params.region}/connections/${params.connectionId}/set-routing-policy`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDetachConnectionRoutingPolicy(
	params: DetachConnectionRoutingPolicyParams,
) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.routingPolicyV4) {
			body.routing_policy_v4 = params.routingPolicyV4;
		}
		if (params.routingPolicyV6) {
			body.routing_policy_v6 = params.routingPolicyV6;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${VPN_API_PREFIX}/${params.region}/connections/${params.connectionId}/detach-routing-policy`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleEnableRoutePropagation(params: RoutePropagationParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${VPN_API_PREFIX}/${params.region}/connections/${params.connectionId}/enable-route-propagation`,
			body: JSON.stringify({}),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDisableRoutePropagation(params: RoutePropagationParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${VPN_API_PREFIX}/${params.region}/connections/${params.connectionId}/disable-route-propagation`,
			body: JSON.stringify({}),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Routing Policy Handlers ---

export async function handleListRoutingPolicies(params: ListRoutingPoliciesParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			routing_policies: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${VPN_API_PREFIX}/${params.region}/routing-policies`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["name", params.name],
				["is_ipv6", params.isIpv6],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.routing_policies,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetRoutingPolicy(params: GetRoutingPolicyParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${VPN_API_PREFIX}/${params.region}/routing-policies/${params.routingPolicyId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateRoutingPolicy(params: CreateRoutingPolicyParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: params.name,
			is_ipv6: params.isIpv6,
			prefix_filter_in: params.prefixFilterIn,
			prefix_filter_out: params.prefixFilterOut,
		};
		if (params.projectId) {
			body.project_id = params.projectId;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${VPN_API_PREFIX}/${params.region}/routing-policies`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateRoutingPolicy(params: UpdateRoutingPolicyParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.name) {
			body.name = params.name;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		if (params.prefixFilterIn) {
			body.prefix_filter_in = params.prefixFilterIn;
		}
		if (params.prefixFilterOut) {
			body.prefix_filter_out = params.prefixFilterOut;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${VPN_API_PREFIX}/${params.region}/routing-policies/${params.routingPolicyId}`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteRoutingPolicy(params: DeleteRoutingPolicyParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${VPN_API_PREFIX}/${params.region}/routing-policies/${params.routingPolicyId}`,
		});
		return jsonResponse({ deleted: true, id: params.routingPolicyId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
