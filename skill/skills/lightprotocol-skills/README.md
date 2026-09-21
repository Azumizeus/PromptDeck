# Solana Agent Skills for rent-free development: light PDA, token and mint accounts, and compressed PDA.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-Compatible-green.svg)](https://agentskills.io)

### Capabilities
Light Token and ZK Compression allows you to build scalable Solana applications with rent-free token and mint accounts and PDA's.

| Metric                                |               Light | Standard Solana |
| ------------------------------------- | ------------------: | --------------: |
| **Mint Account**                      |   **\~0.00001 SOL** |    \~0.0015 SOL |
| **Token Account**                     |   **\~0.00001 SOL** |    \~0.0029 SOL |
| **PDA (100-byte)**                    | **\~0.0000115 SOL** |    \~0.0016 SOL |

* All light mint and token accounts are on-chain accounts like SPL, but the light token program sponsors the rent-exemption cost for you.
* Light-token accounts can hold balances from any light, SPL, or Token-2022 mint.
* Light-mint accounts represent a unique mint and optionally can store token-metadata. Functionally equivalent to SPL mints.
* Light-PDAs are Solana PDAs with sponsored rent-exemption and can be implemented with minimal code changes to your existing Solana program. Your program logic stays mostly untouched, which keeps audit overhead minimal.

### Skills by Use Case

If you're use case does not have a dedicated skill, start with the orchestrator: [skills/agent-dev-orchestrator](skills/agent-dev-orchestrator/)

```bash
npx skills add Lightprotocol/skills
```

> Find dedicated [prompts for agents here](prompts).

| Use case                                                                                                                                 | Skill                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Skill for payment flows using Light Token APIs for sponsored rent-exemption.                                                             | [payments](https://github.com/Lightprotocol/skills/tree/main/skills/payments)                     |
| For Solana program development with tokens and PDAs, Light is 200x cheaper than SPL/ Solana and has minimal code differences             | [light-sdk](https://github.com/Lightprotocol/skills/tree/main/skills/light-sdk)                   |
| For client development with tokens on Solana, Light Token is 200x cheaper than SPL and has minimal changes                               | [light-token-client](https://github.com/Lightprotocol/skills/tree/main/skills/light-token-client) |
| For data pipelines, aggregators, or indexers, real-time account state streaming on Solana with light account hot/cold lifecycle tracking | [data-streaming](https://github.com/Lightprotocol/skills/tree/main/skills/data-streaming)         |
| For token distribution on Solana 5000x cheaper than SPL (rewards, airdrops, depins, ...)                                                 | [token-distribution](https://github.com/Lightprotocol/skills/tree/main/skills/token-distribution) |
| For custom ZK Solana programs and privacy-preserving applications to prevent double spending                                             | [zk-nullifier](https://github.com/Lightprotocol/skills/tree/main/skills/zk-nullifier)             |
| For program development on Solana with infrequently accessed state, such as per-user state, DePIN registrations, ...                     | [solana-compression](https://github.com/Lightprotocol/skills/tree/main/skills/solana-compression) |
| For testing with Light Protocol programs and clients on localnet, devnet, and mainnet validation                                         | [testing](https://github.com/Lightprotocol/skills/tree/main/skills/testing)                       |
| For questions about compressed accounts, Light SDK, Solana development, Claude Code features, or agent skills                            | [ask-mcp](https://github.com/Lightprotocol/skills/tree/main/skills/ask-mcp)                       |

> For additional documentation, see: [zkcompression.com](https://www.zkcompression.com)
> For examples, see: [Lightprotocol/examples](https://github.com/Lightprotocol/examples)

### Recommended Workflow

1. **Clarify intent**
   * Recommend plan mode, if it's not activated
   * Use `AskUserQuestion` to resolve blind spots
   * All questions must be resolved before execution
2. **Identify references and skills**
   * Match task to available [skills](#defi) below
   * Locate relevant [documentation and examples](#documentation-and-examples)
3. **Write plan file** (YAML task format)
   * Use `AskUserQuestion` for anything unclear — never guess or assume
   * Identify blockers: permissions, dependencies, unknowns
   * Plan must be complete before execution begins
4. **Execute**
   * Use `Task` tool with subagents for parallel research
   * Subagents load skills via `Skill` tool
   * Track progress with `TodoWrite`
5. **When stuck**: spawn subagent with `Read`, `Glob`, `Grep`, DeepWiki MCP access and load `skills/ask-mcp`

## Installation 

These skills work with any AI agent. Pick your skills to install:

```
npx skills add Lightprotocol/skills
```

### Claude Code

Add the marketplace and install:

```
# install solana-rent-free-dev
/plugin marketplace add Lightprotocol/skills
```

All skills are included. Use them by name (`/light-sdk`, `/light-token-client`, `/testing`, etc.) or let Claude invoke them based on task context.

### OpenClaw

Install as a plugin (all 9 skills):

```bash
openclaw plugins install ./path/to/skills
```

Or install individual skills from [ClawHub](https://clawhub.ai/tilo-14/solana-rent-free-dev):

```bash
clawhub install solana-rent-free-dev
```

The plugin manifest is defined in [`openclaw.plugin.json`](openclaw.plugin.json).

### Cursor

1. Open Settings (**Cmd+Shift+J** / **Ctrl+Shift+J**)
2. Navigate to **Rules & Commands** → **Project Rules** → **Add Rule** → **Remote Rule (GitHub)**
3. Enter: `https://github.com/Lightprotocol/skills.git`

Skills are auto-discovered based on context. Ask about light-token, defi, payments, or program migration and the agent uses the relevant skill automatically.

## License

[MIT](LICENSE)

## Acknowledgments

Built on [Anthropic's Skills](https://github.com/anthropics/skills) and the [Agent Skills Specification](https://agentskills.io).

***

> For additional documentation, see: [https://www.zkcompression.com](https://www.zkcompression.com)
> For examples, see: [https://github.com/Lightprotocol/examples](https://github.com/Lightprotocol/examples)
