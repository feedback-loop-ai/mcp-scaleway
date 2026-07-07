# Tool Contracts: Clusters for Apache Kafka®

**Feature**: 047-kafka | API: `kafka/v1alpha1` (regional, Public Beta)
**Reference**: specs/scaleway-api/kafka/api-reference.md

All tools require `region` (format `xx-xxx`) and authenticate via `X-Auth-Token`. List tools accept
`page` (default 1) and `pageSize` (default 50, max 100) and return `{ items, totalCount, page, pageSize }`.

## Tool summary

| Tool | HTTP | Priority |
|------|------|----------|
| scaleway_kafka_list_clusters | GET /kafka/v1alpha1/regions/{region}/clusters | P1 |
| scaleway_kafka_get_cluster | GET /kafka/v1alpha1/regions/{region}/clusters/{cluster_id} | P1 |
| scaleway_kafka_create_cluster | POST /kafka/v1alpha1/regions/{region}/clusters | P1 |
| scaleway_kafka_update_cluster | PATCH /kafka/v1alpha1/regions/{region}/clusters/{cluster_id} | P1 |
| scaleway_kafka_delete_cluster | DELETE /kafka/v1alpha1/regions/{region}/clusters/{cluster_id} | P1 |
| scaleway_kafka_get_cluster_certificate_authority | GET /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}/certificate-authority | P1 |
| scaleway_kafka_renew_cluster_certificate_authority | POST /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}/renew-certificate-authority | P1 |
| scaleway_kafka_create_endpoint | POST /kafka/v1alpha1/regions/{region}/endpoints | P1 |
| scaleway_kafka_delete_endpoint | DELETE /kafka/v1alpha1/regions/{region}/endpoints/{endpoint_id} | P1 |
| scaleway_kafka_list_users | GET /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}/users | P2 |
| scaleway_kafka_update_user | PATCH /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}/users/{username} | P2 |
| scaleway_kafka_list_node_types | GET /kafka/v1alpha1/regions/{region}/node-types | P3 |
| scaleway_kafka_list_versions | GET /kafka/v1alpha1/regions/{region}/versions | P3 |

## Inputs

### scaleway_kafka_list_clusters
`region`, `page?`, `pageSize?`, `projectId?`, `organizationId?`, `name?`, `tags?`, `orderBy?`
(`created_at_asc|created_at_desc|name_asc|name_desc|status_asc|status_desc`)

### scaleway_kafka_get_cluster
`region`, `clusterId`

### scaleway_kafka_create_cluster
`region`, `name`, `version`, `nodeType`, `nodeAmount`, `volumeSizeBytes`, `volumeType`
(`unknown_type|sbs_5k|sbs_15k`), `projectId?`, `tags?`, `userName?`, `password?`,
`endpoints?` (array of `{ privateNetworkId? | publicNetwork? }`)

### scaleway_kafka_update_cluster
`region`, `clusterId`, `name?`, `tags?`

### scaleway_kafka_delete_cluster
`region`, `clusterId`

### scaleway_kafka_get_cluster_certificate_authority / scaleway_kafka_renew_cluster_certificate_authority
`region`, `clusterId`

### scaleway_kafka_create_endpoint
`region`, `clusterId`, `privateNetworkId?`, `publicNetwork?`

### scaleway_kafka_delete_endpoint
`region`, `endpointId`

### scaleway_kafka_list_users
`region`, `clusterId`, `page?`, `pageSize?`, `name?`, `orderBy?` (`name_asc|name_desc`)

### scaleway_kafka_update_user
`region`, `clusterId`, `username`, `password?`

### scaleway_kafka_list_node_types
`region`, `page?`, `pageSize?`, `includeDisabledTypes?`

### scaleway_kafka_list_versions
`region`, `page?`, `pageSize?`, `version?`

## Errors

Structured error responses: `not_found` (404), `permission_denied` (401/403), `invalid_input` (400),
`rate_limited` (429), `server_error` (5xx / unknown).
