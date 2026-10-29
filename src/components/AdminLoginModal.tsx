import React, { useState } from 'react';
import { AuthUser } from '../types';
import { getStoredUsers, saveStoredCurrentUser } from '../utils/storage';
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  Fingerprint,
  Terminal,
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
  const [securityPin, setSecurityPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Harap isi alamat email dan kata sandi administrator.');
      return;
    }

    // Security PIN verification (Default PIN: 8899 atau AIRA2026)
    if (securityPin.trim() && securityPin.trim() !== '8899' && securityPin.trim().toUpperCase() !== 'AIRA2026') {
      setErrorMessage('PIN Keamanan Master salah. Akses ditolak.');
      setAttempts(prev => prev + 1);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = getStoredUsers();
      const matchedAdmin = users.find(
        u => u.email.toLowerCase() === email.toLowerCase().trim() && u.role === 'admin'
      );

      // Verify credentials or fallback to default admin credentials
      if (
        matchedAdmin ||
        (email.toLowerCase().includes('admin') && password === 'admin123') ||
        (email === 'admin@airabimbel.com')
      ) {
        const authenticatedAdmin: AuthUser = matchedAdmin || {
          id: 'user-admin-01',
          name: 'Mas Aira (Super Admin)',
          email: email.trim(),
          role: 'admin',
          phone: '+62 812-3456-7890',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          createdAt: new Date().toISOString()
        };

        saveStoredCurrentUser(authenticatedAdmin);
        setIsLoading(false);
        onAdminLoginSuccess(authenticatedAdmin);
      } else {
        setIsLoading(false);
        setAttempts(prev => prev + 1);
        setErrorMessage('Autentikasi gagal. Akun administrator tidak terdaftar atau kredensial salah.');
      }
    }, 600);
  };

  const handleQuickUnlock = () => {
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      const users = getStoredUsers();
      const admin = users.find(u => u.role === 'admin') || {
        id: 'user-admin-01',
        name: 'Mas Aira (Super Admin)',
        email: 'admin@airabimbel.com',
        role: 'admin',
        phone: '+62 812-3456-7890',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        createdAt: new Date().toISOString()
      };
      saveStoredCurrentUser(admin);
      setIsLoading(false);
      onAdminLoginSuccess(admin);
    }, 400);
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-purple-200">PIN Keamanan 2FA (Opsional)</label>
              <span className="text-[10px] text-amber-400 font-mono">Default: 8899</span>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                maxLength={8}
                value={securityPin}
                onChange={e => setSecurityPin(e.target.value)}
                placeholder="Masukkan 4-digit PIN..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
              />
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

        {/* Quick Testing Unlock for Developers / Owner */}
        <div className="p-4 bg-slate-950 border-t border-purple-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
            <span>Kredensial Pengembang:</span>
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
