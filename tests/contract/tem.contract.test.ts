/**
 * Contract tests for TEM (Transactional Email) API
 *
 * Validates request/response shapes, pagination, auth, and error codes
 * against the Scaleway TEM v1alpha1 API.
 *
 * API Reference: specs/scaleway-api/tem/api-reference.md
 * Parity Matrix: tests/parity-matrix.json (tem section)
 */
import { createAdvancedClient, withProfile } from "@scaleway/sdk-client";
import { createScalewayClient } from "../../src/shared/client.js";
import * as httpHandlers from "../../src/tools/tem/handlers.js";

import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
	CancelEmailParams,
	CheckDomainParams,
	CreateDomainParams,
	CreateEmailParams,
	CreateWebhookParams,
	DeleteWebhookParams,
	Domain,
	DomainLastStatus,
	DomainStatus,
	Email,
	EmailStatus,
	GetDomainLastStatusParams,
	GetDomainParams,
	GetEmailParams,
	GetStatisticsParams,
	ListDomainsParams,
	ListEmailsParams,
	ListWebhooksParams,
	RevokeDomainParams,
	Statistics,
	UpdateWebhookParams,
	Webhook,
	WebhookEventType,
} from "../../src/tools/tem/types.js";

vi.mock("../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({ defaultRegion: "fr-par" })),
}));
vi.mock("../../src/shared/client.js", () => ({ createScalewayClient: vi.fn() }));

describe("TEM contract tests", () => {
	// --- Domain schemas ---

	describe("Domain schema", () => {
		// API: GET /transactional-email/v1alpha1/regions/{region}/domains/{domain_id}
		it("validates a complete domain response", () => {
			const data = {
				id: "b1e9c4a2-1234-5678-9abc-def012345678",
				name: "example.com",
				region: "fr-par",
				project_id: "proj-123",
				status: "checked",
				created_at: "2025-01-01T00:00:00Z",
				next_check_at: "2025-01-02T00:00:00Z",
				last_valid_at: "2025-01-01T12:00:00Z",
				dkim_config: { public_key: "p=MIG...abc", selector: "scw" },
				spf_config: { is_valid: true },
				statistics: {
					total_count: 100,
					sent_count: 90,
					failed_count: 5,
					canceled_count: 5,
				},
				revoked_at: null,
				last_error: null,
				autoconfig: true,
			};
			expect(() => Domain.parse(data)).not.toThrow();
		});

		it("validates minimal domain response", () => {
			const data = {
				id: "dom-1",
				name: "test.com",
				region: "fr-par",
				project_id: "proj-1",
				status: "unchecked",
			};
			expect(() => Domain.parse(data)).not.toThrow();
		});

		it("rejects domain with invalid status", () => {
			const data = {
				id: "dom-1",
				name: "test.com",
				region: "fr-par",
				project_id: "proj-1",
				status: "bogus",
			};
			expect(() => Domain.parse(data)).toThrow();
		});
	});

	describe("DomainStatus enum", () => {
		it("accepts all valid statuses", () => {
			for (const s of [
				"unknown",
				"checked",
				"unchecked",
				"invalid",
				"locked",
				"revoked",
				"pending",
			]) {
				expect(DomainStatus.parse(s)).toBe(s);
			}
		});

		it("rejects invalid status", () => {
			expect(() => DomainStatus.parse("active")).toThrow();
		});
	});

	describe("ListDomainsParams", () => {
		// API: GET /transactional-email/v1alpha1/regions/{region}/domains
		it("validates with no parameters (defaults)", () => {
			const result = ListDomainsParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("validates with all parameters", () => {
			const params = {
				region: "fr-par",
				project_id: "proj-1",
				status: "checked",
				name: "example.com",
				organization_id: "org-1",
				page: 2,
				pageSize: 25,
			};
			expect(() => ListDomainsParams.parse(params)).not.toThrow();
		});

		it("rejects invalid region format", () => {
			expect(() => ListDomainsParams.parse({ region: "invalid" })).toThrow();
		});

		it("rejects pageSize over 100", () => {
			expect(() => ListDomainsParams.parse({ pageSize: 101 })).toThrow();
		});
	});

	describe("GetDomainParams", () => {
		// API: GET /transactional-email/v1alpha1/regions/{region}/domains/{domain_id}
		it("validates with domain_id", () => {
			expect(() => GetDomainParams.parse({ domain_id: "dom-1" })).not.toThrow();
		});

		it("rejects without domain_id", () => {
			expect(() => GetDomainParams.parse({})).toThrow();
		});
	});

	describe("CreateDomainParams", () => {
		// API: POST /transactional-email/v1alpha1/regions/{region}/domains
		it("validates required fields", () => {
			const params = {
				project_id: "proj-1",
				domain_name: "example.com",
				accept_tos: true,
			};
			expect(() => CreateDomainParams.parse(params)).not.toThrow();
		});

		it("validates with optional fields", () => {
			const params = {
				region: "fr-par",
				project_id: "proj-1",
				domain_name: "example.com",
				accept_tos: true,
				autoconfig: true,
			};
			expect(() => CreateDomainParams.parse(params)).not.toThrow();
		});

		it("rejects without project_id", () => {
			expect(() => CreateDomainParams.parse({ domain_name: "e.com", accept_tos: true })).toThrow();
		});

		it("rejects without domain_name", () => {
			expect(() => CreateDomainParams.parse({ project_id: "p", accept_tos: true })).toThrow();
		});

		it("rejects without accept_tos", () => {
			expect(() => CreateDomainParams.parse({ project_id: "p", domain_name: "e.com" })).toThrow();
		});
	});

	describe("RevokeDomainParams", () => {
		// API: POST /transactional-email/v1alpha1/regions/{region}/domains/{domain_id}/revoke
		it("validates with domain_id", () => {
			expect(() => RevokeDomainParams.parse({ domain_id: "dom-1" })).not.toThrow();
		});
	});

	describe("CheckDomainParams", () => {
		// API: POST /transactional-email/v1alpha1/regions/{region}/domains/{domain_id}/check
		it("validates with domain_id", () => {
			expect(() => CheckDomainParams.parse({ domain_id: "dom-1" })).not.toThrow();
		});
	});

	describe("DomainLastStatus schema", () => {
		// API: GET /transactional-email/v1alpha1/regions/{region}/domains/{domain_id}/verification
		it("validates complete response", () => {
			const data = {
				domain_id: "dom-1",
				spf_record: { status: "valid", value: "v=spf1 include:..." },
				dkim_record: { status: "valid", value: "v=DKIM1;..." },
				dmarc_record: { status: "not_found" },
			};
			expect(() => DomainLastStatus.parse(data)).not.toThrow();
		});

		it("validates minimal response", () => {
			const data = { domain_id: "dom-1" };
			expect(() => DomainLastStatus.parse(data)).not.toThrow();
		});
	});

	describe("GetDomainLastStatusParams", () => {
		it("validates with domain_id", () => {
			expect(() => GetDomainLastStatusParams.parse({ domain_id: "dom-1" })).not.toThrow();
		});

		it("rejects without domain_id", () => {
			expect(() => GetDomainLastStatusParams.parse({})).toThrow();
		});
	});

	// --- Email schemas ---

	describe("Email schema", () => {
		// API: GET /transactional-email/v1alpha1/regions/{region}/emails/{email_id}
		it("validates a complete email response", () => {
			const data = {
				id: "email-1",
				message_id: "<msg@example.com>",
				project_id: "proj-1",
				status: "sent",
				created_at: "2025-01-01T00:00:00Z",
				updated_at: "2025-01-01T00:01:00Z",
				mail_from: "sender@example.com",
				rcpt_to: "recipient@example.com",
				subject: "Test email",
				try_count: 1,
				last_tries: [
					{
						rank: 1,
						tried_at: "2025-01-01T00:00:30Z",
						code: 250,
						message: "OK",
					},
				],
			};
			expect(() => Email.parse(data)).not.toThrow();
		});

		it("validates minimal email response", () => {
			const data = {
				id: "email-1",
				project_id: "proj-1",
				status: "new",
				mail_from: "s@e.com",
			};
			expect(() => Email.parse(data)).not.toThrow();
		});

		it("rejects email with invalid status", () => {
			const data = {
				id: "email-1",
				project_id: "proj-1",
				status: "delivered",
				mail_from: "s@e.com",
			};
			expect(() => Email.parse(data)).toThrow();
		});
	});

	describe("EmailStatus enum", () => {
		it("accepts all valid statuses", () => {
			for (const s of ["unknown", "new", "sending", "sent", "failed", "canceled"]) {
				expect(EmailStatus.parse(s)).toBe(s);
			}
		});

		it("rejects invalid status", () => {
			expect(() => EmailStatus.parse("delivered")).toThrow();
		});
	});

	describe("ListEmailsParams", () => {
		// API: GET /transactional-email/v1alpha1/regions/{region}/emails
		it("validates with no parameters (defaults)", () => {
			const result = ListEmailsParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("validates with all parameters", () => {
			const params = {
				region: "fr-par",
				project_id: "proj-1",
				domain_id: "dom-1",
				status: "sent",
				mail_from: "a@b.com",
				mail_to: "c@d.com",
				subject: "Test",
				search: "hello",
				message_id: "msg-1",
				since: "2025-01-01T00:00:00Z",
				until: "2025-12-31T23:59:59Z",
				page: 2,
				pageSize: 25,
			};
			expect(() => ListEmailsParams.parse(params)).not.toThrow();
		});
	});

	describe("GetEmailParams", () => {
		it("validates with email_id", () => {
			expect(() => GetEmailParams.parse({ email_id: "email-1" })).not.toThrow();
		});

		it("rejects without email_id", () => {
			expect(() => GetEmailParams.parse({})).toThrow();
		});
	});

	describe("CreateEmailParams", () => {
		// API: POST /transactional-email/v1alpha1/regions/{region}/emails
		it("validates with required fields", () => {
			const params = {
				from: { email: "sender@example.com" },
				to: [{ email: "recipient@example.com" }],
				subject: "Test",
				project_id: "proj-1",
			};
			expect(() => CreateEmailParams.parse(params)).not.toThrow();
		});

		it("validates with all optional fields", () => {
			const params = {
				region: "fr-par",
				from: { email: "s@e.com", name: "Sender" },
				to: [{ email: "r@e.com", name: "Recipient" }],
				subject: "Test",
				text: "Hello",
				html: "<p>Hello</p>",
				project_id: "proj-1",
				attachments: [{ name: "f.txt", type: "text/plain", content: "dGVzdA==" }],
			};
			expect(() => CreateEmailParams.parse(params)).not.toThrow();
		});

		it("rejects empty to array", () => {
			expect(() =>
				CreateEmailParams.parse({
					from: { email: "s@e.com" },
					to: [],
					subject: "T",
					project_id: "p",
				}),
			).toThrow();
		});

		it("rejects without from", () => {
			expect(() =>
				CreateEmailParams.parse({
					to: [{ email: "r@e.com" }],
					subject: "T",
					project_id: "p",
				}),
			).toThrow();
		});
	});

	describe("CancelEmailParams", () => {
		// API: POST /transactional-email/v1alpha1/regions/{region}/emails/{email_id}/cancel
		it("validates with email_id", () => {
			expect(() => CancelEmailParams.parse({ email_id: "email-1" })).not.toThrow();
		});

		it("rejects without email_id", () => {
			expect(() => CancelEmailParams.parse({})).toThrow();
		});
	});

	// --- Statistics schemas ---

	describe("Statistics schema", () => {
		// API: GET /transactional-email/v1alpha1/regions/{region}/statistics
		it("validates a complete statistics response", () => {
			const data = {
				total_count: 100,
				new_count: 5,
				sending_count: 3,
				sent_count: 85,
				failed_count: 4,
				canceled_count: 3,
			};
			expect(() => Statistics.parse(data)).not.toThrow();
		});

		it("rejects missing fields", () => {
			expect(() => Statistics.parse({ total_count: 100 })).toThrow();
		});
	});

	describe("GetStatisticsParams", () => {
		it("validates with no parameters", () => {
			expect(() => GetStatisticsParams.parse({})).not.toThrow();
		});

		it("validates with all parameters", () => {
			const params = {
				region: "fr-par",
				project_id: "proj-1",
				domain_id: "dom-1",
				since: "2025-01-01T00:00:00Z",
				until: "2025-12-31T23:59:59Z",
				mail_from: "a@b.com",
			};
			expect(() => GetStatisticsParams.parse(params)).not.toThrow();
		});
	});

	// --- Webhook schemas ---

	describe("Webhook schema", () => {
		// API: GET/POST /transactional-email/v1alpha1/regions/{region}/webhooks
		it("validates a complete webhook response", () => {
			const data = {
				id: "wh-1",
				domain_id: "dom-1",
				name: "my-webhook",
				event_types: ["email_delivered", "email_dropped"],
				sns_arn: "arn:scw:sns:fr-par:project-123:my-topic",
				created_at: "2025-01-01T00:00:00Z",
				updated_at: "2025-01-02T00:00:00Z",
			};
			expect(() => Webhook.parse(data)).not.toThrow();
		});

		it("validates minimal webhook response", () => {
			const data = {
				id: "wh-1",
				domain_id: "dom-1",
				name: "test",
				event_types: ["email_queued"],
				sns_arn: "arn:test",
			};
			expect(() => Webhook.parse(data)).not.toThrow();
		});

		it("rejects webhook with invalid event type", () => {
			const data = {
				id: "wh-1",
				domain_id: "dom-1",
				name: "test",
				event_types: ["invalid_event"],
				sns_arn: "arn:test",
			};
			expect(() => Webhook.parse(data)).toThrow();
		});
	});

	describe("WebhookEventType enum", () => {
		it("accepts all valid event types", () => {
			for (const e of [
				"unknown_type",
				"email_queued",
				"email_dropped",
				"email_deferred",
				"email_delivered",
				"email_spam",
				"email_mailbox_not_found",
			]) {
				expect(WebhookEventType.parse(e)).toBe(e);
			}
		});

		it("rejects invalid event type", () => {
			expect(() => WebhookEventType.parse("email_bounced")).toThrow();
		});
	});

	describe("ListWebhooksParams", () => {
		// API: GET /transactional-email/v1alpha1/regions/{region}/webhooks
		it("validates with required domain_id", () => {
			const result = ListWebhooksParams.parse({ domain_id: "dom-1" });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("rejects without domain_id", () => {
			expect(() => ListWebhooksParams.parse({})).toThrow();
		});

		it("validates with all parameters", () => {
			const params = {
				region: "fr-par",
				domain_id: "dom-1",
				organization_id: "org-1",
				page: 2,
				pageSize: 10,
			};
			expect(() => ListWebhooksParams.parse(params)).not.toThrow();
		});
	});

	describe("CreateWebhookParams", () => {
		// API: POST /transactional-email/v1alpha1/regions/{region}/webhooks
		it("validates with required fields", () => {
			const params = {
				domain_id: "dom-1",
				name: "my-webhook",
				event_types: ["email_delivered"],
				sns_arn: "arn:scw:sns:fr-par:project-123:topic",
			};
			expect(() => CreateWebhookParams.parse(params)).not.toThrow();
		});

		it("rejects empty event_types", () => {
			expect(() =>
				CreateWebhookParams.parse({
					domain_id: "dom-1",
					name: "w",
					event_types: [],
					sns_arn: "arn",
				}),
			).toThrow();
		});

		it("rejects without domain_id", () => {
			expect(() =>
				CreateWebhookParams.parse({
					name: "w",
					event_types: ["email_delivered"],
					sns_arn: "arn",
				}),
			).toThrow();
		});
	});

	describe("UpdateWebhookParams", () => {
		// API: PATCH /transactional-email/v1alpha1/regions/{region}/webhooks/{webhook_id}
		it("validates with webhook_id only", () => {
			expect(() => UpdateWebhookParams.parse({ webhook_id: "wh-1" })).not.toThrow();
		});

		it("validates with all optional fields", () => {
			const params = {
				region: "fr-par",
				webhook_id: "wh-1",
				name: "updated",
				event_types: ["email_queued"],
				sns_arn: "arn:new",
			};
			expect(() => UpdateWebhookParams.parse(params)).not.toThrow();
		});

		it("rejects without webhook_id", () => {
			expect(() => UpdateWebhookParams.parse({ name: "test" })).toThrow();
		});
	});

	describe("DeleteWebhookParams", () => {
		// API: DELETE /transactional-email/v1alpha1/regions/{region}/webhooks/{webhook_id}
		it("validates with webhook_id", () => {
			expect(() => DeleteWebhookParams.parse({ webhook_id: "wh-1" })).not.toThrow();
		});

		it("rejects without webhook_id", () => {
			expect(() => DeleteWebhookParams.parse({})).toThrow();
		});
	});

	// --- Auth and error contract ---

	describe("Auth contract", () => {
		it("all param schemas accept optional region for regional API", () => {
			// TEM is a regional API; all params should accept optional region
			const schemas = [
				ListDomainsParams,
				GetDomainParams,
				CreateDomainParams,
				RevokeDomainParams,
				CheckDomainParams,
				GetDomainLastStatusParams,
				ListEmailsParams,
				GetEmailParams,
				CreateEmailParams,
				CancelEmailParams,
				GetStatisticsParams,
				ListWebhooksParams,
				CreateWebhookParams,
				UpdateWebhookParams,
				DeleteWebhookParams,
			];

			for (const schema of schemas) {
				const shape = schema.shape;
				expect(shape.region).toBeDefined();
				// Region should be optional
				expect(shape.region.isOptional()).toBe(true);
			}
		});
	});

	describe("Pagination contract", () => {
		it("list endpoints support page and pageSize", () => {
			const listSchemas = [ListDomainsParams, ListEmailsParams, ListWebhooksParams];

			for (const schema of listSchemas) {
				const shape = schema.shape;
				expect(shape.page).toBeDefined();
				expect(shape.pageSize).toBeDefined();
			}
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
		vi.mocked(createScalewayClient).mockReturnValue(client);
		return { client, requests };
	}

	const jsonCases = [
		{
			name: "CreateDomain",
			method: "POST",
			path: "/transactional-email/v1alpha1/regions/fr-par/domains",
			call: () =>
				httpHandlers.handleCreateDomain({
					region: "fr-par",
					project_id: "11111111-1111-1111-1111-111111111111",
					domain_name: "example.test",
					accept_tos: true,
					autoconfig: false,
				}),
			body: {
				project_id: "11111111-1111-1111-1111-111111111111",
				domain_name: "example.test",
				accept_tos: true,
				autoconfig: false,
			},
		},
		{
			name: "CreateEmail",
			method: "POST",
			path: "/transactional-email/v1alpha1/regions/fr-par/emails",
			call: () =>
				httpHandlers.handleCreateEmail({
					region: "fr-par",
					project_id: "11111111-1111-1111-1111-111111111111",
					from: { email: "sender@example.test", name: "Sender" },
					to: [{ email: "recipient@example.test", name: "Recipient" }],
					subject: "test",
					text: "test",
					attachments: [],
				}),
			body: {
				project_id: "11111111-1111-1111-1111-111111111111",
				from: { email: "sender@example.test", name: "Sender" },
				to: [{ email: "recipient@example.test", name: "Recipient" }],
				subject: "test",
				text: "test",
				attachments: [],
			},
		},
		{
			name: "CreateWebhook",
			method: "POST",
			path: "/transactional-email/v1alpha1/regions/fr-par/webhooks",
			call: () =>
				httpHandlers.handleCreateWebhook({
					region: "fr-par",
					domain_id: "11111111-1111-1111-1111-111111111111",
					name: "test",
					event_types: ["email_delivered"],
					sns_arn: "arn:test",
				}),
			body: {
				domain_id: "11111111-1111-1111-1111-111111111111",
				name: "test",
				event_types: ["email_delivered"],
				sns_arn: "arn:test",
			},
		},
		{
			name: "UpdateWebhook",
			method: "PATCH",
			path: "/transactional-email/v1alpha1/regions/fr-par/webhooks/11111111-1111-1111-1111-111111111111",
			call: () =>
				httpHandlers.handleUpdateWebhook({
					region: "fr-par",
					webhook_id: "11111111-1111-1111-1111-111111111111",
					name: "",
					event_types: [],
					sns_arn: "",
				}),
			body: { name: "", event_types: [], sns_arn: "" },
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
});
