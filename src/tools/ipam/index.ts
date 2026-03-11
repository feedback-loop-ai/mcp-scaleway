import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import {
	handleBookIP,
	handleGetIP,
	handleListIPs,
	handleReleaseIP,
	handleUpdateIP,
} from "./handlers.js";
import { BookIPInput, GetIPInput, ListIPsInput, ReleaseIPInput, UpdateIPInput } from "./types.js";

export function registerIpamTools(server: McpServer): void {
	server.tool(
		"scaleway_ipam_list_ips",
		"List IP addresses managed by Scaleway IPAM. Supports filtering by project, region, resource type, tags, attached status, IPv6, VPC, private network, and more. Returns paginated results.",
		ListIPsInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = ListIPsInput.parse(params);
			return handleListIPs(client, input);
		},
	);

	server.tool(
		"scaleway_ipam_get_ip",
		"Get details of a specific IP address by its ID, including source, resource attachment, tags, and reverse DNS configuration.",
		GetIPInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = GetIPInput.parse(params);
			return handleGetIP(client, input);
		},
	);

	server.tool(
		"scaleway_ipam_book_ip",
		"Book (reserve) a new IP address in Scaleway IPAM. Specify a source (zonal, private network, or subnet) and optionally a specific address, tags, and custom resource attachment.",
		BookIPInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = BookIPInput.parse(params);
			return handleBookIP(client, input);
		},
	);

	server.tool(
		"scaleway_ipam_release_ip",
		"Release (delete) an IP address reservation from Scaleway IPAM, freeing the address back to the pool.",
		ReleaseIPInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = ReleaseIPInput.parse(params);
			return handleReleaseIP(client, input);
		},
	);

	server.tool(
		"scaleway_ipam_update_ip",
		"Update an existing IP address in Scaleway IPAM. Supports modifying tags and reverse DNS entries.",
		UpdateIPInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = UpdateIPInput.parse(params);
			return handleUpdateIP(client, input);
		},
	);
}
