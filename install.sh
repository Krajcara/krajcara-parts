#!/bin/bash
# Krajcara.com - instalaciona skripta
# Pokreni IZ VEĆ KLONIRANOG repozitorijuma: bash install.sh   (BEZ sudo ispred)

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$HOME/.krajcara"

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

# ---------- 3. Provera da smo unutar već kloniranog repozitorijuma ----------
if [ ! -d "$APP_DIR/.git" ]; then
  echo ""
  echo "!! Ovaj folder nije git repozitorijum."
  echo "!! Prvo kloniraj repo, pa iz njega pokreni instalaciju:"
  echo "     git clone https://github.com/krajcara/krajcara-parts.git"
  echo "     cd krajcara-parts"
  echo "     bash install.sh"
  exit 1
fi

echo "-> Repo: $(cd "$APP_DIR" && git remote get-url origin 2>/dev/null || echo 'nepoznat remote')"

cd "$APP_DIR"

# ---------- 4. Backend ----------
echo "-> Instaliram backend zavisnosti..."
cd "$APP_DIR/server"
npm install --omit=dev

GENERATED_PASSWORD=""

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
  else
    cat > .env << 'ENV_EOF'
PORT=4000
JWT_SECRET=placeholder
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=placeholder
IMAGE_MAX_DIMENSION=1200
IMAGE_QUALITY=80
ENV_EOF
  fi

  echo "-> Generišem bezbedne vrednosti za JWT_SECRET i ADMIN_PASSWORD..."

  if command -v openssl &> /dev/null; then
    JWT_SECRET_VALUE=$(openssl rand -hex 32)
    GENERATED_PASSWORD=$(openssl rand -base64 15 | tr -d '=+/')
  else
    JWT_SECRET_VALUE=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    GENERATED_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(12).toString('base64').replace(/[=+/]/g,''))")
  fi

  # Upiši generisane vrednosti u .env (bez upita korisniku)
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET_VALUE}|" .env
  sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=${GENERATED_PASSWORD}|" .env

  # Sačuvaj kredencijale i lokalno, van git repo-a, za slučaj da ih propustiš u terminalu
  ADMIN_USER_VALUE=$(grep '^ADMIN_USERNAME=' .env | cut -d'=' -f2)
  cat > "$CONFIG_DIR/admin_credentials.txt" << CRED_EOF
Admin panel: https://krajcara.com/admin/login
Korisničko ime: ${ADMIN_USER_VALUE}
Lozinka: ${GENERATED_PASSWORD}
CRED_EOF
  chmod 600 "$CONFIG_DIR/admin_credentials.txt"

  echo "-> server/.env je kreiran sa automatski generisanim JWT_SECRET i ADMIN_PASSWORD."
else
  echo "-> server/.env već postoji, preskačem generisanje."
fi

echo "-> Inicijalizujem bazu podataka..."
npm run init-db
npm run seed-admin

# ---------- 5. Frontend ----------
echo "-> Instaliram frontend zavisnosti i pravim produkcioni build..."
cd "$APP_DIR/client"
npm install
npm run build

# ---------- 6. Pokretanje kroz PM2 ----------
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
echo ""
if [ -n "$GENERATED_PASSWORD" ]; then
  echo "!! ADMIN PRISTUP (sačuvaj ovo - prikazuje se samo sada):"
  echo "   Korisničko ime: $(grep '^ADMIN_USERNAME=' server/.env | cut -d'=' -f2)"
  echo "   Lozinka:        ${GENERATED_PASSWORD}"
  echo "   (takođe sačuvano u ${CONFIG_DIR}/admin_credentials.txt)"
  echo ""
fi
echo "Admin panel: https://krajcara.com/admin/login"
