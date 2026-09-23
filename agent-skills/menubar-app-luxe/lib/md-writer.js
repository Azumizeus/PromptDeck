'use strict';
// Écritures sûres de l'arborescence « MEGA PROMPT » — audit security-audit run-1 (F-2).
//
// Invariant appliqué au sink : tout chemin écrit sous un dossier de base est un
// chemin RELATIF construit à partir de composants assainis ; les segments
// absolus, vides (après filtrage), « . » et « .. » sont refusés, et la joiture
// finale est vérifiée contre la base résolue. Un config JSON importé ne peut
// donc plus faire sortir une écriture du dossier cible.
const path = require('path');

// Assainit un composant de nom de fichier : séparateurs et caractères
// interdits → '-', espaces compactés, 80 caractères max. Refuse les noms à
// points dangereux ('.', '..', préfixe point) plutôt que de les déformer.
function mdSafe(s) {
  const cleaned = String(s || '')
    .replace(/[/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  if (!cleaned || /^\.{1,2}$/.test(cleaned) || cleaned.startsWith('.')) return 'sans-nom';
  return cleaned;
}

// Joint base + segments relatifs en vérifiant la containment. Lève une Error
// si un segment est absolu, vaut '..' ou permet de sortir de la base.
// (La vérification opère sur les chemins résolus ; les symlinks préexistants
// dans l'arborescence utilisateur restent sous le contrôle de l'utilisateur.)
function containedJoin(baseDir, ...segs) {
  const base = path.resolve(baseDir);
  const relParts = [];
  for (const seg of segs) {
    const s = String(seg == null ? '' : seg);
    if (!s) continue;
    // Refus explicite des chemins absolus (POSIX et lettre de lecteur Windows),
    // même s'ils seraient mécaniquement contenants une fois normalisés.
    if (path.isAbsolute(s) || /^[A-Za-z]:[\\/]/.test(s)) {
      throw new Error(`md-writer: chemin absolu refusé (hors du dossier cible) : ${JSON.stringify(seg)}`);
    }
    const parts = s.split(/[\\/]+/).filter((p) => p && p !== '.');
    for (const p of parts) {
      if (p === '..') {
        throw new Error(`md-writer: segment de chemin refusé (hors du dossier cible) : ${JSON.stringify(seg)}`);
      }
      relParts.push(p);
    }
  }
  const abs = path.join(base, ...relParts);
  if (abs !== base && !abs.startsWith(base + path.sep)) {
    throw new Error('md-writer: chemin résolu hors du dossier cible');
  }
  return abs;
}

module.exports = { mdSafe, containedJoin };
