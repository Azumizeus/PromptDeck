# 🖱️ MEGA PACK Interface — One-click Skills & Agents

> **Version :** 1.2.0 · 133 skills · 190 agents · works with **any LLM**
>
> 🇫🇷 Version française : [`LISEZMOI-INTERFACE.md`](LISEZMOI-INTERFACE.md)

Three ways to activate skills/agents in any conversation (Claude Desktop, ChatGPT, Gemini, Perplexity, Mistral, OpenCode, Cursor…):

📖 **Interactive user guide:** open [`MODE-DEMPLOI.html`](MODE-DEMPLOI.html) — FR/EN, panel demo, one-click server test, setup checklist.

---

## 1️⃣ HTML Launcher (recommended — zero install)

**File: `mega-pack-launcher.html`** (self-contained, embedded catalog)

Double-click to open it in your browser:

| Feature | Usage |
|---|---|
| 🔍 **Search** | Type a keyword (jupiter, audit, marketing, nft…) |
| ⚡ **Activate** | Copies the activation prompt → paste it into any LLM chat |
| ＋ **Compose** | Multi-select several skills/agents → one combined prompt |
| 🧩 **Composer** | Dedicated tab: copy, download `.md`, or export installable commands |
| 🌐 **Open in LLM** | Opens Claude/ChatGPT/Perplexity/Copilot **with the prompt pre-filled** (if the composer is not empty, the combined prompt is sent) |
| 🌙/☀️ **Theme** | Light / dark, remembered (localStorage) |
| 🇫🇷/🇬🇧 **Language** | FR / EN interface, remembered |
| 🏷️ **Filters** | All/Skills/Agents tabs + category filter (36 categories) |

The whole interface is bilingual FR/EN; the injected prompts follow the selected language.
Tested and validated: instant search, clipboard copy, multi-select composer, persistent
theme/language, pre-filled LLM opening, commands ZIP generation (zero dependencies —
ZIP written by hand in JS, tested: valid PK signatures).

### Installable commands export (Composer tab)

Two buttons generate a ready-to-install `.zip`:

- **Claude Commands** → `megapack-commands-claude.zip`: unzip then
  `mkdir -p ~/.claude/commands && cp *.md ~/.claude/commands/` → use with `/skill-name`
- **OpenCode Commands** → `megapack-commands-opencode.zip`: unzip then
  `mkdir -p ~/.config/opencode/command && cp *.md ~/.config/opencode/command/`

An `INSTALL.txt` is included in each zip.

---

## 2️⃣ macOS menu-bar app (⌘Space global search)

**Folder: `menubar-app/`** — small Electron app living in the menu bar (see [`menubar-app/README-EN.md`](../menubar-app/README-EN.md)).

```bash
cd menubar-app
npm install
npm start          # ⚡ icon in the menu bar
npm run build      # standalone .app in dist/ (Intel x64)
```

| Shortcut | Action |
|---|---|
| **⌘Space** | Open/close the search panel (anywhere in macOS) |
| **⌘⇧Space** | Settings (theme, language) |
| **↑↓ / ⏎** | Navigate / copy the selected skill's prompt |
| **⌘⏎** | Open the selection (or the search) in Claude |
| **⇧⏎** | Open in ChatGPT |
| **⌘A** | Select all (composer) · **Esc** close |

> Note: ⌘Space is the default Spotlight shortcut — the app grabs it first while running.
> Change Spotlight (System Settings → Keyboard) or edit the shortcut in `main.js` if you
> prefer to keep Spotlight.

---

## 3️⃣ Floating panel in the browser (permanent)

### Option A — Tampermonkey (recommended, permanent)

1. Install the [Tampermonkey](https://www.tampermonkey.net/) extension (Chrome/Edge/Firefox/Safari).
2. Tampermonkey → **Create a new script** → paste the whole content of `mega-pack-panel-full.user.js`
   (embedded catalog — works standalone, no external file or server needed).
3. Save (Ctrl+S).

→ A **⚡** button appears at the bottom right **on every site** (shortcut: `Ctrl+Shift+K`).
Click a skill/agent → the prompt is **injected straight into the chat text box**
(automatic detection: Claude, ChatGPT, Gemini, generic textareas). If no box is found →
copies to the clipboard.

The panel has a **FR/EN toggle** in its header; the choice is remembered per site.

### Option B — Bookmarklet (no extension)

1. Open `mega-pack-bookmarklet.html` in your browser.
2. Drag the **⚡ MEGA PACK** button to your bookmarks bar.
3. On any LLM chat: click the bookmark → the panel opens.

> ⚠️ On macOS, browsers block `file://` scripts loaded from https pages. Start the local
> server first (double-click `MEGA-PACK-serveur.command`, or `python3 -m http.server 8788
> -d agent-skills/interface`) — the bookmark loads from `http://localhost:8788`. Or skip
> the server entirely with Option A.

---

## 4️⃣ Claude Desktop integration (MCP / project)

The catalog is also a plain JS file:

```js
// interface/catalog-full.js
const MEGA_CATALOG = { meta: {...}, skills: [...131], agents: [...190] };
```

- **Claude Desktop**: add the `agent-skills/` folder as a *project* → ask
  "List the catalog skills" or "Activate the jupiter skill".
- **Developers**: `fetch('catalog-full.js')` in any app to build your own picker.

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| Bookmarklet does not load the catalog | Start the local server: `python3 -m http.server 8788 -d agent-skills/interface`, then use the bookmark (or double-click `MEGA-PACK-serveur.command`) |
| The ⚡ panel does not appear | Check Tampermonkey is enabled on the site (icon → 1) |
| The prompt is not injected into the chat | The site changed its DOM → the clipboard fallback kicks in; paste manually |
| Empty catalog in the userscript | The standalone userscript reads `window.MEGA_CATALOG` — prefer `mega-pack-panel-full.user.js` (embedded catalog) or the HTML launcher |

## 🔄 Regenerate the catalog

After adding/updating skills in the master folder:

```bash
cd agent-skills
python3 build-interface.py   # regenerates interface/catalog-full.js AND syncs the embedded catalog in the launcher
python3 build-userscript.py  # regenerates interface/mega-pack-panel-full.user.js (embedded catalog)
```

---

## 📁 Files

| File | Purpose |
|---|---|
| `mega-pack-launcher.html` | Self-contained launcher (embedded catalog, auto-synced) |
| `catalog-full.js` | Raw JSON catalog (for custom integrations) |
| `mega-pack-panel.user.js` | Tampermonkey userscript — permanent floating panel (loads `catalog-full.js` from its folder) |
| `mega-pack-panel-full.user.js` | Tampermonkey userscript with the **embedded catalog** — recommended |
| `mega-pack-bookmarklet.html` | Bookmarklet install page (bilingual FR/EN) |
| `MEGA-PACK-serveur.command` | macOS double-click launcher for the local server |
| `MODE-DEMPLOI.html` | Interactive user guide (FR/EN) |
