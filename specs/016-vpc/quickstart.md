# Quickstart: Scaleway VPC & Private Networks MCP Tools

**Feature**: 016-vpc | **Date**: 2026-03-11

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

### List VPCs

```json
{
  "tool": "scaleway_vpc_list_vpcs",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a VPC

```json
{
  "tool": "scaleway_vpc_create_vpc",
  "arguments": {
    "region": "fr-par",
    "name": "my-vpc",
    "project": "your-project-uuid",
    "tags": ["environment:production"]
  }
}
```

### Get VPC Details

```json
{
  "tool": "scaleway_vpc_get_vpc",
  "arguments": {
    "region": "fr-par",
    "vpc_id": "vpc-uuid"
  }
}
```

### Update a VPC

```json
{
  "tool": "scaleway_vpc_update_vpc",
  "arguments": {
    "region": "fr-par",
    "vpc_id": "vpc-uuid",
    "name": "renamed-vpc",
    "tags": ["environment:staging"]
  }
}
```

### Delete a VPC

```json
{
  "tool": "scaleway_vpc_delete_vpc",
  "arguments": {
    "region": "fr-par",
    "vpc_id": "vpc-uuid"
  }
}
```

### List Private Networks

```json
{
  "tool": "scaleway_vpc_list_private_networks",
  "arguments": {
    "region": "fr-par",
    "vpc_id": "vpc-uuid",
    "page": 1,
    "pageSize": 20
  }
}
```

### Create a Private Network with Subnets

```json
{
  "tool": "scaleway_vpc_create_private_network",
  "arguments": {
    "region": "fr-par",
    "name": "backend-network",
    "project_id": "your-project-uuid",
    "vpc_id": "vpc-uuid",
    "tags": ["tier:backend"],
    "subnets": ["192.168.1.0/24"]
  }
}
```

### Get Private Network Details

```json
{
  "tool": "scaleway_vpc_get_private_network",
  "arguments": {
    "region": "fr-par",
    "private_network_id": "pn-uuid"
  }
}
```

### Update a Private Network

```json
{
  "tool": "scaleway_vpc_update_private_network",
  "arguments": {
    "region": "fr-par",
    "private_network_id": "pn-uuid",
    "name": "updated-backend-network",
    "subnets": ["10.0.0.0/16"]
  }
}
```

### Delete a Private Network

```json
{
  "tool": "scaleway_vpc_delete_private_network",
  "arguments": {
    "region": "fr-par",
    "private_network_id": "pn-uuid"
  }
}
```
