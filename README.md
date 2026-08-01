# Krajcara.com

Web aplikacija za prodaju polovnih, reparovanih i novih auto delova. Bez online plaćanja — kupci naručuju telefonom, plaćanje pouzećem.

## Struktura projekta

```
krajcara-parts/
├── install.sh          # Instalacija na svež server (traži GitHub token jednom)
├── update.sh           # Povlačenje izmena i restart aplikacije
├── server/             # Backend (Express + SQLite)
│   ├── src/
│   │   ├── db/         # Šema baze, konekcija, init/seed skripte
│   │   ├── routes/     # API rute (auth, parts, vehicles, categories, settings)
│   │   ├── middleware/ # JWT autentifikacija
│   │   └── utils/      # Obrada slika (resize/kompresija)
│   └── .env.example
└── client/              # Frontend (React + Vite + Tailwind)
    └── src/
        ├── pages/       # Home, PartDetail, AdminLogin, AdminDashboard...
        └── components/  # Header, PartCard, UnderConstructionBanner
```

## Prva instalacija na server

Preduslov: Ubuntu server sa `git`, `curl`, `sudo` pravima, i već podešen Nginx Proxy Manager + Cloudflare DNS/DDNS za `krajcara.com`.

```bash
git clone https://github.com/<korisnik>/<repo>.git krajcara-parts
cd krajcara-parts
bash install.sh
```

Skripta će:
1. Instalirati Node.js (ako nedostaje) i PM2
2. **Pitati za GitHub token samo prvi put** — sačuvaće ga u `~/.krajcara/github_token` (fajl je čitljiv samo tvom korisniku, `chmod 600`) i koristiti ga automatski ubuduće za `update.sh`
3. Instalirati sve zavisnosti (backend + frontend)
4. Kreirati `server/.env` iz `.env.example` — **obavezno izmeni `JWT_SECRET`, `ADMIN_USERNAME` i `ADMIN_PASSWORD`** pre nego što nastaviš
5. Inicijalizovati SQLite bazu i kreirati admin nalog
6. Napraviti produkcioni build frontenda
7. Pokrenuti aplikaciju kroz PM2 (automatski restart pri padu i pri reboot-u servera)

## Ažuriranje aplikacije (nakon izmena u kodu)

```bash
cd krajcara-parts
bash update.sh
```

Koristi već sačuvan GitHub token — ne traži ga ponovo. Povlači izmene, ažurira zavisnosti, pravi novi frontend build i restartuje PM2 proces.

> Napomena: `update.sh` koristi `git reset --hard origin/main`. Ako repo koristi granu `master`, izmeni tu liniju u skripti.

## Podešavanje Nginx Proxy Manager-a

1. Novi **Proxy Host**: domen `krajcara.com` i `www.krajcara.com`
2. Forward ka internoj IP adresi servera i portu iz `server/.env` (podrazumevano `4000`)
3. SSL: Let's Encrypt sertifikat (isto kao ostali tvoji servisi)
4. Na Cloudflare-u proveri da je SSL mod **Full** ili **Full (strict)**, pošto je proxy (oranž oblačić) uključen za `www`

## Traka "Sajt u izradi"

Sajt prikazuje traku na vrhu dok je opcija uključena. Isključuje se u **Admin panelu → Podešavanja** kad sajt bude spreman za zvanično lansiranje — nije potrebna izmena koda.

## Razvoj lokalno (na tvom računaru, ne na produkcionom serveru)

```bash
# Backend
cd server
npm install
cp .env.example .env
npm run init-db
npm run seed-admin
npm start          # radi na http://localhost:4000

# Frontend (u drugom terminalu)
cd client
npm install
npm run dev        # radi na http://localhost:5173, proxy-uje /api ka portu 4000
```

## Baza podataka i slike — backup

- Baza: `server/data/krajcara.db` (SQLite fajl)
- Slike delova: `server/uploads/`

Oba se **ne nalaze na GitHub-u** (u `.gitignore`) — čuvaju se samo na serveru. Preporuka: cron job koji redovno kopira oba foldera na drugu lokaciju (npr. mrežni disk ili drugi VM u Proxmox okruženju).

Primer cron zadatka (svaki dan u 3h ujutru):
```bash
0 3 * * * tar -czf /backup/krajcara-$(date +\%Y\%m\%d).tar.gz -C /putanja/do/krajcara-parts/server data uploads
```

## Fleksibilnost polja dela

Osnovna polja (naziv, OEM broj, status, cena...) su fiksne kolone u bazi. Dodatna polja specifična za kategoriju (npr. napon/amperaža za elektriku) idu u `extra_attributes` (JSON) — nova polja se mogu dodavati bez izmene šeme baze.
