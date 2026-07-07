/**
 * Contract tests for Scaleway Cockpit API v1 (regional + global)
 *
 * Validates request/response shapes against
 *   specs/scaleway-api/cockpit/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * API: https://www.scaleway.com/en/developers/api/cockpit/
 * Base URL: https://api.scaleway.com/cockpit/v1
 * Auth: X-Auth-Token header
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	ActivateCockpitInput,
	AlertManager,
	Cockpit,
	CockpitStatus,
	ContactPoint,
	CreateContactPointInput,
	CreateDataSourceInput,
	CreateGrafanaUserInput,
	CreateTokenInput,
	DataSource,
	DataSourceType,
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
	GrafanaUser,
	GrafanaUserRole,
	ListContactPointsInput,
	ListDataSourcesInput,
	ListGrafanaUsersInput,
	ListManagedAlertsContactPointsInput,
	ListTokensInput,
	ResetGrafanaUserPasswordInput,
	Token,
	TokenScope,
} from "../../../src/tools/cockpit/types.js";

// --- Shared fixtures ---

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const REGION = "fr-par";

const validCockpit = {
	project_id: VALID_UUID,
	status: "ready" as const,
	endpoints: [{ url: "https://grafana.scw.cloud", name: "grafana", type: "grafana" }],
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
};

const validDataSource = {
	id: VALID_UUID,
	project_id: VALID_UUID,
	name: "my-metrics",
	type: "metrics" as const,
	url: "https://metrics.cockpit.fr-par.scw.cloud",
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	synchronized_with_grafana: true,
	region: REGION,
};

const validToken = {
	id: VALID_UUID,
	project_id: VALID_UUID,
	name: "ingest-token",
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	scopes: ["read_only_metrics", "write_only_metrics"],
	secret_key: "scw-secret-abc",
};

const validGrafanaUser = {
	id: 42,
	login: "alice",
	role: "editor" as const,
	password: "generated-password",
};

const validAlertManager = {
	alert_manager_url: "https://alertmanager.cockpit.fr-par.scw.cloud",
	alert_manager_enabled: true,
	region: REGION,
};

// --- Entity contracts ---

/**
 * API: GET /cockpit/v1/regions/{region}/cockpit
 * Spec: specs/scaleway-api/cockpit/api-reference.md#get-cockpit
 */
describe("contract: Cockpit entity + get/activate/deactivate", () => {
	it("validates cockpit entity", () => {
		expect(() => Cockpit.parse(validCockpit)).not.toThrow();
	});

	it("validates cockpit with null timestamps", () => {
		expect(() =>
			Cockpit.parse({ ...validCockpit, created_at: null, updated_at: null }),
		).not.toThrow();
	});

	it("validates all cockpit statuses", () => {
		for (const status of ["unknown_status", "creating", "ready", "deleting", "updating", "error"]) {
			expect(() => CockpitStatus.parse(status)).not.toThrow();
		}
	});

	it("rejects invalid cockpit status", () => {
		expect(() => CockpitStatus.parse("running")).toThrow();
	});

	it("validates get/activate/deactivate request shapes", () => {
		expect(() => GetCockpitInput.parse({ project_id: VALID_UUID })).not.toThrow();
		expect(() => GetCockpitInput.parse({ project_id: VALID_UUID, region: REGION })).not.toThrow();
		expect(() => ActivateCockpitInput.parse({ project_id: VALID_UUID })).not.toThrow();
		expect(() => DeactivateCockpitInput.parse({ project_id: VALID_UUID })).not.toThrow();
	});

	it("requires project_id", () => {
		expect(() => GetCockpitInput.parse({})).toThrow();
	});

	it("rejects invalid region format", () => {
		expect(() => GetCockpitInput.parse({ project_id: VALID_UUID, region: "invalid" })).toThrow();
	});
});

/**
 * API: GET/POST/DELETE /cockpit/v1/regions/{region}/data-sources
 * Spec: specs/scaleway-api/cockpit/api-reference.md#data-sources
 */
describe("contract: Data sources", () => {
	it("validates data source entity", () => {
		expect(() => DataSource.parse(validDataSource)).not.toThrow();
	});

	it("validates all data source types", () => {
		for (const type of ["unknown_type", "metrics", "logs", "traces"]) {
			expect(() => DataSourceType.parse(type)).not.toThrow();
		}
	});

	it("rejects invalid data source type", () => {
		expect(() => DataSourceType.parse("events")).toThrow();
	});

	it("validates list data sources response shape", () => {
		const ListDataSourcesResponse = z.object({
			data_sources: z.array(DataSource),
			total_count: z.number().int(),
		});
		expect(() =>
			ListDataSourcesResponse.parse({ data_sources: [validDataSource], total_count: 1 }),
		).not.toThrow();
	});

	it("applies default pagination for list", () => {
		const result = ListDataSourcesInput.parse({ project_id: VALID_UUID });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("validates list with type filter", () => {
		expect(() =>
			ListDataSourcesInput.parse({
				project_id: VALID_UUID,
				region: REGION,
				order_by: "name_asc",
				types: ["metrics", "logs"],
			}),
		).not.toThrow();
	});

	it("validates create data source request", () => {
		expect(() =>
			CreateDataSourceInput.parse({ project_id: VALID_UUID, name: "ds", type: "logs" }),
		).not.toThrow();
		expect(() => CreateDataSourceInput.parse({ project_id: VALID_UUID, name: "ds" })).not.toThrow();
	});

	it("rejects create without name", () => {
		expect(() => CreateDataSourceInput.parse({ project_id: VALID_UUID })).toThrow();
	});

	it("validates delete data source request", () => {
		expect(() => DeleteDataSourceInput.parse({ data_source_id: VALID_UUID })).not.toThrow();
	});

	it("rejects delete without data_source_id", () => {
		expect(() => DeleteDataSourceInput.parse({})).toThrow();
	});
});

/**
 * API: GET/POST/DELETE /cockpit/v1/regions/{region}/tokens
 * Spec: specs/scaleway-api/cockpit/api-reference.md#tokens
 */
describe("contract: Tokens", () => {
	it("validates token entity", () => {
		expect(() => Token.parse(validToken)).not.toThrow();
	});

	it("validates token without secret_key (list responses)", () => {
		const { secret_key, ...withoutSecret } = validToken;
		void secret_key;
		expect(() => Token.parse(withoutSecret)).not.toThrow();
	});

	it("validates all token scopes", () => {
		for (const scope of [
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
		]) {
			expect(() => TokenScope.parse(scope)).not.toThrow();
		}
	});

	it("rejects invalid token scope", () => {
		// Legacy global-API scope literals are not accepted by the regional v1 API.
		expect(() => TokenScope.parse("query_metrics")).toThrow();
		expect(() => TokenScope.parse("full_access_metrics")).toThrow();
	});

	it("applies default pagination for list", () => {
		const result = ListTokensInput.parse({ project_id: VALID_UUID });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("validates create token request", () => {
		expect(() =>
			CreateTokenInput.parse({
				project_id: VALID_UUID,
				name: "t",
				scopes: ["read_only_metrics"],
			}),
		).not.toThrow();
		expect(() => CreateTokenInput.parse({ project_id: VALID_UUID, name: "t" })).not.toThrow();
	});

	it("rejects create token without name", () => {
		expect(() => CreateTokenInput.parse({ project_id: VALID_UUID })).toThrow();
	});

	it("validates delete token request", () => {
		expect(() => DeleteTokenInput.parse({ token_id: VALID_UUID })).not.toThrow();
	});
});

/**
 * API: GET/POST/DELETE /cockpit/v1/grafana/users (global)
 * Spec: specs/scaleway-api/cockpit/api-reference.md#grafana-users
 */
describe("contract: Grafana users", () => {
	it("validates grafana user entity", () => {
		expect(() => GrafanaUser.parse(validGrafanaUser)).not.toThrow();
	});

	it("validates grafana user without password (list responses)", () => {
		const { password, ...withoutPassword } = validGrafanaUser;
		void password;
		expect(() => GrafanaUser.parse(withoutPassword)).not.toThrow();
	});

	it("validates all grafana roles", () => {
		for (const role of ["unknown_role", "editor", "viewer"]) {
			expect(() => GrafanaUserRole.parse(role)).not.toThrow();
		}
	});

	it("rejects invalid grafana role", () => {
		expect(() => GrafanaUserRole.parse("admin")).toThrow();
	});

	it("applies default pagination for list", () => {
		const result = ListGrafanaUsersInput.parse({ project_id: VALID_UUID });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("validates create grafana user request", () => {
		expect(() =>
			CreateGrafanaUserInput.parse({ project_id: VALID_UUID, login: "bob", role: "viewer" }),
		).not.toThrow();
		expect(() =>
			CreateGrafanaUserInput.parse({ project_id: VALID_UUID, login: "bob" }),
		).not.toThrow();
	});

	it("rejects create grafana user without login", () => {
		expect(() => CreateGrafanaUserInput.parse({ project_id: VALID_UUID })).toThrow();
	});

	it("validates delete grafana user request (numeric id)", () => {
		expect(() =>
			DeleteGrafanaUserInput.parse({ grafana_user_id: 42, project_id: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects delete grafana user with non-numeric id", () => {
		expect(() =>
			DeleteGrafanaUserInput.parse({ grafana_user_id: "42", project_id: VALID_UUID }),
		).toThrow();
	});

	it("validates reset password request", () => {
		expect(() =>
			ResetGrafanaUserPasswordInput.parse({ grafana_user_id: 42, project_id: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: GET/POST /cockpit/v1/regions/{region}/alert-manager
 * Spec: specs/scaleway-api/cockpit/api-reference.md#alert-manager
 */
describe("contract: Alert manager", () => {
	it("validates alert manager entity", () => {
		expect(() => AlertManager.parse(validAlertManager)).not.toThrow();
	});

	it("validates get/enable/disable request shapes", () => {
		expect(() => GetAlertManagerInput.parse({ project_id: VALID_UUID })).not.toThrow();
		expect(() => EnableAlertManagerInput.parse({ project_id: VALID_UUID })).not.toThrow();
		expect(() => DisableAlertManagerInput.parse({ project_id: VALID_UUID })).not.toThrow();
	});

	it("requires project_id for alert manager operations", () => {
		expect(() => GetAlertManagerInput.parse({})).toThrow();
		expect(() => EnableAlertManagerInput.parse({})).toThrow();
		expect(() => DisableAlertManagerInput.parse({})).toThrow();
	});
});

/**
 * API: GET/POST/DELETE /cockpit/v1/regions/{region}/alert-manager/contact-points
 * Spec: specs/scaleway-api/cockpit/api-reference.md#contact-points
 */
describe("contract: Contact points", () => {
	it("validates contact point entity (all optional)", () => {
		expect(() => ContactPoint.parse({})).not.toThrow();
		expect(() => ContactPoint.parse({ email: "ops@example.com", region: REGION })).not.toThrow();
	});

	it("applies default pagination for list", () => {
		const result = ListContactPointsInput.parse({ project_id: VALID_UUID });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("validates create contact point request", () => {
		expect(() =>
			CreateContactPointInput.parse({ project_id: VALID_UUID, email: "ops@example.com" }),
		).not.toThrow();
	});

	it("rejects create contact point without email", () => {
		expect(() => CreateContactPointInput.parse({ project_id: VALID_UUID })).toThrow();
	});

	it("validates delete contact point request", () => {
		expect(() =>
			DeleteContactPointInput.parse({ project_id: VALID_UUID, email: "ops@example.com" }),
		).not.toThrow();
	});

	it("rejects delete contact point without email", () => {
		expect(() => DeleteContactPointInput.parse({ project_id: VALID_UUID })).toThrow();
	});
});

/**
 * API: managed-alerts contact points + enable/disable
 * Spec: specs/scaleway-api/cockpit/api-reference.md#managed-alerts
 */
describe("contract: Managed alerts", () => {
	it("applies default pagination for list contact points", () => {
		const result = ListManagedAlertsContactPointsInput.parse({ project_id: VALID_UUID });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("validates enable/disable request shapes", () => {
		expect(() => EnableManagedAlertsInput.parse({ project_id: VALID_UUID })).not.toThrow();
		expect(() => DisableManagedAlertsInput.parse({ project_id: VALID_UUID })).not.toThrow();
	});

	it("requires project_id for managed alerts operations", () => {
		expect(() => EnableManagedAlertsInput.parse({})).toThrow();
		expect(() => DisableManagedAlertsInput.parse({})).toThrow();
		expect(() => ListManagedAlertsContactPointsInput.parse({})).toThrow();
	});
});
