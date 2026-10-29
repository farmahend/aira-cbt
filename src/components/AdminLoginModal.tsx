import React, { useState } from 'react';
import { Shield, X, Chrome, AlertTriangle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: (adminUser: any) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!supabaseUrl || !supabaseAnonKey) {
      setErrorMessage('Konfigurasi Supabase belum tersedia. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Cloudflare Pages.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    const oauthUrl = new URL('/auth/v1/authorize', supabaseUrl);
    oauthUrl.searchParams.set('provider', 'google');
    oauthUrl.searchParams.set('redirect_to', window.location.origin);
    oauthUrl.searchParams.set('apikey', supabaseAnonKey);
    window.location.assign(oauthUrl.toString());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      {isLoading && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-6 text-center" role="status" aria-live="polite">
          <div className="w-full max-w-sm rounded-[2rem] border border-amber-300/20 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 p-9 text-white shadow-2xl">
            <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-purple-400/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-300 border-r-purple-400 animate-spin" />
              <Shield className="h-8 w-8 text-amber-300 animate-pulse" />
            </div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-amber-300">AIRA • SECURE GATE</p>
            <h3 className="mt-3 text-2xl font-black">Menyiapkan Dashboard Admin</h3>
            <p className="mt-2 text-sm leading-relaxed text-purple-200">Menghubungkan Google dan memeriksa akses administrator. Mohon tunggu sebentar.</p>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/5 rounded-full bg-gradient-to-r from-amber-300 via-purple-300 to-amber-300 animate-pulse" /></div>
          </div>
        </div>
      )}
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-white">
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 p-6 border-b border-purple-500/30 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Shield className="w-4 h-4" /> Gerbang Administrator
            </div>
            <h3 className="text-xl font-black mt-2">Login Admin Aira Bimbel</h3>
            <p className="text-sm text-purple-200 mt-1">Masuk menggunakan akun Google yang sudah diberi role admin di Supabase.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-300" title="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-900/40 border border-rose-500/50 text-sm text-rose-200 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <><span className="h-5 w-5 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" /> Menghubungkan...</> : <><Chrome className="w-5 h-5" /> Lanjutkan dengan Google</>}
          </button>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hanya akun dengan role <code className="text-amber-300">admin</code> pada tabel <code>profiles</code> yang akan diarahkan ke dashboard admin. Akun lain tetap masuk sebagai siswa.
          </p>
        </div>
      </div>
    </div>
  );
};
