/**
 * Contract tests for Scaleway Serverless Functions API
 *
 * Validates request/response shapes, pagination, auth, and error codes
 * against the Scaleway API contract for Serverless Functions.
 *
 * API: /functions/v1beta1/regions/{region}/...
 * API Reference: https://www.scaleway.com/en/developers/api/serverless-functions/
 * Spec: specs/scaleway-api/functions/api-reference.md
 * Parity Matrix: tests/parity-matrix.json#functions
 */
import { type Client, createAdvancedClient, withProfile } from "@scaleway/sdk-client";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import * as httpHandlers from "../../../../src/tools/functions/handlers.js";
import {
	CreateCronInput,
	CreateDomainInput,
	CreateFunctionInput,
	CreateNamespaceInput,
	CreateTokenInput,
	DeleteCronInput,
	DeleteDomainInput,
	DeleteFunctionInput,
	DeleteNamespaceInput,
	DeleteTokenInput,
	DeployFunctionInput,
	FunctionsRegion,
	GetFunctionInput,
	GetNamespaceInput,
	ListCronsInput,
	ListDomainsInput,
	ListFunctionsInput,
	ListNamespacesInput,
	SecretEnvVar,
	UpdateCronInput,
	UpdateFunctionInput,
	UpdateNamespaceInput,
} from "../../../../src/tools/functions/types.js";

const VALID_REGION = "fr-par";
const VALID_UUID = "11111111-1111-1111-1111-111111111111";

describe("functions contract tests", () => {
	// --- Region validation ---

	describe("FunctionsRegion", () => {
		it("accepts valid regions", () => {
			expect(FunctionsRegion.parse("fr-par")).toBe("fr-par");
			expect(FunctionsRegion.parse("nl-ams")).toBe("nl-ams");
			expect(FunctionsRegion.parse("pl-waw")).toBe("pl-waw");
		});

		it("rejects invalid region format", () => {
			expect(() => FunctionsRegion.parse("fr-par-1")).toThrow();
			expect(() => FunctionsRegion.parse("invalid")).toThrow();
			expect(() => FunctionsRegion.parse("")).toThrow();
		});
	});

	// --- SecretEnvVar ---

	describe("SecretEnvVar", () => {
		it("accepts valid secret env var", () => {
			const result = SecretEnvVar.parse({ key: "DB_PASS", value: "secret" });
			expect(result.key).toBe("DB_PASS");
			expect(result.value).toBe("secret");
		});

		it("accepts null value (read response)", () => {
			const result = SecretEnvVar.parse({ key: "DB_PASS", value: null });
			expect(result.value).toBeNull();
		});

		it("rejects missing key", () => {
			expect(() => SecretEnvVar.parse({ value: "secret" })).toThrow();
		});
	});

	// --- Namespace Contracts ---

	describe("ListNamespacesInput", () => {
		it("validates minimal input", () => {
			const result = ListNamespacesInput.parse({ region: VALID_REGION });
			expect(result.region).toBe(VALID_REGION);
			expect(result.page).toBe(1);
			expect(result.page_size).toBe(50);
		});

		it("validates full input", () => {
			const result = ListNamespacesInput.parse({
				region: VALID_REGION,
				page: 2,
				page_size: 25,
				project_id: VALID_UUID,
				name: "test",
				order_by: "name_asc",
			});
			expect(result.project_id).toBe(VALID_UUID);
			expect(result.name).toBe("test");
		});

		it("rejects invalid page_size", () => {
			expect(() => ListNamespacesInput.parse({ region: VALID_REGION, page_size: 200 })).toThrow();
		});

		it("rejects invalid project_id", () => {
			expect(() =>
				ListNamespacesInput.parse({ region: VALID_REGION, project_id: "not-uuid" }),
			).toThrow();
		});
	});

	describe("GetNamespaceInput", () => {
		it("validates input", () => {
			const result = GetNamespaceInput.parse({
				region: VALID_REGION,
				namespace_id: VALID_UUID,
			});
			expect(result.namespace_id).toBe(VALID_UUID);
		});

		it("rejects missing namespace_id", () => {
			expect(() => GetNamespaceInput.parse({ region: VALID_REGION })).toThrow();
		});
	});

	describe("CreateNamespaceInput", () => {
		it("validates minimal input", () => {
			const result = CreateNamespaceInput.parse({
				region: VALID_REGION,
				name: "my-namespace",
			});
			expect(result.name).toBe("my-namespace");
		});

		it("validates full input with env vars", () => {
			const result = CreateNamespaceInput.parse({
				region: VALID_REGION,
				name: "ns",
				project_id: VALID_UUID,
				description: "test namespace",
				environment_variables: { NODE_ENV: "production" },
				secret_environment_variables: [{ key: "DB_PASS", value: "secret" }],
			});
			expect(result.environment_variables).toEqual({ NODE_ENV: "production" });
			expect(result.secret_environment_variables).toHaveLength(1);
		});

		it("rejects empty name", () => {
			expect(() => CreateNamespaceInput.parse({ region: VALID_REGION, name: "" })).toThrow();
		});
	});

	describe("UpdateNamespaceInput", () => {
		it("validates input", () => {
			const result = UpdateNamespaceInput.parse({
				region: VALID_REGION,
				namespace_id: VALID_UUID,
				description: "updated",
			});
			expect(result.description).toBe("updated");
		});

		it("accepts env var updates", () => {
			const result = UpdateNamespaceInput.parse({
				region: VALID_REGION,
				namespace_id: VALID_UUID,
				environment_variables: { KEY: "val" },
				secret_environment_variables: [{ key: "S", value: "V" }],
			});
			expect(result.environment_variables).toEqual({ KEY: "val" });
		});
	});

	describe("DeleteNamespaceInput", () => {
		it("validates input", () => {
			const result = DeleteNamespaceInput.parse({
				region: VALID_REGION,
				namespace_id: VALID_UUID,
			});
			expect(result.namespace_id).toBe(VALID_UUID);
		});
	});

	// --- Function Contracts ---

	describe("ListFunctionsInput", () => {
		it("validates minimal input", () => {
			const result = ListFunctionsInput.parse({
				region: VALID_REGION,
				namespace_id: VALID_UUID,
			});
			expect(result.namespace_id).toBe(VALID_UUID);
			expect(result.page).toBe(1);
			expect(result.page_size).toBe(50);
		});

		it("validates full input", () => {
			const result = ListFunctionsInput.parse({
				region: VALID_REGION,
				namespace_id: VALID_UUID,
				page: 3,
				page_size: 10,
				name: "fn",
				order_by: "created_at_desc",
				project_id: VALID_UUID,
			});
			expect(result.name).toBe("fn");
		});
	});

	describe("GetFunctionInput", () => {
		it("validates input", () => {
			const result = GetFunctionInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
			});
			expect(result.function_id).toBe(VALID_UUID);
		});

		it("rejects non-uuid function_id", () => {
			expect(() => GetFunctionInput.parse({ region: VALID_REGION, function_id: "bad" })).toThrow();
		});
	});

	describe("CreateFunctionInput", () => {
		it("validates minimal input", () => {
			const result = CreateFunctionInput.parse({
				region: VALID_REGION,
				namespace_id: VALID_UUID,
				name: "my-fn",
				runtime: "node22",
				handler: "index.handler",
				privacy: "public",
			});
			expect(result.runtime).toBe("node22");
			expect(result.privacy).toBe("public");
		});

		it("validates full input", () => {
			const result = CreateFunctionInput.parse({
				region: VALID_REGION,
				namespace_id: VALID_UUID,
				name: "fn",
				runtime: "python312",
				handler: "handler.main",
				privacy: "private",
				memory_limit: 1024,
				timeout: "300s",
				min_scale: 0,
				max_scale: 10,
				description: "A function",
				environment_variables: { ENV: "prod" },
				secret_environment_variables: [{ key: "SECRET", value: "val" }],
				http_option: "redirected",
			});
			expect(result.memory_limit).toBe(1024);
			expect(result.http_option).toBe("redirected");
		});

		it("rejects invalid privacy", () => {
			expect(() =>
				CreateFunctionInput.parse({
					region: VALID_REGION,
					namespace_id: VALID_UUID,
					name: "fn",
					runtime: "node22",
					handler: "index.handler",
					privacy: "invalid",
				}),
			).toThrow();
		});

		it("rejects memory_limit out of range", () => {
			expect(() =>
				CreateFunctionInput.parse({
					region: VALID_REGION,
					namespace_id: VALID_UUID,
					name: "fn",
					runtime: "node22",
					handler: "index.handler",
					privacy: "public",
					memory_limit: 64,
				}),
			).toThrow();
			expect(() =>
				CreateFunctionInput.parse({
					region: VALID_REGION,
					namespace_id: VALID_UUID,
					name: "fn",
					runtime: "node22",
					handler: "index.handler",
					privacy: "public",
					memory_limit: 8192,
				}),
			).toThrow();
		});
	});

	describe("UpdateFunctionInput", () => {
		it("validates minimal input", () => {
			const result = UpdateFunctionInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
			});
			expect(result.function_id).toBe(VALID_UUID);
		});

		it("validates full input", () => {
			const result = UpdateFunctionInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
				runtime: "go123",
				handler: "main.Handler",
				privacy: "private",
				memory_limit: 2048,
				timeout: "60s",
				min_scale: 1,
				max_scale: 5,
				description: "updated fn",
				environment_variables: { KEY: "val" },
				secret_environment_variables: [{ key: "K", value: "V" }],
				http_option: "enabled",
			});
			expect(result.runtime).toBe("go123");
		});

		it("rejects invalid http_option", () => {
			expect(() =>
				UpdateFunctionInput.parse({
					region: VALID_REGION,
					function_id: VALID_UUID,
					http_option: "invalid",
				}),
			).toThrow();
		});
	});

	describe("DeleteFunctionInput", () => {
		it("validates input", () => {
			const result = DeleteFunctionInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
			});
			expect(result.function_id).toBe(VALID_UUID);
		});
	});

	describe("DeployFunctionInput", () => {
		it("validates input", () => {
			const result = DeployFunctionInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
			});
			expect(result.function_id).toBe(VALID_UUID);
		});

		it("rejects missing function_id", () => {
			expect(() => DeployFunctionInput.parse({ region: VALID_REGION })).toThrow();
		});
	});

	// --- Cron Contracts ---

	describe("ListCronsInput", () => {
		it("validates minimal input", () => {
			const result = ListCronsInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
			});
			expect(result.function_id).toBe(VALID_UUID);
			expect(result.page).toBe(1);
		});

		it("validates with order_by", () => {
			const result = ListCronsInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
				order_by: "created_at_asc",
			});
			expect(result.order_by).toBe("created_at_asc");
		});
	});

	describe("CreateCronInput", () => {
		it("validates minimal input", () => {
			const result = CreateCronInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
				schedule: "0 * * * *",
			});
			expect(result.schedule).toBe("0 * * * *");
		});

		it("validates full input", () => {
			const result = CreateCronInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
				schedule: "*/5 * * * *",
				name: "my-cron",
				args: { data: "value" },
			});
			expect(result.name).toBe("my-cron");
			expect(result.args).toEqual({ data: "value" });
		});

		it("rejects empty schedule", () => {
			expect(() =>
				CreateCronInput.parse({
					region: VALID_REGION,
					function_id: VALID_UUID,
					schedule: "",
				}),
			).toThrow();
		});
	});

	describe("UpdateCronInput", () => {
		it("validates minimal input", () => {
			const result = UpdateCronInput.parse({
				region: VALID_REGION,
				cron_id: VALID_UUID,
			});
			expect(result.cron_id).toBe(VALID_UUID);
		});

		it("validates full input", () => {
			const result = UpdateCronInput.parse({
				region: VALID_REGION,
				cron_id: VALID_UUID,
				schedule: "0 0 * * *",
				name: "daily",
				args: { key: "val" },
				function_id: VALID_UUID,
			});
			expect(result.schedule).toBe("0 0 * * *");
		});
	});

	describe("DeleteCronInput", () => {
		it("validates input", () => {
			const result = DeleteCronInput.parse({
				region: VALID_REGION,
				cron_id: VALID_UUID,
			});
			expect(result.cron_id).toBe(VALID_UUID);
		});
	});

	// --- Domain Contracts ---

	describe("ListDomainsInput", () => {
		it("validates minimal input", () => {
			const result = ListDomainsInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
			});
			expect(result.function_id).toBe(VALID_UUID);
		});

		it("validates with pagination and order", () => {
			const result = ListDomainsInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
				page: 2,
				page_size: 10,
				order_by: "hostname_asc",
			});
			expect(result.page).toBe(2);
		});
	});

	describe("CreateDomainInput", () => {
		it("validates input", () => {
			const result = CreateDomainInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
				hostname: "fn.example.com",
			});
			expect(result.hostname).toBe("fn.example.com");
		});

		it("rejects empty hostname", () => {
			expect(() =>
				CreateDomainInput.parse({
					region: VALID_REGION,
					function_id: VALID_UUID,
					hostname: "",
				}),
			).toThrow();
		});
	});

	describe("DeleteDomainInput", () => {
		it("validates input", () => {
			const result = DeleteDomainInput.parse({
				region: VALID_REGION,
				domain_id: VALID_UUID,
			});
			expect(result.domain_id).toBe(VALID_UUID);
		});
	});

	// --- Token Contracts ---

	describe("CreateTokenInput", () => {
		it("validates minimal input", () => {
			const result = CreateTokenInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
			});
			expect(result.function_id).toBe(VALID_UUID);
		});

		it("validates full input", () => {
			const result = CreateTokenInput.parse({
				region: VALID_REGION,
				function_id: VALID_UUID,
				description: "CI token",
				expires_at: "2027-01-01T00:00:00Z",
			});
			expect(result.description).toBe("CI token");
			expect(result.expires_at).toBe("2027-01-01T00:00:00Z");
		});
	});

	describe("DeleteTokenInput", () => {
		it("validates input", () => {
			const result = DeleteTokenInput.parse({
				region: VALID_REGION,
				token_id: VALID_UUID,
			});
			expect(result.token_id).toBe(VALID_UUID);
		});

		it("rejects non-uuid token_id", () => {
			expect(() => DeleteTokenInput.parse({ region: VALID_REGION, token_id: "bad" })).toThrow();
		});
	});
});

// Exercise the installed SDK's Request construction, JSON parsing, and real HTTP errors.
// Only the HTTP transport is replaced: no environment credentials or network calls.
describe("SDK HTTP request contracts", () => {
	function recordingClient(
		response: unknown = { id: "http-response", status: "ready" },
		status = 200,
	) {
		const requests: Request[] = [];
		const client = createAdvancedClient(
			withProfile({
				accessKey: "SCWXXXXXXXXXXXXXXXXX",
				secretKey: "00000000-0000-0000-0000-000000000000",
			}),
			(settings) => ({
				...settings,
				apiURL: "https://scaleway.invalid",
				httpClient: (async (input: RequestInfo | URL, init?: RequestInit) => {
					requests.push(new Request(input, init));
					return new Response(status === 204 ? null : JSON.stringify(response), {
						status,
						headers: { "Content-Type": "application/json" },
					});
				}) as typeof fetch,
			}),
		);
		return { client, requests };
	}

	const jsonCases = [
		{
			name: "CreateNamespace",
			method: "POST",
			path: "/functions/v1beta1/regions/fr-par/namespaces",
			call: (client: Client) =>
				httpHandlers.handleCreateNamespace(client, {
					region: "fr-par",
					name: "test",
					environment_variables: { MODE: "test" },
				}),
			body: { name: "test", environment_variables: { MODE: "test" } },
		},
		{
			name: "UpdateNamespace",
			method: "PATCH",
			path: "/functions/v1beta1/regions/fr-par/namespaces/11111111-1111-1111-1111-111111111111",
			call: (client: Client) =>
				httpHandlers.handleUpdateNamespace(client, {
					region: "fr-par",
					namespace_id: "11111111-1111-1111-1111-111111111111",
					description: "",
					environment_variables: {},
				}),
			body: { description: "", environment_variables: {} },
		},
		{
			name: "CreateFunction",
			method: "POST",
			path: "/functions/v1beta1/regions/fr-par/functions",
			call: (client: Client) =>
				httpHandlers.handleCreateFunction(client, {
					region: "fr-par",
					namespace_id: "11111111-1111-1111-1111-111111111111",
					name: "test",
					runtime: "node22",
					handler: "index.handle",
					privacy: "private",
					min_scale: 0,
				}),
			body: {
				namespace_id: "11111111-1111-1111-1111-111111111111",
				name: "test",
				runtime: "node22",
				handler: "index.handle",
				privacy: "private",
				min_scale: 0,
			},
		},
		{
			name: "UpdateFunction",
			method: "PATCH",
			path: "/functions/v1beta1/regions/fr-par/functions/11111111-1111-1111-1111-111111111111",
			call: (client: Client) =>
				httpHandlers.handleUpdateFunction(client, {
					region: "fr-par",
					function_id: "11111111-1111-1111-1111-111111111111",
					min_scale: 0,
					environment_variables: {},
				}),
			body: { min_scale: 0, environment_variables: {} },
		},
		{
			name: "DeployFunction",
			method: "POST",
			path: "/functions/v1beta1/regions/fr-par/functions/11111111-1111-1111-1111-111111111111/deploy",
			call: (client: Client) =>
				httpHandlers.handleDeployFunction(client, {
					region: "fr-par",
					function_id: "11111111-1111-1111-1111-111111111111",
				}),
			body: {},
		},
		{
			name: "CreateCron",
			method: "POST",
			path: "/functions/v1beta1/regions/fr-par/crons",
			call: (client: Client) =>
				httpHandlers.handleCreateCron(client, {
					region: "fr-par",
					function_id: "11111111-1111-1111-1111-111111111111",
					schedule: "5 * * * *",
					args: { enabled: false },
				}),
			body: {
				function_id: "11111111-1111-1111-1111-111111111111",
				schedule: "5 * * * *",
				args: { enabled: false },
			},
		},
		{
			name: "UpdateCron",
			method: "PATCH",
			path: "/functions/v1beta1/regions/fr-par/crons/11111111-1111-1111-1111-111111111111",
			call: (client: Client) =>
				httpHandlers.handleUpdateCron(client, {
					region: "fr-par",
					cron_id: "11111111-1111-1111-1111-111111111111",
					args: {},
				}),
			body: { args: {} },
		},
		{
			name: "CreateDomain",
			method: "POST",
			path: "/functions/v1beta1/regions/fr-par/domains",
			call: (client: Client) =>
				httpHandlers.handleCreateDomain(client, {
					region: "fr-par",
					function_id: "11111111-1111-1111-1111-111111111111",
					hostname: "example.test",
				}),
			body: { function_id: "11111111-1111-1111-1111-111111111111", hostname: "example.test" },
		},
		{
			name: "CreateToken",
			method: "POST",
			path: "/functions/v1beta1/regions/fr-par/tokens",
			call: (client: Client) =>
				httpHandlers.handleCreateToken(client, {
					region: "fr-par",
					function_id: "11111111-1111-1111-1111-111111111111",
					description: "test",
				}),
			body: { function_id: "11111111-1111-1111-1111-111111111111", description: "test" },
		},
	];

	it.each(jsonCases)(
		"$name: $method $path sends application/json",
		async ({ call, method, path, body }) => {
			const response = { id: "http-response", status: "ready" };
			const { client, requests } = recordingClient(response);
			const result = await call(client);
			expect(requests).toHaveLength(1);
			const [request] = requests;
			expect(request.url).toBe(`https://scaleway.invalid${path}`);
			expect(request.method).toBe(method);
			expect(request.headers.get("Content-Type")).toBe("application/json");
			expect(request.headers.get("Accept")).toBe("application/json");
			expect(request.headers.get("X-Auth-Token")).toBe("00000000-0000-0000-0000-000000000000");
			expect(JSON.parse(await request.text())).toEqual(body);
			expect(result).toEqual({
				content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
			});
		},
	);

	it.each([
		[400, "invalid_input"],
		[401, "permission_denied"],
		[403, "permission_denied"],
		[404, "not_found"],
		[429, "rate_limited"],
		[500, "server_error"],
	] as const)("maps SDK HTTP %i errors to %s", async (status, type) => {
		const { client, requests } = recordingClient({ message: "HTTP contract error" }, status);
		const result = await jsonCases[0].call(client);
		expect(requests).toHaveLength(1);
		expect(result).toMatchObject({ isError: true });
		expect(JSON.parse(result.content[0].text)).toMatchObject({
			error: { type, statusCode: status },
		});
	});

	// These DELETE endpoints return HTTP 200 JSON resource bodies, not HTTP 204.
	it("DeleteNamespace preserves the HTTP 200 resource response", async () => {
		const response = { id: "11111111-1111-1111-1111-111111111111", status: "deleting" };
		const { client, requests } = recordingClient(response);
		const result = await httpHandlers.handleDeleteNamespace(client, {
			region: "fr-par",
			namespace_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(requests).toHaveLength(1);
		expect(requests[0].method).toBe("DELETE");
		expect(new URL(requests[0].url).pathname).toBe(
			"/functions/v1beta1/regions/fr-par/namespaces/11111111-1111-1111-1111-111111111111",
		);
		expect(requests[0].body).toBeNull();
		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
		});
	});
	it("DeleteFunction preserves the HTTP 200 resource response", async () => {
		const response = { id: "11111111-1111-1111-1111-111111111111", status: "deleting" };
		const { client, requests } = recordingClient(response);
		const result = await httpHandlers.handleDeleteFunction(client, {
			region: "fr-par",
			function_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(requests).toHaveLength(1);
		expect(requests[0].method).toBe("DELETE");
		expect(new URL(requests[0].url).pathname).toBe(
			"/functions/v1beta1/regions/fr-par/functions/11111111-1111-1111-1111-111111111111",
		);
		expect(requests[0].body).toBeNull();
		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
		});
	});
	it("DeleteCron preserves the HTTP 200 resource response", async () => {
		const response = { id: "11111111-1111-1111-1111-111111111111", status: "deleting" };
		const { client, requests } = recordingClient(response);
		const result = await httpHandlers.handleDeleteCron(client, {
			region: "fr-par",
			cron_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(requests).toHaveLength(1);
		expect(requests[0].method).toBe("DELETE");
		expect(new URL(requests[0].url).pathname).toBe(
			"/functions/v1beta1/regions/fr-par/crons/11111111-1111-1111-1111-111111111111",
		);
		expect(requests[0].body).toBeNull();
		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
		});
	});
	it("DeleteDomain preserves the HTTP 200 resource response", async () => {
		const response = { id: "11111111-1111-1111-1111-111111111111", status: "deleting" };
		const { client, requests } = recordingClient(response);
		const result = await httpHandlers.handleDeleteDomain(client, {
			region: "fr-par",
			domain_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(requests).toHaveLength(1);
		expect(requests[0].method).toBe("DELETE");
		expect(new URL(requests[0].url).pathname).toBe(
			"/functions/v1beta1/regions/fr-par/domains/11111111-1111-1111-1111-111111111111",
		);
		expect(requests[0].body).toBeNull();
		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
		});
	});
	it("DeleteToken preserves the HTTP 200 resource response", async () => {
		const response = { id: "11111111-1111-1111-1111-111111111111", status: "deleting" };
		const { client, requests } = recordingClient(response);
		const result = await httpHandlers.handleDeleteToken(client, {
			region: "fr-par",
			token_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(requests).toHaveLength(1);
		expect(requests[0].method).toBe("DELETE");
		expect(new URL(requests[0].url).pathname).toBe(
			"/functions/v1beta1/regions/fr-par/tokens/11111111-1111-1111-1111-111111111111",
		);
		expect(requests[0].body).toBeNull();
		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
		});
	});
});
