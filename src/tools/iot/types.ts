import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// === Hub schemas ===

export const ListHubsParams = z.object({
	region: ScalewayRegion.optional().describe("Region to list hubs in (e.g., fr-par)"),
	page: PaginationParams.shape.page,
	pageSize: PaginationParams.shape.pageSize,
	orderBy: z
		.enum([
			"name_asc",
			"name_desc",
			"status_asc",
			"status_desc",
			"product_plan_asc",
			"product_plan_desc",
			"created_at_asc",
			"created_at_desc",
			"updated_at_asc",
			"updated_at_desc",
		])
		.optional()
		.describe("Sort order for results"),
	projectId: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by hub name"),
});
export type ListHubsParams = z.infer<typeof ListHubsParams>;

export const GetHubParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the hub"),
	hubId: z.string().uuid().describe("Hub ID"),
});
export type GetHubParams = z.infer<typeof GetHubParams>;

export const CreateHubParams = z.object({
	region: ScalewayRegion.optional().describe("Region to create the hub in"),
	name: z.string().min(1).describe("Hub name"),
	projectId: z.string().uuid().optional().describe("Project ID"),
	productPlan: z
		.enum(["plan_shared", "plan_dedicated", "plan_ha"])
		.optional()
		.default("plan_shared")
		.describe("Hub product plan"),
	disableEvents: z.boolean().optional().describe("Disable hub events"),
	eventsTopicPrefix: z.string().optional().describe("Topic prefix for hub events"),
	twinsGraphiteConfig: z
		.object({
			pushUri: z.string().describe("Graphite push URI"),
		})
		.optional()
		.describe("Twins Graphite configuration"),
});
export type CreateHubParams = z.infer<typeof CreateHubParams>;

export const UpdateHubParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the hub"),
	hubId: z.string().uuid().describe("Hub ID"),
	name: z.string().min(1).optional().describe("New hub name"),
	productPlan: z
		.enum(["plan_shared", "plan_dedicated", "plan_ha"])
		.optional()
		.describe("New product plan"),
	disableEvents: z.boolean().optional().describe("Disable hub events"),
	eventsTopicPrefix: z.string().optional().describe("Topic prefix for hub events"),
	enableDeviceAutoProvisioning: z.boolean().optional().describe("Enable device auto-provisioning"),
	twinsGraphiteConfig: z
		.object({
			pushUri: z.string().describe("Graphite push URI"),
		})
		.optional()
		.describe("Twins Graphite configuration"),
});
export type UpdateHubParams = z.infer<typeof UpdateHubParams>;

export const DeleteHubParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the hub"),
	hubId: z.string().uuid().describe("Hub ID"),
	deleteDevices: z.boolean().optional().describe("Also delete hub devices"),
});
export type DeleteHubParams = z.infer<typeof DeleteHubParams>;

export const EnableHubParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the hub"),
	hubId: z.string().uuid().describe("Hub ID"),
});
export type EnableHubParams = z.infer<typeof EnableHubParams>;

export const DisableHubParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the hub"),
	hubId: z.string().uuid().describe("Hub ID"),
});
export type DisableHubParams = z.infer<typeof DisableHubParams>;

export const GetHubCAParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the hub"),
	hubId: z.string().uuid().describe("Hub ID"),
});
export type GetHubCAParams = z.infer<typeof GetHubCAParams>;

export const SetHubCAParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the hub"),
	hubId: z.string().uuid().describe("Hub ID"),
	caCertPem: z.string().min(1).describe("CA certificate in PEM format"),
	challengeCertPem: z.string().min(1).describe("Challenge certificate in PEM format"),
});
export type SetHubCAParams = z.infer<typeof SetHubCAParams>;

// === Device schemas ===

export const ListDevicesParams = z.object({
	region: ScalewayRegion.optional().describe("Region to list devices in"),
	page: PaginationParams.shape.page,
	pageSize: PaginationParams.shape.pageSize,
	orderBy: z
		.enum([
			"name_asc",
			"name_desc",
			"status_asc",
			"status_desc",
			"hub_id_asc",
			"hub_id_desc",
			"created_at_asc",
			"created_at_desc",
			"updated_at_asc",
			"updated_at_desc",
			"allow_insecure_asc",
			"allow_insecure_desc",
		])
		.optional()
		.describe("Sort order for results"),
	hubId: z.string().uuid().optional().describe("Filter by hub ID"),
	name: z.string().optional().describe("Filter by device name"),
	allowInsecure: z.boolean().optional().describe("Filter by allow_insecure flag"),
	status: z
		.enum(["unknown", "error", "enabled", "disabled"])
		.optional()
		.describe("Filter by device status"),
});
export type ListDevicesParams = z.infer<typeof ListDevicesParams>;

export const GetDeviceParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the device"),
	deviceId: z.string().uuid().describe("Device ID"),
});
export type GetDeviceParams = z.infer<typeof GetDeviceParams>;

export const CreateDeviceParams = z.object({
	region: ScalewayRegion.optional().describe("Region to create the device in"),
	hubId: z.string().uuid().describe("Hub ID to attach the device to"),
	name: z.string().min(1).describe("Device name"),
	allowInsecure: z.boolean().optional().describe("Allow insecure connections"),
	allowMultipleConnections: z.boolean().optional().describe("Allow multiple connections"),
	messageFilters: z
		.object({
			publish: z
				.object({
					policy: z.enum(["unknown", "accept", "reject"]).optional(),
					topics: z.array(z.string()).optional(),
				})
				.optional(),
			subscribe: z
				.object({
					policy: z.enum(["unknown", "accept", "reject"]).optional(),
					topics: z.array(z.string()).optional(),
				})
				.optional(),
		})
		.optional()
		.describe("Device message filters"),
	description: z.string().optional().describe("Device description"),
});
export type CreateDeviceParams = z.infer<typeof CreateDeviceParams>;

export const UpdateDeviceParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the device"),
	deviceId: z.string().uuid().describe("Device ID"),
	name: z.string().min(1).optional().describe("New device name"),
	allowInsecure: z.boolean().optional().describe("Allow insecure connections"),
	allowMultipleConnections: z.boolean().optional().describe("Allow multiple connections"),
	messageFilters: z
		.object({
			publish: z
				.object({
					policy: z.enum(["unknown", "accept", "reject"]).optional(),
					topics: z.array(z.string()).optional(),
				})
				.optional(),
			subscribe: z
				.object({
					policy: z.enum(["unknown", "accept", "reject"]).optional(),
					topics: z.array(z.string()).optional(),
				})
				.optional(),
		})
		.optional()
		.describe("Device message filters"),
	hubId: z.string().uuid().optional().describe("Move device to a different hub"),
	description: z.string().optional().describe("Device description"),
});
export type UpdateDeviceParams = z.infer<typeof UpdateDeviceParams>;

export const DeleteDeviceParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the device"),
	deviceId: z.string().uuid().describe("Device ID"),
});
export type DeleteDeviceParams = z.infer<typeof DeleteDeviceParams>;

export const EnableDeviceParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the device"),
	deviceId: z.string().uuid().describe("Device ID"),
});
export type EnableDeviceParams = z.infer<typeof EnableDeviceParams>;

export const DisableDeviceParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the device"),
	deviceId: z.string().uuid().describe("Device ID"),
});
export type DisableDeviceParams = z.infer<typeof DisableDeviceParams>;

export const GetDeviceCertificateParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the device"),
	deviceId: z.string().uuid().describe("Device ID"),
});
export type GetDeviceCertificateParams = z.infer<typeof GetDeviceCertificateParams>;

export const RenewDeviceCertificateParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the device"),
	deviceId: z.string().uuid().describe("Device ID"),
});
export type RenewDeviceCertificateParams = z.infer<typeof RenewDeviceCertificateParams>;

export const SetDeviceCertificateParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the device"),
	deviceId: z.string().uuid().describe("Device ID"),
	certificatePem: z.string().min(1).describe("Certificate in PEM format"),
});
export type SetDeviceCertificateParams = z.infer<typeof SetDeviceCertificateParams>;

export const GetDeviceMetricsParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the device"),
	deviceId: z.string().uuid().describe("Device ID"),
	startDate: z.string().optional().describe("Start date for metrics (RFC 3339)"),
});
export type GetDeviceMetricsParams = z.infer<typeof GetDeviceMetricsParams>;

// === Route schemas ===

export const ListRoutesParams = z.object({
	region: ScalewayRegion.optional().describe("Region to list routes in"),
	page: PaginationParams.shape.page,
	pageSize: PaginationParams.shape.pageSize,
	orderBy: z
		.enum([
			"name_asc",
			"name_desc",
			"hub_id_asc",
			"hub_id_desc",
			"type_asc",
			"type_desc",
			"created_at_asc",
			"created_at_desc",
		])
		.optional()
		.describe("Sort order for results"),
	hubId: z.string().uuid().optional().describe("Filter by hub ID"),
	name: z.string().optional().describe("Filter by route name"),
});
export type ListRoutesParams = z.infer<typeof ListRoutesParams>;

export const GetRouteParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the route"),
	routeId: z.string().uuid().describe("Route ID"),
});
export type GetRouteParams = z.infer<typeof GetRouteParams>;

const S3RouteConfig = z.object({
	bucketRegion: z.string().describe("S3 bucket region"),
	bucketName: z.string().describe("S3 bucket name"),
	objectPrefix: z.string().optional().describe("Object key prefix"),
	strategy: z.enum(["unknown", "per_topic", "per_message"]).describe("S3 write strategy"),
});

const DbRouteConfig = z.object({
	host: z.string().describe("Database host"),
	port: z.number().int().describe("Database port"),
	dbname: z.string().describe("Database name"),
	username: z.string().describe("Database username"),
	password: z.string().describe("Database password"),
	query: z.string().describe("SQL query template"),
	engine: z.enum(["unknown", "postgresql", "mysql"]).describe("Database engine"),
});

const RestRouteConfig = z.object({
	verb: z.enum(["unknown", "get", "post", "put", "patch", "delete"]).describe("HTTP method"),
	uri: z.string().describe("REST endpoint URI"),
	headers: z.record(z.string()).optional().describe("HTTP headers"),
});

export const CreateRouteParams = z.object({
	region: ScalewayRegion.optional().describe("Region to create the route in"),
	hubId: z.string().uuid().describe("Hub ID"),
	name: z.string().min(1).describe("Route name"),
	topic: z.string().min(1).describe("MQTT topic filter for the route"),
	s3Config: S3RouteConfig.optional().describe("S3 route configuration"),
	dbConfig: DbRouteConfig.optional().describe("Database route configuration"),
	restConfig: RestRouteConfig.optional().describe("REST route configuration"),
});
export type CreateRouteParams = z.infer<typeof CreateRouteParams>;

export const UpdateRouteParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the route"),
	routeId: z.string().uuid().describe("Route ID"),
	name: z.string().min(1).optional().describe("New route name"),
	topic: z.string().min(1).optional().describe("New MQTT topic filter"),
	s3Config: S3RouteConfig.optional().describe("S3 route configuration"),
	dbConfig: DbRouteConfig.optional().describe("Database route configuration"),
	restConfig: RestRouteConfig.optional().describe("REST route configuration"),
});
export type UpdateRouteParams = z.infer<typeof UpdateRouteParams>;

export const DeleteRouteParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the route"),
	routeId: z.string().uuid().describe("Route ID"),
});
export type DeleteRouteParams = z.infer<typeof DeleteRouteParams>;

// === Network schemas ===

export const ListNetworksParams = z.object({
	region: ScalewayRegion.optional().describe("Region to list networks in"),
	page: PaginationParams.shape.page,
	pageSize: PaginationParams.shape.pageSize,
	orderBy: z
		.enum(["name_asc", "name_desc", "type_asc", "type_desc", "created_at_asc", "created_at_desc"])
		.optional()
		.describe("Sort order for results"),
	hubId: z.string().uuid().optional().describe("Filter by hub ID"),
	name: z.string().optional().describe("Filter by network name"),
	topicPrefix: z.string().optional().describe("Filter by topic prefix"),
});
export type ListNetworksParams = z.infer<typeof ListNetworksParams>;

export const GetNetworkParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the network"),
	networkId: z.string().uuid().describe("Network ID"),
});
export type GetNetworkParams = z.infer<typeof GetNetworkParams>;

export const CreateNetworkParams = z.object({
	region: ScalewayRegion.optional().describe("Region to create the network in"),
	hubId: z.string().uuid().describe("Hub ID"),
	name: z.string().min(1).describe("Network name"),
	type: z.enum(["unknown", "sigfox", "rest"]).describe("Network type"),
	topicPrefix: z.string().min(1).describe("Topic prefix for the network"),
});
export type CreateNetworkParams = z.infer<typeof CreateNetworkParams>;

export const DeleteNetworkParams = z.object({
	region: ScalewayRegion.optional().describe("Region of the network"),
	networkId: z.string().uuid().describe("Network ID"),
});
export type DeleteNetworkParams = z.infer<typeof DeleteNetworkParams>;
