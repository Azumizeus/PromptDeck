# Discipline de palette pixel art — Référence

## Prompt de génération

```text
Pixel art sprite, {SIZE}x{SIZE} pixels, limited palette of {N} colours,
{HUE} dominant with {NEUTRALS} neutrals, lit from upper-left, hard pixel
edges, no anti-aliasing, no gradients, transparent background, single subject
centred, {SUBJECT}
```

Les quatre expressions non négociables sont `no anti-aliasing`, `no gradients`, `limited palette` et `hard pixel edges`.

## Extraire une palette (JavaScript)

```js
function extractPalette(imagePath, maxColors = 32) {
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
  const img = new Image();
  return new Promise(resolve => {
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.imageSmoothingEnabled = false; ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;
      const counts = new Map();
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 128) continue;
        const hex = '#' + [d[i], d[i+1], d[i+2]]
          .map(v => v.toString(16).padStart(2, '0')).join('');
        counts.set(hex, (counts.get(hex) || 0) + 1);
      }
      const sorted = [...counts.entries()].sort((a,b) => b[1] - a[1]);
      resolve({ total: sorted.length, overBudget: sorted.length > maxColors,
        palette: sorted.slice(0, maxColors) });
    }; img.src = imagePath;
  });
}
```

Des centaines de couleurs indiquent généralement de l’anti-aliasing : requantifier au lieu d’intégrer.

## Quantifier vers une palette fixe

```js
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function colorDistance(r1,g1,b1,r2,g2,b2) {
  const m = (r1 + r2) / 2, dr = r1-r2, dg = g1-g2, db = b1-b2;
  return Math.sqrt((2+m/256)*dr*dr + 4*dg*dg + (2+(255-m)/256)*db*db);
}
function quantise(ctx, w, h, palette) {
  const p = palette.map(hexToRgb), img = ctx.getImageData(0,0,w,h), d = img.data;
  for (let i=0; i<d.length; i+=4) {
    if (d[i+3] < 128) { d[i+3] = 0; continue; }
    d[i+3] = 255; let best=0, dist=Infinity;
    for (let j=0; j<p.length; j++) {
      const q=colorDistance(d[i],d[i+1],d[i+2],...p[j]);
      if (q < dist) { dist=q; best=j; }
    }
    [d[i],d[i+1],d[i+2]] = p[best];
  }
  ctx.putImageData(img,0,0);
}
```

La distance pondérée donne plus de poids au vert que la distance RGB naïve. Le forçage d’alpha à 0/255 est aussi important que la réduction des couleurs.

## Contraste

```js
function relativeLuminance(hex) {
  return [0,1,2].reduce((sum,i) => {
    const v = hexToRgb(hex)[i]/255;
    const s = v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4;
    return sum + [0.2126,0.7152,0.0722][i]*s;
  }, 0);
}
function contrastRatio(a,b) {
  const x=relativeLuminance(a), y=relativeLuminance(b), hi=Math.max(x,y), lo=Math.min(x,y);
  return (hi+0.05)/(lo+0.05);
}
```

## Exemple de budget 32 couleurs

Neutres (6) : `#050308`, `#1a1626`, `#4a4560`, `#9691a8`, `#e8e4f0`, `#ffffff`.

- Zone froide/tech (8) : `#67e8f9` / `#2b7a8c`, `#c4b5fd` / `#5b4a8a`, `#f87171` / `#8a3838`, `#14f195` / `#0a7a4c`.
- Zone chaude/hostile (4) : `#f472b6` / `#8a3a63`, `#e879f9` / `#7a2d8a`.
- Zone archive/chaleureuse (4) : `#fbbf24` / `#8a6612`, `#d97706` / `#57534e`.
- Réserve (10) : zone tardive ou tons intermédiaires de la sous-palette la plus utilisée.

La paire `#14f195` / `#0a7a4c` est ici le signal joueur/succès et reste interdite au décor.

## Modes d’échec

| Symptôme | Cause | Correction |
|---|---|---|
| Asset lisse | Anti-aliasing | Requantifier, alpha binaire |
| Ombres boueuses | Même teinte simplement assombrie | Déplacer la teinte |
| Sprite invisible | Contraste < 3,0 | Contour ou valeur plus contrastée |
| Ensemble incohérent | Sous-palettes trop proches | Séparer les teintes |
| Grille cassée | Échelle non entière | Agrandir par entier et letterboxer |
| Dérive des couleurs | Pas de palette centrale | Fichier unique + échec CI |
