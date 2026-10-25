export const CATEGORIES = [
  {
    id: 'gastronomi',
    slug: 'gastronomi',
    name: 'Gastronomi & Kafe',
    icon: 'UtensilsCrossed',
    description: 'Restorante tradicionale, piceri, kafene komode dhe ëmbëltore në Lipjan.',
    count: 14,
    color: '#0d9488'
  },
  {
    id: 'markete',
    slug: 'markete',
    name: 'Supermarkete & Dyqane',
    icon: 'ShoppingBag',
    description: 'Rrejtje supermarketesh, ushqimore të lagjes, furra buke dhe mishtore.',
    count: 10,
    color: '#2563eb'
  },
  {
    id: 'auto',
    slug: 'auto',
    name: 'Auto & Mekanikë',
    icon: 'Car',
    description: 'Auto servise të specializuara, vullkanizues, pjesë këmbimi dhe autolarje.',
    count: 11,
    color: '#d97706'
  },
  {
    id: 'shendetesi',
    slug: 'shendetesi',
    name: 'Shëndetësi & Farmaci',
    icon: 'HeartPulse',
    description: 'Poliklinika private, barnatore kujdestare, ordinanca stomatologjike.',
    count: 8,
    color: '#e11d48'
  },
  {
    id: 'teknologji',
    slug: 'teknologji',
    name: 'Teknologji & Elektronikë',
    icon: 'Laptop',
    description: 'Dyqane kompjuterësh, servisim telefonash dhe pajisje digjitale.',
    count: 6,
    color: '#7c3aed'
  },
  {
    id: 'ndertim',
    slug: 'ndertim',
    name: 'Ndërtim & Mobilieri',
    icon: 'Hammer',
    description: 'Depo materialesh ndërtimore, sallone mobiliesh dhe hidrosanitare.',
    count: 9,
    color: '#059669'
  },
  {
    id: 'bukuri',
    slug: 'bukuri',
    name: 'Bukuri & Fitnes',
    icon: 'Sparkles',
    description: 'Sallone ondulimi, qendra estetike, berberë dhe qendra fitnesi.',
    count: 8,
    color: '#db2777'
  },
  {
    id: 'profesionale',
    slug: 'profesionale',
    name: 'Shërbime Profesionale',
    icon: 'Briefcase',
    description: 'Avokaturë, kontabilitet, arkitekturë, përkthime dhe shërbime noterie.',
    count: 7,
    color: '#0891b2'
  }
];

export const SETTLEMENTS = [
  { id: 'lipjan', name: 'Lipjan (Qytet)', isTown: true, description: 'Qendra administrative dhe tregtare e komunës.' },
  { id: 'gadime', name: 'Gadime', isTown: false, description: 'E njohur për Shpellën e Mermertë dhe turizmin lokal.' },
  { id: 'janjeve', name: 'Janjevë', isTown: false, description: 'Lokalitet historik me traditë të gjatë zejtarie.' },
  { id: 'magure', name: 'Magurë', isTown: false, description: 'Zonë me zhvillim bujqësor dhe tregti të shërbimeve.' },
  { id: 'sllovi', name: 'Sllovi', isTown: false, description: 'Fshat me lidhje të mira rrugore dhe agrobiznese.' },
  { id: 'banulle', name: 'Banullë', isTown: false, description: 'Lokalitet afër magjistrales me veprimtari të shumta ekonomike.' },
  { id: 'rufc-i-ri', name: 'Rufc i Ri', isTown: false, description: 'Zonë aktive tregtare dhe artizanale.' },
  { id: 'dobraje-e-madhe', name: 'Dobrajë e Madhe', isTown: false, description: 'Qendër e rëndësishme bujqësore dhe zejtare.' },
  { id: 'kraishte', name: 'Kraishtë', isTown: false, description: 'Zonë me biznese prodhuese dhe shërbyese.' },
  { id: 'smallushe', name: 'Smallushë', isTown: false, description: 'Fshat me ndërmarrje të vogla familjare.' },
  { id: 'rubovc', name: 'Rubovc', isTown: false, description: 'Komunitet me ferma dhe depo shpërndarëse.' },
  { id: 'toplican', name: 'Topliçan', isTown: false, description: 'Vendbanim me lidhje me qendrën e Lipjanit.' }
];

export const INITIAL_BUSINESSES = [
  {
    id: 'b-1',
    name: 'Restorant Vila Lipjani',
    slug: 'restorant-vila-lipjani',
    categoryId: 'gastronomi',
    settlementId: 'lipjan',
    address: 'Rruga Adem Jashari, Nr. 45, Lipjan',
    phone: '+383 44 210 330',
    email: 'info@vilalipjani-demo.com',
    website: 'https://vilalipjani-demo.com',
    shortDescription: 'Restorant me kuzhinë tradicionale dhe mesdhetare, ambient familjar dhe kopsht të hapur veror.',
    description: 'Vila Lipjani ofron mikpritje të veçantë dhe specialitete vendore të përgatitura me produkte të freskëta të zonës. Ideale për dreka familjare, takime pune dhe ahengje festive. Posedon sallë moderne me kapacitet mbi 120 ulëse si dhe parking të dedikuar.',
    rating: 4.8,
    reviewCount: 42,
    featured: true,
    status: 'published',
    isDemo: true,
    openingHours: {
      weekdays: '08:00 - 23:00',
      saturday: '08:00 - 24:00',
      sunday: '09:00 - 23:00'
    },
    coordinates: {
      lat: 42.5225,
      lng: 21.1278
    },
    services: [
      'Kuzhinë tradicionale',
      'Specialitete peshku & mishi',
      'Organizim ahengjesh',
      'Wi-Fi falas',
      'Parking i siguruar',
      'Kopsht veror'
    ],
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-01-15'
  },
  {
    id: 'b-2',
    name: 'Auto Servis Ulpiana',
    slug: 'auto-servis-ulpiana',
    categoryId: 'auto',
    settlementId: 'lipjan',
    address: 'Magjistralja Prishtinë - Lipjan, km 2',
    phone: '+383 49 550 440',
    email: 'kontakti@servis-ulpiana-demo.com',
    website: 'https://servis-ulpiana-demo.com',
    shortDescription: 'Diagnostifikim kompjuterik, mekanikë e avancuar dhe servis i shpejtë për të gjitha markat e veturave.',
    description: 'Me përvojë mbi 15-vjeçare në fushën e mekanikës automobilistike, Auto Servis Ulpiana ofron riparime të plota motorike, ndërrimin e vajrave, testimin e amortizatorëve dhe rregullimin e sistemit të frenimit me pajisje moderne digjitale.',
    rating: 4.7,
    reviewCount: 29,
    featured: true,
    status: 'published',
    isDemo: true,
    openingHours: {
      weekdays: '08:00 - 18:00',
      saturday: '08:00 - 16:00',
      sunday: 'Mbyllur'
    },
    coordinates: {
      lat: 42.5310,
      lng: 21.1210
    },
    services: [
      'Diagnostifikim kompjuterik',
      'Servis i rregullt periodik',
      'Ndërrim frenash & transmisionesh',
      'Kondicionerë & mbushje gazi',
      'Pjesë këmbimi origjinale'
    ],
    coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-01-20'
  },
  {
    id: 'b-3',
    name: 'Supermarket Agimi Gadime',
    slug: 'supermarket-agimi-gadime',
    categoryId: 'markete',
    settlementId: 'gadime',
    address: 'Rruga e Shpellës, Gadime e Ulët',
    phone: '+383 44 800 910',
    email: 'agimi.gadime-demo@gmail.com',
    website: '',
    shortDescription: 'Zgjedhje e gjerë artikujsh ushqimorë, pemë e perime të freskëta dhe produkte të përditshme.',
    description: 'Qendër tregtare furnizuese për banorët dhe vizitorët e Shpellës së Gadimes. Ofrojmë çmime konkurruese, sektor të pasur të furrës vendore me bukë e brumëra të ngrohta, si dhe kënd të posaçëm për pije freskuese e suvenire.',
    rating: 4.6,
    reviewCount: 18,
    featured: false,
    status: 'published',
    isDemo: true,
    openingHours: {
      weekdays: '07:00 - 22:30',
      saturday: '07:00 - 22:30',
      sunday: '07:30 - 22:00'
    },
    coordinates: {
      lat: 42.4930,
      lng: 21.1960
    },
    services: [
      'Artikuj ushqimorë & higjienikë',
      'Furra e bukës & brumëra',
      'Pemë dhe perime të freskëta vendore',
      'Pagesa me kartela',
      'Kënd i pijeve për udhëtarë'
    ],
    coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-02-01'
  },
  {
    id: 'b-4',
    name: 'Barnatore Vita Lipjan',
    slug: 'barnatore-vita-lipjan',
    categoryId: 'shendetesi',
    settlementId: 'lipjan',
    address: 'Sheshi Komandant Kumanova, Lipjan',
    phone: '+383 38 580 120',
    email: 'vita.pharmacy-demo@gmail.com',
    website: 'https://vitapharm-demo.com',
    shortDescription: 'Furnizim i plotë me barna, vitamina, kozmetikë mjekësore dhe këshilla profesionale nga farmacistët.',
    description: 'Barnatorja Vita ofron barna të licencuara, suplemente ushqimore, kozmetikë dermatologjike dhe aparatura matëse për tension dhe glicemi. Kujdesi shëndetësor për qytetarët e Lipjanit me profesionalizëm dhe korrektësi.',
    rating: 4.9,
    reviewCount: 35,
    featured: true,
    status: 'published',
    isDemo: true,
    openingHours: {
      weekdays: '07:30 - 22:00',
      saturday: '08:00 - 21:00',
      sunday: '08:30 - 18:00'
    },
    coordinates: {
      lat: 42.5238,
      lng: 21.1242
    },
    services: [
      'Barna me & pa recetë',
      'Kozmetikë medicinale',
      'Matje e tensionit dhe glicemisë falas',
      'Këshillim farmaceutik',
      'Ushqim & pajisje për foshnja'
    ],
    coverImage: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-02-10'
  },
  {
    id: 'b-5',
    name: 'TechZone Lipjani IT & Mobile',
    slug: 'techzone-lipjani-it-mobile',
    categoryId: 'teknologji',
    settlementId: 'lipjan',
    address: 'Bulevardi i Dëshmorëve, Lipjan',
    phone: '+383 49 112 233',
    email: 'info@techzone-lipjan-demo.com',
    website: 'https://techzone-lipjan-demo.com',
    shortDescription: 'Shitje dhe riparim të kompjuterëve, laptopëve, telefonave mobil dhe aksesorëve më të rinj teknologjikë.',
    description: 'Qendër e specializuar për shërbime IT, ndërrim ekrani për smartphone, instalime softuerike, rrjeta kompjuterike për biznese dhe pajisje gaming në qendër të Lipjanit.',
    rating: 4.8,
    reviewCount: 22,
    featured: false,
    status: 'published',
    isDemo: true,
    openingHours: {
      weekdays: '08:30 - 20:00',
      saturday: '09:00 - 19:00',
      sunday: 'Mbyllur'
    },
    coordinates: {
      lat: 42.5211,
      lng: 21.1251
    },
    services: [
      'Servis kompjuterësh dhe laptopësh',
      'Riparim celularësh (Apple, Samsung)',
      'Instalim sistemesh operative & antivirus',
      'Aksesorë origjinalë & pajisje zyre',
      'Konfigurim rrjetash për biznese'
    ],
    coverImage: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-02-14'
  },
  {
    id: 'b-6',
    name: 'Depo Ndërtimore Sllovia',
    slug: 'depo-ndertimore-sllovia',
    categoryId: 'ndertim',
    settlementId: 'sllovi',
    address: 'Hyrje të fshatit Sllovi, Lipjan',
    phone: '+383 44 320 990',
    email: 'ndertimi.sllovia-demo@gmail.com',
    website: '',
    shortDescription: 'Materiale cilësore ndërtimore, izolime termike, hekur, blloka dhe ngjyra me transport të siguruar.',
    description: 'Furnizues kryesor për ndërtuesit dhe shtëpitë e rajonit të Sllovisë dhe Lipjanit. Ofron çimento, tulla, armaturë hekuri, fasada, ngjyra cilësore dhe mjete pune me mundësi transporti deri te vendi i ndërtimit.',
    rating: 4.5,
    reviewCount: 15,
    featured: false,
    status: 'published',
    isDemo: true,
    openingHours: {
      weekdays: '07:30 - 18:30',
      saturday: '07:30 - 17:00',
      sunday: '08:00 - 13:00'
    },
    coordinates: {
      lat: 42.5350,
      lng: 21.1780
    },
    services: [
      'Materiale themelore ndërtimore',
      'Izolim termik & stiropor',
      'Vegla pune profesionale',
      'Transport falas për sasi të mëdha',
      'Këshillim teknik për ndërtim'
    ],
    coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-02-18'
  },
  {
    id: 'b-7',
    name: 'Salloni i Bukurisë Elegance',
    slug: 'salloni-bukurise-elegance',
    categoryId: 'bukuri',
    settlementId: 'lipjan',
    address: 'Rruga Lidhja e Prizrenit, Lipjan',
    phone: '+383 49 778 990',
    email: 'elegance.lipjan-demo@gmail.com',
    website: 'https://elegance-lipjan-demo.com',
    shortDescription: 'Stilim flokësh për femra dhe meshkuj, grim profesional për dasma, trajtime fytyre dhe manikyr.',
    description: 'Ambient relaksues me produkte kozmetike premium. Ekspertë të trajnuar për prerje moderne flokësh, ngjyrosje me teknika të fundit balayage, trajtime me keratinë dhe grim solemn për çdo ngjarje të veçantë.',
    rating: 4.9,
    reviewCount: 38,
    featured: true,
    status: 'published',
    isDemo: true,
    openingHours: {
      weekdays: '09:00 - 20:00',
      saturday: '08:30 - 20:30',
      sunday: '10:00 - 16:00'
    },
    coordinates: {
      lat: 42.5204,
      lng: 21.1282
    },
    services: [
      'Stilim dhe ngjyrosje flokësh',
      'Grim profesional nuse & ahengje',
      'Manikyr & Pedikyr me xhel',
      'Trajtime rigjeneruese të fytyrës',
      'Rezervime online dhe telefonike'
    ],
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-02-22'
  },
  {
    id: 'b-8',
    name: 'Zyre Juridike & Kontabiliteti Lipjani',
    slug: 'zyre-juridike-kontabiliteti-lipjani',
    categoryId: 'profesionale',
    settlementId: 'lipjan',
    address: 'Qendra e Biznesit, Kati 2, Lipjan',
    phone: '+383 38 581 445',
    email: 'konsulenca.lipjan-demo@gmail.com',
    website: 'https://juridike-lipjan-demo.com',
    shortDescription: 'Konsulencë financiare, udhëheqje kontabiliteti për biznese, deklarime tatimore dhe përfaqësim ligjor.',
    description: 'Partneri juaj i besueshëm për çështje fiskale dhe ligjore në Komunën e Lipjanit. Ndihmojmë ndërmarrjet e reja me regjistrim në ARBK, menaxhimin e pasqyrave financiare dhe përputhshmërinë me ligjet tatimore në Kosovë.',
    rating: 4.8,
    reviewCount: 16,
    featured: false,
    status: 'published',
    isDemo: true,
    openingHours: {
      weekdays: '08:30 - 17:00',
      saturday: '09:00 - 13:00',
      sunday: 'Mbyllur'
    },
    coordinates: {
      lat: 42.5220,
      lng: 21.1265
    },
    services: [
      'Regjistrim dhe mbyllje biznesesh',
      'Kontabilitet mujor dhe vjetor',
      'Përgatitje e deklaratave të ATK',
      'Këshillim ligjor për kontrata pune',
      'Auditim i brendshëm financiar'
    ],
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-02-28'
  },
  {
    id: 'b-9',
    name: 'Kafe Bar Janjeva Kulla',
    slug: 'kafe-bar-janjeva-kulla',
    categoryId: 'gastronomi',
    settlementId: 'janjeve',
    address: 'Lagjja e Vjetër, Janjevë, Lipjan',
    phone: '+383 45 611 722',
    email: 'kullajanjeve-demo@gmail.com',
    website: '',
    shortDescription: 'Kafene me sharm historik, kafe tradicionale turke dhe pije të freskëta në Janjevën e lashtë.',
    description: 'E vendosur në zemër të Janjevës historike, kjo kafene ofron një kthim në kohë me mure prej guri dhe oborr të qetë. Vendi i preferuar për vizitorët e trashëgimisë kulturore dhe të dashamirëve të kafesë artizanale.',
    rating: 4.7,
    reviewCount: 31,
    featured: false,
    status: 'published',
    isDemo: true,
    openingHours: {
      weekdays: '08:00 - 23:00',
      saturday: '08:00 - 23:30',
      sunday: '08:30 - 23:00'
    },
    coordinates: {
      lat: 42.5440,
      lng: 21.2580
    },
    services: [
      'Kafe tradicionale & makiato',
      'Pije vendore & çajra bimorë',
      'Ambient historik me gurë',
      'Guida turistike vullnetare për Janjevë',
      'Tarracë panoramike'
    ],
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-03-01'
  },
  {
    id: 'b-10',
    name: 'Pekara Furra Lipjani',
    slug: 'pekara-furra-lipjani',
    categoryId: 'markete',
    settlementId: 'lipjan',
    address: 'Rruga Bajram Gashi, Lipjan',
    phone: '+383 44 911 223',
    email: 'furra.lipjani-demo@gmail.com',
    website: '',
    shortDescription: 'Brumëra tradicionale, samuna të nxehtë me suxhuk, pogaçe dhe ëmbëlsira të shijshme çdo mëngjes.',
    description: 'Furra e njohur në Lipjan për traditën e saj në pjekjen e bukës në furrë me dru. Përgatitje ditore e burekut me mish e djathë, picave të shpejta dhe piteve tradicionale të Kosovës.',
    rating: 4.9,
    reviewCount: 54,
    featured: true,
    status: 'published',
    isDemo: true,
    openingHours: {
      weekdays: '05:30 - 22:00',
      saturday: '05:30 - 22:00',
      sunday: '06:00 - 21:00'
    },
    coordinates: {
      lat: 42.5218,
      lng: 21.1235
    },
    services: [
      'Bukë në furrë me dru',
      'Burek me mish, djathë & spinaq',
      'Samuna me suxhuk & djathë',
      'Porosi për ahengje & dasma',
      'Përgatitje e freskët në çdo orë'
    ],
    coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-03-05'
  },
  {
    id: 'b-11',
    name: 'Qendra Teknike & Auto Pjesë Magurë',
    slug: 'qendra-teknike-auto-pjese-magure',
    categoryId: 'auto',
    settlementId: 'magure',
    address: 'Rruga Kryesore, Magurë, Lipjan',
    phone: '+383 49 330 550',
    email: 'autopjese.magure-demo@gmail.com',
    website: '',
    shortDescription: 'Pjesë këmbimi për automjete bujqësore dhe vetura, vullkanizim dhe rregullim të pompave të naftës.',
    description: 'Pikë kyçe furnizimi për traktorë, makina bujqësore dhe vetura private në rajonin e Magurës dhe Drenicës lindore. Staf me njohuri teknike për gjetjen e pjesëve rezervë dhe riparime në vend.',
    rating: 4.6,
    reviewCount: 19,
    featured: false,
    status: 'draft',
    isDemo: true,
    openingHours: {
      weekdays: '08:00 - 18:00',
      saturday: '08:00 - 15:00',
      sunday: 'Mbyllur'
    },
    coordinates: {
      lat: 42.5020,
      lng: 21.0180
    },
    services: [
      'Pjesë këmbimi për traktorë & makineri',
      'Vullkanizim gomash të mëdha',
      'Vajra motorikë cilësorë',
      'Bateri dhe filtra origjinalë'
    ],
    coverImage: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-03-10'
  },
  {
    id: 'b-12',
    name: 'Poliklinika Dentare Dr. Drenica',
    slug: 'poliklinika-dentare-dr-drenica',
    categoryId: 'shendetesi',
    settlementId: 'banulle',
    address: 'Magjistralja Lipjan - Ferizaj, Banullë',
    phone: '+383 44 445 556',
    email: 'dentist.banulle-demo@gmail.com',
    website: 'https://dental-banulle-demo.com',
    shortDescription: 'Shërbime moderne stomatologjike, zbardhim dhëmbësh, implante dhe ortodonci me aparaturë dixhitale.',
    description: 'Klinikë me teknologji bashkëkohore, rëntgen dixhital dhe trajtime pa dhimbje për të rritur e fëmijë. Zbatim rigoroz i standardeve të higjienës dhe sterilizimit.',
    rating: 4.9,
    reviewCount: 27,
    featured: false,
    status: 'archived',
    isDemo: true,
    openingHours: {
      weekdays: '09:00 - 19:00',
      saturday: '09:00 - 15:00',
      sunday: 'Mbyllur'
    },
    coordinates: {
      lat: 42.5110,
      lng: 21.1490
    },
    services: [
      'Ekzaminim me rëntgen dixhital',
      'Pastrim guri & zbardhim dhëmbësh',
      'Mbushje estetike dhe implante',
      'Aparate ortodontike',
      'Termine të garantuara pa pritje'
    ],
    coverImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2025-03-12'
  }
];

export const INITIAL_ADVERTISEMENTS = [
  {
    id: 'ad-1',
    title: 'Panairi i Bizneseve të Lipjanit 2026',
    sponsor: 'Komuna e Lipjanit & Shoqata e Bizneseve',
    description: 'Bashkohuni në panairin vjetor për të prezantuar prodhimet dhe shërbimet tuaja para qytetarëve dhe investitorëve.',
    targetUrl: '/bizneset',
    callToAction: 'Mëso Më Shumë',
    placement: 'banner-home',
    badge: 'Ngjarje Zyrtare',
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    status: 'active',
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)'
  },
  {
    id: 'ad-2',
    title: 'Promovoni Biznesin Tuaj Falas',
    sponsor: 'Portali Digjital i Lipjanit',
    description: 'Regjistroni kompaninë tuaj në katalogun zyrtar të qytetit dhe fitoni shikueshmëri më të lartë tek klientët lokalë.',
    targetUrl: '/shto-biznes',
    callToAction: 'Regjistrohu Tani',
    placement: 'banner-catalog',
    badge: 'Mundësi e Re',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active',
    bgGradient: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)'
  }
];
