import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import type {
	CreateInstanceGroupParams,
	CreateInstanceTemplateParams,
	DeleteInstanceGroupParams,
	DeleteInstanceTemplateParams,
	GetInstanceGroupParams,
	GetInstanceTemplateCloudInitParams,
	GetInstanceTemplateParams,
	ListInstanceGroupAlertsParams,
	ListInstanceGroupEventsParams,
	ListInstanceGroupServersParams,
	ListInstanceGroupsParams,
	ListInstanceTemplatesParams,
	SetInstanceTemplateCloudInitParams,
	UpdateInstanceGroupParams,
	UpdateInstanceTemplateParams,
} from "./types.js";

// Spec: specs/scaleway-api/autoscaling/api-reference.md
// Paths must start with "/" — @scaleway/sdk-client concatenates them verbatim onto
// https://api.scaleway.com.
const AUTOSCALING_API_PREFIX = "/autoscaling/v1alpha2/zones";
// Instance templates are managed by the Instance API v2alpha1, not by the autoscaling API.
const INSTANCE_API_PREFIX = "/instance/v2alpha1/zones";

const JSON_HEADERS = { "Content-Type": "application/json" };

function getClient() {
	const config = loadAuthConfig();
	return { client: createScalewayClient(config), config };
}

function autoscalingPath(zone: string, resource: string): string {
	return `${AUTOSCALING_API_PREFIX}/${zone}/${resource}`;
}

function templatesPath(zone: string, suffix = ""): string {
	return `${INSTANCE_API_PREFIX}/${zone}/templates${suffix}`;
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- Autoscaling Group Handlers ---

export async function handleListInstanceGroups(params: ListInstanceGroupsParams) {
	try {
		const { client, config } = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: autoscalingPath(params.zone, "groups"),
			urlParams: urlParams(
				["project_id", params.projectId ?? config.defaultProjectId],
				["order_by", params.orderBy],
				["template_id", params.templateId],
				["load_balancer_id", params.loadBalancerId],
				["page_size", params.pageSize],
				["page_token", params.pageToken],
			),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetInstanceGroup(params: GetInstanceGroupParams) {
	try {
		const { client } = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: autoscalingPath(params.zone, `groups/${params.instanceGroupId}`),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateInstanceGroup(params: CreateInstanceGroupParams) {
	try {
		const { client, config } = getClient();
		const body = {
			project_id: params.projectId ?? config.defaultProjectId,
			name: params.name,
			tags: params.tags,
			template_id: params.templateId,
			scaling_policy_spec: params.scalingPolicySpec,
			load_balancer_configuration_spec: params.loadBalancerConfigurationSpec,
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: autoscalingPath(params.zone, "groups"),
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
		const { client } = getClient();
		const body = {
			name: params.name,
			tags: params.tags,
			template_id: params.templateId,
			scaling_policy_spec: params.scalingPolicySpec,
			load_balancer_configuration_spec: params.loadBalancerConfigurationSpec,
		};
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: autoscalingPath(params.zone, `groups/${params.instanceGroupId}`),
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
		const { client } = getClient();
		// v1alpha2 returns 200 with the Group in its `deleting` status (not 204).
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: autoscalingPath(params.zone, `groups/${params.instanceGroupId}`),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListInstanceGroupEvents(params: ListInstanceGroupEventsParams) {
	try {
		const { client } = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: autoscalingPath(params.zone, "logs"),
			urlParams: urlParams(
				["group_id", params.instanceGroupId],
				["start_time", params.startTime],
				["end_time", params.endTime],
				["page_size", params.pageSize],
				["page_token", params.pageToken],
			),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListInstanceGroupServers(params: ListInstanceGroupServersParams) {
	try {
		const { client } = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: autoscalingPath(params.zone, "servers"),
			urlParams: urlParams(
				["group_id", params.instanceGroupId],
				["page_size", params.pageSize],
				["page_token", params.pageToken],
			),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListInstanceGroupAlerts(params: ListInstanceGroupAlertsParams) {
	try {
		const { client, config } = getClient();
		// one-of scope: group_id wins over project_id (same resolution as the official SDK).
		const scope: [string, string] =
			params.instanceGroupId !== undefined
				? ["group_id", params.instanceGroupId]
				: ["project_id", params.projectId ?? config.defaultProjectId];
		const response = await client.fetch<unknown>({
			method: "GET",
			path: autoscalingPath(params.zone, "alerts"),
			urlParams: urlParams(scope, ["page_size", params.pageSize], ["page_token", params.pageToken]),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Instance Template Handlers (Instance API v2alpha1) ---

export async function handleListInstanceTemplates(params: ListInstanceTemplatesParams) {
	try {
		const { client, config } = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: templatesPath(params.zone),
			urlParams: urlParams(
				["project_id", params.projectId ?? config.defaultProjectId],
				["order_by", params.orderBy],
				["name", params.name],
				["tags", params.tags],
				["template_ids", params.templateIds],
				["page_size", params.pageSize],
				["page_token", params.pageToken],
			),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetInstanceTemplate(params: GetInstanceTemplateParams) {
	try {
		const { client } = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: templatesPath(params.zone, `/${params.instanceTemplateId}`),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateInstanceTemplate(params: CreateInstanceTemplateParams) {
	try {
		const { client, config } = getClient();
		const body = {
			project_id: params.projectId ?? config.defaultProjectId,
			name: params.name,
			tags: params.tags,
			server_tags: params.serverTags,
			server_type: params.serverType,
			security_group_id: params.securityGroupId,
			placement_group_id: params.placementGroupId,
			volumes: params.volumes,
			private_networks: params.privateNetworks,
			filesystem_ids: params.filesystemIds,
			public_ip_v4_count: params.publicIpV4Count,
			public_ip_v6_count: params.publicIpV6Count,
			windows_rdp_ssh_key_id: params.windowsRdpSshKeyId,
		};
		const response = await client.fetch<unknown>({
			method: "POST",
			path: templatesPath(params.zone),
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
		const { client } = getClient();
		const body = {
			name: params.name,
			tags: params.tags,
			server_tags: params.serverTags,
			server_type: params.serverType,
			security_group_id: params.securityGroupId,
			placement_group_id: params.placementGroupId,
			update_volumes: params.volumes !== undefined ? { volumes: params.volumes } : undefined,
			update_private_networks:
				params.privateNetworks !== undefined
					? { private_networks: params.privateNetworks }
					: undefined,
			filesystem_ids: params.filesystemIds,
			public_ip_v4_count: params.publicIpV4Count,
			public_ip_v6_count: params.publicIpV6Count,
			windows_rdp_ssh_key_id: params.windowsRdpSshKeyId,
		};
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: templatesPath(params.zone, `/${params.instanceTemplateId}`),
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
		const { client } = getClient();
		// The endpoint declares a required (empty) JSON body and answers 204.
		await client.fetch<void>({
			method: "DELETE",
			path: templatesPath(params.zone, `/${params.instanceTemplateId}`),
			body: "{}",
			headers: JSON_HEADERS,
		});
		return jsonResponse({ deleted: true, id: params.instanceTemplateId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetInstanceTemplateCloudInit(
	params: GetInstanceTemplateCloudInitParams,
) {
	try {
		const { client } = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: templatesPath(params.zone, `/${params.instanceTemplateId}/user-data/cloud-init`),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleSetInstanceTemplateCloudInit(
	params: SetInstanceTemplateCloudInitParams,
) {
	try {
		const { client } = getClient();
		await client.fetch<void>({
			method: "PUT",
			path: templatesPath(params.zone, `/${params.instanceTemplateId}/user-data/cloud-init`),
			body: JSON.stringify({ content: params.content }),
			headers: JSON_HEADERS,
		});
		return jsonResponse({ updated: true, id: params.instanceTemplateId, key: "cloud-init" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
