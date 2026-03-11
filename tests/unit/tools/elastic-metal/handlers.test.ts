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
	handleCreateIp,
	handleCreateServer,
	handleDeleteIp,
	handleDeleteServer,
	handleGetBmcAccess,
	handleGetServer,
	handleInstallServer,
	handleListIps,
	handleListOffers,
	handleListOss,
	handleListServers,
	handleRebootServer,
	handleStartServer,
	handleStopServer,
} from "../../../../src/tools/elastic-metal/handlers.js";

interface ToolResult {
	content: { type: string; text: string }[];
	isError?: boolean;
}

function mockOkResponse(body: unknown, status = 200) {
	mockFetch.mockResolvedValueOnce({
		ok: true,
		status,
		json: vi.fn().mockResolvedValue(body),
		text: vi.fn().mockResolvedValue(JSON.stringify(body)),
	});
}

function mockErrorResponse(statusCode: number, message: string) {
	mockFetch.mockResolvedValueOnce({
		ok: false,
		status: statusCode,
		json: vi.fn().mockResolvedValue({ message }),
		text: vi.fn().mockResolvedValue(message),
	});
}

function parseContent(result: ToolResult) {
	return JSON.parse(result.content[0].text);
}

const ZONE = "fr-par-1";
const SERVER_ID = "11111111-1111-1111-1111-111111111111";
const PROJECT_ID = "22222222-2222-2222-2222-222222222222";
const OFFER_ID = "33333333-3333-3333-3333-333333333333";
const OS_ID = "44444444-4444-4444-4444-444444444444";
const SSH_KEY_ID = "55555555-5555-5555-5555-555555555555";
const IP_ID = "66666666-6666-6666-6666-666666666666";

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
			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain(`project_id=${PROJECT_ID}`);
			expect(calledUrl).toContain("name=test");
			expect(calledUrl).toContain("tags=web");
			expect(calledUrl).toContain("tags=prod");
			expect(calledUrl).toContain("status=ready");
			expect(calledUrl).toContain("order_by=created_at_asc");
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(500, "Internal server error");
			const result = (await handleListServers({ zone: ZONE })) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.type).toBe("server_error");
		});

		it("returns error on network failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));
			const result = (await handleListServers({ zone: ZONE })) as ToolResult;
			expect(result.isError).toBe(true);
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
			const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
			expect(requestBody.project_id).toBe(PROJECT_ID);
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
		});

		it("returns error on 404", async () => {
			mockErrorResponse(404, "Not found");
			const result = (await handleDeleteServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
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
			const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
			expect(requestBody.password).toBe("secret");
			expect(requestBody.service_user).toBe("svc");
			expect(requestBody.service_password).toBe("svc-pass");
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
		});

		it("passes boot_type when provided", async () => {
			mockOkResponse({ id: SERVER_ID });
			await handleRebootServer({ zone: ZONE, server_id: SERVER_ID, boot_type: "rescue" });
			const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
			expect(requestBody.boot_type).toBe("rescue");
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
		});

		it("passes boot_type when provided", async () => {
			mockOkResponse({ id: SERVER_ID });
			await handleStartServer({ zone: ZONE, server_id: SERVER_ID, boot_type: "normal" });
			const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
			expect(requestBody.boot_type).toBe("normal");
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
		});

		it("passes subscription_period filter", async () => {
			mockOkResponse({ offers: [], total_count: 0 });
			await handleListOffers({ zone: ZONE, subscription_period: "hourly" });
			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain("subscription_period=hourly");
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(500, "Error");
			const result = (await handleListOffers({ zone: ZONE })) as ToolResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleListOss", () => {
		it("returns paginated OS list", async () => {
			mockOkResponse({ oss: [{ id: OS_ID, name: "Ubuntu 22.04" }], total_count: 1 });
			const result = (await handleListOss({ zone: ZONE })) as ToolResult;
			const data = parseContent(result);
			expect(data.items).toHaveLength(1);
		});

		it("passes offer_id filter", async () => {
			mockOkResponse({ oss: [], total_count: 0 });
			await handleListOss({ zone: ZONE, offer_id: OFFER_ID });
			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain(`offer_id=${OFFER_ID}`);
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(500, "Error");
			const result = (await handleListOss({ zone: ZONE })) as ToolResult;
			expect(result.isError).toBe(true);
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
			mockOkResponse({ ips: [{ id: IP_ID, address: "1.2.3.4" }], total_count: 1 });
			const result = (await handleListIps({ zone: ZONE })) as ToolResult;
			const data = parseContent(result);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
		});

		it("passes optional filters", async () => {
			mockOkResponse({ ips: [], total_count: 0 });
			await handleListIps({
				zone: ZONE,
				project_id: PROJECT_ID,
				server_id: SERVER_ID,
				order_by: "created_at_asc",
			});
			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain(`project_id=${PROJECT_ID}`);
			expect(calledUrl).toContain(`server_id=${SERVER_ID}`);
			expect(calledUrl).toContain("order_by=created_at_asc");
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(500, "Error");
			const result = (await handleListIps({ zone: ZONE })) as ToolResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateIp", () => {
		it("creates a flexible IP", async () => {
			mockOkResponse({ id: IP_ID, address: "1.2.3.4", project_id: PROJECT_ID });
			const result = (await handleCreateIp({
				zone: ZONE,
				project_id: PROJECT_ID,
				description: "test ip",
				tags: ["test"],
			})) as ToolResult;
			const data = parseContent(result);
			expect(data.id).toBe(IP_ID);
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
			const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
			expect(requestBody.server_id).toBe(SERVER_ID);
		});

		it("returns error on API failure", async () => {
			mockErrorResponse(400, "Bad request");
			const result = (await handleCreateIp({
				zone: ZONE,
				project_id: PROJECT_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteIp", () => {
		it("deletes a flexible IP", async () => {
			mockOkResponse({}, 204);
			const result = (await handleDeleteIp({ zone: ZONE, ip_id: IP_ID })) as ToolResult;
			const data = parseContent(result);
			expect(data).toEqual({});
		});

		it("returns error on 404", async () => {
			mockErrorResponse(404, "Not found");
			const result = (await handleDeleteIp({ zone: ZONE, ip_id: IP_ID })) as ToolResult;
			expect(result.isError).toBe(true);
		});
	});

	// --- Error handling edge cases ---
	describe("apiCall error handling", () => {
		it("handles HTTP error with empty body", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				text: vi.fn().mockResolvedValue(""),
			});
			const result = (await handleGetServer({
				zone: ZONE,
				server_id: SERVER_ID,
			})) as ToolResult;
			expect(result.isError).toBe(true);
			const data = parseContent(result);
			expect(data.error.message).toContain("HTTP 500");
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
		});
	});
});
