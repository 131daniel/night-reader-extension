// ─── Theme background colours (used for instant flash prevention) ────────────
const THEME_BG = {
  'midnight':    '#0d1117',
  'charcoal':    '#1e1e1e',
  'navy':        '#0a1628',
  'deep-purple': '#1a1025',
  'forest':      '#0b1a0b',
  'mocha':       '#1e1a16',
  'ocean':       '#0a192f',
  'slate':       '#1b2836',
  'wine':        '#1a0a14',
  'obsidian':    '#121212',
  'nord':        '#2e3440',
  'sepia':       '#1c1810',
};

// ─── Default settings on install ─────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['themeId', 'brightness', 'contrast'], (data) => {
    chrome.storage.local.set({
      themeId:    data.themeId    || 'midnight',
      brightness: data.brightness ?? 100,
      contrast:   data.contrast   ?? 100,
    });
  });
});

// ─── Handle tab navigation ────────────────────────────────────────────────────
// Fires twice per navigation: once on 'loading', once on 'complete'.
// On 'loading'  → instantly inject a 1-line dark background CSS so the
//                 page never flashes white, not even for a frame.
// On 'complete' → inject the full content.js for the complete dark theme.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  const key = `tab_${tabId}`;
  const result = await chrome.storage.session.get(key);
  if (!result[key]) return; // Dark mode not active on this tab — do nothing

  // ── Step 1: Instant background on navigation start ──────────────────────
  if (changeInfo.status === 'loading') {
    try {
      const settings = await chrome.storage.local.get(['themeId']);
      const bg = THEME_BG[settings.themeId] || '#0d1117';
      await chrome.scripting.insertCSS({
        target: { tabId },
        css: `html,body{background:${bg}!important;background-image:none!important;}`,
      });
    } catch {
      // Restricted page — skip silently
    }
    return;
  }

  // ── Step 2: Full dark theme once page is completely loaded ───────────────
  if (changeInfo.status === 'complete') {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
      });
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, { action: 'applySettings' }).catch(() => {});
      }, 100);
    } catch {
      // Restricted page — skip silently
    }
  }
});

// ─── Clean up session state when a tab is closed ─────────────────────────────
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`tab_${tabId}`);
});
