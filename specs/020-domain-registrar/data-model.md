# Data Model: Scaleway Domain Registrar MCP Tools

**Feature**: 020-domain-registrar | **Date**: 2026-03-11

## Entities

### Domain

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | yes | Fully qualified domain name |
| registrar | string | yes | Registrar managing the domain |
| status | enum | yes | active, expired, pending_transfer, pending_registration, redemption, deleting |
| auto_renew_status | enum | yes | enabled, disabled, not_supported |
| dnssec_status | enum | yes | enabled, disabled |
| epp_code | string | no | EPP authorization code for transfer |
| expired_at | string (ISO 8601) | no | Expiration date |
| updated_at | string (ISO 8601) | yes | Last update date |
| registrar_lock_status | enum | yes | locked, unlocked |
| organization_id | string (UUID) | yes | Organization ID |
| project_id | string (UUID) | yes | Project ID |

### Contact

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Contact unique identifier |
| firstname | string | yes | First name |
| lastname | string | yes | Last name |
| email | string (email) | yes | Email address |
| phone | string | yes | Phone number (E.164 format) |
| company_name | string | no | Company name |
| address_line_1 | string | yes | Address line 1 |
| city | string | yes | City |
| zip | string | yes | ZIP/postal code |
| country | string (2 chars) | yes | Country code (ISO 3166-1 alpha-2) |
| state | string | no | State or province |

### DomainAvailability

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | yes | Fully qualified domain name |
| available | boolean | yes | Whether the domain is available for registration |
| tld | string | yes | Top-level domain |

### Tld

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | TLD name (e.g., com, fr, io) |
| dnssec_support | boolean | yes | Whether DNSSEC is supported |
| offers | array | yes | Available offers for this TLD |

### Tld.Offer (nested)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| action | string | yes | Action type (e.g., register, renew, transfer) |
| price | number | yes | Price in currency units |

## Enums

### DomainStatus

Values: `active`, `expired`, `pending_transfer`, `pending_registration`, `redemption`, `deleting`

### AutoRenewStatus

Values: `enabled`, `disabled`, `not_supported`

### DnssecStatus

Values: `enabled`, `disabled`

### RegistrarLockStatus

Values: `locked`, `unlocked`

### TransferStatus

Values: `pending`, `waiting_transfer`, `processing`, `done`, `failed`
