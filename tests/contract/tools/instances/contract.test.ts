import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { registerInstancesTools } from "../../../../src/tools/instances/index.js";
import {
	AttachIpInput,
	CreateIpInput,
	CreateSecurityGroupInput,
	CreateServerInput,
	CreateSnapshotInput,
	CreateVolumeInput,
	DeleteIpInput,
	DeleteSecurityGroupInput,
	DeleteServerInput,
	DeleteSnapshotInput,
	DeleteVolumeInput,
	GetSecurityGroupInput,
	GetServerInput,
	GetVolumeInput,
	ListIpsInput,
	ListSecurityGroupsInput,
	ListServersInput,
	ListSnapshotsInput,
	ListVolumesInput,
	ServerActionInput,
} from "../../../../src/tools/instances/types.js";

/**
 * Contract tests for Scaleway Instances MCP Tools.
 *
 * These tests validate:
 * - Input schema shapes (required fields, optional fields, types, constraints)
 * - Tool registration with MCP server
 * - Zod schema validation (accept valid, reject invalid)
 *
 * API Reference: specs/scaleway-api/ (Instances)
 * Parity Matrix: tests/parity-matrix.json
 */

const VALID_ZONE = "fr-par-1";
const VALID_UUID = "00000000-0000-0000-0000-000000000001";

describe("instances contract tests", () => {
	// ── Tool Registration ──

	describe("tool registration", () => {
		it("registers all 20 instance tools on the MCP server", () => {
			const server = new McpServer({ name: "test", version: "0.0.1" });
			const toolSpy = vi.spyOn(server, "tool");

			registerInstancesTools(server);

			expect(toolSpy).toHaveBeenCalledTimes(20);

			const toolNames = toolSpy.mock.calls.map((call) => call[0]);
			expect(toolNames).toContain("scaleway_instances_list_servers");
			expect(toolNames).toContain("scaleway_instances_get_server");
			expect(toolNames).toContain("scaleway_instances_create_server");
			expect(toolNames).toContain("scaleway_instances_delete_server");
			expect(toolNames).toContain("scaleway_instances_server_action");
			expect(toolNames).toContain("scaleway_instances_list_volumes");
			expect(toolNames).toContain("scaleway_instances_get_volume");
			expect(toolNames).toContain("scaleway_instances_create_volume");
			expect(toolNames).toContain("scaleway_instances_delete_volume");
			expect(toolNames).toContain("scaleway_instances_list_security_groups");
			expect(toolNames).toContain("scaleway_instances_get_security_group");
			expect(toolNames).toContain("scaleway_instances_create_security_group");
			expect(toolNames).toContain("scaleway_instances_delete_security_group");
			expect(toolNames).toContain("scaleway_instances_list_ips");
			expect(toolNames).toContain("scaleway_instances_create_ip");
			expect(toolNames).toContain("scaleway_instances_delete_ip");
			expect(toolNames).toContain("scaleway_instances_attach_ip");
			expect(toolNames).toContain("scaleway_instances_list_snapshots");
			expect(toolNames).toContain("scaleway_instances_create_snapshot");
			expect(toolNames).toContain("scaleway_instances_delete_snapshot");

			vi.restoreAllMocks();
		});
	});

	// ── Server Schema Contracts ──
	// API: GET /instance/v1/zones/{zone}/servers

	describe("ListServersInput schema", () => {
		it("accepts valid input with required fields only", () => {
			const result = ListServersInput.safeParse({ zone: VALID_ZONE });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.page).toBe(1);
				expect(result.data.page_size).toBe(50);
			}
		});

		it("accepts valid input with all optional fields", () => {
			const result = ListServersInput.safeParse({
				zone: VALID_ZONE,
				page: 2,
				page_size: 25,
				project: VALID_UUID,
				name: "test",
				tags: ["web"],
				state: "running",
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid zone format", () => {
			const result = ListServersInput.safeParse({ zone: "invalid" });
			expect(result.success).toBe(false);
		});

		it("rejects invalid state value", () => {
			const result = ListServersInput.safeParse({
				zone: VALID_ZONE,
				state: "unknown_state",
			});
			expect(result.success).toBe(false);
		});

		it("rejects page_size > 100", () => {
			const result = ListServersInput.safeParse({
				zone: VALID_ZONE,
				page_size: 101,
			});
			expect(result.success).toBe(false);
		});

		it("rejects page < 1", () => {
			const result = ListServersInput.safeParse({ zone: VALID_ZONE, page: 0 });
			expect(result.success).toBe(false);
		});
	});

	// API: GET /instance/v1/zones/{zone}/servers/{server_id}

	describe("GetServerInput schema", () => {
		it("accepts valid input", () => {
			const result = GetServerInput.safeParse({
				zone: VALID_ZONE,
				server_id: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});

		it("rejects missing server_id", () => {
			const result = GetServerInput.safeParse({ zone: VALID_ZONE });
			expect(result.success).toBe(false);
		});

		it("rejects invalid server_id format", () => {
			const result = GetServerInput.safeParse({
				zone: VALID_ZONE,
				server_id: "not-a-uuid",
			});
			expect(result.success).toBe(false);
		});
	});

	// API: POST /instance/v1/zones/{zone}/servers

	describe("CreateServerInput schema", () => {
		it("accepts valid input with required fields", () => {
			const result = CreateServerInput.safeParse({
				zone: VALID_ZONE,
				name: "my-server",
				commercial_type: "DEV1-S",
				image: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});

		it("accepts valid input with all optional fields", () => {
			const result = CreateServerInput.safeParse({
				zone: VALID_ZONE,
				name: "my-server",
				commercial_type: "DEV1-S",
				image: VALID_UUID,
				project: VALID_UUID,
				tags: ["web", "prod"],
				dynamic_ip_required: true,
			});
			expect(result.success).toBe(true);
		});

		it("rejects empty name", () => {
			const result = CreateServerInput.safeParse({
				zone: VALID_ZONE,
				name: "",
				commercial_type: "DEV1-S",
				image: VALID_UUID,
			});
			expect(result.success).toBe(false);
		});

		it("rejects missing commercial_type", () => {
			const result = CreateServerInput.safeParse({
				zone: VALID_ZONE,
				name: "srv",
				image: VALID_UUID,
			});
			expect(result.success).toBe(false);
		});

		it("rejects invalid image UUID", () => {
			const result = CreateServerInput.safeParse({
				zone: VALID_ZONE,
				name: "srv",
				commercial_type: "DEV1-S",
				image: "not-uuid",
			});
			expect(result.success).toBe(false);
		});
	});

	// API: DELETE /instance/v1/zones/{zone}/servers/{server_id}

	describe("DeleteServerInput schema", () => {
		it("accepts valid input", () => {
			const result = DeleteServerInput.safeParse({
				zone: VALID_ZONE,
				server_id: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});

		it("rejects missing zone", () => {
			const result = DeleteServerInput.safeParse({ server_id: VALID_UUID });
			expect(result.success).toBe(false);
		});
	});

	// API: POST /instance/v1/zones/{zone}/servers/{server_id}/action

	describe("ServerActionInput schema", () => {
		it("accepts all valid actions", () => {
			const actions = [
				"poweron",
				"poweroff",
				"reboot",
				"terminate",
				"stop_in_place",
				"backup",
			] as const;

			for (const action of actions) {
				const result = ServerActionInput.safeParse({
					zone: VALID_ZONE,
					server_id: VALID_UUID,
					action,
				});
				expect(result.success).toBe(true);
			}
		});

		it("rejects invalid action", () => {
			const result = ServerActionInput.safeParse({
				zone: VALID_ZONE,
				server_id: VALID_UUID,
				action: "destroy",
			});
			expect(result.success).toBe(false);
		});

		it("rejects missing action", () => {
			const result = ServerActionInput.safeParse({
				zone: VALID_ZONE,
				server_id: VALID_UUID,
			});
			expect(result.success).toBe(false);
		});
	});

	// ── Volume Schema Contracts ──
	// API: GET /instance/v1/zones/{zone}/volumes

	describe("ListVolumesInput schema", () => {
		it("accepts valid input with required fields only", () => {
			const result = ListVolumesInput.safeParse({ zone: VALID_ZONE });
			expect(result.success).toBe(true);
		});

		it("accepts valid input with optional filters", () => {
			const result = ListVolumesInput.safeParse({
				zone: VALID_ZONE,
				name: "vol",
				volume_type: "b_ssd",
				project: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid volume_type", () => {
			const result = ListVolumesInput.safeParse({
				zone: VALID_ZONE,
				volume_type: "hdd",
			});
			expect(result.success).toBe(false);
		});
	});

	// API: GET /instance/v1/zones/{zone}/volumes/{volume_id}

	describe("GetVolumeInput schema", () => {
		it("accepts valid input", () => {
			const result = GetVolumeInput.safeParse({
				zone: VALID_ZONE,
				volume_id: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid volume_id", () => {
			const result = GetVolumeInput.safeParse({
				zone: VALID_ZONE,
				volume_id: "bad",
			});
			expect(result.success).toBe(false);
		});
	});

	// API: POST /instance/v1/zones/{zone}/volumes

	describe("CreateVolumeInput schema", () => {
		it("accepts valid input", () => {
			const result = CreateVolumeInput.safeParse({
				zone: VALID_ZONE,
				name: "vol1",
				size: 20000000000,
				volume_type: "b_ssd",
			});
			expect(result.success).toBe(true);
		});

		it("accepts with optional fields", () => {
			const result = CreateVolumeInput.safeParse({
				zone: VALID_ZONE,
				name: "vol1",
				size: 20000000000,
				volume_type: "l_ssd",
				project: VALID_UUID,
				tags: ["data"],
			});
			expect(result.success).toBe(true);
		});

		it("rejects negative size", () => {
			const result = CreateVolumeInput.safeParse({
				zone: VALID_ZONE,
				name: "vol1",
				size: -1,
				volume_type: "b_ssd",
			});
			expect(result.success).toBe(false);
		});

		it("rejects missing name", () => {
			const result = CreateVolumeInput.safeParse({
				zone: VALID_ZONE,
				size: 20000000000,
				volume_type: "b_ssd",
			});
			expect(result.success).toBe(false);
		});
	});

	// API: DELETE /instance/v1/zones/{zone}/volumes/{volume_id}

	describe("DeleteVolumeInput schema", () => {
		it("accepts valid input", () => {
			const result = DeleteVolumeInput.safeParse({
				zone: VALID_ZONE,
				volume_id: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});
	});

	// ── Security Group Schema Contracts ──
	// API: GET /instance/v1/zones/{zone}/security_groups

	describe("ListSecurityGroupsInput schema", () => {
		it("accepts valid input", () => {
			const result = ListSecurityGroupsInput.safeParse({ zone: VALID_ZONE });
			expect(result.success).toBe(true);
		});

		it("accepts with optional filters", () => {
			const result = ListSecurityGroupsInput.safeParse({
				zone: VALID_ZONE,
				name: "sg",
				project: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});
	});

	// API: GET /instance/v1/zones/{zone}/security_groups/{security_group_id}

	describe("GetSecurityGroupInput schema", () => {
		it("accepts valid input", () => {
			const result = GetSecurityGroupInput.safeParse({
				zone: VALID_ZONE,
				security_group_id: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid security_group_id", () => {
			const result = GetSecurityGroupInput.safeParse({
				zone: VALID_ZONE,
				security_group_id: "bad",
			});
			expect(result.success).toBe(false);
		});
	});

	// API: POST /instance/v1/zones/{zone}/security_groups

	describe("CreateSecurityGroupInput schema", () => {
		it("accepts valid input with defaults", () => {
			const result = CreateSecurityGroupInput.safeParse({
				zone: VALID_ZONE,
				name: "sg1",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.inbound_default_policy).toBe("accept");
				expect(result.data.outbound_default_policy).toBe("accept");
				expect(result.data.stateful).toBe(true);
			}
		});

		it("accepts custom policies", () => {
			const result = CreateSecurityGroupInput.safeParse({
				zone: VALID_ZONE,
				name: "sg1",
				inbound_default_policy: "drop",
				outbound_default_policy: "drop",
				stateful: false,
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid policy", () => {
			const result = CreateSecurityGroupInput.safeParse({
				zone: VALID_ZONE,
				name: "sg1",
				inbound_default_policy: "reject",
			});
			expect(result.success).toBe(false);
		});
	});

	// API: DELETE /instance/v1/zones/{zone}/security_groups/{security_group_id}

	describe("DeleteSecurityGroupInput schema", () => {
		it("accepts valid input", () => {
			const result = DeleteSecurityGroupInput.safeParse({
				zone: VALID_ZONE,
				security_group_id: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});
	});

	// ── IP Schema Contracts ──
	// API: GET /instance/v1/zones/{zone}/ips

	describe("ListIpsInput schema", () => {
		it("accepts valid input", () => {
			const result = ListIpsInput.safeParse({ zone: VALID_ZONE });
			expect(result.success).toBe(true);
		});

		it("accepts with optional type filter", () => {
			const result = ListIpsInput.safeParse({
				zone: VALID_ZONE,
				type: "routed_ipv4",
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid IP type", () => {
			const result = ListIpsInput.safeParse({
				zone: VALID_ZONE,
				type: "static",
			});
			expect(result.success).toBe(false);
		});
	});

	// API: POST /instance/v1/zones/{zone}/ips

	describe("CreateIpInput schema", () => {
		it("accepts valid input with defaults", () => {
			const result = CreateIpInput.safeParse({ zone: VALID_ZONE });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.type).toBe("routed_ipv4");
			}
		});

		it("accepts routed_ipv6 type", () => {
			const result = CreateIpInput.safeParse({
				zone: VALID_ZONE,
				type: "routed_ipv6",
			});
			expect(result.success).toBe(true);
		});

		it("accepts with server attachment", () => {
			const result = CreateIpInput.safeParse({
				zone: VALID_ZONE,
				server: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});
	});

	// API: DELETE /instance/v1/zones/{zone}/ips/{ip_id}

	describe("DeleteIpInput schema", () => {
		it("accepts valid input", () => {
			const result = DeleteIpInput.safeParse({
				zone: VALID_ZONE,
				ip_id: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid ip_id", () => {
			const result = DeleteIpInput.safeParse({
				zone: VALID_ZONE,
				ip_id: "bad",
			});
			expect(result.success).toBe(false);
		});
	});

	// API: PATCH /instance/v1/zones/{zone}/ips/{ip_id}

	describe("AttachIpInput schema", () => {
		it("accepts valid input", () => {
			const result = AttachIpInput.safeParse({
				zone: VALID_ZONE,
				ip_id: VALID_UUID,
				server_id: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});

		it("rejects missing server_id", () => {
			const result = AttachIpInput.safeParse({
				zone: VALID_ZONE,
				ip_id: VALID_UUID,
			});
			expect(result.success).toBe(false);
		});
	});

	// ── Snapshot Schema Contracts ──
	// API: GET /instance/v1/zones/{zone}/snapshots

	describe("ListSnapshotsInput schema", () => {
		it("accepts valid input", () => {
			const result = ListSnapshotsInput.safeParse({ zone: VALID_ZONE });
			expect(result.success).toBe(true);
		});

		it("accepts with optional filters", () => {
			const result = ListSnapshotsInput.safeParse({
				zone: VALID_ZONE,
				name: "snap",
				project: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});
	});

	// API: POST /instance/v1/zones/{zone}/snapshots

	describe("CreateSnapshotInput schema", () => {
		it("accepts valid input", () => {
			const result = CreateSnapshotInput.safeParse({
				zone: VALID_ZONE,
				name: "snap1",
				volume_id: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});

		it("accepts with optional fields", () => {
			const result = CreateSnapshotInput.safeParse({
				zone: VALID_ZONE,
				name: "snap1",
				volume_id: VALID_UUID,
				project: VALID_UUID,
				tags: ["backup"],
			});
			expect(result.success).toBe(true);
		});

		it("rejects missing volume_id", () => {
			const result = CreateSnapshotInput.safeParse({
				zone: VALID_ZONE,
				name: "snap1",
			});
			expect(result.success).toBe(false);
		});

		it("rejects empty name", () => {
			const result = CreateSnapshotInput.safeParse({
				zone: VALID_ZONE,
				name: "",
				volume_id: VALID_UUID,
			});
			expect(result.success).toBe(false);
		});
	});

	// API: DELETE /instance/v1/zones/{zone}/snapshots/{snapshot_id}

	describe("DeleteSnapshotInput schema", () => {
		it("accepts valid input", () => {
			const result = DeleteSnapshotInput.safeParse({
				zone: VALID_ZONE,
				snapshot_id: VALID_UUID,
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid snapshot_id", () => {
			const result = DeleteSnapshotInput.safeParse({
				zone: VALID_ZONE,
				snapshot_id: "bad",
			});
			expect(result.success).toBe(false);
		});
	});

	// ── Cross-cutting zone validation ──

	describe("zone validation across all schemas", () => {
		const schemas = [
			{ name: "ListServersInput", schema: ListServersInput, extra: {} },
			{
				name: "GetServerInput",
				schema: GetServerInput,
				extra: { server_id: VALID_UUID },
			},
			{
				name: "CreateServerInput",
				schema: CreateServerInput,
				extra: {
					name: "srv",
					commercial_type: "DEV1-S",
					image: VALID_UUID,
				},
			},
			{
				name: "DeleteServerInput",
				schema: DeleteServerInput,
				extra: { server_id: VALID_UUID },
			},
			{
				name: "ServerActionInput",
				schema: ServerActionInput,
				extra: { server_id: VALID_UUID, action: "poweron" },
			},
			{ name: "ListVolumesInput", schema: ListVolumesInput, extra: {} },
			{
				name: "GetVolumeInput",
				schema: GetVolumeInput,
				extra: { volume_id: VALID_UUID },
			},
			{
				name: "CreateVolumeInput",
				schema: CreateVolumeInput,
				extra: { name: "v", size: 1, volume_type: "b_ssd" },
			},
			{
				name: "DeleteVolumeInput",
				schema: DeleteVolumeInput,
				extra: { volume_id: VALID_UUID },
			},
			{
				name: "ListSecurityGroupsInput",
				schema: ListSecurityGroupsInput,
				extra: {},
			},
			{
				name: "GetSecurityGroupInput",
				schema: GetSecurityGroupInput,
				extra: { security_group_id: VALID_UUID },
			},
			{
				name: "CreateSecurityGroupInput",
				schema: CreateSecurityGroupInput,
				extra: { name: "sg" },
			},
			{
				name: "DeleteSecurityGroupInput",
				schema: DeleteSecurityGroupInput,
				extra: { security_group_id: VALID_UUID },
			},
			{ name: "ListIpsInput", schema: ListIpsInput, extra: {} },
			{ name: "CreateIpInput", schema: CreateIpInput, extra: {} },
			{
				name: "DeleteIpInput",
				schema: DeleteIpInput,
				extra: { ip_id: VALID_UUID },
			},
			{
				name: "AttachIpInput",
				schema: AttachIpInput,
				extra: { ip_id: VALID_UUID, server_id: VALID_UUID },
			},
			{ name: "ListSnapshotsInput", schema: ListSnapshotsInput, extra: {} },
			{
				name: "CreateSnapshotInput",
				schema: CreateSnapshotInput,
				extra: { name: "s", volume_id: VALID_UUID },
			},
			{
				name: "DeleteSnapshotInput",
				schema: DeleteSnapshotInput,
				extra: { snapshot_id: VALID_UUID },
			},
		];

		for (const { name, schema, extra } of schemas) {
			it(`${name} rejects missing zone`, () => {
				const result = schema.safeParse(extra);
				expect(result.success).toBe(false);
			});

			it(`${name} accepts valid zone fr-par-1`, () => {
				const result = schema.safeParse({ zone: "fr-par-1", ...extra });
				expect(result.success).toBe(true);
			});

			it(`${name} accepts valid zone nl-ams-2`, () => {
				const result = schema.safeParse({ zone: "nl-ams-2", ...extra });
				expect(result.success).toBe(true);
			});

			it(`${name} accepts valid zone pl-waw-3`, () => {
				const result = schema.safeParse({ zone: "pl-waw-3", ...extra });
				expect(result.success).toBe(true);
			});
		}
	});
});
