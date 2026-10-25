# Katalogu i Bizneseve të Komunës së Lipjanit

Platformë **Full-Stack** për gjetjen, kërkimin, filtrimin dhe kontaktimin e bizneseve në territorin e Komunës së Lipjanit.  
Ndërtuar sipas specifikimeve 100% të dokumentit zyrtar: `Projekti-01-Katalogu-i-bizneseve.pdf` (Shkolla Digjitale Lipjan, Praktika Profesionale 2026/27).

---

## 🛠️ Staku Teknologjik
- **Frontend**: React 19 (SPA me Vite), Leaflet (Hartat me OpenStreetMap), Lucide Icons, CSS Modular Responsive.
- **Backend**: Laravel 12 API, Eloquent ORM, RESTful JSON Endpoints, Custom Token Authentication Middleware.
- **Baza e të Dhënave**: MySQL (MariaDB).
- **Rregull Arkitekturor**: React nuk lidhet drejtpërdrejt me MySQL; të gjitha të dhënat filtrohen, validohen dhe shërbehen nga Laravel API.

---

## 🚀 Udhëzimet e Nisjes së Projektit

### 1. Baza e të Dhënave (MySQL)
Sigurohuni që shërbimi MySQL në XAMPP ose sistemin tuaj është aktiv në portën `3306`.  
Databaza e konfiguruar në `backend/.env`: `katalogu_lipjan`.

### 2. Backend (Laravel API)
```bash
cd backend
composer install
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```
Backend API do të jetë i qasshëm në: `http://127.0.0.1:8000/api`

Konfiguroni `backend/.env` me parametrat e databazës suaj para migrimit. `migrate:fresh` i fshin tabelat ekzistuese dhe nuk duhet përdorur në një databazë që përmban të dhëna që dëshironi t’i ruani.

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Portali publik do të jetë i qasshëm në: `http://localhost:5173`

---

## 🔑 Kredencialet e Administratorit
- Paneli: `http://localhost:5173/admin`
- Në mjedis lokal, përdorni llogarinë demo të krijuar nga `backend/database/seeders/DatabaseSeeder.php`. Ndryshoni kredencialet demo para përdorimit real; mos përdorni vlera demo në prodhim.

---

## 📌 Veçoritë Kryesore të Implementuara

1. **Faqja Kryesore (Ballina)**:
   - Kërkim qendror me fushë & Enter.
   - Sektorët ekonomikë dhe shkurtore për vendbanimet kryesore.
   - Banner reklamimi i etiketuar qartë si *"E sponsorizuar / Reklamë"*.
   - Biznese të përzgjedhura në mënyrë dinamike nga MySQL.

2. **Katalogu Publik i Bizneseve (`/bizneset`)**:
   - **Kërkim me tekst**: sipas emrit, përshkrimit dhe adresës, me mbështetje për karaktere shqipe (ë/e).
   - **Filtrat Dinamikë**: Kategori, Vendbanim dhe Shërbime nga databaza.
   - **Filtrat Statikë**: Vetëm me uebfaqe, Vetëm me orar të publikuar.
   - **Renditja**: Më të rejat, A-Z, Z-A, Më të vlerësuarat.
   - **Faqezimi (Pagination)**: 12 biznese për faqe me numrin total të përputhjeve.
   - **Ruajtja në URL**: Të gjithë parametrat e kërkimit ruhen në `searchParams` të URL-së (`kerko`, `kategoria`, `vendbanimi`, `sherbimi`, `website`, `orari`, `renditja`, `faqe`).
   - **Harta me Leaflet**: E etiketuar *"Bizneset e kësaj faqeje"* që vendos pin-a interaktivë për të gjitha bizneset e faqes aktive me popup dhe link në profil.

3. **Profili i Biznesit (`/bizneset/:id`)**:
   - Emri, kategoria, vendbanimi, adresa, vlerësimi me yje.
   - Përshkrimi i plotë dhe lista e shërbimeve konkrete.
   - Orari i punës (kur mungon, shfaqet saktësisht *"Orari nuk është publikuar"*).
   - Harta e dedikuar Leaflet me pin-in e biznesit.
   - Butonat e veprimit: *"Telefono"* (`tel:`) dhe *"Shiko udhëzimet"* (hap hartën me rrugën deri te destinacioni).
   - **Mbrojtje e plotë**: Bizneset `draft` ose `archived` nuk shfaqen dhe kthejnë mesazh të qartë 404.

4. **Paneli i Administrimit (`/admin`)**:
   - **Autentikim & Mbrojtje**: Hyrje me email & fjalëkalim; ruajtje e sigurt me Bearer Token; refuzim automatik i vizitorëve të paautorizuar (HTTP 401/403).
   - **Statistika Reale**: Numri i bizneseve të publikuara, drafteve, të arkivuara dhe reklamave aktive direkt nga baza e të dhënave MySQL.
   - **CRUD Bizneseve**: Shtim, modifikim, ndryshim të shpejtë të statusit (`published`, `draft`, `archived`) dhe fshirje me konfirmim duke treguar emrin e biznesit.
   - **Rregulli i Arkivimit**: Kur një biznes arkivohet, reklamat e tij të lidhura çaktivizohen automatikisht.
   - **CRUD Kategorive & Vendbanimeve**: Me mbrojtje nga fshirja e lidhjeve (një kategori në përdorim nuk mund të fshihet pa u zhvendosur bizneset).
   - **Menaxhimi i Reklamave**: Mbështetje për të 4 statuset: `active`, `scheduled`, `expired`, `disabled` me kontroll të periudhës kohore dhe prioriteteve.

5. **Asistenti lokal i katalogut**:
   - Asistenti lundrues është i qasshëm në faqet publike dhe punon në Shqip e Anglisht; asistenti i panelit admin përdor të njëjtin motor përgjigjesh përmes endpoint-it të mbrojtur.
   - Biseda zanore përdor Web Speech API të shfletuesit: fjalët e njohura dërgohen si tekst te endpoint-i ekzistues Laravel dhe përgjigjja e motorit lokal lexohet me zë. Modaliteti zanor vazhdon me radhë të reja; përfshin heshtjen, ndalimin e të folurit dhe gjendje për mikrofonin/përpunimin.
   - Audioja nuk ngarkohet në endpoint-et tona dhe nuk ruhet nga faqja. Njohja mund të varet nga shërbimi i të folurit që përdor vetë shfletuesi. Mbështetja dhe zërat Shqip/Anglisht ndryshojnë sipas shfletuesit dhe sistemit; teksti mbetet i përdorshëm kur zëri nuk mbështetet.
   - Kërkesat si “më dërgo te bizneset/kategoritë/vendbanimet/admin” hapin faqen përkatëse. Paneli `/admin` vazhdon të kërkojë hyrje të vlefshme dhe asistenti nuk anashkalon autorizimin.
   - Asistenti përdor logjikë lokale dhe kërkon vetëm të dhënat reale në databazën e katalogut. Nuk dërgon bisedat te shërbim i jashtëm dhe nuk kërkon API key.
   - Kërkon biznese të publikuara, kategori e vendbanime në Shqip dhe Anglisht; përputhja toleron gabime të vogla në shkrim dhe të dhënat shfaqen me lidhje drejt faqes përkatëse. Ai nuk shpik biznese dhe nuk është model gjenerues për pyetje jashtë katalogut.
   - Endpoint-i publik kufizohet në 5 kërkesa në minutë / 60 në ditë për IP; endpoint-i i panelit admin mbetet i mbrojtur me token.
   - Historia e bisedës ruhet në `sessionStorage` vetëm për sesionin aktual të shfletuesit dhe mund të pastrohet me **Bisedë e re**.

### Testimi i bisedës zanore

Nisni Laravel API dhe React në dy terminale:

```powershell
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

```powershell
cd frontend
npm run dev
```

Hapni `http://localhost:5173`, lejoni mikrofonin kur shfletuesi e kërkon, zgjidhni bisedën zanore dhe thoni një pyetje për katalogun. Verifikoni që transkriptimi shfaqet si mesazh, Laravel kthen përgjigje nga të dhënat reale dhe shfletuesi e lexon përgjigjen. Pas saj, asistenti dëgjon radhën tjetër. Provoni edhe heshtjen/ndalimin dhe refuzimin e lejes së mikrofonit.

Kontrollet automatike:

```powershell
cd backend
php artisan test --filter=DirectoryAssistantTest
```

```powershell
cd frontend
npm run lint
npm run build
```

---

## 🧪 Rezultatet e Testimit të Skenarëve Zyrtarë (T-01 deri T-14)

Skripti i automatizuar i testimit ndodhet në `backend/test_scenarios.php`.  
Ekzekutimi: `php backend/test_scenarios.php`

| Kodi | Skenari i Testimit | Rezultati | Statusi |
|---|---|---|---|
| **T-01** | Vizitori kërkon një emër biznesi | U gjet biznesi i kërkuar me SQL LIKE | **PASS** |
| **T-02** | Vizitori kombinon kategori dhe vendbanim | Të gjitha rezultatet plotësojnë të dy kushtet | **PASS** |
| **T-03** | Vizitori aktivizon filtrin për website | Shfaqen vetëm bizneset me uebfaqe të regjistruar | **PASS** |
| **T-04** | Vizitori kalon te faqja tjetër | Faqezimi respekton 12 biznese për faqe | **PASS** |
| **T-05** | Vizitori rifreskon linkun e filtruar | Parametrat në URL kthejnë saktësisht të njëjtat rezultate | **PASS** |
| **T-06** | Vizitori hap një profil | Informacioni, kontakti dhe pin-i i përkasin të njëjtit biznes | **PASS** |
| **T-07** | Kërkimi nuk ka përputhje | Shfaqet gjendja pa rezultate me butonin "Pastro filtrat" | **PASS** |
| **T-08** | Administratori shton dhe publikon biznesin | Biznesi ruhet në MySQL dhe shfaqet menjëherë publikisht | **PASS** |
| **T-09** | Administratori ndryshon kontaktin | Telefoni i ri pasqyrohet në bazën e të dhënave dhe profil | **PASS** |
| **T-10** | Administratori shton kategori | Kategoria e re bëhet e disponueshme pa ndryshuar kodin | **PASS** |
| **T-11** | Administratori arkivon biznesin | Biznesi i arkivuar kthen 404 dhe reklamat e tij fshihen | **PASS** |
| **T-12** | Vizitori tenton veprim administrativ | Backend-i e refuzon kërkesën e paautorizuar (HTTP 401/403) | **PASS** |
| **T-13** | Reklama arrin kohën e mbarimit | Reklamat e skaduara nuk shërbehen në API publike | **PASS** |
| **T-14** | Harta ose rrjeti dështojnë | Adresa tekstuale dhe telefonat mbeten plotësisht të përdorshëm | **PASS** |

**Rezultati përfundimtar: 14 / 14 TESTE KALUAN ME SUKSES (PASS).**
Dokumentacioni shtesë: `REQUIREMENTS_CHECKLIST.md` dhe `TEST_REPORT.md`.
