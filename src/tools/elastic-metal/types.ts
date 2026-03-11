import { z } from "zod";
import { PaginationParams, ScalewayZone } from "../../shared/types.js";

// --- Input Schemas ---

export const ListServersInput = PaginationParams.extend({
	zone: ScalewayZone.describe("Zone to list servers in (e.g., fr-par-1)"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter servers by name"),
	tags: z.array(z.string()).optional().describe("Filter servers by tags"),
	status: z.string().optional().describe("Filter by server status"),
	order_by: z.string().optional().describe("Order results (e.g., created_at_asc, created_at_desc)"),
});
export type ListServersInput = z.infer<typeof ListServersInput>;

export const GetServerInput = z.object({
	zone: ScalewayZone.describe("Zone of the server"),
	server_id: z.string().uuid().describe("Server ID"),
});
export type GetServerInput = z.infer<typeof GetServerInput>;

export const CreateServerInput = z.object({
	zone: ScalewayZone.describe("Zone to create the server in"),
	offer_id: z.string().describe("Offer ID for the server configuration"),
	name: z.string().min(1).describe("Server name"),
	description: z.string().optional().default("").describe("Server description"),
	project_id: z.string().uuid().optional().describe("Project ID"),
	tags: z.array(z.string()).optional().default([]).describe("Server tags"),
});
export type CreateServerInput = z.infer<typeof CreateServerInput>;

export const DeleteServerInput = z.object({
	zone: ScalewayZone.describe("Zone of the server"),
	server_id: z.string().uuid().describe("Server ID to delete"),
});
export type DeleteServerInput = z.infer<typeof DeleteServerInput>;

export const InstallServerInput = z.object({
	zone: ScalewayZone.describe("Zone of the server"),
	server_id: z.string().uuid().describe("Server ID to install"),
	os_id: z.string().uuid().describe("Operating system ID to install"),
	hostname: z.string().min(1).describe("Hostname for the server"),
	ssh_key_ids: z.array(z.string().uuid()).min(1).describe("SSH key IDs for server access"),
	password: z.string().optional().describe("Optional root password"),
	service_user: z.string().optional().describe("Optional service user name"),
	service_password: z.string().optional().describe("Optional service user password"),
});
export type InstallServerInput = z.infer<typeof InstallServerInput>;

export const RebootServerInput = z.object({
	zone: ScalewayZone.describe("Zone of the server"),
	server_id: z.string().uuid().describe("Server ID to reboot"),
	boot_type: z.string().optional().describe("Boot type (e.g., normal, rescue)"),
});
export type RebootServerInput = z.infer<typeof RebootServerInput>;

export const StartServerInput = z.object({
	zone: ScalewayZone.describe("Zone of the server"),
	server_id: z.string().uuid().describe("Server ID to start"),
	boot_type: z.string().optional().describe("Boot type (e.g., normal, rescue)"),
});
export type StartServerInput = z.infer<typeof StartServerInput>;

export const StopServerInput = z.object({
	zone: ScalewayZone.describe("Zone of the server"),
	server_id: z.string().uuid().describe("Server ID to stop"),
});
export type StopServerInput = z.infer<typeof StopServerInput>;

export const ListOffersInput = PaginationParams.extend({
	zone: ScalewayZone.describe("Zone to list offers in"),
	subscription_period: z
		.string()
		.optional()
		.describe("Filter by subscription period (e.g., hourly, monthly)"),
});
export type ListOffersInput = z.infer<typeof ListOffersInput>;

export const ListOssInput = PaginationParams.extend({
	zone: ScalewayZone.describe("Zone to list operating systems in"),
	offer_id: z.string().optional().describe("Filter OSes compatible with this offer"),
});
export type ListOssInput = z.infer<typeof ListOssInput>;

export const GetBmcAccessInput = z.object({
	zone: ScalewayZone.describe("Zone of the server"),
	server_id: z.string().uuid().describe("Server ID to get BMC access for"),
});
export type GetBmcAccessInput = z.infer<typeof GetBmcAccessInput>;

export const ListIpsInput = PaginationParams.extend({
	zone: ScalewayZone.describe("Zone to list IPs in"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	server_id: z.string().uuid().optional().describe("Filter by server ID"),
	order_by: z.string().optional().describe("Order results"),
});
export type ListIpsInput = z.infer<typeof ListIpsInput>;

export const CreateIpInput = z.object({
	zone: ScalewayZone.describe("Zone to create the IP in"),
	project_id: z.string().uuid().describe("Project ID for the IP"),
	description: z.string().optional().default("").describe("IP description"),
	tags: z.array(z.string()).optional().default([]).describe("IP tags"),
	server_id: z.string().uuid().optional().describe("Server ID to attach the IP to"),
});
export type CreateIpInput = z.infer<typeof CreateIpInput>;

export const DeleteIpInput = z.object({
	zone: ScalewayZone.describe("Zone of the IP"),
	ip_id: z.string().uuid().describe("Flexible IP ID to delete"),
});
export type DeleteIpInput = z.infer<typeof DeleteIpInput>;
