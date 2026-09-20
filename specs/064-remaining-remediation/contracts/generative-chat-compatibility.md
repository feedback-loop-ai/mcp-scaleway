# Conditional assistant content compatibility

Specified before overlay generation, 2026-09-20.

The recorded Generative APIs OpenAPI source types assistant `content` as string.
Scaleway's current [function-calling guide](https://www.scaleway.com/en/docs/generative-apis/how-to/use-function-calling/)
explicitly constructs assistant request messages with `content: None` and a tool
call. Its [compatibility guide](https://www.scaleway.com/en/docs/generative-apis/reference-content/openai-compatibility/)
states that the Chat Completions API supports OpenAI-compatible tool use.

A separate `generative-apis-compat` document retains the pinned base chat route and
referenced components. It represents the documented request-message pattern and a
bounded compatibility inference for assistant response messages: content may be
null or omitted only when a nonempty array of structurally valid function calls is
present. Each such call has an ID, type=function, a function name and string JSON
arguments. Otherwise content must be a string. Request messages taking the tool-call
branch must have role=assistant. Existing source constraints and additional valid
fields remain in force. Text messages with an empty call array remain valid.

The source record identifies this as a documented compatibility overlay, preserves
the exact documentation digest and the base OpenAPI source/digest, and never replaces
the primary source. This is not a claim that a live Scaleway response with null
content has been observed. Offline round-trip tests verify that the bounded adapter
accepts the supported representation and rejects null/missing content without calls
or malformed call data. No model invocation is needed to test the adapter.
