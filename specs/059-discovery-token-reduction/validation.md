# Discovery validation

## Measured implementation

| Mode | Tool definitions | Compact tool-array bytes | Instruction bytes |
| --- | ---: | ---: | ---: |
| gateway | 4 | 2,162 | 1,233 |
| flat | 724 | 557,833 | 1,060 |
| both | 728 | 559,994 | 1,230 |

Baseline note (I6): the audit measured 733 tools at 219,400 tokens on the 0.3.x catalog. Feature 060 then removed 9 operations (733 → 724). The 99.61% listing-byte reduction below is gateway versus the 724-tool flat mode; SC-001's "99% smaller than the previous full catalog" holds against both the 733 and 724 baselines.

Measured with a real MCP Client and InMemoryTransport using `bun run measure:discovery`.
Listing-byte reduction gateway versus flat: 99.61% (2,162 / 557,833). The 38 usage examples added to legacy operation descriptions during the spec retrofit (Constitution I) increased the flat/both listings slightly versus the 0.4.0 figures (554,857 / 557,018); the gateway listing is unchanged at 2,162 bytes because the four gateway tools carry their own descriptions. These are bytes, not tokenizer estimates.
The original 733-tool audit counted 219,400 input tokens on its Opus route. After implementation,
the official Anthropic SDK countTokens call returned HTTP 503 for all tested modes:
`All accounts are temporarily unavailable`. Final model-specific token count is unverified.

## Runtime verification

- Lint, TypeScript, full unit/contract tests, line/branch coverage and parity pass.
- All supported operations are reachable through paginated gateway search in protocol tests.
- Representative keyword retrieval tests cover real catalog queries; this is not an LLM success evaluation.
- Original input defaults/refinements, record schemas and callback errors remain tested.
- Excluded writes are rejected before network dispatch. Endpoint confinement blocks path traversal in identifier fields (reviewer reproductions across rdb, marketplace, redis, tem, webhosting, apple-silicon, domain-registrar, edge-services, sns, object-storage and iam) with zero HTTP calls, in gateway, flat and both modes; honest identifiers still reach exactly their declared endpoints.
- An npm-packed install runs under Node through stdio without credentials. Gateway, flat and both
  modes, RDB-only selection and excluded-operation errors were verified.
- Package-name imports resolve to the bundled server and do not start the stdio process.
- CI-pinned Bun 1.3.6 accepts the frozen lockfile in an isolated install.
- Actual provisioning against Scaleway was not performed. HTTP-boundary tests use fake credentials
  and injected transport. Earlier test isolation mistakes sent dummy-token requests returning 401;
  no successful mutations or real credentials were involved.

## Deliberate limits

Conservative projection preserves schema validation metadata rather than claiming the audit's
aggressive flat-mode reduction. Catalog size remains large in flat/both mode. Resource response
payloads remain unchanged. Read-only is not a confidentiality guarantee or an IAM replacement.
The runtime config is immutable for a server lifetime; reconnect after changing profiles.
Source changes do not remove previously loaded tool schemas from existing conversations.

Reviews were delivered as correctness PR #54 and compact-discovery PR #55, both merged to main; 0.4.0 was published to npm and released on GitHub. This validation file is a historical record of the pre-release measurements and verification boundaries; it does not authorize further release actions.
