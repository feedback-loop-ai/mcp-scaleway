# Quickstart: File Storage Tools

Prerequisites: valid Scaleway credentials configured for the MCP server (access key,
secret key, default project). File Storage is Beta and region-scoped.

## List file systems

```
scaleway_file_storage_list_filesystems { "region": "fr-par" }
```

Optional filters: `projectId`, `organizationId`, `name`, `tags`, `orderBy`
(`created_at_asc|created_at_desc|name_asc|name_desc`), `page`, `pageSize`.

## Get a file system

```
scaleway_file_storage_get_filesystem { "region": "fr-par", "filesystemId": "<uuid>" }
```

## Create a file system (size in bytes)

```
scaleway_file_storage_create_filesystem {
  "region": "fr-par",
  "name": "my-fs",
  "size": 100000000000,
  "tags": ["prod"]
}
```

## Resize / rename a file system

```
scaleway_file_storage_update_filesystem {
  "region": "fr-par",
  "filesystemId": "<uuid>",
  "size": 200000000000
}
```

## Delete a (detached) file system

```
scaleway_file_storage_delete_filesystem { "region": "fr-par", "filesystemId": "<uuid>" }
```

## List attachments

```
scaleway_file_storage_list_attachments { "region": "fr-par", "filesystemId": "<uuid>" }
```

Optional filters: `resourceId`, `resourceType` (`instance_server`), `zone`, `page`, `pageSize`.

> Attaching/detaching a file system to an Instance is done via the Instances tools
> (Instance API), not here.
