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
// When a dark-mode tab finishes loading, inject the full content.js theme.
// (The instant dark background is handled by flash-guard.js at document_start.)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status !== 'complete') return;

  const key = `tab_${tabId}`;
  const result = await chrome.storage.session.get(key);
  if (!result[key]) return; // Dark mode not active on this tab — do nothing

  try {
    // Set sessionStorage flag so flash-guard.js works on next same-origin nav
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => sessionStorage.setItem('night-reader', '1'),
    });
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
});

// ─── Handle getTabState from flash-guard.js ─────────────────────────────────
// flash-guard.js runs at document_start (before any paint) and asks us whether
// dark mode is active for the tab it's running in. We reply with { enabled, bg }
// so it can either keep the dark background or remove it instantly.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== 'getTabState') return false;

  const tabId = sender.tab?.id;
  if (!tabId) {
    sendResponse({ enabled: false });
    return false;
  }

  const key = `tab_${tabId}`;
  // Must return true to use sendResponse asynchronously
  Promise.all([
    chrome.storage.session.get(key),
    chrome.storage.local.get(['themeId']),
  ]).then(([sessionData, localData]) => {
    const enabled = sessionData[key] ?? false;
    const themeId = localData.themeId || 'midnight';
    const bg = THEME_BG[themeId] || '#0d1117';
    sendResponse({ enabled, bg });
  });
  return true; // keep message channel open for async response
});

// ─── Clean up session state when a tab is closed ─────────────────────────────
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`tab_${tabId}`);
});
