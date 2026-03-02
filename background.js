// Set default settings on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['enabled', 'themeId', 'brightness', 'contrast'], (data) => {
    const defaults = {
      enabled: data.enabled ?? false,
      themeId: data.themeId || 'midnight',
      brightness: data.brightness ?? 100,
      contrast: data.contrast ?? 100,
    };
    chrome.storage.local.set(defaults);
  });
});

// Re-inject content script into already-open tabs when extension is installed/updated
chrome.runtime.onInstalled.addListener(async () => {
  const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
  for (const tab of tabs) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
    } catch {
      // Skip tabs where injection isn't allowed (e.g. chrome:// pages)
    }
  }
});
