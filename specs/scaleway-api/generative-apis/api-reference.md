# Scaleway Generative APIs Reference (OpenAI-compatible)

Official reference: https://www.scaleway.com/en/developers/api/generative-apis/

Base URL: `https://api.scaleway.ai`

The model catalog is global at `https://api.scaleway.ai/v1/models`. Chat and
embedding requests use `https://api.scaleway.ai/{project_id}/v1/...`; `project_id`
comes from the optional tool input, otherwise `SCW_DEFAULT_PROJECT_ID`. The old
`region` input remains accepted for compatibility but does not select an inference
region. The serverless product does not provide that regional routing guarantee.
This replaces the previously unverified regional URL construction.

Sources checked 2026-09-19: [current OpenAPI](https://www.scaleway.com/en/developers/api/generative-apis/v1/schema.yml),
[project scoping and authentication](https://www.scaleway.com/en/docs/generative-apis/api-cli/using-generative-apis/).
Authenticated `GET /v1/models` succeeded with HTTP 200; no generation was performed.

## Authentication

- Header: `Authorization: Bearer <secret_key>` (Scaleway secret key / API key).
- Header: `Content-Type: application/json`.

## Endpoints

### List Models — `scaleway_generative_apis_list_models`
`GET /v1/models`
- Response: `{ object: "list", data: Model[] }`
- `Model`: `{ id, object: "model", created: number, owned_by }`

### Get Model — `scaleway_generative_apis_get_model`
`GET /v1/models` (client-side filter by `id`)
- There is no dedicated `GET /v1/models/{id}` in the OpenAI-compatible surface
  used here; the handler lists models and selects the one whose `id` matches
  `model_id`, returning `404`-style `not_found` if absent.
- Response: a single `Model`.

### Chat Completion — `scaleway_generative_apis_chat_completion`
`POST /{project_id}/v1/chat/completions`
- Body: `{ model, messages, temperature?, max_tokens?, max_completion_tokens?, top_p?, tools?, tool_choice?, parallel_tool_calls?, response_format?, reasoning_effort?, stream: false }`
  - System/user messages have string `content`.
  - Assistant messages have string content (optionally with an empty or nonempty
    `tool_calls` array), or nonempty `tool_calls` with omitted/`null` content.
  - Each tool call has `{ id, type: "function", function: { name, arguments: string } }`.
    Arguments are a JSON-encoded string, as returned by the upstream model.
  - Tool-result messages have `{ role: "tool", tool_call_id, content: string }`.
  - `tools` supplies up to 128 function definitions: `{ type: "function", function: { name,
    description?, parameters?: JSONSchema, strict?: boolean | null } }`.
    Definition and named-choice function names use 1-64 ASCII letters, digits,
    underscores, or dashes. Omitting `parameters` defines a parameterless function.
    Upstream currently ignores function `strict`, including `true`; callers must
    validate generated function arguments before execution.
  - `tool_choice`: `none`, `auto`, `required`, or `{ type: "function", function: { name } }`.
  - `parallel_tool_calls`: optional boolean, forwarded to Scaleway. Upstream currently
    ignores `false` and may return multiple function calls for supported models.
  - `response_format`: `{ type: "text" }`, `{ type: "json_object" }`, or
    `{ type: "json_schema", json_schema: { name, description?, schema, strict? } }`.
  - `reasoning_effort`: `none | low | medium | high`, subject to model support.
  - `max_completion_tokens` is the current positive-integer output limit, including
    reasoning tokens. When supplied, it takes precedence over legacy `max_tokens`
    (which otherwise retains its default of 512); only one limit is sent upstream.
- Response: `ChatCompletion`
  `{ id, object: "chat.completion", created, model, choices: { index, message, finish_reason }[], usage }`
  - `finish_reason`: `stop | length | content_filter | tool_calls | null`
  - `usage`: `{ prompt_tokens, completion_tokens, total_tokens }`
  - The handler preserves the full upstream response, including `reasoning_content`
    and optional `completion_tokens_details` / `prompt_tokens_details` breakdowns.

Function requests are returned to the caller; this operation does not execute them.
The caller executes authorized functions and sends their results in a subsequent
chat request. Use text response format for native tool calling: forcing a JSON
output schema can prevent native tool-call output for some models. Contracts:
`tests/contract/tools/generative-apis/tool-calling.contract.test.ts`.
Verified against https://www.scaleway.com/en/docs/generative-apis/api-cli/using-chat-api/
and https://www.scaleway.com/en/developers/api/generative-apis/v1/schema.yml on
2026-09-19. The schema's `FunctionObject` and `ParallelToolCalls` descriptions
specify the current `strict` and parallel-call limitations.

### Create Embedding — `scaleway_generative_apis_create_embedding`
`POST /{project_id}/v1/embeddings`
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
