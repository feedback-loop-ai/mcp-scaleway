# 008-containers: Serverless Containers API

## Overview

MCP tools for managing Scaleway Serverless Containers - a regional API for deploying containerized workloads without managing infrastructure.

## Entities

| Entity    | Description                                  |
|-----------|----------------------------------------------|
| Namespace | Logical grouping of containers (per-region)  |
| Container | Serverless container deployment unit         |
| Cron      | Scheduled trigger for a container            |
| Domain    | Custom domain mapped to a container          |
| Token     | Authentication token for invoking containers |

## User Stories

### P1 - Namespace CRUD
- US-008-01: List namespaces in a region with pagination
- US-008-02: Get namespace details by ID
- US-008-03: Create a new namespace
- US-008-04: Update namespace properties
- US-008-05: Delete a namespace

### P1 - Container CRUD & Deploy
- US-008-06: List containers in a namespace with pagination
- US-008-07: Get container details by ID
- US-008-08: Create a new container in a namespace
- US-008-09: Update container configuration
- US-008-10: Delete a container
- US-008-11: Deploy a container (trigger deployment of latest config)

### P2 - Cron Triggers
- US-008-12: List cron triggers with pagination
- US-008-13: Create a cron trigger for a container
- US-008-14: Update a cron trigger
- US-008-15: Delete a cron trigger

### P3 - Domains & Tokens
- US-008-16: List custom domains with pagination
- US-008-17: Create a custom domain mapping
- US-008-18: Delete a custom domain
- US-008-19: Create an authentication token
- US-008-20: Delete an authentication token

## MCP Tools

| Tool Name | Entity | Operation | Priority |
|-----------|--------|-----------|----------|
| scaleway_containers_list_namespaces | Namespace | List | P1 |
| scaleway_containers_get_namespace | Namespace | Get | P1 |
| scaleway_containers_create_namespace | Namespace | Create | P1 |
| scaleway_containers_update_namespace | Namespace | Update | P1 |
| scaleway_containers_delete_namespace | Namespace | Delete | P1 |
| scaleway_containers_list_containers | Container | List | P1 |
| scaleway_containers_get_container | Container | Get | P1 |
| scaleway_containers_create_container | Container | Create | P1 |
| scaleway_containers_update_container | Container | Update | P1 |
| scaleway_containers_delete_container | Container | Delete | P1 |
| scaleway_containers_deploy_container | Container | Deploy | P1 |
| scaleway_containers_list_crons | Cron | List | P2 |
| scaleway_containers_create_cron | Cron | Create | P2 |
| scaleway_containers_update_cron | Cron | Update | P2 |
| scaleway_containers_delete_cron | Cron | Delete | P2 |
| scaleway_containers_list_domains | Domain | List | P3 |
| scaleway_containers_create_domain | Domain | Create | P3 |
| scaleway_containers_delete_domain | Domain | Delete | P3 |
| scaleway_containers_create_token | Token | Create | P3 |
| scaleway_containers_delete_token | Token | Delete | P3 |

## API Details

- **Locality**: Regional (fr-par, nl-ams, pl-waw)
- **Base path**: `/containers/v1beta1/regions/{region}/`
- **Auth**: X-Auth-Token header (Scaleway secret key)
- **Pagination**: `page` (1-indexed) + `page_size`, response includes `total_count`
- **Error codes**: 400 (invalid_input), 401/403 (permission_denied), 404 (not_found), 429 (rate_limited)

## Key Container Properties

- `registry_image`: Docker image to deploy
- `min_scale` / `max_scale`: Autoscaling bounds
- `memory_limit`: Memory allocation in MB
- `cpu_limit`: CPU allocation in millicores
- `timeout`: Request timeout (e.g., "300s")
- `privacy`: "public" or "private"
- `protocol`: "http1" or "h2c"
- `port`: Container listening port
- `environment_variables`: Key-value env vars
- `secret_environment_variables`: Secret env vars (write-only)
- `http_option`: "enabled", "redirected", or "doNotForce"
