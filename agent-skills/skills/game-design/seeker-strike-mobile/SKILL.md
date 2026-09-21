---
name: Seeker Strike Mobile
description: "Applies Seeker Strike's mobile/Solana conventions; use to maintain its Canvas 2D shoot'em up, its WebView wrapper, its SKR/GC economy, and its audit fixes."
---

# Seeker Strike Mobile

Skill projet : le jeu est un shoot’em up **Canvas 2D dans un fichier HTML unique**, déjà à 120 fps sur Seeker sans React Native. La décision est donc **Voie B : wrapper WebView**. Ne pas réécrire le jeu en React Native. Les snippets MWA et le bridge complet sont dans `REFERENCE.md`.

## Contexte et sources du dépôt

Avant toute modification, consulter ces fichiers du dépôt : `DOSSIER-TECHNIQUE.md`, `SUIVI-CORRECTIONS.md`, `LORE.md`, `SPEC-PIXEL.md`, `ECONOMIE-NFT.md`, `CHARTE-AUDIO.md`, `RENDU-VISUEL.md`, `REPRISE-SESSION.md`, `ICONES-A-REMPLACER.md`. Ce skill ne remplace pas ces sources et n’en invente pas le contenu.

## Architecture imposée

- Conserver la boucle Canvas 2D et le fichier HTML unique ; viser 120 Hz (budget 8,3 ms), avec dégradation propre à 60 Hz (16,7 ms).
- Emballer via WebView Android avec `originWhitelist` explicite, `domStorageEnabled` et CSP stricte.
- Android WebView n’expose pas MWA : SOL-2 impose un bridge `postMessage` vers la couche native. Allowlist de méthodes, nonce/correlation, limites de taille et validation native du contenu de transaction avant toute signature.
- Publier avec `npx @solana-mobile/dapp-store-cli init` puis `publish`, en vérifiant les montants/délais dans les docs officielles.

## Stack Solana mobile août 2026

MWA 2.2+ utilise `chain: 'solana:devnet'` (CAIP-2), adresse BASE64 décodée par `new PublicKey(toByteArray(address))`, icône relative à `uri`, et `identity` obligatoire à la réautorisation. Préférer `signTransactions` + `sendRawTransaction` avec blockhash frais, plutôt que `signAndSendTransactions`. SIWS exige un nonce serveur et `sign_in_payload`. Sur mainnet, mesurer le CU via simulation et ajouter les priority fees.

Pour ce projet, rester sur `@solana/web3.js` 1.98 : la 2.0 a été renommée `@solana/kit`. Si une migration est étudiée, les fonctions touchées sont `payerEnSOL()` et `rafraichirSoldes()` ; ne pas migrer par défaut.

## Économie et audit

L’économie distingue le token **SKR**, la monnaie in-game **GC** et les secteurs. Une récompense de valeur réelle doit être validée on-chain (ou par un serveur autoritatif) ; le programme doit empêcher le double claim avec un état/PDA `reward_claimed`. `S.taskRecompensee` et son checksum sont une **façade de sécurité** signalée par l’audit : ils ne constituent pas une protection.

Découpler achats cosmétiques/accès et puissance de gameplay. Le gameplay doit fonctionner sans signature ; un refus wallet est un état normal, non une erreur. SOL-5 — récompenses de valeur réelle validées on-chain — reste « à tester » au 14/08 selon le contexte fourni.

## Assets et rendu

Suivre `ICONES-A-REMPLACER.md` pour remplacer les emojis par des SVG **inline uniquement** (aucun fichier externe, pour éviter les chemins cassés). Les nœuds PNG déjà couverts sont `node_crystal_1`, `node_crystal_2`, `node_crystal_3`, `boss_vortex_face`, `boss_sentinelle`, `boss_fortress`. Créer les icônes de statistiques : dégâts, cadence, vitesse, PV, portée, chance. Pour le pixel art, l’audio et le rendu, consulter les fichiers du dépôt nommés ci-dessus.

## Checklist de travail

- [ ] SOL-2 : bridge WebView de signature depuis le HTML, méthodes allowlistées et validation native.
- [ ] SOL-5 : récompenses réelles validées on-chain ; statut « à tester » à résoudre.
- [ ] Vérifier `payerEnSOL()` / `rafraichirSoldes()` si une migration est proposée ; conserver web3.js 1.98.
- [ ] File offline : persister des intentions, jamais des transactions signées ; MMKV chiffré par clé aléatoire stockée dans Secure Store si une couche native persiste l’état.
- [ ] Détecter changement de compte wallet ; lire les décimales avec `getMint`.
- [ ] Prévoir « aucun wallet installé », iOS sans MWA et gameplay sans signature.
- [ ] Refaire les tests mode avion, anti-double-claim et changement de compte.
- [ ] Grep du bundle, proxy RPC, `auth_token` chiffré, CSP, deep links sans scheme `solana`, `assetlinks.json`, priority fees mainnet.

## Référence rapide

| Sujet | Règle Seeker Strike |
|---|---|
| Moteur | Canvas 2D, HTML unique, wrapper WebView |
| Performance | 120 fps sur Seeker ; ne pas migrer en RN |
| Wallet | MWA natif via bridge ; web3.js 1.98 |
| Économie | SKR + GC + secteurs ; valeur réelle on-chain |
| Audit | `S.taskRecompensee`/checksum = façade, pas sécurité |
| Travail ouvert | SOL-2 et SOL-5 |
| Icônes | SVG inline ; PNG nœuds/boss listés ci-dessus |
