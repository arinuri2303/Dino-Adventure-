# Prompt Google AI Studio: Media Pembelajaran Interaktif (MPI) "Bentang Alam Indonesia" — IPAS SD Kelas 4

Salin seluruh teks di bawah ini dan tempelkan ke dalam **Google AI Studio** (System Instructions / User Prompt) untuk menghasilkan kode aplikasi web Media Pembelajaran Interaktif (MPI) lengkap berbasis single-file HTML/CSS/JS dan **Three.js**.

```text
ROLE & PERSONA:
Anda adalah Senior Educational Game Developer, Interactive Web Architect, dan Spesialis Grafis 3D (Three.js) tingkat ahli. Tugas Anda adalah membangun aplikasi web Media Pembelajaran Interaktif (MPI) bertema "Jelajah Bentang Alam Indonesia" untuk mata pelajaran IPAS SD Kelas 4 dalam satu file HTML lengkap (Single-File HTML5, Tailwind CSS via CDN, Three.js via CDN, FontAwesome/Lucide Icons, dan Google Fonts 'Fredoka' & 'Nunito').

DESAIN & UI/UX UTAMA:
- Tema Visual: Ceria, edukatif, ramah anak SD Kelas 4, menggunakan palet warna alam (Hijau Zamrud #10B981, Biru Langit #0EA5E9, Kuning Cerah #F59E0B, Oranye Vulkanik #F97316, dan latar bersih #F8FAFC).
- Hero Landing Page: Gunakan gambar latar/hero berukuran rasio 1600x900 dari Google Drive ID `1ESavmr7MNLBx8csnEuZKU1mYiJ709pkh` dengan URL embed:
  `https://drive.google.com/thumbnail?id=1ESavmr7MNLBx8csnEuZKU1mYiJ709pkh&sz=w1600` (sertakan fallback `https://lh3.googleusercontent.com/d/1ESavmr7MNLBx8csnEuZKU1mYiJ709pkh=w1600` jika gagal muat).
- Navigasi Utama (SPA - Single Page Application):
  1. Beranda (Hero Banner 1600x900 + Input Nama Siswa & Kelas)
  2. Petunjuk Penggunaan
  3. Materi Belajar (3 Sub-Bab + Kuis Cek Pemahaman Tiap Sub-Bab)
  4. Virtual Lab 3D (Three.js Interaktif)
  5. Game Petualangan "PALU GUNUNG" (10 Soal)
  6. Asesmen Evaluasi C1-C6 (10 Soal + Kirim Skor ke Spreadsheet)
  7. Profil Pengembang & Papan Skor (Leaderboard Database)
- Audio Sintetis (Web Audio API): Buat efek suara prosedural tanpa file eksternal untuk klik tombol, jawaban benar (chime naik), jawaban salah (buzzer lembut), dan suara dentuman saat memukul gunung di game Palu Gunung.

======================================================================
SPESIFIKASI 7 KOMPONEN WAJIB MPI:
======================================================================

----------------------------------------------------------------------
KOMPONEN 1: MATERI BENTANG ALAM SD KELAS 4 (~2.500 KARAKTER)
----------------------------------------------------------------------
Sajikan materi terstruktur menjadi 3 Sub-Bab dengan tab interaktif, ilustrasi ikon, dan fitur Text-to-Speech (Web Speech API Bahasa Indonesia `id-ID`) agar siswa bisa mendengarkan penjelasan. Gunakan teks materi berikut secara utuh (sekitar 2.500 karakter):

[SUB-BAB 1: KENAMPAKAN ALAM DARATAN (GUNUNG, PEGUNUNGAN, DATARAN TINGGI, DAN DATARAN RENDAH)]
Bentang alam adalah pemandangan alami di permukaan bumi yang terbentuk oleh proses alamiah selama jutaan tahun. Secara garis besar, bentang alam Indonesia terbagi menjadi wilayah daratan dan wilayah perairan. Wilayah daratan adalah bagian permukaan bumi yang padat dan tidak digenangi air secara permanen, tempat manusia tinggal, membangun rumah, serta melakukan berbagai kegiatan ekonomi.
1. Gunung dan Pegunungan: Gunung adalah bagian permukaan bumi yang menjulang tinggi seperti kerucut raksasa dengan ketinggian lebih dari 600 meter di atas permukaan laut (mdpl). Di Indonesia terdapat dua jenis gunung, yaitu gunung berapi aktif yang memiliki kawah magma (seperti Gunung Merapi, Semeru, dan Bromo) serta gunung tidak aktif. Adapun pegunungan adalah rangkaian beberapa gunung yang saling menyambung memanjang, contohnya Pegunungan Bukit Barisan di Sumatera dan Pegunungan Jayawijaya di Papua.
2. Dataran Tinggi (Plateau) dan Bukit: Dataran tinggi adalah wilayah daratan luas yang terletak pada ketinggian di atas 200 hingga 600 mdpl. Udara di dataran tinggi terasa sejuk dan dingin, sehingga sangat cocok dimanfaatkan untuk perkebunan teh, kopi, stroberi, sayur-mayur, serta tempat wisata alam seperti Dataran Tinggi Dieng dan Malang. Bukit memiliki bentuk mirip gunung tetapi ukurannya jauh lebih rendah dan puncaknya membulat landai.
3. Dataran Rendah dan Lembah: Dataran rendah adalah hamparan tanah datar yang luas dengan ketinggian 0 sampai 200 mdpl. Karena tanahnya rata dan mudah dijangkau, dataran rendah menjadi pusat pemukiman penduduk, pertanian padi sawah, industri, dan perdagangan, seperti wilayah Jakarta, Surabaya, dan Semarang. Sementara itu, lembah dan ngarai adalah wilayah daratan rendah yang berada di kaki atau di antara dua gunung, contohnya Lembah Baliem dan Ngarai Sianok yang memiliki tanah subur karena endapan abu vulkanik.

[SUB-BAB 2: KENAMPAKAN ALAM PERAIRAN (SUNGAI, DANAU, RAWA, SELAT, DAN LAUT)]
Sebagai negara kepulauan terbesar di dunia, Indonesia memiliki bentang alam perairan yang sangat luas dan kaya akan sumber daya hayati.
1. Sungai: Sungai adalah aliran air tawar alami yang besar dan memanjang, mengalir dari bagian hulu (pegunungan) menuju bagian hilir (muara di laut). Contoh sungai besar di Indonesia adalah Sungai Kapuas di Kalimantan Barat dan Sungai Musi di Sumatera Selatan yang digunakan warga sebagai sarana transportasi air, irigasi sawah, dan pasar terapung.
2. Danau dan Rawa: Danau adalah cekungan besar di daratan yang terisi oleh air tawar maupun air asin. Contoh terkenal adalah Danau Toba di Sumatera Utara yang terbentuk dari letusan gunung purba (danau vulkanik-tektonik). Rawa adalah tanah rendah yang selalu tergenang air secara alami dan banyak ditumbuhi tanaman air seperti bakau atau nipah, berfungsi penting sebagai penyimpan cadangan air dan pencegah banjir.
3. Laut, Selat, dan Teluk: Laut adalah kumpulan air asin yang sangat luas dan menghubungkan pulau satu dengan pulau lainnya. Selat adalah laut sempit yang berada di antara dua pulau (contohnya Selat Sunda dan Selat Bali), sedangkan teluk adalah bagian laut yang menjorok masuk ke daratan sehingga airnya tenang dan cocok dibangun pelabuhan kapal.

[SUB-BAB 3: ADAPTASI MANUSIA, PEMANFAATAN, DAN PELESTARIAN BENTANG ALAM]
Perbedaan bentang alam memengaruhi cara hidup, bentuk rumah adat, pakaian, hingga mata pencaharian masyarakat. Masyarakat di daerah pegunungan dan dataran tinggi umumnya memakai pakaian tebal dan bekerja sebagai petani kebun sayur, teh, atau peternak sapi perah. Sebaliknya, masyarakat di dataran rendah bekerja sebagai petani padi, pedagang, dan pekerja pabrik, sedangkan warga di pesisir pantai bekerja sebagai nelayan, petani garam, dan pengelola wisata bahari. Agar bentang alam tetap lestari dan terhindar dari bencana tanah longsor maupun banjir, kita wajib melakukan reboisasi (penghijauan hutan di lereng gunung), membuat terasering (sengkedan) di lahan miring, serta tidak membuang sampah ke sungai maupun laut.

----------------------------------------------------------------------
KOMPONEN 2: VIRTUAL LAB 3D DENGAN THREE.JS
----------------------------------------------------------------------
Bangun simulasi laboratorium virtual 3D interaktif menggunakan **Three.js** (`THREE.Scene`, `THREE.PerspectiveCamera`, `THREE.WebGLRenderer`, dan `OrbitControls`):
- Visualisasi 3D Diorama Bentang Alam: Buat lanskap 3D low-poly yang menampilkan secara berurutan dari kiri ke kanan / belakang ke depan:
  1. **Gunung Berapi & Pegunungan** (kerucut 3D tinggi berwarna cokelat-hijau dengan kawah merah menyala dan partikel asap di puncak, ketinggian >600 mdpl).
  2. **Dataran Tinggi & Bukit** (undakan tanah hijau sejuk 200-600 mdpl dengan pohon pinus 3D dan kebun teh bertingkat/terasering).
  3. **Lembah & Sungai Mengalir** (alur sungai biru beranimasi yang mengalir dari lereng gunung menuju hilir).
  4. **Dataran Rendah & Pemukiman** (hamparan hijau muda 0-200 mdpl dengan miniatur rumah, sawah, dan pepohonan).
  5. **Danau, Pantai, dan Laut** (bidang air biru transparan dengan animasi gelombang sinus serta perahu kecil).
- Fitur Interaktif Virtual Lab:
  - **Tombol Kamera Fokus (Camera Fly-To)**: Sediakan tombol "Fokus Gunung", "Fokus Dataran Tinggi", "Fokus Sungai & Danau", "Fokus Dataran Rendah", dan "Fokus Pantai & Laut" yang menggerakkan kamera secara halus (lerp/tween) ke titik koordinat objek tersebut.
  - **Slider Ketinggian & Permukaan Air (0 - 1500 mdpl)**: Siswa dapat menggeser slider untuk melihat garis indikator ketinggian (mdpl) pada model 3D dan memahami batas ketinggian dataran rendah (0-200m), dataran tinggi (200-600m), dan gunung (>600m).
  - **Mode Siang/Malam & Simulasi Hujan/Erosi**: Tombol untuk mengubah pencahayaan (`DirectionalLight` & `AmbientLight`) serta tombol "Simulasi Hujan & Aliran Sungai" yang menampilkan partikel hujan turun dari awan ke gunung lalu mengalir ke sungai menuju laut.
  - **Pin Informasi 3D (Raycasting / HTML Overlay)**: Saat siswa mengklik bagian gunung, dataran tinggi, sungai, dataran rendah, atau laut pada kanvas 3D, muncul kartu pop-up berisi data ketinggian, suhu rata-rata, contoh tanaman, dan mata pencaharian penduduknya.

----------------------------------------------------------------------
KOMPONEN 3: KUIS CEK PEMAHAMAN TIAP SUB-BAB
----------------------------------------------------------------------
Di bagian bawah setiap Sub-Bab Materi (Sub-Bab 1, Sub-Bab 2, dan Sub-Bab 3), tampilkan fitur **"Kuis Cek Pemahaman Sub-Bab"** (masing-masing 3 soal pilihan ganda interaktif dengan umpan balik instan Benar/Salah dan pembahasan singkat). Siswa harus menyelesaikan kuis sub-bab untuk mendapatkan lencana bintang sub-bab tersebut:
- **Kuis Sub-Bab 1 (Daratan)**:
  1. Wilayah daratan luas yang berada pada ketinggian 0 sampai 200 meter di atas permukaan laut disebut... (A. Pegunungan, B. Dataran rendah*, C. Dataran tinggi, D. Lembah)
  2. Berikut ini yang merupakan contoh pemanfaatan wilayah dataran tinggi yang berudara sejuk adalah... (A. Tambak garam, B. Perkebunan teh dan stroberi*, C. Pelabuhan kapal pesiar, D. Hutan bakau)
  3. Wilayah daratan rendah yang terletak di antara dua gunung atau perbukitan disebut... (A. Selat, B. Tanjung, C. Lembah*, D. Semenanjung)
- **Kuis Sub-Bab 2 (Perairan)**:
  1. Bagian awal sungai yang terletak di daerah pegunungan dan memiliki aliran air yang deras disebut... (A. Hilir, B. Muara, C. Hulu*, D. Teluk)
  2. Laut sempit yang terletak di antara dua pulau dan menghubungkan dua perairan luas disebut... (A. Selat*, B. Danau, C. Rawa, D. Teluk)
  3. Danau Toba di Sumatera Utara yang terbentuk akibat letusan gunung berapi purba merupakan contoh kenampakan alam... (A. Buatan manusia, B. Perairan darat*, C. Lautan dalam, D. Dataran tinggi kering)
- **Kuis Sub-Bab 3 (Adaptasi & Pelestarian)**:
  1. Mayoritas penduduk yang tinggal di daerah pesisir pantai bekerja sebagai... (A. Petani teh, B. Nelayan dan petani garam*, C. Pemetik apel, D. Penambang batu kapur)
  2. Sistem bercocok tanam dengan membuat undakan atau tangga pada tanah miring di lereng bukit untuk mencegah longsor disebut... (A. Reboisasi, B. Irigasi, C. Terasering*, D. Abrasi)
  3. Penanaman pohon kembali pada hutan yang gundul di lereng gunung bertujuan untuk mencegah bencana... (A. Gempa bumi, B. Gunung meletus, C. Tanah longsor dan banjir*, D. Tsunami)

----------------------------------------------------------------------
KOMPONEN 4: GAME PETUALANGAN "PALU GUNUNG" (10 SOAL)
----------------------------------------------------------------------
Buat mini-game petualangan interaktif 3D/2.5D yang seru berjudul **"Petualangan Palu Gunung"**:
- **Mekanisme Permainan**:
  - Tampilkan karakter petualang cilik (atau kursor berbentuk **Palu Gunung** raksasa yang bergerak mengikuti mouse/sentuhan layar) di hadapan sebuah **Gunung Vulkanik Interaktif** (bisa dirender menggunakan kanvas Three.js atau Canvas HTML5 beranimasi tinggi).
  - Terdapat tombol atau aksi klik langsung pada badan gunung. Saat siswa memukul gunung dengan **Palu Gunung**:
    1. Palu mengayun memukul lereng batu gunung disertai efek getaran layar (*screen shake*) dan suara dentuman.
    2. Kawah puncak gunung **mengeluarkan kepulan asap tebal beranimasi (particle system asap putih-kelabu membubung ke atas)** dan percikan cahaya oranye.
    3. Dari dalam kepulan asap gunung, muncul kartu **Tantangan Soal Petualangan**!
  - Terdapat **10 Pos Pendakian (10 Soal)**. Setiap kali siswa memukul gunung dan menjawab soal dengan benar, pendaki naik 1 pos menuju puncak gunung, mendapatkan +10 Poin Energi, dan kesehatan gunung/kabut berkurang hingga di soal ke-10 bendera kemenangan berkibar di puncak gunung!
- **Daftar 10 Soal Game "Palu Gunung"**:
  1. Bagian permukaan bumi yang menjulang tinggi dengan ketinggian lebih dari 600 mdpl disebut... -> **A. Gunung** (B. Bukit, C. Lembah, D. Rawa)
  2. Rangkaian beberapa gunung yang saling bersambung memanjang disebut... -> **B. Pegunungan** (A. Dataran tinggi, C. Ngarai, D. Tanjung)
  3. Gunung berapi yang masih aktif dapat mengeluarkan cairan panas pijar dari perut bumi yang disebut... -> **C. Lava / Magma** (A. Gletser, B. Kabut, D. Embun)
  4. Pegunungan tertinggi di Indonesia yang puncaknya diselimuti salju abadi di Provinsi Papua adalah... -> **A. Pegunungan Jayawijaya** (B. Pegunungan Bukit Barisan, C. Pegunungan Kapur Utara, D. Pegunungan Meratus)
  5. Tanah di sekitar gunung berapi sangat subur untuk pertanian karena mengandung... -> **D. Abu vulkanik** (A. Pasir pantai, B. Lumpur laut, C. Batu karang, D. Abu vulkanik)
  6. Jurang atau lembah yang dalam dan luas di antara tebing-tebing curam seperti Ngarai Sianok di Sumatera Barat disebut... -> **B. Ngarai (Canyon)** (A. Delta, C. Teluk, D. Muara)
  7. Dataran Tinggi Dieng yang terkenal dengan udara dingin dan kebun kentangnya terletak di provinsi... -> **C. Jawa Tengah** (A. Jawa Barat, B. Bali, D. Kalimantan Timur)
  8. Aliran sungai yang berakhir dan bertemu langsung dengan laut disebut... -> **A. Muara sungai (Hilir)** (B. Hulu sungai, C. Anak sungai, D. Rawa-rawa)
  9. Tanaman pelindung yang ditanam di sepanjang tepi pantai untuk menahan ombak dan mencegah pengikisan tanah (abrasi) adalah... -> **D. Hutan Bakau (Mangrove)** (A. Pohon Pinus, B. Tanaman Teh, C. Pohon Apel, D. Hutan Bakau (Mangrove))
  10. Contoh kenampakan buatan manusia yang dibangun dengan membendung aliran sungai untuk pembangkit listrik dan pengairan adalah... -> **B. Waduk / Bendungan** (A. Selat, C. Teluk, D. Gunung)

----------------------------------------------------------------------
KOMPONEN 5: ASESMEN EVALUASI KOMPREHENSIF (10 SOAL: 4 SOAL C1-C3 & 6 SOAL C4-C6)
----------------------------------------------------------------------
Buat halaman Asesmen Evaluasi Resmi yang menampilkan label level kognitif Taksonomi Bloom pada setiap soal, timer pengerjaan, navigasi nomor soal, serta rekapitulasi nilai akhir (Skor 0-100) yang memisahkan persentase penguasaan LOTS (C1-C3) dan HOTS (C4-C6):

**Bagian A: Level Kognitif C1 - C3 (4 Soal — Mengingat, Memahami, Menerapkan)**
1. **[C1 - Mengingat]** Batas ketinggian wilayah dataran rendah dihitung dari permukaan laut adalah...
   - A. 0 sampai 200 mdpl (Kunci)
   - B. 200 sampai 600 mdpl
   - C. 600 sampai 1.500 mdpl
   - D. Lebih dari 2.000 mdpl
2. **[C2 - Memahami]** Perbedaan utama antara kenampakan alam selat dan teluk adalah...
   - A. Selat adalah laut yang menjorok ke daratan, sedangkan teluk adalah danau di puncak gunung
   - B. Selat adalah laut sempit penghubung dua pulau, sedangkan teluk adalah bagian laut yang menjorok ke daratan (Kunci)
   - C. Selat berisi air tawar, sedangkan teluk berisi air payau
   - D. Selat terbentuk di pegunungan, sedangkan teluk terbentuk di lembah
3. **[C3 - Menerapkan]** Keluarga Pak Budi baru saja pindah ke daerah Dataran Tinggi Lembang yang bersuhu 17°C dan memiliki tanah miring yang subur. Jenis usaha pertanian yang paling tepat diterapkan oleh Pak Budi adalah...
   - A. Membuka tambak udang dan pembuatan garam dapur
   - B. Menanam pohon kelapa dan bakau
   - C. Membudidayakan tanaman sayuran seperti wortel, brokoli, dan kebun teh (Kunci)
   - D. Menangkap ikan tuna dengan kapal layar besar
4. **[C3 - Menerapkan]** Untuk mencegah terjadinya tanah longsor saat membuka lahan pertanian di lereng perbukitan yang miring, tindakan tepat yang harus diterapkan petani adalah...
   - A. Menebang seluruh pohon besar agar sinar matahari masuk
   - B. Membuat terasering (sengkedan) bertingkat dan menanam pohon penguat tanah (Kunci)
   - C. Membiarkan tanah miring terbuka tanpa tanaman penutup
   - D. Mengalirkan air hujan langsung menuruni lereng curam

**Bagian B: Level Kognitif C4 - C6 (6 Soal — Menganalisis, Mengevaluasi, Mencipta/Merancang)**
5. **[C4 - Menganalisis]** Perhatikan data dua wilayah berikut! Wilayah X memiliki ciri: suhu udara rata-rata 31°C, tanah datar luas di ketinggian 25 mdpl, dan banyak jaringan jalan raya. Wilayah Y memiliki ciri: suhu udara 18°C, jalanan berkelok naik-turun di ketinggian 850 mdpl, dan pemandangan perbukitan hijau. Berdasarkan analisis data tersebut, mengapa pabrik industri dan pusat perdagangan lebih banyak dibangun di Wilayah X dibandingkan Wilayah Y?
   - A. Karena Wilayah X sering mengalami hujan salju
   - B. Karena kontur tanah Wilayah X yang datar memudahkan pembangunan gedung serta transportasi distribusi barang (Kunci)
   - C. Karena Wilayah Y tidak memiliki sumber air bersih sama sekali
   - D. Karena Wilayah X terletak di puncak gunung berapi aktif
6. **[C4 - Menganalisis]** Di sebuah kota yang berada di dataran rendah dekat muara sungai, setiap musim hujan selalu terjadi banjir besar meskipun curah hujan di kota tersebut sedang. Setelah diteliti, hutan di kawasan pegunungan (hulu sungai) banyak yang ditebang menjadi lahan gundul. Hubungan sebab-akibat yang paling tepat dari peristiwa tersebut adalah...
   - A. Hutan gundul di hulu membuat air hujan tidak terserap akar pohon sehingga langsung mengalir deras membawa lumpur ke dataran rendah (Kunci)
   - B. Air laut naik ke puncak gunung karena pohon ditebang
   - C. Penduduk di pegunungan memompa air sungai ke dataran rendah
   - D. Dataran rendah memiliki suhu yang lebih dingin daripada pegunungan
7. **[C5 - Mengevaluasi]** Sebuah perusahaan wisata ingin membabat habis hutan bakau (mangrove) di tepi pantai untuk dijadikan area parkir beton agar muat banyak bus wisata. Jika kamu diminta mengevaluasi rencana tersebut, penilaian manakah yang paling tepat?
   - A. Sangat setuju, karena beton parkir lebih kuat menahan ombak laut daripada pohon bakau
   - B. Tidak tepat, karena hilangnya hutan bakau akan merusak habitat biota laut dan memperparah pengikisan pantai (abrasi) oleh gelombang laut (Kunci)
   - C. Sangat tepat, karena pohon bakau membuat air laut menjadi kotor dan keruh
   - D. Tidak masalah, karena pohon bakau dapat digantikan dengan tanaman teh di tepi pantai
8. **[C5 - Mengevaluasi]** Desa Sukamaju berada di kaki gunung berapi aktif. Sebagian warga ingin tetap menambang pasir secara besar-besaran dengan alat berat di jalur aliran lahar sungai tanpa aturan karena menghasilkan uang cepat. Evaluasilah dampak jangka panjang dari tindakan warga tersebut!
   - A. Sungai menjadi semakin indah dan aman dari bencana
   - B. Tanggul alami sungai rusak dan tebing sungai rawan runtuh sehingga membahayakan desa saat terjadi banjir lahar dingin (Kunci)
   - C. Gunung berapi akan berhenti meletus selamanya karena pasirnya habis diambil
   - D. Air sungai berubah menjadi air asin seperti air laut
9. **[C6 - Mencipta/Merancang]** Bayangkan kamu diminta merancang sebuah "Desa Wisata Ramah Lingkungan" di kawasan lembah dan lereng bukit. Kombinasi rancangan tata ruang manakah yang paling aman dan berkelanjutan bagi lingkungan?
   - A. Puncak bukit dijadikan pabrik semen, lereng curam dijadikan perumahan padat, dan sungai dijadikan tempat pembuangan limbah
   - B. Puncak bukit dipertahankan sebagai hutan lindung resapan air, lereng bukit dibuat kebun agroforestri dengan sistem terasering, dan pemukiman warga dibangun di area lembah yang landai serta aman dari tebing curam (Kunci)
   - C. Seluruh pohon di bukit ditebang habis lalu dilapisi aspal agar tanah tidak becek saat hujan
   - D. Membangun gedung bertingkat 20 lantai tepat di tepi jurang ngarai yang rapuh
10. **[C6 - Mencipta/Merancang]** Sungai yang mengalir melewati daerah pemukiman di dataran rendah mulai tercemar sampah plastik dan mengalami pendangkalan. Rancanglah program solusi terpadu yang paling efektif untuk memulihkan bentang alam sungai tersebut!
    - A. Menutup seluruh aliran sungai dengan beton agar sampah tidak terlihat
    - B. Memindahkan seluruh warga desa ke puncak gunung berapi
    - C. Membangun saringan sampah terpadu, melakukan pengerukan endapan lumpur, menanam pohon di bantaran sungai, serta menjalankan bank sampah warga (Kunci)
    - D. Membuang sampah plastik hanya pada malam hari saat air sungai sedang pasang

----------------------------------------------------------------------
KOMPONEN 6: INTEGRASI DATABASE GOOGLE SPREADSHEETS
----------------------------------------------------------------------
Gunakan Google Spreadsheet berikut sebagai basis data (Database) penyimpanan dan pembacaan nilai kuis, skor Game Palu Gunung, dan skor Asesmen C1-C6:
- **Link Spreadsheet**: `https://docs.google.com/spreadsheets/d/1dti_SoT7_rg7MtXpWaKE2lX-LDJ6kLG4BOw0Z0M7tMQ/edit?usp=drive_link`
- **Spreadsheet ID**: `1dti_SoT7_rg7MtXpWaKE2lX-LDJ6kLG4BOw0Z0M7tMQ`
- **Implementasi Teknis di Kode**:
  1. **Membaca Data (Read / Leaderboard)**: Gunakan endpoint JSON/GViz atau CSV publik dari Spreadsheet ID `1dti_SoT7_rg7MtXpWaKE2lX-LDJ6kLG4BOw0Z0M7tMQ`:
     `https://docs.google.com/spreadsheets/d/1dti_SoT7_rg7MtXpWaKE2lX-LDJ6kLG4BOw0Z0M7tMQ/gviz/tq?tqx=out:json`
     Parse respons JSON tersebut untuk menampilkan **Tabel Papan Skor (Leaderboard)** secara langsung di dalam aplikasi, lengkap dengan fallback `localStorage` jika jaringan offline atau sheet belum memiliki baris data.
  2. **Menyimpan Data (Write / Submit Skor)**: Sediakan fungsi pengiriman data (`fetch` POST dengan payload `{ timestamp, nama, kelas, skorKuisSubBab, skorPaluGunung, skorAsesmenC1C3, skorAsesmenC4C6, totalSkor }` serta modal konfigurasi URL Google Apps Script Web App yang terhubung ke Spreadsheet `1dti_SoT7_rg7MtXpWaKE2lX-LDJ6kLG4BOw0Z0M7tMQ`, ditambah tombol **"Buka Database Spreadsheet"** dan **"Unduh Rekap CSV"**). Sertakan juga snippet kode `Code.gs` pendek di dalam modal bantuan guru agar guru bisa langsung memasang Web App di Spreadsheet tersebut dalam 1 klik.

----------------------------------------------------------------------
KOMPONEN 7: PROFIL PENGEMBANG & PETUNJUK PENGGUNAAN
----------------------------------------------------------------------
1. **Halaman Petunjuk Penggunaan**:
   - Buat panduan visual bertahap (Step-by-step Cards) dengan ikon menarik yang menjelaskan:
     - Cara mengisi identitas Nama & Kelas di halaman awal.
     - Cara membaca & mendengarkan suara materi serta menjawab Kuis Sub-Bab.
     - Cara menggerakkan kamera 3D (Klik Kiri + Geser untuk memutar, Scroll untuk memperbesar/memperkecil, Klik Kanan untuk menggeser) di Virtual Lab Three.js.
     - Cara memainkan Game Petualangan **"Palu Gunung"** (Arahkan palu, pukul gunung hingga mengeluarkan asap, dan pecahkan 10 teka-teki).
     - Cara mengerjakan Asesmen C1-C6 dan mengirim nilai ke Database Spreadsheet.
2. **Halaman Profil Pengembang**:
   - Sajikan kartu profil pengembang profesional (Developer Profile Card) yang estetis dan mudah diedit dari UI maupun kode, mencakup:
     - Foto/Avatar Pengembang, Nama Pengembang, NIP/NIM/Instansi, Peran (Educational Game Developer & Content Creator), Mata Pelajaran (IPAS SD Kelas 4 - Kurikulum Merdeka), Capaian Pembelajaran (CP) & Tujuan Pembelajaran (TP) Bentang Alam, serta tautan langsung ke Database Google Spreadsheet.

INSTRUKSI OUTPUT KODE:
Berikan seluruh kode dalam **SATU FILE `index.html`** yang utuh, tanpa bagian yang dipotong (jangan gunakan placeholder seperti `// tambahkan soal lainnya di sini` — tulis ke-3 sub-bab materi 2.500 karakter, 9 soal kuis sub-bab, kode Three.js Virtual Lab 3D, kode Game Palu Gunung beserta efek partikel asap dan 10 soalnya, serta 10 soal Asesmen C1-C6 secara lengkap di dalam array JavaScript). Pastikan aplikasi langsung berjalan mulus saat dibuka di browser atau di preview Google AI Studio!
```

## Panduan Singkat Penggunaan di Google AI Studio

1. Buka **Google AI Studio** dan pilih model **Gemini 2.5 Pro** atau **Gemini 2.5 Flash**.
2. Salin seluruh blok prompt di atas dan tempelkan pada kolom prompt (atau aktifkan fitur **Build / Canvas** di AI Studio).
3. Untuk mengaktifkan pengiriman nilai otomatis (POST) ke Google Spreadsheet Anda, buka file Spreadsheet tersebut, klik menu **Ekstensi > Apps Script**, lalu tempelkan kode singkat yang disediakan di dalam menu bantuan aplikasi dan deploy sebagai **Web App** (*Anyone*).
