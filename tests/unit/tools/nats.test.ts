import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerNatsTools } from "../../../src/tools/nats/index.js";

// Mock the shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

interface ErrorResult {
	content: { type: "text"; text: string }[];
	isError?: boolean;
}

describe("nats module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerNatsTools(server)).not.toThrow();
	});

	it("registers all 9 NATS tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerNatsTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(9);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toContain("scaleway_nats_list_accounts");
		expect(toolNames).toContain("scaleway_nats_get_account");
		expect(toolNames).toContain("scaleway_nats_create_account");
		expect(toolNames).toContain("scaleway_nats_update_account");
		expect(toolNames).toContain("scaleway_nats_delete_account");
		expect(toolNames).toContain("scaleway_nats_list_credentials");
		expect(toolNames).toContain("scaleway_nats_get_credentials");
		expect(toolNames).toContain("scaleway_nats_create_credentials");
		expect(toolNames).toContain("scaleway_nats_delete_credentials");
	});
});

describe("nats handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListNatsAccounts", () => {
		it("returns paginated list of accounts", async () => {
			const { handleListNatsAccounts } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue({
				nats_accounts: [
					{
						id: "00000000-0000-0000-0000-000000000010",
						name: "my-nats",
						endpoint: "nats://endpoint:4222",
						project_id: "00000000-0000-0000-0000-000000000001",
						region: "fr-par",
						status: "ready",
						created_at: "2025-01-01T00:00:00+00:00",
						updated_at: "2025-01-01T00:00:00+00:00",
					},
				],
				total_count: 1,
			});

			const result = await handleListNatsAccounts({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "mnq/v1beta1/regions/fr-par/nats-accounts",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.items[0].name).toBe("my-nats");
		});

		it("passes optional filters", async () => {
			const { handleListNatsAccounts } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue({
				nats_accounts: [],
				total_count: 0,
			});

			await handleListNatsAccounts({
				region: "fr-par",
				page: 1,
				pageSize: 10,
				projectId: "00000000-0000-0000-0000-000000000001",
				name: "test",
				orderBy: "name_asc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.method).toBe("GET");
			expect(callArgs.urlParams.get("page")).toBe("1");
			expect(callArgs.urlParams.get("page_size")).toBe("10");
			expect(callArgs.urlParams.get("project_id")).toBe("00000000-0000-0000-0000-000000000001");
			expect(callArgs.urlParams.get("name")).toBe("test");
			expect(callArgs.urlParams.get("order_by")).toBe("name_asc");
		});

		it("returns error on failure", async () => {
			const { handleListNatsAccounts } = await import("../../../src/tools/nats/handlers.js");
			const err = new Error("Unauthorized");
			(err as unknown as { statusCode: number }).statusCode = 401;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleListNatsAccounts({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetNatsAccount", () => {
		it("returns account details", async () => {
			const { handleGetNatsAccount } = await import("../../../src/tools/nats/handlers.js");
			const account = {
				id: "00000000-0000-0000-0000-000000000010",
				name: "my-nats",
				endpoint: "nats://endpoint:4222",
				project_id: "00000000-0000-0000-0000-000000000001",
				region: "fr-par",
				status: "ready",
				created_at: "2025-01-01T00:00:00+00:00",
				updated_at: "2025-01-01T00:00:00+00:00",
			};
			mockFetch.mockResolvedValue(account);

			const result = await handleGetNatsAccount({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: "mnq/v1beta1/regions/fr-par/nats-accounts/00000000-0000-0000-0000-000000000010",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("my-nats");
		});

		it("returns error on 404", async () => {
			const { handleGetNatsAccount } = await import("../../../src/tools/nats/handlers.js");
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleGetNatsAccount({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000099",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleCreateNatsAccount", () => {
		it("creates account with name and project", async () => {
			const { handleCreateNatsAccount } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue({
				id: "00000000-0000-0000-0000-000000000010",
				name: "new-nats",
				endpoint: "nats://endpoint:4222",
				project_id: "00000000-0000-0000-0000-000000000001",
				region: "fr-par",
				status: "creating",
				created_at: "2025-01-01T00:00:00+00:00",
				updated_at: "2025-01-01T00:00:00+00:00",
			});

			const result = await handleCreateNatsAccount({
				region: "fr-par",
				name: "new-nats",
				projectId: "00000000-0000-0000-0000-000000000001",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "mnq/v1beta1/regions/fr-par/nats-accounts",
				body: JSON.stringify({
					name: "new-nats",
					project_id: "00000000-0000-0000-0000-000000000001",
				}),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("new-nats");
		});

		it("creates account without optional projectId", async () => {
			const { handleCreateNatsAccount } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue({
				id: "00000000-0000-0000-0000-000000000010",
				name: "new-nats",
			});

			await handleCreateNatsAccount({
				region: "fr-par",
				name: "new-nats",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "mnq/v1beta1/regions/fr-par/nats-accounts",
				body: JSON.stringify({ name: "new-nats" }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateNatsAccount } = await import("../../../src/tools/nats/handlers.js");
			const err = new Error("Bad request");
			(err as unknown as { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleCreateNatsAccount({
				region: "fr-par",
				name: "bad",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateNatsAccount", () => {
		it("updates account name", async () => {
			const { handleUpdateNatsAccount } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue({
				id: "00000000-0000-0000-0000-000000000010",
				name: "updated-nats",
			});

			const result = await handleUpdateNatsAccount({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
				name: "updated-nats",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: "mnq/v1beta1/regions/fr-par/nats-accounts/00000000-0000-0000-0000-000000000010",
				body: JSON.stringify({ name: "updated-nats" }),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("updated-nats");
		});

		it("sends empty body when no name provided", async () => {
			const { handleUpdateNatsAccount } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue({
				id: "00000000-0000-0000-0000-000000000010",
			});

			await handleUpdateNatsAccount({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: "mnq/v1beta1/regions/fr-par/nats-accounts/00000000-0000-0000-0000-000000000010",
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateNatsAccount } = await import("../../../src/tools/nats/handlers.js");
			const err = new Error("Server error");
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleUpdateNatsAccount({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});
	});

	describe("handleDeleteNatsAccount", () => {
		it("deletes account and returns confirmation", async () => {
			const { handleDeleteNatsAccount } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteNatsAccount({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: "mnq/v1beta1/regions/fr-par/nats-accounts/00000000-0000-0000-0000-000000000010",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.id).toBe("00000000-0000-0000-0000-000000000010");
		});

		it("returns error on failure", async () => {
			const { handleDeleteNatsAccount } = await import("../../../src/tools/nats/handlers.js");
			const err = new Error("Forbidden");
			(err as unknown as { statusCode: number }).statusCode = 403;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleDeleteNatsAccount({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleListNatsCredentials", () => {
		it("returns paginated credentials list", async () => {
			const { handleListNatsCredentials } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue({
				nats_credentials: [
					{
						id: "00000000-0000-0000-0000-000000000020",
						name: "my-creds",
						nats_account_id: "00000000-0000-0000-0000-000000000010",
						created_at: "2025-01-01T00:00:00+00:00",
						updated_at: "2025-01-01T00:00:00+00:00",
						checksum: "abc123",
					},
				],
				total_count: 1,
			});

			const result = await handleListNatsCredentials({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "mnq/v1beta1/regions/fr-par/nats-accounts/00000000-0000-0000-0000-000000000010/nats-credentials",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes orderBy filter", async () => {
			const { handleListNatsCredentials } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue({
				nats_credentials: [],
				total_count: 0,
			});

			await handleListNatsCredentials({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
				page: 1,
				pageSize: 10,
				orderBy: "name_desc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.method).toBe("GET");
			expect(callArgs.urlParams.get("page")).toBe("1");
			expect(callArgs.urlParams.get("page_size")).toBe("10");
			expect(callArgs.urlParams.get("order_by")).toBe("name_desc");
		});

		it("returns error on failure", async () => {
			const { handleListNatsCredentials } = await import("../../../src/tools/nats/handlers.js");
			const err = new Error("Rate limited");
			(err as unknown as { statusCode: number }).statusCode = 429;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleListNatsCredentials({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
		});
	});

	describe("handleGetNatsCredentials", () => {
		it("returns credentials details", async () => {
			const { handleGetNatsCredentials } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue({
				id: "00000000-0000-0000-0000-000000000020",
				name: "my-creds",
				nats_account_id: "00000000-0000-0000-0000-000000000010",
				created_at: "2025-01-01T00:00:00+00:00",
				updated_at: "2025-01-01T00:00:00+00:00",
				checksum: "abc123",
			});

			const result = await handleGetNatsCredentials({
				region: "fr-par",
				natsCredentialsId: "00000000-0000-0000-0000-000000000020",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: "mnq/v1beta1/regions/fr-par/nats-credentials/00000000-0000-0000-0000-000000000020",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("my-creds");
		});

		it("returns error on 404", async () => {
			const { handleGetNatsCredentials } = await import("../../../src/tools/nats/handlers.js");
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleGetNatsCredentials({
				region: "fr-par",
				natsCredentialsId: "00000000-0000-0000-0000-000000000099",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleCreateNatsCredentials", () => {
		it("creates credentials for an account", async () => {
			const { handleCreateNatsCredentials } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue({
				id: "00000000-0000-0000-0000-000000000020",
				name: "new-creds",
				nats_account_id: "00000000-0000-0000-0000-000000000010",
				created_at: "2025-01-01T00:00:00+00:00",
				updated_at: "2025-01-01T00:00:00+00:00",
				checksum: "def456",
				credentials: { content: "nats-creds-content" },
			});

			const result = await handleCreateNatsCredentials({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
				name: "new-creds",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "mnq/v1beta1/regions/fr-par/nats-credentials",
				body: JSON.stringify({
					nats_account_id: "00000000-0000-0000-0000-000000000010",
					name: "new-creds",
				}),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("new-creds");
			expect(parsed.credentials.content).toBe("nats-creds-content");
		});

		it("returns error on failure", async () => {
			const { handleCreateNatsCredentials } = await import("../../../src/tools/nats/handlers.js");
			const err = new Error("Bad request");
			(err as unknown as { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleCreateNatsCredentials({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
				name: "bad",
			});

			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteNatsCredentials", () => {
		it("deletes credentials and returns confirmation", async () => {
			const { handleDeleteNatsCredentials } = await import("../../../src/tools/nats/handlers.js");
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteNatsCredentials({
				region: "fr-par",
				natsCredentialsId: "00000000-0000-0000-0000-000000000020",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: "mnq/v1beta1/regions/fr-par/nats-credentials/00000000-0000-0000-0000-000000000020",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.id).toBe("00000000-0000-0000-0000-000000000020");
		});

		it("returns error on failure", async () => {
			const { handleDeleteNatsCredentials } = await import("../../../src/tools/nats/handlers.js");
			const err = new Error("Forbidden");
			(err as unknown as { statusCode: number }).statusCode = 403;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleDeleteNatsCredentials({
				region: "fr-par",
				natsCredentialsId: "00000000-0000-0000-0000-000000000020",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});
});
