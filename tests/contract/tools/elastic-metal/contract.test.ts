/**
 * Contract tests for Elastic Metal MCP tools.
 *
 * Validates: input schema shapes, tool registration, request shapes sent to
 * the Scaleway API through `@scaleway/sdk-client` (method, relative path,
 * query params, JSON body), response structure, pagination patterns, auth
 * requirement, and error code mapping.
 *
 * API Reference: Scaleway Elastic Metal (Bare Metal) API v1
 *   - https://www.scaleway.com/en/developers/api/elastic-metal/
 *   - specs/scaleway-api/elastic-metal/api-reference.md
 *   - tests/parity-matrix.json (elastic-metal area)
 * Spec: specs/003-elastic-metal/contracts/tool-contract.md
 *       specs/057-elastic-metal-private-networks/contracts/private-networks.md
 * Endpoints: /baremetal/v1/zones/{zone}/* (incl. server-private-networks)
 *   and /flexible-ip/v1alpha1/zones/{zone}/fips[/{fip_id}].
 * Real SDK HTTP transport coverage: flexible-ip.transport.test.ts.
 *
 * Transport contract (`@scaleway/sdk-client` 1.x): `client.fetch(ScwRequest)`
 * where `path` is appended verbatim to `https://api.scaleway.com` (so it must
 * start with `/`), `urlParams` is a `URLSearchParams`, `body` is a JSON string,
 * `204` resolves to `undefined`, and non-2xx throws `ScalewayError` (`.status`).
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Errors } from "@scaleway/sdk-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import {
	handleAddServerPrivateNetwork,
	handleCreateIp,
	handleCreateServer,
	handleDeleteIp,
	handleDeleteServer,
	handleDeleteServerPrivateNetwork,
	handleGetBmcAccess,
	handleGetServer,
	handleInstallServer,
	handleListIps,
	handleListOffers,
	handleListOss,
	handleListServerPrivateNetworks,
	handleListServers,
	handleRebootServer,
	handleSetServerPrivateNetworks,
	handleStartServer,
	handleStopServer,
} from "../../../../src/tools/elastic-metal/handlers.js";
import { registerElasticMetalTools } from "../../../../src/tools/elastic-metal/index.js";
import {
	AddServerPrivateNetworkInput,
	CreateIpInput,
	CreateServerInput,
	DeleteIpInput,
	DeleteServerInput,
	DeleteServerPrivateNetworkInput,
	GetBmcAccessInput,
	GetServerInput,
	InstallServerInput,
	ListIpsInput,
	ListOffersInput,
	ListOssInput,
	ListServerPrivateNetworksInput,
	ListServersInput,
	RebootServerInput,
	SetServerPrivateNetworksInput,
	StartServerInput,
	StopServerInput,
} from "../../../../src/tools/elastic-metal/types.js";

// ── Mock setup ─────────────────────────────────────────────────────────────────

const mockFetch = vi.fn();

vi.mock("../../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn(() => ({ fetch: mockFetch })),
	resetClient: vi.fn(),
}));

vi.mock("../../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
		defaultProjectId: "00000000-0000-0000-0000-000000000000",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	})),
}));

interface ScwRequestShape {
	method: string;
	path: string;
	headers?: Record<string, string>;
	body?: string;
	urlParams?: URLSearchParams;
}

interface ToolResult {
	content: { type: string; text: string }[];
	isError?: boolean;
}

function sentRequest(): ScwRequestShape {
	expect(mockFetch).toHaveBeenCalledTimes(1);
	return mockFetch.mock.calls[0][0] as ScwRequestShape;
}

function parseResult(result: unknown) {
	return JSON.parse((result as ToolResult).content[0].text);
}

// Helper to check that a Zod schema correctly validates/rejects inputs
function expectSchemaAccepts(schema: z.ZodTypeAny, input: unknown) {
	expect(() => schema.parse(input)).not.toThrow();
}

function expectSchemaRejects(schema: z.ZodTypeAny, input: unknown) {
	expect(() => schema.parse(input)).toThrow();
}

const VALID_ZONE = "fr-par-1";
const VALID_UUID = "11111111-1111-1111-1111-111111111111";
const BASE_PATH = `/baremetal/v1/zones/${VALID_ZONE}`;
const FIP_PATH = `/flexible-ip/v1alpha1/zones/${VALID_ZONE}/fips`;
const JSON_HEADERS = { "Content-Type": "application/json" };

beforeEach(() => {
	mockFetch.mockReset();
});

describe("Elastic Metal contract tests", () => {
	// --- Tool Registration ---
	describe("tool registration", () => {
		it("registers all 18 Elastic Metal tools on a McpServer", () => {
			const server = new McpServer({ name: "test", version: "0.0.1" });
			expect(() => registerElasticMetalTools(server)).not.toThrow();
		});
	});

	// --- Request shapes (ScwRequest sent through @scaleway/sdk-client) ---
	describe("request shapes", () => {
		it("ListServers: GET /baremetal/v1/zones/{zone}/servers with page/page_size + filters", async () => {
			mockFetch.mockResolvedValueOnce({ servers: [], total_count: 0 });
			await handleListServers({
				zone: VALID_ZONE,
				page: 2,
				pageSize: 25,
				project_id: VALID_UUID,
				name: "web",
				tags: ["a", "b"],
				status: "ready",
				order_by: "created_at_desc",
			});
			const request = sentRequest();
			expect(request.method).toBe("GET");
			expect(request.path).toBe(`${BASE_PATH}/servers`);
			expect(request.body).toBeUndefined();
			expect(request.urlParams).toBeInstanceOf(URLSearchParams);
			expect(request.urlParams?.toString()).toBe(
				`page=2&page_size=25&project_id=${VALID_UUID}&name=web&tags=a&tags=b&status=ready&order_by=created_at_desc`,
			);
		});

		it("GetServer: GET /baremetal/v1/zones/{zone}/servers/{server_id}", async () => {
			mockFetch.mockResolvedValueOnce({ id: VALID_UUID });
			await handleGetServer({ zone: VALID_ZONE, server_id: VALID_UUID });
			const request = sentRequest();
			expect(request.method).toBe("GET");
			expect(request.path).toBe(`${BASE_PATH}/servers/${VALID_UUID}`);
			expect(request.body).toBeUndefined();
			expect(request.urlParams).toBeUndefined();
		});

		it("CreateServer: POST /baremetal/v1/zones/{zone}/servers with JSON body", async () => {
			mockFetch.mockResolvedValueOnce({ id: VALID_UUID });
			await handleCreateServer({
				zone: VALID_ZONE,
				offer_id: VALID_UUID,
				name: "srv",
				project_id: VALID_UUID,
			});
			const request = sentRequest();
			expect(request.method).toBe("POST");
			expect(request.path).toBe(`${BASE_PATH}/servers`);
			expect(request.headers).toEqual(JSON_HEADERS);
			expect(JSON.parse(request.body as string)).toEqual({
				offer_id: VALID_UUID,
				name: "srv",
				description: "",
				tags: [],
				project_id: VALID_UUID,
			});
		});

		it("DeleteServer: DELETE /baremetal/v1/zones/{zone}/servers/{server_id}", async () => {
			mockFetch.mockResolvedValueOnce({ id: VALID_UUID, status: "deleting" });
			await handleDeleteServer({ zone: VALID_ZONE, server_id: VALID_UUID });
			const request = sentRequest();
			expect(request.method).toBe("DELETE");
			expect(request.path).toBe(`${BASE_PATH}/servers/${VALID_UUID}`);
			expect(request.body).toBeUndefined();
		});

		it("InstallServer: POST /baremetal/v1/zones/{zone}/servers/{server_id}/install with JSON body", async () => {
			mockFetch.mockResolvedValueOnce({ id: VALID_UUID });
			await handleInstallServer({
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				os_id: VALID_UUID,
				hostname: "host",
				ssh_key_ids: [VALID_UUID],
				password: "p",
				service_user: "u",
				service_password: "sp",
			});
			const request = sentRequest();
			expect(request.method).toBe("POST");
			expect(request.path).toBe(`${BASE_PATH}/servers/${VALID_UUID}/install`);
			expect(request.headers).toEqual(JSON_HEADERS);
			expect(JSON.parse(request.body as string)).toEqual({
				os_id: VALID_UUID,
				hostname: "host",
				ssh_key_ids: [VALID_UUID],
				password: "p",
				service_user: "u",
				service_password: "sp",
			});
		});

		it("RebootServer: POST /baremetal/v1/zones/{zone}/servers/{server_id}/reboot with boot_type", async () => {
			mockFetch.mockResolvedValueOnce({ id: VALID_UUID });
			await handleRebootServer({ zone: VALID_ZONE, server_id: VALID_UUID, boot_type: "rescue" });
			const request = sentRequest();
			expect(request.method).toBe("POST");
			expect(request.path).toBe(`${BASE_PATH}/servers/${VALID_UUID}/reboot`);
			expect(request.headers).toEqual(JSON_HEADERS);
			expect(JSON.parse(request.body as string)).toEqual({ boot_type: "rescue" });
		});

		it("StartServer: POST /baremetal/v1/zones/{zone}/servers/{server_id}/start with empty body by default", async () => {
			mockFetch.mockResolvedValueOnce({ id: VALID_UUID });
			await handleStartServer({ zone: VALID_ZONE, server_id: VALID_UUID });
			const request = sentRequest();
			expect(request.method).toBe("POST");
			expect(request.path).toBe(`${BASE_PATH}/servers/${VALID_UUID}/start`);
			expect(request.headers).toEqual(JSON_HEADERS);
			expect(request.body).toBe("{}");
		});

		it("StopServer: POST /baremetal/v1/zones/{zone}/servers/{server_id}/stop with empty body", async () => {
			mockFetch.mockResolvedValueOnce({ id: VALID_UUID });
			await handleStopServer({ zone: VALID_ZONE, server_id: VALID_UUID });
			const request = sentRequest();
			expect(request.method).toBe("POST");
			expect(request.path).toBe(`${BASE_PATH}/servers/${VALID_UUID}/stop`);
			expect(request.headers).toEqual(JSON_HEADERS);
			expect(request.body).toBe("{}");
		});

		it("ListOffers: GET /baremetal/v1/zones/{zone}/offers with subscription_period", async () => {
			mockFetch.mockResolvedValueOnce({ offers: [], total_count: 0 });
			await handleListOffers({ zone: VALID_ZONE, subscription_period: "hourly" });
			const request = sentRequest();
			expect(request.method).toBe("GET");
			expect(request.path).toBe(`${BASE_PATH}/offers`);
			expect(request.urlParams?.toString()).toBe("page=1&page_size=50&subscription_period=hourly");
		});

		it("ListOS: GET /baremetal/v1/zones/{zone}/os with offer_id; response wrapped under `os`", async () => {
			mockFetch.mockResolvedValueOnce({ os: [{ id: VALID_UUID }], total_count: 1 });
			const result = await handleListOss({ zone: VALID_ZONE, offer_id: VALID_UUID });
			const request = sentRequest();
			expect(request.method).toBe("GET");
			expect(request.path).toBe(`${BASE_PATH}/os`);
			expect(request.urlParams?.toString()).toBe(`page=1&page_size=50&offer_id=${VALID_UUID}`);
			expect(parseResult(result).items).toEqual([{ id: VALID_UUID }]);
		});

		it("GetBMCAccess: GET /baremetal/v1/zones/{zone}/servers/{server_id}/bmc-access", async () => {
			mockFetch.mockResolvedValueOnce({ url: "https://bmc", login: "l", password: "p" });
			await handleGetBmcAccess({ zone: VALID_ZONE, server_id: VALID_UUID });
			const request = sentRequest();
			expect(request.method).toBe("GET");
			expect(request.path).toBe(`${BASE_PATH}/servers/${VALID_UUID}/bmc-access`);
			expect(request.body).toBeUndefined();
		});

		it("ListIPs: GET /flexible-ip/v1alpha1/zones/{zone}/fips with filters", async () => {
			mockFetch.mockResolvedValueOnce({ flexible_ips: [], total_count: 0 });
			await handleListIps({
				zone: VALID_ZONE,
				project_id: VALID_UUID,
				server_id: VALID_UUID,
				order_by: "created_at_asc",
			});
			const request = sentRequest();
			expect(request.method).toBe("GET");
			expect(request.path).toBe(FIP_PATH);
			expect(request.urlParams?.toString()).toBe(
				`page=1&page_size=50&project_id=${VALID_UUID}&server_ids=${VALID_UUID}&order_by=created_at_asc`,
			);
		});

		it("CreateIP: POST /flexible-ip/v1alpha1/zones/{zone}/fips with JSON body", async () => {
			mockFetch.mockResolvedValueOnce({ id: VALID_UUID });
			await handleCreateIp({ zone: VALID_ZONE, project_id: VALID_UUID, server_id: VALID_UUID });
			const request = sentRequest();
			expect(request.method).toBe("POST");
			expect(request.path).toBe(FIP_PATH);
			expect(request.headers).toEqual(JSON_HEADERS);
			expect(JSON.parse(request.body as string)).toEqual({
				project_id: VALID_UUID,
				description: "",
				tags: [],
				server_id: VALID_UUID,
			});
		});

		it("DeleteIP: DELETE /flexible-ip/v1alpha1/zones/{zone}/fips/{fip_id}; 204 normalized to {}", async () => {
			mockFetch.mockResolvedValueOnce(undefined);
			const result = await handleDeleteIp({ zone: VALID_ZONE, ip_id: VALID_UUID });
			const request = sentRequest();
			expect(request.method).toBe("DELETE");
			expect(request.path).toBe(`${FIP_PATH}/${VALID_UUID}`);
			expect(request.body).toBeUndefined();
			expect(parseResult(result)).toEqual({});
		});

		it("ListServerPrivateNetworks: GET /baremetal/v1/zones/{zone}/server-private-networks with filters", async () => {
			mockFetch.mockResolvedValueOnce({ server_private_networks: [], total_count: 0 });
			await handleListServerPrivateNetworks({
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				private_network_id: VALID_UUID,
				organization_id: VALID_UUID,
				project_id: VALID_UUID,
				order_by: "updated_at_asc",
			});
			const request = sentRequest();
			expect(request.method).toBe("GET");
			expect(request.path).toBe(`${BASE_PATH}/server-private-networks`);
			expect(request.urlParams?.toString()).toBe(
				`page=1&page_size=50&server_id=${VALID_UUID}&private_network_id=${VALID_UUID}&organization_id=${VALID_UUID}&project_id=${VALID_UUID}&order_by=updated_at_asc`,
			);
		});

		it("AddServerPrivateNetwork: POST /baremetal/v1/zones/{zone}/servers/{server_id}/private-networks", async () => {
			mockFetch.mockResolvedValueOnce({ id: VALID_UUID });
			await handleAddServerPrivateNetwork({
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				private_network_id: VALID_UUID,
			});
			const request = sentRequest();
			expect(request.method).toBe("POST");
			expect(request.path).toBe(`${BASE_PATH}/servers/${VALID_UUID}/private-networks`);
			expect(request.headers).toEqual(JSON_HEADERS);
			expect(JSON.parse(request.body as string)).toEqual({ private_network_id: VALID_UUID });
		});

		it("SetServerPrivateNetworks: PUT /baremetal/v1/zones/{zone}/servers/{server_id}/private-networks", async () => {
			mockFetch.mockResolvedValueOnce({ server_private_networks: [] });
			await handleSetServerPrivateNetworks({
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				private_network_ids: [VALID_UUID],
			});
			const request = sentRequest();
			expect(request.method).toBe("PUT");
			expect(request.path).toBe(`${BASE_PATH}/servers/${VALID_UUID}/private-networks`);
			expect(request.headers).toEqual(JSON_HEADERS);
			expect(JSON.parse(request.body as string)).toEqual({ private_network_ids: [VALID_UUID] });
		});

		it("DeleteServerPrivateNetwork: DELETE .../servers/{server_id}/private-networks/{private_network_id}; 204 -> {}", async () => {
			mockFetch.mockResolvedValueOnce(undefined);
			const result = await handleDeleteServerPrivateNetwork({
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				private_network_id: VALID_UUID,
			});
			const request = sentRequest();
			expect(request.method).toBe("DELETE");
			expect(request.path).toBe(
				`${BASE_PATH}/servers/${VALID_UUID}/private-networks/${VALID_UUID}`,
			);
			expect(request.body).toBeUndefined();
			expect(parseResult(result)).toEqual({});
		});

		it("never sends an absolute URL or a Response-style call (single ScwRequest argument)", async () => {
			mockFetch.mockResolvedValueOnce({ id: VALID_UUID });
			await handleGetServer({ zone: "pl-waw-2", server_id: VALID_UUID });
			expect(mockFetch.mock.calls[0]).toHaveLength(1);
			const request = sentRequest();
			expect(typeof request).toBe("object");
			expect(request.path.startsWith("/baremetal/v1/zones/pl-waw-2/")).toBe(true);
			expect(request.path).not.toMatch(/^https?:/);
		});
	});

	// --- Error code mapping (ScalewayError.status -> ApiErrorType) ---
	describe("error code mapping", () => {
		const cases: Array<[number, string]> = [
			[400, "invalid_input"],
			[401, "permission_denied"],
			[403, "permission_denied"],
			[404, "not_found"],
			[429, "rate_limited"],
			[500, "server_error"],
			[503, "server_error"],
		];

		for (const [status, type] of cases) {
			it(`maps ScalewayError ${status} to ${type}`, async () => {
				mockFetch.mockRejectedValueOnce(new Errors.ScalewayError(status, { message: "m" }));
				const result = (await handleGetServer({
					zone: VALID_ZONE,
					server_id: VALID_UUID,
				})) as ToolResult;
				expect(result.isError).toBe(true);
				const parsed = parseResult(result);
				expect(parsed.error.type).toBe(type);
				expect(parsed.error.statusCode).toBe(status);
			});
		}
	});

	// --- US1: Server CRUD Schema Contracts ---
	describe("ListServersInput schema", () => {
		it("accepts valid input with required zone", () => {
			expectSchemaAccepts(ListServersInput, { zone: VALID_ZONE });
		});

		it("applies pagination defaults (page=1, pageSize=50)", () => {
			const result = ListServersInput.parse({ zone: VALID_ZONE });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts all optional filters", () => {
			expectSchemaAccepts(ListServersInput, {
				zone: VALID_ZONE,
				page: 2,
				pageSize: 20,
				project_id: VALID_UUID,
				name: "test",
				tags: ["web"],
				status: "ready",
				order_by: "created_at_asc",
			});
		});

		it("rejects missing zone", () => {
			expectSchemaRejects(ListServersInput, {});
		});

		it("rejects invalid zone format", () => {
			expectSchemaRejects(ListServersInput, { zone: "invalid" });
		});

		it("rejects pageSize > 100", () => {
			expectSchemaRejects(ListServersInput, { zone: VALID_ZONE, pageSize: 101 });
		});

		it("rejects page < 1", () => {
			expectSchemaRejects(ListServersInput, { zone: VALID_ZONE, page: 0 });
		});
	});

	describe("GetServerInput schema", () => {
		it("accepts valid zone and server_id", () => {
			expectSchemaAccepts(GetServerInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("rejects missing server_id", () => {
			expectSchemaRejects(GetServerInput, { zone: VALID_ZONE });
		});

		it("rejects non-UUID server_id", () => {
			expectSchemaRejects(GetServerInput, { zone: VALID_ZONE, server_id: "not-uuid" });
		});
	});

	describe("CreateServerInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(CreateServerInput, {
				zone: VALID_ZONE,
				offer_id: VALID_UUID,
				name: "my-server",
			});
		});

		it("applies defaults for description and tags", () => {
			const result = CreateServerInput.parse({
				zone: VALID_ZONE,
				offer_id: VALID_UUID,
				name: "srv",
			});
			expect(result.description).toBe("");
			expect(result.tags).toEqual([]);
		});

		it("rejects empty name", () => {
			expectSchemaRejects(CreateServerInput, {
				zone: VALID_ZONE,
				offer_id: VALID_UUID,
				name: "",
			});
		});

		it("rejects missing offer_id", () => {
			expectSchemaRejects(CreateServerInput, { zone: VALID_ZONE, name: "srv" });
		});
	});

	describe("DeleteServerInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(DeleteServerInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("rejects missing server_id", () => {
			expectSchemaRejects(DeleteServerInput, { zone: VALID_ZONE });
		});
	});

	// --- US2: Server Actions Schema Contracts ---
	describe("InstallServerInput schema", () => {
		it("accepts valid input with required fields", () => {
			expectSchemaAccepts(InstallServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				os_id: VALID_UUID,
				hostname: "my-host",
				ssh_key_ids: [VALID_UUID],
			});
		});

		it("accepts optional fields", () => {
			expectSchemaAccepts(InstallServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				os_id: VALID_UUID,
				hostname: "my-host",
				ssh_key_ids: [VALID_UUID],
				password: "secret",
				service_user: "svc",
				service_password: "pass",
			});
		});

		it("rejects empty ssh_key_ids array", () => {
			expectSchemaRejects(InstallServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				os_id: VALID_UUID,
				hostname: "host",
				ssh_key_ids: [],
			});
		});

		it("rejects empty hostname", () => {
			expectSchemaRejects(InstallServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				os_id: VALID_UUID,
				hostname: "",
				ssh_key_ids: [VALID_UUID],
			});
		});
	});

	describe("RebootServerInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(RebootServerInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("accepts optional boot_type", () => {
			expectSchemaAccepts(RebootServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				boot_type: "rescue",
			});
		});
	});

	describe("StartServerInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(StartServerInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("accepts optional boot_type", () => {
			expectSchemaAccepts(StartServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				boot_type: "normal",
			});
		});
	});

	describe("StopServerInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(StopServerInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("rejects missing server_id", () => {
			expectSchemaRejects(StopServerInput, { zone: VALID_ZONE });
		});
	});

	// --- US3: Offers, OS, BMC Schema Contracts ---
	describe("ListOffersInput schema", () => {
		it("accepts valid input with zone", () => {
			expectSchemaAccepts(ListOffersInput, { zone: VALID_ZONE });
		});

		it("applies pagination defaults", () => {
			const result = ListOffersInput.parse({ zone: VALID_ZONE });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts subscription_period filter", () => {
			expectSchemaAccepts(ListOffersInput, {
				zone: VALID_ZONE,
				subscription_period: "hourly",
			});
		});
	});

	describe("ListOssInput schema", () => {
		it("accepts valid input with zone", () => {
			expectSchemaAccepts(ListOssInput, { zone: VALID_ZONE });
		});

		it("accepts offer_id filter", () => {
			expectSchemaAccepts(ListOssInput, {
				zone: VALID_ZONE,
				offer_id: VALID_UUID,
			});
		});

		it("applies pagination defaults", () => {
			const result = ListOssInput.parse({ zone: VALID_ZONE });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});
	});

	describe("GetBmcAccessInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(GetBmcAccessInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("rejects missing server_id", () => {
			expectSchemaRejects(GetBmcAccessInput, { zone: VALID_ZONE });
		});
	});

	// --- US4: Flexible IPs Schema Contracts ---
	describe("ListIpsInput schema", () => {
		it("accepts valid input with zone", () => {
			expectSchemaAccepts(ListIpsInput, { zone: VALID_ZONE });
		});

		it("accepts optional filters", () => {
			expectSchemaAccepts(ListIpsInput, {
				zone: VALID_ZONE,
				project_id: VALID_UUID,
				server_id: VALID_UUID,
				order_by: "created_at_asc",
			});
		});

		it("applies pagination defaults", () => {
			const result = ListIpsInput.parse({ zone: VALID_ZONE });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});
	});

	describe("CreateIpInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(CreateIpInput, {
				zone: VALID_ZONE,
				project_id: VALID_UUID,
			});
		});

		it("applies defaults for description and tags", () => {
			const result = CreateIpInput.parse({
				zone: VALID_ZONE,
				project_id: VALID_UUID,
			});
			expect(result.description).toBe("");
			expect(result.tags).toEqual([]);
		});

		it("accepts optional server_id", () => {
			expectSchemaAccepts(CreateIpInput, {
				zone: VALID_ZONE,
				project_id: VALID_UUID,
				server_id: VALID_UUID,
			});
		});

		it("rejects missing project_id", () => {
			expectSchemaRejects(CreateIpInput, { zone: VALID_ZONE });
		});
	});

	describe("DeleteIpInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(DeleteIpInput, { zone: VALID_ZONE, ip_id: VALID_UUID });
		});

		it("rejects missing ip_id", () => {
			expectSchemaRejects(DeleteIpInput, { zone: VALID_ZONE });
		});

		it("rejects non-UUID ip_id", () => {
			expectSchemaRejects(DeleteIpInput, { zone: VALID_ZONE, ip_id: "not-uuid" });
		});
	});

	// --- US5: Private Networks Schema Contracts ---
	describe("ListServerPrivateNetworksInput schema", () => {
		it("accepts valid input with zone only", () => {
			expectSchemaAccepts(ListServerPrivateNetworksInput, { zone: VALID_ZONE });
		});

		it("applies pagination defaults", () => {
			const result = ListServerPrivateNetworksInput.parse({ zone: VALID_ZONE });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts all optional filters", () => {
			expectSchemaAccepts(ListServerPrivateNetworksInput, {
				zone: VALID_ZONE,
				page: 2,
				pageSize: 20,
				server_id: VALID_UUID,
				private_network_id: VALID_UUID,
				organization_id: VALID_UUID,
				project_id: VALID_UUID,
				order_by: "updated_at_desc",
			});
		});

		it("rejects an invalid order_by value", () => {
			expectSchemaRejects(ListServerPrivateNetworksInput, {
				zone: VALID_ZONE,
				order_by: "name_asc",
			});
		});

		it("rejects a non-UUID private_network_id filter", () => {
			expectSchemaRejects(ListServerPrivateNetworksInput, {
				zone: VALID_ZONE,
				private_network_id: "not-uuid",
			});
		});
	});

	describe("AddServerPrivateNetworkInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(AddServerPrivateNetworkInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				private_network_id: VALID_UUID,
			});
		});

		it("rejects missing private_network_id", () => {
			expectSchemaRejects(AddServerPrivateNetworkInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
			});
		});

		it("rejects non-UUID server_id", () => {
			expectSchemaRejects(AddServerPrivateNetworkInput, {
				zone: VALID_ZONE,
				server_id: "not-uuid",
				private_network_id: VALID_UUID,
			});
		});
	});

	describe("SetServerPrivateNetworksInput schema", () => {
		it("accepts a list of Private Network IDs", () => {
			expectSchemaAccepts(SetServerPrivateNetworksInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				private_network_ids: [VALID_UUID],
			});
		});

		it("accepts an empty array (detach all)", () => {
			expectSchemaAccepts(SetServerPrivateNetworksInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				private_network_ids: [],
			});
		});

		it("rejects more than 8 Private Networks", () => {
			expectSchemaRejects(SetServerPrivateNetworksInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				private_network_ids: Array(9).fill(VALID_UUID),
			});
		});

		it("rejects non-UUID entries", () => {
			expectSchemaRejects(SetServerPrivateNetworksInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				private_network_ids: ["not-uuid"],
			});
		});
	});

	describe("DeleteServerPrivateNetworkInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(DeleteServerPrivateNetworkInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				private_network_id: VALID_UUID,
			});
		});

		it("rejects missing private_network_id", () => {
			expectSchemaRejects(DeleteServerPrivateNetworkInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
			});
		});
	});

	// --- Cross-cutting: Zone validation ---
	describe("zone validation (all schemas)", () => {
		const schemasRequiringZone = [
			{ name: "ListServersInput", schema: ListServersInput },
			{ name: "GetServerInput", schema: GetServerInput, extra: { server_id: VALID_UUID } },
			{ name: "CreateServerInput", schema: CreateServerInput, extra: { offer_id: "x", name: "y" } },
			{ name: "DeleteServerInput", schema: DeleteServerInput, extra: { server_id: VALID_UUID } },
			{
				name: "InstallServerInput",
				schema: InstallServerInput,
				extra: {
					server_id: VALID_UUID,
					os_id: VALID_UUID,
					hostname: "h",
					ssh_key_ids: [VALID_UUID],
				},
			},
			{ name: "RebootServerInput", schema: RebootServerInput, extra: { server_id: VALID_UUID } },
			{ name: "StartServerInput", schema: StartServerInput, extra: { server_id: VALID_UUID } },
			{ name: "StopServerInput", schema: StopServerInput, extra: { server_id: VALID_UUID } },
			{ name: "ListOffersInput", schema: ListOffersInput },
			{ name: "ListOssInput", schema: ListOssInput },
			{ name: "GetBmcAccessInput", schema: GetBmcAccessInput, extra: { server_id: VALID_UUID } },
			{ name: "ListIpsInput", schema: ListIpsInput },
			{ name: "CreateIpInput", schema: CreateIpInput, extra: { project_id: VALID_UUID } },
			{ name: "DeleteIpInput", schema: DeleteIpInput, extra: { ip_id: VALID_UUID } },
			{ name: "ListServerPrivateNetworksInput", schema: ListServerPrivateNetworksInput },
			{
				name: "AddServerPrivateNetworkInput",
				schema: AddServerPrivateNetworkInput,
				extra: { server_id: VALID_UUID, private_network_id: VALID_UUID },
			},
			{
				name: "SetServerPrivateNetworksInput",
				schema: SetServerPrivateNetworksInput,
				extra: { server_id: VALID_UUID, private_network_ids: [VALID_UUID] },
			},
			{
				name: "DeleteServerPrivateNetworkInput",
				schema: DeleteServerPrivateNetworkInput,
				extra: { server_id: VALID_UUID, private_network_id: VALID_UUID },
			},
		];

		for (const { name, schema, extra } of schemasRequiringZone) {
			it(`${name} rejects invalid zone format`, () => {
				expectSchemaRejects(schema, { ...extra, zone: "bad-zone" });
			});

			it(`${name} accepts valid zone fr-par-1`, () => {
				expectSchemaAccepts(schema, { ...extra, zone: "fr-par-1" });
			});

			it(`${name} accepts valid zone nl-ams-1`, () => {
				expectSchemaAccepts(schema, { ...extra, zone: "nl-ams-1" });
			});

			it(`${name} accepts valid zone pl-waw-1`, () => {
				expectSchemaAccepts(schema, { ...extra, zone: "pl-waw-1" });
			});
		}
	});
});
