# Data Model: Scaleway Edge Services MCP Tools

**Feature**: 022-edge-services | **Date**: 2026-03-11

## Entities

### Pipeline

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique pipeline identifier |
| name | string | yes | Pipeline name |
| description | string | yes | Pipeline description |
| status | enum | yes | unknown_status, ready, error, pending, warning, locked |
| errors | object[] | no | Pipeline error details |
| projectId | string (UUID) | yes | Project ID |
| organizationId | string (UUID) | yes | Organization ID |
| createdAt | string (ISO 8601) | yes | Creation timestamp |
| updatedAt | string (ISO 8601) | yes | Last update timestamp |
| dnsStageId | string (UUID)/null | no | Linked DNS stage ID |

### DNSStage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique DNS stage identifier |
| pipelineId | string (UUID) | yes | Parent pipeline ID |
| fqdns | string[] | no | Custom Fully Qualified Domain Names |
| type | enum | yes | unknown_type, auto, managed, custom |
| tlsStageId | string (UUID)/null | no | Next TLS stage in chain |
| cacheStageId | string (UUID)/null | no | Next cache stage in chain |
| backendStageId | string (UUID)/null | no | Next backend stage in chain |
| createdAt | string (ISO 8601) | yes | Creation timestamp |
| updatedAt | string (ISO 8601) | yes | Last update timestamp |

### TLSStage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique TLS stage identifier |
| pipelineId | string (UUID) | yes | Parent pipeline ID |
| secrets | TLSSecret[] | no | Custom TLS certificate secrets |
| managedCertificate | boolean | no | Whether using Scaleway-managed Let's Encrypt certificate |
| cacheStageId | string (UUID)/null | no | Next cache stage in chain |
| backendStageId | string (UUID)/null | no | Next backend stage in chain |
| routeStageId | string (UUID)/null | no | Next route stage in chain |
| wafStageId | string (UUID)/null | no | Next WAF stage in chain |
| createdAt | string (ISO 8601) | yes | Creation timestamp |
| updatedAt | string (ISO 8601) | yes | Last update timestamp |

### TLSSecret

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| secretId | string (UUID) | yes | ID of the Secret in Scaleway Secret Manager |
| region | string | yes | Region where the Secret is stored |

### CacheStage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique cache stage identifier |
| pipelineId | string (UUID) | yes | Parent pipeline ID |
| fallbackTtl | string | no | TTL in seconds for cached content when no cache headers present |
| includeCookies | boolean | no | Whether to cache responses that include cookies |
| backendStageId | string (UUID)/null | no | Next backend stage in chain |
| wafStageId | string (UUID)/null | no | Next WAF stage in chain |
| routeStageId | string (UUID)/null | no | Next route stage in chain |
| createdAt | string (ISO 8601) | yes | Creation timestamp |
| updatedAt | string (ISO 8601) | yes | Last update timestamp |

### BackendStage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique backend stage identifier |
| pipelineId | string (UUID) | yes | Parent pipeline ID |
| scalewayS3 | ScalewayS3Config/null | no | S3 bucket origin configuration |
| scalewayLb | ScalewayLbConfig/null | no | Load Balancer origin configuration |
| createdAt | string (ISO 8601) | yes | Creation timestamp |
| updatedAt | string (ISO 8601) | yes | Last update timestamp |

### ScalewayS3Config

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bucketName | string | no | S3 bucket name |
| bucketRegion | string | no | S3 bucket region |
| isWebsite | boolean | no | Whether bucket website feature is enabled |

### ScalewayLbConfig

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| lbs | ScalewayLb[] | yes | Load Balancer configuration entries |

### ScalewayLb

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Load Balancer ID |
| zone | string | yes | Load Balancer zone |
| frontendId | string (UUID) | yes | Frontend ID |
| isSsl | boolean | no | Whether frontend handles SSL |
| domainName | string | no | FQDN for HTTP requests to the LB |
| hasWebsocket | boolean | no | Whether to forward websocket requests |

### PurgeRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique purge request identifier |
| pipelineId | string (UUID) | yes | Pipeline that was purged |
| status | enum | yes | unknown_status, done, error, pending |
| assets | string[] | no | Specific asset URLs that were purged |
| all | boolean | no | Whether all content was purged |
| createdAt | string (ISO 8601) | yes | Creation timestamp |
| updatedAt | string (ISO 8601) | yes | Last update timestamp |
