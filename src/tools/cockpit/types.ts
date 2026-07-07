import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

export const CockpitStatus = z.enum([
	"unknown_status",
	"creating",
	"ready",
	"deleting",
	"updating",
	"error",
]);
export type CockpitStatus = z.infer<typeof CockpitStatus>;

export const DataSourceType = z.enum(["unknown_type", "metrics", "logs", "traces"]);
export type DataSourceType = z.infer<typeof DataSourceType>;

export const GrafanaUserRole = z.enum(["unknown_role", "editor", "viewer"]);
export type GrafanaUserRole = z.infer<typeof GrafanaUserRole>;

export const TokenScope = z.enum([
	"unknown_scope",
	"read_only_metrics",
	"write_only_metrics",
	"full_access_metrics_rules",
	"read_only_logs",
	"write_only_logs",
	"full_access_logs_rules",
	"full_access_alert_manager",
	"read_only_traces",
	"write_only_traces",
]);
export type TokenScope = z.infer<typeof TokenScope>;

// --- Entity Schemas ---

export const CockpitEndpoint = z.object({
	url: z.string().describe("Endpoint URL"),
	name: z.string().describe("Endpoint name"),
	type: z.string().describe("Endpoint type"),
});
export type CockpitEndpoint = z.infer<typeof CockpitEndpoint>;

export const Cockpit = z.object({
	project_id: z.string().describe("Project ID"),
	status: CockpitStatus.describe("Cockpit status"),
	endpoints: z.array(CockpitEndpoint).describe("Cockpit endpoints"),
	created_at: z.string().nullable().describe("Creation timestamp"),
	updated_at: z.string().nullable().describe("Last update timestamp"),
});
export type Cockpit = z.infer<typeof Cockpit>;

export const DataSource = z.object({
	id: z.string().describe("Data source ID"),
	project_id: z.string().describe("Project ID"),
	name: z.string().describe("Data source name"),
	type: DataSourceType.describe("Data source type"),
	url: z.string().describe("Data source URL"),
	created_at: z.string().nullable().describe("Creation timestamp"),
	updated_at: z.string().nullable().describe("Last update timestamp"),
	synchronized_with_grafana: z.boolean().describe("Whether synchronized with Grafana"),
	region: z.string().describe("Region"),
});
export type DataSource = z.infer<typeof DataSource>;

export const Token = z.object({
	id: z.string().describe("Token ID"),
	project_id: z.string().describe("Project ID"),
	name: z.string().describe("Token name"),
	created_at: z.string().nullable().describe("Creation timestamp"),
	updated_at: z.string().nullable().describe("Last update timestamp"),
	scopes: z.array(TokenScope).describe("Token scopes"),
	secret_key: z.string().optional().describe("Secret key (only on creation)"),
});
export type Token = z.infer<typeof Token>;

export const GrafanaUser = z.object({
	id: z.number().describe("Grafana user ID"),
	login: z.string().describe("Grafana user login"),
	role: GrafanaUserRole.describe("Grafana user role"),
	password: z.string().optional().describe("Password (only on creation/reset)"),
});
export type GrafanaUser = z.infer<typeof GrafanaUser>;

export const ContactPoint = z.object({
	email: z.string().optional().describe("Contact point email configuration"),
	region: z.string().optional().describe("Region"),
});
export type ContactPoint = z.infer<typeof ContactPoint>;

export const AlertManager = z.object({
	alert_manager_url: z.string().describe("Alert manager URL"),
	alert_manager_enabled: z.boolean().describe("Whether alert manager is enabled"),
	region: z.string().describe("Region"),
});
export type AlertManager = z.infer<typeof AlertManager>;

// --- Input Schemas ---

export const GetCockpitInput = z.object({
	project_id: z.string().describe("Project ID"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type GetCockpitInput = z.infer<typeof GetCockpitInput>;

export const ActivateCockpitInput = z.object({
	project_id: z.string().describe("Project ID"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type ActivateCockpitInput = z.infer<typeof ActivateCockpitInput>;

export const DeactivateCockpitInput = z.object({
	project_id: z.string().describe("Project ID"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type DeactivateCockpitInput = z.infer<typeof DeactivateCockpitInput>;

export const ListDataSourcesInput = z
	.object({
		project_id: z.string().describe("Project ID"),
		region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
		order_by: z.string().optional().describe("Order by field"),
		types: z.array(DataSourceType).optional().describe("Filter by data source types"),
	})
	.merge(PaginationParams);
export type ListDataSourcesInput = z.infer<typeof ListDataSourcesInput>;

export const CreateDataSourceInput = z.object({
	project_id: z.string().describe("Project ID"),
	name: z.string().describe("Data source name"),
	type: DataSourceType.optional().describe("Data source type"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type CreateDataSourceInput = z.infer<typeof CreateDataSourceInput>;

export const DeleteDataSourceInput = z.object({
	data_source_id: z.string().describe("Data source ID to delete"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type DeleteDataSourceInput = z.infer<typeof DeleteDataSourceInput>;

export const ListTokensInput = z
	.object({
		project_id: z.string().describe("Project ID"),
		region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
		order_by: z.string().optional().describe("Order by field"),
	})
	.merge(PaginationParams);
export type ListTokensInput = z.infer<typeof ListTokensInput>;

export const CreateTokenInput = z.object({
	project_id: z.string().describe("Project ID"),
	name: z.string().describe("Token name"),
	scopes: z.array(TokenScope).optional().describe("Token scopes"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type CreateTokenInput = z.infer<typeof CreateTokenInput>;

export const DeleteTokenInput = z.object({
	token_id: z.string().describe("Token ID to delete"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type DeleteTokenInput = z.infer<typeof DeleteTokenInput>;

export const ListGrafanaUsersInput = z
	.object({
		project_id: z.string().describe("Project ID"),
		order_by: z.string().optional().describe("Order by field"),
	})
	.merge(PaginationParams);
export type ListGrafanaUsersInput = z.infer<typeof ListGrafanaUsersInput>;

export const CreateGrafanaUserInput = z.object({
	project_id: z.string().describe("Project ID"),
	login: z.string().describe("Grafana user login"),
	role: GrafanaUserRole.optional().describe("Grafana user role"),
});
export type CreateGrafanaUserInput = z.infer<typeof CreateGrafanaUserInput>;

export const DeleteGrafanaUserInput = z.object({
	grafana_user_id: z.number().describe("Grafana user ID to delete"),
	project_id: z.string().describe("Project ID"),
});
export type DeleteGrafanaUserInput = z.infer<typeof DeleteGrafanaUserInput>;

export const ResetGrafanaUserPasswordInput = z.object({
	grafana_user_id: z.number().describe("Grafana user ID"),
	project_id: z.string().describe("Project ID"),
});
export type ResetGrafanaUserPasswordInput = z.infer<typeof ResetGrafanaUserPasswordInput>;

export const GetAlertManagerInput = z.object({
	project_id: z.string().describe("Project ID"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type GetAlertManagerInput = z.infer<typeof GetAlertManagerInput>;

export const EnableAlertManagerInput = z.object({
	project_id: z.string().describe("Project ID"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type EnableAlertManagerInput = z.infer<typeof EnableAlertManagerInput>;

export const DisableAlertManagerInput = z.object({
	project_id: z.string().describe("Project ID"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type DisableAlertManagerInput = z.infer<typeof DisableAlertManagerInput>;

export const ListContactPointsInput = z
	.object({
		project_id: z.string().describe("Project ID"),
		region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	})
	.merge(PaginationParams);
export type ListContactPointsInput = z.infer<typeof ListContactPointsInput>;

export const CreateContactPointInput = z.object({
	project_id: z.string().describe("Project ID"),
	email: z.string().describe("Contact point email"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type CreateContactPointInput = z.infer<typeof CreateContactPointInput>;

export const DeleteContactPointInput = z.object({
	project_id: z.string().describe("Project ID"),
	email: z.string().describe("Contact point email to delete"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type DeleteContactPointInput = z.infer<typeof DeleteContactPointInput>;

export const ListManagedAlertsContactPointsInput = z
	.object({
		project_id: z.string().describe("Project ID"),
		region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	})
	.merge(PaginationParams);
export type ListManagedAlertsContactPointsInput = z.infer<
	typeof ListManagedAlertsContactPointsInput
>;

export const EnableManagedAlertsInput = z.object({
	project_id: z.string().describe("Project ID"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type EnableManagedAlertsInput = z.infer<typeof EnableManagedAlertsInput>;

export const DisableManagedAlertsInput = z.object({
	project_id: z.string().describe("Project ID"),
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
});
export type DisableManagedAlertsInput = z.infer<typeof DisableManagedAlertsInput>;
