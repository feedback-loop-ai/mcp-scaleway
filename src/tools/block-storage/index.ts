import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	createSnapshot,
	createVolume,
	deleteSnapshot,
	deleteVolume,
	getSnapshot,
	getVolume,
	listSnapshots,
	listVolumeTypes,
	listVolumes,
	updateSnapshot,
	updateVolume,
} from "./handlers.js";
import {
	CreateSnapshotParams,
	CreateVolumeParams,
	DeleteSnapshotParams,
	DeleteVolumeParams,
	GetSnapshotParams,
	GetVolumeParams,
	ListSnapshotsParams,
	ListVolumeTypesParams,
	ListVolumesParams,
	UpdateSnapshotParams,
	UpdateVolumeParams,
} from "./types.js";

export function registerBlockStorageTools(server: McpServer): void {
	// --- Volume Tools ---

	server.tool(
		"scaleway_block_storage_list_volumes",
		"List block storage volumes in a Scaleway zone with optional filters",
		ListVolumesParams.shape,
		async (params) => listVolumes(ListVolumesParams.parse(params)),
	);

	server.tool(
		"scaleway_block_storage_get_volume",
		"Get details of a specific block storage volume",
		GetVolumeParams.shape,
		async (params) => getVolume(GetVolumeParams.parse(params)),
	);

	server.tool(
		"scaleway_block_storage_create_volume",
		"Create a new block storage volume from scratch or from a snapshot",
		CreateVolumeParams.shape,
		async (params) => createVolume(CreateVolumeParams.parse(params)),
	);

	server.tool(
		"scaleway_block_storage_update_volume",
		"Update a block storage volume (name, size, IOPS, or tags)",
		UpdateVolumeParams.shape,
		async (params) => updateVolume(UpdateVolumeParams.parse(params)),
	);

	server.tool(
		"scaleway_block_storage_delete_volume",
		"Delete a block storage volume",
		DeleteVolumeParams.shape,
		async (params) => deleteVolume(DeleteVolumeParams.parse(params)),
	);

	// --- Snapshot Tools ---

	server.tool(
		"scaleway_block_storage_list_snapshots",
		"List block storage snapshots in a Scaleway zone with optional filters",
		ListSnapshotsParams.shape,
		async (params) => listSnapshots(ListSnapshotsParams.parse(params)),
	);

	server.tool(
		"scaleway_block_storage_get_snapshot",
		"Get details of a specific block storage snapshot",
		GetSnapshotParams.shape,
		async (params) => getSnapshot(GetSnapshotParams.parse(params)),
	);

	server.tool(
		"scaleway_block_storage_create_snapshot",
		"Create a new block storage snapshot from a volume",
		CreateSnapshotParams.shape,
		async (params) => createSnapshot(CreateSnapshotParams.parse(params)),
	);

	server.tool(
		"scaleway_block_storage_update_snapshot",
		"Update a block storage snapshot (name or tags)",
		UpdateSnapshotParams.shape,
		async (params) => updateSnapshot(UpdateSnapshotParams.parse(params)),
	);

	server.tool(
		"scaleway_block_storage_delete_snapshot",
		"Delete a block storage snapshot",
		DeleteSnapshotParams.shape,
		async (params) => deleteSnapshot(DeleteSnapshotParams.parse(params)),
	);

	// --- Volume Type Tools ---

	server.tool(
		"scaleway_block_storage_list_volume_types",
		"List available block storage volume types and their specifications",
		ListVolumeTypesParams.shape,
		async (params) => listVolumeTypes(ListVolumeTypesParams.parse(params)),
	);
}
