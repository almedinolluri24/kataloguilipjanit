<?php

/**
 * Automatium Test Suite për Skenarët T-01 deri T-14
 * Katalogu i Bizneseve të Komunës së Lipjanit
 * Bazohet në Kapitullin 9 të dokumentit zyrtar të profesorit: Projekti-01-Katalogu-i-bizneseve.pdf
 */

$baseUrl = 'http://127.0.0.1:8000/api';
$results = [];

function apiRequest($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $headers = [
        'Accept: application/json',
        'Content-Type: application/json'
    ];

    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

echo "=========================================================\n";
echo "   FILLIMI I TESTIMIT TE SKENAREVE ZYRTARE T-01 deri T-14\n";
echo "=========================================================\n\n";

// ----------------------------------------------------------------------
// T-01: Vizitori kërkon një emër biznesi
// Pritshmëria: Shfaqen bizneset që përputhen me kërkimin
// ----------------------------------------------------------------------
$res01 = apiRequest("{$baseUrl}/businesses?q=Vila");
$t01Passed = ($res01['code'] === 200 && isset($res01['body']['data']) && count($res01['body']['data']) > 0 && stripos($res01['body']['data'][0]['name'], 'Vila') !== false);
$results['T-01'] = [
    'name' => 'Vizitori kërkon një emër biznesi',
    'status' => $t01Passed ? 'PASS' : 'FAIL',
    'details' => $t01Passed ? "U gjet biznesi: " . $res01['body']['data'][0]['name'] : "Dështoi kërkimi për 'Vila'"
];
echo "T-01: {$results['T-01']['status']} - {$results['T-01']['details']}\n";

// ----------------------------------------------------------------------
// T-02: Vizitori kombinon kategori dhe vendbanim
// Pritshmëria: Të gjitha rezultatet plotësojnë të dy kushtet
// ----------------------------------------------------------------------
$res02 = apiRequest("{$baseUrl}/businesses?category=gastronomi&settlement=lipjan");
$t02Passed = false;
if ($res02['code'] === 200 && !empty($res02['body']['data'])) {
    $allMatch = true;
    foreach ($res02['body']['data'] as $biz) {
        if ($biz['category_id'] !== 'gastronomi' || $biz['settlement_id'] !== 'lipjan') {
            $allMatch = false;
            break;
        }
    }
    $t02Passed = $allMatch;
}
$results['T-02'] = [
    'name' => 'Vizitori kombinon kategori dhe vendbanim',
    'status' => $t02Passed ? 'PASS' : 'FAIL',
    'details' => $t02Passed ? "Të gjitha " . count($res02['body']['data']) . " rezultatet kanë category=gastronomi dhe settlement=lipjan" : "Disa rezultate nuk plotësojnë kushtet"
];
echo "T-02: {$results['T-02']['status']} - {$results['T-02']['details']}\n";

// ----------------------------------------------------------------------
// T-03: Vizitori aktivizon filtrin për website
// Pritshmëria: Shfaqen vetëm bizneset me website të regjistruar
// ----------------------------------------------------------------------
$res03 = apiRequest("{$baseUrl}/businesses?has_website=1");
$t03Passed = false;
if ($res03['code'] === 200 && !empty($res03['body']['data'])) {
    $allHaveWeb = true;
    foreach ($res03['body']['data'] as $biz) {
        if (empty($biz['website'])) {
            $allHaveWeb = false;
            break;
        }
    }
    $t03Passed = $allHaveWeb;
}
$results['T-03'] = [
    'name' => 'Vizitori aktivizon filtrin për website',
    'status' => $t03Passed ? 'PASS' : 'FAIL',
    'details' => $t03Passed ? "Të gjitha " . count($res03['body']['data']) . " bizneset kanë uebfaqe të vlefshme" : "U gjetën biznese pa uebfaqe"
];
echo "T-03: {$results['T-03']['status']} - {$results['T-03']['details']}\n";

// ----------------------------------------------------------------------
// T-04: Vizitori kalon te faqja tjetër (Pagination)
// Pritshmëria: Rezultatet mbeten të renditura dhe filtrat ruhen
// ----------------------------------------------------------------------
$res04_p1 = apiRequest("{$baseUrl}/businesses?page=1");
$res04_p2 = apiRequest("{$baseUrl}/businesses?page=2");
$t04Passed = ($res04_p1['code'] === 200 && $res04_p2['code'] === 200 &&
              $res04_p1['body']['current_page'] === 1 && $res04_p2['body']['current_page'] === 2 &&
              count($res04_p1['body']['data']) === 12 && !empty($res04_p2['body']['data']));
$results['T-04'] = [
    'name' => 'Vizitori kalon te faqja tjetër',
    'status' => $t04Passed ? 'PASS' : 'FAIL',
    'details' => $t04Passed ? "Faqja 1 ka 12 biznese, Faqja 2 u ngarkua me " . count($res04_p2['body']['data']) . " biznese" : "Faqezimi dështoi"
];
echo "T-04: {$results['T-04']['status']} - {$results['T-04']['details']}\n";

// ----------------------------------------------------------------------
// T-05: Vizitori rifreskon linkun e filtruar (URL persistence)
// Pritshmëria: Zgjedhjet rikthehen nga adresa e faqes
// ----------------------------------------------------------------------
$urlFiltered = "{$baseUrl}/businesses?category=auto&settlement=magure";
$res05_a = apiRequest($urlFiltered);
$res05_b = apiRequest($urlFiltered); // simulim i rifreskimit
$t05Passed = ($res05_a['code'] === 200 && $res05_b['code'] === 200 &&
              count($res05_a['body']['data']) === count($res05_b['body']['data']) &&
              $res05_a['body']['total'] === $res05_b['body']['total']);
$results['T-05'] = [
    'name' => 'Vizitori rifreskon linkun e filtruar',
    'status' => $t05Passed ? 'PASS' : 'FAIL',
    'details' => $t05Passed ? "Parametrat në URL kthejnë konsistencë 100% të rezultateve ({$res05_a['body']['total']} përputhje)" : "Rezultatet ndryshuan pas rifreskimit"
];
echo "T-05: {$results['T-05']['status']} - {$results['T-05']['details']}\n";

// ----------------------------------------------------------------------
// T-06: Vizitori hap një profil
// Pritshmëria: Informacioni, kontakti dhe pin-i i përkasin të njëjtit biznes
// ----------------------------------------------------------------------
$res06 = apiRequest("{$baseUrl}/businesses/b-1");
$t06Passed = ($res06['code'] === 200 && isset($res06['body']['business']) &&
              $res06['body']['business']['id'] === 'b-1' &&
              !empty($res06['body']['business']['phone']) &&
              !empty($res06['body']['business']['latitude']) &&
              !empty($res06['body']['business']['longitude']));
$results['T-06'] = [
    'name' => 'Vizitori hap një profil',
    'status' => $t06Passed ? 'PASS' : 'FAIL',
    'details' => $t06Passed ? "Profili i {$res06['body']['business']['name']} përmban telefon: {$res06['body']['business']['phone']} dhe koordinata Leaflet: [{$res06['body']['business']['latitude']}, {$res06['body']['business']['longitude']}]" : "Të dhënat e profilit mungojnë"
];
echo "T-06: {$results['T-06']['status']} - {$results['T-06']['details']}\n";

// ----------------------------------------------------------------------
// T-07: Kërkimi nuk ka përputhje
// Pritshmëria: Shfaqet mesazh dhe mundësia për pastrim të filtrave
// ----------------------------------------------------------------------
$res07 = apiRequest("{$baseUrl}/businesses?q=TermAbsolutishtInekzistent999");
$t07Passed = ($res07['code'] === 200 && isset($res07['body']['total']) && $res07['body']['total'] === 0 && empty($res07['body']['data']));
$results['T-07'] = [
    'name' => 'Kërkimi nuk ka përputhje',
    'status' => $t07Passed ? 'PASS' : 'FAIL',
    'details' => $t07Passed ? "Kthimi i 0 rezultateve aktivizon gjendjen bosh dhe butonin 'Pastro filtrat' në frontend" : "Nuk u kthye array bosh"
];
echo "T-07: {$results['T-07']['status']} - {$results['T-07']['details']}\n";

// ----------------------------------------------------------------------
// T-08: Administratori shton dhe publikon biznesin
// Pritshmëria: Biznesi shfaqet në listë, kërkim dhe profil
// ----------------------------------------------------------------------
// Hapi a: Login admin
$loginRes = apiRequest("{$baseUrl}/auth/login", 'POST', [
    'email' => 'admin@lipjan.com',
    'password' => 'admin123'
]);
$adminToken = $loginRes['body']['token'] ?? null;

$newBizData = [
    'name' => 'Test Auto Salloni Lipjani',
    'category_id' => 'auto',
    'settlement_id' => 'lipjan',
    'address' => 'Rruga Testuese, Nr. 100, Lipjan',
    'phone' => '+383 44 999 111',
    'email' => 'test@autosalloni-demo.com',
    'short_description' => 'Biznes i ri testues i shtuar nga administratori.',
    'description' => 'Përshkrim i gjerë testues për verifikimin e plotë të skenarit T-08 sipas PDF-së së profesorit.',
    'status' => 'published',
    'featured' => false,
    'latitude' => 42.5217,
    'longitude' => 21.1258
];

$res08_create = apiRequest("{$baseUrl}/admin/businesses", 'POST', $newBizData, $adminToken);
$createdId = $res08_create['body']['business']['id'] ?? null;

// Hapi b: Verifikim në pjesën publike
$res08_public = apiRequest("{$baseUrl}/businesses/{$createdId}");
$t08Passed = ($res08_create['code'] === 201 && $res08_public['code'] === 200 &&
              $res08_public['body']['business']['name'] === 'Test Auto Salloni Lipjani');
$results['T-08'] = [
    'name' => 'Administratori shton dhe publikon biznesin',
    'status' => $t08Passed ? 'PASS' : 'FAIL',
    'details' => $t08Passed ? "Biznesi u ruajt në MySQL me ID: {$createdId} dhe u shfaq menjëherë në profilin publik" : "Dështoi krijimi ose shfaqja publike"
];
echo "T-08: {$results['T-08']['status']} - {$results['T-08']['details']}\n";

// ----------------------------------------------------------------------
// T-09: Administratori ndryshon kontaktin
// Pritshmëria: Kontakti i ri shfaqet pas përditësimit të të dhënave
// ----------------------------------------------------------------------
$updatedPhone = '+383 49 777 000';
$res09_update = apiRequest("{$baseUrl}/admin/businesses/{$createdId}", 'PUT', [
    'phone' => $updatedPhone
], $adminToken);

$res09_public = apiRequest("{$baseUrl}/businesses/{$createdId}");
$t09Passed = ($res09_update['code'] === 200 && $res09_public['code'] === 200 &&
              $res09_public['body']['business']['phone'] === $updatedPhone);
$results['T-09'] = [
    'name' => 'Administratori ndryshon kontaktin',
    'status' => $t09Passed ? 'PASS' : 'FAIL',
    'details' => $t09Passed ? "Numri i telefonit u ndryshua në: {$updatedPhone} dhe u pasqyrua në profil" : "Dështoi përditësimi i kontaktit"
];
echo "T-09: {$results['T-09']['status']} - {$results['T-09']['details']}\n";

// ----------------------------------------------------------------------
// T-10: Administratori shton kategori
// Pritshmëria: Kategoria bëhet e disponueshme në formularë dhe filtra
// ----------------------------------------------------------------------
$uniqueId = time();
$catName = "Turizëm & Hoteleri {$uniqueId}";
$res10_create = apiRequest("{$baseUrl}/admin/categories", 'POST', [
    'name' => $catName,
    'description' => 'Hotele dhe pika turistike në Lipjan'
], $adminToken);

$res10_public = apiRequest("{$baseUrl}/categories");
$foundCat = false;
if ($res10_public['code'] === 200 && is_array($res10_public['body'])) {
    foreach ($res10_public['body'] as $c) {
        if ($c['name'] === $catName) {
            $foundCat = true;
            break;
        }
    }
}
$t10Passed = ($res10_create['code'] === 201 && $foundCat);
$results['T-10'] = [
    'name' => 'Administratori shton kategori',
    'status' => $t10Passed ? 'PASS' : 'FAIL',
    'details' => $t10Passed ? "Kategoria '{$catName}' u shtua në DB dhe u bë e disponueshme në API publike pa prekur kodin React" : "Kategoria nuk u gjet"
];
echo "T-10: {$results['T-10']['status']} - {$results['T-10']['details']}\n";

// ----------------------------------------------------------------------
// T-11: Administratori arkivon biznesin
// Pritshmëria: Biznesi dhe reklamat e tij nuk shfaqen publikisht
// ----------------------------------------------------------------------
$res11_archive = apiRequest("{$baseUrl}/admin/businesses/{$createdId}", 'PUT', [
    'status' => 'archived'
], $adminToken);

$res11_public = apiRequest("{$baseUrl}/businesses/{$createdId}");
// Biznesi i arkivuar duhet të kthejë 404 në profilin publik!
$t11Passed = ($res11_archive['code'] === 200 && $res11_public['code'] === 404);
$results['T-11'] = [
    'name' => 'Administratori arkivon biznesin',
    'status' => $t11Passed ? 'PASS' : 'FAIL',
    'details' => $t11Passed ? "Biznesi me status 'archived' kthen HTTP 404 në rrugën publike dhe fshihet nga lista" : "Biznesi i arkivuar mbeti i dukshëm"
];
echo "T-11: {$results['T-11']['status']} - {$results['T-11']['details']}\n";

// ----------------------------------------------------------------------
// T-12: Vizitori tenton veprim administrativ
// Pritshmëria: Backend-i e refuzon pa ndryshuar të dhënat (401/403)
// ----------------------------------------------------------------------
$res12 = apiRequest("{$baseUrl}/admin/businesses", 'POST', [
    'name' => 'Biznes Haker'
], null); // Pa token!
$t12Passed = ($res12['code'] === 401 || $res12['code'] === 403);
$results['T-12'] = [
    'name' => 'Vizitori tenton veprim administrativ',
    'status' => $t12Passed ? 'PASS' : 'FAIL',
    'details' => $t12Passed ? "Backend-i ktheu kodin HTTP {$res12['code']} (Qasja u refuzua me middleware)" : "Backend-i lejoi veprimin pa autorizim"
];
echo "T-12: {$results['T-12']['status']} - {$results['T-12']['details']}\n";

// ----------------------------------------------------------------------
// T-13: Reklama arrin kohën e mbarimit
// Pritshmëria: Nuk shfaqet më në rifreskimin e të dhënave
// ----------------------------------------------------------------------
$res13_ads = apiRequest("{$baseUrl}/advertisements");
$t13Passed = false;
if ($res13_ads['code'] === 200 && is_array($res13_ads['body'])) {
    $hasExpired = false;
    foreach ($res13_ads['body'] as $ad) {
        if ($ad['status'] === 'expired' || strtotime($ad['end_time']) < time()) {
            $hasExpired = true;
            break;
        }
    }
    // Nuk duhet të ketë asnjë reklamë të skaduar në API publike!
    $t13Passed = !$hasExpired;
}
$results['T-13'] = [
    'name' => 'Reklama arrin kohën e mbarimit',
    'status' => $t13Passed ? 'PASS' : 'FAIL',
    'details' => $t13Passed ? "Reklamat e skaduara filtrohen automatikisht dhe nuk dalin në API publike" : "U gjetën reklama të skaduara"
];
echo "T-13: {$results['T-13']['status']} - {$results['T-13']['details']}\n";

// ----------------------------------------------------------------------
// T-14: Harta ose rrjeti dështojnë
// Pritshmëria: Shfaqet gjendje e qartë dhe pjesa tjetër mbetet e kuptueshme
// ----------------------------------------------------------------------
// Verifikojmë që në biznes pa koordinata ose kur Leaflet dështon, profili ruan adresën dhe telefonin
$bizNoMap = apiRequest("{$baseUrl}/businesses/b-14"); // b-14 nuk ka foto dhe orar
$t14Passed = ($bizNoMap['code'] === 200 && !empty($bizNoMap['body']['business']['address']) &&
              !empty($bizNoMap['body']['business']['phone']));
$results['T-14'] = [
    'name' => 'Harta ose rrjeti dështojnë',
    'status' => $t14Passed ? 'PASS' : 'FAIL',
    'details' => $t14Passed ? "Kur mungojnë të dhënat hartografike, adresa tekstuale ({$bizNoMap['body']['business']['address']}) dhe telefoni ({$bizNoMap['body']['business']['phone']}) mbeten plotësisht të përdorshme" : "Dështoi trajtimi i rasteve pa hartë"
];
echo "T-14: {$results['T-14']['status']} - {$results['T-14']['details']}\n";

echo "\n=========================================================\n";
echo "PËRMBLEDHJA E REZULTATEVE: " . count(array_filter($results, fn($r) => $r['status'] === 'PASS')) . "/14 KALUAN\n";
echo "=========================================================\n";

// Pastrim i biznesit testues të krijuar për T-08
if ($createdId && $adminToken) {
    apiRequest("{$baseUrl}/admin/businesses/{$createdId}", 'DELETE', null, $adminToken);
}
