// ─── Default settings on install ───────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['themeId', 'brightness', 'contrast'], (data) => {
    chrome.storage.local.set({
      themeId:    data.themeId    || 'midnight',
      brightness: data.brightness ?? 100,
      contrast:   data.contrast   ?? 100,
    });
  });
});

// ─── Re-inject dark mode when a tracked tab navigates to a new page ─────────
// chrome.storage.session stores per-tab dark mode state.
// It survives service worker restarts but clears when the browser closes.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  // Only act when the page has fully loaded
  if (changeInfo.status !== 'complete') return;

  // Check if this tab has dark mode enabled
  const key = `tab_${tabId}`;
  const result = await chrome.storage.session.get(key);
  if (!result[key]) return; // Dark mode not active on this tab

  try {
    // Re-inject content script into the freshly loaded page
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
    // Give the script a moment to initialise, then send apply signal
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { action: 'applySettings' }).catch(() => {});
    }, 100);
  } catch {
    // chrome:// pages or restricted URLs — silently skip
  }
});

// ─── Clean up session state when a tab is closed ────────────────────────────
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`tab_${tabId}`);
});
