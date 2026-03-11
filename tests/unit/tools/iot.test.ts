import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleCreateDevice,
	handleCreateHub,
	handleCreateNetwork,
	handleCreateRoute,
	handleDeleteDevice,
	handleDeleteHub,
	handleDeleteNetwork,
	handleDeleteRoute,
	handleDisableDevice,
	handleDisableHub,
	handleEnableDevice,
	handleEnableHub,
	handleGetDevice,
	handleGetDeviceCertificate,
	handleGetDeviceMetrics,
	handleGetHub,
	handleGetHubCA,
	handleGetNetwork,
	handleGetRoute,
	handleListDevices,
	handleListHubs,
	handleListNetworks,
	handleListRoutes,
	handleRenewDeviceCertificate,
	handleSetDeviceCertificate,
	handleSetHubCA,
	handleUpdateDevice,
	handleUpdateHub,
	handleUpdateRoute,
} from "../../../src/tools/iot/handlers.js";
import { registerIotTools } from "../../../src/tools/iot/index.js";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock environment variables
beforeEach(() => {
	vi.stubEnv("SCW_ACCESS_KEY", "SCWTEST1234567890123");
	vi.stubEnv("SCW_SECRET_KEY", "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
	vi.stubEnv("SCW_DEFAULT_PROJECT_ID", "11111111-1111-1111-1111-111111111111");
	vi.stubEnv("SCW_DEFAULT_REGION", "fr-par");
	vi.stubEnv("SCW_DEFAULT_ZONE", "fr-par-1");
	mockFetch.mockReset();
});

afterEach(async () => {
	vi.unstubAllEnvs();
	// Reset the client singleton
	const { resetClient } = await import("../../../src/shared/client.js");
	resetClient();
});

function mockOkResponse(data: unknown) {
	return mockFetch.mockResolvedValueOnce({
		ok: true,
		status: 200,
		json: () => Promise.resolve(data),
	});
}

function mockErrorResponse(status: number, statusText: string) {
	return mockFetch.mockResolvedValueOnce({
		ok: false,
		status,
		statusText,
	});
}

function mock204Response() {
	return mockFetch.mockResolvedValueOnce({
		ok: true,
		status: 204,
	});
}

// biome-ignore lint/suspicious/noExplicitAny: test helper
type AnyParams = any;

describe("iot module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerIotTools(server)).not.toThrow();
	});
});

// === Hub handler tests ===

describe("handleListHubs", () => {
	it("returns paginated hubs list", async () => {
		const hubsData = { hubs: [{ id: "hub-1", name: "test-hub" }], total_count: 1 };
		mockOkResponse(hubsData);

		const result = await handleListHubs({} as AnyParams);
		expect(result.content[0].type).toBe("text");
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.items).toEqual(hubsData.hubs);
		expect(parsed.totalCount).toBe(1);
		expect(parsed.page).toBe(1);
		expect(parsed.pageSize).toBe(50);
	});

	it("passes optional filters to query", async () => {
		mockOkResponse({ hubs: [], total_count: 0 });

		await handleListHubs({
			region: "nl-ams",
			page: 2,
			pageSize: 10,
			orderBy: "name_asc",
			projectId: "22222222-2222-2222-2222-222222222222",
			name: "my-hub",
		});

		const url = mockFetch.mock.calls[0][0];
		expect(url).toContain("nl-ams");
		expect(url).toContain("page=2");
		expect(url).toContain("page_size=10");
		expect(url).toContain("order_by=name_asc");
		expect(url).toContain("project_id=22222222-2222-2222-2222-222222222222");
		expect(url).toContain("name=my-hub");
	});

	it("handles API errors", async () => {
		mockErrorResponse(500, "Internal Server Error");
		const result = await handleListHubs({} as AnyParams);
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleGetHub", () => {
	it("returns hub details", async () => {
		const hub = { id: "hub-1", name: "test-hub", status: "ready" };
		mockOkResponse(hub);

		const result = await handleGetHub({
			hubId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.name).toBe("test-hub");
	});

	it("handles not found", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleGetHub({
			hubId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.error.type).toBe("not_found");
	});
});

describe("handleCreateHub", () => {
	it("creates a hub with minimal params", async () => {
		const hub = { id: "hub-new", name: "new-hub" };
		mockOkResponse(hub);

		const result = await handleCreateHub({ name: "new-hub" } as AnyParams);
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.name).toBe("new-hub");

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.name).toBe("new-hub");
		expect(body.product_plan).toBe("plan_shared");
	});

	it("creates a hub with all params", async () => {
		mockOkResponse({ id: "hub-new" });

		await handleCreateHub({
			name: "full-hub",
			projectId: "22222222-2222-2222-2222-222222222222",
			productPlan: "plan_dedicated",
			disableEvents: true,
			eventsTopicPrefix: "my-prefix",
			twinsGraphiteConfig: { pushUri: "https://graphite.example.com" },
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.name).toBe("full-hub");
		expect(body.project_id).toBe("22222222-2222-2222-2222-222222222222");
		expect(body.product_plan).toBe("plan_dedicated");
		expect(body.disable_events).toBe(true);
		expect(body.events_topic_prefix).toBe("my-prefix");
		expect(body.twins_graphite_config.push_uri).toBe("https://graphite.example.com");
	});

	it("handles API errors", async () => {
		mockErrorResponse(400, "Bad Request");
		const result = await handleCreateHub({ name: "bad" } as AnyParams);
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleUpdateHub", () => {
	it("updates a hub with partial params", async () => {
		mockOkResponse({ id: "hub-1", name: "updated-hub" });

		await handleUpdateHub({
			hubId: "11111111-1111-1111-1111-111111111111",
			name: "updated-hub",
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.name).toBe("updated-hub");
	});

	it("updates a hub with all params", async () => {
		mockOkResponse({ id: "hub-1" });

		await handleUpdateHub({
			hubId: "11111111-1111-1111-1111-111111111111",
			name: "updated",
			productPlan: "plan_ha",
			disableEvents: false,
			eventsTopicPrefix: "new-prefix",
			enableDeviceAutoProvisioning: true,
			twinsGraphiteConfig: { pushUri: "https://graphite2.example.com" },
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.product_plan).toBe("plan_ha");
		expect(body.disable_events).toBe(false);
		expect(body.events_topic_prefix).toBe("new-prefix");
		expect(body.enable_device_auto_provisioning).toBe(true);
		expect(body.twins_graphite_config.push_uri).toBe("https://graphite2.example.com");
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleUpdateHub({
			hubId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleDeleteHub", () => {
	it("deletes a hub", async () => {
		mock204Response();

		const result = await handleDeleteHub({
			hubId: "11111111-1111-1111-1111-111111111111",
		});
		expect(result.content[0].type).toBe("text");
	});

	it("passes deleteDevices query param", async () => {
		mock204Response();

		await handleDeleteHub({
			hubId: "11111111-1111-1111-1111-111111111111",
			deleteDevices: true,
		});

		const url = mockFetch.mock.calls[0][0];
		expect(url).toContain("delete_devices=true");
	});

	it("handles errors", async () => {
		mockErrorResponse(403, "Forbidden");
		const result = await handleDeleteHub({
			hubId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleEnableHub", () => {
	it("enables a hub", async () => {
		mockOkResponse({ id: "hub-1", status: "enabled" });

		const result = await handleEnableHub({
			hubId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.status).toBe("enabled");
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleEnableHub({
			hubId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleDisableHub", () => {
	it("disables a hub", async () => {
		mockOkResponse({ id: "hub-1", status: "disabled" });

		const result = await handleDisableHub({
			hubId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.status).toBe("disabled");
	});

	it("handles errors", async () => {
		mockErrorResponse(500, "Server Error");
		const result = await handleDisableHub({
			hubId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleGetHubCA", () => {
	it("returns hub CA certificate", async () => {
		mockOkResponse({ ca_cert_pem: "-----BEGIN CERTIFICATE-----" });

		const result = await handleGetHubCA({
			hubId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.ca_cert_pem).toBeDefined();
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleGetHubCA({
			hubId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleSetHubCA", () => {
	it("sets hub CA certificate", async () => {
		mockOkResponse({});

		const result = await handleSetHubCA({
			hubId: "11111111-1111-1111-1111-111111111111",
			caCertPem: "-----BEGIN CERTIFICATE-----",
			challengeCertPem: "-----BEGIN CERTIFICATE-----",
		});
		expect(result.content[0].type).toBe("text");

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.ca_cert_pem).toBe("-----BEGIN CERTIFICATE-----");
		expect(body.challenge_cert_pem).toBe("-----BEGIN CERTIFICATE-----");
	});

	it("handles errors", async () => {
		mockErrorResponse(400, "Bad Request");
		const result = await handleSetHubCA({
			hubId: "11111111-1111-1111-1111-111111111111",
			caCertPem: "bad",
			challengeCertPem: "bad",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

// === Device handler tests ===

describe("handleListDevices", () => {
	it("returns paginated devices list", async () => {
		const devicesData = {
			devices: [{ id: "dev-1", name: "sensor" }],
			total_count: 1,
		};
		mockOkResponse(devicesData);

		const result = await handleListDevices({} as AnyParams);
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.items).toEqual(devicesData.devices);
		expect(parsed.totalCount).toBe(1);
	});

	it("passes optional filters", async () => {
		mockOkResponse({ devices: [], total_count: 0 });

		await handleListDevices({
			region: "nl-ams",
			page: 3,
			pageSize: 20,
			orderBy: "name_desc",
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "sensor",
			allowInsecure: true,
			status: "enabled",
		});

		const url = mockFetch.mock.calls[0][0];
		expect(url).toContain("nl-ams");
		expect(url).toContain("page=3");
		expect(url).toContain("page_size=20");
		expect(url).toContain("order_by=name_desc");
		expect(url).toContain("hub_id=22222222-2222-2222-2222-222222222222");
		expect(url).toContain("name=sensor");
		expect(url).toContain("allow_insecure=true");
		expect(url).toContain("status=enabled");
	});

	it("handles errors", async () => {
		mockErrorResponse(401, "Unauthorized");
		const result = await handleListDevices({} as AnyParams);
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleGetDevice", () => {
	it("returns device details", async () => {
		mockOkResponse({ id: "dev-1", name: "sensor", status: "enabled" });

		const result = await handleGetDevice({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.name).toBe("sensor");
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleGetDevice({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleCreateDevice", () => {
	it("creates a device with minimal params", async () => {
		mockOkResponse({ id: "dev-new", name: "new-sensor" });

		const result = await handleCreateDevice({
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "new-sensor",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.name).toBe("new-sensor");

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.hub_id).toBe("22222222-2222-2222-2222-222222222222");
		expect(body.name).toBe("new-sensor");
	});

	it("creates a device with all params", async () => {
		mockOkResponse({ id: "dev-new" });

		await handleCreateDevice({
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "full-sensor",
			allowInsecure: false,
			allowMultipleConnections: true,
			messageFilters: {
				publish: { policy: "accept", topics: ["temp/#"] },
				subscribe: { policy: "reject", topics: ["admin/#"] },
			},
			description: "A temperature sensor",
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.allow_insecure).toBe(false);
		expect(body.allow_multiple_connections).toBe(true);
		expect(body.message_filters.publish.policy).toBe("accept");
		expect(body.message_filters.publish.topics).toEqual(["temp/#"]);
		expect(body.message_filters.subscribe.policy).toBe("reject");
		expect(body.description).toBe("A temperature sensor");
	});

	it("handles errors", async () => {
		mockErrorResponse(400, "Bad Request");
		const result = await handleCreateDevice({
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "bad",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleUpdateDevice", () => {
	it("updates a device with partial params", async () => {
		mockOkResponse({ id: "dev-1", name: "updated-sensor" });

		await handleUpdateDevice({
			deviceId: "11111111-1111-1111-1111-111111111111",
			name: "updated-sensor",
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.name).toBe("updated-sensor");
	});

	it("updates a device with all params", async () => {
		mockOkResponse({ id: "dev-1" });

		await handleUpdateDevice({
			deviceId: "11111111-1111-1111-1111-111111111111",
			name: "updated",
			allowInsecure: true,
			allowMultipleConnections: false,
			messageFilters: {
				publish: { policy: "reject", topics: [] },
				subscribe: { policy: "accept", topics: ["data/#"] },
			},
			hubId: "33333333-3333-3333-3333-333333333333",
			description: "Updated desc",
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.allow_insecure).toBe(true);
		expect(body.allow_multiple_connections).toBe(false);
		expect(body.hub_id).toBe("33333333-3333-3333-3333-333333333333");
		expect(body.description).toBe("Updated desc");
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleUpdateDevice({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleDeleteDevice", () => {
	it("deletes a device", async () => {
		mock204Response();

		const result = await handleDeleteDevice({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		expect(result.content[0].type).toBe("text");
	});

	it("handles errors", async () => {
		mockErrorResponse(403, "Forbidden");
		const result = await handleDeleteDevice({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleEnableDevice", () => {
	it("enables a device", async () => {
		mockOkResponse({ id: "dev-1", status: "enabled" });

		const result = await handleEnableDevice({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.status).toBe("enabled");
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleEnableDevice({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleDisableDevice", () => {
	it("disables a device", async () => {
		mockOkResponse({ id: "dev-1", status: "disabled" });

		const result = await handleDisableDevice({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.status).toBe("disabled");
	});

	it("handles errors", async () => {
		mockErrorResponse(500, "Server Error");
		const result = await handleDisableDevice({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleGetDeviceCertificate", () => {
	it("returns device certificate", async () => {
		mockOkResponse({ certificate_pem: "-----BEGIN CERTIFICATE-----" });

		const result = await handleGetDeviceCertificate({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.certificate_pem).toBeDefined();
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleGetDeviceCertificate({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleRenewDeviceCertificate", () => {
	it("renews device certificate", async () => {
		mockOkResponse({ certificate_pem: "-----BEGIN CERTIFICATE-----NEW" });

		const result = await handleRenewDeviceCertificate({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.certificate_pem).toBeDefined();
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleRenewDeviceCertificate({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleSetDeviceCertificate", () => {
	it("sets device certificate", async () => {
		mockOkResponse({});

		const result = await handleSetDeviceCertificate({
			deviceId: "11111111-1111-1111-1111-111111111111",
			certificatePem: "-----BEGIN CERTIFICATE-----",
		});
		expect(result.content[0].type).toBe("text");

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.certificate_pem).toBe("-----BEGIN CERTIFICATE-----");
	});

	it("handles errors", async () => {
		mockErrorResponse(400, "Bad Request");
		const result = await handleSetDeviceCertificate({
			deviceId: "11111111-1111-1111-1111-111111111111",
			certificatePem: "bad",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleGetDeviceMetrics", () => {
	it("returns device metrics", async () => {
		mockOkResponse({ metrics: [{ name: "msg_count", points: [] }] });

		const result = await handleGetDeviceMetrics({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.metrics).toBeDefined();
	});

	it("passes startDate query param", async () => {
		mockOkResponse({ metrics: [] });

		await handleGetDeviceMetrics({
			deviceId: "11111111-1111-1111-1111-111111111111",
			startDate: "2024-01-01T00:00:00Z",
		});

		const url = mockFetch.mock.calls[0][0];
		expect(url).toContain("start_date=2024-01-01T00%3A00%3A00Z");
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleGetDeviceMetrics({
			deviceId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

// === Route handler tests ===

describe("handleListRoutes", () => {
	it("returns paginated routes list", async () => {
		const routesData = {
			routes: [{ id: "route-1", name: "s3-route" }],
			total_count: 1,
		};
		mockOkResponse(routesData);

		const result = await handleListRoutes({} as AnyParams);
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.items).toEqual(routesData.routes);
		expect(parsed.totalCount).toBe(1);
	});

	it("passes optional filters", async () => {
		mockOkResponse({ routes: [], total_count: 0 });

		await handleListRoutes({
			region: "nl-ams",
			page: 2,
			pageSize: 25,
			orderBy: "name_asc",
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "my-route",
		});

		const url = mockFetch.mock.calls[0][0];
		expect(url).toContain("nl-ams");
		expect(url).toContain("page=2");
		expect(url).toContain("page_size=25");
		expect(url).toContain("order_by=name_asc");
		expect(url).toContain("hub_id=22222222-2222-2222-2222-222222222222");
		expect(url).toContain("name=my-route");
	});

	it("handles errors", async () => {
		mockErrorResponse(500, "Server Error");
		const result = await handleListRoutes({} as AnyParams);
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleGetRoute", () => {
	it("returns route details", async () => {
		mockOkResponse({ id: "route-1", name: "s3-route", type: "s3" });

		const result = await handleGetRoute({
			routeId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.name).toBe("s3-route");
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleGetRoute({
			routeId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleCreateRoute", () => {
	it("creates a route with S3 config", async () => {
		mockOkResponse({ id: "route-new", name: "s3-route" });

		await handleCreateRoute({
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "s3-route",
			topic: "devices/+/data",
			s3Config: {
				bucketRegion: "fr-par",
				bucketName: "my-bucket",
				objectPrefix: "iot/",
				strategy: "per_topic",
			},
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.hub_id).toBe("22222222-2222-2222-2222-222222222222");
		expect(body.name).toBe("s3-route");
		expect(body.topic).toBe("devices/+/data");
		expect(body.s3_config.bucket_region).toBe("fr-par");
		expect(body.s3_config.bucket_name).toBe("my-bucket");
		expect(body.s3_config.object_prefix).toBe("iot/");
		expect(body.s3_config.strategy).toBe("per_topic");
	});

	it("creates a route with DB config", async () => {
		mockOkResponse({ id: "route-new" });

		await handleCreateRoute({
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "db-route",
			topic: "devices/+/data",
			dbConfig: {
				host: "db.example.com",
				port: 5432,
				dbname: "iot_data",
				username: "iot_user",
				password: "secret",
				query: "INSERT INTO data VALUES ($TOPIC, $PAYLOAD)",
				engine: "postgresql",
			},
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.db_config.host).toBe("db.example.com");
		expect(body.db_config.port).toBe(5432);
		expect(body.db_config.engine).toBe("postgresql");
	});

	it("creates a route with REST config", async () => {
		mockOkResponse({ id: "route-new" });

		await handleCreateRoute({
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "rest-route",
			topic: "devices/+/data",
			restConfig: {
				verb: "post",
				uri: "https://api.example.com/data",
				headers: { Authorization: "Bearer token" },
			},
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.rest_config.verb).toBe("post");
		expect(body.rest_config.uri).toBe("https://api.example.com/data");
		expect(body.rest_config.headers.Authorization).toBe("Bearer token");
	});

	it("handles errors", async () => {
		mockErrorResponse(400, "Bad Request");
		const result = await handleCreateRoute({
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "bad",
			topic: "bad",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleUpdateRoute", () => {
	it("updates a route with name and topic", async () => {
		mockOkResponse({ id: "route-1", name: "updated-route" });

		await handleUpdateRoute({
			routeId: "11111111-1111-1111-1111-111111111111",
			name: "updated-route",
			topic: "new/topic",
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.name).toBe("updated-route");
		expect(body.topic).toBe("new/topic");
	});

	it("updates a route with S3 config", async () => {
		mockOkResponse({ id: "route-1" });

		await handleUpdateRoute({
			routeId: "11111111-1111-1111-1111-111111111111",
			s3Config: {
				bucketRegion: "nl-ams",
				bucketName: "new-bucket",
				strategy: "per_message",
			},
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.s3_config.bucket_region).toBe("nl-ams");
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleUpdateRoute({
			routeId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleDeleteRoute", () => {
	it("deletes a route", async () => {
		mock204Response();

		const result = await handleDeleteRoute({
			routeId: "11111111-1111-1111-1111-111111111111",
		});
		expect(result.content[0].type).toBe("text");
	});

	it("handles errors", async () => {
		mockErrorResponse(403, "Forbidden");
		const result = await handleDeleteRoute({
			routeId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

// === Network handler tests ===

describe("handleListNetworks", () => {
	it("returns paginated networks list", async () => {
		const networksData = {
			networks: [{ id: "net-1", name: "sigfox-net" }],
			total_count: 1,
		};
		mockOkResponse(networksData);

		const result = await handleListNetworks({} as AnyParams);
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.items).toEqual(networksData.networks);
		expect(parsed.totalCount).toBe(1);
	});

	it("passes optional filters", async () => {
		mockOkResponse({ networks: [], total_count: 0 });

		await handleListNetworks({
			region: "nl-ams",
			page: 2,
			pageSize: 10,
			orderBy: "name_desc",
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "my-network",
			topicPrefix: "sigfox",
		});

		const url = mockFetch.mock.calls[0][0];
		expect(url).toContain("nl-ams");
		expect(url).toContain("page=2");
		expect(url).toContain("page_size=10");
		expect(url).toContain("order_by=name_desc");
		expect(url).toContain("hub_id=22222222-2222-2222-2222-222222222222");
		expect(url).toContain("name=my-network");
		expect(url).toContain("topic_prefix=sigfox");
	});

	it("handles errors", async () => {
		mockErrorResponse(500, "Server Error");
		const result = await handleListNetworks({} as AnyParams);
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleGetNetwork", () => {
	it("returns network details", async () => {
		mockOkResponse({ id: "net-1", name: "sigfox-net", type: "sigfox" });

		const result = await handleGetNetwork({
			networkId: "11111111-1111-1111-1111-111111111111",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.name).toBe("sigfox-net");
	});

	it("handles errors", async () => {
		mockErrorResponse(404, "Not Found");
		const result = await handleGetNetwork({
			networkId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleCreateNetwork", () => {
	it("creates a network", async () => {
		mockOkResponse({ id: "net-new", name: "new-network" });

		await handleCreateNetwork({
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "new-network",
			type: "sigfox",
			topicPrefix: "sigfox/devices",
		});

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.hub_id).toBe("22222222-2222-2222-2222-222222222222");
		expect(body.name).toBe("new-network");
		expect(body.type).toBe("sigfox");
		expect(body.topic_prefix).toBe("sigfox/devices");
	});

	it("handles errors", async () => {
		mockErrorResponse(400, "Bad Request");
		const result = await handleCreateNetwork({
			hubId: "22222222-2222-2222-2222-222222222222",
			name: "bad",
			type: "unknown",
			topicPrefix: "bad",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});

describe("handleDeleteNetwork", () => {
	it("deletes a network", async () => {
		mock204Response();

		const result = await handleDeleteNetwork({
			networkId: "11111111-1111-1111-1111-111111111111",
		});
		expect(result.content[0].type).toBe("text");
	});

	it("handles errors", async () => {
		mockErrorResponse(403, "Forbidden");
		const result = await handleDeleteNetwork({
			networkId: "11111111-1111-1111-1111-111111111111",
		});
		expect((result as AnyParams).isError).toBe(true);
	});
});
