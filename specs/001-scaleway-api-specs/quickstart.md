# Quickstart: Adding a New API Product

**Feature**: 001-scaleway-api-specs | **Date**: 2026-03-06

## Overview

This guide explains how to add a new Scaleway API product to the MCP server, from spec to implementation.

## Step 1: Create the Product SDD Spec

Each API product has a numbered spec directory. Check the master index in [plan.md](./plan.md) for the assigned number.

```bash
# Example: Adding Instances (spec 002)
/speckit.specify
# Describe: "Instances API - virtual machine CRUD, IPs, security groups, volumes"
```

This creates `specs/002-instances/spec.md` following the SDD template.

## Step 2: Define Tool Contracts

In the product spec, define each tool using the [tool contract format](./contracts/tool-contract.md):

```yaml
Tool: scaleway_instances_list_servers
Title: List Instances
Description: List all compute instances in a zone with optional filtering
Scaleway API: GET /instance/v1/zones/{zone}/servers
Locality: zoned

Input Schema:
  zone: z.string() - Availability zone (e.g., fr-par-1) [required]
  page: z.number().optional() - Page number [optional]
  pageSize: z.number().optional() - Items per page [optional]

Output Schema:
  items: Server[] - List of server objects
  totalCount: number - Total servers
```

## Step 3: Create the Tool Module

```bash
# Create product directory
mkdir -p src/tools/instances
```

### `src/tools/instances/types.ts`

```typescript
import { z } from 'zod/v4';

export const ListServersInput = z.object({
  zone: z.string().describe('Availability zone (e.g., fr-par-1)'),
  page: z.number().int().positive().optional().describe('Page number'),
  pageSize: z.number().int().min(1).max(100).optional().describe('Items per page'),
});
```

### `src/tools/instances/index.ts`

```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListServersInput } from './types.js';

export function registerInstancesTools(server: McpServer): void {
  server.registerTool(
    'scaleway_instances_list_servers',
    {
      title: 'List Instances',
      description: 'List all compute instances in a zone',
      inputSchema: ListServersInput,
    },
    async ({ zone, page, pageSize }) => {
      // Implementation calls Scaleway SDK
    },
  );
}
```

### `src/tools/index.ts` (update barrel)

```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerInstancesTools } from './instances/index.js';

export function registerAllTools(server: McpServer): void {
  registerInstancesTools(server);
  // Add new products here
}
```

## Step 4: Write Contract Tests

```typescript
// tests/contract/instances.test.ts
import { describe, it, expect } from 'vitest';

describe('scaleway_instances_list_servers', () => {
  // Scaleway API: GET /instance/v1/zones/{zone}/servers
  // Spec: specs/002-instances/spec.md
  // Parity: tests/parity-matrix.json#instances.listServers

  it('validates request shape', () => { /* ... */ });
  it('validates response shape', () => { /* ... */ });
  it('supports pagination parameters', () => { /* ... */ });
  it('requires zone parameter', () => { /* ... */ });
  it('handles not_found error', () => { /* ... */ });
});
```

## Step 5: Update Parity Matrix

Add entries to `tests/parity-matrix.json`:

```json
{
  "instances": {
    "listServers": {
      "api": "GET /instance/v1/zones/{zone}/servers",
      "tool": "scaleway_instances_list_servers",
      "spec": "specs/002-instances/spec.md",
      "contractTest": "tests/contract/instances.test.ts"
    }
  }
}
```

## Step 6: Verify

```bash
bun run lint          # Biome checks
bun x tsc --noEmit    # Type check
bun run test          # All tests pass
bun run test:parity   # Parity matrix complete
```

## Key Rules

- One `registerTools(server)` function per product module
- All tool names follow `scaleway_{product}_{action}_{resource}`
- Every tool MUST have 100% contract test coverage before merge
- Every tool MUST trace to a Scaleway API endpoint in `specs/scaleway-api/`
- No cross-product dependencies between tool modules
