import React, { useState, useEffect } from 'react';
import { PackageItem } from '../types';
import { formatRupiah, addSubscription, getStoredConfig, getStoredPackages } from '../utils/storage';
import {
  X,
  ShieldCheck,
  QrCode,
  CreditCard,
  Building2,
  Copy,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Download
} from 'lucide-react';

interface MidtransModalProps {
  packageItem: PackageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (newSubId: string) => void;
}

export const MidtransModal: React.FC<MidtransModalProps> = ({
  packageItem,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'qris' | 'va_bca' | 'va_mandiri' | 'va_bri'>('qris');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const config = getStoredConfig();
  const allStoredPackages = getStoredPackages();

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setIsProcessing(false);
      setTimeLeft(900);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !packageItem) return null;

  const vaNumbers = {
    va_bca: 'Belum tersedia — gateway belum terhubung',
    va_mandiri: 'Belum tersedia — gateway belum terhubung',
    va_bri: 'Belum tersedia — gateway belum terhubung'
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = () => {
    setIsProcessing(false);
    setPaymentError(
      'Pembayaran belum terhubung ke Midtrans asli. Paket tidak diaktifkan agar transaksi palsu tidak dianggap lunas.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-8">
        
        {/* Header Midtrans style */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 bg-white/10 rounded-md text-[11px] font-bold tracking-wider text-amber-400 uppercase">
              Midtrans Snap
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Pembayaran Aira Bimbel</h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  ● AKTIF ({config.midtransEnvironment === 'production' ? 'PROD' : 'SANDBOX'})
                </span>
              </div>
              <p className="text-[11px] text-purple-200">Gateway Pembayaran Terenkripsi 256-bit • Otomatis Aktif</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isSuccess ? (
          <div className="p-6 space-y-6">
            
            {/* Order Summary & 60-day reminder */}
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide">
                    {packageItem.grade === 'SEMUA' ? 'Semua Jenjang' : `Jenjang ${packageItem.grade}`}
                  </span>
                  {packageItem.packageType === 'bundle' && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-purple-950 text-[10px] font-black uppercase shadow-xs">
                      🎁 Bundle Hemat
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{packageItem.title}</h4>
                
                {/* Specific Bundled Packages List */}
                {packageItem.bundledPackageIds && packageItem.bundledPackageIds.length > 0 ? (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-amber-900 block mb-0.5">Mencakup Paket:</span>
                    <div className="flex flex-wrap gap-1">
                      {packageItem.bundledPackageIds.map((bId) => {
                        const bp = allStoredPackages.find(p => p.id === bId);
                        return bp ? (
                          <span key={bId} className="px-1.5 py-0.5 bg-white border border-purple-200 rounded text-[10px] font-semibold text-purple-900">
                            [{bp.grade}] {bp.title}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                ) : packageItem.bundledGrades && packageItem.bundledGrades.length > 0 ? (
                  <div className="text-[11px] text-amber-900 font-semibold mt-0.5">
                    Termasuk Sekaligus: Jenjang {packageItem.bundledGrades.join(' + ')}
                  </div>
                ) : null}

                <div className="flex items-center gap-2 mt-1 text-xs text-purple-900 font-medium">
                  <Clock className="w-3.5 h-3.5 text-purple-700" />
                  <span>Masa Aktif: <strong>60 Hari Penuh</strong></span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500">Total Tagihan:</span>
                {packageItem.originalPrice && packageItem.originalPrice > packageItem.price && (
                  <div className="text-xs text-slate-400 line-through">
                    {formatRupiah(packageItem.originalPrice)}
                  </div>
                )}
                <div className="text-lg font-black text-purple-950 tabular-nums">
                  {formatRupiah(packageItem.price)}
                </div>
                {packageItem.discountBadgeText && (
                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    {packageItem.discountBadgeText}
                  </span>
                )}
              </div>
            </div>

            {/* Countdown timer for payment */}
            <div className="flex items-center justify-between text-xs text-slate-500 bg-amber-50/80 px-3 py-2 rounded-lg border border-amber-200">
              <span className="flex items-center gap-1.5 font-medium text-amber-900">
                <Clock className="w-4 h-4 text-amber-600" />
                Selesaikan dalam:
              </span>
              <span className="font-mono font-bold text-amber-900 text-sm tabular-nums">
                {formatTimer(timeLeft)}
              </span>
            </div>

            {/* Payment Methods Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pilih Metode Pembayaran:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('qris')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    selectedMethod === 'qris'
                      ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-purple-700 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">QRIS Instant</div>
                    <div className="text-[10px] text-slate-500">GoPay, Shopee, Dana</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('va_bca')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    selectedMethod === 'va_bca'
                      ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-purple-700 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">BCA Virtual Account</div>
                    <div className="text-[10px] text-slate-500">Verifikasi Otomatis</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('va_mandiri')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    selectedMethod === 'va_mandiri'
                      ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-purple-700 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Mandiri VA</div>
                    <div className="text-[10px] text-slate-500">Livin' & ATM</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('va_bri')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    selectedMethod === 'va_bri'
                      ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-purple-700 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">BRI BRIVA</div>
                    <div className="text-[10px] text-slate-500">BRImo & Teller</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Instruction detail based on method */}
            <div role="status" className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-amber-700 mx-auto" />
              <p className="text-sm font-bold text-amber-900">Gateway pembayaran belum aktif</p>
              <p className="text-xs text-amber-800">
                Kode QRIS dan nomor Virtual Account asli hanya boleh ditampilkan setelah server membuat transaksi melalui Midtrans. Jangan melakukan transfer ke nomor contoh.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Paket:</span>
                <span className="font-bold text-slate-800">{packageItem.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jenjang:</span>
                <span className="font-semibold text-purple-800">{packageItem.grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Masa Aktif:</span>
                <span className="font-bold text-emerald-700">60 Hari (Hingga {new Date(Date.now() + 60*24*60*60*1000).toLocaleDateString('id-ID')})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Dibayar:</span>
                <span className="font-black text-slate-900">{formatRupiah(packageItem.price)}</span>
              </div>
            </div>

            {paymentError && (
              <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
                {paymentError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-purple-900 hover:bg-purple-950 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Buka Ruang Belajar & Ujian</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
