import React, { useState } from 'react';
import { AuthUser, GradeLevel, PackageItem } from '../types';

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
  Award,
  Chrome
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

  const handleGoogleAuth = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!supabaseUrl || !supabaseAnonKey) {
      setErrorMsg('Konfigurasi Supabase belum tersedia. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dipasang di Cloudflare Pages lalu build ulang.');
      return;
    }
    const redirectTo = window.location.origin;
    const oauthUrl = new URL('/auth/v1/authorize', supabaseUrl);
    oauthUrl.searchParams.set('provider', 'google');
    oauthUrl.searchParams.set('redirect_to', redirectTo);
    oauthUrl.searchParams.set('apikey', supabaseAnonKey);
    window.location.assign(oauthUrl.toString());
  };

  // Email/password remains unavailable until wired to Supabase Auth.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('Login dan pendaftaran belum tersedia karena autentikasi Supabase belum dihubungkan. Tidak ada akun demo yang dapat digunakan.');
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

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-3 px-4 border border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50 text-slate-800 font-extrabold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Chrome className="w-4 h-4 text-blue-600" />
              {mode === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}
            </button>
            <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-slate-400">
              <div className="h-px bg-slate-200 flex-1" />
              <span>atau gunakan email</span>
              <div className="h-px bg-slate-200 flex-1" />
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
