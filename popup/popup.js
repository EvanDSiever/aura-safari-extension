/**
 * Aura Popup Controller
 * Apple HIG-compliant interface logic, real-time messaging, and storage synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Default Configuration
  const DEFAULT_SETTINGS = {
    enabled: true,
    mode: 'dark', // 'dark', 'oled', 'sepia', 'midnight', 'custom'
    brightness: 100,
    contrast: 100,
    sepia: 0,
    tintColor: '#ff9500',
    tintOpacity: 0,
    smartDetection: true,
    syncWithSystem: false
  };

  // State
  let currentSettings = { ...DEFAULT_SETTINGS };
  let siteOverrides = {};
  let excludedDomains = [];
  let currentHost = '';
  let activeTabId = null;

  // DOM Elements
  const masterToggle = document.getElementById('masterToggle');
  const currentDomainBadge = document.getElementById('currentDomainBadge');

  // Tabs
  const segments = document.querySelectorAll('.segment');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Presets
  const presetCards = document.querySelectorAll('.preset-card');
  const customPresetSwatch = document.getElementById('customPresetSwatch');

  // Sliders & Values
  const sliderBrightness = document.getElementById('sliderBrightness');
  const valBrightness = document.getElementById('valBrightness');
  const sliderContrast = document.getElementById('sliderContrast');
  const valContrast = document.getElementById('valContrast');
  const sliderSepia = document.getElementById('sliderSepia');
  const valSepia = document.getElementById('valSepia');

  // Color & Tint
  const tintColorPicker = document.getElementById('tintColorPicker');
  const tintColorHex = document.getElementById('tintColorHex');
  const sliderTintOpacity = document.getElementById('sliderTintOpacity');
  const valTintOpacity = document.getElementById('valTintOpacity');

  // Toggles
  const checkSmartDetect = document.getElementById('checkSmartDetect');
  const checkSystemSync = document.getElementById('checkSystemSync');

  // Sites View
  const siteCardHost = document.getElementById('siteCardHost');
  const siteCardStatus = document.getElementById('siteCardStatus');
  const btnToggleSiteExclusion = document.getElementById('btnToggleSiteExclusion');
  const addDomainForm = document.getElementById('addDomainForm');
  const inputNewDomain = document.getElementById('inputNewDomain');
  const excludedDomainsList = document.getElementById('excludedDomainsList');
  const btnResetDefaults = document.getElementById('btnResetDefaults');

  /**
   * Safe storage helper
   */
  const storage = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local)
    ? chrome.storage.local
    : (typeof browser !== 'undefined' && browser.storage && browser.storage.local)
      ? browser.storage.local
      : null;

  /**
   * Sends update message to current active tab for zero-latency response
   */
  function notifyActiveTab(payload) {
    if (!activeTabId) return;
    chrome.tabs.sendMessage(activeTabId, {
      type: 'AURA_UPDATE_SETTINGS',
      payload: payload
    }).catch(() => {
      // Tab may be a restricted Safari page (e.g. safari://, start page)
    });
  }

  /**
   * Debounced storage saver
   */
  let saveTimer = null;
  function saveSettings() {
    if (!storage) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      storage.set({
        aura_settings: currentSettings,
        aura_site_settings: siteOverrides,
        aura_excluded_domains: excludedDomains
      });
    }, 150);
  }

  /**
   * Updates UI controls to match currentSettings
   */
  function renderUI() {
    const isExcluded = excludedDomains.some(d => currentHost === d || currentHost.endsWith('.' + d));

    // Master toggle reflects global enabled AND site exclusion
    masterToggle.checked = currentSettings.enabled && !isExcluded;

    // Presets selection
    presetCards.forEach(card => {
      if (card.dataset.preset === currentSettings.mode) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Sliders
    sliderBrightness.value = currentSettings.brightness;
    valBrightness.textContent = `${currentSettings.brightness}%`;

    sliderContrast.value = currentSettings.contrast;
    valContrast.textContent = `${currentSettings.contrast}%`;

    sliderSepia.value = currentSettings.sepia;
    valSepia.textContent = `${currentSettings.sepia}%`;

    // Tint
    tintColorPicker.value = currentSettings.tintColor || '#ff9500';
    tintColorHex.textContent = (currentSettings.tintColor || '#ff9500').toUpperCase();
    if (customPresetSwatch) {
      customPresetSwatch.style.backgroundColor = currentSettings.tintColor;
    }

    sliderTintOpacity.value = currentSettings.tintOpacity || 0;
    valTintOpacity.textContent = `${currentSettings.tintOpacity || 0}%`;

    // Automation switches
    checkSmartDetect.checked = currentSettings.smartDetection !== false;
    checkSystemSync.checked = !!currentSettings.syncWithSystem;

    // Sites Tab info
    if (currentHost) {
      siteCardHost.textContent = currentHost;
      if (isExcluded) {
        siteCardStatus.textContent = 'Excluded (Disabled)';
        siteCardStatus.className = 'site-status excluded';
        btnToggleSiteExclusion.textContent = 'Enable on This Site';
      } else {
        siteCardStatus.textContent = 'Active';
        siteCardStatus.className = 'site-status';
        btnToggleSiteExclusion.textContent = 'Exclude This Site';
      }
    } else {
      siteCardHost.textContent = 'System / New Tab';
      siteCardStatus.textContent = 'Not Applicable';
      btnToggleSiteExclusion.disabled = true;
    }

    renderExcludedDomainsList();
  }

  /**
   * Renders the chips for excluded domains
   */
  function renderExcludedDomainsList() {
    excludedDomainsList.innerHTML = '';

    if (!excludedDomains || excludedDomains.length === 0) {
      excludedDomainsList.innerHTML = '<div class="empty-list-placeholder">No excluded domains</div>';
      return;
    }

    excludedDomains.forEach(domain => {
      const chip = document.createElement('div');
      chip.className = 'domain-chip';

      const text = document.createElement('span');
      text.textContent = domain;
      chip.appendChild(text);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'chip-remove';
      removeBtn.title = `Remove ${domain}`;
      removeBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeExcludedDomain(domain);
      });

      chip.appendChild(removeBtn);
      excludedDomainsList.appendChild(chip);
    });
  }

  /**
   * Removes a domain from exclusion list
   */
  function removeExcludedDomain(domain) {
    excludedDomains = excludedDomains.filter(d => d !== domain);
    saveSettings();
    renderUI();
    notifyActiveTab({ isExcluded: false });
  }

  /**
   * Adds a domain to exclusion list
   */
  function addExcludedDomain(domain) {
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!clean) return;
    if (!excludedDomains.includes(clean)) {
      excludedDomains.push(clean);
      saveSettings();
      renderUI();
      if (currentHost === clean || currentHost.endsWith('.' + clean)) {
        notifyActiveTab({ isExcluded: true });
      }
    }
  }

  // Segmented Control Navigation
  segments.forEach(seg => {
    seg.addEventListener('click', () => {
      segments.forEach(s => s.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      seg.classList.add('active');
      const targetPanel = document.getElementById(`tab-${seg.dataset.tab}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Master Switch Handler
  masterToggle.addEventListener('change', () => {
    const isExcluded = excludedDomains.some(d => currentHost === d || currentHost.endsWith('.' + d));

    if (isExcluded) {
      // If user flipped toggle while site was excluded, unexclude it!
      excludedDomains = excludedDomains.filter(d => d !== currentHost);
      currentSettings.enabled = true;
    } else {
      currentSettings.enabled = masterToggle.checked;
    }

    saveSettings();
    renderUI();
    notifyActiveTab({ enabled: currentSettings.enabled, isExcluded: false });
  });

  // Preset Card Clicks
  presetCards.forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.dataset.preset;
      currentSettings.mode = mode;

      // Adjust defaults per preset for a great instant visual feel
      if (mode === 'sepia') {
        currentSettings.sepia = 60;
        currentSettings.brightness = 96;
        currentSettings.contrast = 95;
      } else if (mode === 'oled') {
        currentSettings.sepia = 0;
        currentSettings.brightness = 95;
        currentSettings.contrast = 115;
      } else if (mode === 'midnight') {
        currentSettings.sepia = 0;
        currentSettings.brightness = 92;
        currentSettings.contrast = 105;
      } else if (mode === 'dark') {
        currentSettings.sepia = 0;
        currentSettings.brightness = 100;
        currentSettings.contrast = 100;
      }

      renderUI();
      saveSettings();
      notifyActiveTab(currentSettings);
    });
  });

  // Slider Listeners with Real-time feedback
  function bindSlider(slider, labelEl, key, suffix = '%') {
    slider.addEventListener('input', () => {
      const val = parseInt(slider.value, 10);
      labelEl.textContent = `${val}${suffix}`;
      currentSettings[key] = val;

      notifyActiveTab(currentSettings);
      saveSettings();
    });
  }

  bindSlider(sliderBrightness, valBrightness, 'brightness');
  bindSlider(sliderContrast, valContrast, 'contrast');
  bindSlider(sliderSepia, valSepia, 'sepia');
  bindSlider(sliderTintOpacity, valTintOpacity, 'tintOpacity');

  // Color Picker Listener
  tintColorPicker.addEventListener('input', () => {
    const color = tintColorPicker.value;
    tintColorHex.textContent = color.toUpperCase();
    currentSettings.tintColor = color;
    if (customPresetSwatch) {
      customPresetSwatch.style.backgroundColor = color;
    }

    // Auto-increase tint opacity slightly if it was 0 so user sees effect
    if (currentSettings.tintOpacity === 0) {
      currentSettings.tintOpacity = 20;
      sliderTintOpacity.value = 20;
      valTintOpacity.textContent = '20%';
    }

    notifyActiveTab(currentSettings);
    saveSettings();
  });

  // Smart Detect Switch
  checkSmartDetect.addEventListener('change', () => {
    currentSettings.smartDetection = checkSmartDetect.checked;
    renderUI();
    saveSettings();
    notifyActiveTab(currentSettings);
  });

  // System Sync Switch
  checkSystemSync.addEventListener('change', () => {
    currentSettings.syncWithSystem = checkSystemSync.checked;
    renderUI();
    saveSettings();
    notifyActiveTab(currentSettings);
  });

  // Toggle Current Site Button
  btnToggleSiteExclusion.addEventListener('click', () => {
    if (!currentHost) return;
    const isExcluded = excludedDomains.some(d => currentHost === d || currentHost.endsWith('.' + d));

    if (isExcluded) {
      excludedDomains = excludedDomains.filter(d => d !== currentHost);
    } else {
      excludedDomains.push(currentHost);
    }

    saveSettings();
    renderUI();
    notifyActiveTab({ isExcluded: !isExcluded });
  });

  // Add Domain Form
  addDomainForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = inputNewDomain.value;
    if (val) {
      addExcludedDomain(val);
      inputNewDomain.value = '';
    }
  });

  // Reset Button
  btnResetDefaults.addEventListener('click', () => {
    if (confirm('Reset all Aura settings to default?')) {
      currentSettings = { ...DEFAULT_SETTINGS };
      excludedDomains = [];
      saveSettings();
      renderUI();
      notifyActiveTab(currentSettings);
    }
  });

  /**
   * Initializes tab and loads stored data
   */
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url) {
      activeTabId = tabs[0].id;
      try {
        currentHost = new URL(tabs[0].url).hostname.toLowerCase();
        currentDomainBadge.textContent = currentHost;
      } catch (e) {
        currentDomainBadge.textContent = 'Safari Page';
      }
    } else {
      currentDomainBadge.textContent = 'Safari Tab';
    }

    if (storage) {
      storage.get(['aura_settings', 'aura_site_settings', 'aura_excluded_domains'], (res) => {
        if (res.aura_settings) {
          currentSettings = { ...DEFAULT_SETTINGS, ...res.aura_settings };
        }
        if (res.aura_site_settings) {
          siteOverrides = res.aura_site_settings;
        }
        if (res.aura_excluded_domains) {
          excludedDomains = res.aura_excluded_domains;
        }
        renderUI();
      });
    } else {
      renderUI();
    }
  });
});
