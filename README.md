# Krajcara.com

Web aplikacija za prodaju polovnih, reparovanih i novih auto delova. Bez online plaćanja — kupci naručuju telefonom, plaćanje pouzećem.

## Struktura projekta

```
krajcara-parts/
├── install.sh          # Instalacija na svež server
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
        ├── context/     # SettingsContext (deljena podešavanja - banner, kontakt)
        ├── pages/       # Home, PartDetail, Contact, AdminLogin, AdminDashboard...
        └── components/  # Header, PartCard, UnderConstructionBanner
```

## Prva instalacija na server

Preduslov: Ubuntu server sa `git`, `curl`, `sudo` pravima, i već podešen Nginx Proxy Manager + Cloudflare DNS/DDNS za `krajcara.com`.

Repozitorijum je **javan**, pa nije potreban nikakav token za kloniranje ili ažuriranje. Prvo se repo klonira ručno, pa se iz njega pokreće instalacija:

```bash
git clone https://github.com/krajcara/krajcara-parts.git
cd krajcara-parts
bash install.sh
```

> Važno: pokreni `bash install.sh` **bez** `sudo` ispred. Skripta sama interno poziva `sudo` samo tamo gde je stvarno potrebno (instalacija Node.js-a i PM2-a). Ako pokreneš ceo `install.sh` sa `sudo`, folder projekta (uključujući `.git`) ostaje u vlasništvu `root` korisnika, što kasnije pravi probleme sa `git pull` i dozvolama.

Skripta ništa ne pita — potpuno je automatska. Ona će:
1. Instalirati Node.js (ako nedostaje) i PM2
2. Prepoznati repo automatski (iz `git remote` postojećeg klona)
3. Instalirati sve zavisnosti (backend + frontend)
4. Kreirati `server/.env` iz `.env.example` i automatski generisati siguran `JWT_SECRET` i nasumičnu `ADMIN_PASSWORD` (korisničko ime ostaje `admin`)
5. Inicijalizovati SQLite bazu i kreirati admin nalog
6. Napraviti produkcioni build frontenda
7. Pokrenuti aplikaciju kroz PM2 (automatski restart pri padu i pri reboot-u servera)

Na kraju instalacije, generisano admin korisničko ime i lozinka se ispisuju na ekranu i čuvaju u `~/.krajcara/admin_credentials.txt` — **zapiši/sačuvaj taj fajl**, jer se lozinka posle toga nigde više ne prikazuje u čitljivom obliku.

> Automatsko generisanje se dešava samo pri **prvoj** instalaciji (kad `server/.env` još ne postoji). Ako fajl već postoji, skripta ga ne dira — tvoje već podešene vrednosti ostaju netaknute. Ako želiš drugo korisničko ime umesto `admin`, izmeni `ADMIN_USERNAME` ručno u `server/.env` i pokreni `npm run seed-admin` iz `server/` foldera.

## Ažuriranje aplikacije (nakon izmena u kodu)

```bash
cd krajcara-parts
bash update.sh
```

Povlači izmene (`git pull`, bez potrebe za tokenom pošto je repo javan), ažurira zavisnosti, pravi novi frontend build i restartuje PM2 proces.

## Podešavanje Nginx Proxy Manager-a

1. Novi **Proxy Host**: domen `krajcara.com` i `www.krajcara.com`
2. Forward ka internoj IP adresi servera i portu iz `server/.env` (podrazumevano `4000`)
3. SSL: Let's Encrypt sertifikat (isto kao ostali tvoji servisi)
4. Na Cloudflare-u proveri da je SSL mod **Full** ili **Full (strict)**, pošto je proxy (oranž oblačić) uključen za `www`

## Traka "Sajt u izradi"

Sajt prikazuje traku na vrhu dok je opcija uključena. Isključuje se u **Admin panelu → Podešavanja** kad sajt bude spreman za zvanično lansiranje — nije potrebna izmena koda.

## Kontakt stranica

Dugme "Pozovite nas" u zaglavlju vodi na `/kontakt`, gde se prikazuju telefon i e-mail. Oba se unose u **Admin panelu → Podešavanja → Kontakt podaci**. Dok god telefon nije unet, dugme za poručivanje na stranici dela vodi na kontakt stranicu umesto direktnog poziva.

## Interni broj dela

Svaki deo dobija predlog internog broja u formatu `K0001` (nastavlja se od najvišeg dosad korišćenog broja). Broj je **editabilan** — u formi za dodavanje/izmenu dela u Admin panelu možeš ga slobodno promeniti u šta god želiš. Sistem ne dozvoljava dva dela sa istim brojem.

## Kategorije, vozila i podešavanja — ponašanje pri update-u

Podrazumevane kategorije (Motor, Menjač, Elektrika...) ubacuju se **samo pri prvoj instalaciji**, kad je tabela kategorija prazna. Nakon toga, Admin panel je jedini izvor istine — šta god obrišeš, dodaš ili preimenuješ u **Admin panelu → Kategorije** ostaje trajno i nikad se ne vraća unazad, koliko god puta pokrenuo `update.sh`.

## Resetovanje delova i vozila (npr. posle testiranja)

Da obrišeš sve unete delove i vozila, a da kategorije i admin nalog ostanu netaknuti:

```bash
cd ~/krajcara-parts/server
pm2 stop krajcara-server

node -e "
const db = require('./src/db/connection');
db.exec(\`
  DELETE FROM part_vehicle_compatibility;
  DELETE FROM parts;
  DELETE FROM vehicles;
\`);
console.log('Delovi i vozila obrisani. Kategorije i admin nalog netaknuti.');
"

pm2 start krajcara-server
```

Pošto se predlog internog broja dela računa na osnovu poslednjeg unetog broja, posle ovoga prvi novi deo ponovo dobija predlog `K0001`.

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

## Bezbednosna napomena — javni repo

Pošto je repozitorijum javan, **nikad ne komituj** `server/.env` (već je u `.gitignore`) — sadrži `JWT_SECRET` i admin lozinku. Takođe ne komituj `server/data/` (baza) ni `server/uploads/` (slike delova) — svi su već pokriveni `.gitignore`-om, ali vredi povremeno proveriti `git status` pre `git push`-a da se ništa slučajno ne doda.
