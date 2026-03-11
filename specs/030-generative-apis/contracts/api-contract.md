# Generative APIs - API Contract

## Base URL
`https://api.scaleway.ai/{region}`

## Authentication
Bearer token using `SCW_SECRET_KEY` in Authorization header.

## Endpoints

### GET /v1/models
List all available generative AI models.
- Response: `{ object: "list", data: Model[] }`
- Model: `{ id, object: "model", created, owned_by }`

### POST /v1/chat/completions
Create a chat completion (OpenAI-compatible).
- Request: `{ model, messages, temperature?, max_tokens?, top_p?, stream: false }`
- Response: `{ id, object: "chat.completion", created, model, choices, usage }`

### POST /v1/embeddings
Create text embeddings.
- Request: `{ model, input: string | string[] }`
- Response: `{ object: "list", data: EmbeddingData[], model, usage }`

## Error Codes
- 400: invalid_input
- 401/403: permission_denied
- 404: not_found
- 429: rate_limited
- 500: server_error
