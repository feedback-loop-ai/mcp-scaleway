# Engineering plan

Preserve existing area registrars and handlers except where upstream contracts changed. Correct request construction in place. Compare current official SDK/OpenAPI shapes before API migration. Use real SDK HTTP-boundary tests to prevent Response mocks or permissive client mocks from masking malformed paths, missing auth and parsing misuse. Keep unit/contract coverage and parity gates unchanged in strength.

Review the combined diff, run lint/typecheck/full line-and-branch coverage/parity/build, and open a correctness PR before the discovery branch. Keep old feature-history specifications intact; authoritative API references document migrations.
