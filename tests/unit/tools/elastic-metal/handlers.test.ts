import { Errors } from "@scaleway/sdk-client";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the auth and client modules before importing handlers
const mockFetch = vi.fn();

vi.mock("../../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "test-key",
		secretKey: "test-secret",
		defaultProjectId: "test-project",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

vi.mock("../../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

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

interface ToolResult {
	content: { type: string; text: string }[];
	isError?: boolean;
}

interface CapturedRequest {
	method: string;
	path: string;
	headers?: Record<string, string>;
	body?: string;
	urlParams?: URLSearchParams;
}

/**
 * `@scaleway/sdk-client` resolves `client.fetch()` with the already-parsed
 * JSON body (never a `Response`), and with `undefined` on `204 No Content`.
 */
function mockOkResponse(body: unknown) {
	mockFetch.mockResolvedValueOnce(body);
}

function mockNoContentResponse() {
	mockFetch.mockResolvedValueOnce(undefined);
}

/**
 * Non-2xx responses surface as a thrown `ScalewayError` carrying the numeric
 * HTTP status on `.status` and the payload on `.body`.
 */
function mockErrorResponse(statusCode: number, message: string) {
	mockFetch.mockRejectedValueOnce(new Errors.ScalewayError(statusCode, { message }));
}

function parseContent(result: ToolResult) {
	return JSON.parse(result.content[0].text);
}

function capturedRequest(): CapturedRequest {
	return mockFetch.mock.calls[0][0] as CapturedRequest;
}

function requestBody(): Record<string, unknown> {
	return JSON.parse(capturedRequest().body as string);
}

function requestQuery(): URLSearchParams {
	const { urlParams } = capturedRequest();
	expect(urlParams).toBeInstanceOf(URLSearchParams);
	return urlParams as URLSearchParams;
}

const ZONE = "fr-par-1";
const BASE_PATH = `/baremetal/v1/zones/${ZONE}`;
const FIP_PATH = `/flexible-ip/v1alpha1/zones/${ZONE}/fips`;
const SERVER_ID = "11111111-1111-1111-1111-111111111111";
const PROJECT_ID = "22222222-2222-2222-2222-222222222222";
const OFFER_ID = "33333333-3333-3333-3333-333333333333";
const OS_ID = "44444444-4444-4444-4444-444444444444";
const SSH_KEY_ID = "55555555-5555-5555-5555-555555555555";
const IP_ID = "66666666-6666-6666-6666-666666666666";
const PN_ID = "77777777-7777-7777-7777-777777777777";
const ORG_ID = "88888888-8888-8888-8888-888888888888";
const SPN_ID = "99999999-9999-9999-9999-999999999999";

beforeEach(() => {
	mockFetch.mockReset();
});

describe("Elastic Metal handlers", () => {
	// --- US1: Server CRUD ---
	describe("handleListServers", () => {
		it("returns paginated server list", async () => {
			mockOkResponse({ servers: [{ id: SERVER_ID, name: "srv-1" }], total_count: 1 });
			const result = (await handleListServers({ zone: ZONE })) as ToolResult;
			const data = parseContent(result);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
			expect(data.page).toBe(1);
			expect(data.pageSize).toBe(50);
		});

		it("sends a GET ScwRequest to the servers collection with default pagination", async () => {
			mockOkResponse({ servers: [], total_count: 0 });
			await handleListServers({ zone: ZONE });
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: `${BASE_PATH}/servers` }),
			);
			const request = capturedRequest();
			expect(request.body).toBeUndefined();
			expect(request.headers).toBeUndefined();
			expect(requestQuery().toString()).toBe("page=1&page_size=50");
		});

		it("passes optional filters to query params", async () => {
			mockOkResponse({ servers: [], total_count: 0 });
			await handleListServers({
				zone: ZONE,
				page: 1,
				pageSize: 20,
				project_id: PROJECT_ID,
				name: "test",
				tags: ["web", "prod"],
				status: "ready",
				order_by: "created_at_asc",
			});
			const query = requestQuery();
			expect(query.get("page")).toBe("1");
			expect(query.get("page_size")).toBe("20");
			expect(query.get("project_id")).toBe(PROJECT_ID);
			expect(query.get("name")).toBe("test");
			expect(query.getAll("tags")).toEqual(["web", "prod"]);
			expect(query.get("status")).toBe("ready");
			expect(query.get("order_by")).toBe("created_at_asc");
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(500, "Internal server error");
			const result = (await handleListServers({ zone: ZONE })) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("server_error");
			expect(data.error.statusCode).toBe(500);
		});

		it("returns error on network failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));
			const result = (await handleListServers({ zone: ZONE })) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("server_error");
			expect(data.error.message).toBe("Network error");
		});
	});

	describe("handleGetServer", () => {
		it("returns server details", async () => {
			mockOkResponse({ id: SERVER_ID, name: "srv-1", status: "ready" });
			const result = (await handleGetServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.id).toBe(SERVER_ID);
			expect(data.status).toBe("ready");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: `${BASE_PATH}/servers/${SERVER_ID}` }),
			);
			const request = capturedRequest();
			expect(request.body).toBeUndefined();
			expect(request.urlParams).toBeUndefined();
		});

		it("returns error on 404", async () => {
			mockErrorResponse(404, "Server not found");
			const result = (await handleGetServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("not_found");
			expect(data.error.statusCode).toBe(404);
		});
	});

	describe("handleCreateServer", () => {
		it("creates a server and returns it", async () => {
			mockOkResponse({ id: SERVER_ID, name: "new-srv", status: "delivering" });
			const result = (await handleCreateServer({
				zone: ZONE,
				offer_id: OFFER_ID,
				name: "new-srv",
				description: "test server",
				tags: ["test"],
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.id).toBe(SERVER_ID);
			expect(data.status).toBe("delivering");
		});

		it("sends a POST ScwRequest with a JSON body and Content-Type header", async () => {
			mockOkResponse({ id: SERVER_ID });
			await handleCreateServer({
				zone: ZONE,
				offer_id: OFFER_ID,
				name: "new-srv",
				description: "test server",
				tags: ["test"],
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "POST", path: `${BASE_PATH}/servers` }),
			);
			const request = capturedRequest();
			expect(request.headers).toEqual({ "Content-Type": "application/json" });
			expect(request.urlParams).toBeUndefined();
			expect(requestBody()).toEqual({
				offer_id: OFFER_ID,
				name: "new-srv",
				description: "test server",
				tags: ["test"],
			});
		});

		it("passes project_id when provided", async () => {
			mockOkResponse({ id: SERVER_ID });
			await handleCreateServer({
				zone: ZONE,
				offer_id: OFFER_ID,
				name: "srv",
				description: "",
				tags: [],
				project_id: PROJECT_ID,
			});
			expect(requestBody().project_id).toBe(PROJECT_ID);
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(400, "Invalid offer_id");
			const result = (await handleCreateServer({
				zone: ZONE,
				offer_id: "bad",
				name: "srv",
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("invalid_input");
		});
	});

	describe("handleDeleteServer", () => {
		it("deletes a server and returns it", async () => {
			mockOkResponse({ id: SERVER_ID, status: "deleting" });
			const result = (await handleDeleteServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.status).toBe("deleting");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "DELETE", path: `${BASE_PATH}/servers/${SERVER_ID}` }),
			);
			expect(capturedRequest().body).toBeUndefined();
		});

		it("returns error on 404", async () => {
			mockErrorResponse(404, "Not found");
			const result = (await handleDeleteServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			expect(parseContent(result).error.type).toBe("not_found");
		});
	});

	// --- US2: Server Actions ---
	describe("handleInstallServer", () => {
		it("installs OS on a server", async () => {
			mockOkResponse({ id: SERVER_ID, install: { status: "installing" } });
			const result = (await handleInstallServer({
				zone: ZONE,
				server_id: SERVER_ID,
				os_id: OS_ID,
				hostname: "my-host",
				ssh_key_ids: [SSH_KEY_ID],
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.install.status).toBe("installing");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: `${BASE_PATH}/servers/${SERVER_ID}/install`,
					headers: { "Content-Type": "application/json" },
				}),
			);
			expect(requestBody()).toEqual({
				os_id: OS_ID,
				hostname: "my-host",
				ssh_key_ids: [SSH_KEY_ID],
			});
		});

		it("passes optional fields when provided", async () => {
			mockOkResponse({ id: SERVER_ID });
			await handleInstallServer({
				zone: ZONE,
				server_id: SERVER_ID,
				os_id: OS_ID,
				hostname: "my-host",
				ssh_key_ids: [SSH_KEY_ID],
				password: "secret",
				service_user: "svc",
				service_password: "svc-pass",
			});
			const body = requestBody();
			expect(body.password).toBe("secret");
			expect(body.service_user).toBe("svc");
			expect(body.service_password).toBe("svc-pass");
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(409, "Server busy");
			const result = (await handleInstallServer({
				zone: ZONE,
				server_id: SERVER_ID,
				os_id: OS_ID,
				hostname: "host",
				ssh_key_ids: [SSH_KEY_ID],
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("server_error");
			expect(data.error.statusCode).toBe(409);
		});
	});

	describe("handleRebootServer", () => {
		it("reboots a server", async () => {
			mockOkResponse({ id: SERVER_ID, status: "starting" });
			const result = (await handleRebootServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.id).toBe(SERVER_ID);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: `${BASE_PATH}/servers/${SERVER_ID}/reboot`,
					headers: { "Content-Type": "application/json" },
				}),
			);
			expect(requestBody()).toEqual({});
		});

		it("passes boot_type when provided", async () => {
			mockOkResponse({ id: SERVER_ID });
			await handleRebootServer({ zone: ZONE, server_id: SERVER_ID, boot_type: "rescue" });
			expect(requestBody()).toEqual({ boot_type: "rescue" });
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(403, "Forbidden");
			const result = (await handleRebootServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("permission_denied");
		});
	});

	describe("handleStartServer", () => {
		it("starts a server", async () => {
			mockOkResponse({ id: SERVER_ID, status: "starting" });
			const result = (await handleStartServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.status).toBe("starting");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: `${BASE_PATH}/servers/${SERVER_ID}/start`,
					headers: { "Content-Type": "application/json" },
				}),
			);
			expect(requestBody()).toEqual({});
		});

		it("passes boot_type when provided", async () => {
			mockOkResponse({ id: SERVER_ID });
			await handleStartServer({ zone: ZONE, server_id: SERVER_ID, boot_type: "normal" });
			expect(requestBody()).toEqual({ boot_type: "normal" });
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(429, "Rate limited");
			const result = (await handleStartServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("rate_limited");
		});
	});

	describe("handleStopServer", () => {
		it("stops a server", async () => {
			mockOkResponse({ id: SERVER_ID, status: "stopping" });
			const result = (await handleStopServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.status).toBe("stopping");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: `${BASE_PATH}/servers/${SERVER_ID}/stop`,
					headers: { "Content-Type": "application/json" },
					body: "{}",
				}),
			);
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(401, "Unauthorized");
			const result = (await handleStopServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("permission_denied");
		});
	});

	// --- US3: Offers, OS, BMC ---
	describe("handleListOffers", () => {
		it("returns paginated offer list", async () => {
			mockOkResponse({
				offers: [{ id: OFFER_ID, name: "EM-A115X-SSD" }],
				total_count: 1,
			});
			const result = (await handleListOffers({ zone: ZONE })) as ToolResult;
			const data = parseContent(result);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: `${BASE_PATH}/offers` }),
			);
			expect(requestQuery().toString()).toBe("page=1&page_size=50");
		});

		it("passes subscription_period filter", async () => {
			mockOkResponse({ offers: [], total_count: 0 });
			await handleListOffers({ zone: ZONE, subscription_period: "hourly" });
			expect(requestQuery().get("subscription_period")).toBe("hourly");
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(500, "Error");
			const result = (await handleListOffers({ zone: ZONE })) as ToolResult;
			expect(result.isError).toBe(true);
			expect(parseContent(result).error.type).toBe("server_error");
		});
	});

	describe("handleListOss", () => {
		it("returns paginated OS list from the `os` collection key", async () => {
			mockOkResponse({ os: [{ id: OS_ID, name: "Ubuntu 22.04" }], total_count: 1 });
			const result = (await handleListOss({ zone: ZONE })) as ToolResult;
			const data = parseContent(result);
			expect(data.items).toHaveLength(1);
			expect(data.items[0].id).toBe(OS_ID);
			expect(data.totalCount).toBe(1);
		});

		it("sends a GET ScwRequest to the /os endpoint", async () => {
			mockOkResponse({ os: [], total_count: 0 });
			await handleListOss({ zone: ZONE });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: `${BASE_PATH}/os` }),
			);
			expect(requestQuery().toString()).toBe("page=1&page_size=50");
		});

		it("passes offer_id filter", async () => {
			mockOkResponse({ os: [], total_count: 0 });
			await handleListOss({ zone: ZONE, offer_id: OFFER_ID });
			expect(requestQuery().get("offer_id")).toBe(OFFER_ID);
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(500, "Error");
			const result = (await handleListOss({ zone: ZONE })) as ToolResult;
			expect(result.isError).toBe(true);
			expect(parseContent(result).error.type).toBe("server_error");
		});
	});

	describe("handleGetBmcAccess", () => {
		it("returns BMC access credentials", async () => {
			const bmc = {
				url: "https://bmc.example.com",
				login: "admin",
				password: "secret",
				expires_at: "2026-03-12T00:00:00Z",
			};
			mockOkResponse(bmc);
			const result = (await handleGetBmcAccess({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.url).toBe("https://bmc.example.com");
			expect(data.login).toBe("admin");
			expect(data.expires_at).toBeDefined();
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `${BASE_PATH}/servers/${SERVER_ID}/bmc-access`,
				}),
			);
			expect(capturedRequest().body).toBeUndefined();
		});

		it("returns error on 404", async () => {
			mockErrorResponse(404, "Not found");
			const result = (await handleGetBmcAccess({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("not_found");
		});
	});

	// --- US4: Flexible IPs ---
	describe("handleListIps", () => {
		it("returns paginated IP list", async () => {
			mockOkResponse({ flexible_ips: [{ id: IP_ID, ip_address: "192.0.2.1/32" }], total_count: 1 });
			const result = (await handleListIps({ zone: ZONE })) as ToolResult;
			const data = parseContent(result);
			expect(data.items).toEqual([{ id: IP_ID, ip_address: "192.0.2.1/32" }]);
			expect(data.totalCount).toBe(1);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: FIP_PATH }),
			);
			expect(requestQuery().toString()).toBe("page=1&page_size=50");
		});

		it("passes optional filters", async () => {
			mockOkResponse({ flexible_ips: [], total_count: 0 });
			await handleListIps({
				zone: ZONE,
				project_id: PROJECT_ID,
				server_id: SERVER_ID,
				order_by: "created_at_asc",
			});
			const query = requestQuery();
			expect(query.get("project_id")).toBe(PROJECT_ID);
			expect(query.getAll("server_ids")).toEqual([SERVER_ID]);
			expect(query.has("server_id")).toBe(false);
			expect(query.get("order_by")).toBe("created_at_asc");
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(500, "Error");
			const result = (await handleListIps({ zone: ZONE })) as ToolResult;
			expect(result.isError).toBe(true);
			expect(parseContent(result).error.type).toBe("server_error");
		});
	});

	describe("handleCreateIp", () => {
		it("creates a flexible IP", async () => {
			mockOkResponse({ id: IP_ID, ip_address: "192.0.2.1/32", project_id: PROJECT_ID });
			const result = (await handleCreateIp({
				zone: ZONE,
				project_id: PROJECT_ID,
				description: "test ip",
				tags: ["test"],
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.id).toBe(IP_ID);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: FIP_PATH,
					headers: { "Content-Type": "application/json" },
				}),
			);
			expect(requestBody()).toEqual({
				project_id: PROJECT_ID,
				description: "test ip",
				tags: ["test"],
			});
		});

		it("passes server_id when provided", async () => {
			mockOkResponse({ id: IP_ID });
			await handleCreateIp({
				zone: ZONE,
				project_id: PROJECT_ID,
				description: "",
				tags: [],
				server_id: SERVER_ID,
			});
			expect(requestBody().server_id).toBe(SERVER_ID);
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(400, "Bad request");
			const result = (await handleCreateIp({
				zone: ZONE,
				project_id: PROJECT_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			expect(parseContent(result).error.type).toBe("invalid_input");
		});
	});

	describe("handleDeleteIp", () => {
		it("deletes a flexible IP and normalizes 204 to an empty object", async () => {
			mockNoContentResponse();
			const result = (await handleDeleteIp({ zone: ZONE, ip_id: IP_ID })) as ToolResult;
			expect(result.isError).toBeUndefined();
			const data = parseContent(result);
			expect(data).toEqual({});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "DELETE", path: `${FIP_PATH}/${IP_ID}` }),
			);
			const request = capturedRequest();
			expect(request.body).toBeUndefined();
			expect(request.headers).toBeUndefined();
		});

		it("returns error on 404", async () => {
			mockErrorResponse(404, "Not found");
			const result = (await handleDeleteIp({ zone: ZONE, ip_id: IP_ID })) as ToolResult;
			expect(result.isError).toBe(true);
			expect(parseContent(result).error.type).toBe("not_found");
		});
	});

	// --- US5: Private Networks ---
	describe("handleListServerPrivateNetworks", () => {
		it("returns paginated attachment list", async () => {
			mockOkResponse({
				server_private_networks: [{ id: SPN_ID, private_network_id: PN_ID, vlan: 42 }],
				total_count: 1,
			});
			const result = (await handleListServerPrivateNetworks({ zone: ZONE })) as ToolResult;
			const data = parseContent(result);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
			expect(data.page).toBe(1);
			expect(data.pageSize).toBe(50);
		});

		it("hits the server-private-networks collection endpoint", async () => {
			mockOkResponse({ server_private_networks: [], total_count: 0 });
			await handleListServerPrivateNetworks({ zone: ZONE });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `${BASE_PATH}/server-private-networks`,
				}),
			);
			expect(requestQuery().toString()).toBe("page=1&page_size=50");
		});

		it("passes optional filters to query params", async () => {
			mockOkResponse({ server_private_networks: [], total_count: 0 });
			await handleListServerPrivateNetworks({
				zone: ZONE,
				page: 2,
				pageSize: 10,
				server_id: SERVER_ID,
				private_network_id: PN_ID,
				organization_id: ORG_ID,
				project_id: PROJECT_ID,
				order_by: "created_at_desc",
			});
			const query = requestQuery();
			expect(query.get("page")).toBe("2");
			expect(query.get("page_size")).toBe("10");
			expect(query.get("server_id")).toBe(SERVER_ID);
			expect(query.get("private_network_id")).toBe(PN_ID);
			expect(query.get("organization_id")).toBe(ORG_ID);
			expect(query.get("project_id")).toBe(PROJECT_ID);
			expect(query.get("order_by")).toBe("created_at_desc");
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(500, "Internal server error");
			const result = (await handleListServerPrivateNetworks({ zone: ZONE })) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("server_error");
		});
	});

	describe("handleAddServerPrivateNetwork", () => {
		it("attaches a server to a Private Network", async () => {
			mockOkResponse({ id: SPN_ID, private_network_id: PN_ID, status: "attaching" });
			const result = (await handleAddServerPrivateNetwork({
				zone: ZONE,
				server_id: SERVER_ID,
				private_network_id: PN_ID,
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.private_network_id).toBe(PN_ID);
			expect(data.status).toBe("attaching");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: `${BASE_PATH}/servers/${SERVER_ID}/private-networks`,
					headers: { "Content-Type": "application/json" },
				}),
			);
			expect(requestBody()).toEqual({ private_network_id: PN_ID });
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(409, "Maximum number of Private Networks reached");
			const result = (await handleAddServerPrivateNetwork({
				zone: ZONE,
				server_id: SERVER_ID,
				private_network_id: PN_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			expect(parseContent(result).error.statusCode).toBe(409);
		});
	});

	describe("handleSetServerPrivateNetworks", () => {
		it("replaces the full set of Private Networks", async () => {
			mockOkResponse({
				server_private_networks: [{ id: SPN_ID, private_network_id: PN_ID }],
			});
			const result = (await handleSetServerPrivateNetworks({
				zone: ZONE,
				server_id: SERVER_ID,
				private_network_ids: [PN_ID],
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.server_private_networks).toHaveLength(1);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "PUT",
					path: `${BASE_PATH}/servers/${SERVER_ID}/private-networks`,
					headers: { "Content-Type": "application/json" },
				}),
			);
			expect(requestBody()).toEqual({ private_network_ids: [PN_ID] });
		});

		it("supports detaching all with an empty array", async () => {
			mockOkResponse({ server_private_networks: [] });
			const result = (await handleSetServerPrivateNetworks({
				zone: ZONE,
				server_id: SERVER_ID,
				private_network_ids: [],
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.server_private_networks).toEqual([]);
			expect(requestBody()).toEqual({ private_network_ids: [] });
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(400, "Invalid Private Network ID");
			const result = (await handleSetServerPrivateNetworks({
				zone: ZONE,
				server_id: SERVER_ID,
				private_network_ids: [PN_ID],
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("invalid_input");
		});
	});

	describe("handleDeleteServerPrivateNetwork", () => {
		it("detaches a server from a Private Network and normalizes 204 to an empty object", async () => {
			mockNoContentResponse();
			const result = (await handleDeleteServerPrivateNetwork({
				zone: ZONE,
				server_id: SERVER_ID,
				private_network_id: PN_ID,
			})) as ToolResult;
			expect(result.isError).toBeUndefined();
			const data = parseContent(result);
			expect(data).toEqual({});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: `${BASE_PATH}/servers/${SERVER_ID}/private-networks/${PN_ID}`,
				}),
			);
			const request = capturedRequest();
			expect(request.body).toBeUndefined();
			expect(request.headers).toBeUndefined();
		});

		it("returns error on 404", async () => {
			mockErrorResponse(404, "Not found");
			const result = (await handleDeleteServerPrivateNetwork({
				zone: ZONE,
				server_id: SERVER_ID,
				private_network_id: PN_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("not_found");
		});
	});

	// --- Transport / error handling edge cases ---
	describe("SDK transport contract", () => {
		it("never issues absolute URLs: every path is rooted at /baremetal/v1/zones/{zone}", async () => {
			mockOkResponse({ id: SERVER_ID });
			await handleGetServer({ zone: "nl-ams-1", server_id: SERVER_ID });
			const { path } = capturedRequest();
			expect(path.startsWith("/baremetal/v1/zones/nl-ams-1/")).toBe(true);
			expect(path).not.toContain("https://");
		});

		it("maps a ScalewayError subclass carrying .status (ResourceNotFoundError)", async () => {
			mockFetch.mockRejectedValueOnce(
				new Errors.ResourceNotFoundError(
					404,
					{ message: "resource is not found", resource: "server", resource_id: SERVER_ID },
					"server",
					SERVER_ID,
				),
			);
			const result = (await handleGetServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("not_found");
			expect(data.error.statusCode).toBe(404);
		});

		it("surfaces the ScalewayError augmented message", async () => {
			mockFetch.mockRejectedValueOnce(new Errors.ScalewayError(500, "internal error"));
			const result = (await handleGetServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("server_error");
			expect(data.error.statusCode).toBe(500);
			expect(data.error.message).toBe("http error 500: internal error");
		});

		it("handles non-Error thrown values", async () => {
			mockFetch.mockRejectedValueOnce("string error");
			const result = (await handleGetServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("server_error");
			expect(data.error.message).toBe("string error");
		});
	});
});
