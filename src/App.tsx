import React, { useState } from 'react';
import {
  Question,
  Exam,
  PackageItem,
  StudentSubscription,
  ExamSessionResult,
  IntegrationConfig,
  LandingPageContent,
  AuthUser,
  UserRole
} from './types';
import {
  getStoredQuestions,
  saveStoredQuestions,
  getStoredExams,
  saveStoredExams,
  getStoredPackages,
  saveStoredPackages,
  getStoredSubscriptions,
  getStoredResults,
  saveExamResult,
  getStoredConfig,
  saveStoredConfig,
  getStoredLandingContent,
  saveStoredLandingContent,
  resetStoredLandingContent,
  getStoredCurrentUser,
  saveStoredCurrentUser,
  syncExamResultToDatabase
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GradePackages } from './components/GradePackages';
import { FeaturesSection } from './components/FeaturesSection';
import { Footer } from './components/Footer';
import { CBTExam } from './components/CBTExam';
import { CBTResult } from './components/CBTResult';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminPortal } from './components/AdminPortal';
import { MidtransModal } from './components/MidtransModal';
import { AuthModal } from './components/AuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Sparkles, ArrowRight, Lock, UserCheck } from 'lucide-react';

export default function App() {
  // Authentication State
  const initialUser = getStoredCurrentUser();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(initialUser);

  // Complete Supabase OAuth callback after Google redirects back to this site.
  React.useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token=')) return;
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken = params.get('access_token');
    const authError = params.get('error_description') || params.get('error');
    if (authError) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      console.error('Supabase Google OAuth error:', authError);
      return;
    }
    if (!accessToken) return;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!supabaseUrl || !supabaseAnonKey) return;

    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    localStorage.setItem('aira_supabase_access_token', accessToken);
    fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}` }
    })
      .then(async response => {
        if (!response.ok) throw new Error('Gagal memverifikasi akun Google di Supabase.');
        return response.json();
      })
      .then(async (profile: { id: string; email?: string; user_metadata?: { full_name?: string; name?: string; avatar_url?: string; picture?: string } }) => {
        const profileResponse = await fetch(
          `${supabaseUrl.replace(/\\/$/, '')}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(profile.id)}`,
          { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}` } }
        );
        if (!profileResponse.ok) {
          throw new Error('Gagal membaca role akun dari tabel profiles. Pastikan kebijakan RLS mengizinkan pengguna membaca profilnya sendiri.');
        }
        const rows: Array<{ role?: string }> = await profileResponse.json();
        const role: UserRole = rows[0]?.role === 'admin' ? 'admin' : 'customer';
        const name = profile.user_metadata?.full_name || profile.user_metadata?.name || profile.email?.split('@')[0] || 'Siswa';
        const user: AuthUser = {
          id: profile.id,
          name,
          email: profile.email || '',
          role,
          grade: 'SMP',
          avatarUrl: profile.user_metadata?.avatar_url || profile.user_metadata?.picture || ''
        } as AuthUser;
        saveStoredCurrentUser(user);
        setCurrentUser(user);
        setCurrentView(role === 'admin' ? 'admin' : 'dashboard');
        setIsAdminLoginModalOpen(false);
      })
      .catch(error => {
        console.error('Supabase Google OAuth callback failed:', error);
        localStorage.removeItem('aira_supabase_access_token');
      });
  }, []);

  // Navigation View State: strictly dynamic based on authenticated user
  const [currentView, setCurrentView] = useState<
    'home' | 'demo' | 'dashboard' | 'admin' | 'cbt' | 'cbt_result'
  >(() => {
    if (initialUser?.role === 'admin') return 'admin';
    if (initialUser?.role === 'customer') return 'dashboard';
    return 'home';
  });

  // Auth Modals State (Students / Customers)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authTargetNotice, setAuthTargetNotice] = useState<string>('');
  const [postAuthAction, setPostAuthAction] = useState<
    | { type: 'demo' }
    | { type: 'buy'; pkg: PackageItem }
    | { type: 'dashboard' }
    | null
  >(null);

  // Dedicated Secure Admin Gateway State (Completely separated from student login)
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Hidden Keyboard Shortcut (Ctrl + Alt + A) to open Secure Admin Gate
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAdminLoginModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Core Data State
  const [questions, setQuestions] = useState<Question[]>(getStoredQuestions());
  const [exams, setExams] = useState<Exam[]>(getStoredExams());
  const [packages, setPackages] = useState<PackageItem[]>(getStoredPackages());
  const [subscriptions, setSubscriptions] = useState<StudentSubscription[]>(getStoredSubscriptions());
  const [pastResults, setPastResults] = useState<ExamSessionResult[]>(getStoredResults());
  const [config, setConfig] = useState<IntegrationConfig>(getStoredConfig());
  const [landingContent, setLandingContent] = useState<LandingPageContent>(getStoredLandingContent());

  // Active CBT Session State
  const [activePackage, setActivePackage] = useState<PackageItem | null>(null);
  const [activeExamQuestions, setActiveExamQuestions] = useState<Question[]>([]);
  const [currentResult, setCurrentResult] = useState<ExamSessionResult | null>(null);

  // Payment Modal State
  const [isMidtransModalOpen, setIsMidtransModalOpen] = useState(false);
  const [selectedPackageForBuy, setSelectedPackageForBuy] = useState<PackageItem | null>(null);

  // Save Handlers for Admin
  const handleSaveQuestions = (updated: Question[]) => {
    setQuestions(updated);
    saveStoredQuestions(updated);
  };

  const handleSaveExams = (updated: Exam[]) => {
    setExams(updated);
    saveStoredExams(updated);
  };

  const handleSavePackages = (updated: PackageItem[]) => {
    setPackages(updated);
    saveStoredPackages(updated);
    const syncedExams: Exam[] = updated.map(p => ({
      id: p.id,
      title: p.title,
      grade: p.grade,
      subject: p.tagline,
      description: p.features.join(' • '),
      isDemo: !!p.isDemo,
      durationMinutes: p.durationMinutes || 45,
      passingGrade: p.passingGrade || 75,
      questions: p.questions,
      questionIds: p.questions ? p.questions.map(q => q.id) : []
    }));
    setExams(syncedExams);
    saveStoredExams(syncedExams);
  };

  const handleSaveConfig = (updated: IntegrationConfig) => {
    setConfig(updated);
    saveStoredConfig(updated);
  };

  const handleSaveLandingContent = (updated: LandingPageContent) => {
    setLandingContent(updated);
    saveStoredLandingContent(updated);
  };

  const handleResetLandingContent = () => {
    const res = resetStoredLandingContent();
    setLandingContent(res);
  };

  // Auth Open Modal Helper (Strictly for Students/Customers)
  const openAuth = (mode: 'login' | 'register' = 'login', notice: string = '') => {
    setAuthInitialMode(mode);
    setAuthTargetNotice(notice);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    saveStoredCurrentUser(null);
    setCurrentUser(null);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: AuthUser, intendedPackageId?: string) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
    setIsAuthModalOpen(false);

    if (user.role === 'admin') {
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Customer / Student: Switch directly to pristine Student Workspace
    if (postAuthAction) {
      if (postAuthAction.type === 'demo') {
        const demoPkg = packages.find(p => p.isDemo) || packages[0];
        launchPackageExam(demoPkg);
      } else if (postAuthAction.type === 'buy') {
        setSelectedPackageForBuy(postAuthAction.pkg);
        setIsMidtransModalOpen(true);
        setCurrentView('dashboard');
      } else if (postAuthAction.type === 'dashboard') {
        setCurrentView('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setPostAuthAction(null);
    } else if (intendedPackageId) {
      const chosen = packages.find(p => p.id === intendedPackageId);
      if (chosen && !chosen.isDemo && chosen.price > 0) {
        setSelectedPackageForBuy(chosen);
        setIsMidtransModalOpen(true);
      }
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Launch CBT Session directly from a Package
  const launchPackageExam = (pkgToLaunch: PackageItem) => {
    // REQUIRE AUTH FOR CBT (DEMO OR PAID)
    if (!currentUser) {
      setPostAuthAction({ type: 'demo' });
      openAuth(
        'login',
        'Wajib memiliki akun terdaftar untuk memulai Ujian CBT Aira Bimbel!'
      );
      return;
    }

    let resolvedQuestions = pkgToLaunch.questions && pkgToLaunch.questions.length > 0
      ? pkgToLaunch.questions
      : questions.filter(q => q.grade === pkgToLaunch.grade);

    if (resolvedQuestions.length === 0) {
      resolvedQuestions = questions.slice(0, 5);
    }

    setActivePackage(pkgToLaunch);
    setActiveExamQuestions(resolvedQuestions);
    setCurrentView('cbt');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Demo Exam Trigger (GATED)
  const handleStartDemo = () => {
    if (!currentUser) {
      setPostAuthAction({ type: 'demo' });
      openAuth(
        'register',
        'Silakan Masuk atau Buat Akun Gratis untuk Mencoba Demo CBT TKA!'
      );
      return;
    }

    const demoPkg = packages.find((p) => p.isDemo) || packages[0];
    launchPackageExam(demoPkg);
  };

  // Package Buy Trigger (GATED)
  const handleSelectPackageForBuy = (pkg: PackageItem) => {
    if (!currentUser) {
      setPostAuthAction({ type: 'buy', pkg });
      openAuth(
        'register',
        `Silakan masuk atau buat akun terlebih dahulu untuk melanjutkan pembelian ${pkg.title}!`
      );
      return;
    }

    setSelectedPackageForBuy(pkg);
    setIsMidtransModalOpen(true);
  };

  const handleFinishExam = (result: ExamSessionResult) => {
    saveExamResult(result);
    setPastResults(getStoredResults());
    setCurrentResult(result);
    // Asynchronous non-blocking sync to database (Supabase / Cloud)
    syncExamResultToDatabase(result, config);
    setCurrentView('cbt_result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = () => {
    setSubscriptions(getStoredSubscriptions());
  };

  // Navigation Guard for Public Navbar
  const handleNavigate = (view: 'home' | 'demo' | 'dashboard' | 'admin') => {
    if (view === 'demo') {
      handleStartDemo();
      return;
    }

    if (view === 'dashboard') {
      if (!currentUser) {
        setPostAuthAction({ type: 'dashboard' });
        openAuth(
          'login',
          'Masuk ke akun Anda untuk membuka Ruang Belajar & Tryout aktif!'
        );
        return;
      }
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        setIsAdminLoginModalOpen(true);
        return;
      }
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* =========================================================================
          ROUTER CASE 1: LOGGED IN AS ADMINISTRATOR
          Strictly Admin Studio Portal. Zero landing page components.
         ========================================================================= */}
      {currentUser && currentUser.role === 'admin' ? (
        <AdminPortal
          questions={questions}
          exams={exams}
          packages={packages}
          config={config}
          landingContent={landingContent}
          onSaveQuestions={handleSaveQuestions}
          onSaveExams={handleSaveExams}
          onSavePackages={handleSavePackages}
          onSaveConfig={handleSaveConfig}
          onSaveLandingContent={handleSaveLandingContent}
          onResetLandingContent={handleResetLandingContent}
          onExitAdmin={handleLogout}
          onPreviewPackageCBT={launchPackageExam}
        />
      ) : currentUser && currentUser.role === 'customer' ? (
        /* =======================================================================
            ROUTER CASE 2: LOGGED IN AS STUDENT / CUSTOMER
            Strictly Student Portal / CBT Simulator. Zero landing page components.
           ======================================================================= */
        <>
          {currentView === 'cbt' && activePackage ? (
            <CBTExam
              exam={{
                id: activePackage.id,
                title: activePackage.title,
                grade: activePackage.grade,
                subject: activePackage.tagline,
                description: activePackage.features.join(' • '),
                isDemo: !!activePackage.isDemo,
                durationMinutes: activePackage.durationMinutes || 45,
                passingGrade: activePackage.passingGrade || 75,
                questionIds: activeExamQuestions.map(q => q.id)
              }}
              questions={activeExamQuestions}
              onFinishExam={handleFinishExam}
              onExitExam={() => setCurrentView('dashboard')}
            />
          ) : currentView === 'cbt_result' && currentResult ? (
            <CBTResult
              result={currentResult}
              questions={activeExamQuestions}
              onRetake={() => {
                if (activePackage) launchPackageExam(activePackage);
              }}
              onGoHome={() => setCurrentView('dashboard')}
              onOpenPackageBuy={() => {
                const defaultPkg = packages.find((p) => p.isPopular) || packages[1] || packages[0];
                handleSelectPackageForBuy(defaultPkg);
              }}
            />
          ) : (
            <StudentDashboard
              user={currentUser}
              subscriptions={subscriptions}
              packages={packages}
              pastResults={pastResults}
              onStartPackageExam={launchPackageExam}
              onBuyPackage={handleSelectPackageForBuy}
              onViewResult={(res) => {
                setCurrentResult(res);
                const pkg = packages.find(p => p.id === res.examId);
                if (pkg && pkg.questions && pkg.questions.length > 0) {
                  setActiveExamQuestions(pkg.questions);
                  setActivePackage(pkg);
                } else {
                  const matchedQuestions = questions.filter((q) =>
                    Object.keys(res.userAnswers).includes(q.id)
                  );
                  setActiveExamQuestions(
                    matchedQuestions.length > 0 ? matchedQuestions : questions.slice(0, 5)
                  );
                }
                setCurrentView('cbt_result');
              }}
              onLogout={handleLogout}
            />
          )}
        </>
      ) : (
        /* =======================================================================
            ROUTER CASE 3: GUEST / NOT LOGGED IN
            Public Landing Page with student login and discreet admin access.
           ======================================================================= */
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900">
          <Navbar
            currentView="home"
            onNavigate={handleNavigate}
            activeSubscriptionsCount={0}
            content={landingContent}
            currentUser={null}
            onOpenAuth={openAuth}
            onLogout={handleLogout}
          />

          <main className="flex-1">
            <Hero
              onStartDemo={handleStartDemo}
              onExplorePackages={() => {
                const el = document.getElementById('paket-tka');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              content={landingContent}
            />

            {/* Standalone Interactive Demo Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
              <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-amber-400 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-purple-950 text-xs font-black uppercase font-display">
                    <Sparkles className="w-3.5 h-3.5" />
                    {landingContent.demoBannerKicker}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                    {landingContent.demoBannerTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-200 max-w-xl font-sans">
                    {landingContent.demoBannerDescription}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleStartDemo}
                    className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-2 text-sm"
                  >
                    <span>{landingContent.demoBannerCtaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <GradePackages
              packages={packages}
              onSelectPackage={handleSelectPackageForBuy}
              onTryDemo={handleStartDemo}
              onLaunchPackageCBT={launchPackageExam}
              content={landingContent}
            />

            <FeaturesSection content={landingContent} />
          </main>

          <Footer
            content={landingContent}
            onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
          />
        </div>
      )}

      {/* =======================================================================
          GLOBAL MODALS (MIDTRANS SNAP, AUTH MODAL, ADMIN GATE)
         ======================================================================= */}
      <MidtransModal
        packageItem={selectedPackageForBuy}
        isOpen={isMidtransModalOpen}
        onClose={() => setIsMidtransModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authInitialMode}
        targetActionNotice={authTargetNotice}
        packages={packages}
        preSelectedPackageId={postAuthAction && 'pkg' in postAuthAction ? postAuthAction.pkg.id : undefined}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPostAuthAction(null);
        }}
        onAuthSuccess={handleAuthSuccess}
      />

      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onAdminLoginSuccess={(adminUser) => {
          setCurrentUser(adminUser);
          setIsAdminLoginModalOpen(false);
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </>
  );
}
