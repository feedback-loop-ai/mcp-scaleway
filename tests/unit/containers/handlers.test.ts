import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handlers from "../../../src/tools/containers/handlers.js";
import {
	handleCreateContainer,
	handleCreateCron,
	handleCreateNamespace,
	handleListContainers,
	handleListNamespaces,
	handleUpdateContainer,
	handleUpdateCron,
	handleUpdateNamespace,
} from "../../../src/tools/containers/handlers.js";

const { fetch, auth } = vi.hoisted(() => ({ fetch: vi.fn(), auth: vi.fn() }));
vi.mock("../../../src/shared/auth.js", () => ({ loadAuthConfig: auth }));
vi.mock("../../../src/shared/client.js", () => ({ createScalewayClient: () => ({ fetch }) }));
const ID = "00000000-0000-0000-0000-000000000001";
const PROJECT = "00000000-0000-0000-0000-000000000002";
const minimal = { namespaceId: ID, name: "app", registryImage: "example/app:1" };
function body() {
	expect(fetch).toHaveBeenCalledTimes(1);
	const request = fetch.mock.calls[0][0];
	expect(typeof request.body).toBe("string");
	expect(request.headers).toEqual({ "Content-Type": "application/json" });
	return JSON.parse(request.body);
}
beforeEach(() => {
	fetch.mockReset().mockResolvedValue({});
	auth.mockReset().mockReturnValue({ defaultRegion: "fr-par", defaultProjectId: PROJECT });
});

describe("removed container handlers", () => {
	it.each(["handleDeployContainer", "handleCreateToken", "handleDeleteToken"])(
		"does not export %s",
		(handler) => {
			expect(handlers).not.toHaveProperty(handler);
		},
	);
});

describe("container v1 compatibility translations", () => {
	it("omits unspecified creation fields rather than sending legacy defaults", async () => {
		await handleCreateContainer({ ...minimal, description: undefined });
		expect(body()).toEqual({ namespace_id: ID, name: "app", image: "example/app:1" });
	});
	it("keeps an empty PATCH empty", async () => {
		await handleUpdateContainer({ containerId: ID });
		expect(body()).toEqual({});
	});
	it.each([true, false])(
		"uses the exact singular PATCH boolean field for %s",
		async (httpsConnectionsOnly) => {
			await handleUpdateContainer({ containerId: ID, httpsConnectionsOnly });
			expect(body()).toEqual({ https_connection_only: httpsConnectionsOnly });
		},
	);
	it.each([true, false])(
		"uses the exact plural create boolean field for %s",
		async (httpsConnectionsOnly) => {
			await handleCreateContainer({ ...minimal, httpsConnectionsOnly });
			expect(body()).toEqual({
				namespace_id: ID,
				name: "app",
				image: "example/app:1",
				https_connections_only: httpsConnectionsOnly,
			});
		},
	);
	it.each([undefined, false])(
		"translates legacy enabled with explicit boolean %s",
		async (httpsConnectionsOnly) => {
			await handleCreateContainer({ ...minimal, httpOption: "enabled", httpsConnectionsOnly });
			expect(body().https_connections_only).toBe(false);
		},
	);
	it("translates legacy enabled in PATCH", async () => {
		await handleUpdateContainer({ containerId: ID, httpOption: "enabled" });
		expect(body()).toEqual({ https_connection_only: false });
	});
	it.each(["redirected", "doNotForce"] as const)(
		"rejects %s before auth or transport",
		async (httpOption) => {
			const result = await handleCreateContainer({ ...minimal, httpOption });
			expect(result).toHaveProperty("isError", true);
			expect(JSON.parse(result.content[0].text).error).toMatchObject({
				type: "invalid_input",
				statusCode: 400,
			});
			expect(auth).not.toHaveBeenCalled();
			expect(fetch).not.toHaveBeenCalled();
		},
	);
	it("rejects conflicting HTTP semantics in PATCH before auth", async () => {
		expect(
			await handleUpdateContainer({
				containerId: ID,
				httpOption: "enabled",
				httpsConnectionsOnly: true,
			}),
		).toHaveProperty("isError", true);
		expect(auth).not.toHaveBeenCalled();
		expect(fetch).not.toHaveBeenCalled();
	});
	it.each([256, 512, 1024])(
		"converts %s MiB exactly, without changing CPU millicores",
		async (memoryLimit) => {
			await handleUpdateContainer({ containerId: ID, memoryLimit, cpuLimit: 140 });
			expect(body()).toEqual({ memory_limit_bytes: memoryLimit * 1048576, mvcpu_limit: 140 });
		},
	);
	it("uses the requested region", async () => {
		await handleCreateContainer({ ...minimal, region: "it-mil" });
		expect(fetch.mock.calls[0][0].path).toBe("/containers/v1/regions/it-mil/containers");
	});
});

describe("namespace v1 defaults and nested maps", () => {
	it("defaults projectId and omits unspecified values", async () => {
		await handleCreateNamespace({ name: "ns", description: undefined });
		expect(body()).toEqual({ name: "ns", project_id: PROJECT });
	});
	it("respects an explicit projectId", async () => {
		await handleCreateNamespace({ name: "ns", projectId: ID });
		expect(body()).toEqual({ name: "ns", project_id: ID });
	});
	it("leaves a namespace PATCH empty without resetting maps", async () => {
		await handleUpdateNamespace({ namespaceId: ID });
		expect(body()).toEqual({});
	});
	it("preserves arbitrary map keys while translating the secret array", async () => {
		await handleUpdateNamespace({
			namespaceId: ID,
			environmentVariables: { keepCamel: "KeepValue" },
			secretEnvironmentVariables: [
				{ key: "keepCamel", value: "KeepValue" },
				{ key: "OTHER", value: "" },
			],
		});
		expect(body()).toEqual({
			environment_variables: { keepCamel: "KeepValue" },
			secret_environment_variables: { keepCamel: "KeepValue", OTHER: "" },
		});
	});
	it.each([
		() =>
			handleCreateNamespace({
				name: "ns",
				secretEnvironmentVariables: [
					{ key: "A", value: "x" },
					{ key: "A", value: "y" },
				],
			}),
		() =>
			handleCreateContainer({
				...minimal,
				secretEnvironmentVariables: [
					{ key: "A", value: "x" },
					{ key: "A", value: "y" },
				],
			}),
	])("rejects duplicate secret keys rather than losing a value", async (invoke) => {
		const result = await invoke();
		expect(result).toHaveProperty("isError", true);
		expect(JSON.parse(result.content[0].text).error.statusCode).toBe(400);
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe("cron to trigger mapping", () => {
	it("creates a UTC JSON POST trigger when optional values are omitted", async () => {
		await handleCreateCron({ containerId: ID, schedule: "0 * * * *" });
		expect(body()).toEqual({
			container_id: ID,
			name: expect.stringMatching(/^cron-[0-9a-f-]{36}$/),
			destination_config: { http_path: "/", http_method: "post" },
			cron_config: {
				schedule: "0 * * * *",
				timezone: "UTC",
				body: "{}",
				headers: { "Content-Type": "application/json" },
			},
		});
	});
	it("name-only PATCH does not reset cron settings or headers", async () => {
		await handleUpdateCron({ cronId: ID, name: "new" });
		expect(body()).toEqual({ name: "new" });
	});
	it("empty PATCH does not materialize a cron_config", async () => {
		await handleUpdateCron({ cronId: ID });
		expect(body()).toEqual({});
	});
	it("schedule-only PATCH keeps timezone and body unchanged", async () => {
		await handleUpdateCron({ cronId: ID, schedule: "5 * * * *" });
		expect(body()).toEqual({ cron_config: { schedule: "5 * * * *" } });
	});
	it("args-only PATCH stringifies nested JSON without changing headers", async () => {
		await handleUpdateCron({ cronId: ID, args: { keepCamel: { nested: [false, null, "value"] } } });
		expect(body()).toEqual({
			cron_config: { body: '{"keepCamel":{"nested":[false,null,"value"]}}' },
		});
	});
	it("timezone-only PATCH leaves everything else untouched", async () => {
		await handleUpdateCron({ cronId: ID, timezone: "Europe/Paris" });
		expect(body()).toEqual({ cron_config: { timezone: "Europe/Paris" } });
	});
	it("rejects retargeting instead of dropping containerId", async () => {
		const result = await handleUpdateCron({ cronId: ID, containerId: PROJECT, name: "new" });
		expect(result).toHaveProperty("isError", true);
		expect(JSON.parse(result.content[0].text).error.type).toBe("unsupported_operation");
		expect(auth).not.toHaveBeenCalled();
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe("list query omission", () => {
	it("omits absent namespace filters", async () => {
		fetch.mockResolvedValueOnce({ namespaces: [], total_count: 0 });
		await handleListNamespaces({ page: 1, pageSize: 50 });
		expect(fetch.mock.calls[0][0].urlParams.toString()).toBe("page=1&page_size=50");
	});
	it("omits an absent container name", async () => {
		fetch.mockResolvedValueOnce({ containers: [], total_count: 0 });
		await handleListContainers({ namespaceId: ID, page: 1, pageSize: 50 });
		expect(fetch.mock.calls[0][0].urlParams.toString()).toBe(
			`page=1&page_size=50&namespace_id=${ID}`,
		);
	});
});
