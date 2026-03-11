import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerWebhostingTools } from "../../../src/tools/webhosting/index.js";

// biome-ignore lint/suspicious/noExplicitAny: test helper type
type AnyResult = any;

// Mock shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWTEST1234567890123",
		secretKey: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
		defaultProjectId: "11111111-1111-1111-1111-111111111111",
		defaultOrganizationId: "22222222-2222-2222-2222-222222222222",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	})),
}));

const mockFetch = vi.fn();

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn(() => ({
		fetch: mockFetch,
	})),
	resetClient: vi.fn(),
}));

describe("webhosting module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerWebhostingTools(server)).not.toThrow();
	});
});

describe("webhosting handlers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// ── Import handlers dynamically after mocks are set ──────────────────

	async function getHandlers() {
		const mod = await import("../../../src/tools/webhosting/handlers.js");
		return mod;
	}

	// ── List Hostings ────────────────────────────────────────────────────

	describe("handleListHostings", () => {
		it("returns paginated hostings with defaults", async () => {
			const { handleListHostings } = await getHandlers();
			mockFetch.mockResolvedValueOnce({
				hostings: [{ id: "h1", domain: "example.com" }],
				total_count: 1,
			});

			const result = await handleListHostings({ page: 1, pageSize: 50 });
			expect(result.content[0].type).toBe("text");
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
			expect(data.page).toBe(1);
			expect(data.pageSize).toBe(50);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/webhosting/v1/regions/fr-par/hostings",
				}),
			);
		});

		it("passes all filters as URL params", async () => {
			const { handleListHostings } = await getHandlers();
			mockFetch.mockResolvedValueOnce({ hostings: [], total_count: 0 });

			await handleListHostings({
				page: 2,
				pageSize: 10,
				region: "nl-ams",
				order_by: "created_at_desc",
				project_id: "proj-1",
				domain: "test.com",
				organization_id: "org-1",
				tags: ["web", "prod"],
				statuses: ["ready", "error"],
				control_panels: ["cpanel"],
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toBe("/webhosting/v1/regions/nl-ams/hostings");
			const params: URLSearchParams = call.urlParams;
			expect(params.get("page")).toBe("2");
			expect(params.get("page_size")).toBe("10");
			expect(params.get("order_by")).toBe("created_at_desc");
			expect(params.get("project_id")).toBe("proj-1");
			expect(params.get("domain")).toBe("test.com");
			expect(params.get("organization_id")).toBe("org-1");
			expect(params.getAll("tags")).toEqual(["web", "prod"]);
			expect(params.getAll("statuses")).toEqual(["ready", "error"]);
			expect(params.getAll("control_panels")).toEqual(["cpanel"]);
		});

		it("returns error response on API failure", async () => {
			const { handleListHostings } = await getHandlers();
			const err = new Error("Unauthorized");
			(err as unknown as { statusCode: number }).statusCode = 401;
			mockFetch.mockRejectedValueOnce(err);

			const result: AnyResult = await handleListHostings({ page: 1, pageSize: 50 });
			expect(result.isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("permission_denied");
			expect(data.error.statusCode).toBe(401);
		});
	});

	// ── Get Hosting ──────────────────────────────────────────────────────

	describe("handleGetHosting", () => {
		it("fetches a hosting by ID", async () => {
			const { handleGetHosting } = await getHandlers();
			mockFetch.mockResolvedValueOnce({ id: "h1", domain: "example.com", status: "ready" });

			const result = await handleGetHosting({ hosting_id: "h1" });
			const data = JSON.parse(result.content[0].text);
			expect(data.id).toBe("h1");
			expect(data.status).toBe("ready");

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/webhosting/v1/regions/fr-par/hostings/h1",
				}),
			);
		});

		it("uses custom region", async () => {
			const { handleGetHosting } = await getHandlers();
			mockFetch.mockResolvedValueOnce({ id: "h2" });

			await handleGetHosting({ hosting_id: "h2", region: "nl-ams" });
			expect(mockFetch.mock.calls[0][0].path).toBe("/webhosting/v1/regions/nl-ams/hostings/h2");
		});

		it("returns error on 404", async () => {
			const { handleGetHosting } = await getHandlers();
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValueOnce(err);

			const result: AnyResult = await handleGetHosting({ hosting_id: "nonexistent" });
			expect(result.isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("not_found");
		});
	});

	// ── Create Hosting ───────────────────────────────────────────────────

	describe("handleCreateHosting", () => {
		it("creates a hosting with required fields", async () => {
			const { handleCreateHosting } = await getHandlers();
			mockFetch.mockResolvedValueOnce({ id: "h-new", domain: "new.com", status: "delivering" });

			const result = await handleCreateHosting({
				offer_id: "offer-1",
				domain: "new.com",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.id).toBe("h-new");

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe("/webhosting/v1/regions/fr-par/hostings");
			const body = JSON.parse(call.body);
			expect(body.offer_id).toBe("offer-1");
			expect(body.domain).toBe("new.com");
		});

		it("includes all optional fields in body", async () => {
			const { handleCreateHosting } = await getHandlers();
			mockFetch.mockResolvedValueOnce({ id: "h-new2" });

			await handleCreateHosting({
				region: "nl-ams",
				offer_id: "offer-2",
				domain: "full.com",
				project_id: "proj-1",
				tags: ["tag1"],
				option_ids: ["opt-1"],
				language: "fr_FR",
				domain_configuration: {
					update_nameservers: true,
					update_web_record: true,
					update_mail_record: false,
					update_all_records: false,
				},
				skip_welcome_email: true,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project_id).toBe("proj-1");
			expect(body.tags).toEqual(["tag1"]);
			expect(body.option_ids).toEqual(["opt-1"]);
			expect(body.language).toBe("fr_FR");
			expect(body.domain_configuration.update_nameservers).toBe(true);
			expect(body.skip_welcome_email).toBe(true);
		});

		it("returns error on 400", async () => {
			const { handleCreateHosting } = await getHandlers();
			const err = new Error("Bad request");
			(err as unknown as { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValueOnce(err);

			const result: AnyResult = await handleCreateHosting({ offer_id: "bad", domain: "x.com" });
			expect(result.isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("invalid_input");
		});
	});

	// ── Update Hosting ───────────────────────────────────────────────────

	describe("handleUpdateHosting", () => {
		it("updates hosting with PATCH", async () => {
			const { handleUpdateHosting } = await getHandlers();
			mockFetch.mockResolvedValueOnce({ id: "h1", tags: ["updated"] });

			const result = await handleUpdateHosting({
				hosting_id: "h1",
				tags: ["updated"],
				email: "new@example.com",
				option_ids: ["opt-2"],
				offer_id: "offer-3",
				protected: true,
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.tags).toEqual(["updated"]);

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("PATCH");
			expect(call.path).toBe("/webhosting/v1/regions/fr-par/hostings/h1");
			const body = JSON.parse(call.body);
			expect(body.email).toBe("new@example.com");
			expect(body.tags).toEqual(["updated"]);
			expect(body.option_ids).toEqual(["opt-2"]);
			expect(body.offer_id).toBe("offer-3");
			expect(body.protected).toBe(true);
		});

		it("sends empty body when no optional fields", async () => {
			const { handleUpdateHosting } = await getHandlers();
			mockFetch.mockResolvedValueOnce({ id: "h1" });

			await handleUpdateHosting({ hosting_id: "h1" });
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toEqual({});
		});

		it("returns error on failure", async () => {
			const { handleUpdateHosting } = await getHandlers();
			const err = new Error("Forbidden");
			(err as unknown as { statusCode: number }).statusCode = 403;
			mockFetch.mockRejectedValueOnce(err);

			const result: AnyResult = await handleUpdateHosting({ hosting_id: "h1" });
			expect(result.isError).toBe(true);
		});
	});

	// ── Delete Hosting ───────────────────────────────────────────────────

	describe("handleDeleteHosting", () => {
		it("deletes hosting by ID", async () => {
			const { handleDeleteHosting } = await getHandlers();
			mockFetch.mockResolvedValueOnce({ id: "h1", status: "deleting" });

			const result = await handleDeleteHosting({ hosting_id: "h1" });
			const data = JSON.parse(result.content[0].text);
			expect(data.status).toBe("deleting");

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("DELETE");
			expect(call.path).toBe("/webhosting/v1/regions/fr-par/hostings/h1");
		});

		it("uses custom region", async () => {
			const { handleDeleteHosting } = await getHandlers();
			mockFetch.mockResolvedValueOnce({});

			await handleDeleteHosting({ hosting_id: "h1", region: "nl-ams" });
			expect(mockFetch.mock.calls[0][0].path).toBe("/webhosting/v1/regions/nl-ams/hostings/h1");
		});

		it("returns error on failure", async () => {
			const { handleDeleteHosting } = await getHandlers();
			const err = new Error("Rate limited");
			(err as unknown as { statusCode: number }).statusCode = 429;
			mockFetch.mockRejectedValueOnce(err);

			const result: AnyResult = await handleDeleteHosting({ hosting_id: "h1" });
			expect(result.isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("rate_limited");
		});
	});

	// ── Restore Hosting ──────────────────────────────────────────────────

	describe("handleRestoreHosting", () => {
		it("restores hosting by ID", async () => {
			const { handleRestoreHosting } = await getHandlers();
			mockFetch.mockResolvedValueOnce({ id: "h1", status: "delivering" });

			const result = await handleRestoreHosting({ hosting_id: "h1" });
			const data = JSON.parse(result.content[0].text);
			expect(data.status).toBe("delivering");

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe("/webhosting/v1/regions/fr-par/hostings/h1/restore");
		});

		it("uses custom region", async () => {
			const { handleRestoreHosting } = await getHandlers();
			mockFetch.mockResolvedValueOnce({});

			await handleRestoreHosting({ hosting_id: "h1", region: "nl-ams" });
			expect(mockFetch.mock.calls[0][0].path).toBe(
				"/webhosting/v1/regions/nl-ams/hostings/h1/restore",
			);
		});

		it("returns error on failure", async () => {
			const { handleRestoreHosting } = await getHandlers();
			mockFetch.mockRejectedValueOnce(new Error("Server error"));

			const result: AnyResult = await handleRestoreHosting({ hosting_id: "h1" });
			expect(result.isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("server_error");
			expect(data.error.statusCode).toBe(500);
		});
	});

	// ── Get DNS Records ──────────────────────────────────────────────────

	describe("handleGetDnsRecords", () => {
		it("fetches DNS records for a hosting", async () => {
			const { handleGetDnsRecords } = await getHandlers();
			mockFetch.mockResolvedValueOnce({
				records: [{ name: "@", type: "A", value: "1.2.3.4", ttl: 3600 }],
				name_servers: [{ hostname: "ns1.example.com", is_default: true }],
				status: "valid",
			});

			const result = await handleGetDnsRecords({ hosting_id: "h1" });
			const data = JSON.parse(result.content[0].text);
			expect(data.records).toHaveLength(1);
			expect(data.records[0].type).toBe("A");

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/webhosting/v1/regions/fr-par/hostings/h1/dns-records");
		});

		it("returns error on failure", async () => {
			const { handleGetDnsRecords } = await getHandlers();
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValueOnce(err);

			const result: AnyResult = await handleGetDnsRecords({ hosting_id: "nonexistent" });
			expect(result.isError).toBe(true);
		});
	});

	// ── List Offers ──────────────────────────────────────────────────────

	describe("handleListOffers", () => {
		it("lists offers with no filters", async () => {
			const { handleListOffers } = await getHandlers();
			mockFetch.mockResolvedValueOnce({
				offers: [{ id: "offer-1", available: true, end_of_life: false }],
			});

			const result = await handleListOffers({});
			const data = JSON.parse(result.content[0].text);
			expect(data.offers).toHaveLength(1);

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/webhosting/v1/regions/fr-par/offers");
		});

		it("passes all filters", async () => {
			const { handleListOffers } = await getHandlers();
			mockFetch.mockResolvedValueOnce({ offers: [] });

			await handleListOffers({
				region: "nl-ams",
				order_by: "price_asc",
				hosting_id: "h1",
				control_panels: ["cpanel", "plesk"],
				without_options: true,
				only_options: false,
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toBe("/webhosting/v1/regions/nl-ams/offers");
			const params: URLSearchParams = call.urlParams;
			expect(params.get("order_by")).toBe("price_asc");
			expect(params.get("hosting_id")).toBe("h1");
			expect(params.getAll("control_panels")).toEqual(["cpanel", "plesk"]);
			expect(params.get("without_options")).toBe("true");
			expect(params.get("only_options")).toBe("false");
		});

		it("returns error on failure", async () => {
			const { handleListOffers } = await getHandlers();
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result: AnyResult = await handleListOffers({});
			expect(result.isError).toBe(true);
		});
	});

	// ── List Control Panels ──────────────────────────────────────────────

	describe("handleListControlPanels", () => {
		it("lists control panels with default region", async () => {
			const { handleListControlPanels } = await getHandlers();
			mockFetch.mockResolvedValueOnce({
				control_panels: [{ name: "cpanel", available: true, logo_url: "https://logo.url" }],
			});

			const result = await handleListControlPanels({});
			const data = JSON.parse(result.content[0].text);
			expect(data.control_panels).toHaveLength(1);
			expect(data.control_panels[0].name).toBe("cpanel");

			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/webhosting/v1/regions/fr-par/control-panels");
		});

		it("uses custom region", async () => {
			const { handleListControlPanels } = await getHandlers();
			mockFetch.mockResolvedValueOnce({ control_panels: [] });

			await handleListControlPanels({ region: "nl-ams" });
			expect(mockFetch.mock.calls[0][0].path).toBe("/webhosting/v1/regions/nl-ams/control-panels");
		});

		it("returns error on failure", async () => {
			const { handleListControlPanels } = await getHandlers();
			const err = new Error("Server error");
			(err as unknown as { statusCode: number }).statusCode = 500;
			mockFetch.mockRejectedValueOnce(err);

			const result: AnyResult = await handleListControlPanels({});
			expect(result.isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("server_error");
		});
	});

	// ── Error edge cases ────────────────────────────────────────────────

	describe("error handling edge cases", () => {
		it("handles non-Error thrown values", async () => {
			const { handleGetHosting } = await getHandlers();
			mockFetch.mockRejectedValueOnce("string error");

			const result: AnyResult = await handleGetHosting({ hosting_id: "h1" });
			expect(result.isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("server_error");
			expect(data.error.message).toBe("string error");
		});
	});
});
