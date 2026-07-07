# Data Model: 055-dedibox

All shapes mirror the Dedibox v1 API (see
`specs/scaleway-api/dedibox/api-reference.md`). IDs for servers, offers, and OS
are numeric (uint64). Zone and project IDs are strings/UUIDs.

## ServerSummary (list item)
`id` (number), `datacenter_name`, `organization_id`, `project_id`, `hostname`,
`created_at`, `updated_at`, `expired_at`, `offer_id` (number), `offer_name`,
`status` (ServerStatus), `os_id` (number|null), `interfaces[]`, `zone`, `level`,
`is_outsourced` (bool), `qinq` (bool), `rpn_version` (number|null), `is_hds`
(bool).

## Server (detail)
`id`, `organization_id`, `project_id`, `hostname`, `rebooted_at`, `created_at`,
`updated_at`, `expired_at`, `offer` (Offer), `status` (ServerStatus), `location`
(ServerLocation), `os` (OS), `zone`, `has_bmc` (bool), `tags[]`, `is_outsourced`
(bool), plus additional passthrough fields (`options[]`, `level`, `rescue_os`,
`ipv6_slaac`, `qinq`, `is_rpnv2_member`, `is_hds`, `interfaces[]`).

### ServerLocation
`rack`, `room`, `datacenter_name`.

## Offer
`id`, `name`, `catalog` (OfferCatalog), `payment_frequency`
(OfferPaymentFrequency), `pricing` (Money), plus exactly one `*_info` block
(passthrough: `server_info`, `service_level_info`, `rpn_info`, `san_info`,
`antidos_info`, `backup_info`, `usb_storage_info`, `storage_info`,
`license_info`, `failover_ip_info`, `failover_block_info`, `bandwidth_info`).

### Money
`currency_code`, `units` (number), `nanos` (number).

## OS
`id`, `name`, `type` (OSType), `version`, `arch` (OSArch),
`allow_custom_partitioning`, `allow_ssh_keys`, `requires_user`,
`requires_admin_password`, `requires_panel_password`, `allowed_filesystems[]`
(PartitionFileSystem), `requires_license`, `max_partitions` (number|null),
`display_name`, plus passthrough (`license_offers[]`, `password_regex`,
`hostname_regex`, `released_at`, ...).

## ServerInstall
`os_id`, `hostname`, `user_login`, `partitions[]` (Partition), `ssh_key_ids[]`,
`status` (ServerInstallStatus), `panel_url`.

### Partition / InstallPartition (input)
`file_system` (PartitionFileSystem), `mount_point`, `raid_level`
(RaidArrayRaidLevel), `capacity` (bytes), `connectors[]`.

## BMCAccess
`url`, `login`, `password`, `expires_at`, `status` (BMCAccessStatus).

## Enums
- **ServerStatus**: unknown, delivering, error, installing, locked, ready,
  rescue, stopped, busy
- **ServerInstallStatus**: unknown, booting, configuring, configuring_bootloader,
  formatting, installed, installing, partitioning, rebooting, setting_up_raid
- **BMCAccessStatus**: unknown, created, creating, deleting
- **OSType**: unknown_type, custom, desktop, panel, rescue, server, virtu
- **OSArch**: unknown_arch, x86, amd64, arm, arm64
- **OfferCatalog**: all, default, beta, premium, admin, inactive, reseller, volume
- **OfferPaymentFrequency**: monthly, oneshot
- **PartitionFileSystem**: unknown, efi, ext2, ext3, ext4, fat32, ntfs, swap, ufs, xfs
- **RaidArrayRaidLevel**: no_raid, raid0, raid1, raid5, raid6, raid10
