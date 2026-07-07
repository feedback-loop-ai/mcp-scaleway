import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerAuditTrailTools } from "../../../src/tools/audit-trail/index.js";

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

const ORG_ID = "00000000-0000-0000-0000-0000000000a1";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";
const EXPORT_JOB_ID = "00000000-0000-0000-0000-0000000000b2";

describe("audit-trail module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerAuditTrailTools(server)).not.toThrow();
	});

	it("registers all 5 audit trail tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerAuditTrailTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(5);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toContain("scaleway_audit_trail_list_events");
		expect(toolNames).toContain("scaleway_audit_trail_list_products");
		expect(toolNames).toContain("scaleway_audit_trail_list_export_jobs");
		expect(toolNames).toContain("scaleway_audit_trail_create_export_job");
		expect(toolNames).toContain("scaleway_audit_trail_delete_export_job");
	});

	it("wires each registered tool to its handler", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const handlers: Record<string, (args: unknown) => Promise<unknown>> = {};
		vi.spyOn(server, "tool").mockImplementation(
			// biome-ignore lint/suspicious/noExplicitAny: test shim for server.tool overloads
			((name: string, _desc: string, _schema: unknown, cb: any) => {
				handlers[name] = cb;
				return undefined as never;
				// biome-ignore lint/suspicious/noExplicitAny: matching McpServer.tool signature
			}) as any,
		);
		registerAuditTrailTools(server);

		mockFetch.mockReset();
		mockFetch.mockResolvedValue({ events: [] });
		await handlers.scaleway_audit_trail_list_events({
			region: "fr-par",
			organizationId: ORG_ID,
		});
		expect(mockFetch).toHaveBeenCalled();

		mockFetch.mockReset();
		mockFetch.mockResolvedValue({ products: [], total_count: 0 });
		await handlers.scaleway_audit_trail_list_products({
			region: "fr-par",
			organizationId: ORG_ID,
		});
		expect(mockFetch).toHaveBeenCalled();

		mockFetch.mockReset();
		mockFetch.mockResolvedValue({ export_jobs: [], total_count: 0 });
		await handlers.scaleway_audit_trail_list_export_jobs({
			region: "fr-par",
			organizationId: ORG_ID,
		});
		expect(mockFetch).toHaveBeenCalled();

		mockFetch.mockReset();
		mockFetch.mockResolvedValue({ id: EXPORT_JOB_ID });
		await handlers.scaleway_audit_trail_create_export_job({
			region: "fr-par",
			organizationId: ORG_ID,
			name: "job",
			s3Bucket: "bucket",
			s3Region: "fr-par",
		});
		expect(mockFetch).toHaveBeenCalled();

		mockFetch.mockReset();
		mockFetch.mockResolvedValue(undefined);
		await handlers.scaleway_audit_trail_delete_export_job({
			region: "fr-par",
			exportJobId: EXPORT_JOB_ID,
		});
		expect(mockFetch).toHaveBeenCalled();
	});
});

describe("audit-trail handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListAuditTrailEvents", () => {
		const sampleEvent = {
			id: "event-1",
			recorded_at: "2025-01-01T00:00:00+00:00",
			locality: "fr-par",
			principal: { id: "user-1" },
			organization_id: ORG_ID,
			project_id: PROJECT_ID,
			source_ip: "1.2.3.4",
			user_agent: "cli",
			product_name: "instance",
			service_name: "InstanceV1",
			method_name: "CreateServer",
			resources: [
				{
					id: "srv-1",
					type: "instance_server",
					name: "web",
					created_at: "2025-01-01T00:00:00+00:00",
				},
			],
			request_id: "req-1",
			request_body: { foo: "bar" },
			status_code: 200,
		};

		it("returns events with only required params", async () => {
			mockFetch.mockResolvedValue({ events: [sampleEvent], next_page_token: null });
			const { handleListAuditTrailEvents } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			const result = await handleListAuditTrailEvents({
				region: "fr-par",
				organizationId: ORG_ID,
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.method).toBe("GET");
			expect(callArgs.path).toBe("audit-trail/v1alpha1/regions/fr-par/events");
			expect(callArgs.urlParams.get("organization_id")).toBe(ORG_ID);
			expect(callArgs.urlParams.get("resource_type")).toBeNull();
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.events).toHaveLength(1);
			expect(parsed.events[0].method_name).toBe("CreateServer");
		});

		it("passes every optional filter", async () => {
			mockFetch.mockResolvedValue({ events: [] });
			const { handleListAuditTrailEvents } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			await handleListAuditTrailEvents({
				region: "nl-ams",
				organizationId: ORG_ID,
				projectId: PROJECT_ID,
				resourceType: "instance_server",
				methodName: "DeleteServer",
				status: 403,
				recordedAfter: "2025-01-01T00:00:00+00:00",
				recordedBefore: "2025-02-01T00:00:00+00:00",
				productName: "instance",
				serviceName: "InstanceV1",
				resourceId: "srv-1",
				principalId: "user-1",
				sourceIp: "1.2.3.4",
				orderBy: "recorded_at_asc",
				pageSize: 20,
				pageToken: "cursor-abc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			const qp = callArgs.urlParams;
			expect(qp.get("project_id")).toBe(PROJECT_ID);
			expect(qp.get("resource_type")).toBe("instance_server");
			expect(qp.get("method_name")).toBe("DeleteServer");
			expect(qp.get("status")).toBe("403");
			expect(qp.get("recorded_after")).toBe("2025-01-01T00:00:00+00:00");
			expect(qp.get("recorded_before")).toBe("2025-02-01T00:00:00+00:00");
			expect(qp.get("product_name")).toBe("instance");
			expect(qp.get("service_name")).toBe("InstanceV1");
			expect(qp.get("resource_id")).toBe("srv-1");
			expect(qp.get("principal_id")).toBe("user-1");
			expect(qp.get("source_ip")).toBe("1.2.3.4");
			expect(qp.get("order_by")).toBe("recorded_at_asc");
			expect(qp.get("page_size")).toBe("20");
			expect(qp.get("page_token")).toBe("cursor-abc");
		});

		it("returns error on failure", async () => {
			const err = new Error("Unauthorized");
			(err as unknown as { statusCode: number }).statusCode = 401;
			mockFetch.mockRejectedValue(err);
			const { handleListAuditTrailEvents } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			const result: ErrorResult = await handleListAuditTrailEvents({
				region: "fr-par",
				organizationId: ORG_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleListAuditTrailProducts", () => {
		it("returns products list", async () => {
			mockFetch.mockResolvedValue({
				products: [
					{
						title: "Instances",
						name: "instance",
						services: [{ name: "InstanceV1", methods: ["CreateServer"] }],
					},
				],
				total_count: 1,
			});
			const { handleListAuditTrailProducts } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			const result = await handleListAuditTrailProducts({
				region: "fr-par",
				organizationId: ORG_ID,
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.method).toBe("GET");
			expect(callArgs.path).toBe("audit-trail/v1alpha1/regions/fr-par/products");
			expect(callArgs.urlParams.get("organization_id")).toBe(ORG_ID);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.total_count).toBe(1);
			expect(parsed.products[0].name).toBe("instance");
		});

		it("returns error on failure", async () => {
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);
			const { handleListAuditTrailProducts } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			const result: ErrorResult = await handleListAuditTrailProducts({
				region: "fr-par",
				organizationId: ORG_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleListAuditTrailExportJobs", () => {
		it("returns paginated export jobs with defaults", async () => {
			mockFetch.mockResolvedValue({
				export_jobs: [
					{
						id: EXPORT_JOB_ID,
						organization_id: ORG_ID,
						name: "nightly",
						tags: [],
					},
				],
				total_count: 1,
			});
			const { handleListAuditTrailExportJobs } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			const result = await handleListAuditTrailExportJobs({
				region: "fr-par",
				organizationId: ORG_ID,
				page: 1,
				pageSize: 50,
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toBe("audit-trail/v1alpha1/regions/fr-par/export-jobs");
			expect(callArgs.urlParams.get("organization_id")).toBe(ORG_ID);
			expect(callArgs.urlParams.get("page")).toBe("1");
			expect(callArgs.urlParams.get("page_size")).toBe("50");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes optional filters", async () => {
			mockFetch.mockResolvedValue({ export_jobs: [], total_count: 0 });
			const { handleListAuditTrailExportJobs } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			await handleListAuditTrailExportJobs({
				region: "fr-par",
				organizationId: ORG_ID,
				name: "nightly",
				tags: ["prod", "audit"],
				orderBy: "created_at_asc",
				page: 2,
				pageSize: 10,
			});

			const qp = mockFetch.mock.calls[0][0].urlParams;
			expect(qp.get("name")).toBe("nightly");
			expect(qp.getAll("tags")).toEqual(["prod", "audit"]);
			expect(qp.get("order_by")).toBe("created_at_asc");
			expect(qp.get("page")).toBe("2");
			expect(qp.get("page_size")).toBe("10");
		});

		it("returns error on failure", async () => {
			const err = new Error("Rate limited");
			(err as unknown as { statusCode: number }).statusCode = 429;
			mockFetch.mockRejectedValue(err);
			const { handleListAuditTrailExportJobs } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			const result: ErrorResult = await handleListAuditTrailExportJobs({
				region: "fr-par",
				organizationId: ORG_ID,
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
		});
	});

	describe("handleCreateAuditTrailExportJob", () => {
		it("creates an export job with full S3 config and tags", async () => {
			mockFetch.mockResolvedValue({ id: EXPORT_JOB_ID, name: "nightly" });
			const { handleCreateAuditTrailExportJob } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			const result = await handleCreateAuditTrailExportJob({
				region: "fr-par",
				organizationId: ORG_ID,
				name: "nightly",
				s3Bucket: "audit-bucket",
				s3Region: "nl-ams",
				s3Prefix: "logs/",
				s3ProjectId: PROJECT_ID,
				tags: ["prod"],
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "audit-trail/v1alpha1/regions/fr-par/export-jobs",
				body: JSON.stringify({
					organization_id: ORG_ID,
					name: "nightly",
					s3: {
						bucket: "audit-bucket",
						region: "nl-ams",
						prefix: "logs/",
						project_id: PROJECT_ID,
					},
					tags: ["prod"],
				}),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("nightly");
		});

		it("creates an export job with minimal S3 config (no prefix/project/tags)", async () => {
			mockFetch.mockResolvedValue({ id: EXPORT_JOB_ID });
			const { handleCreateAuditTrailExportJob } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			await handleCreateAuditTrailExportJob({
				region: "fr-par",
				organizationId: ORG_ID,
				name: "minimal",
				s3Bucket: "audit-bucket",
				s3Region: "fr-par",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "audit-trail/v1alpha1/regions/fr-par/export-jobs",
				body: JSON.stringify({
					organization_id: ORG_ID,
					name: "minimal",
					s3: { bucket: "audit-bucket", region: "fr-par" },
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const err = new Error("Bad request");
			(err as unknown as { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValue(err);
			const { handleCreateAuditTrailExportJob } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			const result: ErrorResult = await handleCreateAuditTrailExportJob({
				region: "fr-par",
				organizationId: ORG_ID,
				name: "bad",
				s3Bucket: "b",
				s3Region: "fr-par",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
		});
	});

	describe("handleDeleteAuditTrailExportJob", () => {
		it("deletes an export job and returns confirmation", async () => {
			mockFetch.mockResolvedValue(undefined);
			const { handleDeleteAuditTrailExportJob } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			const result = await handleDeleteAuditTrailExportJob({
				region: "fr-par",
				exportJobId: EXPORT_JOB_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `audit-trail/v1alpha1/regions/fr-par/export-jobs/${EXPORT_JOB_ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.id).toBe(EXPORT_JOB_ID);
		});

		it("returns error on failure", async () => {
			const err = new Error("Forbidden");
			(err as unknown as { statusCode: number }).statusCode = 403;
			mockFetch.mockRejectedValue(err);
			const { handleDeleteAuditTrailExportJob } = await import(
				"../../../src/tools/audit-trail/handlers.js"
			);

			const result: ErrorResult = await handleDeleteAuditTrailExportJob({
				region: "fr-par",
				exportJobId: EXPORT_JOB_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});
});
