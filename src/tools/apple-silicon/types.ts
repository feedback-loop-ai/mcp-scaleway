import { z } from "zod";
import { PaginationParams, ScalewayZone } from "../../shared/types.js";

export const ListServersOrderBy = z
	.enum(["created_at_asc", "created_at_desc"])
	.optional()
	.describe("Sort order for returned servers");

export const CommitmentType = z
	.enum(["duration_24h", "renewed_monthly", "none"])
	.optional()
	.describe("Commitment type for the server");

export const ListServersParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		project_id: z.string().optional().describe("Filter by project ID"),
		organization_id: z.string().optional().describe("Filter by organization ID"),
		order_by: ListServersOrderBy,
	})
	.merge(PaginationParams)
	.describe("Parameters for listing Apple Silicon servers");

export const GetServerParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		server_id: z.string().describe("UUID of the server"),
	})
	.describe("Parameters for getting an Apple Silicon server");

export const CreateServerParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		name: z.string().optional().describe("Server name"),
		project_id: z.string().optional().describe("Project ID to create the server in"),
		type: z.string().describe("Server type (e.g., M2-128)"),
		os_id: z.string().optional().describe("OS ID to install (defaults to server type default)"),
		enable_vpc: z.boolean().optional().default(false).describe("Enable Private Network support"),
		commitment_type: CommitmentType,
		public_bandwidth_bps: z.number().optional().describe("Public bandwidth in bits per second"),
		enable_kext: z
			.boolean()
			.optional()
			.default(false)
			.describe("Enable kernel extensions in macOS"),
	})
	.describe("Parameters for creating an Apple Silicon server");

export const DeleteServerParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		server_id: z.string().describe("UUID of the server to delete"),
	})
	.describe("Parameters for deleting an Apple Silicon server");

export const RebootServerParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		server_id: z.string().describe("UUID of the server to reboot"),
	})
	.describe("Parameters for rebooting an Apple Silicon server");

export const ReinstallServerParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		server_id: z.string().describe("UUID of the server to reinstall"),
		os_id: z.string().optional().describe("Target OS ID (defaults to server type default)"),
		enable_kext: z
			.boolean()
			.optional()
			.default(false)
			.describe("Enable kernel extensions in macOS"),
	})
	.describe("Parameters for reinstalling an Apple Silicon server");

export const ListServerTypesParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
	})
	.describe("Parameters for listing Apple Silicon server types");

export const ListOSParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		server_type: z.string().optional().describe("Filter by compatible server type"),
		name: z.string().optional().describe("Filter by OS name"),
	})
	.merge(PaginationParams)
	.describe("Parameters for listing Apple Silicon OS versions");

// --- Private Networks ---

export const ListServerPrivateNetworksOrderBy = z
	.enum(["created_at_asc", "created_at_desc", "updated_at_asc", "updated_at_desc"])
	.optional()
	.describe("Sort order for the returned Private Network attachments");

export const ListServerPrivateNetworksParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		order_by: ListServerPrivateNetworksOrderBy,
		server_id: z.string().optional().describe("Filter by Apple Silicon server ID"),
		private_network_id: z.string().optional().describe("Filter by Private Network ID"),
		organization_id: z.string().optional().describe("Filter by Organization ID"),
		project_id: z.string().optional().describe("Filter by Project ID"),
		ipam_ip_ids: z
			.array(z.string())
			.optional()
			.describe("Filter by IPAM IP IDs attached to the server"),
	})
	.merge(PaginationParams)
	.describe("Parameters for listing Apple Silicon server Private Network attachments");

export const GetServerPrivateNetworkParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		server_id: z.string().describe("ID of the server"),
		private_network_id: z.string().describe("ID of the Private Network"),
	})
	.describe("Parameters for getting a single Apple Silicon server Private Network attachment");

export const AddServerPrivateNetworkParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		server_id: z.string().describe("ID of the server to attach"),
		private_network_id: z.string().describe("ID of the Private Network to attach the server to"),
		ipam_ip_ids: z
			.array(z.string())
			.optional()
			.describe("IPAM IDs of IPs to attach to the server on the Private Network"),
	})
	.describe("Parameters for attaching an Apple Silicon server to a Private Network");

export const SetServerPrivateNetworksParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		server_id: z.string().describe("ID of the server to configure"),
		per_private_network_ipam_ip_ids: z
			.record(z.string(), z.array(z.string()))
			.describe(
				"Map of Private Network IDs to arrays of IPAM IP IDs. An empty array auto-assigns the next available IP from the Private Network CIDR.",
			),
	})
	.describe("Parameters for setting the full list of Private Networks on an Apple Silicon server");

export const DeleteServerPrivateNetworkParams = z
	.object({
		zone: ScalewayZone.optional().describe("Zone to target (e.g., fr-par-3)"),
		server_id: z.string().describe("ID of the server to detach"),
		private_network_id: z.string().describe("ID of the Private Network to detach from the server"),
	})
	.describe("Parameters for detaching an Apple Silicon server from a Private Network");
