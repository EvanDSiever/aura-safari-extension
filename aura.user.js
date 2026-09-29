// ==UserScript==
// @name         Aura — Google Workspace & Website Color Visualizer
// @namespace    https://github.com/EvanDSiever/aura-safari-extension
// @version      1.2.0
// @description  Ultra-lightweight dark theme for Google Docs, Sheets, Drive, Classroom (keeps paper white!) and general website visualizer.
// @match        https://docs.google.com/*
// @match        https://drive.google.com/*
// @match        https://classroom.google.com/*
// @match        https://keep.google.com/*
// @match        https://*/*
// @match        http://*/*
// @include      *://*/*
// @include      *
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
  'use strict';

  const GOOGLE_DARK_CSS = `
    :root {
      --aura-g-bg: #1e1e1e;
      --aura-g-surface: #282828;
      --aura-g-surface-elevated: #323232;
      --aura-g-border: rgba(255, 255, 255, 0.12);
      --aura-g-text: #e8eaed;
      --aura-g-text-secondary: #9aa0a6;
      --aura-g-accent: #8ab4f8;
      --aura-brightness: 1;
      --aura-contrast: 1;
      --aura-sepia: 0;
    }

    /* ==========================================
       GOOGLE DOCS & SHEETS & SLIDES (CHROME)
       ========================================== */
    html[data-aura-google-mode="true"] body {
      background-color: var(--aura-g-bg) !important;
      color: var(--aura-g-text) !important;
    }

    /* Top Bars, Navigation, Rulers */
    html[data-aura-google-mode="true"] #docs-chrome,
    html[data-aura-google-mode="true"] #docs-header,
    html[data-aura-google-mode="true"] .docs-titlebar,
    html[data-aura-google-mode="true"] .docs-titlebar-buttons,
    html[data-aura-google-mode="true"] .docs-material-menubar,
    html[data-aura-google-mode="true"] .goog-toolbar,
    html[data-aura-google-mode="true"] #kix-horizontal-ruler,
    html[data-aura-google-mode="true"] #kix-vertical-ruler,
    html[data-aura-google-mode="true"] #formula-bar,
    html[data-aura-google-mode="true"] .formula-bar-separator,
    html[data-aura-google-mode="true"] #grid-bottom-bar,
    html[data-aura-google-mode="true"] .docs-sheet-tab,
    html[data-aura-google-mode="true"] .filmstrip,
    html[data-aura-google-mode="true"] header,
    html[data-aura-google-mode="true"] nav {
      background: var(--aura-g-surface) !important;
      color: var(--aura-g-text) !important;
      border-color: var(--aura-g-border) !important;
    }

    /* Background behind the document page */
    html[data-aura-google-mode="true"] .kix-appview-editor,
    html[data-aura-google-mode="true"] #kix-appview,
    html[data-aura-google-mode="true"] .docs-editor,
    html[data-aura-google-mode="true"] [role="main"] {
      background-color: var(--aura-g-bg) !important;
    }

    /* Menus, Dropdowns & Modals */
    html[data-aura-google-mode="true"] .goog-menu,
    html[data-aura-google-mode="true"] .docs-material-menu-item,
    html[data-aura-google-mode="true"] .modal-dialog,
    html[data-aura-google-mode="true"] .docs-bubble {
      background-color: var(--aura-g-surface-elevated) !important;
      color: var(--aura-g-text) !important;
      border-color: var(--aura-g-border) !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
    }

    html[data-aura-google-mode="true"] .goog-menuitem-content,
    html[data-aura-google-mode="true"] .docs-title-input {
      color: var(--aura-g-text) !important;
    }

    /* Invert Toolbar Icons to make them white on dark */
    html[data-aura-google-mode="true"] .goog-toolbar-button,
    html[data-aura-google-mode="true"] .goog-toolbar-menu-button {
      filter: invert(0.85) hue-rotate(180deg) !important;
    }

    /* ==========================================
       CRITICAL: PRESERVE CLEAN WHITE DOCUMENT PAGE
       ========================================== */
    html[data-aura-google-mode="true"] .kix-page,
    html[data-aura-google-mode="true"] .kix-page-paginated,
    html[data-aura-google-mode="true"] .kix-page-compact {
      background-color: #ffffff !important;
      color: #000000 !important;
      box-shadow: 0 2px 14px rgba(0, 0, 0, 0.5) !important;
    }

    /* Never invert the canvas tiles inside the doc */
    html[data-aura-google-mode="true"] .kix-canvas-tile-content {
      filter: none !important;
    }

    /* Spreadsheet Grid: Natural White Cells */
    html[data-aura-google-mode="true"] #grid-table-container,
    html[data-aura-google-mode="true"] .grid-container {
      filter: none !important;
    }

    /* Presentation Slides: Natural White/Colored Slides */
    html[data-aura-google-mode="true"] .punch-viewer-svgpage,
    html[data-aura-google-mode="true"] .punch-filmstrip-thumbnail {
      filter: none !important;
    }

    /* ==========================================
       GENERAL WEBSITE DARK MODE (NON-GOOGLE SITES)
       ========================================== */
    html[data-aura-active="true"] {
      filter: invert(1) hue-rotate(180deg) brightness(var(--aura-brightness, 1)) contrast(var(--aura-contrast, 1)) sepia(var(--aura-sepia, 0)) !important;
      background-color: #121212 !important;
    }

    /* Protect images, video, and visual media from double inversion */
    html[data-aura-active="true"] img,
    html[data-aura-active="true"] video,
    html[data-aura-active="true"] svg image,
    html[data-aura-active="true"] [role="img"]:not(svg),
    html[data-aura-active="true"] canvas:not(.aura-invert-target) {
      filter: invert(1) hue-rotate(180deg) !important;
    }
  `;

  // Safe CSS injection with GM_addStyle support
  function applyStyles() {
    if (typeof GM_addStyle === 'function') {
      GM_addStyle(GOOGLE_DARK_CSS);
    } else {
      const style = document.createElement('style');
      style.id = 'aura-userscript-style';
      style.textContent = GOOGLE_DARK_CSS;
      (document.head || document.documentElement).appendChild(style);
    }
  }

  // Detect Google Apps
  const host = window.location.hostname.toLowerCase();
  const isGoogle = host.includes('docs.google.com') ||
                   host.includes('drive.google.com') ||
                   host.includes('classroom.google.com') ||
                   host.includes('keep.google.com');

  function activate() {
    const root = document.documentElement;
    if (!root) return;

    if (isGoogle) {
      root.setAttribute('data-aura-google-mode', 'true');
    } else {
      root.setAttribute('data-aura-active', 'true');
    }
  }

  // Apply CSS immediately
  applyStyles();
  activate();

  // Watch for DOM changes to ensure attributes persist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activate);
  }
  window.addEventListener('load', activate);

  // Keyboard shortcut: Option+Shift+D
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && (e.code === 'KeyD' || e.key === 'Î' || e.key === 'D')) {
      const root = document.documentElement;
      const isActive = root.getAttribute('data-aura-google-mode') === 'true' || root.getAttribute('data-aura-active') === 'true';

      if (isActive) {
        root.removeAttribute('data-aura-google-mode');
        root.removeAttribute('data-aura-active');
      } else {
        activate();
      }
    }
  });
})();
