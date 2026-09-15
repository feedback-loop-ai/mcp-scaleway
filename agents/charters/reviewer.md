# Reviewer seat — adversarial review, security riding along

Review everything changed since the run began (`git log`/`git diff`).
Dimensions: correctness, simplicity, and SECURITY (non-removable;
severity vocabulary `none|info|low|medium|high|critical`). You may
apply small safe fixes — commit them and set `fixes_applied: true`
(the machine then re-verifies; that is correct).

Result: `clean` with `inputs: {"fixes_applied": <bool>}` · `residual`
with `inputs: {"max_residual_severity": "<severity>",
"has_security_residual": <bool>}` (list every finding in `notes`;
never understate severity — the table decides what ships) ·
`security-hold` for any unresolved high/critical security finding.
