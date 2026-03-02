const THEMES = [
  { id: 'midnight',   name: 'Midnight',    bg: '#0d1117', text: '#c9d1d9' },
  { id: 'charcoal',   name: 'Charcoal',    bg: '#1e1e1e', text: '#d4d4d4' },
  { id: 'navy',       name: 'Navy',        bg: '#0a1628', text: '#b0c4de' },
  { id: 'deep-purple',name: 'Deep Purple', bg: '#1a1025', text: '#d1b3ff' },
  { id: 'forest',     name: 'Forest',      bg: '#0b1a0b', text: '#a8d8a8' },
  { id: 'mocha',      name: 'Mocha',       bg: '#1e1a16', text: '#d4c4b0' },
  { id: 'ocean',      name: 'Ocean',       bg: '#0a192f', text: '#8892b0' },
  { id: 'slate',      name: 'Slate',       bg: '#1b2836', text: '#a0b4c8' },
  { id: 'wine',       name: 'Wine',        bg: '#1a0a14', text: '#d4a0b0' },
  { id: 'obsidian',   name: 'Obsidian',    bg: '#121212', text: '#e0e0e0' },
  { id: 'nord',       name: 'Nord',        bg: '#2e3440', text: '#d8dee9' },
  { id: 'sepia',      name: 'Sepia Night', bg: '#1c1810', text: '#c8b89a' },
];

const themeGrid       = document.getElementById('themeGrid');
const darkModeToggle  = document.getElementById('darkModeToggle');
const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessValue = document.getElementById('brightnessValue');
const contrastSlider  = document.getElementById('contrastSlider');
const contrastValue   = document.getElementById('contrastValue');
const siteInfo        = document.getElementById('siteInfo');

let currentTabId = null;

// Build theme swatches
THEMES.forEach(theme => {
  const swatch = document.createElement('button');
  swatch.className = 'theme-swatch';
  swatch.dataset.themeId = theme.id;
  swatch.innerHTML = `
    <div class="swatch-color" style="background:${theme.bg}">
      <span class="swatch-text-preview" style="color:${theme.text}">Aa</span>
    </div>
    <span class="theme-name">${theme.name}</span>
  `;
  swatch.addEventListener('click', () => selectTheme(theme.id));
  themeGrid.appendChild(swatch);
});

// Initialise popup — load current tab's state
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const tab = tabs[0];
  if (!tab) return;

  currentTabId = tab.id;

  // Show site hostname
  try {
    siteInfo.textContent = new URL(tab.url).hostname;
  } catch {
    siteInfo.textContent = '—';
  }

  // Load per-tab dark mode state from session storage
  const sessionKey = `tab_${currentTabId}`;
  const sessionData = await chrome.storage.session.get(sessionKey);
  const tabEnabled = sessionData[sessionKey] ?? false;

  // Load global theme/brightness/contrast settings
  chrome.storage.local.get(['themeId', 'brightness', 'contrast'], (data) => {
    darkModeToggle.checked    = tabEnabled;
    brightnessSlider.value    = data.brightness ?? 100;
    brightnessValue.textContent = (data.brightness ?? 100) + '%';
    contrastSlider.value      = data.contrast ?? 100;
    contrastValue.textContent = (data.contrast ?? 100) + '%';
    highlightSwatch(data.themeId || 'midnight');
  });
});

function highlightSwatch(themeId) {
  document.querySelectorAll('.theme-swatch').forEach(el => {
    el.classList.toggle('active', el.dataset.themeId === themeId);
  });
}

function selectTheme(themeId) {
  highlightSwatch(themeId);
  chrome.storage.local.set({ themeId });
  applyToCurrentTab();
}

darkModeToggle.addEventListener('change', () => {
  applyToCurrentTab();
});

brightnessSlider.addEventListener('input', () => {
  brightnessValue.textContent = brightnessSlider.value + '%';
  chrome.storage.local.set({ brightness: parseInt(brightnessSlider.value) });
  applyToCurrentTab();
});

contrastSlider.addEventListener('input', () => {
  contrastValue.textContent = contrastSlider.value + '%';
  chrome.storage.local.set({ contrast: parseInt(contrastSlider.value) });
  applyToCurrentTab();
});

async function applyToCurrentTab() {
  if (!currentTabId) return;

  const enabled = darkModeToggle.checked;

  // Save this tab's dark mode state to session storage
  // Background service worker watches this to re-inject on navigation
  const sessionKey = `tab_${currentTabId}`;
  await chrome.storage.session.set({ [sessionKey]: enabled });

  // Also save the enabled state so content.js can read it
  chrome.storage.local.set({ enabled });

  // Skip restricted pages
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

  try {
    // Inject content script into the current tab
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ['content.js'],
    });
  } catch {
    // Already injected — that's fine
  }

  // Tell content script to apply latest settings
  chrome.tabs.sendMessage(currentTabId, { action: 'applySettings' }).catch(() => {});
}
