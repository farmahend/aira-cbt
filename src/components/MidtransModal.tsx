import React, { useEffect, useState } from 'react';
import { PackageItem } from '../types';
import { formatRupiah } from '../utils/storage';
import { X, ShieldAlert, LoaderCircle, CreditCard, CheckCircle2 } from 'lucide-react';

interface MidtransModalProps {
  packageItem: PackageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (newSubId: string) => void;
}

declare global {
  interface Window {
    snap?: { pay: (token: string, callbacks: Record<string, (result?: unknown) => void>) => void };
  }
}

export const MidtransModal: React.FC<MidtransModalProps> = ({ packageItem, isOpen, onClose, onPaymentSuccess }) => {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setBusy(false);
      setNotice('');
      setPaid(false);
    }
  }, [isOpen]);

  if (!isOpen || !packageItem) return null;

  const startPayment = async () => {
    setBusy(true);
    setNotice('');
    try {
      const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
      const accessToken = localStorage.getItem('aira_supabase_access_token');
      if (!supabaseUrl || !anonKey) throw new Error('Konfigurasi Supabase belum dipasang di Cloudflare Pages.');
      if (!accessToken) throw new Error('Pembayaran online memerlukan sesi login Supabase. Silakan masuk kembali menggunakan login yang terhubung ke Supabase.');

      const response = await fetch(`${supabaseUrl}/functions/v1/midtrans-create`, {
        method: 'POST',
        headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: packageItem.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal membuat transaksi pembayaran.');
      if (!data.token || !data.clientKey) throw new Error('Token Snap atau Client Key tidak tersedia. Periksa secrets Supabase.');

      const scriptId = 'aira-midtrans-snap';
      if (!document.getElementById(scriptId)) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://app.sandbox.midtrans.com/snap/snap.js?client-key=${encodeURIComponent(data.clientKey)}`;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Gagal memuat Snap.js Midtrans.'));
          document.body.appendChild(script);
        });
      }
      if (!window.snap) throw new Error('Snap.js belum siap. Coba muat ulang halaman.');
      setBusy(false);
      window.snap.pay(data.token, {
        onSuccess: () => { setNotice('Pembayaran diterima. Sistem sedang memverifikasi status transaksi…'); void verifyPurchase(data.orderId, supabaseUrl, anonKey, accessToken); },
        onPending: () => setNotice('Transaksi masih menunggu pembayaran. Paket akan aktif setelah pembayaran terverifikasi.'),
        onError: () => setNotice('Pembayaran gagal. Silakan coba lagi atau pilih metode pembayaran lain.'),
        onClose: () => setNotice('Popup ditutup. Jika belum membayar, transaksi tetap berstatus menunggu.'),
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Terjadi kesalahan saat memulai pembayaran.');
      setBusy(false);
    }
  };

  const verifyPurchase = async (orderId: string, supabaseUrl: string, anonKey: string, accessToken: string) => {
    // Webhook is authoritative; poll the student's own RLS-protected row briefly for its update.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await new Promise(resolve => setTimeout(resolve, 1800));
      const response = await fetch(`${supabaseUrl}/rest/v1/package_purchases?select=id,payment_status,expires_at&order_id=eq.${encodeURIComponent(orderId)}`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) continue;
      const rows = await response.json();
      const purchase = rows[0];
      if (purchase?.payment_status === 'settlement' || purchase?.payment_status === 'capture') {
        setPaid(true);
        setNotice('Pembayaran terverifikasi. Paket tersimpan di akun Supabase Anda.');
        onPaymentSuccess(purchase.id);
        return;
      }
      if (purchase && ['deny', 'failure', 'cancel', 'expire', 'refund'].includes(purchase.payment_status)) {
        setNotice('Pembayaran belum berhasil. Status transaksi: ' + purchase.payment_status + '.');
        return;
      }
    }
    setNotice('Pembayaran belum terkonfirmasi di database. Jangan membayar ulang dahulu; periksa status transaksi beberapa saat lagi.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden my-8">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Pembayaran Aira Bimbel</h3>
            <p className="text-[11px] text-slate-300">Midtrans Snap · verifikasi server</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-xs text-purple-800">{packageItem.grade === 'SEMUA' ? 'Semua Jenjang' : `Jenjang ${packageItem.grade}`}</p>
            <h4 className="text-sm font-bold text-slate-900 mt-1">{packageItem.title}</h4>
            <p className="text-xl font-black text-purple-950 mt-2">{formatRupiah(packageItem.price)}</p>
            <p className="text-xs text-slate-600 mt-1">Masa aktif: {packageItem.durationDays || 60} hari sejak pembayaran berhasil</p>
          </div>
          {notice && <div role="status" className={`p-4 rounded-xl border text-sm ${paid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>{paid && <CheckCircle2 className="inline w-4 h-4 mr-2" />}{notice}</div>}
          {!paid && <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
            <div className="flex gap-3 items-start"><ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-purple-700" /><p className="text-xs leading-relaxed">Paket tidak langsung aktif ketika popup ditutup atau pembayaran masih pending. Aktivasi dilakukan setelah notifikasi server Midtrans diverifikasi dan dicatat di Supabase.</p></div>
          </div>}
          <button disabled={busy || paid} onClick={startPayment} className="w-full py-3 px-4 bg-purple-800 hover:bg-purple-900 disabled:opacity-60 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
            {busy ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}{busy ? 'Menyiapkan pembayaran…' : paid ? 'Pembayaran terverifikasi' : 'Bayar dengan Midtrans'}
          </button>
          <button onClick={onClose} className="w-full py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm">Tutup</button>
        </div>
      </div>
    </div>
  );
};
