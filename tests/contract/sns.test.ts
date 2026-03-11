/**
 * Contract tests for Scaleway SNS (Topics & Events) API.
 *
 * These tests validate that the Zod schemas in src/tools/sns/types.ts
 * match the expected Scaleway API shapes as documented in:
 *   - @scaleway/sdk-mnq v1beta1 types (SnsAPI)
 *   - specs/scaleway-api/ (Scaleway API Reference)
 *
 * Scaleway API endpoints covered:
 *   POST   /mnq/v1beta1/regions/{region}/activate-sns     -> scaleway_sns_activate
 *   POST   /mnq/v1beta1/regions/{region}/deactivate-sns   -> scaleway_sns_deactivate
 *   GET    /mnq/v1beta1/regions/{region}/sns-info          -> scaleway_sns_get_info
 *   GET    /mnq/v1beta1/regions/{region}/sns-credentials   -> scaleway_sns_list_credentials
 *   GET    /mnq/v1beta1/regions/{region}/sns-credentials/{id} -> scaleway_sns_get_credentials
 *   POST   /mnq/v1beta1/regions/{region}/sns-credentials   -> scaleway_sns_create_credentials
 *   PATCH  /mnq/v1beta1/regions/{region}/sns-credentials/{id} -> scaleway_sns_update_credentials
 *   DELETE /mnq/v1beta1/regions/{region}/sns-credentials/{id} -> scaleway_sns_delete_credentials
 */
import { describe, expect, it } from "vitest";
import {
	ActivateSnsSchema,
	CreateSnsCredentialsSchema,
	DeactivateSnsSchema,
	DeleteSnsCredentialsSchema,
	GetSnsCredentialsSchema,
	GetSnsInfoSchema,
	ListSnsCredentialsOrderBy,
	ListSnsCredentialsSchema,
	SnsCredentialsSchema,
	SnsInfoSchema,
	SnsInfoStatus,
	SnsPermissionsSchema,
	UpdateSnsCredentialsSchema,
} from "../../src/tools/sns/types.js";

describe("SNS contract tests", () => {
	describe("SnsInfo response shape", () => {
		/**
		 * API: GET /mnq/v1beta1/regions/{region}/sns-info
		 * Also returned by activate/deactivate
		 */
		it("matches Scaleway SnsInfo response shape", () => {
			const apiResponse = {
				projectId: "6a0d9caa-1234-5678-9abc-def012345678",
				region: "fr-par",
				createdAt: "2025-01-01T00:00:00.000Z",
				updatedAt: "2025-01-02T00:00:00.000Z",
				status: "enabled",
				snsEndpointUrl: "https://sns.mnq.fr-par.scaleway.com",
			};

			const result = SnsInfoSchema.parse(apiResponse);
			expect(result).toEqual(apiResponse);
		});

		it("accepts minimal SnsInfo (no optional dates)", () => {
			const apiResponse = {
				projectId: "6a0d9caa-1234-5678-9abc-def012345678",
				region: "fr-par",
				status: "disabled",
				snsEndpointUrl: "",
			};

			const result = SnsInfoSchema.parse(apiResponse);
			expect(result.status).toBe("disabled");
			expect(result.createdAt).toBeUndefined();
		});

		it("validates all SnsInfoStatus values from API", () => {
			for (const status of ["unknown_status", "enabled", "disabled"]) {
				expect(SnsInfoStatus.parse(status)).toBe(status);
			}
		});

		it("rejects unknown status values", () => {
			expect(() => SnsInfoStatus.parse("active")).toThrow();
		});
	});

	describe("SnsCredentials response shape", () => {
		/**
		 * API: GET /mnq/v1beta1/regions/{region}/sns-credentials/{id}
		 * Also returned by create/update
		 */
		it("matches Scaleway SnsCredentials response shape", () => {
			const apiResponse = {
				id: "6a0d9caa-1234-5678-9abc-def012345678",
				name: "my-sns-credentials",
				projectId: "proj-1234-5678-9abc-def012345678",
				region: "fr-par",
				createdAt: "2025-01-01T00:00:00.000Z",
				updatedAt: "2025-01-02T00:00:00.000Z",
				accessKey: "SCW_ACCESS_KEY_EXAMPLE",
				secretKey: "SCW_SECRET_KEY_EXAMPLE",
				secretChecksum: "abc123def456",
				permissions: {
					canPublish: true,
					canReceive: false,
					canManage: true,
				},
			};

			const result = SnsCredentialsSchema.parse(apiResponse);
			expect(result).toEqual(apiResponse);
		});

		it("accepts credentials without optional fields", () => {
			const apiResponse = {
				id: "cred-id",
				name: "test",
				projectId: "proj-id",
				region: "nl-ams",
				accessKey: "ak",
				secretKey: "",
				secretChecksum: "",
			};

			const result = SnsCredentialsSchema.parse(apiResponse);
			expect(result.permissions).toBeUndefined();
			expect(result.createdAt).toBeUndefined();
		});
	});

	describe("SnsPermissions shape", () => {
		/**
		 * Embedded in SnsCredentials and create/update requests
		 */
		it("accepts full permissions object", () => {
			const permissions = { canPublish: true, canReceive: true, canManage: false };
			expect(SnsPermissionsSchema.parse(permissions)).toEqual(permissions);
		});

		it("accepts partial permissions", () => {
			const permissions = { canPublish: true };
			const result = SnsPermissionsSchema.parse(permissions);
			expect(result.canPublish).toBe(true);
			expect(result.canReceive).toBeUndefined();
			expect(result.canManage).toBeUndefined();
		});

		it("accepts empty permissions", () => {
			const result = SnsPermissionsSchema.parse({});
			expect(Object.keys(result).length).toBe(0);
		});
	});

	describe("ActivateSns request shape", () => {
		/**
		 * API: POST /mnq/v1beta1/regions/{region}/activate-sns
		 */
		it("accepts region and projectId", () => {
			const request = { region: "fr-par", projectId: "proj-123" };
			const result = ActivateSnsSchema.parse(request);
			expect(result).toEqual(request);
		});

		it("accepts empty request (uses defaults)", () => {
			const result = ActivateSnsSchema.parse({});
			expect(result.region).toBeUndefined();
			expect(result.projectId).toBeUndefined();
		});

		it("validates region format", () => {
			expect(() => ActivateSnsSchema.parse({ region: "invalid" })).toThrow();
		});
	});

	describe("DeactivateSns request shape", () => {
		/**
		 * API: POST /mnq/v1beta1/regions/{region}/deactivate-sns
		 */
		it("accepts region and projectId", () => {
			const request = { region: "nl-ams", projectId: "proj-456" };
			const result = DeactivateSnsSchema.parse(request);
			expect(result).toEqual(request);
		});

		it("accepts empty request", () => {
			const result = DeactivateSnsSchema.parse({});
			expect(result.region).toBeUndefined();
		});
	});

	describe("GetSnsInfo request shape", () => {
		/**
		 * API: GET /mnq/v1beta1/regions/{region}/sns-info
		 */
		it("accepts region and projectId", () => {
			const request = { region: "fr-par", projectId: "proj-789" };
			const result = GetSnsInfoSchema.parse(request);
			expect(result).toEqual(request);
		});

		it("accepts empty request", () => {
			const result = GetSnsInfoSchema.parse({});
			expect(result.projectId).toBeUndefined();
		});
	});

	describe("ListSnsCredentials request shape", () => {
		/**
		 * API: GET /mnq/v1beta1/regions/{region}/sns-credentials
		 */
		it("accepts all parameters", () => {
			const request = {
				region: "fr-par",
				projectId: "proj-123",
				orderBy: "created_at_desc" as const,
				page: 2,
				pageSize: 25,
			};
			const result = ListSnsCredentialsSchema.parse(request);
			expect(result.orderBy).toBe("created_at_desc");
			expect(result.page).toBe(2);
			expect(result.pageSize).toBe(25);
		});

		it("applies pagination defaults", () => {
			const result = ListSnsCredentialsSchema.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("validates all orderBy values from API", () => {
			for (const orderBy of [
				"created_at_asc",
				"created_at_desc",
				"updated_at_asc",
				"updated_at_desc",
				"name_asc",
				"name_desc",
			]) {
				expect(ListSnsCredentialsOrderBy.parse(orderBy)).toBe(orderBy);
			}
		});

		it("rejects invalid orderBy", () => {
			expect(() => ListSnsCredentialsOrderBy.parse("invalid_order")).toThrow();
		});

		it("enforces page size limits", () => {
			expect(() => ListSnsCredentialsSchema.parse({ pageSize: 0 })).toThrow();
			expect(() => ListSnsCredentialsSchema.parse({ pageSize: 101 })).toThrow();
		});
	});

	describe("GetSnsCredentials request shape", () => {
		/**
		 * API: GET /mnq/v1beta1/regions/{region}/sns-credentials/{id}
		 */
		it("requires snsCredentialsId", () => {
			const request = { snsCredentialsId: "cred-123", region: "fr-par" };
			const result = GetSnsCredentialsSchema.parse(request);
			expect(result.snsCredentialsId).toBe("cred-123");
		});

		it("rejects missing snsCredentialsId", () => {
			expect(() => GetSnsCredentialsSchema.parse({})).toThrow();
		});
	});

	describe("CreateSnsCredentials request shape", () => {
		/**
		 * API: POST /mnq/v1beta1/regions/{region}/sns-credentials
		 */
		it("accepts all parameters including permissions", () => {
			const request = {
				region: "fr-par",
				projectId: "proj-123",
				name: "my-creds",
				permissions: { canPublish: true, canReceive: false, canManage: true },
			};
			const result = CreateSnsCredentialsSchema.parse(request);
			expect(result.name).toBe("my-creds");
			expect(result.permissions?.canPublish).toBe(true);
		});

		it("accepts empty request (all optional)", () => {
			const result = CreateSnsCredentialsSchema.parse({});
			expect(result.name).toBeUndefined();
			expect(result.permissions).toBeUndefined();
		});
	});

	describe("UpdateSnsCredentials request shape", () => {
		/**
		 * API: PATCH /mnq/v1beta1/regions/{region}/sns-credentials/{id}
		 */
		it("requires snsCredentialsId, accepts name and permissions", () => {
			const request = {
				snsCredentialsId: "cred-123",
				name: "updated-name",
				permissions: { canManage: false },
			};
			const result = UpdateSnsCredentialsSchema.parse(request);
			expect(result.snsCredentialsId).toBe("cred-123");
			expect(result.name).toBe("updated-name");
		});

		it("rejects missing snsCredentialsId", () => {
			expect(() => UpdateSnsCredentialsSchema.parse({ name: "test" })).toThrow();
		});
	});

	describe("DeleteSnsCredentials request shape", () => {
		/**
		 * API: DELETE /mnq/v1beta1/regions/{region}/sns-credentials/{id}
		 */
		it("requires snsCredentialsId", () => {
			const request = { snsCredentialsId: "cred-123", region: "fr-par" };
			const result = DeleteSnsCredentialsSchema.parse(request);
			expect(result.snsCredentialsId).toBe("cred-123");
		});

		it("rejects missing snsCredentialsId", () => {
			expect(() => DeleteSnsCredentialsSchema.parse({})).toThrow();
		});
	});

	describe("Pagination contract", () => {
		it("list credentials supports standard Scaleway pagination", () => {
			const result = ListSnsCredentialsSchema.parse({ page: 1, pageSize: 50 });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("rejects page < 1", () => {
			expect(() => ListSnsCredentialsSchema.parse({ page: 0 })).toThrow();
		});

		it("rejects negative page", () => {
			expect(() => ListSnsCredentialsSchema.parse({ page: -1 })).toThrow();
		});
	});

	describe("Auth contract", () => {
		it("all request schemas accept optional region for auth routing", () => {
			const schemas = [
				ActivateSnsSchema,
				DeactivateSnsSchema,
				GetSnsInfoSchema,
				ListSnsCredentialsSchema,
				GetSnsCredentialsSchema,
				CreateSnsCredentialsSchema,
				UpdateSnsCredentialsSchema,
				DeleteSnsCredentialsSchema,
			];

			for (const schema of schemas) {
				const shape = schema.shape;
				expect(shape.region).toBeDefined();
			}
		});
	});

	describe("Error codes contract", () => {
		it("schemas reject invalid region format (400-class validation)", () => {
			const invalidRegion = { region: "not-valid-format-123" };
			expect(() => ActivateSnsSchema.parse(invalidRegion)).toThrow();
			expect(() => DeactivateSnsSchema.parse(invalidRegion)).toThrow();
			expect(() => GetSnsInfoSchema.parse(invalidRegion)).toThrow();
		});

		it("schemas require mandatory fields (400-class validation)", () => {
			expect(() => GetSnsCredentialsSchema.parse({})).toThrow();
			expect(() => UpdateSnsCredentialsSchema.parse({})).toThrow();
			expect(() => DeleteSnsCredentialsSchema.parse({})).toThrow();
		});
	});
});
