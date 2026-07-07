import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateFileSystem,
	handleDeleteFileSystem,
	handleGetFileSystem,
	handleListAttachments,
	handleListFileSystems,
	handleUpdateFileSystem,
} from "./handlers.js";
import {
	CreateFileSystemParams,
	DeleteFileSystemParams,
	GetFileSystemParams,
	ListAttachmentsParams,
	ListFileSystemsParams,
	UpdateFileSystemParams,
} from "./types.js";

export function registerFileStorageTools(server: McpServer): void {
	server.tool(
		"scaleway_file_storage_list_filesystems",
		"List File Storage file systems in a Scaleway region with optional filtering by project, organization, name, or tags",
		ListFileSystemsParams.shape,
		async (params) => handleListFileSystems(ListFileSystemsParams.parse(params)),
	);

	server.tool(
		"scaleway_file_storage_get_filesystem",
		"Get details of a specific File Storage file system by ID",
		GetFileSystemParams.shape,
		async (params) => handleGetFileSystem(GetFileSystemParams.parse(params)),
	);

	server.tool(
		"scaleway_file_storage_create_filesystem",
		"Create a new File Storage file system in a Scaleway region (size in bytes)",
		CreateFileSystemParams.shape,
		async (params) => handleCreateFileSystem(CreateFileSystemParams.parse(params)),
	);

	server.tool(
		"scaleway_file_storage_update_filesystem",
		"Update a File Storage file system (rename, resize, or replace tags)",
		UpdateFileSystemParams.shape,
		async (params) => handleUpdateFileSystem(UpdateFileSystemParams.parse(params)),
	);

	server.tool(
		"scaleway_file_storage_delete_filesystem",
		"Delete a detached File Storage file system by ID",
		DeleteFileSystemParams.shape,
		async (params) => handleDeleteFileSystem(DeleteFileSystemParams.parse(params)),
	);

	server.tool(
		"scaleway_file_storage_list_attachments",
		"List File Storage attachments (file system to resource links) in a region with optional filters",
		ListAttachmentsParams.shape,
		async (params) => handleListAttachments(ListAttachmentsParams.parse(params)),
	);
}
