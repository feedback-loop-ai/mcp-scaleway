# 014-redis: Managed Database for Redis - User Stories

## P1 - Cluster CRUD
- US-014-01: As a user, I can list Redis clusters in a region with pagination
- US-014-02: As a user, I can get details of a specific Redis cluster
- US-014-03: As a user, I can create a new Redis cluster
- US-014-04: As a user, I can update an existing Redis cluster (name, tags, settings)
- US-014-05: As a user, I can delete a Redis cluster

## P2 - Cluster Management
- US-014-06: As a user, I can list metrics for a Redis cluster
- US-014-07: As a user, I can get the TLS certificate for a Redis cluster
- US-014-08: As a user, I can renew the TLS certificate for a Redis cluster
- US-014-09: As a user, I can add ACL rules to a Redis cluster
- US-014-10: As a user, I can delete ACL rules from a Redis cluster
- US-014-11: As a user, I can set (replace all) ACL rules on a Redis cluster
- US-014-12: As a user, I can add endpoints to a Redis cluster
- US-014-13: As a user, I can delete endpoints from a Redis cluster
- US-014-14: As a user, I can set (replace all) endpoints on a Redis cluster

## P3 - Discovery
- US-014-15: As a user, I can list available Redis node types
- US-014-16: As a user, I can list available Redis cluster versions

## Tools (16 total)
1. scaleway_redis_list_clusters
2. scaleway_redis_get_cluster
3. scaleway_redis_create_cluster
4. scaleway_redis_update_cluster
5. scaleway_redis_delete_cluster
6. scaleway_redis_list_cluster_metrics
7. scaleway_redis_get_cluster_certificate
8. scaleway_redis_renew_cluster_certificate
9. scaleway_redis_add_acl_rules
10. scaleway_redis_delete_acl_rules
11. scaleway_redis_set_acl_rules
12. scaleway_redis_add_endpoints
13. scaleway_redis_delete_endpoints
14. scaleway_redis_set_endpoints
15. scaleway_redis_list_node_types
16. scaleway_redis_list_cluster_versions

## Locality
- Regional API (fr-par, nl-ams, pl-waw)
