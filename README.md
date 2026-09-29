# Aura — Safari Web Extension
> **Ultra-lightweight, seamless website color adjuster & smart dark mode crafted with Apple Human Interface Guidelines.**

---

## ✨ Features at a Glance

- **Apple Safari Native Aesthetic**: Frosted acrylic translucency (`backdrop-filter: blur(28px)`), SF Pro typography, native segmented controls, and Apple system toggles. Looks and feels like a native macOS Safari menu, not a cheap third-party add-on.
- **Smart Dark Mode**:
  - Automatically analyzes page luminance to detect naturally dark sites (e.g. GitHub Dark, YouTube Dark) and avoids double-inverting them.
  - Specialized compatibility for **Google Docs**, **Google Sheets**, and bright web apps.
  - Media & image preservation: Photos, videos, svgs, and canvas tiles retain their authentic colors without looking like negative film.
- **Built-in Visual Presets**:
  - 🌙 **Classic Dark**: High-contrast, clean night palette.
  - 🖤 **OLED Pitch Black**: Pure `#000000` deep black for maximum contrast and OLED battery savings.
  - 📜 **Warm Sepia**: Gentle parchment tone designed to reduce blue-light eye strain during reading.
  - 🌌 **Midnight Blue**: Calming deep navy tone for relaxed nighttime web browsing.
  - 🎨 **Custom Tint**: Choose any hex color from the palette and dial in exact opacity.
- **Precision Sliders**:
  - **Brightness** (50% – 150%)
  - **Contrast** (50% – 150%)
  - **Warmth / Sepia** (0% – 100%)
  - **Tint Color & Opacity** (0% – 80%)
- **Domain Exclusion & Overrides (Whitelist / Blacklist)**:
  - One-click "Exclude This Site" button right in the popup.
  - Dedicated "Sites" management tab to add, view, or remove excluded domains.
- **Global Keyboard Shortcut**:
  - Press <kbd>⌥ Option</kbd> + <kbd>⇧ Shift</kbd> + <kbd>D</kbd> to toggle color adjustment on any site instantly.
- **Zero-Lag & Lightweight**:
  - Pure Vanilla JavaScript, zero external dependencies or heavy libraries.
  - Entire extension size is < 50 KB.
  - Injects dynamic CSS at `document_start` to eliminate Flash of Unstyled Content (FOUC).

---

## 📁 Project Structure

```
Visualizer/
├── manifest.json             # Manifest V3 extension configuration
├── icons/                    # High-DPI icons (16, 32, 48, 128) & vector SVG
│   ├── icon.svg
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
├── popup/
│   ├── popup.html            # Apple HIG popup layout
│   ├── popup.css             # Native Safari styling & SF Pro design system
│   └── popup.js              # Real-time control, storage sync & domain manager
├── content/
│   ├── content.css           # Hardware-accelerated filters & media protection
│   └── content.js            # Smart background detection, docs hooks, style injector
├── background/
│   └── background.js         # Keyboard shortcut listener & sync worker
├── demo.html                 # Interactive test suite & Google Docs simulation
├── build-app.sh              # Verification & quick launcher script
└── README.md                 # Documentation
```

---

## 🚀 How to Load and Use in Safari

Follow these quick steps to load Aura directly into Safari:

### Step 1: Enable Safari Developer Features
1. Open **Safari**.
2. Open Safari Settings by pressing <kbd>⌘</kbd> + <kbd>,</kbd> (or click **Safari** in the menu bar > **Settings...**).
3. Select the **Advanced** tab.
4. Check the box for **"Show features for web developers"** (or **"Show Develop menu in menu bar"**).

### Step 2: Allow Unsigned Extensions
1. In the macOS top menu bar, click **Develop**.
2. Click **Allow Unsigned Extensions** (enter your Mac password if prompted).

### Step 3: Enable Aura in Extensions Settings
1. Go to **Safari** > **Settings** > **Extensions** tab.
2. Locate **Aura** in the left sidebar and check its checkbox to activate it.
3. Under permissions, select **"Always Allow on Every Website"** so Aura can adjust colors across all tabs seamlessly.

---

## 🧪 Testing with the Built-in Demo

An interactive demo page is included to test all features:
1. In Safari, open `demo.html` located in this directory:
   ```
   file:///Users/SievesOk/Documents/Antigravity Projects/Visualizer/demo.html
   ```
2. Click the **Aura** icon in your Safari toolbar.
3. Test switching between **Classic Dark**, **OLED Black**, **Warm Sepia**, and **Midnight Blue**.
4. Test adjusting **Brightness**, **Contrast**, and the **Color Tint** picker.
5. Notice how the simulated Google Docs page turns dark while the colorful test image preserves its natural colors.
6. Press <kbd>⌥</kbd> + <kbd>⇧</kbd> + <kbd>D</kbd> to toggle the extension on and off.
