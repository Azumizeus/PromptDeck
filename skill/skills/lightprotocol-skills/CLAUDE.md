# Agent Skills for Light Protocol

AI agent skills for rent-free Solana development using Light Protocol primitives.

## Structure

```
agent-skills/
├── skills/                      # 9 domain skills
│   ├── token-distribution/
│   ├── ask-mcp/
│   ├── data-streaming/
│   ├── light-sdk/
│   ├── light-token-client/
│   ├── solana-compression/
│   ├── payments/
│   ├── testing/
│   └── zk-nullifier/
├── scripts/                     # Utility scripts
│   └── sync-to-docs.sh
├── openclaw.plugin.json         # Plugin manifest
└── README.md
```

## Skills

| Name | Description |
|------|-------------|
| token-distribution | For token distribution on Solana 5000x cheaper than SPL (rewards, airdrops, depins, ...). @lightprotocol/compressed-token (TypeScript). Reference examples for custom claim support. |
| ask-mcp | For questions about compressed accounts, Light SDK, Solana development, Claude Code features, or agent skills. AI-powered answers grounded in repository context via DeepWiki MCP. |
| data-streaming | For data pipelines, aggregators, or indexers, real-time account state streaming on Solana with light account hot/cold lifecycle tracking. Stream Light token accounts, mint accounts, and PDAs via Laserstream gRPC. |
| light-sdk | For Solana program development with tokens and PDAs, Light is 200x cheaper than SPL/ Solana and has minimal code differences (e.g. for any Solana program and Defi such as AMMs, vaults, lending). Includes rent-free Light-PDAs, token accounts, and mints. Light SDK with Anchor or Pinocchio. Includes for Defi Router integration guide. Minimal program logic changes. |
| light-token-client | For client development with tokens on Solana, Light Token is 200x cheaper than SPL and has minimal changes. Skill includes guides for create mints, associated token accounts, transfer, approve, burn, wrap, and more. @lightprotocol/compressed-token (TypeScript) and light_token_client (Rust). |
| solana-compression | For program development on Solana for per-user state, DePIN registrations, or custom compressed accounts ~160x cheaper and without rent-exemption. Create, update, close, burn, and reinitialize compressed accounts. |
| payments | Skill for payment flows using Light Token APIs for sponsored rent-exemption. |
| testing | For testing with Light Protocol programs and clients on localnet, devnet, and mainnet validation. |
| zk-nullifier | For custom ZK Solana programs and privacy-preserving applications to prevent double spending. Guide to integrate rent-free nullifier PDAs for double-spend prevention. |

## Adding a New Skill

1. Create skill directory:
```bash
mkdir skills/your-skill-name
```

2. Create `skills/your-skill-name/SKILL.md` with frontmatter:
```markdown
---
name: your-skill-name
description: "One-line description of what this skill does"
---

# Your Skill Title

Instructions and workflow...
```

3. Add to `openclaw.plugin.json`:
```json
"skills": [
  "skills/your-skill-name"
]
```

4. Optional: Add `scripts/`, `references/`, `assets/` subdirectories as needed.

## Conventions

- SKILL.md frontmatter requires `name` and `description` fields
- Use sentence case for headings
- MIT license for all contributions
- Skills follow Agent Skills Specification (https://agentskills.io)
