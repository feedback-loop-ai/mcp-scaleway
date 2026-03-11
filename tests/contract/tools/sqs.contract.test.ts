/**
 * Contract tests for SQS (Queues) Management API
 *
 * Validates request/response shapes against Scaleway API spec:
 *   specs/scaleway-api/sqs/api-reference.md
 *
 * Parity matrix: tests/parity-matrix.json > sqs
 */
import { describe, expect, it } from "vitest";
import {
	ActivateSqsInput,
	CreateSqsCredentialsInput,
	DeactivateSqsInput,
	DeleteSqsCredentialsInput,
	GetSqsCredentialsInput,
	GetSqsInfoInput,
	ListSqsCredentialsInput,
	SqsCredentials,
	SqsCredentialsOrderBy,
	SqsInfo,
	SqsPermissions,
	SqsStatus,
	UpdateSqsCredentialsInput,
} from "../../../src/tools/sqs/types.js";

// --- Response Shape Contracts ---

describe("contract: SqsInfo response shape", () => {
	// Ref: POST /mnq/v1beta1/regions/{region}/activate-sqs
	// Ref: POST /mnq/v1beta1/regions/{region}/deactivate-sqs
	// Ref: GET /mnq/v1beta1/regions/{region}/sqs-info
	const validSqsInfo = {
		project_id: "11111111-1111-1111-1111-111111111111",
		region: "fr-par",
		status: "enabled",
		sqs_endpoint_url: "https://sqs.mnq.fr-par.scaleway.com",
		created_at: "2026-01-01T00:00:00.000Z",
		updated_at: "2026-01-01T00:00:00.000Z",
	};

	it("validates a complete SqsInfo response", () => {
		const result = SqsInfo.safeParse(validSqsInfo);
		expect(result.success).toBe(true);
	});

	it("requires project_id", () => {
		const { project_id, ...rest } = validSqsInfo;
		expect(SqsInfo.safeParse(rest).success).toBe(false);
	});

	it("requires region", () => {
		const { region, ...rest } = validSqsInfo;
		expect(SqsInfo.safeParse(rest).success).toBe(false);
	});

	it("requires status to be a valid SqsStatus", () => {
		expect(SqsInfo.safeParse({ ...validSqsInfo, status: "invalid" }).success).toBe(false);
	});

	it("requires sqs_endpoint_url", () => {
		const { sqs_endpoint_url, ...rest } = validSqsInfo;
		expect(SqsInfo.safeParse(rest).success).toBe(false);
	});

	it("allows null timestamps", () => {
		const result = SqsInfo.safeParse({
			...validSqsInfo,
			created_at: null,
			updated_at: null,
		});
		expect(result.success).toBe(true);
	});

	it("validates all SqsStatus enum values", () => {
		for (const status of ["unknown_status", "enabled", "disabled"]) {
			expect(SqsInfo.safeParse({ ...validSqsInfo, status }).success).toBe(true);
		}
	});
});

describe("contract: SqsCredentials response shape", () => {
	// Ref: POST /mnq/v1beta1/regions/{region}/sqs-credentials
	// Ref: GET /mnq/v1beta1/regions/{region}/sqs-credentials/{credential_id}
	// Ref: PATCH /mnq/v1beta1/regions/{region}/sqs-credentials/{credential_id}
	const validCreds = {
		id: "22222222-2222-2222-2222-222222222222",
		name: "my-creds",
		project_id: "11111111-1111-1111-1111-111111111111",
		region: "fr-par",
		access_key: "SCWSQS-ACCESS",
		secret_key: "SCWSQS-SECRET",
		created_at: "2026-01-01T00:00:00.000Z",
		updated_at: "2026-01-01T00:00:00.000Z",
		permissions: { can_publish: true, can_receive: false, can_manage: false },
	};

	it("validates a complete SqsCredentials response", () => {
		expect(SqsCredentials.safeParse(validCreds).success).toBe(true);
	});

	it("requires id", () => {
		const { id, ...rest } = validCreds;
		expect(SqsCredentials.safeParse(rest).success).toBe(false);
	});

	it("requires name", () => {
		const { name, ...rest } = validCreds;
		expect(SqsCredentials.safeParse(rest).success).toBe(false);
	});

	it("requires access_key and secret_key", () => {
		const { access_key, ...rest1 } = validCreds;
		expect(SqsCredentials.safeParse(rest1).success).toBe(false);
		const { secret_key, ...rest2 } = validCreds;
		expect(SqsCredentials.safeParse(rest2).success).toBe(false);
	});

	it("allows null permissions", () => {
		expect(SqsCredentials.safeParse({ ...validCreds, permissions: null }).success).toBe(true);
	});

	it("allows null timestamps", () => {
		const result = SqsCredentials.safeParse({
			...validCreds,
			created_at: null,
			updated_at: null,
		});
		expect(result.success).toBe(true);
	});
});

describe("contract: SqsPermissions shape", () => {
	it("defaults all permissions to false", () => {
		const result = SqsPermissions.parse({});
		expect(result).toEqual({
			can_publish: false,
			can_receive: false,
			can_manage: false,
		});
	});

	it("accepts all boolean values", () => {
		const result = SqsPermissions.parse({
			can_publish: true,
			can_receive: true,
			can_manage: true,
		});
		expect(result.can_publish).toBe(true);
		expect(result.can_receive).toBe(true);
		expect(result.can_manage).toBe(true);
	});
});

// --- Request Shape Contracts ---

describe("contract: ActivateSqs request shape", () => {
	// Ref: POST /mnq/v1beta1/regions/{region}/activate-sqs
	it("accepts empty input (uses server defaults)", () => {
		expect(ActivateSqsInput.safeParse({}).success).toBe(true);
	});

	it("accepts region and project_id", () => {
		expect(
			ActivateSqsInput.safeParse({
				region: "fr-par",
				project_id: "11111111-1111-1111-1111-111111111111",
			}).success,
		).toBe(true);
	});

	it("rejects invalid project_id format", () => {
		expect(ActivateSqsInput.safeParse({ project_id: "bad" }).success).toBe(false);
	});
});

describe("contract: DeactivateSqs request shape", () => {
	// Ref: POST /mnq/v1beta1/regions/{region}/deactivate-sqs
	it("accepts empty input", () => {
		expect(DeactivateSqsInput.safeParse({}).success).toBe(true);
	});

	it("accepts region and project_id", () => {
		expect(
			DeactivateSqsInput.safeParse({
				region: "nl-ams",
				project_id: "11111111-1111-1111-1111-111111111111",
			}).success,
		).toBe(true);
	});
});

describe("contract: GetSqsInfo request shape", () => {
	// Ref: GET /mnq/v1beta1/regions/{region}/sqs-info
	it("accepts empty input", () => {
		expect(GetSqsInfoInput.safeParse({}).success).toBe(true);
	});

	it("accepts region and project_id", () => {
		expect(
			GetSqsInfoInput.safeParse({
				region: "fr-par",
				project_id: "11111111-1111-1111-1111-111111111111",
			}).success,
		).toBe(true);
	});
});

describe("contract: CreateSqsCredentials request shape", () => {
	// Ref: POST /mnq/v1beta1/regions/{region}/sqs-credentials
	it("requires name", () => {
		expect(CreateSqsCredentialsInput.safeParse({}).success).toBe(false);
	});

	it("accepts name with optional fields", () => {
		expect(
			CreateSqsCredentialsInput.safeParse({
				name: "my-creds",
				region: "fr-par",
				project_id: "11111111-1111-1111-1111-111111111111",
				permissions: { can_publish: true },
			}).success,
		).toBe(true);
	});

	it("rejects invalid project_id", () => {
		expect(CreateSqsCredentialsInput.safeParse({ name: "cred", project_id: "bad" }).success).toBe(
			false,
		);
	});
});

describe("contract: DeleteSqsCredentials request shape", () => {
	// Ref: DELETE /mnq/v1beta1/regions/{region}/sqs-credentials/{credential_id}
	it("requires credential_id", () => {
		expect(DeleteSqsCredentialsInput.safeParse({}).success).toBe(false);
	});

	it("accepts valid credential_id", () => {
		expect(
			DeleteSqsCredentialsInput.safeParse({
				credential_id: "22222222-2222-2222-2222-222222222222",
			}).success,
		).toBe(true);
	});

	it("rejects invalid credential_id", () => {
		expect(DeleteSqsCredentialsInput.safeParse({ credential_id: "bad" }).success).toBe(false);
	});
});

describe("contract: GetSqsCredentials request shape", () => {
	// Ref: GET /mnq/v1beta1/regions/{region}/sqs-credentials/{credential_id}
	it("requires credential_id", () => {
		expect(GetSqsCredentialsInput.safeParse({}).success).toBe(false);
	});

	it("accepts valid credential_id", () => {
		expect(
			GetSqsCredentialsInput.safeParse({
				credential_id: "22222222-2222-2222-2222-222222222222",
			}).success,
		).toBe(true);
	});
});

describe("contract: ListSqsCredentials request shape", () => {
	// Ref: GET /mnq/v1beta1/regions/{region}/sqs-credentials
	it("accepts empty input with defaults", () => {
		const result = ListSqsCredentialsInput.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.page).toBe(1);
			expect(result.data.page_size).toBe(50);
			expect(result.data.order_by).toBe("created_at_asc");
		}
	});

	it("accepts custom pagination", () => {
		const result = ListSqsCredentialsInput.safeParse({ page: 2, page_size: 25 });
		expect(result.success).toBe(true);
	});

	it("rejects page_size > 100", () => {
		expect(ListSqsCredentialsInput.safeParse({ page_size: 200 }).success).toBe(false);
	});

	it("rejects page_size < 1", () => {
		expect(ListSqsCredentialsInput.safeParse({ page_size: 0 }).success).toBe(false);
	});

	it("rejects page < 1", () => {
		expect(ListSqsCredentialsInput.safeParse({ page: -1 }).success).toBe(false);
	});

	it("validates all order_by values", () => {
		for (const orderBy of [
			"created_at_asc",
			"created_at_desc",
			"name_asc",
			"name_desc",
			"updated_at_asc",
			"updated_at_desc",
		]) {
			expect(ListSqsCredentialsInput.safeParse({ order_by: orderBy }).success).toBe(true);
		}
	});

	it("rejects invalid order_by", () => {
		expect(ListSqsCredentialsInput.safeParse({ order_by: "invalid" }).success).toBe(false);
	});
});

describe("contract: UpdateSqsCredentials request shape", () => {
	// Ref: PATCH /mnq/v1beta1/regions/{region}/sqs-credentials/{credential_id}
	it("requires credential_id", () => {
		expect(UpdateSqsCredentialsInput.safeParse({}).success).toBe(false);
	});

	it("accepts credential_id with name", () => {
		expect(
			UpdateSqsCredentialsInput.safeParse({
				credential_id: "22222222-2222-2222-2222-222222222222",
				name: "new-name",
			}).success,
		).toBe(true);
	});

	it("accepts credential_id with permissions", () => {
		expect(
			UpdateSqsCredentialsInput.safeParse({
				credential_id: "22222222-2222-2222-2222-222222222222",
				permissions: { can_manage: true },
			}).success,
		).toBe(true);
	});

	it("accepts credential_id alone (no-op update)", () => {
		expect(
			UpdateSqsCredentialsInput.safeParse({
				credential_id: "22222222-2222-2222-2222-222222222222",
			}).success,
		).toBe(true);
	});
});

// --- Auth Contract ---

describe("contract: SQS API authentication", () => {
	it("all input schemas accept optional region (auth from config)", () => {
		for (const schema of [
			ActivateSqsInput,
			DeactivateSqsInput,
			GetSqsInfoInput,
			ListSqsCredentialsInput,
		]) {
			const result = schema.safeParse({});
			expect(result.success).toBe(true);
		}
	});

	it("credential operations require their credential_id", () => {
		for (const schema of [
			DeleteSqsCredentialsInput,
			GetSqsCredentialsInput,
			UpdateSqsCredentialsInput,
		]) {
			expect(schema.safeParse({}).success).toBe(false);
			expect(
				schema.safeParse({
					credential_id: "22222222-2222-2222-2222-222222222222",
				}).success,
			).toBe(true);
		}
	});
});

// --- Enum Contracts ---

describe("contract: SqsStatus enum", () => {
	it("has exactly 3 values", () => {
		expect(SqsStatus.options).toEqual(["unknown_status", "enabled", "disabled"]);
	});
});

describe("contract: SqsCredentialsOrderBy enum", () => {
	it("has exactly 6 values", () => {
		expect(SqsCredentialsOrderBy.options).toHaveLength(6);
	});
});
