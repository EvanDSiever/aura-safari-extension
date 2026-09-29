#!/usr/bin/env bash
# ==============================================================================
# Aura — Native macOS Safari Extension App Builder
# Compiles and registers Aura.app containing Aura Extension.appex for Safari
# ==============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

APP_NAME="Aura"
BUILD_DIR="$PROJECT_DIR/build"
APP_BUNDLE="$BUILD_DIR/$APP_NAME.app"
EXT_NAME="Aura Extension"
EXT_BUNDLE="$APP_BUNDLE/Contents/PlugIns/$EXT_NAME.appex"

echo "🔨 Building $APP_NAME for Safari..."
rm -rf "$BUILD_DIR"
mkdir -p "$APP_BUNDLE/Contents/MacOS"
mkdir -p "$APP_BUNDLE/Contents/Resources"
mkdir -p "$EXT_BUNDLE/Contents/MacOS"
mkdir -p "$EXT_BUNDLE/Contents/Resources"

# 1. Create Info.plist for Host App
cat << 'EOF' > "$APP_BUNDLE/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>Aura</string>
    <key>CFBundleExecutable</key>
    <string>Aura</string>
    <key>CFBundleIdentifier</key>
    <string>com.evansiever.aura</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>Aura</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>14.0</string>
</dict>
</plist>
EOF

# 2. Create Info.plist for App Extension
cat << 'EOF' > "$EXT_BUNDLE/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>Aura</string>
    <key>CFBundleExecutable</key>
    <string>Aura Extension</string>
    <key>CFBundleIdentifier</key>
    <string>com.evansiever.aura.extension</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>Aura Extension</string>
    <key>CFBundlePackageType</key>
    <string>XPC!</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.Safari.web-extension</string>
        <key>NSExtensionPrincipalClass</key>
        <string>SafariWebExtensionHandler</string>
    </dict>
</dict>
</plist>
EOF

# 3. Copy WebExtension assets into the Extension's Resources
echo "📦 Copying WebExtension files..."
cp manifest.json "$EXT_BUNDLE/Contents/Resources/"
cp -R icons "$EXT_BUNDLE/Contents/Resources/"
cp -R popup "$EXT_BUNDLE/Contents/Resources/"
cp -R content "$EXT_BUNDLE/Contents/Resources/"
cp -R background "$EXT_BUNDLE/Contents/Resources/"

# 4. Compile Extension Handler
echo "⚙️ Compiling Safari Web Extension Mach-O..."
TMP_DIR="$(mktemp -d)"
cat << 'EOF' > "$TMP_DIR/Handler.swift"
import Foundation
import SafariServices

@objc(SafariWebExtensionHandler)
public class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    public func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems.first as? NSExtensionItem
        let message = item?.userInfo?[SFExtensionMessageKey]

        let response = NSExtensionItem()
        response.userInfo = [ SFExtensionMessageKey: [ "echo": message ] ]
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}
EOF

cat << 'EOF' > "$TMP_DIR/main.m"
#import <Foundation/Foundation.h>
extern int NSExtensionMain(int argc, const char *argv[]);

int main(int argc, const char *argv[]) {
    return NSExtensionMain(argc, argv);
}
EOF

SWIFT_LIB_DIR="$(swiftc -print-target-info | grep runtimeResourcePath | cut -d '"' -f 4)/macosx"
clang -c "$TMP_DIR/main.m" -o "$TMP_DIR/main.o"
swiftc -parse-as-library -c "$TMP_DIR/Handler.swift" -o "$TMP_DIR/Handler.o"
clang "$TMP_DIR/main.o" "$TMP_DIR/Handler.o" -framework Foundation -framework SafariServices -L"$SWIFT_LIB_DIR" -o "$EXT_BUNDLE/Contents/MacOS/$EXT_NAME"

# 5. Compile Host App
echo "🖥️ Compiling Aura macOS Companion App..."
cat << 'EOF' > "$TMP_DIR/AppDelegate.swift"
import Cocoa
import SafariServices

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!

    func applicationDidFinishLaunching(_ notification: Notification) {
        let windowWidth: CGFloat = 420
        let windowHeight: CGFloat = 300
        let screenSize = NSScreen.main?.frame.size ?? CGSize(width: 800, height: 600)
        let rect = NSRect(x: (screenSize.width - windowWidth)/2, y: (screenSize.height - windowHeight)/2, width: windowWidth, height: windowHeight)

        window = NSWindow(contentRect: rect, styleMask: [.titled, .closable, .miniaturizable], backing: .buffered, defer: false)
        window.title = "Aura — Safari Extension"
        window.isReleasedWhenClosed = false

        let contentView = NSView(frame: rect)

        let titleLabel = NSTextField(labelWithString: "Aura for Safari")
        titleLabel.font = NSFont.systemFont(ofSize: 22, weight: .bold)
        titleLabel.frame = NSRect(x: 20, y: 225, width: 380, height: 30)
        titleLabel.alignment = .center
        contentView.addSubview(titleLabel)

        let statusLabel = NSTextField(labelWithString: "✓ Extension registered with Safari")
        statusLabel.font = NSFont.systemFont(ofSize: 13, weight: .semibold)
        statusLabel.textColor = .systemGreen
        statusLabel.frame = NSRect(x: 20, y: 195, width: 380, height: 20)
        statusLabel.alignment = .center
        contentView.addSubview(statusLabel)

        let descLabel = NSTextField(wrappingLabelWithString: "Next steps:\n1. Open Safari Settings (⌘,).\n2. Under 'Extensions', check the box next to Aura.\n3. Click 'Always Allow on Every Website'.")
        descLabel.font = NSFont.systemFont(ofSize: 13, weight: .regular)
        descLabel.textColor = .secondaryLabelColor
        descLabel.frame = NSRect(x: 35, y: 80, width: 350, height: 100)
        contentView.addSubview(descLabel)

        let btn = NSButton(title: "Open Safari Settings…", target: self, action: #selector(openPreferences))
        btn.bezelStyle = .rounded
        btn.font = NSFont.systemFont(ofSize: 13, weight: .medium)
        btn.frame = NSRect(x: 100, y: 25, width: 220, height: 34)
        btn.keyEquivalent = "\r"
        contentView.addSubview(btn)

        window.contentView = contentView
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc func openPreferences() {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: "com.evansiever.aura.extension") { error in
            if let error = error {
                print("Note: \(error.localizedDescription)")
            }
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
EOF

swiftc "$TMP_DIR/AppDelegate.swift" -framework Cocoa -framework SafariServices -o "$APP_BUNDLE/Contents/MacOS/$APP_NAME"

# 6. Entitlements for App Sandbox (Required by macOS PlugInKit daemon)
cat << 'EOF' > "$TMP_DIR/entitlements.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
</dict>
</plist>
EOF

echo "🔏 Signing with sandbox entitlements..."
codesign -fs - --entitlements "$TMP_DIR/entitlements.plist" "$EXT_BUNDLE"
codesign -fs - --entitlements "$TMP_DIR/entitlements.plist" "$APP_BUNDLE"
rm -rf "$TMP_DIR"

# 7. Install to /Applications or ~/Applications
TARGET_APP="/Applications/$APP_NAME.app"
if ! cp -R "$APP_BUNDLE" /Applications/ 2>/dev/null; then
  mkdir -p "$HOME/Applications"
  TARGET_APP="$HOME/Applications/$APP_NAME.app"
  cp -R "$APP_BUNDLE" "$TARGET_APP"
fi

# 8. Register with LaunchServices and PlugInKit
echo "🔌 Registering with macOS & Safari..."
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f -R -trusted "$TARGET_APP"
pluginkit -a "$TARGET_APP/Contents/PlugIns/$EXT_NAME.appex"

echo ""
echo "🎉 Build & Installation Complete!"
echo "Installed to: $TARGET_APP"
echo ""
echo "Registered extensions:"
pluginkit -m -v -p com.apple.Safari.web-extension | grep -i aura || true
