# 🧰 MY-SETUP — Ton installation personnelle des 190 agents

> **Ce fichier est le tien** : il décrit l'état *réel* de ta machine au 23 septembre 2026, avec les commandes de vérification prêtes à relancer. Le tuto générique reproductible de zéro est [TUTO.md](TUTO.md) — ce fichier, tu peux l'éditer librement (notes, alias, sections à ta main).

## Ma machine, en un coup d'œil

| Hôte | Emplacement | État vérifié le 23/09/2026 |
|---|---|---|
| OpenCode 1.17.18 | `~/.config/opencode/agents/` | ✅ 190 fichiers, 0 doublon, `name` = slug du fichier pour tous |
| Freebuff (user-scope) | `~/.agents/skills/` | ✅ 190 `agent-*` + 15 skills lifecycle = 205 dossiers, `name` = dossier pour tous |
| Claude Code | `~/.claude/agents/` | ✅ 190 fichiers (copies conformes du dépôt, catégories préservées) |

## ⚠️ Correction par rapport au mémo initial

Le mémo annonçait « `opencode agent list` → 192 subagents détectés ». **Vérification réelle : la commande TUI tronque sa sortie** (v1.17.18 : ~40 agents fichier + agents du `opencode.json` + builtins, sans message). Le bon critère de vérification est structurel, sur disque — voir ci-dessous. Le conflit `engineering-code-reviewer` → `code-reviewer` était réel et est corrigé dans les versions installées (OpenCode et Freebuff portent le `name` slugifié ; le dépôt source garde son frontmatter Claude d'origine).

---

## ✅ Vérifier l'installation OpenCode

```bash
# 1. Nombre de fichiers :
ls ~/.config/opencode/agents/*.md | wc -l          # attendu : 190

# 2. Intégrité structurelle complète :
node -e '
const fs=require("fs"),path=require("path");
const dir=process.env.HOME+"/.config/opencode/agents";
const files=fs.readdirSync(dir).filter(f=>f.endsWith(".md"));
let bad=[],names=new Set(),dupes=[];
for(const f of files){
  const src=fs.readFileSync(path.join(dir,f),"utf8");
  const m=src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if(!m){bad.push(f+":no-frontmatter");continue;}
  const name=(m[1].match(/^name:\s*(.+)$/m)||[])[1];
  const mode=(m[1].match(/^mode:\s*(.+)$/m)||[])[1];
  const desc=(m[1].match(/^description:\s*(.+)$/m)||[])[1];
  if(!name||!desc)bad.push(f+":missing-name-or-desc");
  if(mode!=="subagent")bad.push(f+":mode="+mode);
  const slug=f.replace(/\.md$/,"");
  if(name.trim()!==slug)bad.push(f+":name-mismatch("+name.trim()+")");
  if(names.has(name.trim()))dupes.push(name.trim());
  names.add(name.trim());
}
console.log("files:",files.length);
console.log("bad:",bad.length?bad.slice(0,5).join(", "):"none");
console.log("duplicate names:",dupes.length?dupes.join(","):"none");'
# attendu : files: 190 | bad: none | duplicate names: none

# 3. Un agent précis répond présent :
grep "^name:" ~/.config/opencode/agents/tokenomics-designer.md   # → name: tokenomics-designer
```

En session OpenCode : `@security-auditor`, `@tokenomics-designer`, etc.

<!-- ✏️ Notes personnelles OpenCode :
     - …
-->

---

## ✅ Vérifier l'installation Freebuff (user-scope `~/.agents/skills`)

```bash
# 1. Nombre de skills agents :
ls ~/.agents/skills/ | grep -c "^agent-"           # attendu : 190

# 2. Intégrité (chaque dossier a un SKILL.md ; name = nom du dossier) :
node -e '
const fs=require("fs"),path=require("path");
const dir=process.env.HOME+"/.agents/skills";
let missing=0, nameMismatch=[], empty=0;
for(const d of fs.readdirSync(dir)){
  const p=path.join(dir,d,"SKILL.md");
  if(!fs.existsSync(p)){missing++;continue;}
  const src=fs.readFileSync(p,"utf8");
  const m=src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const name=m&&((m[1].match(/^name:\s*(.+)$/m)||[])[1]||"").trim();
  if(!m||!name){empty++;continue;}
  if(name!==d)nameMismatch.push(d+"->"+name);
}
console.log("dirs:", fs.readdirSync(dir).length,
  "| missing SKILL.md:", missing,
  "| unparsable:", empty,
  "| name!=dir:", nameMismatch.length? nameMismatch.slice(0,3).join(",") : "none");'
# attendu : dirs: 205 | missing SKILL.md: 0 | unparsable: 0 | name!=dir: none
# (205 = 190 agents + 15 skills lifecycle du dépôt)
```

Côté Freebuff : les 15 skills lifecycle (`spec-driven-development`, `debugging-and-error-recovery`, …) vivaient déjà dans `~/.agents/skills/` — les 190 agents s'ajoutent au même endroit, même mécanisme.

<!-- ✏️ Notes personnelles Freebuff :
     - …
-->

---

## ✅ Vérifier l'installation Claude Code

```bash
find ~/.claude/agents/ -name "*.md" | wc -l        # attendu : 190
diff <(cd agents && find . -name "*.md" | sort) \
     <(cd ~/.claude/agents && find . -name "*.md" | sort)   # attendu : (vide)
```

---

## 🔁 Repartir de zéro (réinstaller proprement)

Les convertisseurs complets sont dans [TUTO.md](TUTO.md) (sections 1 et 2). Ordre recommandé :

1. Sauvegarder : `cp -r ~/.config/opencode/agents ~/.config/opencode/agents.bak && cp -r ~/.agents/skills ~/.agents/skills.bak`
2. Purger les agents générés (garder les skills lifecycle !) : `rm -rf ~/.config/opencode/agents && mkdir -p ~/.config/opencode/agents`
3. Relancer le convertisseur OpenCode (TUTO.md §1), puis le convertisseur Freebuff (TUTO.md §2)
4. Re-vérifier avec les blocs ci-dessus
5. Recopier Claude Code : `cp -r agents/. ~/.claude/agents/`

<!-- ✏️ Notes personnelles générales :
     - Alias favoris : …
     - Agents à désactiver : …
-->

---

## 📇 Catalogue

Le mémo des 190 agents par catégorie (rôle en français) est [`../AGENTS-CATALOGUE.md`](../AGENTS-CATALOGUE.md) — régénération : `node scripts/generate-agents-catalogue.js` (script dans le workspace parent, avec `agents-roles-fr.json`).

---

## 🔧 Fix appliqué : MCP tool listing timed out (résolu — OpenHands supprimé le 25/09/2026)

**Symptôme (historique)** : `MCP tool listing timed out after 30 seconds. MCP servers configured: helius, chrome-devtools` au démarrage de chaque conversation.

**Cause racine** : `npx` vit dans `~/.nvm/versions/node/v24.16.0/bin` (nvm), qui n'existe que via l'init du shell. L'app spawnait les serveurs MCP avec un PATH minimal (`/usr/bin:/bin:…`) sans nvm → `npx` introuvable → le listing d'outils pend puis timeout. Les serveurs eux-mêmes répondent en ~2 s (vérifié par handshake JSON-RPC manuel).

**Fix appliqué le 23/09/2026** (l'app a été désinstallée le 25/09, le wrapper `~/.openhands/mcp-npx-wrapper.sh` n'existe plus) :
1. Wrapper `~/.openhands/mcp-npx-wrapper.sh` qui ajoute le bin nvm au PATH puis `exec npx "$@"`. *(supprimé avec l'app le 25/09/2026)*
2. `~/.openhands/settings.json` → `agent_settings.mcp_config.{helius,chrome-devtools}.command` pointe vers le wrapper. *(supprimé avec l'app)*
3. `launchctl setenv PATH …nvm bin…:…` pour les apps GUI en général.

**Si le pattern revient avec une autre app GUI** : même cause, même remède — wrapper nvm + `launchctl setenv`. Test générique (l'exemple historique référençait le wrapper OpenHands, désormais supprimé) :
```bash
# Substitute le binaire à tester ; une réponse JSON = le pipeline est sain.
(echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"t","version":"1"}}}'; sleep 1) | env -i HOME="$HOME" npx -y <paquet-mcp> | head -c 80
# → une réponse JSON = le pipeline est sain ; sinon le problème est ailleurs (réseau/registre npm).
```
