import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import {
	handleCreateKey,
	handleDecrypt,
	handleDeleteKey,
	handleDisableKey,
	handleEnableKey,
	handleEncrypt,
	handleGenerateDataKey,
	handleGetKey,
	handleListKeys,
	handleProtectKey,
	handleRotateKey,
	handleUnprotectKey,
	handleUpdateKey,
} from "./handlers.js";
import {
	CreateKeyInput,
	DecryptInput,
	DeleteKeyInput,
	DisableKeyInput,
	EnableKeyInput,
	EncryptInput,
	GenerateDataKeyInput,
	GetKeyInput,
	ListKeysInput,
	ProtectKeyInput,
	RotateKeyInput,
	UnprotectKeyInput,
	UpdateKeyInput,
} from "./types.js";

export function registerKeyManagerTools(server: McpServer): void {
	const getClient = () => createScalewayClient(loadAuthConfig());

	server.tool(
		"scaleway_key_manager_list_keys",
		"List cryptographic keys in Scaleway Key Manager with filtering and pagination",
		ListKeysInput.shape,
		async (params) => handleListKeys(getClient(), ListKeysInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_get_key",
		"Get metadata for a specific cryptographic key",
		GetKeyInput.shape,
		async (params) => handleGetKey(getClient(), GetKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_create_key",
		"Create a new cryptographic key for encryption, decryption, or signing operations",
		CreateKeyInput.shape,
		async (params) => handleCreateKey(getClient(), CreateKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_update_key",
		"Update a key's metadata including name, description, tags, and rotation policy",
		UpdateKeyInput.shape,
		async (params) => handleUpdateKey(getClient(), UpdateKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_delete_key",
		"Permanently delete a cryptographic key (irreversible - encrypted data becomes undecipherable)",
		DeleteKeyInput.shape,
		async (params) => handleDeleteKey(getClient(), DeleteKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_rotate_key",
		"Rotate a key to generate new key material while keeping previous versions for decryption",
		RotateKeyInput.shape,
		async (params) => handleRotateKey(getClient(), RotateKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_protect_key",
		"Apply protection to a key preventing it from being deleted",
		ProtectKeyInput.shape,
		async (params) => handleProtectKey(getClient(), ProtectKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_unprotect_key",
		"Remove protection from a key allowing it to be deleted",
		UnprotectKeyInput.shape,
		async (params) => handleUnprotectKey(getClient(), UnprotectKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_enable_key",
		"Enable a disabled key for cryptographic operations",
		EnableKeyInput.shape,
		async (params) => handleEnableKey(getClient(), EnableKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_disable_key",
		"Disable a key preventing it from being used for cryptographic operations",
		DisableKeyInput.shape,
		async (params) => handleDisableKey(getClient(), DisableKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_encrypt",
		"Encrypt data using a cryptographic key (max 64KB plaintext)",
		EncryptInput.shape,
		async (params) => handleEncrypt(getClient(), EncryptInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_decrypt",
		"Decrypt ciphertext using a cryptographic key",
		DecryptInput.shape,
		async (params) => handleDecrypt(getClient(), DecryptInput.parse(params)),
	);

	server.tool(
		"scaleway_key_manager_generate_data_key",
		"Generate a data encryption key encrypted by a Key Manager key (for envelope encryption)",
		GenerateDataKeyInput.shape,
		async (params) => handleGenerateDataKey(getClient(), GenerateDataKeyInput.parse(params)),
	);
}
