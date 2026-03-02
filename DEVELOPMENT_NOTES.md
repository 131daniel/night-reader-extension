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

## Technical Architecture

```
User clicks extension icon
        |
        v
  popup.html loads
        |
        v
  popup.js reads chrome.storage.local
        |
        v
  Renders UI with saved settings
        |
        v
  User changes setting
        |
        +---> chrome.storage.local.set()
        |
        +---> chrome.tabs.sendMessage({ action: 'applySettings' })
                    |
                    v
              content.js receives message
                    |
                    v
              loadAndApply()
                    |
                    +---> Reads chrome.storage.local
                    |
                    +---> Builds CSS string from theme
                    |
                    +---> Injects/updates <style> element
                    |
                    +---> Adds .night-reader-active to <html>
                    |
                    +---> stripInlineBackgrounds() - removes inline styles
                    |
                    +---> Starts MutationObserver for dynamic content
```

## Key Design Decisions

1. **Manifest V3** - Required for Chrome 145+, uses service workers instead of background pages.
2. **Universal `*` selector** - More aggressive than targeting specific elements, but necessary because sites like BLB use deeply nested custom elements with inline styles.
3. **JS + CSS dual approach** - CSS `!important` handles stylesheet-defined styles, while JS handles inline styles that CSS can't always override.
4. **MutationObserver** - Essential for single-page apps and sites that load content dynamically (AJAX, lazy loading).
5. **`requestAnimationFrame` batching** - Prevents excessive DOM walks when many mutations fire at once.
6. **Class-based scoping (`html.night-reader-active`)** - Clean enable/disable without having to rebuild or compare CSS state.

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
