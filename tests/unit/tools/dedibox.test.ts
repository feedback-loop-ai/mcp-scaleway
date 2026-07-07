import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerDediboxTools } from "../../../src/tools/dedibox/index.js";

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

interface TextResult {
	content: { type: "text"; text: string }[];
	isError?: boolean;
}

async function handlers() {
	return import("../../../src/tools/dedibox/handlers.js");
}

function parse(result: TextResult) {
	return JSON.parse(result.content[0].text);
}

describe("dedibox module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerDediboxTools(server)).not.toThrow();
	});

	it("registers all 17 dedibox tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerDediboxTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(17);
		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toEqual([
			"scaleway_dedibox_list_servers",
			"scaleway_dedibox_get_server",
			"scaleway_dedibox_update_server",
			"scaleway_dedibox_reboot_server",
			"scaleway_dedibox_start_server",
			"scaleway_dedibox_stop_server",
			"scaleway_dedibox_delete_server",
			"scaleway_dedibox_install_server",
			"scaleway_dedibox_get_server_install",
			"scaleway_dedibox_cancel_server_install",
			"scaleway_dedibox_list_offers",
			"scaleway_dedibox_get_offer",
			"scaleway_dedibox_list_os",
			"scaleway_dedibox_get_os",
			"scaleway_dedibox_get_bmc_access",
			"scaleway_dedibox_start_bmc_access",
			"scaleway_dedibox_stop_bmc_access",
		]);
	});

	it("invokes handlers through registered callbacks", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const calls: Record<string, (params: unknown) => Promise<TextResult>> = {};
		vi.spyOn(server, "tool").mockImplementation(
			// biome-ignore lint/suspicious/noExplicitAny: test shim
			((name: string, _d: string, _s: unknown, cb: any) => {
				calls[name] = cb;
				// biome-ignore lint/suspicious/noExplicitAny: test shim
			}) as any,
		);
		registerDediboxTools(server);
		mockFetch.mockResolvedValue({ servers: [], total_count: 0 });
		const result = await calls.scaleway_dedibox_list_servers({ zone: "fr-par-1" });
		expect(parse(result).totalCount).toBe(0);
	});
});

describe("dedibox handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListServers", () => {
		it("returns paginated servers with filters", async () => {
			const { handleListServers } = await handlers();
			mockFetch.mockResolvedValue({
				servers: [{ id: 1, hostname: "srv" }],
				total_count: 1,
			});
			const result = await handleListServers({
				zone: "fr-par-1",
				page: 2,
				pageSize: 10,
				projectId: "00000000-0000-0000-0000-000000000001",
				search: "srv",
				orderBy: "created_at_desc",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "dedibox/v1/zones/fr-par-1/servers",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = parse(result);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.page).toBe(2);
		});

		it("works without optional filters", async () => {
			const { handleListServers } = await handlers();
			mockFetch.mockResolvedValue({ servers: [], total_count: 0 });
			const result = await handleListServers({ zone: "fr-par-1", page: 1, pageSize: 50 });
			expect(parse(result).totalCount).toBe(0);
		});

		it("handles errors", async () => {
			const { handleListServers } = await handlers();
			const err = new Error("boom") as Error & { statusCode: number };
			err.statusCode = 500;
			mockFetch.mockRejectedValue(err);
			const result = (await handleListServers({
				zone: "fr-par-1",
				page: 1,
				pageSize: 50,
			})) as TextResult;
			expect(result.isError).toBe(true);
			expect(parse(result).error.type).toBe("server_error");
		});
	});

	describe("handleGetServer", () => {
		it("returns a server", async () => {
			const { handleGetServer } = await handlers();
			mockFetch.mockResolvedValue({ id: 42, hostname: "srv" });
			const result = await handleGetServer({ zone: "fr-par-1", serverId: 42 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: "dedibox/v1/zones/fr-par-1/servers/42" }),
			);
			expect(parse(result).id).toBe(42);
		});

		it("handles errors", async () => {
			const { handleGetServer } = await handlers();
			const err = new Error("nope") as Error & { statusCode: number };
			err.statusCode = 404;
			mockFetch.mockRejectedValue(err);
			const result = (await handleGetServer({ zone: "fr-par-1", serverId: 42 })) as TextResult;
			expect(parse(result).error.type).toBe("not_found");
		});
	});

	describe("handleUpdateServer", () => {
		it("updates a server", async () => {
			const { handleUpdateServer } = await handlers();
			mockFetch.mockResolvedValue({ id: 42, hostname: "new" });
			const result = await handleUpdateServer({
				zone: "fr-par-1",
				serverId: 42,
				hostname: "new",
				enableIpv6: true,
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "PATCH", path: "dedibox/v1/zones/fr-par-1/servers/42" }),
			);
			expect(parse(result).hostname).toBe("new");
		});

		it("handles errors", async () => {
			const { handleUpdateServer } = await handlers();
			mockFetch.mockRejectedValue("string error");
			const result = (await handleUpdateServer({ zone: "fr-par-1", serverId: 42 })) as TextResult;
			expect(parse(result).error.type).toBe("server_error");
		});
	});

	describe("handleRebootServer", () => {
		it("reboots a server", async () => {
			const { handleRebootServer } = await handlers();
			mockFetch.mockResolvedValue({});
			await handleRebootServer({ zone: "fr-par-1", serverId: 7 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "dedibox/v1/zones/fr-par-1/servers/7/reboot",
				}),
			);
		});

		it("handles errors", async () => {
			const { handleRebootServer } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleRebootServer({ zone: "fr-par-1", serverId: 7 })) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleStartServer", () => {
		it("starts a server", async () => {
			const { handleStartServer } = await handlers();
			mockFetch.mockResolvedValue({});
			await handleStartServer({ zone: "fr-par-1", serverId: 8 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ path: "dedibox/v1/zones/fr-par-1/servers/8/start" }),
			);
		});

		it("handles errors", async () => {
			const { handleStartServer } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleStartServer({ zone: "fr-par-1", serverId: 8 })) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleStopServer", () => {
		it("stops a server", async () => {
			const { handleStopServer } = await handlers();
			mockFetch.mockResolvedValue({});
			await handleStopServer({ zone: "fr-par-1", serverId: 9 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ path: "dedibox/v1/zones/fr-par-1/servers/9/stop" }),
			);
		});

		it("handles errors", async () => {
			const { handleStopServer } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleStopServer({ zone: "fr-par-1", serverId: 9 })) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteServer", () => {
		it("deletes a server", async () => {
			const { handleDeleteServer } = await handlers();
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteServer({ zone: "fr-par-1", serverId: 5 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "DELETE", path: "dedibox/v1/zones/fr-par-1/servers/5" }),
			);
			expect(parse(result).message).toContain("deleted");
		});

		it("handles errors", async () => {
			const { handleDeleteServer } = await handlers();
			const err = new Error("denied") as Error & { statusCode: number };
			err.statusCode = 403;
			mockFetch.mockRejectedValue(err);
			const result = (await handleDeleteServer({ zone: "fr-par-1", serverId: 5 })) as TextResult;
			expect(parse(result).error.type).toBe("permission_denied");
		});
	});

	describe("handleInstallServer", () => {
		it("installs with partitions and all options", async () => {
			const { handleInstallServer } = await handlers();
			mockFetch.mockResolvedValue({ status: "installing" });
			const result = await handleInstallServer({
				zone: "fr-par-1",
				serverId: 10,
				osId: 20,
				hostname: "host",
				userLogin: "user",
				userPassword: "pw",
				panelPassword: "pp",
				rootPassword: "rp",
				partitions: [
					{
						fileSystem: "ext4",
						mountPoint: "/",
						raidLevel: "raid1",
						capacity: 1000,
						connectors: ["sda"],
					},
				],
				sshKeyIds: ["00000000-0000-0000-0000-000000000002"],
				licenseOfferId: 99,
				ipId: 55,
			});
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe("dedibox/v1/zones/fr-par-1/servers/10/install");
			const body = JSON.parse(call.body);
			expect(body.os_id).toBe(20);
			expect(body.partitions[0].file_system).toBe("ext4");
			expect(parse(result).status).toBe("installing");
		});

		it("installs without partitions", async () => {
			const { handleInstallServer } = await handlers();
			mockFetch.mockResolvedValue({ status: "installing" });
			await handleInstallServer({
				zone: "fr-par-1",
				serverId: 10,
				osId: 20,
				hostname: "host",
			});
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.partitions).toBeUndefined();
		});

		it("handles errors", async () => {
			const { handleInstallServer } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleInstallServer({
				zone: "fr-par-1",
				serverId: 10,
				osId: 20,
				hostname: "host",
			})) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetServerInstall", () => {
		it("returns install status", async () => {
			const { handleGetServerInstall } = await handlers();
			mockFetch.mockResolvedValue({ status: "installed" });
			const result = await handleGetServerInstall({ zone: "fr-par-1", serverId: 10 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "dedibox/v1/zones/fr-par-1/servers/10/install",
				}),
			);
			expect(parse(result).status).toBe("installed");
		});

		it("handles errors", async () => {
			const { handleGetServerInstall } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleGetServerInstall({
				zone: "fr-par-1",
				serverId: 10,
			})) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCancelServerInstall", () => {
		it("cancels install", async () => {
			const { handleCancelServerInstall } = await handlers();
			mockFetch.mockResolvedValue({});
			await handleCancelServerInstall({ zone: "fr-par-1", serverId: 10 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "dedibox/v1/zones/fr-par-1/servers/10/cancel-install",
				}),
			);
		});

		it("handles errors", async () => {
			const { handleCancelServerInstall } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleCancelServerInstall({
				zone: "fr-par-1",
				serverId: 10,
			})) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleListOffers", () => {
		it("lists offers with filters", async () => {
			const { handleListOffers } = await handlers();
			mockFetch.mockResolvedValue({ offers: [{ id: 1 }], total_count: 1 });
			const result = await handleListOffers({
				zone: "fr-par-1",
				page: 1,
				pageSize: 50,
				orderBy: "price_asc",
				commercialRange: "start",
				catalog: "default",
				projectId: "00000000-0000-0000-0000-000000000001",
				availableOnly: true,
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: "dedibox/v1/zones/fr-par-1/offers" }),
			);
			expect(parse(result).totalCount).toBe(1);
		});

		it("lists offers without filters", async () => {
			const { handleListOffers } = await handlers();
			mockFetch.mockResolvedValue({ offers: [], total_count: 0 });
			const result = await handleListOffers({ zone: "fr-par-1", page: 1, pageSize: 50 });
			expect(parse(result).totalCount).toBe(0);
		});

		it("handles errors", async () => {
			const { handleListOffers } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleListOffers({
				zone: "fr-par-1",
				page: 1,
				pageSize: 50,
			})) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetOffer", () => {
		it("gets an offer with project id", async () => {
			const { handleGetOffer } = await handlers();
			mockFetch.mockResolvedValue({ id: 3 });
			const result = await handleGetOffer({
				zone: "fr-par-1",
				offerId: 3,
				projectId: "00000000-0000-0000-0000-000000000001",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: "dedibox/v1/zones/fr-par-1/offers/3" }),
			);
			expect(parse(result).id).toBe(3);
		});

		it("gets an offer without project id", async () => {
			const { handleGetOffer } = await handlers();
			mockFetch.mockResolvedValue({ id: 3 });
			const result = await handleGetOffer({ zone: "fr-par-1", offerId: 3 });
			expect(parse(result).id).toBe(3);
		});

		it("handles errors", async () => {
			const { handleGetOffer } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleGetOffer({ zone: "fr-par-1", offerId: 3 })) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleListOS", () => {
		it("lists OS with filters", async () => {
			const { handleListOS } = await handlers();
			mockFetch.mockResolvedValue({ os: [{ id: 1 }], total_count: 1 });
			const result = await handleListOS({
				zone: "fr-par-1",
				page: 1,
				pageSize: 50,
				orderBy: "released_at_desc",
				type: "server",
				serverId: 12,
				projectId: "00000000-0000-0000-0000-000000000001",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: "dedibox/v1/zones/fr-par-1/os" }),
			);
			expect(parse(result).totalCount).toBe(1);
		});

		it("lists OS without filters", async () => {
			const { handleListOS } = await handlers();
			mockFetch.mockResolvedValue({ os: [], total_count: 0 });
			const result = await handleListOS({ zone: "fr-par-1", page: 1, pageSize: 50 });
			expect(parse(result).totalCount).toBe(0);
		});

		it("handles errors", async () => {
			const { handleListOS } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleListOS({
				zone: "fr-par-1",
				page: 1,
				pageSize: 50,
			})) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetOS", () => {
		it("gets an OS", async () => {
			const { handleGetOS } = await handlers();
			mockFetch.mockResolvedValue({ id: 4 });
			const result = await handleGetOS({
				zone: "fr-par-1",
				osId: 4,
				serverId: 12,
				projectId: "00000000-0000-0000-0000-000000000001",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: "dedibox/v1/zones/fr-par-1/os/4" }),
			);
			expect(parse(result).id).toBe(4);
		});

		it("handles errors", async () => {
			const { handleGetOS } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleGetOS({
				zone: "fr-par-1",
				osId: 4,
				serverId: 12,
			})) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetBmcAccess", () => {
		it("gets BMC access", async () => {
			const { handleGetBmcAccess } = await handlers();
			mockFetch.mockResolvedValue({ url: "https://bmc", login: "l", password: "p" });
			const result = await handleGetBmcAccess({ zone: "fr-par-1", serverId: 6 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "dedibox/v1/zones/fr-par-1/servers/6/bmc-access",
				}),
			);
			expect(parse(result).url).toBe("https://bmc");
		});

		it("handles errors", async () => {
			const { handleGetBmcAccess } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleGetBmcAccess({ zone: "fr-par-1", serverId: 6 })) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleStartBmcAccess", () => {
		it("starts BMC access", async () => {
			const { handleStartBmcAccess } = await handlers();
			mockFetch.mockResolvedValue({});
			await handleStartBmcAccess({ zone: "fr-par-1", serverId: 6, ip: "1.2.3.4" });
			const call = mockFetch.mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe("dedibox/v1/zones/fr-par-1/servers/6/bmc-access");
			expect(JSON.parse(call.body).ip).toBe("1.2.3.4");
		});

		it("handles errors", async () => {
			const { handleStartBmcAccess } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleStartBmcAccess({
				zone: "fr-par-1",
				serverId: 6,
				ip: "1.2.3.4",
			})) as TextResult;
			expect(result.isError).toBe(true);
		});
	});

	describe("handleStopBmcAccess", () => {
		it("stops BMC access", async () => {
			const { handleStopBmcAccess } = await handlers();
			mockFetch.mockResolvedValue(undefined);
			const result = await handleStopBmcAccess({ zone: "fr-par-1", serverId: 6 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: "dedibox/v1/zones/fr-par-1/servers/6/bmc-access",
				}),
			);
			expect(parse(result).message).toContain("stopped");
		});

		it("handles errors", async () => {
			const { handleStopBmcAccess } = await handlers();
			mockFetch.mockRejectedValue(new Error("x"));
			const result = (await handleStopBmcAccess({ zone: "fr-par-1", serverId: 6 })) as TextResult;
			expect(result.isError).toBe(true);
		});
	});
});
