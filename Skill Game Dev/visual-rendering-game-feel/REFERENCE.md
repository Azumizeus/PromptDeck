# Rendu visuel et game feel — Référence

## Bloom à trois paliers

```js
const BLOOM = {
  off:    { enabled:false },
  low:    { enabled:true, blur:4, alpha:0.5, downscale:4 },
  normal: { enabled:true, blur:6, alpha:0.75, downscale:2 },
  high:   { enabled:true, blur:10, alpha:0.9, downscale:1 }
};
let bloomCanvas, bloomCtx;
function initBloom(w,h,downscale) {
  bloomCanvas=document.createElement('canvas');
  bloomCanvas.width=Math.ceil(w/downscale); bloomCanvas.height=Math.ceil(h/downscale);
  bloomCtx=bloomCanvas.getContext('2d');
}
function applyBloom(ctx,scene,w,h,cfg) {
  if (!cfg.enabled) return;
  bloomCtx.clearRect(0,0,bloomCanvas.width,bloomCanvas.height);
  bloomCtx.drawImage(scene,0,0,bloomCanvas.width,bloomCanvas.height);
  ctx.save(); ctx.filter=`blur(${cfg.blur}px)`;
  ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=cfg.alpha;
  ctx.drawImage(bloomCanvas,0,0,w,h); ctx.restore();
}
```

Le downscale est le principal levier : un buffer au quart coûte environ 1/16 d’un traitement pleine résolution. Un bloom à seuil est plus sélectif mais réservé au palier haut, car `getImageData` est lent.

```js
function extractBright(srcCtx,dstCtx,w,h,threshold=180) {
  const img=srcCtx.getImageData(0,0,w,h), d=img.data;
  for (let i=0;i<d.length;i+=4) {
    const lum=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
    if (lum<threshold) d[i]=d[i+1]=d[i+2]=0;
  }
  dstCtx.putImageData(img,0,0);
}
```

## Audit de densité

```js
function auditDensity(manifest) {
  const issues=[];
  for (const [name,entry] of Object.entries(manifest)) {
    const ratio=entry.sourceW/entry.displayW;
    if (ratio>3) issues.push({name,ratio,verdict:'oversized'});
    if (ratio<1.5) issues.push({name,ratio,verdict:'too small'});
  }
  if (issues.length) console.warn(`${issues.length} issues — cible ~2.0`);
  return issues;
}
```

Faire échouer la CI plutôt que seulement avertir en production.

## Screenshake avec décroissance quadratique

```js
let shakeIntensity=0, shakeEnd=0, shakeStart=0;
function shake(intensity,durationMs) {
  if (reduceMotion) return;
  const now=performance.now(); shakeIntensity=Math.max(shakeIntensity,intensity);
  shakeStart=now; shakeEnd=Math.max(shakeEnd,now+durationMs);
}
function applyShake(ctx) {
  const now=performance.now();
  if (now>=shakeEnd) { shakeIntensity=0; return; }
  const progress=(now-shakeStart)/(shakeEnd-shakeStart);
  const amount=shakeIntensity*Math.pow(1-progress,2);
  ctx.translate((Math.random()-0.5)*amount*2,(Math.random()-0.5)*amount*2);
}
```

Appeler dans `save()`/`restore()` autour du monde rendu, jamais autour de l’interface.

## Hitstop et réglage

```js
let freezeUntil=0;
function hitstop(ms) {
  if (reduceMotion) return;
  freezeUntil=performance.now()+ms;
}
function update(dt) {
  if (performance.now()<freezeUntil) return; // simule figée, rendu maintenu
  // ... mise à jour normale
}
```

| Impact | Hitstop |
|---|---:|
| Projectile ordinaire | 0 ms |
| Arme lourde | 40 ms |
| Mort d’ennemi | 60 ms |
| Changement de phase de boss | 120 ms |
| Mort du joueur | 200 ms |

Le rendu continue pendant le hitstop ; arrêter aussi le rendu ressemble à un crash. Pour l’accessibilité :

```js
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) shakeIntensity=0;
```

## Instrumenter la performance

```js
const t0=performance.now();
applyBloom(...);
const bloomCost=performance.now()-t0; // afficher dans l’overlay de développement
```

Comparer aux budgets de `SKILL.md` sur un appareil mobile représentatif avant d’activer le palier élevé par défaut.
