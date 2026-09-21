# Référence — Premium Visual Design System

## Template de custom properties

```css
:root {
  --color-neutral-0: #ffffff;
  --color-neutral-950: #0b0d10;
  --color-accent-500: #6d5efc;
  --color-surface-1: #141820;
  --color-surface-2: #1b2130;
  --color-text-strong: #f5f7fb;
  --color-text-muted: #b7c0d1;
  --color-border-subtle: rgb(255 255 255 / 14%);
  --color-focus: #8ab4ff;
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --elevation-1: 0 2px 8px rgb(0 0 0 / 18%);
  --elevation-2: 0 12px 32px rgb(0 0 0 / 28%);
  --focus-ring: 0 0 0 3px color-mix(in srgb, var(--color-focus) 75%, transparent);
}
[data-theme="light"] {
  --color-surface-1: #ffffff; --color-surface-2: #f2f4f8;
  --color-text-strong: #11151c; --color-text-muted: #4e596b;
  --color-border-subtle: rgb(17 21 28 / 16%); --color-focus: #164fbd;
}
:focus-visible { outline: none; box-shadow: var(--focus-ring); }
```

## Squelette Tailwind

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: { extend: {
    spacing: { '1': '4px', '2': '8px', '3': '12px', '4': '16px', '6': '24px', '8': '32px' },
    colors: { surface: { 1: 'var(--color-surface-1)', 2: 'var(--color-surface-2)' },
      ink: { strong: 'var(--color-text-strong)', muted: 'var(--color-text-muted)' } },
    borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)' }
  }}
}
```

## Calcul du contraste WCAG 2.x

Pour chaque canal sRGB `c` dans `[0,1]`, transformer : `c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)^2.4`. La luminance relative est `L = 0.2126R + 0.7152G + 0.0722B`. Le ratio est `(max(L1,L2)+0.05)/(min(L1,L2)+0.05)`. Comparer au texte réel, y compris overlay, image, gradient, hover et disabled. Le contraste des éléments désactivés n’a pas à atteindre les mêmes cibles, mais leur état doit rester compréhensible.

## Matrice d’état

| État | Visuel | Interaction | Vérifications |
|---|---|---|---|
| default | surface, texte, affordance | action disponible | AA, hiérarchie |
| hover | changement subtil | pointer seulement | pas d’info exclusive |
| focus-visible | anneau net | clavier/AT | 3:1 contre adjacent, non rogné |
| pressed | profondeur/position | activation | retour immédiat |
| selected | accent + signal non-coloré | sélection persistante | groupe compréhensible |
| disabled | faible emphase | non activable | raison lisible si utile |
| loading | skeleton/spinner + label | attente | éviter layout shift |
| error/success | icon + texte + couleur | correction/confirmation | message actionnable |
| empty | explication + prochaine action | guider | pas d’impasse |
