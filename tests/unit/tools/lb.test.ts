import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerLbTools } from "../../../src/tools/lb/index.js";

// Mock shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS",
		secretKey: "SCW-SECRET",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

describe("lb module", () => {
	let server: McpServer;

	beforeEach(() => {
		server = new McpServer({ name: "test", version: "0.0.1" });
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("registers without error", () => {
		expect(() => registerLbTools(server)).not.toThrow();
	});
});

// Test handlers directly
import {
	handleAddBackendServers,
	handleCreateBackend,
	handleCreateCertificate,
	handleCreateFrontend,
	handleCreateLb,
	handleCreateRoute,
	handleDeleteBackend,
	handleDeleteCertificate,
	handleDeleteFrontend,
	handleDeleteLb,
	handleDeleteRoute,
	handleGetBackend,
	handleGetCertificate,
	handleGetFrontend,
	handleGetLb,
	handleGetLbStats,
	handleGetRoute,
	handleListBackends,
	handleListCertificates,
	handleListFrontends,
	handleListLbTypes,
	handleListLbs,
	handleListRoutes,
	handleMigrateLb,
	handleRemoveBackendServers,
	handleSetBackendServers,
	handleUpdateBackend,
	handleUpdateCertificate,
	handleUpdateFrontend,
	handleUpdateLb,
	handleUpdateRoute,
} from "../../../src/tools/lb/handlers.js";

// Import types to validate schemas exist
import {
	AddBackendServersParams,
	CertificateStatus,
	CertificateType,
	CreateBackendParams,
	CreateCertificateParams,
	CreateFrontendParams,
	CreateLbParams,
	CreateRouteParams,
	DeleteBackendParams,
	DeleteCertificateParams,
	DeleteFrontendParams,
	DeleteLbParams,
	DeleteRouteParams,
	ForwardProtocol,
	GetBackendParams,
	GetCertificateParams,
	GetFrontendParams,
	GetLbParams,
	GetLbStatsParams,
	GetRouteParams,
	HealthCheckConfig,
	HttpHealthCheck,
	HttpsHealthCheck,
	LbStatus,
	ListBackendsParams,
	ListCertificatesParams,
	ListFrontendsParams,
	ListLbTypesParams,
	ListLbsParams,
	ListRoutesParams,
	MigrateLbParams,
	RemoveBackendServersParams,
	SetBackendServersParams,
	StickySessionsType,
	TcpHealthCheck,
	UpdateBackendParams,
	UpdateCertificateParams,
	UpdateFrontendParams,
	UpdateLbParams,
	UpdateRouteParams,
} from "../../../src/tools/lb/types.js";

const UUID = "11111111-1111-1111-1111-111111111111";
const UUID2 = "22222222-2222-2222-2222-222222222222";

describe("lb types schemas", () => {
	it("validates LbStatus enum", () => {
		expect(LbStatus.parse("ready")).toBe("ready");
		expect(() => LbStatus.parse("invalid")).toThrow();
	});

	it("validates ForwardProtocol enum", () => {
		expect(ForwardProtocol.parse("tcp")).toBe("tcp");
		expect(ForwardProtocol.parse("http")).toBe("http");
		expect(() => ForwardProtocol.parse("invalid")).toThrow();
	});

	it("validates StickySessionsType enum", () => {
		expect(StickySessionsType.parse("none")).toBe("none");
		expect(StickySessionsType.parse("cookie")).toBe("cookie");
		expect(StickySessionsType.parse("table")).toBe("table");
		expect(() => StickySessionsType.parse("invalid")).toThrow();
	});

	it("validates CertificateStatus enum", () => {
		expect(CertificateStatus.parse("pending")).toBe("pending");
		expect(() => CertificateStatus.parse("invalid")).toThrow();
	});

	it("validates CertificateType enum", () => {
		expect(CertificateType.parse("letsencrypt")).toBe("letsencrypt");
		expect(CertificateType.parse("custom")).toBe("custom");
		expect(() => CertificateType.parse("invalid")).toThrow();
	});

	it("validates TcpHealthCheck", () => {
		expect(TcpHealthCheck.parse({})).toEqual({});
	});

	it("validates HttpHealthCheck", () => {
		const result = HttpHealthCheck.parse({ uri: "/health" });
		expect(result.uri).toBe("/health");
	});

	it("validates HttpHealthCheck with all fields", () => {
		const result = HttpHealthCheck.parse({
			uri: "/health",
			method: "GET",
			code: 200,
			host_header: "example.com",
		});
		expect(result).toEqual({
			uri: "/health",
			method: "GET",
			code: 200,
			host_header: "example.com",
		});
	});

	it("validates HttpsHealthCheck", () => {
		const result = HttpsHealthCheck.parse({ uri: "/health", sni: "example.com" });
		expect(result.uri).toBe("/health");
		expect(result.sni).toBe("example.com");
	});

	it("validates HttpsHealthCheck with all fields", () => {
		const result = HttpsHealthCheck.parse({
			uri: "/health",
			method: "POST",
			code: 204,
			host_header: "example.com",
			sni: "example.com",
		});
		expect(result).toEqual({
			uri: "/health",
			method: "POST",
			code: 204,
			host_header: "example.com",
			sni: "example.com",
		});
	});

	it("validates HealthCheckConfig with tcp", () => {
		const result = HealthCheckConfig.parse({ port: 80, tcp_config: {} });
		expect(result.port).toBe(80);
	});

	it("validates HealthCheckConfig with http", () => {
		const result = HealthCheckConfig.parse({
			port: 80,
			check_delay: "3000ms",
			check_timeout: "1000ms",
			check_max_retries: 3,
			http_config: { uri: "/health" },
		});
		expect(result.port).toBe(80);
		expect(result.check_delay).toBe("3000ms");
	});

	it("validates HealthCheckConfig with https", () => {
		const result = HealthCheckConfig.parse({
			port: 443,
			https_config: { uri: "/health", sni: "example.com" },
		});
		expect(result.port).toBe(443);
	});

	it("validates ListLbsParams defaults", () => {
		const result = ListLbsParams.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("validates ListLbsParams with all fields", () => {
		const result = ListLbsParams.parse({
			zone: "fr-par-1",
			name: "my-lb",
			project_id: UUID,
			order_by: "created_at_asc",
			tags: ["tag1"],
			page: 2,
			pageSize: 10,
		});
		expect(result.name).toBe("my-lb");
		expect(result.order_by).toBe("created_at_asc");
	});

	it("validates GetLbParams", () => {
		const result = GetLbParams.parse({ lb_id: UUID });
		expect(result.lb_id).toBe(UUID);
	});

	it("validates CreateLbParams", () => {
		const result = CreateLbParams.parse({ name: "my-lb" });
		expect(result.name).toBe("my-lb");
	});

	it("validates CreateLbParams with all fields", () => {
		const result = CreateLbParams.parse({
			zone: "fr-par-1",
			project_id: UUID,
			name: "my-lb",
			description: "test",
			ip_ids: [UUID],
			assign_flexible_ip: true,
			assign_flexible_ipv6: false,
			type: "lb-s",
			tags: ["tag1"],
			ssl_compatibility_level: "ssl_compatibility_level_modern",
		});
		expect(result.type).toBe("lb-s");
	});

	it("validates UpdateLbParams", () => {
		const result = UpdateLbParams.parse({
			lb_id: UUID,
			name: "new-name",
			description: "new desc",
		});
		expect(result.name).toBe("new-name");
	});

	it("validates UpdateLbParams with ssl_compatibility_level", () => {
		const result = UpdateLbParams.parse({
			lb_id: UUID,
			name: "new-name",
			description: "desc",
			tags: ["t1"],
			ssl_compatibility_level: "ssl_compatibility_level_intermediate",
		});
		expect(result.ssl_compatibility_level).toBe("ssl_compatibility_level_intermediate");
	});

	it("validates DeleteLbParams", () => {
		const result = DeleteLbParams.parse({ lb_id: UUID, release_ip: true });
		expect(result.release_ip).toBe(true);
	});

	it("validates MigrateLbParams", () => {
		const result = MigrateLbParams.parse({ lb_id: UUID, type: "lb-s" });
		expect(result.type).toBe("lb-s");
	});

	it("validates ListFrontendsParams", () => {
		const result = ListFrontendsParams.parse({ lb_id: UUID });
		expect(result.lb_id).toBe(UUID);
	});

	it("validates ListFrontendsParams with all fields", () => {
		const result = ListFrontendsParams.parse({
			zone: "fr-par-1",
			lb_id: UUID,
			name: "fe",
			order_by: "name_asc",
			page: 1,
			pageSize: 25,
		});
		expect(result.order_by).toBe("name_asc");
	});

	it("validates GetFrontendParams", () => {
		const result = GetFrontendParams.parse({ frontend_id: UUID });
		expect(result.frontend_id).toBe(UUID);
	});

	it("validates CreateFrontendParams", () => {
		const result = CreateFrontendParams.parse({
			lb_id: UUID,
			name: "fe",
			inbound_port: 443,
			backend_id: UUID2,
		});
		expect(result.inbound_port).toBe(443);
	});

	it("validates CreateFrontendParams with all fields", () => {
		const result = CreateFrontendParams.parse({
			zone: "fr-par-1",
			lb_id: UUID,
			name: "fe",
			inbound_port: 443,
			backend_id: UUID2,
			timeout_client: "30000ms",
			certificate_id: UUID,
			certificate_ids: [UUID],
			enable_http3: true,
		});
		expect(result.enable_http3).toBe(true);
	});

	it("rejects CreateFrontendParams with invalid port", () => {
		expect(() =>
			CreateFrontendParams.parse({
				lb_id: UUID,
				name: "fe",
				inbound_port: 0,
				backend_id: UUID2,
			}),
		).toThrow();
		expect(() =>
			CreateFrontendParams.parse({
				lb_id: UUID,
				name: "fe",
				inbound_port: 70000,
				backend_id: UUID2,
			}),
		).toThrow();
	});

	it("validates UpdateFrontendParams", () => {
		const result = UpdateFrontendParams.parse({
			frontend_id: UUID,
			name: "fe",
			inbound_port: 80,
			backend_id: UUID2,
		});
		expect(result.name).toBe("fe");
	});

	it("validates UpdateFrontendParams with all fields", () => {
		const result = UpdateFrontendParams.parse({
			zone: "fr-par-1",
			frontend_id: UUID,
			name: "fe",
			inbound_port: 80,
			backend_id: UUID2,
			timeout_client: "30000ms",
			certificate_id: UUID,
			certificate_ids: [UUID],
			enable_http3: false,
		});
		expect(result.enable_http3).toBe(false);
	});

	it("validates DeleteFrontendParams", () => {
		const result = DeleteFrontendParams.parse({ frontend_id: UUID });
		expect(result.frontend_id).toBe(UUID);
	});

	it("validates ListBackendsParams", () => {
		const result = ListBackendsParams.parse({ lb_id: UUID });
		expect(result.lb_id).toBe(UUID);
	});

	it("validates ListBackendsParams with all fields", () => {
		const result = ListBackendsParams.parse({
			zone: "fr-par-1",
			lb_id: UUID,
			name: "be",
			order_by: "name_desc",
			page: 2,
			pageSize: 10,
		});
		expect(result.order_by).toBe("name_desc");
	});

	it("validates GetBackendParams", () => {
		const result = GetBackendParams.parse({ backend_id: UUID });
		expect(result.backend_id).toBe(UUID);
	});

	it("validates CreateBackendParams required fields", () => {
		const result = CreateBackendParams.parse({
			lb_id: UUID,
			name: "be",
			forward_protocol: "http",
			forward_port: 8080,
		});
		expect(result.forward_protocol).toBe("http");
	});

	it("validates CreateBackendParams with all fields", () => {
		const result = CreateBackendParams.parse({
			zone: "fr-par-1",
			lb_id: UUID,
			name: "be",
			forward_protocol: "tcp",
			forward_port: 8080,
			forward_port_algorithm: "roundrobin",
			sticky_sessions: "cookie",
			sticky_sessions_cookie_name: "session",
			health_check: { port: 8080, tcp_config: {} },
			server_ip: ["10.0.0.1"],
			timeout_server: "30000ms",
			timeout_connect: "5000ms",
			timeout_tunnel: "60000ms",
			on_marked_down_action: "shutdown_sessions",
			proxy_protocol: "proxy_protocol_v2",
			failover_host: "fallback.example.com",
			ssl_bridging: true,
			ignore_ssl_server_verify: false,
			redispatch_attempt_count: 3,
			max_retries: 2,
			max_connections: 1000,
			timeout_queue: "5000ms",
		});
		expect(result.forward_port_algorithm).toBe("roundrobin");
		expect(result.sticky_sessions).toBe("cookie");
		expect(result.proxy_protocol).toBe("proxy_protocol_v2");
	});

	it("validates UpdateBackendParams", () => {
		const result = UpdateBackendParams.parse({
			backend_id: UUID,
			name: "be",
			forward_protocol: "http",
			forward_port: 8080,
		});
		expect(result.name).toBe("be");
	});

	it("validates UpdateBackendParams with all fields", () => {
		const result = UpdateBackendParams.parse({
			zone: "fr-par-1",
			backend_id: UUID,
			name: "be",
			forward_protocol: "tcp",
			forward_port: 8080,
			forward_port_algorithm: "leastconn",
			sticky_sessions: "table",
			sticky_sessions_cookie_name: "sess",
			timeout_server: "30000ms",
			timeout_connect: "5000ms",
			timeout_tunnel: "60000ms",
			on_marked_down_action: "on_marked_down_action_none",
			proxy_protocol: "proxy_protocol_none",
			failover_host: "fallback.example.com",
			ssl_bridging: false,
			ignore_ssl_server_verify: true,
			redispatch_attempt_count: 5,
			max_retries: 3,
			max_connections: 500,
			timeout_queue: "10000ms",
		});
		expect(result.forward_port_algorithm).toBe("leastconn");
	});

	it("validates DeleteBackendParams", () => {
		const result = DeleteBackendParams.parse({ backend_id: UUID });
		expect(result.backend_id).toBe(UUID);
	});

	it("validates AddBackendServersParams", () => {
		const result = AddBackendServersParams.parse({
			backend_id: UUID,
			server_ip: ["10.0.0.1", "10.0.0.2"],
		});
		expect(result.server_ip).toHaveLength(2);
	});

	it("validates RemoveBackendServersParams", () => {
		const result = RemoveBackendServersParams.parse({
			backend_id: UUID,
			server_ip: ["10.0.0.1"],
		});
		expect(result.server_ip).toEqual(["10.0.0.1"]);
	});

	it("validates SetBackendServersParams", () => {
		const result = SetBackendServersParams.parse({
			backend_id: UUID,
			server_ip: ["10.0.0.1"],
		});
		expect(result.server_ip).toEqual(["10.0.0.1"]);
	});

	it("validates ListRoutesParams", () => {
		const result = ListRoutesParams.parse({});
		expect(result.page).toBe(1);
	});

	it("validates ListRoutesParams with all fields", () => {
		const result = ListRoutesParams.parse({
			zone: "fr-par-1",
			frontend_id: UUID,
			order_by: "created_at_desc",
			page: 1,
			pageSize: 10,
		});
		expect(result.order_by).toBe("created_at_desc");
	});

	it("validates GetRouteParams", () => {
		const result = GetRouteParams.parse({ route_id: UUID });
		expect(result.route_id).toBe(UUID);
	});

	it("validates CreateRouteParams", () => {
		const result = CreateRouteParams.parse({
			frontend_id: UUID,
			backend_id: UUID2,
		});
		expect(result.frontend_id).toBe(UUID);
	});

	it("validates CreateRouteParams with all fields", () => {
		const result = CreateRouteParams.parse({
			zone: "fr-par-1",
			frontend_id: UUID,
			backend_id: UUID2,
			match_sni: "example.com",
			match_host_header: "example.com",
		});
		expect(result.match_sni).toBe("example.com");
	});

	it("validates UpdateRouteParams", () => {
		const result = UpdateRouteParams.parse({
			route_id: UUID,
			backend_id: UUID2,
		});
		expect(result.route_id).toBe(UUID);
	});

	it("validates UpdateRouteParams with all fields", () => {
		const result = UpdateRouteParams.parse({
			zone: "fr-par-1",
			route_id: UUID,
			backend_id: UUID2,
			match_sni: "example.com",
			match_host_header: "example.com",
		});
		expect(result.match_host_header).toBe("example.com");
	});

	it("validates DeleteRouteParams", () => {
		const result = DeleteRouteParams.parse({ route_id: UUID });
		expect(result.route_id).toBe(UUID);
	});

	it("validates ListCertificatesParams", () => {
		const result = ListCertificatesParams.parse({ lb_id: UUID });
		expect(result.lb_id).toBe(UUID);
	});

	it("validates ListCertificatesParams with all fields", () => {
		const result = ListCertificatesParams.parse({
			zone: "fr-par-1",
			lb_id: UUID,
			name: "cert",
			order_by: "name_asc",
			page: 1,
			pageSize: 25,
		});
		expect(result.order_by).toBe("name_asc");
	});

	it("validates GetCertificateParams", () => {
		const result = GetCertificateParams.parse({ certificate_id: UUID });
		expect(result.certificate_id).toBe(UUID);
	});

	it("validates CreateCertificateParams with letsencrypt", () => {
		const result = CreateCertificateParams.parse({
			lb_id: UUID,
			name: "cert",
			letsencrypt: {
				common_name: "example.com",
				subject_alternative_name: ["www.example.com"],
			},
		});
		expect(result.letsencrypt?.common_name).toBe("example.com");
	});

	it("validates CreateCertificateParams with custom_certificate", () => {
		const result = CreateCertificateParams.parse({
			lb_id: UUID,
			name: "cert",
			custom_certificate: { certificate_chain: "PEM DATA" },
		});
		expect(result.custom_certificate?.certificate_chain).toBe("PEM DATA");
	});

	it("validates UpdateCertificateParams", () => {
		const result = UpdateCertificateParams.parse({
			certificate_id: UUID,
			name: "new-name",
		});
		expect(result.name).toBe("new-name");
	});

	it("validates DeleteCertificateParams", () => {
		const result = DeleteCertificateParams.parse({ certificate_id: UUID });
		expect(result.certificate_id).toBe(UUID);
	});

	it("validates GetLbStatsParams", () => {
		const result = GetLbStatsParams.parse({ lb_id: UUID });
		expect(result.lb_id).toBe(UUID);
	});

	it("validates GetLbStatsParams with backend_id", () => {
		const result = GetLbStatsParams.parse({ lb_id: UUID, backend_id: UUID2 });
		expect(result.backend_id).toBe(UUID2);
	});

	it("validates ListLbTypesParams", () => {
		const result = ListLbTypesParams.parse({});
		expect(result.page).toBe(1);
	});

	it("validates ListLbTypesParams with zone", () => {
		const result = ListLbTypesParams.parse({ zone: "fr-par-1", page: 2, pageSize: 10 });
		expect(result.zone).toBe("fr-par-1");
	});

	it("rejects invalid zone format", () => {
		expect(() => GetLbParams.parse({ lb_id: UUID, zone: "invalid" })).toThrow();
	});

	it("rejects invalid UUID", () => {
		expect(() => GetLbParams.parse({ lb_id: "not-a-uuid" })).toThrow();
	});
});

describe("lb handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	// ─── LB CRUD ────────────────────────────────────────────────────────────

	describe("handleListLbs", () => {
		it("returns list of load balancers", async () => {
			const mockData = { lbs: [{ id: UUID, name: "my-lb" }], total_count: 1 };
			mockFetch.mockResolvedValue(mockData);

			const result = await handleListLbs({});
			expect(result.content[0].text).toContain("my-lb");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/lb/v1/zones/fr-par-1/lbs",
				}),
			);
		});

		it("passes zone and filters", async () => {
			mockFetch.mockResolvedValue({ lbs: [], total_count: 0 });

			await handleListLbs({
				zone: "nl-ams-1",
				name: "test",
				project_id: UUID,
				order_by: "name_asc",
				tags: ["t1", "t2"],
				page: 2,
				pageSize: 10,
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toBe("/lb/v1/zones/nl-ams-1/lbs");
			expect(call.urlParams.get("name")).toBe("test");
			expect(call.urlParams.get("project_id")).toBe(UUID);
			expect(call.urlParams.get("order_by")).toBe("name_asc");
			expect(call.urlParams.getAll("tags")).toEqual(["t1", "t2"]);
			expect(call.urlParams.get("page")).toBe("2");
			expect(call.urlParams.get("page_size")).toBe("10");
		});

		it("handles errors", async () => {
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result = await handleListLbs({});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("not_found");
		});
	});

	describe("handleGetLb", () => {
		it("returns lb details", async () => {
			mockFetch.mockResolvedValue({ id: UUID, name: "my-lb" });

			const result = await handleGetLb({ lb_id: UUID });
			expect(result.content[0].text).toContain(UUID);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `/lb/v1/zones/fr-par-1/lbs/${UUID}`,
				}),
			);
		});

		it("uses custom zone", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleGetLb({ lb_id: UUID, zone: "nl-ams-1" });
			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/nl-ams-1/lbs/${UUID}`);
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleGetLb({ lb_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateLb", () => {
		it("creates a load balancer", async () => {
			mockFetch.mockResolvedValue({ id: UUID, name: "new-lb" });

			const result = await handleCreateLb({ name: "new-lb" });
			expect(result.content[0].text).toContain("new-lb");
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe("/lb/v1/zones/fr-par-1/lbs");
			const body = JSON.parse(call.body);
			expect(body.name).toBe("new-lb");
		});

		it("passes all optional fields", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleCreateLb({
				zone: "nl-ams-1",
				project_id: UUID,
				name: "new-lb",
				description: "desc",
				ip_ids: [UUID2],
				assign_flexible_ip: true,
				assign_flexible_ipv6: false,
				type: "lb-s",
				tags: ["t1"],
				ssl_compatibility_level: "ssl_compatibility_level_modern",
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toBe("/lb/v1/zones/nl-ams-1/lbs");
			const body = JSON.parse(call.body);
			expect(body.project_id).toBe(UUID);
			expect(body.ip_ids).toEqual([UUID2]);
			expect(body.type).toBe("lb-s");
			expect(body.tags).toEqual(["t1"]);
			// zone should not be in body
			expect(body.zone).toBeUndefined();
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCreateLb({ name: "lb" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpdateLb", () => {
		it("updates a load balancer", async () => {
			mockFetch.mockResolvedValue({ id: UUID, name: "updated" });

			const result = await handleUpdateLb({
				lb_id: UUID,
				name: "updated",
				description: "new desc",
			});
			expect(result.content[0].text).toContain("updated");
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("PUT");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}`);
			const body = JSON.parse(call.body);
			expect(body.name).toBe("updated");
			expect(body.lb_id).toBeUndefined();
			expect(body.zone).toBeUndefined();
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateLb({
				lb_id: UUID,
				name: "n",
				description: "d",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteLb", () => {
		it("deletes a load balancer", async () => {
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteLb({ lb_id: UUID });
			expect(result.content[0].text).toContain("success");
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("DELETE");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}`);
		});

		it("passes release_ip", async () => {
			mockFetch.mockResolvedValue(undefined);

			await handleDeleteLb({ lb_id: UUID, release_ip: true });
			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("release_ip")).toBe("true");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteLb({ lb_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleMigrateLb", () => {
		it("migrates a load balancer", async () => {
			mockFetch.mockResolvedValue({ id: UUID, type: "lb-s" });

			const result = await handleMigrateLb({ lb_id: UUID, type: "lb-s" });
			expect(result.content[0].text).toContain("lb-s");
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}/migrate`);
			expect(JSON.parse(call.body)).toEqual({ type: "lb-s" });
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleMigrateLb({ lb_id: UUID, type: "lb-s" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ─── Frontend handlers ─────────────────────────────────────────────────

	describe("handleListFrontends", () => {
		it("lists frontends", async () => {
			mockFetch.mockResolvedValue({ frontends: [], total_count: 0 });

			const result = await handleListFrontends({ lb_id: UUID });
			expect(result.content[0].text).toContain("frontends");
			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}/frontends`);
		});

		it("passes filters", async () => {
			mockFetch.mockResolvedValue({ frontends: [], total_count: 0 });
			await handleListFrontends({
				lb_id: UUID,
				name: "fe",
				order_by: "name_asc",
				page: 2,
				pageSize: 5,
			});
			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("name")).toBe("fe");
			expect(call.urlParams.get("order_by")).toBe("name_asc");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleListFrontends({ lb_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleGetFrontend", () => {
		it("gets a frontend", async () => {
			mockFetch.mockResolvedValue({ id: UUID, name: "fe" });
			const result = await handleGetFrontend({ frontend_id: UUID });
			expect(result.content[0].text).toContain(UUID);
			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/fr-par-1/frontends/${UUID}`);
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleGetFrontend({ frontend_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateFrontend", () => {
		it("creates a frontend", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			const result = await handleCreateFrontend({
				lb_id: UUID,
				name: "fe",
				inbound_port: 443,
				backend_id: UUID2,
			});
			expect(result.content[0].text).toContain(UUID);
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}/frontends`);
			const body = JSON.parse(call.body);
			expect(body.name).toBe("fe");
			expect(body.inbound_port).toBe(443);
			expect(body.lb_id).toBeUndefined();
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCreateFrontend({
				lb_id: UUID,
				name: "fe",
				inbound_port: 80,
				backend_id: UUID2,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpdateFrontend", () => {
		it("updates a frontend", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			const result = await handleUpdateFrontend({
				frontend_id: UUID,
				name: "fe-new",
				inbound_port: 80,
				backend_id: UUID2,
			});
			expect(result.content[0].text).toContain(UUID);
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("PUT");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/frontends/${UUID}`);
			const body = JSON.parse(call.body);
			expect(body.name).toBe("fe-new");
			expect(body.frontend_id).toBeUndefined();
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateFrontend({
				frontend_id: UUID,
				name: "fe",
				inbound_port: 80,
				backend_id: UUID2,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteFrontend", () => {
		it("deletes a frontend", async () => {
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteFrontend({ frontend_id: UUID });
			expect(result.content[0].text).toContain("success");
			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteFrontend({ frontend_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ─── Backend handlers ───────────────────────────────────────────────────

	describe("handleListBackends", () => {
		it("lists backends", async () => {
			mockFetch.mockResolvedValue({ backends: [], total_count: 0 });
			const result = await handleListBackends({ lb_id: UUID });
			expect(result.content[0].text).toContain("backends");
			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}/backends`);
		});

		it("passes filters", async () => {
			mockFetch.mockResolvedValue({ backends: [], total_count: 0 });
			await handleListBackends({
				lb_id: UUID,
				zone: "nl-ams-1",
				name: "be",
				order_by: "created_at_desc",
				page: 3,
				pageSize: 20,
			});
			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toBe(`/lb/v1/zones/nl-ams-1/lbs/${UUID}/backends`);
			expect(call.urlParams.get("name")).toBe("be");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleListBackends({ lb_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleGetBackend", () => {
		it("gets a backend", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			const result = await handleGetBackend({ backend_id: UUID });
			expect(result.content[0].text).toContain(UUID);
			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/fr-par-1/backends/${UUID}`);
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleGetBackend({ backend_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateBackend", () => {
		it("creates a backend", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			const result = await handleCreateBackend({
				lb_id: UUID,
				name: "be",
				forward_protocol: "http",
				forward_port: 8080,
			});
			expect(result.content[0].text).toContain(UUID);
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}/backends`);
			const body = JSON.parse(call.body);
			expect(body.forward_protocol).toBe("http");
			expect(body.lb_id).toBeUndefined();
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCreateBackend({
				lb_id: UUID,
				name: "be",
				forward_protocol: "tcp",
				forward_port: 80,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpdateBackend", () => {
		it("updates a backend", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			const result = await handleUpdateBackend({
				backend_id: UUID,
				name: "be-new",
				forward_protocol: "http",
				forward_port: 8080,
			});
			expect(result.content[0].text).toContain(UUID);
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("PUT");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/backends/${UUID}`);
			const body = JSON.parse(call.body);
			expect(body.backend_id).toBeUndefined();
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateBackend({
				backend_id: UUID,
				name: "be",
				forward_protocol: "tcp",
				forward_port: 80,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteBackend", () => {
		it("deletes a backend", async () => {
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteBackend({ backend_id: UUID });
			expect(result.content[0].text).toContain("success");
			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteBackend({ backend_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleAddBackendServers", () => {
		it("adds servers to backend", async () => {
			mockFetch.mockResolvedValue({ server_ip: ["10.0.0.1"] });
			const result = await handleAddBackendServers({
				backend_id: UUID,
				server_ip: ["10.0.0.1"],
			});
			expect(result.content[0].text).toContain("10.0.0.1");
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/backends/${UUID}/servers`);
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleAddBackendServers({
				backend_id: UUID,
				server_ip: ["10.0.0.1"],
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleRemoveBackendServers", () => {
		it("removes servers from backend", async () => {
			mockFetch.mockResolvedValue({ server_ip: [] });
			const result = await handleRemoveBackendServers({
				backend_id: UUID,
				server_ip: ["10.0.0.1"],
			});
			expect(result.content[0].text).toContain("server_ip");
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("DELETE");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/backends/${UUID}/servers`);
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleRemoveBackendServers({
				backend_id: UUID,
				server_ip: ["10.0.0.1"],
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleSetBackendServers", () => {
		it("sets servers for backend", async () => {
			mockFetch.mockResolvedValue({ server_ip: ["10.0.0.1", "10.0.0.2"] });
			const result = await handleSetBackendServers({
				backend_id: UUID,
				server_ip: ["10.0.0.1", "10.0.0.2"],
			});
			expect(result.content[0].text).toContain("10.0.0.2");
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("PUT");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/backends/${UUID}/servers`);
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleSetBackendServers({
				backend_id: UUID,
				server_ip: ["10.0.0.1"],
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ─── Route handlers ────────────────────────────────────────────────────

	describe("handleListRoutes", () => {
		it("lists routes", async () => {
			mockFetch.mockResolvedValue({ routes: [], total_count: 0 });
			const result = await handleListRoutes({});
			expect(result.content[0].text).toContain("routes");
			expect(mockFetch.mock.calls[0][0].path).toBe("/lb/v1/zones/fr-par-1/routes");
		});

		it("passes filters", async () => {
			mockFetch.mockResolvedValue({ routes: [], total_count: 0 });
			await handleListRoutes({
				zone: "nl-ams-1",
				frontend_id: UUID,
				order_by: "created_at_asc",
				page: 2,
				pageSize: 10,
			});
			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toBe("/lb/v1/zones/nl-ams-1/routes");
			expect(call.urlParams.get("frontend_id")).toBe(UUID);
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleListRoutes({});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleGetRoute", () => {
		it("gets a route", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			const result = await handleGetRoute({ route_id: UUID });
			expect(result.content[0].text).toContain(UUID);
			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/fr-par-1/routes/${UUID}`);
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleGetRoute({ route_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateRoute", () => {
		it("creates a route", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			const result = await handleCreateRoute({
				frontend_id: UUID,
				backend_id: UUID2,
				match_sni: "example.com",
			});
			expect(result.content[0].text).toContain(UUID);
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe("/lb/v1/zones/fr-par-1/routes");
			const body = JSON.parse(call.body);
			expect(body.frontend_id).toBe(UUID);
			expect(body.zone).toBeUndefined();
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCreateRoute({
				frontend_id: UUID,
				backend_id: UUID2,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpdateRoute", () => {
		it("updates a route", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			const result = await handleUpdateRoute({
				route_id: UUID,
				backend_id: UUID2,
				match_host_header: "example.com",
			});
			expect(result.content[0].text).toContain(UUID);
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("PUT");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/routes/${UUID}`);
			const body = JSON.parse(call.body);
			expect(body.route_id).toBeUndefined();
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateRoute({
				route_id: UUID,
				backend_id: UUID2,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteRoute", () => {
		it("deletes a route", async () => {
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteRoute({ route_id: UUID });
			expect(result.content[0].text).toContain("success");
			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteRoute({ route_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ─── Certificate handlers ──────────────────────────────────────────────

	describe("handleListCertificates", () => {
		it("lists certificates", async () => {
			mockFetch.mockResolvedValue({ certificates: [], total_count: 0 });
			const result = await handleListCertificates({ lb_id: UUID });
			expect(result.content[0].text).toContain("certificates");
			expect(mockFetch.mock.calls[0][0].path).toBe(
				`/lb/v1/zones/fr-par-1/lbs/${UUID}/certificates`,
			);
		});

		it("passes filters", async () => {
			mockFetch.mockResolvedValue({ certificates: [], total_count: 0 });
			await handleListCertificates({
				lb_id: UUID,
				name: "cert",
				order_by: "name_desc",
				page: 2,
				pageSize: 5,
			});
			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("name")).toBe("cert");
			expect(call.urlParams.get("order_by")).toBe("name_desc");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleListCertificates({ lb_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleGetCertificate", () => {
		it("gets a certificate", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			const result = await handleGetCertificate({ certificate_id: UUID });
			expect(result.content[0].text).toContain(UUID);
			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/fr-par-1/certificates/${UUID}`);
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleGetCertificate({ certificate_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateCertificate", () => {
		it("creates a certificate with letsencrypt", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			const result = await handleCreateCertificate({
				lb_id: UUID,
				name: "cert",
				letsencrypt: { common_name: "example.com" },
			});
			expect(result.content[0].text).toContain(UUID);
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}/certificates`);
			const body = JSON.parse(call.body);
			expect(body.letsencrypt.common_name).toBe("example.com");
			expect(body.lb_id).toBeUndefined();
		});

		it("creates a certificate with custom cert", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleCreateCertificate({
				lb_id: UUID,
				name: "cert",
				custom_certificate: { certificate_chain: "PEM" },
			});
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.custom_certificate.certificate_chain).toBe("PEM");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCreateCertificate({
				lb_id: UUID,
				name: "cert",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpdateCertificate", () => {
		it("updates a certificate", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			const result = await handleUpdateCertificate({
				certificate_id: UUID,
				name: "new-name",
			});
			expect(result.content[0].text).toContain(UUID);
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("PUT");
			expect(call.path).toBe(`/lb/v1/zones/fr-par-1/certificates/${UUID}`);
			expect(JSON.parse(call.body)).toEqual({ name: "new-name" });
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateCertificate({
				certificate_id: UUID,
				name: "name",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteCertificate", () => {
		it("deletes a certificate", async () => {
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteCertificate({ certificate_id: UUID });
			expect(result.content[0].text).toContain("success");
			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteCertificate({ certificate_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ─── Stats & Types ─────────────────────────────────────────────────────

	describe("handleGetLbStats", () => {
		it("gets lb stats", async () => {
			mockFetch.mockResolvedValue({ backend_servers_stats: [] });
			const result = await handleGetLbStats({ lb_id: UUID });
			expect(result.content[0].text).toContain("backend_servers_stats");
			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}/stats`);
		});

		it("passes backend_id filter", async () => {
			mockFetch.mockResolvedValue({ backend_servers_stats: [] });
			await handleGetLbStats({ lb_id: UUID, backend_id: UUID2 });
			expect(mockFetch.mock.calls[0][0].urlParams.get("backend_id")).toBe(UUID2);
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleGetLbStats({ lb_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleListLbTypes", () => {
		it("lists lb types", async () => {
			mockFetch.mockResolvedValue({ lb_types: [], total_count: 0 });
			const result = await handleListLbTypes({});
			expect(result.content[0].text).toContain("lb_types");
			expect(mockFetch.mock.calls[0][0].path).toBe("/lb/v1/zones/fr-par-1/lb-types");
		});

		it("passes zone and pagination", async () => {
			mockFetch.mockResolvedValue({ lb_types: [], total_count: 0 });
			await handleListLbTypes({ zone: "nl-ams-1", page: 2, pageSize: 10 });
			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toBe("/lb/v1/zones/nl-ams-1/lb-types");
			expect(call.urlParams.get("page")).toBe("2");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleListLbTypes({});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// ─── Error handling edge cases ──────────────────────────────────────────

	describe("error handling", () => {
		it("maps 400 status to invalid_input", async () => {
			const err = new Error("bad request");
			(err as Error & { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValue(err);

			const result = await handleListLbs({});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
		});

		it("maps non-Error to server_error", async () => {
			mockFetch.mockRejectedValue("string error");
			const result = await handleGetLb({ lb_id: UUID });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});
	});
});
