// Set default settings on first install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['enabled', 'themeId', 'brightness', 'contrast'], (data) => {
    chrome.storage.local.set({
      enabled:    data.enabled    ?? false,
      themeId:    data.themeId    || 'midnight',
      brightness: data.brightness ?? 100,
      contrast:   data.contrast   ?? 100,
    });
  });
});
