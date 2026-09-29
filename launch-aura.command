#!/usr/bin/env bash
# Double-clickable macOS launcher to ensure Aura is registered with Safari

APP_PATH="/Applications/Aura.app"
EXT_PATH="$APP_PATH/Contents/PlugIns/Aura Extension.appex"

echo "🌟 Registering Aura with Safari..."
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f -R -trusted "$APP_PATH" 2>/dev/null || true
pluginkit -a "$EXT_PATH" 2>/dev/null || true

echo "🚀 Opening Aura Companion App..."
open -a "$APP_PATH"

echo "🌐 Opening Safari..."
open -a Safari

echo "✅ Ready! Check Safari Settings (⌘,) > Extensions if Aura is not already checked."
sleep 1
