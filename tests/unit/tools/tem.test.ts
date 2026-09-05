import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildUrlParams,
	handleCancelEmail,
	handleCheckDomain,
	handleCreateDomain,
	handleCreateEmail,
	handleCreateWebhook,
	handleDeleteWebhook,
	handleGetDomain,
	handleGetDomainLastStatus,
	handleGetEmail,
	handleGetStatistics,
	handleListDomains,
	handleListEmails,
	handleListWebhooks,
	handleRevokeDomain,
	handleUpdateWebhook,
} from "../../../src/tools/tem/handlers.js";
import { registerTemTools } from "../../../src/tools/tem/index.js";

// Mock the shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWTEST",
		secretKey: "secret",
		defaultProjectId: "proj-123",
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

describe("tem module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerTemTools(server)).not.toThrow();
	});
});

describe("buildUrlParams", () => {
	it("builds URLSearchParams from record, skipping undefined", () => {
		const params = buildUrlParams({
			page: 1,
			page_size: 50,
			name: "test",
			status: undefined,
		});
		expect(params).toBeInstanceOf(URLSearchParams);
		expect(params.get("page")).toBe("1");
		expect(params.get("page_size")).toBe("50");
		expect(params.get("name")).toBe("test");
		expect(params.has("status")).toBe(false);
	});

	it("returns empty URLSearchParams for empty input", () => {
		const params = buildUrlParams({});
		expect(params.toString()).toBe("");
	});
});

describe("tem handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// --- Domain handlers ---

	describe("handleListDomains", () => {
		it("returns paginated domains list", async () => {
			mockFetch.mockResolvedValue({
				domains: [{ id: "dom-1", name: "example.com", status: "checked" }],
				total_count: 1,
			});
			const result = await handleListDomains({ page: 1, pageSize: 50 });
			expect(result.content[0].type).toBe("text");
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
			expect(data.page).toBe(1);
			expect(data.pageSize).toBe(50);
		});

		it("passes filters to the API", async () => {
			mockFetch.mockResolvedValue({ domains: [], total_count: 0 });
			await handleListDomains({
				region: "nl-ams",
				project_id: "proj-1",
				status: "checked",
				name: "test.com",
				organization_id: "org-1",
				page: 2,
				pageSize: 10,
			});
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/transactional-email/v1alpha1/regions/nl-ams/domains");
			expect(call.urlParams.get("page")).toBe("2");
			expect(call.urlParams.get("page_size")).toBe("10");
			expect(call.urlParams.get("project_id")).toBe("proj-1");
			expect(call.urlParams.get("status")).toBe("checked");
			expect(call.urlParams.get("name")).toBe("test.com");
			expect(call.urlParams.get("organization_id")).toBe("org-1");
		});

		it("returns error on failure", async () => {
			const err = new Error("fail");
			(err as Error & { statusCode: number }).statusCode = 403;
			mockFetch.mockRejectedValue(err);
			const result = await handleListDomains({ page: 1, pageSize: 50 });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetDomain", () => {
		it("returns domain details", async () => {
			mockFetch.mockResolvedValue({ id: "dom-1", name: "example.com" });
			const result = await handleGetDomain({ domain_id: "dom-1" });
			const data = JSON.parse(result.content[0].text);
			expect(data.id).toBe("dom-1");
		});

		it("uses provided region", async () => {
			mockFetch.mockResolvedValue({});
			await handleGetDomain({ domain_id: "dom-1", region: "nl-ams" });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					path: "/transactional-email/v1alpha1/regions/nl-ams/domains/dom-1",
				}),
			);
		});

		it("returns error on failure", async () => {
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);
			const result = await handleGetDomain({ domain_id: "dom-1" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateDomain", () => {
		it("creates a domain", async () => {
			mockFetch.mockResolvedValue({ id: "dom-new", name: "new.com", status: "unchecked" });
			const result = await handleCreateDomain({
				project_id: "proj-1",
				domain_name: "new.com",
				accept_tos: true,
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.id).toBe("dom-new");
		});

		it("sends autoconfig when provided", async () => {
			mockFetch.mockResolvedValue({});
			await handleCreateDomain({
				project_id: "proj-1",
				domain_name: "new.com",
				accept_tos: true,
				autoconfig: true,
				region: "fr-par",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					body: expect.stringContaining('"autoconfig":true'),
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("bad request"));
			const result = await handleCreateDomain({
				project_id: "p",
				domain_name: "d",
				accept_tos: false,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleRevokeDomain", () => {
		it("revokes a domain", async () => {
			mockFetch.mockResolvedValue({ id: "dom-1", status: "revoked" });
			const result = await handleRevokeDomain({ domain_id: "dom-1" });
			const data = JSON.parse(result.content[0].text);
			expect(data.status).toBe("revoked");
		});

		it("returns error on failure", async () => {
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);
			const result = await handleRevokeDomain({ domain_id: "dom-1" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCheckDomain", () => {
		it("checks a domain", async () => {
			mockFetch.mockResolvedValue({ id: "dom-1", status: "checked" });
			const result = await handleCheckDomain({ domain_id: "dom-1" });
			const data = JSON.parse(result.content[0].text);
			expect(data.status).toBe("checked");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCheckDomain({ domain_id: "dom-1" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleGetDomainLastStatus", () => {
		it("returns domain verification status", async () => {
			mockFetch.mockResolvedValue({
				domain_id: "dom-1",
				spf_record: { status: "valid" },
			});
			const result = await handleGetDomainLastStatus({ domain_id: "dom-1" });
			const data = JSON.parse(result.content[0].text);
			expect(data.domain_id).toBe("dom-1");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleGetDomainLastStatus({ domain_id: "dom-1" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// --- Email handlers ---

	describe("handleListEmails", () => {
		it("returns paginated emails list", async () => {
			mockFetch.mockResolvedValue({
				emails: [{ id: "email-1", status: "sent" }],
				total_count: 1,
			});
			const result = await handleListEmails({ page: 1, pageSize: 50 });
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
		});

		it("passes all filters to the API", async () => {
			mockFetch.mockResolvedValue({ emails: [], total_count: 0 });
			await handleListEmails({
				region: "nl-ams",
				project_id: "proj-1",
				domain_id: "dom-1",
				status: "sent",
				mail_from: "a@b.com",
				mail_to: "c@d.com",
				subject: "test",
				search: "hello",
				message_id: "msg-1",
				since: "2025-01-01T00:00:00Z",
				until: "2025-12-31T23:59:59Z",
				page: 3,
				pageSize: 25,
			});
			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toBe("/transactional-email/v1alpha1/regions/nl-ams/emails");
			expect(call.urlParams.get("page")).toBe("3");
			expect(call.urlParams.get("page_size")).toBe("25");
			expect(call.urlParams.get("project_id")).toBe("proj-1");
			expect(call.urlParams.get("domain_id")).toBe("dom-1");
			expect(call.urlParams.get("status")).toBe("sent");
			expect(call.urlParams.get("mail_from")).toBe("a@b.com");
			expect(call.urlParams.get("mail_to")).toBe("c@d.com");
			expect(call.urlParams.get("subject")).toBe("test");
			expect(call.urlParams.get("search")).toBe("hello");
			expect(call.urlParams.get("message_id")).toBe("msg-1");
			expect(call.urlParams.get("since")).toBe("2025-01-01T00:00:00Z");
			expect(call.urlParams.get("until")).toBe("2025-12-31T23:59:59Z");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleListEmails({ page: 1, pageSize: 50 });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleGetEmail", () => {
		it("returns email details", async () => {
			mockFetch.mockResolvedValue({ id: "email-1", status: "sent" });
			const result = await handleGetEmail({ email_id: "email-1" });
			const data = JSON.parse(result.content[0].text);
			expect(data.id).toBe("email-1");
		});

		it("returns error on failure", async () => {
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);
			const result = await handleGetEmail({ email_id: "email-1" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateEmail", () => {
		it("sends an email", async () => {
			mockFetch.mockResolvedValue({
				emails: [{ id: "email-new", status: "new" }],
			});
			const result = await handleCreateEmail({
				from: { email: "sender@example.com" },
				to: [{ email: "recipient@example.com" }],
				subject: "Test",
				text: "Hello",
				project_id: "proj-1",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.emails).toHaveLength(1);
		});

		it("sends with HTML body and attachments", async () => {
			mockFetch.mockResolvedValue({ emails: [] });
			await handleCreateEmail({
				from: { email: "s@e.com", name: "Sender" },
				to: [{ email: "r@e.com", name: "Recipient" }],
				subject: "Test",
				html: "<p>Hello</p>",
				project_id: "proj-1",
				attachments: [{ name: "file.txt", type: "text/plain", content: "dGVzdA==" }],
			});
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.html).toBe("<p>Hello</p>");
			expect(body.attachments).toHaveLength(1);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCreateEmail({
				from: { email: "s@e.com" },
				to: [{ email: "r@e.com" }],
				subject: "T",
				project_id: "p",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCancelEmail", () => {
		it("cancels an email", async () => {
			mockFetch.mockResolvedValue({ id: "email-1", status: "canceled" });
			const result = await handleCancelEmail({ email_id: "email-1" });
			const data = JSON.parse(result.content[0].text);
			expect(data.status).toBe("canceled");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCancelEmail({ email_id: "email-1" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// --- Statistics handler ---

	describe("handleGetStatistics", () => {
		it("returns statistics", async () => {
			mockFetch.mockResolvedValue({
				total_count: 100,
				sent_count: 90,
				failed_count: 5,
				canceled_count: 5,
				new_count: 0,
				sending_count: 0,
			});
			const result = await handleGetStatistics({});
			const data = JSON.parse(result.content[0].text);
			expect(data.total_count).toBe(100);
		});

		it("passes all filters", async () => {
			mockFetch.mockResolvedValue({});
			await handleGetStatistics({
				region: "nl-ams",
				project_id: "proj-1",
				domain_id: "dom-1",
				since: "2025-01-01T00:00:00Z",
				until: "2025-12-31T23:59:59Z",
				mail_from: "a@b.com",
			});
			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toBe("/transactional-email/v1alpha1/regions/nl-ams/statistics");
			expect(call.urlParams.get("project_id")).toBe("proj-1");
			expect(call.urlParams.get("domain_id")).toBe("dom-1");
			expect(call.urlParams.get("since")).toBe("2025-01-01T00:00:00Z");
			expect(call.urlParams.get("until")).toBe("2025-12-31T23:59:59Z");
			expect(call.urlParams.get("mail_from")).toBe("a@b.com");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleGetStatistics({});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// --- Webhook handlers ---

	describe("handleListWebhooks", () => {
		it("returns paginated webhooks list", async () => {
			mockFetch.mockResolvedValue({
				webhooks: [{ id: "wh-1", name: "test" }],
				total_count: 1,
			});
			const result = await handleListWebhooks({
				domain_id: "dom-1",
				page: 1,
				pageSize: 50,
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
		});

		it("passes organization_id filter", async () => {
			mockFetch.mockResolvedValue({ webhooks: [], total_count: 0 });
			await handleListWebhooks({
				domain_id: "dom-1",
				organization_id: "org-1",
				region: "nl-ams",
				page: 1,
				pageSize: 50,
			});
			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("domain_id")).toBe("dom-1");
			expect(call.urlParams.get("organization_id")).toBe("org-1");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleListWebhooks({
				domain_id: "dom-1",
				page: 1,
				pageSize: 50,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateWebhook", () => {
		it("creates a webhook", async () => {
			mockFetch.mockResolvedValue({ id: "wh-new", name: "my-webhook" });
			const result = await handleCreateWebhook({
				domain_id: "dom-1",
				name: "my-webhook",
				event_types: ["email_delivered"],
				sns_arn: "arn:scw:sns:fr-par:project-123:my-topic",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.id).toBe("wh-new");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCreateWebhook({
				domain_id: "dom-1",
				name: "w",
				event_types: ["email_delivered"],
				sns_arn: "arn",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpdateWebhook", () => {
		it("updates a webhook", async () => {
			mockFetch.mockResolvedValue({ id: "wh-1", name: "updated" });
			const result = await handleUpdateWebhook({
				webhook_id: "wh-1",
				name: "updated",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.name).toBe("updated");
		});

		it("sends only provided fields", async () => {
			mockFetch.mockResolvedValue({});
			await handleUpdateWebhook({
				webhook_id: "wh-1",
				event_types: ["email_queued", "email_delivered"],
			});
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBeUndefined();
			expect(body.event_types).toEqual(["email_queued", "email_delivered"]);
			expect(body.sns_arn).toBeUndefined();
		});

		it("sends sns_arn when provided", async () => {
			mockFetch.mockResolvedValue({});
			await handleUpdateWebhook({
				webhook_id: "wh-1",
				sns_arn: "arn:new",
			});
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.sns_arn).toBe("arn:new");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateWebhook({ webhook_id: "wh-1" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteWebhook", () => {
		it("deletes a webhook", async () => {
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteWebhook({ webhook_id: "wh-1" });
			const data = JSON.parse(result.content[0].text);
			expect(data.message).toBe("Webhook deleted successfully");
		});

		it("returns error on failure", async () => {
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);
			const result = await handleDeleteWebhook({ webhook_id: "wh-1" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});
});
