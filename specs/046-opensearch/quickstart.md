# Quickstart: 046-opensearch tools

Prerequisites: Scaleway credentials configured (access key, secret key, default
project). Region `fr-par`.

## Discover the catalog

```
scaleway_opensearch_list_node_types { "region": "fr-par" }
scaleway_opensearch_list_versions   { "region": "fr-par" }
```

## Create a deployment

```
scaleway_opensearch_create_deployment {
  "region": "fr-par",
  "name": "my-search",
  "nodeType": "SEARCHDB-SHARED-2C-8G",
  "version": "2.0",
  "nodeCount": 1,
  "userName": "admin",
  "password": "S3cret!",
  "volume": { "type": "sbs_5k", "sizeBytes": 5000000000 },
  "endpoints": [ { "public": true } ]
}
```
Returns a Deployment with status `creating`. Poll with:
```
scaleway_opensearch_get_deployment { "region": "fr-par", "deploymentId": "<id>" }
```

## Manage users

```
scaleway_opensearch_list_users   { "region": "fr-par", "deploymentId": "<id>" }
scaleway_opensearch_create_user  { "region": "fr-par", "deploymentId": "<id>", "username": "app", "password": "pw" }
scaleway_opensearch_update_user  { "region": "fr-par", "deploymentId": "<id>", "username": "app", "password": "newpw" }
scaleway_opensearch_delete_user  { "region": "fr-par", "deploymentId": "<id>", "username": "app" }
```

## Manage endpoints

```
scaleway_opensearch_create_endpoint { "region": "fr-par", "deploymentId": "<id>", "public": true }
scaleway_opensearch_create_endpoint { "region": "fr-par", "deploymentId": "<id>", "privateNetworkId": "<pn-id>" }
scaleway_opensearch_delete_endpoint { "region": "fr-par", "endpointId": "<endpoint-id>" }
```

## Scale / upgrade (exactly one of nodeCount or volumeSizeBytes)

```
scaleway_opensearch_upgrade_deployment { "region": "fr-par", "deploymentId": "<id>", "nodeCount": 3 }
scaleway_opensearch_upgrade_deployment { "region": "fr-par", "deploymentId": "<id>", "volumeSizeBytes": 10000000000 }
```

## Connect securely

```
scaleway_opensearch_get_certificate_authority { "region": "fr-par", "deploymentId": "<id>" }
```
Use the returned CA plus the deployment endpoint URL (from the Deployment's
`endpoints[].services[].url`) and user credentials to reach the OpenSearch REST API.

## Rename / delete

```
scaleway_opensearch_update_deployment { "region": "fr-par", "deploymentId": "<id>", "name": "renamed", "tags": ["prod"] }
scaleway_opensearch_delete_deployment { "region": "fr-par", "deploymentId": "<id>" }
```
