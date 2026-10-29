import React, { useState } from 'react';
import { PackageItem, GradeLevel, LandingPageContent } from '../types';
import { formatRupiah } from '../utils/storage';
import { Check, Clock, Sparkles, Zap, Shield, ArrowRight, HelpCircle, Award, BookOpen } from 'lucide-react';

interface GradePackagesProps {
  packages: PackageItem[];
  onSelectPackage: (pkg: PackageItem) => void;
  onTryDemo: () => void;
  onLaunchPackageCBT?: (pkg: PackageItem) => void;
  content: LandingPageContent;
}

export const GradePackages: React.FC<GradePackagesProps> = ({
  packages,
  onSelectPackage,
  onTryDemo,
  onLaunchPackageCBT,
  content,
}) => {
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<GradeLevel>('SEMUA');

  const filteredPackages = selectedGradeFilter === 'SEMUA'
    ? packages
    : packages.filter(p => p.grade === selectedGradeFilter || p.grade === 'SEMUA');

  return (
    <section id="paket-tka" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            {content.packagesSectionKicker}
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display [text-wrap:balance]">
            {content.packagesSectionTitle}
          </h2>
          
          <p className="mt-3 text-base text-slate-600 leading-relaxed font-sans">
            {content.packagesSectionDescription}
          </p>

          {/* Grade filter tabs */}
          <div className="mt-8 inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(['SEMUA', 'SD', 'SMP', 'SMA'] as GradeLevel[]).map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGradeFilter(grade)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  selectedGradeFilter === grade
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-900'
                }`}
              >
                {grade === 'SEMUA' ? 'Semua Jenjang' : `Jenjang ${grade}`}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredPackages.map((pkg) => {
            const isFree = pkg.isDemo || pkg.price === 0;
            const discountPct = pkg.originalPrice > pkg.price
              ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
              : 0;

            const totalQuestions = pkg.questions ? pkg.questions.length : 0;
            const totalPoints = pkg.questions ? pkg.questions.reduce((sum, q) => sum + (q.points || 0), 0) : 100;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col bg-white rounded-2xl border transition-all duration-200 hover:shadow-xl ${
                  pkg.isPopular
                    ? 'border-2 border-purple-600 shadow-lg shadow-purple-900/5 ring-4 ring-purple-100'
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                {/* Popular ribbon */}
                {pkg.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-purple-700 to-amber-500 text-white text-[11px] font-extrabold px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Paling Diminati Siswa
                  </div>
                )}

                {/* Package Banner Image */}
                <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-purple-950">
                  <img
                    src={pkg.bannerUrl || '/src/assets/images/aira_bimbel_hero_1793151843426.jpg'}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/95 via-purple-950/40 to-transparent" />
                  
                  {/* Floating Badges on Banner */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-400 text-purple-950 shadow-xs uppercase tracking-wide">
                        {pkg.grade === 'SEMUA' ? 'SEMUA JENJANG' : `JENJANG ${pkg.grade}`}
                      </span>
                      {pkg.packageType === 'bundle' && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-500 text-purple-950 uppercase shadow-xs">
                          🎁 BUNDLE
                        </span>
                      )}
                    </div>
                    {!isFree && discountPct > 0 && (
                      <span className="text-[11px] font-extrabold text-white bg-rose-600 px-2.5 py-0.5 rounded-full shadow-xs">
                        {pkg.discountBadgeText || `Hemat ${discountPct}%`}
                      </span>
                    )}
                    {isFree && (
                      <span className="text-[11px] font-extrabold text-purple-950 bg-amber-300 px-2.5 py-0.5 rounded-full shadow-xs">
                        GRATIS
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-bold text-amber-300 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      Ujian {pkg.durationMinutes || 45} Menit
                    </span>
                    <span className="text-[11px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {totalQuestions} Butir Soal
                    </span>
                  </div>
                </div>

                <div className="p-6 pb-0 flex-1">
                  {/* Title & Tagline */}
                  <h3 className="text-lg font-bold text-slate-900 font-display leading-snug">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[36px] line-clamp-2">
                    {pkg.tagline}
                  </p>

                  {/* Bundled Grades notice if bundle */}
                  {pkg.packageType === 'bundle' && pkg.bundledGrades && pkg.bundledGrades.length > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Termasuk Jenjang: {pkg.bundledGrades.join(' + ')}</span>
                    </div>
                  )}

                  {/* Pricing Box */}
                  <div className="my-4 pt-1">
                    {!isFree ? (
                      <>
                        <div className="text-xs text-slate-400 line-through">
                          {formatRupiah(pkg.originalPrice)}
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tabular-nums">
                            {formatRupiah(pkg.price)}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/ {pkg.durationDays} hari</span>
                        </div>
                      </>
                    ) : (
                      <div>
                        <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-display">
                          Gratis 100%
                        </span>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">Simulasi Demo CBT Tanpa Syarat</div>
                      </div>
                    )}
                  </div>

                  {/* Highlights Bar */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-purple-50/70 rounded-xl border border-purple-100 text-[11px] mb-4">
                    <div className="flex items-center gap-1 text-purple-950 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>{pkg.durationMinutes || 45} Menit</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-950 font-semibold">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>KKM: {pkg.passingGrade || 75}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <div className="text-xs font-semibold text-slate-800">
                      Fasilitas Paket:
                    </div>
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-tight">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Footer Action */}
                <div className="p-6 pt-4 mt-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl space-y-2">
                  {!isFree ? (
                    <>
                      <button
                        onClick={() => onSelectPackage(pkg)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                          pkg.isPopular
                            ? 'bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-900 hover:to-purple-950 text-white shadow-purple-900/20'
                            : 'bg-purple-900 hover:bg-purple-950 text-white'
                        }`}
                      >
                        <span>Beli Paket 60 Hari</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (onLaunchPackageCBT) {
                            onLaunchPackageCBT(pkg);
                          } else {
                            onTryDemo();
                          }
                        }}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-purple-800 hover:bg-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Coba Demo CBT Dulu</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (onLaunchPackageCBT) {
                          onLaunchPackageCBT(pkg);
                        } else {
                          onTryDemo();
                        }
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 shadow-xs flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Mulai Demo CBT ({pkg.durationMinutes || 15} Menit)</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Reassurance Banner */}
        <div className="mt-12 p-4 sm:p-6 bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-extrabold text-xl shrink-0">
              <Shield className="w-6 h-6 text-purple-950" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Garansi Transaksi Aman via Midtrans & Akses Otomatis 60 Hari
              </h4>
              <p className="text-xs text-purple-200 mt-0.5">
                Mendukung QRIS instan, GoPay, OVO, ShopeePay, Virtual Account BCA, Mandiri, BRI, BNI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onTryDemo}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs"
            >
              Uji Coba Demo CBT Gratis
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
