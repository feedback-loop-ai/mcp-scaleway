#!/usr/bin/env bash
set -u
prompt_file="${1:-}"
brokkr="${2:-brokkr}"
[ -f "$prompt_file" ] || { echo "ship-seat: prompt file missing" >&2; exit 2; }
result_path=""; run_id=""; rule_id=""; journal=""; in_context=false
while IFS= read -r line; do
  trimmed="${line#"${line%%[![:space:]]*}"}"; trimmed="${trimmed%"${trimmed##*[![:space:]]}"}"
  if [ "$line" = '```json' ]; then in_context=true; continue
  elif [ "$in_context" = true ] && [ "$line" = '```' ]; then in_context=false; continue; fi
  case "$trimmed" in /*.json) result_path="$trimmed" ;; esac
  if [ "$in_context" = true ]; then
    case "$line" in
      '  "journal": '*) journal="$(printf '%s' "$line" | sed -n 's/^  "journal": "\([^"]*\)".*/\1/p')" ;;
      '  "run_id": '*) run_id="$(printf '%s' "$line" | sed -n 's/^  "run_id": "\([^"]*\)".*/\1/p')" ;;
      '    "rule_id": '*) rule_id="$(printf '%s' "$line" | sed -n 's/^    "rule_id": "\([^"]*\)".*/\1/p')" ;;
    esac
  fi
done < "$prompt_file"
[ -n "$result_path" ] && [ -n "$run_id" ] || { echo "ship-seat: prompt lacks result path or run id" >&2; exit 2; }
mkdir -p "$(dirname "$result_path")"
notes="$(dirname "$result_path")/ship-notes.$$"; trap 'rm -f "$notes"' EXIT
write_result() { awk -v result="$1" '
  function json(text,out,i,byte,c){for(i=1;i<=length(text);i++){c=substr(text,i,1);if(c=="\\")out=out "\\\\";else if(c=="\"")out=out "\\\"";else{for(byte=1;byte<32&&c!=sprintf("%c",byte);byte++){}out=out (byte<32?sprintf("\\u%04x",byte):c)}}return out}
  BEGIN{printf "{\"result\": \"%s\", \"notes\": \"",result}{if(NR>1)printf "\\n";printf "%s",json($0)}END{print "\"}"}' "$notes" > "$result_path"; }
ledger=".forge/ledger/$run_id.md"
if [ "$rule_id" != "SHIP-READY" ]; then
  [ -n "$journal" ] || { echo "ship-seat: prompt lacks journal path" >&2; exit 2; }
  dirty="$(git status --porcelain 2>&1 || true)"
  output="$("$brokkr" ledger --run "$run_id" --db "$journal" --repo . 2>&1)"; status=$?
  [ "$status" -eq 0 ] || { printf 'ship-seat: ledger generation failed: %s\n' "$output" >&2; exit "$status"; }
  if [ -n "$dirty" ]; then printf 'ledger written to %s; worktree discrepancy before close-out: %s' "$ledger" "$dirty" > "$notes"
  else printf 'ledger written to %s; review the recorded commits and evidence, then push and merge' "$ledger" > "$notes"; fi
  write_result ready; exit 0
fi
dirty="$(git status --porcelain 2>&1 || true)"; head="$(git rev-parse HEAD 2>&1 || true)"
recorded="$(sed -n 's/^Repository head: `\([^`]*\)`.*/\1/p' "$ledger" 2>/dev/null | head -n 1)"
if [ ! -f "$ledger" ]; then printf 'close-out discrepancy: ledger %s is missing' "$ledger" > "$notes"
elif [ -n "$dirty" ] && [ "$head" != "$recorded" ]; then printf 'close-out discrepancies: worktree is dirty (%s); HEAD is %s but ledger records %s' "$dirty" "$head" "$recorded" > "$notes"
elif [ -n "$dirty" ]; then printf 'close-out discrepancy: worktree is dirty (%s); HEAD still matches ledger at %s' "$dirty" "$head" > "$notes"
elif [ "$head" != "$recorded" ]; then printf 'close-out discrepancy: HEAD is %s but ledger records %s; worktree is clean' "$head" "$recorded" > "$notes"
else printf 'close-out confirmed at %s with a clean worktree; ledger %s records the delivery; review, push, and merge next' "$head" "$ledger" > "$notes"; fi
write_result shipped
