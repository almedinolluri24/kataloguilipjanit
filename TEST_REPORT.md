# Raporti i testimit

Përditësuar më **29 tetor 2026**. Testet e backend-it përdorin SQLite në memorie (`backend/phpunit.xml`) dhe nuk ndryshojnë databazën lokale MySQL.

## Kontrollet automatike të ekzekutuara

| Komanda | Rezultati |
|---|---|
| `cd backend && php artisan test` | Kaluan 22 teste me 95 pohime. Përfshihen hyrja/dalja, profili, asistenti, CRUD i shërbimeve, autorizimi, kërkimi/filtrat, faqezimi, bizneset publike, arkivimi dhe reklamat e skaduara. |
| `cd frontend && npm run build` | Kaloi; Vite ndërtoi aplikacionin për prodhim. |
| `cd frontend && npm run lint` | Kodi i daljes 0. Mbetën 11 paralajmërime ekzistuese `react(set-state-in-effect)`; nuk raportohet gabim sintakse apo çelës përkthimi i dyfishtë. |

## Skenarët e pranimit të PDF-së

Testet automatike mbulojnë pjesë të rrjedhave T-01–T-14, por nuk janë të njëjta me një provë manuale të plotë të ndërfaqes në shfletues. Shënimi më poshtë dallon provat automatike nga ato që ende kërkojnë kontroll vizual.

| Skenari | Gjendja aktuale |
|---|---|
| T-01 Kërkimi sipas emrit | Testuar në API; mbulon normalizimin ë/e. |
| T-02 Filtri kategori + vendbanim | Testuar në API. |
| T-03 Filtri website | Testuar në API. |
| T-04 Faqezimi me 12 rezultate | Testuar në API, përfshirë faqen e dytë. |
| T-05 Rikthimi i filtrave nga URL pas rifreskimit | Kodi i URL-së është në projekt; kërkon provë në shfletues. |
| T-06 Profili dhe koordinatat | Fushat e profilit/API-së testohen; saktësia fizike e pin-it duhet krahasuar me adresën reale. |
| T-07 Gjendja pa rezultate | API-ja teston totalin zero; pamja dhe butoni i pastrimit kërkojnë provë në shfletues. |
| T-08 Shtim/publikim biznesi | API-ja administrative dhe shfaqja publike testohen. |
| T-09 Ndryshim telefoni | Ruajtja administrative dhe pasqyrimi publik testohen. |
| T-10 Shtim kategorie | API-ja ekziston; kontrolli i shfaqjes në formularët React kërkon provë në shfletues. |
| T-11 Arkivim biznesi dhe çaktivizim reklame | Testuar në API. |
| T-12 Refuzim pa autorizim | Testuar në API (kërkesa pa token refuzohet). |
| T-13 Reklamë e skaduar | Testuar në API me data relative ndaj orës aktuale. |
| T-14 Dështim harte/rrjeti | Kërkon provë vizuale në shfletues; nuk është shënuar PASS vetëm nga testi i backend-it. |

## Prova manuale që mbetet para dorëzimit

- Hap faqen në telefon dhe desktop; provo filtrat, URL-në pas rifreskimit, hartën dhe gjendjen pa rezultate.
- Hyr në panel, shto/ndrysho shërbim dhe provo se filtri përkatës del te katalogu publik.
- Provo gabim rrjeti me API-n të ndalur dhe sigurohu që faqja jep udhëzim të kuptueshëm.
- README tashmë përmban pamje reale të faqes kryesore te `docs/screenshots/home.png`; regjistro edhe demonstrimin/prezantimin e kërkuar nga profesori.

Mos ekzekuto `migrate:fresh` ose skriptet e vjetra të testimit mbi databazën me të dhëna që duhen ruajtur. Për testet e automatizuara përdor `php artisan test`, i cili përdor databazën SQLite në memorie.
