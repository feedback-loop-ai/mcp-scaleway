# Scaleway Generative APIs Reference (OpenAI-compatible)

Official reference: https://www.scaleway.com/en/developers/api/generative-apis/

Base URL: `https://api.scaleway.ai`

The tools in `src/tools/generative-apis/` call the OpenAI-compatible Generative
APIs endpoint directly with `fetch` (not the Scaleway client). The
implementation targets the **regional** form of the base URL:
`https://api.scaleway.ai/{region}/v1/...` (default region `fr-par`). The
official reference documents `https://api.scaleway.ai/v1/...`; the region
segment is optional ("optional while there is only one region") and the regional
form is accepted.

## Authentication

- Header: `Authorization: Bearer <secret_key>` (Scaleway secret key / API key).
- Header: `Content-Type: application/json`.

## Endpoints

### List Models — `scaleway_generative_apis_list_models`
`GET /{region}/v1/models`
- Response: `{ object: "list", data: Model[] }`
- `Model`: `{ id, object: "model", created: number, owned_by }`

### Get Model — `scaleway_generative_apis_get_model`
`GET /{region}/v1/models` (client-side filter by `id`)
- There is no dedicated `GET /v1/models/{id}` in the OpenAI-compatible surface
  used here; the handler lists models and selects the one whose `id` matches
  `model_id`, returning `404`-style `not_found` if absent.
- Response: a single `Model`.

### Chat Completion — `scaleway_generative_apis_chat_completion`
`POST /{region}/v1/chat/completions`
- Body: `{ model, messages: { role, content }[], temperature?, max_tokens?, top_p?, stream: false }`
  - `role`: `system | user | assistant`
- Response: `ChatCompletion`
  `{ id, object: "chat.completion", created, model, choices: { index, message, finish_reason }[], usage }`
  - `finish_reason`: `stop | length | content_filter | null`
  - `usage`: `{ prompt_tokens, completion_tokens, total_tokens }`

### Create Embedding — `scaleway_generative_apis_create_embedding`
`POST /{region}/v1/embeddings`
- Body: `{ model, input: string | string[] }`
- Response: `{ object: "list", data: { object: "embedding", embedding: number[], index }[], model, usage: { prompt_tokens, total_tokens } }`

## Regions

Region is validated by the shared `ScalewayRegion` schema (e.g. `fr-par`,
`nl-ams`) and inserted as the first path segment. Defaults to `fr-par`.

## Error Codes
- 400: Invalid input (e.g. unknown model)
- 401 / 403: Permission denied (invalid API key / IAM permissions)
- 404: Not found (unknown model)
- 429: Rate limited
- 500: Server error

Errors are surfaced by reading the non-2xx response body and attaching the HTTP
`statusCode`, then mapped through the shared error mapper.

## Notes

- `stream` is always sent as `false`; streaming responses are not supported by
  these tools.
- This surface intentionally mirrors the OpenAI API so standard OpenAI client
  libraries work against the same base URL with a Scaleway secret key.
