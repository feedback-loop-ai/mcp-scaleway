# Request reconciliation after whole-catalog transport validation

Recorded before the following request changes, 2026-09-20. The independent request
schemas in `src/shared/response-contracts.json` revealed these real request mismatches;
`body-diagnostics.json` in the local remediation report records synthetic requests and
Ajv constraints. Expectations come from the referenced schema paths, not handlers.

| Operation group | Recorded source path | Correction contract |
| --- | --- | --- |
| Cockpit create data source | `/cockpit/v1/regions/{region}/data-sources` | Require explicit data source type. |
| DNS update zone | `/domain/v2beta1/dns-zones/{dns_zone}` | Always send nullable `new_dns_zone`; resolve project default. |
| Environmental impact download | `/environmental-footprint/v1alpha1/reports/download` | Resolve organization from input or configured organization; fail locally when absent. |
| File Storage create filesystem | `/file/v1alpha1/regions/{region}/filesystems` | Resolve required project from configured default. |
| Functions create function | `/functions/v1beta1/regions/{region}/functions` | Validate runtime against the recorded supported runtime enum. |
| IAM create group | `/iam/v1alpha1/groups` | Resolve organization from input/config or fail locally. |
| Inference create deployment/endpoint | `/inference/v1/regions/{region}/deployments`, `/endpoints` | Map legacy node type to `node_type_name`, supply project default, send required endpoint array/object using documented network nesting. Never invent license acceptance or public exposure. |
| InterLink routing policy, IoT hub | `/interlink/v1beta1/regions/{region}/routing-policies`, `/iot/v1/regions/{region}/hubs` | Resolve required project default. |
| Jobs create definition | `/serverless-jobs/v1alpha2/regions/{region}/job-definitions` | Expose required local storage capacity and resolve project default. |
| LB create/update backend | `/lb/v1/zones/{zone}/lbs/{lb_id}/backends`, `/lb/v1/zones/{zone}/backends/{backend_id}` | Preserve documented roundrobin/none defaults; creation requires explicit health configuration and sends an explicit backend IP array. |
| MongoDB restore snapshot | `/mongodb/v1/regions/{region}/snapshots/{snapshot_id}/restore` | Require explicit volume type. |
| RDB create backup/instance | `/rdb/v1/regions/{region}/backups`, `/instances` | Require database name for backup and initial username/password for instance. No invented credentials. |
| Serverless SQL create database | `/serverless-sqldb/v1alpha1/regions/{region}/databases` | Resolve project default required by the official Go SDK request contract. |
| VPN create connection/customer gateway/gateway/routing policy | `/s2s-vpn/v1alpha1/regions/{region}/…` | Resolve required project defaults consistently. |

Only documented required fields become required inputs. Nullable fields remain nullable;
optional fields remain optional. Config defaults apply to project/organization identity,
not credentials chosen for newly created cloud resources. Synthetic examples are
regenerated against the final Zod inputs, and real-dispatch contract tests validate the
serialized requests independently. These tests do not provision resources.

## Optional fields discovered by independent probes

Load Balancer `timeout_client`, `timeout_server`, `timeout_connect`, `timeout_tunnel`,
`check_delay` and `check_timeout` are numeric milliseconds in the current official zoned
schema. Keep legacy explicit `ms`/`s` strings accepted at the MCP input boundary and
convert them to milliseconds; also accept nonnegative finite numbers. Reject arbitrary
strings, negatives and unsupported units. Do not change other duration fields whose
wire schema is a string. The source was fetched independently on 2026-09-20 from
https://www.scaleway.com/en/developers/api/load-balancer/zoned/v1/schema.yml.
Data Lab total storage uses the recorded volume enum (`sbs_5k`, `unknown_type`).

Key Manager `associated_data` is an exception in the public OpenAPI: it describes
`google.protobuf.BytesValue` as an object, while the official JavaScript SDK 2.16.1
marshals the value directly as a JSON string. ProtoJSON specifies that representation
for `BytesValue`. The reviewed `key-manager-sdk` projection changes that component for
only encrypt/decrypt; the raw public document remains unchanged. The override pins the
SDK marshaller URL, content hash and public source hash. Inputs and handlers retain the
existing string representation; no wrapping or credential transformation is introduced.
Protocol reference: https://protobuf.dev/reference/protobuf/google.protobuf/#bytesvalue.
The LB SSL compatibility enum uses the documented `ssl_compatibility_level_old` value;
the invented `ssl_compatibility_level_old_backward` value is rejected at discovery/input
validation rather than forwarded as an invalid cloud request.
