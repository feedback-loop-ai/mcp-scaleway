import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerSqsTools } from "../../../src/tools/sqs/index.js";
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

// Mock shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "11111111-1111-1111-1111-111111111111",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({
		fetch: (...args: unknown[]) => mockFetch(...args),
	}),
	resetClient: vi.fn(),
}));

function mockJsonResponse(data: unknown, status = 200) {
	return { json: () => Promise.resolve(data), status, ok: status < 400 };
}

describe("sqs module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerSqsTools(server)).not.toThrow();
	});

	it("registers all 8 SQS tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerSqsTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(8);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toContain("scaleway_sqs_activate");
		expect(toolNames).toContain("scaleway_sqs_deactivate");
		expect(toolNames).toContain("scaleway_sqs_get_info");
		expect(toolNames).toContain("scaleway_sqs_create_credentials");
		expect(toolNames).toContain("scaleway_sqs_delete_credentials");
		expect(toolNames).toContain("scaleway_sqs_get_credentials");
		expect(toolNames).toContain("scaleway_sqs_list_credentials");
		expect(toolNames).toContain("scaleway_sqs_update_credentials");
	});
});

describe("sqs types - SqsStatus", () => {
	it("accepts valid statuses", () => {
		expect(SqsStatus.parse("enabled")).toBe("enabled");
		expect(SqsStatus.parse("disabled")).toBe("disabled");
		expect(SqsStatus.parse("unknown_status")).toBe("unknown_status");
	});

	it("rejects invalid status", () => {
		expect(() => SqsStatus.parse("invalid")).toThrow();
	});
});

describe("sqs types - SqsCredentialsOrderBy", () => {
	it("accepts valid order_by values", () => {
		expect(SqsCredentialsOrderBy.parse("created_at_asc")).toBe("created_at_asc");
		expect(SqsCredentialsOrderBy.parse("created_at_desc")).toBe("created_at_desc");
		expect(SqsCredentialsOrderBy.parse("name_asc")).toBe("name_asc");
		expect(SqsCredentialsOrderBy.parse("name_desc")).toBe("name_desc");
		expect(SqsCredentialsOrderBy.parse("updated_at_asc")).toBe("updated_at_asc");
		expect(SqsCredentialsOrderBy.parse("updated_at_desc")).toBe("updated_at_desc");
	});

	it("rejects invalid order_by", () => {
		expect(() => SqsCredentialsOrderBy.parse("invalid")).toThrow();
	});
});

describe("sqs types - SqsPermissions", () => {
	it("parses valid permissions with defaults", () => {
		const result = SqsPermissions.parse({});
		expect(result).toEqual({
			can_publish: false,
			can_receive: false,
			can_manage: false,
		});
	});

	it("parses explicit permissions", () => {
		const result = SqsPermissions.parse({
			can_publish: true,
			can_receive: true,
			can_manage: false,
		});
		expect(result.can_publish).toBe(true);
		expect(result.can_receive).toBe(true);
		expect(result.can_manage).toBe(false);
	});
});

describe("sqs types - SqsInfo", () => {
	it("parses valid SqsInfo", () => {
		const result = SqsInfo.parse({
			project_id: "11111111-1111-1111-1111-111111111111",
			region: "fr-par",
			status: "enabled",
			sqs_endpoint_url: "https://sqs.mnq.fr-par.scaleway.com",
			created_at: "2026-01-01T00:00:00.000Z",
			updated_at: "2026-01-01T00:00:00.000Z",
		});
		expect(result.status).toBe("enabled");
		expect(result.sqs_endpoint_url).toBe("https://sqs.mnq.fr-par.scaleway.com");
	});

	it("allows null timestamps", () => {
		const result = SqsInfo.parse({
			project_id: "11111111-1111-1111-1111-111111111111",
			region: "fr-par",
			status: "disabled",
			sqs_endpoint_url: "",
			created_at: null,
			updated_at: null,
		});
		expect(result.created_at).toBeNull();
		expect(result.updated_at).toBeNull();
	});
});

describe("sqs types - SqsCredentials", () => {
	it("parses valid SqsCredentials", () => {
		const result = SqsCredentials.parse({
			id: "22222222-2222-2222-2222-222222222222",
			name: "my-creds",
			project_id: "11111111-1111-1111-1111-111111111111",
			region: "fr-par",
			access_key: "SCWSQS-ACCESS-KEY",
			secret_key: "SCWSQS-SECRET-KEY",
			created_at: "2026-01-01T00:00:00.000Z",
			updated_at: "2026-01-01T00:00:00.000Z",
			permissions: {
				can_publish: true,
				can_receive: false,
				can_manage: false,
			},
		});
		expect(result.id).toBe("22222222-2222-2222-2222-222222222222");
		expect(result.permissions?.can_publish).toBe(true);
	});

	it("allows null permissions and timestamps", () => {
		const result = SqsCredentials.parse({
			id: "22222222-2222-2222-2222-222222222222",
			name: "test",
			project_id: "11111111-1111-1111-1111-111111111111",
			region: "fr-par",
			access_key: "key",
			secret_key: "secret",
			created_at: null,
			updated_at: null,
			permissions: null,
		});
		expect(result.permissions).toBeNull();
	});
});

describe("sqs types - ActivateSqsInput", () => {
	it("accepts empty input (uses defaults)", () => {
		const result = ActivateSqsInput.parse({});
		expect(result.region).toBeUndefined();
		expect(result.project_id).toBeUndefined();
	});

	it("accepts explicit region and project_id", () => {
		const result = ActivateSqsInput.parse({
			region: "nl-ams",
			project_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(result.region).toBe("nl-ams");
	});

	it("rejects invalid project_id", () => {
		expect(() => ActivateSqsInput.parse({ project_id: "not-a-uuid" })).toThrow();
	});
});

describe("sqs types - DeactivateSqsInput", () => {
	it("accepts empty input", () => {
		expect(() => DeactivateSqsInput.parse({})).not.toThrow();
	});

	it("accepts region", () => {
		const result = DeactivateSqsInput.parse({ region: "pl-waw" });
		expect(result.region).toBe("pl-waw");
	});
});

describe("sqs types - GetSqsInfoInput", () => {
	it("accepts empty input", () => {
		expect(() => GetSqsInfoInput.parse({})).not.toThrow();
	});

	it("accepts region and project_id", () => {
		const result = GetSqsInfoInput.parse({
			region: "fr-par",
			project_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(result.project_id).toBe("11111111-1111-1111-1111-111111111111");
	});
});

describe("sqs types - CreateSqsCredentialsInput", () => {
	it("requires name", () => {
		expect(() => CreateSqsCredentialsInput.parse({})).toThrow();
	});

	it("parses with name only", () => {
		const result = CreateSqsCredentialsInput.parse({ name: "my-creds" });
		expect(result.name).toBe("my-creds");
		expect(result.permissions).toBeUndefined();
	});

	it("parses with permissions", () => {
		const result = CreateSqsCredentialsInput.parse({
			name: "my-creds",
			permissions: { can_publish: true, can_receive: true },
		});
		expect(result.permissions?.can_publish).toBe(true);
	});
});

describe("sqs types - DeleteSqsCredentialsInput", () => {
	it("requires credential_id", () => {
		expect(() => DeleteSqsCredentialsInput.parse({})).toThrow();
	});

	it("parses valid input", () => {
		const result = DeleteSqsCredentialsInput.parse({
			credential_id: "22222222-2222-2222-2222-222222222222",
		});
		expect(result.credential_id).toBe("22222222-2222-2222-2222-222222222222");
	});

	it("rejects invalid credential_id", () => {
		expect(() => DeleteSqsCredentialsInput.parse({ credential_id: "bad" })).toThrow();
	});
});

describe("sqs types - GetSqsCredentialsInput", () => {
	it("requires credential_id", () => {
		expect(() => GetSqsCredentialsInput.parse({})).toThrow();
	});

	it("parses valid input", () => {
		const result = GetSqsCredentialsInput.parse({
			credential_id: "22222222-2222-2222-2222-222222222222",
		});
		expect(result.credential_id).toBe("22222222-2222-2222-2222-222222222222");
	});
});

describe("sqs types - ListSqsCredentialsInput", () => {
	it("applies defaults for empty input", () => {
		const result = ListSqsCredentialsInput.parse({});
		expect(result.page).toBe(1);
		expect(result.page_size).toBe(50);
		expect(result.order_by).toBe("created_at_asc");
	});

	it("accepts custom pagination", () => {
		const result = ListSqsCredentialsInput.parse({ page: 2, page_size: 25 });
		expect(result.page).toBe(2);
		expect(result.page_size).toBe(25);
	});

	it("rejects page_size > 100", () => {
		expect(() => ListSqsCredentialsInput.parse({ page_size: 101 })).toThrow();
	});

	it("rejects page < 1", () => {
		expect(() => ListSqsCredentialsInput.parse({ page: 0 })).toThrow();
	});

	it("accepts order_by", () => {
		const result = ListSqsCredentialsInput.parse({ order_by: "name_desc" });
		expect(result.order_by).toBe("name_desc");
	});
});

describe("sqs types - UpdateSqsCredentialsInput", () => {
	it("requires credential_id", () => {
		expect(() => UpdateSqsCredentialsInput.parse({})).toThrow();
	});

	it("parses with name only", () => {
		const result = UpdateSqsCredentialsInput.parse({
			credential_id: "22222222-2222-2222-2222-222222222222",
			name: "new-name",
		});
		expect(result.name).toBe("new-name");
	});

	it("parses with permissions only", () => {
		const result = UpdateSqsCredentialsInput.parse({
			credential_id: "22222222-2222-2222-2222-222222222222",
			permissions: { can_manage: true },
		});
		expect(result.permissions?.can_manage).toBe(true);
	});
});

const {
	handleActivateSqs,
	handleDeactivateSqs,
	handleGetSqsInfo,
	handleCreateSqsCredentials,
	handleDeleteSqsCredentials,
	handleGetSqsCredentials,
	handleListSqsCredentials,
	handleUpdateSqsCredentials,
} = await import("../../../src/tools/sqs/handlers.js");

describe("sqs handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("handleActivateSqs", () => {
		it("calls correct endpoint and returns SqsInfo", async () => {
			const sqsInfo = {
				project_id: "11111111-1111-1111-1111-111111111111",
				region: "fr-par",
				status: "enabled",
				sqs_endpoint_url: "https://sqs.mnq.fr-par.scaleway.com",
				created_at: "2026-01-01T00:00:00.000Z",
				updated_at: "2026-01-01T00:00:00.000Z",
			};
			mockFetch.mockResolvedValue(mockJsonResponse(sqsInfo));

			const result = await handleActivateSqs({});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/mnq/v1beta1/regions/fr-par/activate-sqs",
				}),
			);
			expect(result.content[0].text).toContain('"status": "enabled"');
		});

		it("uses provided region and project_id", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ status: "enabled" }));

			await handleActivateSqs({
				region: "nl-ams",
				project_id: "22222222-2222-2222-2222-222222222222",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					path: "/mnq/v1beta1/regions/nl-ams/activate-sqs",
				}),
			);
		});

		it("returns error on failure", async () => {
			const err = new Error("Forbidden");
			(err as unknown as Record<string, unknown>).statusCode = 403;
			mockFetch.mockRejectedValue(err);

			const result = await handleActivateSqs({});
			expect((result as Record<string, unknown>).isError).toBe(true);
			expect(result.content[0].text).toContain("permission_denied");
		});
	});

	describe("handleDeactivateSqs", () => {
		it("calls correct endpoint", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ status: "disabled" }));

			const result = await handleDeactivateSqs({});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/mnq/v1beta1/regions/fr-par/deactivate-sqs",
				}),
			);
			expect(result.content[0].text).toContain("disabled");
		});

		it("uses provided region", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ status: "disabled" }));

			await handleDeactivateSqs({ region: "pl-waw" });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					path: "/mnq/v1beta1/regions/pl-waw/deactivate-sqs",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("Server error"));

			const result = await handleDeactivateSqs({});
			expect((result as Record<string, unknown>).isError).toBe(true);
			expect(result.content[0].text).toContain("server_error");
		});
	});

	describe("handleGetSqsInfo", () => {
		it("calls correct endpoint with project_id query param", async () => {
			mockFetch.mockResolvedValue(
				mockJsonResponse({
					status: "enabled",
					sqs_endpoint_url: "https://sqs.mnq.fr-par.scaleway.com",
				}),
			);

			const result = await handleGetSqsInfo({});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/mnq/v1beta1/regions/fr-par/sqs-info?project_id=11111111-1111-1111-1111-111111111111",
				}),
			);
			expect(result.content[0].text).toContain("sqs_endpoint_url");
		});

		it("uses provided region and project_id", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ status: "enabled" }));

			await handleGetSqsInfo({
				region: "nl-ams",
				project_id: "22222222-2222-2222-2222-222222222222",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					path: "/mnq/v1beta1/regions/nl-ams/sqs-info?project_id=22222222-2222-2222-2222-222222222222",
				}),
			);
		});

		it("returns error on 404", async () => {
			const err = new Error("Not found");
			(err as unknown as Record<string, unknown>).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result = await handleGetSqsInfo({});
			expect((result as Record<string, unknown>).isError).toBe(true);
			expect(result.content[0].text).toContain("not_found");
		});
	});

	describe("handleCreateSqsCredentials", () => {
		it("creates credentials with name", async () => {
			const creds = {
				id: "33333333-3333-3333-3333-333333333333",
				name: "my-creds",
				access_key: "SCWSQS-KEY",
				secret_key: "SCWSQS-SECRET",
			};
			mockFetch.mockResolvedValue(mockJsonResponse(creds));

			const result = await handleCreateSqsCredentials({ name: "my-creds" });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/mnq/v1beta1/regions/fr-par/sqs-credentials",
				}),
			);
			const body = JSON.parse((mockFetch.mock.calls[0][0] as { body: string }).body);
			expect(body.name).toBe("my-creds");
			expect(body.project_id).toBe("11111111-1111-1111-1111-111111111111");
			expect(result.content[0].text).toContain("SCWSQS-KEY");
		});

		it("creates credentials with permissions", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ id: "test" }));

			await handleCreateSqsCredentials({
				name: "test",
				permissions: { can_publish: true, can_receive: true, can_manage: false },
			});
			const body = JSON.parse((mockFetch.mock.calls[0][0] as { body: string }).body);
			expect(body.permissions.can_publish).toBe(true);
		});

		it("omits permissions when not provided", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ id: "test" }));

			await handleCreateSqsCredentials({ name: "test" });
			const body = JSON.parse((mockFetch.mock.calls[0][0] as { body: string }).body);
			expect(body.permissions).toBeUndefined();
		});

		it("returns error on failure", async () => {
			const err = new Error("Bad request");
			(err as unknown as Record<string, unknown>).statusCode = 400;
			mockFetch.mockRejectedValue(err);

			const result = await handleCreateSqsCredentials({ name: "test" });
			expect((result as Record<string, unknown>).isError).toBe(true);
			expect(result.content[0].text).toContain("invalid_input");
		});
	});

	describe("handleDeleteSqsCredentials", () => {
		it("deletes credentials by ID", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse(null));

			const result = await handleDeleteSqsCredentials({
				credential_id: "33333333-3333-3333-3333-333333333333",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: "/mnq/v1beta1/regions/fr-par/sqs-credentials/33333333-3333-3333-3333-333333333333",
				}),
			);
			expect(result.content[0].text).toContain("deleted successfully");
		});

		it("uses provided region", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse(null));

			await handleDeleteSqsCredentials({
				region: "nl-ams",
				credential_id: "33333333-3333-3333-3333-333333333333",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					path: "/mnq/v1beta1/regions/nl-ams/sqs-credentials/33333333-3333-3333-3333-333333333333",
				}),
			);
		});

		it("returns error on failure", async () => {
			const err = new Error("Not found");
			(err as unknown as Record<string, unknown>).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result = await handleDeleteSqsCredentials({
				credential_id: "33333333-3333-3333-3333-333333333333",
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleGetSqsCredentials", () => {
		it("gets credentials by ID", async () => {
			const creds = {
				id: "33333333-3333-3333-3333-333333333333",
				name: "my-creds",
			};
			mockFetch.mockResolvedValue(mockJsonResponse(creds));

			const result = await handleGetSqsCredentials({
				credential_id: "33333333-3333-3333-3333-333333333333",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/mnq/v1beta1/regions/fr-par/sqs-credentials/33333333-3333-3333-3333-333333333333",
				}),
			);
			expect(result.content[0].text).toContain("my-creds");
		});

		it("uses provided region", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ id: "test" }));

			await handleGetSqsCredentials({
				region: "pl-waw",
				credential_id: "33333333-3333-3333-3333-333333333333",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					path: "/mnq/v1beta1/regions/pl-waw/sqs-credentials/33333333-3333-3333-3333-333333333333",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("Network error"));

			const result = await handleGetSqsCredentials({
				credential_id: "33333333-3333-3333-3333-333333333333",
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});

	describe("handleListSqsCredentials", () => {
		it("lists credentials with pagination", async () => {
			const listResponse = {
				sqs_credentials: [{ id: "cred-1" }, { id: "cred-2" }],
				total_count: 2,
			};
			mockFetch.mockResolvedValue(mockJsonResponse(listResponse));

			const result = await handleListSqsCredentials({
				page: 1,
				page_size: 50,
				order_by: "created_at_asc",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
				}),
			);
			const path = (mockFetch.mock.calls[0][0] as { path: string }).path;
			expect(path).toContain("/sqs-credentials?");
			expect(path).toContain("page=1");
			expect(path).toContain("page_size=50");
			expect(result.content[0].text).toContain('"totalCount": 2');
		});

		it("uses custom pagination", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ sqs_credentials: [], total_count: 0 }));

			await handleListSqsCredentials({
				page: 3,
				page_size: 10,
				order_by: "name_desc",
			});
			const path = (mockFetch.mock.calls[0][0] as { path: string }).path;
			expect(path).toContain("page=3");
			expect(path).toContain("page_size=10");
			expect(path).toContain("order_by=name_desc");
		});

		it("handles missing sqs_credentials in response", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({}));

			const result = await handleListSqsCredentials({
				page: 1,
				page_size: 50,
				order_by: "created_at_asc",
			});
			expect(result.content[0].text).toContain('"items": []');
			expect(result.content[0].text).toContain('"totalCount": 0');
		});

		it("uses default order_by when not specified", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ sqs_credentials: [], total_count: 0 }));

			await handleListSqsCredentials({ page: 1, page_size: 50, order_by: "created_at_asc" });
			const path = (mockFetch.mock.calls[0][0] as { path: string }).path;
			expect(path).toContain("order_by=created_at_asc");
		});

		it("returns error on failure", async () => {
			const err = new Error("Rate limited");
			(err as unknown as Record<string, unknown>).statusCode = 429;
			mockFetch.mockRejectedValue(err);

			const result = await handleListSqsCredentials({
				page: 1,
				page_size: 50,
				order_by: "created_at_asc",
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
			expect(result.content[0].text).toContain("rate_limited");
		});
	});

	describe("handleUpdateSqsCredentials", () => {
		it("updates credentials name", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ id: "cred-1", name: "new-name" }));

			const result = await handleUpdateSqsCredentials({
				credential_id: "33333333-3333-3333-3333-333333333333",
				name: "new-name",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "PATCH",
					path: "/mnq/v1beta1/regions/fr-par/sqs-credentials/33333333-3333-3333-3333-333333333333",
				}),
			);
			const body = JSON.parse((mockFetch.mock.calls[0][0] as { body: string }).body);
			expect(body.name).toBe("new-name");
			expect(result.content[0].text).toContain("new-name");
		});

		it("updates credentials permissions", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ id: "cred-1" }));

			await handleUpdateSqsCredentials({
				credential_id: "33333333-3333-3333-3333-333333333333",
				permissions: { can_publish: false, can_receive: false, can_manage: true },
			});
			const body = JSON.parse((mockFetch.mock.calls[0][0] as { body: string }).body);
			expect(body.permissions.can_manage).toBe(true);
			expect(body.name).toBeUndefined();
		});

		it("sends empty body when no updates provided", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ id: "cred-1" }));

			await handleUpdateSqsCredentials({
				credential_id: "33333333-3333-3333-3333-333333333333",
			});
			const body = JSON.parse((mockFetch.mock.calls[0][0] as { body: string }).body);
			expect(body.name).toBeUndefined();
			expect(body.permissions).toBeUndefined();
		});

		it("uses provided region", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse({ id: "cred-1" }));

			await handleUpdateSqsCredentials({
				region: "nl-ams",
				credential_id: "33333333-3333-3333-3333-333333333333",
				name: "updated",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					path: "/mnq/v1beta1/regions/nl-ams/sqs-credentials/33333333-3333-3333-3333-333333333333",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("Forbidden"));

			const result = await handleUpdateSqsCredentials({
				credential_id: "33333333-3333-3333-3333-333333333333",
			});
			expect((result as Record<string, unknown>).isError).toBe(true);
		});
	});
});
