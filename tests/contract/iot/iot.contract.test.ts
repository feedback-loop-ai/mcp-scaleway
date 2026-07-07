/**
 * Contract tests for Scaleway IoT Hub API
 *
 * Validates request/response shapes against specs/scaleway-api/iot/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * API base: https://api.scaleway.com/iot/v1/regions/{region}
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	CreateDeviceParams,
	CreateHubParams,
	CreateNetworkParams,
	CreateRouteParams,
	DeleteDeviceParams,
	DeleteHubParams,
	DeleteNetworkParams,
	DeleteRouteParams,
	DisableDeviceParams,
	DisableHubParams,
	EnableDeviceParams,
	EnableHubParams,
	GetDeviceCertificateParams,
	GetDeviceMetricsParams,
	GetDeviceParams,
	GetHubCAParams,
	GetHubParams,
	GetNetworkParams,
	GetRouteParams,
	ListDevicesParams,
	ListHubsParams,
	ListNetworksParams,
	ListRoutesParams,
	RenewDeviceCertificateParams,
	SetDeviceCertificateParams,
	SetHubCAParams,
	UpdateDeviceParams,
	UpdateHubParams,
	UpdateRouteParams,
} from "../../../src/tools/iot/types.js";

// --- Shared fixtures ---

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const REGION = "fr-par";

// --- Response shape contracts (documented Scaleway shapes) ---

const Hub = z.object({
	id: z.string(),
	name: z.string(),
	status: z.string(),
	product_plan: z.string(),
	enabled: z.boolean(),
	device_count: z.number().int(),
	connected_device_count: z.number().int(),
	endpoint: z.string(),
	region: z.string(),
	project_id: z.string(),
	organization_id: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
});

const Device = z.object({
	id: z.string(),
	name: z.string(),
	status: z.string(),
	hub_id: z.string(),
	allow_insecure: z.boolean(),
	allow_multiple_connections: z.boolean(),
	is_connected: z.boolean(),
	created_at: z.string(),
	updated_at: z.string(),
});

const validHub = {
	id: VALID_UUID,
	name: "my-hub",
	status: "ready",
	product_plan: "plan_shared",
	enabled: true,
	device_count: 3,
	connected_device_count: 1,
	endpoint: "iot.fr-par.scw.cloud",
	region: REGION,
	project_id: VALID_UUID,
	organization_id: VALID_UUID,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
};

const validDevice = {
	id: VALID_UUID,
	name: "sensor-01",
	status: "enabled",
	hub_id: VALID_UUID,
	allow_insecure: false,
	allow_multiple_connections: false,
	is_connected: true,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
};

// === Hubs ===

/**
 * API: GET /iot/v1/regions/{region}/hubs
 * Spec: specs/scaleway-api/iot/api-reference.md#list-hubs
 */
describe("contract: ListHubs", () => {
	const ListHubsResponse = z.object({ hubs: z.array(Hub), total_count: z.number().int() });

	it("validates a hubs response", () => {
		expect(() => ListHubsResponse.parse({ hubs: [validHub], total_count: 1 })).not.toThrow();
	});

	it("validates minimal request (region optional)", () => {
		expect(() => ListHubsParams.parse({})).not.toThrow();
	});

	it("validates request with all filters", () => {
		const input = {
			region: REGION,
			orderBy: "name_asc",
			projectId: VALID_UUID,
			name: "hub",
			page: 2,
			pageSize: 25,
		};
		expect(() => ListHubsParams.parse(input)).not.toThrow();
	});

	it("rejects invalid orderBy", () => {
		expect(() => ListHubsParams.parse({ orderBy: "bogus" })).toThrow();
	});

	it("rejects invalid region format", () => {
		expect(() => ListHubsParams.parse({ region: "invalid" })).toThrow();
	});
});

/**
 * API: GET/PATCH/DELETE /iot/v1/regions/{region}/hubs/{hub_id}
 * Spec: specs/scaleway-api/iot/api-reference.md#hubs
 */
describe("contract: Hub CRUD", () => {
	it("validates get hub", () => {
		expect(() => GetHubParams.parse({ hubId: VALID_UUID })).not.toThrow();
	});

	it("rejects get hub with non-uuid", () => {
		expect(() => GetHubParams.parse({ hubId: "not-a-uuid" })).toThrow();
	});

	it("validates create hub with product_plan default", () => {
		const result = CreateHubParams.parse({ name: "hub" });
		expect(result.productPlan).toBe("plan_shared");
	});

	it("validates full create hub", () => {
		const input = {
			region: REGION,
			name: "hub",
			projectId: VALID_UUID,
			productPlan: "plan_ha",
			disableEvents: true,
			eventsTopicPrefix: "events",
			twinsGraphiteConfig: { pushUri: "https://graphite.example.com" },
		};
		expect(() => CreateHubParams.parse(input)).not.toThrow();
	});

	it("rejects create hub with empty name", () => {
		expect(() => CreateHubParams.parse({ name: "" })).toThrow();
	});

	it("rejects invalid product_plan", () => {
		expect(() => CreateHubParams.parse({ name: "hub", productPlan: "plan_free" })).toThrow();
	});

	it("validates update hub", () => {
		const input = {
			hubId: VALID_UUID,
			name: "renamed",
			productPlan: "plan_dedicated",
			enableDeviceAutoProvisioning: true,
			twinsGraphiteConfig: { pushUri: "https://graphite.example.com" },
		};
		expect(() => UpdateHubParams.parse(input)).not.toThrow();
	});

	it("validates delete hub with deleteDevices", () => {
		expect(() => DeleteHubParams.parse({ hubId: VALID_UUID, deleteDevices: true })).not.toThrow();
	});
});

/**
 * API: POST /iot/v1/regions/{region}/hubs/{hub_id}/enable|disable
 * Spec: specs/scaleway-api/iot/api-reference.md#hubs
 */
describe("contract: Hub enable/disable", () => {
	it("validates enable and disable", () => {
		expect(() => EnableHubParams.parse({ hubId: VALID_UUID })).not.toThrow();
		expect(() => DisableHubParams.parse({ hubId: VALID_UUID })).not.toThrow();
	});
});

/**
 * API: GET/POST /iot/v1/regions/{region}/hubs/{hub_id}/ca
 * Spec: specs/scaleway-api/iot/api-reference.md#hub-certificate-authority
 */
describe("contract: Hub CA", () => {
	it("validates get hub CA", () => {
		expect(() => GetHubCAParams.parse({ hubId: VALID_UUID })).not.toThrow();
	});

	it("validates set hub CA", () => {
		const input = {
			hubId: VALID_UUID,
			caCertPem: "-----BEGIN CERTIFICATE-----",
			challengeCertPem: "-----BEGIN CERTIFICATE-----",
		};
		expect(() => SetHubCAParams.parse(input)).not.toThrow();
	});

	it("rejects set hub CA with empty cert", () => {
		expect(() =>
			SetHubCAParams.parse({ hubId: VALID_UUID, caCertPem: "", challengeCertPem: "x" }),
		).toThrow();
	});
});

// === Devices ===

/**
 * API: GET /iot/v1/regions/{region}/devices
 * Spec: specs/scaleway-api/iot/api-reference.md#list-devices
 */
describe("contract: ListDevices", () => {
	const ListDevicesResponse = z.object({ devices: z.array(Device), total_count: z.number().int() });

	it("validates a devices response", () => {
		expect(() =>
			ListDevicesResponse.parse({ devices: [validDevice], total_count: 1 }),
		).not.toThrow();
	});

	it("validates request with all filters", () => {
		const input = {
			region: REGION,
			orderBy: "status_asc",
			hubId: VALID_UUID,
			name: "sensor",
			allowInsecure: true,
			status: "enabled",
		};
		expect(() => ListDevicesParams.parse(input)).not.toThrow();
	});

	it("rejects invalid status filter", () => {
		expect(() => ListDevicesParams.parse({ status: "online" })).toThrow();
	});
});

/**
 * API: GET/POST/PATCH/DELETE /iot/v1/regions/{region}/devices/{device_id}
 * Spec: specs/scaleway-api/iot/api-reference.md#devices
 */
describe("contract: Device CRUD", () => {
	it("validates get and delete device", () => {
		expect(() => GetDeviceParams.parse({ deviceId: VALID_UUID })).not.toThrow();
		expect(() => DeleteDeviceParams.parse({ deviceId: VALID_UUID })).not.toThrow();
	});

	it("validates minimal create device", () => {
		expect(() => CreateDeviceParams.parse({ hubId: VALID_UUID, name: "sensor" })).not.toThrow();
	});

	it("validates create device with message filters", () => {
		const input = {
			hubId: VALID_UUID,
			name: "sensor",
			allowInsecure: true,
			allowMultipleConnections: false,
			description: "temperature sensor",
			messageFilters: {
				publish: { policy: "accept", topics: ["telemetry/#"] },
				subscribe: { policy: "reject", topics: ["cmd/#"] },
			},
		};
		expect(() => CreateDeviceParams.parse(input)).not.toThrow();
	});

	it("rejects invalid message filter policy", () => {
		expect(() =>
			CreateDeviceParams.parse({
				hubId: VALID_UUID,
				name: "sensor",
				messageFilters: { publish: { policy: "allow" } },
			}),
		).toThrow();
	});

	it("validates update device (move hub)", () => {
		const input = { deviceId: VALID_UUID, name: "renamed", hubId: VALID_UUID, description: "d" };
		expect(() => UpdateDeviceParams.parse(input)).not.toThrow();
	});
});

/**
 * API: enable/disable/certificate/metrics on devices
 * Spec: specs/scaleway-api/iot/api-reference.md#devices
 */
describe("contract: Device actions", () => {
	it("validates enable/disable device", () => {
		expect(() => EnableDeviceParams.parse({ deviceId: VALID_UUID })).not.toThrow();
		expect(() => DisableDeviceParams.parse({ deviceId: VALID_UUID })).not.toThrow();
	});

	it("validates get/renew/set certificate", () => {
		expect(() => GetDeviceCertificateParams.parse({ deviceId: VALID_UUID })).not.toThrow();
		expect(() => RenewDeviceCertificateParams.parse({ deviceId: VALID_UUID })).not.toThrow();
		expect(() =>
			SetDeviceCertificateParams.parse({
				deviceId: VALID_UUID,
				certificatePem: "-----BEGIN CERTIFICATE-----",
			}),
		).not.toThrow();
	});

	it("rejects set certificate with empty pem", () => {
		expect(() =>
			SetDeviceCertificateParams.parse({ deviceId: VALID_UUID, certificatePem: "" }),
		).toThrow();
	});

	it("validates get device metrics with startDate", () => {
		expect(() =>
			GetDeviceMetricsParams.parse({ deviceId: VALID_UUID, startDate: "2025-06-01T00:00:00Z" }),
		).not.toThrow();
	});
});

// === Routes ===

/**
 * API: GET /iot/v1/regions/{region}/routes
 * Spec: specs/scaleway-api/iot/api-reference.md#list-routes
 */
describe("contract: ListRoutes", () => {
	const Route = z.object({
		id: z.string(),
		name: z.string(),
		hub_id: z.string(),
		topic: z.string(),
		type: z.string(),
		created_at: z.string(),
	});
	const ListRoutesResponse = z.object({ routes: z.array(Route), total_count: z.number().int() });

	it("validates a routes response", () => {
		const route = {
			id: VALID_UUID,
			name: "s3-route",
			hub_id: VALID_UUID,
			topic: "telemetry/#",
			type: "s3",
			created_at: "2025-06-01T12:00:00Z",
		};
		expect(() => ListRoutesResponse.parse({ routes: [route], total_count: 1 })).not.toThrow();
	});

	it("validates request with filters", () => {
		expect(() =>
			ListRoutesParams.parse({
				region: REGION,
				hubId: VALID_UUID,
				name: "route",
				orderBy: "type_asc",
			}),
		).not.toThrow();
	});
});

/**
 * API: GET/POST/PATCH/DELETE /iot/v1/regions/{region}/routes/{route_id}
 * Spec: specs/scaleway-api/iot/api-reference.md#routes
 */
describe("contract: Route CRUD", () => {
	it("validates get and delete route", () => {
		expect(() => GetRouteParams.parse({ routeId: VALID_UUID })).not.toThrow();
		expect(() => DeleteRouteParams.parse({ routeId: VALID_UUID })).not.toThrow();
	});

	it("validates create S3 route", () => {
		const input = {
			hubId: VALID_UUID,
			name: "s3-route",
			topic: "telemetry/#",
			s3Config: {
				bucketRegion: "fr-par",
				bucketName: "my-bucket",
				objectPrefix: "iot/",
				strategy: "per_topic",
			},
		};
		expect(() => CreateRouteParams.parse(input)).not.toThrow();
	});

	it("validates create DB route", () => {
		const input = {
			hubId: VALID_UUID,
			name: "db-route",
			topic: "telemetry/#",
			dbConfig: {
				host: "db.example.com",
				port: 5432,
				dbname: "iot",
				username: "u",
				password: "p",
				query: "INSERT INTO t VALUES ($PAYLOAD)",
				engine: "postgresql",
			},
		};
		expect(() => CreateRouteParams.parse(input)).not.toThrow();
	});

	it("validates create REST route", () => {
		const input = {
			hubId: VALID_UUID,
			name: "rest-route",
			topic: "telemetry/#",
			restConfig: { verb: "post", uri: "https://example.com/hook", headers: { "X-Key": "v" } },
		};
		expect(() => CreateRouteParams.parse(input)).not.toThrow();
	});

	it("rejects invalid S3 strategy", () => {
		expect(() =>
			CreateRouteParams.parse({
				hubId: VALID_UUID,
				name: "r",
				topic: "t",
				s3Config: { bucketRegion: "fr-par", bucketName: "b", strategy: "per_hour" },
			}),
		).toThrow();
	});

	it("validates update route", () => {
		expect(() =>
			UpdateRouteParams.parse({ routeId: VALID_UUID, name: "renamed", topic: "new/#" }),
		).not.toThrow();
	});
});

// === Networks ===

/**
 * API: GET /iot/v1/regions/{region}/networks
 * Spec: specs/scaleway-api/iot/api-reference.md#list-networks
 */
describe("contract: ListNetworks", () => {
	const Network = z.object({
		id: z.string(),
		name: z.string(),
		type: z.string(),
		hub_id: z.string(),
		topic_prefix: z.string(),
		created_at: z.string(),
	});
	const ListNetworksResponse = z.object({
		networks: z.array(Network),
		total_count: z.number().int(),
	});

	it("validates a networks response", () => {
		const network = {
			id: VALID_UUID,
			name: "sigfox-net",
			type: "sigfox",
			hub_id: VALID_UUID,
			topic_prefix: "sigfox",
			created_at: "2025-06-01T12:00:00Z",
		};
		expect(() => ListNetworksResponse.parse({ networks: [network], total_count: 1 })).not.toThrow();
	});

	it("validates request with filters", () => {
		expect(() =>
			ListNetworksParams.parse({
				region: REGION,
				hubId: VALID_UUID,
				name: "net",
				topicPrefix: "sigfox",
			}),
		).not.toThrow();
	});
});

/**
 * API: GET/POST/DELETE /iot/v1/regions/{region}/networks/{network_id}
 * Spec: specs/scaleway-api/iot/api-reference.md#networks
 */
describe("contract: Network CRUD", () => {
	it("validates get and delete network", () => {
		expect(() => GetNetworkParams.parse({ networkId: VALID_UUID })).not.toThrow();
		expect(() => DeleteNetworkParams.parse({ networkId: VALID_UUID })).not.toThrow();
	});

	it("validates create network", () => {
		const input = { hubId: VALID_UUID, name: "sigfox-net", type: "sigfox", topicPrefix: "sigfox" };
		expect(() => CreateNetworkParams.parse(input)).not.toThrow();
	});

	it("rejects invalid network type", () => {
		expect(() =>
			CreateNetworkParams.parse({
				hubId: VALID_UUID,
				name: "n",
				type: "lorawan",
				topicPrefix: "p",
			}),
		).toThrow();
	});

	it("rejects create network with empty topic prefix", () => {
		expect(() =>
			CreateNetworkParams.parse({ hubId: VALID_UUID, name: "n", type: "rest", topicPrefix: "" }),
		).toThrow();
	});
});

// --- Pagination contract ---

describe("contract: pagination", () => {
	it("rejects page size over 100", () => {
		expect(() => ListHubsParams.parse({ pageSize: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListDevicesParams.parse({ page: 0 })).toThrow();
	});
});
