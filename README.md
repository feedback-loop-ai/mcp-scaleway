# mcp-scaleway

[![npm](https://img.shields.io/npm/v/mcp-scaleway)](https://www.npmjs.com/package/mcp-scaleway)
[![CI](https://github.com/feedback-loop-ai/mcp-scaleway/actions/workflows/ci.yml/badge.svg)](https://github.com/feedback-loop-ai/mcp-scaleway/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-1.25+-blue.svg)](https://modelcontextprotocol.io/)

An MCP (Model Context Protocol) server that gives AI assistants like Claude full access to the Scaleway cloud platform. Manage compute instances, databases, Kubernetes clusters, serverless functions, object storage, and 45+ more Scaleway services through natural language.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Authentication](#authentication)
- [Configuration](#configuration)
  - [Claude Desktop](#claude-desktop)
  - [Claude Code](#claude-code)
  - [Other MCP Clients](#other-mcp-clients)
- [Usage Examples](#usage-examples)
- [Tool Reference](#tool-reference)
  - [Compute](#compute)
  - [Storage & Databases](#storage--databases)
  - [Networking](#networking)
  - [Serverless & Containers](#serverless--containers)
  - [AI & Machine Learning](#ai--machine-learning)
  - [Security & Identity](#security--identity)
  - [Managed Services](#managed-services)
  - [Account & Billing](#account--billing)
- [Managing Tool Access](#managing-tool-access)
- [Development](#development)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Overview

**mcp-scaleway** is a stateless MCP server that acts as a bridge between AI assistants and the [Scaleway](https://www.scaleway.com) cloud platform. It exposes 724 tools across 50 Scaleway services, enabling AI agents to provision infrastructure, manage databases, deploy applications, and operate cloud resources on your behalf.

**Why use this?**

- **Natural language cloud management** - Ask your AI assistant to "create a Kubernetes cluster with 3 nodes" instead of writing API calls
- **Full Scaleway coverage** - 50 services, 724 operations, from compute to AI to networking
- **Zero state** - Pure proxy to Scaleway APIs; no data stored, no side effects beyond what you request
- **Type-safe** - Every input validated with Zod schemas before reaching Scaleway

## Features

Supports 50 Scaleway service areas organized across 8 categories:

| Category | Services |
|----------|----------|
| **Compute** | Instances, Elastic Metal, Apple Silicon, Dedibox, Autoscaling |
| **Storage & Databases** | Block Storage, Object Storage, File Storage, RDB (PostgreSQL/MySQL), MongoDB, Redis, Serverless SQL DB, Data Warehouse (ClickHouse), OpenSearch |
| **Networking** | VPC, Load Balancer, Public Gateway, DNS, Domain Registrar, IPAM, Edge Services, Site-to-Site VPN, InterLink |
| **Serverless & Containers** | Containers, Functions, Jobs, Kubernetes (K8s) |
| **AI & Machine Learning** | Inference, Generative APIs, Cockpit (Observability), Data Lab (Apache Spark) |
| **Security & Identity** | IAM, Secret Manager, Key Manager, Audit Trail |
| **Managed Services** | NATS, SQS, SNS, TEM (Transactional Email), Mailbox, Kafka, RabbitMQ, IoT Hub, Container Registry, Marketplace |
| **Account & Billing** | Account, Billing, Web Hosting, Product Catalog, Environmental Footprint |

## Quick Start

```bash
# Set your Scaleway credentials
export SCW_ACCESS_KEY="SCWxxxxxxxxxxxxxxxxx"
export SCW_SECRET_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export SCW_DEFAULT_PROJECT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Run the server
npx mcp-scaleway
```

Then configure your MCP client (see [Configuration](#configuration) below).

## Installation

### Prerequisites

- [Node.js](https://nodejs.org) 18+ (or [Bun](https://bun.sh) 1.x)
- A [Scaleway account](https://console.scaleway.com) with API credentials

### Via npx (no install needed)

```bash
npx mcp-scaleway
```

### Global install

```bash
npm install -g mcp-scaleway
mcp-scaleway
```

### From source

```bash
git clone https://github.com/feedback-loop-ai/mcp-scaleway.git
cd mcp-scaleway
bun install
bun run start
```

## Authentication

The server authenticates with Scaleway using environment variables. You can generate API keys from the [Scaleway console](https://console.scaleway.com/iam/api-keys).

### Required

| Variable | Description |
|----------|-------------|
| `SCW_ACCESS_KEY` | Your Scaleway API access key (starts with `SCW`) |
| `SCW_SECRET_KEY` | Your Scaleway API secret key (UUID format) |
| `SCW_DEFAULT_PROJECT_ID` | Default project UUID for operations |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `SCW_DEFAULT_ORGANIZATION_ID` | Organization UUID (for multi-org accounts) | _(none)_ |
| `SCW_DEFAULT_REGION` | Default region for regional resources | `fr-par` |
| `SCW_DEFAULT_ZONE` | Default availability zone for zonal resources | `fr-par-1` |

### Available Regions

| Region | Location |
|--------|----------|
| `fr-par` | Paris, France |
| `nl-ams` | Amsterdam, Netherlands |
| `pl-waw` | Warsaw, Poland |

Each region has multiple zones (e.g., `fr-par-1`, `fr-par-2`, `fr-par-3`).

## Configuration

### Claude Desktop

Add the server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "scaleway": {
      "command": "npx",
      "args": ["mcp-scaleway"],
      "env": {
        "SCW_ACCESS_KEY": "SCWxxxxxxxxxxxxxxxxx",
        "SCW_SECRET_KEY": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "SCW_DEFAULT_PROJECT_ID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      }
    }
  }
}
```

### Claude Code

Add to your project's `.mcp.json` file (or `~/.claude/mcp.json` for global access):

```json
{
  "mcpServers": {
    "scaleway": {
      "command": "npx",
      "args": ["mcp-scaleway"],
      "env": {
        "SCW_ACCESS_KEY": "SCWxxxxxxxxxxxxxxxxx",
        "SCW_SECRET_KEY": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "SCW_DEFAULT_PROJECT_ID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      }
    }
  }
}
```

### Other MCP Clients

The server uses **stdio transport** (reads from stdin, writes to stdout). Any MCP-compatible client can connect by running:

```bash
SCW_ACCESS_KEY=... SCW_SECRET_KEY=... SCW_DEFAULT_PROJECT_ID=... npx mcp-scaleway
```

The server follows the [MCP specification](https://modelcontextprotocol.io) and works with any client that supports the protocol.

## Usage Examples

Once configured, you can ask your AI assistant to manage Scaleway resources using natural language:

### Compute - Managing Instances

> "List all my running instances in the fr-par-1 zone"

> "Create a DEV1-S instance named 'web-server' with an Ubuntu image in fr-par-1"

> "Stop the instance with ID xxx and then create a snapshot of its volume"

### Storage - Object Storage

> "List all my S3 buckets and show how many objects are in each one"

> "Create a new bucket called 'app-backups' in the fr-par region"

> "Set a lifecycle policy on the 'logs' bucket to expire objects after 30 days"

### Kubernetes - Cluster Management

> "Create a Kubernetes cluster named 'production' with version 1.28 and a pool of 3 PRO2-S nodes"

> "Get the kubeconfig for my 'staging' cluster"

> "List all node pools and their autoscaling status"

### Serverless - Functions & Containers

> "List all function namespaces in the fr-par region"

> "Deploy the container 'api-gateway' in namespace 'prod' and set up a cron trigger for every hour"

> "Create a new serverless job definition with 2 vCPUs and 2GB memory"

### AI - Inference & Generative APIs

> "List available inference models in fr-par"

> "Create an inference deployment using Llama 3 on a GPU-3070-S node"

> "Send a chat completion request using the Scaleway generative API"

### Security - Secrets & IAM

> "List all secrets in the default project"

> "Create a new secret called 'database-password' and add a version with the value 'supersecure'"

> "List all IAM users and show which groups they belong to"

## Tool Reference

### Compute

<details>
<summary><strong>Instances</strong> (20 tools) - Virtual machine instances</summary>

| Tool | Description |
|------|-------------|
| `scaleway_instances_list_servers` | List Instance servers in a zone with optional filtering by name, tags, state, and project |
| `scaleway_instances_get_server` | Get details of a specific Instance server by its ID and zone |
| `scaleway_instances_create_server` | Create a new Instance server with the specified type, image, and configuration |
| `scaleway_instances_delete_server` | Delete an Instance server (must be stopped first) |
| `scaleway_instances_server_action` | Perform an action: poweron, poweroff, reboot, terminate, stop_in_place, or backup |
| `scaleway_instances_list_volumes` | List Instance volumes in a zone with optional filtering |
| `scaleway_instances_get_volume` | Get details of a specific Instance volume |
| `scaleway_instances_create_volume` | Create a new Instance volume (l_ssd or b_ssd) |
| `scaleway_instances_delete_volume` | Delete an Instance volume (must not be attached) |
| `scaleway_instances_list_security_groups` | List Instance security groups in a zone |
| `scaleway_instances_get_security_group` | Get details of a specific security group |
| `scaleway_instances_create_security_group` | Create a new security group with inbound/outbound policies |
| `scaleway_instances_delete_security_group` | Delete a security group |
| `scaleway_instances_list_ips` | List Instance IPs in a zone |
| `scaleway_instances_create_ip` | Reserve a new IP address (routed_ipv4 or routed_ipv6) |
| `scaleway_instances_delete_ip` | Release an IP address |
| `scaleway_instances_attach_ip` | Attach an IP address to a server |
| `scaleway_instances_list_snapshots` | List Instance snapshots in a zone |
| `scaleway_instances_create_snapshot` | Create a snapshot from a volume |
| `scaleway_instances_delete_snapshot` | Delete a snapshot |

</details>

<details>
<summary><strong>Elastic Metal</strong> (18 tools) - Dedicated bare metal servers</summary>

| Tool | Description |
|------|-------------|
| `scaleway_elastic_metal_list_servers` | List Elastic Metal servers in a zone |
| `scaleway_elastic_metal_get_server` | Get detailed information about a specific server |
| `scaleway_elastic_metal_create_server` | Create a new Elastic Metal dedicated server |
| `scaleway_elastic_metal_delete_server` | Delete an Elastic Metal server |
| `scaleway_elastic_metal_install_server` | Install an operating system on a server |
| `scaleway_elastic_metal_reboot_server` | Reboot a server |
| `scaleway_elastic_metal_start_server` | Start a stopped server |
| `scaleway_elastic_metal_stop_server` | Stop a running server |
| `scaleway_elastic_metal_list_offers` | List available server offers in a zone |
| `scaleway_elastic_metal_list_oss` | List available operating systems |
| `scaleway_elastic_metal_get_bmc_access` | Get BMC access credentials (time-limited) |
| `scaleway_elastic_metal_list_ips` | List flexible IPs for Elastic Metal |
| `scaleway_elastic_metal_create_ip` | Create a new flexible IP |
| `scaleway_elastic_metal_delete_ip` | Delete a flexible IP |
| `scaleway_elastic_metal_list_server_private_networks` | List Private Network attachments for servers |
| `scaleway_elastic_metal_add_server_private_network` | Attach a server to a Private Network (max 8 per server) |
| `scaleway_elastic_metal_set_server_private_networks` | Replace the full set of Private Networks on a server |
| `scaleway_elastic_metal_delete_server_private_network` | Detach a server from a Private Network |

</details>

<details>
<summary><strong>Apple Silicon</strong> (13 tools) - Mac mini as-a-Service</summary>

| Tool | Description |
|------|-------------|
| `scaleway_apple_silicon_list_servers` | List Apple Silicon servers |
| `scaleway_apple_silicon_get_server` | Get details of a specific server |
| `scaleway_apple_silicon_create_server` | Create a new Apple Silicon server (24h minimum lease) |
| `scaleway_apple_silicon_delete_server` | Delete a server (after 24h minimum period) |
| `scaleway_apple_silicon_reboot_server` | Reboot a server |
| `scaleway_apple_silicon_reinstall_server` | Reinstall the OS (all data erased) |
| `scaleway_apple_silicon_list_server_types` | List available server types with specs |
| `scaleway_apple_silicon_list_os` | List available macOS versions |
| `scaleway_apple_silicon_list_server_private_networks` | List Private Network attachments for servers |
| `scaleway_apple_silicon_get_server_private_network` | Get a single Private Network attachment (VLAN and IPAM details) |
| `scaleway_apple_silicon_add_server_private_network` | Attach a server to a Private Network |
| `scaleway_apple_silicon_set_server_private_networks` | Replace the full set of Private Networks on a server |
| `scaleway_apple_silicon_delete_server_private_network` | Detach a server from a Private Network |

</details>

<details>
<summary><strong>Dedibox</strong> (17 tools) - Dedicated servers (Online.net)</summary>

| Tool | Description |
|------|-------------|
| `scaleway_dedibox_list_servers` | List Dedibox dedicated servers in a zone |
| `scaleway_dedibox_get_server` | Get details of a specific server by numeric ID |
| `scaleway_dedibox_update_server` | Update a server (hostname, enable/disable IPv6) |
| `scaleway_dedibox_reboot_server` | Reboot a server |
| `scaleway_dedibox_start_server` | Start a server |
| `scaleway_dedibox_stop_server` | Stop a server |
| `scaleway_dedibox_delete_server` | Delete (terminate) a server |
| `scaleway_dedibox_install_server` | Install an operating system on a server |
| `scaleway_dedibox_get_server_install` | Get the current installation status |
| `scaleway_dedibox_cancel_server_install` | Cancel an ongoing installation |
| `scaleway_dedibox_list_offers` | List available Dedibox offers in a zone |
| `scaleway_dedibox_get_offer` | Get details of a specific offer |
| `scaleway_dedibox_list_os` | List available operating systems in a zone |
| `scaleway_dedibox_get_os` | Get details of a specific operating system |
| `scaleway_dedibox_get_bmc_access` | Get BMC console access details |
| `scaleway_dedibox_start_bmc_access` | Start BMC console access |
| `scaleway_dedibox_stop_bmc_access` | Stop BMC console access |

</details>

<details>
<summary><strong>Autoscaling</strong> (15 tools) - Instance autoscaling groups (v1alpha2)</summary>

| Tool | Description |
|------|-------------|
| `scaleway_autoscaling_list_instance_groups` | List Instance autoscaling groups in a zone (v1alpha2, token pagination) |
| `scaleway_autoscaling_get_instance_group` | Get an autoscaling group (status, sizes, scaling policy, LB config, open alerts) |
| `scaleway_autoscaling_create_instance_group` | Create an autoscaling group from an Instance template with an embedded scaling policy |
| `scaleway_autoscaling_update_instance_group` | Update an autoscaling group (name, tags, template, scaling policy, LB config) |
| `scaleway_autoscaling_delete_instance_group` | Delete an autoscaling group and its managed Instances |
| `scaleway_autoscaling_list_instance_group_events` | List scaling logs of an autoscaling group, optionally within a time window |
| `scaleway_autoscaling_list_instance_group_servers` | List the Instances currently managed by an autoscaling group |
| `scaleway_autoscaling_list_instance_group_alerts` | List active and historical alerts for a group or a whole project |
| `scaleway_autoscaling_list_instance_templates` | List Instance templates (Instance API v2alpha1) usable by autoscaling groups |
| `scaleway_autoscaling_get_instance_template` | Get an Instance template (server type, volumes, Private Networks, IP counts) |
| `scaleway_autoscaling_create_instance_template` | Create an Instance template describing the Instances a group starts |
| `scaleway_autoscaling_update_instance_template` | Update an Instance template (applies to new Instances only) |
| `scaleway_autoscaling_delete_instance_template` | Delete an Instance template |
| `scaleway_autoscaling_get_instance_template_cloud_init` | Get the cloud-init configuration of an Instance template |
| `scaleway_autoscaling_set_instance_template_cloud_init` | Set the cloud-init configuration of an Instance template |

</details>

### Storage & Databases

<details>
<summary><strong>Block Storage</strong> (11 tools) - Managed block volumes</summary>

| Tool | Description |
|------|-------------|
| `scaleway_block_storage_list_volumes` | List block storage volumes in a zone |
| `scaleway_block_storage_get_volume` | Get details of a specific volume |
| `scaleway_block_storage_create_volume` | Create a new volume from scratch or from a snapshot |
| `scaleway_block_storage_update_volume` | Update a volume (name, size, IOPS, or tags) |
| `scaleway_block_storage_delete_volume` | Delete a volume |
| `scaleway_block_storage_list_snapshots` | List block storage snapshots in a zone |
| `scaleway_block_storage_get_snapshot` | Get details of a specific snapshot |
| `scaleway_block_storage_create_snapshot` | Create a snapshot from a volume |
| `scaleway_block_storage_update_snapshot` | Update a snapshot (name or tags) |
| `scaleway_block_storage_delete_snapshot` | Delete a snapshot |
| `scaleway_block_storage_list_volume_types` | List available volume types and specs |

</details>

<details>
<summary><strong>Object Storage</strong> (14 tools) - S3-compatible object storage</summary>

| Tool | Description |
|------|-------------|
| `scaleway_object_storage_list_buckets` | List all S3 buckets in a region |
| `scaleway_object_storage_create_bucket` | Create a new S3 bucket |
| `scaleway_object_storage_delete_bucket` | Delete a bucket (must be empty) |
| `scaleway_object_storage_get_bucket_info` | Get bucket details including versioning and object count |
| `scaleway_object_storage_list_objects` | List objects with optional prefix filtering and pagination |
| `scaleway_object_storage_get_object_info` | Get metadata for a specific object |
| `scaleway_object_storage_put_object` | Upload a small object (base64-encoded) |
| `scaleway_object_storage_delete_object` | Delete an object |
| `scaleway_object_storage_get_bucket_policy` | Get the bucket policy (JSON) |
| `scaleway_object_storage_set_bucket_policy` | Set or replace the bucket policy |
| `scaleway_object_storage_get_bucket_lifecycle` | Get lifecycle rules |
| `scaleway_object_storage_set_bucket_lifecycle` | Set lifecycle rules (expiration, transitions) |
| `scaleway_object_storage_get_bucket_versioning` | Get versioning status |
| `scaleway_object_storage_set_bucket_versioning` | Enable or suspend versioning |

</details>

<details>
<summary><strong>File Storage</strong> (6 tools) - Managed NFS file systems</summary>

| Tool | Description |
|------|-------------|
| `scaleway_file_storage_list_filesystems` | List file systems in a region with optional filtering |
| `scaleway_file_storage_get_filesystem` | Get details of a specific file system |
| `scaleway_file_storage_create_filesystem` | Create a new file system (size in bytes) |
| `scaleway_file_storage_update_filesystem` | Update a file system (rename, resize, or replace tags) |
| `scaleway_file_storage_delete_filesystem` | Delete a detached file system |
| `scaleway_file_storage_list_attachments` | List attachments (file system to resource links) |

</details>

<details>
<summary><strong>RDB</strong> (27 tools) - Managed PostgreSQL & MySQL</summary>

| Tool | Description |
|------|-------------|
| `scaleway_rdb_list_instances` | List RDB instances in a region |
| `scaleway_rdb_get_instance` | Get details of an RDB instance |
| `scaleway_rdb_create_instance` | Create a new RDB instance (PostgreSQL or MySQL) |
| `scaleway_rdb_update_instance` | Update an RDB instance |
| `scaleway_rdb_delete_instance` | Delete an RDB instance |
| `scaleway_rdb_upgrade_instance` | Upgrade node type, volume, or engine version |
| `scaleway_rdb_list_databases` | List databases within an instance |
| `scaleway_rdb_create_database` | Create a new database |
| `scaleway_rdb_delete_database` | Delete a database |
| `scaleway_rdb_list_users` | List users of an instance |
| `scaleway_rdb_create_user` | Create a new user with optional admin privileges |
| `scaleway_rdb_update_user` | Update a user's password or admin status |
| `scaleway_rdb_delete_user` | Delete a user |
| `scaleway_rdb_list_backups` | List database backups |
| `scaleway_rdb_create_backup` | Create a manual backup |
| `scaleway_rdb_restore_backup` | Restore a backup |
| `scaleway_rdb_list_endpoints` | List endpoints (public, private network, load balancer) |
| `scaleway_rdb_create_endpoint` | Create a new endpoint |
| `scaleway_rdb_delete_endpoint` | Delete an endpoint |
| `scaleway_rdb_list_acl_rules` | List ACL rules |
| `scaleway_rdb_add_acl_rules` | Add ACL rules for network access |
| `scaleway_rdb_delete_acl_rules` | Delete ACL rules |
| `scaleway_rdb_list_snapshots` | List snapshots |
| `scaleway_rdb_create_snapshot` | Create a snapshot |
| `scaleway_rdb_restore_snapshot` | Restore from a snapshot |
| `scaleway_rdb_list_node_types` | List available node types |
| `scaleway_rdb_list_database_engines` | List available database engines and versions |

</details>

<details>
<summary><strong>MongoDB</strong> (15 tools) - Managed MongoDB</summary>

| Tool | Description |
|------|-------------|
| `scaleway_mongodb_list_instances` | List MongoDB instances |
| `scaleway_mongodb_get_instance` | Get details of a MongoDB instance |
| `scaleway_mongodb_create_instance` | Create a new MongoDB instance |
| `scaleway_mongodb_update_instance` | Update a MongoDB instance |
| `scaleway_mongodb_delete_instance` | Delete a MongoDB instance |
| `scaleway_mongodb_list_users` | List users of an instance |
| `scaleway_mongodb_create_user` | Create a new user |
| `scaleway_mongodb_update_user` | Update a user's password |
| `scaleway_mongodb_delete_user` | Delete a user |
| `scaleway_mongodb_list_snapshots` | List MongoDB snapshots |
| `scaleway_mongodb_create_snapshot` | Create a snapshot |
| `scaleway_mongodb_restore_snapshot` | Restore a snapshot to a new instance |
| `scaleway_mongodb_delete_snapshot` | Delete a snapshot |
| `scaleway_mongodb_list_node_types` | List available node types |
| `scaleway_mongodb_list_versions` | List available MongoDB versions |

</details>

<details>
<summary><strong>Redis</strong> (16 tools) - Managed Redis cache</summary>

| Tool | Description |
|------|-------------|
| `scaleway_redis_list_clusters` | List Redis clusters |
| `scaleway_redis_get_cluster` | Get details of a Redis cluster |
| `scaleway_redis_create_cluster` | Create a new Redis cluster |
| `scaleway_redis_update_cluster` | Update a Redis cluster |
| `scaleway_redis_delete_cluster` | Delete a Redis cluster |
| `scaleway_redis_list_cluster_metrics` | Get cluster metrics (CPU, memory, connections) |
| `scaleway_redis_get_cluster_certificate` | Get the TLS certificate |
| `scaleway_redis_renew_cluster_certificate` | Renew the TLS certificate |
| `scaleway_redis_add_acl_rules` | Add ACL rules |
| `scaleway_redis_delete_acl_rules` | Delete ACL rules |
| `scaleway_redis_set_acl_rules` | Replace all ACL rules |
| `scaleway_redis_add_endpoints` | Add endpoints |
| `scaleway_redis_delete_endpoints` | Delete an endpoint |
| `scaleway_redis_set_endpoints` | Replace all endpoints |
| `scaleway_redis_list_node_types` | List available node types |
| `scaleway_redis_list_cluster_versions` | List available Redis versions |

</details>

<details>
<summary><strong>Serverless SQL DB</strong> (9 tools) - Serverless PostgreSQL</summary>

| Tool | Description |
|------|-------------|
| `scaleway_serverless_sqldb_list_databases` | List Serverless SQL Databases |
| `scaleway_serverless_sqldb_get_database` | Get details of a database |
| `scaleway_serverless_sqldb_create_database` | Create a new database with auto-scaling CPU |
| `scaleway_serverless_sqldb_update_database` | Update CPU scaling limits |
| `scaleway_serverless_sqldb_delete_database` | Delete a database |
| `scaleway_serverless_sqldb_list_database_backups` | List backups |
| `scaleway_serverless_sqldb_get_database_backup` | Get backup details |
| `scaleway_serverless_sqldb_export_database_backup` | Export a backup (download URL) |
| `scaleway_serverless_sqldb_restore_database` | Restore from a backup |

</details>

<details>
<summary><strong>Data Warehouse</strong> (19 tools) - Managed ClickHouse&reg;</summary>

| Tool | Description |
|------|-------------|
| `scaleway_data_warehouse_list_deployments` | List Data Warehouse deployments in a region |
| `scaleway_data_warehouse_get_deployment` | Get details of a specific deployment |
| `scaleway_data_warehouse_create_deployment` | Create a new ClickHouse&reg; deployment |
| `scaleway_data_warehouse_update_deployment` | Update a deployment (name, tags, CPU range, replicas, move factor) |
| `scaleway_data_warehouse_delete_deployment` | Delete a deployment (permanent, all data lost) |
| `scaleway_data_warehouse_start_deployment` | Start a stopped deployment |
| `scaleway_data_warehouse_stop_deployment` | Stop a running deployment |
| `scaleway_data_warehouse_get_deployment_certificate` | Retrieve the TLS certificate for a deployment |
| `scaleway_data_warehouse_list_databases` | List databases within a deployment |
| `scaleway_data_warehouse_create_database` | Create a new database |
| `scaleway_data_warehouse_delete_database` | Delete a database by name |
| `scaleway_data_warehouse_list_users` | List users of a deployment |
| `scaleway_data_warehouse_create_user` | Create a new user |
| `scaleway_data_warehouse_update_user` | Update a user's password or admin permissions |
| `scaleway_data_warehouse_delete_user` | Delete a user by name |
| `scaleway_data_warehouse_create_endpoint` | Create a public or Private Network endpoint |
| `scaleway_data_warehouse_delete_endpoint` | Delete an endpoint |
| `scaleway_data_warehouse_list_presets` | List available deployment configuration presets |
| `scaleway_data_warehouse_list_versions` | List available ClickHouse&reg; versions |

</details>

<details>
<summary><strong>OpenSearch</strong> (15 tools) - Cloud Essentials for OpenSearch</summary>

| Tool | Description |
|------|-------------|
| `scaleway_opensearch_list_deployments` | List OpenSearch deployments in a region |
| `scaleway_opensearch_get_deployment` | Get details of a specific deployment |
| `scaleway_opensearch_create_deployment` | Create a new deployment (node type, version, optional volume/endpoints) |
| `scaleway_opensearch_update_deployment` | Update a deployment (rename or change tags) |
| `scaleway_opensearch_upgrade_deployment` | Scale node count or increase volume size |
| `scaleway_opensearch_delete_deployment` | Delete a deployment |
| `scaleway_opensearch_get_certificate_authority` | Download the deployment's Certificate Authority (CA) |
| `scaleway_opensearch_list_node_types` | List available node types with specs and stock |
| `scaleway_opensearch_list_versions` | List available OpenSearch versions |
| `scaleway_opensearch_list_users` | List users of a deployment |
| `scaleway_opensearch_create_user` | Create a new user |
| `scaleway_opensearch_update_user` | Update a user (e.g. change password) |
| `scaleway_opensearch_delete_user` | Delete a user |
| `scaleway_opensearch_create_endpoint` | Create a public or Private Network endpoint |
| `scaleway_opensearch_delete_endpoint` | Delete an endpoint |

</details>

### Networking

<details>
<summary><strong>VPC</strong> (10 tools) - Virtual Private Cloud</summary>

| Tool | Description |
|------|-------------|
| `scaleway_vpc_list_vpcs` | List all VPCs in a region |
| `scaleway_vpc_get_vpc` | Get details of a specific VPC |
| `scaleway_vpc_create_vpc` | Create a new VPC |
| `scaleway_vpc_update_vpc` | Update a VPC's name or tags |
| `scaleway_vpc_delete_vpc` | Delete a VPC (must have no private networks) |
| `scaleway_vpc_list_private_networks` | List private networks |
| `scaleway_vpc_get_private_network` | Get details of a private network |
| `scaleway_vpc_create_private_network` | Create a new private network within a VPC |
| `scaleway_vpc_update_private_network` | Update a private network |
| `scaleway_vpc_delete_private_network` | Delete a private network |

</details>

<details>
<summary><strong>Load Balancer</strong> (31 tools) - Managed load balancing</summary>

| Tool | Description |
|------|-------------|
| `scaleway_lb_list_lbs` | List load balancers in a zone |
| `scaleway_lb_get_lb` | Get a specific load balancer |
| `scaleway_lb_create_lb` | Create a new load balancer |
| `scaleway_lb_update_lb` | Update a load balancer |
| `scaleway_lb_delete_lb` | Delete a load balancer |
| `scaleway_lb_migrate_lb` | Migrate to a different type |
| `scaleway_lb_list_frontends` | List frontends |
| `scaleway_lb_get_frontend` | Get a specific frontend |
| `scaleway_lb_create_frontend` | Create a frontend |
| `scaleway_lb_update_frontend` | Update a frontend |
| `scaleway_lb_delete_frontend` | Delete a frontend |
| `scaleway_lb_list_backends` | List backends |
| `scaleway_lb_get_backend` | Get a specific backend |
| `scaleway_lb_create_backend` | Create a backend |
| `scaleway_lb_update_backend` | Update a backend |
| `scaleway_lb_delete_backend` | Delete a backend |
| `scaleway_lb_add_backend_servers` | Add server IPs to a backend |
| `scaleway_lb_remove_backend_servers` | Remove server IPs from a backend |
| `scaleway_lb_set_backend_servers` | Set the complete server IP list |
| `scaleway_lb_list_routes` | List routes |
| `scaleway_lb_get_route` | Get a specific route |
| `scaleway_lb_create_route` | Create a route |
| `scaleway_lb_update_route` | Update a route |
| `scaleway_lb_delete_route` | Delete a route |
| `scaleway_lb_list_certificates` | List certificates |
| `scaleway_lb_get_certificate` | Get a specific certificate |
| `scaleway_lb_create_certificate` | Create a certificate |
| `scaleway_lb_update_certificate` | Update a certificate |
| `scaleway_lb_delete_certificate` | Delete a certificate |
| `scaleway_lb_get_lb_stats` | Get load balancer statistics |
| `scaleway_lb_list_lb_types` | List available load balancer types |

</details>

<details>
<summary><strong>Public Gateway</strong> (21 tools) - NAT gateway for private networks</summary>

| Tool | Description |
|------|-------------|
| `scaleway_public_gateway_list_gateways` | List Public Gateways |
| `scaleway_public_gateway_get_gateway` | Get details of a gateway |
| `scaleway_public_gateway_create_gateway` | Create a new gateway |
| `scaleway_public_gateway_update_gateway` | Update a gateway |
| `scaleway_public_gateway_delete_gateway` | Delete a gateway |
| `scaleway_public_gateway_list_gateway_networks` | List gateway-to-private-network connections |
| `scaleway_public_gateway_get_gateway_network` | Get a gateway network connection |
| `scaleway_public_gateway_create_gateway_network` | Attach a gateway to a private network |
| `scaleway_public_gateway_update_gateway_network` | Update a gateway network connection |
| `scaleway_public_gateway_delete_gateway_network` | Detach a gateway from a private network |
| `scaleway_public_gateway_list_pat_rules` | List PAT (port forwarding) rules |
| `scaleway_public_gateway_get_pat_rule` | Get a PAT rule |
| `scaleway_public_gateway_create_pat_rule` | Create a PAT rule |
| `scaleway_public_gateway_update_pat_rule` | Update a PAT rule |
| `scaleway_public_gateway_delete_pat_rule` | Delete a PAT rule |
| `scaleway_public_gateway_list_ips` | List flexible IPs |
| `scaleway_public_gateway_get_ip` | Get a flexible IP |
| `scaleway_public_gateway_create_ip` | Reserve a new flexible IP |
| `scaleway_public_gateway_update_ip` | Update a flexible IP |
| `scaleway_public_gateway_delete_ip` | Release a flexible IP |
| `scaleway_public_gateway_list_gateway_types` | List available gateway types |

</details>

<details>
<summary><strong>DNS</strong> (18 tools) - DNS zone management</summary>

| Tool | Description |
|------|-------------|
| `scaleway_dns_list_zones` | List DNS zones with optional filtering |
| `scaleway_dns_create_zone` | Create a new DNS zone |
| `scaleway_dns_update_zone` | Update a DNS zone |
| `scaleway_dns_delete_zone` | Delete a DNS zone and all records |
| `scaleway_dns_clone_zone` | Clone a zone to a new destination |
| `scaleway_dns_refresh_zone` | Refresh a DNS zone |
| `scaleway_dns_list_records` | List DNS records in a zone |
| `scaleway_dns_update_records` | Batch update DNS records |
| `scaleway_dns_clear_records` | Clear all records from a zone |
| `scaleway_dns_export_raw_zone` | Export as BIND zone file |
| `scaleway_dns_import_raw_zone` | Import from BIND zone file |
| `scaleway_dns_list_nameservers` | List nameservers |
| `scaleway_dns_update_nameservers` | Update nameservers |
| `scaleway_dns_get_ssl_certificate` | Get SSL certificate |
| `scaleway_dns_create_ssl_certificate` | Create SSL certificate |
| `scaleway_dns_delete_ssl_certificate` | Delete SSL certificate |
| `scaleway_dns_get_tsig_key` | Get TSIG key |
| `scaleway_dns_delete_tsig_key` | Delete TSIG key |

</details>

<details>
<summary><strong>Domain Registrar</strong> (14 tools) - Domain registration</summary>

| Tool | Description |
|------|-------------|
| `scaleway_domain_registrar_list_domains` | List all domains |
| `scaleway_domain_registrar_get_domain` | Get domain details |
| `scaleway_domain_registrar_register_domain` | Register a new domain (contacts created inline) |
| `scaleway_domain_registrar_renew_domain` | Renew a domain |
| `scaleway_domain_registrar_transfer_domain` | Transfer a domain from another registrar |
| `scaleway_domain_registrar_update_domain` | Update domain contacts |
| `scaleway_domain_registrar_enable_auto_renew` | Enable auto-renewal |
| `scaleway_domain_registrar_disable_auto_renew` | Disable auto-renewal |
| `scaleway_domain_registrar_check_domain_availability` | Check domain availability |
| `scaleway_domain_registrar_list_contacts` | List registration contacts |
| `scaleway_domain_registrar_get_contact` | Get contact details |
| `scaleway_domain_registrar_update_contact` | Update a contact |
| `scaleway_domain_registrar_list_tlds` | List available TLDs with pricing |
| `scaleway_domain_registrar_get_tld` | Get TLD details |

</details>

<details>
<summary><strong>IPAM</strong> (5 tools) - IP Address Management</summary>

| Tool | Description |
|------|-------------|
| `scaleway_ipam_list_ips` | List IP addresses managed by IPAM |
| `scaleway_ipam_get_ip` | Get details of a specific IP |
| `scaleway_ipam_book_ip` | Book (reserve) a new IP address |
| `scaleway_ipam_release_ip` | Release an IP reservation |
| `scaleway_ipam_update_ip` | Update an IP (tags, reverse DNS) |

</details>

<details>
<summary><strong>Edge Services</strong> (28 tools) - CDN and edge computing</summary>

| Tool | Description |
|------|-------------|
| `scaleway_edge_services_list_pipelines` | List Edge Services pipelines |
| `scaleway_edge_services_get_pipeline` | Get pipeline details |
| `scaleway_edge_services_create_pipeline` | Create a new pipeline |
| `scaleway_edge_services_update_pipeline` | Update a pipeline |
| `scaleway_edge_services_delete_pipeline` | Delete a pipeline |
| `scaleway_edge_services_list_dns_stages` | List DNS stages |
| `scaleway_edge_services_get_dns_stage` | Get DNS stage details |
| `scaleway_edge_services_create_dns_stage` | Create a DNS stage |
| `scaleway_edge_services_update_dns_stage` | Update a DNS stage |
| `scaleway_edge_services_delete_dns_stage` | Delete a DNS stage |
| `scaleway_edge_services_list_tls_stages` | List TLS stages |
| `scaleway_edge_services_get_tls_stage` | Get TLS stage details |
| `scaleway_edge_services_create_tls_stage` | Create a TLS stage |
| `scaleway_edge_services_update_tls_stage` | Update a TLS stage |
| `scaleway_edge_services_delete_tls_stage` | Delete a TLS stage |
| `scaleway_edge_services_list_cache_stages` | List cache stages |
| `scaleway_edge_services_get_cache_stage` | Get cache stage details |
| `scaleway_edge_services_create_cache_stage` | Create a cache stage |
| `scaleway_edge_services_update_cache_stage` | Update a cache stage |
| `scaleway_edge_services_delete_cache_stage` | Delete a cache stage |
| `scaleway_edge_services_list_backend_stages` | List backend stages |
| `scaleway_edge_services_get_backend_stage` | Get backend stage details |
| `scaleway_edge_services_create_backend_stage` | Create a backend stage (S3 or LB origin) |
| `scaleway_edge_services_update_backend_stage` | Update a backend stage |
| `scaleway_edge_services_delete_backend_stage` | Delete a backend stage |
| `scaleway_edge_services_purge_cache` | Purge cached content |
| `scaleway_edge_services_list_purge_requests` | List purge requests |
| `scaleway_edge_services_get_purge_request` | Get purge request details |

</details>

<details>
<summary><strong>Site-to-Site VPN</strong> (27 tools) - IPsec VPN gateways</summary>

| Tool | Description |
|------|-------------|
| `scaleway_vpn_list_gateways` | List VPN gateways in a region |
| `scaleway_vpn_get_gateway` | Get details of a specific VPN gateway |
| `scaleway_vpn_create_gateway` | Create a VPN gateway attached to a Private Network |
| `scaleway_vpn_update_gateway` | Update a VPN gateway's name or tags |
| `scaleway_vpn_delete_gateway` | Delete a VPN gateway |
| `scaleway_vpn_list_gateway_types` | List available VPN gateway commercial types |
| `scaleway_vpn_list_customer_gateways` | List customer gateways (remote network devices) |
| `scaleway_vpn_get_customer_gateway` | Get details of a specific customer gateway |
| `scaleway_vpn_create_customer_gateway` | Create a customer gateway for a remote device |
| `scaleway_vpn_update_customer_gateway` | Update a customer gateway (name, tags, public IPs, ASN) |
| `scaleway_vpn_delete_customer_gateway` | Delete a customer gateway |
| `scaleway_vpn_list_connections` | List VPN connections (IPsec tunnels) |
| `scaleway_vpn_get_connection` | Get details of a specific connection |
| `scaleway_vpn_create_connection` | Create an IPsec tunnel between a VPN and customer gateway |
| `scaleway_vpn_update_connection` | Update a connection's name or tags |
| `scaleway_vpn_delete_connection` | Delete a connection |
| `scaleway_vpn_renew_connection_psk` | Regenerate a connection's pre-shared key |
| `scaleway_vpn_change_connection_psk` | Change a connection's PSK to a Secret Manager secret |
| `scaleway_vpn_set_connection_routing_policy` | Attach IPv4/IPv6 routing policies to a connection |
| `scaleway_vpn_detach_connection_routing_policy` | Detach routing policies from a connection |
| `scaleway_vpn_enable_route_propagation` | Enable BGP dynamic route propagation on a connection |
| `scaleway_vpn_disable_route_propagation` | Disable BGP dynamic route propagation on a connection |
| `scaleway_vpn_list_routing_policies` | List VPN routing policies |
| `scaleway_vpn_get_routing_policy` | Get details of a specific routing policy |
| `scaleway_vpn_create_routing_policy` | Create a routing policy with allowed IPv4/IPv6 prefixes |
| `scaleway_vpn_update_routing_policy` | Update a routing policy's name, tags, or prefix filters |
| `scaleway_vpn_delete_routing_policy` | Delete a routing policy |

</details>

<details>
<summary><strong>InterLink</strong> (23 tools) - Private cloud interconnect</summary>

| Tool | Description |
|------|-------------|
| `scaleway_interlink_list_links` | List InterLink links (BGP peering sessions) |
| `scaleway_interlink_get_link` | Get link details including BGP session status |
| `scaleway_interlink_create_link` | Create a link (hosted via partner or self-hosted) |
| `scaleway_interlink_update_link` | Update a link's name, tags, or peer ASN |
| `scaleway_interlink_delete_link` | Delete a link |
| `scaleway_interlink_attach_vpc` | Attach a VPC to a link |
| `scaleway_interlink_detach_vpc` | Detach the VPC attached to a link |
| `scaleway_interlink_attach_routing_policy` | Attach a routing policy to a link |
| `scaleway_interlink_detach_routing_policy` | Detach a routing policy from a link |
| `scaleway_interlink_set_routing_policy` | Set (replace) the routing policy on a link |
| `scaleway_interlink_enable_route_propagation` | Enable route propagation on a link |
| `scaleway_interlink_disable_route_propagation` | Disable route propagation on a link |
| `scaleway_interlink_list_routing_policies` | List InterLink routing policies |
| `scaleway_interlink_get_routing_policy` | Get details of a specific routing policy |
| `scaleway_interlink_create_routing_policy` | Create a routing policy with IP prefix filters |
| `scaleway_interlink_update_routing_policy` | Update a routing policy |
| `scaleway_interlink_delete_routing_policy` | Delete a routing policy |
| `scaleway_interlink_list_partners` | List InterLink partners (hosting providers) |
| `scaleway_interlink_get_partner` | Get details of a specific partner |
| `scaleway_interlink_list_pops` | List Points of Presence (PoPs / datacenter locations) |
| `scaleway_interlink_get_pop` | Get details of a specific Point of Presence |
| `scaleway_interlink_list_dedicated_connections` | List dedicated (self-hosted) connections |
| `scaleway_interlink_get_dedicated_connection` | Get details of a specific dedicated connection |

</details>

### Serverless & Containers

<details>
<summary><strong>Containers</strong> (17 tools) - Serverless containers</summary>

| Tool | Description |
|------|-------------|
| `scaleway_containers_list_namespaces` | List container namespaces |
| `scaleway_containers_get_namespace` | Get namespace details |
| `scaleway_containers_create_namespace` | Create a new namespace |
| `scaleway_containers_update_namespace` | Update a namespace |
| `scaleway_containers_delete_namespace` | Delete a namespace |
| `scaleway_containers_list_containers` | List containers in a namespace |
| `scaleway_containers_get_container` | Get container details |
| `scaleway_containers_create_container` | Create a new container |
| `scaleway_containers_update_container` | Update container configuration |
| `scaleway_containers_delete_container` | Delete a container |
| `scaleway_containers_list_crons` | List cron triggers |
| `scaleway_containers_create_cron` | Create a cron trigger |
| `scaleway_containers_update_cron` | Update a cron trigger |
| `scaleway_containers_delete_cron` | Delete a cron trigger |
| `scaleway_containers_list_domains` | List custom domains |
| `scaleway_containers_create_domain` | Map a custom domain |
| `scaleway_containers_delete_domain` | Remove a custom domain |

</details>

<details>
<summary><strong>Functions</strong> (20 tools) - Serverless functions</summary>

| Tool | Description |
|------|-------------|
| `scaleway_functions_list_namespaces` | List function namespaces |
| `scaleway_functions_get_namespace` | Get namespace details |
| `scaleway_functions_create_namespace` | Create a new namespace |
| `scaleway_functions_update_namespace` | Update a namespace |
| `scaleway_functions_delete_namespace` | Delete a namespace |
| `scaleway_functions_list_functions` | List functions in a namespace |
| `scaleway_functions_get_function` | Get function details |
| `scaleway_functions_create_function` | Create a new function |
| `scaleway_functions_update_function` | Update a function |
| `scaleway_functions_delete_function` | Delete a function |
| `scaleway_functions_deploy_function` | Deploy a function (trigger build) |
| `scaleway_functions_list_crons` | List cron triggers |
| `scaleway_functions_create_cron` | Create a cron trigger |
| `scaleway_functions_update_cron` | Update a cron trigger |
| `scaleway_functions_delete_cron` | Delete a cron trigger |
| `scaleway_functions_list_domains` | List custom domains |
| `scaleway_functions_create_domain` | Attach a custom domain |
| `scaleway_functions_delete_domain` | Remove a custom domain |
| `scaleway_functions_create_token` | Create an access token |
| `scaleway_functions_delete_token` | Delete an access token |

</details>

<details>
<summary><strong>Jobs</strong> (9 tools) - Serverless batch jobs</summary>

| Tool | Description |
|------|-------------|
| `scaleway_jobs_list_definitions` | List job definitions |
| `scaleway_jobs_get_definition` | Get job definition details |
| `scaleway_jobs_create_definition` | Create a new job definition |
| `scaleway_jobs_update_definition` | Update a job definition |
| `scaleway_jobs_delete_definition` | Delete a job definition |
| `scaleway_jobs_start` | Start a new job run |
| `scaleway_jobs_list_runs` | List job runs |
| `scaleway_jobs_get_run` | Get job run details |
| `scaleway_jobs_stop_run` | Stop a running job |

</details>

<details>
<summary><strong>Kubernetes</strong> (13 tools) - Managed Kubernetes (Kapsule & Kosmos)</summary>

| Tool | Description |
|------|-------------|
| `scaleway_k8s_list_clusters` | List Kubernetes clusters |
| `scaleway_k8s_get_cluster` | Get cluster details |
| `scaleway_k8s_create_cluster` | Create a new cluster (Kapsule or Kosmos) |
| `scaleway_k8s_delete_cluster` | Delete a cluster |
| `scaleway_k8s_upgrade_cluster` | Upgrade cluster version |
| `scaleway_k8s_list_cluster_available_versions` | List available upgrade versions |
| `scaleway_k8s_get_cluster_kubeconfig` | Get the kubeconfig file |
| `scaleway_k8s_list_pools` | List node pools |
| `scaleway_k8s_get_pool` | Get node pool details |
| `scaleway_k8s_create_pool` | Create a node pool |
| `scaleway_k8s_update_pool` | Update a node pool |
| `scaleway_k8s_delete_pool` | Delete a node pool |
| `scaleway_k8s_upgrade_pool` | Upgrade a node pool version |

</details>

### AI & Machine Learning

<details>
<summary><strong>Inference</strong> (15 tools) - ML model deployment</summary>

| Tool | Description |
|------|-------------|
| `scaleway_inference_list_deployments` | List inference deployments |
| `scaleway_inference_get_deployment` | Get deployment details |
| `scaleway_inference_create_deployment` | Create a new deployment |
| `scaleway_inference_update_deployment` | Update a deployment |
| `scaleway_inference_delete_deployment` | Delete a deployment |
| `scaleway_inference_list_deployment_events` | List deployment events |
| `scaleway_inference_list_endpoints` | List inference endpoints |
| `scaleway_inference_create_endpoint` | Create an endpoint |
| `scaleway_inference_update_endpoint` | Update an endpoint |
| `scaleway_inference_delete_endpoint` | Delete an endpoint |
| `scaleway_inference_list_models` | List available models |
| `scaleway_inference_get_model` | Get model details |
| `scaleway_inference_list_node_types` | List available node types |
| `scaleway_inference_get_eula` | Get model EULA |
| `scaleway_inference_accept_eula` | Accept model EULA |

</details>

<details>
<summary><strong>Generative APIs</strong> (4 tools) - OpenAI-compatible LLM APIs</summary>

| Tool | Description |
|------|-------------|
| `scaleway_generative_apis_list_models` | List available generative AI models |
| `scaleway_generative_apis_get_model` | Get model details |
| `scaleway_generative_apis_chat_completion` | Create a chat completion (OpenAI-compatible) |
| `scaleway_generative_apis_create_embedding` | Create text embeddings |

</details>

<details>
<summary><strong>Cockpit</strong> (22 tools) - Observability & monitoring</summary>

| Tool | Description |
|------|-------------|
| `scaleway_cockpit_get_cockpit` | Get Cockpit info for a project |
| `scaleway_cockpit_activate_cockpit` | Activate Cockpit |
| `scaleway_cockpit_deactivate_cockpit` | Deactivate Cockpit |
| `scaleway_cockpit_list_data_sources` | List data sources |
| `scaleway_cockpit_create_data_source` | Create a data source |
| `scaleway_cockpit_delete_data_source` | Delete a data source |
| `scaleway_cockpit_list_tokens` | List tokens |
| `scaleway_cockpit_create_token` | Create a token |
| `scaleway_cockpit_delete_token` | Delete a token |
| `scaleway_cockpit_list_grafana_users` | List Grafana users |
| `scaleway_cockpit_create_grafana_user` | Create a Grafana user |
| `scaleway_cockpit_delete_grafana_user` | Delete a Grafana user |
| `scaleway_cockpit_reset_grafana_user_password` | Reset a Grafana user's password |
| `scaleway_cockpit_get_alert_manager` | Get alert manager info |
| `scaleway_cockpit_enable_alert_manager` | Enable alert manager |
| `scaleway_cockpit_disable_alert_manager` | Disable alert manager |
| `scaleway_cockpit_list_contact_points` | List alert contact points |
| `scaleway_cockpit_create_contact_point` | Create a contact point |
| `scaleway_cockpit_delete_contact_point` | Delete a contact point |
| `scaleway_cockpit_list_managed_alerts_contact_points` | List managed alerts contact points |
| `scaleway_cockpit_enable_managed_alerts` | Enable managed alerts |
| `scaleway_cockpit_disable_managed_alerts` | Disable managed alerts |

</details>

<details>
<summary><strong>Data Lab</strong> (8 tools) - Apache Spark clusters</summary>

| Tool | Description |
|------|-------------|
| `scaleway_data_lab_list_clusters` | List Data Lab for Apache Spark clusters in a region |
| `scaleway_data_lab_get_cluster` | Get details of a specific Spark cluster |
| `scaleway_data_lab_create_cluster` | Create a Spark cluster with worker (and optional main) nodes |
| `scaleway_data_lab_update_cluster` | Update a cluster (rename, retag, or scale worker count) |
| `scaleway_data_lab_delete_cluster` | Delete a Spark cluster |
| `scaleway_data_lab_list_node_types` | List available worker and notebook node types |
| `scaleway_data_lab_list_cluster_versions` | List available Apache Spark versions |
| `scaleway_data_lab_list_notebook_versions` | List available notebook software versions |

</details>

### Security & Identity

<details>
<summary><strong>IAM</strong> (32 tools) - Identity & Access Management</summary>

| Tool | Description |
|------|-------------|
| `scaleway_iam_list_users` | List IAM users |
| `scaleway_iam_get_user` | Get user details |
| `scaleway_iam_create_user` | Invite a new user |
| `scaleway_iam_update_user` | Update a user |
| `scaleway_iam_delete_user` | Remove a user |
| `scaleway_iam_list_applications` | List IAM applications |
| `scaleway_iam_get_application` | Get application details |
| `scaleway_iam_create_application` | Create a new application |
| `scaleway_iam_update_application` | Update an application |
| `scaleway_iam_delete_application` | Delete an application |
| `scaleway_iam_list_api_keys` | List API keys |
| `scaleway_iam_get_api_key` | Get API key details |
| `scaleway_iam_create_api_key` | Create a new API key |
| `scaleway_iam_update_api_key` | Update an API key |
| `scaleway_iam_delete_api_key` | Delete an API key |
| `scaleway_iam_list_policies` | List policies |
| `scaleway_iam_get_policy` | Get policy details |
| `scaleway_iam_create_policy` | Create a new policy |
| `scaleway_iam_update_policy` | Update a policy |
| `scaleway_iam_delete_policy` | Delete a policy |
| `scaleway_iam_list_rules` | List rules for a policy |
| `scaleway_iam_create_rule` | Create a new rule |
| `scaleway_iam_update_rule` | Update a rule |
| `scaleway_iam_delete_rule` | Delete a rule |
| `scaleway_iam_list_groups` | List groups |
| `scaleway_iam_get_group` | Get group details |
| `scaleway_iam_create_group` | Create a new group |
| `scaleway_iam_update_group` | Update a group |
| `scaleway_iam_delete_group` | Delete a group |
| `scaleway_iam_add_group_member` | Add a user or app to a group |
| `scaleway_iam_remove_group_member` | Remove a user or app from a group |
| `scaleway_iam_list_permission_sets` | List available permission sets |

</details>

<details>
<summary><strong>Secret Manager</strong> (16 tools) - Secret storage & versioning</summary>

| Tool | Description |
|------|-------------|
| `scaleway_secret_manager_list_secrets` | List secrets with filtering |
| `scaleway_secret_manager_get_secret` | Get secret metadata |
| `scaleway_secret_manager_create_secret` | Create a new secret |
| `scaleway_secret_manager_update_secret` | Update secret metadata |
| `scaleway_secret_manager_delete_secret` | Delete a secret and all versions |
| `scaleway_secret_manager_list_secret_versions` | List secret versions |
| `scaleway_secret_manager_get_secret_version` | Get version metadata |
| `scaleway_secret_manager_create_secret_version` | Create a new version |
| `scaleway_secret_manager_access_secret_version` | Access the secret data (base64) |
| `scaleway_secret_manager_disable_secret_version` | Disable a version |
| `scaleway_secret_manager_enable_secret_version` | Enable a version |
| `scaleway_secret_manager_destroy_secret_version` | Permanently destroy a version |
| `scaleway_secret_manager_protect_secret` | Enable deletion protection |
| `scaleway_secret_manager_unprotect_secret` | Disable deletion protection |
| `scaleway_secret_manager_list_tags` | List tags across secrets |
| `scaleway_secret_manager_add_secret_owner` | Grant a Scaleway product access to a secret |

</details>

<details>
<summary><strong>Key Manager</strong> (13 tools) - Cryptographic key management</summary>

| Tool | Description |
|------|-------------|
| `scaleway_key_manager_list_keys` | List cryptographic keys |
| `scaleway_key_manager_get_key` | Get key metadata |
| `scaleway_key_manager_create_key` | Create a new key |
| `scaleway_key_manager_update_key` | Update key metadata and rotation policy |
| `scaleway_key_manager_delete_key` | Permanently delete a key (irreversible) |
| `scaleway_key_manager_rotate_key` | Rotate key material |
| `scaleway_key_manager_protect_key` | Protect a key from deletion |
| `scaleway_key_manager_unprotect_key` | Remove deletion protection |
| `scaleway_key_manager_enable_key` | Enable a key |
| `scaleway_key_manager_disable_key` | Disable a key |
| `scaleway_key_manager_encrypt` | Encrypt data (max 64KB) |
| `scaleway_key_manager_decrypt` | Decrypt ciphertext |
| `scaleway_key_manager_generate_data_key` | Generate a data encryption key |

</details>

<details>
<summary><strong>Audit Trail</strong> (5 tools) - Activity audit logging</summary>

| Tool | Description |
|------|-------------|
| `scaleway_audit_trail_list_events` | List audit events with rich filters (cursor-paginated) |
| `scaleway_audit_trail_list_products` | List products integrated with Audit Trail and their tracked methods |
| `scaleway_audit_trail_list_export_jobs` | List export jobs (scheduled event exports to Object Storage) |
| `scaleway_audit_trail_create_export_job` | Create an export job to a Scaleway Object Storage bucket |
| `scaleway_audit_trail_delete_export_job` | Delete an export job |

</details>

### Managed Services

<details>
<summary><strong>NATS</strong> (9 tools) - Managed NATS messaging</summary>

| Tool | Description |
|------|-------------|
| `scaleway_nats_list_accounts` | List NATS accounts |
| `scaleway_nats_get_account` | Get account details |
| `scaleway_nats_create_account` | Create a new NATS account |
| `scaleway_nats_update_account` | Update an account |
| `scaleway_nats_delete_account` | Delete an account |
| `scaleway_nats_list_credentials` | List credentials |
| `scaleway_nats_get_credentials` | Get credentials details |
| `scaleway_nats_create_credentials` | Create new credentials |
| `scaleway_nats_delete_credentials` | Delete credentials |

</details>

<details>
<summary><strong>SQS</strong> (8 tools) - Managed message queues</summary>

| Tool | Description |
|------|-------------|
| `scaleway_sqs_activate` | Activate SQS service for a project |
| `scaleway_sqs_deactivate` | Deactivate SQS service |
| `scaleway_sqs_get_info` | Get SQS service info and endpoint |
| `scaleway_sqs_create_credentials` | Create SQS credentials |
| `scaleway_sqs_delete_credentials` | Delete SQS credentials |
| `scaleway_sqs_get_credentials` | Get credentials details |
| `scaleway_sqs_list_credentials` | List all credentials |
| `scaleway_sqs_update_credentials` | Update credentials |

</details>

<details>
<summary><strong>SNS</strong> (8 tools) - Topics & Events (pub/sub)</summary>

| Tool | Description |
|------|-------------|
| `scaleway_sns_activate` | Activate SNS service for a project |
| `scaleway_sns_deactivate` | Deactivate SNS service |
| `scaleway_sns_get_info` | Get SNS service info and endpoint |
| `scaleway_sns_list_credentials` | List SNS credentials |
| `scaleway_sns_get_credentials` | Get credentials details |
| `scaleway_sns_create_credentials` | Create SNS credentials with permissions |
| `scaleway_sns_update_credentials` | Update credentials |
| `scaleway_sns_delete_credentials` | Delete credentials |

</details>

<details>
<summary><strong>TEM</strong> (15 tools) - Transactional Email</summary>

| Tool | Description |
|------|-------------|
| `scaleway_tem_list_domains` | List email domains |
| `scaleway_tem_get_domain` | Get domain details |
| `scaleway_tem_create_domain` | Register a new domain |
| `scaleway_tem_revoke_domain` | Revoke a domain |
| `scaleway_tem_check_domain` | Trigger DNS verification |
| `scaleway_tem_get_domain_last_status` | Get last DNS verification status |
| `scaleway_tem_list_emails` | List transactional emails |
| `scaleway_tem_get_email` | Get email details |
| `scaleway_tem_create_email` | Send a transactional email |
| `scaleway_tem_cancel_email` | Cancel a queued email |
| `scaleway_tem_get_statistics` | Get email sending statistics |
| `scaleway_tem_list_webhooks` | List webhooks |
| `scaleway_tem_create_webhook` | Create a webhook |
| `scaleway_tem_update_webhook` | Update a webhook |
| `scaleway_tem_delete_webhook` | Delete a webhook |

</details>

<details>
<summary><strong>Mailbox</strong> (16 tools) - Managed email mailboxes</summary>

| Tool | Description |
|------|-------------|
| `scaleway_mailbox_list_domains` | List Mailbox domains |
| `scaleway_mailbox_get_domain` | Get details of a specific domain |
| `scaleway_mailbox_create_domain` | Register a domain for use with Mailbox |
| `scaleway_mailbox_delete_domain` | Delete a domain |
| `scaleway_mailbox_get_domain_records` | Get the DNS records required to configure a domain |
| `scaleway_mailbox_validate_domain_records` | Trigger validation of a domain's DNS records |
| `scaleway_mailbox_create_mailboxes` | Create one or more mailboxes in a domain (batch) |
| `scaleway_mailbox_list_mailboxes` | List mailboxes with optional filters |
| `scaleway_mailbox_get_mailbox` | Get details of a specific mailbox |
| `scaleway_mailbox_update_mailbox` | Update a mailbox's subscription period or password |
| `scaleway_mailbox_delete_mailbox` | Delete a mailbox |
| `scaleway_mailbox_restore_mailbox` | Restore a mailbox scheduled for deletion |
| `scaleway_mailbox_create_alias` | Create an email alias for a mailbox |
| `scaleway_mailbox_list_aliases` | List aliases with optional filters |
| `scaleway_mailbox_get_alias` | Get details of a specific alias |
| `scaleway_mailbox_delete_alias` | Delete an email alias |

</details>

<details>
<summary><strong>Kafka</strong> (13 tools) - Managed Apache Kafka</summary>

| Tool | Description |
|------|-------------|
| `scaleway_kafka_list_clusters` | List Clusters for Apache Kafka in a region |
| `scaleway_kafka_get_cluster` | Get details of a specific cluster |
| `scaleway_kafka_create_cluster` | Create a cluster (version, node type, node amount, volume) |
| `scaleway_kafka_update_cluster` | Update a cluster (rename or replace tags) |
| `scaleway_kafka_delete_cluster` | Delete a cluster |
| `scaleway_kafka_get_cluster_certificate_authority` | Get the TLS certificate authority (PEM) |
| `scaleway_kafka_renew_cluster_certificate_authority` | Renew the TLS certificate authority |
| `scaleway_kafka_create_endpoint` | Create a private or public network endpoint |
| `scaleway_kafka_delete_endpoint` | Delete a cluster endpoint |
| `scaleway_kafka_list_users` | List users of a cluster |
| `scaleway_kafka_update_user` | Update a user (e.g. change password) |
| `scaleway_kafka_list_node_types` | List available node types |
| `scaleway_kafka_list_versions` | List available Apache Kafka versions |

</details>

<details>
<summary><strong>RabbitMQ</strong> (15 tools) - Managed RabbitMQ (MessageQ)</summary>

| Tool | Description |
|------|-------------|
| `scaleway_rabbitmq_list_deployments` | List RabbitMQ deployments in a region |
| `scaleway_rabbitmq_get_deployment` | Get details of a specific deployment |
| `scaleway_rabbitmq_create_deployment` | Create a deployment (node type, count, version, optional user/endpoints) |
| `scaleway_rabbitmq_update_deployment` | Update a deployment (rename or update tags) |
| `scaleway_rabbitmq_upgrade_deployment` | Scale node count or volume size |
| `scaleway_rabbitmq_delete_deployment` | Delete a deployment |
| `scaleway_rabbitmq_get_deployment_certificate` | Download the deployment's certificate authority |
| `scaleway_rabbitmq_list_users` | List users of a deployment |
| `scaleway_rabbitmq_create_user` | Create a new user |
| `scaleway_rabbitmq_update_user` | Update a user (e.g. change password) |
| `scaleway_rabbitmq_delete_user` | Delete a user |
| `scaleway_rabbitmq_create_endpoint` | Create a public or private network endpoint |
| `scaleway_rabbitmq_delete_endpoint` | Delete an endpoint |
| `scaleway_rabbitmq_list_node_types` | List available node types |
| `scaleway_rabbitmq_list_versions` | List available RabbitMQ (MessageQ) versions |

</details>

<details>
<summary><strong>IoT Hub</strong> (29 tools) - IoT device management</summary>

| Tool | Description |
|------|-------------|
| `scaleway_iot_list_hubs` | List IoT hubs |
| `scaleway_iot_get_hub` | Get hub details |
| `scaleway_iot_create_hub` | Create a new hub |
| `scaleway_iot_update_hub` | Update a hub |
| `scaleway_iot_delete_hub` | Delete a hub |
| `scaleway_iot_enable_hub` | Enable a hub |
| `scaleway_iot_disable_hub` | Disable a hub |
| `scaleway_iot_get_hub_ca` | Get hub CA certificate |
| `scaleway_iot_set_hub_ca` | Set custom CA certificate |
| `scaleway_iot_list_devices` | List devices |
| `scaleway_iot_get_device` | Get device details |
| `scaleway_iot_create_device` | Create a new device |
| `scaleway_iot_update_device` | Update a device |
| `scaleway_iot_delete_device` | Delete a device |
| `scaleway_iot_enable_device` | Enable a device |
| `scaleway_iot_disable_device` | Disable a device |
| `scaleway_iot_get_device_certificate` | Get device certificate |
| `scaleway_iot_renew_device_certificate` | Renew device certificate |
| `scaleway_iot_set_device_certificate` | Set custom device certificate |
| `scaleway_iot_get_device_metrics` | Get device metrics |
| `scaleway_iot_list_routes` | List routes |
| `scaleway_iot_get_route` | Get route details |
| `scaleway_iot_create_route` | Create a route (S3, database, or REST) |
| `scaleway_iot_update_route` | Update a route |
| `scaleway_iot_delete_route` | Delete a route |
| `scaleway_iot_list_networks` | List networks |
| `scaleway_iot_get_network` | Get network details |
| `scaleway_iot_create_network` | Create a network |
| `scaleway_iot_delete_network` | Delete a network |

</details>

<details>
<summary><strong>Container Registry</strong> (12 tools) - Docker image registry</summary>

| Tool | Description |
|------|-------------|
| `scaleway_registry_list_namespaces` | List registry namespaces |
| `scaleway_registry_get_namespace` | Get namespace details |
| `scaleway_registry_create_namespace` | Create a new namespace |
| `scaleway_registry_update_namespace` | Update a namespace |
| `scaleway_registry_delete_namespace` | Delete a namespace |
| `scaleway_registry_list_images` | List container images |
| `scaleway_registry_get_image` | Get image details |
| `scaleway_registry_update_image` | Update image visibility |
| `scaleway_registry_delete_image` | Delete an image |
| `scaleway_registry_list_tags` | List image tags |
| `scaleway_registry_get_tag` | Get tag details |
| `scaleway_registry_delete_tag` | Delete a tag |

</details>

<details>
<summary><strong>Marketplace</strong> (8 tools) - Pre-built images catalog</summary>

| Tool | Description |
|------|-------------|
| `scaleway_marketplace_list_images` | List marketplace images |
| `scaleway_marketplace_get_image` | Get image details |
| `scaleway_marketplace_list_local_images` | List local images by zone |
| `scaleway_marketplace_get_local_image` | Get local image details |
| `scaleway_marketplace_list_categories` | List categories |
| `scaleway_marketplace_get_category` | Get category details |
| `scaleway_marketplace_list_versions` | List image versions |
| `scaleway_marketplace_get_version` | Get version details |

</details>

### Account & Billing

<details>
<summary><strong>Account</strong> (5 tools) - Project management</summary>

| Tool | Description |
|------|-------------|
| `scaleway_account_list_projects` | List projects in an organization |
| `scaleway_account_get_project` | Get project details |
| `scaleway_account_create_project` | Create a new project |
| `scaleway_account_update_project` | Update a project |
| `scaleway_account_delete_project` | Delete a project (must be empty) |

</details>

<details>
<summary><strong>Billing</strong> (6 tools) - Invoices, consumption, and FinOps</summary>

| Tool | Description |
|------|-------------|
| `scaleway_billing_list_consumptions` | List consumption data |
| `scaleway_billing_list_charges` | List FinOps charges with per-resource, fine-grained time granularity |
| `scaleway_billing_list_invoices` | List invoices |
| `scaleway_billing_get_invoice` | Get invoice details |
| `scaleway_billing_download_invoice` | Download invoice as PDF |
| `scaleway_billing_list_discounts` | List active discounts |

</details>

<details>
<summary><strong>Web Hosting</strong> (9 tools) - Managed web hosting</summary>

| Tool | Description |
|------|-------------|
| `scaleway_webhosting_list_hostings` | List web hostings |
| `scaleway_webhosting_get_hosting` | Get hosting details |
| `scaleway_webhosting_create_hosting` | Create a new hosting |
| `scaleway_webhosting_update_hosting` | Update a hosting |
| `scaleway_webhosting_delete_hosting` | Delete a hosting |
| `scaleway_webhosting_restore_hosting` | Restore a deleted hosting |
| `scaleway_webhosting_get_dns_records` | Get DNS records |
| `scaleway_webhosting_list_offers` | List available offers |
| `scaleway_webhosting_list_control_panels` | List available control panels |

</details>

<details>
<summary><strong>Product Catalog</strong> (2 tools) - Public product & pricing catalog</summary>

| Tool | Description |
|------|-------------|
| `scaleway_product_catalog_list_products` | List products (SKUs) with pricing, hardware, locality, and impact (no auth required) |
| `scaleway_product_catalog_list_categories` | List distinct product categories with per-category product counts |

</details>

<details>
<summary><strong>Environmental Footprint</strong> (3 tools) - Carbon & water impact reporting</summary>

| Tool | Description |
|------|-------------|
| `scaleway_environmental_footprint_get_impact_data` | Retrieve estimated carbon (kgCO₂e) and water (m³) impact data for a date range |
| `scaleway_environmental_footprint_get_report_availability` | List months/years with available impact reports |
| `scaleway_environmental_footprint_download_impact_report` | Download a monthly or yearly environmental impact PDF report |

</details>

## Managing Tool Access

With 724 tools available, you may want to limit which tools are exposed to your AI assistant for focused sessions.

### Claude Code

Use the `allowedTools` field in your `.mcp.json` to filter tools by pattern:

```json
{
  "mcpServers": {
    "scaleway": {
      "command": "npx",
      "args": ["mcp-scaleway"],
      "env": {
        "SCW_ACCESS_KEY": "...",
        "SCW_SECRET_KEY": "...",
        "SCW_DEFAULT_PROJECT_ID": "..."
      },
      "allowedTools": ["scaleway_k8s_*", "scaleway_instances_*"]
    }
  }
}
```

### Common Filter Patterns

| Use Case | Pattern |
|----------|---------|
| Kubernetes only | `scaleway_k8s_*` |
| Compute only | `scaleway_instances_*`, `scaleway_elastic_metal_*`, `scaleway_apple_silicon_*`, `scaleway_dedibox_*`, `scaleway_autoscaling_*` |
| Databases only | `scaleway_rdb_*`, `scaleway_mongodb_*`, `scaleway_redis_*`, `scaleway_data_warehouse_*`, `scaleway_opensearch_*` |
| Serverless only | `scaleway_functions_*`, `scaleway_containers_*`, `scaleway_jobs_*` |
| Networking only | `scaleway_vpc_*`, `scaleway_lb_*`, `scaleway_dns_*`, `scaleway_vpn_*`, `scaleway_interlink_*` |
| Messaging only | `scaleway_nats_*`, `scaleway_sqs_*`, `scaleway_sns_*`, `scaleway_kafka_*`, `scaleway_rabbitmq_*` |
| AI only | `scaleway_inference_*`, `scaleway_generative_apis_*`, `scaleway_data_lab_*` |
| Security only | `scaleway_iam_*`, `scaleway_secret_manager_*`, `scaleway_key_manager_*`, `scaleway_audit_trail_*` |
| Read-only | `scaleway_*_list_*`, `scaleway_*_get_*` |

## Development

### Prerequisites

- [Bun](https://bun.sh) 1.x
- Node.js 20.20.2+ (for some dev tooling)

### Commands

```bash
# Start the MCP server
bun run start

# Lint (Biome)
bun run lint
bun run lint:fix

# Type check
bun x tsc --noEmit

# Run unit + contract tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run unit tests only (CI-safe, no external deps)
bun x vitest run --config tests/vitest.config.ts --dir tests/unit

# Run contract tests only
bun x vitest run --config tests/vitest.config.ts --dir tests/contract

# Run tests with coverage (100% enforced)
bun run test -- --coverage.enabled

# Validate API parity matrix
bun run test:parity
```

### Testing Requirements

- **100% code coverage** (line and branch) - enforced in CI
- **Full API contract parity** - every Scaleway API endpoint must have a contract test
- **Parity matrix** - `tests/parity-matrix.json` maps all API operations to tests

### CI/CD Pipeline

| Gate | Requirement |
|------|-------------|
| Lint | Zero Biome violations |
| Type Check | Zero TypeScript errors |
| Tests | All unit + contract tests pass |
| Coverage | 100% line and branch coverage |
| API Parity | All operations in parity-matrix.json have tests |

## Architecture

```
src/
├── main.ts                      # Entry point
├── server.ts                    # MCP server creation and tool registration
├── shared/
│   ├── auth.ts                 # Env var credential loading
│   ├── client.ts               # Scaleway SDK client (singleton)
│   ├── errors.ts               # HTTP error mapping
│   ├── pagination.ts           # Pagination helpers
│   ├── s3-signer.ts            # AWS SigV4 signing for Object Storage (S3) requests
│   └── types.ts                # Shared Zod schemas
└── tools/
    ├── index.ts                # registerAllTools() wires up all 50 service tool groups
    └── {service}/              # One directory per Scaleway service
        ├── index.ts            # Tool registration (server.tool() calls)
        ├── types.ts            # Zod input schemas
        └── handlers.ts         # Scaleway API call logic

tests/
├── unit/                       # Unit tests (CI)
├── contract/                   # API contract tests (CI)
├── api/                        # Integration tests (local only, needs Scaleway)
├── parity-matrix.json          # API operation → test mapping
└── vitest.config.ts            # Test config (100% coverage enforced)
```

Each tool follows the same three-file pattern:

1. **`index.ts`** - Registers tools with the MCP server, validates inputs with Zod, calls handlers
2. **`types.ts`** - Defines Zod schemas for all tool parameters
3. **`handlers.ts`** - Makes Scaleway API calls and formats responses

## Troubleshooting

### Authentication Errors

**"SCW_ACCESS_KEY environment variable is required"**

Ensure all three required environment variables are set:

```bash
export SCW_ACCESS_KEY="SCWxxxxxxxxxxxxxxxxx"
export SCW_SECRET_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export SCW_DEFAULT_PROJECT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

If using Claude Desktop or Claude Code, check that the `env` block in your configuration file includes all three variables.

### Connection Issues

**Server starts but no tools appear**

- Verify the server is running: `npx mcp-scaleway` should start without errors
- Check that your MCP client config is correct
- Ensure `node` (18+) is in your PATH

**"Permission denied" errors from Scaleway API**

- Your API key may not have permissions for the requested service
- Check your IAM policies in the [Scaleway console](https://console.scaleway.com/iam)
- Some operations require Organization-level permissions (set `SCW_DEFAULT_ORGANIZATION_ID`)

### Region/Zone Errors

**"Resource not found" when the resource exists**

- Check that you're querying the correct region or zone
- Default region is `fr-par`, default zone is `fr-par-1`
- Override defaults with `SCW_DEFAULT_REGION` and `SCW_DEFAULT_ZONE`
- Some services are only available in specific regions

### Common Issues

| Issue | Solution |
|-------|----------|
| `bun: command not found` | Install Bun: `curl -fsSL https://bun.sh/install \| bash` |
| `Cannot find module` | Run `bun install` in the project directory |
| Rate limiting errors | Scaleway has per-service rate limits; add delays between bulk operations |
| Timeout errors | Some operations (server creation, cluster provisioning) take time; check status with get/list tools |

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run lint and tests (`bun run lint && bun run test`)
5. Commit your changes (`git commit -m 'Add my feature'`)
6. Push to your branch (`git push origin feature/my-feature`)
7. Open a Pull Request

## Support

If you find this project useful, consider sponsoring its development:

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?logo=github-sponsors)](https://github.com/sponsors/valentinyanakiev)

Your support helps maintain and improve the MCP Scaleway server.

## License

[MIT](LICENSE)
