import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerMailboxTools } from "../../../src/tools/mailbox/index.js";

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

const DOMAIN_ID = "00000000-0000-0000-0000-0000000000d1";
const MAILBOX_ID = "00000000-0000-0000-0000-0000000000b1";
const ALIAS_ID = "00000000-0000-0000-0000-0000000000a1";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";

function httpError(message: string, statusCode?: number) {
	const err = new Error(message);
	if (statusCode !== undefined) {
		(err as unknown as { statusCode: number }).statusCode = statusCode;
	}
	return err;
}

describe("mailbox module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerMailboxTools(server)).not.toThrow();
	});

	it("registers all 16 mailbox tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerMailboxTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(16);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toEqual([
			"scaleway_mailbox_list_domains",
			"scaleway_mailbox_get_domain",
			"scaleway_mailbox_create_domain",
			"scaleway_mailbox_delete_domain",
			"scaleway_mailbox_get_domain_records",
			"scaleway_mailbox_validate_domain_records",
			"scaleway_mailbox_create_mailboxes",
			"scaleway_mailbox_list_mailboxes",
			"scaleway_mailbox_get_mailbox",
			"scaleway_mailbox_update_mailbox",
			"scaleway_mailbox_delete_mailbox",
			"scaleway_mailbox_restore_mailbox",
			"scaleway_mailbox_create_alias",
			"scaleway_mailbox_list_aliases",
			"scaleway_mailbox_get_alias",
			"scaleway_mailbox_delete_alias",
		]);
	});

	it("invokes handlers through the registered callbacks", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const registered: Record<string, (args: unknown) => Promise<unknown>> = {};
		vi.spyOn(server, "tool").mockImplementation(((
			name: string,
			_desc: string,
			_shape: unknown,
			cb: (args: unknown) => Promise<unknown>,
		) => {
			registered[name] = cb;
			return undefined as never;
		}) as never);
		registerMailboxTools(server);

		mockFetch.mockReset();
		mockFetch.mockResolvedValue({ domains: [], total_count: 0 });
		const result = (await registered.scaleway_mailbox_list_domains({
			page: 1,
			pageSize: 50,
		})) as ErrorResult;
		expect(JSON.parse(result.content[0].text).totalCount).toBe(0);
	});
});

describe("mailbox domain handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListDomains", () => {
		it("returns a paginated list of domains", async () => {
			const { handleListDomains } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({
				domains: [{ id: DOMAIN_ID, name: "example.com" }],
				total_count: 1,
			});

			const result = await handleListDomains({ page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "mailbox/v1alpha1/domains",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes all optional filters including array statuses", async () => {
			const { handleListDomains } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ domains: [], total_count: 0 });

			await handleListDomains({
				page: 2,
				pageSize: 10,
				projectId: PROJECT_ID,
				statuses: ["ready", "creating"],
				search: "example",
				orderBy: "name_asc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("page")).toBe("2");
			expect(callArgs.urlParams.get("page_size")).toBe("10");
			expect(callArgs.urlParams.get("project_id")).toBe(PROJECT_ID);
			expect(callArgs.urlParams.getAll("statuses")).toEqual(["ready", "creating"]);
			expect(callArgs.urlParams.get("search")).toBe("example");
			expect(callArgs.urlParams.get("order_by")).toBe("name_asc");
		});

		it("returns error on failure", async () => {
			const { handleListDomains } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Unauthorized", 401));

			const result: ErrorResult = await handleListDomains({ page: 1, pageSize: 50 });

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleGetDomain", () => {
		it("returns domain details", async () => {
			const { handleGetDomain } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: DOMAIN_ID, name: "example.com" });

			const result = await handleGetDomain({ domainId: DOMAIN_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `mailbox/v1alpha1/domains/${DOMAIN_ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("example.com");
		});

		it("returns error on 404", async () => {
			const { handleGetDomain } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Not found", 404));

			const result: ErrorResult = await handleGetDomain({ domainId: DOMAIN_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleCreateDomain", () => {
		it("creates a domain with a project ID", async () => {
			const { handleCreateDomain } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: DOMAIN_ID, name: "example.com" });

			await handleCreateDomain({ name: "example.com", projectId: PROJECT_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "mailbox/v1alpha1/domains",
				body: JSON.stringify({ name: "example.com", project_id: PROJECT_ID }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("creates a domain without an optional project ID", async () => {
			const { handleCreateDomain } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: DOMAIN_ID, name: "example.com" });

			await handleCreateDomain({ name: "example.com" });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "mailbox/v1alpha1/domains",
				body: JSON.stringify({ name: "example.com" }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateDomain } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Bad request", 400));

			const result: ErrorResult = await handleCreateDomain({ name: "bad" });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleDeleteDomain", () => {
		it("deletes a domain and returns the response", async () => {
			const { handleDeleteDomain } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: DOMAIN_ID, status: "deleting" });

			const result = await handleDeleteDomain({ domainId: DOMAIN_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `mailbox/v1alpha1/domains/${DOMAIN_ID}`,
			});
			expect(JSON.parse(result.content[0].text).status).toBe("deleting");
		});

		it("returns error on failure", async () => {
			const { handleDeleteDomain } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Forbidden", 403));

			const result: ErrorResult = await handleDeleteDomain({ domainId: DOMAIN_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleGetDomainRecords", () => {
		it("returns domain records", async () => {
			const { handleGetDomainRecords } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ mx: { id: "r1" }, spf: null });

			const result = await handleGetDomainRecords({ domainId: DOMAIN_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `mailbox/v1alpha1/domains/${DOMAIN_ID}/records`,
			});
			expect(JSON.parse(result.content[0].text).mx.id).toBe("r1");
		});

		it("returns error on failure", async () => {
			const { handleGetDomainRecords } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Server error"));

			const result: ErrorResult = await handleGetDomainRecords({ domainId: DOMAIN_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("server_error");
		});
	});

	describe("handleValidateDomainRecords", () => {
		it("triggers validation and returns confirmation", async () => {
			const { handleValidateDomainRecords } = await import(
				"../../../src/tools/mailbox/handlers.js"
			);
			mockFetch.mockResolvedValue(undefined);

			const result = await handleValidateDomainRecords({ domainId: DOMAIN_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `mailbox/v1alpha1/domains/${DOMAIN_ID}/validate-records`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.validated).toBe(true);
			expect(parsed.domainId).toBe(DOMAIN_ID);
		});

		it("returns error on failure", async () => {
			const { handleValidateDomainRecords } = await import(
				"../../../src/tools/mailbox/handlers.js"
			);
			mockFetch.mockRejectedValue(httpError("Rate limited", 429));

			const result: ErrorResult = await handleValidateDomainRecords({ domainId: DOMAIN_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("rate_limited");
		});
	});
});

describe("mailbox mailbox handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleCreateMailboxes", () => {
		it("batch-creates mailboxes", async () => {
			const { handleCreateMailboxes } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ mailboxes: [{ id: MAILBOX_ID }] });

			const result = await handleCreateMailboxes({
				domainId: DOMAIN_ID,
				subscriptionPeriod: "monthly",
				mailboxes: [
					{ localPart: "john", password: "s3cret!" },
					{ localPart: "jane", password: "s3cret2!" },
				],
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "mailbox/v1alpha1/batch-create-mailboxes",
				body: JSON.stringify({
					domain_id: DOMAIN_ID,
					subscription_period: "monthly",
					mailboxes: [
						{ local_part: "john", password: "s3cret!" },
						{ local_part: "jane", password: "s3cret2!" },
					],
				}),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).mailboxes[0].id).toBe(MAILBOX_ID);
		});

		it("returns error on failure", async () => {
			const { handleCreateMailboxes } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Bad request", 400));

			const result: ErrorResult = await handleCreateMailboxes({
				domainId: DOMAIN_ID,
				subscriptionPeriod: "yearly",
				mailboxes: [{ localPart: "x", password: "y" }],
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleListMailboxes", () => {
		it("returns paginated mailboxes with default params", async () => {
			const { handleListMailboxes } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({
				mailboxes: [{ id: MAILBOX_ID, email: "john@example.com" }],
				total_count: 1,
			});

			const result = await handleListMailboxes({ page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "mailbox/v1alpha1/mailboxes",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			expect(JSON.parse(result.content[0].text).items[0].email).toBe("john@example.com");
		});

		it("passes all optional filters", async () => {
			const { handleListMailboxes } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ mailboxes: [], total_count: 0 });

			await handleListMailboxes({
				page: 1,
				pageSize: 25,
				domainId: DOMAIN_ID,
				projectId: PROJECT_ID,
				statuses: ["ready"],
				search: "john",
				orderBy: "email_desc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("domain_id")).toBe(DOMAIN_ID);
			expect(callArgs.urlParams.get("project_id")).toBe(PROJECT_ID);
			expect(callArgs.urlParams.getAll("statuses")).toEqual(["ready"]);
			expect(callArgs.urlParams.get("search")).toBe("john");
			expect(callArgs.urlParams.get("order_by")).toBe("email_desc");
		});

		it("returns error on failure", async () => {
			const { handleListMailboxes } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Server error"));

			const result: ErrorResult = await handleListMailboxes({ page: 1, pageSize: 50 });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("server_error");
		});
	});

	describe("handleGetMailbox", () => {
		it("returns mailbox details", async () => {
			const { handleGetMailbox } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: MAILBOX_ID, email: "john@example.com" });

			const result = await handleGetMailbox({ mailboxId: MAILBOX_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `mailbox/v1alpha1/mailboxes/${MAILBOX_ID}`,
			});
			expect(JSON.parse(result.content[0].text).email).toBe("john@example.com");
		});

		it("returns error on failure", async () => {
			const { handleGetMailbox } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Not found", 404));

			const result: ErrorResult = await handleGetMailbox({ mailboxId: MAILBOX_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleUpdateMailbox", () => {
		it("updates both subscription period and password", async () => {
			const { handleUpdateMailbox } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: MAILBOX_ID });

			await handleUpdateMailbox({
				mailboxId: MAILBOX_ID,
				subscriptionPeriod: "yearly",
				newPassword: "n3wp4ss!",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `mailbox/v1alpha1/mailboxes/${MAILBOX_ID}`,
				body: JSON.stringify({ subscription_period: "yearly", new_password: "n3wp4ss!" }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("updates with only a password (subscription branch skipped)", async () => {
			const { handleUpdateMailbox } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: MAILBOX_ID });

			await handleUpdateMailbox({ mailboxId: MAILBOX_ID, newPassword: "n3wp4ss!" });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `mailbox/v1alpha1/mailboxes/${MAILBOX_ID}`,
				body: JSON.stringify({ new_password: "n3wp4ss!" }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("updates with only a subscription period (password branch skipped)", async () => {
			const { handleUpdateMailbox } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: MAILBOX_ID });

			await handleUpdateMailbox({ mailboxId: MAILBOX_ID, subscriptionPeriod: "canceled" });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `mailbox/v1alpha1/mailboxes/${MAILBOX_ID}`,
				body: JSON.stringify({ subscription_period: "canceled" }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends an empty body when no fields are provided", async () => {
			const { handleUpdateMailbox } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: MAILBOX_ID });

			await handleUpdateMailbox({ mailboxId: MAILBOX_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `mailbox/v1alpha1/mailboxes/${MAILBOX_ID}`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateMailbox } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Bad request", 400));

			const result: ErrorResult = await handleUpdateMailbox({ mailboxId: MAILBOX_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleDeleteMailbox", () => {
		it("deletes a mailbox and returns the response", async () => {
			const { handleDeleteMailbox } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: MAILBOX_ID, status: "deletion_scheduled" });

			const result = await handleDeleteMailbox({ mailboxId: MAILBOX_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `mailbox/v1alpha1/mailboxes/${MAILBOX_ID}`,
			});
			expect(JSON.parse(result.content[0].text).status).toBe("deletion_scheduled");
		});

		it("returns error on failure", async () => {
			const { handleDeleteMailbox } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Forbidden", 403));

			const result: ErrorResult = await handleDeleteMailbox({ mailboxId: MAILBOX_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleRestoreMailbox", () => {
		it("restores a mailbox and returns the response", async () => {
			const { handleRestoreMailbox } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: MAILBOX_ID, status: "restoring" });

			const result = await handleRestoreMailbox({ mailboxId: MAILBOX_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `mailbox/v1alpha1/mailboxes/${MAILBOX_ID}/restore`,
			});
			expect(JSON.parse(result.content[0].text).status).toBe("restoring");
		});

		it("returns error on failure", async () => {
			const { handleRestoreMailbox } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Not found", 404));

			const result: ErrorResult = await handleRestoreMailbox({ mailboxId: MAILBOX_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});
});

describe("mailbox alias handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleCreateAlias", () => {
		it("creates an alias with a description", async () => {
			const { handleCreateAlias } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: ALIAS_ID, email: "sales@example.com" });

			await handleCreateAlias({
				mailboxId: MAILBOX_ID,
				localPart: "sales",
				description: "Sales inbox",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "mailbox/v1alpha1/aliases",
				body: JSON.stringify({
					mailbox_id: MAILBOX_ID,
					local_part: "sales",
					description: "Sales inbox",
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("creates an alias without an optional description", async () => {
			const { handleCreateAlias } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: ALIAS_ID });

			await handleCreateAlias({ mailboxId: MAILBOX_ID, localPart: "sales" });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "mailbox/v1alpha1/aliases",
				body: JSON.stringify({ mailbox_id: MAILBOX_ID, local_part: "sales" }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateAlias } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Bad request", 400));

			const result: ErrorResult = await handleCreateAlias({
				mailboxId: MAILBOX_ID,
				localPart: "x",
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleListAliases", () => {
		it("returns paginated aliases with default params", async () => {
			const { handleListAliases } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({
				aliases: [{ id: ALIAS_ID, email: "sales@example.com" }],
				total_count: 1,
			});

			const result = await handleListAliases({ page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "mailbox/v1alpha1/aliases",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			expect(JSON.parse(result.content[0].text).items[0].email).toBe("sales@example.com");
		});

		it("passes all optional filters", async () => {
			const { handleListAliases } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ aliases: [], total_count: 0 });

			await handleListAliases({
				page: 3,
				pageSize: 15,
				mailboxId: MAILBOX_ID,
				projectId: PROJECT_ID,
				status: "ready",
				orderBy: "name_asc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("page")).toBe("3");
			expect(callArgs.urlParams.get("page_size")).toBe("15");
			expect(callArgs.urlParams.get("mailbox_id")).toBe(MAILBOX_ID);
			expect(callArgs.urlParams.get("project_id")).toBe(PROJECT_ID);
			expect(callArgs.urlParams.get("status")).toBe("ready");
			expect(callArgs.urlParams.get("order_by")).toBe("name_asc");
		});

		it("returns error on failure", async () => {
			const { handleListAliases } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Rate limited", 429));

			const result: ErrorResult = await handleListAliases({ page: 1, pageSize: 50 });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("rate_limited");
		});
	});

	describe("handleGetAlias", () => {
		it("returns alias details", async () => {
			const { handleGetAlias } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: ALIAS_ID, email: "sales@example.com" });

			const result = await handleGetAlias({ aliasId: ALIAS_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `mailbox/v1alpha1/aliases/${ALIAS_ID}`,
			});
			expect(JSON.parse(result.content[0].text).email).toBe("sales@example.com");
		});

		it("returns error on failure", async () => {
			const { handleGetAlias } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Not found", 404));

			const result: ErrorResult = await handleGetAlias({ aliasId: ALIAS_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleDeleteAlias", () => {
		it("deletes an alias and returns the response", async () => {
			const { handleDeleteAlias } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockResolvedValue({ id: ALIAS_ID, status: "deleting" });

			const result = await handleDeleteAlias({ aliasId: ALIAS_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `mailbox/v1alpha1/aliases/${ALIAS_ID}`,
			});
			expect(JSON.parse(result.content[0].text).status).toBe("deleting");
		});

		it("returns error on failure", async () => {
			const { handleDeleteAlias } = await import("../../../src/tools/mailbox/handlers.js");
			mockFetch.mockRejectedValue(httpError("Forbidden", 403));

			const result: ErrorResult = await handleDeleteAlias({ aliasId: ALIAS_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});
});
