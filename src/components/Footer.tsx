import React from 'react';
import { Shield, Sparkles, Heart, Phone, Mail, Lock } from 'lucide-react';
import { LandingPageContent } from '../types';

interface FooterProps {
  content: LandingPageContent;
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ content, onOpenAdminLogin }) => {
  return (
    <footer className="bg-purple-950 text-white border-t-2 border-amber-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-black text-lg font-display">
                {content.brandFirstName ? content.brandFirstName.charAt(0) : 'A'}
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                {content.brandFirstName}<span className="text-amber-400">{content.brandLastName}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed max-w-sm">
              {content.footerDescription}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-purple-300">
              <span className="px-2.5 py-1 bg-white/10 rounded-md">{content.footerBadge1}</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-md">{content.footerBadge2}</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-md">{content.footerBadge3}</span>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-amber-300">
              {content.footerContactWhatsApp && (
                <div className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5" />
                  <span>WA: {content.footerContactWhatsApp}</span>
                </div>
              )}
              {content.footerContactEmail && (
                <div className="flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email: {content.footerContactEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Jenjang Soal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-display">
              Jenjang Soal TKA
            </h4>
            <ul className="space-y-2 text-xs text-purple-200">
              <li>
                <a href="#paket-tka" className="hover:text-white transition-colors">
                  TKA SD (Asesmen & Masuk SMP Favorit)
                </a>
              </li>
              <li>
                <a href="#paket-tka" className="hover:text-white transition-colors">
                  TKA SMP (Taruna Nusantara & SMA Unggulan)
                </a>
              </li>
              <li>
                <a href="#paket-tka" className="hover:text-white transition-colors">
                  TKA SMA (SNBT UTBK & Sekolah Kedinasan)
                </a>
              </li>
              <li>
                <a href="#paket-tka" className="hover:text-white transition-colors">
                  Paket All-Access 60 Hari
                </a>
              </li>
            </ul>
          </div>

          {/* Model Soal & Arsitektur */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-display">
              Spesifikasi Sistem
            </h4>
            <ul className="space-y-2 text-xs text-purple-200">
              <li>Pilihan Ganda & Kompleks (HOTS)</li>
              <li>Menjodohkan & Tabel Benar/Salah</li>
              <li>Midtrans Snap Payment Gateway</li>
              <li>Database Supabase & Next.js Engine</li>
              <li>Cloudinary CDN Media & Cloudflare Host</li>
            </ul>
          </div>

        </div>

        {/* Bottom bar with discreet internal admin link */}
        <div className="pt-8 border-t border-purple-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-300">
          <div>
            &copy; {new Date().getFullYear()} {content.footerCopyright}
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Didesain dengan bangga untuk generasi penerus bangsa</span>
            
            {onOpenAdminLogin && (
              <>
                <span className="text-purple-700">·</span>
                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="text-purple-400 hover:text-amber-300 transition-colors flex items-center gap-1 opacity-70 hover:opacity-100 font-mono"
                  title="Akses Khusus Pengelola & Guru Bimbel"
                >
                  <Lock className="w-3 h-3 text-purple-400" />
                  <span>Portal Pengelola Internal</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
