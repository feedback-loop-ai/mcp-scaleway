import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	AddACLRulesInput,
	AddEndpointsInput,
	CreateClusterInput,
	DeleteACLRulesInput,
	DeleteClusterInput,
	DeleteEndpointsInput,
	GetClusterCertificateInput,
	GetClusterInput,
	GetClusterMetricsInput,
	ListClusterVersionsInput,
	ListClustersInput,
	ListNodeTypesInput,
	RenewClusterCertificateInput,
	SetACLRulesInput,
	SetEndpointsInput,
	UpdateClusterInput,
} from "./types.js";

const REDIS_API_PREFIX = "redis/v1";

interface ListClustersResponse {
	clusters: unknown[];
	total_count: number;
}

interface ListNodeTypesResponse {
	node_types: unknown[];
	total_count: number;
}

interface ListVersionsResponse {
	versions: unknown[];
	total_count: number;
}

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function regionOrDefault(region?: string): string {
	return region ?? process.env.SCW_DEFAULT_REGION ?? "fr-par";
}

function formatResponse(data: unknown) {
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(data, null, 2),
			},
		],
	};
}

// === Cluster CRUD ===

export async function handleListClusters(input: ListClustersInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);
		const queryParams = new URLSearchParams();

		const pagination = paginationToQuery(input.page, input.pageSize);
		queryParams.set("page", String(pagination.page));
		queryParams.set("page_size", String(pagination.page_size));

		if (input.project_id) queryParams.set("project_id", input.project_id);
		if (input.name) queryParams.set("name", input.name);
		if (input.order_by) queryParams.set("order_by", input.order_by);
		if (input.organization_id) queryParams.set("organization_id", input.organization_id);
		if (input.tags) {
			for (const tag of input.tags) {
				queryParams.append("tags", tag);
			}
		}

		const data = await client.fetch<ListClustersResponse>({
			method: "GET",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters?${queryParams.toString()}`,
		});

		return formatResponse(
			buildPaginatedResponse(data.clusters, data.total_count, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetCluster(input: GetClusterInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const data = await client.fetch<unknown>({
			method: "GET",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}`,
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateCluster(input: CreateClusterInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const body: Record<string, unknown> = {
			project_id: input.project_id,
			name: input.name,
			version: input.version,
			node_type: input.node_type,
			cluster_size: input.cluster_size,
			user_name: input.user_name,
			password: input.password,
		};

		if (input.tags !== undefined) body.tags = input.tags;
		if (input.tls_enabled !== undefined) body.tls_enabled = input.tls_enabled;
		if (input.cluster_settings !== undefined) body.cluster_settings = input.cluster_settings;
		if (input.acl_rules !== undefined) body.acl_rules = input.acl_rules;
		if (input.endpoints !== undefined) body.endpoints = input.endpoints;

		const data = await client.fetch<unknown>({
			method: "POST",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateCluster(input: UpdateClusterInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const body: Record<string, unknown> = {};
		if (input.name !== undefined) body.name = input.name;
		if (input.tags !== undefined) body.tags = input.tags;
		if (input.user_name !== undefined) body.user_name = input.user_name;
		if (input.password !== undefined) body.password = input.password;

		const data = await client.fetch<unknown>({
			method: "PATCH",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteCluster(input: DeleteClusterInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const data = await client.fetch<unknown>({
			method: "DELETE",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}`,
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// === Cluster Metrics & Certificate ===

export async function handleGetClusterMetrics(input: GetClusterMetricsInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);
		const queryParams = new URLSearchParams();

		if (input.start_at) queryParams.set("start_at", input.start_at);
		if (input.end_at) queryParams.set("end_at", input.end_at);
		if (input.metric_name) queryParams.set("metric_name", input.metric_name);

		const qs = queryParams.toString();
		const path = `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}/metrics${qs ? `?${qs}` : ""}`;

		const data = await client.fetch<unknown>({ method: "GET", path });

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetClusterCertificate(input: GetClusterCertificateInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const data = await client.fetch<unknown>({
			method: "GET",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}/certificate`,
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRenewClusterCertificate(input: RenewClusterCertificateInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const data = await client.fetch<unknown>({
			method: "POST",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}/renew-certificate`,
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// === ACL Rules ===

export async function handleAddACLRules(input: AddACLRulesInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const data = await client.fetch<unknown>({
			method: "POST",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}/acls`,
			body: JSON.stringify({ acl_rules: input.acl_rules }),
			headers: { "Content-Type": "application/json" },
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteACLRules(input: DeleteACLRulesInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const data = await client.fetch<unknown>({
			method: "DELETE",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}/acls`,
			body: JSON.stringify({ acl_rule_ids: input.acl_rule_ids }),
			headers: { "Content-Type": "application/json" },
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleSetACLRules(input: SetACLRulesInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const data = await client.fetch<unknown>({
			method: "PUT",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}/acls`,
			body: JSON.stringify({ acl_rules: input.acl_rules }),
			headers: { "Content-Type": "application/json" },
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// === Endpoints ===

export async function handleAddEndpoints(input: AddEndpointsInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const data = await client.fetch<unknown>({
			method: "POST",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}/endpoints`,
			body: JSON.stringify({ endpoints: input.endpoints }),
			headers: { "Content-Type": "application/json" },
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteEndpoints(input: DeleteEndpointsInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const data = await client.fetch<unknown>({
			method: "DELETE",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}/endpoints/${input.endpoint_id}`,
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleSetEndpoints(input: SetEndpointsInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);

		const data = await client.fetch<unknown>({
			method: "PUT",
			path: `/${REDIS_API_PREFIX}/regions/${region}/clusters/${input.cluster_id}/endpoints`,
			body: JSON.stringify({ endpoints: input.endpoints }),
			headers: { "Content-Type": "application/json" },
		});

		return formatResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// === Discovery ===

export async function handleListNodeTypes(input: ListNodeTypesInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);
		const queryParams = new URLSearchParams();

		const pagination = paginationToQuery(input.page, input.pageSize);
		queryParams.set("page", String(pagination.page));
		queryParams.set("page_size", String(pagination.page_size));

		if (input.include_disabled_types !== undefined)
			queryParams.set("include_disabled_types", String(input.include_disabled_types));

		const data = await client.fetch<ListNodeTypesResponse>({
			method: "GET",
			path: `/${REDIS_API_PREFIX}/regions/${region}/node-types?${queryParams.toString()}`,
		});

		return formatResponse(
			buildPaginatedResponse(data.node_types, data.total_count, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListClusterVersions(input: ListClusterVersionsInput) {
	try {
		const client = getClient();
		const region = regionOrDefault(input.region);
		const queryParams = new URLSearchParams();

		const pagination = paginationToQuery(input.page, input.pageSize);
		queryParams.set("page", String(pagination.page));
		queryParams.set("page_size", String(pagination.page_size));

		if (input.include_disabled !== undefined)
			queryParams.set("include_disabled", String(input.include_disabled));
		if (input.include_beta !== undefined)
			queryParams.set("include_beta", String(input.include_beta));
		if (input.include_deprecated !== undefined)
			queryParams.set("include_deprecated", String(input.include_deprecated));
		if (input.version) queryParams.set("version", input.version);

		const data = await client.fetch<ListVersionsResponse>({
			method: "GET",
			path: `/${REDIS_API_PREFIX}/regions/${region}/cluster-versions?${queryParams.toString()}`,
		});

		return formatResponse(
			buildPaginatedResponse(data.versions, data.total_count, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
