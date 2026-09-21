// Génère les icônes menu-bar (template 16/32 px) — run: node build-icon.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c, t = [];
  for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  return (crc ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// Éclair ⚡ sur fond transparent (alpha masqué → template image macOS)
// Anti-aliasing par sur-échantillonnage 4×4 (contours lisses dans la menu bar)
function drawLightning(size) {
  const s = size, rgba = Buffer.alloc(s * s * 4);
  const poly = [
    [0.58, 0.04], [0.24, 0.55], [0.45, 0.55], [0.40, 0.96],
    [0.76, 0.42], [0.53, 0.42],
  ];
  const inPoly = (x, y) => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const SS = 4; // échantillons par axe
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const i = (y * s + x) * 4;
      let cov = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) / s, py = (y + (sy + 0.5) / SS) / s;
          if (inPoly(px, py)) cov++;
        }
      }
      rgba[i] = 255; rgba[i + 1] = 255; rgba[i + 2] = 255;
      rgba[i + 3] = Math.round((cov / (SS * SS)) * 255);
    }
  }
  return encodePNG(s, s, rgba);
}

fs.writeFileSync(path.join(__dirname, 'iconTemplate.png'), drawLightning(16));
fs.writeFileSync(path.join(__dirname, 'iconTemplate@2x.png'), drawLightning(32));

// ── Icône d'app (Dock / barre de titre) : éclair blanc sur dégradé arrondi ──
function drawAppIcon(size) {
  const s = size, rgba = Buffer.alloc(s * s * 4);
  const poly = [
    [0.58, 0.12], [0.26, 0.56], [0.46, 0.56], [0.42, 0.88],
    [0.74, 0.46], [0.52, 0.46],
  ];
  const inPoly = (x, y) => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const R = 0.225; // rayon des coins (fraction du côté) — style icône macOS
  const SS = 4;
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const i = (y * s + x) * 4;
      let cov = 0, lit = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) / s, py = (y + (sy + 0.5) / SS) / s;
          const qx = Math.max(R - px, px - (1 - R), 0);
          const qy = Math.max(R - py, py - (1 - R), 0);
          if (Math.hypot(qx, qy) <= R) { // rectangle arrondi
            cov++;
            if (inPoly(px, py)) lit++;
          }
        }
      }
      if (!cov) continue;
      const a = cov / (SS * SS);
      const t = y / s; // dégradé violet → turquoise (couleurs de l'app)
      const gr = Math.round(0x7c + (0x00 - 0x7c) * t);
      const gg = Math.round(0x6c + (0xd4 - 0x6c) * t);
      const gb = Math.round(0xff + (0xaa - 0xff) * t);
      const frac = lit / cov; // éclair blanc anti-aliasé sur le dégradé
      rgba[i] = Math.round(gr + (255 - gr) * frac);
      rgba[i + 1] = Math.round(gg + (255 - gg) * frac);
      rgba[i + 2] = Math.round(gb + (255 - gb) * frac);
      rgba[i + 3] = Math.round(a * 255);
    }
  }
  return encodePNG(s, s, rgba);
}
fs.writeFileSync(path.join(__dirname, 'appIcon.png'), drawAppIcon(512));
fs.writeFileSync(path.join(__dirname, 'appIcon@2x.png'), drawAppIcon(1024));
console.log('✓ Icônes générées : menu bar (16/32 px) + app Dock/fenêtre (512/1024 px)');
