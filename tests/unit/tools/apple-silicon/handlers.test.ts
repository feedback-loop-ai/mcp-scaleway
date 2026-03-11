import type { Client } from "@scaleway/sdk-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAppleSiliconHandlers } from "../../../../src/tools/apple-silicon/handlers.js";

function createMockClient(response: unknown = {}): Client {
	return {
		fetch: vi.fn().mockResolvedValue(response),
	} as unknown as Client;
}

function createErrorClient(error: unknown): Client {
	return {
		fetch: vi.fn().mockRejectedValue(error),
	} as unknown as Client;
}

function makeStatusError(statusCode: number, message: string): Error {
	const err = new Error(message);
	(err as Error & { statusCode: number }).statusCode = statusCode;
	return err;
}

const DEFAULT_ZONE = "fr-par-1";

describe("createAppleSiliconHandlers", () => {
	let mockClient: Client;
	let handlers: ReturnType<typeof createAppleSiliconHandlers>;

	describe("listServers", () => {
		it("calls fetch with correct path and default pagination", async () => {
			const response = { servers: [], total_count: 0 };
			mockClient = createMockClient(response);
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.listServers({ page: 1, pageSize: 50 });

			expect(mockClient.fetch).toHaveBeenCalledOnce();
			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/apple-silicon/v1alpha1/zones/fr-par-1/servers");
			expect(result.content[0].text).toContain('"total_count": 0');
		});

		it("uses provided zone instead of default", async () => {
			mockClient = createMockClient({ servers: [], total_count: 0 });
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.listServers({ zone: "fr-par-3", page: 1, pageSize: 50 });

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.path).toBe("/apple-silicon/v1alpha1/zones/fr-par-3/servers");
		});

		it("passes filter params as URL params", async () => {
			mockClient = createMockClient({ servers: [], total_count: 0 });
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.listServers({
				page: 2,
				pageSize: 10,
				order_by: "created_at_desc",
				project_id: "proj-123",
				organization_id: "org-456",
			});

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			const params = call.urlParams as URLSearchParams;
			expect(params.get("order_by")).toBe("created_at_desc");
			expect(params.get("project_id")).toBe("proj-123");
			expect(params.get("organization_id")).toBe("org-456");
			expect(params.get("page")).toBe("2");
			expect(params.get("page_size")).toBe("10");
		});

		it("omits undefined filter params from URL params", async () => {
			mockClient = createMockClient({ servers: [], total_count: 0 });
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.listServers({ page: 1, pageSize: 50 });

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			const params = call.urlParams as URLSearchParams;
			expect(params.has("order_by")).toBe(false);
			expect(params.has("project_id")).toBe(false);
			expect(params.has("organization_id")).toBe(false);
		});

		it("returns error response on failure", async () => {
			mockClient = createErrorClient(makeStatusError(401, "Unauthorized"));
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.listServers({ page: 1, pageSize: 50 });

			expect((result as { isError?: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("permission_denied");
		});
	});

	describe("getServer", () => {
		it("calls fetch with correct path", async () => {
			const serverData = { id: "srv-123", name: "test", status: "ready" };
			mockClient = createMockClient(serverData);
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.getServer({ server_id: "srv-123" });

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/apple-silicon/v1alpha1/zones/fr-par-1/servers/srv-123");
			expect(result.content[0].text).toContain("srv-123");
		});

		it("uses provided zone", async () => {
			mockClient = createMockClient({});
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.getServer({ zone: "fr-par-3", server_id: "srv-123" });

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.path).toContain("fr-par-3");
		});

		it("returns not_found error for 404", async () => {
			mockClient = createErrorClient(makeStatusError(404, "Not found"));
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.getServer({ server_id: "missing" });

			expect((result as { isError?: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("not_found");
		});
	});

	describe("createServer", () => {
		it("sends POST with required fields", async () => {
			const serverData = { id: "new-srv", status: "starting" };
			mockClient = createMockClient(serverData);
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.createServer({
				type: "M2-128",
				enable_vpc: false,
				enable_kext: false,
			});

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe("/apple-silicon/v1alpha1/zones/fr-par-1/servers");
			expect(call.headers).toEqual({ "Content-Type": "application/json" });
			const body = JSON.parse(call.body as string);
			expect(body.type).toBe("M2-128");
			expect(body.enable_vpc).toBe(false);
			expect(body.enable_kext).toBe(false);
			expect(result.content[0].text).toContain("new-srv");
		});

		it("includes all optional fields when provided", async () => {
			mockClient = createMockClient({});
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.createServer({
				type: "M2-128",
				name: "my-mac",
				project_id: "proj-123",
				os_id: "os-456",
				enable_vpc: true,
				commitment_type: "renewed_monthly",
				public_bandwidth_bps: 1000000000,
				enable_kext: true,
			});

			const body = JSON.parse(vi.mocked(mockClient.fetch).mock.calls[0][0].body as string);
			expect(body.name).toBe("my-mac");
			expect(body.project_id).toBe("proj-123");
			expect(body.os_id).toBe("os-456");
			expect(body.enable_vpc).toBe(true);
			expect(body.commitment_type).toBe("renewed_monthly");
			expect(body.public_bandwidth_bps).toBe(1000000000);
			expect(body.enable_kext).toBe(true);
		});

		it("omits undefined optional fields from body", async () => {
			mockClient = createMockClient({});
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.createServer({
				type: "M2-128",
				enable_vpc: false,
				enable_kext: false,
			});

			const body = JSON.parse(vi.mocked(mockClient.fetch).mock.calls[0][0].body as string);
			expect(body).not.toHaveProperty("name");
			expect(body).not.toHaveProperty("project_id");
			expect(body).not.toHaveProperty("os_id");
			expect(body).not.toHaveProperty("commitment_type");
			expect(body).not.toHaveProperty("public_bandwidth_bps");
		});

		it("defaults enable_vpc and enable_kext to false when undefined", async () => {
			mockClient = createMockClient({});
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.createServer({
				type: "M2-128",
			} as Parameters<typeof handlers.createServer>[0]);

			const body = JSON.parse(vi.mocked(mockClient.fetch).mock.calls[0][0].body as string);
			expect(body.enable_vpc).toBe(false);
			expect(body.enable_kext).toBe(false);
		});

		it("returns error on 400", async () => {
			mockClient = createErrorClient(makeStatusError(400, "Invalid type"));
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.createServer({
				type: "INVALID",
				enable_vpc: false,
				enable_kext: false,
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("invalid_input");
		});
	});

	describe("deleteServer", () => {
		it("sends DELETE and returns success message", async () => {
			mockClient = createMockClient(undefined);
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.deleteServer({ server_id: "srv-123" });

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.method).toBe("DELETE");
			expect(call.path).toBe("/apple-silicon/v1alpha1/zones/fr-par-1/servers/srv-123");
			expect(result.content[0].text).toContain("deleted successfully");
		});

		it("returns error on 404", async () => {
			mockClient = createErrorClient(makeStatusError(404, "Not found"));
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.deleteServer({ server_id: "missing" });

			expect((result as { isError?: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("not_found");
		});
	});

	describe("rebootServer", () => {
		it("sends POST with empty body", async () => {
			const serverData = { id: "srv-123", status: "rebooting" };
			mockClient = createMockClient(serverData);
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.rebootServer({ server_id: "srv-123" });

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe("/apple-silicon/v1alpha1/zones/fr-par-1/servers/srv-123/reboot");
			expect(call.body).toBe("{}");
			expect(call.headers).toEqual({ "Content-Type": "application/json" });
			expect(result.content[0].text).toContain("rebooting");
		});

		it("uses provided zone", async () => {
			mockClient = createMockClient({});
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.rebootServer({ zone: "fr-par-3", server_id: "srv-123" });

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.path).toContain("fr-par-3");
		});

		it("returns error on 403", async () => {
			mockClient = createErrorClient(makeStatusError(403, "Forbidden"));
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.rebootServer({ server_id: "srv-123" });

			expect((result as { isError?: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("permission_denied");
		});
	});

	describe("reinstallServer", () => {
		it("sends POST with enable_kext default", async () => {
			const serverData = { id: "srv-123", status: "reinstalling" };
			mockClient = createMockClient(serverData);
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.reinstallServer({
				server_id: "srv-123",
				enable_kext: false,
			});

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe("/apple-silicon/v1alpha1/zones/fr-par-1/servers/srv-123/reinstall");
			const body = JSON.parse(call.body as string);
			expect(body.enable_kext).toBe(false);
			expect(body).not.toHaveProperty("os_id");
			expect(result.content[0].text).toContain("reinstalling");
		});

		it("defaults enable_kext to false when undefined", async () => {
			mockClient = createMockClient({});
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.reinstallServer({
				server_id: "srv-123",
			} as Parameters<typeof handlers.reinstallServer>[0]);

			const body = JSON.parse(vi.mocked(mockClient.fetch).mock.calls[0][0].body as string);
			expect(body.enable_kext).toBe(false);
		});

		it("includes os_id when provided", async () => {
			mockClient = createMockClient({});
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.reinstallServer({
				server_id: "srv-123",
				os_id: "os-456",
				enable_kext: true,
			});

			const body = JSON.parse(vi.mocked(mockClient.fetch).mock.calls[0][0].body as string);
			expect(body.os_id).toBe("os-456");
			expect(body.enable_kext).toBe(true);
		});

		it("returns error on failure", async () => {
			mockClient = createErrorClient(makeStatusError(500, "Internal"));
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.reinstallServer({
				server_id: "srv-123",
				enable_kext: false,
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("server_error");
		});
	});

	describe("listServerTypes", () => {
		it("calls fetch with correct path and no URL params", async () => {
			const response = { server_types: [{ name: "M2-128" }] };
			mockClient = createMockClient(response);
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.listServerTypes({});

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/apple-silicon/v1alpha1/zones/fr-par-1/server-types");
			expect(call.urlParams).toBeUndefined();
			expect(result.content[0].text).toContain("M2-128");
		});

		it("uses provided zone", async () => {
			mockClient = createMockClient({ server_types: [] });
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.listServerTypes({ zone: "fr-par-3" });

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.path).toContain("fr-par-3");
		});

		it("returns error on 429", async () => {
			mockClient = createErrorClient(makeStatusError(429, "Rate limited"));
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.listServerTypes({});

			expect((result as { isError?: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("rate_limited");
		});
	});

	describe("listOS", () => {
		it("calls fetch with correct path and pagination", async () => {
			const response = { os: [], total_count: 0 };
			mockClient = createMockClient(response);
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.listOS({ page: 1, pageSize: 50 });

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/apple-silicon/v1alpha1/zones/fr-par-1/os");
			expect(result.content[0].text).toContain('"total_count": 0');
		});

		it("passes filter params", async () => {
			mockClient = createMockClient({ os: [], total_count: 0 });
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.listOS({
				page: 1,
				pageSize: 25,
				server_type: "M2-128",
				name: "Sonoma",
			});

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			const params = call.urlParams as URLSearchParams;
			expect(params.get("server_type")).toBe("M2-128");
			expect(params.get("name")).toBe("Sonoma");
		});

		it("omits undefined filter params", async () => {
			mockClient = createMockClient({ os: [], total_count: 0 });
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			await handlers.listOS({ page: 1, pageSize: 50 });

			const call = vi.mocked(mockClient.fetch).mock.calls[0][0];
			const params = call.urlParams as URLSearchParams;
			expect(params.has("server_type")).toBe(false);
			expect(params.has("name")).toBe(false);
		});

		it("returns error on failure", async () => {
			mockClient = createErrorClient(new Error("Network error"));
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.listOS({ page: 1, pageSize: 50 });

			expect((result as { isError?: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("server_error");
		});
	});

	describe("error handling edge cases", () => {
		it("handles non-Error thrown values", async () => {
			mockClient = {
				fetch: vi.fn().mockRejectedValue("string error"),
			} as unknown as Client;
			handlers = createAppleSiliconHandlers(mockClient, DEFAULT_ZONE);

			const result = await handlers.listServers({ page: 1, pageSize: 50 });

			expect((result as { isError?: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("server_error");
			expect(result.content[0].text).toContain("string error");
		});
	});
});
