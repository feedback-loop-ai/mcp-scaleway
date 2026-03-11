# Tasks: Comprehensive README Documentation

**Input**: Design documents from `/specs/038-comprehensive-readme/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested for this documentation feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Gather all data needed to write the README

- [x] T001 Extract complete tool inventory from all `src/tools/*/index.ts` files (539 tools, 36 services)
- [x] T002 Read authentication configuration from `src/shared/auth.ts` for env var documentation
- [x] T003 [P] Read build commands and scripts from `package.json`
- [x] T004 [P] Read current minimal `README.md` to confirm it will be fully replaced

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: N/A - No foundational infrastructure needed for a documentation feature. Proceed directly to user stories.

**Checkpoint**: Setup data gathered - user story implementation can now begin

---

## Phase 3: User Story 1 - New User Onboarding (Priority: P1) MVP

**Goal**: Write the core README sections that enable a new user to go from zero to a working MCP server connection in under 15 minutes.

**Independent Test**: A developer unfamiliar with the project can follow only the README to install, authenticate, and connect the MCP server.

### Implementation for User Story 1

- [x] T005 [US1] Write project header with name, one-line description, and badges in `README.md`
- [x] T006 [US1] Write Overview section explaining what the MCP server does, what Scaleway is, and the value proposition in `README.md`
- [x] T007 [US1] Write Features section listing all 36 service areas organized by category (Compute, Storage, Networking, etc.) in `README.md`
- [x] T008 [US1] Write Quick Start section with minimal 3-step setup (install, configure credentials, connect client) in `README.md`
- [x] T009 [US1] Write Prerequisites section documenting Bun 1.x requirement and Scaleway account in `README.md`
- [x] T010 [US1] Write Installation section with `git clone` and `bun install` commands in `README.md`
- [x] T011 [US1] Write Authentication section documenting all env vars (SCW_ACCESS_KEY, SCW_SECRET_KEY, SCW_DEFAULT_PROJECT_ID, optional vars) with defaults in `README.md`
- [x] T012 [US1] Write Configuration section with Claude Desktop JSON snippet (`claude_desktop_config.json`) in `README.md`
- [x] T013 [US1] Write Configuration section with Claude Code JSON snippet (`.mcp.json`) in `README.md`
- [x] T014 [US1] Write Configuration section with generic MCP client guidance in `README.md`

**Checkpoint**: At this point, User Story 1 should be fully functional - a new user can set up the server by following the README.

---

## Phase 4: User Story 2 - Discovering Available Tools (Priority: P2)

**Goal**: Provide a complete, organized tool reference so users can find the right tool for any Scaleway operation within 30 seconds.

**Independent Test**: A user can locate the correct tool name for any supported Scaleway operation by scanning the Tool Reference section.

### Implementation for User Story 2

- [x] T015 [US2] Write Tool Reference section header with navigation guide in `README.md`
- [x] T016 [P] [US2] Write Compute tools subsection (Instances 20 tools, Elastic Metal 14 tools, Apple Silicon 8 tools) in `README.md`
- [x] T017 [P] [US2] Write Storage & Databases tools subsection (Block Storage 11, Object Storage 14, RDB 27, MongoDB 15, Redis 16, Serverless SQL DB 9) in `README.md`
- [x] T018 [P] [US2] Write Networking tools subsection (VPC 10, Load Balancer 31, Public Gateway 26, DNS 18, Domain Registrar 15, IPAM 5, Edge Services 28) in `README.md`
- [x] T019 [P] [US2] Write Serverless & Containers tools subsection (Containers 20, Functions 20, Jobs 9, K8s 13) in `README.md`
- [x] T020 [P] [US2] Write AI & ML tools subsection (Inference 15, Generative APIs 4, Cockpit 22) in `README.md`
- [x] T021 [P] [US2] Write Security & Identity tools subsection (IAM 32, Secret Manager 16, Key Manager 13) in `README.md`
- [x] T022 [P] [US2] Write Managed Services tools subsection (SNS 8, SQS 8, TEM 15, IoT 29, Registry 12, Marketplace 8, NATS 9) in `README.md`
- [x] T023 [P] [US2] Write Account & Billing tools subsection (Account 5, Billing 5, Web Hosting 9) in `README.md`

**Checkpoint**: Tool reference covers all 539 tools across 36 service areas, organized by category.

---

## Phase 5: User Story 3 - Learning by Example (Priority: P2)

**Goal**: Provide practical usage examples showing natural language prompts users can give their AI assistant for common Scaleway tasks.

**Independent Test**: Users can copy example prompts and get valid Scaleway operations.

### Implementation for User Story 3

- [x] T024 [P] [US3] Write usage example for Compute - creating and managing instances in `README.md`
- [x] T025 [P] [US3] Write usage example for Storage - managing object storage buckets in `README.md`
- [x] T026 [P] [US3] Write usage example for Kubernetes - creating and managing clusters in `README.md`
- [x] T027 [P] [US3] Write usage example for Serverless - deploying functions in `README.md`
- [x] T028 [P] [US3] Write usage example for AI - using inference and generative APIs in `README.md`
- [x] T029 [P] [US3] Write usage example for Security - managing secrets and IAM in `README.md`

**Checkpoint**: At least 6 usage examples spanning 6 different service categories.

---

## Phase 6: User Story 4 - Managing Tool Scope (Priority: P3)

**Goal**: Document how users can filter which tools are available to reduce noise and focus on specific service areas.

**Independent Test**: A user can follow the instructions to limit tools to a specific service area.

### Implementation for User Story 4

- [x] T030 [US4] Write Managing Tools section explaining MCP client-side tool filtering with `allowedTools` patterns in `README.md`
- [x] T031 [US4] Write examples of tool filtering patterns for common use cases (e.g., only Kubernetes, only Compute) in `README.md`

**Checkpoint**: Users understand how to enable/disable tool groups.

---

## Phase 7: User Story 5 - Contributing to the Project (Priority: P3)

**Goal**: Enable developers to contribute by documenting development workflow, architecture, and testing requirements.

**Independent Test**: A new contributor can clone, build, lint, type-check, and test the project following only the README.

### Implementation for User Story 5

- [x] T032 [P] [US5] Write Development section with all build commands (start, lint, type-check, test, test:watch, test:parity) in `README.md`
- [x] T033 [P] [US5] Write Architecture section explaining src/ structure, tool pattern (index.ts/types.ts/handlers.ts), and shared modules in `README.md`
- [x] T034 [P] [US5] Write Testing section explaining unit/contract/integration test organization and 100% coverage requirement in `README.md`

**Checkpoint**: Contributors can set up and work on the project.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final sections and quality validation

- [x] T035 Write Troubleshooting section covering authentication failures, connection issues, and permission errors in `README.md`
- [x] T036 Write Table of Contents at top of `README.md` linking to all major sections
- [x] T037 Validate all JSON code blocks in `README.md` are syntactically valid
- [x] T038 Verify all 36 service areas and 539 tools are referenced in the Tool Reference section of `README.md`
- [x] T039 Review `README.md` for GitHub-flavored Markdown rendering correctness (headings, tables, code blocks, links)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A for documentation
- **User Stories (Phase 3-7)**: Depend on Setup data gathering (Phase 1)
  - US1 (onboarding) should be written first as it establishes the README structure
  - US2-US5 can proceed in parallel after US1 establishes the file
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 1 - Creates the README file structure
- **User Story 2 (P2)**: Depends on US1 (README file must exist) - Tool reference section
- **User Story 3 (P2)**: Depends on US1 (README file must exist) - Usage examples section
- **User Story 4 (P3)**: Depends on US1 (README file must exist) - Tool management section
- **User Story 5 (P3)**: Depends on US1 (README file must exist) - Development section

### Within Each User Story

- Tasks within a story marked [P] can run in parallel
- Non-[P] tasks must be executed sequentially

### Parallel Opportunities

- T003 and T004 can run in parallel during Setup
- T016-T023 (all tool reference subsections) can run in parallel
- T024-T029 (all usage examples) can run in parallel
- T032-T034 (all development subsections) can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all tool reference subsections together:
Task: "Write Compute tools subsection in README.md"
Task: "Write Storage & Databases tools subsection in README.md"
Task: "Write Networking tools subsection in README.md"
Task: "Write Serverless & Containers tools subsection in README.md"
Task: "Write AI & ML tools subsection in README.md"
Task: "Write Security & Identity tools subsection in README.md"
Task: "Write Managed Services tools subsection in README.md"
Task: "Write Account & Billing tools subsection in README.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (gather data)
2. Complete Phase 3: User Story 1 (onboarding sections)
3. **STOP and VALIDATE**: README enables zero-to-running setup
4. Ship as initial README

### Incremental Delivery

1. US1 → Onboarding works → Ship MVP
2. Add US2 → Tool reference complete → Ship
3. Add US3 → Usage examples → Ship
4. Add US4 + US5 → Tool management + development → Ship
5. Polish phase → Final quality pass → Ship

---

## Notes

- All tasks write to a single file: `README.md` at the repository root
- [P] tasks within tool reference and usage examples can be composed in parallel as separate content blocks, then assembled into the README
- In practice, since all tasks target the same file, sequential execution within each phase is recommended to avoid merge conflicts
- Total: 39 tasks across 8 phases
