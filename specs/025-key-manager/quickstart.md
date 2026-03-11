# Quickstart: Scaleway Key Manager MCP Tools

**Feature**: 025-key-manager | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   export SCW_DEFAULT_REGION="fr-par"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Keys

```json
{
  "tool": "scaleway_key_manager_list_keys",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Symmetric Encryption Key

```json
{
  "tool": "scaleway_key_manager_create_key",
  "arguments": {
    "region": "fr-par",
    "name": "my-encryption-key",
    "usage": {
      "symmetricEncryption": "aes_256_gcm"
    },
    "description": "Key for encrypting application secrets",
    "tags": ["production", "secrets"]
  }
}
```

### Create a Key with Rotation Policy

```json
{
  "tool": "scaleway_key_manager_create_key",
  "arguments": {
    "region": "fr-par",
    "name": "auto-rotating-key",
    "usage": {
      "symmetricEncryption": "aes_256_gcm"
    },
    "rotationPolicy": {
      "rotationPeriod": "720h"
    }
  }
}
```

### Get Key Details

```json
{
  "tool": "scaleway_key_manager_get_key",
  "arguments": {
    "region": "fr-par",
    "keyId": "key-uuid"
  }
}
```

### Update Key Metadata

```json
{
  "tool": "scaleway_key_manager_update_key",
  "arguments": {
    "region": "fr-par",
    "keyId": "key-uuid",
    "name": "renamed-key",
    "description": "Updated description",
    "tags": ["updated"]
  }
}
```

### Rotate a Key

```json
{
  "tool": "scaleway_key_manager_rotate_key",
  "arguments": {
    "region": "fr-par",
    "keyId": "key-uuid"
  }
}
```

### Protect a Key from Deletion

```json
{
  "tool": "scaleway_key_manager_protect_key",
  "arguments": {
    "region": "fr-par",
    "keyId": "key-uuid"
  }
}
```

### Encrypt Data

```json
{
  "tool": "scaleway_key_manager_encrypt",
  "arguments": {
    "region": "fr-par",
    "keyId": "key-uuid",
    "plaintext": "SGVsbG8gV29ybGQ=",
    "associatedData": "context-info"
  }
}
```

### Decrypt Data

```json
{
  "tool": "scaleway_key_manager_decrypt",
  "arguments": {
    "region": "fr-par",
    "keyId": "key-uuid",
    "ciphertext": "encrypted-base64-data",
    "associatedData": "context-info"
  }
}
```

### Generate a Data Encryption Key (Envelope Encryption)

```json
{
  "tool": "scaleway_key_manager_generate_data_key",
  "arguments": {
    "region": "fr-par",
    "keyId": "key-uuid",
    "algorithm": "aes_256_gcm",
    "withoutPlaintext": false
  }
}
```

### Disable a Key

```json
{
  "tool": "scaleway_key_manager_disable_key",
  "arguments": {
    "region": "fr-par",
    "keyId": "key-uuid"
  }
}
```

### Delete a Key

```json
{
  "tool": "scaleway_key_manager_delete_key",
  "arguments": {
    "region": "fr-par",
    "keyId": "key-uuid"
  }
}
```
