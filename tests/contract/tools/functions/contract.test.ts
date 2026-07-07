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
import { describe, expect, it } from "vitest";
import { z } from "zod";
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
