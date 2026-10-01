---
name: openmontage
description: >
  Studio de production vidéo agentique (62k ⭐) : 138 skills embarqués couvrant
  génération vidéo IA (LTX-2, Seedance, Kling), musique (ACE-Step, Lyria,
  ElevenLabs), TTS, motion 2D/3D (GSAP, Three.js, Remotion, HyperFrames) et
  montage FFmpeg. Repo cloné localement — les skills se lisent depuis
  .agents/skills/. Triggers : « vidéo agentique », « génération vidéo »,
  « musique pour vidéo », « montage IA », « openmontage ».
---

# OpenMontage — production vidéo par agents

## Overview

Repo : https://github.com/calesthio/OpenMontage (cloné dans
`~/Desktop/Repo github a utiliser/OpenMontage/`, 170 Mo, **138 skills** dans
`.agents/skills/`). Le plus gros repo du chat Telegram dunk cash.

## Top picks (tri du 01/10/2026)

- **core pipeline** : `create-video` (brief → vidéo), `video-edit`, `video-toolkit`,
  `website-to-video` (un site → vidéo sociale), `playwright-recording` (démo app → vidéo).
- **génération IA** : `ltx2` (texte/image → vidéo), `seedance-2-5`, `kling-official`,
  `acestep` (musique), `lyria` (Google), `elevenlabs` + `sound-effects` + `text-to-speech`.
- **animation 2D/3D** : famille `gsap-*` (9 skills), famille `threejs-*` (11 skills),
  `remotion` + `remotion-best-practices`, famille `hyperframes-*` (7 skills).
- **montage** : `ffmpeg` (conversion, compression, sous-titres), `media-use` (assets figés + ledger).
- ⚠️ Presque tous les skills « génératifs » exigent des clés API (fal, BFL, ElevenLabs,
  Kling…) — c'est le point à arbitrer avant production.

## Repo local

`~/Desktop/Repo github a utiliser/OpenMontage/` · Ajouté le 30/09/2026 depuis le chat Telegram dunk cash.
