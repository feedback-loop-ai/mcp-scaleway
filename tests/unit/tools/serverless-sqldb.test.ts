import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerServerlessSqldbTools } from "../../../src/tools/serverless-sqldb/index.js";

// ── Mock the SDK client ─────────────────────────────────────────────────────
const mockFetch = vi.fn();

vi.mock("@scaleway/sdk-client", () => ({
	createClient: vi.fn(() => ({
		fetch: mockFetch,
		settings: {},
	})),
}));

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWTEST",
		secretKey: "secret",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	})),
}));

import { resetClient } from "../../../src/shared/client.js";

// ── Fixtures ────────────────────────────────────────────────────────────────
const DB_ID = "11111111-1111-1111-1111-111111111111";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";
const ORG_ID = "00000000-0000-0000-0000-000000000002";
const BACKUP_ID = "22222222-2222-2222-2222-222222222222";

const sampleDatabase = {
	id: DB_ID,
	name: "my-db",
	status: "ready",
	endpoint: "my-db.serverless.sqldb.fr-par.scw.cloud",
	organization_id: ORG_ID,
	project_id: PROJECT_ID,
	region: "fr-par",
	created_at: "2025-01-01T00:00:00.000Z",
	cpu_min: 0,
	cpu_max: 4,
	cpu_current: 2,
	started: true,
	engine_major_version: 15,
};

const sampleBackup = {
	id: BACKUP_ID,
	status: "ready",
	organization_id: ORG_ID,
	project_id: PROJECT_ID,
	database_id: DB_ID,
	created_at: "2025-01-02T00:00:00.000Z",
	expires_at: "2025-02-02T00:00:00.000Z",
	size: 1024,
	db_size: 512,
	download_url: "https://example.com/backup.sql",
	download_url_expires_at: "2025-01-02T01:00:00.000Z",
	region: "fr-par",
};

describe("serverless-sqldb module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerServerlessSqldbTools(server)).not.toThrow();
	});
});

describe("serverless-sqldb handlers", () => {
	let handlers: Record<string, (...args: unknown[]) => Promise<unknown>>;

	beforeEach(async () => {
		resetClient();
		mockFetch.mockReset();
		// Dynamically import handlers to get fresh state
		const mod = await import("../../../src/tools/serverless-sqldb/handlers.js");
		handlers = {
			listDatabases: mod.handleListDatabases as (...args: unknown[]) => Promise<unknown>,
			getDatabases: mod.handleGetDatabase as (...args: unknown[]) => Promise<unknown>,
			createDatabase: mod.handleCreateDatabase as (...args: unknown[]) => Promise<unknown>,
			updateDatabase: mod.handleUpdateDatabase as (...args: unknown[]) => Promise<unknown>,
			deleteDatabase: mod.handleDeleteDatabase as (...args: unknown[]) => Promise<unknown>,
			listBackups: mod.handleListDatabaseBackups as (...args: unknown[]) => Promise<unknown>,
			getBackup: mod.handleGetDatabaseBackup as (...args: unknown[]) => Promise<unknown>,
			exportBackup: mod.handleExportDatabaseBackup as (...args: unknown[]) => Promise<unknown>,
			restoreDatabase: mod.handleRestoreDatabase as (...args: unknown[]) => Promise<unknown>,
		};
	});

	// ── ListDatabases ─────────────────────────────────────────────────────────
	describe("handleListDatabases", () => {
		it("returns paginated databases", async () => {
			mockFetch.mockResolvedValueOnce({
				databases: [sampleDatabase],
				total_count: 1,
			});

			const result = await handlers.listDatabases({
				page: 1,
				pageSize: 50,
				order_by: "created_at_asc",
			});
			const content = JSON.parse((result as { content: { text: string }[] }).content[0].text);
			expect(content.items).toHaveLength(1);
			expect(content.totalCount).toBe(1);
			expect(content.items[0].id).toBe(DB_ID);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: expect.stringContaining("/databases"),
				}),
			);
		});

		it("passes optional filters to query params", async () => {
			mockFetch.mockResolvedValueOnce({ databases: [], total_count: 0 });

			await handlers.listDatabases({
				page: 1,
				pageSize: 10,
				project_id: PROJECT_ID,
				organization_id: ORG_ID,
				name: "test-db",
				order_by: "name_desc",
				region: "nl-ams",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toContain("nl-ams");
			const params: URLSearchParams = callArgs.urlParams;
			expect(params.get("project_id")).toBe(PROJECT_ID);
			expect(params.get("organization_id")).toBe(ORG_ID);
			expect(params.get("name")).toBe("test-db");
			expect(params.get("order_by")).toBe("name_desc");
		});

		it("returns error response on API failure", async () => {
			const apiErr = new Error("not found");
			(apiErr as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValueOnce(apiErr);

			const result = await handlers.listDatabases({
				page: 1,
				pageSize: 50,
				order_by: "created_at_asc",
			});
			expect((result as { isError: boolean }).isError).toBe(true);
			const content = JSON.parse((result as { content: { text: string }[] }).content[0].text);
			expect(content.error.type).toBe("not_found");
		});
	});

	// ── GetDatabase ───────────────────────────────────────────────────────────
	describe("handleGetDatabase", () => {
		it("returns a single database", async () => {
			mockFetch.mockResolvedValueOnce(sampleDatabase);

			const result = await handlers.getDatabases({ database_id: DB_ID });
			const content = JSON.parse((result as { content: { text: string }[] }).content[0].text);
			expect(content.id).toBe(DB_ID);
			expect(content.name).toBe("my-db");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: expect.stringContaining(`/databases/${DB_ID}`),
				}),
			);
		});

		it("uses provided region", async () => {
			mockFetch.mockResolvedValueOnce(sampleDatabase);
			await handlers.getDatabases({ database_id: DB_ID, region: "nl-ams" });
			expect(mockFetch.mock.calls[0][0].path).toContain("nl-ams");
		});

		it("handles API errors", async () => {
			mockFetch.mockRejectedValueOnce(new Error("server error"));
			const result = await handlers.getDatabases({ database_id: DB_ID });
			expect((result as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── CreateDatabase ────────────────────────────────────────────────────────
	describe("handleCreateDatabase", () => {
		it("creates a database with required fields", async () => {
			mockFetch.mockResolvedValueOnce(sampleDatabase);

			const result = await handlers.createDatabase({
				name: "my-db",
				cpu_min: 0,
				cpu_max: 4,
			});
			const content = JSON.parse((result as { content: { text: string }[] }).content[0].text);
			expect(content.id).toBe(DB_ID);
			const callBody = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(callBody.name).toBe("my-db");
			expect(callBody.cpu_min).toBe(0);
			expect(callBody.cpu_max).toBe(4);
		});

		it("includes optional project_id and from_backup_id", async () => {
			mockFetch.mockResolvedValueOnce(sampleDatabase);

			await handlers.createDatabase({
				name: "my-db",
				cpu_min: 0,
				cpu_max: 4,
				project_id: PROJECT_ID,
				from_backup_id: BACKUP_ID,
			});
			const callBody = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(callBody.project_id).toBe(PROJECT_ID);
			expect(callBody.from_backup_id).toBe(BACKUP_ID);
		});

		it("handles API errors", async () => {
			const apiErr = new Error("bad request");
			(apiErr as Error & { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValueOnce(apiErr);

			const result = await handlers.createDatabase({
				name: "my-db",
				cpu_min: 0,
				cpu_max: 4,
			});
			expect((result as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── UpdateDatabase ────────────────────────────────────────────────────────
	describe("handleUpdateDatabase", () => {
		it("updates cpu_min and cpu_max", async () => {
			mockFetch.mockResolvedValueOnce({ ...sampleDatabase, cpu_min: 1, cpu_max: 8 });

			const result = await handlers.updateDatabase({
				database_id: DB_ID,
				cpu_min: 1,
				cpu_max: 8,
			});
			const content = JSON.parse((result as { content: { text: string }[] }).content[0].text);
			expect(content.cpu_min).toBe(1);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "PATCH",
					path: expect.stringContaining(`/databases/${DB_ID}`),
				}),
			);
		});

		it("sends empty body when no optional fields provided", async () => {
			mockFetch.mockResolvedValueOnce(sampleDatabase);

			await handlers.updateDatabase({ database_id: DB_ID });
			const callBody = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(callBody).toEqual({});
		});

		it("includes only provided optional fields", async () => {
			mockFetch.mockResolvedValueOnce(sampleDatabase);

			await handlers.updateDatabase({ database_id: DB_ID, cpu_min: 2 });
			const callBody = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(callBody).toEqual({ cpu_min: 2 });
			expect(callBody.cpu_max).toBeUndefined();
		});

		it("handles API errors", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			const result = await handlers.updateDatabase({ database_id: DB_ID });
			expect((result as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── DeleteDatabase ────────────────────────────────────────────────────────
	describe("handleDeleteDatabase", () => {
		it("deletes a database and returns its final state", async () => {
			mockFetch.mockResolvedValueOnce({ ...sampleDatabase, status: "deleting" });

			const result = await handlers.deleteDatabase({ database_id: DB_ID });
			const content = JSON.parse((result as { content: { text: string }[] }).content[0].text);
			expect(content.status).toBe("deleting");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: expect.stringContaining(`/databases/${DB_ID}`),
				}),
			);
		});

		it("handles API errors", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			const result = await handlers.deleteDatabase({ database_id: DB_ID });
			expect((result as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── ListDatabaseBackups ─────────────────────────────────────────────────
	describe("handleListDatabaseBackups", () => {
		it("returns paginated backups", async () => {
			mockFetch.mockResolvedValueOnce({
				backups: [sampleBackup],
				total_count: 1,
			});

			const result = await handlers.listBackups({
				database_id: DB_ID,
				page: 1,
				pageSize: 50,
				order_by: "created_at_asc",
			});
			const content = JSON.parse((result as { content: { text: string }[] }).content[0].text);
			expect(content.items).toHaveLength(1);
			expect(content.items[0].id).toBe(BACKUP_ID);
		});

		it("passes optional filters", async () => {
			mockFetch.mockResolvedValueOnce({ backups: [], total_count: 0 });

			await handlers.listBackups({
				database_id: DB_ID,
				page: 1,
				pageSize: 10,
				project_id: PROJECT_ID,
				organization_id: ORG_ID,
				order_by: "created_at_desc",
				region: "nl-ams",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toContain("nl-ams");
			const params: URLSearchParams = callArgs.urlParams;
			expect(params.get("database_id")).toBe(DB_ID);
			expect(params.get("project_id")).toBe(PROJECT_ID);
			expect(params.get("organization_id")).toBe(ORG_ID);
			expect(params.get("order_by")).toBe("created_at_desc");
		});

		it("handles API errors", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			const result = await handlers.listBackups({
				database_id: DB_ID,
				page: 1,
				pageSize: 50,
				order_by: "created_at_asc",
			});
			expect((result as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── GetDatabaseBackup ─────────────────────────────────────────────────────
	describe("handleGetDatabaseBackup", () => {
		it("returns a single backup", async () => {
			mockFetch.mockResolvedValueOnce(sampleBackup);

			const result = await handlers.getBackup({ backup_id: BACKUP_ID });
			const content = JSON.parse((result as { content: { text: string }[] }).content[0].text);
			expect(content.id).toBe(BACKUP_ID);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: expect.stringContaining(`/backups/${BACKUP_ID}`),
				}),
			);
		});

		it("handles API errors", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			const result = await handlers.getBackup({ backup_id: BACKUP_ID });
			expect((result as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── ExportDatabaseBackup ────────────────────────────────────────────────
	describe("handleExportDatabaseBackup", () => {
		it("exports a backup and returns updated backup with download URL", async () => {
			mockFetch.mockResolvedValueOnce(sampleBackup);

			const result = await handlers.exportBackup({ backup_id: BACKUP_ID });
			const content = JSON.parse((result as { content: { text: string }[] }).content[0].text);
			expect(content.download_url).toBe("https://example.com/backup.sql");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: expect.stringContaining(`/backups/${BACKUP_ID}/export`),
				}),
			);
		});

		it("handles API errors", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			const result = await handlers.exportBackup({ backup_id: BACKUP_ID });
			expect((result as { isError: boolean }).isError).toBe(true);
		});
	});

	// ── RestoreDatabase ─────────────────────────────────────────────────────
	describe("handleRestoreDatabase", () => {
		it("restores a database from a backup", async () => {
			mockFetch.mockResolvedValueOnce({ ...sampleDatabase, status: "restoring" });

			const result = await handlers.restoreDatabase({
				database_id: DB_ID,
				backup_id: BACKUP_ID,
			});
			const content = JSON.parse((result as { content: { text: string }[] }).content[0].text);
			expect(content.status).toBe("restoring");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: expect.stringContaining(`/databases/${DB_ID}/restore`),
				}),
			);
			const callBody = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(callBody.backup_id).toBe(BACKUP_ID);
		});

		it("handles API errors", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));
			const result = await handlers.restoreDatabase({
				database_id: DB_ID,
				backup_id: BACKUP_ID,
			});
			expect((result as { isError: boolean }).isError).toBe(true);
		});
	});
});
