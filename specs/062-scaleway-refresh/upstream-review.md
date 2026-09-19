# Remaining upstream schema changes reviewed

Reviewed on **2026-09-19**, against the public fetch recorded at **2026-09-19T06:09:53.071Z** in `.forge/reports/schema-freshness/report.json`. The original downloaded documents and textual diffs were also inspected; semantic comparison alone intentionally excludes documentation changes.

**Result: no required compatibility fix was identified among these 17 remaining changes.** There are 3 documentation-only changes, 12 changes limited to response fields/enums, and 2 changes involving capabilities the current tools do not expose. The Apple Silicon route removals concern unused operations; the VPN request additions are optional. This is a review of these deltas, not a claim that all 727 operations have been verified against authenticated live services.

| Area and current official evidence | Classification | Effect on this repository |
| --- | --- | --- |
| [account](https://www.scaleway.com/en/developers/api/account/project/v3/schema.yml) | Additive response | Project `srn`. Existing project output deliberately projects selected fields and does not expose this new field. |
| [apple-silicon](https://www.scaleway.com/en/developers/api/apple-silicon/v1alpha1/schema.yml) | Unexposed capability / route move | `GetUserConfiguration` and `UpdateRunnerConfigurationStatus` move from `apple-silicon-internal/v1alpha1` to `apple-silicon/v1alpha1`; neither operation is registered in this repository. |
| [block-storage](https://www.scaleway.com/en/developers/api/block/v1/schema.yml) | Additive response | `srn` on snapshots, volumes and volume types. |
| [data-warehouse](https://www.scaleway.com/en/developers/api/data-warehouse/v1beta1/schema.yml) | Additive response | `srn` on databases, deployments, endpoints and users. |
| [dns](https://www.scaleway.com/en/developers/api/domains-and-dns/v2beta1/schema.yml) | Documentation only | API title, introductory wording and registrar documentation links change; no semantic schema change. |
| [domain-registrar](https://www.scaleway.com/en/developers/api/domains-and-dns/registrar/v2beta1/schema.yml) | Documentation only | API title and DNS documentation wording change; no semantic schema change. |
| [file-storage](https://www.scaleway.com/en/developers/api/file-storage/v1alpha1/schema.yml) | Additive response | `srn` on attachments and filesystems. |
| [generative-apis](https://www.scaleway.com/en/developers/api/generative-apis/v1/schema.yml) | Additive response | `usage.prompt_tokens_details.cached_tokens` added. The handler forwards the response JSON, retaining this field. |
| [iam](https://www.scaleway.com/en/developers/api/iam/v1alpha1/schema.yml) | Additive response | `srn` added to twelve resource schemas, including API keys, applications, policies, rules and users. |
| [inference](https://www.scaleway.com/en/developers/api/inference/v1/schema.yml) | Documentation only | Quickstart, examples, help links and wording revised; no semantic schema change. |
| [interlink](https://www.scaleway.com/en/developers/api/interlink/v1beta1/schema.yml) | Additive response | `srn` on dedicated connections, links, partners, points of presence and routing policies; description formatting also changes. |
| [ipam](https://www.scaleway.com/en/developers/api/ipam/v1/schema.yml) | Additive response | `srn` on IP resources. |
| [product-catalog](https://www.scaleway.com/en/developers/api/product-catalog/public-catalog/v2alpha1/schema.yml) | Additive response enum | Countable units gain `gigabyte_hour`; unit descriptions improve. Current response handling does not enforce a closed unit enum. |
| [public-gateway](https://www.scaleway.com/en/developers/api/public-gateway/v2/schema.yml) | Additive response | `srn` on gateways, gateway networks, IPs and PAT rules; description formatting also changes. |
| [secret-manager](https://www.scaleway.com/en/developers/api/secret-manager/v1beta1/schema.yml) | Additive response | `srn` on secrets and secret versions; list description formatting also changes. |
| [vpc](https://www.scaleway.com/en/developers/api/vpc/v2/schema.yml) | Additive response | `srn` on ingress rules, private networks, routes, subnets, VPCs and VPC connectors. |
| [vpn](https://www.scaleway.com/en/developers/api/s2s-vpn/v1alpha1/schema.yml) | Unexposed capability + additive response | Connection PATCH gains optional nullable `secret_id` and `secret_revision`; current update input exposes name/tags only. Four resource schemas gain `srn`. Private-network fields are reordered, not removed. |

## Why these do not block the current changes

The response additions add no required request fields and remove no fields consumed by existing handlers. Current handlers either pass through decoded responses or explicitly project an established output shape. For example, [Account project formatting](../../src/tools/account/handlers.ts) intentionally omits `srn`; [Generative API handlers](../../src/tools/generative-apis/handlers.ts) preserve returned JSON; and [Product Catalog handlers](../../src/tools/product-catalog/handlers.ts) do not reject the new countable-unit value. This finding does not assert complete runtime response validation, nor that every newly added response property is exposed by every SDK or wrapper.

The two Apple Silicon routes are absent from `src/tools/apple-silicon`, the parity matrix and generated operation metadata. Their path migration therefore does not invalidate an operation currently registered here. Adding those operations would be a separate capability expansion.

The [VPN update schema](../../src/tools/vpn/types.ts) and [handler](../../src/tools/vpn/handlers.ts) currently accept name/tags updates. The newly added `secret_id` and `secret_revision` are optional, so existing updates remain structurally valid. Supporting selection of a Secret Manager key version through connection PATCH is a separate capability expansion. This review does not substitute a different PSK operation for that new API contract.

## Outstanding work and evidence boundaries

- **Required fixes caused by these 17 deltas: none identified.**
- Optional capability work: expose the two Apple Silicon configuration operations and the two VPN PATCH secret-selection fields if product scope calls for them. Account `srn` exposure may be added independently.
- The original recorded schema hashes and provenance for these 17 areas remain unchanged. The freshness checker will therefore continue reporting their byte differences; this document records their disposition without claiming that every contract in those areas was re-verified or silently accepting new baselines.
- RDB snapshot route repairs, Containers public-endpoint control, Kubernetes kubeconfig endpoint selection, Key Manager rotations/material deletion and Audit Trail custom-rule evaluation were handled separately in this change. They are not outstanding items in this table.

Reproduce the comparison with `bun run fetch:schemas`; it fetches public schemas and makes no authenticated cloud mutations. The exact report preserves both recorded and current SHA-256 digests for all 48 URLs.
