import React from 'react';
import { Layers, Zap, Clock, Smartphone, Award, ShieldCheck, CheckCircle } from 'lucide-react';
import { LandingPageContent } from '../types';

interface FeaturesSectionProps {
  content: LandingPageContent;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ content }) => {
  return (
    <section id="keunggulan" className="py-16 sm:py-24 bg-slate-50 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            {content.featuresSectionKicker}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display [text-wrap:balance]">
            {content.featuresSectionTitle}
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed font-sans">
            {content.featuresSectionDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="bg-white p-7 rounded-2xl border border-purple-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
              <Layers className="w-6 h-6 text-purple-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Pemisahan Card Stimulus & Pertanyaan
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Teks wacana atau gambar data disajikan pada kartu terpisah yang nyaman dibaca tanpa perlu scroll bolak-balik yang melelahkan.
            </p>
            <div className="pt-2 text-xs font-semibold text-purple-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Standar Ujian Resmi BPPP Kemendikbud</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-7 rounded-2xl border border-purple-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              4 Model Soal HOTS Terlengkap
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Bukan hanya pilihan ganda biasa! Latih kemampuanmu dengan Pilihan Ganda Kompleks, Menjodohkan relasi, dan Tabel Benar/Salah.
            </p>
            <div className="pt-2 text-xs font-semibold text-purple-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Format Seleksi Sekolah & Kedinasan 2026</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-7 rounded-2xl border border-purple-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Paket Aktif 60 Hari Penuh
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dapatkan ketenangan belajar dengan masa aktif dua bulan penuh. Tryout berkali-kali tanpa batas kuota hingga kamu benar-benar menguasai materi.
            </p>
            <div className="pt-2 text-xs font-semibold text-purple-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Garansi Akses 24/7 Tanpa Hambatan</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-7 rounded-2xl border border-purple-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-sky-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Responsif & Nyaman di Smartphone
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tampilan tidak berantakan saat dibuka di layar HP. Tombol navigasi sentuh yang lega, laci daftar soal, dan ukuran font yang dapat diatur.
            </p>
            <div className="pt-2 text-xs font-semibold text-purple-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Mobile-First Engine Super Cepat</span>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-7 rounded-2xl border border-purple-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Trik 15 Detik & Konsep Matang
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Khas Aira Bimbel ala Alfaiz: bedah tuntas cara cepat mengeliminasi pilihan salah tanpa perlu rumus panjang yang membingungkan.
            </p>
            <div className="pt-2 text-xs font-semibold text-purple-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Pintar Menghitung, Kuat Menalar</span>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-7 rounded-2xl border border-purple-100 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-teal-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Payment Otomatis Midtrans & Cloud Realtime
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Bisa bayar lewat QRIS, m-Banking, atau minimarket. Paket langsung aktif otomatis dalam hitungan detik tanpa perlu konfirmasi manual admin.
            </p>
            <div className="pt-2 text-xs font-semibold text-purple-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Verifikasi Instan 24 Jam</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
