import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateInstanceGroup,
	handleCreateInstanceTemplate,
	handleDeleteInstanceGroup,
	handleDeleteInstanceTemplate,
	handleGetInstanceGroup,
	handleGetInstanceTemplate,
	handleGetInstanceTemplateCloudInit,
	handleListInstanceGroupAlerts,
	handleListInstanceGroupEvents,
	handleListInstanceGroupServers,
	handleListInstanceGroups,
	handleListInstanceTemplates,
	handleSetInstanceTemplateCloudInit,
	handleUpdateInstanceGroup,
	handleUpdateInstanceTemplate,
} from "./handlers.js";
import {
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

export function registerAutoscalingTools(server: McpServer): void {
	// --- Autoscaling Groups (autoscaling v1alpha2) ---
	server.tool(
		"scaleway_autoscaling_list_instance_groups",
		"List Instance autoscaling groups in a Scaleway zone (autoscaling v1alpha2; token pagination; filter by template or Load Balancer). Example: {zone: 'fr-par-1'}",
		ListInstanceGroupsParams.shape,
		async (params) => handleListInstanceGroups(ListInstanceGroupsParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_get_instance_group",
		"Get an Instance autoscaling group by ID (status, current/target size, scaling policy, Load Balancer configuration, open alerts). Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111'}",
		GetInstanceGroupParams.shape,
		async (params) => handleGetInstanceGroup(GetInstanceGroupParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_create_instance_group",
		"Create an Instance autoscaling group from an Instance template, with an embedded scaling policy (fixed size, CPU or memory target) and optional Load Balancer backends. Example: {zone: 'fr-par-1', name: 'web', templateId: '11111111-1111-4111-8111-111111111111'}",
		CreateInstanceGroupParams.shape,
		async (params) => handleCreateInstanceGroup(CreateInstanceGroupParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_update_instance_group",
		"Update an Instance autoscaling group (name, tags, template, scaling policy, Load Balancer configuration). Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111', name: 'web-v2'}",
		UpdateInstanceGroupParams.shape,
		async (params) => handleUpdateInstanceGroup(UpdateInstanceGroupParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_delete_instance_group",
		"Delete an Instance autoscaling group and its managed Instances; returns the group in 'deleting' status. Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111'}",
		DeleteInstanceGroupParams.shape,
		async (params) => handleDeleteInstanceGroup(DeleteInstanceGroupParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_list_instance_group_events",
		"List scaling logs (events) of an Instance autoscaling group, optionally within a time window. Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111'}",
		ListInstanceGroupEventsParams.shape,
		async (params) => handleListInstanceGroupEvents(ListInstanceGroupEventsParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_list_instance_group_servers",
		"List the Instances currently managed by an Instance autoscaling group. Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111'}",
		ListInstanceGroupServersParams.shape,
		async (params) => handleListInstanceGroupServers(ListInstanceGroupServersParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_list_instance_group_alerts",
		"List active and historical alerts (quota, stock, template or Load Balancer issues) for one autoscaling group or a whole project. Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111'}",
		ListInstanceGroupAlertsParams.shape,
		async (params) => handleListInstanceGroupAlerts(ListInstanceGroupAlertsParams.parse(params)),
	);

	// --- Instance Templates (Instance API v2alpha1, referenced by autoscaling groups) ---
	server.tool(
		"scaleway_autoscaling_list_instance_templates",
		"List Instance templates (Instance API v2alpha1) usable by autoscaling groups in a zone. Example: {zone: 'fr-par-1'}",
		ListInstanceTemplatesParams.shape,
		async (params) => handleListInstanceTemplates(ListInstanceTemplatesParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_get_instance_template",
		"Get an Instance template by ID (server type, volumes, Private Networks, public IP counts). Example: {zone: 'fr-par-1', instanceTemplateId: '11111111-1111-4111-8111-111111111111'}",
		GetInstanceTemplateParams.shape,
		async (params) => handleGetInstanceTemplate(GetInstanceTemplateParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_create_instance_template",
		"Create an Instance template (Instance API v2alpha1) describing the Instances an autoscaling group starts. Example: {zone: 'fr-par-1', name: 'web-tpl', serverType: 'PLAY2-NANO'}",
		CreateInstanceTemplateParams.shape,
		async (params) => handleCreateInstanceTemplate(CreateInstanceTemplateParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_update_instance_template",
		"Update an Instance template (changes apply to new Instances only). Example: {zone: 'fr-par-1', instanceTemplateId: '11111111-1111-4111-8111-111111111111', tags: ['web']}",
		UpdateInstanceTemplateParams.shape,
		async (params) => handleUpdateInstanceTemplate(UpdateInstanceTemplateParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_delete_instance_template",
		"Delete an Instance template by ID. Example: {zone: 'fr-par-1', instanceTemplateId: '11111111-1111-4111-8111-111111111111'}",
		DeleteInstanceTemplateParams.shape,
		async (params) => handleDeleteInstanceTemplate(DeleteInstanceTemplateParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_get_instance_template_cloud_init",
		"Get the cloud-init configuration of an Instance template. Example: {zone: 'fr-par-1', instanceTemplateId: '11111111-1111-4111-8111-111111111111'}",
		GetInstanceTemplateCloudInitParams.shape,
		async (params) =>
			handleGetInstanceTemplateCloudInit(GetInstanceTemplateCloudInitParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_set_instance_template_cloud_init",
		"Set the cloud-init configuration of an Instance template. Example: {zone: 'fr-par-1', instanceTemplateId: '11111111-1111-4111-8111-111111111111', content: '#cloud-config'}",
		SetInstanceTemplateCloudInitParams.shape,
		async (params) =>
			handleSetInstanceTemplateCloudInit(SetInstanceTemplateCloudInitParams.parse(params)),
	);
}
