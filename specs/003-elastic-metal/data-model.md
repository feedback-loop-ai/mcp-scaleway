# Data Model: Scaleway Elastic Metal MCP Tools

**Branch**: `003-elastic-metal` | **Date**: 2026-03-11

## Entities

### Server
```typescript
{
  id: string              // UUID
  name: string
  description: string
  status: ServerStatus    // enum
  offer_id: string
  offer_name: string
  tags: string[]
  ips: ServerIp[]
  domain: string
  boot_type: BootType     // enum: local, rescue, network
  zone: string
  project_id: string
  install?: ServerInstall
  ping_status: PingStatus // enum: unknown, up, down
  organization_id: string
  created_at: string      // ISO 8601
  updated_at: string      // ISO 8601
}
```

### ServerStatus (enum)
`unknown`, `delivering`, `ready`, `stopping`, `stopped`, `starting`, `error`, `deleting`, `deleted`, `locked`, `out_of_stock`, `ordered`, `resetting`

### ServerIp
```typescript
{
  id: string
  address: string
  reverse: string
  version: string  // "IPv4" | "IPv6"
}
```

### ServerInstall
```typescript
{
  os_id: string
  hostname: string
  ssh_key_ids: string[]
  status: InstallStatus  // unknown, to_install, installing, completed, error
}
```

### Offer
```typescript
{
  id: string
  name: string
  stock: OfferStock       // enum: empty, low, available
  bandwidth: number       // bits/s
  max_bandwidth: number
  commercial_range: string
  price_per_hour?: { currency_code: string, units: number, nanos: number }
  price_per_month?: { currency_code: string, units: number, nanos: number }
  disks: OfferDisk[]
  cpus: OfferCpu[]
  memories: OfferMemory[]
  enabled: boolean
  subscription_period: string  // unknown, hourly, monthly
  operation_path: string
  fee?: { currency_code: string, units: number, nanos: number }
  options: OfferOption[]
}
```

### OS
```typescript
{
  id: string
  name: string
  version: string
  logo_url: string
  enabled: boolean
  license_required: boolean
}
```

### FlexibleIp (IP)
```typescript
{
  id: string
  address: string
  reverse: string
  server_id?: string
  zone: string
  project_id: string
  organization_id: string
  type: string           // "IPv4" | "IPv6"
  status: string
  tags: string[]
  mac_address?: string
  created_at: string
  updated_at: string
  description: string
}
```

### BMCAccess
```typescript
{
  url: string
  login: string
  password: string
  expires_at: string  // ISO 8601
}
```

## Relationships

- **Server** has many **ServerIp** (embedded)
- **Server** has one optional **ServerInstall** (embedded)
- **Server** references one **Offer** via `offer_id`
- **FlexibleIp** optionally references one **Server** via `server_id`
- **Offer** has many **OfferOption** (embedded)
- **OS** is referenced during server install via `os_id`
