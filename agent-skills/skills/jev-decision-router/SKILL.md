---
name: jev-decision-router
description: >
  Routes a user request to the right skill using typed, structured decisions
  instead of free-text generation — Jev-style "System One" routing, fully
  local and deterministic. Use when a message must be classified into a
  lifecycle phase or specialty and the router should return a JSON decision
  (choice + triggers + alternatives) that code or an agent can consume
  directly, or when keyword routing (the old .openhands microagents) must be
  replaced. Triggers on "route this request", "which skill", "jev router",
  "decision router", "typed routing".
---

# Jev Decision Router — routage typé "System One"

## Overview

Le principe **Jev** (TypeSafe AI, System One) : ne jamais générer de texte libre pour
prendre une décision. On fournit un **état** (le message utilisateur) et un **schéma de
choix fermé** (les skills du dépôt) ; le routeur retourne une **décision typée** :
un choix principal, un score de confiance, les alternatives plausibles et les
déclencheurs qui ont compté. Le consommateur (agent, script, app) lit le JSON,
pas une phrase à interpréter.

Ce skill remplace le routage par microagents OpenHands (supprimé) par un moteur
**100 % local et déterministe** : TF-IDF sur les descriptions des skills +
fusion des triggers par mot-clé, avec sortie JSON typée.

## When to Use

- Une demande entrante doit être **classée** vers un skill avant toute action (routage lifecycle ou spécialité).
- Un agent ou un script a besoin d'une **décision consommable** (JSON typé), pas d'un paragraphe à interpréter.
- Tu veux remplacer le routage par mots-clés OpenHands (microagents supprimés) par un moteur local équivalent.
- Un pipeline doit **escalader** proprement quand le routeur n'est pas sûr (seuil de confiance, code de sortie 2).

**N'utilise pas ce skill** pour du contenu ouvert (rédaction, design) ni quand la décision exige un raisonnement de fond — c'est le domaine d'un modèle System Two (LLM complet).

## Utilisation

### 1. Routage en une commande (recommandé)

```bash
node skills/jev-decision-router/scripts/jev-router.mjs "j'ai un bug : les tests échouent après la migration"
```

Sortie typée :

```json
{
  "decision": "debugging-and-error-recovery",
  "confidence": 0.87,
  "alternatives": [{ "choice": "test-driven-development", "score": 0.21 }],
  "matchedTriggers": ["bug", "tests"],
  "phase": "VERIFY",
  "mode": "trigger+tfidf",
  "topK": 3
}
```

Contrat de la décision (stable, à consommer tel quel) :

| Champ | Type | Signification |
|---|---|---|
| `decision` | `string` (nom de skill du dépôt) | Le choix principal. Toujours un skill existant ou `null`. |
| `confidence` | `number` ∈ [0,1] | Concentration du score sur le choix principal (part du top-1 dans la somme des scores). Seuil d'escalade conseillé : **< 0.55 → demander à l'humain ou passer au modèle de raisonnement**. |
| `alternatives` | `array<{choice, score}>` | Candidats suivants, triés décroissants (max `--top-k`). |
| `matchedTriggers` | `array<string>` | Triggers de mots-clés qui ont déclenché le choix (vide si routage TF-IDF pur). |
| `phase` | `string \| null` | Phase de cycle (DEFINE/PLAN/BUILD/VERIFY/REVIEW/SHIP) quand le skill en a une. |
| `mode` | `"trigger" \| "tfidf" \| "trigger+tfidf"` | Comment la décision a été prise. |

### 2. Options

| Option | Défaut | Rôle |
|---|---|---|
| `--top-k <n>` | `3` | Nombre d'alternatives retournées. |
| `--min-confidence <n>` | `0` | Sortie en code 2 (et `"decision": null`) si la confiance est sous le seuil → escalade. |
| `--skills-dir <chemin>` | `<repo>/skills` | Catalogue de skills à router. |
| `--jsonl` | off | Mode flux : lit un message JSON par ligne sur stdin, rend une décision par ligne (pour brancher sur un pipeline). |

Codes de sortie : `0` décision rendue · `1` erreur d'usage · `2` confiance insuffisante (escalade).

### 3. Routage manuel (sans script)

Quand tu routes toi-même une demande, suis le même contrat :

1. **Liste les candidats fermés** — les skills pertinents du dépôt, jamais une liste ouverte.
2. **Compare le message au vocabulaire** des `description` + `triggers` (les mots du message qui
   apparaissent dans la description comptent ; les mots génériques non).
3. **Décide, puis décris la décision** en une ligne typée avant d'agir :
   `→ skill: <nom> (confiance ~0.x ; alternatives : a, b ; triggers : t1, t2)`.
4. **Escalade** si deux candidats restent trop proches : demande à l'utilisateur plutôt que de
   choisir en silence.

## Common Rationalizations

- « Je vais juste générer le nom du skill dans ma réponse. » → Non : une décision en texte libre peut inventer un skill inexistant ou être ambiguë. Le choix doit venir d'un catalogue fermé avec une confiance explicite.
- « La confiance 0.4, ça passe, je continue. » → Non : sous le seuil (conseillé 0.55), on escalade vers l'humain ou un modèle de raisonnement plutôt que de choisir en silence.
- « Je peux élargir le catalogue au moment de la décision. » → Non : les critères du choix sont figés avant de juger ; ajouter un candidat après coup fausse la comparaison.
- « TF-IDF, c'est trop simple pour router. » → C'est voulu : la couche triggers + descriptions suffit pour la majorité des demandes, est gratuite, déterministe et journalisable ; les cas ambigus remontent en escalade.
- « Le JSON, on peut le lire plus tard. » → Non : la valeur est dans la consommation immédiate par le code (seuils, hooks, app) — une décision non structurée est une décision perdue.

## Pourquoi ce design (héritage Jev)

- **Choix fermé, pas génération** : le routeur ne peut répondre que par un élément du catalogue.
  Impossible d'inventer un skill inexistant.
- **Décision + probabilité** : la confiance et les alternatives rendent l'incertitude *actionnable*
  (seuils, escalade, journalisation) au lieu de la cacher dans du texte.
- **Code possède le workflow** : le JSON est consommable par un script, un hook, l'app Luxe ou un
  agent ; le model (ou le moteur TF-IDF local) ne fait que juger.
- **Déterministe et gratuit** : TF-IDF + triggers tournent en local, sans appel réseau —
  le comportement "System One" (rapide, peu coûteux) sans dépendre d'une API externe.

## Red Flags

- **Décision hors catalogue** : un nom de skill qui n'existe pas dans `skills/` = bug de routage, jamais une découverte. Rejeter et re-router.
- **Confiance jamais regardée** : produire `confidence` sans l'utiliser (seuil, escalade, log) revient à cacher l'incertitude dans le JSON.
- **Triggers trop génériques** : un trigger comme `test` ou `code` qui matche la moitié du catalogue dégrade la couche mots-clés — les triggers doivent être distinctifs.
- **Description vide ou dupliquée** : le TF-IDF route sur les descriptions ; deux skills quasi identiques rendent la décision instable (voir le contrôle de collision de `run-evals.js`).
- **Escalade silencieuse** : un `decision: null` doit remonter à l'utilisateur ou à un modèle System Two, jamais être ignoré pour « avancer ».

## Verification

- `node --test skills/jev-decision-router/scripts/jev-router-test.mjs` → 11 tests : contrat typé, choix fermé, couches triggers/TF-IDF, confiance, escalade, JSONL, catalogue réel.
- `node skills/jev-decision-router/scripts/jev-router.mjs "<message>"` sur des demandes réelles : la décision doit appartenir au catalogue et les triggers listés expliquer le choix.
- `node scripts/validate-skills.js` : le skill passe le lint du dépôt (sections, frontmatter, description).

## Brancher sur une vraie API Jev (optionnel)

Si un accès à l'API TypeSafe est configuré, le même contrat s'applique : envoyer l'état
(`{ message, catalog: [{name, description}] }`) et une question Choice (« quel skill route
cette demande ? ») avec les noms de skills en critères, puis remplacer le champ `mode`
par `"jev-api"`. Le script reste la voie par défaut : zéro dépendance, zéro clé.
