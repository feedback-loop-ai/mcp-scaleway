import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateInstanceGroup,
	handleCreateInstancePolicy,
	handleCreateInstanceTemplate,
	handleDeleteInstanceGroup,
	handleDeleteInstancePolicy,
	handleDeleteInstanceTemplate,
	handleGetInstanceGroup,
	handleGetInstancePolicy,
	handleGetInstanceTemplate,
	handleListInstanceGroupEvents,
	handleListInstanceGroups,
	handleListInstancePolicies,
	handleListInstanceTemplates,
	handleUpdateInstanceGroup,
	handleUpdateInstancePolicy,
	handleUpdateInstanceTemplate,
} from "./handlers.js";
import {
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

export function registerAutoscalingTools(server: McpServer): void {
	// --- Instance Groups ---
	server.tool(
		"scaleway_autoscaling_list_instance_groups",
		"List autoscaling instance groups in a Scaleway zone",
		ListInstanceGroupsParams.shape,
		async (params) => handleListInstanceGroups(ListInstanceGroupsParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_get_instance_group",
		"Get details of a specific autoscaling instance group by ID",
		GetInstanceGroupParams.shape,
		async (params) => handleGetInstanceGroup(GetInstanceGroupParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_create_instance_group",
		"Create an autoscaling instance group from an instance template",
		CreateInstanceGroupParams.shape,
		async (params) => handleCreateInstanceGroup(CreateInstanceGroupParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_update_instance_group",
		"Update an autoscaling instance group (name, tags, capacity, load balancer)",
		UpdateInstanceGroupParams.shape,
		async (params) => handleUpdateInstanceGroup(UpdateInstanceGroupParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_delete_instance_group",
		"Delete an autoscaling instance group by ID",
		DeleteInstanceGroupParams.shape,
		async (params) => handleDeleteInstanceGroup(DeleteInstanceGroupParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_list_instance_group_events",
		"List lifecycle and scaling events for an autoscaling instance group",
		ListInstanceGroupEventsParams.shape,
		async (params) => handleListInstanceGroupEvents(ListInstanceGroupEventsParams.parse(params)),
	);

	// --- Instance Templates ---
	server.tool(
		"scaleway_autoscaling_list_instance_templates",
		"List autoscaling instance templates in a Scaleway zone",
		ListInstanceTemplatesParams.shape,
		async (params) => handleListInstanceTemplates(ListInstanceTemplatesParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_get_instance_template",
		"Get details of a specific autoscaling instance template by ID",
		GetInstanceTemplateParams.shape,
		async (params) => handleGetInstanceTemplate(GetInstanceTemplateParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_create_instance_template",
		"Create an autoscaling instance template describing scaled-up instances",
		CreateInstanceTemplateParams.shape,
		async (params) => handleCreateInstanceTemplate(CreateInstanceTemplateParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_update_instance_template",
		"Update an autoscaling instance template",
		UpdateInstanceTemplateParams.shape,
		async (params) => handleUpdateInstanceTemplate(UpdateInstanceTemplateParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_delete_instance_template",
		"Delete an autoscaling instance template by ID",
		DeleteInstanceTemplateParams.shape,
		async (params) => handleDeleteInstanceTemplate(DeleteInstanceTemplateParams.parse(params)),
	);

	// --- Instance Policies (Scaling Policies) ---
	server.tool(
		"scaleway_autoscaling_list_instance_policies",
		"List autoscaling scaling policies in a Scaleway zone",
		ListInstancePoliciesParams.shape,
		async (params) => handleListInstancePolicies(ListInstancePoliciesParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_get_instance_policy",
		"Get details of a specific autoscaling scaling policy by ID",
		GetInstancePolicyParams.shape,
		async (params) => handleGetInstancePolicy(GetInstancePolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_create_instance_policy",
		"Create an autoscaling scaling policy on an instance group",
		CreateInstancePolicyParams.shape,
		async (params) => handleCreateInstancePolicy(CreateInstancePolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_update_instance_policy",
		"Update an autoscaling scaling policy",
		UpdateInstancePolicyParams.shape,
		async (params) => handleUpdateInstancePolicy(UpdateInstancePolicyParams.parse(params)),
	);

	server.tool(
		"scaleway_autoscaling_delete_instance_policy",
		"Delete an autoscaling scaling policy by ID",
		DeleteInstancePolicyParams.shape,
		async (params) => handleDeleteInstancePolicy(DeleteInstancePolicyParams.parse(params)),
	);
}
