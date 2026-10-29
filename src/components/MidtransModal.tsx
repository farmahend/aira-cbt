import React from 'react';
import { PackageItem } from '../types';
import { formatRupiah } from '../utils/storage';
import { X, ShieldAlert } from 'lucide-react';

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
}) => {
  if (!isOpen || !packageItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden my-8">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Pembayaran Aira Bimbel</h3>
            <p className="text-[11px] text-slate-300">Status gateway: belum terhubung</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-xs text-purple-800">{packageItem.grade === 'SEMUA' ? 'Semua Jenjang' : `Jenjang ${packageItem.grade}`}</p>
            <h4 className="text-sm font-bold text-slate-900 mt-1">{packageItem.title}</h4>
            <p className="text-xl font-black text-purple-950 mt-2">{formatRupiah(packageItem.price)}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 text-amber-950">
            <div className="flex gap-3 items-start">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Pembayaran belum tersedia</p>
                <p className="text-xs mt-1 leading-relaxed">Integrasi resmi Midtrans belum dikonfigurasi. Demi keamanan, QRIS dan nomor Virtual Account simulasi telah dihapus. Paket tidak akan diaktifkan sebelum pembayaran nyata diverifikasi oleh gateway.</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm">Tutup</button>
        </div>
      </div>
    </div>
  );
};
