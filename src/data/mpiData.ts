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

export interface LandformZone3D {
  id: string;
  name: string;
  category: 'Daratan' | 'Perairan' | 'Adaptasi & Pelestarian';
  elevationRange: string;
  elevationMdplNumeric: [number, number];
  avgTemp: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  pinPosition: [number, number, number];
  colorHex: string;
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
export const HERO_IMAGE_PRIMARY = '/assets/aistudio/Dino_Adventure__Jelajah_Pasuruan_4833c8a1.png';
export const HERO_IMAGE_FALLBACK = `https://drive.google.com/thumbnail?id=${HERO_DRIVE_ID}&sz=w1600`;

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
    category: 'Daratan',
    elevationRange: '> 600 – 1.500+ mdpl',
    elevationMdplNumeric: [600, 1500],
    avgTemp: '10°C – 17°C (Dingin)',
    cameraPos: [-16, 17, 18],
    cameraTarget: [-17, 8.5, -8],
    pinPosition: [-17, 14.2, -8],
    colorHex: '#F97316',
    description:
      'Bagian permukaan bumi yang menjulang tinggi seperti kerucut raksasa (>600 mdpl). Gunung berapi aktif memiliki kawah magma pijar dan mengeluarkan abu vulkanik yang menyuburkan tanah di sekitarnya, sedangkan pegunungan adalah rangkaian gunung yang menyambung memanjang.',
    floraFauna: 'Pohon Pinus, Edelweis Jawa, Cemara Gunung, Elang Jawa',
    livelihoods: 'Petani sayuran dataran tinggi, pemandu pendakian, pengelola hutan lindung',
    indonesianExamples: 'Gunung Merapi, Gunung Semeru, Gunung Bromo, Pegunungan Bukit Barisan, Pegunungan Jayawijaya',
    conservationTip: 'Lakukan reboisasi (penghijauan) di lereng gunung dan jangan menebang pohon di hutan lindung hulu.'
  },
  {
    id: 'dataran-tinggi',
    name: 'Dataran Tinggi, Bukit & Terasering',
    category: 'Daratan',
    elevationRange: '200 – 600 mdpl',
    elevationMdplNumeric: [200, 600],
    avgTemp: '17°C – 22°C (Sejuk)',
    cameraPos: [-4, 12, 19],
    cameraTarget: [-6, 4.8, -4],
    pinPosition: [-6, 6.8, -4],
    colorHex: '#10B981',
    description:
      'Wilayah daratan luas pada ketinggian 200–600 mdpl dengan udara sejuk dan segar. Lereng perbukitannya ditata menggunakan sistem terasering (sengkedan) bertingkat agar tanah miring tidak mudah longsor saat turun hujan.',
    floraFauna: 'Tanaman Teh, Kopi, Stroberi, Kentang, Wortel, Sapi Perah',
    livelihoods: 'Pemetik teh, petani kebun sayur & buah, peternak sapi perah, pemandu agrowisata',
    indonesianExamples: 'Dataran Tinggi Dieng (Jateng), Dataran Tinggi Malang (Jatim), Lembang & Puncak (Jabar)',
    conservationTip: 'Terapkan sistem terasering (sengkedan) dan tanaman penguat tanah di lereng bukit.'
  },
  {
    id: 'sungai-danau',
    name: 'Lembah, Danau Vulkanik & Aliran Sungai',
    category: 'Perairan',
    elevationRange: '50 – 550 mdpl (Hulu ke Hilir)',
    elevationMdplNumeric: [50, 550],
    avgTemp: '20°C – 26°C (Sejuk-Hangat)',
    cameraPos: [3, 11, 18],
    cameraTarget: [0, 3.0, -2],
    pinPosition: [-0.5, 4.6, -5.5],
    colorHex: '#0EA5E9',
    description:
      'Air hujan yang turun di pegunungan ditampung di cekungan Danau serta mengalir melalui Lembah dan Ngarai membentuk Sungai dari bagian Hulu (pegunungan) menuju bagian Hilir (muara di laut).',
    floraFauna: 'Ikan Air Tawar (Nila, Gurame, Arwana), Bambu Bantaran Sungai, Teratai',
    livelihoods: 'Pembudidaya ikan air tawar, petani lembah subur, transportasi sungai & pasar terapung',
    indonesianExamples: 'Danau Toba (Sumut), Sungai Kapuas (Kalbar), Sungai Musi (Sumsel), Ngarai Sianok (Sumbar)',
    conservationTip: 'Dilarang membuang sampah plastik atau limbah ke sungai serta jaga pepohonan di tepi bantaran sungai.'
  },
  {
    id: 'dataran-rendah',
    name: 'Dataran Rendah, Sawah & Pemukiman',
    category: 'Daratan',
    elevationRange: '0 – 200 mdpl',
    elevationMdplNumeric: [0, 200],
    avgTemp: '26°C – 32°C (Hangat)',
    cameraPos: [10, 9.5, 19],
    cameraTarget: [6, 1.5, 3],
    pinPosition: [6.5, 3.2, 2.5],
    colorHex: '#84CC16',
    description:
      'Hamparan tanah datar yang luas pada ketinggian 0–200 mdpl. Karena kontur tanahnya rata dan memiliki irigasi sungai yang melimpah, wilayah ini menjadi pusat pertanian padi sawah, pemukiman penduduk, perdagangan, dan industri.',
    floraFauna: 'Padi Sawah, Pohon Mangga, Pisang, Kelapa, Burung Pipit',
    livelihoods: 'Petani padi sawah, pedagang, pekerja pabrik/industri, pegawai perkantoran',
    indonesianExamples: 'Dataran Rendah Jakarta, Surabaya, Semarang, Pantai Utara Jawa, Sumatera Timur',
    conservationTip: 'Buat saluran drainase/irigasi yang bersih, sumur resapan air, dan ruang terbuka hijau kota.'
  },
  {
    id: 'pantai-laut',
    name: 'Rawa Bakau, Pantai, Teluk, Selat & Laut',
    category: 'Perairan',
    elevationRange: '0 mdpl (Permukaan Laut)',
    elevationMdplNumeric: [0, 25],
    avgTemp: '28°C – 33°C (Tropis Pesisir)',
    cameraPos: [22, 9.5, 17],
    cameraTarget: [16, 0.8, 3],
    pinPosition: [16.5, 2.8, 2.5],
    colorHex: '#0284C7',
    description:
      'Perbatasan daratan dan lautan yang mencakup Rawa Bakau (Mangrove) penahan ombak, Pantai berpasir, Teluk berair tenang tempat pelabuhan kapal, serta Selat sempit penghubung dua pulau di Laut Nusantara.',
    floraFauna: 'Pohon Bakau (Mangrove), Kelapa Pantai, Terumbu Karang, Ikan Tuna, Kepiting Bakau',
    livelihoods: 'Nelayan, petani garam, pembudidaya rumput laut, petugas pelabuhan, pemandu wisata bahari',
    indonesianExamples: 'Selat Sunda, Selat Bali, Teluk Bayur, Teluk Jakarta, Laut Jawa & Hutan Bakau Pesisir',
    conservationTip: 'Rawat hutan bakau (mangrove) di tepi pantai untuk mencegah pengikisan tanah (abrasi) oleh gelombang laut.'
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
    posName: 'Pos 1 · Gerbang Kaki Gunung',
    elevationLabel: '650 mdpl',
    question: 'Bagian permukaan bumi yang menjulang tinggi dengan ketinggian lebih dari 600 mdpl disebut...',
    options: ['A. Gunung', 'B. Bukit', 'C. Lembah', 'D. Rawa'],
    correctIndex: 0,
    explanation: 'Gunung menjulang tinggi dengan ketinggian lebih dari 600 meter di atas permukaan laut (mdpl).'
  },
  {
    id: 2,
    posName: 'Pos 2 · Punggung Perbukitan',
    elevationLabel: '850 mdpl',
    question: 'Rangkaian beberapa gunung yang saling bersambung memanjang disebut...',
    options: ['A. Dataran tinggi', 'B. Pegunungan', 'C. Ngarai', 'D. Tanjung'],
    correctIndex: 1,
    explanation: 'Pegunungan adalah rangkaian beberapa gunung yang saling menyambung memanjang seperti Pegunungan Bukit Barisan.'
  },
  {
    id: 3,
    posName: 'Pos 3 · Lereng Batu Vulkanik',
    elevationLabel: '1.100 mdpl',
    question: 'Gunung berapi yang masih aktif dapat mengeluarkan cairan panas pijar dari perut bumi yang disebut...',
    options: ['A. Gletser', 'B. Kabut', 'C. Lava / Magma', 'D. Embun'],
    correctIndex: 2,
    explanation: 'Magma adalah cairan panas pijar di dalam perut bumi, sedangkan saat keluar meleleh dari kawah gunung berapi disebut lava.'
  },
  {
    id: 4,
    posName: 'Pos 4 · Tebing Salju Abadi',
    elevationLabel: '1.450 mdpl',
    question: 'Pegunungan tertinggi di Indonesia yang puncaknya diselimuti salju abadi di Provinsi Papua adalah...',
    options: ['A. Pegunungan Jayawijaya', 'B. Pegunungan Bukit Barisan', 'C. Pegunungan Kapur Utara', 'D. Pegunungan Meratus'],
    correctIndex: 0,
    explanation: 'Pegunungan Jayawijaya di Papua memiliki puncak tertinggi di Indonesia (Puncak Jaya) yang bersalju abadi.'
  },
  {
    id: 5,
    posName: 'Pos 5 · Kebun Lereng Subur',
    elevationLabel: '1.750 mdpl',
    question: 'Tanah di sekitar gunung berapi sangat subur untuk pertanian karena mengandung...',
    options: ['A. Pasir pantai', 'B. Lumpur laut', 'C. Batu karang', 'D. Abu vulkanik'],
    correctIndex: 3,
    explanation: 'Abu vulkanik dari letusan gunung berapi kaya akan mineral hara yang menyuburkan tanah pertanian setelah melapuk.'
  },
  {
    id: 6,
    posName: 'Pos 6 · Jembatan Tebing Curam',
    elevationLabel: '2.050 mdpl',
    question: 'Jurang atau lembah yang dalam dan luas di antara tebing-tebing curam seperti Ngarai Sianok di Sumatera Barat disebut...',
    options: ['A. Delta', 'B. Ngarai (Canyon)', 'C. Teluk', 'D. Muara'],
    correctIndex: 1,
    explanation: 'Ngarai (canyon) adalah lembah dalam dan luas yang dibatasi oleh dinding tebing batu yang curam.'
  },
  {
    id: 7,
    posName: 'Pos 7 · Pelataran Awan Sejuk',
    elevationLabel: '2.400 mdpl',
    question: 'Dataran Tinggi Dieng yang terkenal dengan udara dingin dan kebun kentangnya terletak di provinsi...',
    options: ['A. Jawa Barat', 'B. Bali', 'C. Jawa Tengah', 'D. Kalimantan Timur'],
    correctIndex: 2,
    explanation: 'Dataran Tinggi Dieng terletak di Provinsi Jawa Tengah (perbatasan Kabupaten Wonosobo dan Banjarnegara).'
  },
  {
    id: 8,
    posName: 'Pos 8 · Mata Air Hulu Sungai',
    elevationLabel: '2.750 mdpl',
    question: 'Aliran sungai yang berakhir dan bertemu langsung dengan laut disebut...',
    options: ['A. Muara sungai (Hilir)', 'B. Hulu sungai', 'C. Anak sungai', 'D. Rawa-rawa'],
    correctIndex: 0,
    explanation: 'Bagian akhir sungai yang bertemu langsung dengan laut disebut muara sungai (bagian hilir).'
  },
  {
    id: 9,
    posName: 'Pos 9 · Teras Angin Samudra',
    elevationLabel: '3.100 mdpl',
    question: 'Tanaman pelindung yang ditanam di sepanjang tepi pantai untuk menahan ombak dan mencegah pengikisan tanah (abrasi) adalah...',
    options: ['A. Pohon Pinus', 'B. Tanaman Teh', 'C. Pohon Apel', 'D. Hutan Bakau (Mangrove)'],
    correctIndex: 3,
    explanation: 'Akar tunjang pohon bakau (mangrove) yang rapat mampu memecah gelombang ombak dan mencegah abrasi pantai.'
  },
  {
    id: 10,
    posName: 'Pos 10 · Puncak Kawah Kejayaan',
    elevationLabel: '3.676 mdpl',
    question: 'Contoh kenampakan buatan manusia yang dibangun dengan membendung aliran sungai untuk pembangkit listrik dan pengairan adalah...',
    options: ['A. Selat', 'B. Waduk / Bendungan', 'C. Teluk', 'D. Gunung'],
    correctIndex: 1,
    explanation: 'Waduk atau bendungan dibuat manusia untuk menampung air sungai sebagai sarana irigasi sawah dan Pembangkit Listrik Tenaga Air (PLTA).'
  }
];

// ======================================================================
// KOMPONEN 5: 10 SOAL ASESMEN EVALUASI KOMPREHENSIF (C1-C3 & C4-C6)
// ======================================================================
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    part: 'LOTS',
    cognitiveLevel: 'C1 - Mengingat',
    question: 'Batas ketinggian wilayah dataran rendah dihitung dari permukaan laut adalah...',
    options: [
      'A. 0 sampai 200 mdpl',
      'B. 200 sampai 600 mdpl',
      'C. 600 sampai 1.500 mdpl',
      'D. Lebih dari 2.000 mdpl'
    ],
    correctIndex: 0,
    explanation: 'Dataran rendah berada pada rentang ketinggian 0 sampai 200 meter di atas permukaan laut (mdpl).'
  },
  {
    id: 2,
    part: 'LOTS',
    cognitiveLevel: 'C2 - Memahami',
    question: 'Perbedaan utama antara kenampakan alam selat dan teluk adalah...',
    options: [
      'A. Selat adalah laut yang menjorok ke daratan, sedangkan teluk adalah danau di puncak gunung',
      'B. Selat adalah laut sempit penghubung dua pulau, sedangkan teluk adalah bagian laut yang menjorok ke daratan',
      'C. Selat berisi air tawar, sedangkan teluk berisi air payau',
      'D. Selat terbentuk di pegunungan, sedangkan teluk terbentuk di lembah'
    ],
    correctIndex: 1,
    explanation: 'Selat memisahkan dua pulau dan menghubungkan dua laut luas, sedangkan teluk adalah bagian laut yang menjorok masuk ke daratan.'
  },
  {
    id: 3,
    part: 'LOTS',
    cognitiveLevel: 'C3 - Menerapkan',
    question: 'Keluarga Pak Budi baru saja pindah ke daerah Dataran Tinggi Lembang yang bersuhu 17°C dan memiliki tanah miring yang subur. Jenis usaha pertanian yang paling tepat diterapkan oleh Pak Budi adalah...',
    options: [
      'A. Membuka tambak udang dan pembuatan garam dapur',
      'B. Menanam pohon kelapa dan bakau',
      'C. Membudidayakan tanaman sayuran seperti wortel, brokoli, dan kebun teh',
      'D. Menangkap ikan tuna dengan kapal layar besar'
    ],
    correctIndex: 2,
    explanation: 'Suhu sejuk 17°C dan tanah subur di dataran tinggi sangat cocok untuk budidaya sayuran subtropis (wortel, brokoli) dan perkebunan teh.'
  },
  {
    id: 4,
    part: 'LOTS',
    cognitiveLevel: 'C3 - Menerapkan',
    question: 'Untuk mencegah terjadinya tanah longsor saat membuka lahan pertanian di lereng perbukitan yang miring, tindakan tepat yang harus diterapkan petani adalah...',
    options: [
      'A. Menebang seluruh pohon besar agar sinar matahari masuk',
      'B. Membuat terasering (sengkedan) bertingkat dan menanam pohon penguat tanah',
      'C. Membiarkan tanah miring terbuka tanpa tanaman penutup',
      'D. Mengalirkan air hujan langsung menuruni lereng curam'
    ],
    correctIndex: 1,
    explanation: 'Sistem terasering (sengkedan) dan tanaman berakar kuat menahan erosi tanah serta memperlambat limpasan air hujan di lereng bukit.'
  },
  {
    id: 5,
    part: 'HOTS',
    cognitiveLevel: 'C4 - Menganalisis',
    question: 'Perhatikan data dua wilayah berikut! Wilayah X memiliki ciri: suhu udara rata-rata 31°C, tanah datar luas di ketinggian 25 mdpl, dan banyak jaringan jalan raya. Wilayah Y memiliki ciri: suhu udara 18°C, jalanan berkelok naik-turun di ketinggian 850 mdpl, dan pemandangan perbukitan hijau. Berdasarkan analisis data tersebut, mengapa pabrik industri dan pusat perdagangan lebih banyak dibangun di Wilayah X dibandingkan Wilayah Y?',
    options: [
      'A. Karena Wilayah X sering mengalami hujan salju',
      'B. Karena kontur tanah Wilayah X yang datar memudahkan pembangunan gedung serta transportasi distribusi barang',
      'C. Karena Wilayah Y tidak memiliki sumber air bersih sama sekali',
      'D. Karena Wilayah X terletak di puncak gunung berapi aktif'
    ],
    correctIndex: 1,
    explanation: 'Wilayah X adalah dataran rendah (25 mdpl). Kontur tanah yang rata memudahkan konstruksi bangunan besar, jalan raya, rel kereta, dan distribusi logistik.'
  },
  {
    id: 6,
    part: 'HOTS',
    cognitiveLevel: 'C4 - Menganalisis',
    question: 'Di sebuah kota yang berada di dataran rendah dekat muara sungai, setiap musim hujan selalu terjadi banjir besar meskipun curah hujan di kota tersebut sedang. Setelah diteliti, hutan di kawasan pegunungan (hulu sungai) banyak yang ditebang menjadi lahan gundul. Hubungan sebab-akibat yang paling tepat dari peristiwa tersebut adalah...',
    options: [
      'A. Hutan gundul di hulu membuat air hujan tidak terserap akar pohon sehingga langsung mengalir deras membawa lumpur ke dataran rendah',
      'B. Air laut naik ke puncak gunung karena pohon ditebang',
      'C. Penduduk di pegunungan memompa air sungai ke dataran rendah',
      'D. Dataran rendah memiliki suhu yang lebih dingin daripada pegunungan'
    ],
    correctIndex: 0,
    explanation: 'Hilangnya tutupan hutan di daerah hulu menghilangkan daya serap tanah, menyebabkan air hujan langsung melimpas deras disertai lumpur erosi ke hilir.'
  },
  {
    id: 7,
    part: 'HOTS',
    cognitiveLevel: 'C5 - Mengevaluasi',
    question: 'Sebuah perusahaan wisata ingin membabat habis hutan bakau (mangrove) di tepi pantai untuk dijadikan area parkir beton agar muat banyak bus wisata. Jika kamu diminta mengevaluasi rencana tersebut, penilaian manakah yang paling tepat?',
    options: [
      'A. Sangat setuju, karena beton parkir lebih kuat menahan ombak laut daripada pohon bakau',
      'B. Tidak tepat, karena hilangnya hutan bakau akan merusak habitat biota laut dan memperparah pengikisan pantai (abrasi) oleh gelombang laut',
      'C. Sangat tepat, karena pohon bakau membuat air laut menjadi kotor dan keruh',
      'D. Tidak masalah, karena pohon bakau dapat digantikan dengan tanaman teh di tepi pantai'
    ],
    correctIndex: 1,
    explanation: 'Membabat hutan bakau merusak tempat berkembang biak ikan/kepiting serta menghilangkan pelindung alami pantai dari hantaman gelombang (abrasi).'
  },
  {
    id: 8,
    part: 'HOTS',
    cognitiveLevel: 'C5 - Mengevaluasi',
    question: 'Desa Sukamaju berada di kaki gunung berapi aktif. Sebagian warga ingin tetap menambang pasir secara besar-besaran dengan alat berat di jalur aliran lahar sungai tanpa aturan karena menghasilkan uang cepat. Evaluasilah dampak jangka panjang dari tindakan warga tersebut!',
    options: [
      'A. Sungai menjadi semakin indah dan aman dari bencana',
      'B. Tanggul alami sungai rusak dan tebing sungai rawan runtuh sehingga membahayakan desa saat terjadi banjir lahar dingin',
      'C. Gunung berapi akan berhenti meletus selamanya karena pasirnya habis diambil',
      'D. Air sungai berubah menjadi air asin seperti air laut'
    ],
    correctIndex: 1,
    explanation: 'Penambangan pasir berlebihan dengan alat berat merusak tanggul dan tebing sungai, sehingga lahar dingin dapat meluap menerjang pemukiman warga.'
  },
  {
    id: 9,
    part: 'HOTS',
    cognitiveLevel: 'C6 - Mencipta/Merancang',
    question: 'Bayangkan kamu diminta merancang sebuah "Desa Wisata Ramah Lingkungan" di kawasan lembah dan lereng bukit. Kombinasi rancangan tata ruang manakah yang paling aman dan berkelanjutan bagi lingkungan?',
    options: [
      'A. Puncak bukit dijadikan pabrik semen, lereng curam dijadikan perumahan padat, dan sungai dijadikan tempat pembuangan limbah',
      'B. Puncak bukit dipertahankan sebagai hutan lindung resapan air, lereng bukit dibuat kebun agroforestri dengan sistem terasering, dan pemukiman warga dibangun di area lembah yang landai serta aman dari tebing curam',
      'C. Seluruh pohon di bukit ditebang habis lalu dilapisi aspal agar tanah tidak becek saat hujan',
      'D. Membangun gedung bertingkat 20 lantai tepat di tepi jurang ngarai yang rapuh'
    ],
    correctIndex: 1,
    explanation: 'Tata ruang berkelanjutan menempatkan hutan lindung di puncak (resapan air), terasering di lereng (pencegah longsor), dan pemukiman di lembah landai yang aman.'
  },
  {
    id: 10,
    part: 'HOTS',
    cognitiveLevel: 'C6 - Mencipta/Merancang',
    question: 'Sungai yang mengalir melewati daerah pemukiman di dataran rendah mulai tercemar sampah plastik dan mengalami pendangkalan. Rancanglah program solusi terpadu yang paling efektif untuk memulihkan bentang alam sungai tersebut!',
    options: [
      'A. Menutup seluruh aliran sungai dengan beton agar sampah tidak terlihat',
      'B. Memindahkan seluruh warga desa ke puncak gunung berapi',
      'C. Membangun saringan sampah terpadu, melakukan pengerukan endapan lumpur, menanam pohon di bantaran sungai, serta menjalankan bank sampah warga',
      'D. Membuang sampah plastik hanya pada malam hari saat air sungai sedang pasang'
    ],
    correctIndex: 2,
    explanation: 'Solusi terpadu menggabungkan penanganan fisik (saringan sampah & pengerukan sedimen), ekologis (vegetasi bantaran), dan sosial (bank sampah warga).'
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
