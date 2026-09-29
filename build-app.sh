#!/usr/bin/env bash
# ==============================================================================
# Aura — Safari Web Extension Packaging & Build Utility
# ==============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "=================================================="
echo "  🌟 Aura — Safari Web Extension Setup & Build"
echo "=================================================="
echo ""

# 1. Check required files
echo "▶ Checking extension integrity..."
REQUIRED_FILES=(
  "manifest.json"
  "icons/icon-16.png"
  "icons/icon-32.png"
  "icons/icon-48.png"
  "icons/icon-128.png"
  "popup/popup.html"
  "popup/popup.css"
  "popup/popup.js"
  "content/content.css"
  "content/content.js"
  "background/background.js"
)

MISSING=0
for f in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "  ❌ Missing file: $f"
    MISSING=1
  fi
done

if [ $MISSING -eq 1 ]; then
  echo "Error: Some required extension files are missing."
  exit 1
fi
echo "  ✅ All extension files verified successfully!"
echo ""

# 2. How to run / load
echo "--------------------------------------------------"
echo "  🚀 How to load Aura into Safari (Instant Setup)"
echo "--------------------------------------------------"
echo "1. Open Safari."
echo "2. Open Safari Settings (press ⌘,)."
echo "3. Go to the 'Advanced' tab and check:"
echo "   ☑ 'Show features for web developers'"
echo "   (or 'Show Develop menu in menu bar')."
echo "4. In the menu bar at the top of your screen, click 'Develop'."
echo "5. Check ☑ 'Allow Unsigned Extensions'."
echo "6. Go to Safari > Settings > 'Extensions' tab."
echo "7. Turn on the checkbox for 'Aura'."
echo "8. (Optional) In the Extensions tab, grant 'Always Allow on Every Website' for seamless color adjustments."
echo ""
echo "--------------------------------------------------"
echo "  ⌨️ Quick Controls"
echo "--------------------------------------------------"
echo "• Click the Aura icon in Safari toolbar for presets & sliders."
echo "• Press ⌥ + ⇧ + D (Option + Shift + D) to toggle on/off instantly."
echo "• Open file://$PROJECT_DIR/demo.html to test all visual modes."
echo "=================================================="
