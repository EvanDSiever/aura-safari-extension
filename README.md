# Aura — Safari Web Extension
> **Ultra-lightweight, seamless website color adjuster & smart dark mode crafted with Apple Human Interface Guidelines.**
> Now featuring the **Google Workspace Student Suite**!

---

## ✨ Features at a Glance

- **Apple Safari Native Aesthetic**: Frosted acrylic translucency (`backdrop-filter: blur(28px)`), SF Pro typography, native segmented controls, and Apple system toggles. Looks and feels like a native macOS Safari menu, not a cheap third-party add-on.
- 🎓 **Google Workspace Student Suite (New!)**:
  - **Preserves Workspace Canvas**: Darkens the surrounding toolbars, menubars, sidebars, and background chrome across **Google Docs, Sheets, Drive, Slides, Classroom, and Keep**, while **keeping the document paper, slide canvas, and spreadsheet cells pristine white**!
  - **Printing & Color Accuracy**: Text formatting, colored annotations, and highlighters (yellow, green, pink) stay completely natural without color inversion distortion.
  - **Canvas Comfort Dimmer**: Optional slider (80% – 100%) to gently soften blinding 100% white glare at night without inverting colors.
  - **Chrome Theme Styles**: Choose between *macOS Graphite Dark* (`#1e1e1e`), *OLED Pure Black* (`#000000`), *Midnight Navy* (`#0b1120`), or *Sync with Aura Preset*.
  - **Individual App Toggles**: Enable or disable per app (Docs, Sheets, Drive, Slides, Classroom, Keep).
  - **Automatic Detection**: Automatically switches to the Google Suite tab in the popup when visiting any Google Workspace product.
- **Smart Dark Mode & General Color Engine**:
  - Automatically analyzes page luminance to detect naturally dark sites (e.g. GitHub Dark, YouTube Dark) and avoids double-inverting them.
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
├── manifest.json             # Manifest V3 extension configuration (v1.1.0)
├── icons/                    # High-DPI icons (16, 32, 48, 128) & vector SVG
│   ├── icon.svg
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
├── popup/
│   ├── popup.html            # Apple HIG popup layout (Presets, Adjust, Google, Sites)
│   ├── popup.css             # Native Safari styling & SF Pro design system
│   └── popup.js              # Real-time control, storage sync & Google Suite manager
├── content/
│   ├── content.css           # Hardware-accelerated filters & media protection
│   ├── google-suite.css      # Dedicated Google Docs, Sheets, Drive, Classroom styles
│   └── content.js            # Smart background detection, Google app hook, style injector
├── background/
│   └── background.js         # Keyboard shortcut listener & sync worker
├── demo.html                 # Interactive test suite with Google Docs simulation
├── package-mac-app.sh        # Native macOS app packager & PlugInKit registration
└── README.md                 # Documentation
```

---

## 🚀 How to Enable in Safari

1. **Quit and Reopen Safari** (press <kbd>⌘</kbd> + <kbd>Q</kbd>, then reopen).
2. Ensure **Develop** > **Allow Unsigned Extensions** is checked.
3. Open **Safari Settings** (<kbd>⌘</kbd> + <kbd>,</kbd>) > **Extensions** tab.
4. Check the box next to **Aura** and select **"Always Allow on Every Website"**.

---

## 🧪 Testing with the Built-in Demo

Open the updated demo page in Safari:
```
file:///Users/SievesOk/Documents/Antigravity Projects/Visualizer/demo.html
```
You can see the simulated Google Docs page with dark toolbars and a clean, non-inverted white paper page with yellow and green text highlighters preserved!
