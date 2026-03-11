import type { Client } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { paginationToQuery } from "../../shared/pagination.js";

function getClient(): Client {
	return createScalewayClient(loadAuthConfig());
}

function resolveZone(zone?: string): string {
	return zone ?? loadAuthConfig().defaultZone;
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

function buildUrlParams(params: Record<string, unknown>): URLSearchParams {
	const urlParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			if (Array.isArray(value)) {
				for (const item of value) {
					urlParams.append(key, String(item));
				}
			} else {
				urlParams.append(key, String(value));
			}
		}
	}
	return urlParams;
}

// ─── LB handlers ────────────────────────────────────────────────────────────

export async function handleListLbs(args: {
	zone?: string;
	name?: string;
	project_id?: string;
	order_by?: string;
	tags?: string[];
	page?: number;
	pageSize?: number;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const pagination = paginationToQuery(args.page ?? 1, args.pageSize ?? 50);
		const urlParams = buildUrlParams({
			...pagination,
			name: args.name,
			project_id: args.project_id,
			order_by: args.order_by,
			tags: args.tags,
		});

		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/lbs`,
			urlParams,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetLb(args: { zone?: string; lb_id: string }) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/lbs/${args.lb_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateLb(args: {
	zone?: string;
	project_id?: string;
	name: string;
	description?: string;
	ip_id?: string;
	assign_flexible_ip?: boolean;
	assign_flexible_ipv6?: boolean;
	type?: string;
	tags?: string[];
	ssl_compatibility_level?: string;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const { zone: _zone, ...body } = args;
		const result = await client.fetch({
			method: "POST",
			path: `/lb/v1/zones/${zone}/lbs`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateLb(args: {
	zone?: string;
	lb_id: string;
	name: string;
	description: string;
	tags?: string[];
	ssl_compatibility_level?: string;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const { zone: _zone, lb_id, ...body } = args;
		const result = await client.fetch({
			method: "PUT",
			path: `/lb/v1/zones/${zone}/lbs/${lb_id}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteLb(args: {
	zone?: string;
	lb_id: string;
	release_ip?: boolean;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const urlParams = buildUrlParams({ release_ip: args.release_ip });
		await client.fetch({
			method: "DELETE",
			path: `/lb/v1/zones/${zone}/lbs/${args.lb_id}`,
			urlParams,
		});
		return jsonResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleMigrateLb(args: {
	zone?: string;
	lb_id: string;
	type: string;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const result = await client.fetch({
			method: "POST",
			path: `/lb/v1/zones/${zone}/lbs/${args.lb_id}/migrate`,
			body: JSON.stringify({ type: args.type }),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── Frontend handlers ─────────────────────────────────────────────────────

export async function handleListFrontends(args: {
	zone?: string;
	lb_id: string;
	name?: string;
	order_by?: string;
	page?: number;
	pageSize?: number;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const pagination = paginationToQuery(args.page ?? 1, args.pageSize ?? 50);
		const urlParams = buildUrlParams({
			...pagination,
			name: args.name,
			order_by: args.order_by,
		});
		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/lbs/${args.lb_id}/frontends`,
			urlParams,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetFrontend(args: { zone?: string; frontend_id: string }) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/frontends/${args.frontend_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateFrontend(args: {
	zone?: string;
	lb_id: string;
	name: string;
	inbound_port: number;
	backend_id: string;
	timeout_client?: string;
	certificate_id?: string;
	certificate_ids?: string[];
	enable_http3?: boolean;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const { zone: _zone, lb_id, ...body } = args;
		const result = await client.fetch({
			method: "POST",
			path: `/lb/v1/zones/${zone}/lbs/${lb_id}/frontends`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateFrontend(args: {
	zone?: string;
	frontend_id: string;
	name: string;
	inbound_port: number;
	backend_id: string;
	timeout_client?: string;
	certificate_id?: string;
	certificate_ids?: string[];
	enable_http3?: boolean;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const { zone: _zone, frontend_id, ...body } = args;
		const result = await client.fetch({
			method: "PUT",
			path: `/lb/v1/zones/${zone}/frontends/${frontend_id}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteFrontend(args: { zone?: string; frontend_id: string }) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		await client.fetch({
			method: "DELETE",
			path: `/lb/v1/zones/${zone}/frontends/${args.frontend_id}`,
		});
		return jsonResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── Backend handlers ───────────────────────────────────────────────────────

export async function handleListBackends(args: {
	zone?: string;
	lb_id: string;
	name?: string;
	order_by?: string;
	page?: number;
	pageSize?: number;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const pagination = paginationToQuery(args.page ?? 1, args.pageSize ?? 50);
		const urlParams = buildUrlParams({
			...pagination,
			name: args.name,
			order_by: args.order_by,
		});
		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/lbs/${args.lb_id}/backends`,
			urlParams,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetBackend(args: { zone?: string; backend_id: string }) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/backends/${args.backend_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateBackend(args: {
	zone?: string;
	lb_id: string;
	name: string;
	forward_protocol: string;
	forward_port: number;
	forward_port_algorithm?: string;
	sticky_sessions?: string;
	sticky_sessions_cookie_name?: string;
	health_check?: {
		port: number;
		check_delay?: string;
		check_timeout?: string;
		check_max_retries?: number;
		tcp_config?: Record<string, never>;
		http_config?: {
			uri: string;
			method?: string;
			code?: number;
			host_header?: string;
		};
		https_config?: {
			uri: string;
			method?: string;
			code?: number;
			host_header?: string;
			sni?: string;
		};
	};
	server_ip?: string[];
	timeout_server?: string;
	timeout_connect?: string;
	timeout_tunnel?: string;
	on_marked_down_action?: string;
	proxy_protocol?: string;
	failover_host?: string;
	ssl_bridging?: boolean;
	ignore_ssl_server_verify?: boolean;
	redispatch_attempt_count?: number;
	max_retries?: number;
	max_connections?: number;
	timeout_queue?: string;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const { zone: _zone, lb_id, ...body } = args;
		const result = await client.fetch({
			method: "POST",
			path: `/lb/v1/zones/${zone}/lbs/${lb_id}/backends`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateBackend(args: {
	zone?: string;
	backend_id: string;
	name: string;
	forward_protocol: string;
	forward_port: number;
	forward_port_algorithm?: string;
	sticky_sessions?: string;
	sticky_sessions_cookie_name?: string;
	timeout_server?: string;
	timeout_connect?: string;
	timeout_tunnel?: string;
	on_marked_down_action?: string;
	proxy_protocol?: string;
	failover_host?: string;
	ssl_bridging?: boolean;
	ignore_ssl_server_verify?: boolean;
	redispatch_attempt_count?: number;
	max_retries?: number;
	max_connections?: number;
	timeout_queue?: string;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const { zone: _zone, backend_id, ...body } = args;
		const result = await client.fetch({
			method: "PUT",
			path: `/lb/v1/zones/${zone}/backends/${backend_id}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteBackend(args: { zone?: string; backend_id: string }) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		await client.fetch({
			method: "DELETE",
			path: `/lb/v1/zones/${zone}/backends/${args.backend_id}`,
		});
		return jsonResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleAddBackendServers(args: {
	zone?: string;
	backend_id: string;
	server_ip: string[];
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const result = await client.fetch({
			method: "POST",
			path: `/lb/v1/zones/${zone}/backends/${args.backend_id}/servers`,
			body: JSON.stringify({ server_ip: args.server_ip }),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRemoveBackendServers(args: {
	zone?: string;
	backend_id: string;
	server_ip: string[];
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const result = await client.fetch({
			method: "DELETE",
			path: `/lb/v1/zones/${zone}/backends/${args.backend_id}/servers`,
			body: JSON.stringify({ server_ip: args.server_ip }),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleSetBackendServers(args: {
	zone?: string;
	backend_id: string;
	server_ip: string[];
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const result = await client.fetch({
			method: "PUT",
			path: `/lb/v1/zones/${zone}/backends/${args.backend_id}/servers`,
			body: JSON.stringify({ server_ip: args.server_ip }),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── Route handlers ────────────────────────────────────────────────────────

export async function handleListRoutes(args: {
	zone?: string;
	frontend_id?: string;
	order_by?: string;
	page?: number;
	pageSize?: number;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const pagination = paginationToQuery(args.page ?? 1, args.pageSize ?? 50);
		const urlParams = buildUrlParams({
			...pagination,
			frontend_id: args.frontend_id,
			order_by: args.order_by,
		});
		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/routes`,
			urlParams,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetRoute(args: { zone?: string; route_id: string }) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/routes/${args.route_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateRoute(args: {
	zone?: string;
	frontend_id: string;
	backend_id: string;
	match_sni?: string;
	match_host_header?: string;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const { zone: _zone, ...body } = args;
		const result = await client.fetch({
			method: "POST",
			path: `/lb/v1/zones/${zone}/routes`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateRoute(args: {
	zone?: string;
	route_id: string;
	backend_id: string;
	match_sni?: string;
	match_host_header?: string;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const { zone: _zone, route_id, ...body } = args;
		const result = await client.fetch({
			method: "PUT",
			path: `/lb/v1/zones/${zone}/routes/${route_id}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteRoute(args: { zone?: string; route_id: string }) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		await client.fetch({
			method: "DELETE",
			path: `/lb/v1/zones/${zone}/routes/${args.route_id}`,
		});
		return jsonResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── Certificate handlers ──────────────────────────────────────────────────

export async function handleListCertificates(args: {
	zone?: string;
	lb_id: string;
	name?: string;
	order_by?: string;
	page?: number;
	pageSize?: number;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const pagination = paginationToQuery(args.page ?? 1, args.pageSize ?? 50);
		const urlParams = buildUrlParams({
			...pagination,
			name: args.name,
			order_by: args.order_by,
		});
		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/lbs/${args.lb_id}/certificates`,
			urlParams,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetCertificate(args: { zone?: string; certificate_id: string }) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/certificates/${args.certificate_id}`,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateCertificate(args: {
	zone?: string;
	lb_id: string;
	name: string;
	letsencrypt?: {
		common_name: string;
		subject_alternative_name?: string[];
	};
	custom_certificate?: {
		certificate_chain: string;
	};
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const { zone: _zone, lb_id, ...body } = args;
		const result = await client.fetch({
			method: "POST",
			path: `/lb/v1/zones/${zone}/lbs/${lb_id}/certificates`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateCertificate(args: {
	zone?: string;
	certificate_id: string;
	name: string;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const result = await client.fetch({
			method: "PUT",
			path: `/lb/v1/zones/${zone}/certificates/${args.certificate_id}`,
			body: JSON.stringify({ name: args.name }),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteCertificate(args: { zone?: string; certificate_id: string }) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		await client.fetch({
			method: "DELETE",
			path: `/lb/v1/zones/${zone}/certificates/${args.certificate_id}`,
		});
		return jsonResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ─── Stats & Types handlers ────────────────────────────────────────────────

export async function handleGetLbStats(args: {
	zone?: string;
	lb_id: string;
	backend_id?: string;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const urlParams = buildUrlParams({ backend_id: args.backend_id });
		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/lbs/${args.lb_id}/stats`,
			urlParams,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListLbTypes(args: {
	zone?: string;
	page?: number;
	pageSize?: number;
}) {
	try {
		const client = getClient();
		const zone = resolveZone(args.zone);
		const pagination = paginationToQuery(args.page ?? 1, args.pageSize ?? 50);
		const urlParams = buildUrlParams(pagination);
		const result = await client.fetch({
			method: "GET",
			path: `/lb/v1/zones/${zone}/lb-types`,
			urlParams,
		});
		return jsonResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
