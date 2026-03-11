# Feature Specification: Release Pipeline

**Feature Branch**: `040-release-pipeline`
**Created**: 2026-03-11
**Status**: Draft
**Input**: User description: "create an npm release pipeline like in https://github.com/feedback-loop-ai/mcp-ory-kratos/tree/main/specs/006-release-pipeline"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install from Package Registry (Priority: P1)

A developer wants to use the MCP Scaleway server in their AI workflow without cloning the repository. They install it directly from npm using a simple command and configure it in their MCP client (Claude Desktop, VS Code extension, or other MCP-compatible tools).

**Why this priority**: This is the primary goal - enabling users to consume the MCP server as a standalone package without needing source code access. It provides immediate value and is the foundation for all other distribution methods.

**Independent Test**: Can be fully tested by publishing to npm and attempting installation with `npm install -g mcp-scaleway` followed by running `mcp-scaleway --version`. Delivers value as users can immediately use the server.

**Acceptance Scenarios**:

1. **Given** the package is published to npm, **When** a user runs `npm install -g mcp-scaleway`, **Then** the server is installed and available as a global command `mcp-scaleway`
2. **Given** the server is installed, **When** a user configures it in their MCP client with the required Scaleway credentials, **Then** the server starts and connects to Scaleway APIs successfully

---

### User Story 2 - Automated Version Release (Priority: P2)

A maintainer creates a new version tag (e.g., v1.0.0) in the repository. The system automatically builds, tests, and publishes the new version to the package registry without manual intervention.

**Why this priority**: Automation ensures consistent, reliable releases and reduces human error. Critical for sustainable project maintenance but depends on P1 being complete.

**Independent Test**: Can be tested by creating a version tag and verifying the package appears on npm within the expected timeframe. Delivers value by enabling hands-free releases.

**Acceptance Scenarios**:

1. **Given** CI passes on the main branch, **When** a maintainer pushes a semantic version tag (e.g., v1.2.3), **Then** the release workflow triggers automatically
2. **Given** the release workflow runs, **When** all build and test steps pass, **Then** the package is published to npm with the tagged version
3. **Given** a release is published, **When** the workflow completes, **Then** a GitHub Release is created with auto-generated release notes

---

### User Story 3 - Pre-release Testing (Priority: P3)

A contributor wants to test a new feature before it's officially released. They can install a pre-release version to validate changes before a stable release.

**Why this priority**: Pre-release versions enable early testing and feedback, improving release quality. Lower priority as stable releases must work first.

**Independent Test**: Can be tested by publishing a beta version and installing with `npm install mcp-scaleway@beta`. Delivers value by enabling community testing of new features.

**Acceptance Scenarios**:

1. **Given** a maintainer wants to test a pre-release, **When** they trigger the pre-release workflow manually, **Then** a pre-release version (e.g., 1.2.3-beta.0) is published
2. **Given** a pre-release is published, **When** a user installs with the beta tag, **Then** they receive the latest pre-release version
3. **Given** pre-release and stable versions exist, **When** a user installs without a tag, **Then** they receive the latest stable version (not pre-release)

---

### Edge Cases

- What happens when the npm publish fails due to network issues? (Single automatic retry, then fail with clear error message for maintainer action)
- How does the system handle duplicate version tags? (Should reject and notify maintainer)
- What happens when tests fail during release? (Release should be aborted, tag should remain for retry after fix)
- What if the package name is already taken on npm? (Scoped package @feedback-loop-ai/mcp-scaleway can be used as fallback)
- What if the build produces an oversized bundle due to dependency bloat? (Build step should fail with a size check gate)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST build the TypeScript source code into a distributable format compatible with Node.js runtime
- **FR-002**: System MUST declare all dependencies in package.json so that `npm install` resolves them for standalone execution (dependencies are external, not bundled into the build output)
- **FR-003**: System MUST generate a single executable entry point that can be invoked via command line
- **FR-004**: System MUST publish packages to the npm registry upon version tag creation
- **FR-005**: System MUST validate package integrity (lint, type-check, tests with 100% coverage) before publishing
- **FR-006**: System MUST support semantic versioning (major.minor.patch) for releases
- **FR-007**: System MUST create GitHub Releases with auto-generated release notes (from merged PRs) for each published version
- **FR-008**: System MUST prevent publishing when validation steps fail
- **FR-009**: System MUST support pre-release versions (alpha, beta, rc) for testing
- **FR-010**: System MUST preserve the existing CI workflow for pull request validation
- **FR-011**: System MUST enforce a maximum package size limit to prevent bloated distributions

### Key Entities

- **Package**: The distributable artifact containing compiled code and metadata (name, version, dependencies, entry points)
- **Release**: A published version including npm package, GitHub Release, and associated changelog
- **Version Tag**: Git tag following semantic versioning that triggers the release process

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can install the package from npm and have a working MCP server in under 2 minutes
- **SC-002**: Time from version tag push to package availability on npm is under 10 minutes
- **SC-003**: 100% of releases include passing lint, type-check, and test validations with full coverage
- **SC-004**: Package size is under 5MB for fast installation
- **SC-005**: Installation works on Node.js 18+ and Bun 1.x runtimes
- **SC-006**: Zero manual steps required between tagging and npm publication

## Assumptions

- npm is the primary package registry (standard for JavaScript/TypeScript ecosystem)
- Semantic versioning (SemVer) is used for version numbering
- GitHub Actions is the CI/CD platform (already in use for CI)
- npm Trusted Publishing (OIDC) will be configured for secure, secretless releases after initial publish
- NPM_TOKEN secret only needed for initial v0.1.0 release (before package exists on npm)
- The package will support both Node.js and Bun runtimes
- Bun's bundler will be used for building (aligns with existing tooling)
- Build output format: Single Bun-compiled JavaScript bundle that runs natively on both Node.js 18+ and Bun 1.x (no separate builds per runtime)
- Unscoped package name `mcp-scaleway` (simpler install command, matching existing package.json)
- Existing CI workflow (ci.yml) remains unchanged; release workflow is a separate workflow file
