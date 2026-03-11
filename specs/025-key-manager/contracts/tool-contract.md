# Tool Contracts: Scaleway Key Manager MCP Tools

**Feature**: 025-key-manager | **Date**: 2026-03-11

## Key Lifecycle Tools

### scaleway_key_manager_list_keys

**Scaleway API**: `GET /key-manager/v1alpha1/regions/{region}/keys`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | - | Region (e.g., fr-par) |
| organizationId | string (UUID) | no | - | Filter by Organization ID |
| projectId | string (UUID) | no | - | Filter by Project ID |
| orderBy | enum | no | - | Sort order (name_asc, name_desc, created_at_asc, created_at_desc, updated_at_asc, updated_at_desc) |
| tags | string[] | no | - | Filter by tags |
| name | string | no | - | Filter by key name |
| usage | enum | no | - | Filter by usage type (symmetric_encryption, asymmetric_encryption, asymmetric_signing) |
| scheduledForDeletion | boolean | no | false | Include keys scheduled for deletion |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |

**Output**: `{ items: Key[], totalCount: number, page: number, pageSize: number }`

---

### scaleway_key_manager_get_key

**Scaleway API**: `GET /key-manager/v1alpha1/regions/{region}/keys/{key_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| keyId | string (UUID) | yes | Key ID |

**Output**: `Key` (full key object)

---

### scaleway_key_manager_create_key

**Scaleway API**: `POST /key-manager/v1alpha1/regions/{region}/keys`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| projectId | string (UUID) | no | Project ID |
| name | string | no | Key name |
| usage | KeyUsage | no | Key usage configuration |
| description | string | no | Key description |
| tags | string[] | no | Tags |
| rotationPolicy | RotationPolicy | no | Rotation policy |
| unprotected | boolean | no | Create as unprotected (default: false) |
| origin | enum | no | Key origin (scaleway_kms, external) |

**Output**: `Key` (created key object)

---

### scaleway_key_manager_update_key

**Scaleway API**: `PATCH /key-manager/v1alpha1/regions/{region}/keys/{key_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| keyId | string (UUID) | yes | Key ID |
| name | string | no | Updated name |
| description | string | no | Updated description |
| tags | string[] | no | Updated tags |
| rotationPolicy | RotationPolicy | no | Updated rotation policy |

**Output**: `Key` (updated key object)

---

### scaleway_key_manager_delete_key

**Scaleway API**: `DELETE /key-manager/v1alpha1/regions/{region}/keys/{key_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| keyId | string (UUID) | yes | Key ID |

**Output**: `{ message: "Key successfully deleted", keyId: string }`

---

### scaleway_key_manager_rotate_key

**Scaleway API**: `POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/rotate`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| keyId | string (UUID) | yes | Key ID |

**Output**: `Key` (rotated key object with incremented rotationCount)

---

### scaleway_key_manager_protect_key

**Scaleway API**: `POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/protect`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| keyId | string (UUID) | yes | Key ID |

**Output**: `Key` (key object with protected=true)

---

### scaleway_key_manager_unprotect_key

**Scaleway API**: `POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/unprotect`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| keyId | string (UUID) | yes | Key ID |

**Output**: `Key` (key object with protected=false)

---

### scaleway_key_manager_enable_key

**Scaleway API**: `POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/enable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| keyId | string (UUID) | yes | Key ID |

**Output**: `Key` (key object with state=enabled)

---

### scaleway_key_manager_disable_key

**Scaleway API**: `POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/disable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| keyId | string (UUID) | yes | Key ID |

**Output**: `Key` (key object with state=disabled)

---

## Cryptographic Operation Tools

### scaleway_key_manager_encrypt

**Scaleway API**: `POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/encrypt`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| keyId | string (UUID) | yes | Key ID |
| plaintext | string | yes | Base64-encoded data to encrypt (max 65535 bytes) |
| associatedData | string | no | Additional authenticated data (symmetric keys only) |

**Output**: `{ keyId: string, ciphertext: string }`

---

### scaleway_key_manager_decrypt

**Scaleway API**: `POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/decrypt`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| keyId | string (UUID) | yes | Key ID |
| ciphertext | string | yes | Base64-encoded ciphertext to decrypt |
| associatedData | string | no | Additional authenticated data used during encryption |

**Output**: `{ keyId: string, plaintext: string }`

---

### scaleway_key_manager_generate_data_key

**Scaleway API**: `POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/generate-data-key`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| keyId | string (UUID) | yes | Key ID |
| algorithm | enum | no | Data key algorithm (aes_256_gcm) |
| withoutPlaintext | boolean | no | Omit plaintext from response (default: false) |

**Output**: `{ dataKey: string, plaintext?: string, keyId: string, algorithm: string }`
