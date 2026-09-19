# Implementation and delivery plan

Keep the existing tool schemas, handlers and gateway dispatch architecture.
Correct API paths and serialization at their existing boundaries, and update the
parity matrix before regenerating operation metadata. Exercise emitted HTTP
requests with the real Scaleway SDK and production route guard.

Represent chat function definitions and conversation messages with Zod schemas.
Forward supported fields to Scaleway's chat endpoint, preserve returned tool calls,
and leave function execution to the caller. Prefer `max_completion_tokens` when
provided and retain the existing legacy default otherwise.

Use reviewed schema projections for structural comparisons, retaining request and
response constraints, literal values and server origins while removing prose.
Keep accepted digests separate from current fetched documents. The scheduled
workflow has read-only repository permissions and needs no cloud credentials.

Review service contracts, Generative APIs and maintenance tooling in parallel.
Build an isolated Git snapshot containing only this non-Jev change and validate it
independently. Preserve the optional routing work in the original working tree.
Record the exact checks and live-read limits before creating the local commit.
