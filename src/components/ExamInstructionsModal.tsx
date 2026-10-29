import React, { useState, useEffect } from 'react';
import { PackageItem } from '../types';
import {
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle,
  Play,
  X,
  ShieldCheck,
  FileText,
  HelpCircle,
  Zap,
  Check,
  Sparkles
} from 'lucide-react';

interface ExamInstructionsModalProps {
  isOpen: boolean;
  pkg: PackageItem | null;
  onClose: () => void;
  onConfirmStart: (pkg: PackageItem) => void;
}

export const ExamInstructionsModal: React.FC<ExamInstructionsModalProps> = ({
  isOpen,
  pkg,
  onClose,
  onConfirmStart,
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);

  // Reset agreement on open
  useEffect(() => {
    if (isOpen) {
      setHasAgreed(false);
    }
  }, [isOpen]);

  if (!isOpen || !pkg) return null;

  const qCount = pkg.questions ? pkg.questions.length : 30;
  const duration = pkg.durationMinutes || 60;
  const passingGrade = pkg.passingGrade || 75;

  const handleStart = () => {
    if (!hasAgreed) return;
    onConfirmStart(pkg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-purple-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 text-white p-6 border-b-4 border-amber-400 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup Petunjuk"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1.5 pr-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-purple-950 text-xs font-black uppercase tracking-wider font-display shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-purple-950 text-purple-950" />
              Briefing Sukses Juara CBT
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display leading-tight">
              {pkg.title}
            </h2>
            <p className="text-xs text-purple-200">
              Fokus, percaya diri, dan kerahkan kemampuan terbaikmu! Pahami 5 taktik pengerjaan berikut:
            </p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Quick Exam Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <Clock className="w-5 h-5 text-purple-700 mx-auto mb-1" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Durasi Waktu</span>
              <span className="text-base sm:text-lg font-black text-purple-950 font-mono">
                {duration} Menit
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <BookOpen className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Jumlah Soal</span>
              <span className="text-base sm:text-lg font-black text-purple-950 font-mono">
                {qCount} Butir
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Target KKM</span>
              <span className="text-base sm:text-lg font-black text-emerald-800 font-mono">
                {passingGrade} / 100
              </span>
            </div>
          </div>

          {/* Important Instructions List */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>5 Taktik Sukses Menghadapi Ujian CBT</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700">
              
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-900 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  1
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Timer Presisi & Auto-Save Cerdas 0ms</strong>
                  <span>Waktu ujian langsung berjalan mundur saat tombol mulai diklik. Tenang, setiap pilihanmu tersimpan otomatis di perangkat secara lokal tanpa lag!</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-900 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  2
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Taklukkan 4 Format Soal Standar Nasional</strong>
                  <span>Latih fleksibilitas berpikirmu menghadapi <em>Pilihan Ganda (PG)</em>, <em>PG Kompleks</em> (pilih lebih dari satu), <em>Menjodohkan</em>, dan <em>Benar / Salah</em>.</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-900 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  3
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Antarmuka Split-Card Modern & Responsif</strong>
                  <span>Kartu atas menyajikan stimulus teks bacaan atau gambar data, kartu bawah memuat pertanyaan. Sangat nyaman dibaca di layar HP tanpa scroll melelahkan.</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-900 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  4
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Manfaatkan Tanda 'Ragu-Ragu' & Navigasi Cepat</strong>
                  <span>Jika menemui soal rumit, tandai 'Ragu-ragu' (kuning). Jangan terjebak di 1 nomor; kamu bisa melompat ke nomor manapun lewat laci navigasi soal.</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-900 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  5
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Kunci Pembahasan & Trik 15 Detik Mas Aira</strong>
                  <span>Selesai ujian, skor KKM seketika dihitung otomatis dan seluruh kunci jawaban lengkap dengan rahasia trik cepat Mas Aira langsung dapat dipelajari!</span>
                </div>
              </div>

            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="p-4 rounded-2xl bg-purple-50/80 border-2 border-purple-200">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-md border-purple-300 text-purple-900 focus:ring-purple-700 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 leading-snug">
                Saya siap fokus 100%, percaya diri, dan bertekad mencetak rekor nilai terbaik di simulasi CBT ini!
              </span>
            </label>
          </div>

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Batal / Kembali
          </button>

          <button
            onClick={handleStart}
            disabled={!hasAgreed}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              hasAgreed
                ? 'bg-gradient-to-r from-purple-900 via-purple-950 to-indigo-950 hover:from-purple-800 hover:to-purple-900 text-white border-2 border-amber-400 hover:scale-105 cursor-pointer shadow-purple-900/20'
                : 'bg-slate-300 text-slate-500 border border-slate-300 cursor-not-allowed opacity-70'
            }`}
          >
            <Play className={`w-4 h-4 ${hasAgreed ? 'fill-amber-400 text-amber-400' : 'fill-slate-500'}`} />
            <span>SAYA SIAP, GAS MULAI UJIAN SEKARANG ⚡</span>
          </button>
        </div>

      </div>
    </div>
  );
};
