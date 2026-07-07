# Quickstart: Clusters for Apache Kafka® MCP Tools

**Feature**: 047-kafka | API: `kafka/v1alpha1` (regional, Public Beta)

This vertical exposes 13 MCP tools (prefix `scaleway_kafka_`) for managing Scaleway Clusters for Apache
Kafka®. All tools take a `region` (currently `fr-par`) and authenticate with your Scaleway secret key via
the `X-Auth-Token` header (handled by the shared client).

## Discover the catalog

```jsonc
// scaleway_kafka_list_versions
{ "region": "fr-par" }

// scaleway_kafka_list_node_types
{ "region": "fr-par", "includeDisabledTypes": false }
```

## Create a cluster

```jsonc
// scaleway_kafka_create_cluster
{
  "region": "fr-par",
  "name": "my-kafka",
  "version": "3.7.0",
  "nodeType": "kafka-mnq-beta",
  "nodeAmount": 3,
  "volumeSizeBytes": 100000000000,
  "volumeType": "sbs_5k",
  "userName": "admin",
  "password": "change-me",
  "endpoints": [{ "privateNetworkId": "<private-network-uuid>" }]
}
```

The cluster is returned with status `creating`. Poll with `scaleway_kafka_get_cluster` until `ready`.

## Connect

```jsonc
// Fetch the CA to trust the TLS chain
// scaleway_kafka_get_cluster_certificate_authority
{ "region": "fr-par", "clusterId": "<cluster-uuid>" }

// Add another endpoint on a Private Network
// scaleway_kafka_create_endpoint
{ "region": "fr-par", "clusterId": "<cluster-uuid>", "privateNetworkId": "<private-network-uuid>" }
```

During Public Beta, access is via private endpoints only — attach the cluster to a Private Network.

## Manage users

```jsonc
// scaleway_kafka_list_users
{ "region": "fr-par", "clusterId": "<cluster-uuid>" }

// scaleway_kafka_update_user  (rotate password)
{ "region": "fr-par", "clusterId": "<cluster-uuid>", "username": "admin", "password": "new-secret" }
```

## Lifecycle

```jsonc
// scaleway_kafka_update_cluster  (rename / retag)
{ "region": "fr-par", "clusterId": "<cluster-uuid>", "name": "renamed", "tags": ["prod"] }

// scaleway_kafka_delete_cluster
{ "region": "fr-par", "clusterId": "<cluster-uuid>" }
```

## Notes

- `volumeType` is one of `sbs_5k`, `sbs_15k`.
- `orderBy` for `list_clusters`: `created_at_asc|created_at_desc|name_asc|name_desc|status_asc|status_desc`.
- Pagination: `page` (default 1), `pageSize` (default 50, max 100); responses use
  `{ items, totalCount, page, pageSize }`.
