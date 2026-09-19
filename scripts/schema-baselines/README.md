# Reviewed semantic schema baselines

Each JSON file contains the recorded upstream SHA-256 and an OpenAPI projection
derived from the exact bytes accepted in `tests/parity-matrix.json`. The initial
snapshot checked every local `.forge/scratch/scw-<area>.yml` against that digest.
Files retain endpoints, request and response schemas, component references,
required fields, defaults, enums, constants and constraints, together with server
origins and base paths. Documentation prose, examples and vendor extensions are
omitted. Field names such as `description` and arbitrary literal contents of
defaults, enums and constants remain part of schemas.

`bun run fetch:schemas --output .forge/reports/schema-freshness` compares the
public current documents with these baselines and produces JSON and Markdown
review artifacts. It never refreshes these files, the matrix, or local evidence.
Changed upstream bytes succeed with an alarm; HTTP, parsing and checker failures
exit nonzero. The weekly workflow uploads the artifacts for review.

After reviewing an upstream change, refresh that area's provenance and local
schema through the normal review process. Then recreate its JSON with
`semanticSchema` from `scripts/schema-diff.ts`, retaining the SHA-256 of the
accepted raw bytes. Verify the local bytes match the newly recorded digest before
generating; review the JSON diff alongside the associated contract changes.
The offline freshness tests require every baseline digest to match the matrix.

This projection describes structural changes, not compatibility judgments. A byte
change with an empty semantic diff commonly reflects documentation edits. JSON
pointers in the report identify changes in named schemas and inline endpoint
schemas; clients must still assess the impact of referenced component changes.
