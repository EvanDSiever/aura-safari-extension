/**
 * Aura Background Service Worker
 * Handles commands, installation defaults, and state coordination
 */

const DEFAULT_SETTINGS = {
  enabled: true,
  mode: 'dark',
  brightness: 100,
  contrast: 100,
  sepia: 0,
  tintColor: '#ff9500',
  tintOpacity: 0,
  smartDetection: true,
  syncWithSystem: false
};

// Initialize default storage on extension install or update
chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.get(['aura_settings', 'aura_site_settings', 'aura_excluded_domains'], (res) => {
    const updates = {};
    if (!res.aura_settings) {
      updates.aura_settings = DEFAULT_SETTINGS;
    }
    if (!res.aura_site_settings) {
      updates.aura_site_settings = {};
    }
    if (!res.aura_excluded_domains) {
      updates.aura_excluded_domains = [];
    }
    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates);
    }
  });
});

// Handle keyboard shortcut commands (e.g. Option+Shift+D)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-aura') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].id) return;
      const tab = tabs[0];

      let host = '';
      try {
        host = new URL(tab.url).hostname.toLowerCase();
      } catch (e) {
        return;
      }

      chrome.storage.local.get(['aura_settings', 'aura_excluded_domains'], (res) => {
        const settings = res.aura_settings || DEFAULT_SETTINGS;
        const excluded = res.aura_excluded_domains || [];

        // Toggle domain exclusion if on a valid website
        const isExcluded = excluded.some(d => host === d || host.endsWith('.' + d));
        let updatedExcluded;

        if (isExcluded) {
          // Remove from excluded (enable)
          updatedExcluded = excluded.filter(d => d !== host);
        } else {
          // Add to excluded (disable)
          updatedExcluded = [...excluded, host];
        }

        chrome.storage.local.set({ aura_excluded_domains: updatedExcluded }, () => {
          // Notify tab
          chrome.tabs.sendMessage(tab.id, {
            type: 'AURA_UPDATE_SETTINGS',
            payload: { isExcluded: !isExcluded }
          }).catch(() => {
            // Content script may not be loaded on restricted pages
          });
        });
      });
    });
  }
});
