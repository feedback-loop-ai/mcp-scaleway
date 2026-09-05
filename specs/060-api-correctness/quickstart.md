# Quickstart: Verifying API Correctness

## Run the transport-boundary contracts

```bash
bun x vitest run --config tests/vitest.config.ts tests/contract/transport tests/contract/tools/elastic-metal/flexible-ip.transport.test.ts
```

These build the real SDK client with injected HTTP and dummy credentials, stub global fetch to throw, and assert host, path, method, authentication header and error-status mapping for representative operations in every repaired area.

## Whole-catalog smoke (local, no network)

The audit harness under `/tmp/scw-audit/smoke/smoke.ts` invokes every registered operation with synthesized valid input against a fake fetch and classifies each request. Expected: 724 OK, 0 BAD_URL, 0 NO_AUTH.

## Check parity and documentation agreement

```bash
bun run test:parity
python3 - <<'PY'
import json,re
m=json.load(open('tests/parity-matrix.json')); ops={e['tool'] for k,v in m.items() if k!='meta' for e in v.values()}
doc=set(re.findall(r'`(scaleway_[a-z0-9_]+)`', open('README.md').read()))
print('matrix',len(ops),'documented',len(ops & doc),'undocumented',sorted(ops-doc)[:5])
PY
```

## Migration reminders for consumers

- Autoscaling standalone policy operations are gone; configure policy on the group.
- Containers: memory input stays MiB; responses use v1 field names; crons are triggers.
- Public Gateway DHCP and container deploy/token operations are removed; see CHANGELOG.md.
