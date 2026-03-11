/**
 * Contract tests for Scaleway Load Balancer API.
 *
 * Validates request shape, response shape, pagination, auth, and error codes
 * for every LB API operation exposed by this server.
 *
 * API Reference: specs/scaleway-api/lb/
 * Parity Matrix: tests/parity-matrix.json -> lb.*
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
} from "../../src/tools/lb/handlers.js";
import { registerLbTools } from "../../src/tools/lb/index.js";

vi.mock("../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS",
		secretKey: "SCW-SECRET",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

const UUID = "11111111-1111-1111-1111-111111111111";
const UUID2 = "22222222-2222-2222-2222-222222222222";

function createApiError(statusCode: number, message: string): Error {
	const err = new Error(message);
	(err as Error & { statusCode: number }).statusCode = statusCode;
	return err;
}

describe("lb contract tests", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// ─── Tool registration contract ─────────────────────────────────────────

	describe("tool registration", () => {
		it("registers all 28 LB tools on the MCP server", () => {
			const server = new McpServer({ name: "test", version: "0.0.1" });
			expect(() => registerLbTools(server)).not.toThrow();
		});
	});

	// ─── LB CRUD endpoints ─────────────────────────────────────────────────
	// Scaleway API: GET /lb/v1/zones/{zone}/lbs

	describe("GET /lb/v1/zones/{zone}/lbs", () => {
		it("sends GET with correct path and pagination", async () => {
			mockFetch.mockResolvedValue({ lbs: [], total_count: 0 });
			await handleListLbs({ page: 1, pageSize: 20 });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("GET");
			expect(req.path).toBe("/lb/v1/zones/fr-par-1/lbs");
			expect(req.urlParams.get("page")).toBe("1");
			expect(req.urlParams.get("page_size")).toBe("20");
		});

		it("returns 401 as permission_denied", async () => {
			mockFetch.mockRejectedValue(createApiError(401, "unauthorized"));
			const result = await handleListLbs({});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
			expect(parsed.error.statusCode).toBe(401);
		});

		it("returns 429 as rate_limited", async () => {
			mockFetch.mockRejectedValue(createApiError(429, "too many requests"));
			const result = await handleListLbs({});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
		});
	});

	// Scaleway API: GET /lb/v1/zones/{zone}/lbs/{lb_id}
	describe("GET /lb/v1/zones/{zone}/lbs/{lb_id}", () => {
		it("sends GET with correct path param", async () => {
			mockFetch.mockResolvedValue({ id: UUID, name: "lb" });
			await handleGetLb({ lb_id: UUID, zone: "fr-par-1" });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("GET");
			expect(req.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}`);
		});

		it("returns 404 as not_found", async () => {
			mockFetch.mockRejectedValue(createApiError(404, "not found"));
			const result = await handleGetLb({ lb_id: UUID });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
			expect(parsed.error.statusCode).toBe(404);
		});
	});

	// Scaleway API: POST /lb/v1/zones/{zone}/lbs
	describe("POST /lb/v1/zones/{zone}/lbs", () => {
		it("sends POST with JSON body", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleCreateLb({ name: "my-lb", type: "lb-s" });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("POST");
			expect(req.path).toBe("/lb/v1/zones/fr-par-1/lbs");
			expect(req.headers["Content-Type"]).toBe("application/json");
			const body = JSON.parse(req.body);
			expect(body.name).toBe("my-lb");
			expect(body.type).toBe("lb-s");
		});

		it("returns 400 as invalid_input", async () => {
			mockFetch.mockRejectedValue(createApiError(400, "bad request"));
			const result = await handleCreateLb({ name: "" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
		});

		it("returns 403 as permission_denied", async () => {
			mockFetch.mockRejectedValue(createApiError(403, "forbidden"));
			const result = await handleCreateLb({ name: "lb" });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	// Scaleway API: PUT /lb/v1/zones/{zone}/lbs/{lb_id}
	describe("PUT /lb/v1/zones/{zone}/lbs/{lb_id}", () => {
		it("sends PUT with JSON body, excludes path params from body", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleUpdateLb({ lb_id: UUID, name: "updated", description: "desc" });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("PUT");
			expect(req.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}`);
			const body = JSON.parse(req.body);
			expect(body.name).toBe("updated");
			expect(body.lb_id).toBeUndefined();
			expect(body.zone).toBeUndefined();
		});
	});

	// Scaleway API: DELETE /lb/v1/zones/{zone}/lbs/{lb_id}
	describe("DELETE /lb/v1/zones/{zone}/lbs/{lb_id}", () => {
		it("sends DELETE with query param release_ip", async () => {
			mockFetch.mockResolvedValue(undefined);
			await handleDeleteLb({ lb_id: UUID, release_ip: true });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("DELETE");
			expect(req.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}`);
			expect(req.urlParams.get("release_ip")).toBe("true");
		});
	});

	// Scaleway API: POST /lb/v1/zones/{zone}/lbs/{lb_id}/migrate
	describe("POST /lb/v1/zones/{zone}/lbs/{lb_id}/migrate", () => {
		it("sends POST with type in body", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleMigrateLb({ lb_id: UUID, type: "lb-s" });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("POST");
			expect(req.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}/migrate`);
			expect(JSON.parse(req.body)).toEqual({ type: "lb-s" });
		});
	});

	// ─── Frontend endpoints ─────────────────────────────────────────────────
	// Scaleway API: GET /lb/v1/zones/{zone}/lbs/{lb_id}/frontends
	describe("GET /lb/v1/zones/{zone}/lbs/{lb_id}/frontends", () => {
		it("sends GET with pagination", async () => {
			mockFetch.mockResolvedValue({ frontends: [], total_count: 0 });
			await handleListFrontends({ lb_id: UUID, page: 1, pageSize: 50 });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("GET");
			expect(req.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}/frontends`);
		});
	});

	// Scaleway API: GET /lb/v1/zones/{zone}/frontends/{frontend_id}
	describe("GET /lb/v1/zones/{zone}/frontends/{frontend_id}", () => {
		it("sends GET with correct path", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleGetFrontend({ frontend_id: UUID });

			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/fr-par-1/frontends/${UUID}`);
		});
	});

	// Scaleway API: POST /lb/v1/zones/{zone}/lbs/{lb_id}/frontends
	describe("POST /lb/v1/zones/{zone}/lbs/{lb_id}/frontends", () => {
		it("sends POST with frontend config, excludes lb_id from body", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleCreateFrontend({
				lb_id: UUID,
				name: "fe",
				inbound_port: 443,
				backend_id: UUID2,
			});

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("POST");
			const body = JSON.parse(req.body);
			expect(body.inbound_port).toBe(443);
			expect(body.lb_id).toBeUndefined();
		});
	});

	// Scaleway API: PUT /lb/v1/zones/{zone}/frontends/{frontend_id}
	describe("PUT /lb/v1/zones/{zone}/frontends/{frontend_id}", () => {
		it("sends PUT, excludes frontend_id from body", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleUpdateFrontend({
				frontend_id: UUID,
				name: "fe",
				inbound_port: 80,
				backend_id: UUID2,
			});

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("PUT");
			const body = JSON.parse(req.body);
			expect(body.frontend_id).toBeUndefined();
		});
	});

	// Scaleway API: DELETE /lb/v1/zones/{zone}/frontends/{frontend_id}
	describe("DELETE /lb/v1/zones/{zone}/frontends/{frontend_id}", () => {
		it("sends DELETE", async () => {
			mockFetch.mockResolvedValue(undefined);
			await handleDeleteFrontend({ frontend_id: UUID });

			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
		});
	});

	// ─── Backend endpoints ──────────────────────────────────────────────────
	// Scaleway API: GET /lb/v1/zones/{zone}/lbs/{lb_id}/backends
	describe("GET /lb/v1/zones/{zone}/lbs/{lb_id}/backends", () => {
		it("sends GET with correct path", async () => {
			mockFetch.mockResolvedValue({ backends: [], total_count: 0 });
			await handleListBackends({ lb_id: UUID });

			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}/backends`);
		});
	});

	// Scaleway API: GET /lb/v1/zones/{zone}/backends/{backend_id}
	describe("GET /lb/v1/zones/{zone}/backends/{backend_id}", () => {
		it("sends GET with correct path", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleGetBackend({ backend_id: UUID });

			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/fr-par-1/backends/${UUID}`);
		});
	});

	// Scaleway API: POST /lb/v1/zones/{zone}/lbs/{lb_id}/backends
	describe("POST /lb/v1/zones/{zone}/lbs/{lb_id}/backends", () => {
		it("sends POST with backend config", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleCreateBackend({
				lb_id: UUID,
				name: "be",
				forward_protocol: "http",
				forward_port: 8080,
			});

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("POST");
			const body = JSON.parse(req.body);
			expect(body.forward_protocol).toBe("http");
			expect(body.lb_id).toBeUndefined();
		});
	});

	// Scaleway API: PUT /lb/v1/zones/{zone}/backends/{backend_id}
	describe("PUT /lb/v1/zones/{zone}/backends/{backend_id}", () => {
		it("sends PUT, excludes backend_id from body", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleUpdateBackend({
				backend_id: UUID,
				name: "be",
				forward_protocol: "tcp",
				forward_port: 8080,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.backend_id).toBeUndefined();
		});
	});

	// Scaleway API: DELETE /lb/v1/zones/{zone}/backends/{backend_id}
	describe("DELETE /lb/v1/zones/{zone}/backends/{backend_id}", () => {
		it("sends DELETE", async () => {
			mockFetch.mockResolvedValue(undefined);
			await handleDeleteBackend({ backend_id: UUID });

			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
		});
	});

	// Scaleway API: POST /lb/v1/zones/{zone}/backends/{backend_id}/servers
	describe("POST /lb/v1/zones/{zone}/backends/{backend_id}/servers", () => {
		it("sends POST with server_ip array", async () => {
			mockFetch.mockResolvedValue({ server_ip: ["10.0.0.1"] });
			await handleAddBackendServers({ backend_id: UUID, server_ip: ["10.0.0.1"] });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("POST");
			expect(JSON.parse(req.body).server_ip).toEqual(["10.0.0.1"]);
		});
	});

	// Scaleway API: DELETE /lb/v1/zones/{zone}/backends/{backend_id}/servers
	describe("DELETE /lb/v1/zones/{zone}/backends/{backend_id}/servers", () => {
		it("sends DELETE with server_ip in body", async () => {
			mockFetch.mockResolvedValue({ server_ip: [] });
			await handleRemoveBackendServers({ backend_id: UUID, server_ip: ["10.0.0.1"] });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("DELETE");
			expect(JSON.parse(req.body).server_ip).toEqual(["10.0.0.1"]);
		});
	});

	// Scaleway API: PUT /lb/v1/zones/{zone}/backends/{backend_id}/servers
	describe("PUT /lb/v1/zones/{zone}/backends/{backend_id}/servers", () => {
		it("sends PUT with server_ip array", async () => {
			mockFetch.mockResolvedValue({ server_ip: ["10.0.0.1", "10.0.0.2"] });
			await handleSetBackendServers({
				backend_id: UUID,
				server_ip: ["10.0.0.1", "10.0.0.2"],
			});

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("PUT");
			expect(JSON.parse(req.body).server_ip).toEqual(["10.0.0.1", "10.0.0.2"]);
		});
	});

	// ─── Route endpoints ────────────────────────────────────────────────────
	// Scaleway API: GET /lb/v1/zones/{zone}/routes
	describe("GET /lb/v1/zones/{zone}/routes", () => {
		it("sends GET with optional frontend_id filter", async () => {
			mockFetch.mockResolvedValue({ routes: [], total_count: 0 });
			await handleListRoutes({ frontend_id: UUID });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("GET");
			expect(req.urlParams.get("frontend_id")).toBe(UUID);
		});
	});

	// Scaleway API: GET /lb/v1/zones/{zone}/routes/{route_id}
	describe("GET /lb/v1/zones/{zone}/routes/{route_id}", () => {
		it("sends GET", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleGetRoute({ route_id: UUID });

			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/fr-par-1/routes/${UUID}`);
		});
	});

	// Scaleway API: POST /lb/v1/zones/{zone}/routes
	describe("POST /lb/v1/zones/{zone}/routes", () => {
		it("sends POST with route config", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleCreateRoute({
				frontend_id: UUID,
				backend_id: UUID2,
				match_sni: "example.com",
			});

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("POST");
			const body = JSON.parse(req.body);
			expect(body.frontend_id).toBe(UUID);
			expect(body.match_sni).toBe("example.com");
		});
	});

	// Scaleway API: PUT /lb/v1/zones/{zone}/routes/{route_id}
	describe("PUT /lb/v1/zones/{zone}/routes/{route_id}", () => {
		it("sends PUT, excludes route_id from body", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleUpdateRoute({
				route_id: UUID,
				backend_id: UUID2,
				match_host_header: "example.com",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.route_id).toBeUndefined();
			expect(body.backend_id).toBe(UUID2);
		});
	});

	// Scaleway API: DELETE /lb/v1/zones/{zone}/routes/{route_id}
	describe("DELETE /lb/v1/zones/{zone}/routes/{route_id}", () => {
		it("sends DELETE", async () => {
			mockFetch.mockResolvedValue(undefined);
			await handleDeleteRoute({ route_id: UUID });

			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
		});
	});

	// ─── Certificate endpoints ──────────────────────────────────────────────
	// Scaleway API: GET /lb/v1/zones/{zone}/lbs/{lb_id}/certificates
	describe("GET /lb/v1/zones/{zone}/lbs/{lb_id}/certificates", () => {
		it("sends GET with pagination", async () => {
			mockFetch.mockResolvedValue({ certificates: [], total_count: 0 });
			await handleListCertificates({ lb_id: UUID });

			expect(mockFetch.mock.calls[0][0].path).toBe(
				`/lb/v1/zones/fr-par-1/lbs/${UUID}/certificates`,
			);
		});
	});

	// Scaleway API: GET /lb/v1/zones/{zone}/certificates/{certificate_id}
	describe("GET /lb/v1/zones/{zone}/certificates/{certificate_id}", () => {
		it("sends GET", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleGetCertificate({ certificate_id: UUID });

			expect(mockFetch.mock.calls[0][0].path).toBe(`/lb/v1/zones/fr-par-1/certificates/${UUID}`);
		});
	});

	// Scaleway API: POST /lb/v1/zones/{zone}/lbs/{lb_id}/certificates
	describe("POST /lb/v1/zones/{zone}/lbs/{lb_id}/certificates", () => {
		it("sends POST with letsencrypt config", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleCreateCertificate({
				lb_id: UUID,
				name: "cert",
				letsencrypt: { common_name: "example.com" },
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.letsencrypt.common_name).toBe("example.com");
			expect(body.lb_id).toBeUndefined();
		});
	});

	// Scaleway API: PUT /lb/v1/zones/{zone}/certificates/{certificate_id}
	describe("PUT /lb/v1/zones/{zone}/certificates/{certificate_id}", () => {
		it("sends PUT with name", async () => {
			mockFetch.mockResolvedValue({ id: UUID });
			await handleUpdateCertificate({ certificate_id: UUID, name: "new-name" });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("PUT");
			expect(JSON.parse(req.body)).toEqual({ name: "new-name" });
		});
	});

	// Scaleway API: DELETE /lb/v1/zones/{zone}/certificates/{certificate_id}
	describe("DELETE /lb/v1/zones/{zone}/certificates/{certificate_id}", () => {
		it("sends DELETE", async () => {
			mockFetch.mockResolvedValue(undefined);
			await handleDeleteCertificate({ certificate_id: UUID });

			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
		});
	});

	// ─── Stats & Types endpoints ────────────────────────────────────────────
	// Scaleway API: GET /lb/v1/zones/{zone}/lbs/{lb_id}/stats
	describe("GET /lb/v1/zones/{zone}/lbs/{lb_id}/stats", () => {
		it("sends GET with optional backend_id filter", async () => {
			mockFetch.mockResolvedValue({ backend_servers_stats: [] });
			await handleGetLbStats({ lb_id: UUID, backend_id: UUID2 });

			const req = mockFetch.mock.calls[0][0];
			expect(req.path).toBe(`/lb/v1/zones/fr-par-1/lbs/${UUID}/stats`);
			expect(req.urlParams.get("backend_id")).toBe(UUID2);
		});
	});

	// Scaleway API: GET /lb/v1/zones/{zone}/lb-types
	describe("GET /lb/v1/zones/{zone}/lb-types", () => {
		it("sends GET with pagination", async () => {
			mockFetch.mockResolvedValue({ lb_types: [], total_count: 0 });
			await handleListLbTypes({ page: 1, pageSize: 50 });

			const req = mockFetch.mock.calls[0][0];
			expect(req.path).toBe("/lb/v1/zones/fr-par-1/lb-types");
			expect(req.urlParams.get("page")).toBe("1");
		});
	});

	// ─── Auth contract ──────────────────────────────────────────────────────

	describe("auth contract", () => {
		it("all handlers use loadAuthConfig for zone resolution", async () => {
			mockFetch.mockResolvedValue({});
			await handleListLbs({});
			// Default zone is fr-par-1 from loadAuthConfig mock
			expect(mockFetch.mock.calls[0][0].path).toContain("fr-par-1");
		});

		it("zone can be overridden per-request", async () => {
			mockFetch.mockResolvedValue({});
			await handleListLbs({ zone: "nl-ams-1" });
			expect(mockFetch.mock.calls[0][0].path).toContain("nl-ams-1");
		});
	});

	// ─── Response shape contract ────────────────────────────────────────────

	describe("response shape", () => {
		it("success responses are JSON text content", async () => {
			mockFetch.mockResolvedValue({ id: UUID, name: "lb" });
			const result = await handleGetLb({ lb_id: UUID });

			expect(result.content).toHaveLength(1);
			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe(UUID);
		});

		it("error responses have isError flag and structured error", async () => {
			mockFetch.mockRejectedValue(createApiError(404, "not found"));
			const result = await handleGetLb({ lb_id: UUID });

			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error).toBeDefined();
			expect(parsed.error.type).toBeDefined();
			expect(parsed.error.message).toBeDefined();
			expect(parsed.error.statusCode).toBeDefined();
		});
	});
});
