/**
 * Contract tests for Apple Silicon MCP tools.
 *
 * Validates request shapes, response shapes, pagination, auth, and error codes
 * against the Scaleway Apple Silicon API v1alpha1.
 *
 * API Reference: https://www.scaleway.com/en/developers/api/apple-silicon/
 * SDK Source: @scaleway/sdk-applesilicon (packages_generated/applesilicon/src/v1alpha1/)
 * Parity Matrix: tests/parity-matrix.json (apple-silicon section)
 */
import type { Client } from "@scaleway/sdk-client";
import { describe, expect, it, vi } from "vitest";
import { createAppleSiliconHandlers } from "../../../../src/tools/apple-silicon/handlers.js";
import {
	CreateServerParams,
	DeleteServerParams,
	GetServerParams,
	ListOSParams,
	ListServerTypesParams,
	ListServersParams,
	RebootServerParams,
	ReinstallServerParams,
} from "../../../../src/tools/apple-silicon/types.js";

// --- Helpers ---

function captureRequest(): { client: Client; getRequest: () => Record<string, unknown> } {
	let capturedRequest: Record<string, unknown> = {};
	const client = {
		fetch: vi.fn().mockImplementation((req: Record<string, unknown>) => {
			capturedRequest = req;
			return Promise.resolve({});
		}),
	} as unknown as Client;
	return { client, getRequest: () => capturedRequest };
}

function captureRequestWithResponse(response: unknown): {
	client: Client;
	getRequest: () => Record<string, unknown>;
} {
	let capturedRequest: Record<string, unknown> = {};
	const client = {
		fetch: vi.fn().mockImplementation((req: Record<string, unknown>) => {
			capturedRequest = req;
			return Promise.resolve(response);
		}),
	} as unknown as Client;
	return { client, getRequest: () => capturedRequest };
}

const DEFAULT_ZONE = "fr-par-3";

// --- Schema validation ---

describe("Apple Silicon contract: input schema validation", () => {
	describe("ListServersParams", () => {
		it("accepts minimal input with defaults", () => {
			const result = ListServersParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
			expect(result.zone).toBeUndefined();
			expect(result.order_by).toBeUndefined();
		});

		it("accepts full input", () => {
			const result = ListServersParams.parse({
				zone: "fr-par-3",
				project_id: "proj-123",
				organization_id: "org-456",
				order_by: "created_at_desc",
				page: 2,
				pageSize: 25,
			});
			expect(result.zone).toBe("fr-par-3");
			expect(result.order_by).toBe("created_at_desc");
		});

		it("rejects invalid order_by", () => {
			expect(() => ListServersParams.parse({ order_by: "invalid" })).toThrow();
		});

		it("rejects invalid zone format", () => {
			expect(() => ListServersParams.parse({ zone: "invalid" })).toThrow();
		});
	});

	describe("GetServerParams", () => {
		it("requires server_id", () => {
			expect(() => GetServerParams.parse({})).toThrow();
		});

		it("accepts valid input", () => {
			const result = GetServerParams.parse({ server_id: "abc-123" });
			expect(result.server_id).toBe("abc-123");
		});
	});

	describe("CreateServerParams", () => {
		it("requires type", () => {
			expect(() => CreateServerParams.parse({})).toThrow();
		});

		it("accepts minimal input with defaults", () => {
			const result = CreateServerParams.parse({ type: "M2-128" });
			expect(result.type).toBe("M2-128");
			expect(result.enable_vpc).toBe(false);
			expect(result.enable_kext).toBe(false);
		});

		it("accepts full input", () => {
			const result = CreateServerParams.parse({
				type: "M2-128",
				name: "my-mac",
				project_id: "proj-123",
				os_id: "os-456",
				enable_vpc: true,
				commitment_type: "renewed_monthly",
				public_bandwidth_bps: 1000000000,
				enable_kext: true,
			});
			expect(result.commitment_type).toBe("renewed_monthly");
		});

		it("rejects invalid commitment_type", () => {
			expect(() =>
				CreateServerParams.parse({ type: "M2-128", commitment_type: "weekly" }),
			).toThrow();
		});
	});

	describe("DeleteServerParams", () => {
		it("requires server_id", () => {
			expect(() => DeleteServerParams.parse({})).toThrow();
		});
	});

	describe("RebootServerParams", () => {
		it("requires server_id", () => {
			expect(() => RebootServerParams.parse({})).toThrow();
		});
	});

	describe("ReinstallServerParams", () => {
		it("requires server_id", () => {
			expect(() => ReinstallServerParams.parse({})).toThrow();
		});

		it("accepts server_id with defaults", () => {
			const result = ReinstallServerParams.parse({ server_id: "srv-123" });
			expect(result.enable_kext).toBe(false);
		});

		it("accepts full input", () => {
			const result = ReinstallServerParams.parse({
				server_id: "srv-123",
				os_id: "os-456",
				enable_kext: true,
			});
			expect(result.os_id).toBe("os-456");
			expect(result.enable_kext).toBe(true);
		});
	});

	describe("ListServerTypesParams", () => {
		it("accepts empty input", () => {
			const result = ListServerTypesParams.parse({});
			expect(result.zone).toBeUndefined();
		});
	});

	describe("ListOSParams", () => {
		it("accepts minimal input with defaults", () => {
			const result = ListOSParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts full input", () => {
			const result = ListOSParams.parse({
				zone: "fr-par-3",
				server_type: "M2-128",
				name: "Sonoma",
				page: 2,
				pageSize: 10,
			});
			expect(result.server_type).toBe("M2-128");
			expect(result.name).toBe("Sonoma");
		});
	});
});

// --- Request shape contracts ---

describe("Apple Silicon contract: request shapes", () => {
	/**
	 * Contract: GET /apple-silicon/v1alpha1/zones/{zone}/servers
	 * Spec: specs/scaleway-api/ (Apple Silicon v1alpha1)
	 */
	describe("scaleway_apple_silicon_list_servers", () => {
		it("sends GET to /apple-silicon/v1alpha1/zones/{zone}/servers", async () => {
			const { client, getRequest } = captureRequest();
			const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

			await handlers.listServers({ page: 1, pageSize: 50 });

			expect(getRequest().method).toBe("GET");
			expect(getRequest().path).toBe("/apple-silicon/v1alpha1/zones/fr-par-3/servers");
		});

		it("includes pagination in URL params", async () => {
			const { client, getRequest } = captureRequest();
			const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

			await handlers.listServers({ page: 3, pageSize: 20 });

			const params = getRequest().urlParams as URLSearchParams;
			expect(params.get("page")).toBe("3");
			expect(params.get("page_size")).toBe("20");
		});
	});

	/**
	 * Contract: GET /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}
	 * Spec: specs/scaleway-api/ (Apple Silicon v1alpha1)
	 */
	describe("scaleway_apple_silicon_get_server", () => {
		it("sends GET with server_id in path", async () => {
			const { client, getRequest } = captureRequest();
			const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

			await handlers.getServer({ server_id: "test-uuid" });

			expect(getRequest().method).toBe("GET");
			expect(getRequest().path).toBe("/apple-silicon/v1alpha1/zones/fr-par-3/servers/test-uuid");
		});
	});

	/**
	 * Contract: POST /apple-silicon/v1alpha1/zones/{zone}/servers
	 * Spec: specs/scaleway-api/ (Apple Silicon v1alpha1)
	 */
	describe("scaleway_apple_silicon_create_server", () => {
		it("sends POST with JSON body containing type", async () => {
			const { client, getRequest } = captureRequest();
			const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

			await handlers.createServer({
				type: "M2-128",
				enable_vpc: false,
				enable_kext: false,
			});

			expect(getRequest().method).toBe("POST");
			expect(getRequest().path).toBe("/apple-silicon/v1alpha1/zones/fr-par-3/servers");
			expect(getRequest().headers).toEqual({
				"Content-Type": "application/json",
			});
			const body = JSON.parse(getRequest().body as string);
			expect(body.type).toBe("M2-128");
		});

		it("sends correct body shape matching Scaleway CreateServerRequest", async () => {
			const { client, getRequest } = captureRequest();
			const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

			await handlers.createServer({
				type: "M4-128",
				name: "ci-runner",
				project_id: "proj-id",
				os_id: "os-id",
				enable_vpc: true,
				commitment_type: "duration_24h",
				public_bandwidth_bps: 500000000,
				enable_kext: true,
			});

			const body = JSON.parse(getRequest().body as string);
			// Validate all fields match Scaleway API snake_case convention
			expect(body).toEqual({
				type: "M4-128",
				name: "ci-runner",
				project_id: "proj-id",
				os_id: "os-id",
				enable_vpc: true,
				commitment_type: "duration_24h",
				public_bandwidth_bps: 500000000,
				enable_kext: true,
			});
		});
	});

	/**
	 * Contract: DELETE /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}
	 * Spec: specs/scaleway-api/ (Apple Silicon v1alpha1)
	 */
	describe("scaleway_apple_silicon_delete_server", () => {
		it("sends DELETE with server_id in path", async () => {
			const { client, getRequest } = captureRequest();
			const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

			await handlers.deleteServer({ server_id: "del-uuid" });

			expect(getRequest().method).toBe("DELETE");
			expect(getRequest().path).toBe("/apple-silicon/v1alpha1/zones/fr-par-3/servers/del-uuid");
		});
	});

	/**
	 * Contract: POST /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/reboot
	 * Spec: specs/scaleway-api/ (Apple Silicon v1alpha1)
	 */
	describe("scaleway_apple_silicon_reboot_server", () => {
		it("sends POST with empty JSON body", async () => {
			const { client, getRequest } = captureRequest();
			const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

			await handlers.rebootServer({ server_id: "reboot-uuid" });

			expect(getRequest().method).toBe("POST");
			expect(getRequest().path).toBe(
				"/apple-silicon/v1alpha1/zones/fr-par-3/servers/reboot-uuid/reboot",
			);
			expect(getRequest().body).toBe("{}");
		});
	});

	/**
	 * Contract: POST /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/reinstall
	 * Spec: specs/scaleway-api/ (Apple Silicon v1alpha1)
	 */
	describe("scaleway_apple_silicon_reinstall_server", () => {
		it("sends POST with reinstall body", async () => {
			const { client, getRequest } = captureRequest();
			const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

			await handlers.reinstallServer({
				server_id: "reinstall-uuid",
				os_id: "new-os",
				enable_kext: true,
			});

			expect(getRequest().method).toBe("POST");
			expect(getRequest().path).toBe(
				"/apple-silicon/v1alpha1/zones/fr-par-3/servers/reinstall-uuid/reinstall",
			);
			const body = JSON.parse(getRequest().body as string);
			expect(body).toEqual({ os_id: "new-os", enable_kext: true });
		});
	});

	/**
	 * Contract: GET /apple-silicon/v1alpha1/zones/{zone}/server-types
	 * Spec: specs/scaleway-api/ (Apple Silicon v1alpha1)
	 */
	describe("scaleway_apple_silicon_list_server_types", () => {
		it("sends GET with no URL params (not paginated)", async () => {
			const { client, getRequest } = captureRequest();
			const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

			await handlers.listServerTypes({});

			expect(getRequest().method).toBe("GET");
			expect(getRequest().path).toBe("/apple-silicon/v1alpha1/zones/fr-par-3/server-types");
			expect(getRequest().urlParams).toBeUndefined();
		});
	});

	/**
	 * Contract: GET /apple-silicon/v1alpha1/zones/{zone}/os
	 * Spec: specs/scaleway-api/ (Apple Silicon v1alpha1)
	 */
	describe("scaleway_apple_silicon_list_os", () => {
		it("sends GET with pagination and filter params", async () => {
			const { client, getRequest } = captureRequest();
			const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

			await handlers.listOS({
				page: 1,
				pageSize: 50,
				server_type: "M2-128",
				name: "Sonoma",
			});

			expect(getRequest().method).toBe("GET");
			expect(getRequest().path).toBe("/apple-silicon/v1alpha1/zones/fr-par-3/os");
			const params = getRequest().urlParams as URLSearchParams;
			expect(params.get("server_type")).toBe("M2-128");
			expect(params.get("name")).toBe("Sonoma");
			expect(params.get("page")).toBe("1");
			expect(params.get("page_size")).toBe("50");
		});
	});
});

// --- Response shape contracts ---

describe("Apple Silicon contract: response shapes", () => {
	it("listServers wraps response as JSON text content", async () => {
		const response = {
			servers: [
				{
					id: "srv-1",
					name: "mac-1",
					type: "M2-128",
					status: "ready",
					ip: "1.2.3.4",
					zone: "fr-par-3",
				},
			],
			total_count: 1,
		};
		const { client } = captureRequestWithResponse(response);
		const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

		const result = await handlers.listServers({ page: 1, pageSize: 50 });

		expect(result.content).toHaveLength(1);
		expect(result.content[0].type).toBe("text");
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.servers).toHaveLength(1);
		expect(parsed.total_count).toBe(1);
		expect(parsed.servers[0].id).toBe("srv-1");
	});

	it("getServer returns server object as JSON text", async () => {
		const server = { id: "srv-1", name: "mac-1", status: "ready" };
		const { client } = captureRequestWithResponse(server);
		const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

		const result = await handlers.getServer({ server_id: "srv-1" });

		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.id).toBe("srv-1");
		expect(parsed.status).toBe("ready");
	});

	it("createServer returns created server as JSON text", async () => {
		const server = { id: "new-srv", status: "starting", type: "M2-128" };
		const { client } = captureRequestWithResponse(server);
		const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

		const result = await handlers.createServer({
			type: "M2-128",
			enable_vpc: false,
			enable_kext: false,
		});

		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.id).toBe("new-srv");
		expect(parsed.status).toBe("starting");
	});

	it("deleteServer returns success message", async () => {
		const { client } = captureRequestWithResponse(undefined);
		const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

		const result = await handlers.deleteServer({ server_id: "srv-1" });

		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.message).toBe("Server deleted successfully");
	});

	it("listServerTypes returns server_types array", async () => {
		const response = {
			server_types: [
				{
					name: "M2-128",
					cpu: { name: "Apple M2", core_count: 8 },
					stock: "high_stock",
				},
			],
		};
		const { client } = captureRequestWithResponse(response);
		const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

		const result = await handlers.listServerTypes({});

		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.server_types).toHaveLength(1);
		expect(parsed.server_types[0].name).toBe("M2-128");
	});

	it("listOS returns os array with total_count", async () => {
		const response = {
			os: [{ id: "os-1", name: "macOS Sonoma", version: "14.3" }],
			total_count: 1,
		};
		const { client } = captureRequestWithResponse(response);
		const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

		const result = await handlers.listOS({ page: 1, pageSize: 50 });

		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.os).toHaveLength(1);
		expect(parsed.total_count).toBe(1);
	});
});

// --- Error code contracts ---

describe("Apple Silicon contract: error codes", () => {
	function makeStatusError(statusCode: number, message: string): Error {
		const err = new Error(message);
		(err as Error & { statusCode: number }).statusCode = statusCode;
		return err;
	}

	function errorClient(error: Error): Client {
		return {
			fetch: vi.fn().mockRejectedValue(error),
		} as unknown as Client;
	}

	const errorCases = [
		{ code: 400, expectedType: "invalid_input" },
		{ code: 401, expectedType: "permission_denied" },
		{ code: 403, expectedType: "permission_denied" },
		{ code: 404, expectedType: "not_found" },
		{ code: 429, expectedType: "rate_limited" },
		{ code: 500, expectedType: "server_error" },
	] as const;

	for (const { code, expectedType } of errorCases) {
		it(`maps HTTP ${code} to ${expectedType}`, async () => {
			const client = errorClient(makeStatusError(code, `Error ${code}`));
			const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

			const result = await handlers.getServer({ server_id: "any" });

			expect((result as { isError?: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe(expectedType);
			expect(parsed.error.statusCode).toBe(code);
		});
	}

	it("maps unknown status code to server_error", async () => {
		const client = errorClient(makeStatusError(502, "Bad Gateway"));
		const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

		const result = await handlers.getServer({ server_id: "any" });

		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.error.type).toBe("server_error");
	});
});

// --- Auth contract ---

describe("Apple Silicon contract: auth", () => {
	it("passes requests through the sdk-client which handles auth headers", async () => {
		// The @scaleway/sdk-client Client handles auth header injection automatically.
		// This test verifies that our handlers correctly delegate to client.fetch()
		// which is responsible for adding the X-Auth-Token header.
		const fetchMock = vi.fn().mockResolvedValue({});
		const client = { fetch: fetchMock } as unknown as Client;
		const handlers = createAppleSiliconHandlers(client, DEFAULT_ZONE);

		await handlers.listServers({ page: 1, pageSize: 50 });

		expect(fetchMock).toHaveBeenCalledOnce();
		// Verify we pass a proper ScwRequest that the client can process
		const req = fetchMock.mock.calls[0][0];
		expect(req.method).toBeDefined();
		expect(req.path).toBeDefined();
	});
});
