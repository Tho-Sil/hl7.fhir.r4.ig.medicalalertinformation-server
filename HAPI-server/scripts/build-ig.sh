#!/usr/bin/env bash
# Build the FHIR Implementation Guide and copy the resulting NPM package
# (.tgz) into HAPI-server/ig/ so the running HAPI server can load it.
#
# Requirements (all need network access to packages.fhir.org):
#   - Node.js 18+ and npm
#   - Java 11+
#   - SUSHI: npm install -g fsh-sushi
#   - The IG Publisher jar (downloaded automatically by _updatePublisher.sh)
#
# Usage:
#   ./scripts/build-ig.sh            # full build (SUSHI + IG Publisher)
#   ./scripts/build-ig.sh --sushi    # SUSHI only (faster, no narrative pages)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(dirname "$SERVER_DIR")"
IG_DIR="$REPO_ROOT/hl7.fhir.r4.ig.medicalalertinformation"
OUT_DIR="$SERVER_DIR/ig"

if [[ ! -d "$IG_DIR" ]]; then
  echo "error: IG source not found at $IG_DIR" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

cd "$IG_DIR"

if ! command -v sushi >/dev/null 2>&1; then
  echo "error: sushi not found in PATH. Install with: npm install -g fsh-sushi" >&2
  exit 1
fi

echo "[build-ig] running SUSHI..."
sushi .

if [[ "${1:-}" == "--sushi" ]]; then
  PKG_TGZ="$IG_DIR/fsh-generated/package.tgz"
  if [[ ! -f "$PKG_TGZ" ]]; then
    echo "[build-ig] packaging fsh-generated/resources/ into a tgz..."
    tar -czf "$PKG_TGZ" -C "$IG_DIR/fsh-generated" resources
  fi
else
  echo "[build-ig] running IG Publisher..."
  if [[ ! -f "$IG_DIR/input-cache/publisher.jar" ]]; then
    bash "$IG_DIR/_updatePublisher.sh" -y
  fi
  bash "$IG_DIR/_genonce.sh"
  PKG_TGZ="$IG_DIR/output/package.tgz"
fi

if [[ ! -f "$PKG_TGZ" ]]; then
  echo "error: expected package.tgz not produced at $PKG_TGZ" >&2
  exit 1
fi

DEST="$OUT_DIR/hl7.fhir.r4.ig.medicalalertinformation-0.1.0.tgz"
cp "$PKG_TGZ" "$DEST"
echo "[build-ig] wrote $DEST"
echo
echo "Next: edit HAPI-server/config/application.yaml and uncomment the"
echo "'implementationguides:' block, then restart the server:"
echo "  docker compose -f $SERVER_DIR/docker-compose.yml restart"
