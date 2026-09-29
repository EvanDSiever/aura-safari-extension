/**
 * Aura Content Script
 * High-performance, lightweight color & dark mode engine for Safari
 */

(() => {
  'use strict';

  // Prevent multiple injections
  if (window.__AURA_INITIALIZED__) return;
  window.__AURA_INITIALIZED__ = true;

  const DEFAULT_SETTINGS = {
    enabled: true,
    mode: 'dark', // 'dark', 'oled', 'sepia', 'midnight', 'custom'
    brightness: 100, // percentage 50 - 150
    contrast: 100,   // percentage 50 - 150
    sepia: 0,        // percentage 0 - 100
    tintColor: '#ff9500',
    tintOpacity: 0,  // percentage 0 - 100
    smartDetection: true,
    syncWithSystem: false
  };

  const INVERTED_MODES = new Set(['dark', 'oled', 'midnight']);

  let currentSettings = { ...DEFAULT_SETTINGS };
  let siteOverrides = {};
  let excludedDomains = [];
  let isSiteExcluded = false;
  let overlayElement = null;

  const currentHost = window.location.hostname.toLowerCase();

  /**
   * Safe storage access wrapper supporting Chrome and Safari WebExtension API
   */
  const storageAPI = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local)
    ? chrome.storage.local
    : (typeof browser !== 'undefined' && browser.storage && browser.storage.local)
      ? browser.storage.local
      : null;

  /**
   * Calculates the perceived relative luminance of an RGB color
   */
  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  /**
   * Detects if the current webpage has a naturally dark background
   */
  function isPageNaturallyDark() {
    try {
      const el = document.body || document.documentElement;
      if (!el) return false;
      const bg = window.getComputedStyle(el).backgroundColor;
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1.0;
        
        // Transparent backgrounds default to browser viewport background (usually light)
        if (alpha < 0.2) return false;
        
        const lum = getLuminance(r, g, b);
        return lum < 0.22; // Threshold for dark pages (e.g. GitHub Dark, YouTube Dark)
      }
    } catch (e) {
      // Fail safely to light
    }
    return false;
  }

  /**
   * Ensures the tint overlay element exists in the DOM
   */
  function ensureOverlay() {
    if (!overlayElement) {
      overlayElement = document.getElementById('aura-tint-overlay');
      if (!overlayElement) {
        overlayElement = document.createElement('div');
        overlayElement.id = 'aura-tint-overlay';
        overlayElement.setAttribute('aria-hidden', 'true');
        const target = document.body || document.documentElement;
        if (target) {
          target.appendChild(overlayElement);
        }
      }
    }
  }

  /**
   * Applies the active visual configuration to document root
   */
  function applyStyles() {
    const root = document.documentElement;
    if (!root) return;

    // Check if site is in the exclusion list
    if (isSiteExcluded || !currentSettings.enabled) {
      root.removeAttribute('data-aura-active');
      root.removeAttribute('data-aura-mode');
      root.removeAttribute('data-aura-inverted');
      if (overlayElement) {
        overlayElement.style.opacity = '0';
      }
      return;
    }

    // System dark mode synchronization
    if (currentSettings.syncWithSystem) {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (!isSystemDark && INVERTED_MODES.has(currentSettings.mode)) {
        root.removeAttribute('data-aura-active');
        root.removeAttribute('data-aura-mode');
        root.removeAttribute('data-aura-inverted');
        if (overlayElement) overlayElement.style.opacity = '0';
        return;
      }
    }

    // Smart background detection check
    const isInvertedMode = INVERTED_MODES.has(currentSettings.mode);
    if (isInvertedMode && currentSettings.smartDetection && document.body) {
      if (isPageNaturallyDark()) {
        // Skip inversion if site is already natively dark
        root.removeAttribute('data-aura-active');
        root.removeAttribute('data-aura-mode');
        root.removeAttribute('data-aura-inverted');
        return;
      }
    }

    // Set active attributes
    root.setAttribute('data-aura-active', 'true');
    root.setAttribute('data-aura-mode', currentSettings.mode);

    if (isInvertedMode) {
      root.setAttribute('data-aura-inverted', 'true');
    } else {
      root.removeAttribute('data-aura-inverted');
    }

    // Apply CSS variables for dynamic sliders
    root.style.setProperty('--aura-brightness', (currentSettings.brightness / 100).toString());
    root.style.setProperty('--aura-contrast', (currentSettings.contrast / 100).toString());
    root.style.setProperty('--aura-sepia', (currentSettings.sepia / 100).toString());
    root.style.setProperty('--aura-tint-color', currentSettings.tintColor || '#ff9500');
    root.style.setProperty('--aura-tint-opacity', (currentSettings.tintOpacity / 100).toString());

    // Update tint overlay
    ensureOverlay();
    if (overlayElement) {
      overlayElement.style.backgroundColor = currentSettings.tintColor || '#ff9500';
      overlayElement.style.opacity = (currentSettings.tintOpacity / 100).toString();
    }

    // Specialized handling for Google Docs
    handleGoogleDocs();
  }

  /**
   * Google Docs specialized tweaks for canvas and editor tiles
   */
  function handleGoogleDocs() {
    if (!currentHost.includes('docs.google.com')) return;

    // Wait for editor element if loading
    const editor = document.querySelector('.kix-appview-editor') || document.querySelector('.docs-editor');
    if (editor) {
      editor.setAttribute('data-aura-docs-active', 'true');
    }
  }

  /**
   * Computes effective settings for the current host
   */
  function computeActiveSettings(globalSettings, siteMap, excludedList) {
    excludedDomains = excludedList || [];
    isSiteExcluded = excludedDomains.some(domain => 
      currentHost === domain || currentHost.endsWith('.' + domain)
    );

    siteOverrides = siteMap || {};
    const siteSpecific = siteOverrides[currentHost];

    if (siteSpecific) {
      currentSettings = { ...DEFAULT_SETTINGS, ...siteSpecific };
    } else {
      currentSettings = { ...DEFAULT_SETTINGS, ...globalSettings };
    }

    applyStyles();
  }

  /**
   * Loads configuration from storage
   */
  function loadSettings() {
    if (!storageAPI) {
      applyStyles();
      return;
    }

    storageAPI.get(['aura_settings', 'aura_site_settings', 'aura_excluded_domains'], (res) => {
      const globalSettings = res.aura_settings || DEFAULT_SETTINGS;
      const siteMap = res.aura_site_settings || {};
      const excluded = res.aura_excluded_domains || [];
      computeActiveSettings(globalSettings, siteMap, excluded);
    });
  }

  // Listen for storage changes in real time
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        loadSettings();
      }
    });
  }

  // Listen for runtime messages from popup or background script
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message || !message.type) return;

      switch (message.type) {
        case 'AURA_UPDATE_SETTINGS':
          if (message.payload) {
            currentSettings = { ...currentSettings, ...message.payload };
            applyStyles();
            sendResponse({ success: true });
          }
          break;

        case 'AURA_GET_PAGE_STATUS':
          sendResponse({
            hostname: currentHost,
            isExcluded: isSiteExcluded,
            hasSiteOverride: !!siteOverrides[currentHost],
            effectiveSettings: currentSettings,
            isNaturallyDark: isPageNaturallyDark()
          });
          break;

        case 'AURA_TOGGLE_SITE':
          isSiteExcluded = !isSiteExcluded;
          applyStyles();
          sendResponse({ isExcluded: isSiteExcluded });
          break;
      }
      return true; // Keep asynchronous response channel open
    });
  }

  // System dark mode change listener
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (currentSettings.syncWithSystem) {
        applyStyles();
      }
    });
  }

  // Re-check background luminance once DOM is fully ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ensureOverlay();
      applyStyles();
    });
  } else {
    ensureOverlay();
    applyStyles();
  }

  // Initial load
  loadSettings();
})();
