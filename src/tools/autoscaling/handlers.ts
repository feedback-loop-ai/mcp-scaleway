import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateInstanceGroupParams,
	CreateInstancePolicyParams,
	CreateInstanceTemplateParams,
	DeleteInstanceGroupParams,
	DeleteInstancePolicyParams,
	DeleteInstanceTemplateParams,
	GetInstanceGroupParams,
	GetInstancePolicyParams,
	GetInstanceTemplateParams,
	ListInstanceGroupEventsParams,
	ListInstanceGroupsParams,
	ListInstancePoliciesParams,
	ListInstanceTemplatesParams,
	UpdateInstanceGroupParams,
	UpdateInstancePolicyParams,
	UpdateInstanceTemplateParams,
} from "./types.js";

const API_PREFIX = "autoscaling/v1alpha1/zones";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

const JSON_HEADERS = { "Content-Type": "application/json" };

// --- Instance Group Handlers ---

export async function handleListInstanceGroups(params: ListInstanceGroupsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			instance_groups: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${API_PREFIX}/${params.zone}/instance-groups`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.instance_groups,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetInstanceGroup(params: GetInstanceGroupParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${API_PREFIX}/${params.zone}/instance-groups/${params.instanceGroupId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateInstanceGroup(params: CreateInstanceGroupParams) {
	try {
		const client = getClient();
		const body = {
			name: params.name,
			template_id: params.templateId,
			capacity: params.capacity,
			project_id: params.projectId,
			tags: params.tags,
			loadbalancer: params.loadbalancer,
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/${params.zone}/instance-groups`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateInstanceGroup(params: UpdateInstanceGroupParams) {
	try {
		const client = getClient();
		const body = {
			name: params.name,
			tags: params.tags,
			capacity: params.capacity,
			loadbalancer: params.loadbalancer,
		};
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${API_PREFIX}/${params.zone}/instance-groups/${params.instanceGroupId}`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteInstanceGroup(params: DeleteInstanceGroupParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${API_PREFIX}/${params.zone}/instance-groups/${params.instanceGroupId}`,
		});
		return jsonResponse({ deleted: true, id: params.instanceGroupId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListInstanceGroupEvents(params: ListInstanceGroupEventsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			instance_events: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${API_PREFIX}/${params.zone}/instance-groups/${params.instanceGroupId}/events`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.instance_events,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Instance Template Handlers ---

export async function handleListInstanceTemplates(params: ListInstanceTemplatesParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			instance_templates: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${API_PREFIX}/${params.zone}/instance-templates`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.instance_templates,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetInstanceTemplate(params: GetInstanceTemplateParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${API_PREFIX}/${params.zone}/instance-templates/${params.instanceTemplateId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateInstanceTemplate(params: CreateInstanceTemplateParams) {
	try {
		const client = getClient();
		const body = {
			name: params.name,
			commercial_type: params.commercialType,
			image_id: params.imageId,
			volumes: params.volumes,
			tags: params.tags,
			security_group_id: params.securityGroupId,
			placement_group_id: params.placementGroupId,
			public_ips_v4_count: params.publicIpsV4Count,
			public_ips_v6_count: params.publicIpsV6Count,
			project_id: params.projectId,
			private_network_ids: params.privateNetworkIds,
			cloud_init: params.cloudInit,
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/${params.zone}/instance-templates`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateInstanceTemplate(params: UpdateInstanceTemplateParams) {
	try {
		const client = getClient();
		const body = {
			name: params.name,
			commercial_type: params.commercialType,
			image_id: params.imageId,
			volumes: params.volumes,
			tags: params.tags,
			security_group_id: params.securityGroupId,
			placement_group_id: params.placementGroupId,
			public_ips_v4_count: params.publicIpsV4Count,
			public_ips_v6_count: params.publicIpsV6Count,
			private_network_ids: params.privateNetworkIds,
			cloud_init: params.cloudInit,
		};
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${API_PREFIX}/${params.zone}/instance-templates/${params.instanceTemplateId}`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteInstanceTemplate(params: DeleteInstanceTemplateParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${API_PREFIX}/${params.zone}/instance-templates/${params.instanceTemplateId}`,
		});
		return jsonResponse({ deleted: true, id: params.instanceTemplateId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Instance Policy Handlers ---

export async function handleListInstancePolicies(params: ListInstancePoliciesParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			policies: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${API_PREFIX}/${params.zone}/instance-policies`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["order_by", params.orderBy],
				["instance_group_id", params.instanceGroupId],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(response.policies, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetInstancePolicy(params: GetInstancePolicyParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${API_PREFIX}/${params.zone}/instance-policies/${params.instancePolicyId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateInstancePolicy(params: CreateInstancePolicyParams) {
	try {
		const client = getClient();
		const body = {
			name: params.name,
			metric: params.metric,
			action: params.action,
			type: params.type,
			value: params.value,
			priority: params.priority,
			instance_group_id: params.instanceGroupId,
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${API_PREFIX}/${params.zone}/instance-policies`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateInstancePolicy(params: UpdateInstancePolicyParams) {
	try {
		const client = getClient();
		const body = {
			name: params.name,
			metric: params.metric,
			action: params.action,
			type: params.type,
			value: params.value,
			priority: params.priority,
		};
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${API_PREFIX}/${params.zone}/instance-policies/${params.instancePolicyId}`,
			body: JSON.stringify(body),
			headers: JSON_HEADERS,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteInstancePolicy(params: DeleteInstancePolicyParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${API_PREFIX}/${params.zone}/instance-policies/${params.instancePolicyId}`,
		});
		return jsonResponse({ deleted: true, id: params.instancePolicyId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
