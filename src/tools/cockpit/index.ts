import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleActivateCockpit,
	handleCreateContactPoint,
	handleCreateDataSource,
	handleCreateGrafanaUser,
	handleCreateToken,
	handleDeactivateCockpit,
	handleDeleteContactPoint,
	handleDeleteDataSource,
	handleDeleteGrafanaUser,
	handleDeleteToken,
	handleDisableAlertManager,
	handleDisableManagedAlerts,
	handleEnableAlertManager,
	handleEnableManagedAlerts,
	handleGetAlertManager,
	handleGetCockpit,
	handleListContactPoints,
	handleListDataSources,
	handleListGrafanaUsers,
	handleListManagedAlertsContactPoints,
	handleListTokens,
	handleResetGrafanaUserPassword,
} from "./handlers.js";
import {
	ActivateCockpitInput,
	CreateContactPointInput,
	CreateDataSourceInput,
	CreateGrafanaUserInput,
	CreateTokenInput,
	DeactivateCockpitInput,
	DeleteContactPointInput,
	DeleteDataSourceInput,
	DeleteGrafanaUserInput,
	DeleteTokenInput,
	DisableAlertManagerInput,
	DisableManagedAlertsInput,
	EnableAlertManagerInput,
	EnableManagedAlertsInput,
	GetAlertManagerInput,
	GetCockpitInput,
	ListContactPointsInput,
	ListDataSourcesInput,
	ListGrafanaUsersInput,
	ListManagedAlertsContactPointsInput,
	ListTokensInput,
	ResetGrafanaUserPasswordInput,
} from "./types.js";

export function registerCockpitTools(server: McpServer): void {
	// --- Cockpit ---
	server.tool(
		"scaleway_cockpit_get_cockpit",
		"Get Cockpit info for a project (endpoints, status)",
		GetCockpitInput.shape,
		async (params) => handleGetCockpit(GetCockpitInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_activate_cockpit",
		"Activate Cockpit for a project",
		ActivateCockpitInput.shape,
		async (params) => handleActivateCockpit(ActivateCockpitInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_deactivate_cockpit",
		"Deactivate Cockpit for a project",
		DeactivateCockpitInput.shape,
		async (params) => handleDeactivateCockpit(DeactivateCockpitInput.parse(params)),
	);

	// --- Data Sources ---
	server.tool(
		"scaleway_cockpit_list_data_sources",
		"List Cockpit data sources for a project",
		ListDataSourcesInput.shape,
		async (params) => handleListDataSources(ListDataSourcesInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_create_data_source",
		"Create a new Cockpit data source",
		CreateDataSourceInput.shape,
		async (params) => handleCreateDataSource(CreateDataSourceInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_delete_data_source",
		"Delete a Cockpit data source",
		DeleteDataSourceInput.shape,
		async (params) => handleDeleteDataSource(DeleteDataSourceInput.parse(params)),
	);

	// --- Tokens ---
	server.tool(
		"scaleway_cockpit_list_tokens",
		"List Cockpit tokens for a project",
		ListTokensInput.shape,
		async (params) => handleListTokens(ListTokensInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_create_token",
		"Create a new Cockpit token for data ingestion/querying",
		CreateTokenInput.shape,
		async (params) => handleCreateToken(CreateTokenInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_delete_token",
		"Delete a Cockpit token",
		DeleteTokenInput.shape,
		async (params) => handleDeleteToken(DeleteTokenInput.parse(params)),
	);

	// --- Grafana Users ---
	server.tool(
		"scaleway_cockpit_list_grafana_users",
		"List Grafana users for a project (deprecated upstream)",
		ListGrafanaUsersInput.shape,
		async (params) => handleListGrafanaUsers(ListGrafanaUsersInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_create_grafana_user",
		"Create a new Grafana user (deprecated upstream)",
		CreateGrafanaUserInput.shape,
		async (params) => handleCreateGrafanaUser(CreateGrafanaUserInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_delete_grafana_user",
		"Delete a Grafana user (deprecated upstream)",
		DeleteGrafanaUserInput.shape,
		async (params) => handleDeleteGrafanaUser(DeleteGrafanaUserInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_reset_grafana_user_password",
		"Reset a Grafana user's password (deprecated upstream)",
		ResetGrafanaUserPasswordInput.shape,
		async (params) => handleResetGrafanaUserPassword(ResetGrafanaUserPasswordInput.parse(params)),
	);

	// --- Alert Manager ---
	server.tool(
		"scaleway_cockpit_get_alert_manager",
		"Get alert manager info for a project",
		GetAlertManagerInput.shape,
		async (params) => handleGetAlertManager(GetAlertManagerInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_enable_alert_manager",
		"Enable alert manager for a project",
		EnableAlertManagerInput.shape,
		async (params) => handleEnableAlertManager(EnableAlertManagerInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_disable_alert_manager",
		"Disable alert manager for a project",
		DisableAlertManagerInput.shape,
		async (params) => handleDisableAlertManager(DisableAlertManagerInput.parse(params)),
	);

	// --- Contact Points ---
	server.tool(
		"scaleway_cockpit_list_contact_points",
		"List alert manager contact points",
		ListContactPointsInput.shape,
		async (params) => handleListContactPoints(ListContactPointsInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_create_contact_point",
		"Create an alert manager contact point",
		CreateContactPointInput.shape,
		async (params) => handleCreateContactPoint(CreateContactPointInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_delete_contact_point",
		"Delete an alert manager contact point",
		DeleteContactPointInput.shape,
		async (params) => handleDeleteContactPoint(DeleteContactPointInput.parse(params)),
	);

	// --- Managed Alerts ---
	const ManagedAlertsCP = ListManagedAlertsContactPointsInput;
	server.tool(
		"scaleway_cockpit_list_managed_alerts_contact_points",
		"List managed alerts contact points",
		ManagedAlertsCP.shape,
		async (params) => handleListManagedAlertsContactPoints(ManagedAlertsCP.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_enable_managed_alerts",
		"Enable managed alerts for a project (deprecated upstream)",
		EnableManagedAlertsInput.shape,
		async (params) => handleEnableManagedAlerts(EnableManagedAlertsInput.parse(params)),
	);

	server.tool(
		"scaleway_cockpit_disable_managed_alerts",
		"Disable managed alerts for a project (deprecated upstream)",
		DisableManagedAlertsInput.shape,
		async (params) => handleDisableManagedAlerts(DisableManagedAlertsInput.parse(params)),
	);
}
