# Quickstart: Apple silicon Private Networks

Prerequisites: a running Apple silicon server (`scaleway_apple_silicon_create_server` with
`enable_vpc: true`) and an existing VPC Private Network (`scaleway_vpc_create_private_network`).

## Attach a server to a Private Network

```jsonc
// scaleway_apple_silicon_add_server_private_network
{
  "zone": "fr-par-3",
  "server_id": "11111111-1111-1111-1111-111111111111",
  "private_network_id": "22222222-2222-2222-2222-222222222222",
  "ipam_ip_ids": []   // omit or empty → next available IP auto-assigned
}
```

## List a server's Private Network attachments

```jsonc
// scaleway_apple_silicon_list_server_private_networks
{
  "server_id": "11111111-1111-1111-1111-111111111111",
  "order_by": "created_at_desc",
  "page": 1,
  "pageSize": 50
}
```

## Get one attachment

```jsonc
// scaleway_apple_silicon_get_server_private_network
{
  "server_id": "11111111-1111-1111-1111-111111111111",
  "private_network_id": "22222222-2222-2222-2222-222222222222"
}
```

## Reconcile the full set of Private Networks

```jsonc
// scaleway_apple_silicon_set_server_private_networks
{
  "server_id": "11111111-1111-1111-1111-111111111111",
  "per_private_network_ipam_ip_ids": {
    "22222222-2222-2222-2222-222222222222": [],
    "33333333-3333-3333-3333-333333333333": ["44444444-4444-4444-4444-444444444444"]
  }
}
```

## Detach

```jsonc
// scaleway_apple_silicon_delete_server_private_network
{
  "server_id": "11111111-1111-1111-1111-111111111111",
  "private_network_id": "22222222-2222-2222-2222-222222222222"
}
```

## Run the tests

```bash
bun x vitest run --config tests/vitest.config.ts \
  tests/unit/tools/apple-silicon/handlers.test.ts \
  tests/unit/tools/apple-silicon.test.ts \
  tests/contract/tools/apple-silicon/contract.test.ts
```
