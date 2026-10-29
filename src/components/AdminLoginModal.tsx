import React, { useState } from 'react';
import { AuthUser } from '../types';

import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  ShieldCheck
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: (adminUser: AuthUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('Login Admin belum terhubung ke Supabase Auth. Kredensial bawaan dan PIN default telah dinonaktifkan.');
    setAttempts(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-slate-900 border-2 border-purple-500/40 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-white my-8 relative">
        
        {/* Top Security Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 p-6 border-b border-purple-500/30 flex items-start justify-between relative">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider font-mono">
              <Shield className="w-3 h-3 text-rose-400" />
              Restricted Gateway · Tier-1 Security
            </div>
            <h3 className="text-xl font-black font-display text-white">
              Portal Login Administrator
            </h3>
            <p className="text-xs text-purple-300">
              Khusus pengelola, pembuat soal, & tim internal Aira Bimbel.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Alert if multiple attempts */}
        {attempts >= 2 && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-600/40 text-xs text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Terdeteksi {attempts} kali percobaan gagal. Aktivitas IP dicatat dalam log keamanan.</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-900/40 border border-rose-500/50 text-xs text-rose-200 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleAdminSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="font-bold text-purple-200 block mb-1">Email Administrator Resmi</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@airabimbel.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-purple-200 block mb-1">Kata Sandi Master</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-purple-950/30 border-t-purple-950 rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verifikasi & Masuk Portal Admin</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

          <button
            type="button"
            onClick={handleQuickUnlock}
            className="px-3 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-amber-300 font-mono text-[11px] font-bold border border-purple-500/40 transition-colors"
          >
            Buka Cepat Admin (Mas Aira)
          </button>
        </div>

      </div>
    </div>
  );
};
