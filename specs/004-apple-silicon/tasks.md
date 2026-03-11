# Tasks - Apple Silicon (004)

## Phase 1: Types & Schemas

- [x] T1.1: Define Zod input schemas in `src/tools/apple-silicon/types.ts`
  - ListServersParams, GetServerParams, CreateServerParams, DeleteServerParams
  - RebootServerParams, ReinstallServerParams, ListServerTypesParams, ListOSParams
  - CommitmentType enum, OrderBy enum

## Phase 2: Handlers

- [x] T2.1: Implement HTTP handlers in `src/tools/apple-silicon/handlers.ts`
  - listServers, getServer, createServer, deleteServer
  - rebootServer, reinstallServer, listServerTypes, listOS
  - Use `@scaleway/sdk-client` Client.fetch() for HTTP calls
  - Use shared error handling (mapScalewayError, formatErrorResponse)
  - Use shared pagination (buildPaginatedResponse, paginationToQuery)

## Phase 3: Tool Registration

- [x] T3.1: Replace stub in `src/tools/apple-silicon/index.ts`
  - Register all 8 tools with McpServer
  - Wire Zod schemas to tool input validation
  - Wire handlers to tool callbacks

## Phase 4: Unit Tests

- [x] T4.1: Write unit tests in `tests/unit/tools/apple-silicon/handlers.test.ts`
  - Test each handler with mocked client
  - Test success paths, error paths, pagination
  - 100% line and branch coverage

## Phase 5: Contract Tests

- [x] T5.1: Write contract tests in `tests/contract/tools/apple-silicon/contract.test.ts`
  - Validate request shape (URL, method, headers, body)
  - Validate response shape parsing
  - Validate pagination parameters
  - Validate auth header presence
  - Validate error code mapping
  - Reference Scaleway API endpoint and parity-matrix.json

## Phase 6: Parity Matrix

- [x] T6.1: Update `tests/parity-matrix.json` with Apple Silicon entries

## Phase 7: Verification

- [x] T7.1: Run lint (`bun run lint`)
- [x] T7.2: Run type check (`bun x tsc --noEmit`)
- [x] T7.3: Run unit + contract tests with coverage
