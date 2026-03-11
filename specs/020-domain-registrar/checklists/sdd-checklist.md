# SDD Checklist: Domain Registrar (020-domain-registrar)

## Step 1: Branch & Directory Setup
- [x] Branch `020-domain-registrar` created
- [x] `specs/020-domain-registrar/{checklists,contracts}` directories created

## Step 2: SPECIFY
- [x] User Stories defined (P1-P3 priorities)
- [x] 15 MCP tools specified

### Tools
| Tool | Priority | Category |
|------|----------|----------|
| scaleway_domain_registrar_list_domains | P1 | Domain |
| scaleway_domain_registrar_get_domain | P1 | Domain |
| scaleway_domain_registrar_register_domain | P1 | Domain |
| scaleway_domain_registrar_renew_domain | P1 | Domain |
| scaleway_domain_registrar_transfer_domain | P2 | Domain |
| scaleway_domain_registrar_update_domain | P1 | Domain |
| scaleway_domain_registrar_enable_auto_renew | P1 | Domain |
| scaleway_domain_registrar_disable_auto_renew | P1 | Domain |
| scaleway_domain_registrar_check_domain_availability | P1 | Domain |
| scaleway_domain_registrar_list_contacts | P1 | Contact |
| scaleway_domain_registrar_get_contact | P1 | Contact |
| scaleway_domain_registrar_create_contact | P1 | Contact |
| scaleway_domain_registrar_update_contact | P1 | Contact |
| scaleway_domain_registrar_list_tlds | P1 | TLD |
| scaleway_domain_registrar_get_tld | P1 | TLD |

## Step 3: DESIGN
- [x] Types defined in `src/tools/domain-registrar/types.ts`
- [x] Zod schemas for all entities: Domain, Contact, DomainAvailability, Tld
- [x] Zod schemas for all input types (15 input schemas)
- [x] Enums: AutoRenewStatus, DnssecStatus, RegistrarLockStatus, DomainStatus, TransferStatus

## Step 4: CONTRACT
- [x] Contract tests in `tests/contract/domain-registrar/`
- [x] All 15 API endpoints have contract tests
- [x] Request shape, response shape, pagination, auth, error codes validated
- [x] Parity matrix updated in `tests/parity-matrix.json`

## Step 5: IMPLEMENT
- [x] Handlers in `src/tools/domain-registrar/handlers.ts`
- [x] Tool registration in `src/tools/domain-registrar/index.ts`
- [x] Uses Scaleway SDK client (`ScwRequest` interface)
- [x] API base path: `/domain/v2beta1`

## Step 6: VERIFY
- [x] `bun run lint` passes
- [x] `bun x tsc --noEmit` passes
- [x] All 220 tests pass (47 test files)
- [x] 100% line and branch coverage

## Step 7: ANALYZE
- [x] Locality: Global (no region/zone parameters)
- [x] 15 tools registered, 15 API endpoints covered
- [x] Error mapping: 400->invalid_input, 401/403->permission_denied, 404->not_found, 429->rate_limited, 5xx->server_error
