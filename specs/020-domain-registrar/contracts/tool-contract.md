# Tool Contracts: Scaleway Domain Registrar MCP Tools

**Feature**: 020-domain-registrar | **Date**: 2026-03-11

## Domain Tools

### scaleway_domain_registrar_list_domains

**Scaleway API**: `GET /domain/v2beta1/domains`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| project_id | string | no | - | Filter by project ID |
| organization_id | string | no | - | Filter by organization ID |
| order_by | enum | no | - | Sort order: domain_asc, domain_desc, expired_at_asc, expired_at_desc |

**Output**: `{ domains: Domain[], total_count: number }`

---

### scaleway_domain_registrar_get_domain

**Scaleway API**: `GET /domain/v2beta1/domains/{domain}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | yes | Fully qualified domain name |

**Output**: `{ domain: Domain }`

---

### scaleway_domain_registrar_register_domain

**Scaleway API**: `POST /domain/v2beta1/domains`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| domain | string | yes | - | Domain name to register |
| duration_in_years | number | no | 1 | Registration duration (1-10 years) |
| project_id | string | yes | - | Project ID |
| owner_contact_id | string | yes | - | Owner contact ID |
| admin_contact_id | string | no | - | Admin contact ID (defaults to owner) |
| tech_contact_id | string | no | - | Technical contact ID (defaults to owner) |

**Output**: `{ domain: Domain }`

---

### scaleway_domain_registrar_renew_domain

**Scaleway API**: `POST /domain/v2beta1/domains/{domain}/renew`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| domain | string | yes | - | Domain name to renew |
| duration_in_years | number | no | 1 | Renewal duration (1-10 years) |

**Output**: `{ domain: Domain }`

---

### scaleway_domain_registrar_transfer_domain

**Scaleway API**: `POST /domain/v2beta1/domains/transfer`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | yes | Domain name to transfer |
| auth_code | string | yes | Authorization/EPP code from current registrar |
| project_id | string | yes | Project ID |
| owner_contact_id | string | yes | Owner contact ID |

**Output**: `{ domain: Domain }`

---

### scaleway_domain_registrar_update_domain

**Scaleway API**: `PATCH /domain/v2beta1/domains/{domain}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | yes | Domain name to update |
| owner_contact_id | string | no | New owner contact ID |
| admin_contact_id | string | no | New admin contact ID |
| tech_contact_id | string | no | New technical contact ID |

**Output**: `{ domain: Domain }`

---

### scaleway_domain_registrar_enable_auto_renew

**Scaleway API**: `POST /domain/v2beta1/domains/{domain}/enable-auto-renew`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | yes | Domain name to enable auto-renew for |

**Output**: `{ domain: Domain }`

---

### scaleway_domain_registrar_disable_auto_renew

**Scaleway API**: `POST /domain/v2beta1/domains/{domain}/disable-auto-renew`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | yes | Domain name to disable auto-renew for |

**Output**: `{ domain: Domain }`

---

### scaleway_domain_registrar_check_domain_availability

**Scaleway API**: `GET /domain/v2beta1/domains/availability`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | yes | Domain name to check availability for |

**Output**: `{ domain: string, available: boolean, tld: string }`

---

## Contact Tools

### scaleway_domain_registrar_list_contacts

**Scaleway API**: `GET /domain/v2beta1/contacts`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| domain | string | no | - | Filter contacts by domain |
| project_id | string | no | - | Filter by project ID |
| organization_id | string | no | - | Filter by organization ID |

**Output**: `{ contacts: Contact[], total_count: number }`

---

### scaleway_domain_registrar_get_contact

**Scaleway API**: `GET /domain/v2beta1/contacts/{contact_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| contact_id | string | yes | Contact UUID |

**Output**: `{ contact: Contact }`

---

### scaleway_domain_registrar_create_contact

**Scaleway API**: `POST /domain/v2beta1/contacts`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstname | string | yes | First name |
| lastname | string | yes | Last name |
| email | string | yes | Email address |
| phone | string | yes | Phone number (E.164 format) |
| company_name | string | no | Company name |
| address_line_1 | string | yes | Address line 1 |
| city | string | yes | City |
| zip | string | yes | ZIP/postal code |
| country | string | yes | Country code (ISO 3166-1 alpha-2, 2 chars) |
| state | string | no | State or province |

**Output**: `{ contact: Contact }`

---

### scaleway_domain_registrar_update_contact

**Scaleway API**: `PATCH /domain/v2beta1/contacts/{contact_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| contact_id | string | yes | Contact UUID |
| firstname | string | no | First name |
| lastname | string | no | Last name |
| email | string | no | Email address |
| phone | string | no | Phone number |
| company_name | string | no | Company name |
| address_line_1 | string | no | Address line 1 |
| city | string | no | City |
| zip | string | no | ZIP/postal code |
| country | string | no | Country code (ISO 3166-1 alpha-2) |
| state | string | no | State or province |

**Output**: `{ contact: Contact }`

---

## TLD Tools

### scaleway_domain_registrar_list_tlds

**Scaleway API**: `GET /domain/v2beta1/tlds`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |

**Output**: `{ tlds: Tld[], total_count: number }`

---

### scaleway_domain_registrar_get_tld

**Scaleway API**: `GET /domain/v2beta1/tlds/{tld_name}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tld_name | string | yes | TLD name (e.g., com, fr, io) |

**Output**: `{ tld: Tld }`
