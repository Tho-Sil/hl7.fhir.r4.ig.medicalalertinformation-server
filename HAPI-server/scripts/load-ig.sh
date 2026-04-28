#!/usr/bin/env bash
# Extract the IG NPM-package tarball and PUT every FHIR canonical
# resource (StructureDefinition, ValueSet, CodeSystem, etc.) to the
# running HAPI server. This sidesteps HAPI's implementationguides:
# config block, which is fussy about local file URLs.
#
# Usage:
#   ./scripts/load-ig.sh                         # http://localhost:8080/fhir
#   ./scripts/load-ig.sh http://host:port/fhir
set -euo pipefail

BASE="${1:-${FHIR_BASE:-http://localhost:8080/fhir}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"
TGZ="$SERVER_DIR/ig/hl7.fhir.r4.ig.medicalalertinformation-0.1.0.tgz"

if [[ ! -f "$TGZ" ]]; then
  echo "error: $TGZ not found." >&2
  echo "       Build it first with: $SCRIPT_DIR/build-ig.sh --sushi" >&2
  exit 1
fi

if ! command -v python3 >/dev/null; then
  echo "error: python3 is required (used to read resourceType/id)" >&2
  exit 1
fi

EXTRACT="$(mktemp -d)"
trap 'rm -rf "$EXTRACT"' EXIT
tar -xzf "$TGZ" -C "$EXTRACT"

if [[ ! -d "$EXTRACT/package" ]]; then
  echo "error: tarball does not contain a 'package/' directory" >&2
  exit 1
fi

echo "[load-ig] waiting for server at $BASE..."
for i in $(seq 1 60); do
  if curl -sf -o /dev/null "$BASE/metadata"; then
    echo "[load-ig] server ready"
    break
  fi
  sleep 2
  if [[ $i -eq 60 ]]; then
    echo "error: server at $BASE did not respond within 120s" >&2
    exit 1
  fi
done

read_field() {
  python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(d.get(sys.argv[2],''))" "$1" "$2"
}

count=0
skipped=0
for f in "$EXTRACT/package"/*.json; do
  name="$(basename "$f")"
  case "$name" in
    package.json|.index.json) skipped=$((skipped+1)); continue ;;
    ImplementationGuide-*) skipped=$((skipped+1)); continue ;;
  esac

  rt="$(read_field "$f" resourceType)"
  rid="$(read_field "$f" id)"
  if [[ -z "$rt" || -z "$rid" ]]; then
    echo "[load-ig] skip $name (no resourceType/id)"
    skipped=$((skipped+1))
    continue
  fi

  http_code=$(curl -sS -o /tmp/load-ig-resp.json -w '%{http_code}' \
    -H 'Content-Type: application/fhir+json' \
    -H 'Accept: application/fhir+json' \
    -X PUT --data-binary @"$f" "$BASE/$rt/$rid")
  if [[ "$http_code" != 2?? ]]; then
    echo "[load-ig] HTTP $http_code on $rt/$rid:" >&2
    cat /tmp/load-ig-resp.json >&2
    exit 1
  fi
  echo "[load-ig] PUT $rt/$rid"
  count=$((count+1))
done

echo "[load-ig] loaded $count canonical resources, skipped $skipped"
