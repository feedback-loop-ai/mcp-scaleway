import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleAttachIp,
	handleCreateIp,
	handleCreateSecurityGroup,
	handleCreateServer,
	handleCreateSnapshot,
	handleCreateVolume,
	handleDeleteIp,
	handleDeleteSecurityGroup,
	handleDeleteServer,
	handleDeleteSnapshot,
	handleDeleteVolume,
	handleGetSecurityGroup,
	handleGetServer,
	handleGetVolume,
	handleListIps,
	handleListSecurityGroups,
	handleListServers,
	handleListSnapshots,
	handleListVolumes,
	handleServerAction,
} from "./handlers.js";
import {
	AttachIpInput,
	CreateIpInput,
	CreateSecurityGroupInput,
	CreateServerInput,
	CreateSnapshotInput,
	CreateVolumeInput,
	DeleteIpInput,
	DeleteSecurityGroupInput,
	DeleteServerInput,
	DeleteSnapshotInput,
	DeleteVolumeInput,
	GetSecurityGroupInput,
	GetServerInput,
	GetVolumeInput,
	ListIpsInput,
	ListSecurityGroupsInput,
	ListServersInput,
	ListSnapshotsInput,
	ListVolumesInput,
	ServerActionInput,
} from "./types.js";

export function registerInstancesTools(server: McpServer): void {
	// ── Server Tools ──

	server.tool(
		"scaleway_instances_list_servers",
		"List Scaleway Instance servers in a zone with optional filtering by name, tags, state, and project. Returns paginated results.",
		ListServersInput.shape,
		async (params) => handleListServers(ListServersInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_get_server",
		"Get details of a specific Scaleway Instance server by its ID and zone.",
		GetServerInput.shape,
		async (params) => handleGetServer(GetServerInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_create_server",
		"Create a new Scaleway Instance server with the specified type, image, and configuration.",
		CreateServerInput.shape,
		async (params) => handleCreateServer(CreateServerInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_delete_server",
		"Delete a Scaleway Instance server by its ID and zone. The server must be stopped first.",
		DeleteServerInput.shape,
		async (params) => handleDeleteServer(DeleteServerInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_server_action",
		"Perform an action on a Scaleway Instance server: poweron, poweroff, reboot, terminate, stop_in_place, or backup.",
		ServerActionInput.shape,
		async (params) => handleServerAction(ServerActionInput.parse(params)),
	);

	// ── Volume Tools ──

	server.tool(
		"scaleway_instances_list_volumes",
		"List Scaleway Instance volumes in a zone with optional filtering by name, type, and project. Returns paginated results.",
		ListVolumesInput.shape,
		async (params) => handleListVolumes(ListVolumesInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_get_volume",
		"Get details of a specific Scaleway Instance volume by its ID and zone.",
		GetVolumeInput.shape,
		async (params) => handleGetVolume(GetVolumeInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_create_volume",
		"Create a new Scaleway Instance volume with the specified name, size, and type (l_ssd or b_ssd).",
		CreateVolumeInput.shape,
		async (params) => handleCreateVolume(CreateVolumeInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_delete_volume",
		"Delete a Scaleway Instance volume by its ID and zone. The volume must not be attached to a server.",
		DeleteVolumeInput.shape,
		async (params) => handleDeleteVolume(DeleteVolumeInput.parse(params)),
	);

	// ── Security Group Tools ──

	server.tool(
		"scaleway_instances_list_security_groups",
		"List Scaleway Instance security groups in a zone with optional filtering by name and project. Returns paginated results.",
		ListSecurityGroupsInput.shape,
		async (params) => handleListSecurityGroups(ListSecurityGroupsInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_get_security_group",
		"Get details of a specific Scaleway Instance security group by its ID and zone.",
		GetSecurityGroupInput.shape,
		async (params) => handleGetSecurityGroup(GetSecurityGroupInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_create_security_group",
		"Create a new Scaleway Instance security group with inbound/outbound default policies.",
		CreateSecurityGroupInput.shape,
		async (params) => handleCreateSecurityGroup(CreateSecurityGroupInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_delete_security_group",
		"Delete a Scaleway Instance security group by its ID and zone.",
		DeleteSecurityGroupInput.shape,
		async (params) => handleDeleteSecurityGroup(DeleteSecurityGroupInput.parse(params)),
	);

	// ── IP Tools ──

	server.tool(
		"scaleway_instances_list_ips",
		"List Scaleway Instance IPs in a zone with optional filtering by name, project, and type. Returns paginated results.",
		ListIpsInput.shape,
		async (params) => handleListIps(ListIpsInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_create_ip",
		"Reserve a new Scaleway Instance IP address (routed_ipv4 or routed_ipv6) in a zone.",
		CreateIpInput.shape,
		async (params) => handleCreateIp(CreateIpInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_delete_ip",
		"Release a Scaleway Instance IP address by its ID and zone.",
		DeleteIpInput.shape,
		async (params) => handleDeleteIp(DeleteIpInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_attach_ip",
		"Attach a Scaleway Instance IP address to a server.",
		AttachIpInput.shape,
		async (params) => handleAttachIp(AttachIpInput.parse(params)),
	);

	// ── Snapshot Tools ──

	server.tool(
		"scaleway_instances_list_snapshots",
		"List Scaleway Instance snapshots in a zone with optional filtering by name and project. Returns paginated results.",
		ListSnapshotsInput.shape,
		async (params) => handleListSnapshots(ListSnapshotsInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_create_snapshot",
		"Create a new Scaleway Instance snapshot from a volume.",
		CreateSnapshotInput.shape,
		async (params) => handleCreateSnapshot(CreateSnapshotInput.parse(params)),
	);

	server.tool(
		"scaleway_instances_delete_snapshot",
		"Delete a Scaleway Instance snapshot by its ID and zone.",
		DeleteSnapshotInput.shape,
		async (params) => handleDeleteSnapshot(DeleteSnapshotInput.parse(params)),
	);
}
