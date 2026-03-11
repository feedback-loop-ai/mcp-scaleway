# Research: Scaleway Generative APIs MCP Tools

**Feature**: 030-generative-apis | **Date**: 2026-03-11

## Technology Decisions

### Scaleway Generative APIs Architecture

The Scaleway Generative APIs provide OpenAI-compatible endpoints for AI inference. Unlike most Scaleway APIs which use `@scaleway/sdk-client`, the Generative APIs use a dedicated base URL (`https://api.scaleway.ai`) and Bearer token authentication with the Scaleway secret key.

The API is region-scoped. Base URL pattern:
```
https://api.scaleway.ai/{region}/v1/
```

### API Endpoints

Key endpoints (OpenAI-compatible format):

- `GET /v1/models` - List available models (returns all models, no pagination)
- `POST /v1/chat/completions` - Create a chat completion
- `POST /v1/embeddings` - Create text embeddings

Note: There is no dedicated `GET /v1/models/{model_id}` endpoint. The get-model functionality is implemented via client-side filtering of the list models response.

### Authentication

Unlike other Scaleway APIs that use `X-Auth-Token`, the Generative APIs use Bearer token authentication:
```
Authorization: Bearer {SCW_SECRET_KEY}
```

The `loadAuthConfig()` function from `src/shared/auth.ts` provides the secret key. The handler constructs the Bearer header directly rather than using the shared SDK client.

### Implementation Approach

The implementation uses native `fetch()` directly rather than the `@scaleway/sdk-client` package. This is because:
1. The Generative APIs use a different base URL (`api.scaleway.ai` instead of `api.scaleway.com`)
2. The authentication scheme differs (Bearer token vs X-Auth-Token)
3. The API follows OpenAI format rather than the standard Scaleway API format

Each handler function:
1. Builds the region-scoped base URL
2. Constructs Bearer auth headers using the shared auth config
3. Makes the HTTP request via `fetch()`
4. Returns the response as structured MCP content

### Error Handling

Errors are handled consistently with the rest of the project using the shared `mapScalewayError` + `formatErrorResponse` pipeline from `src/shared/errors.ts`. HTTP errors are converted to Error objects with a `statusCode` property before being passed to the error mapper.

### Model Discovery

The list models endpoint returns all available models in a single response (no pagination). Each model has:
- `id`: String identifier (e.g., `meta/llama-3.1-8b-instruct:fp8`)
- `object`: Always `"model"`
- `created`: Unix timestamp
- `owned_by`: Organization name

### Chat Completions

The chat completions endpoint follows the OpenAI chat completions format:
- Messages array with role (system/user/assistant) and content
- Optional sampling parameters: temperature (0-2, default 0.7), max_tokens (default 512), top_p (0-1, default 1)
- Streaming is explicitly disabled (`stream: false`)
- Response includes choices with finish_reason and token usage statistics

### Embeddings

The embeddings endpoint accepts:
- A model ID for an embedding-capable model
- Input as either a single string or an array of strings
- Returns embedding vectors with usage statistics (prompt_tokens, total_tokens)
