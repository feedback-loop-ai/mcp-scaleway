# Quickstart: Data Lab for Apache Spark tools

Prerequisites: valid Scaleway credentials (`SCW_ACCESS_KEY`, `SCW_SECRET_KEY`,
default project/region) loaded by the MCP server. Data Lab is available in
`fr-par` and `it-mil`.

## 1. Discover what's available

```jsonc
// scaleway_data_lab_list_cluster_versions
{ "region": "fr-par" }

// scaleway_data_lab_list_node_types
{ "region": "fr-par", "orderBy": "vcpus_asc" }

// scaleway_data_lab_list_notebook_versions
{ "region": "fr-par" }
```

## 2. Create a cluster

```jsonc
// scaleway_data_lab_create_cluster
{
  "region": "fr-par",
  "name": "analytics-lab",
  "sparkVersion": "3.5.2",
  "worker": { "nodeType": "DL2S", "nodeCount": 3 },
  "main": { "nodeType": "DL2S" },
  "hasNotebook": true,
  "totalStorage": { "type": "sbs", "size": 107374182400 },
  "tags": ["prod"]
}
```

The response is a Datalab with `status: "creating"`.

## 3. Inspect and scale

```jsonc
// scaleway_data_lab_list_clusters
{ "region": "fr-par", "name": "analytics-lab" }

// scaleway_data_lab_get_cluster
{ "region": "fr-par", "datalabId": "<uuid>" }

// scaleway_data_lab_update_cluster  (scale worker pool to 5)
{ "region": "fr-par", "datalabId": "<uuid>", "nodeCount": 5 }
```

## 4. Tear down

```jsonc
// scaleway_data_lab_delete_cluster
{ "region": "fr-par", "datalabId": "<uuid>" }
```

Response transitions to `status: "deleting"`.
