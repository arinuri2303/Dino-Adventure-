export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SubBabMateri {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  summaryBadge: string;
  paragraphs: string[];
  items: {
    title: string;
    altitudeOrType: string;
    content: string;
    examples: string[];
  }[];
  fullTtsText: string;
  quiz: QuizQuestion[];
}

export interface PasuruanLandmarkItem {
  name: string;
  kecamatan: string;
  elevationOrType: string;
  detail: string;
}

export interface LandformZone3D {
  id: string;
  name: string;
  shortPinLabel: string;
  pasuruanHighlightName: string;
  category: 'Daratan' | 'Perairan' | 'Adaptasi & Pelestarian';
  elevationRange: string;
  elevationMdplNumeric: [number, number];
  avgTemp: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  pinPosition: [number, number, number];
  colorHex: string;
  generalExplanation: string;
  pasuruanSpecificTitle: string;
  pasuruanSpecificExplanation: string;
  pasuruanLandmarks: PasuruanLandmarkItem[];
  description: string;
  floraFauna: string;
  livelihoods: string;
  indonesianExamples: string;
  conservationTip: string;
}

export interface AssessmentQuestion {
  id: number;
  part: 'LOTS' | 'HOTS';
  cognitiveLevel: string;
  sourceTopic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LeaderboardEntry {
  timestamp: string;
  nama: string;
  kelas: string;
  skorKuisSubBab: number;
  skorPaluGunung: number;
  skorAsesmenC1C3: number;
  skorAsesmenC4C6: number;
  totalSkor: number;
}

export const HERO_DRIVE_ID = '1ESavmr7MNLBx8csnEuZKU1mYiJ709pkh';
export const HERO_IMAGE_PRIMARY = '/assets/aistudio/D-Bromo__Pasuruan_Adventure_Route_8aecaaec.png';
export const HERO_IMAGE_FALLBACK = '/assets/aistudio/Dino_Adventure__Jelajah_Pasuruan_4833c8a1.png';

export const SPREADSHEET_ID = '1dti_SoT7_rg7MtXpWaKE2lX-LDJ6kLG4BOw0Z0M7tMQ';
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?usp=drive_link`;
export const SPREADSHEET_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

export const APPS_SCRIPT_CODE_GS = `// Salin kode ini ke menu Ekstensi > Apps Script di Google Spreadsheet:
// ID: 1dti_SoT7_rg7MtXpWaKE2lX-LDJ6kLG4BOw0Z0M7tMQ
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp", "Nama Siswa", "Kelas",
      "Skor Kuis Sub-Bab", "Skor Palu Gunung",
      "Skor Asesmen LOTS (C1-C3)", "Skor Asesmen HOTS (C4-C6)", "Total Skor"
    ]);
  }
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.nama,
    data.kelas,
    data.skorKuisSubBab,
    data.skorPaluGunung,
    data.skorAsesmenC1C3,
    data.skorAsesmenC4C6,
    data.totalSkor
  ]);
  return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

// ======================================================================
// KOMPONEN 1 & 3: 3 SUB-BAB MATERI (~2.500 KARAKTER) + 9 SOAL KUIS SUB-BAB
// ======================================================================
export const SUB_BAB_MATERI: SubBabMateri[] = [
  {
    id: 'daratan',
    number: 'Sub-Bab 01',
    title: 'Kenampakan Alam Daratan',
    subtitle: 'Gunung, Pegunungan, Dataran Tinggi, dan Dataran Rendah',
    summaryBadge: 'Wilayah Daratan · 0 hingga >600 mdpl',
    paragraphs: [
      'Bentang alam adalah pemandangan alami di permukaan bumi yang terbentuk oleh proses alamiah selama jutaan tahun. Secara garis besar, bentang alam Indonesia terbagi menjadi wilayah daratan dan wilayah perairan. Wilayah daratan adalah bagian permukaan bumi yang padat dan tidak digenangi air secara permanen, tempat manusia tinggal, membangun rumah, serta melakukan berbagai kegiatan ekonomi.'
    ],
    items: [
      {
        title: '1. Gunung dan Pegunungan',
        altitudeOrType: 'Ketinggian > 600 mdpl · Suhu 10°C – 18°C',
        content:
          'Gunung adalah bagian permukaan bumi yang menjulang tinggi seperti kerucut raksasa dengan ketinggian lebih dari 600 meter di atas permukaan laut (mdpl). Di Indonesia terdapat dua jenis gunung, yaitu gunung berapi aktif yang memiliki kawah magma (seperti Gunung Merapi, Semeru, dan Bromo) serta gunung tidak aktif. Adapun pegunungan adalah rangkaian beberapa gunung yang saling menyambung memanjang, contohnya Pegunungan Bukit Barisan di Sumatera dan Pegunungan Jayawijaya di Papua.',
        examples: ['Gunung Merapi', 'Gunung Semeru', 'Gunung Bromo', 'Pegunungan Bukit Barisan', 'Pegunungan Jayawijaya']
      },
      {
        title: '2. Dataran Tinggi (Plateau) dan Bukit',
        altitudeOrType: 'Ketinggian 200 – 600 mdpl · Suhu 17°C – 22°C',
        content:
          'Dataran tinggi adalah wilayah daratan luas yang terletak pada ketinggian di atas 200 hingga 600 mdpl. Udara di dataran tinggi terasa sejuk dan dingin, sehingga sangat cocok dimanfaatkan untuk perkebunan teh, kopi, stroberi, sayur-mayur, serta tempat wisata alam seperti Dataran Tinggi Dieng dan Malang. Bukit memiliki bentuk mirip gunung tetapi ukurannya jauh lebih rendah dan puncaknya membulat landai.',
        examples: ['Dataran Tinggi Dieng (Jawa Tengah)', 'Dataran Tinggi Malang (Jawa Timur)', 'Dataran Tinggi Lembang (Jawa Barat)']
      },
      {
        title: '3. Dataran Rendah dan Lembah',
        altitudeOrType: 'Ketinggian 0 – 200 mdpl · Suhu 26°C – 32°C',
        content:
          'Dataran rendah adalah hamparan tanah datar yang luas dengan ketinggian 0 sampai 200 mdpl. Karena tanahnya rata dan mudah dijangkau, dataran rendah menjadi pusat pemukiman penduduk, pertanian padi sawah, industri, dan perdagangan, seperti wilayah Jakarta, Surabaya, dan Semarang. Sementara itu, lembah dan ngarai adalah wilayah daratan rendah yang berada di kaki atau di antara dua gunung, contohnya Lembah Baliem dan Ngarai Sianok yang memiliki tanah subur karena endapan abu vulkanik.',
        examples: ['Dataran Rendah Jakarta, Surabaya, Semarang', 'Lembah Baliem (Papua)', 'Ngarai Sianok (Sumatera Barat)']
      }
    ],
    fullTtsText:
      'Sub-Bab 1: Kenampakan Alam Daratan. Bentang alam adalah pemandangan alami di permukaan bumi yang terbentuk oleh proses alamiah selama jutaan tahun. Secara garis besar, bentang alam Indonesia terbagi menjadi wilayah daratan dan wilayah perairan. Wilayah daratan adalah bagian permukaan bumi yang padat dan tidak digenangi air secara permanen, tempat manusia tinggal, membangun rumah, serta melakukan berbagai kegiatan ekonomi. Pertama, Gunung dan Pegunungan: Gunung adalah bagian permukaan bumi yang menjulang tinggi seperti kerucut raksasa dengan ketinggian lebih dari 600 meter di atas permukaan laut. Di Indonesia terdapat dua jenis gunung, yaitu gunung berapi aktif yang memiliki kawah magma seperti Gunung Merapi, Semeru, dan Bromo, serta gunung tidak aktif. Adapun pegunungan adalah rangkaian beberapa gunung yang saling menyambung memanjang, contohnya Pegunungan Bukit Barisan di Sumatera dan Pegunungan Jayawijaya di Papua. Kedua, Dataran Tinggi dan Bukit: Dataran tinggi adalah wilayah daratan luas yang terletak pada ketinggian di atas 200 hingga 600 mdpl. Udara di dataran tinggi terasa sejuk dan dingin, sehingga sangat cocok dimanfaatkan untuk perkebunan teh, kopi, stroberi, sayur-mayur, serta tempat wisata alam seperti Dataran Tinggi Dieng dan Malang. Bukit memiliki bentuk mirip gunung tetapi ukurannya jauh lebih rendah dan puncaknya membulat landai. Ketiga, Dataran Rendah dan Lembah: Dataran rendah adalah hamparan tanah datar yang luas dengan ketinggian 0 sampai 200 mdpl. Karena tanahnya rata dan mudah dijangkau, dataran rendah menjadi pusat pemukiman penduduk, pertanian padi sawah, industri, dan perdagangan, seperti wilayah Jakarta, Surabaya, dan Semarang. Sementara itu, lembah dan ngarai adalah wilayah daratan rendah yang berada di kaki atau di antara dua gunung, contohnya Lembah Baliem dan Ngarai Sianok yang memiliki tanah subur karena endapan abu vulkanik.',
    quiz: [
      {
        id: 1,
        question: 'Wilayah daratan luas yang berada pada ketinggian 0 sampai 200 meter di atas permukaan laut disebut...',
        options: ['A. Pegunungan', 'B. Dataran rendah', 'C. Dataran tinggi', 'D. Lembah'],
        correctIndex: 1,
        explanation: 'Dataran rendah berada pada ketinggian 0–200 mdpl dengan tanah rata yang cocok untuk pemukiman, pertanian padi, dan perdagangan.'
      },
      {
        id: 2,
        question: 'Berikut ini yang merupakan contoh pemanfaatan wilayah dataran tinggi yang berudara sejuk adalah...',
        options: ['A. Tambak garam', 'B. Perkebunan teh dan stroberi', 'C. Pelabuhan kapal pesiar', 'D. Hutan bakau'],
        correctIndex: 1,
        explanation: 'Dataran tinggi (200–600 mdpl) memiliki suhu udara sejuk sehingga ideal untuk perkebunan teh, kopi, stroberi, dan sayuran.'
      },
      {
        id: 3,
        question: 'Wilayah daratan rendah yang terletak di antara dua gunung atau perbukitan disebut...',
        options: ['A. Selat', 'B. Tanjung', 'C. Lembah', 'D. Semenanjung'],
        correctIndex: 2,
        explanation: 'Lembah adalah cekungan atau daratan rendah di kaki atau di antara dua gunung/bukit yang umumnya subur karena endapan abu vulkanik.'
      }
    ]
  },
  {
    id: 'perairan',
    number: 'Sub-Bab 02',
    title: 'Kenampakan Alam Perairan',
    subtitle: 'Sungai, Danau, Rawa, Selat, dan Laut',
    summaryBadge: 'Wilayah Perairan Darat & Laut Kepulauan',
    paragraphs: [
      'Sebagai negara kepulauan terbesar di dunia, Indonesia memiliki bentang alam perairan yang sangat luas dan kaya akan sumber daya hayati.'
    ],
    items: [
      {
        title: '1. Sungai (Hulu ke Hilir)',
        altitudeOrType: 'Aliran Air Tawar · Pegunungan menuju Muara Laut',
        content:
          'Sungai adalah aliran air tawar alami yang besar dan memanjang, mengalir dari bagian hulu (pegunungan) menuju bagian hilir (muara di laut). Contoh sungai besar di Indonesia adalah Sungai Kapuas di Kalimantan Barat dan Sungai Musi di Sumatera Selatan yang digunakan warga sebagai sarana transportasi air, irigasi sawah, dan pasar terapung.',
        examples: ['Sungai Kapuas (Kalimantan Barat)', 'Sungai Musi (Sumatera Selatan)', 'Sungai Mahakam (Kalimantan Timur)']
      },
      {
        title: '2. Danau dan Rawa',
        altitudeOrType: 'Cekungan Air Daratan & Lahan Basah Alami',
        content:
          'Danau adalah cekungan besar di daratan yang terisi oleh air tawar maupun air asin. Contoh terkenal adalah Danau Toba di Sumatera Utara yang terbentuk dari letusan gunung purba (danau vulkanik-tektonik). Rawa adalah tanah rendah yang selalu tergenang air secara alami dan banyak ditumbuhi tanaman air seperti bakau atau nipah, berfungsi penting sebagai penyimpan cadangan air dan pencegah banjir.',
        examples: ['Danau Toba (Sumatera Utara)', 'Danau Singkarak (Sumatera Barat)', 'Rawa Bakau & Nipah Pesisir']
      },
      {
        title: '3. Laut, Selat, dan Teluk',
        altitudeOrType: 'Perairan Asin Penghubung Antar-Pulau',
        content:
          'Laut adalah kumpulan air asin yang sangat luas dan menghubungkan pulau satu dengan pulau lainnya. Selat adalah laut sempit yang berada di antara dua pulau (contohnya Selat Sunda dan Selat Bali), sedangkan teluk adalah bagian laut yang menjorok masuk ke daratan sehingga airnya tenang dan cocok dibangun pelabuhan kapal.',
        examples: ['Selat Sunda', 'Selat Bali', 'Teluk Jakarta & Teluk Bayur', 'Laut Jawa & Laut Banda']
      }
    ],
    fullTtsText:
      'Sub-Bab 2: Kenampakan Alam Perairan. Sebagai negara kepulauan terbesar di dunia, Indonesia memiliki bentang alam perairan yang sangat luas dan kaya akan sumber daya hayati. Pertama, Sungai: Sungai adalah aliran air tawar alami yang besar dan memanjang, mengalir dari bagian hulu di pegunungan menuju bagian hilir atau muara di laut. Contoh sungai besar di Indonesia adalah Sungai Kapuas di Kalimantan Barat dan Sungai Musi di Sumatera Selatan yang digunakan warga sebagai sarana transportasi air, irigasi sawah, dan pasar terapung. Kedua, Danau dan Rawa: Danau adalah cekungan besar di daratan yang terisi oleh air tawar maupun air asin. Contoh terkenal adalah Danau Toba di Sumatera Utara yang terbentuk dari letusan gunung purba atau danau vulkanik-tektonik. Rawa adalah tanah rendah yang selalu tergenang air secara alami dan banyak ditumbuhi tanaman air seperti bakau atau nipah, berfungsi penting sebagai penyimpan cadangan air dan pencegah banjir. Ketiga, Laut, Selat, dan Teluk: Laut adalah kumpulan air asin yang sangat luas dan menghubungkan pulau satu dengan pulau lainnya. Selat adalah laut sempit yang berada di antara dua pulau, contohnya Selat Sunda dan Selat Bali, sedangkan teluk adalah bagian laut yang menjorok masuk ke daratan sehingga airnya tenang dan cocok dibangun pelabuhan kapal.',
    quiz: [
      {
        id: 1,
        question: 'Bagian awal sungai yang terletak di daerah pegunungan dan memiliki aliran air yang deras disebut...',
        options: ['A. Hilir', 'B. Muara', 'C. Hulu', 'D. Teluk'],
        correctIndex: 2,
        explanation: 'Hulu sungai berada di daerah pegunungan/perbukitan dengan kemiringan curam sehingga aliran airnya jernih dan deras.'
      },
      {
        id: 2,
        question: 'Laut sempit yang terletak di antara dua pulau dan menghubungkan dua perairan luas disebut...',
        options: ['A. Selat', 'B. Danau', 'C. Rawa', 'D. Teluk'],
        correctIndex: 0,
        explanation: 'Selat adalah perairan laut sempit di antara dua pulau, misalnya Selat Sunda yang memisahkan Pulau Jawa dan Sumatera.'
      },
      {
        id: 3,
        question: 'Danau Toba di Sumatera Utara yang terbentuk akibat letusan gunung berapi purba merupakan contoh kenampakan alam...',
        options: ['A. Buatan manusia', 'B. Perairan darat', 'C. Lautan dalam', 'D. Dataran tinggi kering'],
        correctIndex: 1,
        explanation: 'Danau merupakan salah satu kenampakan alam perairan darat berupa cekungan besar di daratan yang terisi air.'
      }
    ]
  },
  {
    id: 'adaptasi',
    number: 'Sub-Bab 03',
    title: 'Adaptasi Manusia, Pemanfaatan, dan Pelestarian',
    subtitle: 'Mata Pencaharian, Budaya, serta Upaya Menjaga Kelestarian Alam',
    summaryBadge: 'Interaksi Manusia & Konservasi Lingkungan',
    paragraphs: [
      'Perbedaan bentang alam memengaruhi cara hidup, bentuk rumah adat, pakaian, hingga mata pencaharian masyarakat. Masyarakat di daerah pegunungan dan dataran tinggi umumnya memakai pakaian tebal dan bekerja sebagai petani kebun sayur, teh, atau peternak sapi perah. Sebaliknya, masyarakat di dataran rendah bekerja sebagai petani padi, pedagang, dan pekerja pabrik, sedangkan warga di pesisir pantai bekerja sebagai nelayan, petani garam, dan pengelola wisata bahari. Agar bentang alam tetap lestari dan terhindar dari bencana tanah longsor maupun banjir, kita wajib melakukan reboisasi (penghijauan hutan di lereng gunung), membuat terasering (sengkedan) di lahan miring, serta tidak membuang sampah ke sungai maupun laut.'
    ],
    items: [
      {
        title: '1. Adaptasi Masyarakat Pegunungan & Dataran Tinggi',
        altitudeOrType: 'Udara Dingin · Tanah Miring Subur Vulkanik',
        content:
          'Warga mengenakan pakaian hangat/tebal, membangun rumah dengan ventilasi yang menjaga kehangatan, serta bekerja sebagai petani sayuran (kentang, wortel, kubis), pemetik teh, kopi, stroberi, dan peternak sapi perah.',
        examples: ['Perkebunan Teh & Kopi', 'Peternakan Sapi Perah Lembang', 'Pertanian Sayur Dieng']
      },
      {
        title: '2. Adaptasi Masyarakat Dataran Rendah & Pesisir Pantai',
        altitudeOrType: 'Udara Hangat · Lahan Datar & Laut Terbuka',
        content:
          'Di dataran rendah yang bertanah rata, masyarakat bekerja sebagai petani padi sawah, pedagang, karyawan industri, dan jasa transportasi. Di pesisir pantai dan laut, warga bekerja sebagai nelayan penangkap ikan, petani garam, pembudidaya rumput laut, serta pengelola wisata bahari.',
        examples: ['Pertanian Padi Sawah', 'Industri & Perdagangan Kota', 'Nelayan & Petani Garam Pesisir']
      },
      {
        title: '3. Pelestarian Bentang Alam & Mitigasi Bencana',
        altitudeOrType: 'Reboisasi, Terasering, dan Konservasi Perairan',
        content:
          'Untuk mencegah bencana tanah longsor dan banjir bandang, lereng gunung wajib dijaga melalui reboisasi (penanaman kembali hutan gundul) dan sistem terasering (sengkedan bertingkat pada lahan miring). Di wilayah sungai dan pantai, warga menjaga kebersihan sungai dari sampah plastik dan menanam hutan bakau (mangrove) penahan abrasi ombak.',
        examples: ['Reboisasi Lereng Gunung', 'Terasering / Sengkedan Bukit', 'Penanaman Bakau (Mangrove) Pantai']
      }
    ],
    fullTtsText:
      'Sub-Bab 3: Adaptasi Manusia, Pemanfaatan, dan Pelestarian Bentang Alam. Perbedaan bentang alam memengaruhi cara hidup, bentuk rumah adat, pakaian, hingga mata pencaharian masyarakat. Masyarakat di daerah pegunungan dan dataran tinggi umumnya memakai pakaian tebal dan bekerja sebagai petani kebun sayur, teh, atau peternak sapi perah. Sebaliknya, masyarakat di dataran rendah bekerja sebagai petani padi, pedagang, dan pekerja pabrik, sedangkan warga di pesisir pantai bekerja sebagai nelayan, petani garam, dan pengelola wisata bahari. Agar bentang alam tetap lestari dan terhindar dari bencana tanah longsor maupun banjir, kita wajib melakukan reboisasi atau penghijauan hutan di lereng gunung, membuat terasering atau sengkedan di lahan miring, serta tidak membuang sampah ke sungai maupun laut.',
    quiz: [
      {
        id: 1,
        question: 'Mayoritas penduduk yang tinggal di daerah pesisir pantai bekerja sebagai...',
        options: ['A. Petani teh', 'B. Nelayan dan petani garam', 'C. Pemetik apel', 'D. Penambang batu kapur'],
        correctIndex: 1,
        explanation: 'Wilayah pesisir pantai yang kaya sumber daya laut dan sinar matahari dimanfaatkan warga untuk mencari ikan (nelayan) dan membuat garam.'
      },
      {
        id: 2,
        question: 'Sistem bercocok tanam dengan membuat undakan atau tangga pada tanah miring di lereng bukit untuk mencegah longsor disebut...',
        options: ['A. Reboisasi', 'B. Irigasi', 'C. Terasering', 'D. Abrasi'],
        correctIndex: 2,
        explanation: 'Terasering (sengkedan) menahan laju aliran air permukaan di tanah miring sehingga tanah tidak mudah terkikis atau longsor.'
      },
      {
        id: 3,
        question: 'Penanaman pohon kembali pada hutan yang gundul di lereng gunung bertujuan untuk mencegah bencana...',
        options: ['A. Gempa bumi', 'B. Gunung meletus', 'C. Tanah longsor dan banjir', 'D. Tsunami'],
        correctIndex: 2,
        explanation: 'Akar pepohonan hasil reboisasi menyerap air hujan dan mengikat butiran tanah di lereng gunung sehingga mencegah banjir dan longsor.'
      }
    ]
  }
];

// ======================================================================
// KOMPONEN 2: DATA PIN & ZONA INTERAKTIF 3D VIRTUAL LAB
// ======================================================================
export const LANDFORM_ZONES_3D: LandformZone3D[] = [
  {
    id: 'gunung',
    name: 'Gunung Berapi & Pegunungan',
    shortPinLabel: 'Gunung Bromo (2.329 mdpl)',
    pasuruanHighlightName: 'Gunung Bromo, Gunung Arjuno-Welirang & Gunung Penanggungan',
    category: 'Daratan',
    elevationRange: '> 600 – 3.339 mdpl',
    elevationMdplNumeric: [600, 1500],
    avgTemp: '10°C – 17°C (Dingin)',
    cameraPos: [-16, 17, 18],
    cameraTarget: [-17, 8.5, -8],
    pinPosition: [-17, 14.2, -8],
    colorHex: '#F97316',
    generalExplanation:
      'Secara umum, gunung adalah bagian permukaan bumi yang menjulang tinggi seperti kerucut raksasa dengan ketinggian lebih dari 600 meter di atas permukaan laut (mdpl). Gunung terbagi menjadi gunung berapi aktif (memiliki kawah magma pijar dan mengeluarkan abu vulkanik yang menyuburkan tanah) serta gunung tidak aktif. Sedangkan pegunungan adalah rangkaian beberapa gunung yang saling menyambung memanjang.',
    pasuruanSpecificTitle: 'Khusus Kabupaten Pasuruan: Gunung Bromo, Arjuno-Welirang & Penanggungan',
    pasuruanSpecificExplanation:
      'Di wilayah Kabupaten Pasuruan, gunung yang paling terkenal adalah Gunung Bromo (2.329 mdpl) di Kecamatan Tosari (kawasan Taman Nasional Bromo Tengger Semeru). Gunung Bromo merupakan gunung berapi aktif di tengah Kaldera Tengger yang dikelilingi Lautan Pasir Berbisik. Udara dingin dan tanah abu vulkaniknya yang subur dimanfaatkan masyarakat Suku Tengger di Tosari untuk bercocok tanam kentang, kubis, wortel, dan daun bawang, sekaligus menjadi destinasi wisata matahari terbit (Golden Sunrise Penanjakan). Selain Gunung Bromo, Kabupaten Pasuruan juga memiliki Gunung Arjuno-Welirang (3.339 mdpl) di Prigen/Purwodadi dan Gunung Penanggungan (1.653 mdpl) di Gempol.',
    pasuruanLandmarks: [
      {
        name: 'Gunung Bromo',
        kecamatan: 'Kec. Tosari, Kab. Pasuruan',
        elevationOrType: '2.329 mdpl · Gunung Berapi Aktif',
        detail:
          'Gunung berapi aktif ikonik di Kaldera Tengger dengan kawah belerang mengepul, dikelilingi Lautan Pasir Berbisik, Pura Luhur Poten, dan titik pandang Golden Sunrise Penanjakan di Kecamatan Tosari.'
      },
      {
        name: 'Gunung Arjuno - Welirang',
        kecamatan: 'Kec. Prigen & Purwodadi, Kab. Pasuruan',
        elevationOrType: '3.339 mdpl · Gunung Berapi Strato',
        detail:
          'Gunung tertinggi di Kabupaten Pasuruan yang kawahnya menghasilkan bongkahan belerang alami serta hutannya menjadi daerah resapan mata air utama.'
      },
      {
        name: 'Gunung Penanggungan',
        kecamatan: 'Kec. Gempol & Pandaan, Kab. Pasuruan',
        elevationOrType: '1.653 mdpl · Gunung Api Istirahat',
        detail:
          'Dikenal sebagai Gunung Pawitra di perbatasan barat Kabupaten Pasuruan, berbentuk kerucut simetris dan menyimpan puluhan situs candi bersejarah di lerengnya.'
      },
      {
        name: 'Pegunungan Tengger',
        kecamatan: 'Kec. Tosari, Puspo & Tutur, Kab. Pasuruan',
        elevationOrType: '1.800 – 2.770 mdpl · Pegunungan Kaldera',
        detail:
          'Rangkaian pegunungan di selatan Kabupaten Pasuruan tempat bermukimnya masyarakat Suku Tengger dengan pertanian sayuran lereng gunung yang subur.'
      }
    ],
    description:
      'Bagian permukaan bumi yang menjulang tinggi (>600 mdpl). Di Kabupaten Pasuruan terdapat Gunung Bromo di Kec. Tosari, Gunung Arjuno-Welirang di Prigen, dan Gunung Penanggungan di Gempol.',
    floraFauna: 'Bunga Edelweis Jawa, Cemara Gunung, Pohon Pinus, Elang Jawa',
    livelihoods: 'Petani kentang & kubis Tosari, pemandu Jeep wisata Bromo, penambang belerang Welirang',
    indonesianExamples: 'Kab. Pasuruan: Gunung Bromo (Tosari), Gunung Arjuno-Welirang (Prigen), Gunung Penanggungan (Gempol)',
    conservationTip: 'Jaga kelestarian hutan lindung lereng gunung (reboisasi) dan dilarang memetik Bunga Edelweis di kawasan Bromo.'
  },
  {
    id: 'air-terjun',
    name: 'Air Terjun Lereng Pegunungan',
    shortPinLabel: 'Air Terjun Kakek Bodo & Putuk Truno',
    pasuruanHighlightName: 'Air Terjun Kakek Bodo, Putuk Truno, Coban Baung & Rambut Moyo',
    category: 'Perairan',
    elevationRange: '450 – 1.100 mdpl',
    elevationMdplNumeric: [450, 1100],
    avgTemp: '16°C – 21°C (Sejuk Segar)',
    cameraPos: [-10, 9.5, 13.5],
    cameraTarget: [-10.2, 4.2, 1.5],
    pinPosition: [-10.2, 7.6, 1.8],
    colorHex: '#06B6D4',
    generalExplanation:
      'Secara umum, air terjun adalah formasi aliran air sungai di daerah lereng gunung atau perbukitan yang jatuh secara vertikal dari tebing batu yang tinggi menuju cekungan kolam alami di bawahnya. Air terjun terbentuk di bagian hulu sungai akibat perbedaan ketinggian patahan batuan yang curam dan memiliki air yang jernih serta dingin.',
    pasuruanSpecificTitle: 'Khusus Kabupaten Pasuruan: Air Terjun Kakek Bodo, Putuk Truno & Coban Baung',
    pasuruanSpecificExplanation:
      'Kabupaten Pasuruan memiliki banyak bentang alam air terjun alami yang berada di kaki Gunung Welirang–Arjuno dan Pegunungan Tengger. Contoh utamanya adalah Air Terjun Kakek Bodo (tinggi ±40 meter) dan Air Terjun Putuk Truno (tinggi ±45 meter) di kawasan Tretes, Kecamatan Prigen, Air Terjun Coban Baung (tinggi ±100 meter) di Kecamatan Purwodadi, serta Air Terjun Rambut Moyo di Kecamatan Puspo. Air terjun di Kabupaten Pasuruan dikelilingi hutan pinus dan bambu yang rimbun, menjadi sumber mata air sungai bagi warga sekaligus objek wisata edukasi alam.',
    pasuruanLandmarks: [
      {
        name: 'Air Terjun Kakek Bodo',
        kecamatan: 'Tretes, Kec. Prigen, Kab. Pasuruan',
        elevationOrType: '±850 mdpl · Tinggi ±40 Meter',
        detail:
          'Air terjun ikonik di lereng Gunung Welirang yang mengalir deras melewati tebing batu bertingkat di tengah hutan pinus wisata Tretes, Kecamatan Prigen.'
      },
      {
        name: 'Air Terjun Putuk Truno',
        kecamatan: 'Kec. Prigen, Kab. Pasuruan',
        elevationOrType: '±800 mdpl · Tinggi ±45 Meter',
        detail:
          'Air terjun jernih di kaki Gunung Welirang–Arjuno dengan aliran air jatuh lurus ke kolam alami yang dikelilingi tebing hijau asri.'
      },
      {
        name: 'Air Terjun Coban Baung',
        kecamatan: 'Kec. Purwodadi, Kab. Pasuruan',
        elevationOrType: '±500 mdpl · Tinggi ±100 Meter',
        detail:
          'Air terjun megah setinggi 100 meter di kawasan Taman Wisata Alam tepat di sebelah timur Kebun Raya Purwodadi, pertemuan Sungai Welang dan Sungai Beji.'
      },
      {
        name: 'Air Terjun Rambut Moyo',
        kecamatan: 'Kec. Puspo, Kab. Pasuruan',
        elevationOrType: '±1.100 mdpl · Lereng Bromo',
        detail:
          'Air terjun alami di lereng barat Pegunungan Tengger Kecamatan Puspo dengan tirai air lebar di atas tebing batu berlumut.'
      }
    ],
    description:
      'Aliran air hulu sungai yang jatuh dari tebing batu tinggi di lereng gunung. Di Kabupaten Pasuruan terkenal dengan Air Terjun Kakek Bodo, Putuk Truno (Prigen), dan Coban Baung (Purwodadi).',
    floraFauna: 'Pohon Pinus, Pakis Hutan, Lumut Tebing, Burung Kepodang, Ikan Hulu Sungai',
    livelihoods: 'Pengelola wisata alam air terjun, pedagang kuliner hangat, penjaga hutan lindung (Perhutani)',
    indonesianExamples: 'Kab. Pasuruan: Air Terjun Kakek Bodo (Prigen), Putuk Truno (Prigen), Coban Baung (Purwodadi), Rambut Moyo (Puspo)',
    conservationTip: 'Jangan menebang pohon di hulu mata air dan dilarang membuang sampah plastik di area kolam air terjun.'
  },
  {
    id: 'dataran-tinggi',
    name: 'Dataran Tinggi, Bukit & Terasering',
    shortPinLabel: 'Dataran Tinggi Tutur & Prigen',
    pasuruanHighlightName: 'Dataran Tinggi Tutur (Nongkojajar), Prigen (Taman Dayu) & Puspo',
    category: 'Daratan',
    elevationRange: '200 – 600+ mdpl',
    elevationMdplNumeric: [200, 600],
    avgTemp: '17°C – 22°C (Sejuk)',
    cameraPos: [-4, 12, 19],
    cameraTarget: [-6, 4.8, -4],
    pinPosition: [-6, 6.8, -4],
    colorHex: '#10B981',
    generalExplanation:
      'Secara umum, dataran tinggi (plateau) adalah wilayah daratan luas yang terletak pada ketinggian 200 sampai 600 meter di atas permukaan laut (mdpl). Udara di dataran tinggi terasa sejuk dan tanahnya subur, sehingga cocok untuk perkebunan teh, kopi, apel, sayur-mayur, dan peternakan sapi perah. Lahan miring di perbukitan ditata dengan sistem terasering (sengkedan) bertingkat untuk mencegah tanah longsor.',
    pasuruanSpecificTitle: 'Khusus Kabupaten Pasuruan: Dataran Tinggi Tutur (Nongkojajar), Prigen & Purwodadi',
    pasuruanSpecificExplanation:
      'Di Kabupaten Pasuruan, bentang alam dataran tinggi membentang di Kecamatan Tutur (Nongkojajar), Prigen (Tretes & Taman Dayu), Puspo, dan Purwodadi. Di Dataran Tinggi Tutur (Nongkojajar), masyarakat memanfaatkan udara sejuk untuk membudidayakan buah apel, bunga krisan, kopi, serta menjadi sentra peternakan sapi perah penghasil susu segar terbesar di Kabupaten Pasuruan. Sementara itu, kawasan Dataran Tinggi Prigen dan Purwodadi dimanfaatkan untuk agrowisata, Taman Safari Prigen, dan pusat konservasi tumbuhan di Kebun Raya Purwodadi.',
    pasuruanLandmarks: [
      {
        name: 'Dataran Tinggi Tutur (Nongkojajar)',
        kecamatan: 'Kec. Tutur, Kab. Pasuruan',
        elevationOrType: '500 – 1.000 mdpl · Agrowisata & Peternakan',
        detail:
          'Dataran tinggi berudara sejuk di lereng barat Tengger yang terkenal sebagai sentra peternakan sapi perah, kebun apel Nongkojajar, dan bunga krisan.'
      },
      {
        name: 'Dataran Tinggi Prigen & Taman Dayu',
        kecamatan: 'Kec. Prigen, Kab. Pasuruan',
        elevationOrType: '350 – 800 mdpl · Perbukitan Sejuk',
        detail:
          'Kawasan perbukitan hijau di kaki Gunung Arjuno-Welirang yang menjadi pusat wisata edukasi satwa (Taman Safari Prigen) dan peristirahatan.'
      },
      {
        name: 'Perbukitan Terasering Puspo',
        kecamatan: 'Kec. Puspo & Lumbang, Kab. Pasuruan',
        elevationOrType: '400 – 900 mdpl · Sengkedan Bukit',
        detail:
          'Kawasan perbukitan dengan kebun berterasering penghasil kopi Pasuruan, durian, cengkeh, dan tanaman kehutanan.'
      },
      {
        name: 'Kebun Raya Purwodadi',
        kecamatan: 'Kec. Purwodadi, Kab. Pasuruan',
        elevationOrType: '±300 mdpl · Konservasi Tanaman',
        detail:
          'Kebun raya konservasi tumbuhan seluas 85 hektar di jalur menuju Malang yang menjadi paru-paru hijau dan laboratorium alam di Kabupaten Pasuruan.'
      }
    ],
    description:
      'Wilayah daratan luas pada ketinggian 200–600 mdpl dengan udara sejuk. Di Kabupaten Pasuruan mencakup Dataran Tinggi Tutur (Nongkojajar), Prigen (Taman Dayu), Puspo, dan Kebun Raya Purwodadi.',
    floraFauna: 'Pohon Apel Nongkojajar, Tanaman Kopi, Bunga Krisan, Durian, Sapi Perah',
    livelihoods: 'Peternak sapi perah Tutur, petani apel & bunga krisan, pemandu agrowisata Prigen',
    indonesianExamples: 'Kab. Pasuruan: Dataran Tinggi Tutur/Nongkojajar, Kawasan Prigen & Taman Dayu, Puspo, Kebun Raya Purwodadi',
    conservationTip: 'Terapkan sistem terasering (sengkedan) dan tanaman akar kuat di lereng bukit agar tidak terjadi tanah longsor.'
  },
  {
    id: 'sungai-danau',
    name: 'Danau Vulkanik, Mata Air & Sungai',
    shortPinLabel: 'Danau Ranu Grati & S. Rejoso',
    pasuruanHighlightName: 'Danau Ranu Grati, Sumber Umbulan, Sungai Rejoso & Sungai Welang',
    category: 'Perairan',
    elevationRange: '18 – 550 mdpl (Hulu ke Hilir)',
    elevationMdplNumeric: [50, 550],
    avgTemp: '22°C – 28°C (Sejuk-Hangat)',
    cameraPos: [3, 11, 18],
    cameraTarget: [0, 3.0, -2],
    pinPosition: [-0.5, 4.6, -5.5],
    colorHex: '#0EA5E9',
    generalExplanation:
      'Secara umum, danau adalah cekungan besar di permukaan daratan yang terisi oleh air tawar maupun asin (baik terbentuk karena letusan gunung berapi/vulkanik maupun pergeseran kulit bumi/tektonik). Sedangkan sungai adalah aliran air tawar alami yang mengalir memanjang dari bagian hulu (pegunungan) menuju bagian hilir (muara di laut).',
    pasuruanSpecificTitle: 'Khusus Kabupaten Pasuruan: Danau Ranu Grati, Umbulan & Sungai Rejoso',
    pasuruanSpecificExplanation:
      'Di Kabupaten Pasuruan terdapat satu-satunya danau alami yang sangat terkenal, yaitu Danau Ranu Grati di Kecamatan Grati (meliputi Desa Ranuklindungan, Sumberdawesari, dan Gratitunon). Danau Ranu Grati adalah danau vulkanik (maar) seluas ±1.084 hektar yang terbentuk dari letusan gunung api purba. Masyarakat memanfaatkan Ranu Grati untuk budidaya ikan air tawar dengan keramba jaring apung (ikan nila, mujair, dan ikan lempuk khas Ranu Grati), pengairan sawah, serta wisata air. Selain danau, Kabupaten Pasuruan memiliki Sumber Mata Air Umbulan di Winongan serta aliran Sungai Rejoso, Sungai Welang, dan Sungai Gembong.',
    pasuruanLandmarks: [
      {
        name: 'Danau Ranu Grati',
        kecamatan: 'Kec. Grati, Kab. Pasuruan',
        elevationOrType: '±18 mdpl · Danau Vulkanik Alami',
        detail:
          'Danau alami seluas ±1.084 Ha dengan kedalaman mencapai 120 meter di Kecamatan Grati, penghasil kuliner khas ikan lempuk krispi dan pusat keramba ikan air tawar.'
      },
      {
        name: 'Sumber Mata Air Umbulan',
        kecamatan: 'Kec. Winongan, Kab. Pasuruan',
        elevationOrType: '±45 mdpl · Mata Air Alami',
        detail:
          'Mata air alami legendaris di Kabupaten Pasuruan dengan debit air mencapai ribuan liter per detik yang jernih dan menjadi hulu aliran Sungai Rejoso.'
      },
      {
        name: 'Sungai Rejoso',
        kecamatan: 'Kec. Winongan – Rejoso, Kab. Pasuruan',
        elevationOrType: 'Aliran Hulu ke Muara Selat Madura',
        detail:
          'Sungai besar di Kabupaten Pasuruan yang menampung aliran air dari lereng Pegunungan Tengger dan Umbulan untuk mengairi ribuan hektar sawah.'
      },
      {
        name: 'Sungai Welang',
        kecamatan: 'Kec. Purwodadi – Kraton, Kab. Pasuruan',
        elevationOrType: 'Hulu Arjuno ke Muara Kraton',
        detail:
          'Sungai utama yang berhulu di lereng Gunung Arjuno-Welirang dan mengalir melewati Purwodadi, Sukorejo, hingga bermuara di pesisir Kecamatan Kraton.'
      }
    ],
    description:
      'Cekungan danau alami dan aliran sungai dari hulu ke hilir. Di Kabupaten Pasuruan terdapat Danau Ranu Grati di Kec. Grati, Sumber Mata Air Umbulan di Winongan, serta Sungai Rejoso dan Sungai Welang.',
    floraFauna: 'Ikan Lempuk (Khas Ranu Grati), Ikan Nila & Mujair, Bambu Bantaran Sungai, Teratai',
    livelihoods: 'Pembudidaya ikan keramba Ranu Grati, pengolah ikan lempuk, petani irigasi sungai',
    indonesianExamples: 'Kab. Pasuruan: Danau Ranu Grati (Kec. Grati), Sumber Umbulan (Winongan), Sungai Rejoso, Sungai Welang',
    conservationTip: 'Dilarang membuang sampah plastik atau limbah ke Danau Ranu Grati dan sungai serta jaga pohon di tepi sungai.'
  },
  {
    id: 'dataran-rendah',
    name: 'Dataran Rendah, Sawah & Pemukiman',
    shortPinLabel: 'Dataran Rendah Bangil & Pandaan',
    pasuruanHighlightName: 'Dataran Rendah Bangil, Pandaan, Gempol, Beji, Rembang & Kraton',
    category: 'Daratan',
    elevationRange: '0 – 200 mdpl',
    elevationMdplNumeric: [0, 200],
    avgTemp: '26°C – 32°C (Hangat)',
    cameraPos: [10, 9.5, 19],
    cameraTarget: [6, 1.5, 3],
    pinPosition: [6.5, 3.2, 2.5],
    colorHex: '#84CC16',
    generalExplanation:
      'Secara umum, dataran rendah adalah hamparan tanah datar yang luas dengan ketinggian 0 sampai 200 meter di atas permukaan laut (mdpl) dan suhu udara hangat (26°C–32°C). Karena tanahnya rata dan mudah dibangun jaringan transportasi serta irigasi, dataran rendah menjadi pusat pemukiman penduduk, pertanian padi sawah, perdagangan, pemerintahan, dan kawasan industri.',
    pasuruanSpecificTitle: 'Khusus Kabupaten Pasuruan: Dataran Rendah Bangil, Pandaan, Rembang & Kraton',
    pasuruanSpecificExplanation:
      'Di Kabupaten Pasuruan, bentang alam dataran rendah meliputi Kecamatan Bangil (Ibu Kota Kabupaten Pasuruan), Pandaan, Gempol, Beji, Rembang, Gondangwetan, Pohjentrek, Winongan, dan Grati. Tanah dataran rendah Kabupaten Pasuruan sangat subur karena endapan aluvial sungai, sehingga dimanfaatkan warga untuk menanam padi sawah, bunga sedap malam (di Kecamatan Rembang), serta Mangga Klonal 21 atau Mangga Alpukat khas Pasuruan (di Rembang dan Sukorejo). Selain pertanian, tanah yang datar di Bangil, Beji, Rembang (Kawasan Industri PIER), Gempol, dan Pandaan menjadi pusat pemerintahan, kerajinan bordir Bangil, perdagangan, dan industri.',
    pasuruanLandmarks: [
      {
        name: 'Dataran Rendah Bangil',
        kecamatan: 'Kec. Bangil, Kab. Pasuruan',
        elevationOrType: '4 – 15 mdpl · Ibu Kota Kabupaten',
        detail:
          'Pusat pemerintahan Kabupaten Pasuruan (Kota Bordir) dengan kontur tanah datar yang menjadi pusat layanan publik, stasiun kereta api, perdagangan, dan pemukiman.'
      },
      {
        name: 'Dataran Rendah Pandaan & Gempol',
        kecamatan: 'Kec. Pandaan & Gempol, Kab. Pasuruan',
        elevationOrType: '50 – 180 mdpl · Sentra Ekonomi & Jalur Utama',
        detail:
          'Dataran rendah strategis yang menghubungkan Surabaya–Malang–Bromo, pusat perdagangan, kuliner, pertanian, dan industri pengolahan.'
      },
      {
        name: 'Sentra Sawah & Kebun Rembang',
        kecamatan: 'Kec. Rembang & Sukorejo, Kab. Pasuruan',
        elevationOrType: '15 – 120 mdpl · Pertanian & Industri PIER',
        detail:
          'Terkenal sebagai penghasil bunga sedap malam, Mangga Alpukat (Klonal 21) khas Kabupaten Pasuruan, hamparan sawah, serta Kawasan Industri PIER.'
      },
      {
        name: 'Lumbung Padi Gondangwetan & Rejoso',
        kecamatan: 'Kec. Gondangwetan, Pohjentrek & Rejoso',
        elevationOrType: '5 – 35 mdpl · Sawah Irigasi Teknis',
        detail:
          'Hamparan sawah dataran rendah yang selalu subur sepanjang tahun berkat pasokan irigasi sungai dari mata air lereng Bromo dan Umbulan.'
      }
    ],
    description:
      'Hamparan tanah datar pada ketinggian 0–200 mdpl. Di Kabupaten Pasuruan meliputi Bangil (Ibu Kota Kabupaten), Pandaan, Gempol, Beji, Rembang, dan Gondangwetan sebagai pusat sawah, kebun mangga alpukat, dan industri.',
    floraFauna: 'Padi Sawah, Mangga Klonal 21 (Mangga Alpukat Pasuruan), Bunga Sedap Malam Rembang, Burung Pipit',
    livelihoods: 'Petani padi & mangga alpukat, pengrajin bordir Bangil, pedagang, karyawan industri PIER/Pandaan',
    indonesianExamples: 'Kab. Pasuruan: Dataran Rendah Bangil, Pandaan, Gempol, Beji, Rembang, Gondangwetan, Kraton',
    conservationTip: 'Jaga kebersihan saluran irigasi sawah, buat sumur resapan air, dan pertahankan ruang terbuka hijau di pemukiman.'
  },
  {
    id: 'pantai-laut',
    name: 'Laut, Selat, Pantai & Hutan Bakau',
    shortPinLabel: 'Laut Selat Madura & Pantai Lekok',
    pasuruanHighlightName: 'Laut Selat Madura, Pantai Lekok, Pantai Pasir Panjang & Mangrove Nguling',
    category: 'Perairan',
    elevationRange: '0 mdpl (Permukaan Laut)',
    elevationMdplNumeric: [0, 25],
    avgTemp: '28°C – 33°C (Tropis Pesisir)',
    cameraPos: [22, 9.5, 17],
    cameraTarget: [16, 0.8, 3],
    pinPosition: [16.5, 2.8, 2.5],
    colorHex: '#0284C7',
    generalExplanation:
      'Secara umum, laut adalah kumpulan air asin yang sangat luas yang mengelilingi daratan dan menghubungkan pulau-pulau. Selat adalah perairan laut sempit di antara dua pulau, sedangkan pantai dan rawa bakau (mangrove) adalah perbatasan daratan dan lautan pada ketinggian 0 mdpl. Hutan bakau berfungsi sangat penting untuk memecah gelombang ombak agar pantai tidak mengalami pengikisan tanah (abrasi).',
    pasuruanSpecificTitle: 'Khusus Kabupaten Pasuruan: Laut Selat Madura, Pantai Lekok & Mangrove Nguling',
    pasuruanSpecificExplanation:
      'Di bagian utara, wilayah Kabupaten Pasuruan berbatasan langsung dengan perairan Laut Jawa dan Selat Madura sepanjang ±48 kilometer yang membentang di 5 kecamatan pesisir: Kecamatan Nguling, Lekok, Rejoso, Kraton, dan Bangil. Contoh bentang alam pesisir dan laut di Kabupaten Pasuruan adalah Pantai Pasir Panjang dan Pantai Semedusari di Kecamatan Lekok, Ekowisata Hutan Mangrove Desa Penunggul di Kecamatan Nguling, serta kawasan pertambakan pesisir di Kraton dan Bangil. Masyarakat pesisir Kabupaten Pasuruan bekerja sebagai nelayan perahu tradisional di Selat Madura, petambak ikan bandeng (Bandeng Jelak/Kraton) dan udang, serta petani garam.',
    pasuruanLandmarks: [
      {
        name: 'Laut Selat Madura (Pesisir Utara Pasuruan)',
        kecamatan: 'Pesisir Nguling, Lekok, Rejoso, Kraton & Bangil',
        elevationOrType: '0 mdpl · Perairan Laut & Selat',
        detail:
          'Perairan laut di sebelah utara Kabupaten Pasuruan yang memisahkan Pulau Jawa dan Pulau Madura, menjadi wilayah tangkapan ikan utama bagi ribuan nelayan Pasuruan.'
      },
      {
        name: 'Pantai Lekok & Pantai Pasir Panjang',
        kecamatan: 'Kec. Lekok, Kab. Pasuruan',
        elevationOrType: '0 mdpl · Pantai Nelayan & Budaya Bahari',
        detail:
          'Pantai pesisir tempat berlabuhnya perahu-perahu nelayan warna-warni di Kecamatan Lekok serta lokasi tradisi unik Ski Lumpur (Skione) di pantai berlumpur.'
      },
      {
        name: 'Hutan Mangrove Desa Penunggul',
        kecamatan: 'Kec. Nguling, Kab. Pasuruan',
        elevationOrType: '0 mdpl · Rawa Bakau Konservasi',
        detail:
          'Kawasan konservasi hutan bakau (mangrove) yang rimbun di ujung timur pesisir Kabupaten Pasuruan, pelindung pantai dari abrasi ombak sekaligus habitat kepiting dan burung air.'
      },
      {
        name: 'Kawasan Tambak Bandeng Kraton & Bangil',
        kecamatan: 'Kec. Kraton, Rejoso & Bangil, Kab. Pasuruan',
        elevationOrType: '0 – 2 mdpl · Tambak Pesisir & Muara',
        detail:
          'Lahan tambak air payau di sepanjang muara sungai pesisir utara Kabupaten Pasuruan yang menghasilkan ikan bandeng berkualitas tinggi, udang, dan garam.'
      }
    ],
    description:
      'Perbatasan daratan dan lautan (0 mdpl). Di Kabupaten Pasuruan membentang sepanjang ±48 km di perairan Selat Madura meliputi Pantai Lekok, Hutan Mangrove Penunggul (Nguling), serta tambak pesisir Kraton dan Bangil.',
    floraFauna: 'Pohon Bakau (Mangrove Penunggul), Ikan Bandeng Kraton, Ikan Laut Selat Madura, Kepiting Bakau, Burung Kuntul Perak',
    livelihoods: 'Nelayan Selat Madura (Lekok & Nguling), petambak bandeng & udang Kraton, petani garam, pengelola wisata mangrove',
    indonesianExamples: 'Kab. Pasuruan: Laut Selat Madura, Pantai Pasir Panjang (Lekok), Hutan Mangrove Penunggul (Nguling), Pesisir Kraton & Bangil',
    conservationTip: 'Lestarikan hutan bakau (mangrove) seperti di Desa Penunggul Nguling untuk menahan abrasi gelombang laut.'
  }
];

// ======================================================================
// KOMPONEN 4: 10 SOAL GAME PETUALANGAN "PALU GUNUNG"
// ======================================================================
export interface PaluGunungQuestion extends QuizQuestion {
  posName: string;
  elevationLabel: string;
}

export const PALU_GUNUNG_QUESTIONS: PaluGunungQuestion[] = [
  {
    id: 1,
    posName: 'Pos 1 · Parkir Jeep Lautan Pasir Bromo',
    elevationLabel: '2.050 mdpl',
    question: 'Bagian permukaan bumi yang menjulang tinggi dengan ketinggian lebih dari 600 mdpl disebut...',
    options: ['A. Gunung', 'B. Bukit', 'C. Lembah', 'D. Rawa'],
    correctIndex: 0,
    explanation: 'Gunung menjulang tinggi dengan ketinggian lebih dari 600 meter di atas permukaan laut (mdpl).'
  },
  {
    id: 2,
    posName: 'Pos 2 · Pelataran Pura Luhur Poten',
    elevationLabel: '2.080 mdpl',
    question: 'Rangkaian beberapa gunung yang saling bersambung memanjang disebut...',
    options: ['A. Dataran tinggi', 'B. Pegunungan', 'C. Ngarai', 'D. Tanjung'],
    correctIndex: 1,
    explanation: 'Pegunungan adalah rangkaian beberapa gunung yang saling menyambung memanjang seperti Pegunungan Tengger dan Bukit Barisan.'
  },
  {
    id: 3,
    posName: 'Pos 3 · Lembah Kaki Gunung Batok',
    elevationLabel: '2.110 mdpl',
    question: 'Gunung berapi yang masih aktif dapat mengeluarkan cairan panas pijar dari perut bumi yang disebut...',
    options: ['A. Gletser', 'B. Kabut', 'C. Lava / Magma', 'D. Embun'],
    correctIndex: 2,
    explanation: 'Magma adalah cairan panas pijar di dalam perut bumi, sedangkan saat keluar meleleh dari kawah gunung berapi disebut lava.'
  },
  {
    id: 4,
    posName: 'Pos 4 · Jalur Kuda Pasir Berbisik',
    elevationLabel: '2.145 mdpl',
    question: 'Pegunungan tertinggi di Indonesia yang puncaknya diselimuti salju abadi di Provinsi Papua adalah...',
    options: ['A. Pegunungan Jayawijaya', 'B. Pegunungan Bukit Barisan', 'C. Pegunungan Kapur Utara', 'D. Pegunungan Meratus'],
    correctIndex: 0,
    explanation: 'Pegunungan Jayawijaya di Papua memiliki puncak tertinggi di Indonesia (Puncak Jaya) yang bersalju abadi.'
  },
  {
    id: 5,
    posName: 'Pos 5 · Lereng Abu Vulkanik Bromo',
    elevationLabel: '2.180 mdpl',
    question: 'Tanah di sekitar gunung berapi sangat subur untuk pertanian karena mengandung...',
    options: ['A. Pasir pantai', 'B. Lumpur laut', 'C. Batu karang', 'D. Abu vulkanik'],
    correctIndex: 3,
    explanation: 'Abu vulkanik dari letusan gunung berapi kaya akan mineral hara yang menyuburkan tanah pertanian seperti di kawasan Tosari & Tengger.'
  },
  {
    id: 6,
    posName: 'Pos 6 · Punggung Kaldera Tengger',
    elevationLabel: '2.215 mdpl',
    question: 'Jurang atau lembah yang dalam dan luas di antara tebing-tebing curam seperti Ngarai Sianok di Sumatera Barat disebut...',
    options: ['A. Delta', 'B. Ngarai (Canyon)', 'C. Teluk', 'D. Muara'],
    correctIndex: 1,
    explanation: 'Ngarai (canyon) adalah lembah dalam dan luas yang dibatasi oleh dinding tebing batu yang curam.'
  },
  {
    id: 7,
    posName: 'Pos 7 · Gerbang Tangga Kawah Bromo',
    elevationLabel: '2.245 mdpl',
    question: 'Dataran Tinggi Dieng yang terkenal dengan udara dingin dan kebun kentangnya terletak di provinsi...',
    options: ['A. Jawa Barat', 'B. Bali', 'C. Jawa Tengah', 'D. Kalimantan Timur'],
    correctIndex: 2,
    explanation: 'Dataran Tinggi Dieng terletak di Provinsi Jawa Tengah (perbatasan Kabupaten Wonosobo dan Banjarnegara).'
  },
  {
    id: 8,
    posName: 'Pos 8 · Pertengahan 250 Anak Tangga Bromo',
    elevationLabel: '2.280 mdpl',
    question: 'Aliran sungai yang berakhir dan bertemu langsung dengan laut disebut...',
    options: ['A. Muara sungai (Hilir)', 'B. Hulu sungai', 'C. Anak sungai', 'D. Rawa-rawa'],
    correctIndex: 0,
    explanation: 'Bagian akhir sungai yang bertemu langsung dengan laut disebut muara sungai (bagian hilir).'
  },
  {
    id: 9,
    posName: 'Pos 9 · Teras Pandang Gunung Semeru',
    elevationLabel: '2.305 mdpl',
    question: 'Tanaman pelindung yang ditanam di sepanjang tepi pantai untuk menahan ombak dan mencegah pengikisan tanah (abrasi) adalah...',
    options: ['A. Pohon Pinus', 'B. Tanaman Teh', 'C. Pohon Apel', 'D. Hutan Bakau (Mangrove)'],
    correctIndex: 3,
    explanation: 'Akar tunjang pohon bakau (mangrove) yang rapat mampu memecah gelombang ombak dan mencegah abrasi pantai.'
  },
  {
    id: 10,
    posName: 'Pos 10 · Puncak Bibir Kawah Gunung Bromo',
    elevationLabel: '2.329 mdpl',
    question: 'Contoh kenampakan buatan manusia yang dibangun dengan membendung aliran sungai untuk pembangkit listrik dan pengairan adalah...',
    options: ['A. Selat', 'B. Waduk / Bendungan', 'C. Teluk', 'D. Gunung'],
    correctIndex: 1,
    explanation: 'Waduk atau bendungan dibuat manusia untuk menampung air sungai sebagai sarana irigasi sawah dan Pembangkit Listrik Tenaga Air (PLTA).'
  }
];

// ======================================================================
// KOMPONEN 5: 10 SOAL ASESMEN EVALUASI KELAS 4 SD (4 LOTS & 6 HOTS)
// Sumber: Materi Pembelajaran + Simulasi Virtual Lab 3D + Bentang Alam Kab. Pasuruan
// ======================================================================
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    part: 'LOTS',
    cognitiveLevel: 'C1 - Mengingat',
    sourceTopic: 'Virtual Lab 3D & Materi · Gunung di Kab. Pasuruan',
    question:
      'Saat kamu mengeklik bentang alam gunung pada Virtual Lab 3D, muncul nama gunung berapi aktif terkenal di Kecamatan Tosari, Kabupaten Pasuruan yang memiliki ketinggian 2.329 mdpl (> 600 mdpl) dan dikelilingi Lautan Pasir. Nama gunung tersebut adalah...',
    options: [
      'A. Gunung Bromo',
      'B. Danau Ranu Grati',
      'C. Pantai Pasir Panjang Lekok',
      'D. Sungai Rejoso'
    ],
    correctIndex: 0,
    explanation:
      'Gunung adalah daratan yang menjulang tinggi lebih dari 600 mdpl. Contoh gunung berapi aktif yang terkenal di Kecamatan Tosari, Kabupaten Pasuruan adalah Gunung Bromo (2.329 mdpl).'
  },
  {
    id: 2,
    part: 'LOTS',
    cognitiveLevel: 'C2 - Memahami',
    sourceTopic: 'Virtual Lab 3D & Materi · Air Terjun & Danau Kab. Pasuruan',
    question:
      'Di Kabupaten Pasuruan terdapat Danau Ranu Grati di Kecamatan Grati dan Air Terjun Kakek Bodo di Kecamatan Prigen. Berdasarkan pengamatanmu di Materi dan Virtual Lab 3D, perbedaan utama antara danau dan air terjun adalah...',
    options: [
      'A. Danau adalah laut sempit di antara dua pulau, sedangkan air terjun adalah rawa bakau di tepi pantai',
      'B. Danau adalah cekungan besar di daratan yang terisi air, sedangkan air terjun adalah aliran air hulu sungai yang jatuh dari tebing batu tinggi di lereng gunung',
      'C. Danau berisi air laut yang asin di pesisir, sedangkan air terjun berada di tengah sawah dataran rendah',
      'D. Danau dan air terjun sama-sama terbentuk di dasar lautan yang sangat dalam'
    ],
    correctIndex: 1,
    explanation:
      'Danau (seperti Danau Ranu Grati) adalah cekungan besar di daratan yang terisi air, sedangkan air terjun (seperti Air Terjun Kakek Bodo & Putuk Truno di Prigen) adalah aliran air hulu sungai yang jatuh dari tebing tinggi di lereng pegunungan.'
  },
  {
    id: 3,
    part: 'LOTS',
    cognitiveLevel: 'C3 - Menerapkan',
    sourceTopic: 'Materi & Virtual Lab 3D · Dataran Tinggi Kab. Pasuruan',
    question:
      'Keluarga Pak Rahmat tinggal di kawasan Dataran Tinggi Tutur (Nongkojajar), Kabupaten Pasuruan pada ketinggian sekitar 500–800 mdpl yang berudara sejuk (17°C–22°C). Jenis pekerjaan yang paling tepat dilakukan oleh warga di daerah tersebut adalah...',
    options: [
      'A. Menjadi nelayan penangkap ikan laut dan petani garam dapur',
      'B. Membuka tambak ikan bandeng dan udang di tepi pantai berlumpur',
      'C. Berkebun apel, bunga krisan, sayur-mayur, serta beternak sapi perah penghasil susu segar',
      'D. Membangun pelabuhan kapal pesiar besar di puncak perbukitan'
    ],
    correctIndex: 2,
    explanation:
      'Dataran tinggi seperti Kecamatan Tutur (Nongkojajar) dan Prigen di Kabupaten Pasuruan memiliki udara sejuk sehingga sangat cocok untuk perkebunan apel, bunga krisan, sayuran, dan peternakan sapi perah.'
  },
  {
    id: 4,
    part: 'LOTS',
    cognitiveLevel: 'C3 - Menerapkan',
    sourceTopic: 'Virtual Lab 3D & Materi · Dataran Rendah & Laut Kab. Pasuruan',
    question:
      'Pada Virtual Lab 3D, zona ketinggian 0–200 mdpl menampilkan Dataran Rendah (seperti Bangil, Pandaan, dan Rembang) serta Pesisir Laut Selat Madura (seperti Pantai Lekok dan Kraton). Pasangan mata pencaharian warga yang sesuai dengan kedua bentang alam tersebut adalah...',
    options: [
      'A. Dataran rendah Bangil & Rembang untuk petani padi dan mangga alpukat; Pesisir Pantai Lekok untuk nelayan dan petambak bandeng',
      'B. Dataran rendah Bangil untuk penambang belerang kawah; Pesisir Pantai Lekok untuk petani kentang',
      'C. Dataran rendah Bangil untuk pemetik teh; Pesisir Pantai Lekok untuk peternak sapi perah udara dingin',
      'D. Kedua wilayah tersebut hanya cocok untuk menanam bunga edelweis pegunungan'
    ],
    correctIndex: 0,
    explanation:
      'Dataran rendah di Kabupaten Pasuruan (Bangil, Pandaan, Rembang) bertanah rata dan hangat sehingga cocok untuk pertanian padi sawah, mangga alpukat, dan industri. Sedangkan warga pesisir Laut Selat Madura (Lekok & Kraton) bekerja sebagai nelayan dan petambak bandeng.'
  },
  {
    id: 5,
    part: 'HOTS',
    cognitiveLevel: 'C4 - Menganalisis',
    sourceTopic: 'Simulasi Ketinggian (mdpl) Virtual Lab 3D · Bangil ke Bromo',
    question:
      'Saat kamu menggeser tombol Indikator Ketinggian (mdpl) pada Virtual Lab 3D dari Dataran Rendah Bangil (15 mdpl, suhu ~29°C) naik menuju kawasan Gunung Bromo di Tosari (>1.500 mdpl, suhu ~14°C), terlihat perbedaan cara berpakaian dan jenis tanaman warga. Mengapa warga di lereng Gunung Bromo memakai pakaian tebal serta menanam kentang dan kubis, bukan padi sawah seperti di Bangil?',
    options: [
      'A. Karena semakin tinggi tempat dari permukaan laut, suhu udaranya semakin dingin dan tanahnya miring sehingga cocok untuk tanaman sayuran dataran tinggi seperti kentang dan kubis',
      'B. Karena air di lereng Gunung Bromo terasa asin seperti air laut di Pantai Lekok',
      'C. Karena wilayah Dataran Rendah Bangil selalu turun salju tebal sepanjang tahun',
      'D. Karena tanaman kentang dan kubis hanya dapat tumbuh di dalam genangan air laut pasang'
    ],
    correctIndex: 0,
    explanation:
      'Hasil simulasi Indikator Ketinggian di Virtual Lab 3D membuktikan bahwa semakin tinggi suatu tempat (mdpl), suhu udaranya semakin dingin. Warga mengenakan pakaian tebal agar hangat, serta menanam kentang, wortel, dan kubis yang cocok tumbuh di udara dingin.'
  },
  {
    id: 6,
    part: 'HOTS',
    cognitiveLevel: 'C4 - Menganalisis',
    sourceTopic: 'Simulasi Hujan & Hutan Gundul Virtual Lab 3D · Hulu ke Hilir',
    question:
      'Di Virtual Lab 3D, ketika kamu menyalakan tombol "Simulasi Hujan" bersamaan dengan tombol "Hutan Gundul (Rawan Longsor)" di lereng gunung, air sungai yang mengalir menuju dataran rendah berubah menjadi cokelat keruh berlumpur. Apa penyebab utama terjadinya peristiwa tersebut?',
    options: [
      'A. Air hujan sudah berwarna cokelat lumpur sejak turun dari awan mendung',
      'B. Karena pohon di lereng gunung (hulu) habis ditebang, tidak ada akar pohon yang menyerap air hujan dan mengikat tanah, sehingga tanah terkikis (erosi) dan terbawa aliran sungai ke dataran rendah',
      'C. Ikan lempuk di Danau Ranu Grati mengaduk lumpur hingga naik ke puncak gunung',
      'D. Hutan yang gundul membuat air laut naik membanjiri puncak kawah gunung'
    ],
    correctIndex: 1,
    explanation:
      'Simulasi Virtual Lab 3D menunjukkan bahwa hutan gundul di lereng gunung kehilangan akar pengikat tanah. Saat turun hujan deras, air langsung mengikis tanah lereng (erosi/longsor) dan membawa lumpur pekat ke sungai di dataran rendah.'
  },
  {
    id: 7,
    part: 'HOTS',
    cognitiveLevel: 'C4 - Menganalisis',
    sourceTopic: 'Analisis Perbandingan Wilayah Kab. Pasuruan · Daratan',
    question:
      'Perhatikan dua wilayah di Kabupaten Pasuruan berikut! Wilayah A (Kecamatan Bangil, Beji, dan Pandaan) memiliki tanah datar di ketinggian 10–150 mdpl. Wilayah B (Kecamatan Tosari dan Puspo) memiliki lereng bukit curam di ketinggian lebih dari 800 mdpl. Mengapa pabrik industri dan jalur jalan raya utama lebih banyak dibangun di Wilayah A, sedangkan Wilayah B dibuat kebun berterasering (sengkedan)?',
    options: [
      'A. Karena tanah datar di Wilayah A memudahkan pembangunan gedung pabrik dan transportasi jalan raya, sedangkan lereng miring di Wilayah B harus dibuat bertingkat (terasering) untuk menahan tanah agar tidak longsor',
      'B. Karena Wilayah A berada tepat di bibir kawah gunung berapi yang aktif',
      'C. Karena Wilayah B tidak pernah terkena sinar matahari dan air hujan',
      'D. Karena Wilayah A merupakan perairan laut dalam tempat berlayar kapal besar'
    ],
    correctIndex: 0,
    explanation:
      'Kontur tanah yang rata di dataran rendah (Bangil, Beji, Pandaan) memudahkan pembangunan gedung, pabrik, dan jalan raya. Sementara itu, lahan miring di perbukitan (Tosari dan Puspo) wajib menggunakan sistem terasering agar tanah tidak mudah longsor.'
  },
  {
    id: 8,
    part: 'HOTS',
    cognitiveLevel: 'C5 - Mengevaluasi',
    sourceTopic: 'Virtual Lab 3D & Materi · Pelestarian Pantai & Bakau Pasuruan',
    question:
      'Di pesisir Desa Penunggul, Kecamatan Nguling, Kabupaten Pasuruan terdapat Hutan Bakau (Mangrove) yang tumbuh subur di tepi Laut Selat Madura. Jika ada pihak yang ingin menebang habis pohon bakau tersebut untuk dijadikan lapangan parkir beton di tepi pantai, bagaimana penilaianmu yang paling tepat?',
    options: [
      'A. Sangat setuju, karena lapangan beton dapat menghasilkan ikan dan kepiting lebih banyak daripada hutan bakau',
      'B. Tidak setuju, karena menebang hutan bakau akan menghilangkan pelindung alami pantai dari pengikisan ombak laut (abrasi) serta merusak tempat hidup kepiting dan anak ikan',
      'C. Sangat setuju, karena pohon bakau membuat air Laut Selat Madura menjadi kotor',
      'D. Tidak masalah, karena pohon bakau di tepi laut bisa diganti dengan menanam pohon apel dan stroberi'
    ],
    correctIndex: 1,
    explanation:
      'Hutan bakau (mangrove) di pesisir Nguling dan Lekok memiliki akar rapat yang sangat penting untuk memecah gelombang ombak (mencegah abrasi pantai) sekaligus menjadi rumah bagi kepiting, udang, dan ikan.'
  },
  {
    id: 9,
    part: 'HOTS',
    cognitiveLevel: 'C5 - Mengevaluasi',
    sourceTopic: 'Virtual Lab 3D & Materi · Pelestarian Danau Ranu Grati & Air Terjun',
    question:
      'Danau Ranu Grati di Kecamatan Grati dimanfaatkan warga untuk keramba ikan air tawar dan mencari ikan lempuk, sedangkan Air Terjun Kakek Bodo di Prigen ramai dikunjungi wisatawan. Manakah tindakan yang paling tepat untuk menjaga kelestarian kedua bentang alam perairan di Kabupaten Pasuruan tersebut?',
    options: [
      'A. Membuang bungkus makanan plastik ke aliran air terjun agar terbawa arus sampai ke sungai',
      'B. Menebang pohon pinus di tebing Air Terjun Kakek Bodo dan membuang limbah ke Danau Ranu Grati',
      'C. Menjaga pepohonan di hulu mata air Prigen tetap rimbun, tidak membuang sampah ke air terjun maupun danau, serta mengatur pakan ikan keramba di Danau Ranu Grati agar air tidak tercemar',
      'D. Mengeringkan seluruh air Danau Ranu Grati untuk dijadikan jalan raya'
    ],
    correctIndex: 2,
    explanation:
      'Kelestarian air terjun dijaga dengan mempertahankan hutan di sekitar mata air, sedangkan kelestarian Danau Ranu Grati dijaga dengan tidak membuang sampah/limbah serta menjaga kebersihan air danau.'
  },
  {
    id: 10,
    part: 'HOTS',
    cognitiveLevel: 'C6 - Mencipta/Merancang',
    sourceTopic: 'Proyek Tata Ruang Lestari · Bentang Alam Kabupaten Pasuruan',
    question:
      'Bayangkan kamu terpilih menjadi Duta Lingkungan Cilik Kelas 4 SD yang diminta menyusun program "Kabupaten Pasuruan Lestari dari Gunung hingga Laut". Rancangan program manakah yang paling tepat dan lengkap sesuai bentang alam Kabupaten Pasuruan yang telah kamu pelajari di Virtual Lab 3D?',
    options: [
      'A. Menebang hutan di Gunung Arjuno, membuang sampah plastik ke Sungai Rejoso, dan mencabut tanaman bakau di Pantai Nguling',
      'B. Melakukan reboisasi dan terasering di lereng Gunung Bromo & bukit Tutur, menjaga kebersihan aliran Sungai Rejoso & Danau Ranu Grati di dataran rendah, serta menanam hutan bakau (mangrove) di pesisir Pantai Lekok & Nguling',
      'C. Menanam pohon bakau di puncak kawah Gunung Bromo dan menanam pohon apel di tengah perairan Laut Selat Madura',
      'D. Menutup seluruh lahan sawah di Bangil dan Pandaan dengan aspal agar tidak ada air yang meresap ke tanah'
    ],
    correctIndex: 1,
    explanation:
      'Rancangan pelestarian terpadu dari hulu ke hilir di Kabupaten Pasuruan mencakup: (1) Reboisasi & terasering di gunung/dataran tinggi (Bromo, Arjuno, Tutur), (2) Menjaga kebersihan sungai & danau (Sungai Rejoso & Ranu Grati), serta (3) Penanaman bakau/mangrove di pesisir pantai (Lekok & Nguling).'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    timestamp: '2026-10-28 08:30',
    nama: 'Alya Putri Ramadhani',
    kelas: '4A - Nusantara',
    skorKuisSubBab: 100,
    skorPaluGunung: 100,
    skorAsesmenC1C3: 100,
    skorAsesmenC4C6: 100,
    totalSkor: 100
  },
  {
    timestamp: '2026-10-29 09:15',
    nama: 'Bima Satria Pratama',
    kelas: '4B - Garuda',
    skorKuisSubBab: 89,
    skorPaluGunung: 90,
    skorAsesmenC1C3: 100,
    skorAsesmenC4C6: 83,
    totalSkor: 90
  },
  {
    timestamp: '2026-10-30 10:05',
    nama: 'Citra Kirana Dewi',
    kelas: '4A - Nusantara',
    skorKuisSubBab: 100,
    skorPaluGunung: 90,
    skorAsesmenC1C3: 75,
    skorAsesmenC4C6: 83,
    totalSkor: 87
  }
];
