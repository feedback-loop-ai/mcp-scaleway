import { z } from "zod";
import { PaginationParams, ScalewayZone } from "../../shared/types.js";

// ─── Common enums ───────────────────────────────────────────────────────────

export const LbStatus = z.enum([
	"unknown",
	"ready",
	"pending",
	"stopped",
	"error",
	"locked",
	"migrating",
	"to_create",
	"creating",
	"to_delete",
	"deleting",
]);

export const ForwardProtocol = z.enum(["tcp", "http"]);

export const StickySessionsType = z.enum(["none", "cookie", "table"]);

export const CertificateStatus = z.enum(["pending", "ready", "error"]);

export const CertificateType = z.enum(["letsencrypt", "custom"]);

// ─── Health check sub-schemas ───────────────────────────────────────────────

export const TcpHealthCheck = z.object({});

export const HttpHealthCheck = z.object({
	uri: z.string().describe("HTTP URI to check"),
	method: z.string().optional().describe("HTTP method (default GET)"),
	code: z.number().int().optional().describe("Expected HTTP status code"),
	host_header: z.string().optional().describe("Host header for the check"),
});

export const HttpsHealthCheck = z.object({
	uri: z.string().describe("HTTPS URI to check"),
	method: z.string().optional().describe("HTTP method (default GET)"),
	code: z.number().int().optional().describe("Expected HTTP status code"),
	host_header: z.string().optional().describe("Host header for the check"),
	sni: z.string().optional().describe("SNI to use for the check"),
});

export const HealthCheckConfig = z.object({
	port: z.number().int().describe("Health check port"),
	check_delay: z.string().optional().describe("Time between checks (e.g. 3000ms)"),
	check_timeout: z.string().optional().describe("Check timeout (e.g. 1000ms)"),
	check_max_retries: z.number().int().optional().describe("Max retries before marking unhealthy"),
	tcp_config: TcpHealthCheck.optional().describe("TCP health check configuration"),
	http_config: HttpHealthCheck.optional().describe("HTTP health check configuration"),
	https_config: HttpsHealthCheck.optional().describe("HTTPS health check configuration"),
});

// ─── LB schemas ─────────────────────────────────────────────────────────────

export const ListLbsParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to list LBs in (e.g. fr-par-1)"),
	name: z.string().optional().describe("Filter by name (partial match)"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	order_by: z
		.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
		.optional()
		.describe("Sort order"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
});

export const GetLbParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the LB"),
	lb_id: z.string().uuid().describe("Load balancer ID"),
});

export const CreateLbParams = z.object({
	zone: ScalewayZone.optional().describe("Zone for the LB"),
	project_id: z.string().uuid().optional().describe("Project ID"),
	name: z.string().describe("Name of the load balancer"),
	description: z.string().optional().describe("Description"),
	ip_ids: z.array(z.string().uuid()).optional().describe("Existing IP IDs to assign"),
	assign_flexible_ip: z.boolean().optional().describe("Assign a new flexible IP"),
	assign_flexible_ipv6: z.boolean().optional().describe("Assign a new flexible IPv6"),
	type: z.string().optional().describe("LB type (e.g. lb-s)"),
	tags: z.array(z.string()).optional().describe("Tags"),
	ssl_compatibility_level: z
		.enum([
			"ssl_compatibility_level_unknown",
			"ssl_compatibility_level_intermediate",
			"ssl_compatibility_level_modern",
			"ssl_compatibility_level_old_backward",
		])
		.optional()
		.describe("SSL compatibility level"),
});

export const UpdateLbParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the LB"),
	lb_id: z.string().uuid().describe("Load balancer ID"),
	name: z.string().describe("New name"),
	description: z.string().describe("New description"),
	tags: z.array(z.string()).optional().describe("New tags"),
	ssl_compatibility_level: z
		.enum([
			"ssl_compatibility_level_unknown",
			"ssl_compatibility_level_intermediate",
			"ssl_compatibility_level_modern",
			"ssl_compatibility_level_old_backward",
		])
		.optional()
		.describe("SSL compatibility level"),
});

export const DeleteLbParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the LB"),
	lb_id: z.string().uuid().describe("Load balancer ID"),
	release_ip: z.boolean().optional().describe("Release the IP address"),
});

export const MigrateLbParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the LB"),
	lb_id: z.string().uuid().describe("Load balancer ID"),
	type: z.string().describe("Target LB type (e.g. lb-s)"),
});

// ─── Frontend schemas ───────────────────────────────────────────────────────

export const ListFrontendsParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone of the LB"),
	lb_id: z.string().uuid().describe("Load balancer ID"),
	name: z.string().optional().describe("Filter by name"),
	order_by: z
		.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
		.optional()
		.describe("Sort order"),
});

export const GetFrontendParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the frontend"),
	frontend_id: z.string().uuid().describe("Frontend ID"),
});

export const CreateFrontendParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the LB"),
	lb_id: z.string().uuid().describe("Load balancer ID"),
	name: z.string().describe("Frontend name"),
	inbound_port: z.number().int().min(1).max(65535).describe("Inbound port"),
	backend_id: z.string().uuid().describe("Backend ID to forward to"),
	timeout_client: z.string().optional().describe("Client timeout (e.g. 30000ms)"),
	certificate_id: z.string().uuid().optional().describe("Certificate ID for HTTPS"),
	certificate_ids: z.array(z.string().uuid()).optional().describe("Certificate IDs"),
	enable_http3: z.boolean().optional().describe("Enable HTTP/3"),
});

export const UpdateFrontendParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the frontend"),
	frontend_id: z.string().uuid().describe("Frontend ID"),
	name: z.string().describe("New name"),
	inbound_port: z.number().int().min(1).max(65535).describe("New inbound port"),
	backend_id: z.string().uuid().describe("Backend ID"),
	timeout_client: z.string().optional().describe("Client timeout"),
	certificate_id: z.string().uuid().optional().describe("Certificate ID"),
	certificate_ids: z.array(z.string().uuid()).optional().describe("Certificate IDs"),
	enable_http3: z.boolean().optional().describe("Enable HTTP/3"),
});

export const DeleteFrontendParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the frontend"),
	frontend_id: z.string().uuid().describe("Frontend ID"),
});

// ─── Backend schemas ────────────────────────────────────────────────────────

export const ListBackendsParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone of the LB"),
	lb_id: z.string().uuid().describe("Load balancer ID"),
	name: z.string().optional().describe("Filter by name"),
	order_by: z
		.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
		.optional()
		.describe("Sort order"),
});

export const GetBackendParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the backend"),
	backend_id: z.string().uuid().describe("Backend ID"),
});

export const CreateBackendParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the LB"),
	lb_id: z.string().uuid().describe("Load balancer ID"),
	name: z.string().describe("Backend name"),
	forward_protocol: ForwardProtocol.describe("Protocol for forwarding (tcp or http)"),
	forward_port: z.number().int().min(1).max(65535).describe("Port for forwarding"),
	forward_port_algorithm: z
		.enum(["roundrobin", "leastconn", "first"])
		.optional()
		.describe("Load balancing algorithm"),
	sticky_sessions: StickySessionsType.optional().describe("Sticky sessions type"),
	sticky_sessions_cookie_name: z.string().optional().describe("Cookie name for sticky sessions"),
	health_check: HealthCheckConfig.optional().describe("Health check configuration"),
	server_ip: z.array(z.string()).optional().describe("Backend server IPs"),
	timeout_server: z.string().optional().describe("Server timeout"),
	timeout_connect: z.string().optional().describe("Connection timeout"),
	timeout_tunnel: z.string().optional().describe("Tunnel timeout"),
	on_marked_down_action: z
		.enum(["on_marked_down_action_none", "shutdown_sessions"])
		.optional()
		.describe("Action when backend is marked down"),
	proxy_protocol: z
		.enum([
			"proxy_protocol_unknown",
			"proxy_protocol_none",
			"proxy_protocol_v1",
			"proxy_protocol_v2",
			"proxy_protocol_v2_ssl",
			"proxy_protocol_v2_ssl_cn",
		])
		.optional()
		.describe("PROXY protocol version"),
	failover_host: z.string().optional().describe("Failover host"),
	ssl_bridging: z.boolean().optional().describe("Enable SSL bridging"),
	ignore_ssl_server_verify: z.boolean().optional().describe("Ignore SSL server verification"),
	redispatch_attempt_count: z.number().int().optional().describe("Max redispatch attempts"),
	max_retries: z.number().int().optional().describe("Max retries on failure"),
	max_connections: z.number().int().optional().describe("Max simultaneous connections"),
	timeout_queue: z.string().optional().describe("Queue timeout"),
});

export const UpdateBackendParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the backend"),
	backend_id: z.string().uuid().describe("Backend ID"),
	name: z.string().describe("New name"),
	forward_protocol: ForwardProtocol.describe("Protocol for forwarding"),
	forward_port: z.number().int().min(1).max(65535).describe("Port for forwarding"),
	forward_port_algorithm: z
		.enum(["roundrobin", "leastconn", "first"])
		.optional()
		.describe("Load balancing algorithm"),
	sticky_sessions: StickySessionsType.optional().describe("Sticky sessions type"),
	sticky_sessions_cookie_name: z.string().optional().describe("Cookie name for sticky sessions"),
	timeout_server: z.string().optional().describe("Server timeout"),
	timeout_connect: z.string().optional().describe("Connection timeout"),
	timeout_tunnel: z.string().optional().describe("Tunnel timeout"),
	on_marked_down_action: z
		.enum(["on_marked_down_action_none", "shutdown_sessions"])
		.optional()
		.describe("Action when backend is marked down"),
	proxy_protocol: z
		.enum([
			"proxy_protocol_unknown",
			"proxy_protocol_none",
			"proxy_protocol_v1",
			"proxy_protocol_v2",
			"proxy_protocol_v2_ssl",
			"proxy_protocol_v2_ssl_cn",
		])
		.optional()
		.describe("PROXY protocol version"),
	failover_host: z.string().optional().describe("Failover host"),
	ssl_bridging: z.boolean().optional().describe("Enable SSL bridging"),
	ignore_ssl_server_verify: z.boolean().optional().describe("Ignore SSL server verification"),
	redispatch_attempt_count: z.number().int().optional().describe("Max redispatch attempts"),
	max_retries: z.number().int().optional().describe("Max retries on failure"),
	max_connections: z.number().int().optional().describe("Max simultaneous connections"),
	timeout_queue: z.string().optional().describe("Queue timeout"),
});

export const DeleteBackendParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the backend"),
	backend_id: z.string().uuid().describe("Backend ID"),
});

export const AddBackendServersParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the backend"),
	backend_id: z.string().uuid().describe("Backend ID"),
	server_ip: z.array(z.string()).describe("Server IPs to add"),
});

export const RemoveBackendServersParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the backend"),
	backend_id: z.string().uuid().describe("Backend ID"),
	server_ip: z.array(z.string()).describe("Server IPs to remove"),
});

export const SetBackendServersParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the backend"),
	backend_id: z.string().uuid().describe("Backend ID"),
	server_ip: z.array(z.string()).describe("Complete list of server IPs"),
});

// ─── Route schemas ──────────────────────────────────────────────────────────

export const ListRoutesParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to list routes in"),
	frontend_id: z.string().uuid().optional().describe("Filter by frontend ID"),
	order_by: z.enum(["created_at_asc", "created_at_desc"]).optional().describe("Sort order"),
});

export const GetRouteParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the route"),
	route_id: z.string().uuid().describe("Route ID"),
});

export const CreateRouteParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the frontend"),
	frontend_id: z.string().uuid().describe("Frontend ID"),
	backend_id: z.string().uuid().describe("Backend ID to route to"),
	match_sni: z.string().optional().describe("SNI to match for routing"),
	match_host_header: z.string().optional().describe("Host header to match for routing"),
});

export const UpdateRouteParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the route"),
	route_id: z.string().uuid().describe("Route ID"),
	backend_id: z.string().uuid().describe("Backend ID to route to"),
	match_sni: z.string().optional().describe("SNI to match for routing"),
	match_host_header: z.string().optional().describe("Host header to match for routing"),
});

export const DeleteRouteParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the route"),
	route_id: z.string().uuid().describe("Route ID"),
});

// ─── Certificate schemas ────────────────────────────────────────────────────

export const ListCertificatesParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone of the LB"),
	lb_id: z.string().uuid().describe("Load balancer ID"),
	name: z.string().optional().describe("Filter by name"),
	order_by: z
		.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
		.optional()
		.describe("Sort order"),
});

export const GetCertificateParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the certificate"),
	certificate_id: z.string().uuid().describe("Certificate ID"),
});

export const CreateCertificateParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the LB"),
	lb_id: z.string().uuid().describe("Load balancer ID"),
	name: z.string().describe("Certificate name"),
	letsencrypt: z
		.object({
			common_name: z.string().describe("Main domain name"),
			subject_alternative_name: z
				.array(z.string())
				.optional()
				.describe("Subject alternative names"),
		})
		.optional()
		.describe("Let's Encrypt certificate configuration"),
	custom_certificate: z
		.object({
			certificate_chain: z.string().describe("Full PEM certificate chain"),
		})
		.optional()
		.describe("Custom certificate configuration"),
});

export const UpdateCertificateParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the certificate"),
	certificate_id: z.string().uuid().describe("Certificate ID"),
	name: z.string().describe("New name"),
});

export const DeleteCertificateParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the certificate"),
	certificate_id: z.string().uuid().describe("Certificate ID"),
});

// ─── Stats & Types schemas ──────────────────────────────────────────────────

export const GetLbStatsParams = z.object({
	zone: ScalewayZone.optional().describe("Zone of the LB"),
	lb_id: z.string().uuid().describe("Load balancer ID"),
	backend_id: z.string().uuid().optional().describe("Filter by backend ID"),
});

export const ListLbTypesParams = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to list LB types in"),
});
