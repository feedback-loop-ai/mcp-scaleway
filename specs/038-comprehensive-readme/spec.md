# Feature Specification: Comprehensive README Documentation

**Feature Branch**: `038-comprehensive-readme`
**Created**: 2026-03-11
**Status**: Draft
**Input**: User description: "Create a comprehensive README.md for the mcp-scaleway MCP server project covering installation, authentication, configuration, usage examples, tool reference, and development guidelines"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Onboarding (Priority: P1)

A developer discovers the mcp-scaleway project and wants to install it and connect it to their AI assistant (Claude Desktop, Claude Code, or another MCP client). They need clear, step-by-step instructions to go from zero to a working setup, including obtaining Scaleway API credentials and configuring the MCP client.

**Why this priority**: Without clear onboarding documentation, potential users cannot adopt the project at all. This is the single most important documentation need.

**Independent Test**: Can be tested by giving the README to a developer unfamiliar with the project and verifying they can set up a working MCP server connection within 15 minutes.

**Acceptance Scenarios**:

1. **Given** a developer with no prior exposure to mcp-scaleway, **When** they follow the Installation section, **Then** they can install the server and its dependencies using the documented commands.
2. **Given** a developer who has installed the server, **When** they follow the Authentication section, **Then** they can configure their Scaleway API credentials and verify they work.
3. **Given** a developer with credentials configured, **When** they follow the Configuration section for their MCP client (Claude Desktop, Claude Code, or generic), **Then** the MCP server starts and connects successfully.

---

### User Story 2 - Discovering Available Tools (Priority: P2)

A user with a working setup wants to understand what Scaleway services are available through the MCP server. They need an organized reference of all 35+ service areas and their individual tools, grouped by category, so they can find the right tool for their task.

**Why this priority**: After onboarding, users need to discover capabilities to derive value. A well-organized tool reference is essential for discoverability.

**Independent Test**: Can be tested by asking a user to find the correct tool for a specific Scaleway operation (e.g., "create a Kubernetes cluster") and verifying they can locate it in the README within 30 seconds.

**Acceptance Scenarios**:

1. **Given** a user looking for compute-related tools, **When** they browse the Tool Reference section, **Then** they find all compute tools (Instances, Elastic Metal, Apple Silicon) grouped together with descriptions.
2. **Given** a user searching for a specific operation, **When** they scan the tool reference, **Then** each tool name and description is clear enough to identify the right tool without trial-and-error.

---

### User Story 3 - Learning by Example (Priority: P2)

A user wants to see practical examples of how to use the MCP server for common Scaleway tasks. They need sample prompts they can give to their AI assistant to perform real operations like creating instances, managing storage, or deploying serverless functions.

**Why this priority**: Examples bridge the gap between reference documentation and practical usage. They give users confidence and reduce the learning curve.

**Independent Test**: Can be tested by giving users the example prompts and verifying they produce the expected Scaleway operations.

**Acceptance Scenarios**:

1. **Given** a user reading the Usage Examples section, **When** they copy a sample prompt for creating an instance, **Then** the prompt works with their configured MCP client to produce a valid Scaleway API call.
2. **Given** a user new to Scaleway, **When** they read the examples, **Then** examples cover at least 5 different service categories with realistic use cases.

---

### User Story 4 - Managing Tool Scope (Priority: P3)

A user wants to limit which Scaleway tools are available in their MCP client session to reduce noise and focus on specific service areas. They need guidance on how to enable or disable specific tool groups.

**Why this priority**: Important for power users who want focused sessions, but not essential for initial adoption.

**Independent Test**: Can be tested by following the documented instructions to restrict tools to a single service area and verifying only those tools are available.

**Acceptance Scenarios**:

1. **Given** a user who only works with Kubernetes and Instances, **When** they follow the tool management documentation, **Then** they can configure their MCP client to expose only those tool groups.

---

### User Story 5 - Contributing to the Project (Priority: P3)

A developer wants to contribute to the mcp-scaleway project. They need to understand the development workflow, testing requirements, project architecture, and how to run the build/test pipeline locally.

**Why this priority**: Enables community contributions but is secondary to end-user documentation.

**Independent Test**: Can be tested by having a new contributor clone the repo, follow the Development section, and successfully run linting, type checking, and tests.

**Acceptance Scenarios**:

1. **Given** a developer who has cloned the repository, **When** they follow the Development section, **Then** they can run all build commands (lint, type check, tests) successfully.
2. **Given** a developer reading the Architecture section, **When** they want to add a new tool, **Then** they understand the file structure pattern and testing requirements.

---

### Edge Cases

- What happens when a user has an older version of Bun installed that doesn't meet requirements?
- How does the user troubleshoot when the MCP server fails to connect to Scaleway APIs?
- What if the user's Scaleway API key doesn't have permissions for certain services?
- What if the user tries to use the server with an MCP client not explicitly documented?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: README MUST include a project overview explaining what the MCP server does, what Scaleway is, and the value proposition for AI-assisted cloud management.
- **FR-002**: README MUST list all supported Scaleway services organized by category (Compute, Storage & Data, Networking & Security, Serverless & Containers, AI & Managed Services, Account & Billing).
- **FR-003**: README MUST provide step-by-step installation instructions for Bun (primary runtime) with prerequisites clearly stated.
- **FR-004**: README MUST document all authentication environment variables: required (SCW_ACCESS_KEY, SCW_SECRET_KEY, SCW_DEFAULT_PROJECT_ID) and optional (SCW_DEFAULT_ORGANIZATION_ID, SCW_DEFAULT_REGION, SCW_DEFAULT_ZONE) with descriptions and defaults.
- **FR-005**: README MUST include configuration examples for Claude Desktop (claude_desktop_config.json), Claude Code (.mcp.json), and generic MCP client setup with exact JSON snippets.
- **FR-006**: README MUST provide at least 5 usage examples covering different service categories with natural language prompts showing what users can ask their AI assistant.
- **FR-007**: README MUST include a complete tool reference organized by service area, listing tool names and brief descriptions.
- **FR-008**: README MUST document how to manage tool access by enabling/disabling specific tool groups.
- **FR-009**: README MUST include a Development section with build commands, testing instructions, and 100% coverage requirement.
- **FR-010**: README MUST include an Architecture section explaining the codebase structure and patterns.
- **FR-011**: README MUST include a Troubleshooting section covering common issues (authentication failures, connection problems, permission errors).
- **FR-012**: README MUST render correctly as GitHub-flavored Markdown with proper headings, code blocks, tables, and links.

### Key Entities

- **README.md**: The single comprehensive documentation file at the project root, replacing the current minimal placeholder.
- **Configuration Snippets**: JSON examples for different MCP client configurations (Claude Desktop, Claude Code).
- **Tool Reference**: Structured catalog of all MCP tools organized by Scaleway service area.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can go from zero to a working MCP server connection by following only the README, without consulting external resources, in under 15 minutes.
- **SC-002**: Users can find the correct tool for any supported Scaleway operation within 30 seconds using the tool reference.
- **SC-003**: The README covers 100% of the 36 supported Scaleway service areas in the tool reference.
- **SC-004**: Configuration examples are provided for at least 2 MCP client platforms (Claude Desktop and Claude Code).
- **SC-005**: At least 5 usage examples span at least 5 different service categories.
- **SC-006**: All code snippets in the README are syntactically valid and copy-pasteable.

## Assumptions

- The primary audience is developers already familiar with AI assistants and MCP but new to this specific server and possibly new to Scaleway.
- Bun is the primary and recommended runtime; npm/npx alternatives are secondary.
- The README replaces the current single-line placeholder entirely.
- License information will reference the project's existing license file or state the license type if one exists; if no license exists, this section will note that.
- Tool management is done through MCP client configuration (tool filtering) rather than server-side configuration, based on how the MCP protocol works.
