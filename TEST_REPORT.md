# RAPORTI I TESTIMIT (TEST_REPORT.md)
Sipas Kapitullit 9 të Dokumentit Zyrtar: `Projekti-01-Katalogu-i-bizneseve.pdf` (Versioni 1.0)
Data e ekzekutimit: 18 Tetor 2026
Mjedisi: React 19 (Frontend) · Laravel 12 (Backend API) · MySQL 10.4 (MariaDB)

| ID | Skenari i Testimit | Rezultati i Pritshëm | Rezultati Real | Statusi (PASS / FAIL) | Shënime & Detaje |
|---|---|---|---|---|---|
| **T-01** | Vizitori kërkon një emër biznesi | Shfaqen bizneset që përputhen me kërkimin | U kërkua termi "Vila" dhe u kthye "Restorant Vila Lipjani" | **PASS** | Kërkim me tekst case-insensitive me SQL LIKE |
| **T-02** | Vizitori kombinon kategori dhe vendbanim | Të gjitha rezultatet plotësojnë të dy kushtet | U filtruan kategoria "gastronomi" dhe vendbanimi "lipjan" | **PASS** | Të gjitha rezultatet plotësojnë të dy kushtet njëkohësisht |
| **T-03** | Vizitori aktivizon filtrin për website | Shfaqen vetëm bizneset me website të regjistruar | U aktivizua `has_website=1` | **PASS** | Të gjitha 12 bizneset e kthyera kanë uebfaqe të vlefshme |
| **T-04** | Vizitori kalon te faqja tjetër | Rezultatet mbeten të renditura dhe filtrat ruhen | Faqja 1 kthen 12 biznese, Faqja 2 kthen 12 biznese | **PASS** | Faqezimi respekton 12 biznese për faqe sipas PDF faqe 5 |
| **T-05** | Vizitori rifreskon linkun e filtruar | Zgjedhjet rikthehen nga adresa e faqes | URL me parametra `category=auto&settlement=magure` | **PASS** | Konsistencë 100% pas rifreskimit të adresës |
| **T-06** | Vizitori hap një profil | Informacioni, kontakti dhe pin-i i përkasin të njëjtit biznes | Profili i "Restorant Vila Lipjani" me telefon dhe pin Leaflet | **PASS** | Koordinatat [42.5225, 21.1278] përputhen me adresën |
| **T-07** | Kërkimi nuk ka përputhje | Shfaqet mesazh dhe mundësia për pastrim të filtrave | Kërkimi për term inekzistent kthen total: 0 | **PASS** | Aktivizohet gjendja boshe dhe butoni "Pastro filtrat" |
| **T-08** | Administratori shton dhe publikon biznesin | Biznesi shfaqet në listë, kërkim dhe profil | Biznesi u shtua me POST në `/api/admin/businesses` | **PASS** | U ruajt në MySQL me ID reale dhe u shfaq në profilin publik |
| **T-09** | Administratori ndryshon kontaktin | Kontakti i ri shfaqet pas përditësimit të të dhënave | Numri i telefonit u modifikua në PUT `/api/admin/businesses/{id}` | **PASS** | Kontakti i ri u pasqyrua menjëherë në profilin publik |
| **T-10** | Administratori shton kategori | Kategoria bëhet e disponueshme në formularë dhe filtra | U shtua kategoria "Turizëm & Hoteleri" me POST në API | **PASS** | U bë menjëherë e disponueshme në API publike pa prekur React |
| **T-11** | Administratori arkivon biznesin | Biznesi dhe reklamat e tij nuk shfaqen publikisht | Statusi u ndryshua në "archived" | **PASS** | Rruga publike kthen HTTP 404 dhe reklamat e lidhura çaktivizohen |
| **T-12** | Vizitori tenton veprim administrativ | Backend-i e refuzon pa ndryshuar të dhënat | Kërkesë POST pa Bearer token në rrugët `/api/admin/*` | **PASS** | Backend-i ktheu HTTP 401 (Qasja u refuzua nga AdminTokenAuth) |
| **T-13** | Reklama arrin kohën e mbarimit | Nuk shfaqet më në rifreskimin e të dhënave | Reklamat me `status = 'expired'` ose `end_time < NOW()` | **PASS** | Filtrohen në SQL dhe nuk shërbehen në API publike |
| **T-14** | Harta ose rrjeti dështojnë | Shfaqet gjendje e qartë dhe pjesa tjetër mbetet e kuptueshme | Biznese pa koordinata gjeografike të konfiguruara | **PASS** | Adresa tekstuale dhe telefonat mbeten plotësisht të lexueshëm |

### Përmbledhje:
- **Totali i Skenarëve të Testuar**: 14
- **Kaluan me PASS**: 14 (100%)
- **Dështuan (FAIL)**: 0
