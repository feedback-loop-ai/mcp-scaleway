import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleAttachIp,
	handleCreateIp,
	handleCreateSecurityGroup,
	handleCreateServer,
	handleCreateSnapshot,
	handleCreateVolume,
	handleDeleteIp,
	handleDeleteSecurityGroup,
	handleDeleteServer,
	handleDeleteSnapshot,
	handleDeleteVolume,
	handleGetSecurityGroup,
	handleGetServer,
	handleGetVolume,
	handleListIps,
	handleListSecurityGroups,
	handleListServers,
	handleListSnapshots,
	handleListVolumes,
	handleServerAction,
} from "../../../../src/tools/instances/handlers.js";

const mockFetch = vi.fn();

vi.mock("../../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWTEST",
		secretKey: "secret",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

vi.mock("../../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

const ZONE = "fr-par-1";
const UUID = "00000000-0000-0000-0000-000000000001";

// biome-ignore lint/suspicious/noExplicitAny: test helper for union return types
type AnyResult = any;

function statusError(statusCode: number, message: string): Error {
	const err = new Error(message);
	(err as Error & { statusCode: number }).statusCode = statusCode;
	return err;
}

describe("instances handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// ── Server Handlers ──

	describe("handleListServers", () => {
		it("returns servers list with default pagination", async () => {
			const data = { servers: [{ id: UUID, name: "srv1" }], total_count: 1 };
			mockFetch.mockResolvedValue(data);

			const result = await handleListServers({ zone: ZONE, page: 1, page_size: 50 });

			expect(result.content[0].text).toContain('"servers"');
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `/instance/v1/zones/${ZONE}/servers`,
				}),
			);
		});

		it("passes optional filters", async () => {
			mockFetch.mockResolvedValue({ servers: [], total_count: 0 });

			await handleListServers({
				zone: ZONE,
				page: 2,
				page_size: 10,
				project: UUID,
				name: "test",
				tags: ["web", "prod"],
				state: "running",
			});

			const call = mockFetch.mock.calls[0][0];
			const params: URLSearchParams = call.urlParams;
			expect(params.get("page")).toBe("2");
			expect(params.get("page_size")).toBe("10");
			expect(params.get("project")).toBe(UUID);
			expect(params.get("name")).toBe("test");
			expect(params.getAll("tags")).toEqual(["web", "prod"]);
			expect(params.get("state")).toBe("running");
		});

		it("returns error response on API failure", async () => {
			mockFetch.mockRejectedValue(statusError(403, "Forbidden"));

			const result = await handleListServers({ zone: ZONE, page: 1, page_size: 50 });

			expect((result as AnyResult).isError).toBe(true);
			expect(result.content[0].text).toContain("permission_denied");
		});
	});

	describe("handleGetServer", () => {
		it("returns server details", async () => {
			const data = { server: { id: UUID, name: "my-server" } };
			mockFetch.mockResolvedValue(data);

			const result = await handleGetServer({ zone: ZONE, server_id: UUID });

			expect(result.content[0].text).toContain("my-server");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `/instance/v1/zones/${ZONE}/servers/${UUID}`,
				}),
			);
		});

		it("returns error on not found", async () => {
			mockFetch.mockRejectedValue(statusError(404, "Not found"));

			const result = await handleGetServer({ zone: ZONE, server_id: UUID });

			expect((result as AnyResult).isError).toBe(true);
			expect(result.content[0].text).toContain("not_found");
		});
	});

	describe("handleCreateServer", () => {
		it("creates server with required fields", async () => {
			const data = { server: { id: UUID, name: "new-server" } };
			mockFetch.mockResolvedValue(data);

			const result = await handleCreateServer({
				zone: ZONE,
				name: "new-server",
				commercial_type: "DEV1-S",
				image: UUID,
			});

			expect(result.content[0].text).toContain("new-server");
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			const body = JSON.parse(call.body);
			expect(body.name).toBe("new-server");
			expect(body.commercial_type).toBe("DEV1-S");
			expect(body.image).toBe(UUID);
		});

		it("passes optional fields", async () => {
			mockFetch.mockResolvedValue({ server: { id: UUID } });

			await handleCreateServer({
				zone: ZONE,
				name: "srv",
				commercial_type: "DEV1-S",
				image: UUID,
				project: UUID,
				tags: ["test"],
				dynamic_ip_required: true,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project).toBe(UUID);
			expect(body.tags).toEqual(["test"]);
			expect(body.dynamic_ip_required).toBe(true);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(400, "Bad request"));

			const result = await handleCreateServer({
				zone: ZONE,
				name: "srv",
				commercial_type: "DEV1-S",
				image: UUID,
			});

			expect((result as AnyResult).isError).toBe(true);
			expect(result.content[0].text).toContain("invalid_input");
		});
	});

	describe("handleDeleteServer", () => {
		it("deletes server successfully", async () => {
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteServer({ zone: ZONE, server_id: UUID });

			expect(result.content[0].text).toContain('"success": true');
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: `/instance/v1/zones/${ZONE}/servers/${UUID}`,
				}),
			);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(404, "Not found"));

			const result = await handleDeleteServer({ zone: ZONE, server_id: UUID });

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	describe("handleServerAction", () => {
		it("performs server action", async () => {
			const data = { task: { id: UUID, status: "pending" } };
			mockFetch.mockResolvedValue(data);

			const result = await handleServerAction({
				zone: ZONE,
				server_id: UUID,
				action: "poweron",
			});

			expect(result.content[0].text).toContain('"task"');
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(JSON.parse(call.body)).toEqual({ action: "poweron" });
		});

		it("handles all action types", async () => {
			const actions = [
				"poweron",
				"poweroff",
				"reboot",
				"terminate",
				"stop_in_place",
				"backup",
			] as const;

			for (const action of actions) {
				mockFetch.mockResolvedValue({ task: { id: UUID } });
				await handleServerAction({ zone: ZONE, server_id: UUID, action });
				const body = JSON.parse(mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0].body);
				expect(body.action).toBe(action);
			}
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(429, "Rate limited"));

			const result = await handleServerAction({
				zone: ZONE,
				server_id: UUID,
				action: "poweron",
			});

			expect((result as AnyResult).isError).toBe(true);
			expect(result.content[0].text).toContain("rate_limited");
		});
	});

	// ── Volume Handlers ──

	describe("handleListVolumes", () => {
		it("returns volumes list", async () => {
			mockFetch.mockResolvedValue({ volumes: [{ id: UUID }], total_count: 1 });

			const result = await handleListVolumes({ zone: ZONE, page: 1, page_size: 50 });

			expect(result.content[0].text).toContain('"volumes"');
		});

		it("passes optional filters", async () => {
			mockFetch.mockResolvedValue({ volumes: [], total_count: 0 });

			await handleListVolumes({
				zone: ZONE,
				page: 1,
				page_size: 50,
				name: "vol",
				volume_type: "b_ssd",
				project: UUID,
			});

			const params: URLSearchParams = mockFetch.mock.calls[0][0].urlParams;
			expect(params.get("name")).toBe("vol");
			expect(params.get("volume_type")).toBe("b_ssd");
			expect(params.get("project")).toBe(UUID);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(401, "Unauthorized"));

			const result = await handleListVolumes({ zone: ZONE, page: 1, page_size: 50 });

			expect((result as AnyResult).isError).toBe(true);
			expect(result.content[0].text).toContain("permission_denied");
		});
	});

	describe("handleGetVolume", () => {
		it("returns volume details", async () => {
			mockFetch.mockResolvedValue({ volume: { id: UUID, name: "vol1" } });

			const result = await handleGetVolume({ zone: ZONE, volume_id: UUID });

			expect(result.content[0].text).toContain("vol1");
		});

		it("returns error on not found", async () => {
			mockFetch.mockRejectedValue(statusError(404, "Not found"));

			const result = await handleGetVolume({ zone: ZONE, volume_id: UUID });

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	describe("handleCreateVolume", () => {
		it("creates volume with required fields", async () => {
			mockFetch.mockResolvedValue({ volume: { id: UUID } });

			const result = await handleCreateVolume({
				zone: ZONE,
				name: "vol1",
				size: 20000000000,
				volume_type: "b_ssd",
			});

			expect(result.content[0].text).toContain(UUID);
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBe("vol1");
			expect(body.size).toBe(20000000000);
			expect(body.volume_type).toBe("b_ssd");
		});

		it("passes optional fields", async () => {
			mockFetch.mockResolvedValue({ volume: { id: UUID } });

			await handleCreateVolume({
				zone: ZONE,
				name: "vol1",
				size: 10000000000,
				volume_type: "l_ssd",
				project: UUID,
				tags: ["data"],
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project).toBe(UUID);
			expect(body.tags).toEqual(["data"]);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(400, "Bad request"));

			const result = await handleCreateVolume({
				zone: ZONE,
				name: "vol1",
				size: 20000000000,
				volume_type: "b_ssd",
			});

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	describe("handleDeleteVolume", () => {
		it("deletes volume successfully", async () => {
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteVolume({ zone: ZONE, volume_id: UUID });

			expect(result.content[0].text).toContain('"success": true');
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(404, "Not found"));

			const result = await handleDeleteVolume({ zone: ZONE, volume_id: UUID });

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	// ── Security Group Handlers ──

	describe("handleListSecurityGroups", () => {
		it("returns security groups list", async () => {
			mockFetch.mockResolvedValue({
				security_groups: [{ id: UUID }],
				total_count: 1,
			});

			const result = await handleListSecurityGroups({
				zone: ZONE,
				page: 1,
				page_size: 50,
			});

			expect(result.content[0].text).toContain('"security_groups"');
		});

		it("passes optional filters", async () => {
			mockFetch.mockResolvedValue({ security_groups: [], total_count: 0 });

			await handleListSecurityGroups({
				zone: ZONE,
				page: 1,
				page_size: 50,
				name: "sg",
				project: UUID,
			});

			const params: URLSearchParams = mockFetch.mock.calls[0][0].urlParams;
			expect(params.get("name")).toBe("sg");
			expect(params.get("project")).toBe(UUID);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(500, "Internal error"));

			const result = await handleListSecurityGroups({
				zone: ZONE,
				page: 1,
				page_size: 50,
			});

			expect((result as AnyResult).isError).toBe(true);
			expect(result.content[0].text).toContain("server_error");
		});
	});

	describe("handleGetSecurityGroup", () => {
		it("returns security group details", async () => {
			mockFetch.mockResolvedValue({
				security_group: { id: UUID, name: "sg1" },
			});

			const result = await handleGetSecurityGroup({
				zone: ZONE,
				security_group_id: UUID,
			});

			expect(result.content[0].text).toContain("sg1");
		});

		it("returns error on not found", async () => {
			mockFetch.mockRejectedValue(statusError(404, "Not found"));

			const result = await handleGetSecurityGroup({
				zone: ZONE,
				security_group_id: UUID,
			});

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	describe("handleCreateSecurityGroup", () => {
		it("creates security group with defaults", async () => {
			mockFetch.mockResolvedValue({ security_group: { id: UUID } });

			const result = await handleCreateSecurityGroup({
				zone: ZONE,
				name: "sg1",
				inbound_default_policy: "accept",
				outbound_default_policy: "accept",
				stateful: true,
			});

			expect(result.content[0].text).toContain(UUID);
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBe("sg1");
			expect(body.inbound_default_policy).toBe("accept");
			expect(body.outbound_default_policy).toBe("accept");
			expect(body.stateful).toBe(true);
		});

		it("passes optional fields", async () => {
			mockFetch.mockResolvedValue({ security_group: { id: UUID } });

			await handleCreateSecurityGroup({
				zone: ZONE,
				name: "sg1",
				description: "Web security group",
				inbound_default_policy: "drop",
				outbound_default_policy: "accept",
				stateful: true,
				project: UUID,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.description).toBe("Web security group");
			expect(body.project).toBe(UUID);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(400, "Bad request"));

			const result = await handleCreateSecurityGroup({
				zone: ZONE,
				name: "sg1",
				inbound_default_policy: "accept",
				outbound_default_policy: "accept",
				stateful: true,
			});

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	describe("handleDeleteSecurityGroup", () => {
		it("deletes security group successfully", async () => {
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteSecurityGroup({
				zone: ZONE,
				security_group_id: UUID,
			});

			expect(result.content[0].text).toContain('"success": true');
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(404, "Not found"));

			const result = await handleDeleteSecurityGroup({
				zone: ZONE,
				security_group_id: UUID,
			});

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	// ── IP Handlers ──

	describe("handleListIps", () => {
		it("returns IPs list", async () => {
			mockFetch.mockResolvedValue({ ips: [{ id: UUID }], total_count: 1 });

			const result = await handleListIps({ zone: ZONE, page: 1, page_size: 50 });

			expect(result.content[0].text).toContain('"ips"');
		});

		it("passes optional filters", async () => {
			mockFetch.mockResolvedValue({ ips: [], total_count: 0 });

			await handleListIps({
				zone: ZONE,
				page: 1,
				page_size: 50,
				name: "ip1",
				project: UUID,
				type: "routed_ipv4",
			});

			const params: URLSearchParams = mockFetch.mock.calls[0][0].urlParams;
			expect(params.get("name")).toBe("ip1");
			expect(params.get("project")).toBe(UUID);
			expect(params.get("type")).toBe("routed_ipv4");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(403, "Forbidden"));

			const result = await handleListIps({ zone: ZONE, page: 1, page_size: 50 });

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	describe("handleCreateIp", () => {
		it("creates IP with defaults", async () => {
			mockFetch.mockResolvedValue({ ip: { id: UUID, address: "1.2.3.4" } });

			const result = await handleCreateIp({ zone: ZONE, type: "routed_ipv4" });

			expect(result.content[0].text).toContain("1.2.3.4");
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.type).toBe("routed_ipv4");
		});

		it("passes optional fields", async () => {
			mockFetch.mockResolvedValue({ ip: { id: UUID } });

			await handleCreateIp({
				zone: ZONE,
				type: "routed_ipv6",
				project: UUID,
				server: UUID,
				tags: ["prod"],
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project).toBe(UUID);
			expect(body.server).toBe(UUID);
			expect(body.tags).toEqual(["prod"]);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(400, "Quota exceeded"));

			const result = await handleCreateIp({ zone: ZONE, type: "routed_ipv4" });

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	describe("handleDeleteIp", () => {
		it("deletes IP successfully", async () => {
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteIp({ zone: ZONE, ip_id: UUID });

			expect(result.content[0].text).toContain('"success": true');
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(404, "Not found"));

			const result = await handleDeleteIp({ zone: ZONE, ip_id: UUID });

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	describe("handleAttachIp", () => {
		it("attaches IP to server", async () => {
			mockFetch.mockResolvedValue({ ip: { id: UUID, server: { id: UUID } } });

			const result = await handleAttachIp({
				zone: ZONE,
				ip_id: UUID,
				server_id: UUID,
			});

			expect(result.content[0].text).toContain('"ip"');
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("PATCH");
			expect(JSON.parse(call.body)).toEqual({ server: UUID });
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(400, "Bad request"));

			const result = await handleAttachIp({
				zone: ZONE,
				ip_id: UUID,
				server_id: UUID,
			});

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	// ── Snapshot Handlers ──

	describe("handleListSnapshots", () => {
		it("returns snapshots list", async () => {
			mockFetch.mockResolvedValue({
				snapshots: [{ id: UUID }],
				total_count: 1,
			});

			const result = await handleListSnapshots({
				zone: ZONE,
				page: 1,
				page_size: 50,
			});

			expect(result.content[0].text).toContain('"snapshots"');
		});

		it("passes optional filters", async () => {
			mockFetch.mockResolvedValue({ snapshots: [], total_count: 0 });

			await handleListSnapshots({
				zone: ZONE,
				page: 1,
				page_size: 50,
				name: "snap1",
				project: UUID,
			});

			const params: URLSearchParams = mockFetch.mock.calls[0][0].urlParams;
			expect(params.get("name")).toBe("snap1");
			expect(params.get("project")).toBe(UUID);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(500, "Server error"));

			const result = await handleListSnapshots({
				zone: ZONE,
				page: 1,
				page_size: 50,
			});

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	describe("handleCreateSnapshot", () => {
		it("creates snapshot with required fields", async () => {
			mockFetch.mockResolvedValue({ snapshot: { id: UUID } });

			const result = await handleCreateSnapshot({
				zone: ZONE,
				name: "snap1",
				volume_id: UUID,
			});

			expect(result.content[0].text).toContain(UUID);
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBe("snap1");
			expect(body.volume_id).toBe(UUID);
		});

		it("passes optional fields", async () => {
			mockFetch.mockResolvedValue({ snapshot: { id: UUID } });

			await handleCreateSnapshot({
				zone: ZONE,
				name: "snap1",
				volume_id: UUID,
				project: UUID,
				tags: ["backup"],
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project).toBe(UUID);
			expect(body.tags).toEqual(["backup"]);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(400, "Bad request"));

			const result = await handleCreateSnapshot({
				zone: ZONE,
				name: "snap1",
				volume_id: UUID,
			});

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	describe("handleDeleteSnapshot", () => {
		it("deletes snapshot successfully", async () => {
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteSnapshot({ zone: ZONE, snapshot_id: UUID });

			expect(result.content[0].text).toContain('"success": true');
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValue(statusError(404, "Not found"));

			const result = await handleDeleteSnapshot({ zone: ZONE, snapshot_id: UUID });

			expect((result as AnyResult).isError).toBe(true);
		});
	});

	// ── Error edge cases ──

	describe("error handling edge cases", () => {
		it("handles non-Error thrown values", async () => {
			mockFetch.mockRejectedValue("string error");

			const result = await handleListServers({ zone: ZONE, page: 1, page_size: 50 });

			expect((result as AnyResult).isError).toBe(true);
			expect(result.content[0].text).toContain("server_error");
			expect(result.content[0].text).toContain("string error");
		});

		it("handles Error without statusCode", async () => {
			mockFetch.mockRejectedValue(new Error("Network failure"));

			const result = await handleGetServer({ zone: ZONE, server_id: UUID });

			expect((result as AnyResult).isError).toBe(true);
			expect(result.content[0].text).toContain("server_error");
			expect(result.content[0].text).toContain("Network failure");
		});

		it("handles unknown status codes", async () => {
			mockFetch.mockRejectedValue(statusError(502, "Bad gateway"));

			const result = await handleListVolumes({ zone: ZONE, page: 1, page_size: 50 });

			expect((result as AnyResult).isError).toBe(true);
			expect(result.content[0].text).toContain("server_error");
		});
	});
});
