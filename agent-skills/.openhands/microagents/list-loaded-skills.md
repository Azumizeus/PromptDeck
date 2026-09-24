---
name: list-loaded-skills
description: Startup inventory for the agent-skills repository. Always loaded at the start of every conversation; instructs the agent to list the skills available in this repository before acting on the user's request.
---

# Loaded Skills Inventory (agent-skills)

## Overview

This repository is **agent-skills**: a pack of engineering workflow skills stored
as `skills/<skill-name>/SKILL.md`, each with a `name` and `description` in its
YAML frontmatter. OpenHands advertises those name + description pairs in its
available-skills catalog at conversation start, then loads a full `SKILL.md` only
when its workflow matches the task.

## Required Startup Behavior

At the start of every conversation, before acting on the user's request:

1. List the directories under `skills/` (the workspace root of this repository).
2. For each directory, read only the frontmatter of
   `skills/<skill-name>/SKILL.md` — never the full body at this stage.
3. Print the inventory as:

   ```
   Loaded skills (N):
   - <name> — <first sentence of the description>
   ```

   where `N` is the number of skill directories found.
4. If `skills/` does not exist in the workspace, print instead:
   `agent-skills: no skills/ directory found in this workspace — no skills loaded.`
5. Then proceed with the user's request as normal.

## Rules

- List every skill. Do not truncate, group, or skip entries.
- Do not load full skill bodies while building the inventory — progressive
  disclosure is the point of the catalog.
- The inventory is informational: do not invoke any skill unless the user's task
  matches one. Skill routing itself stays native to OpenHands.
