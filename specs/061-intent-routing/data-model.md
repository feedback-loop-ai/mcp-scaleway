# Routing data model

- **Operation**: existing registry record; stable operation ID, area, description,
  endpoint, read-only classification, input schema and callback. Callback/credentials
  are never part of a provider choice.
- **DecisionProvider**: chooses among a supplied map of IDs and descriptions given
  text state, a question, and cancellation signal.
- **Decision**: selected ID, probability distribution and confidence; optional
  model/usage metadata if supplied. Returned IDs must belong to the question.
- **RouteInput**: bounded intent, optional bounded context, optional result limit.
- **RouteResult**: matched, ambiguous, unsupported, needs_plan or unavailable;
  candidates with operation ID, area, description, read-only flag, required fields
  and optional probability; catalog fingerprint and uncalibrated-threshold marker.
  Source is provider or local. Provider results use probabilityScope selected_areas;
  local results use not_applicable and omit probability/confidence. Local candidates
  are ambiguous; no local candidates means unavailable. Reasons distinguish
  provider_not_configured, provider_unavailable, catalog_capacity and cancelled.
  Cancellation has no fallback or candidates. Provider-call count and optional model
  and usage receipts describe inference activity; completed-stage receipts may remain
  when a later provider failure triggers local fallback.
- **EvaluationCase**: input, optional configured filters, acceptable operation IDs
  and expected routing outcome. Cases contain synthetic context only.
- **EvaluationReport**: per-method metrics and rows, including original case inputs,
  candidate IDs/details, source, confidence, reason, catalog fingerprint and
  calibration/scope. Records the fixture hash and effective candidate limit,
  thresholds, deadline, endpoint and requested model without provider credentials.
  Local fallback is counted separately and makes an explicit live evaluation fail.

Routing results are advisory. Local word/alias matching is English-oriented and
does not establish semantic equivalence or calibrated scores. The registry remains
authoritative at execution time.
