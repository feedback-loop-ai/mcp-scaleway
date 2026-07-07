/**
 * Contract tests for Scaleway Dedibox API (v1)
 *
 * Validates request/response shapes against specs/scaleway-api/dedibox/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * API: https://api.scaleway.com/dedibox/v1 (zone-scoped, X-Auth-Token auth)
 * Source of truth: https://www.scaleway.com/en/developers/api/dedibox/
 */
import { describe, expect, it } from "vitest";
import {
	BMCAccess,
	CancelServerInstallParams,
	DeleteServerParams,
	GetBmcAccessParams,
	GetOSParams,
	GetOfferParams,
	GetServerInstallParams,
	GetServerParams,
	InstallServerParams,
	ListOSParams,
	ListOSResponse,
	ListOffersParams,
	ListOffersResponse,
	ListServersParams,
	ListServersResponse,
	OS,
	Offer,
	RebootServerParams,
	Server,
	ServerInstall,
	StartBmcAccessParams,
	StartServerParams,
	StopBmcAccessParams,
	StopServerParams,
	UpdateServerParams,
} from "../../../src/tools/dedibox/types.js";

describe("Dedibox contract: request schemas", () => {
	it("ListServersParams accepts pagination and filters (GET /dedibox/v1/zones/{zone}/servers)", () => {
		expect(
			ListServersParams.parse({
				zone: "fr-par-1",
				page: 1,
				pageSize: 20,
				projectId: "00000000-0000-0000-0000-000000000001",
				search: "web",
				orderBy: "created_at_asc",
			}).zone,
		).toBe("fr-par-1");
	});

	it("ListServersParams rejects invalid zone", () => {
		expect(() => ListServersParams.parse({ zone: "paris" })).toThrow();
	});

	it("GetServerParams requires a numeric server ID (GET /dedibox/v1/zones/{zone}/servers/{id})", () => {
		expect(GetServerParams.parse({ zone: "fr-par-1", serverId: 42 }).serverId).toBe(42);
		expect(() => GetServerParams.parse({ zone: "fr-par-1", serverId: "42" })).toThrow();
	});

	it("UpdateServerParams accepts hostname and enable_ipv6 (PATCH .../servers/{id})", () => {
		const parsed = UpdateServerParams.parse({
			zone: "fr-par-1",
			serverId: 42,
			hostname: "new-host",
			enableIpv6: true,
		});
		expect(parsed.enableIpv6).toBe(true);
	});

	it("server action params require zone + server ID (reboot/start/stop/delete)", () => {
		for (const schema of [
			RebootServerParams,
			StartServerParams,
			StopServerParams,
			DeleteServerParams,
		]) {
			expect(schema.parse({ zone: "fr-par-1", serverId: 1 }).serverId).toBe(1);
			expect(() => schema.parse({ zone: "fr-par-1" })).toThrow();
		}
	});

	it("InstallServerParams requires os_id + hostname, accepts partitions (POST .../install)", () => {
		const parsed = InstallServerParams.parse({
			zone: "fr-par-1",
			serverId: 10,
			osId: 20,
			hostname: "host",
			partitions: [
				{ fileSystem: "ext4", mountPoint: "/", raidLevel: "raid1", capacity: 1024, connectors: [] },
			],
			sshKeyIds: ["00000000-0000-0000-0000-000000000002"],
		});
		expect(parsed.osId).toBe(20);
		expect(parsed.partitions).toHaveLength(1);
		expect(() =>
			InstallServerParams.parse({ zone: "fr-par-1", serverId: 10, hostname: "host" }),
		).toThrow();
	});

	it("GetServerInstall/CancelServerInstall params require zone + server ID", () => {
		expect(GetServerInstallParams.parse({ zone: "fr-par-1", serverId: 10 }).serverId).toBe(10);
		expect(CancelServerInstallParams.parse({ zone: "fr-par-1", serverId: 10 }).serverId).toBe(10);
	});

	it("ListOffersParams accepts catalog + availability filters (GET .../offers)", () => {
		const parsed = ListOffersParams.parse({
			zone: "fr-par-1",
			catalog: "default",
			availableOnly: true,
			orderBy: "price_desc",
		});
		expect(parsed.catalog).toBe("default");
	});

	it("GetOfferParams requires a numeric offer ID (GET .../offers/{id})", () => {
		expect(GetOfferParams.parse({ zone: "fr-par-1", offerId: 3 }).offerId).toBe(3);
	});

	it("ListOSParams accepts type + server filter (GET .../os)", () => {
		expect(ListOSParams.parse({ zone: "fr-par-1", type: "server", serverId: 12 }).type).toBe(
			"server",
		);
	});

	it("GetOSParams requires os ID and server ID (GET .../os/{id})", () => {
		expect(GetOSParams.parse({ zone: "fr-par-1", osId: 4, serverId: 12 }).osId).toBe(4);
		expect(() => GetOSParams.parse({ zone: "fr-par-1", osId: 4 })).toThrow();
	});

	it("BMC access params require zone + server ID (GET/POST/DELETE .../bmc-access)", () => {
		expect(GetBmcAccessParams.parse({ zone: "fr-par-1", serverId: 6 }).serverId).toBe(6);
		expect(StartBmcAccessParams.parse({ zone: "fr-par-1", serverId: 6, ip: "1.2.3.4" }).ip).toBe(
			"1.2.3.4",
		);
		expect(() => StartBmcAccessParams.parse({ zone: "fr-par-1", serverId: 6 })).toThrow();
		expect(StopBmcAccessParams.parse({ zone: "fr-par-1", serverId: 6 }).serverId).toBe(6);
	});
});

describe("Dedibox contract: response schemas", () => {
	it("ListServersResponse validates the documented server-summary list shape", () => {
		const parsed = ListServersResponse.parse({
			total_count: 1,
			servers: [
				{
					id: 42,
					datacenter_name: "DC5",
					organization_id: "00000000-0000-0000-0000-000000000001",
					project_id: "00000000-0000-0000-0000-000000000002",
					hostname: "web-1",
					created_at: "2024-01-01T00:00:00+00:00",
					updated_at: "2024-01-02T00:00:00+00:00",
					expired_at: null,
					offer_id: 7,
					offer_name: "Start-1-M",
					status: "ready",
					os_id: 3,
					interfaces: [],
					zone: "fr-par-1",
					level: null,
					is_outsourced: false,
					qinq: false,
					rpn_version: null,
					is_hds: false,
				},
			],
		});
		expect(parsed.servers[0].status).toBe("ready");
	});

	it("Server validates the full get-server shape", () => {
		const parsed = Server.parse({
			id: 42,
			organization_id: "00000000-0000-0000-0000-000000000001",
			project_id: "00000000-0000-0000-0000-000000000002",
			hostname: "web-1",
			rebooted_at: null,
			created_at: "2024-01-01T00:00:00+00:00",
			updated_at: "2024-01-02T00:00:00+00:00",
			expired_at: null,
			offer: {
				id: 7,
				name: "Start-1-M",
				catalog: "default",
				payment_frequency: "monthly",
				pricing: { currency_code: "EUR", units: 10, nanos: 0 },
			},
			status: "ready",
			location: { rack: "A1", room: "R1", datacenter_name: "DC5" },
			os: null,
			zone: "fr-par-1",
			has_bmc: true,
			tags: ["prod"],
			is_outsourced: false,
		});
		expect(parsed.has_bmc).toBe(true);
		expect(parsed.offer?.payment_frequency).toBe("monthly");
	});

	it("Offer validates a server offer with money pricing", () => {
		const parsed = Offer.parse({
			id: 7,
			name: "Start-1-M",
			catalog: "default",
			payment_frequency: "monthly",
			pricing: { currency_code: "EUR", units: 10, nanos: 500000000 },
			server_info: { commercial_range: "start" },
		});
		expect(parsed.name).toBe("Start-1-M");
	});

	it("ListOffersResponse validates the offer list shape", () => {
		const parsed = ListOffersResponse.parse({
			total_count: 1,
			offers: [{ id: 7, name: "Start-1-M", catalog: "default", payment_frequency: "monthly" }],
		});
		expect(parsed.total_count).toBe(1);
	});

	it("OS + ListOSResponse validate the OS list shape", () => {
		const os = {
			id: 3,
			name: "ubuntu",
			type: "server" as const,
			version: "22.04",
			arch: "amd64" as const,
			allow_custom_partitioning: true,
			allow_ssh_keys: true,
			requires_user: true,
			requires_admin_password: false,
			requires_panel_password: false,
			allowed_filesystems: ["ext4" as const],
			requires_license: false,
			max_partitions: 4,
			display_name: "Ubuntu 22.04 LTS",
		};
		expect(OS.parse(os).arch).toBe("amd64");
		expect(ListOSResponse.parse({ total_count: 1, os: [os] }).os[0].id).toBe(3);
	});

	it("ServerInstall validates the installation status shape", () => {
		const parsed = ServerInstall.parse({
			os_id: 3,
			hostname: "web-1",
			user_login: "ubuntu",
			partitions: [
				{
					file_system: "ext4",
					mount_point: "/",
					raid_level: "raid1",
					capacity: 1024,
					connectors: [],
				},
			],
			ssh_key_ids: [],
			status: "installing",
			panel_url: null,
		});
		expect(parsed.status).toBe("installing");
	});

	it("BMCAccess validates the console access shape", () => {
		const parsed = BMCAccess.parse({
			url: "https://bmc.example",
			login: "root",
			password: "secret",
			expires_at: "2024-01-01T01:00:00+00:00",
			status: "created",
		});
		expect(parsed.status).toBe("created");
	});
});
