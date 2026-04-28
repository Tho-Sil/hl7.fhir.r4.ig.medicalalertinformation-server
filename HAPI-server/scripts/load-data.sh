#!/usr/bin/env bash
# POSTs every transaction Bundle in HAPI-server/data/ to the FHIR base
# endpoint, in filename order. Each bundle uses conditional PUTs, so
# repeated runs are idempotent.
#
# Usage:
#   ./scripts/load-data.sh                       # uses http://localhost:8080/fhir
#   ./scripts/load-data.sh http://host:port/fhir # custom base
set -euo pipefail

BASE="${1:-${FHIR_BASE:-http://localhost:8080/fhir}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$(dirname "$SCRIPT_DIR")/data"

if ! command -v curl >/dev/null; then
  echo "error: curl is required" >&2
  exit 1
fi

echo "[load-data] target base: $BASE"
echo "[load-data] waiting for server to respond..."
for i in $(seq 1 60); do
  if curl -sf -o /dev/null "$BASE/metadata"; then
    echo "[load-data] server ready"
    break
  fi
  sleep 2
  if [[ $i -eq 60 ]]; then
    echo "error: server at $BASE did not respond within 120s" >&2
    exit 1
  fi
done

shopt -s nullglob
files=("$DATA_DIR"/*.json)
if [[ ${#files[@]} -eq 0 ]]; then
  echo "error: no data files in $DATA_DIR" >&2
  exit 1
fi

for f in "${files[@]}"; do
  name="$(basename "$f")"
  echo "[load-data] POST $name"
  http_code=$(curl -sS -o /tmp/load-data-resp.json -w '%{http_code}' \
    -H 'Content-Type: application/fhir+json' \
    -H 'Accept: application/fhir+json' \
    -X POST --data-binary @"$f" "$BASE")
  if [[ "$http_code" != 2?? ]]; then
    echo "error: HTTP $http_code while posting $name" >&2
    cat /tmp/load-data-resp.json >&2
    exit 1
  fi
done

echo "[load-data] done."
echo "[load-data] try: curl -s '$BASE/Patient?_count=20' | head -50"
