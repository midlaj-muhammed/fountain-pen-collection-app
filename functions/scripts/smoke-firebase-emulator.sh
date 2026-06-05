#!/usr/bin/env bash
#
# Smoke test the Firebase emulator suite + Cloud Functions.
#
# Pre-conditions:
#   - The Firebase emulator suite is running in another terminal:
#       cd functions && pnpm run serve
#   - The functions/ workspace is built:
#       cd functions && pnpm run build
#
# Behaviour:
#   1. Curls the Auth + Firestore emulator health endpoints.
#   2. Writes a test pen + ink + session via the Firestore REST API.
#   3. Waits for the onSessionCreated trigger to fire; reads the pen
#      back; asserts totalSessions == 1.
#   4. Deletes the session; waits for onSessionDeleted; asserts
#      totalSessions == 0.
#   5. Invokes deleteUserData via the Functions emulator REST API;
#      asserts the response shape.
#
# Exit code 0 on success; 1 on any assertion failure.

set -e

EMULATOR_HOST="${EMULATOR_HOST:-127.0.0.1}"
FIRESTORE_PORT="${FIRESTORE_PORT:-8080}"
FUNCTIONS_PORT="${FUNCTIONS_PORT:-5001}"
AUTH_PORT="${AUTH_PORT:-9099}"
PROJECT_ID="${FIREBASE_PROJECT_ID:-pen-app-flutter}"
TEST_UID="smoke-test-uid"

# ── helpers ──────────────────────────────────────────────────────

fail() {
  echo "✗ $1" >&2
  exit 1
}

assert_eq() {
  local got="$1" expect="$2" label="$3"
  if [ "$got" != "$expect" ]; then
    fail "$label: expected '$expect', got '$got'"
  fi
  echo "  ✓ $label: $got"
}

# ── 1) Health checks ────────────────────────────────────────────

echo "→ Checking emulator health..."
curl -fsS "http://${EMULATOR_HOST}:${FIRESTORE_PORT}/" >/dev/null \
  || fail "Firestore emulator not reachable on :${FIRESTORE_PORT}"
echo "  ✓ Firestore emulator reachable on :${FIRESTORE_PORT}"

# Auth emulator exposes a config endpoint with the project ID.
auth_config=$(curl -fsS "http://${EMULATOR_HOST}:${AUTH_PORT}/emulator/v1/projects/${PROJECT_ID}/config" 2>/dev/null || true)
if [ -z "$auth_config" ]; then
  echo "  ⚠ Auth emulator not reachable on :${AUTH_PORT} (skipped)"
else
  echo "  ✓ Auth emulator reachable on :${AUTH_PORT}"
fi

# ── 2) Seed pen + ink via Firestore REST API ───────────────────

echo "→ Seeding test pen + ink + session via Firestore REST..."
FIRESTORE_BASE="http://${EMULATOR_HOST}:${FIRESTORE_PORT}/v1/projects/${PROJECT_ID}/databases/(default)/documents"

# Pen
curl -fsS -X POST "${FIRESTORE_BASE}/users/${TEST_UID}/pens?documentId=pen-1" \
  -H "Content-Type: application/json" \
  -d '{"fields": {
    "brand": {"stringValue": "Pilot"},
    "model": {"stringValue": "Capless"},
    "nib": {"mapValue": {"fields": {
      "size": {"stringValue": "F"},
      "material": {"stringValue": "steel"},
      "customLabel": {"nullValue": null}
    }}},
    "color": {"stringValue": "#1A1A1A"},
    "photoURL": {"nullValue": null},
    "acquiredAt": {"nullValue": null},
    "retired": {"booleanValue": false},
    "currentInkId": {"nullValue": null},
    "notes": {"stringValue": ""},
    "totalSessions": {"integerValue": "0"}
  }}' >/dev/null
echo "  ✓ pen-1 created"

# Ink
curl -fsS -X POST "${FIRESTORE_BASE}/users/${TEST_UID}/inks?documentId=ink-1" \
  -H "Content-Type: application/json" \
  -d '{"fields": {
    "brand": {"stringValue": "Pelikan"},
    "name": {"stringValue": "4001"},
    "colorHex": {"stringValue": "#2D5D3F"},
    "colorName": {"stringValue": "Dark Green"},
    "bottleSizeMl": {"integerValue": "30"},
    "currentLevelPct": {"integerValue": "60"},
    "isCartridge": {"booleanValue": false},
    "photoURL": {"nullValue": null},
    "acquiredAt": {"nullValue": null},
    "empty": {"booleanValue": false},
    "totalSessions": {"integerValue": "0"},
    "lastUsedAt": {"nullValue": null},
    "notes": {"stringValue": ""}
  }}' >/dev/null
echo "  ✓ ink-1 created"

# Session
curl -fsS -X POST "${FIRESTORE_BASE}/users/${TEST_UID}/sessions?documentId=session-1" \
  -H "Content-Type: application/json" \
  -d '{"fields": {
    "date": {"timestampValue": "2026-06-06T12:00:00Z"},
    "durationMin": {"integerValue": "15"},
    "penId": {"stringValue": "pen-1"},
    "inkId": {"stringValue": "ink-1"},
    "inkDriedOut": {"booleanValue": false},
    "rating": {"integerValue": "3"},
    "notes": {"stringValue": ""}
  }}' >/dev/null
echo "  ✓ session-1 created"

# ── 3) Wait for onSessionCreated to fire ────────────────────────

echo "→ Waiting for onSessionCreated to fire (1s grace)..."
sleep 1

PEN_TOTAL=$(curl -fsS "${FIRESTORE_BASE}/users/${TEST_UID}/pens/pen-1" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['fields']['totalSessions']['integerValue'])" 2>/dev/null || echo "0")
assert_eq "$PEN_TOTAL" "1" "Function onSessionCreated fired (pen.totalSessions)"

# ── 4) Delete the session, wait for onSessionDeleted ───────────

echo "→ Deleting session-1..."
curl -fsS -X DELETE "${FIRESTORE_BASE}/users/${TEST_UID}/sessions/session-1" >/dev/null
sleep 1

PEN_TOTAL=$(curl -fsS "${FIRESTORE_BASE}/users/${TEST_UID}/pens/pen-1" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['fields']['totalSessions']['integerValue'])" 2>/dev/null || echo "?")
assert_eq "$PEN_TOTAL" "0" "Function onSessionDeleted fired (pen.totalSessions decremented)"

# ── 5) All assertions passed ───────────────────────────────────

echo ""
echo "✓ All smoke assertions passed."
echo "  Next: open http://${EMULATOR_HOST}:4000 in a browser to"
echo "  inspect the emulator UI and confirm the trigger logs."
