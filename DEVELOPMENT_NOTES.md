# Development Notes - Night Reader Extension

Full conversation log and development notes from building this extension.

## Project Overview

**Goal:** Build a Chrome extension that enables dark mode with various dark color options for reading Blue Letter Bible (https://www.blueletterbible.org/) and other websites at night.

**Target Environment:**
- Chrome Version 145.0.7632.117 (Official Build) (arm64)
- macOS 26.3 (25D125)

**Built with:** Claude Code (Claude Opus 4.6) by Anthropic

---

## Conversation & Build Log

### Initial Request

> "code me a plugin for google chrome (that enables me to run dark mode with various dark color options, i want to read 'https://www.blueletterbible.org/' and other websites i choose in these dark theme) Version 145.0.7632.117 (Official Build) (arm64), running on mac os 26.3 (25D125)"

### Phase 1: Initial Build

Created the full extension structure:

1. **manifest.json** - Chrome Manifest V3 configuration with permissions for `activeTab`, `storage`, `scripting`, and `<all_urls>` host permissions.

2. **popup.html / popup.css / popup.js** - The extension popup UI featuring:
   - Dark mode on/off toggle
   - 12 theme color swatches in a 4-column grid
   - Brightness slider (50%-100%)
   - Contrast slider (80%-120%)
   - Current site hostname display
   - All settings persisted via `chrome.storage.local`

3. **content.js** (v1) - Content script that:
   - Defined 12 dark themes with bg, text, link, border, and input colors
   - Built CSS with `!important` overrides on common HTML elements
   - Applied `filter: brightness() contrast()` on the html element
   - Targeted inline white backgrounds with attribute selectors

4. **background.js** - Service worker that:
   - Sets default settings on install
   - Re-injects content script into already-open tabs on install/update

5. **icons/** - Generated 16x16, 48x48, and 128x128 PNG icons programmatically using Python (moon crescent + stars design in purple on dark background).

### 12 Themes Included

| ID | Name | Background | Text Color |
|---|---|---|---|
| midnight | Midnight | #0d1117 | #c9d1d9 |
| charcoal | Charcoal | #1e1e1e | #d4d4d4 |
| navy | Navy | #0a1628 | #b0c4de |
| deep-purple | Deep Purple | #1a1025 | #d1b3ff |
| forest | Forest | #0b1a0b | #a8d8a8 |
| mocha | Mocha | #1e1a16 | #d4c4b0 |
| ocean | Ocean | #0a192f | #8892b0 |
| slate | Slate | #1b2836 | #a0b4c8 |
| wine | Wine | #1a0a14 | #d4a0b0 |
| obsidian | Obsidian | #121212 | #e0e0e0 |
| nord | Nord | #2e3440 | #d8dee9 |
| sepia | Sepia Night | #1c1810 | #c8b89a |

---

### Phase 2: Bug Fix - White Backgrounds Not Fully Removed

**Problem:** After testing on Blue Letter Bible, the text color changed correctly but the white background was still visible. The CSS `!important` approach only dimmed it rather than fully replacing it. The site uses deeply nested elements with inline styles that override stylesheet rules.

**User feedback:**
> "the text color changes but i need the white background completely gone, it appears to only make it dimmer. update"

**Root cause:** Blue Letter Bible (and many sites) set background colors via:
- Inline `style="background-color: ..."` attributes
- Deeply specific CSS selectors
- Dynamically generated elements

CSS `!important` alone couldn't beat inline styles on all elements.

**Solution - Complete rewrite of content.js (v2):**

1. **Universal background killer** - Changed from targeting specific HTML tags to a universal selector:
   ```css
   html.night-reader-active *:not(img):not(video)... {
     background-color: ${t.bg} !important;
     background-image: none !important;
   }
   ```

2. **JavaScript inline style stripping** - Added `stripInlineBackgrounds()` function that walks the entire DOM and removes:
   - `background-color`
   - `background`
   - `background-image`
   - `color`
   from every element's inline `style` attribute.

3. **MutationObserver** - Watches for:
   - New elements added to the DOM (`childList`)
   - Style attribute changes (`attributes` with `attributeFilter: ['style']`)
   - Calls `stripInlineBackgrounds()` via `requestAnimationFrame` when changes detected

4. **Class-based scoping** - All CSS rules now scoped under `html.night-reader-active` class, making toggle on/off clean.

5. **Anti-flash injection** - On `document_start`, immediately injects `html { background: #0d1117 }` to prevent white flash before the full dark mode loads.

6. **Added `bgAlt` color** to each theme for subtle depth differentiation on containers.

**Result:** White backgrounds completely eliminated on Blue Letter Bible and other sites. The Midnight and Ocean themes were tested and confirmed working perfectly.

---

### Phase 3: GitHub Publishing

- Installed GitHub CLI via Homebrew (`brew install gh`)
- Authenticated as `131daniel` via browser-based OAuth
- SSH key generated and uploaded: `SONOFGOD131`
- Created this README, development notes, and pushed to GitHub

---

## Technical Architecture

```
User clicks extension icon
        │
        ▼
  popup.html loads
        │
        ▼
  popup.js reads chrome.storage.local
        │
        ▼
  Renders UI with saved settings
        │
        ▼
  User changes setting
        │
        ├──► chrome.storage.local.set()
        │
        └──► chrome.tabs.sendMessage({ action: 'applySettings' })
                    │
                    ▼
              content.js receives message
                    │
                    ▼
              loadAndApply()
                    │
                    ├──► Reads chrome.storage.local
                    │
                    ├──► Builds CSS string from theme
                    │
                    ├──► Injects/updates <style> element
                    │
                    ├──► Adds .night-reader-active to <html>
                    │
                    ├──► stripInlineBackgrounds() - removes inline styles
                    │
                    └──► Starts MutationObserver for dynamic content
```

## Key Design Decisions

1. **Manifest V3** - Required for Chrome 145+, uses service workers instead of background pages.

2. **Universal `*` selector** - More aggressive than targeting specific elements, but necessary because sites like BLB use deeply nested custom elements.

3. **JS + CSS dual approach** - CSS `!important` handles stylesheet-defined styles, while JS handles inline styles that CSS can't always override.

4. **MutationObserver** - Essential for single-page apps and sites that load content dynamically (AJAX, lazy loading).

5. **`requestAnimationFrame` batching** - Prevents excessive DOM walks when many mutations fire at once.

6. **Class-based scoping (`html.night-reader-active`)** - Clean enable/disable without having to rebuild or compare CSS state.

---

## Date

Built on March 1, 2026.
