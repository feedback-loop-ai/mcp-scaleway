# Data Model: Scaleway Key Manager MCP Tools

**Feature**: 025-key-manager | **Date**: 2026-03-11

## Entities

### Key

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique key identifier |
| name | string | yes | Key name |
| state | enum | yes | enabled, disabled, pending_key_material, scheduled_for_deletion |
| projectId | string (UUID) | yes | Project ID |
| organizationId | string (UUID) | yes | Organization ID |
| region | string | yes | Region (e.g., fr-par) |
| usage | KeyUsage | yes | Key usage configuration (one-of symmetric/asymmetric encryption/signing) |
| description | string | no | Key description |
| tags | string[] | no | User-defined tags |
| origin | enum | yes | scaleway_kms, external |
| rotationPolicy | RotationPolicy/null | no | Automatic rotation configuration |
| rotationCount | number | yes | Number of times the key has been rotated |
| protected | boolean | yes | Whether the key is protected from deletion |
| locked | boolean | yes | Whether the key is locked by Scaleway |
| createdAt | string (ISO 8601) | yes | Creation timestamp |
| updatedAt | string (ISO 8601) | yes | Last modification timestamp |
| rotatedAt | string (ISO 8601)/null | no | Last rotation timestamp |

### KeyUsage

Exactly one of the following fields should be set:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| symmetricEncryption | enum | no | aes_256_gcm |
| asymmetricEncryption | enum | no | rsa_oaep_2048_sha256, rsa_oaep_3072_sha256, rsa_oaep_4096_sha256 |
| asymmetricSigning | enum | no | ec_p256_sha256, ec_p384_sha384, rsa_pss_2048_sha256, rsa_pss_3072_sha256, rsa_pss_4096_sha256, rsa_pkcs1_2048_sha256, rsa_pkcs1_3072_sha256, rsa_pkcs1_4096_sha256 |

### RotationPolicy

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rotationPeriod | string | no | Duration between rotations (e.g., '720h'). Min 24h, max 876000h |
| nextRotationAt | string (ISO 8601) | no | Timestamp of next scheduled rotation |

### EncryptResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| keyId | string (UUID) | yes | ID of the key used |
| ciphertext | string | yes | Base64-encoded encrypted data |

### DecryptResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| keyId | string (UUID) | yes | ID of the key used |
| plaintext | string | yes | Base64-encoded decrypted data |

### DataKey

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dataKey | string | yes | Base64-encoded encrypted data key |
| plaintext | string/null | no | Base64-encoded plaintext data key (omitted if withoutPlaintext=true) |
| keyId | string (UUID) | yes | ID of the wrapping key |
| algorithm | enum | yes | aes_256_gcm |
| crc32 | number | no | CRC32 checksum of the plaintext |

## Enums

### KeyAlgorithmSymmetricEncryption
- `unknown_symmetric_encryption`
- `aes_256_gcm`

### KeyAlgorithmAsymmetricEncryption
- `unknown_asymmetric_encryption`
- `rsa_oaep_2048_sha256`
- `rsa_oaep_3072_sha256`
- `rsa_oaep_4096_sha256`

### KeyAlgorithmAsymmetricSigning
- `unknown_asymmetric_signing`
- `ec_p256_sha256`
- `ec_p384_sha384`
- `rsa_pss_2048_sha256`
- `rsa_pss_3072_sha256`
- `rsa_pss_4096_sha256`
- `rsa_pkcs1_2048_sha256`
- `rsa_pkcs1_3072_sha256`
- `rsa_pkcs1_4096_sha256`

### DataKeyAlgorithmSymmetricEncryption
- `unknown_symmetric_encryption`
- `aes_256_gcm`

### KeyState
- `unknown_state`
- `enabled`
- `disabled`
- `pending_key_material`
- `scheduled_for_deletion`

### KeyOrigin
- `unknown_origin`
- `scaleway_kms`
- `external`

### ListKeysOrderBy
- `name_asc`, `name_desc`
- `created_at_asc`, `created_at_desc`
- `updated_at_asc`, `updated_at_desc`

### ListKeysUsage
- `unknown_usage`
- `symmetric_encryption`
- `asymmetric_encryption`
- `asymmetric_signing`
