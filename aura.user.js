// ==UserScript==
// @name         Aura — Google Workspace & Website Color Visualizer
// @namespace    https://github.com/EvanDSiever/aura-safari-extension
// @version      1.1.0
// @description  Ultra-lightweight dark theme for Google Docs, Sheets, Drive, Classroom (keeps paper white!) and general website visualizer.
// @match        *://*/*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
  'use strict';

  // Base CSS for media protection & filters
  const BASE_CSS = `
    :root {
      --aura-brightness: 1;
      --aura-contrast: 1;
      --aura-sepia: 0;
      --aura-g-bg: #1e1e1e;
      --aura-g-surface: #282828;
      --aura-g-border: rgba(255, 255, 255, 0.12);
      --aura-g-text: #e8eaed;
      --aura-g-canvas-brightness: 1;
    }

    /* Google Docs dark chrome + WHITE DOCUMENT PAPER */
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] #docs-chrome,
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] #docs-header,
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] .docs-titlebar-buttons,
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] .docs-material-menubar,
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] .goog-toolbar,
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] #kix-horizontal-ruler,
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] #kix-vertical-ruler {
      background: var(--aura-g-surface) !important;
      color: var(--aura-g-text) !important;
      border-color: var(--aura-g-border) !important;
    }
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] .kix-appview-editor,
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] #kix-appview {
      background-color: var(--aura-g-bg) !important;
    }
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] .goog-menu,
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] .docs-material-menu-item {
      background-color: var(--aura-g-surface) !important;
      color: var(--aura-g-text) !important;
    }
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] .goog-toolbar-button,
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] .goog-toolbar-menu-button {
      filter: invert(0.85) hue-rotate(180deg);
    }
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] .kix-page,
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] .kix-page-paginated {
      background-color: #ffffff !important;
      filter: brightness(var(--aura-g-canvas-brightness, 1)) !important;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.45) !important;
    }
    html[data-aura-google-mode="true"][data-aura-google-app="docs"] .kix-canvas-tile-content {
      filter: none !important;
    }

    /* Google Sheets */
    html[data-aura-google-mode="true"][data-aura-google-app="sheets"] #docs-chrome,
    html[data-aura-google-mode="true"][data-aura-google-app="sheets"] #formula-bar,
    html[data-aura-google-mode="true"][data-aura-google-app="sheets"] .docs-sheet-tab {
      background: var(--aura-g-surface) !important;
      color: var(--aura-g-text) !important;
    }

    /* Google Drive */
    html[data-aura-google-mode="true"][data-aura-google-app="drive"] body,
    html[data-aura-google-mode="true"][data-aura-google-app="drive"] [role="main"] {
      background-color: var(--aura-g-bg) !important;
      color: var(--aura-g-text) !important;
    }
    html[data-aura-google-mode="true"][data-aura-google-app="drive"] header,
    html[data-aura-google-mode="true"][data-aura-google-app="drive"] nav {
      background: var(--aura-g-surface) !important;
    }

    /* General Dark Mode Filter */
    html[data-aura-active="true"][data-aura-mode="dark"] {
      filter: invert(1) hue-rotate(180deg) brightness(var(--aura-brightness, 1)) contrast(var(--aura-contrast, 1)) sepia(var(--aura-sepia, 0)) !important;
      background-color: #121212 !important;
    }
    html[data-aura-active="true"][data-aura-inverted="true"] img,
    html[data-aura-active="true"][data-aura-inverted="true"] video,
    html[data-aura-active="true"][data-aura-inverted="true"] svg image,
    html[data-aura-active="true"][data-aura-inverted="true"] canvas:not(.aura-invert-target) {
      filter: invert(1) hue-rotate(180deg) !important;
    }
  `;

  // Inject style immediately
  const styleEl = document.createElement('style');
  styleEl.id = 'aura-style-sheet';
  styleEl.textContent = BASE_CSS;
  (document.head || document.documentElement).appendChild(styleEl);

  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname.toLowerCase();

  // Detect Google Apps
  let googleApp = null;
  if (host === 'docs.google.com') {
    if (path.startsWith('/spreadsheets')) googleApp = 'sheets';
    else if (path.startsWith('/presentation')) googleApp = 'slides';
    else googleApp = 'docs';
  } else if (host === 'drive.google.com') {
    googleApp = 'drive';
  } else if (host === 'classroom.google.com') {
    googleApp = 'classroom';
  } else if (host === 'keep.google.com') {
    googleApp = 'keep';
  }

  const root = document.documentElement;

  if (googleApp) {
    // Apply Google Student Suite Theme (leaves paper white!)
    root.setAttribute('data-aura-google-mode', 'true');
    root.setAttribute('data-aura-google-app', googleApp);
  } else {
    // Normal website dark mode
    root.setAttribute('data-aura-active', 'true');
    root.setAttribute('data-aura-mode', 'dark');
    root.setAttribute('data-aura-inverted', 'true');
  }

  // Keyboard shortcut: Option+Shift+D
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.code === 'KeyD') {
      const active = root.getAttribute('data-aura-active') === 'true' || root.getAttribute('data-aura-google-mode') === 'true';
      if (active) {
        root.removeAttribute('data-aura-active');
        root.removeAttribute('data-aura-google-mode');
      } else {
        if (googleApp) {
          root.setAttribute('data-aura-google-mode', 'true');
          root.setAttribute('data-aura-google-app', googleApp);
        } else {
          root.setAttribute('data-aura-active', 'true');
          root.setAttribute('data-aura-mode', 'dark');
          root.setAttribute('data-aura-inverted', 'true');
        }
      }
    }
  });
})();
