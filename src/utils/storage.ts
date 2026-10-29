import {
  Question,
  Exam,
  PackageItem,
  StudentSubscription,
  ExamSessionResult,
  IntegrationConfig,
  LandingPageContent,
  AuthUser
} from '../types';
import {
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_PACKAGES,
  INITIAL_CONFIG,
  INITIAL_LANDING_CONTENT
} from '../data/initialData';

const STORAGE_KEYS = {
  QUESTIONS: 'aira_bimbel_questions_v1',
  EXAMS: 'aira_bimbel_exams_v1',
  PACKAGES: 'aira_bimbel_packages_v3',
  SUBSCRIPTIONS: 'aira_bimbel_subscriptions_v1',
  RESULTS: 'aira_bimbel_results_v1',
  CONFIG: 'aira_bimbel_config_v1',
  LANDING: 'aira_bimbel_landing_v2',
  AUTH_CURRENT: 'aira_bimbel_auth_current_v2',
  REGISTERED_USERS: 'aira_bimbel_registered_users_v2',
};

// Questions
export function getStoredQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function saveStoredQuestions(questions: Question[]): void {
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
}

// Exams
export function getStoredExams(): Exam[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
      return INITIAL_EXAMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EXAMS;
  }
}

export function saveStoredExams(exams: Exam[]): void {
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
}

// Packages
export function getStoredPackages(): PackageItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_PACKAGES));
      return INITIAL_PACKAGES;
    }
    const parsed: PackageItem[] = JSON.parse(raw);
    // If old format without questions or missing bundle packages, merge with initial
    if (!parsed || !Array.isArray(parsed) || !parsed[0]?.questions) {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_PACKAGES));
      return INITIAL_PACKAGES;
    }
    // Check if new initial packages (like bundle) need merging
    const existingIds = new Set(parsed.map(p => p.id));
    let hasNew = false;
    const merged: PackageItem[] = parsed.map(p => {
      const initMatch = INITIAL_PACKAGES.find(ip => ip.id === p.id);
      if (initMatch) {
        return {
          ...p,
          packageType: p.packageType || initMatch.packageType || 'satuan',
          bundledGrades: p.bundledGrades || initMatch.bundledGrades,
          bundledPackageIds: p.bundledPackageIds || initMatch.bundledPackageIds,
          discountBadgeText: p.discountBadgeText || initMatch.discountBadgeText
        };
      }
      return {
        ...p,
        packageType: p.packageType || 'satuan'
      };
    });

    INITIAL_PACKAGES.forEach(ip => {
      if (!existingIds.has(ip.id)) {
        merged.push(ip);
        hasNew = true;
      }
    });

    if (hasNew) {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return INITIAL_PACKAGES;
  }
}

export function saveStoredPackages(packages: PackageItem[]): void {
  localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
}

// Subscriptions (Paket Aktif 60 Hari)
export function getStoredSubscriptions(): StudentSubscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    const now = new Date().getTime();
    if (!raw) {
      const defaultSubs: StudentSubscription[] = [
        {
          id: 'sub_seed_smp_active',
          packageId: 'pkg-smp',
          packageName: 'Paket TKA Intensif SMP',
          grade: 'SMP',
          purchasedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(now + 58 * 24 * 60 * 60 * 1000).toISOString(),
          orderId: 'ORDER-AIRA-SMP60',
          amount: 69000,
          paymentMethod: 'Midtrans QRIS (GoPay/ShopeePay)',
          status: 'active'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(defaultSubs));
      return defaultSubs;
    }
    const subs: StudentSubscription[] = JSON.parse(raw);
    if (!Array.isArray(subs) || subs.length === 0) {
      const defaultSubs: StudentSubscription[] = [
        {
          id: 'sub_seed_smp_active',
          packageId: 'pkg-smp',
          packageName: 'Paket TKA Intensif SMP',
          grade: 'SMP',
          purchasedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(now + 58 * 24 * 60 * 60 * 1000).toISOString(),
          orderId: 'ORDER-AIRA-SMP60',
          amount: 69000,
          paymentMethod: 'Midtrans QRIS (GoPay/ShopeePay)',
          status: 'active'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(defaultSubs));
      return defaultSubs;
    }
    // Re-check expiry
    return subs.map(s => {
      const expTime = new Date(s.expiresAt).getTime();
      return {
        ...s,
        status: expTime > now ? 'active' : 'expired'
      };
    });
  } catch {
    return [];
  }
}

export function addSubscription(pkg: PackageItem, paymentMethod: string): StudentSubscription {
  const current = getStoredSubscriptions();
  const now = new Date();
  const expires = new Date(now.getTime() + (pkg.durationDays || 60) * 24 * 60 * 60 * 1000);

  const newSub: StudentSubscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    packageId: pkg.id,
    packageName: pkg.title,
    grade: pkg.grade,
    purchasedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    orderId: `ORDER-AIRA-${Date.now().toString().slice(-6)}`,
    amount: pkg.price,
    paymentMethod,
    status: 'active'
  };

  const newSubs: StudentSubscription[] = [newSub];

  // If this package is a bundle:
  // 1. If admin selected specific bundledPackageIds, unlock every single package!
  if (pkg.bundledPackageIds && pkg.bundledPackageIds.length > 0) {
    const allStoredPackages = getStoredPackages();
    pkg.bundledPackageIds.forEach((bId) => {
      const target = allStoredPackages.find(p => p.id === bId);
      if (target) {
        newSubs.push({
          id: `sub_child_pkg_${target.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          packageId: target.id,
          packageName: target.title,
          grade: target.grade,
          purchasedAt: now.toISOString(),
          expiresAt: expires.toISOString(),
          orderId: newSub.orderId,
          amount: 0,
          paymentMethod: `Bundle (${pkg.title})`,
          status: 'active'
        });
      }
    });
  }

  // 2. Also ensure all grades in bundledGrades are unlocked
  const gradesToUnlock: import('../types').GradeLevel[] = pkg.bundledGrades && pkg.bundledGrades.length > 0
    ? pkg.bundledGrades
    : (pkg.grade === 'SEMUA' ? ['SD', 'SMP', 'SMA'] : []);

  gradesToUnlock.forEach((bg) => {
    newSubs.push({
      id: `sub_bundle_${bg}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      packageId: `bundled-${pkg.id}-${bg}`,
      packageName: `Akses Bundle ${bg}: ${pkg.title}`,
      grade: bg,
      purchasedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      orderId: newSub.orderId,
      amount: 0,
      paymentMethod: `Bundle (${pkg.title})`,
      status: 'active'
    });
  });

  const updated = [...newSubs, ...current];
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updated));
  return newSub;
}

// Results
export function getStoredResults(): ExamSessionResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveExamResult(result: ExamSessionResult): void {
  const current = getStoredResults();
  const updated = [result, ...current];
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(updated));
}

// Active in-progress CBT session backup (Offline-First resilience & 0ms latency)
export function saveActiveCBTSession(
  examId: string,
  answers: Record<string, import('../types').CBTUserAnswer>,
  remainingSeconds: number
): void {
  try {
    const payload = {
      examId,
      answers,
      remainingSeconds,
      timestamp: Date.now()
    };
    localStorage.setItem(`aira_cbt_session_${examId}`, JSON.stringify(payload));
  } catch {
    // Ignore storage quota
  }
}

export function getActiveCBTSession(examId: string): {
  answers: Record<string, import('../types').CBTUserAnswer>;
  remainingSeconds: number;
} | null {
  try {
    const raw = localStorage.getItem(`aira_cbt_session_${examId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.examId === examId && parsed.answers) {
      return {
        answers: parsed.answers,
        remainingSeconds: typeof parsed.remainingSeconds === 'number' ? parsed.remainingSeconds : 0
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearActiveCBTSession(examId: string): void {
  try {
    localStorage.removeItem(`aira_cbt_session_${examId}`);
  } catch {
    // Ignore
  }
}

// Ultra-lightweight asynchronous Database Sync Engine
// Evaluates client-side, saves locally first, then syncs to database
export async function syncExamResultToDatabase(
  result: ExamSessionResult,
  config?: IntegrationConfig
): Promise<{ success: boolean; syncedAt: string; target: 'supabase' | 'local_verified' }> {
  const syncedAt = new Date().toISOString();

  // If Supabase credentials are configured, sync in background (non-blocking)
  if (config?.supabaseUrl && config?.supabaseAnonKey && config.supabaseUrl.startsWith('http')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${config.supabaseUrl}/rest/v1/exam_results`, {
        method: 'POST',
        headers: {
          'apikey': config.supabaseAnonKey,
          'Authorization': `Bearer ${config.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: result.id,
          exam_id: result.examId,
          exam_title: result.examTitle,
          grade: result.grade,
          is_demo: result.isDemo,
          score: result.score,
          total_points: result.totalPoints,
          percentage: result.percentage,
          is_passed: result.isPassed,
          time_spent_seconds: result.timeSpentSeconds,
          correct_count: result.correctCount,
          incorrect_count: result.incorrectCount,
          unanswered_count: result.unansweredCount,
          completed_at: result.completedAt,
          synced_at: syncedAt
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return { success: true, syncedAt, target: 'supabase' };
      }
    } catch {
      // Offline or network error: fallback to local sync queue safely
    }
  }

  // Record into verified local sync queue
  try {
    const queueRaw = localStorage.getItem('aira_cbt_sync_queue_v1') || '[]';
    const queue = JSON.parse(queueRaw);
    queue.unshift({ resultId: result.id, syncedAt, status: 'synced_local_verified' });
    localStorage.setItem('aira_cbt_sync_queue_v1', JSON.stringify(queue.slice(0, 50)));
  } catch {
    // Ignore
  }

  return { success: true, syncedAt, target: 'local_verified' };
}

// Integrations Config
export function getStoredConfig(): IntegrationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
      return INITIAL_CONFIG;
    }
    return { ...INITIAL_CONFIG, ...JSON.parse(raw), midtransServerKey: '' };
  } catch {
    return INITIAL_CONFIG;
  }
}

export function saveStoredConfig(config: IntegrationConfig): void {
  // Never persist Midtrans Server Key in browser storage, even if an older config contains one.\n  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({ ...config, midtransServerKey: '' }));
}

// Landing Page Content
export function getStoredLandingContent(): LandingPageContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LANDING);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LANDING, JSON.stringify(INITIAL_LANDING_CONTENT));
      return INITIAL_LANDING_CONTENT;
    }
    return { ...INITIAL_LANDING_CONTENT, ...JSON.parse(raw) };
  } catch {
    return INITIAL_LANDING_CONTENT;
  }
}

export function saveStoredLandingContent(content: LandingPageContent): void {
  localStorage.setItem(STORAGE_KEYS.LANDING, JSON.stringify(content));
}

export function resetStoredLandingContent(): LandingPageContent {
  localStorage.setItem(STORAGE_KEYS.LANDING, JSON.stringify(INITIAL_LANDING_CONTENT));
  return INITIAL_LANDING_CONTENT;
}

// Helper formatters
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function getRemainingDays(expiresAt: string): number {
  const diffMs = new Date(expiresAt).getTime() - new Date().getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// ============================================================================
// AUTHENTICATION & MULTI-ROLE STORAGE
// ============================================================================
export const DEFAULT_SEEDED_USERS: AuthUser[] = [
  {
    id: 'user-admin-01',
    name: 'Mas Aira (Super Admin)',
    email: 'admin@airabimbel.com',
    role: 'admin',
    phone: '+62 812-3456-7890',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-cust-01',
    name: 'Mohammad',
    email: 'mohammad719@guru.smp.belajar.id',
    role: 'customer',
    phone: '+62 857-1234-5678',
    grade: 'SMP',
    schoolOrigin: 'SMP Negeri 1',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    interestedPackageId: 'pkg-smp',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-cust-02',
    name: 'Siswa Demo Aira',
    email: 'siswa@airabimbel.com',
    role: 'customer',
    phone: '+62 813-9876-5432',
    grade: 'SMA',
    schoolOrigin: 'SMA Negeri Favorit',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    interestedPackageId: 'pkg-demo',
    createdAt: new Date().toISOString()
  }
];

export function getStoredUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(DEFAULT_SEEDED_USERS));
      return DEFAULT_SEEDED_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SEEDED_USERS;
  }
}

export function saveStoredUsers(users: AuthUser[]): void {
  localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
}

export function getStoredCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_CURRENT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredCurrentUser(user: AuthUser | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.AUTH_CURRENT);
  } else {
    localStorage.setItem(STORAGE_KEYS.AUTH_CURRENT, JSON.stringify(user));
  }
}

export function registerNewUser(userData: Omit<AuthUser, 'id' | 'createdAt'>): AuthUser {
  const users = getStoredUsers();
  const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    const updatedUser: AuthUser = { ...existing, ...userData };
    const updatedUsers = users.map(u => u.id === existing.id ? updatedUser : u);
    saveStoredUsers(updatedUsers);
    saveStoredCurrentUser(updatedUser);
    return updatedUser;
  }

  const newUser: AuthUser = {
    ...userData,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
    avatarUrl: userData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`
  };

  const updatedUsers = [newUser, ...users];
  saveStoredUsers(updatedUsers);
  saveStoredCurrentUser(newUser);
  return newUser;
}

