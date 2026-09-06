# Quickstart: Verifying API Correctness

## Run the transport-boundary contracts

```bash
bun x vitest run --config tests/vitest.config.ts tests/contract/transport tests/contract/tools/elastic-metal/flexible-ip.transport.test.ts
```

These use injected HTTP and dummy credentials. The representative and migrated-area tests assert specific paths, headers, bodies and error handling. The catalog smoke replaces SDK HTTP and direct global-fetch paths with local recorders; it proves minimal-input dispatch for each registered operation, not full per-endpoint response semantics.

## Whole-catalog smoke (committed, runs in CI)

```bash
bun x vitest run --config tests/vitest.config.ts tests/contract/transport/catalog-smoke.contract.test.ts
```

Invokes every registered operation once through its SDK or direct-fetch path with synthesized valid input and a recording HTTP layer; asserts allowed host, well-formed path and authentication header for all 724 operations, grouped per area.

## Check parity and documentation agreement

```bash
bun run test:parity
bun x vitest run --config tests/vitest.config.ts tests/unit/docs-parity.test.ts tests/unit/supported-versions.test.ts
```

## Migration reminders for consumers

- Autoscaling standalone policy operations are gone; configure policy on the group.
- Containers: memory input stays MiB; responses use v1 field names; crons are triggers.
- Public Gateway DHCP and container deploy/token operations are removed; see CHANGELOG.md.
