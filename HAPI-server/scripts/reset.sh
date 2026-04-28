#!/usr/bin/env bash
# Wipes Patients, Flags and Observations from the running HAPI server
# using $expunge, then re-loads the bundles in HAPI-server/data/.
#
# This is a destructive operation; it will delete EVERY Patient, Flag
# and Observation on the target server. Intended for the local demo
# server only.
#
# Usage:
#   ./scripts/reset.sh                           # uses http://localhost:8080/fhir
#   ./scripts/reset.sh http://host:port/fhir
set -euo pipefail

BASE="${1:-${FHIR_BASE:-http://localhost:8080/fhir}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[reset] target base: $BASE"
echo "[reset] this will DELETE all Flag, Observation and Patient resources."
read -r -p "[reset] continue? type 'yes' to proceed: " confirm
if [[ "$confirm" != "yes" ]]; then
  echo "[reset] aborted."
  exit 1
fi

for type in Flag Observation Patient; do
  echo "[reset] delete-expunge $type..."
  curl -sf -X DELETE \
    "$BASE/$type?_expunge=true" \
    -H 'Accept: application/fhir+json' >/dev/null || true
done

echo "[reset] reloading data..."
"$SCRIPT_DIR/load-data.sh" "$BASE"
