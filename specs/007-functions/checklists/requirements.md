# 007-functions Requirements Checklist

## Implementation Checklist

- [ ] `src/tools/functions/types.ts` - Zod schemas for all entities and input/output shapes
- [ ] `src/tools/functions/handlers.ts` - Handler functions for all 19 tools
- [ ] `src/tools/functions/index.ts` - Tool registration with McpServer

## Test Checklist

- [ ] `tests/unit/tools/functions/handlers.test.ts` - Unit tests for all handlers (100% coverage)
- [ ] `tests/contract/tools/functions/contract.test.ts` - Contract tests for API shapes

## Tool Coverage

### P1 - Namespaces
- [ ] scaleway_functions_list_namespaces
- [ ] scaleway_functions_get_namespace
- [ ] scaleway_functions_create_namespace
- [ ] scaleway_functions_update_namespace
- [ ] scaleway_functions_delete_namespace

### P1 - Functions
- [ ] scaleway_functions_list_functions
- [ ] scaleway_functions_get_function
- [ ] scaleway_functions_create_function
- [ ] scaleway_functions_update_function
- [ ] scaleway_functions_delete_function
- [ ] scaleway_functions_deploy_function

### P2 - Cron Triggers
- [ ] scaleway_functions_list_crons
- [ ] scaleway_functions_create_cron
- [ ] scaleway_functions_update_cron
- [ ] scaleway_functions_delete_cron

### P3 - Domains & Tokens
- [ ] scaleway_functions_list_domains
- [ ] scaleway_functions_create_domain
- [ ] scaleway_functions_delete_domain
- [ ] scaleway_functions_create_token
- [ ] scaleway_functions_delete_token

## Parity Matrix Entries
- [ ] All 19 tools have entries in `tests/parity-matrix.json`
- [ ] All entries reference contract test file paths
