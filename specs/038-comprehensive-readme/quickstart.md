# Quickstart: Comprehensive README Documentation

**Date**: 2026-03-11 | **Branch**: `038-comprehensive-readme`

## What to Build

A single `README.md` file at the repository root replacing the current placeholder.

## Steps

1. Read the current README.md (single line: `# mcp-scaleway`)
2. Write the comprehensive README.md with all sections from the spec
3. Validate all JSON snippets are syntactically valid
4. Verify all 36 service areas are covered in the tool reference
5. Confirm GitHub-flavored Markdown renders correctly

## Key Data Sources

- Tool names and descriptions: `src/tools/*/index.ts` (server.tool() calls)
- Authentication config: `src/shared/auth.ts`
- Build commands: `package.json` scripts
- Architecture: `src/` directory structure
- Test config: `tests/vitest.config.ts`

## Validation

- All JSON code blocks must parse without errors
- Tool reference must list all 539 tools across 36 service areas
- Section headings must create a navigable table of contents
