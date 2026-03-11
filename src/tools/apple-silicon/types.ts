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
