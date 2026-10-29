import React, { useState, useRef } from 'react';
import {
  Question,
  Exam,
  PackageItem,
  IntegrationConfig,
  QuestionType,
  GradeLevel,
  LandingPageContent,
  QuestionOption,
  MatchingPair,
  TrueFalseStatement
} from '../types';
import { formatRupiah } from '../utils/storage';
import {
  downloadCSVTemplate,
  exportQuestionsToCSV,
  parseQuestionsFromCSV
} from '../utils/csvHelper';
import { CloudinaryImageUploader } from './CloudinaryImageUploader';
import {
  Shield,
  Layers,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Sparkles,
  Save,
  Check,
  X,
  Database,
  Cloud,
  CreditCard,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Eye,
  Copy,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Award,
  Zap,
  HelpCircle,
  Play,
  Tag,
  Percent,
  Activity,
  RefreshCw
} from 'lucide-react';

interface AdminPortalProps {
  questions: Question[];
  exams: Exam[];
  packages: PackageItem[];
  config: IntegrationConfig;
  landingContent: LandingPageContent;
  onSaveQuestions: (questions: Question[]) => void;
  onSaveExams: (exams: Exam[]) => void;
  onSavePackages: (packages: PackageItem[]) => void;
  onSaveConfig: (config: IntegrationConfig) => void;
  onSaveLandingContent: (content: LandingPageContent) => void;
  onResetLandingContent: () => void;
  onExitAdmin: () => void;
  onPreviewPackageCBT?: (pkg: PackageItem) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  questions,
  exams,
  packages,
  config,
  landingContent,
  onSaveQuestions,
  onSaveExams,
  onSavePackages,
  onSaveConfig,
  onSaveLandingContent,
  onResetLandingContent,
  onExitAdmin,
  onPreviewPackageCBT,
}) => {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<'paket' | 'tampilan' | 'integrasi'>('paket');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<GradeLevel>('SEMUA');
  const [salesTypeFilter, setSalesTypeFilter] = useState<'ALL' | 'satuan' | 'bundle'>('ALL');

  // Currently opened package for Question Management Studio
  const [selectedPackageForQuestions, setSelectedPackageForQuestions] = useState<PackageItem | null>(null);

  // Package Modal State (Create or Edit Package)
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // Question Modal State (Add or Edit Question inside a Package)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Landing Page Local State
  const [localLandingContent, setLocalLandingContent] = useState<LandingPageContent>(landingContent);
  const [landingSavedToast, setLandingSavedToast] = useState(false);

  // Integrations Local State & Live Auto-Activation Ping States
  const [localConfig, setLocalConfig] = useState<IntegrationConfig>(config);
  const [configSavedToast, setConfigSavedToast] = useState(false);
  const [liveAutoSavePill, setLiveAutoSavePill] = useState<string | null>(null);

  // Auto-activates and saves config immediately when admin modifies credentials
  const handleUpdateAndAutoActivateConfig = (updates: Partial<IntegrationConfig>, serviceName?: string) => {
    const updated: IntegrationConfig = {
      ...localConfig,
      ...updates,
      midtransAutoActive: updates.midtransClientKey !== undefined ? !!updates.midtransClientKey : localConfig.midtransAutoActive !== false,
      cloudinaryAutoActive: updates.cloudinaryCloudName !== undefined ? !!updates.cloudinaryCloudName : localConfig.cloudinaryAutoActive !== false,
      supabaseAutoActive: updates.supabaseUrl !== undefined ? !!updates.supabaseUrl : localConfig.supabaseAutoActive !== false,
      lastActivatedAt: new Date().toISOString()
    };
    setLocalConfig(updated);
    onSaveConfig(updated);
    if (serviceName) {
      setLiveAutoSavePill(`${serviceName} Berhasil Diaktifkan Otomatis!`);
      setTimeout(() => setLiveAutoSavePill(null), 3000);
    }
  };



  // CSV Import State
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [csvFeedback, setCsvFeedback] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: '' });

  // Filter packages by grade and sales type
  const filteredPackages = packages.filter(p => {
    const matchGrade = selectedGradeFilter === 'SEMUA' || p.grade === selectedGradeFilter;
    const pType = p.packageType || 'satuan';
    const matchType = salesTypeFilter === 'ALL' || pType === salesTypeFilter;
    return matchGrade && matchType;
  });

  // =========================================================================
  // PACKAGE CRUD HANDLERS
  // =========================================================================
  const handleOpenCreatePackage = () => {
    const newPkg: PackageItem = {
      id: `pkg-${Date.now()}`,
      title: 'Paket Tryout TKA Baru',
      grade: selectedGradeFilter === 'SEMUA' ? 'SMA' : selectedGradeFilter,
      tagline: 'Latihan intensif TKA dengan sistem CBT standar nasional',
      price: 69000,
      originalPrice: 150000,
      durationDays: 60,
      durationMinutes: 60,
      passingGrade: 75,
      isDemo: false,
      packageType: 'satuan',
      bundledGrades: [],
      discountBadgeText: 'HEMAT 54%',
      bannerUrl: '/src/assets/images/aira_bimbel_hero_1793151843426.jpg',
      features: [
        'Masa aktif paket 60 HARI penuh',
        'Durasi ujian 60 Menit sistem timer',
        'Soal HOTS teruji dengan pembahasan konsep',
        'Trik Cepat 15 Detik Mas Aira',
        'Akses 24/7 via HP, Tablet & Laptop'
      ],
      isPopular: false,
      questions: []
    };
    setEditingPackage(newPkg);
    setIsPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: PackageItem) => {
    setEditingPackage({ ...pkg, features: [...(pkg.features || [])] });
    setIsPackageModalOpen(true);
  };

  const handleSavePackageModal = () => {
    if (!editingPackage || !editingPackage.title.trim()) return;

    const exists = packages.some(p => p.id === editingPackage.id);
    let updatedPackages: PackageItem[];

    if (exists) {
      updatedPackages = packages.map(p => (p.id === editingPackage.id ? editingPackage : p));
    } else {
      updatedPackages = [editingPackage, ...packages];
    }

    onSavePackages(updatedPackages);

    // If currently managing questions in this package, sync state
    if (selectedPackageForQuestions && selectedPackageForQuestions.id === editingPackage.id) {
      setSelectedPackageForQuestions(editingPackage);
    }

    setIsPackageModalOpen(false);
    setEditingPackage(null);
  };

  const handleDeletePackage = (pkgId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus paket soal ini beserta seluruh soal di dalamnya?')) {
      const updated = packages.filter(p => p.id !== pkgId);
      onSavePackages(updated);
      if (selectedPackageForQuestions && selectedPackageForQuestions.id === pkgId) {
        setSelectedPackageForQuestions(null);
      }
    }
  };

  const handleDuplicatePackage = (pkg: PackageItem) => {
    const clonedQuestions = pkg.questions ? pkg.questions.map(q => ({
      ...q,
      id: `q-dup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    })) : [];

    const clonedPackage: PackageItem = {
      ...pkg,
      id: `pkg-copy-${Date.now()}`,
      title: `${pkg.title} (Salinan)`,
      isPopular: false,
      questions: clonedQuestions
    };

    const updated = [clonedPackage, ...packages];
    onSavePackages(updated);
  };

  // =========================================================================
  // QUESTION MANAGEMENT INSIDE A PACKAGE
  // =========================================================================
  const handleOpenAddQuestionToPackage = () => {
    if (!selectedPackageForQuestions) return;

    const targetGrade = selectedPackageForQuestions.grade === 'SEMUA' ? 'SMA' : selectedPackageForQuestions.grade;

    const newQ: Question = {
      id: `q-pkg-${Date.now()}`,
      grade: targetGrade as 'SD' | 'SMP' | 'SMA',
      subject: `TKA ${targetGrade}`,
      type: 'pilihan_ganda',
      stimulusTitle: 'Stimulus Wacana / Narasi Soal',
      stimulusText: 'Tuliskan teks wacana, bacaan, stimulus cerita, atau data tabel pendukung di sini...',
      stimulusImageUrl: '',
      questionPrompt: 'Berdasarkan wacana di atas, tentukan jawaban yang paling tepat!',
      options: [
        { id: 'opt-a', label: 'A', text: 'Pilihan Jawaban A' },
        { id: 'opt-b', label: 'B', text: 'Pilihan Jawaban B' },
        { id: 'opt-c', label: 'C', text: 'Pilihan Jawaban C' },
        { id: 'opt-d', label: 'D', text: 'Pilihan Jawaban D' },
        { id: 'opt-e', label: 'E', text: 'Pilihan Jawaban E' },
      ],
      correctOptionId: 'opt-a',
      points: 20,
      explanation: 'Pembahasan konsep materi secara runtut dan sistematis.',
      fastTrick: 'Trik Cepat 15 Detik Mas Aira: Perhatikan pola kata kunci utama untuk mengeliminasi opsi salah seketika!'
    };

    setEditingQuestion(newQ);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestionInPackage = (q: Question) => {
    setEditingQuestion(JSON.parse(JSON.stringify(q)));
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestionToPackage = () => {
    if (!selectedPackageForQuestions || !editingQuestion) return;

    const currentQuestions = selectedPackageForQuestions.questions || [];
    const questionIndex = currentQuestions.findIndex(q => q.id === editingQuestion.id);

    let updatedQuestionsList: Question[];
    if (questionIndex >= 0) {
      updatedQuestionsList = currentQuestions.map(q => (q.id === editingQuestion.id ? editingQuestion : q));
    } else {
      updatedQuestionsList = [...currentQuestions, editingQuestion];
    }

    const updatedPackage: PackageItem = {
      ...selectedPackageForQuestions,
      questions: updatedQuestionsList
    };

    // Update global package list
    const updatedPackages = packages.map(p => (p.id === updatedPackage.id ? updatedPackage : p));
    onSavePackages(updatedPackages);
    setSelectedPackageForQuestions(updatedPackage);

    // Also update global questions bank
    const globalQIndex = questions.findIndex(q => q.id === editingQuestion.id);
    if (globalQIndex >= 0) {
      onSaveQuestions(questions.map(q => (q.id === editingQuestion.id ? editingQuestion : q)));
    } else {
      onSaveQuestions([editingQuestion, ...questions]);
    }

    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestionFromPackage = (questionId: string) => {
    if (!selectedPackageForQuestions) return;
    if (confirm('Hapus butir soal ini dari paket?')) {
      const updatedQuestionsList = (selectedPackageForQuestions.questions || []).filter(q => q.id !== questionId);
      const updatedPackage: PackageItem = {
        ...selectedPackageForQuestions,
        questions: updatedQuestionsList
      };

      const updatedPackages = packages.map(p => (p.id === updatedPackage.id ? updatedPackage : p));
      onSavePackages(updatedPackages);
      setSelectedPackageForQuestions(updatedPackage);
    }
  };

  // =========================================================================
  // CSV IMPORT DIRECTLY TO CURRENT PACKAGE
  // =========================================================================
  const handleCSVImportToPackage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPackageForQuestions) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvContent = event.target?.result as string;
      const result = parseQuestionsFromCSV(csvContent);

      if (result.success && result.questions.length > 0) {
        // Tag imported questions with the package grade if not specific
        const targetGrade = selectedPackageForQuestions.grade === 'SEMUA' ? 'SMA' : selectedPackageForQuestions.grade;
        const normalizedImported = result.questions.map(q => ({
          ...q,
          grade: (q.grade || targetGrade) as 'SD' | 'SMP' | 'SMA'
        }));

        const currentQuestions = selectedPackageForQuestions.questions || [];
        const mergedQuestions = [...currentQuestions, ...normalizedImported];

        const updatedPackage: PackageItem = {
          ...selectedPackageForQuestions,
          questions: mergedQuestions
        };

        const updatedPackages = packages.map(p => (p.id === updatedPackage.id ? updatedPackage : p));
        onSavePackages(updatedPackages);
        setSelectedPackageForQuestions(updatedPackage);

        // Sync with global bank
        onSaveQuestions([...normalizedImported, ...questions]);

        setCsvFeedback({
          show: true,
          success: true,
          message: `Berhasil mengimpor ${result.questions.length} butir soal langsung ke ${selectedPackageForQuestions.title}!`
        });
      } else {
        setCsvFeedback({
          show: true,
          success: false,
          message: `Gagal mengimpor file: ${result.errors.join(', ')}`
        });
      }

      setTimeout(() => {
        setCsvFeedback({ show: false, success: false, message: '' });
      }, 5000);
    };

    reader.readAsText(file);
    if (csvFileInputRef.current) {
      csvFileInputRef.current.value = '';
    }
  };

  // Export questions of this package
  const handleExportPackageQuestions = () => {
    if (!selectedPackageForQuestions || !selectedPackageForQuestions.questions) return;
    exportQuestionsToCSV(
      selectedPackageForQuestions.questions,
      `soal_${selectedPackageForQuestions.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Navigation Bar */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-amber-400">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-purple-950 text-xs font-black uppercase font-display tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Portal Pengelola Aira Bimbel
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Manajemen Paket Soal & CBT TKA
            </h1>
            <p className="text-xs sm:text-sm text-purple-200">
              Buat paket untuk SD, SMP, SMA · Atur durasi ujian menit · Kelola jumlah butir soal & tipe soal · Upload banner Cloudinary.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onExitAdmin}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Website</span>
            </button>
          </div>
        </div>

        {/* Global CSV Feedback Toast */}
        {csvFeedback.show && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 shadow-md border ${
              csvFeedback.success
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            {csvFeedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{csvFeedback.message}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => {
              setActiveTab('paket');
              setSelectedPackageForQuestions(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'paket'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-900 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kelola Paket Soal & Ujian CBT ({packages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tampilan')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'tampilan'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-900 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Kustomisasi Tampilan Landing Page</span>
          </button>

          <button
            onClick={() => setActiveTab('integrasi')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'integrasi'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-900 border border-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-indigo-500" />
            <span>Integrasi Cloud & Midtrans</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: KELOLA PAKET SOAL (CORE ARCHITECTURE)                        */}
        {/* =================================================================== */}
        {activeTab === 'paket' && (
          <div>
            {!selectedPackageForQuestions ? (
              // -------------------------------------------------------------
              // VIEW 1A: DAFTAR SEMUA PAKET SOAL
              // -------------------------------------------------------------
              <div className="space-y-6">
                
                {/* Action Bar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-display">
                      Daftar Paket Soal TKA
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Setiap paket memiliki durasi ujian (menit), KKM, banner, dan kumpulan butir soal sendiri (SD, SMP, SMA).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={downloadCSVTemplate}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="Download format CSV untuk import massal"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Template CSV</span>
                    </button>

                    <button
                      onClick={handleOpenCreatePackage}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Buat Paket Soal Baru</span>
                    </button>
                  </div>
                </div>

                {/* Filters: Grade and Sales Type */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                  {/* Grade Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 mr-1">Jenjang:</span>
                    {(['SEMUA', 'SD', 'SMP', 'SMA'] as GradeLevel[]).map(grade => (
                      <button
                        key={grade}
                        onClick={() => setSelectedGradeFilter(grade)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          selectedGradeFilter === grade
                            ? 'bg-purple-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {grade === 'SEMUA' ? 'Semua Jenjang' : `Jenjang ${grade}`}
                      </button>
                    ))}
                  </div>

                  {/* Sales Strategy Filter Pills (Satuan vs Bundle) */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-500 px-2">Tipe Jual:</span>
                    <button
                      onClick={() => setSalesTypeFilter('ALL')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        salesTypeFilter === 'ALL'
                          ? 'bg-white text-purple-950 shadow-xs'
                          : 'text-slate-600 hover:text-purple-900'
                      }`}
                    >
                      Semua ({packages.length})
                    </button>
                    <button
                      onClick={() => setSalesTypeFilter('satuan')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        salesTypeFilter === 'satuan'
                          ? 'bg-purple-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-purple-900'
                      }`}
                    >
                      <span>📦 Satuan</span>
                      <span className="text-[10px] opacity-80">
                        ({packages.filter(p => (p.packageType || 'satuan') === 'satuan').length})
                      </span>
                    </button>
                    <button
                      onClick={() => setSalesTypeFilter('bundle')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        salesTypeFilter === 'bundle'
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-purple-950 font-black shadow-xs'
                          : 'text-slate-600 hover:text-purple-900'
                      }`}
                    >
                      <span>🎁 Bundle Hemat</span>
                      <span className="text-[10px] opacity-80">
                        ({packages.filter(p => p.packageType === 'bundle').length})
                      </span>
                    </button>
                  </div>
                </div>

                {/* Package Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPackages.map((pkg) => {
                    const totalQ = pkg.questions ? pkg.questions.length : 0;
                    const totalPoints = pkg.questions ? pkg.questions.reduce((sum, q) => sum + (q.points || 0), 0) : 0;
                    const isBundle = pkg.packageType === 'bundle';
                    const discountPct = pkg.originalPrice > pkg.price
                      ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
                      : 0;

                    return (
                      <div
                        key={pkg.id}
                        className={`bg-white rounded-2xl border-2 transition-all shadow-xs flex flex-col justify-between overflow-hidden group ${
                          isBundle ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        {/* Package Banner Image */}
                        <div className="relative h-44 w-full bg-purple-950 overflow-hidden">
                          <img
                            src={pkg.bannerUrl || '/src/assets/images/aira_bimbel_hero_1793151843426.jpg'}
                            alt={pkg.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/95 via-purple-950/40 to-transparent" />

                          {/* Floating Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-purple-950 text-[11px] font-black uppercase tracking-wider shadow-xs">
                                {pkg.grade === 'SEMUA' ? 'SEMUA JENJANG' : `JENJANG ${pkg.grade}`}
                              </span>
                              {isBundle && (
                                <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                                  <span>🎁 BUNDLE</span>
                                </span>
                              )}
                            </div>
                            {pkg.isDemo ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                                DEMO GRATIS
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-purple-800 text-white text-[11px] font-bold shadow-xs">
                                Aktif {pkg.durationDays} Hari
                              </span>
                            )}
                          </div>

                          {/* Floating Bottom Metrics */}
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                            <span className="flex items-center gap-1 font-bold text-amber-300 text-[11px]">
                              <Clock className="w-3.5 h-3.5" />
                              Durasi: {pkg.durationMinutes || 45} Menit
                            </span>
                            <span className="text-[11px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {totalQ} Butir Soal
                            </span>
                          </div>
                        </div>

                        {/* Package Info */}
                        <div className="p-5 flex-1 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              isBundle ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-purple-100 text-purple-900'
                            }`}>
                              {isBundle ? '🎁 BUNDLE HEMAT MULTI-JENJANG' : '📦 PAKET SATUAN'}
                            </span>
                            {pkg.isPopular && (
                              <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                ⭐ Terlaris
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-900 font-display leading-snug line-clamp-2">
                            {pkg.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {pkg.tagline}
                          </p>

                          {/* If Bundle, show bundled packages list and grades */}
                          {isBundle && (
                            <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
                              <div className="flex items-center justify-between font-bold text-amber-900 text-[11px]">
                                <span className="flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>Mencakup {pkg.bundledPackageIds?.length || (pkg.bundledGrades?.length || 0)} Paket Soal</span>
                                </span>
                                {pkg.bundledGrades && pkg.bundledGrades.length > 0 && (
                                  <span className="text-[10px] bg-amber-200 text-purple-950 px-2 py-0.5 rounded font-black">
                                    {pkg.bundledGrades.join(' + ')}
                                  </span>
                                )}
                              </div>

                              {pkg.bundledPackageIds && pkg.bundledPackageIds.length > 0 ? (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {pkg.bundledPackageIds.map((bId) => {
                                    const bp = packages.find(p => p.id === bId);
                                    return bp ? (
                                      <span
                                        key={bId}
                                        className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[10px] font-bold text-purple-950 shadow-2xs flex items-center gap-1"
                                      >
                                        <span className="text-amber-600">[{bp.grade}]</span>
                                        <span className="truncate max-w-[150px]">{bp.title}</span>
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              ) : pkg.bundledGrades && pkg.bundledGrades.length > 0 ? (
                                <span className="text-[11px] text-slate-600">
                                  Akses penuh semua paket untuk jenjang: <strong>{pkg.bundledGrades.join(' + ')}</strong>
                                </span>
                              ) : null}
                            </div>
                          )}

                          {/* Stat Grid */}
                          <div className="grid grid-cols-3 gap-2 p-2.5 bg-purple-50 rounded-xl border border-purple-100 text-center text-xs">
                            <div>
                              <div className="text-[10px] text-slate-500">Jumlah Soal</div>
                              <div className="font-extrabold text-purple-950 font-display">{totalQ} Soal</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500">Total Poin</div>
                              <div className="font-extrabold text-purple-950 font-display">{totalPoints} Pts</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500">KKM Nilai</div>
                              <div className="font-extrabold text-purple-950 font-display">{pkg.passingGrade || 75}</div>
                            </div>
                          </div>

                          {/* Sales Strategy / Strikethrough Pricing Box */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">Harga Normal:</span>
                              {pkg.originalPrice && pkg.originalPrice > pkg.price ? (
                                <span className="line-through text-slate-400 font-semibold">
                                  {formatRupiah(pkg.originalPrice)}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </div>

                            <div className="flex items-baseline justify-between pt-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-700">Harga Promo:</span>
                                {discountPct > 0 && (
                                  <span className="px-1.5 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-md shadow-xs">
                                    {pkg.discountBadgeText || `-${discountPct}%`}
                                  </span>
                                )}
                              </div>
                              <span className="text-base font-black text-purple-950 font-display">
                                {pkg.isDemo ? 'Gratis' : formatRupiah(pkg.price)}
                              </span>
                            </div>

                            {!pkg.isDemo && pkg.originalPrice > pkg.price && (
                              <div className="text-[10px] text-emerald-700 font-bold text-right pt-0.5">
                                Siswa hemat {formatRupiah(pkg.originalPrice - pkg.price)} ({discountPct}%)
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Package Actions */}
                        <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
                          {/* Primary CTA: Kelola Soal Paket Ini */}
                          <button
                            onClick={() => setSelectedPackageForQuestions(pkg)}
                            className="w-full py-2.5 px-4 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
                          >
                            <BookOpen className="w-4 h-4 text-amber-400" />
                            <span>Kelola Soal Paket Ini ({totalQ} Soal)</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleOpenEditPackage(pkg)}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-1 transition-colors"
                              title="Edit durasi menit, harga, KKM, banner"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-purple-700" />
                              <span>Edit Paket</span>
                            </button>

                            {onPreviewPackageCBT && (
                              <button
                                onClick={() => onPreviewPackageCBT(pkg)}
                                className="py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-200 flex items-center justify-center gap-1 transition-colors"
                                title="Uji coba tampilan ujian CBT"
                              >
                                <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                                <span>Preview CBT</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDuplicatePackage(pkg)}
                              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                              title="Duplikat paket ini"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors"
                              title="Hapus paket ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            ) : (
              // -------------------------------------------------------------
              // VIEW 1B: STUDIO PENGELOLA SOAL DALAM PAKET TERPILIH
              // -------------------------------------------------------------
              <div className="space-y-6">
                
                {/* Back & Package Header Banner */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-200 shadow-md space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <button
                      onClick={() => setSelectedPackageForQuestions(null)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-purple-900 hover:text-purple-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali ke Daftar Semua Paket</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditPackage(selectedPackageForQuestions)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-purple-700" />
                        <span>Edit Pengaturan Paket</span>
                      </button>

                      {onPreviewPackageCBT && (
                        <button
                          onClick={() => onPreviewPackageCBT(selectedPackageForQuestions)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-purple-950" />
                          <span>Simulasi CBT Siswa</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Header Details */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-black">
                          JENJANG {selectedPackageForQuestions.grade}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                          DURASI {selectedPackageForQuestions.durationMinutes || 45} MENIT
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                          KKM: {selectedPackageForQuestions.passingGrade || 75}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                        {selectedPackageForQuestions.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                        {selectedPackageForQuestions.tagline}
                      </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {/* Hidden CSV file input */}
                      <input
                        type="file"
                        ref={csvFileInputRef}
                        accept=".csv"
                        className="hidden"
                        onChange={handleCSVImportToPackage}
                      />

                      <button
                        onClick={() => csvFileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
                        title="Upload file CSV berisikan daftar butir soal langsung ke paket ini"
                      >
                        <Upload className="w-4 h-4 text-purple-700" />
                        <span>Import CSV ke Paket Ini</span>
                      </button>

                      <button
                        onClick={handleExportPackageQuestions}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
                        title="Download seluruh soal paket ini ke format CSV"
                      >
                        <Download className="w-4 h-4 text-slate-600" />
                        <span>Export CSV</span>
                      </button>

                      <button
                        onClick={handleOpenAddQuestionToPackage}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Tambah Soal Baru</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Questions List Inside This Package */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-700" />
                      <span>Daftar Butir Soal dalam Paket ({selectedPackageForQuestions.questions?.length || 0} Soal)</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      Total Nilai: {selectedPackageForQuestions.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0} Poin
                    </span>
                  </div>

                  {(!selectedPackageForQuestions.questions || selectedPackageForQuestions.questions.length === 0) ? (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-purple-200 p-12 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900 font-display">
                          Paket Ini Belum Memiliki Soal
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Tambahkan soal satu per satu (Pilihan Ganda, PG Kompleks, Menjodohkan, Benar/Salah) atau import file CSV template.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={handleOpenAddQuestionToPackage}
                          className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs"
                        >
                          + Tambah Soal Pertama
                        </button>
                        <button
                          onClick={() => csvFileInputRef.current?.click()}
                          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs"
                        >
                          Import dari CSV
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedPackageForQuestions.questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all space-y-4"
                        >
                          {/* Top Row: Number, Type Badge, Points, Actions */}
                          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="w-7 h-7 rounded-lg bg-purple-900 text-white text-xs font-black flex items-center justify-center font-display">
                                #{idx + 1}
                              </span>
                              
                              <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-900 text-xs font-bold uppercase">
                                {q.type === 'pilihan_ganda' && 'Pilihan Ganda'}
                                {q.type === 'pilihan_ganda_kompleks' && 'PG Kompleks'}
                                {q.type === 'menjodohkan' && 'Menjodohkan'}
                                {q.type === 'benar_salah' && 'Benar / Salah'}
                              </span>

                              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                                {q.points || 20} Poin
                              </span>

                              <span className="text-xs text-slate-500 font-medium">
                                {q.subject}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditQuestionInPackage(q)}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-purple-100 text-purple-900 transition-colors"
                                title="Edit soal ini"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestionFromPackage(q.id)}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-600 transition-colors"
                                title="Hapus soal ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* 2-Card Preview in Admin View */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Card 1: Stimulus */}
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-purple-700" />
                                <span>Kartu 1: Stimulus & Wacana</span>
                              </div>
                              {q.stimulusImageUrl && (
                                <div className="h-28 rounded-lg overflow-hidden border border-slate-300">
                                  <img
                                    src={q.stimulusImageUrl}
                                    alt="Stimulus"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <p className="text-slate-600 line-clamp-3 italic">
                                {q.stimulusText}
                              </p>
                            </div>

                            {/* Card 2: Question & Options */}
                            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 text-xs space-y-2">
                              <div className="font-bold text-purple-950 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span>Kartu 2: Pertanyaan & Jawaban</span>
                              </div>
                              <p className="font-semibold text-slate-900 line-clamp-2">
                                {q.questionPrompt}
                              </p>

                              {/* Preview options count or answer */}
                              {q.type === 'pilihan_ganda' && (
                                <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                                  Kunci Jawaban: {q.options?.find(o => o.id === q.correctOptionId)?.label || 'A'} - {q.options?.find(o => o.id === q.correctOptionId)?.text}
                                </div>
                              )}

                              {q.type === 'pilihan_ganda_kompleks' && (
                                <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                                  Kunci Benar: {q.correctOptionIds?.join(', ')} ({q.correctOptionIds?.length} opsi benar)
                                </div>
                              )}

                              {q.type === 'menjodohkan' && (
                                <div className="text-[11px] text-purple-900 bg-white p-2 rounded-lg border border-purple-100">
                                  {q.matchingPairs?.length} Pasang Pernyataan
                                </div>
                              )}

                              {q.type === 'benar_salah' && (
                                <div className="text-[11px] text-purple-900 bg-white p-2 rounded-lg border border-purple-100">
                                  {q.trueFalseItems?.length} Pernyataan Benar/Salah
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Fast Trick Banner */}
                          {q.fastTrick && (
                            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs">
                              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div className="text-slate-800">
                                <span className="font-black text-amber-950">Trik 15 Detik Mas Aira: </span>
                                <span>{q.fastTrick}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: KUSTOMISASI TAMPILAN LANDING PAGE                           */}
        {/* =================================================================== */}
        {activeTab === 'tampilan' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-display">
                  Kustomisasi Tampilan Landing Page
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah teks judul, hero, banner foto, pengumuman, dan kontak tanpa menyentuh kode program.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onResetLandingContent}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Reset Default
                </button>
                <button
                  onClick={() => {
                    onSaveLandingContent(localLandingContent);
                    setLandingSavedToast(true);
                    setTimeout(() => setLandingSavedToast(false), 4000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Simpan Perubahan Tampilan</span>
                </button>
              </div>
            </div>

            {landingSavedToast && (
              <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs sm:text-sm font-bold">
                  Perubahan tampilan landing page berhasil disimpan dan langsung aktif di website!
                </span>
              </div>
            )}

            {/* Form Sections */}
            <div className="space-y-6">
              {/* Navbar & Header */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  1. Header & Announcement Bar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Brand Depan</label>
                    <input
                      type="text"
                      value={localLandingContent.brandFirstName}
                      onChange={e => setLocalLandingContent({ ...localLandingContent, brandFirstName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Brand Belakang</label>
                    <input
                      type="text"
                      value={localLandingContent.brandLastName}
                      onChange={e => setLocalLandingContent({ ...localLandingContent, brandLastName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Teks Banner Pengumuman Atas (Announcement Bar)</label>
                    <input
                      type="text"
                      value={localLandingContent.headerAnnouncement}
                      onChange={e => setLocalLandingContent({ ...localLandingContent, headerAnnouncement: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  2. Hero Section (Judul & Banner Utama)
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tagline Kicker Hero</label>
                    <input
                      type="text"
                      value={localLandingContent.heroTagline}
                      onChange={e => setLocalLandingContent({ ...localLandingContent, heroTagline: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Awalan Judul Hero</label>
                      <input
                        type="text"
                        value={localLandingContent.heroTitlePrefix}
                        onChange={e => setLocalLandingContent({ ...localLandingContent, heroTitlePrefix: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sorotan Judul Emas (Highlight)</label>
                      <input
                        type="text"
                        value={localLandingContent.heroTitleHighlight}
                        onChange={e => setLocalLandingContent({ ...localLandingContent, heroTitleHighlight: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Paragraf Deskripsi Hero</label>
                    <textarea
                      rows={3}
                      value={localLandingContent.heroDescription}
                      onChange={e => setLocalLandingContent({ ...localLandingContent, heroDescription: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  
                  {/* Hero Banner Image with Cloudinary Uploader */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Foto Banner Hero</label>
                    <CloudinaryImageUploader
                      currentImageUrl={localLandingContent.heroBannerUrl}
                      onImageUploaded={url => setLocalLandingContent({ ...localLandingContent, heroBannerUrl: url })}
                      label="Upload Foto Banner Hero"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  3. Footer & Kontak WhatsApp
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Resmi</label>
                    <input
                      type="text"
                      value={localLandingContent.footerContactWhatsApp}
                      onChange={e => setLocalLandingContent({ ...localLandingContent, footerContactWhatsApp: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Customer Service</label>
                    <input
                      type="text"
                      value={localLandingContent.footerContactEmail}
                      onChange={e => setLocalLandingContent({ ...localLandingContent, footerContactEmail: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: INTEGRASI CLOUD & PAYMENT (AUTO-ACTIVATION ENGINE)          */}
        {/* =================================================================== */}
        {activeTab === 'integrasi' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            
            {/* Top Engine Banner */}
            <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-purple-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-purple-950 font-black text-[10px] tracking-wider uppercase">
                    AUTO-ACTIVATION ENGINE
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>SISTEM AKTIF OTOMATIS (REALTIME)</span>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                  Pengaturan Server & Access Key Otomatis
                </h2>
                <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">
                  Setiap kali Anda memasukkan atau memperbarui Access Key Midtrans, Cloudinary, sistem akan <strong>menyimpan pengaturan yang diubah</strong> tanpa perlu restart server atau reload aplikasi.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  onClick={() => {
                    handleUpdateAndAutoActivateConfig({}, 'Kredensial Semua Server');
                    setConfigSavedToast(true);
                    setTimeout(() => setConfigSavedToast(false), 3000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Verifikasi Kredensial</span>
                </button>
                <span className="text-[11px] text-purple-300">
                  Sinkronisasi terakhir: {localConfig.lastActivatedAt ? new Date(localConfig.lastActivatedAt).toLocaleTimeString('id-ID') : 'Baru saja'}
                </span>
              </div>
            </div>

            {/* Notification Pills */}
            {liveAutoSavePill && (
              <div className="p-3.5 bg-emerald-500 text-white rounded-xl shadow-md flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{liveAutoSavePill} Konfigurasi langsung diterapkan ke portal siswa & sistem ujian.</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Status: LIVE</span>
              </div>
            )}

            {configSavedToast && (
              <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs sm:text-sm font-bold">
                  Seluruh server dan access key berhasil disimpan & aktif secara otomatis!
                </span>
              </div>
            )}

            {/* Integrasi layanan eksternal: Midtrans, Cloudinary, dan Cloudflare */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* 1. MIDTRANS PAYMENT GATEWAY */}
              <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-300 transition-all shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-900">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span>Midtrans Payment Gateway</span>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        QRIS, GoPay, ShopeePay, Virtual Account BCA/Mandiri/BRI
                      </span>
                    </div>
                  </div>
                  
                  {/* Auto-Active Status Indicator */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    localConfig.midtransClientKey
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{localConfig.midtransClientKey ? 'AKTIF OTOMATIS' : 'SIAP DIISI'}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Midtrans Client Key (Otomatis Aktif di Frontend) *
                    </label>
                    <input
                      type="text"
                      value={localConfig.midtransClientKey}
                      onChange={e => handleUpdateAndAutoActivateConfig({ midtransClientKey: e.target.value }, 'Midtrans Client Key')}
                      placeholder="SB-Mid-client-xxxx atau Mid-client-xxxx"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Midtrans Server Key (Otomatis Aktif untuk Transaksi) *
                    </label>
                    <input
                      type="password"
                      value={localConfig.midtransServerKey}
                      onChange={e => handleUpdateAndAutoActivateConfig({ midtransServerKey: e.target.value }, 'Midtrans Server Key')}
                      placeholder="SB-Mid-server-xxxx atau Mid-server-xxxx"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mode Environment *</label>
                    <select
                      value={localConfig.midtransEnvironment}
                      onChange={e => handleUpdateAndAutoActivateConfig({ midtransEnvironment: e.target.value as any }, 'Mode Midtrans')}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="sandbox">Sandbox (Pengujian - Simulasi QRIS & Virtual Account Bebas Risiko)</option>
                      <option value="production">Production (Live - Pembayaran Asli Masuk ke Rekening Bimbel)</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* 2. CLOUDINARY MEDIA STORAGE */}
              <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-300 transition-all shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span>Cloudinary Media CDN Storage</span>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Simpan Gambar Stimulus Soal TKA & Banner Paket Bebas Kuota
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    localConfig.cloudinaryCloudName
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{localConfig.cloudinaryCloudName ? 'AKTIF OTOMATIS' : 'SIAP DIISI'}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Cloud Name (Nama Akun Cloudinary) *
                    </label>
                    <input
                      type="text"
                      value={localConfig.cloudinaryCloudName}
                      onChange={e => handleUpdateAndAutoActivateConfig({ cloudinaryCloudName: e.target.value }, 'Cloudinary Cloud Name')}
                      placeholder="Contoh: airabimbel-cdn"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Upload Preset (Direct Unsigned Upload) *
                    </label>
                    <input
                      type="text"
                      value={localConfig.cloudinaryUploadPreset}
                      onChange={e => handleUpdateAndAutoActivateConfig({ cloudinaryUploadPreset: e.target.value }, 'Cloudinary Preset')}
                      placeholder="Contoh: aira_soal_tka"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                    Setiap upload gambar pada pembuatan soal langsung terunggah ke Cloudinary CDN tanpa membebani memori lokal server.
                  </div>

                </div>
              </div>

              {/* 4. SERVER DOMAIN & CLOUDFLARE EDGE */}
              <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-300 transition-all shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <div className="p-2 rounded-xl bg-indigo-100 text-indigo-900">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <span>Server & Cloudflare Edge Routing</span>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Domain Kustom, Perlindungan SSL, dan Akses Cepat Nasional
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>AKTIF OTOMATIS</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Domain Server CBT Aplikasi
                    </label>
                    <input
                      type="text"
                      value={localConfig.cloudflareDomain}
                      onChange={e => handleUpdateAndAutoActivateConfig({ cloudflareDomain: e.target.value }, 'Domain Server')}
                      placeholder="tryout.airabimbel.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-950">
                      <span className="font-bold block">Keamanan SSL:</span>
                      <span className="text-emerald-700 font-bold">256-Bit TLS Aktif</span>
                    </div>
                    <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 text-purple-950">
                      <span className="font-bold block">Cache Edge:</span>
                      <span className="text-purple-700 font-bold">Latency Rendah (&lt;30ms)</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                    Otomatisasi domain memastikan seluruh traffic ujian CBT dialihkan secara aman dengan load balancing otomatis jika ribuan siswa ujian serentak.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* MODAL 1: BUAT / EDIT PAKET SOAL                                     */}
      {/* =================================================================== */}
      {isPackageModalOpen && editingPackage && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-display">
                  {packages.some(p => p.id === editingPackage.id) ? 'Edit Pengaturan Paket' : 'Buat Paket Soal Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan jenjang, durasi ujian CBT (menit), KKM, dan upload banner paket.
                </p>
              </div>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Title & Tagline */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Paket Soal *</label>
                <input
                  type="text"
                  value={editingPackage.title}
                  onChange={e => setEditingPackage({ ...editingPackage, title: e.target.value })}
                  placeholder="Contoh: Paket TKA SD Juara 1"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline / Subjudul Paket</label>
                <input
                  type="text"
                  value={editingPackage.tagline}
                  onChange={e => setEditingPackage({ ...editingPackage, tagline: e.target.value })}
                  placeholder="Contoh: Persiapan masuk SMP favorit & sukses asesmen"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {/* STRATEGI JUALAN: SATUAN VS BUNDLE HEMAT */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-amber-50/50 rounded-2xl border-2 border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-900" />
                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                      Model Jualan Paket: Satuan vs Bundle
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-800 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                    Marketing Engine
                  </span>
                </div>

                {/* Segmented Switch for Satuan vs Bundle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPackage({
                        ...editingPackage,
                        packageType: 'satuan',
                        bundledGrades: []
                      });
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      (editingPackage.packageType || 'satuan') === 'satuan'
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>📦 Paket Satuan (1 Jenjang)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPackage({
                        ...editingPackage,
                        packageType: 'bundle',
                        grade: 'SEMUA',
                        bundledGrades: editingPackage.bundledGrades && editingPackage.bundledGrades.length > 0
                          ? editingPackage.bundledGrades
                          : ['SMP', 'SMA'],
                        discountBadgeText: editingPackage.discountBadgeText || 'BUNDLE HEMAT'
                      });
                    }}
                    className={`py-2 px-3 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editingPackage.packageType === 'bundle'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-purple-950 shadow-xs'
                        : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>🎁 Bundle Kombo Hemat (Multi-Jenjang)</span>
                  </button>
                </div>

                {/* If Bundle is active: choose ANY packages flexibly */}
                {editingPackage.packageType === 'bundle' ? (
                  <div className="p-4 bg-white rounded-2xl border-2 border-amber-300 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
                      <div>
                        <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <span>🎯 Pilih Paket-Paket yang Akan Digabung (Bundle Fleksibel)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Bebas pilih paket apa saja: SD semua, SMP semua, SMA semua, atau kombinasi campuran sesuai kebutuhan admin.
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-purple-950 font-black text-[11px] self-start sm:self-auto shrink-0 shadow-2xs">
                        {(editingPackage.bundledPackageIds || []).length} Paket Terpilih
                      </span>
                    </div>

                    {/* Quick Selection Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 mr-1">Pilihan Cepat:</span>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const allNonDemos = packages.filter(p => p.id !== editingPackage.id && !p.isDemo);
                          const allIds = allNonDemos.map(p => p.id);
                          const allGrades = Array.from(new Set(allNonDemos.map(p => p.grade)));
                          const allQuestions = Array.from(new Map(allNonDemos.flatMap(p => p.questions || []).map(q => [q.id, q])).values());
                          const sumPrice = allNonDemos.reduce((sum, p) => sum + (p.price || 0), 0);
                          
                          setEditingPackage({
                            ...editingPackage,
                            bundledPackageIds: allIds,
                            bundledGrades: allGrades,
                            grade: allGrades.length === 1 ? allGrades[0] : 'SEMUA',
                            originalPrice: sumPrice > 0 ? sumPrice : editingPackage.originalPrice,
                            price: sumPrice > 0 ? Math.round((sumPrice * 0.5) / 1000) * 1000 : editingPackage.price,
                            questions: allQuestions.length > 0 ? allQuestions : editingPackage.questions,
                            discountBadgeText: 'SUPER BUNDLE ALL-ACCESS 50%'
                          });
                        }}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-purple-950 text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                      >
                        Pilih Semua Paket ({packages.filter(p => p.id !== editingPackage.id && !p.isDemo).length})
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const sdPackages = packages.filter(p => p.id !== editingPackage.id && !p.isDemo && p.grade === 'SD');
                          const ids = sdPackages.map(p => p.id);
                          const questions = Array.from(new Map(sdPackages.flatMap(p => p.questions || []).map(q => [q.id, q])).values());
                          const sumPrice = sdPackages.reduce((sum, p) => sum + (p.price || 0), 0);

                          setEditingPackage({
                            ...editingPackage,
                            bundledPackageIds: ids,
                            bundledGrades: ['SD'],
                            grade: 'SD',
                            originalPrice: sumPrice > 0 ? sumPrice : editingPackage.originalPrice,
                            price: sumPrice > 0 ? Math.round((sumPrice * 0.6) / 1000) * 1000 : editingPackage.price,
                            questions: questions.length > 0 ? questions : editingPackage.questions,
                            discountBadgeText: 'BUNDLE SD HEMAT'
                          });
                        }}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-950 text-[10px] font-bold rounded-lg border border-purple-200 transition-colors cursor-pointer"
                      >
                        Semua Paket SD
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const smpPackages = packages.filter(p => p.id !== editingPackage.id && !p.isDemo && p.grade === 'SMP');
                          const ids = smpPackages.map(p => p.id);
                          const questions = Array.from(new Map(smpPackages.flatMap(p => p.questions || []).map(q => [q.id, q])).values());
                          const sumPrice = smpPackages.reduce((sum, p) => sum + (p.price || 0), 0);

                          setEditingPackage({
                            ...editingPackage,
                            bundledPackageIds: ids,
                            bundledGrades: ['SMP'],
                            grade: 'SMP',
                            originalPrice: sumPrice > 0 ? sumPrice : editingPackage.originalPrice,
                            price: sumPrice > 0 ? Math.round((sumPrice * 0.6) / 1000) * 1000 : editingPackage.price,
                            questions: questions.length > 0 ? questions : editingPackage.questions,
                            discountBadgeText: 'BUNDLE SMP HEMAT'
                          });
                        }}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-950 text-[10px] font-bold rounded-lg border border-purple-200 transition-colors cursor-pointer"
                      >
                        Semua Paket SMP
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const smaPackages = packages.filter(p => p.id !== editingPackage.id && !p.isDemo && p.grade === 'SMA');
                          const ids = smaPackages.map(p => p.id);
                          const questions = Array.from(new Map(smaPackages.flatMap(p => p.questions || []).map(q => [q.id, q])).values());
                          const sumPrice = smaPackages.reduce((sum, p) => sum + (p.price || 0), 0);

                          setEditingPackage({
                            ...editingPackage,
                            bundledPackageIds: ids,
                            bundledGrades: ['SMA'],
                            grade: 'SMA',
                            originalPrice: sumPrice > 0 ? sumPrice : editingPackage.originalPrice,
                            price: sumPrice > 0 ? Math.round((sumPrice * 0.6) / 1000) * 1000 : editingPackage.price,
                            questions: questions.length > 0 ? questions : editingPackage.questions,
                            discountBadgeText: 'BUNDLE SMA HEMAT'
                          });
                        }}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-950 text-[10px] font-bold rounded-lg border border-purple-200 transition-colors cursor-pointer"
                      >
                        Semua Paket SMA
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const combo = packages.filter(p => p.id !== editingPackage.id && !p.isDemo && (p.grade === 'SMP' || p.grade === 'SMA'));
                          const ids = combo.map(p => p.id);
                          const questions = Array.from(new Map(combo.flatMap(p => p.questions || []).map(q => [q.id, q])).values());
                          const sumPrice = combo.reduce((sum, p) => sum + (p.price || 0), 0);

                          setEditingPackage({
                            ...editingPackage,
                            bundledPackageIds: ids,
                            bundledGrades: ['SMP', 'SMA'],
                            grade: 'SEMUA',
                            originalPrice: sumPrice > 0 ? sumPrice : editingPackage.originalPrice,
                            price: sumPrice > 0 ? Math.round((sumPrice * 0.55) / 1000) * 1000 : editingPackage.price,
                            questions: questions.length > 0 ? questions : editingPackage.questions,
                            discountBadgeText: 'KOMBO SMP + SMA'
                          });
                        }}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 text-[10px] font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                      >
                        Kombo SMP + SMA
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPackage({
                            ...editingPackage,
                            bundledPackageIds: [],
                            bundledGrades: []
                          });
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Kosongkan Pilihan
                      </button>
                    </div>

                    {/* Candidate Packages Checklist Cards */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {packages
                        .filter(p => p.id !== editingPackage.id && !p.isDemo)
                        .map((candidate) => {
                          const isSelected = (editingPackage.bundledPackageIds || []).includes(candidate.id);
                          const qCount = candidate.questions ? candidate.questions.length : 0;

                          return (
                            <div
                              key={candidate.id}
                              onClick={() => {
                                const currentIds = editingPackage.bundledPackageIds || [];
                                const newIds = isSelected
                                  ? currentIds.filter(id => id !== candidate.id)
                                  : [...currentIds, candidate.id];
                                
                                const selectedObjs = packages.filter(p => newIds.includes(p.id));
                                const updatedGrades = Array.from(new Set(selectedObjs.map(p => p.grade)));
                                const combinedQuestions = Array.from(new Map(selectedObjs.flatMap(p => p.questions || []).map(q => [q.id, q])).values());
                                const totalSatuanPrice = selectedObjs.reduce((sum, p) => sum + (p.price || 0), 0);

                                setEditingPackage({
                                  ...editingPackage,
                                  bundledPackageIds: newIds,
                                  bundledGrades: updatedGrades,
                                  grade: updatedGrades.length === 1 ? updatedGrades[0] : 'SEMUA',
                                  originalPrice: totalSatuanPrice > 0 ? totalSatuanPrice : editingPackage.originalPrice,
                                  questions: combinedQuestions.length > 0 ? combinedQuestions : editingPackage.questions
                                });
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30'
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} // handled by div onClick
                                  className="rounded text-purple-700 w-4 h-4 cursor-pointer"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-900 text-white">
                                      {candidate.grade}
                                    </span>
                                    <span className="font-bold text-slate-900 text-xs">{candidate.title}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                                    <span>{qCount} Butir Soal</span>
                                    <span>•</span>
                                    <span>KKM: {candidate.passingGrade || 75}</span>
                                    <span>•</span>
                                    <span>Durasi Asli: {candidate.durationMinutes} Menit</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-extrabold text-slate-900 text-xs">
                                  {formatRupiah(candidate.price)}
                                </span>
                                {candidate.originalPrice > candidate.price && (
                                  <span className="text-[10px] text-slate-400 line-through block">
                                    {formatRupiah(candidate.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Dynamic Bundle Price Recommendations based on selection */}
                    {(() => {
                      const selIds = editingPackage.bundledPackageIds || [];
                      const selectedObjs = packages.filter(p => selIds.includes(p.id));
                      const totalSumPrice = selectedObjs.reduce((sum, p) => sum + (p.price || 0), 0);
                      const totalQuestions = selectedObjs.reduce((sum, p) => sum + (p.questions?.length || 0), 0);

                      if (selIds.length === 0) {
                        return (
                          <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-xs text-center border border-amber-200">
                            Silakan centang satu atau beberapa paket di atas untuk digabungkan menjadi paket bundle.
                          </div>
                        );
                      }

                      return (
                        <div className="p-3.5 bg-gradient-to-br from-amber-50 to-purple-50 rounded-xl border border-amber-300 space-y-2 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <span className="text-slate-600 font-medium">Total Harga Beli Satuan Terpisah:</span>
                              <div className="text-sm font-black text-slate-900 font-display">
                                {formatRupiah(totalSumPrice)} <span className="text-[11px] font-normal text-slate-500">({selIds.length} Paket • {totalQuestions} Soal)</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingPackage({
                                  ...editingPackage,
                                  originalPrice: totalSumPrice
                                });
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-purple-950 font-bold rounded-lg border border-purple-200 text-[11px] self-start sm:self-auto cursor-pointer"
                            >
                              Jadikan Harga Asli Coret
                            </button>
                          </div>

                          <div className="pt-1.5 border-t border-amber-200/80">
                            <span className="text-[11px] font-bold text-slate-700 block mb-1">
                              Terapkan Harga Bundle Otomatis (Lebih Murah Dari Total Satuan):
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[30, 40, 50, 60].map(pct => {
                                const suggestedPrice = Math.round((totalSumPrice * (100 - pct)) / 100 / 1000) * 1000;
                                return (
                                  <button
                                    key={pct}
                                    type="button"
                                    onClick={() => {
                                      setEditingPackage({
                                        ...editingPackage,
                                        originalPrice: totalSumPrice,
                                        price: suggestedPrice,
                                        discountBadgeText: `BUNDLE HEMAT ${pct}%`
                                      });
                                    }}
                                    className="px-2.5 py-1 bg-white hover:bg-amber-100 text-purple-950 font-bold rounded-lg border border-amber-300 text-[11px] transition-colors cursor-pointer"
                                  >
                                    Hemat {pct}% ({formatRupiah(suggestedPrice)})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Pilih Jenjang Paket Satuan *</label>
                    <select
                      value={editingPackage.grade}
                      onChange={e => setEditingPackage({ ...editingPackage, grade: e.target.value as GradeLevel })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="SD">Jenjang SD</option>
                      <option value="SMP">Jenjang SMP</option>
                      <option value="SMA">Jenjang SMA</option>
                      <option value="SEMUA">Semua Jenjang</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Exam Duration, KKM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Durasi Ujian CBT (Menit) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={editingPackage.durationMinutes || 45}
                    onChange={e => setEditingPackage({ ...editingPackage, durationMinutes: parseInt(e.target.value) || 45 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">KKM Kelulusan Nilai</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingPackage.passingGrade || 75}
                    onChange={e => setEditingPackage({ ...editingPackage, passingGrade: parseInt(e.target.value) || 75 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* STRATEGI HARGA & KALKULATOR CORET DISKON OTOMATIS */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Percent className="w-4 h-4 text-purple-700" />
                    <span>Kalkulator Diskon Coret & Harga Promo</span>
                  </div>
                  {editingPackage.originalPrice > editingPackage.price && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] shadow-xs">
                      Hemat {Math.round(((editingPackage.originalPrice - editingPackage.price) / editingPackage.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Harga Normal / Coret (Rp)</label>
                    <input
                      type="number"
                      step={1000}
                      value={editingPackage.originalPrice}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setEditingPackage({ ...editingPackage, originalPrice: val });
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs"
                      placeholder="e.g. 150000"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Harga Jual Promo (Rp)</label>
                    <input
                      type="number"
                      step={1000}
                      value={editingPackage.price}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setEditingPackage({ ...editingPackage, price: val });
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-purple-950 text-xs"
                      placeholder="e.g. 69000"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Badge Teks Diskon</label>
                    <input
                      type="text"
                      value={editingPackage.discountBadgeText || ''}
                      onChange={e => setEditingPackage({ ...editingPackage, discountBadgeText: e.target.value })}
                      placeholder="Contoh: HEMAT 54% / BUNDLE HEMAT"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-rose-600"
                    />
                  </div>
                </div>

                {/* Preset Diskon Quick Buttons */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Preset Diskon Cepat:</span>
                    {editingPackage.originalPrice > editingPackage.price && (
                      <span className="text-emerald-700 font-bold">
                        Potongan Harga: {formatRupiah(editingPackage.originalPrice - editingPackage.price)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[20, 35, 50, 60, 70].map(pct => {
                      const calculatedPrice = editingPackage.originalPrice > 0
                        ? Math.round((editingPackage.originalPrice * (100 - pct)) / 100 / 1000) * 1000
                        : 0;
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            if (editingPackage.originalPrice > 0) {
                              setEditingPackage({
                                ...editingPackage,
                                price: calculatedPrice,
                                discountBadgeText: editingPackage.packageType === 'bundle' ? `BUNDLE HEMAT ${pct}%` : `HEMAT ${pct}%`
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-purple-100 hover:text-purple-950 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors"
                        >
                          Diskon {pct}% ({formatRupiah(calculatedPrice)})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Preview of Price Display */}
                <div className="p-3 bg-purple-950 text-white rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                      Tampilan Harga ke Siswa
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-lg font-black text-white font-display">
                        {editingPackage.isDemo ? 'Gratis 100%' : formatRupiah(editingPackage.price)}
                      </span>
                      {editingPackage.originalPrice > editingPackage.price && !editingPackage.isDemo && (
                        <span className="text-xs text-purple-300 line-through">
                          {formatRupiah(editingPackage.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-md bg-amber-400 text-purple-950 font-black text-[11px] shadow-xs">
                      {editingPackage.discountBadgeText || (editingPackage.originalPrice > editingPackage.price ? `HEMAT ${Math.round(((editingPackage.originalPrice - editingPackage.price) / editingPackage.originalPrice) * 100)}%` : 'AKTIF 60 HARI')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingPackage.isDemo}
                    onChange={e => setEditingPackage({ ...editingPackage, isDemo: e.target.checked, price: e.target.checked ? 0 : 49000 })}
                    className="rounded text-purple-700 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">Paket Demo Gratis (Tanpa Bayar)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingPackage.isPopular}
                    onChange={e => setEditingPackage({ ...editingPackage, isPopular: e.target.checked })}
                    className="rounded text-purple-700 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">Paling Diminati (Badge Populer)</span>
                </label>
              </div>

              {/* Banner Upload with Cloudinary */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Foto Banner Paket</label>
                <CloudinaryImageUploader
                  currentImageUrl={editingPackage.bannerUrl}
                  onImageUploaded={url => setEditingPackage({ ...editingPackage, bannerUrl: url })}
                  label="Upload Banner Paket via Cloudinary"
                />
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Daftar Fasilitas / Keunggulan Paket</label>
                <div className="space-y-1.5">
                  {editingPackage.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="flex-1 text-slate-800">{feat}</span>
                      <button
                        onClick={() => {
                          const updated = editingPackage.features.filter((_, i) => i !== idx);
                          setEditingPackage({ ...editingPackage, features: updated });
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={e => setNewFeatureInput(e.target.value)}
                    placeholder="Tambah poin fasilitas baru..."
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newFeatureInput.trim()) {
                        e.preventDefault();
                        setEditingPackage({
                          ...editingPackage,
                          features: [...editingPackage.features, newFeatureInput.trim()]
                        });
                        setNewFeatureInput('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newFeatureInput.trim()) {
                        setEditingPackage({
                          ...editingPackage,
                          features: [...editingPackage.features, newFeatureInput.trim()]
                        });
                        setNewFeatureInput('');
                      }
                    }}
                    className="px-3 py-2 bg-purple-900 text-white rounded-xl font-bold text-xs"
                  >
                    Tambah
                  </button>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSavePackageModal}
                className="px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Simpan Paket Soal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: TAMBAH / EDIT SOAL DALAM PAKET                             */}
      {/* =================================================================== */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-display">
                  {selectedPackageForQuestions?.questions?.some(q => q.id === editingQuestion.id) ? 'Edit Butir Soal' : 'Tambah Soal Baru ke Paket'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paket: <span className="font-bold text-purple-900">{selectedPackageForQuestions?.title}</span> · 
                  Pilih tipe soal, atur poin, isi wacana stimulus, dan masukkan Trik Cepat Mas Aira.
                </p>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              
              {/* Type, Points, Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-purple-50/70 rounded-2xl border border-purple-100">
                <div>
                  <label className="font-bold text-purple-950 block mb-1">Tipe / Model Soal *</label>
                  <select
                    value={editingQuestion.type}
                    onChange={e => {
                      const newType = e.target.value as QuestionType;
                      let updatedQ = { ...editingQuestion, type: newType };
                      if (newType === 'menjodohkan' && (!updatedQ.matchingPairs || updatedQ.matchingPairs.length === 0)) {
                        updatedQ.matchingPairs = [
                          { id: 'mp-1', left: 'Pernyataan Premis 1', right: 'Pasangan Jawaban 1' },
                          { id: 'mp-2', left: 'Pernyataan Premis 2', right: 'Pasangan Jawaban 2' },
                        ];
                      }
                      if (newType === 'benar_salah' && (!updatedQ.trueFalseItems || updatedQ.trueFalseItems.length === 0)) {
                        updatedQ.trueFalseItems = [
                          { id: 'tf-1', statement: 'Pernyataan uji 1', isTrue: true },
                          { id: 'tf-2', statement: 'Pernyataan uji 2', isTrue: false },
                        ];
                      }
                      setEditingQuestion(updatedQ);
                    }}
                    className="w-full p-2.5 bg-white border border-purple-200 rounded-xl font-bold text-xs"
                  >
                    <option value="pilihan_ganda">Pilihan Ganda (Single Choice)</option>
                    <option value="pilihan_ganda_kompleks">Pilihan Ganda Kompleks (Multi Choice)</option>
                    <option value="menjodohkan">Menjodohkan (Matching Pairs)</option>
                    <option value="benar_salah">Benar / Salah (Statements List)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-purple-950 block mb-1">Nilai / Bobot Poin Soal *</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editingQuestion.points || 20}
                    onChange={e => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) || 20 })}
                    className="w-full p-2.5 bg-white border border-purple-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-950 block mb-1">Topik / Mata Pelajaran</label>
                  <input
                    type="text"
                    value={editingQuestion.subject}
                    onChange={e => setEditingQuestion({ ...editingQuestion, subject: e.target.value })}
                    placeholder="Contoh: Penalaran Kuantitatif"
                    className="w-full p-2.5 bg-white border border-purple-200 rounded-xl"
                  />
                </div>
              </div>

              {/* CARD 1: STIMULUS & WACANA */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-700" />
                  <span>KARTU 1: Stimulus & Wacana Bacaan</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Judul Stimulus (Opsional)</label>
                  <input
                    type="text"
                    value={editingQuestion.stimulusTitle || ''}
                    onChange={e => setEditingQuestion({ ...editingQuestion, stimulusTitle: e.target.value })}
                    placeholder="Contoh: Stimulus 1: Analisis Hasil Panen Kebun"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Teks Wacana / Narasi Lengkap *</label>
                  <textarea
                    rows={4}
                    value={editingQuestion.stimulusText}
                    onChange={e => setEditingQuestion({ ...editingQuestion, stimulusText: e.target.value })}
                    placeholder="Masukkan wacana bacaan, informasi data, atau cerita stimulus di sini..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-sans"
                  />
                </div>

                {/* Upload Stimulus Image using Cloudinary */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gambar Stimulus / Diagram (Cloudinary)</label>
                  <CloudinaryImageUploader
                    currentImageUrl={editingQuestion.stimulusImageUrl}
                    onImageUploaded={url => setEditingQuestion({ ...editingQuestion, stimulusImageUrl: url })}
                    label="Upload Gambar Stimulus Soal"
                  />
                </div>
              </div>

              {/* CARD 2: PERTANYAAN & OPSI JAWABAN */}
              <div className="p-5 bg-purple-50/40 rounded-2xl border border-purple-200 space-y-4">
                <div className="flex items-center gap-2 font-bold text-purple-950 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>KARTU 2: Pertanyaan & Opsi Jawaban</span>
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">Kalimat Pertanyaan Utama *</label>
                  <textarea
                    rows={2}
                    value={editingQuestion.questionPrompt}
                    onChange={e => setEditingQuestion({ ...editingQuestion, questionPrompt: e.target.value })}
                    placeholder="Contoh: Berdasarkan wacana di atas, berapakah total keuntungan bersih yang diperoleh?"
                    className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                {/* SUBFORM: Pilihan Ganda */}
                {editingQuestion.type === 'pilihan_ganda' && (
                  <div className="space-y-3">
                    <label className="font-bold text-slate-900 block">
                      Pilihan Jawaban (Pilih satu kunci jawaban yang benar):
                    </label>
                    <div className="space-y-2">
                      {(editingQuestion.options || []).map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                          <input
                            type="radio"
                            name="correct_option"
                            checked={editingQuestion.correctOptionId === opt.id}
                            onChange={() => setEditingQuestion({ ...editingQuestion, correctOptionId: opt.id })}
                            className="w-4 h-4 text-purple-700"
                          />
                          <span className="font-bold text-purple-950 w-6 text-center">{opt.label}.</span>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={e => {
                              const updatedOptions = (editingQuestion.options || []).map(o => (o.id === opt.id ? { ...o, text: e.target.value } : o));
                              setEditingQuestion({ ...editingQuestion, options: updatedOptions });
                            }}
                            className="flex-1 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBFORM: Pilihan Ganda Kompleks */}
                {editingQuestion.type === 'pilihan_ganda_kompleks' && (
                  <div className="space-y-3">
                    <label className="font-bold text-slate-900 block">
                      Pilihan Jawaban Kompleks (Centang semua opsi yang bernilai BENAR):
                    </label>
                    <div className="space-y-2">
                      {(editingQuestion.options || []).map((opt) => {
                        const isChecked = (editingQuestion.correctOptionIds || []).includes(opt.id);
                        return (
                          <div key={opt.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                const current = editingQuestion.correctOptionIds || [];
                                const updated = e.target.checked
                                  ? [...current, opt.id]
                                  : current.filter(id => id !== opt.id);
                                setEditingQuestion({ ...editingQuestion, correctOptionIds: updated });
                              }}
                              className="w-4 h-4 rounded text-purple-700"
                            />
                            <span className="font-bold text-purple-950 w-6 text-center">{opt.label}.</span>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={e => {
                                const updatedOptions = (editingQuestion.options || []).map(o => (o.id === opt.id ? { ...o, text: e.target.value } : o));
                                setEditingQuestion({ ...editingQuestion, options: updatedOptions });
                              }}
                              className="flex-1 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SUBFORM: Menjodohkan */}
                {editingQuestion.type === 'menjodohkan' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 block">
                        Pasangan Menjodohkan (Kiri → Kanan):
                      </label>
                      <button
                        onClick={() => {
                          const newPair: MatchingPair = {
                            id: `mp-${Date.now()}`,
                            left: 'Premis Baru',
                            right: 'Pasangan Jawaban'
                          };
                          setEditingQuestion({
                            ...editingQuestion,
                            matchingPairs: [...(editingQuestion.matchingPairs || []), newPair]
                          });
                        }}
                        className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-950 font-bold rounded-lg text-xs"
                      >
                        + Tambah Baris Pasangan
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(editingQuestion.matchingPairs || []).map((pair, idx) => (
                        <div key={pair.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                          <span className="font-bold text-purple-900 w-6">{idx + 1}.</span>
                          <input
                            type="text"
                            placeholder="Pernyataan Premis Kiri"
                            value={pair.left}
                            onChange={e => {
                              const updated = (editingQuestion.matchingPairs || []).map(p => (p.id === pair.id ? { ...p, left: e.target.value } : p));
                              setEditingQuestion({ ...editingQuestion, matchingPairs: updated });
                            }}
                            className="flex-1 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                          />
                          <span className="font-black text-slate-400">↔</span>
                          <input
                            type="text"
                            placeholder="Pasangan Jawaban Kanan"
                            value={pair.right}
                            onChange={e => {
                              const updated = (editingQuestion.matchingPairs || []).map(p => (p.id === pair.id ? { ...p, right: e.target.value } : p));
                              setEditingQuestion({ ...editingQuestion, matchingPairs: updated });
                            }}
                            className="flex-1 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                          />
                          <button
                            onClick={() => {
                              const updated = (editingQuestion.matchingPairs || []).filter(p => p.id !== pair.id);
                              setEditingQuestion({ ...editingQuestion, matchingPairs: updated });
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBFORM: Benar / Salah */}
                {editingQuestion.type === 'benar_salah' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 block">
                        Daftar Pernyataan & Kunci Kebenaran:
                      </label>
                      <button
                        onClick={() => {
                          const newTf: TrueFalseStatement = {
                            id: `tf-${Date.now()}`,
                            statement: 'Pernyataan uji baru',
                            isTrue: true
                          };
                          setEditingQuestion({
                            ...editingQuestion,
                            trueFalseItems: [...(editingQuestion.trueFalseItems || []), newTf]
                          });
                        }}
                        className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-950 font-bold rounded-lg text-xs"
                      >
                        + Tambah Pernyataan
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(editingQuestion.trueFalseItems || []).map((tf, idx) => (
                        <div key={tf.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                          <span className="font-bold text-purple-900 w-6">{idx + 1}.</span>
                          <input
                            type="text"
                            value={tf.statement}
                            onChange={e => {
                              const updated = (editingQuestion.trueFalseItems || []).map(t => (t.id === tf.id ? { ...t, statement: e.target.value } : t));
                              setEditingQuestion({ ...editingQuestion, trueFalseItems: updated });
                            }}
                            className="flex-1 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                          />
                          <button
                            onClick={() => {
                              const updated = (editingQuestion.trueFalseItems || []).map(t => (t.id === tf.id ? { ...t, isTrue: !t.isTrue } : t));
                              setEditingQuestion({ ...editingQuestion, trueFalseItems: updated });
                            }}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                              tf.isTrue ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                            }`}
                          >
                            {tf.isTrue ? 'BENAR' : 'SALAH'}
                          </button>
                          <button
                            onClick={() => {
                              const updated = (editingQuestion.trueFalseItems || []).filter(t => t.id !== tf.id);
                              setEditingQuestion({ ...editingQuestion, trueFalseItems: updated });
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* PEMBAHASAN & TRIK CEPAT AIRA BIMBEL */}
              <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-4">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Pembahasan Solusi & Trik Cepat Mas Aira</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Pembahasan Konsep Mendalam</label>
                  <textarea
                    rows={3}
                    value={editingQuestion.explanation}
                    onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    placeholder="Uraikan tahapan rumus dan logika pengerjaan secara sistematis..."
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-amber-950 block mb-1">
                    Trik Cepat 15 Detik Mas Aira (Khas Aira Bimbel)
                  </label>
                  <textarea
                    rows={2}
                    value={editingQuestion.fastTrick || ''}
                    onChange={e => setEditingQuestion({ ...editingQuestion, fastTrick: e.target.value })}
                    placeholder="Contoh: Kunci deret Sn = n/2 * (2a + (n-1)b) -> hitung langsung kelipatan..."
                    className="w-full p-2.5 bg-white border border-amber-400 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSaveQuestionToPackage}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-900 hover:to-purple-950 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Simpan Soal ke Paket</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
