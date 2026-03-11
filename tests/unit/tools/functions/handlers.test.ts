import type { Client } from "@scaleway/sdk-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleCreateCron,
	handleCreateDomain,
	handleCreateFunction,
	handleCreateNamespace,
	handleCreateToken,
	handleDeleteCron,
	handleDeleteDomain,
	handleDeleteFunction,
	handleDeleteNamespace,
	handleDeleteToken,
	handleDeployFunction,
	handleGetFunction,
	handleGetNamespace,
	handleListCrons,
	handleListDomains,
	handleListFunctions,
	handleListNamespaces,
	handleUpdateCron,
	handleUpdateFunction,
	handleUpdateNamespace,
} from "../../../../src/tools/functions/handlers.js";

const REGION = "fr-par";
const UUID = "11111111-1111-1111-1111-111111111111";
const UUID2 = "22222222-2222-2222-2222-222222222222";

function makeMockClient(response: unknown = {}): Client {
	return {
		fetch: vi.fn().mockResolvedValue(response),
		settings: {} as Client["settings"],
	};
}

function makeErrorClient(statusCode: number, message: string): Client {
	const err = Object.assign(new Error(message), { statusCode });
	return {
		fetch: vi.fn().mockRejectedValue(err),
		settings: {} as Client["settings"],
	};
}

function makeGenericErrorClient(): Client {
	return {
		fetch: vi.fn().mockRejectedValue("string error"),
		settings: {} as Client["settings"],
	};
}

function expectSuccess(result: { content: { type: string; text: string }[] }) {
	expect(result.content).toHaveLength(1);
	expect(result.content[0].type).toBe("text");
	return JSON.parse(result.content[0].text);
}

function expectError(result: { content: { type: string; text: string }[]; isError?: boolean }) {
	expect(result.isError).toBe(true);
	return JSON.parse(result.content[0].text);
}

describe("functions handlers", () => {
	// --- Namespace Handlers ---

	describe("handleListNamespaces", () => {
		it("returns paginated namespaces", async () => {
			const data = { namespaces: [{ id: UUID }], total_count: 1 };
			const client = makeMockClient(data);
			const result = await handleListNamespaces(client, {
				region: REGION,
				page: 1,
				page_size: 50,
			});
			const parsed = expectSuccess(result);
			expect(parsed.namespaces).toHaveLength(1);
			expect(client.fetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: expect.stringContaining("/namespaces") }),
			);
		});

		it("passes optional filters", async () => {
			const client = makeMockClient({ namespaces: [], total_count: 0 });
			await handleListNamespaces(client, {
				region: REGION,
				page: 2,
				page_size: 10,
				project_id: UUID,
				name: "test",
				order_by: "name_asc",
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.urlParams.get("project_id")).toBe(UUID);
			expect(call.urlParams.get("name")).toBe("test");
			expect(call.urlParams.get("order_by")).toBe("name_asc");
			expect(call.urlParams.get("page")).toBe("2");
		});

		it("handles API errors", async () => {
			const client = makeErrorClient(403, "Forbidden");
			const result = await handleListNamespaces(client, {
				region: REGION,
				page: 1,
				page_size: 50,
			});
			const parsed = expectError(result);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetNamespace", () => {
		it("returns namespace details", async () => {
			const data = { id: UUID, name: "test-ns" };
			const client = makeMockClient(data);
			const result = await handleGetNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			const parsed = expectSuccess(result);
			expect(parsed.id).toBe(UUID);
		});

		it("handles not found", async () => {
			const client = makeErrorClient(404, "Not found");
			const result = await handleGetNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			const parsed = expectError(result);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleCreateNamespace", () => {
		it("creates namespace", async () => {
			const data = { id: UUID, name: "new-ns" };
			const client = makeMockClient(data);
			const result = await handleCreateNamespace(client, {
				region: REGION,
				name: "new-ns",
			});
			const parsed = expectSuccess(result);
			expect(parsed.name).toBe("new-ns");
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(JSON.parse(call.body)).toEqual({ name: "new-ns" });
		});

		it("passes optional fields", async () => {
			const client = makeMockClient({ id: UUID });
			await handleCreateNamespace(client, {
				region: REGION,
				name: "ns",
				project_id: UUID,
				description: "desc",
				environment_variables: { KEY: "VAL" },
				secret_environment_variables: [{ key: "S", value: "V" }],
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.project_id).toBe(UUID);
			expect(body.description).toBe("desc");
			expect(body.environment_variables).toEqual({ KEY: "VAL" });
			expect(body.secret_environment_variables).toEqual([{ key: "S", value: "V" }]);
		});

		it("handles errors", async () => {
			const client = makeErrorClient(400, "Invalid input");
			const result = await handleCreateNamespace(client, {
				region: REGION,
				name: "",
			});
			const parsed = expectError(result);
			expect(parsed.error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateNamespace", () => {
		it("updates namespace", async () => {
			const data = { id: UUID, description: "updated" };
			const client = makeMockClient(data);
			const result = await handleUpdateNamespace(client, {
				region: REGION,
				namespace_id: UUID,
				description: "updated",
			});
			const parsed = expectSuccess(result);
			expect(parsed.description).toBe("updated");
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("PATCH");
			expect(call.path).toContain(UUID);
		});

		it("passes env vars", async () => {
			const client = makeMockClient({ id: UUID });
			await handleUpdateNamespace(client, {
				region: REGION,
				namespace_id: UUID,
				environment_variables: { A: "B" },
				secret_environment_variables: [{ key: "S", value: "V" }],
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.environment_variables).toEqual({ A: "B" });
		});

		it("handles errors", async () => {
			const client = makeErrorClient(404, "Not found");
			const result = await handleUpdateNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			expectError(result);
		});
	});

	describe("handleDeleteNamespace", () => {
		it("deletes namespace", async () => {
			const data = { id: UUID, status: "deleting" };
			const client = makeMockClient(data);
			const result = await handleDeleteNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			const parsed = expectSuccess(result);
			expect(parsed.status).toBe("deleting");
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("DELETE");
		});

		it("handles errors", async () => {
			const client = makeErrorClient(404, "Not found");
			const result = await handleDeleteNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			expectError(result);
		});
	});

	// --- Function Handlers ---

	describe("handleListFunctions", () => {
		it("returns paginated functions", async () => {
			const data = { functions: [{ id: UUID }], total_count: 1 };
			const client = makeMockClient(data);
			const result = await handleListFunctions(client, {
				region: REGION,
				namespace_id: UUID,
				page: 1,
				page_size: 50,
			});
			const parsed = expectSuccess(result);
			expect(parsed.functions).toHaveLength(1);
		});

		it("passes optional filters", async () => {
			const client = makeMockClient({ functions: [], total_count: 0 });
			await handleListFunctions(client, {
				region: REGION,
				namespace_id: UUID,
				page: 1,
				page_size: 50,
				name: "test",
				order_by: "name_asc",
				project_id: UUID2,
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.urlParams.get("name")).toBe("test");
			expect(call.urlParams.get("order_by")).toBe("name_asc");
			expect(call.urlParams.get("project_id")).toBe(UUID2);
		});

		it("handles errors", async () => {
			const client = makeErrorClient(403, "Forbidden");
			const result = await handleListFunctions(client, {
				region: REGION,
				namespace_id: UUID,
				page: 1,
				page_size: 50,
			});
			expectError(result);
		});
	});

	describe("handleGetFunction", () => {
		it("returns function details", async () => {
			const data = { id: UUID, name: "my-fn" };
			const client = makeMockClient(data);
			const result = await handleGetFunction(client, {
				region: REGION,
				function_id: UUID,
			});
			const parsed = expectSuccess(result);
			expect(parsed.name).toBe("my-fn");
		});

		it("handles errors", async () => {
			const client = makeErrorClient(404, "Not found");
			const result = await handleGetFunction(client, {
				region: REGION,
				function_id: UUID,
			});
			expectError(result);
		});
	});

	describe("handleCreateFunction", () => {
		it("creates function", async () => {
			const data = { id: UUID, name: "fn1", runtime: "node22" };
			const client = makeMockClient(data);
			const result = await handleCreateFunction(client, {
				region: REGION,
				namespace_id: UUID,
				name: "fn1",
				runtime: "node22",
				handler: "index.handler",
				privacy: "public",
			});
			const parsed = expectSuccess(result);
			expect(parsed.runtime).toBe("node22");
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("POST");
		});

		it("passes optional fields", async () => {
			const client = makeMockClient({ id: UUID });
			await handleCreateFunction(client, {
				region: REGION,
				namespace_id: UUID,
				name: "fn1",
				runtime: "python312",
				handler: "handler.main",
				privacy: "private",
				memory_limit: 256,
				timeout: "300s",
				min_scale: 0,
				max_scale: 5,
				description: "test fn",
				environment_variables: { ENV: "prod" },
				secret_environment_variables: [{ key: "SECRET", value: "val" }],
				http_option: "redirected",
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.memory_limit).toBe(256);
			expect(body.http_option).toBe("redirected");
		});

		it("handles errors", async () => {
			const client = makeErrorClient(400, "Invalid");
			const result = await handleCreateFunction(client, {
				region: REGION,
				namespace_id: UUID,
				name: "fn1",
				runtime: "node22",
				handler: "index.handler",
				privacy: "public",
			});
			expectError(result);
		});
	});

	describe("handleUpdateFunction", () => {
		it("updates function", async () => {
			const data = { id: UUID, memory_limit: 512 };
			const client = makeMockClient(data);
			const result = await handleUpdateFunction(client, {
				region: REGION,
				function_id: UUID,
				memory_limit: 512,
			});
			const parsed = expectSuccess(result);
			expect(parsed.memory_limit).toBe(512);
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("PATCH");
		});

		it("passes optional fields", async () => {
			const client = makeMockClient({ id: UUID });
			await handleUpdateFunction(client, {
				region: REGION,
				function_id: UUID,
				runtime: "node22",
				handler: "index.handler",
				privacy: "public",
				timeout: "60s",
				min_scale: 1,
				max_scale: 10,
				description: "updated",
				environment_variables: { A: "B" },
				secret_environment_variables: [{ key: "K", value: "V" }],
				http_option: "enabled",
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.runtime).toBe("node22");
		});

		it("handles errors", async () => {
			const client = makeErrorClient(404, "Not found");
			const result = await handleUpdateFunction(client, {
				region: REGION,
				function_id: UUID,
			});
			expectError(result);
		});
	});

	describe("handleDeleteFunction", () => {
		it("deletes function", async () => {
			const client = makeMockClient({ id: UUID, status: "deleting" });
			const result = await handleDeleteFunction(client, {
				region: REGION,
				function_id: UUID,
			});
			expectSuccess(result);
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("DELETE");
		});

		it("handles errors", async () => {
			const client = makeErrorClient(404, "Not found");
			const result = await handleDeleteFunction(client, {
				region: REGION,
				function_id: UUID,
			});
			expectError(result);
		});
	});

	describe("handleDeployFunction", () => {
		it("deploys function", async () => {
			const client = makeMockClient({ id: UUID, status: "building" });
			const result = await handleDeployFunction(client, {
				region: REGION,
				function_id: UUID,
			});
			const parsed = expectSuccess(result);
			expect(parsed.status).toBe("building");
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toContain("/deploy");
		});

		it("handles errors", async () => {
			const client = makeErrorClient(404, "Not found");
			const result = await handleDeployFunction(client, {
				region: REGION,
				function_id: UUID,
			});
			expectError(result);
		});
	});

	// --- Cron Handlers ---

	describe("handleListCrons", () => {
		it("returns paginated crons", async () => {
			const data = { crons: [{ id: UUID }], total_count: 1 };
			const client = makeMockClient(data);
			const result = await handleListCrons(client, {
				region: REGION,
				function_id: UUID,
				page: 1,
				page_size: 50,
			});
			const parsed = expectSuccess(result);
			expect(parsed.crons).toHaveLength(1);
		});

		it("passes optional order_by", async () => {
			const client = makeMockClient({ crons: [], total_count: 0 });
			await handleListCrons(client, {
				region: REGION,
				function_id: UUID,
				page: 1,
				page_size: 50,
				order_by: "created_at_asc",
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.urlParams.get("order_by")).toBe("created_at_asc");
		});

		it("handles errors", async () => {
			const client = makeErrorClient(403, "Forbidden");
			const result = await handleListCrons(client, {
				region: REGION,
				function_id: UUID,
				page: 1,
				page_size: 50,
			});
			expectError(result);
		});
	});

	describe("handleCreateCron", () => {
		it("creates cron", async () => {
			const data = { id: UUID, schedule: "0 * * * *" };
			const client = makeMockClient(data);
			const result = await handleCreateCron(client, {
				region: REGION,
				function_id: UUID,
				schedule: "0 * * * *",
			});
			const parsed = expectSuccess(result);
			expect(parsed.schedule).toBe("0 * * * *");
		});

		it("passes optional fields", async () => {
			const client = makeMockClient({ id: UUID });
			await handleCreateCron(client, {
				region: REGION,
				function_id: UUID,
				schedule: "0 * * * *",
				name: "my-cron",
				args: { key: "value" },
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.name).toBe("my-cron");
			expect(body.args).toEqual({ key: "value" });
		});

		it("handles errors", async () => {
			const client = makeErrorClient(400, "Invalid");
			const result = await handleCreateCron(client, {
				region: REGION,
				function_id: UUID,
				schedule: "bad",
			});
			expectError(result);
		});
	});

	describe("handleUpdateCron", () => {
		it("updates cron", async () => {
			const data = { id: UUID, schedule: "*/5 * * * *" };
			const client = makeMockClient(data);
			const result = await handleUpdateCron(client, {
				region: REGION,
				cron_id: UUID,
				schedule: "*/5 * * * *",
			});
			const parsed = expectSuccess(result);
			expect(parsed.schedule).toBe("*/5 * * * *");
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("PATCH");
		});

		it("passes optional fields", async () => {
			const client = makeMockClient({ id: UUID });
			await handleUpdateCron(client, {
				region: REGION,
				cron_id: UUID,
				name: "updated-cron",
				args: { updated: true },
				function_id: UUID2,
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.name).toBe("updated-cron");
			expect(body.function_id).toBe(UUID2);
		});

		it("handles errors", async () => {
			const client = makeErrorClient(404, "Not found");
			const result = await handleUpdateCron(client, {
				region: REGION,
				cron_id: UUID,
			});
			expectError(result);
		});
	});

	describe("handleDeleteCron", () => {
		it("deletes cron", async () => {
			const client = makeMockClient({ id: UUID, status: "deleting" });
			const result = await handleDeleteCron(client, {
				region: REGION,
				cron_id: UUID,
			});
			expectSuccess(result);
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("DELETE");
		});

		it("handles errors", async () => {
			const client = makeErrorClient(404, "Not found");
			const result = await handleDeleteCron(client, {
				region: REGION,
				cron_id: UUID,
			});
			expectError(result);
		});
	});

	// --- Domain Handlers ---

	describe("handleListDomains", () => {
		it("returns paginated domains", async () => {
			const data = { domains: [{ id: UUID }], total_count: 1 };
			const client = makeMockClient(data);
			const result = await handleListDomains(client, {
				region: REGION,
				function_id: UUID,
				page: 1,
				page_size: 50,
			});
			const parsed = expectSuccess(result);
			expect(parsed.domains).toHaveLength(1);
		});

		it("passes optional order_by", async () => {
			const client = makeMockClient({ domains: [], total_count: 0 });
			await handleListDomains(client, {
				region: REGION,
				function_id: UUID,
				page: 1,
				page_size: 50,
				order_by: "hostname_asc",
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.urlParams.get("order_by")).toBe("hostname_asc");
		});

		it("handles errors", async () => {
			const client = makeErrorClient(403, "Forbidden");
			const result = await handleListDomains(client, {
				region: REGION,
				function_id: UUID,
				page: 1,
				page_size: 50,
			});
			expectError(result);
		});
	});

	describe("handleCreateDomain", () => {
		it("creates domain", async () => {
			const data = { id: UUID, hostname: "fn.example.com" };
			const client = makeMockClient(data);
			const result = await handleCreateDomain(client, {
				region: REGION,
				function_id: UUID,
				hostname: "fn.example.com",
			});
			const parsed = expectSuccess(result);
			expect(parsed.hostname).toBe("fn.example.com");
		});

		it("handles errors", async () => {
			const client = makeErrorClient(400, "Invalid");
			const result = await handleCreateDomain(client, {
				region: REGION,
				function_id: UUID,
				hostname: "",
			});
			expectError(result);
		});
	});

	describe("handleDeleteDomain", () => {
		it("deletes domain", async () => {
			const client = makeMockClient({ id: UUID, status: "deleting" });
			const result = await handleDeleteDomain(client, {
				region: REGION,
				domain_id: UUID,
			});
			expectSuccess(result);
		});

		it("handles errors", async () => {
			const client = makeErrorClient(404, "Not found");
			const result = await handleDeleteDomain(client, {
				region: REGION,
				domain_id: UUID,
			});
			expectError(result);
		});
	});

	// --- Token Handlers ---

	describe("handleCreateToken", () => {
		it("creates token", async () => {
			const data = { id: UUID, token: "scw-token-xxx" };
			const client = makeMockClient(data);
			const result = await handleCreateToken(client, {
				region: REGION,
				function_id: UUID,
			});
			const parsed = expectSuccess(result);
			expect(parsed.token).toBe("scw-token-xxx");
		});

		it("passes optional fields", async () => {
			const client = makeMockClient({ id: UUID });
			await handleCreateToken(client, {
				region: REGION,
				function_id: UUID,
				description: "CI token",
				expires_at: "2027-01-01T00:00:00Z",
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.description).toBe("CI token");
			expect(body.expires_at).toBe("2027-01-01T00:00:00Z");
		});

		it("handles errors", async () => {
			const client = makeErrorClient(400, "Invalid");
			const result = await handleCreateToken(client, {
				region: REGION,
				function_id: UUID,
			});
			expectError(result);
		});
	});

	describe("handleDeleteToken", () => {
		it("deletes token", async () => {
			const client = makeMockClient({ id: UUID, status: "deleting" });
			const result = await handleDeleteToken(client, {
				region: REGION,
				token_id: UUID,
			});
			expectSuccess(result);
		});

		it("handles errors", async () => {
			const client = makeErrorClient(404, "Not found");
			const result = await handleDeleteToken(client, {
				region: REGION,
				token_id: UUID,
			});
			expectError(result);
		});
	});

	// --- Error edge cases ---

	describe("error handling edge cases", () => {
		it("handles generic Error without statusCode", async () => {
			const client: Client = {
				fetch: vi.fn().mockRejectedValue(new Error("Network failure")),
				settings: {} as Client["settings"],
			};
			const result = await handleListNamespaces(client, {
				region: REGION,
				page: 1,
				page_size: 50,
			});
			const parsed = expectError(result);
			expect(parsed.error.type).toBe("server_error");
			expect(parsed.error.statusCode).toBe(500);
		});

		it("handles non-Error thrown values", async () => {
			const client = makeGenericErrorClient();
			const result = await handleGetNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			const parsed = expectError(result);
			expect(parsed.error.type).toBe("server_error");
		});
	});
});
