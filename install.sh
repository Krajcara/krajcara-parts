#!/bin/bash
# Krajcara.com - instalaciona skripta
# Pokreni: bash install.sh   (BEZ sudo ispred - skripta sama poziva sudo gde treba)

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$HOME/.krajcara"
REPO_URL_FILE="$CONFIG_DIR/repo_url"

echo "=== Krajcara.com - instalacija ==="
mkdir -p "$CONFIG_DIR"

# ---------- 1. Node.js ----------
if ! command -v node &> /dev/null; then
  echo "-> Node.js nije pronađen, instaliram (NodeSource, v20 LTS)..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "-> Node.js je već instaliran: $(node -v)"
fi

# ---------- 2. PM2 ----------
if ! command -v pm2 &> /dev/null; then
  echo "-> PM2 nije pronađen, instaliram globalno..."
  sudo npm install -g pm2
else
  echo "-> PM2 je već instaliran."
fi

# ---------- 3. Repo URL (repo je javan, token nije potreban) ----------
if [ -f "$REPO_URL_FILE" ]; then
  REPO_URL=$(cat "$REPO_URL_FILE")
else
  echo ""
  echo "Repo je javan, ne treba token. Unesi samo URL repozitorijuma."
  echo "Primer: https://github.com/krajcara/krajcara-parts.git"
  read -rp "Repo URL: " REPO_URL
  echo "$REPO_URL" > "$REPO_URL_FILE"
fi

# ---------- 4. Kloniranje repozitorijuma (ako još nije kloniran) ----------
if [ ! -d "$APP_DIR/.git" ]; then
  echo "-> Kloniram repozitorijum..."
  TMP_CLONE=$(mktemp -d)
  git clone "$REPO_URL" "$TMP_CLONE"
  cp -rn "$TMP_CLONE"/. "$APP_DIR"/
  rm -rf "$TMP_CLONE"
else
  echo "-> Repozitorijum je već kloniran u $APP_DIR."
  (cd "$APP_DIR" && git remote set-url origin "$REPO_URL" 2>/dev/null || git remote add origin "$REPO_URL")
fi

cd "$APP_DIR"

# ---------- 5. Backend ----------
echo "-> Instaliram backend zavisnosti..."
cd "$APP_DIR/server"
npm install --omit=dev

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo ""
    echo "!! Kreiran je server/.env iz .env.example."
  else
    echo ""
    echo "!! .env.example nije pronađen u repo-u. Kreiram podrazumevani server/.env direktno."
    cat > .env << 'ENV_EOF'
PORT=4000
JWT_SECRET=promeni-ovo-u-nesto-slucajno-i-tajno
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=promeni-ovu-lozinku
IMAGE_MAX_DIMENSION=1200
IMAGE_QUALITY=80
ENV_EOF
  fi
  echo "!! OBAVEZNO izmeni JWT_SECRET, ADMIN_USERNAME i ADMIN_PASSWORD u server/.env pre produkcije."
  echo ""
  read -rp "Pritisni ENTER kad završiš izmenu server/.env (ili sad da nastavim sa podrazumevanim)..." _
fi

echo "-> Inicijalizujem bazu podataka..."
npm run init-db
npm run seed-admin

# ---------- 6. Frontend ----------
echo "-> Instaliram frontend zavisnosti i pravim produkcioni build..."
cd "$APP_DIR/client"
npm install
npm run build

# ---------- 7. Pokretanje kroz PM2 ----------
cd "$APP_DIR/server"
if pm2 describe krajcara-server &> /dev/null; then
  echo "-> Aplikacija je već pokrenuta u PM2, radim restart..."
  pm2 restart krajcara-server
else
  echo "-> Pokrećem aplikaciju kroz PM2..."
  pm2 start src/index.js --name krajcara-server
  pm2 save
  echo "-> Podešavam PM2 da se pokrene automatski nakon restarta servera..."
  pm2 startup | tail -n 1 > /tmp/pm2_startup_cmd.sh
  echo "   Ako je potrebno, pokreni ručno komandu ispisanu iznad (pm2 startup)."
fi

echo ""
echo "=== Instalacija završena ==="
echo "Aplikacija radi na portu iz server/.env (podrazumevano 4000)."
echo "Podesi Nginx Proxy Manager da usmerava krajcara.com -> ovaj server:PORT."
echo "Admin panel: https://krajcara.com/admin/login"
