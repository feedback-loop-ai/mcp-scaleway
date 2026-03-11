# SDD: VPC & Private Networks API

**Spec**: 016-vpc | **Date**: 2026-03-11
**API Group**: Networking | **Locality**: regional
**SDK Package**: `@scaleway/sdk-client` (direct API via `client.fetch`)

## Overview

Manages Virtual Private Clouds (VPCs) and Private Networks on Scaleway. VPCs provide isolated network environments within a region. Private Networks are Layer 2 networks attached to a VPC that enable secure communication between Scaleway resources without traversing the public internet.

## User Stories

### US-1: VPC CRUD (P1)
As an AI assistant user, I can list, create, get, update, and delete VPCs in any Scaleway region so I can manage isolated network environments.

### US-2: Private Network CRUD (P1)
As an AI assistant user, I can list, create, get, update, and delete Private Networks within VPCs so I can set up Layer 2 connectivity between resources.

### US-3: Subnet Management (P2)
As an AI assistant user, I can specify and update CIDR subnets when creating or updating Private Networks so I can control IP addressing within my networks.

## Tool Contracts

### scaleway_vpc_list_vpcs

```yaml
Tool: scaleway_vpc_list_vpcs
Title: List VPCs
Description: List all VPCs in a region. Returns paginated results with VPC details including name, tags, and private network count.
Scaleway API: GET /vpc/v2/regions/{region}/vpcs
Locality: regional

Input Schema:
  region: z.string().regex(/^[a-z]{2}-[a-z]{3}$/) - Region (e.g., fr-par) [required]
  page: z.number().int().positive().optional() - Page number (default: 1) [optional]
  pageSize: z.number().int().min(1).max(100).optional() - Items per page (default: 50) [optional]
  name: z.string().optional() - Filter by VPC name [optional]
  tags: z.array(z.string()).optional() - Filter by tags [optional]
  project: z.string().uuid().optional() - Filter by project ID [optional]

Output Schema:
  items: Vpc[] - Array of VPC resources
  totalCount: number - Total items across all pages
  page: number - Current page
  pageSize: number - Items per page

Pagination: yes

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 429: Rate limited -> rate_limited
```

### scaleway_vpc_get_vpc

```yaml
Tool: scaleway_vpc_get_vpc
Title: Get VPC
Description: Get details of a specific VPC by ID, including its name, tags, default status, and private network count.
Scaleway API: GET /vpc/v2/regions/{region}/vpcs/{vpc_id}
Locality: regional

Input Schema:
  region: z.string().regex(/^[a-z]{2}-[a-z]{3}$/) - Region [required]
  vpc_id: z.string().uuid() - VPC ID [required]

Output Schema:
  id: string - VPC ID
  name: string - VPC name
  region: string - Region
  project: string - Project ID
  tags: string[] - Tags
  is_default: boolean - Whether this is the default VPC
  private_network_count: number - Number of attached private networks
  created_at: string - Creation timestamp
  updated_at: string - Last update timestamp

Pagination: no

Error Codes:
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_vpc_create_vpc

```yaml
Tool: scaleway_vpc_create_vpc
Title: Create VPC
Description: Create a new VPC in a region. Requires a name and project ID. Optionally accepts tags.
Scaleway API: POST /vpc/v2/regions/{region}/vpcs
Locality: regional

Input Schema:
  region: z.string().regex(/^[a-z]{2}-[a-z]{3}$/) - Region [required]
  name: z.string().min(1) - VPC name [required]
  project: z.string().uuid() - Project ID [required]
  tags: z.array(z.string()).optional() - Tags [optional]

Output Schema: Vpc (same as get_vpc)

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
```

### scaleway_vpc_update_vpc

```yaml
Tool: scaleway_vpc_update_vpc
Title: Update VPC
Description: Update a VPC's name or tags. Specify only the fields you want to change.
Scaleway API: PATCH /vpc/v2/regions/{region}/vpcs/{vpc_id}
Locality: regional

Input Schema:
  region: z.string().regex(/^[a-z]{2}-[a-z]{3}$/) - Region [required]
  vpc_id: z.string().uuid() - VPC ID [required]
  name: z.string().min(1).optional() - New VPC name [optional]
  tags: z.array(z.string()).optional() - New tags [optional]

Output Schema: Vpc (same as get_vpc)

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_vpc_delete_vpc

```yaml
Tool: scaleway_vpc_delete_vpc
Title: Delete VPC
Description: Delete a VPC by ID. The VPC must have no private networks attached.
Scaleway API: DELETE /vpc/v2/regions/{region}/vpcs/{vpc_id}
Locality: regional

Input Schema:
  region: z.string().regex(/^[a-z]{2}-[a-z]{3}$/) - Region [required]
  vpc_id: z.string().uuid() - VPC ID [required]

Output Schema:
  success: boolean - Whether deletion succeeded
  vpc_id: string - Deleted VPC ID

Pagination: no

Error Codes:
  - 400: Invalid input (e.g., VPC has attached networks) -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_vpc_list_private_networks

```yaml
Tool: scaleway_vpc_list_private_networks
Title: List Private Networks
Description: List private networks in a region. Supports filtering by VPC ID, name, tags, and project.
Scaleway API: GET /vpc/v2/regions/{region}/private-networks
Locality: regional

Input Schema:
  region: z.string().regex(/^[a-z]{2}-[a-z]{3}$/) - Region [required]
  page: z.number().int().positive().optional() - Page number [optional]
  pageSize: z.number().int().min(1).max(100).optional() - Items per page [optional]
  name: z.string().optional() - Filter by name [optional]
  tags: z.array(z.string()).optional() - Filter by tags [optional]
  vpc_id: z.string().uuid().optional() - Filter by VPC ID [optional]
  project_id: z.string().uuid().optional() - Filter by project ID [optional]

Output Schema:
  items: PrivateNetwork[] - Array of private network resources
  totalCount: number - Total items
  page: number - Current page
  pageSize: number - Items per page

Pagination: yes

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 429: Rate limited -> rate_limited
```

### scaleway_vpc_get_private_network

```yaml
Tool: scaleway_vpc_get_private_network
Title: Get Private Network
Description: Get details of a specific private network by ID, including its VPC, subnets, and tags.
Scaleway API: GET /vpc/v2/regions/{region}/private-networks/{private_network_id}
Locality: regional

Input Schema:
  region: z.string().regex(/^[a-z]{2}-[a-z]{3}$/) - Region [required]
  private_network_id: z.string().uuid() - Private Network ID [required]

Output Schema:
  id: string - Private Network ID
  name: string - Name
  vpc_id: string - Parent VPC ID
  region: string - Region
  project_id: string - Project ID
  tags: string[] - Tags
  subnets: Subnet[] - Array of subnets (id, subnet CIDR, timestamps)
  created_at: string - Creation timestamp
  updated_at: string - Last update timestamp

Pagination: no

Error Codes:
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_vpc_create_private_network

```yaml
Tool: scaleway_vpc_create_private_network
Title: Create Private Network
Description: Create a new private network within a VPC. Requires name, project ID, and VPC ID.
Scaleway API: POST /vpc/v2/regions/{region}/private-networks
Locality: regional

Input Schema:
  region: z.string().regex(/^[a-z]{2}-[a-z]{3}$/) - Region [required]
  name: z.string().min(1) - Private network name [required]
  project_id: z.string().uuid() - Project ID [required]
  vpc_id: z.string().uuid() - VPC ID [required]
  tags: z.array(z.string()).optional() - Tags [optional]
  subnets: z.array(z.string()).optional() - CIDR subnets [optional]

Output Schema: PrivateNetwork (same as get_private_network)

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
```

### scaleway_vpc_update_private_network

```yaml
Tool: scaleway_vpc_update_private_network
Title: Update Private Network
Description: Update a private network's name, tags, or subnets.
Scaleway API: PATCH /vpc/v2/regions/{region}/private-networks/{private_network_id}
Locality: regional

Input Schema:
  region: z.string().regex(/^[a-z]{2}-[a-z]{3}$/) - Region [required]
  private_network_id: z.string().uuid() - Private Network ID [required]
  name: z.string().min(1).optional() - New name [optional]
  tags: z.array(z.string()).optional() - New tags [optional]
  subnets: z.array(z.string()).optional() - New CIDR subnets [optional]

Output Schema: PrivateNetwork (same as get_private_network)

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_vpc_delete_private_network

```yaml
Tool: scaleway_vpc_delete_private_network
Title: Delete Private Network
Description: Delete a private network by ID. The network must have no attached resources.
Scaleway API: DELETE /vpc/v2/regions/{region}/private-networks/{private_network_id}
Locality: regional

Input Schema:
  region: z.string().regex(/^[a-z]{2}-[a-z]{3}$/) - Region [required]
  private_network_id: z.string().uuid() - Private Network ID [required]

Output Schema:
  success: boolean - Whether deletion succeeded
  private_network_id: string - Deleted Private Network ID

Pagination: no

Error Codes:
  - 400: Invalid input (e.g., has attached resources) -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

## Scaleway API Reference

VPC v2 API: `https://www.scaleway.com/en/developers/api/vpc/`

Base path: `/vpc/v2/regions/{region}/`

Supported regions: fr-par, nl-ams, pl-waw

## Implementation Notes

- The VPC API is regional (not zoned). All requests require a `region` parameter.
- Uses `@scaleway/sdk-client` `client.fetch<T>(ScwRequest)` pattern with structured request objects (method, path, urlParams, body, headers).
- Pagination uses Scaleway's standard `page` + `page_size` query parameters; responses include `total_count`.
- VPCs have a `project` field (not `project_id`), while Private Networks use `project_id`. This is consistent with the Scaleway API.
- Delete operations require that the resource has no attached children (VPC must have no private networks; Private Network must have no attached resources).
- Tags are passed as repeated query parameters for list filters (e.g., `?tags=a&tags=b`).
