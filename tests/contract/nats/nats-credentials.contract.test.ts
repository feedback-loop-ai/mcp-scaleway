/**
 * Contract tests for NATS Credentials API
 * Scaleway API: Messaging and Queuing - NATS
 * Spec ref: specs/scaleway-api/ (Messaging & Queuing NATS)
 * Parity: tests/parity-matrix.json -> nats.ListNatsCredentials, nats.GetNatsCredentials,
 *         nats.CreateNatsCredentials, nats.DeleteNatsCredentials
 */
import { describe, expect, it } from "vitest";
import {
	CreateNatsCredentialsParams,
	DeleteNatsCredentialsParams,
	GetNatsCredentialsParams,
	ListNatsCredentialsParams,
	ListNatsCredentialsResponse,
	NatsCredentials,
	NatsCredentialsContent,
} from "../../../src/tools/nats/types.js";

describe("NATS Credentials contract", () => {
	const validCredentials = {
		id: "00000000-0000-0000-0000-000000000020",
		name: "my-creds",
		nats_account_id: "00000000-0000-0000-0000-000000000010",
		created_at: "2025-06-01T12:00:00+00:00",
		updated_at: "2025-06-01T12:30:00+00:00",
		checksum: "sha256:abcdef1234567890",
	};

	describe("NatsCredentials schema", () => {
		it("parses valid credentials", () => {
			const result = NatsCredentials.parse(validCredentials);
			expect(result.id).toBe(validCredentials.id);
			expect(result.name).toBe("my-creds");
			expect(result.nats_account_id).toBe("00000000-0000-0000-0000-000000000010");
			expect(result.checksum).toBe("sha256:abcdef1234567890");
		});

		it("rejects credentials with missing fields", () => {
			const { checksum: _, ...noChecksum } = validCredentials;
			expect(() => NatsCredentials.parse(noChecksum)).toThrow();
		});

		it("rejects invalid uuid for nats_account_id", () => {
			expect(() =>
				NatsCredentials.parse({
					...validCredentials,
					nats_account_id: "not-uuid",
				}),
			).toThrow();
		});
	});

	describe("NatsCredentialsContent schema", () => {
		it("parses credentials with content", () => {
			const withContent = {
				...validCredentials,
				credentials: { content: "-----BEGIN NATS USER JWT-----\n..." },
			};
			const result = NatsCredentialsContent.parse(withContent);
			expect(result.credentials.content).toContain("NATS USER JWT");
		});

		it("rejects missing credentials field", () => {
			expect(() => NatsCredentialsContent.parse(validCredentials)).toThrow();
		});
	});

	describe("ListNatsCredentialsParams", () => {
		it("parses minimal params with defaults", () => {
			const result = ListNatsCredentialsParams.parse({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
			});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
			expect(result.natsAccountId).toBe("00000000-0000-0000-0000-000000000010");
		});

		it("parses with optional orderBy", () => {
			const result = ListNatsCredentialsParams.parse({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
				orderBy: "created_at_desc",
			});
			expect(result.orderBy).toBe("created_at_desc");
		});

		it("rejects invalid natsAccountId", () => {
			expect(() =>
				ListNatsCredentialsParams.parse({
					region: "fr-par",
					natsAccountId: "bad",
				}),
			).toThrow();
		});

		it("rejects invalid orderBy", () => {
			expect(() =>
				ListNatsCredentialsParams.parse({
					region: "fr-par",
					natsAccountId: "00000000-0000-0000-0000-000000000010",
					orderBy: "invalid",
				}),
			).toThrow();
		});
	});

	describe("ListNatsCredentialsResponse", () => {
		it("parses valid response", () => {
			const response = {
				nats_credentials: [validCredentials],
				total_count: 1,
			};
			const result = ListNatsCredentialsResponse.parse(response);
			expect(result.nats_credentials).toHaveLength(1);
			expect(result.total_count).toBe(1);
		});

		it("parses empty response", () => {
			const result = ListNatsCredentialsResponse.parse({
				nats_credentials: [],
				total_count: 0,
			});
			expect(result.nats_credentials).toHaveLength(0);
		});
	});

	describe("GetNatsCredentialsParams", () => {
		it("parses valid params", () => {
			const result = GetNatsCredentialsParams.parse({
				region: "fr-par",
				natsCredentialsId: "00000000-0000-0000-0000-000000000020",
			});
			expect(result.natsCredentialsId).toBe("00000000-0000-0000-0000-000000000020");
		});

		it("rejects invalid uuid", () => {
			expect(() =>
				GetNatsCredentialsParams.parse({
					region: "fr-par",
					natsCredentialsId: "bad",
				}),
			).toThrow();
		});

		it("rejects missing region", () => {
			expect(() =>
				GetNatsCredentialsParams.parse({
					natsCredentialsId: "00000000-0000-0000-0000-000000000020",
				}),
			).toThrow();
		});
	});

	describe("CreateNatsCredentialsParams", () => {
		it("parses valid params", () => {
			const result = CreateNatsCredentialsParams.parse({
				region: "fr-par",
				natsAccountId: "00000000-0000-0000-0000-000000000010",
				name: "new-creds",
			});
			expect(result.natsAccountId).toBe("00000000-0000-0000-0000-000000000010");
			expect(result.name).toBe("new-creds");
		});

		it("rejects empty name", () => {
			expect(() =>
				CreateNatsCredentialsParams.parse({
					region: "fr-par",
					natsAccountId: "00000000-0000-0000-0000-000000000010",
					name: "",
				}),
			).toThrow();
		});

		it("rejects missing natsAccountId", () => {
			expect(() =>
				CreateNatsCredentialsParams.parse({
					region: "fr-par",
					name: "creds",
				}),
			).toThrow();
		});
	});

	describe("DeleteNatsCredentialsParams", () => {
		it("parses valid params", () => {
			const result = DeleteNatsCredentialsParams.parse({
				region: "fr-par",
				natsCredentialsId: "00000000-0000-0000-0000-000000000020",
			});
			expect(result.natsCredentialsId).toBe("00000000-0000-0000-0000-000000000020");
		});

		it("rejects missing natsCredentialsId", () => {
			expect(() => DeleteNatsCredentialsParams.parse({ region: "fr-par" })).toThrow();
		});
	});
});
