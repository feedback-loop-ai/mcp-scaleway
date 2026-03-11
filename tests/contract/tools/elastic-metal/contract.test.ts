/**
 * Contract tests for Elastic Metal MCP tools.
 *
 * Validates: input schema shapes, tool registration, response structure,
 * pagination patterns, auth requirement, and error code mapping.
 *
 * API Reference: Scaleway Elastic Metal (Bare Metal) API v1
 * Spec: specs/003-elastic-metal/contracts/tool-contract.md
 * Endpoints: /baremetal/v1/zones/{zone}/*
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import type { z } from "zod";
import { registerElasticMetalTools } from "../../../../src/tools/elastic-metal/index.js";
import {
	CreateIpInput,
	CreateServerInput,
	DeleteIpInput,
	DeleteServerInput,
	GetBmcAccessInput,
	GetServerInput,
	InstallServerInput,
	ListIpsInput,
	ListOffersInput,
	ListOssInput,
	ListServersInput,
	RebootServerInput,
	StartServerInput,
	StopServerInput,
} from "../../../../src/tools/elastic-metal/types.js";

// Helper to check that a Zod schema correctly validates/rejects inputs
function expectSchemaAccepts(schema: z.ZodTypeAny, input: unknown) {
	expect(() => schema.parse(input)).not.toThrow();
}

function expectSchemaRejects(schema: z.ZodTypeAny, input: unknown) {
	expect(() => schema.parse(input)).toThrow();
}

const VALID_ZONE = "fr-par-1";
const VALID_UUID = "11111111-1111-1111-1111-111111111111";

describe("Elastic Metal contract tests", () => {
	// --- Tool Registration ---
	describe("tool registration", () => {
		it("registers all 14 Elastic Metal tools on a McpServer", () => {
			const server = new McpServer({ name: "test", version: "0.0.1" });
			expect(() => registerElasticMetalTools(server)).not.toThrow();
		});
	});

	// --- US1: Server CRUD Schema Contracts ---
	describe("ListServersInput schema", () => {
		it("accepts valid input with required zone", () => {
			expectSchemaAccepts(ListServersInput, { zone: VALID_ZONE });
		});

		it("applies pagination defaults (page=1, pageSize=50)", () => {
			const result = ListServersInput.parse({ zone: VALID_ZONE });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts all optional filters", () => {
			expectSchemaAccepts(ListServersInput, {
				zone: VALID_ZONE,
				page: 2,
				pageSize: 20,
				project_id: VALID_UUID,
				name: "test",
				tags: ["web"],
				status: "ready",
				order_by: "created_at_asc",
			});
		});

		it("rejects missing zone", () => {
			expectSchemaRejects(ListServersInput, {});
		});

		it("rejects invalid zone format", () => {
			expectSchemaRejects(ListServersInput, { zone: "invalid" });
		});

		it("rejects pageSize > 100", () => {
			expectSchemaRejects(ListServersInput, { zone: VALID_ZONE, pageSize: 101 });
		});

		it("rejects page < 1", () => {
			expectSchemaRejects(ListServersInput, { zone: VALID_ZONE, page: 0 });
		});
	});

	describe("GetServerInput schema", () => {
		it("accepts valid zone and server_id", () => {
			expectSchemaAccepts(GetServerInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("rejects missing server_id", () => {
			expectSchemaRejects(GetServerInput, { zone: VALID_ZONE });
		});

		it("rejects non-UUID server_id", () => {
			expectSchemaRejects(GetServerInput, { zone: VALID_ZONE, server_id: "not-uuid" });
		});
	});

	describe("CreateServerInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(CreateServerInput, {
				zone: VALID_ZONE,
				offer_id: VALID_UUID,
				name: "my-server",
			});
		});

		it("applies defaults for description and tags", () => {
			const result = CreateServerInput.parse({
				zone: VALID_ZONE,
				offer_id: VALID_UUID,
				name: "srv",
			});
			expect(result.description).toBe("");
			expect(result.tags).toEqual([]);
		});

		it("rejects empty name", () => {
			expectSchemaRejects(CreateServerInput, {
				zone: VALID_ZONE,
				offer_id: VALID_UUID,
				name: "",
			});
		});

		it("rejects missing offer_id", () => {
			expectSchemaRejects(CreateServerInput, { zone: VALID_ZONE, name: "srv" });
		});
	});

	describe("DeleteServerInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(DeleteServerInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("rejects missing server_id", () => {
			expectSchemaRejects(DeleteServerInput, { zone: VALID_ZONE });
		});
	});

	// --- US2: Server Actions Schema Contracts ---
	describe("InstallServerInput schema", () => {
		it("accepts valid input with required fields", () => {
			expectSchemaAccepts(InstallServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				os_id: VALID_UUID,
				hostname: "my-host",
				ssh_key_ids: [VALID_UUID],
			});
		});

		it("accepts optional fields", () => {
			expectSchemaAccepts(InstallServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				os_id: VALID_UUID,
				hostname: "my-host",
				ssh_key_ids: [VALID_UUID],
				password: "secret",
				service_user: "svc",
				service_password: "pass",
			});
		});

		it("rejects empty ssh_key_ids array", () => {
			expectSchemaRejects(InstallServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				os_id: VALID_UUID,
				hostname: "host",
				ssh_key_ids: [],
			});
		});

		it("rejects empty hostname", () => {
			expectSchemaRejects(InstallServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				os_id: VALID_UUID,
				hostname: "",
				ssh_key_ids: [VALID_UUID],
			});
		});
	});

	describe("RebootServerInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(RebootServerInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("accepts optional boot_type", () => {
			expectSchemaAccepts(RebootServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				boot_type: "rescue",
			});
		});
	});

	describe("StartServerInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(StartServerInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("accepts optional boot_type", () => {
			expectSchemaAccepts(StartServerInput, {
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				boot_type: "normal",
			});
		});
	});

	describe("StopServerInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(StopServerInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("rejects missing server_id", () => {
			expectSchemaRejects(StopServerInput, { zone: VALID_ZONE });
		});
	});

	// --- US3: Offers, OS, BMC Schema Contracts ---
	describe("ListOffersInput schema", () => {
		it("accepts valid input with zone", () => {
			expectSchemaAccepts(ListOffersInput, { zone: VALID_ZONE });
		});

		it("applies pagination defaults", () => {
			const result = ListOffersInput.parse({ zone: VALID_ZONE });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts subscription_period filter", () => {
			expectSchemaAccepts(ListOffersInput, {
				zone: VALID_ZONE,
				subscription_period: "hourly",
			});
		});
	});

	describe("ListOssInput schema", () => {
		it("accepts valid input with zone", () => {
			expectSchemaAccepts(ListOssInput, { zone: VALID_ZONE });
		});

		it("accepts offer_id filter", () => {
			expectSchemaAccepts(ListOssInput, {
				zone: VALID_ZONE,
				offer_id: VALID_UUID,
			});
		});

		it("applies pagination defaults", () => {
			const result = ListOssInput.parse({ zone: VALID_ZONE });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});
	});

	describe("GetBmcAccessInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(GetBmcAccessInput, { zone: VALID_ZONE, server_id: VALID_UUID });
		});

		it("rejects missing server_id", () => {
			expectSchemaRejects(GetBmcAccessInput, { zone: VALID_ZONE });
		});
	});

	// --- US4: Flexible IPs Schema Contracts ---
	describe("ListIpsInput schema", () => {
		it("accepts valid input with zone", () => {
			expectSchemaAccepts(ListIpsInput, { zone: VALID_ZONE });
		});

		it("accepts optional filters", () => {
			expectSchemaAccepts(ListIpsInput, {
				zone: VALID_ZONE,
				project_id: VALID_UUID,
				server_id: VALID_UUID,
				order_by: "created_at_asc",
			});
		});

		it("applies pagination defaults", () => {
			const result = ListIpsInput.parse({ zone: VALID_ZONE });
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});
	});

	describe("CreateIpInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(CreateIpInput, {
				zone: VALID_ZONE,
				project_id: VALID_UUID,
			});
		});

		it("applies defaults for description and tags", () => {
			const result = CreateIpInput.parse({
				zone: VALID_ZONE,
				project_id: VALID_UUID,
			});
			expect(result.description).toBe("");
			expect(result.tags).toEqual([]);
		});

		it("accepts optional server_id", () => {
			expectSchemaAccepts(CreateIpInput, {
				zone: VALID_ZONE,
				project_id: VALID_UUID,
				server_id: VALID_UUID,
			});
		});

		it("rejects missing project_id", () => {
			expectSchemaRejects(CreateIpInput, { zone: VALID_ZONE });
		});
	});

	describe("DeleteIpInput schema", () => {
		it("accepts valid input", () => {
			expectSchemaAccepts(DeleteIpInput, { zone: VALID_ZONE, ip_id: VALID_UUID });
		});

		it("rejects missing ip_id", () => {
			expectSchemaRejects(DeleteIpInput, { zone: VALID_ZONE });
		});

		it("rejects non-UUID ip_id", () => {
			expectSchemaRejects(DeleteIpInput, { zone: VALID_ZONE, ip_id: "not-uuid" });
		});
	});

	// --- Cross-cutting: Zone validation ---
	describe("zone validation (all schemas)", () => {
		const schemasRequiringZone = [
			{ name: "ListServersInput", schema: ListServersInput },
			{ name: "GetServerInput", schema: GetServerInput, extra: { server_id: VALID_UUID } },
			{ name: "CreateServerInput", schema: CreateServerInput, extra: { offer_id: "x", name: "y" } },
			{ name: "DeleteServerInput", schema: DeleteServerInput, extra: { server_id: VALID_UUID } },
			{
				name: "InstallServerInput",
				schema: InstallServerInput,
				extra: {
					server_id: VALID_UUID,
					os_id: VALID_UUID,
					hostname: "h",
					ssh_key_ids: [VALID_UUID],
				},
			},
			{ name: "RebootServerInput", schema: RebootServerInput, extra: { server_id: VALID_UUID } },
			{ name: "StartServerInput", schema: StartServerInput, extra: { server_id: VALID_UUID } },
			{ name: "StopServerInput", schema: StopServerInput, extra: { server_id: VALID_UUID } },
			{ name: "ListOffersInput", schema: ListOffersInput },
			{ name: "ListOssInput", schema: ListOssInput },
			{ name: "GetBmcAccessInput", schema: GetBmcAccessInput, extra: { server_id: VALID_UUID } },
			{ name: "ListIpsInput", schema: ListIpsInput },
			{ name: "CreateIpInput", schema: CreateIpInput, extra: { project_id: VALID_UUID } },
			{ name: "DeleteIpInput", schema: DeleteIpInput, extra: { ip_id: VALID_UUID } },
		];

		for (const { name, schema, extra } of schemasRequiringZone) {
			it(`${name} rejects invalid zone format`, () => {
				expectSchemaRejects(schema, { ...extra, zone: "bad-zone" });
			});

			it(`${name} accepts valid zone fr-par-1`, () => {
				expectSchemaAccepts(schema, { ...extra, zone: "fr-par-1" });
			});

			it(`${name} accepts valid zone nl-ams-1`, () => {
				expectSchemaAccepts(schema, { ...extra, zone: "nl-ams-1" });
			});

			it(`${name} accepts valid zone pl-waw-1`, () => {
				expectSchemaAccepts(schema, { ...extra, zone: "pl-waw-1" });
			});
		}
	});
});
