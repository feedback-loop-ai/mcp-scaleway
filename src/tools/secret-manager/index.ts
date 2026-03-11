import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleAccessSecretVersion,
	handleAddSecretOwner,
	handleCreateSecret,
	handleCreateSecretVersion,
	handleDeleteSecret,
	handleDestroySecretVersion,
	handleDisableSecretVersion,
	handleEnableSecretVersion,
	handleGetSecret,
	handleGetSecretVersion,
	handleListSecretVersions,
	handleListSecrets,
	handleListTags,
	handleProtectSecret,
	handleUnprotectSecret,
	handleUpdateSecret,
} from "./handlers.js";
import {
	AccessSecretVersionInput,
	AddSecretOwnerInput,
	CreateSecretInput,
	CreateSecretVersionInput,
	DeleteSecretInput,
	DestroySecretVersionInput,
	DisableSecretVersionInput,
	EnableSecretVersionInput,
	GetSecretInput,
	GetSecretVersionInput,
	ListSecretVersionsInput,
	ListSecretsInput,
	ListTagsInput,
	ProtectSecretInput,
	UnprotectSecretInput,
	UpdateSecretInput,
} from "./types.js";

export function registerSecretManagerTools(server: McpServer): void {
	// ── Secret CRUD (P1) ─────────────────────────────────────────────────

	server.tool(
		"scaleway_secret_manager_list_secrets",
		"List secrets in a Scaleway project with optional filtering by name, tags, type, path, and ephemeral status. Returns paginated results.",
		ListSecretsInput.shape,
		handleListSecrets,
	);

	server.tool(
		"scaleway_secret_manager_get_secret",
		"Get metadata of a secret by its ID, including status, tags, version count, type, path, and ephemeral policy.",
		GetSecretInput.shape,
		handleGetSecret,
	);

	server.tool(
		"scaleway_secret_manager_create_secret",
		"Create a new secret in a Scaleway project. Supports types: opaque, certificate, key_value, basic_credentials, database_credentials, ssh_key.",
		CreateSecretInput.shape,
		handleCreateSecret,
	);

	server.tool(
		"scaleway_secret_manager_update_secret",
		"Update a secret's metadata: name, tags, description, path, or ephemeral policy.",
		UpdateSecretInput.shape,
		handleUpdateSecret,
	);

	server.tool(
		"scaleway_secret_manager_delete_secret",
		"Delete a secret and all its versions. Protected secrets must be unprotected first.",
		DeleteSecretInput.shape,
		handleDeleteSecret,
	);

	// ── Secret Versions (P1) ─────────────────────────────────────────────

	server.tool(
		"scaleway_secret_manager_list_secret_versions",
		"List versions of a secret, optionally filtered by status. Returns paginated results.",
		ListSecretVersionsInput.shape,
		handleListSecretVersions,
	);

	server.tool(
		"scaleway_secret_manager_get_secret_version",
		"Get metadata of a specific secret version by revision number or 'latest'/'latest_enabled'.",
		GetSecretVersionInput.shape,
		handleGetSecretVersion,
	);

	server.tool(
		"scaleway_secret_manager_create_secret_version",
		"Create a new version of a secret with base64-encoded payload. Optionally disables the previous version.",
		CreateSecretVersionInput.shape,
		handleCreateSecretVersion,
	);

	server.tool(
		"scaleway_secret_manager_access_secret_version",
		"Access the sensitive data payload of a secret version. Returns base64-encoded data.",
		AccessSecretVersionInput.shape,
		handleAccessSecretVersion,
	);

	server.tool(
		"scaleway_secret_manager_disable_secret_version",
		"Disable a secret version, making it inaccessible. Can be re-enabled later.",
		DisableSecretVersionInput.shape,
		handleDisableSecretVersion,
	);

	server.tool(
		"scaleway_secret_manager_enable_secret_version",
		"Enable a previously disabled secret version, restoring access.",
		EnableSecretVersionInput.shape,
		handleEnableSecretVersion,
	);

	server.tool(
		"scaleway_secret_manager_destroy_secret_version",
		"Permanently delete a secret version and its sensitive data. This action cannot be undone.",
		DestroySecretVersionInput.shape,
		handleDestroySecretVersion,
	);

	// ── Protect / Unprotect (P2) ─────────────────────────────────────────

	server.tool(
		"scaleway_secret_manager_protect_secret",
		"Enable secret protection. A protected secret can be read and modified but not deleted.",
		ProtectSecretInput.shape,
		handleProtectSecret,
	);

	server.tool(
		"scaleway_secret_manager_unprotect_secret",
		"Disable secret protection, allowing the secret to be deleted.",
		UnprotectSecretInput.shape,
		handleUnprotectSecret,
	);

	// ── Tags (P3) ────────────────────────────────────────────────────────

	server.tool(
		"scaleway_secret_manager_list_tags",
		"List all tags associated with secrets within a project. Returns paginated results.",
		ListTagsInput.shape,
		handleListTags,
	);

	// ── Ownership (P3) ──────────────────────────────────────────────────

	server.tool(
		"scaleway_secret_manager_add_secret_owner",
		"Grant a Scaleway product (e.g. edge_services, s2s_vpn) access to a secret.",
		AddSecretOwnerInput.shape,
		handleAddSecretOwner,
	);
}
