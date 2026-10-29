import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Clock, Award, ShieldCheck, Flame } from 'lucide-react';
import { LandingPageContent } from '../types';

interface HeroProps {
  onStartDemo: () => void;
  onExplorePackages: () => void;
  content: LandingPageContent;
}

export const Hero: React.FC<HeroProps> = ({ onStartDemo, onExplorePackages, content }) => {
  return (
    <section className="aira-hero relative overflow-hidden bg-gradient-to-b from-purple-50/70 via-white to-slate-50 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-purple-100">
      {/* Subtle brand ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tagline kicker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-900 text-xs sm:text-sm font-semibold shadow-xs">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{content.heroTagline}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18] font-display [text-wrap:balance]">
              {content.heroTitlePrefix}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-800 via-purple-700 to-amber-500">
                {content.heroTitleHighlight}
              </span>
            </h1>

            {/* Sub-description */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
              {content.heroDescription}
            </p>

            {/* Value propositions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Format Soal HOTS: PG, Kompleks, Menjodohkan, B/S</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Simulasi Realistis Mirip Ujian BPPP & Kedinasan</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Paket Langganan Aktif 60 Hari Tanpa Batas</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Trik Cepat 15 Detik & Konsep Dasar Tuntas</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onStartDemo}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-bold rounded-xl shadow-md shadow-amber-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-base group"
              >
                <Sparkles className="w-5 h-5 text-purple-950 group-hover:rotate-12 transition-transform" />
                <span>{content.heroPrimaryCtaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExplorePackages}
                className="px-6 py-3.5 bg-white hover:bg-purple-50 text-purple-900 font-bold rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all shadow-xs flex items-center justify-center gap-2 text-base"
              >
                <span>{content.heroSecondaryCtaText}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 flex items-center justify-center lg:justify-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Demo 100% Gratis Tanpa Perlu Kartu Kredit atau Registrasi Rumit</span>
            </p>

          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Back card frame with brand styling */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-purple-600 via-amber-400 to-purple-800 rounded-3xl blur-md opacity-40" />

              <div className="relative bg-white rounded-2xl p-2 shadow-2xl border border-purple-100 overflow-hidden">
                <img
                  src={content.heroBannerUrl || '/src/assets/images/aira_bimbel_hero_1793151843426.jpg'}
                  alt={content.heroTitleHighlight}
                  className="w-full h-auto rounded-xl object-cover max-h-[420px]"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/images/aira_bimbel_hero_1793151843426.jpg';
                  }}
                />

                {/* Floating badge over image */}
                <div className="absolute bottom-4 left-4 right-4 bg-purple-950/90 backdrop-blur-md text-white p-3.5 rounded-xl border border-purple-500/30 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-400 text-purple-950 flex items-center justify-center font-black text-sm">
                      60d
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-display">Masa Aktif Paket 60 Hari</h4>
                      <p className="text-[11px] text-purple-200">Bebas tryout berkali-kali sampai mahir</p>
                    </div>
                  </div>
                  <button
                    onClick={onStartDemo}
                    className="text-xs font-bold text-amber-300 hover:text-white underline decoration-amber-400 underline-offset-4"
                  >
                    Tes Demo &rarr;
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Quantified Proof Row (Claim-to-Proof Adjacency) */}
        <div className="mt-14 pt-8 border-t border-purple-100/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-purple-900 font-display tabular-nums">
              {content.stat1Value}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              {content.stat1Label}
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 font-display tabular-nums">
              {content.stat2Value}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              {content.stat2Label}
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-purple-900 font-display tabular-nums">
              {content.stat3Value}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              {content.stat3Label}
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-display tabular-nums">
              {content.stat4Value}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              {content.stat4Label}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

