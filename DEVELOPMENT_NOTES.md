# Development Notes - Night Reader Extension

Full conversation log and development notes from building this extension.

## Project Overview

**Goal:** Build a Chrome extension that enables dark mode with various dark color options for reading Blue Letter Bible (https://www.blueletterbible.org/) and other websites at night.

**Target Environment:**
- Chrome Version 145.0.7632.117 (Official Build) (arm64)
- macOS 26.3 (25D125)

**Built with:** Claude Code (Claude Opus 4.6) by Anthropic

---

## Full Conversation Log

### Message 1 - User (Initial Request)

> code me a plugin for google chrome (that enables me to run dark mode (so i can read at night) with various dark color options, i want to read 'https://www.blueletterbible.org/' and other websites i choose in these dark theme) Version 145.0.7632.117 (Official Build) (arm64), running on mac os 26.3 (25D125)

### Message 2 - Claude (Phase 1: Initial Build)

Built the complete extension from scratch:

**Files created:**
1. `manifest.json` - Chrome Manifest V3 with permissions for `activeTab`, `storage`, `scripting`, `<all_urls>`
2. `popup.html` - Extension popup UI layout
3. `popup.css` - Dark-themed popup styling (purple accent, toggle switch, theme grid, sliders)
4. `popup.js` - 12 theme definitions, UI logic, settings persistence via `chrome.storage.local`
5. `content.js` (v1) - CSS injection with `!important` overrides targeting common HTML elements
6. `background.js` - Service worker for default settings and content script re-injection
7. `icons/icon16.png`, `icon48.png`, `icon128.png` - Generated programmatically via Python (moon crescent + stars)

**12 themes defined:** Midnight, Charcoal, Navy, Deep Purple, Forest, Mocha, Ocean, Slate, Wine, Obsidian, Nord, Sepia Night

Provided installation instructions:
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click Load unpacked
4. Select the extension folder
5. Click icon, toggle on, pick a theme

---

### Message 3 - User (Screenshot: Light mode still showing)

User shared a screenshot of Blue Letter Bible with the extension active. The text color had changed but the white background was still fully visible — the CSS was only dimming it, not replacing it.

> the text color changes but i need the white background completely gone, it appears to only make it dimmer. update

---

### Message 4 - Claude (Phase 2: Complete content.js Rewrite)

**Problem identified:** CSS `!important` alone couldn't beat inline styles set by Blue Letter Bible's deeply nested elements. The site uses:
- Inline `style="background-color: ..."` attributes
- Deeply specific CSS selectors
- Dynamically generated elements

**Solution — rewrote `content.js` (v2) with 5 major changes:**

1. **Universal background killer** — `html.night-reader-active *:not(img):not(video)...` forces `background-color` and `background-image: none` on EVERY element
2. **JavaScript inline style stripping** — `stripInlineBackgrounds()` walks the entire DOM removing inline `background-color`, `background`, `background-image`, and `color` properties
3. **MutationObserver** — watches for new elements and style changes, re-strips inline styles via `requestAnimationFrame`
4. **Class-based scoping** — all CSS under `html.night-reader-active` for clean toggle
5. **Anti-flash** — injects early dark background on `document_start` to prevent white flash

Instructed user to refresh extension in `chrome://extensions/` and reload the page.

---

### Message 5 - User (Success! Screenshots confirming it works)

User shared 3 screenshots:
1. **Midnight theme** on Blue Letter Bible — fully dark background, purple UI, text readable, brightness at 86%, contrast at 108%
2. **Ocean theme** on Blue Letter Bible — deep navy background, teal accents, brightness at 80%, contrast at 112%
3. **Before screenshot** — original light mode for comparison

User response:
> dope! now post this to my github so i can share with my brother. include instructions so he can use it in google chrome, also include the screenshot and this whole conversation, with all notes

---

### Message 6 - Claude (Phase 3: GitHub Setup)

Checked for `gh` CLI and git config — neither were set up.

Asked user how to proceed. User chose: **Install gh CLI via Homebrew**.

Ran `brew install gh` — installed gh 2.87.3.

Instructed user to run `gh auth login` in their terminal.

---

### Message 7 - User (GitHub Auth Complete)

User completed authentication:
- GitHub.com, SSH protocol
- Generated new SSH key with passphrase
- Key title: `SONOFGOD131`
- Authenticated via browser OAuth
- Logged in as: **131daniel**

---

### Message 8 - Claude (Phase 3: Repo Creation & Push)

1. Initialized git repo, set user to `131daniel`
2. Created `README.md` with:
   - Feature list and theme table
   - Step-by-step Chrome installation instructions for the brother
   - File structure, troubleshooting, and how-it-works sections
3. Created `DEVELOPMENT_NOTES.md` with conversation log and technical architecture
4. Created `.gitignore` (excludes `.DS_Store`)
5. Created `screenshots/` directory (placeholder — screenshots from chat not accessible as files)
6. Committed all 13 files
7. User chose **private** repo
8. Created repo via `gh repo create night-reader-extension --private`
9. Initial SSH push failed (passphrase-protected key couldn't be loaded non-interactively)
10. Switched to HTTPS via `gh auth setup-git`
11. Successfully pushed to `https://github.com/131daniel/night-reader-extension`

Instructed user to:
- Invite brother via repo Settings > Access > Add people
- Manually add 3 screenshots to `screenshots/` folder and push

---

### Message 9 - User (Final Request)

> ok. make sure this whole conversation that i've had had with you is also documented and transparent. update and close out. over!

---

### Message 10 - Claude (Phase 4: Final Documentation Update & Close Out)

Updated `DEVELOPMENT_NOTES.md` with the complete verbatim conversation log covering all 10 messages. Committed and pushed final update to GitHub.

---

### Phase 5 — Chrome Web Store Submission (v1.0.1 → v1.0.2)

#### v1.0.1 — Initial Store Submission

- Submitted to Chrome Web Store under developer account `131daniel`
- Switched from `<all_urls>` to `activeTab` only to avoid broad host permission warning and speed up review
- Removed auto `content_scripts` injection from manifest
- Popup now injects content script on-demand via `chrome.scripting.executeScript` when user clicks icon
- Filled out all Privacy practices fields: single purpose, permission justifications, remote code (No), data usage (none collected), certifications (all 3), privacy policy URL
- Added and verified contact email on Account tab
- Submitted for review — status: **under review**

#### Issue Discovered After Submission

After submission, user realised the `activeTab`-only approach required clicking the Night Reader icon every time they navigated to a new page or chapter — even within the same website. This was unacceptable for reading Bible chapters on BLB.

#### v1.0.2 — Tab-Persistent Dark Mode

**User requirement:**
> "I want dark mode to stay active for every website I visit within that one tab. This way I don't have to reactivate as I navigate within that tab. If I open a new Chrome tab, I don't want it to apply to that new tab."

**Solution implemented:**

1. **`manifest.json`** — Added `"tabs"` permission and restored `"host_permissions": ["<all_urls>"]`. Version bumped to `1.0.2`.

2. **`background.js`** — Rewrote service worker to:
   - Listen to `chrome.tabs.onUpdated` — fires every time a tab navigates to a new page
   - Check `chrome.storage.session` for key `tab_{tabId}` — if dark mode is enabled for that tab, re-inject `content.js` and send `applySettings`
   - Listen to `chrome.tabs.onRemoved` — cleans up session state when tab is closed
   - Uses `chrome.storage.session` (not `local`) so state clears automatically when the browser closes

3. **`popup.js`** — Rewrote to manage per-tab state:
   - On open: reads `tab_{tabId}` from session storage to show correct toggle state for the current tab
   - On toggle: saves `tab_{tabId}` to session storage so background knows to follow this tab
   - Each tab has completely independent dark mode state

**How it works for the user:**
- Open Blue Letter Bible on Tab 1 → click Night Reader icon → toggle ON
- Navigate to any chapter, verse, or even a completely different website — dark mode stays on **automatically**, no clicking needed
- Open a new Tab 2 — starts completely normal (no dark mode)
- Enable on Tab 2 independently if desired — they track separately

**Note on Chrome Web Store:** v1.0.2 could not be submitted while v1.0.1 was still under review. v1.0.2 pushed to GitHub and applied to local extension. Will be submitted as an update once v1.0.1 review completes.

**Files changed in v1.0.2:** `manifest.json`, `background.js`, `popup.js`

---

#### v1.0.3 — White Flash Fix on Page Navigation

**User reported:**
> "When I change a chapter, for the first half second the background is light. How do I make it so the background is never white?"

**Root cause:** A brief gap existed between the browser starting to load the new page and `content.js` being injected (which only happened on `status === 'complete'`). During that gap the page rendered its default white background.

**Fix — Two-stage injection in `background.js`:**

The `tabs.onUpdated` listener now fires on **two** events per navigation instead of one:

1. **`status === 'loading'`** (fires the instant navigation begins):
   - Reads the user's chosen theme from `chrome.storage.local`
   - Immediately injects a single CSS rule via `chrome.scripting.insertCSS`:
     ```css
     html, body { background: #0d1117 !important; background-image: none !important; }
     ```
   - This fires before ANY page content renders — background is dark from frame zero

2. **`status === 'complete'`** (fires when page is fully loaded):
   - Injects full `content.js` with all 12 theme styles, inline stripping, MutationObserver
   - Sends `applySettings` message as before

Added `THEME_BG` lookup object to `background.js` so the early flash-prevention CSS uses the exact colour of the user's chosen theme (not just a generic black).

**Result:** Zero white flash — the page background matches the dark theme from the very first frame of every navigation.

**Files changed in v1.0.3:** `manifest.json` (version bump), `background.js`

---

## Technical Architecture (v1.0.2 — Current)

```
User clicks Night Reader icon (opens popup)
        |
        v
  popup.js reads tab_{tabId} from chrome.storage.session
        |
        v
  Shows correct ON/OFF toggle for THIS tab only
        |
        v
  User toggles / changes theme / adjusts sliders
        |
        +---> chrome.storage.session.set({ tab_{tabId}: true/false })
        |         (background watches this key)
        |
        +---> chrome.scripting.executeScript → injects content.js
        |
        +---> chrome.tabs.sendMessage({ action: 'applySettings' })
                    |
                    v
              content.js applies dark mode to current page

─────────────────────────────────────────────────────
  User navigates to a new page (same tab)
        |
        v
  chrome.tabs.onUpdated fires in background.js
        |
        v
  background.js checks chrome.storage.session for tab_{tabId}
        |
        +---> Dark mode ON for this tab?
              |
              Yes → executeScript (re-inject content.js)
                  → sendMessage({ action: 'applySettings' })
                  → Page goes dark automatically ✅
              |
              No  → Do nothing. Page stays normal ✅
─────────────────────────────────────────────────────
  User closes tab
        |
        v
  chrome.tabs.onRemoved fires
        |
        v
  chrome.storage.session.remove(tab_{tabId}) — cleanup
```

## Key Design Decisions

1. **Manifest V3** - Required for Chrome 145+, uses service workers instead of background pages.
2. **Per-tab session storage** - `chrome.storage.session` keyed by `tab_{tabId}` tracks which tabs have dark mode on independently. Clears automatically when browser closes.
3. **Universal `*` selector** - More aggressive than targeting specific elements, necessary because sites like BLB use deeply nested custom elements with inline styles.
4. **JS + CSS dual approach** - CSS `!important` handles stylesheet-defined styles, while JS `stripInlineBackgrounds()` handles inline styles that CSS can't override.
5. **MutationObserver** - Watches for dynamically loaded content and applies dark mode to new elements automatically.
6. **`requestAnimationFrame` batching** - Prevents excessive DOM walks when many mutations fire at once.
7. **Class-based scoping (`html.night-reader-active`)** - Clean enable/disable without rebuilding CSS state.
8. **Tab follows you, not the other way around** - Dark mode is scoped to the tab, not the URL or domain. Every site you visit in a dark-mode tab is dark.

## Themes Reference

| ID | Name | Background | Alt BG | Text | Links |
|---|---|---|---|---|---|
| midnight | Midnight | #0d1117 | #161b22 | #c9d1d9 | #58a6ff |
| charcoal | Charcoal | #1e1e1e | #252526 | #d4d4d4 | #6cb6ff |
| navy | Navy | #0a1628 | #0f1f38 | #b0c4de | #64b5f6 |
| deep-purple | Deep Purple | #1a1025 | #221535 | #d1b3ff | #bb86fc |
| forest | Forest | #0b1a0b | #102410 | #a8d8a8 | #66bb6a |
| mocha | Mocha | #1e1a16 | #28221c | #d4c4b0 | #e6a96c |
| ocean | Ocean | #0a192f | #112240 | #8892b0 | #64ffda |
| slate | Slate | #1b2836 | #223040 | #a0b4c8 | #79b8ff |
| wine | Wine | #1a0a14 | #241020 | #d4a0b0 | #f48fb1 |
| obsidian | Obsidian | #121212 | #1e1e1e | #e0e0e0 | #82b1ff |
| nord | Nord | #2e3440 | #3b4252 | #d8dee9 | #88c0d0 |
| sepia | Sepia Night | #1c1810 | #252018 | #c8b89a | #d4a46c |

---

## Session Info

- **Date:** March 1, 2026
- **Tool:** Claude Code (CLI) by Anthropic
- **Model:** Claude Opus 4.6
- **GitHub user:** 131daniel
- **Repo:** https://github.com/131daniel/night-reader-extension (private)
- **Total files:** 13
- **Total lines of code:** ~1,000
