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
TGZ="$SERVER_DIR/ig/hl7se.fhir.r4.ig.medicalalertinformation-0.1.0.tgz"

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

# Read resourceType/id, and rewrite the id to a HAPI-acceptable form
# when SUSHI generated a purely-numeric id (HAPI-0960 forbids those
# on PUT). The canonical URL in .url is left untouched, so consumers
# look up by canonical and don't notice the tweak.
PREP="$EXTRACT/prepared"
mkdir -p "$PREP"
python3 - "$EXTRACT/package" "$PREP" <<'PY'
import json, os, re, sys
src, dst = sys.argv[1], sys.argv[2]
NUMERIC = re.compile(r'^[0-9]+$')
out = []
for name in sorted(os.listdir(src)):
    if not name.endswith('.json'):
        continue
    if name in ('package.json', '.index.json'):
        continue
    if name.startswith('ImplementationGuide-'):
        continue
    path = os.path.join(src, name)
    with open(path) as fh:
        try:
            d = json.load(fh)
        except json.JSONDecodeError:
            continue
    rt = d.get('resourceType')
    rid = d.get('id')
    if not rt or not rid:
        continue
    if NUMERIC.fullmatch(rid):
        rid = 'se-' + rid
        d['id'] = rid
    out_path = os.path.join(dst, name)
    with open(out_path, 'w') as fh:
        json.dump(d, fh)
    out.append((rt, rid, out_path))
with open(os.path.join(dst, '_index.tsv'), 'w') as fh:
    for rt, rid, p in out:
        fh.write(f"{rt}\t{rid}\t{p}\n")
PY

count=0
while IFS=$'\t' read -r rt rid f; do
  [[ -z "$rt" ]] && continue
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
done < "$PREP/_index.tsv"

echo "[load-ig] loaded $count canonical resources"
