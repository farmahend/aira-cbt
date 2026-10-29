import React, { useState } from 'react';
import { AuthUser, GradeLevel, PackageItem } from '../types';
import { getStoredUsers, registerNewUser, saveStoredCurrentUser } from '../utils/storage';
import {
  User,
  Lock,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  School,
  Clock,
  BookOpen,
  Award
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  targetActionNotice?: string; // e.g. "Harap masuk atau daftar untuk mengakses Demo CBT"
  packages: PackageItem[];
  preSelectedPackageId?: string;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser, intendedPackageId?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  targetActionNotice,
  packages,
  preSelectedPackageId,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('SMP');
  const [schoolOrigin, setSchoolOrigin] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    preSelectedPackageId || packages.find(p => !p.isDemo)?.id || packages[0]?.id || 'pkg-smp'
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handler for Quick Auto-Login for Student Demo
  const handleQuickStudentLogin = () => {
    setErrorMsg('Login demo dinonaktifkan untuk keamanan. Autentikasi server harus dikonfigurasi terlebih dahulu.');
  };

  // Google Sign-In Simulation
  const handleGoogleSignIn = () => {
    setErrorMsg('Google Sign-In belum terhubung ke OAuth provider. Tidak ada sesi login yang dibuat.');
  };

  // Submit Login or Register
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(
      'Autentikasi akun belum terhubung ke server yang aman. Login dan pendaftaran dinonaktifkan sementara agar kata sandi tidak diabaikan atau sesi palsu dibuat.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 my-6 flex flex-col md:flex-row max-h-[92vh]">
        
        {/* ================================================================= */}
        {/* LEFT BRAND SHOWCASE PANEL                                        */}
        {/* ================================================================= */}
        <div className="md:w-5/12 bg-gradient-to-br from-purple-950 via-purple-900 to-slate-950 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-purple-950 text-xs font-black uppercase font-display tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Ruang Belajar Siswa
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-display text-white leading-tight">
              Satu Akun Untuk Lolos Sekolah & PTN Impian!
            </h2>

            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
              Daftar sekarang untuk mengaktifkan paket tryout TKA berstandar nasional, CBT interaktif di HP, dan trik cepat 15 detik Mas Aira.
            </p>

            {/* Testimonial / Value Pillars */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Simulasi Demo CBT Gratis untuk uji format soal</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Semua paket otomatis Aktif 60 Hari Penuh</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>94,8% Tingkat Lolos Siswa Binaan Mas Aira</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Fill Button */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/15">
            <button
              type="button"
              onClick={handleQuickStudentLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-black transition-all text-center shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Masuk Cepat: Siswa Demo (Mohammad)</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT INTERACTIVE AUTH FORM (STUDENT ONLY)                       */}
        {/* ================================================================= */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-white">
          <div className="space-y-5">
            
            {/* Modal Header & Close */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  {mode === 'login' ? 'Masuk ke Akun Siswa' : 'Daftar Akun Siswa Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {mode === 'login'
                    ? 'Akses bank soal dan simulasi CBT aktif Anda.'
                    : 'Lengkapi data untuk mengaktifkan akun tryout dan pilih paket TKA.'}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Action Notice Banner */}
            {targetActionNotice && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-3 text-xs text-amber-950 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{targetActionNotice}</span>
              </div>
            )}

            {/* Mode Switcher: Login vs Register */}
            <div className="flex border-b border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className={`pb-2.5 px-4 transition-all ${
                  mode === 'login'
                    ? 'border-b-2 border-purple-900 text-purple-900 font-black'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Masuk (Login)
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className={`pb-2.5 px-4 transition-all ${
                  mode === 'register'
                    ? 'border-b-2 border-purple-900 text-purple-900 font-black'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Daftar Akun Baru (Register)
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google OAuth One-Tap Simulation Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-all shadow-2xs flex items-center justify-center gap-3 hover:border-purple-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Akun Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] text-slate-400 font-semibold uppercase">atau dengan email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* If Register: Full Name */}
              {mode === 'register' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Siswa *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Email Siswa *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama.siswa@belajar.id atau gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-purple-600 transition-colors"
                  />
                </div>
              </div>

              {/* If Register: WhatsApp, Grade, School */}
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Aktif</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="0812-XXXX-XXXX"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Jenjang Pendidikan *</label>
                      <select
                        value={grade}
                        onChange={e => setGrade(e.target.value as GradeLevel)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:border-purple-600"
                      >
                        <option value="SD">Jenjang SD (Kelas 4-6)</option>
                        <option value="SMP">Jenjang SMP (Kelas 7-9)</option>
                        <option value="SMA">Jenjang SMA (Kelas 10-12 / UTBK)</option>
                        <option value="SEMUA">Semua Jenjang / Umum</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asal Sekolah / Kota</label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        value={schoolOrigin}
                        onChange={e => setSchoolOrigin(e.target.value)}
                        placeholder="Contoh: SMPN 1 Jakarta / Surabaya"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-purple-600"
                      />
                    </div>
                  </div>

                  {/* PACKAGE SELECTOR DURING REGISTRATION */}
                  <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-purple-950 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-500" />
                        <span>Pilih Paket TKA Peminatan:</span>
                      </label>
                      <span className="text-[11px] font-bold text-purple-700">Aktif 60 Hari</span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {packages.map((pkg) => (
                        <label
                          key={pkg.id}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                            selectedPackageId === pkg.id
                              ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="auth_pkg_choice"
                              checked={selectedPackageId === pkg.id}
                              onChange={() => setSelectedPackageId(pkg.id)}
                              className="w-3.5 h-3.5 text-amber-400"
                            />
                            <div>
                              <div className="font-bold leading-tight">{pkg.title}</div>
                              <div className={`text-[10px] ${selectedPackageId === pkg.id ? 'text-purple-200' : 'text-slate-400'}`}>
                                Jenjang {pkg.grade} · {pkg.durationMinutes || 45} Menit
                              </div>
                            </div>
                          </div>

                          <div className="font-black text-right">
                            {pkg.isDemo || pkg.price === 0 ? (
                              <span className="text-amber-400 font-black">Gratis</span>
                            ) : (
                              <span>Rp {pkg.price.toLocaleString('id-ID')}</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Kata Sandi *</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => alert('Fitur reset password: Cukup masukkan email terdaftar atau gunakan Masuk Cepat Siswa Demo.')}
                      className="text-[11px] text-purple-700 hover:underline"
                    >
                      Lupa Kata Sandi?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter..."
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-purple-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* If Register: Confirm Password */}
              {mode === 'register' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Konfirmasi Kata Sandi *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi Anda..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-900 to-purple-800 hover:from-purple-950 hover:to-purple-900 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' ? 'Masuk ke Ruang Belajar' : 'Daftar & Aktifkan Akun Siswa'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>

            </form>

          </div>

          {/* Footer toggle between Login and Register */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Belum memiliki akun siswa Aira Bimbel?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="font-bold text-purple-900 hover:underline"
                >
                  Daftar Sekarang (Gratis)
                </button>
              </p>
            ) : (
              <p>
                Sudah memiliki akun terdaftar?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-purple-900 hover:underline"
                >
                  Masuk ke Akun Anda
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
