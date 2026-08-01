#!/bin/bash
# Krajcara.com - update skripta
# Povlači najnovije izmene sa GitHub-a i restartuje aplikaciju.
# Pokreni: bash update.sh   (BEZ sudo ispred)

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Krajcara.com - update ==="

cd "$APP_DIR"

echo "-> Povlačim najnovije izmene (repo je javan, token nije potreban)..."
git pull

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
