# Direction audio de jeu — Référence

## Spécification type de huit pistes

Exemple avec tonique A, mode de base éolien, base 126 BPM et motif `A – E – C – D`. Remplacer ces choix pour un projet donné, mais conserver la logique de relations.

| # | Piste | Tonalité / mode | BPM | Durée | Traitement du motif | Priorité |
|---:|---|---|---:|---:|---|---|
| 1 | Combat | A éolien | 126 | 100 s | Ostinato fragmenté, basse | Première |
| 2 | Boss | A mineur harmonique | 168 | 90 s | Martelé, 1 note/mesure | Deuxième |
| 3 | Menu | A éolien | 88 | 80 s | Pad lent, 1 note/mesure | Troisième |
| 4 | Exploration | A dorien | 107 | 120 s | arpège clairsemé | Quatrième |
| 5 | Variante hostile | A phrygien | 126 | 100 s | Arrangement 1, timbre distordu | Cinquième |
| 6 | Variante boss | A phrygien | 168 | 90 s | Arrangement 2, dégradé | Sixième |
| 7 | Victoire | A majeur | libre | 6 s | Motif complet et résolu | Dernière |
| 8 | Défaite | A éolien | libre | 5 s | Descendant, irrésolu | Dernière |

Les variantes réutilisent l’arrangement et ne changent que mode et timbre : la zone reste reconnaissable et le coût de production est réduit.

## Vérifier une boucle (Web Audio)

```js
async function verifyLoop(url, iterations = 10) {
  const ctx = new AudioContext();
  const buf = await fetch(url).then(r => r.arrayBuffer())
    .then(b => ctx.decodeAudioData(b));
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true; src.connect(ctx.destination); src.start();
  console.log(`Looping ${buf.duration.toFixed(2)}s × ${iterations}`);
  setTimeout(() => { src.stop(); ctx.close(); }, buf.duration * iterations * 1000);
}

function checkSeam(buffer) {
  const ch = buffer.getChannelData(0);
  const jump = Math.abs(ch[ch.length - 1] - ch[0]);
  if (jump > 0.01) console.warn('Raccord potentiellement audible');
  return jump;
}
```

Un saut supérieur à **0,01** justifie un trim aux passages par zéro ou un fondu de **2 ms** aux frontières.

## Transitions et ducking

| Transition | Durée |
|---|---:|
| Menu → gameplay | 1,5 s |
| Zone → zone | 3 s |
| Combat → boss | 0,5 s |
| N’importe quel état → victoire | 0,2 s (coupure) |
| N’importe quel état → défaite | 0,3 s |

```js
class Ducker {
  constructor(ctx, musicGain) {
    this.ctx = ctx; this.gain = musicGain; this.normal = 1.0;
    this.ducked = 0.5; this.releaseTimer = null; // −6 dB
  }
  duck(holdMs = 150, attackMs = 30, releaseMs = 200) {
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(this.ducked, now + attackMs / 1000);
    clearTimeout(this.releaseTimer);
    this.releaseTimer = setTimeout(() => {
      const t = this.ctx.currentTime;
      this.gain.gain.cancelScheduledValues(t);
      this.gain.gain.setValueAtTime(this.gain.gain.value, t);
      this.gain.gain.linearRampToValueAtTime(this.normal, t + releaseMs / 1000);
    }, holdMs);
  }
}
```

Déclencher sur explosions, attaques de boss et confirmations UI majeures, jamais sur les tirs ordinaires.

## Prompt de génération

```text
Instrumental {GENRE} game music, {KEY}, {BPM} BPM, seamless loop,
no intro, no vocals. Recurring {N}-note motif: {NOTES}, played as
{TREATMENT}. Layers: {INSTRUMENT LIST}. {MOOD ADJECTIVES}.
Nothing below 80 Hz. Duration {N} seconds.
```

Exemple :

```text
Instrumental electronic game music, A minor, 126 BPM, seamless loop,
no intro, no vocals. Recurring 4-note motif: A – E – C – D, played as a
fragmented rhythmic ostinato. Layers: filtered square-wave synth bass,
wide reverb pad, 16th-note arpeggio with synced delay, electronic kick and
closed hi-hat, crystalline high bells. Dark, spatial, driving. Nothing below
80 Hz. Duration 100 seconds.
```

## Mobile, formats et budgets

| Format | Usage | Point d’attention |
|---|---|---|
| OGG Vorbis | Musique par défaut | Bon ratio, boucles continues |
| AAC/M4A | Repli Safari / anciens iOS | À fournir en fallback mobile |
| WAV | SFX courts | Pas de latence de décodage |
| MP3 | Repli général seulement | Padding d’encodage, pas de boucle gapless fiable |

| Cible mobile | Budget |
|---|---:|
| Piste de 100 s | 1,2–1,8 MB, OGG q5 |
| Bande-son de 8 pistes | < 12 MB |
| SFX individuel | < 50 KB |
| Audio total | < 20 MB |

Précharger les SFX et streamer la musique. Déverrouiller l’`AudioContext` après un geste utilisateur et le reprendre après une interruption ou un retour d’onglet.
