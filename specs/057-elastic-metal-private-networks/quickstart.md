# Quickstart: Elastic Metal Private Networks tools

Prerequisites: Scaleway credentials configured (see `.env.test.local.example`), an existing
Elastic Metal server ID, and an existing VPC Private Network ID in the same zone/VPC.

## List a server's Private Network attachments

```json
{
  "tool": "scaleway_elastic_metal_list_server_private_networks",
  "arguments": { "zone": "fr-par-1", "server_id": "<server-uuid>" }
}
```

## Attach a server to a Private Network

```json
{
  "tool": "scaleway_elastic_metal_add_server_private_network",
  "arguments": {
    "zone": "fr-par-1",
    "server_id": "<server-uuid>",
    "private_network_id": "<pn-uuid>"
  }
}
```

## Replace the full set of attachments (declarative)

```json
{
  "tool": "scaleway_elastic_metal_set_server_private_networks",
  "arguments": {
    "zone": "fr-par-1",
    "server_id": "<server-uuid>",
    "private_network_ids": ["<pn-uuid-1>", "<pn-uuid-2>"]
  }
}
```

Pass `"private_network_ids": []` to detach the server from all Private Networks.

## Detach a server from a Private Network

```json
{
  "tool": "scaleway_elastic_metal_delete_server_private_network",
  "arguments": {
    "zone": "fr-par-1",
    "server_id": "<server-uuid>",
    "private_network_id": "<pn-uuid>"
  }
}
```

## Notes

- A server can be attached to at most 8 Private Networks.
- The `vlan` in the response is the VLAN ID to configure on the server-side interface.
- `status` progresses `attaching` → `attached`; poll the list tool to observe changes.
