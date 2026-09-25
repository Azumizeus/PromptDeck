# 📚 TUTO — Installer les 190 agents spécialistes sur tes 3 hôtes

> Tutoriel officiel, reproductible de zéro sur une machine neuve.
> Les chiffres et commandes ont été **vérifiés en conditions réelles** le 23 septembre 2026 (voir [MY-SETUP.md](MY-SETUP.md) pour l'état de ta machine).

## Ce que tu obtiens à la fin

| Hôte | Emplacement | Format | Nombre | Invocation |
|---|---|---|---|---|
| **OpenCode** | `~/.config/opencode/agents/` | subagent markdown (`mode: subagent`) | 190 | `@nom-de-l-agent` en session |
| **OpenHands + Freebuff** | `~/.agents/skills/agent-<nom>/SKILL.md` | Agent Skills (standard commun) | 190 | déclencheurs mots-clés + description |
| **Claude Code** | `~/.claude/agents/` | subagent natif (`name`, `description`) | 190 | Task tool, `subagent_type: nom` |

Les 190 fichiers source vivent dans [`agents/`](agents/) de ce dépôt (15 catégories : Core 4, Academic 5, Design 8, Engineering 29, Finance 5, Game Development 21, Marketing 30, Paid Media 7, Product 5, Project Management 6, Sales 8, Spatial Computing 6, Specialized 42, Support 6, Testing 8).

---

## Prérequis

```bash
# Répertoire du dépôt cloné :
cd agent-skills

# Vérifier la source :
find agents/ -name "*.md" | wc -l        # → 190
```

---

## 1. OpenCode — `~/.config/opencode/agents/` (190 subagents)

OpenCode charge chaque `.md` de `~/.config/opencode/agents/` comme agent. Le format attendu est **différent du format Claude** : les champs `color`, `emoji`, `vibe`, `tools`, `model` du format Claude sont **invalides** et doivent être retirés ; il faut ajouter `mode: subagent`.

### Format cible

```markdown
---
name: tokenomics-designer
mode: subagent
description: Expert en design de tokenomics pour crypto-games… (description conservée telle quelle)
---

# Tokenomics Designer — …
(corps du fichier source inchangé)
```

**Règle importante :** `name` = nom du fichier sans `.md`, slugifié en minuscules-tirets. Un `name` qui ne correspond pas au fichier ou qui duplique un autre agent écrase silencieusement celui-ci (voir [Le piège du conflit de nom](#le-piège-du-conflit-de-nom)).

### Conversion en une commande

Le convertisseur lit chaque fiche de `agents/`, retire les champs Claude, slugifie le `name` et écrit dans `~/.config/opencode/agents/` :

```bash
mkdir -p ~/.config/opencode/agents
node -e '
const fs=require("fs"),path=require("path");
const SRC="agents", DST=process.env.HOME+"/.config/opencode/agents";
const slug=s=>s.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
let n=0;
function convert(dir){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(e.isDirectory())convert(path.join(dir,e.name));   // packs imbriqués (game-development/unity, …)
    else if(e.name.endsWith(".md")){
      const f=e.name;
      const raw=fs.readFileSync(path.join(dir,f),"utf8");
      const m=raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if(!m)continue;
      const lines=m[1].split("\n").filter(l=>!/^(color|emoji|vibe|tools|model):/i.test(l));
      const name=slug(f.replace(/\.md$/,""));
      let fm=lines.join("\n");
      if(/^name:/m.test(fm))fm=fm.replace(/^name:.*$/m,"name: "+name);
      else fm="name: "+name+"\n"+fm;
      if(!/^mode:/m.test(fm))fm+="\nmode: subagent";
      fs.writeFileSync(path.join(DST,f),"---\n"+fm.replace(/^\n/,"")+"\n---"+raw.slice(m[0].length));
      n++;
    }
  }
}
convert(SRC);   // parcours récursif : racine + catégories + packs imbriqués (unity, unreal-engine, …)
console.log("convertis :",n);'
# → convertis : 190
```

### Vérification

```bash
opencode agent list          # liste les agents chargés (sortie TUI tronquée, voir note)
opencode agent list 2>&1 | grep -c "(subagent)"   # occurrences affichées
```

> **Note honnête sur `opencode agent list`** : la sortie TUI **tronque l'affichage** (constaté en v1.17.18 : seuls ~40 agents fichier + les agents du `opencode.json` + les builtins `build/plan/explore/general/…` apparaissent, sans message d'erreur). Ce n'est **pas** un échec de chargement : un décompte fiable se fait sur disque, pas sur la liste TUI :
>
> ```bash
> ls ~/.config/opencode/agents/*.md | wc -l        # → 190
> # intégrité structurelle (name === fichier, mode: subagent, zéro doublon) :
> ```

Le test d'intégrité complet (frontmatter `name`+`mode`+`description`, unicité des noms, name = slug du fichier) est donné dans [MY-SETUP.md](MY-SETUP.md#vérifier-linstallation-opencode) — sur l'installation actuelle il rend `bad: none, duplicate names: none` pour les 190 fichiers.

### Utilisation en session

```
@security-auditor Peux-tu auditer ce module d'authentification ?
@tokenomics-designer Concevoir l'économie de token de mon jeu Solana
```

---

## 2. OpenHands + Freebuff — `~/.agents/skills/agent-<nom>/SKILL.md` (190 skills)

OpenHands et Freebuff lisent tous deux le répertoire user-scope `~/.agents/skills/` au format **Agent Skills** (le même standard que les skills de ce dépôt). Chaque agent devient un dossier `agent-<nom>/` contenant un `SKILL.md`.

### Format cible

```markdown
---
name: agent-tokenomics-designer
description: Expert en design de tokenomics… (description conservée)
triggers:
  - tokenomics
  - designer
---

(corps du fichier source inchangé)
```

Règles : `name` = `agent-` + nom du dossier (règle OpenHands : `name` = dossier) ; `triggers` = mots distinctifs du nom, pour l'activation rapide sans attendre le routage par description.

### Conversion en une commande

```bash
node -e '
const fs=require("fs"),path=require("path");
const SRC="agents", DST=process.env.HOME+"/.agents/skills";
const slug=s=>s.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
let n=0;
function install(dir){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(e.isDirectory())install(path.join(dir,e.name));   // packs imbriqués (game-development/unity, …)
    else if(e.name.endsWith(".md")){
      const f=e.name;
      const raw=fs.readFileSync(path.join(dir,f),"utf8");
      const m=raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const desc=m?((m[1].match(/^description:\s*(.+)$/m)||[])[1]||""):"";
      const slugName=slug(f.replace(/\.md$/,""));
      const name="agent-"+slugName;
      const triggers=[...new Set(slugName.split("-").filter(t=>t.length>2&&!["and","the","for"].includes(t)))];
      const outDir=path.join(DST,name);
      fs.mkdirSync(outDir,{recursive:true});
      const body=raw.replace(/^---\r?\n[\s\S]*?\r?\n---/,"").trim();
      fs.writeFileSync(path.join(outDir,"SKILL.md"),
        "---\nname: "+name+"\ndescription: "+desc+"\ntriggers:\n"+triggers.map(t=>"  - "+t).join("\n")+"\n---\n\n"+body+"\n");
      n++;
    }
  }
}
install(SRC);   // parcours récursif : racine + catégories + packs imbriqués (unity, unreal-engine, …)
console.log("installés :",n);'
# → installés : 190
```

### Vérification

```bash
ls ~/.agents/skills/ | grep -c "^agent-"     # → 190
# intégrité : chaque dossier a un SKILL.md dont name = nom du dossier
```

Le script d'intégrité complet est dans [MY-SETUP.md](MY-SETUP.md#vérifier-linstallation-openhands--freebuff) — sur l'installation actuelle : `dirs: 205 | missing SKILL.md: 0 | unparsable: 0 | name!=dir: none` (205 = 190 agents + 15 skills lifecycle du dépôt).

### Utilisation

Rien à invoquer manuellement : OpenHands charge les skills quand ta demande correspond aux `triggers` ou à la `description`. « Audite la sécurité de ce contrat » activera `agent-security-auditor` ; « conçois la tokenomics de mon jeu » activera `agent-tokenomics-designer`.

---

## 3. Claude Code — `~/.claude/agents/` (190 subagents natifs)

Le format source de [`agents/`](agents/) **est** le format Claude Code : une copie suffit.

```bash
mkdir -p ~/.claude/agents
cp -r agents/. ~/.claude/agents/
find ~/.claude/agents/ -name "*.md" | wc -l   # → 190
```

Les sous-dossiers de catégorie (`academic/`, `engineering/`, …) sont préservés et acceptés. Invocation : le Task tool liste les subagents par leur `name` frontmatter (`code-reviewer`, `security-auditor`, …) — les corps sont invoqués via `subagent_type`.

> Les 4 agents Core (`code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor`) existent aussi en versions spécialisées sous `engineering/` etc. Leurs `name` diffèrent (`engineering-code-reviewer` après conversion), donc aucune collision.

---

## Le piège du conflit de nom

OpenCode et OpenHands résolvent les collisions de `name` **par précédence, sans fusion ni avertissement** : un agent écrase silencieusement l'autre.

Cas réel rencontré : `agents/engineering/engineering-code-reviewer.md` déclarait `name: Code Reviewer` — en slugifiant, il devenait `code-reviewer` et **écrasait le core `code-reviewer.md`**. Symptôme : le core disparaissait de `opencode agent list`.

**Prévention** (déjà appliquée aux convertisseurs ci-dessus) : `name` = slug du nom de fichier. Deux fichiers ne pouvant pas porter le même nom, aucune collision n'est possible. Si tu écris des agents à la main, applique la même règle.

Vérification anti-doublon :

```bash
grep -h "^name:" ~/.config/opencode/agents/*.md | sort | uniq -d
# → (vide) = aucun doublon
```

---

## 📇 Le mémo catalogue : AGENTS-CATALOGUE.md

[`AGENTS-CATALOGUE.md`](../AGENTS-CATALOGUE.md) (généré) liste les 190 agents par catégorie, chacun avec son rôle (1ʳᵉ phrase de sa `description`, traduite en français via `scripts/agents-roles-fr.json`), plus les emplacements d'installation et le mode d'invocation par hôte.

Régénérer après ajout/modification d'agents :

```bash
node scripts/generate-agents-catalogue.js           # régénère
node scripts/generate-agents-catalogue.js --check   # vérifie sans écrire (CI)
node scripts/generate-agents-catalogue.js --extract # exporte les rôles EN à traduire
```

> Dans ce dépôt le script n'est pas encore intégré au `scripts/` tracké — il vit dans le workspace parent avec `agents-roles-fr.json`. Copie les deux dans `scripts/` du dépôt pour l'officialiser.

---

## Dépannage

| Symptôme | Cause probable | Fix |
|---|---|---|
| Un agent n'apparaît pas dans `opencode agent list` | Troncature TUI (normale) | Compter sur disque + test d'intégrité structurelle |
| Un agent core a disparu | Doublon de `name` | `grep -h "^name:" …/agents/*.md \| sort \| uniq -d` |
| L'agent OpenHands ne s'active pas | `triggers` absents ou description vague | Ajouter des `triggers` distinctifs ; soigner la 1ʳᵉ phrase |
| Freebuff ne voit pas une skill | Dossier sans `SKILL.md`, ou `name` ≠ nom du dossier | Renommer le dossier d'après le `name` |
| Champs Claude rejetés par OpenCode | `color`/`emoji`/`vibe`/`tools`/`model` invalides | Retirer ces champs du frontmatter |

---

## 💬 Le mini-chat IA de l'app (2.14.0) + 🗜 Headroom + ⌥P

L'app macOS **MEGA PACK** (2.14.0) embarque désormais :

| Fonction | Accès | Usage |
|---|---|---|
| **💬 Mini-chat IA** | bouton 💬 du panneau, ou menu tray → « 💬 Mini-chat IA » | Chat **streaming token par token** avec cascade de providers automatique (groq → gemini → mistral… — le premier qui a une clé et répond gagne). Historique local (200 msgs). **Clic sur les bulles** = sélection multiple → **✍️ Transformer en prompt**, **📦 Exporter** la conversation (→ ✍️ tag « chat »), **🗜 Via Headroom** |
| **🗜 Headroom** | menu ⌨ / clic droit / Réglages / chat | « 🗜 Claude Code + Headroom » / « 🗜 OpenCode + Headroom » : Terminal + `headroom wrap <agent> --no-proxy --no-serena`, prompt au presse-papiers. Économies 60–95 % sur logs/JSON (skill `headroom-compression`) |
| **📌 ⌥P** | raccourci global | Bascule l'épinglage du panneau depuis n'importe quelle app. ON = reste visible ; OFF = se masque au blur. Si le panneau est caché, ⌥P ON le révèle |

**Test rapide du chat** : ouvre le panneau → 💬 → tape « Réponds juste OK » → ⏎. La bulle IA se remplit en streaming ; le modèle utilisé s'affiche dans le titre (`· modèle · latence`). Si erreur 403 : la cascade a déjà essayé les autres providers — vérifie une clé dans Réglages → API.

## 🔁 La cascade de providers — skill, prompt et sonde (2.15.0)

La cascade du mini-chat est **déclinée en 3 outils réutilisables** :

| Outil | Emplacement | Usage |
|---|---|---|
| **Skill `llm-provider-cascade`** | `skills/llm-provider-cascade/` | `SKILL.md` (quand/comment router en cascade) + `scripts/llm-cascade.py` : résout les clés (env, `MGP_API_KEY_<P>`, `~/.local/share/opencode/auth.json`), cache santé 10 min, bascule automatique |
| **Prompt ✍️ « Cascade Auto Providers »** | deck ✍️ de l'app (tag `cascade`), semé automatiquement au boot | À copier dans n'importe quel LLM/agent : il route en cascade et trace provider utilisé + bascules |
| **🩺 Santé API** | Réglages de l'app | État **live** de chaque provider (sonde `/models`, même mécanisme que la cascade) : ✓/✗, latence, 🔑 clé détectée. Bouton **🔄 Re-sonder** |

```bash
# Le script du skill, en conditions réelles :
python3 skills/llm-provider-cascade/scripts/llm-cascade.py --check       # sonde tous les providers
python3 skills/llm-provider-cascade/scripts/llm-cascade.py "Réponds juste : OK"
# → "OK." + trace : provider=cohere latency=0.6s (cascade : 6 échecs traversés automatiquement)
```

**Ordre de la cascade** : omniroute → freellm (locaux) → groq → cerebras → mistral → cohere → gemini → openrouter → anthropic. Une seule clé vivante suffit — validé le 25/09/2026 (Groq 403, Gemini 503, Cerebras 403, Mistral 401 → Cohere répond en 0,6 s).

---

*Testé le 23 septembre 2026 — OpenCode 1.17.18, OpenHands/Freebuff user-scope `~/.agents/skills/`, Claude Code plugins scope user. Voir [MY-SETUP.md](MY-SETUP.md) pour l'état exact de ta machine.*
