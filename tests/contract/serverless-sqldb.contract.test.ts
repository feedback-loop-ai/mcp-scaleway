/**
 * Contract tests for Serverless SQL Database API.
 *
 * Validates request/response shapes, pagination, auth requirements, and error codes
 * against the Scaleway Serverless SQL Database API v1alpha1.
 *
 * API Reference: https://www.scaleway.com/en/developers/api/serverless-sql-databases/
 * SDK Reference: @scaleway/sdk-client → /serverless-sqldb/v1alpha1/regions/{region}/databases
 */
import { createAdvancedClient, withProfile } from "@scaleway/sdk-client";
import { createScalewayClient } from "../../src/shared/client.js";
import * as httpHandlers from "../../src/tools/serverless-sqldb/handlers.js";

import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
	CreateDatabaseInput,
	Database,
	DatabaseBackup,
	DatabaseBackupStatus,
	DatabaseStatus,
	DeleteDatabaseInput,
	ExportDatabaseBackupInput,
	GetDatabaseBackupInput,
	GetDatabaseInput,
	ListDatabaseBackupsInput,
	ListDatabaseBackupsOrderBy,
	ListDatabasesInput,
	ListDatabasesOrderBy,
	RestoreDatabaseInput,
	UpdateDatabaseInput,
} from "../../src/tools/serverless-sqldb/types.js";

vi.mock("../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({ defaultRegion: "fr-par" })),
}));
vi.mock("../../src/shared/client.js", () => ({ createScalewayClient: vi.fn() }));

// ── Fixtures ────────────────────────────────────────────────────────────────
const VALID_UUID = "11111111-1111-1111-1111-111111111111";
const VALID_REGION = "fr-par";

const validDatabasePayload = {
	id: VALID_UUID,
	name: "test-db",
	status: "ready",
	endpoint: "test-db.serverless.sqldb.fr-par.scw.cloud",
	organization_id: VALID_UUID,
	project_id: VALID_UUID,
	region: VALID_REGION,
	created_at: "2025-01-01T00:00:00.000Z",
	cpu_min: 0,
	cpu_max: 4,
	cpu_current: 2,
	started: true,
	engine_major_version: 15,
};

const validBackupPayload = {
	id: VALID_UUID,
	status: "ready",
	organization_id: VALID_UUID,
	project_id: VALID_UUID,
	database_id: VALID_UUID,
	created_at: "2025-01-01T00:00:00.000Z",
	region: VALID_REGION,
};

// ── Database Status enum contract ─────────────────────────────────────────
// Endpoint: all /databases endpoints, status field
describe("DatabaseStatus enum", () => {
	it("accepts all known statuses from Scaleway API", () => {
		const statuses = [
			"unknown_status",
			"error",
			"creating",
			"ready",
			"deleting",
			"restoring",
			"locked",
		];
		for (const s of statuses) {
			expect(DatabaseStatus.parse(s)).toBe(s);
		}
	});

	it("rejects invalid status", () => {
		expect(() => DatabaseStatus.parse("running")).toThrow();
	});
});

// ── Database Backup Status enum contract ────────────────────────────────────
// Endpoint: all /backups endpoints, status field
describe("DatabaseBackupStatus enum", () => {
	it("accepts all known statuses", () => {
		const statuses = ["unknown_status", "error", "ready", "locked"];
		for (const s of statuses) {
			expect(DatabaseBackupStatus.parse(s)).toBe(s);
		}
	});

	it("rejects invalid status", () => {
		expect(() => DatabaseBackupStatus.parse("expired")).toThrow();
	});
});

// ── Database response shape contract ────────────────────────────────────────
// Endpoint: GET /serverless-sqldb/v1alpha1/regions/{region}/databases/{database_id}
describe("Database response shape", () => {
	it("validates a complete database response", () => {
		const result = Database.parse(validDatabasePayload);
		expect(result.id).toBe(VALID_UUID);
		expect(result.name).toBe("test-db");
		expect(result.status).toBe("ready");
		expect(result.cpu_min).toBe(0);
		expect(result.cpu_max).toBe(4);
		expect(result.started).toBe(true);
		expect(result.engine_major_version).toBe(15);
	});

	it("requires all mandatory fields", () => {
		const { id, ...incomplete } = validDatabasePayload;
		expect(() => Database.parse(incomplete)).toThrow();
	});

	it("rejects non-UUID id", () => {
		expect(() => Database.parse({ ...validDatabasePayload, id: "not-a-uuid" })).toThrow();
	});
});

// ── DatabaseBackup response shape contract ──────────────────────────────────
// Endpoint: GET /serverless-sqldb/v1alpha1/regions/{region}/backups/{backup_id}
describe("DatabaseBackup response shape", () => {
	it("validates a minimal backup response", () => {
		const result = DatabaseBackup.parse(validBackupPayload);
		expect(result.id).toBe(VALID_UUID);
		expect(result.status).toBe("ready");
	});

	it("validates a full backup response with optional fields", () => {
		const full = {
			...validBackupPayload,
			expires_at: "2025-02-01T00:00:00.000Z",
			size: 1024,
			db_size: 512,
			download_url: "https://s3.example.com/backup.sql",
			download_url_expires_at: "2025-01-01T01:00:00.000Z",
		};
		const result = DatabaseBackup.parse(full);
		expect(result.download_url).toBe("https://s3.example.com/backup.sql");
		expect(result.size).toBe(1024);
	});

	it("requires all mandatory fields", () => {
		const { database_id, ...incomplete } = validBackupPayload;
		expect(() => DatabaseBackup.parse(incomplete)).toThrow();
	});
});

// ── ListDatabases request shape contract ────────────────────────────────────
// Endpoint: GET /serverless-sqldb/v1alpha1/regions/{region}/databases
describe("ListDatabasesInput request shape", () => {
	it("validates with defaults only", () => {
		const result = ListDatabasesInput.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
		expect(result.order_by).toBe("created_at_asc");
	});

	it("validates with all optional filters", () => {
		const result = ListDatabasesInput.parse({
			region: "fr-par",
			project_id: VALID_UUID,
			organization_id: VALID_UUID,
			name: "my-db",
			order_by: "name_desc",
			page: 2,
			pageSize: 25,
		});
		expect(result.name).toBe("my-db");
		expect(result.order_by).toBe("name_desc");
		expect(result.page).toBe(2);
	});

	it("rejects invalid region format", () => {
		expect(() => ListDatabasesInput.parse({ region: "invalid" })).toThrow();
	});

	it("rejects invalid order_by value", () => {
		expect(() => ListDatabasesInput.parse({ order_by: "invalid_order" })).toThrow();
	});

	it("rejects page size > 100", () => {
		expect(() => ListDatabasesInput.parse({ pageSize: 200 })).toThrow();
	});

	it("rejects page < 1", () => {
		expect(() => ListDatabasesInput.parse({ page: 0 })).toThrow();
	});
});

// ── ListDatabases order-by contract ─────────────────────────────────────────
describe("ListDatabasesOrderBy", () => {
	it("accepts valid values", () => {
		for (const v of ["created_at_asc", "created_at_desc", "name_asc", "name_desc"]) {
			expect(ListDatabasesOrderBy.parse(v)).toBe(v);
		}
	});

	it("defaults to created_at_asc", () => {
		expect(ListDatabasesOrderBy.parse(undefined)).toBe("created_at_asc");
	});
});

// ── GetDatabase request shape contract ──────────────────────────────────────
// Endpoint: GET /serverless-sqldb/v1alpha1/regions/{region}/databases/{database_id}
describe("GetDatabaseInput request shape", () => {
	it("requires database_id", () => {
		const result = GetDatabaseInput.parse({ database_id: VALID_UUID });
		expect(result.database_id).toBe(VALID_UUID);
	});

	it("accepts optional region", () => {
		const result = GetDatabaseInput.parse({ database_id: VALID_UUID, region: "nl-ams" });
		expect(result.region).toBe("nl-ams");
	});

	it("rejects missing database_id", () => {
		expect(() => GetDatabaseInput.parse({})).toThrow();
	});

	it("rejects non-UUID database_id", () => {
		expect(() => GetDatabaseInput.parse({ database_id: "not-uuid" })).toThrow();
	});
});

// ── CreateDatabase request shape contract ───────────────────────────────────
// Endpoint: POST /serverless-sqldb/v1alpha1/regions/{region}/databases
describe("CreateDatabaseInput request shape", () => {
	it("validates with required fields", () => {
		const result = CreateDatabaseInput.parse({
			name: "new-db",
			cpu_min: 0,
			cpu_max: 4,
		});
		expect(result.name).toBe("new-db");
		expect(result.cpu_min).toBe(0);
		expect(result.cpu_max).toBe(4);
	});

	it("accepts optional fields", () => {
		const result = CreateDatabaseInput.parse({
			name: "new-db",
			cpu_min: 0,
			cpu_max: 4,
			region: "fr-par",
			project_id: VALID_UUID,
			from_backup_id: VALID_UUID,
		});
		expect(result.from_backup_id).toBe(VALID_UUID);
	});

	it("rejects empty name", () => {
		expect(() => CreateDatabaseInput.parse({ name: "", cpu_min: 0, cpu_max: 4 })).toThrow();
	});

	it("rejects missing name", () => {
		expect(() => CreateDatabaseInput.parse({ cpu_min: 0, cpu_max: 4 })).toThrow();
	});

	it("rejects missing cpu_min", () => {
		expect(() => CreateDatabaseInput.parse({ name: "db", cpu_max: 4 })).toThrow();
	});

	it("rejects missing cpu_max", () => {
		expect(() => CreateDatabaseInput.parse({ name: "db", cpu_min: 0 })).toThrow();
	});

	it("rejects negative cpu_min", () => {
		expect(() => CreateDatabaseInput.parse({ name: "db", cpu_min: -1, cpu_max: 4 })).toThrow();
	});
});

// ── UpdateDatabase request shape contract ───────────────────────────────────
// Endpoint: PATCH /serverless-sqldb/v1alpha1/regions/{region}/databases/{database_id}
describe("UpdateDatabaseInput request shape", () => {
	it("requires database_id", () => {
		const result = UpdateDatabaseInput.parse({ database_id: VALID_UUID });
		expect(result.database_id).toBe(VALID_UUID);
	});

	it("accepts optional cpu fields", () => {
		const result = UpdateDatabaseInput.parse({
			database_id: VALID_UUID,
			cpu_min: 1,
			cpu_max: 8,
		});
		expect(result.cpu_min).toBe(1);
		expect(result.cpu_max).toBe(8);
	});

	it("rejects missing database_id", () => {
		expect(() => UpdateDatabaseInput.parse({})).toThrow();
	});
});

// ── DeleteDatabase request shape contract ───────────────────────────────────
// Endpoint: DELETE /serverless-sqldb/v1alpha1/regions/{region}/databases/{database_id}
describe("DeleteDatabaseInput request shape", () => {
	it("requires database_id", () => {
		const result = DeleteDatabaseInput.parse({ database_id: VALID_UUID });
		expect(result.database_id).toBe(VALID_UUID);
	});

	it("rejects missing database_id", () => {
		expect(() => DeleteDatabaseInput.parse({})).toThrow();
	});
});

// ── ListDatabaseBackups request shape contract ──────────────────────────────
// Endpoint: GET /serverless-sqldb/v1alpha1/regions/{region}/backups
describe("ListDatabaseBackupsInput request shape", () => {
	it("requires database_id", () => {
		const result = ListDatabaseBackupsInput.parse({ database_id: VALID_UUID });
		expect(result.database_id).toBe(VALID_UUID);
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
		expect(result.order_by).toBe("created_at_asc");
	});

	it("accepts optional filters", () => {
		const result = ListDatabaseBackupsInput.parse({
			database_id: VALID_UUID,
			project_id: VALID_UUID,
			organization_id: VALID_UUID,
			order_by: "created_at_desc",
			page: 3,
			pageSize: 10,
		});
		expect(result.order_by).toBe("created_at_desc");
	});

	it("rejects missing database_id", () => {
		expect(() => ListDatabaseBackupsInput.parse({})).toThrow();
	});
});

// ── ListDatabaseBackups order-by contract ───────────────────────────────────
describe("ListDatabaseBackupsOrderBy", () => {
	it("accepts valid values", () => {
		for (const v of ["created_at_asc", "created_at_desc"]) {
			expect(ListDatabaseBackupsOrderBy.parse(v)).toBe(v);
		}
	});

	it("defaults to created_at_asc", () => {
		expect(ListDatabaseBackupsOrderBy.parse(undefined)).toBe("created_at_asc");
	});
});

// ── GetDatabaseBackup request shape contract ────────────────────────────────
// Endpoint: GET /serverless-sqldb/v1alpha1/regions/{region}/backups/{backup_id}
describe("GetDatabaseBackupInput request shape", () => {
	it("requires backup_id", () => {
		const result = GetDatabaseBackupInput.parse({ backup_id: VALID_UUID });
		expect(result.backup_id).toBe(VALID_UUID);
	});

	it("rejects missing backup_id", () => {
		expect(() => GetDatabaseBackupInput.parse({})).toThrow();
	});
});

// ── ExportDatabaseBackup request shape contract ─────────────────────────────
// Endpoint: POST /serverless-sqldb/v1alpha1/regions/{region}/backups/{backup_id}/export
describe("ExportDatabaseBackupInput request shape", () => {
	it("requires backup_id", () => {
		const result = ExportDatabaseBackupInput.parse({ backup_id: VALID_UUID });
		expect(result.backup_id).toBe(VALID_UUID);
	});

	it("rejects missing backup_id", () => {
		expect(() => ExportDatabaseBackupInput.parse({})).toThrow();
	});
});

// ── RestoreDatabase request shape contract ──────────────────────────────────
// Endpoint: POST /serverless-sqldb/v1alpha1/regions/{region}/databases/{database_id}/restore
describe("RestoreDatabaseInput request shape", () => {
	it("requires both database_id and backup_id", () => {
		const result = RestoreDatabaseInput.parse({
			database_id: VALID_UUID,
			backup_id: VALID_UUID,
		});
		expect(result.database_id).toBe(VALID_UUID);
		expect(result.backup_id).toBe(VALID_UUID);
	});

	it("rejects missing database_id", () => {
		expect(() => RestoreDatabaseInput.parse({ backup_id: VALID_UUID })).toThrow();
	});

	it("rejects missing backup_id", () => {
		expect(() => RestoreDatabaseInput.parse({ database_id: VALID_UUID })).toThrow();
	});

	it("accepts optional region", () => {
		const result = RestoreDatabaseInput.parse({
			database_id: VALID_UUID,
			backup_id: VALID_UUID,
			region: "nl-ams",
		});
		expect(result.region).toBe("nl-ams");
	});
});

// ── Pagination contract ─────────────────────────────────────────────────────
// All list endpoints support page/page_size query parameters
describe("Pagination contract", () => {
	it("ListDatabases defaults page=1 pageSize=50", () => {
		const result = ListDatabasesInput.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("ListDatabaseBackups defaults page=1 pageSize=50", () => {
		const result = ListDatabaseBackupsInput.parse({ database_id: VALID_UUID });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("enforces max page size of 100 on ListDatabases", () => {
		expect(() => ListDatabasesInput.parse({ pageSize: 101 })).toThrow();
	});

	it("enforces max page size of 100 on ListDatabaseBackups", () => {
		expect(() =>
			ListDatabaseBackupsInput.parse({ database_id: VALID_UUID, pageSize: 101 }),
		).toThrow();
	});
});

// ── Auth contract ───────────────────────────────────────────────────────────
// All endpoints require X-Auth-Token header (handled by SDK client)
describe("Auth contract", () => {
	it("region field is optional and uses SDK default", () => {
		const result = GetDatabaseInput.parse({ database_id: VALID_UUID });
		expect(result.region).toBeUndefined();
	});

	it("region follows Scaleway region format", () => {
		expect(() =>
			GetDatabaseInput.parse({ database_id: VALID_UUID, region: "invalid-region-123" }),
		).toThrow();
	});

	it("region accepts valid Scaleway regions", () => {
		for (const r of ["fr-par", "nl-ams", "pl-waw"]) {
			const result = GetDatabaseInput.parse({ database_id: VALID_UUID, region: r });
			expect(result.region).toBe(r);
		}
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
		vi.mocked(createScalewayClient).mockReturnValue(client);
		return { client, requests };
	}

	const jsonCases = [
		{
			name: "CreateDatabase",
			method: "POST",
			path: "/serverless-sqldb/v1alpha1/regions/fr-par/databases",
			call: () =>
				httpHandlers.handleCreateDatabase({
					region: "fr-par",
					name: "test",
					cpu_min: 0,
					cpu_max: 1,
					project_id: "11111111-1111-1111-1111-111111111111",
				}),
			body: {
				name: "test",
				cpu_min: 0,
				cpu_max: 1,
				project_id: "11111111-1111-1111-1111-111111111111",
			},
		},
		{
			name: "UpdateDatabase",
			method: "PATCH",
			path: "/serverless-sqldb/v1alpha1/regions/fr-par/databases/11111111-1111-1111-1111-111111111111",
			call: () =>
				httpHandlers.handleUpdateDatabase({
					region: "fr-par",
					database_id: "11111111-1111-1111-1111-111111111111",
					cpu_min: 0,
				}),
			body: { cpu_min: 0 },
		},
		{
			name: "ExportDatabaseBackup",
			method: "POST",
			path: "/serverless-sqldb/v1alpha1/regions/fr-par/backups/11111111-1111-1111-1111-111111111111/export",
			call: () =>
				httpHandlers.handleExportDatabaseBackup({
					region: "fr-par",
					backup_id: "11111111-1111-1111-1111-111111111111",
				}),
			body: {},
		},
		{
			name: "RestoreDatabase",
			method: "POST",
			path: "/serverless-sqldb/v1alpha1/regions/fr-par/databases/11111111-1111-1111-1111-111111111111/restore",
			call: () =>
				httpHandlers.handleRestoreDatabase({
					region: "fr-par",
					database_id: "11111111-1111-1111-1111-111111111111",
					backup_id: "11111111-1111-1111-1111-111111111111",
				}),
			body: { backup_id: "11111111-1111-1111-1111-111111111111" },
		},
	];

	it.each(jsonCases)(
		"$name: $method $path sends application/json",
		async ({ call, method, path, body }) => {
			const response = { id: "http-response", status: "ready" };
			const { requests } = recordingClient(response);
			const result = await call();
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
		const { requests } = recordingClient({ message: "HTTP contract error" }, status);
		const result = await jsonCases[0].call();
		expect(requests).toHaveLength(1);
		expect(result).toMatchObject({ isError: true });
		expect(JSON.parse(result.content[0].text)).toMatchObject({
			error: { type, statusCode: status },
		});
	});

	// These DELETE endpoints return HTTP 200 JSON resource bodies, not HTTP 204.
	it("DeleteDatabase preserves the HTTP 200 resource response", async () => {
		const response = { id: "11111111-1111-1111-1111-111111111111", status: "deleting" };
		const { requests } = recordingClient(response);
		const result = await httpHandlers.handleDeleteDatabase({
			region: "fr-par",
			database_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(requests).toHaveLength(1);
		expect(requests[0].method).toBe("DELETE");
		expect(new URL(requests[0].url).pathname).toBe(
			"/serverless-sqldb/v1alpha1/regions/fr-par/databases/11111111-1111-1111-1111-111111111111",
		);
		expect(requests[0].body).toBeNull();
		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
		});
	});
});
