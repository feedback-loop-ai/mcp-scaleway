# SDD: {Product Name} API

**Spec**: {NNN}-{product-name} | **Date**: YYYY-MM-DD
**API Group**: {Group Name} | **Locality**: {zoned|regional|global}
**SDK Package**: `@scaleway/sdk-{product}`

## Overview

{Brief description of the API product and what it enables.}

## Tool Contracts

{For each tool, use the format from `contracts/tool-contract.md`:}

### scaleway_{product}_{action}_{resource}

```yaml
Tool: scaleway_{product}_{action}_{resource}
Title: {Human-readable title}
Description: {Action-oriented description}
Scaleway API: {HTTP_METHOD} /path/to/endpoint
Locality: {zoned|regional|global}

Input Schema:
  {field}: {zod_type} - {description} [required|optional]

Output Schema:
  {field}: {type} - {description}

Pagination: yes | no

Error Codes:
  - 400: Invalid input → invalid_input
  - 403: Forbidden → permission_denied
  - 404: Not found → not_found
  - 429: Rate limited → rate_limited

Example Request:
  { "zone": "fr-par-1" }

Example Response:
  { "items": [], "totalCount": 0, "page": 1, "pageSize": 50 }
```

## Scaleway API Reference

{Link to or embed the relevant section from `specs/scaleway-api/{product}/`.}

## Implementation Notes

{Product-specific considerations: authentication quirks, pagination limits, rate limits, etc.}
