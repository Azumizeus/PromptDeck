# Référence — Motion & Animation System

## Framer Motion

```tsx
import { motion, Variants } from "framer-motion";
export const panel: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }
};
export const list: Variants = {
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.02 } }
};
// motionConfig={reducedMotion: "user"} ou useReducedMotion() pour une branche sans déplacement.
```

## CSS keyframes et reduced motion

```css
@keyframes enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.card { animation: enter 240ms cubic-bezier(.2,.8,.2,1) both; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; scroll-behavior: auto !important; }
  .parallax, .decorative-loop { transform: none !important; }
}
```

## Easing de référence

- standard: `cubic-bezier(.2, .8, .2, 1)`
- decelerate: `cubic-bezier(0, 0, .2, 1)`
- accelerate: `cubic-bezier(.4, 0, 1, 1)`
- linear: `linear` pour indicateur continu
- spring : utiliser un spring borné, sans overshoot si la cible représente une position sémantique. Exemple Framer : `{ type: "spring", stiffness: 500, damping: 35, mass: 0.7 }`.

## GSAP timeline

```js
const ctx = gsap.context(() => {
  const tl = gsap.timeline({ defaults: { duration: 0.24, ease: "power2.out" } });
  tl.fromTo(".panel", { opacity: 0, y: 8 }, { opacity: 1, y: 0 })
    .fromTo(".item", { opacity: 0, y: 4 }, { opacity: 1, y: 0, stagger: 0.035 }, "<0.02");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) tl.progress(1).pause();
}, root);
return () => ctx.revert();
```

## Debug performance

1. Reproduire sur 60 Hz puis 120 Hz; enregistrer Performance panel.
2. Chercher long tasks, forced synchronous layout, layout shift, paint coûteux et images trop grandes.
3. Isoler une animation; vérifier qu’elle n’anime que transform/opacity et que les calques ne débordent pas.
4. Tester scroll, resize, navigation répétée, faible CPU/batterie et mémoire.
5. Supprimer `will-change` inutiles; mesurer avant/après; tester avec reduced motion.
