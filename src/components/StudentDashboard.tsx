import React, { useState } from 'react';
import { StudentSubscription, ExamSessionResult, PackageItem, AuthUser, GradeLevel } from '../types';
import { getRemainingDays, formatDateIndo, formatRupiah } from '../utils/storage';
import { ExamInstructionsModal } from './ExamInstructionsModal';
import {
  Clock,
  Sparkles,
  Award,
  Play,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  Lock,
  User,
  ShoppingBag,
  History,
  LogOut,
  Mail,
  Phone,
  GraduationCap,
  School,
  ChevronRight,
  AlertCircle,
  Zap,
  CheckCircle,
  Home
} from 'lucide-react';

interface StudentDashboardProps {
  user: AuthUser;
  subscriptions: StudentSubscription[];
  packages: PackageItem[];
  pastResults: ExamSessionResult[];
  onStartPackageExam: (pkg: PackageItem) => void;
  onBuyPackage: (pkg: PackageItem) => void;
  onViewResult: (result: ExamSessionResult) => void;
  onLogout: () => void;
}

type StudentScreen = 'menu' | 'tryout' | 'katalog' | 'riwayat' | 'profil';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  subscriptions,
  packages,
  pastResults,
  onStartPackageExam,
  onBuyPackage,
  onViewResult,
  onLogout,
}) => {
  // Screen-based full page routing (APK-Style)
  const [currentScreen, setCurrentScreen] = useState<StudentScreen>('menu');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [katalogGradeFilter, setKatalogGradeFilter] = useState<GradeLevel>('SEMUA');
  const [katalogTypeFilter, setKatalogTypeFilter] = useState<'ALL' | 'satuan' | 'bundle'>('ALL');

  // Exam Confirmation & Instructions Modal State
  const [selectedPkgForInstructions, setSelectedPkgForInstructions] = useState<PackageItem | null>(null);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);

  const handlePromptStartExam = (pkg: PackageItem) => {
    setSelectedPkgForInstructions(pkg);
    setIsInstructionsModalOpen(true);
  };

  const handleConfirmStartExam = (pkg: PackageItem) => {
    setIsInstructionsModalOpen(false);
    setSelectedPkgForInstructions(null);
    onStartPackageExam(pkg);
  };

  // Subscriptions & Permissions
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const accessibleGrades = new Set(activeSubs.map((s) => s.grade));
  const hasAllAccess = accessibleGrades.has('SEMUA');

  // Helper to find PackageItem for a subscription
  const getPackageForSub = (sub: StudentSubscription): PackageItem => {
    return (
      packages.find((p) => p.id === sub.packageId) ||
      packages.find((p) => p.grade === sub.grade && !p.isDemo) ||
      packages.find((p) => !p.isDemo) ||
      packages[0]
    );
  };

  // Filter packages for catalog screen (Grade + Satuan vs Bundle)
  const filteredCatalogPackages = packages.filter((pkg) => {
    const matchGrade = katalogGradeFilter === 'SEMUA' || pkg.grade === katalogGradeFilter || pkg.grade === 'SEMUA';
    const pType = pkg.packageType || 'satuan';
    const matchType = katalogTypeFilter === 'ALL' || pType === katalogTypeFilter;
    return matchGrade && matchType;
  });

  const goToScreen = (screen: StudentScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="aira-student-app min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-labelledby="student-logout-title">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><LogOut className="h-7 w-7" /></div>
            <h2 id="student-logout-title" className="text-center text-xl font-black text-slate-900">Keluar dari Akun?</h2>
            <p className="mt-2 text-center text-sm text-slate-600">Yakin ingin keluar? Jika dibatalkan, akun tetap masuk seperti semula.</p>
            <div className="mt-6 flex gap-3"><button onClick={() => setShowLogoutConfirm(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Batal</button><button onClick={onLogout} className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700">Ya, Keluar</button></div>
          </div>
        </div>
      )}
      {/* =========================================================================
          PRISTINE APK APP BAR (TOP BAR)
         ========================================================================= */}
      <header className="aira-student-header sticky top-0 z-30 bg-purple-950 text-white shadow-md border-b-2 border-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Logo / Back to Menu button */}
            <div className="flex items-center gap-3">
              {currentScreen !== 'menu' ? (
                <button
                  onClick={() => goToScreen('menu')}
                  className="p-2 -ml-2 rounded-xl bg-purple-900/80 hover:bg-amber-400 hover:text-purple-950 text-amber-300 font-bold transition-all flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer border border-purple-800"
                  title="Kembali ke Menu Utama"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-display font-black hidden sm:inline">Menu Utama</span>
                </button>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-purple-950 flex items-center justify-center font-black text-xl shadow-md font-display">
                  A
                </div>
              )}

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white font-display">
                    AIRA<span className="text-amber-400">BIMBEL</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                    APK CBT
                  </span>
                </div>
                <span className="text-[11px] text-purple-200">
                  {currentScreen === 'menu'
                    ? 'Aplikasi Simulasi CBT TKA Mandiri'
                    : currentScreen === 'tryout'
                    ? 'Halaman Tryout & Paket Saya'
                    : currentScreen === 'katalog'
                    ? 'Halaman Katalog Paket Baru'
                    : currentScreen === 'riwayat'
                    ? 'Halaman Riwayat Nilai & Evaluasi'
                    : 'Halaman Profil Siswa'}
                </span>
              </div>
            </div>

            {/* Student Info & Logout */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => goToScreen('profil')}
                className="hidden sm:flex items-center gap-2.5 bg-purple-900/80 hover:bg-purple-900 py-1.5 px-3 rounded-2xl border border-purple-800 cursor-pointer transition-colors"
                title="Buka Profil"
              >
                <div className="w-8 h-8 rounded-full bg-amber-400 text-purple-950 font-black text-xs flex items-center justify-center shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-bold text-white truncate max-w-[130px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold">
                    {user.grade ? `Jenjang ${user.grade}` : 'Siswa Terdaftar'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                title="Keluar dari Akun Siswa"
                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white border border-rose-400/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-300" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* =========================================================================
          SCREEN 1: MENU UTAMA APK (DASHBOARD CARDS)
          When currentScreen === 'menu', ONLY show the clean main menu cards.
         ========================================================================= */}
      {currentScreen === 'menu' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          
          {/* Welcome Banner Card */}
          <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-b-4 border-amber-400 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-purple-950 text-xs font-black uppercase font-display tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-950" />
                Area Belajar Juara
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display">
                Halo, {user.name}! Siap Juara Hari Ini? 🔥
              </h1>
              <p className="text-xs sm:text-sm text-purple-200 max-w-xl leading-relaxed">
                Setiap detik latihan membawamu 1 langkah lebih dekat ke sekolah & PTN impian. Pilih misi belajarmu di bawah dan pecahkan rekor nilai tertinggimu!
              </p>
            </div>

            {/* Quick Active Notification */}
            <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {activeSubs.length > 0 ? (
                <button
                  onClick={() => goToScreen('tryout')}
                  className="p-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all hover:scale-105 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Ada {activeSubs.length} Paket Aktif Siap Tempur →</span>
                </button>
              ) : (
                <button
                  onClick={() => goToScreen('katalog')}
                  className="p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all hover:scale-105 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Ambil Paket Juara (Akses 60 Hari) →</span>
                </button>
              )}
            </div>
          </div>

          {/* =====================================================================
              THE 4 APK MENU CARDS (CLICKING OPENS DEDICATED FULL SCREEN)
             ===================================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 font-display">
                <Layers className="w-5 h-5 text-purple-700" />
                <span>Pusat Kendali Juara</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                Pilih misi belajarmu untuk langsung memulai simulasi atau evaluasi progres
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* CARD 1: TRYOUT & PAKET SAYA */}
              <div
                onClick={() => goToScreen('tryout')}
                className="bg-gradient-to-br from-purple-900 to-purple-950 text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-2xl border-2 border-purple-700 hover:border-amber-400 transition-all hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center font-black shadow-md group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-current" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-purple-950 text-xs font-black uppercase tracking-wider shadow-xs">
                      {activeSubs.length > 0 ? `${activeSubs.length} Paket Siap Tempur` : 'Arena Ujian'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black font-display tracking-tight text-white">
                      Tryout & Paket Saya
                    </h3>
                    <p className="text-xs text-purple-200 mt-1.5 leading-relaxed">
                      Mulai simulasi CBT dengan timer presisi. Terapkan Trik 15 Detik Mas Aira dan amankan skor maksimalmu!
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-purple-800/80 flex items-center justify-between text-xs font-black text-amber-300 group-hover:text-amber-200">
                  <span>Masuk Arena Ujian</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>

              {/* CARD 2: BELI PAKET BARU */}
              <div
                onClick={() => goToScreen('katalog')}
                className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-purple-950 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-2xl border-2 border-amber-300 hover:border-purple-900 transition-all hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/15 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-purple-950 text-amber-400 flex items-center justify-center font-black shadow-md group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-950 text-amber-300 text-xs font-black uppercase tracking-wider shadow-xs">
                      Diskon 60 Hari
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black font-display tracking-tight text-purple-950">
                      Katalog Paket Juara
                    </h3>
                    <p className="text-xs text-purple-950/80 font-semibold mt-1.5 leading-relaxed">
                      Koleksi paket satuan & bundle hemat SD, SMP, SMA mulai Rp 49.000. Akses penuh 60 hari tanpa batas kuota!
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-amber-600/40 flex items-center justify-between text-xs font-black text-purple-950">
                  <span>Eksplor Paket Hemat</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>

              {/* CARD 3: RIWAYAT NILAI & PEMBAHASAN */}
              <div
                onClick={() => goToScreen('riwayat')}
                className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-2xl border-2 border-indigo-700 hover:border-amber-400 transition-all hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400 text-indigo-950 flex items-center justify-center font-black shadow-md group-hover:scale-110 transition-transform">
                      <Award className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-800 text-amber-300 text-xs font-black uppercase tracking-wider shadow-xs">
                      {pastResults.length} Sesi Teruji
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black font-display tracking-tight text-white">
                      Rapor & Evaluasi Nilai
                    </h3>
                    <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">
                      Pantau grafik skor, cek status kelulusan KKM, dan pelajari kembali kunci pembahasan trik eliminasi kilat.
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-indigo-800/80 flex items-center justify-between text-xs font-black text-amber-300 group-hover:text-amber-200">
                  <span>Buka Rapor Nilai</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>

              {/* CARD 4: PROFIL SISWA */}
              <div
                onClick={() => goToScreen('profil')}
                className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-2xl border-2 border-slate-700 hover:border-amber-400 transition-all hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md group-hover:scale-110 transition-transform">
                      <User className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-700 text-amber-300 text-xs font-black uppercase tracking-wider shadow-xs">
                      Akun Siswa
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black font-display tracking-tight text-white">
                      Profil & Keanggotaan
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      Detail data diri, nomor WhatsApp aktif, status masa berlaku paket 60 hari, dan bukti transaksi resmi.
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-700 flex items-center justify-between text-xs font-black text-amber-300 group-hover:text-amber-200">
                  <span>Kelola Profil Saya</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>

            </div>
          </div>

          {/* Golden Champion Advice Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-2xl p-5 text-purple-950 shadow-md border-2 border-amber-300 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 text-amber-400 flex items-center justify-center shrink-0 shadow-sm font-black text-xl">
              💡
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-black uppercase tracking-wider text-purple-950/80 block">
                Rahasia Juara Mas Aira
              </span>
              <p className="text-xs sm:text-sm font-bold text-purple-950 leading-snug">
                "Jangan panik melihat wacana stimulus yang panjang! Baca pertanyaan inti terlebih dahulu, tandai kata kunci, lalu eliminasi 2 opsi yang mustahil dalam 15 detik pertama."
              </p>
            </div>
          </div>

        </main>
      )}

      {/* =========================================================================
          SCREEN 2: HALAMAN PENUH TRYOUT & PAKET SAYA
         ========================================================================= */}
      {currentScreen === 'tryout' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          
          {/* Header Bar with Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-purple-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => goToScreen('menu')}
                className="p-2.5 rounded-2xl bg-purple-100 hover:bg-amber-400 text-purple-950 font-bold transition-all flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Menu</span>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  Arena Tryout & Paket Juara Saya
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paket aktif siap tempur! Klik <strong>Mulai Ujian CBT</strong> di bawah untuk membuka simulasi berstandar resmi.
                </p>
              </div>
            </div>

            <button
              onClick={() => goToScreen('katalog')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Beli Paket Tambahan (Hemat Up to 59%)</span>
            </button>
          </div>

          {/* Section 1: Active 60-Day Subscriptions with START EXAM BUTTON */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <span>Paket Saya yang Sudah Aktif (Siap Tempur)</span>
              </h2>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl">
                {activeSubs.length} Paket Aktif
              </span>
            </div>

            {activeSubs.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-purple-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Belum Ada Paket Aktif? Amankan Tiket Juaramu!</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Mulai langkah suksesmu sekarang! Pilih paket TKA jenjang SD, SMP, atau SMA untuk membuka seluruh bank soal HOTS dan simulasi CBT selama 60 hari penuh.
                  </p>
                </div>
                <button
                  onClick={() => goToScreen('katalog')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buka Katalog & Ambil Promo (Mulai Rp 49.000)</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeSubs.map((sub) => {
                  const daysLeft = getRemainingDays(sub.expiresAt);
                  const matchedPkg = getPackageForSub(sub);
                  const qCount = matchedPkg.questions ? matchedPkg.questions.length : 30;

                  return (
                    <div
                      key={sub.id}
                      className="bg-white rounded-3xl border-2 border-purple-300 hover:border-purple-500 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group"
                    >
                      <div className="space-y-4 relative z-10">
                        {/* Tags */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-950 text-xs font-black tracking-wide border border-purple-200">
                            JENJANG {sub.grade}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            AKSES 60 HARI AKTIF
                          </span>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="text-xl font-black text-slate-900 font-display leading-tight group-hover:text-purple-950 transition-colors">
                            {sub.packageName}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {matchedPkg.tagline || 'Latihan intensif TKA dengan sistem CBT standar nasional'}
                          </p>
                        </div>

                        {/* Exam specs */}
                        <div className="grid grid-cols-3 gap-2 p-3 bg-purple-50/70 rounded-2xl border border-purple-100 text-center">
                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Durasi</span>
                            <span className="text-xs sm:text-sm font-black text-purple-950 font-mono">
                              {matchedPkg.durationMinutes || 60} Menit
                            </span>
                          </div>
                          <div className="border-x border-purple-200">
                            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Soal</span>
                            <span className="text-xs sm:text-sm font-black text-purple-950 font-mono">
                              {qCount} Butir
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Target KKM</span>
                            <span className="text-xs sm:text-sm font-black text-emerald-700 font-mono">
                              {matchedPkg.passingGrade || 75}
                            </span>
                          </div>
                        </div>

                        {/* Remaining Days */}
                        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-amber-900 font-bold">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Masa Berlaku Paket:</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-purple-950 bg-amber-300 px-2.5 py-0.5 rounded-lg text-xs font-mono shadow-xs">
                              {daysLeft} Hari Lagi
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              s/d {formatDateIndo(sub.expiresAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* START EXAM ACTION BUTTON */}
                      <div className="pt-5 mt-4 border-t border-slate-100 space-y-2 relative z-10">
                        <button
                          onClick={() => handlePromptStartExam(matchedPkg)}
                          className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-purple-900 via-purple-950 to-indigo-950 hover:from-purple-800 hover:to-purple-900 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-purple-900/25 border-2 border-amber-400 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                          <Play className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" />
                          <span>MULAI UJIAN CBT SEKARANG ⚡</span>
                          <ArrowRight className="w-4 h-4 text-amber-400 ml-1" />
                        </button>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                          <span>Order #{sub.orderId}</span>
                          <span className="font-semibold text-purple-900">{sub.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Other Packages & Free Demo */}
          <section className="space-y-4 pt-6 border-t border-slate-200">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>Daftar Seluruh Simulasi CBT & Demo Gratis</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                const isUnlocked =
                  pkg.isDemo ||
                  hasAllAccess ||
                  accessibleGrades.has(pkg.grade) ||
                  activeSubs.some((s) => s.packageId === pkg.id);

                const qCount = pkg.questions ? pkg.questions.length : 30;

                return (
                  <div
                    key={pkg.id}
                    className={`bg-white rounded-3xl border p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-all ${
                      isUnlocked
                        ? 'border-purple-300 hover:border-purple-500 hover:shadow-md'
                        : 'border-slate-200 bg-slate-50/70'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900">
                          {pkg.grade === 'SEMUA' ? 'SEMUA JENJANG' : `JENJANG ${pkg.grade}`}
                        </span>

                        {pkg.isDemo ? (
                          <span className="text-xs font-black text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full">
                            Demo Gratis
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Sudah Dibeli
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-semibold">
                            KKM: {pkg.passingGrade || 75}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 font-display leading-snug">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {pkg.tagline}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-1 font-semibold text-purple-900">
                          <Clock className="w-3.5 h-3.5 text-purple-700" />
                          <span>{pkg.durationMinutes || 45} Menit</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-amber-700">
                          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                          <span>{qCount} Butir Soal</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100">
                      {isUnlocked ? (
                        <button
                          onClick={() => handlePromptStartExam(pkg)}
                          className="w-full py-3 px-4 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{pkg.isDemo ? 'Mulai Demo CBT' : 'Mulai Ujian CBT'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onBuyPackage(pkg)}
                          className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5 text-purple-950" />
                          <span>Beli Paket {pkg.grade} ({formatRupiah(pkg.price)})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </main>
      )}

      {/* =========================================================================
          SCREEN 3: HALAMAN PENUH KATALOG & BELI PAKET BARU
         ========================================================================= */}
      {currentScreen === 'katalog' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          
          {/* Header Bar with Back Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-purple-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => goToScreen('menu')}
                className="p-2.5 rounded-2xl bg-purple-100 hover:bg-amber-400 text-purple-950 font-bold transition-all flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Menu</span>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  Katalog Paket Soal TKA (60 Hari)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setiap pembelian paket aktif selama 60 hari penuh dengan pembayaran aman Midtrans.
                </p>
              </div>
            </div>

            {/* Filter Section: Jenjang & Satuan vs Bundle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              {/* Grade Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['SEMUA', 'SD', 'SMP', 'SMA'] as GradeLevel[]).map((gr) => (
                  <button
                    key={gr}
                    onClick={() => setKatalogGradeFilter(gr)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      katalogGradeFilter === gr
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-purple-50 text-slate-700'
                    }`}
                  >
                    {gr === 'SEMUA' ? 'Semua Jenjang' : `Jenjang ${gr}`}
                  </button>
                ))}
              </div>

              {/* Tipe Penjualan Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setKatalogTypeFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    katalogTypeFilter === 'ALL'
                      ? 'bg-white text-purple-950 shadow-xs'
                      : 'text-slate-600 hover:text-purple-950'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setKatalogTypeFilter('satuan')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    katalogTypeFilter === 'satuan'
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-purple-950'
                  }`}
                >
                  <span>📦 Satuan</span>
                </button>
                <button
                  onClick={() => setKatalogTypeFilter('bundle')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                    katalogTypeFilter === 'bundle'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-purple-950 shadow-xs'
                      : 'text-slate-600 hover:text-purple-950'
                  }`}
                >
                  <span>🎁 Bundle Hemat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalogPackages.map((pkg) => {
              const isCurrentActive =
                hasAllAccess ||
                accessibleGrades.has(pkg.grade) ||
                activeSubs.some((s) => s.packageId === pkg.id);
              const isBundle = pkg.packageType === 'bundle';
              const discountPct = pkg.originalPrice > pkg.price
                ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
                : 0;

              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-3xl border-2 p-6 flex flex-col justify-between shadow-xs transition-all relative ${
                    isBundle
                      ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-md'
                      : pkg.isPopular
                      ? 'border-purple-600 ring-2 ring-purple-600/20'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {/* Floating Badges */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {isBundle ? (
                      <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-purple-950 font-black text-[11px] px-3.5 py-0.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1 border border-amber-300">
                        <span>🎁 BUNDLE HEMAT SUPER</span>
                      </span>
                    ) : pkg.isPopular ? (
                      <span className="bg-purple-900 text-amber-300 font-black text-[11px] px-3 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                        Paling Diminati Siswa
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-900 text-xs font-bold">
                          {pkg.grade === 'SEMUA' ? 'SEMUA JENJANG' : `JENJANG ${pkg.grade}`}
                        </span>
                        {isBundle && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                            Multi-Jenjang
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        Masa Akses 60 Hari
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 font-display leading-snug">{pkg.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{pkg.tagline}</p>
                    </div>

                    {/* If Bundle, show included bundled packages & grades */}
                    {isBundle && (
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-amber-900 text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Mencakup {pkg.bundledPackageIds?.length || (pkg.bundledGrades?.length || 0)} Paket Lengkap</span>
                          </span>
                          {pkg.bundledGrades && pkg.bundledGrades.length > 0 && (
                            <span className="text-[10px] bg-amber-200 text-purple-950 px-2 py-0.5 rounded font-black">
                              {pkg.bundledGrades.join(' + ')}
                            </span>
                          )}
                        </div>

                        {pkg.bundledPackageIds && pkg.bundledPackageIds.length > 0 ? (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {pkg.bundledPackageIds.map((bId) => {
                              const bp = packages.find(p => p.id === bId);
                              return bp ? (
                                <span key={bId} className="px-2 py-0.5 rounded-lg bg-white border border-amber-300 text-[10px] font-bold text-purple-950 shadow-2xs flex items-center gap-1">
                                  <span className="text-amber-600 font-extrabold">[{bp.grade}]</span>
                                  <span className="truncate max-w-[150px]">{bp.title}</span>
                                </span>
                              ) : null;
                            })}
                          </div>
                        ) : pkg.bundledGrades && pkg.bundledGrades.length > 0 ? (
                          <div className="text-[11px] font-medium text-slate-700">
                            Akses ke seluruh bank soal jenjang: <strong>{pkg.bundledGrades.join(' + ')}</strong>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Strikethrough Pricing Box */}
                    <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">Harga Paket:</span>
                        {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                          <span className="px-2 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-md shadow-xs">
                            {pkg.discountBadgeText || `HEMAT ${discountPct}%`}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2.5">
                        <span className="text-2xl sm:text-3xl font-black text-purple-950 font-display">
                          {pkg.isDemo ? 'Gratis 100%' : formatRupiah(pkg.price)}
                        </span>
                        {pkg.originalPrice && pkg.originalPrice > pkg.price && !pkg.isDemo && (
                          <span className="text-sm text-slate-400 line-through font-semibold">
                            {formatRupiah(pkg.originalPrice)}
                          </span>
                        )}
                      </div>

                      {!pkg.isDemo && pkg.originalPrice > pkg.price && (
                        <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 pt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Hemat {formatRupiah(pkg.originalPrice - pkg.price)} ({discountPct}%) • Akses 60 Hari Penuh</span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    {isCurrentActive && !pkg.isDemo ? (
                      <div className="space-y-2">
                        <div className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Paket Ini Sedang Aktif di Akun Anda</span>
                        </div>
                        <button
                          onClick={() => handlePromptStartExam(pkg)}
                          className="w-full py-3 px-4 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Mulai Simulasi CBT Sekarang</span>
                        </button>
                      </div>
                    ) : pkg.isDemo ? (
                      <button
                        onClick={() => handlePromptStartExam(pkg)}
                        className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Coba Demo CBT Gratis</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onBuyPackage(pkg)}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Beli Paket Sekarang (60 Hari)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </main>
      )}

      {/* =========================================================================
          SCREEN 4: HALAMAN PENUH RIWAYAT & PEMBAHASAN CBT
         ========================================================================= */}
      {currentScreen === 'riwayat' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          
          {/* Header Bar with Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => goToScreen('menu')}
                className="p-2.5 rounded-2xl bg-purple-100 hover:bg-amber-400 text-purple-950 font-bold transition-all flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Menu</span>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  Riwayat Nilai & Evaluasi CBT
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh hasil simulasi ujian Anda tersimpan rapi untuk ditinjau pembahasannya.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <span>Total Ujian:</span>
              <span className="font-extrabold text-purple-900">{pastResults.length} Sesi</span>
            </div>
          </div>

          {pastResults.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <History className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Belum Ada Riwayat Ujian</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Anda belum menyelesaikan simulasi ujian CBT apapun. Buka menu Tryout dan mulai kerjakan paket soal Anda.
                </p>
              </div>
              <button
                onClick={() => goToScreen('tryout')}
                className="px-6 py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Buka Menu Tryout</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Paket Ujian</th>
                      <th className="py-3.5 px-4 font-bold">Tanggal & Waktu</th>
                      <th className="py-3.5 px-4 font-bold text-center">Skor / 100</th>
                      <th className="py-3.5 px-4 font-bold text-center">Hasil KKM</th>
                      <th className="py-3.5 px-4 font-bold text-right">Aksi Pembahasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pastResults.map((res) => (
                      <tr key={res.id} className="hover:bg-purple-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {res.examTitle}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {formatDateIndo(res.completedAt)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-extrabold text-purple-950 tabular-nums text-base">
                            {res.percentage}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {res.score} / {res.totalPoints} Poin
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {res.isPassed ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Lulus
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold inline-flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              Remedial
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onViewResult(res)}
                            className="px-3.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Buka Pembahasan</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      )}

      {/* =========================================================================
          SCREEN 5: HALAMAN PENUH PROFIL SISWA & TRANSAKSI
         ========================================================================= */}
      {currentScreen === 'profil' && (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          
          {/* Header Bar with Back Button */}
          <div className="flex items-center gap-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <button
              onClick={() => goToScreen('menu')}
              className="p-2.5 rounded-2xl bg-purple-100 hover:bg-amber-400 text-purple-950 font-bold transition-all flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Menu</span>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                Profil & Data Akun Siswa
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola informasi akun Anda dan pantau paket aktif.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 to-purple-950 text-amber-300 font-black text-2xl flex items-center justify-center shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">{user.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">ID Akun: {user.id}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
                    {user.grade ? `Target Jenjang: ${user.grade}` : 'Peserta TKA'}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-rose-200 self-start sm:self-auto cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            </div>

            {/* Detail Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-purple-700 flex items-center justify-center shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Alamat Email</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{user.email}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Nomor WhatsApp</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {user.phone || '+62 812-3456-7890'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-xs">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Asal Sekolah</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {user.schoolOrigin || 'SMP Negeri 1'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-purple-600 flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Jenjang Belajar</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {user.grade || 'SMP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Subscriptions in Profile */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Paket Langganan Aktif (60 Hari)</h3>
              {activeSubs.length === 0 ? (
                <p className="text-xs text-slate-500">Tidak ada paket aktif saat ini.</p>
              ) : (
                <div className="space-y-2">
                  {activeSubs.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-purple-950 block">{sub.packageName}</span>
                        <span className="text-[11px] text-slate-500">
                          Order #{sub.orderId} · Berlaku hingga: {formatDateIndo(sub.expiresAt)}
                        </span>
                      </div>
                      <span className="font-bold text-purple-900 bg-amber-300 px-2.5 py-1 rounded-lg text-xs font-mono shadow-xs">
                        {getRemainingDays(sub.expiresAt)} Hari Lagi
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
      )}

      {/* Modern App Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Aira Bimbel · Aplikasi CBT TKA Mandiri Terpercaya (SD, SMP, SMA)</p>
      </footer>

      {/* Confirmation & Important Instructions Modal */}
      <ExamInstructionsModal
        isOpen={isInstructionsModalOpen}
        pkg={selectedPkgForInstructions}
        onClose={() => {
          setIsInstructionsModalOpen(false);
          setSelectedPkgForInstructions(null);
        }}
        onConfirmStart={handleConfirmStartExam}
      />

    </div>
  );
};
