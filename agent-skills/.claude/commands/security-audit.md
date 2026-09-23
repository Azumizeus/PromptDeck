---
description: Security audit or review — Cloudflare six-phase audit skill (guidance by default; full audit on explicit request)
---

Invoke the agent-skills:security-audit skill.

**Default: guidance mode.** For security questions, focused reviews, or vulnerability
triage, use only the relevant parts of the skill and do not create audit artifacts.

Run the complete six-phase workflow (reconnaissance → coverage-led hunting → candidate
validation → structured findings.json → independent verification → report) **only** if
the user explicitly requested a full audit or pen-test of the codebase, or asked for
report artifacts. In that case:

- Resolve the output directory per the skill (default `~/security-audit-skill/<repo>/run-<N>`,
  outside the target) and record `run-metadata.json` before any delegation.
- Follow the skill's sandbox rules (no external network, empty allowlisted environment,
  read-only target, explicit limits) — if the sandbox cannot be enforced, keep target
  code unexecuted and record `needs_validation` with the missing capability.
- Validate `findings.json` against `report-schema.json` with `validate-findings.cjs`,
  and validate coverage with `validate-coverage-ledger.cjs`, before reporting.
- Severity only on `confirmed` records; a `needs_validation` record carries its exact
  unresolved fact and no severity.

If the request is ambiguous between the two modes, ask one focused question before
creating files or starting the full workflow.

For a full audit, report the counts of confirmed / needs_validation / rejected records
and the coverage statement, with file references to the run artifacts.
