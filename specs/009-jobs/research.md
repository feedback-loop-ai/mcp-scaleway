# Research: Scaleway Serverless Jobs MCP Tools

**Feature**: 009-jobs | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Serverless Jobs API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

Since `@scaleway/sdk-client` provides a generic client, we make HTTP calls to the Serverless Jobs API endpoints directly using the client's fetch method.

### Serverless Jobs API Structure

The Scaleway Serverless Jobs API is region-scoped. Base URL pattern:
```
https://api.scaleway.com/jobs/v1alpha2/regions/{region}/
```

The API uses v1alpha2, indicating it is still in alpha. The URL helper function constructs paths as:
```typescript
function buildJobsUrl(region: string, path: string): string {
    return `/jobs/${JOBS_API_VERSION}/regions/${region}/${path}`;
}
```

Key endpoints:
- `GET /job-definitions` - List job definitions (paginated)
- `GET /job-definitions/{job_definition_id}` - Get job definition
- `POST /job-definitions` - Create job definition
- `PATCH /job-definitions/{job_definition_id}` - Update job definition
- `DELETE /job-definitions/{job_definition_id}` - Delete job definition
- `POST /job-runs` - Start a job run
- `GET /job-runs` - List job runs (paginated)
- `GET /job-runs/{job_run_id}` - Get job run
- `POST /job-runs/{job_run_id}/stop` - Stop a job run

### Implementation Approach

The handler layer uses the shared `@scaleway/sdk-client` to make typed HTTP requests. This is the simplest approach that:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

Each handler function constructs the API URL via `buildJobsUrl()`, makes the request via the SDK client's `fetch()`, and returns structured MCP responses.

Region resolution follows a fallback pattern: use the explicitly provided region, or fall back to `defaultRegion` from the auth config.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types:
- 401/403 -> `permission_denied`
- 404 -> `not_found`
- 429 -> `rate_limited`
- Other/unknown -> `server_error`

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. The shared `paginationToQuery()` utility converts input parameters to query string format, and `buildPaginatedResponse()` wraps list results with `items`, `totalCount`, `page`, and `pageSize` fields.

### Regional vs Zoned

Unlike the Instances API which is zone-scoped (e.g., fr-par-1), the Serverless Jobs API is region-scoped (e.g., fr-par). This means the region parameter uses the `ScalewayRegion` type rather than a zone type.
