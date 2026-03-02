# Night Reader - Dark Mode Chrome Extension

A Chrome extension that applies customizable dark themes to **any website** for comfortable night reading. Built specifically for reading sites like [Blue Letter Bible](https://www.blueletterbible.org/) and any other website you choose.

![Night Reader - Midnight Theme](screenshots/midnight-theme.png)
![Night Reader - Ocean Theme](screenshots/ocean-theme.png)

---

## Install from Chrome Web Store

> **Coming soon to the Chrome Web Store!**
> Once published, click the link below to install in one click — no setup needed.

🔗 *(Chrome Web Store link will appear here once approved)*

---

## Features

- **12 Dark Themes** — Choose from a variety of carefully crafted dark color schemes
- **Universal Dark Mode** — Forces dark backgrounds on ALL elements, even stubborn inline styles
- **Brightness Control** — Adjust from 50% to 100% to find your comfort level
- **Contrast Control** — Fine-tune contrast from 80% to 120%
- **Persistent Settings** — Your preferences are saved and applied automatically
- **Anti-Flash** — Early injection prevents the white flash when pages load
- **Dynamic Content Support** — Watches for new elements and darkens them too
- **Works Everywhere** — Tested on Blue Letter Bible, and works on any website

---

## Available Themes

| Theme | Background | Best For |
|---|---|---|
| Midnight | `#0d1117` | GitHub-style dark, great default |
| Charcoal | `#1e1e1e` | VS Code-style neutral dark |
| Navy | `#0a1628` | Deep blue, easy on the eyes |
| Deep Purple | `#1a1025` | Rich purple tones |
| Forest | `#0b1a0b` | Green-tinted, nature feel |
| Mocha | `#1e1a16` | Warm brown, cozy reading |
| Ocean | `#0a192f` | Cool blue with teal accents |
| Slate | `#1b2836` | Neutral blue-grey |
| Wine | `#1a0a14` | Warm reddish dark |
| Obsidian | `#121212` | True dark / AMOLED-friendly |
| Nord | `#2e3440` | Popular Nord color scheme |
| Sepia Night | `#1c1810` | Warm sepia for long reading sessions |

---

## How to Use Night Reader

Once installed from the Chrome Web Store:

1. **Click** the Night Reader 🌙 icon in your Chrome toolbar
2. **Toggle** Dark Mode ON with the switch
3. **Pick a theme** — click any of the 12 color circles
4. **Adjust brightness** — slide left for dimmer, right for brighter
5. **Adjust contrast** — slide left for softer, right for sharper text
6. Your settings are **saved automatically** — they'll be there next time you open Chrome

---

## Screenshots

### Before (Original Light Mode)
![Before - Light Mode](screenshots/before.png)

### After — Midnight Theme
![After - Midnight Theme](screenshots/midnight-theme.png)

### After — Ocean Theme
![After - Ocean Theme](screenshots/ocean-theme.png)

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Dark mode not applying | Make sure the toggle is ON, then **refresh the page** |
| Some elements still white | Refresh the page — the extension will catch dynamic content |
| Icon not visible in toolbar | Click the puzzle piece 🧩 icon and **pin** Night Reader |
| Chrome system pages stay white | Extensions can't modify `chrome://` pages — Chrome security restriction |

---

## How It Works (Technical)

- **CSS Injection** — Injects a stylesheet that forces dark backgrounds on every element
- **Inline Style Stripping** — JavaScript removes inline background and color styles CSS can't override
- **MutationObserver** — Watches for dynamically loaded content and darkens it automatically
- **Chrome Storage API** — Persists your settings across browser sessions

## File Structure

```
night-reader-extension/
├── manifest.json      # Chrome extension config (Manifest V3)
├── background.js      # Service worker
├── content.js         # Dark mode engine
├── popup.html         # Extension popup UI
├── popup.css          # Popup styling
├── popup.js           # Popup logic & 12 themes
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── screenshots/
    ├── before.png
    ├── midnight-theme.png
    └── ocean-theme.png
```

## Built With

- Chrome Extension Manifest V3
- Vanilla JavaScript (no dependencies)
- Chrome Storage API
- MutationObserver API

## License

Free to use and share. Built with [Claude Code](https://claude.ai/) by Anthropic.

---

*Built for comfortable night reading of the Word and any other website.* 🌙
