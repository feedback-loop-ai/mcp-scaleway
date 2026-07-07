import { z } from "zod";
import { PaginationParams, ScalewayZone } from "../../shared/types.js";

// --- Shared enums (from Dedibox v1 API) ---

export const OSType = z.enum([
	"unknown_type",
	"custom",
	"desktop",
	"panel",
	"rescue",
	"server",
	"virtu",
]);
export type OSType = z.infer<typeof OSType>;

export const OSArch = z.enum(["unknown_arch", "x86", "amd64", "arm", "arm64"]);
export type OSArch = z.infer<typeof OSArch>;

export const OfferCatalog = z.enum([
	"all",
	"default",
	"beta",
	"premium",
	"admin",
	"inactive",
	"reseller",
	"volume",
]);
export type OfferCatalog = z.infer<typeof OfferCatalog>;

export const OfferPaymentFrequency = z.enum(["monthly", "oneshot"]);
export type OfferPaymentFrequency = z.infer<typeof OfferPaymentFrequency>;

export const ServerStatus = z.enum([
	"unknown",
	"delivering",
	"error",
	"installing",
	"locked",
	"ready",
	"rescue",
	"stopped",
	"busy",
]);
export type ServerStatus = z.infer<typeof ServerStatus>;

export const ServerInstallStatus = z.enum([
	"unknown",
	"booting",
	"configuring",
	"configuring_bootloader",
	"formatting",
	"installed",
	"installing",
	"partitioning",
	"rebooting",
	"setting_up_raid",
]);
export type ServerInstallStatus = z.infer<typeof ServerInstallStatus>;

export const BMCAccessStatus = z.enum(["unknown", "created", "creating", "deleting"]);
export type BMCAccessStatus = z.infer<typeof BMCAccessStatus>;

export const PartitionFileSystem = z.enum([
	"unknown",
	"efi",
	"ext2",
	"ext3",
	"ext4",
	"fat32",
	"ntfs",
	"swap",
	"ufs",
	"xfs",
]);
export type PartitionFileSystem = z.infer<typeof PartitionFileSystem>;

export const RaidArrayRaidLevel = z.enum(["no_raid", "raid0", "raid1", "raid5", "raid6", "raid10"]);
export type RaidArrayRaidLevel = z.infer<typeof RaidArrayRaidLevel>;

export const ListServersOrderBy = z.enum(["created_at_asc", "created_at_desc"]);
export type ListServersOrderBy = z.infer<typeof ListServersOrderBy>;

export const ListOffersOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"name_asc",
	"name_desc",
	"price_asc",
	"price_desc",
]);
export type ListOffersOrderBy = z.infer<typeof ListOffersOrderBy>;

export const ListOSOrderBy = z.enum([
	"created_at_asc",
	"created_at_desc",
	"released_at_asc",
	"released_at_desc",
]);
export type ListOSOrderBy = z.infer<typeof ListOSOrderBy>;

// A Dedibox resource ID (server, offer, OS) is a numeric identifier.
const ResourceId = z.number().int().positive();

// --- Response schemas (validated by contract tests) ---

export const ServerSummary = z.object({
	id: z.number().int(),
	datacenter_name: z.string().optional(),
	organization_id: z.string(),
	project_id: z.string(),
	hostname: z.string(),
	created_at: z.string().datetime({ offset: true }).nullable().optional(),
	updated_at: z.string().datetime({ offset: true }).nullable().optional(),
	expired_at: z.string().datetime({ offset: true }).nullable().optional(),
	offer_id: z.number().int(),
	offer_name: z.string(),
	status: ServerStatus,
	os_id: z.number().int().nullable().optional(),
	interfaces: z.array(z.unknown()),
	zone: z.string(),
	level: z.unknown().nullable().optional(),
	is_outsourced: z.boolean(),
	qinq: z.boolean(),
	rpn_version: z.number().int().nullable().optional(),
	is_hds: z.boolean(),
});
export type ServerSummary = z.infer<typeof ServerSummary>;

export const Money = z.object({
	currency_code: z.string(),
	units: z.number().int(),
	nanos: z.number().int(),
});
export type Money = z.infer<typeof Money>;

export const Offer = z
	.object({
		id: z.number().int(),
		name: z.string(),
		catalog: OfferCatalog,
		payment_frequency: OfferPaymentFrequency,
		pricing: Money.nullable().optional(),
		server_info: z.unknown().optional(),
	})
	.passthrough();
export type Offer = z.infer<typeof Offer>;

export const OS = z
	.object({
		id: z.number().int(),
		name: z.string(),
		type: OSType,
		version: z.string(),
		arch: OSArch,
		allow_custom_partitioning: z.boolean(),
		allow_ssh_keys: z.boolean(),
		requires_user: z.boolean(),
		requires_admin_password: z.boolean(),
		requires_panel_password: z.boolean(),
		allowed_filesystems: z.array(PartitionFileSystem),
		requires_license: z.boolean(),
		max_partitions: z.number().int().nullable().optional(),
		display_name: z.string(),
	})
	.passthrough();
export type OS = z.infer<typeof OS>;

export const ServerLocation = z.object({
	rack: z.string(),
	room: z.string(),
	datacenter_name: z.string(),
});
export type ServerLocation = z.infer<typeof ServerLocation>;

export const Server = z
	.object({
		id: z.number().int(),
		organization_id: z.string(),
		project_id: z.string(),
		hostname: z.string(),
		rebooted_at: z.string().datetime({ offset: true }).nullable().optional(),
		created_at: z.string().datetime({ offset: true }).nullable().optional(),
		updated_at: z.string().datetime({ offset: true }).nullable().optional(),
		expired_at: z.string().datetime({ offset: true }).nullable().optional(),
		offer: Offer.nullable().optional(),
		status: ServerStatus,
		location: ServerLocation.nullable().optional(),
		os: OS.nullable().optional(),
		zone: z.string(),
		has_bmc: z.boolean(),
		tags: z.array(z.string()),
		is_outsourced: z.boolean(),
	})
	.passthrough();
export type Server = z.infer<typeof Server>;

export const Partition = z
	.object({
		file_system: PartitionFileSystem,
		mount_point: z.string().nullable().optional(),
		raid_level: RaidArrayRaidLevel,
		capacity: z.number().int(),
		connectors: z.array(z.string()),
	})
	.passthrough();
export type Partition = z.infer<typeof Partition>;

export const ServerInstall = z.object({
	os_id: z.number().int(),
	hostname: z.string(),
	user_login: z.string().nullable().optional(),
	partitions: z.array(Partition).nullable().optional(),
	ssh_key_ids: z.array(z.string()).nullable().optional(),
	status: ServerInstallStatus,
	panel_url: z.string().nullable().optional(),
});
export type ServerInstall = z.infer<typeof ServerInstall>;

export const BMCAccess = z.object({
	url: z.string(),
	login: z.string(),
	password: z.string(),
	expires_at: z.string().datetime({ offset: true }).nullable().optional(),
	status: BMCAccessStatus,
});
export type BMCAccess = z.infer<typeof BMCAccess>;

export const ListServersResponse = z.object({
	total_count: z.number().int().nonnegative(),
	servers: z.array(ServerSummary),
});
export type ListServersResponse = z.infer<typeof ListServersResponse>;

export const ListOffersResponse = z.object({
	total_count: z.number().int().nonnegative(),
	offers: z.array(Offer),
});
export type ListOffersResponse = z.infer<typeof ListOffersResponse>;

export const ListOSResponse = z.object({
	total_count: z.number().int().nonnegative(),
	os: z.array(OS),
});
export type ListOSResponse = z.infer<typeof ListOSResponse>;

// --- Tool parameter schemas ---

export const ListServersParams = PaginationParams.extend({
	zone: ScalewayZone.describe("Zone to target (e.g. fr-par-1)"),
	projectId: z.string().uuid().optional().describe("Filter servers by project ID"),
	search: z.string().optional().describe("Filter servers by hostname"),
	orderBy: ListServersOrderBy.optional().describe("Order of the returned servers"),
});
export type ListServersParams = z.infer<typeof ListServersParams>;

export const GetServerParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server"),
});
export type GetServerParams = z.infer<typeof GetServerParams>;

export const UpdateServerParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server to update"),
	hostname: z.string().optional().describe("New hostname of the server"),
	enableIpv6: z.boolean().optional().describe("Enable or disable IPv6 on the server"),
});
export type UpdateServerParams = z.infer<typeof UpdateServerParams>;

export const RebootServerParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server to reboot"),
});
export type RebootServerParams = z.infer<typeof RebootServerParams>;

export const StartServerParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server to start"),
});
export type StartServerParams = z.infer<typeof StartServerParams>;

export const StopServerParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server to stop"),
});
export type StopServerParams = z.infer<typeof StopServerParams>;

export const DeleteServerParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server to delete"),
});
export type DeleteServerParams = z.infer<typeof DeleteServerParams>;

export const InstallPartitionInput = z.object({
	fileSystem: PartitionFileSystem.describe("File system of the partition"),
	mountPoint: z.string().optional().describe("Mount point of the partition"),
	raidLevel: RaidArrayRaidLevel.optional().describe("RAID level of the partition"),
	capacity: z.number().int().nonnegative().describe("Capacity of the partition in bytes"),
	connectors: z.array(z.string()).optional().describe("Disk connectors of the partition"),
});
export type InstallPartitionInput = z.infer<typeof InstallPartitionInput>;

export const InstallServerParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server to install"),
	osId: ResourceId.describe("Numeric ID of the OS to install"),
	hostname: z.string().describe("Hostname of the server"),
	userLogin: z.string().optional().describe("User login to create on the server"),
	userPassword: z.string().optional().describe("User password to set on the server"),
	panelPassword: z.string().optional().describe("Panel password to set on the server"),
	rootPassword: z.string().optional().describe("Root password to set on the server"),
	partitions: z
		.array(InstallPartitionInput)
		.optional()
		.describe("Custom partitions to create on the server"),
	sshKeyIds: z.array(z.string()).optional().describe("SSH key IDs authorized on the server"),
	licenseOfferId: ResourceId.optional().describe("Offer ID of a license to install"),
	ipId: ResourceId.optional().describe("IP ID to link to the license"),
});
export type InstallServerParams = z.infer<typeof InstallServerParams>;

export const GetServerInstallParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server"),
});
export type GetServerInstallParams = z.infer<typeof GetServerInstallParams>;

export const CancelServerInstallParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server whose install to cancel"),
});
export type CancelServerInstallParams = z.infer<typeof CancelServerInstallParams>;

export const ListOffersParams = PaginationParams.extend({
	zone: ScalewayZone.describe("Zone to target (e.g. fr-par-1)"),
	orderBy: ListOffersOrderBy.optional().describe("Order of the returned offers"),
	commercialRange: z.string().optional().describe("Filter offers on commercial range"),
	catalog: OfferCatalog.optional().describe("Filter offers on catalog"),
	projectId: z.string().uuid().optional().describe("Project ID"),
	availableOnly: z.boolean().optional().describe("Only return available offers"),
});
export type ListOffersParams = z.infer<typeof ListOffersParams>;

export const GetOfferParams = z.object({
	zone: ScalewayZone.describe("Zone to target"),
	offerId: ResourceId.describe("Numeric ID of the offer"),
	projectId: z.string().uuid().optional().describe("Project ID"),
});
export type GetOfferParams = z.infer<typeof GetOfferParams>;

export const ListOSParams = PaginationParams.extend({
	zone: ScalewayZone.describe("Zone to target (e.g. fr-par-1)"),
	orderBy: ListOSOrderBy.optional().describe("Order of the returned OS list"),
	type: OSType.optional().describe("Filter OS by type"),
	serverId: ResourceId.optional().describe("Filter OS by compatible server ID"),
	projectId: z.string().uuid().optional().describe("Project ID"),
});
export type ListOSParams = z.infer<typeof ListOSParams>;

export const GetOSParams = z.object({
	zone: ScalewayZone.describe("Zone to target"),
	osId: ResourceId.describe("Numeric ID of the OS"),
	serverId: ResourceId.describe("Numeric ID of the server the OS must be compatible with"),
	projectId: z.string().uuid().optional().describe("Project ID"),
});
export type GetOSParams = z.infer<typeof GetOSParams>;

export const GetBmcAccessParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server"),
});
export type GetBmcAccessParams = z.infer<typeof GetBmcAccessParams>;

export const StartBmcAccessParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server"),
	ip: z.string().describe("IP address authorized to connect to the BMC console"),
});
export type StartBmcAccessParams = z.infer<typeof StartBmcAccessParams>;

export const StopBmcAccessParams = z.object({
	zone: ScalewayZone.describe("Zone the server is in"),
	serverId: ResourceId.describe("Numeric ID of the server"),
});
export type StopBmcAccessParams = z.infer<typeof StopBmcAccessParams>;
