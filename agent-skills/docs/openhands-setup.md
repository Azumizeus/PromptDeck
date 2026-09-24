# OpenHands Setup

This guide explains how to use Agent Skills with OpenHands. The reusable assets are the markdown skills in the `skills/` directory; the root `AGENTS.md` in this repository is repo-scoped and should not be copied into other projects.

## Overview

OpenHands supports the Agent Skills specification natively: it advertises each skill's `name` and `description` in an available-skills catalog, then loads the full `SKILL.md` only when the task matches (progressive disclosure). No conversion is needed — the same `skills/<name>/SKILL.md` files that Claude Code and Codex consume work as-is.

This repository also ships OpenHands-specific extras:

- `.openhands/microagents/list-loaded-skills.md` — an **always-loaded microagent** that makes the agent print the inventory of loaded skills at the start of every conversation (see [Startup skill inventory](#startup-skill-inventory)).
- `.openhands/microagents/route-*.md` — nine **keyword-triggered generated routers**: six lifecycle routers (`route-spec`, `route-plan`, `route-build`, `route-bug`, `route-review`, `route-ship`, one per AGENTS.md phase) plus three specialty routers (`route-solana`, `route-game`, `route-security`) covering the nested packs (`solana-protocols/`, `game-design/`, and the security skills). All are generated from the skills' own descriptions by `scripts/generate-openhands-routers.js` (see [Lifecycle routing microagents](#lifecycle-routing-microagents)).

## Install

Use the `skills` CLI, or clone and copy the directories you need.

```bash
npx skills add addyosmani/agent-skills            # install all skills
npx skills add addyosmani/agent-skills --list     # browse before installing
```

OpenHands discovers skills from (in precedence order):

| Scope | Location |
|---|---|
| Project skills | `<project>/.agents/skills/` (and legacy `.openhands/skills/`, `.openhands/microagents/`) |
| User skills | `~/.agents/skills/` |
| Repository context | `<repository>/AGENTS.md` |

If the `skills` CLI lands the files somewhere OpenHands does not scan, copy or symlink them into `.agents/skills/`:

```bash
mkdir -p .agents/skills
cp -r /path/to/agent-skills/skills/<skill-name> .agents/skills/
```

> **Note:** Per-skill installs copy only the skill directory itself. If a skill references shared files under `references/`, copy those into the installed skill directory or install the whole pack. See [#361](https://github.com/addyosmani/agent-skills/issues/361) for background.

## What to copy

- **Skills:** the directories under `skills/` (for example `skills/spec-driven-development/`). Each must contain a `SKILL.md` with `name` and `description` frontmatter — both fields are required by OpenHands for portable Agent Skills.
- **Startup inventory microagent:** `.openhands/microagents/` (see below).
- Do **not** copy the repository's root `AGENTS.md` or `CLAUDE.md`; those files configure development of this repository itself.

## Startup skill inventory

`.openhands/microagents/list-loaded-skills.md` is an OpenHands microagent **without a `triggers` field**, which OpenHands semantics define as *always loaded in full at the start of every conversation*. It instructs the agent to:

1. List the directories under `skills/` in the workspace.
2. Read only each `SKILL.md` frontmatter (name + description) — never the full body.
3. Print `Loaded skills (N):` followed by one line per skill, then proceed with the user's request.

Copy it into your project when you install the pack:

```bash
mkdir -p .openhands/microagents
cp /path/to/agent-skills/.openhands/microagents/*.md .openhands/microagents/
```

Start a new conversation after adding it; OpenHands rebuilds the skill catalog per conversation. The listing is informational — it does not change routing, and it must not be confused with `using-agent-skills`: do not paste that meta-skill's full body into `AGENTS.md` on OpenHands, which already routes skills natively.

You can add your own always-loaded microagents next to it (repository conventions, runbook links, …). Keyword-triggered microagents (`triggers:` in frontmatter) also work in the same directory; they load only when a trigger word appears in a user message.

## Lifecycle routing microagents

Six generated lifecycle microagents wire the pack's lifecycle skills into OpenHands keyword activation — one per AGENTS.md lifecycle phase — and three specialty microagents route the nested packs:

| Microagent | Phase | Routes to | Trigger sources |
|---|---|---|---|
| `route-spec.md` | `DEFINE` | `spec-driven-development` | description tokens + curated extras (spec, feature, new project, prd) |
| `route-plan.md` | `PLAN` | `planning-and-task-breakdown` | description tokens + extras (plan, breakdown, decompose) |
| `route-build.md` | `BUILD` | `incremental-implementation` + `test-driven-development` | description tokens + extras (build, code, implement, tests) |
| `route-bug.md` | `VERIFY` | `debugging-and-error-recovery` | description tokens + extras (bug, broken, crash, fails, error) |
| `route-review.md` | `REVIEW` | `code-review-and-quality` + `security-audit` | description tokens + extras (review, audit, pull request) |
| `route-ship.md` | `SHIP` | `shipping-and-launch` + `ci-cd-and-automation` | description tokens + extras (ship, deploy, release, rollout) |
| `route-solana.md` | — (`microagent-only`) | `solana-protocols/birdeye` + `jupiter` + `metaplex` + `vulnhunter` | nested-pack descriptions + extras (solana, jupiter, spl, devnet) |
| `route-game.md` | — (`microagent-only`) | `game-design/game-audio-direction` + `motion-design-system` + `visual-rendering-game-feel` | nested-pack descriptions + extras (game, sprites, pixel art) |
| `route-security.md` | — (`microagent-only`) | `security-audit` + `security-and-hardening` | description tokens + extras (pentest, vulnerability, owasp) |

The routers are **not hand-maintained**: `scripts/generate-openhands-routers.js` derives their trigger words from the primary routing skill's own `SKILL.md` description, ranked by the eval tier's TF-IDF idf (distinctive words first), merges curated extra triggers, and renders deterministic bodies. When a skill description changes vocabulary, regenerate — a `--check` mode runs in CI and fails when the checked-in routers drift:

```bash
node scripts/generate-openhands-routers.js           # regenerate all nine routers
node scripts/generate-openhands-routers.js --check   # CI mode: fail on drift
```

Trigger tuning lives in the generator's `PHASE_ROUTERS` / `SPECIALTY_ROUTERS` config (`extraTriggers`, `denyTokens`), never in the generated files. Generation refuses ambiguous words: a candidate that substring-matches a corpus word (`spec` ⊂ `unspecified`) is dropped, because real OpenHands keyword matching is substring-based. The idf ranking runs over the **full catalog** (top-level + nested packs), so words common in a nested pack are not mistaken for rare distinctive vocabulary.

Each router's body tells the agent which `skills/<name>/SKILL.md` to load before acting — the skill body still drives the actual workflow; the microagent only accelerates discovery. The frontmatter `phase` field ties each router to the same lifecycle phase the root `AGENTS.md` maps (VERIFY → `debugging-and-error-recovery`, and so on), so the OpenHands adapter and the OpenCode instructions can never silently diverge.

Guardrails enforced by `scripts/validate-openhands-microagent.js`:

- Every triggered microagent needs a non-empty trigger list of plain words, and its body must reference at least one existing `skills/<name>/SKILL.md`.
- Each triggered microagent must declare a `phase` that appears in AGENTS.md's Lifecycle Mapping section and route to one of that phase's skills (or declare `microagent-only: true` to opt out explicitly).
- Microagent names must be unique among themselves and must not duplicate a `skills/<name>/` directory: OpenHands resolves name conflicts by precedence, not merging, so a collision silently hides one of the two.

The startup inventory stays trigger-free by design: it must load on every conversation, while the routers load on demand.

## Verifying the behavior without OpenHands

`scripts/openhands-loader-sim.js` replays conversation start against the real repo content: it loads the always-loaded microagents in full, builds the skill inventory from `skills/` frontmatter exactly as `list-loaded-skills.md` instructs, and replays sample user messages through **two routing layers**:

1. **Keyword routing** — OpenHands trigger semantics: a router fires when a trigger word appears in the message (word-boundary matching in the simulator).
2. **Description routing** — the host's native fallback when no trigger matches: the simulator ranks all skill descriptions against the message with the **same TF-IDF engine the deterministic eval tier runs** (`run-evals.js`'s `buildCorpus`/`rankSkills`, imported — not forked) and fires every router owning a top-3 ranked skill.

```bash
node scripts/openhands-loader-sim.js       # Simulation PASSED — inventory prints, routers fire on the right messages only
node scripts/validate-openhands-microagent.js
node scripts/generate-openhands-routers.js --check
```

All three run in CI (`.github/workflows/test-plugin-install.yml`), along with their unit tests (`scripts/openhands-loader-sim-test.js`, `scripts/generate-openhands-routers-test.js`, `scripts/validate-openhands-microagent-test.js`). The simulator's sample messages deliberately use vocabulary a user would type rather than the trigger list verbatim, mirroring the eval-suite principle that copied prompts prove nothing. Adjacent skills legitimately co-fire under description routing (a failing-test message also ranks `test-driven-development` top-2); such overlaps are recorded in the expected results, not suppressed.

## How it works

- `.agents/skills/<name>/SKILL.md` — OpenHands advertises `name` + `description`, and loads the body only when the task matches the description. Write descriptions that say both what the skill does and when it applies.
- `.openhands/microagents/list-loaded-skills.md` — always-loaded microagent providing the startup inventory behavior described above.
- `.openhands/microagents/route-*.md` — generated keyword-triggered lifecycle and specialty routers (see above).
- `scripts/generate-openhands-routers.js` — regenerates the routers from skill descriptions via the eval tier's TF-IDF; `--check` mode fails CI on drift. CI also auto-regenerates and auto-commits the diff when a push changes skill descriptions (`.github/workflows/test-plugin-install.yml`, `regenerate-routers` job).
- `scripts/validate-openhands-microagent.js` — CI guard: the inventory microagent must exist and must stay trigger-free (a `triggers` field would silently turn the always-loaded startup listing into an on-demand keyword skill); triggered microagents must have valid triggers, route to existing skills, and stay coherent with AGENTS.md lifecycle phases.
- `scripts/openhands-loader-sim.js` — end-to-end dry run of conversation start (inventory + keyword routing + TF-IDF description routing) without launching OpenHands.
- `scripts/build-openhands-dashboard.js` — rebuilds `interface/openhands-dashboard.html` and `interface/openhands-dashboard-data.json` from the template plus a fresh snapshot (full skill catalog + all microagents), keeping the browser views in sync with the repo.

## Usage examples

- "Add authentication to this app" → OpenHands advertises the catalog, the inventory prints at conversation start, and `spec-driven-development` is invoked when the task matches its description.
- "Fix this 500 error" → `route-bug` fires on "error", injecting a pointer to the `debugging-and-error-recovery` skill, which OpenHands then loads.
- "Review this PR" → `route-review` fires on "review"/"PR" and points at `code-review-and-quality`.

The printed inventory is a map of what is available; OpenHands still selects skills by description match, and the triggered routers only shortcut discovery for keyword matches.

## Regenerating everything (skills changed)

After adding or editing a skill, resync every generated surface from the repo root:

```bash
python3 build-interface.py                        # catalog: interface/catalog-full.js + launcher sync
node scripts/generate-openhands-routers.js        # .openhands/microagents/route-*.md (idempotent)
node scripts/build-openhands-dashboard.js         # interface/openhands-dashboard.html + -data.json (+ teamCombos)
node scripts/build-openhands-panel.js             # MG_OPENHANDS + MG_TEAMS into both Tampermonkey userscripts
node scripts/build-agents-multi-prompt.js --inject # .agents-combo.json + AGENTS_COMBO into the launcher
node --test scripts/*-test.js                      # full suite must stay green
```

## Desktop app (MEGA PACK.app) — build & refresh

The menu-bar app is built from `menubar-app-luxe/` (Electron). Rebuild after changing its sources:

```bash
bash menubar-app-luxe/build-app.sh        # dist/MEGA PACK.app (+ embedded catalog, ad-hoc signed)
```

Refresh the installed app in one command:

```bash
./scripts/sync-app.sh                     # copy interface/catalog-full.js into /Applications app, re-sign, relaunch
./scripts/sync-app.sh full                # replace the whole app from menubar-app-luxe/dist/ + fresh catalog
./scripts/sync-app.sh --rebuild           # build-app.sh first, then full deploy
```

Notes:
- Replacing any file inside a signed .app invalidates the seal → `sync-app.sh` re-signs (ad-hoc, root only — never `--deep`, it corrupts the main binary stub).
- `build-app.sh` refuses to build if any `.html` references a local script missing from the bundle (this bug once shipped an app without `theme.js`, i.e. a fully transparent window: the window is `transparent: true` and all styling comes from that injected CSS).

## Auditing installed skill locations

`scripts/audit-skill-locations.js` compares the 6 install locations (OpenHands hub, `~/.agents/skills`, `~/.openhands/skills`, `~/.claude/skills`, `~/.config/opencode/skills`, Freebuff source) against the repo and reports per location: present / missing / content drift / unknown extras. Agents installed under `agent-*` directories are compared by frontmatter `description` (the installers rewrite `name`/`triggers`).

```bash
node scripts/audit-skill-locations.js           # human-readable report + summary
node scripts/audit-skill-locations.js --json    # machine-readable
node scripts/audit-skill-locations.js --loc claude
```

## Propagating the repo to install locations

`scripts/sync-skill-locations.js` installs what the audit reports as missing and repairs content drift, honoring each host's conventions (shared model in `scripts/lib/skill-locations.js` — audit and sync cannot diverge):

```bash
node scripts/sync-skill-locations.js            # plan only — nothing is written
node scripts/sync-skill-locations.js apply      # execute the plan
node scripts/sync-skill-locations.js --loc claude apply --with-agents
```

Rules:
- Missing skill → the whole skill directory is copied (SKILL.md + `references/`).
- Drifted skill → directory re-copied (fixes stale CRLF copies, pre-renaming versions…).
- Missing agent → `agent-<name>/SKILL.md` conversion: repo `description` verbatim, `name`/`triggers` regenerated (tokens of ≤2 chars like `zk` never become triggers).
- Drifted agent → only the frontmatter `description:` line is realigned on the repo.
- Host conventions: agents are installed only where agents already exist (the hub is skills-only). Force with `--with-agents`.
- Extras (skills/agents unknown to the repo) and the partial Freebuff source are never touched; an absent target directory is initialized (first deployment).

## Skill naming rule (folder name = frontmatter name)

Two repo skills used to share a basename while being different skills (`metaplex` vs `metaplex-protocol`, `zk-compression-light` vs `solana-compression`), which broke flat-name installs. The folders now follow their frontmatter `name`. When importing a skill whose folder name differs from its frontmatter `name`, rename the folder first — generated surfaces (catalog, routers, dashboard, panels) all key on the folder basename.

## Team presets (multi-agent combos)

`scripts/build-agents-multi-prompt.js` generates named persona combinations (2..N agents, ranked by category diversity) into `.agents-combo.json`, embedded in three surfaces:

- **Launcher** (`mega-pack-launcher.html`): Agents tab → « Équipes sauvegardées » — fire a team prompt for the selected host, or save your own selection as a team (persisted in localStorage).
- **OpenHands dashboard** (`openhands-dashboard.html`): Activation view → « 👥 Équipes » tab — one click copies the combined persona prompt.
- **Tampermonkey panels** (`mega-pack-panel*.user.js`): OpenHands tab lists generated teams (`MG_TEAMS`) alongside the routers; click injects the team prompt.

## Limitations

- The startup inventory lists what is on disk in the workspace; skills installed at user scope (`~/.agents/skills/`) are not under `skills/` and are not listed.
- The inventory costs one frontmatter read per skill at conversation start; with the full 133-skill pack that is a bounded, small read per conversation.
- Trigger matching is the simulator's word-boundary approximation of OpenHands's keyword injection; real OpenHands may tokenize slightly differently, which is why router bodies always name the skill file explicitly.
- Other Agent Skills clients may ignore `.openhands/microagents/` entirely — the behavior is an OpenHands extension.
