import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
} from "../../../src/tools/cockpit/handlers.js";
import { registerCockpitTools } from "../../../src/tools/cockpit/index.js";
import {
	ActivateCockpitInput,
	AlertManager,
	Cockpit,
	CockpitEndpoint,
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

// Mock shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS",
		secretKey: "SCW-SECRET",
		defaultProjectId: "proj-123",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

describe("cockpit module", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerCockpitTools(server)).not.toThrow();
	});

	it("marks upstream-deprecated tools in their descriptions", () => {
		const descriptions = new Map<string, string>();
		const server = {
			tool: (name: string, description: string) => {
				descriptions.set(name, description);
			},
		} as unknown as McpServer;
		registerCockpitTools(server);

		expect(descriptions.size).toBe(22);

		// Global /cockpit/v1/grafana/users endpoints: "(Deprecated) EOL 2026-01-20"
		// in the official schema; managed-alerts enable/disable: deprecated: true.
		const deprecated = [
			"scaleway_cockpit_list_grafana_users",
			"scaleway_cockpit_create_grafana_user",
			"scaleway_cockpit_delete_grafana_user",
			"scaleway_cockpit_reset_grafana_user_password",
			"scaleway_cockpit_enable_managed_alerts",
			"scaleway_cockpit_disable_managed_alerts",
		];
		for (const name of deprecated) {
			expect(descriptions.get(name), name).toMatch(/ \(deprecated upstream\)\. Example: \{/);
		}

		const flagged = [...descriptions.entries()]
			.filter(([, d]) => d.includes("(deprecated upstream)"))
			.map(([n]) => n)
			.sort();
		expect(flagged).toEqual([...deprecated].sort());
	});

	// --- Zod Schema Tests ---
	describe("types", () => {
		it("validates CockpitStatus enum", () => {
			expect(CockpitStatus.parse("ready")).toBe("ready");
			expect(CockpitStatus.parse("creating")).toBe("creating");
			expect(() => CockpitStatus.parse("invalid")).toThrow();
		});

		it("validates DataSourceType enum", () => {
			expect(DataSourceType.parse("metrics")).toBe("metrics");
			expect(DataSourceType.parse("logs")).toBe("logs");
			expect(DataSourceType.parse("traces")).toBe("traces");
			expect(() => DataSourceType.parse("invalid")).toThrow();
		});

		it("validates GrafanaUserRole enum", () => {
			expect(GrafanaUserRole.parse("editor")).toBe("editor");
			expect(GrafanaUserRole.parse("viewer")).toBe("viewer");
			expect(() => GrafanaUserRole.parse("invalid")).toThrow();
		});

		it("validates TokenScope enum", () => {
			expect(TokenScope.parse("read_only_metrics")).toBe("read_only_metrics");
			expect(TokenScope.parse("full_access_logs_rules")).toBe("full_access_logs_rules");
			expect(TokenScope.parse("full_access_alert_manager")).toBe("full_access_alert_manager");
			expect(() => TokenScope.parse("invalid")).toThrow();
		});

		it("validates CockpitEndpoint schema", () => {
			const valid = { url: "https://example.com", name: "metrics", type: "metrics_url" };
			expect(CockpitEndpoint.parse(valid)).toEqual(valid);
		});

		it("validates Cockpit schema", () => {
			const valid = {
				project_id: "proj-123",
				status: "ready",
				endpoints: [{ url: "https://example.com", name: "metrics", type: "metrics_url" }],
				created_at: "2024-01-01T00:00:00Z",
				updated_at: null,
			};
			expect(Cockpit.parse(valid)).toEqual(valid);
		});

		it("validates DataSource schema", () => {
			const valid = {
				id: "ds-123",
				project_id: "proj-123",
				name: "my-ds",
				type: "metrics",
				url: "https://example.com",
				created_at: "2024-01-01T00:00:00Z",
				updated_at: null,
				synchronized_with_grafana: true,
				region: "fr-par",
			};
			expect(DataSource.parse(valid)).toEqual(valid);
		});

		it("validates Token schema", () => {
			const valid = {
				id: "tok-123",
				project_id: "proj-123",
				name: "my-token",
				created_at: "2024-01-01T00:00:00Z",
				updated_at: null,
				scopes: ["read_only_metrics"],
			};
			expect(Token.parse(valid)).toEqual(valid);
		});

		it("validates Token schema with optional secret_key", () => {
			const valid = {
				id: "tok-123",
				project_id: "proj-123",
				name: "my-token",
				created_at: null,
				updated_at: null,
				scopes: [],
				secret_key: "secret-abc",
			};
			expect(Token.parse(valid)).toEqual(valid);
		});

		it("validates GrafanaUser schema", () => {
			const valid = { id: 1, login: "admin", role: "editor" };
			expect(GrafanaUser.parse(valid)).toEqual(valid);
		});

		it("validates GrafanaUser schema with optional password", () => {
			const valid = { id: 1, login: "admin", role: "editor", password: "pass123" };
			expect(GrafanaUser.parse(valid)).toEqual(valid);
		});

		it("validates ContactPoint schema", () => {
			const valid = { email: "test@example.com", region: "fr-par" };
			expect(ContactPoint.parse(valid)).toEqual(valid);
		});

		it("validates ContactPoint schema with optional fields", () => {
			expect(ContactPoint.parse({})).toEqual({});
		});

		it("validates AlertManager schema", () => {
			const valid = {
				alert_manager_url: "https://alert.example.com",
				alert_manager_enabled: true,
				region: "fr-par",
			};
			expect(AlertManager.parse(valid)).toEqual(valid);
		});

		it("validates GetCockpitInput", () => {
			expect(GetCockpitInput.parse({ project_id: "proj-123" })).toEqual({
				project_id: "proj-123",
			});
			expect(GetCockpitInput.parse({ project_id: "proj-123", region: "nl-ams" })).toEqual({
				project_id: "proj-123",
				region: "nl-ams",
			});
		});

		it("validates ActivateCockpitInput", () => {
			expect(ActivateCockpitInput.parse({ project_id: "proj-123" })).toEqual({
				project_id: "proj-123",
			});
		});

		it("validates DeactivateCockpitInput", () => {
			expect(DeactivateCockpitInput.parse({ project_id: "proj-123" })).toEqual({
				project_id: "proj-123",
			});
		});

		it("validates ListDataSourcesInput with pagination defaults", () => {
			const result = ListDataSourcesInput.parse({ project_id: "proj-123" });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("validates ListDataSourcesInput with optional fields", () => {
			const result = ListDataSourcesInput.parse({
				project_id: "proj-123",
				region: "fr-par",
				order_by: "name_asc",
				types: ["metrics", "logs"],
				page: 2,
				pageSize: 10,
			});
			expect(result.types).toEqual(["metrics", "logs"]);
			expect(result.order_by).toBe("name_asc");
		});

		it("validates CreateDataSourceInput", () => {
			expect(CreateDataSourceInput.parse({ project_id: "proj-123", name: "my-ds" })).toEqual({
				project_id: "proj-123",
				name: "my-ds",
			});
		});

		it("validates CreateDataSourceInput with type", () => {
			expect(
				CreateDataSourceInput.parse({
					project_id: "proj-123",
					name: "my-ds",
					type: "metrics",
				}),
			).toEqual({ project_id: "proj-123", name: "my-ds", type: "metrics" });
		});

		it("validates DeleteDataSourceInput", () => {
			expect(DeleteDataSourceInput.parse({ data_source_id: "ds-123" })).toEqual({
				data_source_id: "ds-123",
			});
		});

		it("validates ListTokensInput with defaults", () => {
			const result = ListTokensInput.parse({ project_id: "proj-123" });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("validates ListTokensInput with optional order_by", () => {
			const result = ListTokensInput.parse({
				project_id: "proj-123",
				order_by: "name_asc",
			});
			expect(result.order_by).toBe("name_asc");
		});

		it("validates CreateTokenInput", () => {
			expect(CreateTokenInput.parse({ project_id: "proj-123", name: "my-token" })).toEqual({
				project_id: "proj-123",
				name: "my-token",
			});
		});

		it("validates CreateTokenInput with scopes", () => {
			expect(
				CreateTokenInput.parse({
					project_id: "proj-123",
					name: "my-token",
					scopes: ["read_only_metrics"],
				}),
			).toEqual({
				project_id: "proj-123",
				name: "my-token",
				scopes: ["read_only_metrics"],
			});
		});

		it("validates DeleteTokenInput", () => {
			expect(DeleteTokenInput.parse({ token_id: "tok-123" })).toEqual({
				token_id: "tok-123",
			});
		});

		it("validates ListGrafanaUsersInput", () => {
			const result = ListGrafanaUsersInput.parse({ project_id: "proj-123" });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("validates ListGrafanaUsersInput with order_by", () => {
			const result = ListGrafanaUsersInput.parse({
				project_id: "proj-123",
				order_by: "login_asc",
			});
			expect(result.order_by).toBe("login_asc");
		});

		it("validates CreateGrafanaUserInput", () => {
			expect(CreateGrafanaUserInput.parse({ project_id: "proj-123", login: "admin" })).toEqual({
				project_id: "proj-123",
				login: "admin",
			});
		});

		it("validates CreateGrafanaUserInput with role", () => {
			expect(
				CreateGrafanaUserInput.parse({
					project_id: "proj-123",
					login: "admin",
					role: "editor",
				}),
			).toEqual({ project_id: "proj-123", login: "admin", role: "editor" });
		});

		it("validates DeleteGrafanaUserInput", () => {
			expect(DeleteGrafanaUserInput.parse({ grafana_user_id: 1, project_id: "proj-123" })).toEqual({
				grafana_user_id: 1,
				project_id: "proj-123",
			});
		});

		it("validates ResetGrafanaUserPasswordInput", () => {
			expect(
				ResetGrafanaUserPasswordInput.parse({
					grafana_user_id: 1,
					project_id: "proj-123",
				}),
			).toEqual({ grafana_user_id: 1, project_id: "proj-123" });
		});

		it("validates GetAlertManagerInput", () => {
			expect(GetAlertManagerInput.parse({ project_id: "proj-123" })).toEqual({
				project_id: "proj-123",
			});
		});

		it("validates EnableAlertManagerInput", () => {
			expect(EnableAlertManagerInput.parse({ project_id: "proj-123" })).toEqual({
				project_id: "proj-123",
			});
		});

		it("validates DisableAlertManagerInput", () => {
			expect(DisableAlertManagerInput.parse({ project_id: "proj-123" })).toEqual({
				project_id: "proj-123",
			});
		});

		it("validates ListContactPointsInput", () => {
			const result = ListContactPointsInput.parse({ project_id: "proj-123" });
			expect(result.page).toBe(1);
		});

		it("validates CreateContactPointInput", () => {
			expect(
				CreateContactPointInput.parse({
					project_id: "proj-123",
					email: "test@example.com",
				}),
			).toEqual({ project_id: "proj-123", email: "test@example.com" });
		});

		it("validates DeleteContactPointInput", () => {
			expect(
				DeleteContactPointInput.parse({
					project_id: "proj-123",
					email: "test@example.com",
				}),
			).toEqual({ project_id: "proj-123", email: "test@example.com" });
		});

		it("validates ListManagedAlertsContactPointsInput", () => {
			const result = ListManagedAlertsContactPointsInput.parse({
				project_id: "proj-123",
			});
			expect(result.page).toBe(1);
		});

		it("validates EnableManagedAlertsInput", () => {
			expect(EnableManagedAlertsInput.parse({ project_id: "proj-123" })).toEqual({
				project_id: "proj-123",
			});
		});

		it("validates DisableManagedAlertsInput", () => {
			expect(DisableManagedAlertsInput.parse({ project_id: "proj-123" })).toEqual({
				project_id: "proj-123",
			});
		});
	});

	// --- Handler Tests ---
	describe("handlers", () => {
		// --- Cockpit ---
		describe("handleGetCockpit", () => {
			it("returns cockpit info on success", async () => {
				const mockResponse = {
					project_id: "proj-123",
					status: "ready",
					endpoints: [],
					created_at: "2024-01-01T00:00:00Z",
					updated_at: null,
				};
				mockFetch.mockResolvedValueOnce(mockResponse);

				const result = await handleGetCockpit({ project_id: "proj-123" });
				expect(result.content[0].text).toContain("ready");
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						method: "GET",
						path: "/cockpit/v1/regions/fr-par/cockpit",
					}),
				);
			});

			it("uses custom region when provided", async () => {
				mockFetch.mockResolvedValueOnce({});
				await handleGetCockpit({ project_id: "proj-123", region: "nl-ams" });
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						path: "/cockpit/v1/regions/nl-ams/cockpit",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("network error"));
				const result = await handleGetCockpit({ project_id: "proj-123" });
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
				expect(result.content[0].text).toContain("network error");
			});
		});

		describe("handleActivateCockpit", () => {
			it("activates cockpit on success", async () => {
				const mockResponse = { project_id: "proj-123", status: "creating" };
				mockFetch.mockResolvedValueOnce(mockResponse);

				const result = await handleActivateCockpit({ project_id: "proj-123" });
				expect(result.content[0].text).toContain("creating");
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						method: "POST",
						path: "/cockpit/v1/regions/fr-par/activate-cockpit",
					}),
				);
			});

			it("uses custom region", async () => {
				mockFetch.mockResolvedValueOnce({});
				await handleActivateCockpit({ project_id: "proj-123", region: "nl-ams" });
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						path: "/cockpit/v1/regions/nl-ams/activate-cockpit",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleActivateCockpit({ project_id: "proj-123" });
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleDeactivateCockpit", () => {
			it("deactivates cockpit on success", async () => {
				mockFetch.mockResolvedValueOnce({ project_id: "proj-123", status: "deleting" });

				const result = await handleDeactivateCockpit({ project_id: "proj-123" });
				expect(result.content[0].text).toContain("deleting");
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						method: "POST",
						path: "/cockpit/v1/regions/fr-par/deactivate-cockpit",
					}),
				);
			});

			it("uses custom region", async () => {
				mockFetch.mockResolvedValueOnce({});
				await handleDeactivateCockpit({ project_id: "proj-123", region: "pl-waw" });
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						path: "/cockpit/v1/regions/pl-waw/deactivate-cockpit",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleDeactivateCockpit({ project_id: "proj-123" });
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		// --- Data Sources ---
		describe("handleListDataSources", () => {
			it("returns data sources list", async () => {
				mockFetch.mockResolvedValueOnce({
					data_sources: [{ id: "ds-1", name: "test" }],
					total_count: 1,
				});

				const result = await handleListDataSources({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				const parsed = JSON.parse(result.content[0].text);
				expect(parsed.items).toHaveLength(1);
				expect(parsed.totalCount).toBe(1);
			});

			it("passes order_by and types params", async () => {
				mockFetch.mockResolvedValueOnce({
					data_sources: [],
					total_count: 0,
				});

				await handleListDataSources({
					project_id: "proj-123",
					page: 1,
					pageSize: 10,
					order_by: "name_asc",
					types: ["metrics", "logs"],
				});
				const req = mockFetch.mock.calls[0][0];
				expect(req.urlParams.get("order_by")).toBe("name_asc");
				expect(req.urlParams.getAll("types")).toEqual(["metrics", "logs"]);
			});

			it("handles empty response", async () => {
				mockFetch.mockResolvedValueOnce({});
				const result = await handleListDataSources({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				const parsed = JSON.parse(result.content[0].text);
				expect(parsed.items).toEqual([]);
				expect(parsed.totalCount).toBe(0);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleListDataSources({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleCreateDataSource", () => {
			it("creates data source on success", async () => {
				mockFetch.mockResolvedValueOnce({ id: "ds-new", name: "my-ds" });

				const result = await handleCreateDataSource({
					project_id: "proj-123",
					name: "my-ds",
				});
				expect(result.content[0].text).toContain("ds-new");
			});

			it("passes type when provided", async () => {
				mockFetch.mockResolvedValueOnce({ id: "ds-new" });

				await handleCreateDataSource({
					project_id: "proj-123",
					name: "my-ds",
					type: "metrics",
				});
				const body = JSON.parse(mockFetch.mock.calls[0][0].body);
				expect(body.type).toBe("metrics");
			});

			it("omits type when not provided", async () => {
				mockFetch.mockResolvedValueOnce({ id: "ds-new" });

				await handleCreateDataSource({
					project_id: "proj-123",
					name: "my-ds",
				});
				const body = JSON.parse(mockFetch.mock.calls[0][0].body);
				expect(body.type).toBeUndefined();
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleCreateDataSource({
					project_id: "proj-123",
					name: "my-ds",
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleDeleteDataSource", () => {
			it("deletes data source on success", async () => {
				mockFetch.mockResolvedValueOnce(undefined);

				const result = await handleDeleteDataSource({ data_source_id: "ds-123" });
				expect(result.content[0].text).toContain("deleted");
			});

			it("uses custom region", async () => {
				mockFetch.mockResolvedValueOnce(undefined);

				await handleDeleteDataSource({
					data_source_id: "ds-123",
					region: "nl-ams",
				});
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						method: "DELETE",
						path: "/cockpit/v1/regions/nl-ams/data-sources/ds-123",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleDeleteDataSource({ data_source_id: "ds-123" });
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		// --- Tokens ---
		describe("handleListTokens", () => {
			it("returns tokens list", async () => {
				mockFetch.mockResolvedValueOnce({
					tokens: [{ id: "tok-1", name: "test" }],
					total_count: 1,
				});

				const result = await handleListTokens({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				const parsed = JSON.parse(result.content[0].text);
				expect(parsed.items).toHaveLength(1);
			});

			it("passes order_by param", async () => {
				mockFetch.mockResolvedValueOnce({ tokens: [], total_count: 0 });

				await handleListTokens({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
					order_by: "name_asc",
				});
				const req = mockFetch.mock.calls[0][0];
				expect(req.urlParams.get("order_by")).toBe("name_asc");
			});

			it("handles empty response", async () => {
				mockFetch.mockResolvedValueOnce({});
				const result = await handleListTokens({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				const parsed = JSON.parse(result.content[0].text);
				expect(parsed.items).toEqual([]);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleListTokens({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleCreateToken", () => {
			it("creates token on success", async () => {
				mockFetch.mockResolvedValueOnce({ id: "tok-new", name: "my-token" });

				const result = await handleCreateToken({
					project_id: "proj-123",
					name: "my-token",
				});
				expect(result.content[0].text).toContain("tok-new");
			});

			it("passes scopes when provided", async () => {
				mockFetch.mockResolvedValueOnce({ id: "tok-new" });

				await handleCreateToken({
					project_id: "proj-123",
					name: "my-token",
					scopes: ["read_only_metrics"],
				});
				const body = JSON.parse(mockFetch.mock.calls[0][0].body);
				expect(body.token_scopes).toEqual(["read_only_metrics"]);
			});

			it("omits scopes when not provided", async () => {
				mockFetch.mockResolvedValueOnce({ id: "tok-new" });

				await handleCreateToken({
					project_id: "proj-123",
					name: "my-token",
				});
				const body = JSON.parse(mockFetch.mock.calls[0][0].body);
				expect(body.token_scopes).toBeUndefined();
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleCreateToken({
					project_id: "proj-123",
					name: "my-token",
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleDeleteToken", () => {
			it("deletes token on success", async () => {
				mockFetch.mockResolvedValueOnce(undefined);

				const result = await handleDeleteToken({ token_id: "tok-123" });
				expect(result.content[0].text).toContain("deleted");
			});

			it("uses custom region", async () => {
				mockFetch.mockResolvedValueOnce(undefined);

				await handleDeleteToken({ token_id: "tok-123", region: "nl-ams" });
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						method: "DELETE",
						path: "/cockpit/v1/regions/nl-ams/tokens/tok-123",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleDeleteToken({ token_id: "tok-123" });
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		// --- Grafana Users ---
		describe("handleListGrafanaUsers", () => {
			it("returns grafana users list", async () => {
				mockFetch.mockResolvedValueOnce({
					grafana_users: [{ id: 1, login: "admin" }],
					total_count: 1,
				});

				const result = await handleListGrafanaUsers({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				const parsed = JSON.parse(result.content[0].text);
				expect(parsed.items).toHaveLength(1);
			});

			it("passes order_by param", async () => {
				mockFetch.mockResolvedValueOnce({ grafana_users: [], total_count: 0 });

				await handleListGrafanaUsers({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
					order_by: "login_asc",
				});
				const req = mockFetch.mock.calls[0][0];
				expect(req.urlParams.get("order_by")).toBe("login_asc");
			});

			it("handles empty response", async () => {
				mockFetch.mockResolvedValueOnce({});
				const result = await handleListGrafanaUsers({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				const parsed = JSON.parse(result.content[0].text);
				expect(parsed.items).toEqual([]);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleListGrafanaUsers({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleCreateGrafanaUser", () => {
			it("creates grafana user on success", async () => {
				mockFetch.mockResolvedValueOnce({
					id: 1,
					login: "admin",
					role: "editor",
					password: "gen-pass",
				});

				const result = await handleCreateGrafanaUser({
					project_id: "proj-123",
					login: "admin",
				});
				expect(result.content[0].text).toContain("admin");
			});

			it("passes role when provided", async () => {
				mockFetch.mockResolvedValueOnce({ id: 1 });

				await handleCreateGrafanaUser({
					project_id: "proj-123",
					login: "admin",
					role: "editor",
				});
				const body = JSON.parse(mockFetch.mock.calls[0][0].body);
				expect(body.role).toBe("editor");
			});

			it("omits role when not provided", async () => {
				mockFetch.mockResolvedValueOnce({ id: 1 });

				await handleCreateGrafanaUser({
					project_id: "proj-123",
					login: "admin",
				});
				const body = JSON.parse(mockFetch.mock.calls[0][0].body);
				expect(body.role).toBeUndefined();
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleCreateGrafanaUser({
					project_id: "proj-123",
					login: "admin",
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleDeleteGrafanaUser", () => {
			it("deletes grafana user on success", async () => {
				mockFetch.mockResolvedValueOnce(undefined);

				const result = await handleDeleteGrafanaUser({
					grafana_user_id: 1,
					project_id: "proj-123",
				});
				expect(result.content[0].text).toContain("deleted");
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleDeleteGrafanaUser({
					grafana_user_id: 1,
					project_id: "proj-123",
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleResetGrafanaUserPassword", () => {
			it("resets password on success", async () => {
				mockFetch.mockResolvedValueOnce({
					id: 1,
					login: "admin",
					role: "editor",
					password: "new-pass",
				});

				const result = await handleResetGrafanaUserPassword({
					grafana_user_id: 1,
					project_id: "proj-123",
				});
				expect(result.content[0].text).toContain("new-pass");
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleResetGrafanaUserPassword({
					grafana_user_id: 1,
					project_id: "proj-123",
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		// --- Alert Manager ---
		describe("handleGetAlertManager", () => {
			it("returns alert manager info", async () => {
				mockFetch.mockResolvedValueOnce({
					alert_manager_url: "https://alert.example.com",
					alert_manager_enabled: true,
				});

				const result = await handleGetAlertManager({ project_id: "proj-123" });
				expect(result.content[0].text).toContain("alert_manager_enabled");
			});

			it("uses custom region", async () => {
				mockFetch.mockResolvedValueOnce({});
				await handleGetAlertManager({ project_id: "proj-123", region: "nl-ams" });
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						path: "/cockpit/v1/regions/nl-ams/alert-manager",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleGetAlertManager({ project_id: "proj-123" });
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleEnableAlertManager", () => {
			it("enables alert manager on success", async () => {
				mockFetch.mockResolvedValueOnce({ alert_manager_enabled: true });

				const result = await handleEnableAlertManager({ project_id: "proj-123" });
				expect(result.content[0].text).toContain("true");
			});

			it("uses custom region", async () => {
				mockFetch.mockResolvedValueOnce({});
				await handleEnableAlertManager({ project_id: "proj-123", region: "pl-waw" });
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						path: "/cockpit/v1/regions/pl-waw/alert-manager/enable",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleEnableAlertManager({ project_id: "proj-123" });
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleDisableAlertManager", () => {
			it("disables alert manager on success", async () => {
				mockFetch.mockResolvedValueOnce({ alert_manager_enabled: false });

				const result = await handleDisableAlertManager({ project_id: "proj-123" });
				expect(result.content[0].text).toContain("false");
			});

			it("uses custom region", async () => {
				mockFetch.mockResolvedValueOnce({});
				await handleDisableAlertManager({
					project_id: "proj-123",
					region: "nl-ams",
				});
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						path: "/cockpit/v1/regions/nl-ams/alert-manager/disable",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleDisableAlertManager({ project_id: "proj-123" });
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		// --- Contact Points ---
		describe("handleListContactPoints", () => {
			it("returns contact points list", async () => {
				mockFetch.mockResolvedValueOnce({
					contact_points: [{ email: "test@example.com" }],
					total_count: 1,
				});

				const result = await handleListContactPoints({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				const parsed = JSON.parse(result.content[0].text);
				expect(parsed.items).toHaveLength(1);
			});

			it("handles empty response", async () => {
				mockFetch.mockResolvedValueOnce({});
				const result = await handleListContactPoints({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				const parsed = JSON.parse(result.content[0].text);
				expect(parsed.items).toEqual([]);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleListContactPoints({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleCreateContactPoint", () => {
			it("creates contact point on success", async () => {
				mockFetch.mockResolvedValueOnce({ email: { to: "test@example.com" } });

				const result = await handleCreateContactPoint({
					project_id: "proj-123",
					email: "test@example.com",
				});
				expect(result.content[0].text).toContain("test@example.com");
			});

			it("uses custom region", async () => {
				mockFetch.mockResolvedValueOnce({});
				await handleCreateContactPoint({
					project_id: "proj-123",
					email: "test@example.com",
					region: "nl-ams",
				});
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						path: "/cockpit/v1/regions/nl-ams/alert-manager/contact-points",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleCreateContactPoint({
					project_id: "proj-123",
					email: "test@example.com",
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleDeleteContactPoint", () => {
			it("deletes contact point on success", async () => {
				mockFetch.mockResolvedValueOnce(undefined);

				const result = await handleDeleteContactPoint({
					project_id: "proj-123",
					email: "test@example.com",
				});
				expect(result.content[0].text).toContain("deleted");
			});

			it("uses custom region", async () => {
				mockFetch.mockResolvedValueOnce(undefined);
				await handleDeleteContactPoint({
					project_id: "proj-123",
					email: "test@example.com",
					region: "pl-waw",
				});
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						path: "/cockpit/v1/regions/pl-waw/alert-manager/contact-points",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleDeleteContactPoint({
					project_id: "proj-123",
					email: "test@example.com",
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		// --- Managed Alerts ---
		describe("handleListManagedAlertsContactPoints", () => {
			it("returns managed alerts contact points", async () => {
				mockFetch.mockResolvedValueOnce({
					contact_points: [{ email: "test@example.com" }],
					total_count: 1,
				});

				const result = await handleListManagedAlertsContactPoints({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				const parsed = JSON.parse(result.content[0].text);
				expect(parsed.items).toHaveLength(1);
			});

			it("handles empty response", async () => {
				mockFetch.mockResolvedValueOnce({});
				const result = await handleListManagedAlertsContactPoints({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				const parsed = JSON.parse(result.content[0].text);
				expect(parsed.items).toEqual([]);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleListManagedAlertsContactPoints({
					project_id: "proj-123",
					page: 1,
					pageSize: 50,
				});
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleEnableManagedAlerts", () => {
			it("enables managed alerts on success", async () => {
				mockFetch.mockResolvedValueOnce({ alert_manager_enabled: true });

				const result = await handleEnableManagedAlerts({ project_id: "proj-123" });
				expect(result.content[0].text).toContain("true");
			});

			it("uses custom region", async () => {
				mockFetch.mockResolvedValueOnce({});
				await handleEnableManagedAlerts({
					project_id: "proj-123",
					region: "nl-ams",
				});
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						path: "/cockpit/v1/regions/nl-ams/alert-manager/managed-alerts/enable",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleEnableManagedAlerts({ project_id: "proj-123" });
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});

		describe("handleDisableManagedAlerts", () => {
			it("disables managed alerts on success", async () => {
				mockFetch.mockResolvedValueOnce({ alert_manager_enabled: false });

				const result = await handleDisableManagedAlerts({ project_id: "proj-123" });
				expect(result.content[0].text).toContain("false");
			});

			it("uses custom region", async () => {
				mockFetch.mockResolvedValueOnce({});
				await handleDisableManagedAlerts({
					project_id: "proj-123",
					region: "pl-waw",
				});
				expect(mockFetch).toHaveBeenCalledWith(
					expect.objectContaining({
						path: "/cockpit/v1/regions/pl-waw/alert-manager/managed-alerts/disable",
					}),
				);
			});

			it("returns error on failure", async () => {
				mockFetch.mockRejectedValueOnce(new Error("fail"));
				const result = await handleDisableManagedAlerts({ project_id: "proj-123" });
				expect((result as unknown as { isError: boolean }).isError).toBe(true);
			});
		});
	});
});
