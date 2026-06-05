#!/usr/bin/env bash
#
# Re-applies the per-developer Firebase native config files after
# `expo prebuild` (which clears ios/ + android/ and reinitialises
# them from scratch). The configs are gitignored — they live on
# each developer's machine — so this script is the "I just ran
# prebuild, where did my keys go?" panic button.
#
# Usage:  pnpm prebuild         (preferred — see package.json)
#   or:   ./scripts/apply-firebase-configs.sh
#
# The source files are expected to be in the project root (the user
# drops them there after creating the Firebase project). If they
# aren't there, the script warns and exits 0 — don't fail the build
# for missing optional config.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

PLACEHOLDER_ANDROID="$PROJECT_ROOT/google-services.json"
PLACEHOLDER_IOS="$PROJECT_ROOT/GoogleService-Info.plist"

ANDROID_DEST="$PROJECT_ROOT/android/app/google-services.json"
IOS_DEST="$PROJECT_ROOT/ios/MyPen/GoogleService-Info.plist"

# 1) iOS
if [ -f "$PLACEHOLDER_IOS" ]; then
  mkdir -p "$(dirname "$IOS_DEST")"
  cp "$PLACEHOLDER_IOS" "$IOS_DEST"
  echo "✓ iOS:  $IOS_DEST"
else
  echo "⚠ iOS:  no source at $PLACEHOLDER_IOS (skipping)"
fi

# 2) Android
if [ -f "$PLACEHOLDER_ANDROID" ]; then
  mkdir -p "$(dirname "$ANDROID_DEST")"
  cp "$PLACEHOLDER_ANDROID" "$ANDROID_DEST"
  echo "✓ Android: $ANDROID_DEST"
else
  echo "⚠ Android: no source at $PLACEHOLDER_ANDROID (skipping)"
fi
