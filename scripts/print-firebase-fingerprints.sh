#!/usr/bin/env bash
#
# Prints the SHA-1 and SHA-256 fingerprints you must register in
# the Firebase Console (Project settings → Your apps → Android app →
# "SHA certificate fingerprints") for the MyPen Android app.
#
# Why this exists
# ---------------
# Google Play Services throws `DEVELOPER_ERROR 10` from
# GoogleSignin.signIn() when the running APK's signing certificate
# SHA-1 is not registered as an OAuth client in the Firebase project
# for that app's package id. MyPen needs at minimum:
#
#   1. The local Android debug keystore — for `pnpm android` builds
#      (CIs, dev laptops).
#   2. The EAS build keystore — for `eas build` APKs that the team
#      installs on real phones.
#   3. A release keystore (added later) — for Play Store builds.
#
# Firebase has accepted SHA-256 alongside SHA-1 since 2023; register
# both to be future-proof.
#
# Usage
# -----
#   ./scripts/print-firebase-fingerprints.sh
#   ./scripts/print-firebase-fingerprints.sh /path/to/release.keystore aliasname
#
# The second form lets you print a release keystore's fingerprints
# too (it will prompt for the keystore password).

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_fingerprints() {
  local keystore="$1"
  local alias="$2"
  local label="$3"

  if [ ! -f "$keystore" ]; then
    printf "  (%s missing: %s)\n" "$label" "$keystore"
    return 0
  fi

  printf "\n%s\n  keystore: %s\n  alias:    %s\n" "$label" "$keystore" "$alias"

  # keytool prints SHA1: and SHA256: lines among others; pull them
  # out and reformat. Falls back to a password prompt for non-debug
  # keystores.
  local storepass="${KEYSTORE_PASSWORD:-}"
  if [ -z "$storepass" ]; then
    case "$alias" in
      androiddebugkey) storepass="android" ;;
      *) storepass="$(prompt 'keystore password: ')" ;;
    esac
  fi

  local out
  out="$(keytool -list -v -keystore "$keystore" -storepass "$storepass" -alias "$alias" 2>/dev/null || true)"
  local sha1 sha256
  # keytool prints lines like:
  #   SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
  #   SHA256: FA:99:...
  # Split on first ":" so we keep the rest of the colon-separated hash.
  sha1="$(printf '%s\n' "$out" | grep -E '^[[:space:]]+SHA1:' | head -1 | sed -E 's/^[[:space:]]+SHA1:[[:space:]]+//; s/[[:space:]]+$//')"
  sha256="$(printf '%s\n' "$out" | grep -E '^[[:space:]]+SHA256:' | head -1 | sed -E 's/^[[:space:]]+SHA256:[[:space:]]+//; s/[[:space:]]+$//')"

  if [ -z "$sha1" ] && [ -z "$sha256" ]; then
    echo "  (failed to read fingerprints — check password / alias)"
    return 0
  fi
  printf "  SHA1:    %s\n" "${sha1:-<missing>}"
  printf "  SHA256:  %s\n" "${sha256:-<missing>}"
}

prompt() {
  local msg="$1"
  local reply
  printf "%s" "$msg"
  read -r reply
  printf "%s" "$reply"
}

echo "MyPen — Firebase Android SHA-1 / SHA-256 fingerprints"
echo "====================================================="
echo
echo "Add these to Firebase Console → Project settings →"
echo "  Your apps → Android (com.penapp.pen_app) →"
echo "  'SHA certificate fingerprints' → 'Add fingerprint'."
echo
echo "You'll need to register:"
echo "  • The EAS dev-client keystore (used by the APK you just built)"
echo "  • The local debug keystore (used by 'pnpm android' on dev laptops)"
echo "  • A release keystore later, when you set up Play Store builds"

print_fingerprints \
  "$PROJECT_ROOT/android/app/debug.keystore" \
  "androiddebugkey" \
  "1) Local debug keystore (pnpm android)"

# EAS keystore is held in EAS's cloud, not on disk. The user must
# grab its SHA-1 from the EAS build log:
#   https://expo.dev/accounts/<account>/projects/mypen/builds/<id>
# The "Credentials" section of any Android build log shows the SHA-1
# of the keystore that signed the APK. Or run:
#   eas build:view <build-id>  (look for "Using Keystore" and the
#   key fingerprint printed during the build).
echo
echo "2) EAS dev-client / preview / production keystore"
echo "   Not on disk — EAS holds it. To print it from a built APK:"
echo "     keytool -printcert -jarfile <path-to.apk> | grep -E 'SHA1|SHA256'"
echo "   Or open the build log in the EAS dashboard — it prints the"
echo "   signing certificate's SHA-1 during the 'Build' step."

# Optional third arg: a release keystore path + alias
if [ "${1:-}" != "" ] && [ "${2:-}" != "" ]; then
  print_fingerprints "$1" "$2" "3) Release keystore (Play Store)"
fi

echo
echo "After registering, you don't need to re-build the APK — the"
echo "OAuth client trust is checked at runtime against the registered"
echo "fingerprints. Just re-install the dev-client and try Google"
echo "Sign-in again."
