/**
 * Contract tests for NATS Accounts API
 * Scaleway API: Messaging and Queuing - NATS
 * Spec ref: specs/scaleway-api/ (Messaging & Queuing NATS)
 * Parity: tests/parity-matrix.json -> nats.ListNatsAccounts, nats.GetNatsAccount,
 *         nats.CreateNatsAccount, nats.UpdateNatsAccount, nats.DeleteNatsAccount
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	CreateNatsAccountParams,
	DeleteNatsAccountParams,
	GetNatsAccountParams,
	ListNatsAccountsParams,
	ListNatsAccountsResponse,
	NatsAccount,
	NatsAccountStatus,
	UpdateNatsAccountParams,
} from "../../../src/tools/nats/types.js";

describe("NATS Accounts contract", () => {
	describe("NatsAccountStatus", () => {
		it("accepts all valid statuses", () => {
			for (const s of ["unknown_status", "ready", "error", "creating", "deleting"]) {
				expect(NatsAccountStatus.parse(s)).toBe(s);
			}
		});

		it("rejects invalid status", () => {
			expect(() => NatsAccountStatus.parse("running")).toThrow();
		});
	});

	describe("NatsAccount schema", () => {
		const validAccount = {
			id: "00000000-0000-0000-0000-000000000010",
			name: "my-nats-account",
			endpoint: "nats://nats.mnq.fr-par.scaleway.com:4222",
			project_id: "00000000-0000-0000-0000-000000000001",
			region: "fr-par",
			status: "ready",
			created_at: "2025-06-01T12:00:00+00:00",
			updated_at: "2025-06-01T12:30:00+00:00",
		};

		it("parses a valid NATS account", () => {
			const result = NatsAccount.parse(validAccount);
			expect(result.id).toBe(validAccount.id);
			expect(result.name).toBe("my-nats-account");
			expect(result.endpoint).toBe(validAccount.endpoint);
			expect(result.status).toBe("ready");
		});

		it("rejects account with missing id", () => {
			const { id: _, ...noId } = validAccount;
			expect(() => NatsAccount.parse(noId)).toThrow();
		});

		it("rejects account with invalid uuid", () => {
			expect(() => NatsAccount.parse({ ...validAccount, id: "not-a-uuid" })).toThrow();
		});

		it("rejects account with invalid datetime", () => {
			expect(() => NatsAccount.parse({ ...validAccount, created_at: "not-a-date" })).toThrow();
		});
	});

	describe("ListNatsAccountsParams", () => {
		it("parses minimal params with defaults", () => {
			const result = ListNatsAccountsParams.parse({ region: "fr-par" });
			expect(result.region).toBe("fr-par");
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("parses with all optional fields", () => {
			const result = ListNatsAccountsParams.parse({
				region: "nl-ams",
				page: 2,
				pageSize: 25,
				projectId: "00000000-0000-0000-0000-000000000001",
				name: "test",
				orderBy: "name_asc",
			});
			expect(result.projectId).toBe("00000000-0000-0000-0000-000000000001");
			expect(result.orderBy).toBe("name_asc");
		});

		it("rejects invalid region format", () => {
			expect(() => ListNatsAccountsParams.parse({ region: "invalid" })).toThrow();
		});

		it("rejects invalid orderBy", () => {
			expect(() =>
				ListNatsAccountsParams.parse({
					region: "fr-par",
					orderBy: "invalid",
				}),
			).toThrow();
		});
	});

	describe("ListNatsAccountsResponse", () => {
		it("parses valid response", () => {
			const response = {
				nats_accounts: [
					{
						id: "00000000-0000-0000-0000-000000000010",
						name: "acct",
						endpoint: "nats://ep:4222",
						project_id: "00000000-0000-0000-0000-000000000001",
						region: "fr-par",
						status: "ready",
						created_at: "2025-01-01T00:00:00+00:00",
						updated_at: "2025-01-01T00:00:00+00:00",
					},
				],
				total_count: 1,
			};
			const result = ListNatsAccountsResponse.parse(response);
			expect(result.nats_accounts).toHaveLength(1);
			expect(result.total_count).toBe(1);
		});

		it("parses empty response", () => {
			const result = ListNatsAccountsResponse.parse({
				nats_accounts: [],
				total_count: 0,
			});
			expect(result.nats_accounts).toHaveLength(0);
		});
	});

	describe("GetNatsAccountParams", () => {
		it("parses valid params", () => {
			const result = GetNatsAccountParams.parse({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
			});
			expect(result.natsAccountId).toBe("00000000-0000-0000-0000-000000000010");
		});

		it("rejects invalid uuid", () => {
			expect(() =>
				GetNatsAccountParams.parse({
					region: "fr-par",
					natsAccountId: "bad",
				}),
			).toThrow();
		});
	});

	describe("CreateNatsAccountParams", () => {
		it("parses with required fields", () => {
			const result = CreateNatsAccountParams.parse({
				region: "fr-par",
				name: "new-account",
			});
			expect(result.name).toBe("new-account");
			expect(result.projectId).toBeUndefined();
		});

		it("parses with optional projectId", () => {
			const result = CreateNatsAccountParams.parse({
				region: "fr-par",
				name: "new-account",
				projectId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.projectId).toBe("00000000-0000-0000-0000-000000000001");
		});

		it("rejects empty name", () => {
			expect(() => CreateNatsAccountParams.parse({ region: "fr-par", name: "" })).toThrow();
		});
	});

	describe("UpdateNatsAccountParams", () => {
		it("parses with name update", () => {
			const result = UpdateNatsAccountParams.parse({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
				name: "updated",
			});
			expect(result.name).toBe("updated");
		});

		it("parses without optional name", () => {
			const result = UpdateNatsAccountParams.parse({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
			});
			expect(result.name).toBeUndefined();
		});
	});

	describe("DeleteNatsAccountParams", () => {
		it("parses valid params", () => {
			const result = DeleteNatsAccountParams.parse({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
			});
			expect(result.natsAccountId).toBe("00000000-0000-0000-0000-000000000010");
		});

		it("rejects missing natsAccountId", () => {
			expect(() => DeleteNatsAccountParams.parse({ region: "fr-par" })).toThrow();
		});
	});
});
