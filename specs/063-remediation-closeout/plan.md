# Implementation plan and final design

- Extract exact route comparison from the drift reporter. Split only the query
  suffix; preserve namespaces, hosts, methods, case and parameter names. Keep query
  text visible, without claiming that path matching validates parameter contracts.
- Keep the Webhosting CLI explicit and credential-dependent, but send GETs only.
  Report restore POST as skipped, use deadlines and no redirect following, discard
  response bodies, and sanitize transport failures. Each observation stands alone.
- Use Bun `--watch` for development restart. Verify a real imported-source edit in
  an isolated copy, then initialize a fresh MCP session; document reconnect needs.
- Build, pack, install the real tarball in a temporary consumer, import its public
  library and enumerate gateway/flat/both tools through the installed Node executable.
  Keep cloud/model credentials out of child environments and remove the temporary
  installation afterward. Run this under CI's Bun 1.3.6 and Node 20.20.2.
- Test false-positive and genuine mismatch cases plus HTTP diagnostic uncertainty.
  Preserve full source coverage and measure the unit-only timing separately.

The route reporter and diagnostic remain review aids rather than proof of live
contract compatibility. Full endpoint schema validation is still tracked by #62/#63.
