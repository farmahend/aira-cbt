export type GradeLevel = 'SD' | 'SMP' | 'SMA' | 'SEMUA';

export type QuestionType =
  | 'pilihan_ganda'
  | 'pilihan_ganda_kompleks'
  | 'menjodohkan'
  | 'benar_salah';

export interface MatchingPair {
  id: string;
  left: string;   // Premis/Pernyataan Kiri
  right: string;  // Pasangan Kanan
}

export interface TrueFalseStatement {
  id: string;
  statement: string;
  isTrue: boolean;
}

export interface QuestionOption {
  id: string;
  label: string; // A, B, C, D, E
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  grade: 'SD' | 'SMP' | 'SMA';
  subject: string;
  type: QuestionType;
  // Card 1: Stimulus & Pernyataan
  stimulusTitle?: string;
  stimulusText: string;
  stimulusImageUrl?: string;
  // Card 2: Pertanyaan & Pilihan Jawaban
  questionPrompt: string;
  // Opsi Jawaban sesuai type:
  options?: QuestionOption[]; // untuk pilihan_ganda & pilihan_ganda_kompleks
  correctOptionId?: string; // untuk pilihan_ganda
  correctOptionIds?: string[]; // untuk pilihan_ganda_kompleks
  matchingPairs?: MatchingPair[]; // untuk menjodohkan
  trueFalseItems?: TrueFalseStatement[]; // untuk benar_salah
  // Solusi & Trik Cepat Aira Bimbel
  explanation: string;
  fastTrick?: string;
  points: number; // Nilai / Skor soal
}

export interface PackageItem {
  id: string;
  title: string;
  grade: GradeLevel;
  tagline: string;
  price: number;
  originalPrice: number;
  durationDays: number; // 60 hari
  bannerUrl?: string; // Banner gambar paket (Cloudinary)
  isDemo?: boolean; // Apakah paket ini demo gratis?
  durationMinutes: number; // Durasi ujian CBT untuk paket ini (menit)
  passingGrade: number; // KKM / Nilai Kelulusan (e.g. 75)
  features: string[];
  isPopular?: boolean;
  packageType?: 'satuan' | 'bundle'; // Satuan (1 Jenjang) atau Bundle Hemat (Multi-Jenjang / Kombo)
  bundledGrades?: GradeLevel[]; // Jenjang yang tercakup jika tipe bundle (e.g. ['SD', 'SMP', 'SMA'] atau ['SMP', 'SMA'])
  bundledPackageIds?: string[]; // ID paket-paket spesifik yang dipilih admin untuk dibundle secara fleksibel
  discountBadgeText?: string; // e.g. "HEMAT 54%", "PROMO BUNDLE KOMBO"
  questions: Question[]; // Soal-soal lengkap yang ada di dalam paket ini
  includedExamsCount?: number;
}

// Backwards-compatibility alias for exam sessions
export interface Exam {
  id: string;
  title: string;
  grade: GradeLevel;
  subject?: string;
  description?: string;
  isDemo: boolean;
  durationMinutes: number;
  passingGrade: number;
  questionIds?: string[];
  questions?: Question[];
}

export type UserRole = 'customer' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  grade?: GradeLevel;
  schoolOrigin?: string;
  avatarUrl?: string;
  interestedPackageId?: string;
  createdAt: string;
}

export interface StudentSubscription {
  id: string;
  userId?: string;
  packageId: string;
  packageName: string;
  grade: GradeLevel;
  purchasedAt: string; // ISO
  expiresAt: string;   // ISO (60 hari dari purchasedAt)
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: 'active' | 'expired';
}

export interface CBTUserAnswer {
  questionId: string;
  type: QuestionType;
  selectedOptionId?: string; // pilihan_ganda
  selectedOptionIds?: string[]; // pilihan_ganda_kompleks
  matchingAnswers?: Record<string, string>; // leftId -> rightId
  trueFalseAnswers?: Record<string, boolean>; // statementId -> boolean
  isFlagged?: boolean; // Ragu-ragu
}

export interface ExamSessionResult {
  id: string;
  examId: string; // package or exam id
  examTitle: string; // package or exam title
  grade: GradeLevel;
  isDemo: boolean;
  score: number;
  totalPoints: number;
  percentage: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  completedAt: string;
  userAnswers: Record<string, CBTUserAnswer>;
}

export interface IntegrationConfig {
  midtransClientKey: string;
  midtransServerKey: string;
  midtransEnvironment: 'sandbox' | 'production';
  midtransAutoActive?: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseAutoActive?: boolean;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  cloudinaryAutoActive?: boolean;
  cloudflareDomain: string;
  lastActivatedAt?: string;
}

export interface LandingPageContent {
  // Header & Navbar
  brandFirstName: string;
  brandLastName: string;
  brandSlogan: string;
  headerAnnouncement: string;

  // Hero Section
  heroTagline: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroDescription: string;
  heroBannerUrl: string;
  heroPrimaryCtaText: string;
  heroSecondaryCtaText: string;

  // Hero Stats
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  stat4Value: string;
  stat4Label: string;

  // Demo Banner
  demoBannerKicker: string;
  demoBannerTitle: string;
  demoBannerDescription: string;
  demoBannerCtaText: string;

  // Packages Section
  packagesSectionKicker: string;
  packagesSectionTitle: string;
  packagesSectionDescription: string;

  // Features Section
  featuresSectionKicker: string;
  featuresSectionTitle: string;
  featuresSectionDescription: string;

  // Footer
  footerDescription: string;
  footerContactWhatsApp: string;
  footerContactEmail: string;
  footerCopyright: string;
  footerBadge1: string;
  footerBadge2: string;
  footerBadge3: string;
}
