import { Question, Exam, PackageItem, IntegrationConfig, LandingPageContent } from '../types';

// ============================================================================
// BANK SOAL MASTER (DAPAT DIIMPORT/DISALIN KE TIAP PAKET)
// ============================================================================
export const INITIAL_QUESTIONS: Question[] = [
  // 1. Pilihan Ganda (SMA - Penalaran Matematika / Kuantitatif)
  {
    id: 'q-sma-01',
    grade: 'SMA',
    subject: 'Penalaran Matematika (TKA SMA)',
    type: 'pilihan_ganda',
    stimulusTitle: 'Stimulus 1: Analisis Efisiensi Produksi Panel Surya',
    stimulusText: `Sebuah instalasi pembangkit listrik tenaga surya (PLTS) mikro di sebuah sekolah memiliki kapasitas daya puncak yang membesar secara proporsional terhadap luas area sel fotovoltaik. 
Data menunjukkan pada bulan pertama PLTS menghasilkan energi rata-rata 320 kWh. Karena penambahan 2 unit panel surya berefisiensi tinggi tiap bulan, produksi energi meningkat mengikuti deret aritmetika dengan beda tetap 40 kWh setiap bulannya.`,
    stimulusImageUrl: '',
    questionPrompt: 'Berdasarkan informasi di atas, berapakah total akumulasi energi listrik yang dihasilkan oleh PLTS tersebut selama 10 bulan pertama pengoperasian?',
    options: [
      { id: 'opt-a', label: 'A', text: '4.800 kWh' },
      { id: 'opt-b', label: 'B', text: '5.000 kWh' },
      { id: 'opt-c', label: 'C', text: '5.200 kWh' },
      { id: 'opt-d', label: 'D', text: '5.400 kWh' },
      { id: 'opt-e', label: 'E', text: '5.600 kWh' },
    ],
    correctOptionId: 'opt-b',
    points: 20,
    fastTrick: 'Gunakan rumus cepat deret Sn = n/2 * (2a + (n-1)b). Untuk n=10, Sn = 5 * (2(320) + 9(40)) = 5 * (640 + 360) = 5 * 1.000 = 5.000 kWh!',
    explanation: 'Diketahui: a = 320 kWh, b = 40 kWh, n = 10 bulan. Rumus jumlah deret aritmetika: S_n = n/2 [2a + (n - 1)b] = 10/2 [2(320) + 9(40)] = 5 [640 + 360] = 5 [1.000] = 5.000 kWh.'
  },

  // 2. Pilihan Ganda Kompleks (SMP - Literasi Sains & Lingkungan)
  {
    id: 'q-smp-02',
    grade: 'SMP',
    subject: 'Literasi Sains & Lingkungan (TKA SMP)',
    type: 'pilihan_ganda_kompleks',
    stimulusTitle: 'Stimulus 2: Fenomena Eutrofikasi di Ekosistem Danau',
    stimulusText: `Penelitian di danau air tawar menunjukkan lonjakan pertumbuhan eceng gondok dan alga hijau yang sangat masif (blooming algae) akibat limpasan pupuk nitrogen dan fosfat dari lahan pertanian sekitar. 
Hal ini mengakibatkan permukaan air tertutup rapat oleh biomassa tumbuhan air, sehingga penetrasi cahaya matahari ke dasar danau berkurang drastis hingga 85%.`,
    stimulusImageUrl: '',
    questionPrompt: 'Pilihlah DUA atau LEBIH pernyataan di bawah ini yang merupakan dampak biologis langsung dari fenomena eutrofikasi tersebut! (Centang semua opsi yang benar)',
    options: [
      { id: 'opt-k1', label: 'A', text: 'Tumbuhan fitoplankton di lapisan dalam danau mengalami penurunan laju fotosintesis' },
      { id: 'opt-k2', label: 'B', text: 'Kadar oksigen terlarut (Dissolved Oxygen) meningkat pesat karena banyak tumbuhan berfotosintesis di permukaan' },
      { id: 'opt-k3', label: 'C', text: 'Populasi bakteri pengurai (dekomposer) meningkat drastis saat alga mati dan membusuk' },
      { id: 'opt-k4', label: 'D', text: 'Ikan-ikan di dasar danau mengalami hipoksia (kekurangan oksigen) yang memicu kematian massal' },
      { id: 'opt-k5', label: 'E', text: 'Keanekaragaman hayati danau meningkat karena pasokan unsur hara nitrogen melimpah' }
    ],
    correctOptionIds: ['opt-k1', 'opt-k3', 'opt-k4'],
    points: 25,
    fastTrick: 'Kunci eutrofikasi: Alga menutup sinar matahari -> tumbuhan bawah mati -> dekomposer pakai O2 berlebih -> DO turun drastis (anoksia) -> ikan mati!',
    explanation: 'Pernyataan A benar (cahaya terhalang menurunkan fotosintesis lapisan bawah). Pernyataan C benar (pembusukan biomassa meningkatkan kerja dekomposer aerobik). Pernyataan D benar (konsumsi oksigen dekomposer membuat kadar DO anjlok hingga ikan mati lemas). Opsi B dan E salah karena eutrofikasi justru menurunkan DO dan merusak keanekaragaman hayati.'
  },

  // 3. Menjodohkan (SD - Matematika Geometri & Karakteristik Bangun)
  {
    id: 'q-sd-03',
    grade: 'SD',
    subject: 'Matematika Dasar & Bangun Datar (TKA SD)',
    type: 'menjodohkan',
    stimulusTitle: 'Stimulus 3: Sifat-sifat Bangun Datar Geometri',
    stimulusText: `Dalam kurikulum merdeka kelas 5 dan 6 SD, pemahaman karakteristik bangun datar sangat penting dalam uji kompetensi asesmen akhir jenjang dan seleksi masuk SMP favorit. Perhatikan sifat-sifat bangun datar berikut dan pasangkan dengan nama bangun yang tepat.`,
    stimulusImageUrl: '',
    questionPrompt: 'Pasangkanlah setiap deskripsi karakteristik bangun datar pada kolom sebelah kiri dengan nama bangun datar yang sesuai pada kolom sebelah kanan!',
    matchingPairs: [
      {
        id: 'm-1',
        left: 'Memiliki 4 sisi sama panjang, 2 pasang sudut berhadapan sama besar, tetapi tidak memiliki sudut siku-siku',
        right: 'Belah Ketupat'
      },
      {
        id: 'm-2',
        left: 'Memiliki sepasang sisi sejajar yang tidak sama panjang dan dua sudut siku-siku',
        right: 'Trapesium Siku-siku'
      },
      {
        id: 'm-3',
        left: 'Memiliki 2 pasang sisi sama panjang dan kedua diagonalnya berpotongan tegak lurus membentuk sumbu simetri',
        right: 'Layang-layang'
      },
      {
        id: 'm-4',
        left: 'Memiliki simetri putar tak hingga dan tidak memiliki titik sudut',
        right: 'Lingkaran'
      }
    ],
    points: 25,
    fastTrick: 'Ciri khas: Belah ketupat = 4 sisi sama tanpa siku-siku; Layang-layang = 2 pasang sisi berdekatan sama; Trapesium siku-siku = punya tepat 2 sudut 90 derajat!',
    explanation: 'Karakteristik bangun datar memiliki ciri unik pada diagonal, panjang sisi, dan besar sudutnya. Pasangan di atas adalah identitas baku sifat-sifat geometri dasar jenjang SD.'
  },

  // 4. Benar / Salah (SMA - Penalaran Umum & Logika Proposisi)
  {
    id: 'q-sma-04',
    grade: 'SMA',
    subject: 'Penalaran Umum Logika (TKA SMA)',
    type: 'benar_salah',
    stimulusTitle: 'Stimulus 4: Wacana Logika Penarikan Kesimpulan',
    stimulusText: `Diketahui premis-premis logis berikut ini:
Premis 1: Jika seorang siswa menguasai konsep dasar TKA dan rutin berlatih simulasi CBT, maka ia memiliki peluang lebih dari 90% lulus di sekolah/kampus impiannya.
Premis 2: Dania tidak memiliki peluang lebih dari 90% lulus di sekolah/kampus impiannya ATAU Dania diterima di jalur prestasi internasional.
Premis 3: Dania tidak diterima di jalur prestasi internasional.`,
    stimulusImageUrl: '',
    questionPrompt: 'Tentukan kebenaran dari setiap pernyataan logis berikut berdasarkan aturan silogisme dan modus tollens! (Pilih Benar atau Salah)',
    trueFalseItems: [
      {
        id: 'tf-1',
        statement: 'Dania tidak memiliki peluang lebih dari 90% lulus di sekolah/kampus impiannya.',
        isTrue: true
      },
      {
        id: 'tf-2',
        statement: 'Dania dipastikan menguasai konsep dasar TKA dengan sangat baik.',
        isTrue: false
      },
      {
        id: 'tf-3',
        statement: 'Kesimpulan yang pasti adalah Dania tidak menguasai konsep dasar TKA ATAU Dania tidak rutin berlatih simulasi CBT.',
        isTrue: true
      },
      {
        id: 'tf-4',
        statement: 'Jika Dania rutin berlatih simulasi CBT, maka Dania pasti tidak menguasai konsep dasar TKA.',
        isTrue: true
      }
    ],
    points: 20,
    fastTrick: 'Gunakan hukum De Morgan: Negasi dari (P dan Q) adalah (~P atau ~Q). Jika diketahui ~P atau ~Q, dan P bernilai benar, maka Q harus salah!',
    explanation: 'Berdasarkan silogisme disjungtif dari P2 dan P3, didapat: Dania tidak memiliki peluang >90%. Berdasarkan Modus Tollens dengan P1: ~(P dan Q) equivalen dengan ~P atau ~Q. Artinya minimal salah satu kondisi (menguasai konsep ATAU rutin berlatih) tidak terpenuhi.'
  },

  // 5. Pilihan Ganda (SMP - Penalaran Aljabar)
  {
    id: 'q-smp-05',
    grade: 'SMP',
    subject: 'Penalaran Matematika & Aljabar (TKA SMP)',
    type: 'pilihan_ganda',
    stimulusTitle: 'Stimulus 5: Tarif Sewa Sepeda Listrik Kampus',
    stimulusText: `Sebuah layanan penyewaan sepeda listrik ramah lingkungan menetapkan tarif sewa dengan skema:
Biaya buka kunci (unlock fee) sebesar Rp 4.000 untuk 10 menit pertama.
Untuk setiap menit berikutnya, dikenakan tarif tetap sebesar Rp 600 per menit.
Aira menyewa sepeda listrik tersebut untuk berkeliling dan total tagihan yang dibayarkannya adalah Rp 22.000.`,
    stimulusImageUrl: '',
    questionPrompt: 'Berapa lama total durasi (dalam menit) Aira menyewa sepeda listrik tersebut?',
    options: [
      { id: 'smp-a', label: 'A', text: '35 menit' },
      { id: 'smp-b', label: 'B', text: '40 menit' },
      { id: 'smp-c', label: 'C', text: '42 menit' },
      { id: 'smp-d', label: 'D', text: '45 menit' },
      { id: 'smp-e', label: 'E', text: '48 menit' }
    ],
    correctOptionId: 'smp-b',
    points: 20,
    fastTrick: 'Sisa biaya = 22.000 - 4.000 = 18.000. Menit tambahan = 18.000 / 600 = 30 menit. Total waktu = 10 + 30 = 40 menit!',
    explanation: 'Total biaya = Tarif awal + (t - 10) * 600. 22.000 = 4.000 + 600(t - 10) => 18.000 = 600(t - 10) => t - 10 = 30 => t = 40 menit.'
  },

  // 6. Benar/Salah (SD - Literasi Membaca)
  {
    id: 'q-sd-06',
    grade: 'SD',
    subject: 'Literasi Bahasa Indonesia (TKA SD)',
    type: 'benar_salah',
    stimulusTitle: 'Stimulus 6: Kisah Sahabat Kejujuran di Kantin Sekolah',
    stimulusText: `Di SD Cendekia Mandiri, terdapat kantin kejujuran tanpa penjaga kasir. Setiap siswa yang membeli makanan harus menghitung sendiri uang kembalian dan memasukkan uang ke dalam kotak kayu bertuliskan "Kejujuran adalah Mahkota". 
Pada hari Jumat, bendahara kelas memeriksa catatan dan menemukan jumlah uang di kotak justru berlebih Rp 15.000 dari total barang yang laku. Ternyata beberapa siswa sengaja tidak mengambil kembalian mereka untuk disumbangkan ke kas sosial sekolah.`,
    stimulusImageUrl: '',
    questionPrompt: 'Tentukan apakah pernyataan berikut Benar atau Salah berdasarkan isi cerita bacaan di atas!',
    trueFalseItems: [
      {
        id: 'sd-tf-1',
        statement: 'Kantin kejujuran di SD Cendekia Mandiri dijaga oleh dua orang guru piket setiap hari.',
        isTrue: false
      },
      {
        id: 'sd-tf-2',
        statement: 'Uang di dalam kotak kejujuran bertambah lebih banyak karena ada siswa yang mengikhlaskan uang kembaliannya.',
        isTrue: true
      },
      {
        id: 'sd-tf-3',
        statement: 'Nilai moral utama dari cerita tersebut adalah menumbuhkan integritas kejujuran dan kepedulian sosial sejak dini.',
        isTrue: true
      }
    ],
    points: 15,
    fastTrick: 'Baca seksama kata kunci: "tanpa penjaga kasir" membuktikan pernyataan 1 Salah; "berlebih 15.000 untuk kas sosial" membuktikan pernyataan 2 & 3 Benar.',
    explanation: 'Teks menyatakan secara eksplisit bahwa kantin beroperasi tanpa penjaga dan kelebihan uang berasal dari siswa yang mendonasikan kembalian.'
  },

  // 7. Pilihan Ganda (SD - Operasi Pecahan & Perbandingan)
  {
    id: 'q-sd-07',
    grade: 'SD',
    subject: 'Matematika Dasar & Pecahan (TKA SD)',
    type: 'pilihan_ganda',
    stimulusTitle: 'Stimulus 7: Pembagian Hasil Panen Buah Kebun Sekolah',
    stimulusText: `Kebun edukasi SD Aira memanen 48 kg buah jeruk segar. Sebanyak 3/8 bagian dari hasil panen dibagikan ke panti asuhan, 25% dijual di bazar sekolah, dan sisanya disimpan di ruang kantin untuk dinikmati bersama seluruh siswa.`,
    stimulusImageUrl: '',
    questionPrompt: 'Berapa kilogram buah jeruk yang disimpan di ruang kantin sekolah?',
    options: [
      { id: 'opt-sd-a', label: 'A', text: '16 kg' },
      { id: 'opt-sd-b', label: 'B', text: '18 kg' },
      { id: 'opt-sd-c', label: 'C', text: '20 kg' },
      { id: 'opt-sd-d', label: 'D', text: '22 kg' },
      { id: 'opt-sd-e', label: 'E', text: '24 kg' }
    ],
    correctOptionId: 'opt-sd-b',
    points: 20,
    fastTrick: 'Panti: 3/8 * 48 = 18 kg. Bazar: 1/4 * 48 = 12 kg. Terpakai = 18 + 12 = 30 kg. Sisa untuk kantin = 48 - 30 = 18 kg!',
    explanation: 'Bagian panti asuhan = 3/8 * 48 = 18 kg. Bagian bazar sekolah = 25% * 48 = 12 kg. Total yang telah didistribusikan = 18 + 12 = 30 kg. Maka sisa buah di kantin = 48 - 30 = 18 kg.'
  },

  // 8. Menjodohkan (SMP - Konsep Fisika Mekanika)
  {
    id: 'q-smp-08',
    grade: 'SMP',
    subject: 'Fisika & Energi Mekanik (TKA SMP)',
    type: 'menjodohkan',
    stimulusTitle: 'Stimulus 8: Transformasi Energi dalam Kehidupan Sehari-hari',
    stimulusText: `Hukum kekekalan energi menyatakan bahwa energi tidak dapat diciptakan atau dimusnahkan, melainkan hanya dapat berubah dari satu bentuk ke bentuk yang lain. Pasangkanlah fenomena fisika berikut dengan konsep bentuk perubahan energinya!`,
    stimulusImageUrl: '',
    questionPrompt: 'Pasangkanlah peristiwa di kolom sebelah kiri dengan bentuk perubahan energi utama yang sesuai di kolom sebelah kanan!',
    matchingPairs: [
      {
        id: 'mp-smp-1',
        left: 'Buah kelapa bermassa 2 kg yang jatuh bebas dari pohon setinggi 10 meter ke tanah',
        right: 'Energi Potensial Gravitasi berubah menjadi Energi Kinetik'
      },
      {
        id: 'mp-smp-2',
        left: 'Peregangan busur panah sebelum anak panah dilepaskan melesat ke sasaran',
        right: 'Energi Potensial Pegas berubah menjadi Energi Kinetik'
      },
      {
        id: 'mp-smp-3',
        left: 'Baterai lithium smartphone yang sedang menyalakan layar LED dan suara dering',
        right: 'Energi Kimia berubah menjadi Energi Cahaya dan Energi Bunyi'
      },
      {
        id: 'mp-smp-4',
        left: 'Panel surya di atap rumah yang menyuplai daya kipas angin',
        right: 'Energi Radiasi Cahaya Matahari berubah menjadi Energi Kinetik Putar'
      }
    ],
    points: 25,
    fastTrick: 'Jatuh = Potensial ke Kinetik. Busur panah = Pegas ke Kinetik. Baterai = Kimia ke Cahaya/Bunyi. Panel surya = Cahaya ke Listrik/Kinetik.',
    explanation: 'Transformasi energi mengikuti prinsip konservasi energi mekanik dan perubahan bentuk energi elektrokimia.'
  },

  // 9. Pilihan Ganda Kompleks (SMA - Penalaran Analitis & Kalkulus)
  {
    id: 'q-sma-09',
    grade: 'SMA',
    subject: 'Matematika Lanjut & Kalkulus (TKA SMA)',
    type: 'pilihan_ganda_kompleks',
    stimulusTitle: 'Stimulus 9: Kurva Keuntungan Maksimum Perusahaan Startup',
    stimulusText: `Fungsi laba bersih mingguan sebuah perusahaan EdTech dinyatakan dalam persamaan f(x) = -2x^2 + 80x - 300 (dalam jutaan rupiah), dengan x menyatakan jumlah kelas tryout yang dibuka setiap pekan (dalam satuan kelas).`,
    stimulusImageUrl: '',
    questionPrompt: 'Manakah dari pernyataan-pernyataan di bawah ini yang bernilai BENAR terkait fungsi laba tersebut? (Pilih semua opsi yang benar)',
    options: [
      { id: 'opt-sma9-1', label: 'A', text: 'Perusahaan mencapai laba maksimum ketika membuka tepat 20 kelas tryout' },
      { id: 'opt-sma9-2', label: 'B', text: 'Nilai laba bersih maksimum yang dapat dicapai perusahaan adalah Rp 500 juta' },
      { id: 'opt-sma9-3', label: 'C', text: 'Perusahaan mengalami titik impas (BEP) jika membuka 5 kelas tryout' },
      { id: 'opt-sma9-4', label: 'D', text: 'Jika perusahaan membuka 25 kelas, laba bersih yang didapat adalah Rp 450 juta' },
      { id: 'opt-sma9-5', label: 'E', text: 'Turunan pertama f\'(x) = -4x + 80 bernilai nol saat x = 20' }
    ],
    correctOptionIds: ['opt-sma9-1', 'opt-sma9-2', 'opt-sma9-3', 'opt-sma9-4', 'opt-sma9-5'],
    points: 25,
    fastTrick: 'Turunan f\'(x) = -4x + 80 = 0 -> x = 20. f(20) = -2(400) + 80(20) - 300 = -800 + 1600 - 300 = 500 juta! f(5) = -50 + 400 - 300 = 50 != 0.',
    explanation: 'Laba maksimum dicapai saat f\'(x) = 0 yaitu x = 20. f(20) = 500 juta. Untuk x = 25: f(25) = -2(625) + 80(25) - 300 = -1250 + 2000 - 300 = 450 juta.'
  }
];

// ============================================================================
// DAFTAR PAKET SOAL (CORE UNIT UTAMA APLIKASI)
// Setiap paket memiliki:
// - Jenjang (SD / SMP / SMA / SEMUA)
// - Soal-soal lengkap (PG, PGK, Menjodohkan, Benar/Salah)
// - Nilai / poin per butir soal
// - Durasi ujian CBT (menit)
// - KKM kelulusan
// - Banner Cloudinary
// - Masa aktif 60 hari
// ============================================================================
export const INITIAL_PACKAGES: PackageItem[] = [
  // 1. Paket Demo CBT Gratis
  {
    id: 'pkg-demo',
    title: 'Simulasi Demo CBT TKA Gratis (SD, SMP, SMA)',
    grade: 'SEMUA',
    tagline: 'Sensasi CBT Realistis 0 Rupiah: Uji Ketangkasan Menjawab & Buktikan Trik 15 Detik Mas Aira!',
    price: 0,
    originalPrice: 0,
    durationDays: 60,
    durationMinutes: 15,
    passingGrade: 70,
    isDemo: true,
    bannerUrl: '/src/assets/images/aira_bimbel_hero_1793151843426.jpg',
    features: [
      '100% Bebas Biaya tanpa perlu registrasi kartu kredit',
      '5 Butir soal multi-format: PG, PGK, Menjodohkan & Benar/Salah',
      'Format CBT Resmi ANBK & UTBK dengan kartu stimulus terpisah',
      'Timer presisi 15 menit & fitur ragu-ragu real-time',
      'Skor instan seketika & pembahasan Trik Cepat 15 Detik Mas Aira'
    ],
    isPopular: false,
    packageType: 'satuan',
    questions: [
      INITIAL_QUESTIONS[0], // q-sma-01 (PG - PLTS Aritmetika)
      INITIAL_QUESTIONS[1], // q-smp-02 (PGK - Eutrofikasi)
      INITIAL_QUESTIONS[2], // q-sd-03 (Menjodohkan - Geometri SD)
      INITIAL_QUESTIONS[3], // q-sma-04 (Benar/Salah - Logika Silogisme)
      INITIAL_QUESTIONS[4], // q-smp-05 (PG - Tarif Sepeda Aljabar)
    ]
  },

  // 2. Paket Juara TKA SD (Satuan)
  {
    id: 'pkg-sd',
    title: 'Paket Juara TKA SD: Tembus SMP Favorit Impian',
    grade: 'SD',
    tagline: 'Bangun Fondasi Kuat Penalaran Matematika, Logika Bangun Datar & Literasi Kritis Sejak Dini',
    price: 49000,
    originalPrice: 120000,
    durationDays: 60,
    durationMinutes: 45,
    passingGrade: 75,
    isDemo: false,
    bannerUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    features: [
      'Masa aktif 60 HARI PENUH bebas latihan berulang kali',
      'Durasi ujian 45 Menit melatih manajemen waktu anak juara',
      'Koleksi soal variatif: Menjodohkan geometri, Pecahan, & Literasi Karakter',
      'Desain kartu stimulus ramah anak & nyaman di layar ponsel',
      'Bedah konsep tuntas & Trik 15 Detik Mas Aira yang mudah dicerna',
      'Analisis ketuntasan KKM & pemetaan kelemahan materi'
    ],
    isPopular: false,
    packageType: 'satuan',
    discountBadgeText: 'HEMAT 59%',
    questions: [
      INITIAL_QUESTIONS[2], // q-sd-03 (Menjodohkan sifat bangun datar)
      INITIAL_QUESTIONS[5], // q-sd-06 (Benar/Salah kantin kejujuran)
      INITIAL_QUESTIONS[6], // q-sd-07 (PG pecahan hasil panen)
    ]
  },

  // 3. Paket Prestasi TKA SMP (Satuan)
  {
    id: 'pkg-smp',
    title: 'Paket Prestasi TKA SMP: Taklukkan SMA Unggulan',
    grade: 'SMP',
    tagline: 'Kuasai Soal HOTS Asesmen Nasional, Seleksi SMA Pradita Dirgantara & Taruna Nusantara',
    price: 69000,
    originalPrice: 150000,
    durationDays: 60,
    durationMinutes: 60,
    passingGrade: 75,
    isDemo: false,
    bannerUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    features: [
      'Akses tanpa batas 60 HARI penuh untuk asah refleks menjawab',
      'Simulasi 60 Menit dengan sistem timer countdown resmi',
      'Soal berbobot HOTS: Aljabar Terapan, Ekosistem Sains, & Dinamika Fisika',
      'Kuasai format modern Pilihan Ganda Kompleks & Menjodohkan',
      'Trik eliminasi jawaban salah ala Mas Aira dalam 15 detik',
      'Peringkat evaluasi real-time untuk ukur daya saing nasional'
    ],
    isPopular: false,
    packageType: 'satuan',
    discountBadgeText: 'HEMAT 54%',
    questions: [
      INITIAL_QUESTIONS[1], // q-smp-02 (PGK Eutrofikasi)
      INITIAL_QUESTIONS[4], // q-smp-05 (PG Sewa Sepeda Aljabar)
      INITIAL_QUESTIONS[7], // q-smp-08 (Menjodohkan Fisika Transformasi Energi)
    ]
  },

  // 4. Paket Master TKA SMA / UTBK (Satuan)
  {
    id: 'pkg-sma',
    title: 'Paket Master TKA SMA: Kunci Lolos PTN Favorit & Kedinasan',
    grade: 'SMA',
    tagline: 'Kupas Tuntas Penalaran Kuantitatif, Matematika Lanjut, & Logika Analitik Standar UTBK SNBT 2026',
    price: 89000,
    originalPrice: 199000,
    durationDays: 60,
    durationMinutes: 90,
    passingGrade: 80,
    isDemo: false,
    bannerUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    features: [
      'Masa aktif 60 HARI PENUH – Tryout berkali-kali sampai skor 700+',
      'Durasi 90 Menit standar ketat UTBK BPPP & Ujian Masuk Kedinasan',
      'Bedah tuntas Deret Aritmetika PLTS, Silogisme Logika, & Kalkulus Terapan',
      'Metode Trik Cepat 15 Detik Mas Aira: Solusi cerdas tanpa panik',
      'Prediksi akurasi kelulusan program studi impian & grafik analisis',
      'Garansi peningkatan kecepatan menalar dan ketepatan kalkulasi'
    ],
    isPopular: true,
    packageType: 'satuan',
    discountBadgeText: 'HEMAT 55%',
    questions: [
      INITIAL_QUESTIONS[0], // q-sma-01 (PG Deret PLTS)
      INITIAL_QUESTIONS[3], // q-sma-04 (Benar/Salah Logika Silogisme)
      INITIAL_QUESTIONS[8], // q-sma-09 (PGK Kalkulus Laba Startup)
    ]
  },

  // 5. Paket Bundle Kombo Remaja (SMP + SMA)
  {
    id: 'pkg-bundle-smp-sma',
    title: 'Bundle Kombo Remaja: Sukses SMP & Lolos UTBK SMA',
    grade: 'SEMUA',
    tagline: 'Investasi Juara 2-in-1: Amankan Prestasi Sekolah Sekaligus Kunci Kursi Kampus Idaman Sejak Dini!',
    price: 109000,
    originalPrice: 249000,
    durationDays: 60,
    durationMinutes: 90,
    passingGrade: 80,
    isDemo: false,
    bannerUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    features: [
      'Akses ganda 60 HARI untuk bank soal jenjang SMP dan SMA',
      'Super Hemat: Lebih murah dibanding membeli satuan terpisah',
      'Paket komplit untuk akselerasi belajar dari bangku SMP hingga SMA',
      'Akses ke seluruh pembahasan video & Trik 15 Detik Mas Aira',
      'Laporan evaluasi komparatif perkembangan menalar lintas jenjang'
    ],
    isPopular: false,
    packageType: 'bundle',
    bundledGrades: ['SMP', 'SMA'],
    bundledPackageIds: ['pkg-smp', 'pkg-sma'],
    discountBadgeText: 'BUNDLE HEMAT 56%',
    questions: [
      INITIAL_QUESTIONS[0],
      INITIAL_QUESTIONS[1],
      INITIAL_QUESTIONS[3],
      INITIAL_QUESTIONS[4],
      INITIAL_QUESTIONS[7],
      INITIAL_QUESTIONS[8],
    ]
  },

  // 6. Paket Ultimate All-Access (Bundle 3 Jenjang: SD + SMP + SMA)
  {
    id: 'pkg-all',
    title: 'Paket Ultimate All-Access Bundle (SD + SMP + SMA)',
    grade: 'SEMUA',
    tagline: 'Akses VIP Tanpa Batas 60 Hari: Seluruh Bank Soal SD-SMP-SMA, Trik Kilat Mas Aira, Garansi Juara 100%!',
    price: 129000,
    originalPrice: 299000,
    durationDays: 60,
    durationMinutes: 120,
    passingGrade: 80,
    isDemo: false,
    bannerUrl: '/src/assets/images/aira_bimbel_hero_1793151843426.jpg',
    features: [
      'Masa aktif 60 HARI PENUH untuk seluruh jenjang SD, SMP, dan SMA',
      'Paket Super Bundle paling komprehensif, hemat & bernilai tinggi se-Indonesia',
      'Akses instan ke seluruh 9+ butir soal inti dan simulasi CBT terlengkap',
      'Kuasai ke-4 tipe soal ujian: PG, PG Kompleks, Menjodohkan & Benar/Salah',
      'Kunci jawaban berstandar dewan juri dengan Trik Cepat 15 Detik Mas Aira',
      'Bonus rangkuman rumus sakti TKA & prioritas konsultasi belajar'
    ],
    isPopular: true,
    packageType: 'bundle',
    bundledGrades: ['SD', 'SMP', 'SMA'],
    bundledPackageIds: ['pkg-sd', 'pkg-smp', 'pkg-sma'],
    discountBadgeText: 'SUPER BUNDLE HEMAT 57%',
    questions: [
      INITIAL_QUESTIONS[0],
      INITIAL_QUESTIONS[1],
      INITIAL_QUESTIONS[2],
      INITIAL_QUESTIONS[3],
      INITIAL_QUESTIONS[4],
      INITIAL_QUESTIONS[5],
      INITIAL_QUESTIONS[6],
      INITIAL_QUESTIONS[7],
      INITIAL_QUESTIONS[8],
    ]
  }
];

// Compatibility alias for exams
export const INITIAL_EXAMS: Exam[] = INITIAL_PACKAGES.map(pkg => ({
  id: pkg.id,
  title: pkg.title,
  grade: pkg.grade,
  subject: pkg.tagline,
  description: pkg.features.join(' • '),
  isDemo: !!pkg.isDemo,
  durationMinutes: pkg.durationMinutes,
  passingGrade: pkg.passingGrade,
  questions: pkg.questions,
  questionIds: pkg.questions.map(q => q.id)
}));

export const INITIAL_CONFIG: IntegrationConfig = {
  midtransClientKey: '',
  midtransServerKey: '',
  midtransEnvironment: 'sandbox',
  midtransAutoActive: true,
  supabaseUrl: 'https://ixoxdtqntaeccgl22cvodh.supabase.co',
  supabaseAnonKey: '',
  supabaseAutoActive: true,
  cloudinaryCloudName: 'airabimbel-cdn',
  cloudinaryUploadPreset: 'aira_soal_tka',
  cloudinaryAutoActive: true,
  cloudflareDomain: 'tryout.airabimbel.com',
  lastActivatedAt: new Date().toISOString()
};

export const INITIAL_LANDING_CONTENT: LandingPageContent = {
  // Header & Navbar
  brandFirstName: 'Aira',
  brandLastName: 'Bimbel',
  brandSlogan: 'Spesialis TKA SD · SMP · SMA',
  headerAnnouncement: '🔥 Promo Spesial Juara: Semua Paket Diskon Up to 59% + Akses Penuh 60 Hari Tanpa Batas!',

  // Hero Section
  heroTagline: '⚡ Platform Tryout & Bank Soal TKA No. 1 Paling Dipercaya di Indonesia',
  heroTitlePrefix: 'Siap Taklukkan Sekolah Favorit & Kampus Impian Bersama',
  heroTitleHighlight: 'Aira Bimbel',
  heroDescription: 'Ubah rasa gugup jadi percaya diri maksimal! Latihan intensif dengan ribuan soal HOTS standar BPPP & Kedinasan, kuasai Trik Cepat 15 Detik Mas Aira, dan nikmati fleksibilitas tryout sepuasnya selama 60 hari penuh.',
  heroBannerUrl: '/src/assets/images/aira_bimbel_hero_1793151843426.jpg',
  heroPrimaryCtaText: '🚀 Mulai Tryout Demo Gratis Sekarang',
  heroSecondaryCtaText: '🔥 Ambil Promo Paket 60 Hari',

  // Hero Stats
  stat1Value: '18.500+',
  stat1Label: 'Siswa Berhasil Tembus Sekolah & PTN Impian',
  stat2Value: '96,4%',
  stat2Label: 'Tingkat Kelulusan & Kepuasan Belajar',
  stat3Value: '100% Real CBT',
  stat3Label: 'Format Standar Resmi ANBK, UTBK & Kedinasan',
  stat4Value: '60 Hari Bebas',
  stat4Label: 'Akses Tryout Tanpa Kuota Limit',

  // Demo Banner
  demoBannerKicker: 'Buktikan Kualitasnya Sekarang',
  demoBannerTitle: 'Rasakan Pengalaman CBT Modern Berstandar Nasional – 100% Gratis!',
  demoBannerDescription: 'Uji ketangkasanmu dengan 5 butir soal HOTS lintas format: Pilihan Ganda, PG Kompleks, Menjodohkan, dan Benar/Salah. Rasakan split-card responsif dan rahasia bedah soal kilat ala Mas Aira.',
  demoBannerCtaText: 'Gas Coba Demo CBT Gratis ⚡',

  // Packages Section
  packagesSectionKicker: 'Investasi Masa Depan Juara',
  packagesSectionTitle: 'Pilih Paket TKA & Kunci Kemenanganmu Sekarang',
  packagesSectionDescription: 'Semua paket otomatis Aktif Selama 60 Hari Penuh sejak aktivasi. Latihan sepuasnya tanpa batas kuota, kuasai trik kilat, dan pecahkan rekor nilai tertinggimu!',

  // Features Section
  featuresSectionKicker: 'Standar Keunggulan Juara',
  featuresSectionTitle: 'Kenapa Ribuan Siswa Hebat Memilih Berlatih di Aira Bimbel?',
  featuresSectionDescription: 'Bukan sekadar bank soal biasa! Kami memadukan simulasi antarmuka ujian sesungguhnya, metodologi penalaran cepat anti-panik, dan analitik performa yang bikin kamu selangkah lebih maju.',

  // Footer
  footerDescription: 'Partner belajar terpercaya untuk menaklukkan Tes Kemampuan Akademik (TKA) SD, SMP, SMA, serta seleksi UTBK SNBT dan Kedinasan. Hadir dengan simulasi CBT berteknologi tinggi, trik cepat teruji, dan masa akses 60 hari tanpa batas.',
  footerContactWhatsApp: '+62 812-3456-7890',
  footerContactEmail: 'halo@airabimbel.com',
  footerCopyright: 'Aira Bimbel. Seluruh hak cipta dilindungi undang-undang.',
  footerBadge1: '⚡ Offline-First 0ms Latensi',
  footerBadge2: '🏆 Garansi Akses Penuh 60 Hari',
  footerBadge3: '🔒 Transaksi Resmi & Terverifikasi'
};
