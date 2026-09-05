import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	AttachRoutingPolicyParams,
	AttachVpcParams,
	CreateLinkParams,
	CreateRoutingPolicyParams,
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
	ListDedicatedConnectionsParams,
	ListLinksParams,
	ListPartnersParams,
	ListPopsParams,
	ListRoutingPoliciesParams,
	SetRoutingPolicyParams,
	UpdateLinkParams,
	UpdateRoutingPolicyParams,
} from "./types.js";

const INTERLINK_API_PREFIX = "/interlink/v1beta1/regions";
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

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

export async function handleListLinks(params: ListLinksParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{ links: unknown[]; total_count: number }>({
			method: "GET",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["organization_id", params.organizationId],
				["name", params.name],
				["tags", params.tags],
				["status", params.status],
				["bgp_v4_status", params.bgpV4Status],
				["bgp_v6_status", params.bgpV6Status],
				["pop_id", params.popId],
				["bandwidth_mbps", params.bandwidthMbps],
				["partner_id", params.partnerId],
				["vpc_id", params.vpcId],
				["routing_policy_id", params.routingPolicyId],
				["pairing_key", params.pairingKey],
				["kind", params.kind],
				["connection_id", params.connectionId],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.links, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetLink(params: GetLinkParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links/${params.linkId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateLink(params: CreateLinkParams) {
	try {
		const client = getClient();
		const body = {
			name: params.name,
			pop_id: params.popId,
			bandwidth_mbps: params.bandwidthMbps,
			project_id: params.projectId,
			tags: params.tags,
			connection_id: params.connectionId,
			partner_id: params.partnerId,
			peer_asn: params.peerAsn,
			vlan: params.vlan,
			routing_policy_v4_id: params.routingPolicyV4Id,
			routing_policy_v6_id: params.routingPolicyV6Id,
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateLink(params: UpdateLinkParams) {
	try {
		const client = getClient();
		const body = {
			name: params.name,
			tags: params.tags,
			peer_asn: params.peerAsn,
		};
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links/${params.linkId}`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteLink(params: DeleteLinkParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links/${params.linkId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleAttachVpc(params: AttachVpcParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links/${params.linkId}/attach-vpc`,
			body: JSON.stringify({ vpc_id: params.vpcId }),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDetachVpc(params: DetachVpcParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links/${params.linkId}/detach-vpc`,
			body: JSON.stringify({}),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleAttachRoutingPolicy(params: AttachRoutingPolicyParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links/${params.linkId}/attach-routing-policy`,
			body: JSON.stringify({ routing_policy_id: params.routingPolicyId }),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDetachRoutingPolicy(params: DetachRoutingPolicyParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links/${params.linkId}/detach-routing-policy`,
			body: JSON.stringify({ routing_policy_id: params.routingPolicyId }),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleSetRoutingPolicy(params: SetRoutingPolicyParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links/${params.linkId}/set-routing-policy`,
			body: JSON.stringify({ routing_policy_id: params.routingPolicyId }),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleEnableRoutePropagation(params: EnableRoutePropagationParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links/${params.linkId}/enable-route-propagation`,
			body: JSON.stringify({}),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDisableRoutePropagation(params: DisableRoutePropagationParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${INTERLINK_API_PREFIX}/${params.region}/links/${params.linkId}/disable-route-propagation`,
			body: JSON.stringify({}),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ---------------------------------------------------------------------------
// Routing policies
// ---------------------------------------------------------------------------

export async function handleListRoutingPolicies(params: ListRoutingPoliciesParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			routing_policies: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${INTERLINK_API_PREFIX}/${params.region}/routing-policies`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["organization_id", params.organizationId],
				["name", params.name],
				["tags", params.tags],
				["ipv6", params.ipv6],
				["order_by", params.orderBy],
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
			path: `${INTERLINK_API_PREFIX}/${params.region}/routing-policies/${params.routingPolicyId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateRoutingPolicy(params: CreateRoutingPolicyParams) {
	try {
		const client = getClient();
		const body = {
			name: params.name,
			is_ipv6: params.isIpv6,
			project_id: params.projectId,
			tags: params.tags,
			prefix_filter_in: params.prefixFilterIn,
			prefix_filter_out: params.prefixFilterOut,
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${INTERLINK_API_PREFIX}/${params.region}/routing-policies`,
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
		const body = {
			name: params.name,
			tags: params.tags,
			prefix_filter_in: params.prefixFilterIn,
			prefix_filter_out: params.prefixFilterOut,
		};
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${INTERLINK_API_PREFIX}/${params.region}/routing-policies/${params.routingPolicyId}`,
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
			path: `${INTERLINK_API_PREFIX}/${params.region}/routing-policies/${params.routingPolicyId}`,
		});
		return jsonResponse({ message: "Routing policy deleted successfully" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ---------------------------------------------------------------------------
// Partners
// ---------------------------------------------------------------------------

export async function handleListPartners(params: ListPartnersParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{ partners: unknown[]; total_count: number }>({
			method: "GET",
			path: `${INTERLINK_API_PREFIX}/${params.region}/partners`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["pop_ids", params.popIds],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.partners, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetPartner(params: GetPartnerParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${INTERLINK_API_PREFIX}/${params.region}/partners/${params.partnerId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ---------------------------------------------------------------------------
// Points of Presence
// ---------------------------------------------------------------------------

export async function handleListPops(params: ListPopsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{ pops: unknown[]; total_count: number }>({
			method: "GET",
			path: `${INTERLINK_API_PREFIX}/${params.region}/pops`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["name", params.name],
				["hosting_provider_name", params.hostingProviderName],
				["partner_id", params.partnerId],
				["link_bandwidth_mbps", params.linkBandwidthMbps],
				["dedicated_available", params.dedicatedAvailable],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.pops, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetPop(params: GetPopParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${INTERLINK_API_PREFIX}/${params.region}/pops/${params.popId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ---------------------------------------------------------------------------
// Dedicated connections
// ---------------------------------------------------------------------------

export async function handleListDedicatedConnections(params: ListDedicatedConnectionsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			connections: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${INTERLINK_API_PREFIX}/${params.region}/dedicated-connections`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["organization_id", params.organizationId],
				["name", params.name],
				["tags", params.tags],
				["status", params.status],
				["bandwidth_mbps", params.bandwidthMbps],
				["pop_id", params.popId],
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

export async function handleGetDedicatedConnection(params: GetDedicatedConnectionParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${INTERLINK_API_PREFIX}/${params.region}/dedicated-connections/${params.connectionId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
