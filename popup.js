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

const themeGrid = document.getElementById('themeGrid');
const darkModeToggle = document.getElementById('darkModeToggle');
const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessValue = document.getElementById('brightnessValue');
const contrastSlider = document.getElementById('contrastSlider');
const contrastValue = document.getElementById('contrastValue');
const siteInfo = document.getElementById('siteInfo');

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

// Show current site
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.url) {
    try {
      const hostname = new URL(tabs[0].url).hostname;
      siteInfo.textContent = hostname;
    } catch {
      siteInfo.textContent = '—';
    }
  }
});

// Load saved settings
chrome.storage.local.get(['enabled', 'themeId', 'brightness', 'contrast'], (data) => {
  darkModeToggle.checked = data.enabled ?? false;
  brightnessSlider.value = data.brightness ?? 100;
  brightnessValue.textContent = (data.brightness ?? 100) + '%';
  contrastSlider.value = data.contrast ?? 100;
  contrastValue.textContent = (data.contrast ?? 100) + '%';

  const activeId = data.themeId || 'midnight';
  highlightSwatch(activeId);
});

function highlightSwatch(themeId) {
  document.querySelectorAll('.theme-swatch').forEach(el => {
    el.classList.toggle('active', el.dataset.themeId === themeId);
  });
}

function selectTheme(themeId) {
  highlightSwatch(themeId);
  chrome.storage.local.set({ themeId });
  applyToActiveTab();
}

darkModeToggle.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: darkModeToggle.checked });
  applyToActiveTab();
});

brightnessSlider.addEventListener('input', () => {
  brightnessValue.textContent = brightnessSlider.value + '%';
  chrome.storage.local.set({ brightness: parseInt(brightnessSlider.value) });
  applyToActiveTab();
});

contrastSlider.addEventListener('input', () => {
  contrastValue.textContent = contrastSlider.value + '%';
  chrome.storage.local.set({ contrast: parseInt(contrastSlider.value) });
  applyToActiveTab();
});

function applyToActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'applySettings' });
    }
  });
}
