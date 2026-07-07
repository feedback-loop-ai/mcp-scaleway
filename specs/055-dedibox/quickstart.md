# Quickstart: Dedibox tools

Prerequisites: a Scaleway API key (`SCW_ACCESS_KEY` / `SCW_SECRET_KEY`) on an
account with Dedibox servers, configured as in the repo's auth setup.

## Typical flow

1. **Find your servers**

   `scaleway_dedibox_list_servers` with `{ "zone": "fr-par-1" }` →
   paginated server summaries (numeric `id`, `status`, `offer_name`).

2. **Inspect one**

   `scaleway_dedibox_get_server` with `{ "zone": "fr-par-1", "serverId": 42 }`.

3. **Pick an OS**

   `scaleway_dedibox_list_os` with
   `{ "zone": "fr-par-1", "serverId": 42, "type": "server" }` to see OS
   compatible with that server.

4. **Install it**

   `scaleway_dedibox_install_server` with
   `{ "zone": "fr-par-1", "serverId": 42, "osId": 3, "hostname": "web-1",
      "sshKeyIds": ["<uuid>"] }`.

5. **Track progress**

   Poll `scaleway_dedibox_get_server_install`
   (`{ "zone": "fr-par-1", "serverId": 42 }`) until `status` is `installed`.
   Cancel with `scaleway_dedibox_cancel_server_install` if needed.

6. **Power control**

   `scaleway_dedibox_reboot_server` / `..._start_server` / `..._stop_server`
   with `{ "zone": "fr-par-1", "serverId": 42 }`.

7. **Console (BMC)**

   `scaleway_dedibox_start_bmc_access` with
   `{ "zone": "fr-par-1", "serverId": 42, "ip": "203.0.113.10" }`, then
   `scaleway_dedibox_get_bmc_access` for the URL + credentials, and
   `scaleway_dedibox_stop_bmc_access` when done.

## Browse the catalog

- `scaleway_dedibox_list_offers` / `scaleway_dedibox_get_offer` — commercial
  offers, filterable by `catalog` and `availableOnly`.
