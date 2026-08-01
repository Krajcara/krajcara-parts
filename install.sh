#!/bin/bash
# Krajcara.com - update skripta
# Povlači najnovije izmene sa GitHub-a i restartuje aplikaciju.
# Pokreni: bash update.sh

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$HOME/.krajcara"
TOKEN_FILE="$CONFIG_DIR/github_token"
REPO_URL_FILE="$CONFIG_DIR/repo_slug"

echo "=== Krajcara.com - update ==="

if [ ! -f "$TOKEN_FILE" ] || [ ! -f "$REPO_URL_FILE" ]; then
  echo "GitHub token/repo nije pronađen. Pokreni prvo install.sh."
  exit 1
fi

GITHUB_TOKEN=$(cat "$TOKEN_FILE")
REPO_SLUG=$(cat "$REPO_URL_FILE")
AUTH_URL="https://${GITHUB_TOKEN}@github.com/${REPO_SLUG}.git"

cd "$APP_DIR"

echo "-> Povlačim najnovije izmene..."
# Token se koristi samo za ovu komandu (u memoriji), NIKAD se ne upisuje u .git/config
git fetch "$AUTH_URL" main
git reset --hard FETCH_HEAD   # promeni 'main' iznad i ovde u 'master' ako repo koristi taj naziv grane

echo "-> Ažuriram backend zavisnosti..."
cd "$APP_DIR/server"
npm install --omit=dev

echo "-> Proveravam izmene u šemi baze (bezopasno, IF NOT EXISTS)..."
npm run init-db

echo "-> Ažuriram frontend zavisnosti i pravim novi build..."
cd "$APP_DIR/client"
npm install
npm run build

echo "-> Restartujem aplikaciju kroz PM2..."
pm2 restart krajcara-server

echo ""
echo "=== Update završen ==="
pm2 logs krajcara-server --lines 15 --nostream
