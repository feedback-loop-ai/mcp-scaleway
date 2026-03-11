# Research: Scaleway Key Manager MCP Tools

**Feature**: 025-key-manager | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Key Manager Package

The project uses `@scaleway/sdk-key-manager` which provides the `KeyManagerv1alpha1.API` class. This is instantiated with the shared `@scaleway/sdk-client` Client object. The SDK handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const api = new KeyManagerv1alpha1.API(client);
const key = await api.createKey({ region, name, usage, ... });
```

This is a higher-level SDK pattern compared to raw HTTP calls, providing typed request/response objects directly.

### Key Manager API Structure

The Scaleway Key Manager API is region-scoped. Base URL pattern:
```
https://api.scaleway.com/key-manager/v1alpha1/regions/{region}/
```

Key endpoints:
- `GET /keys` - List keys (paginated)
- `GET /keys/{key_id}` - Get key
- `POST /keys` - Create key
- `PATCH /keys/{key_id}` - Update key
- `DELETE /keys/{key_id}` - Delete key
- `POST /keys/{key_id}/rotate` - Rotate key
- `POST /keys/{key_id}/protect` - Protect key
- `POST /keys/{key_id}/unprotect` - Unprotect key
- `POST /keys/{key_id}/enable` - Enable key
- `POST /keys/{key_id}/disable` - Disable key
- `POST /keys/{key_id}/encrypt` - Encrypt data
- `POST /keys/{key_id}/decrypt` - Decrypt data
- `POST /keys/{key_id}/generate-data-key` - Generate data encryption key

### Key Usage Model

Keys support three mutually exclusive usage types:
1. **Symmetric encryption**: `aes_256_gcm` - for encrypt/decrypt and data key generation
2. **Asymmetric encryption**: `rsa_oaep_2048_sha256`, `rsa_oaep_3072_sha256`, `rsa_oaep_4096_sha256` - for encrypt/decrypt
3. **Asymmetric signing**: `ec_p256_sha256`, `ec_p384_sha384`, various RSA-PSS and RSA-PKCS1 variants - for signing operations

Only one usage type should be set per key via the `KeyUsageSchema` union.

### Key Lifecycle States

Keys follow a state machine:
- `enabled` - Key can be used for cryptographic operations
- `disabled` - Key exists but cannot be used (can be re-enabled)
- `pending_key_material` - External key awaiting material import
- `scheduled_for_deletion` - Key marked for deletion (grace period)

### Implementation Approach

The implementation uses the per-product SDK package (`@scaleway/sdk-key-manager`) rather than raw HTTP calls. This provides:
1. Typed request/response objects
2. Automatic serialization/deserialization
3. Region routing handled by the SDK

The handler functions instantiate the SDK API class, call the appropriate method, and format the response using `formatSuccess` or `formatErrorResponse`.

### Rotation Policy

Keys can have an automatic rotation policy with:
- `rotationPeriod`: Duration string (e.g., `"720h"` for 30 days). Minimum 24h, maximum 876000h (~100 years)
- `nextRotationAt`: ISO 8601 timestamp for the next scheduled rotation

The handler converts the `nextRotationAt` string to a JavaScript `Date` object before passing to the SDK.

### Error Handling

All Scaleway API errors are caught and mapped via the shared `mapScalewayError` function in `src/shared/errors.ts`. This converts SDK errors to structured MCP error responses with appropriate error types.

### Pagination

Scaleway Key Manager uses `page` (1-indexed) and `pageSize` query parameters. Responses include `totalCount`. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle this conversion.
