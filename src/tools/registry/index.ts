import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import {
	handleCreateNamespace,
	handleDeleteImage,
	handleDeleteNamespace,
	handleDeleteTag,
	handleGetImage,
	handleGetNamespace,
	handleGetTag,
	handleListImages,
	handleListNamespaces,
	handleListTags,
	handleUpdateImage,
	handleUpdateNamespace,
} from "./handlers.js";
import {
	CreateNamespaceInput,
	DeleteImageInput,
	DeleteNamespaceInput,
	DeleteTagInput,
	GetImageInput,
	GetNamespaceInput,
	GetTagInput,
	ListImagesInput,
	ListNamespacesInput,
	ListTagsInput,
	UpdateImageInput,
	UpdateNamespaceInput,
} from "./types.js";

export function registerRegistryTools(server: McpServer): void {
	// --- Namespace Tools ---

	server.tool(
		"scaleway_registry_list_namespaces",
		"List container registry namespaces in a region with optional filtering and pagination",
		ListNamespacesInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleListNamespaces(client, input);
		},
	);

	server.tool(
		"scaleway_registry_get_namespace",
		"Get details of a container registry namespace by ID",
		GetNamespaceInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleGetNamespace(client, input);
		},
	);

	server.tool(
		"scaleway_registry_create_namespace",
		"Create a new container registry namespace",
		CreateNamespaceInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleCreateNamespace(client, input);
		},
	);

	server.tool(
		"scaleway_registry_update_namespace",
		"Update a container registry namespace (description, public visibility)",
		UpdateNamespaceInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleUpdateNamespace(client, input);
		},
	);

	server.tool(
		"scaleway_registry_delete_namespace",
		"Delete a container registry namespace by ID",
		DeleteNamespaceInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleDeleteNamespace(client, input);
		},
	);

	// --- Image Tools ---

	server.tool(
		"scaleway_registry_list_images",
		"List container images with optional filtering by namespace and pagination",
		ListImagesInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleListImages(client, input);
		},
	);

	server.tool(
		"scaleway_registry_get_image",
		"Get details of a container image by ID",
		GetImageInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleGetImage(client, input);
		},
	);

	server.tool(
		"scaleway_registry_update_image",
		"Update a container image (visibility settings)",
		UpdateImageInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleUpdateImage(client, input);
		},
	);

	server.tool(
		"scaleway_registry_delete_image",
		"Delete a container image by ID",
		DeleteImageInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleDeleteImage(client, input);
		},
	);

	// --- Tag Tools ---

	server.tool(
		"scaleway_registry_list_tags",
		"List tags for a container image with optional filtering and pagination",
		ListTagsInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleListTags(client, input);
		},
	);

	server.tool(
		"scaleway_registry_get_tag",
		"Get details of a container image tag by ID",
		GetTagInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleGetTag(client, input);
		},
	);

	server.tool(
		"scaleway_registry_delete_tag",
		"Delete a container image tag by ID",
		DeleteTagInput.shape,
		async (input) => {
			const client = createScalewayClient(loadAuthConfig());
			return handleDeleteTag(client, input);
		},
	);
}
