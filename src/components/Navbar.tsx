import React, { useState } from 'react';
import { Sparkles, Shield, User, Menu, X, BookOpen, Layers, Bell, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { LandingPageContent, AuthUser, UserRole } from '../types';

interface NavbarProps {
  currentView: 'home' | 'demo' | 'dashboard' | 'admin';
  onNavigate: (view: 'home' | 'demo' | 'dashboard' | 'admin') => void;
  activeSubscriptionsCount: number;
  content: LandingPageContent;
  currentUser: AuthUser | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeSubscriptionsCount,
  content,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <>
      {/* Top Announcement Bar if configured */}
      {content.headerAnnouncement && (
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-slate-950 text-amber-300 py-1.5 px-4 text-center text-[11px] sm:text-xs font-bold border-b border-purple-800 flex items-center justify-center gap-2">
          <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
          <span>{content.headerAnnouncement}</span>
        </div>
      )}

      <header className="aira-main-header sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs">
        <div className="aira-nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 h-18">
            
            {/* Zone 1: Wordmark with brand badge */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center text-amber-400 font-extrabold text-xl shadow-md shadow-purple-900/10 group-hover:scale-105 transition-transform font-display">
                  {content.brandFirstName ? content.brandFirstName.charAt(0) : 'A'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight text-purple-950 font-display leading-none">
                    {content.brandFirstName}<span className="text-amber-500">{content.brandLastName}</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 tracking-wide mt-0.5">
                    {content.brandSlogan}
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
              <button
                onClick={() => onNavigate('home')}
                className={`hover:text-purple-700 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'home' ? 'text-purple-700 font-bold' : ''
                }`}
              >
                Beranda
              </button>

              <a
                href="#paket-tka"
                onClick={(e) => {
                  if (currentView !== 'home') {
                    e.preventDefault();
                    onNavigate('home');
                    setTimeout(() => {
                      const el = document.getElementById('paket-tka');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className="hover:text-purple-700 transition-colors whitespace-nowrap shrink-0"
              >
                Paket 60 Hari
              </a>

              <button
                onClick={() => onNavigate('demo')}
                className={`flex items-center gap-1.5 hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'demo' ? 'text-amber-600 font-bold' : 'text-amber-600 font-semibold'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Demo CBT Gratis
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-1.5 hover:text-purple-700 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'dashboard' ? 'text-purple-700 font-bold' : ''
                }`}
              >
                <User className="w-4 h-4" />
                Ruang Belajar
                {activeSubscriptionsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-purple-100 text-purple-800 text-xs font-bold rounded-md">
                    {activeSubscriptionsCount}
                  </span>
                )}
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                    currentView === 'admin'
                      ? 'bg-purple-900 text-white'
                      : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>Portal Admin</span>
                </button>
              )}
            </nav>

            {/* Zone 3: Auth Profile or Login/Register Action */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              
              {currentUser ? (
                // LOGGED IN USER BADGE & DROPDOWN
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-2xl transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-900 text-amber-300 font-black text-xs flex items-center justify-center overflow-hidden border border-purple-200">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="text-left text-xs leading-tight">
                      <div className="font-extrabold text-slate-900 truncate max-w-[120px]">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] font-bold text-purple-700 uppercase">
                        {currentUser.role === 'admin' ? 'Super Admin' : `Siswa ${currentUser.grade || 'TKA'}`}
                      </div>
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="font-bold text-slate-900">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                      </div>

                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-purple-50 font-semibold text-slate-700 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-purple-700" />
                        <span>Ruang Belajar Saya</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-purple-50 font-bold text-purple-950 flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4 text-amber-500" />
                          <span>Buka Portal Admin</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 font-bold text-rose-600 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // NOT LOGGED IN: MASUK & DAFTAR BUTTONS
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-purple-900 hover:bg-purple-50 rounded-xl transition-all"
                  >
                    Masuk
                  </button>

                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-4 py-2 text-xs font-black text-purple-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-sm transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Daftar Akun</span>
                  </button>
                </div>
              )}

              {/* Demo CTA Button */}
              <button
                onClick={() => onNavigate('demo')}
                className="px-3.5 py-2 text-xs font-bold text-white bg-purple-900 hover:bg-purple-950 rounded-xl shadow-xs transition-all hover:scale-[1.02] whitespace-nowrap shrink-0"
              >
                Coba CBT
              </button>

            </div>

            {/* Mobile hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {!currentUser ? (
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-black rounded-lg bg-amber-400 text-purple-950"
                >
                  Masuk
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-8 h-8 rounded-full bg-purple-900 text-amber-300 font-bold text-xs flex items-center justify-center overflow-hidden"
                >
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-purple-100 bg-white px-4 pt-3 pb-5 space-y-3">
            {currentUser && (
              <div className="p-3 bg-purple-50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm text-slate-900">{currentUser.name}</div>
                  <div className="text-xs text-purple-700 font-semibold">{currentUser.email}</div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 text-rose-600 hover:bg-white rounded-lg"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-800 hover:bg-purple-50"
            >
              Beranda
            </button>
            <button
              onClick={() => {
                onNavigate('demo');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Demo CBT Gratis
              </span>
              <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">Free</span>
            </button>
            <button
              onClick={() => {
                onNavigate('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-800 hover:bg-purple-50 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                Ruang Belajar Saya
              </span>
              {activeSubscriptionsCount > 0 && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                  {activeSubscriptionsCount} Aktif
                </span>
              )}
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  onNavigate(currentView === 'admin' ? 'home' : 'admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-purple-900 bg-purple-50 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-500" />
                {currentView === 'admin' ? 'Kembali ke Tampilan Siswa' : 'Buka Portal Admin'}
              </button>
            )}

            {!currentUser && (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-slate-100 text-slate-800"
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-amber-400 text-purple-950"
                >
                  Daftar Akun
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
