# Quickstart: Scaleway Domain Registrar MCP Tools

**Feature**: 020-domain-registrar | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### Check Domain Availability

```json
{
  "tool": "scaleway_domain_registrar_check_domain_availability",
  "arguments": {
    "domain": "my-example-domain.com"
  }
}
```

### List Domains

```json
{
  "tool": "scaleway_domain_registrar_list_domains",
  "arguments": {
    "page": 1,
    "page_size": 10,
    "order_by": "domain_asc"
  }
}
```

### Get Domain Details

```json
{
  "tool": "scaleway_domain_registrar_get_domain",
  "arguments": {
    "domain": "example.com"
  }
}
```

### Create a Contact

```json
{
  "tool": "scaleway_domain_registrar_create_contact",
  "arguments": {
    "firstname": "Jane",
    "lastname": "Doe",
    "email": "jane@example.com",
    "phone": "+33612345678",
    "address_line_1": "42 Rue de Rivoli",
    "city": "Paris",
    "zip": "75001",
    "country": "FR"
  }
}
```

### Register a Domain

```json
{
  "tool": "scaleway_domain_registrar_register_domain",
  "arguments": {
    "domain": "my-new-domain.com",
    "duration_in_years": 1,
    "project_id": "project-uuid",
    "owner_contact_id": "contact-uuid"
  }
}
```

### Enable Auto-Renewal

```json
{
  "tool": "scaleway_domain_registrar_enable_auto_renew",
  "arguments": {
    "domain": "example.com"
  }
}
```

### Renew a Domain

```json
{
  "tool": "scaleway_domain_registrar_renew_domain",
  "arguments": {
    "domain": "example.com",
    "duration_in_years": 2
  }
}
```

### Transfer a Domain

```json
{
  "tool": "scaleway_domain_registrar_transfer_domain",
  "arguments": {
    "domain": "transfer-me.com",
    "auth_code": "EPP-AUTH-CODE-FROM-CURRENT-REGISTRAR",
    "project_id": "project-uuid",
    "owner_contact_id": "contact-uuid"
  }
}
```

### List Available TLDs

```json
{
  "tool": "scaleway_domain_registrar_list_tlds",
  "arguments": {
    "page": 1,
    "page_size": 20
  }
}
```

### Get TLD Pricing

```json
{
  "tool": "scaleway_domain_registrar_get_tld",
  "arguments": {
    "tld_name": "com"
  }
}
```
