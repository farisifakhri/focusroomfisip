"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { ShieldCheck, AlertTriangle, RefreshCw, Clock } from "lucide-react";

interface DynamicQRViewProps {
  bookingId: string;
  initialStatus: string;
}

export default function DynamicQRView({ bookingId, initialStatus }: DynamicQRViewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [remainingSec, setRemainingSec] = useState<number>(30);
  const [status, setStatus] = useState<string>(initialStatus);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchToken = async () => {
    try {
      const res = await fetch(`/api/qr/token?bookingId=${bookingId}`);
      if (!res.ok) throw new Error("Gagal mengambil token QR");
      const data = await res.json();

      if (data.status) setStatus(data.status);

      if (data.payload) {
        // Generate QR Code image as Data URL
        const url = await QRCode.toDataURL(data.payload, {
          width: 280,
          margin: 2,
          color: {
            dark: "#064e3b", // uin-900 emerald
            light: "#ffffff",
          },
          errorCorrectionLevel: "M",
        });
        setQrDataUrl(url);
        setRemainingSec(data.remainingSeconds || 30);
        setLastRefreshed(new Date().toLocaleTimeString("id-ID"));
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Gagal memuat QR Code");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();

    // Detik per detik hitung mundur
    timerRef.current = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          fetchToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [bookingId]);

  if (status === "USED") {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <h3 className="text-xl font-bold text-emerald-800">Tiket Telah Digunakan</h3>
        <p className="text-emerald-700 text-sm mt-1">
          Presensi Anda telah diverifikasi oleh petugas verifikator FISIP. Selamat beraktivitas!
        </p>
      </div>
    );
  }

  if (status === "CANCELLED" || status === "EXPIRED") {
    return (
      <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-6 text-center shadow-sm">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-9 h-9" />
        </div>
        <h3 className="text-xl font-bold text-red-800">Tiket Tidak Berlaku</h3>
        <p className="text-red-700 text-sm mt-1">
          Status booking ini adalah: <strong className="uppercase">{status}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Live Badge */}
      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full mb-3 border border-emerald-200">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
        </span>
        DYNAMIC QR LIVE • ANTI-FRAUD
      </div>

      {/* QR Code Container */}
      <div className="relative p-4 bg-white rounded-2xl border-2 border-emerald-600/30 shadow-lg flex flex-col items-center">
        {loading ? (
          <div className="w-[260px] h-[260px] flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <span className="text-xs">Menyiapkan QR Dinamis...</span>
          </div>
        ) : error ? (
          <div className="w-[260px] h-[260px] flex flex-col items-center justify-center text-red-500 text-xs text-center p-4">
            <AlertTriangle className="w-8 h-8 mb-2" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            <img
              src={qrDataUrl}
              alt="Dynamic Focus Room QR Code"
              className="w-[260px] h-[260px] rounded-lg select-none pointer-events-none"
            />
            {/* Watermark bergerak */}
            <div className="text-[10px] text-slate-400 tracking-wider font-mono mt-1">
              SYNCED AT {lastRefreshed}
            </div>
          </>
        )}

        {/* Progress bar countdown */}
        <div className="w-full mt-3">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Berganti otomatis:
            </span>
            <span className="font-bold text-emerald-700 font-mono">{remainingSec} detik</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(remainingSec / 30) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Warning anti-screenshot notice */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5 max-w-sm">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Perhatian:</strong> QR Code ini berubah otomatis tiap 30 detik. <strong>Foto atau tangkapan layar (screenshot) tidak akan valid</strong> saat dipindai oleh petugas verifikator.
        </p>
      </div>
    </div>
  );
}
