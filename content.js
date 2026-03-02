(() => {
  const THEMES = {
    'midnight':    { bg: '#0d1117', bgAlt: '#161b22', text: '#c9d1d9', link: '#58a6ff', border: '#21262d', inputBg: '#1c2128', inputText: '#c9d1d9' },
    'charcoal':    { bg: '#1e1e1e', bgAlt: '#252526', text: '#d4d4d4', link: '#6cb6ff', border: '#333333', inputBg: '#2d2d2d', inputText: '#d4d4d4' },
    'navy':        { bg: '#0a1628', bgAlt: '#0f1f38', text: '#b0c4de', link: '#64b5f6', border: '#1a2e4a', inputBg: '#142848', inputText: '#b0c4de' },
    'deep-purple': { bg: '#1a1025', bgAlt: '#221535', text: '#d1b3ff', link: '#bb86fc', border: '#2d1b4e', inputBg: '#2a1840', inputText: '#d1b3ff' },
    'forest':      { bg: '#0b1a0b', bgAlt: '#102410', text: '#a8d8a8', link: '#66bb6a', border: '#1a3a1a', inputBg: '#152e15', inputText: '#a8d8a8' },
    'mocha':       { bg: '#1e1a16', bgAlt: '#28221c', text: '#d4c4b0', link: '#e6a96c', border: '#3a3228', inputBg: '#302820', inputText: '#d4c4b0' },
    'ocean':       { bg: '#0a192f', bgAlt: '#112240', text: '#8892b0', link: '#64ffda', border: '#172a45', inputBg: '#1a3050', inputText: '#ccd6f6' },
    'slate':       { bg: '#1b2836', bgAlt: '#223040', text: '#a0b4c8', link: '#79b8ff', border: '#2a3a4e', inputBg: '#283848', inputText: '#a0b4c8' },
    'wine':        { bg: '#1a0a14', bgAlt: '#241020', text: '#d4a0b0', link: '#f48fb1', border: '#3a1a2a', inputBg: '#2e1528', inputText: '#d4a0b0' },
    'obsidian':    { bg: '#121212', bgAlt: '#1e1e1e', text: '#e0e0e0', link: '#82b1ff', border: '#2c2c2c', inputBg: '#262626', inputText: '#e0e0e0' },
    'nord':        { bg: '#2e3440', bgAlt: '#3b4252', text: '#d8dee9', link: '#88c0d0', border: '#434c5e', inputBg: '#434c5e', inputText: '#d8dee9' },
    'sepia':       { bg: '#1c1810', bgAlt: '#252018', text: '#c8b89a', link: '#d4a46c', border: '#32291e', inputBg: '#2c2418', inputText: '#c8b89a' },
  };

  const STYLE_ID = 'night-reader-dark-style';
  let observer = null;

  function buildCSS(theme, brightness, contrast) {
    const t = THEMES[theme] || THEMES['midnight'];
    // Use a massive universal selector approach to guarantee coverage
    return `
      /* ===== NIGHT READER - NUCLEAR DARK MODE ===== */

      /* Base filter for brightness/contrast */
      html.night-reader-active {
        filter: brightness(${brightness / 100}) contrast(${contrast / 100});
      }

      /* Force background on EVERYTHING */
      html.night-reader-active,
      html.night-reader-active body {
        background-color: ${t.bg} !important;
        background-image: none !important;
        color: ${t.text} !important;
      }

      /* Universal background killer - this is the key fix */
      html.night-reader-active *:not(img):not(video):not(canvas):not(picture):not(source):not(svg):not(svg *):not(input):not(textarea):not(select):not(button) {
        background-color: ${t.bg} !important;
        background-image: none !important;
      }

      /* Slightly lighter bg for nested containers to give depth */
      html.night-reader-active table,
      html.night-reader-active tr:nth-child(even),
      html.night-reader-active .content,
      html.night-reader-active [class*="container"],
      html.night-reader-active [class*="wrapper"],
      html.night-reader-active [class*="card"],
      html.night-reader-active [class*="panel"],
      html.night-reader-active [class*="box"],
      html.night-reader-active [class*="block"],
      html.night-reader-active [class*="section"],
      html.night-reader-active [class*="header"],
      html.night-reader-active [class*="nav"],
      html.night-reader-active [class*="menu"],
      html.night-reader-active [class*="sidebar"],
      html.night-reader-active [class*="toolbar"],
      html.night-reader-active [class*="bar"] {
        background-color: ${t.bgAlt} !important;
        background-image: none !important;
      }

      /* Force ALL text to theme color */
      html.night-reader-active * {
        color: ${t.text} !important;
        border-color: ${t.border} !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }

      /* Links */
      html.night-reader-active a,
      html.night-reader-active a *,
      html.night-reader-active a:visited,
      html.night-reader-active a:visited * {
        color: ${t.link} !important;
      }

      html.night-reader-active a:hover,
      html.night-reader-active a:hover * {
        opacity: 0.85;
      }

      /* Inputs/buttons get their own bg */
      html.night-reader-active input,
      html.night-reader-active textarea,
      html.night-reader-active select,
      html.night-reader-active button,
      html.night-reader-active [role="button"],
      html.night-reader-active [role="textbox"],
      html.night-reader-active [contenteditable="true"] {
        background-color: ${t.inputBg} !important;
        color: ${t.inputText} !important;
        border-color: ${t.border} !important;
        background-image: none !important;
      }

      /* Dim media for eye comfort */
      html.night-reader-active img,
      html.night-reader-active video,
      html.night-reader-active picture,
      html.night-reader-active canvas {
        opacity: 0.88 !important;
      }

      /* Keep SVG icons visible but let them inherit colors */
      html.night-reader-active svg {
        opacity: 0.9 !important;
      }

      /* Scrollbar */
      html.night-reader-active ::-webkit-scrollbar {
        width: 10px;
        background: ${t.bg} !important;
      }
      html.night-reader-active ::-webkit-scrollbar-thumb {
        background: ${t.border} !important;
        border-radius: 5px;
      }
      html.night-reader-active ::-webkit-scrollbar-track {
        background: ${t.bg} !important;
      }

      /* Iframes */
      html.night-reader-active iframe {
        opacity: 0.90 !important;
      }

      /* Override gradients */
      html.night-reader-active [style*="gradient"] {
        background-image: none !important;
        background-color: ${t.bgAlt} !important;
      }

      /* Selection color */
      html.night-reader-active ::selection {
        background-color: ${t.link} !important;
        color: ${t.bg} !important;
      }

      /* Placeholder text */
      html.night-reader-active ::placeholder {
        color: ${t.text} !important;
        opacity: 0.5 !important;
      }
    `;
  }

  // Strip inline background styles from all elements via JS
  function stripInlineBackgrounds() {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.id === STYLE_ID) return;
      const s = el.style;
      if (s.backgroundColor) s.removeProperty('background-color');
      if (s.background) s.removeProperty('background');
      if (s.backgroundImage) s.removeProperty('background-image');
      if (s.color) s.removeProperty('color');
    });
  }

  function applyDarkMode(enabled, themeId, brightness, contrast) {
    let styleEl = document.getElementById(STYLE_ID);

    if (!enabled) {
      if (styleEl) styleEl.remove();
      document.documentElement.classList.remove('night-reader-active');
      if (observer) { observer.disconnect(); observer = null; }
      return;
    }

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      styleEl.setAttribute('data-night-reader', 'true');
      (document.head || document.documentElement).appendChild(styleEl);
    }

    styleEl.textContent = buildCSS(themeId, brightness, contrast);
    document.documentElement.classList.add('night-reader-active');

    // Strip inline styles that fight our CSS
    stripInlineBackgrounds();

    // Watch for dynamically added elements and strip their inline styles too
    if (!observer) {
      observer = new MutationObserver((mutations) => {
        let needsStrip = false;
        for (const m of mutations) {
          if (m.type === 'childList' && m.addedNodes.length) {
            needsStrip = true;
            break;
          }
          if (m.type === 'attributes' && m.attributeName === 'style') {
            const el = m.target;
            if (el.id === STYLE_ID) continue;
            const s = el.style;
            if (s.backgroundColor || s.background || s.backgroundImage) {
              needsStrip = true;
              break;
            }
          }
        }
        if (needsStrip) {
          requestAnimationFrame(stripInlineBackgrounds);
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style'],
      });
    }
  }

  function loadAndApply() {
    chrome.storage.local.get(['enabled', 'themeId', 'brightness', 'contrast'], (data) => {
      applyDarkMode(
        data.enabled ?? false,
        data.themeId || 'midnight',
        data.brightness ?? 100,
        data.contrast ?? 100
      );
    });
  }

  // Apply on page load
  if (document.readyState === 'loading') {
    // Inject early CSS to prevent white flash
    const earlyStyle = document.createElement('style');
    earlyStyle.id = STYLE_ID + '-early';
    earlyStyle.textContent = 'html { background: #0d1117 !important; }';
    document.documentElement.appendChild(earlyStyle);

    document.addEventListener('DOMContentLoaded', () => {
      const early = document.getElementById(STYLE_ID + '-early');
      if (early) early.remove();
      loadAndApply();
    });
  } else {
    loadAndApply();
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'applySettings') {
      loadAndApply();
    }
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener(() => {
    loadAndApply();
  });
})();
