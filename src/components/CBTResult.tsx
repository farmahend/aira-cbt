import React, { useEffect, useState } from 'react';
import { ExamSessionResult, Question, PackageItem } from '../types';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MathText } from './MathText';

interface CBTResultProps {
  result: ExamSessionResult;
  questions: Question[];
  onRetake: () => void;
  onGoHome: () => void;
  onOpenPackageBuy: () => void;
}

export const CBTResult: React.FC<CBTResultProps> = ({
  result,
  questions,
  onRetake,
  onGoHome,
  onOpenPackageBuy,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'incorrect'>('all');
  const [expandedExplanation, setExpandedExplanation] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (result.percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // silent fallback
      }
    }
  }, [result.percentage]);

  const toggleExplanation = (qId: string) => {
    setExpandedExplanation((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} menit ${s} detik`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Score Card Hero */}
        <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-xl overflow-hidden">
          
          <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 text-center relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-purple-950 text-xs font-black uppercase mb-3 shadow-xs font-display">
              <Sparkles className="w-3.5 h-3.5 fill-purple-950 text-purple-950" />
              Laporan Evaluasi Prestasi CBT
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {result.examTitle}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1">
              Diselesaikan pada {new Date(result.completedAt).toLocaleString('id-ID')}
            </p>

            {/* Score Ring / Hero Number */}
            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 rounded-full bg-white/10 border-4 border-amber-400 flex flex-col items-center justify-center shadow-lg">
                <span className="text-4xl font-black text-amber-300 font-sans tabular-nums">
                  {result.percentage}
                </span>
                <span className="text-[10px] text-purple-200 font-semibold uppercase tracking-wider">
                  Skor / 100
                </span>
              </div>

              <div className="mt-3">
                {result.isPassed ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold text-xs shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    LUAR BIASA! KAMU LULUS MEMENUHI KKM JUARA 🎉
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-extrabold text-xs shadow-xs">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    TETAP SEMANGAT! EVALUASI & BALAS DI SESI BERIKUTNYA 💪
                  </span>
                )}
              </div>

              {/* Sync Reassurance Badge */}
              <div className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-950/80 text-amber-300 border border-purple-700/60 text-[11px] font-semibold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kalkulasi Otomatis 0ms · Tersimpan Aman & Tersinkronisasi</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/50 p-4 sm:p-6 text-center">
            <div className="p-2">
              <span className="text-xs text-slate-500">Nilai Perolehan</span>
              <div className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5 tabular-nums">
                {result.score} / {result.totalPoints}
              </div>
            </div>

            <div className="p-2">
              <span className="text-xs text-slate-500">Jawaban Tepat</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 tabular-nums">
                {result.correctCount} Soal
              </div>
            </div>

            <div className="p-2">
              <span className="text-xs text-slate-500">Perlu Evaluasi</span>
              <div className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5 tabular-nums">
                {result.incorrectCount + result.unansweredCount} Soal
              </div>
            </div>

            <div className="p-2">
              <span className="text-xs text-slate-500">Kecepatan Sesi</span>
              <div className="text-sm sm:text-base font-bold text-slate-800 mt-1 tabular-nums">
                {formatSeconds(result.timeSpentSeconds)}
              </div>
            </div>
          </div>

        </div>

        {/* Demo Conversion Callout (If it was a demo) */}
        {result.isDemo && (
          <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 rounded-3xl p-6 sm:p-7 text-purple-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-amber-300">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-950 text-amber-300 text-[11px] font-black uppercase font-display">
                <Zap className="w-3.5 h-3.5 fill-amber-300" />
                Akses VIP Semua Jenjang
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-purple-950 font-display">
                Siap Menguasai Seluruh Soal Ujian Asli?
              </h3>
              <p className="text-xs sm:text-sm text-purple-950 font-semibold max-w-xl leading-relaxed">
                Tingkatkan peluang lolos sekolah & PTN impian hingga 98%! Dapatkan akses <strong>60 Hari Penuh</strong> tanpa batas kuota, ribuan kisi-kisi HOTS terbaru, dan video trik cepat Mas Aira mulai Rp 49.000.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onOpenPackageBuy}
                className="px-6 py-3.5 bg-purple-950 hover:bg-purple-900 text-white font-black text-sm rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                <span>🔥 Ambil Paket 60 Hari Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-purple-900 border border-slate-200'
              }`}
            >
              Semua Soal ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('incorrect')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'incorrect'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-rose-700 border border-slate-200'
              }`}
            >
              Perlu Evaluasi ({result.incorrectCount + result.unansweredCount})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRetake}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Tryout</span>
            </button>
            <button
              onClick={onGoHome}
              className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-semibold text-xs sm:text-sm"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>

        {/* Detailed Solutions Review */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-700" />
            <span>Kunci Jawaban & Pembahasan Trik Kilat Aira Bimbel</span>
          </h2>

          {questions.map((q, idx) => {
            const userAns = result.userAnswers[q.id];
            const isExpanded = expandedExplanation[q.id] ?? true;

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs"
              >
                {/* Header of review card */}
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-purple-900 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {q.subject} · {q.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleExplanation(q.id)}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Sembunyikan Pembahasan' : 'Buka Pembahasan'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  
                  {/* Two card comparison preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Stimulus Preview */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                      <span className="font-bold text-slate-900 block">
                        {q.stimulusTitle || 'Stimulus Pernyataan:'}
                      </span>
                      <p className="line-clamp-4 text-slate-600 leading-relaxed">
                        <MathText text={q.stimulusText} />
                      </p>
                    </div>

                    {/* Question & Key */}
                    <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 text-xs text-slate-800 space-y-2">
                      <span className="font-bold text-purple-950 block">Pertanyaan:</span>
                      <p className="font-medium text-slate-900"><MathText text={q.questionPrompt} /></p>
                      
                      {q.type === 'pilihan_ganda' && (
                        <div className="pt-2 text-xs">
                          <span className="text-emerald-700 font-bold">
                            Kunci Jawaban: {q.options?.find(o => o.id === q.correctOptionId)?.label}. {q.options?.find(o => o.id === q.correctOptionId)?.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Solution with Fast Trick */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      
                      {/* Fast Trick Ala Aira Bimbel */}
                      {q.fastTrick && (
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/60 rounded-xl border border-amber-300 flex items-start gap-3">
                          <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-black text-amber-950 uppercase tracking-wide block">
                              Trik Cepat 15 Detik Mas Aira:
                            </span>
                            <p className="text-xs sm:text-sm text-purple-950 font-semibold mt-0.5 leading-relaxed">
                              <MathText text={q.fastTrick} />
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Full Concept Explanation */}
                      <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 space-y-1">
                        <span className="text-xs font-bold text-purple-950 uppercase tracking-wide block">
                          Pembahasan Konsep Mendalam:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          <MathText text={q.explanation} />
                        </p>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
