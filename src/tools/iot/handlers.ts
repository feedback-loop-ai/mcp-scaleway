import { loadAuthConfig } from "../../shared/auth.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
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

function getIotApiUrl(region: string): string {
	return `https://api.scaleway.com/iot/v1/regions/${region}`;
}

function getRegion(params: { region?: string }): string {
	const config = loadAuthConfig();
	return params.region ?? config.defaultRegion;
}

function successResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

async function scalewayFetch(method: string, url: string, body?: unknown): Promise<unknown> {
	const config = loadAuthConfig();
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"X-Auth-Token": config.secretKey,
	};

	const response = await fetch(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const error = new Error(`API error: ${response.statusText}`);
		(error as Error & { statusCode: number }).statusCode = response.status;
		throw error;
	}

	if (response.status === 204) {
		return {};
	}

	return response.json();
}

// === Hub handlers ===

export async function handleListHubs(params: ListHubsParams) {
	try {
		const region = getRegion(params);
		const query = new URLSearchParams();
		const pagination = paginationToQuery(params.page ?? 1, params.pageSize ?? 50);
		query.set("page", String(pagination.page));
		query.set("page_size", String(pagination.page_size));
		if (params.orderBy) query.set("order_by", params.orderBy);
		if (params.projectId) query.set("project_id", params.projectId);
		if (params.name) query.set("name", params.name);

		const url = `${getIotApiUrl(region)}/hubs?${query.toString()}`;
		const data = (await scalewayFetch("GET", url)) as {
			hubs: unknown[];
			total_count: number;
		};

		return successResponse(
			buildPaginatedResponse(data.hubs, data.total_count, params.page ?? 1, params.pageSize ?? 50),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetHub(params: GetHubParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/hubs/${params.hubId}`;
		const data = await scalewayFetch("GET", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateHub(params: CreateHubParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/hubs`;
		const body: Record<string, unknown> = {
			name: params.name,
			product_plan: params.productPlan ?? "plan_shared",
		};
		if (params.projectId) body.project_id = params.projectId;
		if (params.disableEvents !== undefined) body.disable_events = params.disableEvents;
		if (params.eventsTopicPrefix) body.events_topic_prefix = params.eventsTopicPrefix;
		if (params.twinsGraphiteConfig) {
			body.twins_graphite_config = { push_uri: params.twinsGraphiteConfig.pushUri };
		}

		const data = await scalewayFetch("POST", url, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateHub(params: UpdateHubParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/hubs/${params.hubId}`;
		const body: Record<string, unknown> = {};
		if (params.name !== undefined) body.name = params.name;
		if (params.productPlan !== undefined) body.product_plan = params.productPlan;
		if (params.disableEvents !== undefined) body.disable_events = params.disableEvents;
		if (params.eventsTopicPrefix !== undefined) body.events_topic_prefix = params.eventsTopicPrefix;
		if (params.enableDeviceAutoProvisioning !== undefined)
			body.enable_device_auto_provisioning = params.enableDeviceAutoProvisioning;
		if (params.twinsGraphiteConfig) {
			body.twins_graphite_config = { push_uri: params.twinsGraphiteConfig.pushUri };
		}

		const data = await scalewayFetch("PATCH", url, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteHub(params: DeleteHubParams) {
	try {
		const region = getRegion(params);
		const query = new URLSearchParams();
		if (params.deleteDevices !== undefined)
			query.set("delete_devices", String(params.deleteDevices));
		const qs = query.toString();
		const url = `${getIotApiUrl(region)}/hubs/${params.hubId}${qs ? `?${qs}` : ""}`;
		const data = await scalewayFetch("DELETE", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleEnableHub(params: EnableHubParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/hubs/${params.hubId}/enable`;
		const data = await scalewayFetch("POST", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDisableHub(params: DisableHubParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/hubs/${params.hubId}/disable`;
		const data = await scalewayFetch("POST", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetHubCA(params: GetHubCAParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/hubs/${params.hubId}/ca`;
		const data = await scalewayFetch("GET", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleSetHubCA(params: SetHubCAParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/hubs/${params.hubId}/ca`;
		const body = {
			ca_cert_pem: params.caCertPem,
			challenge_cert_pem: params.challengeCertPem,
		};
		const data = await scalewayFetch("POST", url, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// === Device handlers ===

export async function handleListDevices(params: ListDevicesParams) {
	try {
		const region = getRegion(params);
		const query = new URLSearchParams();
		const pagination = paginationToQuery(params.page ?? 1, params.pageSize ?? 50);
		query.set("page", String(pagination.page));
		query.set("page_size", String(pagination.page_size));
		if (params.orderBy) query.set("order_by", params.orderBy);
		if (params.hubId) query.set("hub_id", params.hubId);
		if (params.name) query.set("name", params.name);
		if (params.allowInsecure !== undefined)
			query.set("allow_insecure", String(params.allowInsecure));
		if (params.status) query.set("status", params.status);

		const url = `${getIotApiUrl(region)}/devices?${query.toString()}`;
		const data = (await scalewayFetch("GET", url)) as {
			devices: unknown[];
			total_count: number;
		};

		return successResponse(
			buildPaginatedResponse(
				data.devices,
				data.total_count,
				params.page ?? 1,
				params.pageSize ?? 50,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDevice(params: GetDeviceParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/devices/${params.deviceId}`;
		const data = await scalewayFetch("GET", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDevice(params: CreateDeviceParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/devices`;
		const body: Record<string, unknown> = {
			hub_id: params.hubId,
			name: params.name,
		};
		if (params.allowInsecure !== undefined) body.allow_insecure = params.allowInsecure;
		if (params.allowMultipleConnections !== undefined)
			body.allow_multiple_connections = params.allowMultipleConnections;
		if (params.messageFilters) {
			body.message_filters = {
				publish: params.messageFilters.publish
					? {
							policy: params.messageFilters.publish.policy,
							topics: params.messageFilters.publish.topics,
						}
					: undefined,
				subscribe: params.messageFilters.subscribe
					? {
							policy: params.messageFilters.subscribe.policy,
							topics: params.messageFilters.subscribe.topics,
						}
					: undefined,
			};
		}
		if (params.description !== undefined) body.description = params.description;

		const data = await scalewayFetch("POST", url, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateDevice(params: UpdateDeviceParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/devices/${params.deviceId}`;
		const body: Record<string, unknown> = {};
		if (params.name !== undefined) body.name = params.name;
		if (params.allowInsecure !== undefined) body.allow_insecure = params.allowInsecure;
		if (params.allowMultipleConnections !== undefined)
			body.allow_multiple_connections = params.allowMultipleConnections;
		if (params.messageFilters) {
			body.message_filters = {
				publish: params.messageFilters.publish
					? {
							policy: params.messageFilters.publish.policy,
							topics: params.messageFilters.publish.topics,
						}
					: undefined,
				subscribe: params.messageFilters.subscribe
					? {
							policy: params.messageFilters.subscribe.policy,
							topics: params.messageFilters.subscribe.topics,
						}
					: undefined,
			};
		}
		if (params.hubId !== undefined) body.hub_id = params.hubId;
		if (params.description !== undefined) body.description = params.description;

		const data = await scalewayFetch("PATCH", url, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDevice(params: DeleteDeviceParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/devices/${params.deviceId}`;
		const data = await scalewayFetch("DELETE", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleEnableDevice(params: EnableDeviceParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/devices/${params.deviceId}/enable`;
		const data = await scalewayFetch("POST", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDisableDevice(params: DisableDeviceParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/devices/${params.deviceId}/disable`;
		const data = await scalewayFetch("POST", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDeviceCertificate(params: GetDeviceCertificateParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/devices/${params.deviceId}/certificate`;
		const data = await scalewayFetch("GET", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRenewDeviceCertificate(params: RenewDeviceCertificateParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/devices/${params.deviceId}/renew-certificate`;
		const data = await scalewayFetch("POST", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleSetDeviceCertificate(params: SetDeviceCertificateParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/devices/${params.deviceId}/certificate`;
		const body = { certificate_pem: params.certificatePem };
		const data = await scalewayFetch("PUT", url, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDeviceMetrics(params: GetDeviceMetricsParams) {
	try {
		const region = getRegion(params);
		const query = new URLSearchParams();
		if (params.startDate) query.set("start_date", params.startDate);
		const qs = query.toString();
		const url = `${getIotApiUrl(region)}/devices/${params.deviceId}/metrics${qs ? `?${qs}` : ""}`;
		const data = await scalewayFetch("GET", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// === Route handlers ===

export async function handleListRoutes(params: ListRoutesParams) {
	try {
		const region = getRegion(params);
		const query = new URLSearchParams();
		const pagination = paginationToQuery(params.page ?? 1, params.pageSize ?? 50);
		query.set("page", String(pagination.page));
		query.set("page_size", String(pagination.page_size));
		if (params.orderBy) query.set("order_by", params.orderBy);
		if (params.hubId) query.set("hub_id", params.hubId);
		if (params.name) query.set("name", params.name);

		const url = `${getIotApiUrl(region)}/routes?${query.toString()}`;
		const data = (await scalewayFetch("GET", url)) as {
			routes: unknown[];
			total_count: number;
		};

		return successResponse(
			buildPaginatedResponse(
				data.routes,
				data.total_count,
				params.page ?? 1,
				params.pageSize ?? 50,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetRoute(params: GetRouteParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/routes/${params.routeId}`;
		const data = await scalewayFetch("GET", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

function buildRouteConfigBody(params: {
	s3Config?: CreateRouteParams["s3Config"];
	dbConfig?: CreateRouteParams["dbConfig"];
	restConfig?: CreateRouteParams["restConfig"];
}): Record<string, unknown> {
	const body: Record<string, unknown> = {};
	if (params.s3Config) {
		body.s3_config = {
			bucket_region: params.s3Config.bucketRegion,
			bucket_name: params.s3Config.bucketName,
			object_prefix: params.s3Config.objectPrefix,
			strategy: params.s3Config.strategy,
		};
	}
	if (params.dbConfig) {
		body.db_config = {
			host: params.dbConfig.host,
			port: params.dbConfig.port,
			dbname: params.dbConfig.dbname,
			username: params.dbConfig.username,
			password: params.dbConfig.password,
			query: params.dbConfig.query,
			engine: params.dbConfig.engine,
		};
	}
	if (params.restConfig) {
		body.rest_config = {
			verb: params.restConfig.verb,
			uri: params.restConfig.uri,
			headers: params.restConfig.headers,
		};
	}
	return body;
}

export async function handleCreateRoute(params: CreateRouteParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/routes`;
		const body: Record<string, unknown> = {
			hub_id: params.hubId,
			name: params.name,
			topic: params.topic,
			...buildRouteConfigBody(params),
		};

		const data = await scalewayFetch("POST", url, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateRoute(params: UpdateRouteParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/routes/${params.routeId}`;
		const body: Record<string, unknown> = {
			...buildRouteConfigBody(params),
		};
		if (params.name !== undefined) body.name = params.name;
		if (params.topic !== undefined) body.topic = params.topic;

		const data = await scalewayFetch("PATCH", url, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteRoute(params: DeleteRouteParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/routes/${params.routeId}`;
		const data = await scalewayFetch("DELETE", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// === Network handlers ===

export async function handleListNetworks(params: ListNetworksParams) {
	try {
		const region = getRegion(params);
		const query = new URLSearchParams();
		const pagination = paginationToQuery(params.page ?? 1, params.pageSize ?? 50);
		query.set("page", String(pagination.page));
		query.set("page_size", String(pagination.page_size));
		if (params.orderBy) query.set("order_by", params.orderBy);
		if (params.hubId) query.set("hub_id", params.hubId);
		if (params.name) query.set("name", params.name);
		if (params.topicPrefix) query.set("topic_prefix", params.topicPrefix);

		const url = `${getIotApiUrl(region)}/networks?${query.toString()}`;
		const data = (await scalewayFetch("GET", url)) as {
			networks: unknown[];
			total_count: number;
		};

		return successResponse(
			buildPaginatedResponse(
				data.networks,
				data.total_count,
				params.page ?? 1,
				params.pageSize ?? 50,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetNetwork(params: GetNetworkParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/networks/${params.networkId}`;
		const data = await scalewayFetch("GET", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateNetwork(params: CreateNetworkParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/networks`;
		const body = {
			hub_id: params.hubId,
			name: params.name,
			type: params.type,
			topic_prefix: params.topicPrefix,
		};
		const data = await scalewayFetch("POST", url, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteNetwork(params: DeleteNetworkParams) {
	try {
		const region = getRegion(params);
		const url = `${getIotApiUrl(region)}/networks/${params.networkId}`;
		const data = await scalewayFetch("DELETE", url);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
