import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
} from "./handlers.js";
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
} from "./types.js";

export function registerIotTools(server: McpServer): void {
	// === Hub tools ===

	server.tool(
		"scaleway_iot_list_hubs",
		"List IoT hubs with optional filtering by project, name, and sorting",
		ListHubsParams.shape,
		async (params) => handleListHubs(ListHubsParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_get_hub",
		"Get details of a specific IoT hub",
		GetHubParams.shape,
		async (params) => handleGetHub(GetHubParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_create_hub",
		"Create a new IoT hub with the specified product plan and configuration",
		CreateHubParams.shape,
		async (params) => handleCreateHub(CreateHubParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_update_hub",
		"Update an existing IoT hub's name, plan, or configuration",
		UpdateHubParams.shape,
		async (params) => handleUpdateHub(UpdateHubParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_delete_hub",
		"Delete an IoT hub, optionally deleting all associated devices",
		DeleteHubParams.shape,
		async (params) => handleDeleteHub(DeleteHubParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_enable_hub",
		"Enable a disabled IoT hub",
		EnableHubParams.shape,
		async (params) => handleEnableHub(EnableHubParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_disable_hub",
		"Disable an active IoT hub",
		DisableHubParams.shape,
		async (params) => handleDisableHub(DisableHubParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_get_hub_ca",
		"Get the CA certificate of an IoT hub",
		GetHubCAParams.shape,
		async (params) => handleGetHubCA(GetHubCAParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_set_hub_ca",
		"Set a custom CA certificate for an IoT hub",
		SetHubCAParams.shape,
		async (params) => handleSetHubCA(SetHubCAParams.parse(params)),
	);

	// === Device tools ===

	server.tool(
		"scaleway_iot_list_devices",
		"List IoT devices with optional filtering by hub, name, status",
		ListDevicesParams.shape,
		async (params) => handleListDevices(ListDevicesParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_get_device",
		"Get details of a specific IoT device",
		GetDeviceParams.shape,
		async (params) => handleGetDevice(GetDeviceParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_create_device",
		"Create a new IoT device attached to a hub",
		CreateDeviceParams.shape,
		async (params) => handleCreateDevice(CreateDeviceParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_update_device",
		"Update an existing IoT device's configuration",
		UpdateDeviceParams.shape,
		async (params) => handleUpdateDevice(UpdateDeviceParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_delete_device",
		"Delete an IoT device",
		DeleteDeviceParams.shape,
		async (params) => handleDeleteDevice(DeleteDeviceParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_enable_device",
		"Enable a disabled IoT device",
		EnableDeviceParams.shape,
		async (params) => handleEnableDevice(EnableDeviceParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_disable_device",
		"Disable an active IoT device",
		DisableDeviceParams.shape,
		async (params) => handleDisableDevice(DisableDeviceParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_get_device_certificate",
		"Get the certificate of an IoT device",
		GetDeviceCertificateParams.shape,
		async (params) => handleGetDeviceCertificate(GetDeviceCertificateParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_renew_device_certificate",
		"Renew the certificate of an IoT device",
		RenewDeviceCertificateParams.shape,
		async (params) => handleRenewDeviceCertificate(RenewDeviceCertificateParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_set_device_certificate",
		"Set a custom certificate for an IoT device",
		SetDeviceCertificateParams.shape,
		async (params) => handleSetDeviceCertificate(SetDeviceCertificateParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_get_device_metrics",
		"Get metrics for an IoT device",
		GetDeviceMetricsParams.shape,
		async (params) => handleGetDeviceMetrics(GetDeviceMetricsParams.parse(params)),
	);

	// === Route tools ===

	server.tool(
		"scaleway_iot_list_routes",
		"List IoT routes with optional filtering by hub and name",
		ListRoutesParams.shape,
		async (params) => handleListRoutes(ListRoutesParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_get_route",
		"Get details of a specific IoT route",
		GetRouteParams.shape,
		async (params) => handleGetRoute(GetRouteParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_create_route",
		"Create a new IoT route (S3, database, or REST) for a hub",
		CreateRouteParams.shape,
		async (params) => handleCreateRoute(CreateRouteParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_update_route",
		"Update an existing IoT route's configuration",
		UpdateRouteParams.shape,
		async (params) => handleUpdateRoute(UpdateRouteParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_delete_route",
		"Delete an IoT route",
		DeleteRouteParams.shape,
		async (params) => handleDeleteRoute(DeleteRouteParams.parse(params)),
	);

	// === Network tools ===

	server.tool(
		"scaleway_iot_list_networks",
		"List IoT networks with optional filtering by hub and name",
		ListNetworksParams.shape,
		async (params) => handleListNetworks(ListNetworksParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_get_network",
		"Get details of a specific IoT network",
		GetNetworkParams.shape,
		async (params) => handleGetNetwork(GetNetworkParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_create_network",
		"Create a new IoT network for a hub",
		CreateNetworkParams.shape,
		async (params) => handleCreateNetwork(CreateNetworkParams.parse(params)),
	);

	server.tool(
		"scaleway_iot_delete_network",
		"Delete an IoT network",
		DeleteNetworkParams.shape,
		async (params) => handleDeleteNetwork(DeleteNetworkParams.parse(params)),
	);
}
