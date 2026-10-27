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
        const url = await QRCode.toDataURL(data.payload, {
          width: 280,
          margin: 2,
          color: {
            dark: "#521b1b", // Deep Maroon FISIP
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
      <div className="bg-emerald-50 border-2 border-emerald-600 rounded-2xl p-6 text-center shadow-sm w-full max-w-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <h3 className="text-lg font-bold text-emerald-950">Presensi Telah Terverifikasi</h3>
        <p className="text-emerald-800 text-xs mt-1">
          Tiket ini telah dipindai oleh petugas verifikator FISIP. Selamat menggunakan ruangan!
        </p>
      </div>
    );
  }

  if (status === "CANCELLED" || status === "EXPIRED") {
    return (
      <div className="bg-stone-100 border-2 border-stone-300 rounded-2xl p-6 text-center shadow-sm w-full max-w-sm">
        <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-9 h-9" />
        </div>
        <h3 className="text-lg font-bold text-stone-900">Tiket Tidak Berlaku</h3>
        <p className="text-stone-600 text-xs mt-1">
          Status reservasi: <strong className="uppercase text-rose-700">{status}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Live Badge */}
      <div className="flex items-center gap-2 px-3 py-1 bg-fisip-100 text-fisip-900 text-xs font-bold rounded-full mb-3 border border-fisip-200">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fisip-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fisip-700"></span>
        </span>
        LIVE DYNAMIC QR • SINKRON OTOMATIS
      </div>

      {/* QR Code Container */}
      <div className="relative p-4 bg-white rounded-2xl border-2 border-stone-300 shadow-md flex flex-col items-center">
        {loading ? (
          <div className="w-[260px] h-[260px] flex flex-col items-center justify-center text-stone-400">
            <RefreshCw className="w-8 h-8 animate-spin text-fisip-800 mb-2" />
            <span className="text-xs">Menghasilkan Token Presensi...</span>
          </div>
        ) : error ? (
          <div className="w-[260px] h-[260px] flex flex-col items-center justify-center text-rose-600 text-xs text-center p-4">
            <AlertTriangle className="w-8 h-8 mb-2" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            <img
              src={qrDataUrl}
              alt="Dynamic QR Code Focus Room FISIP"
              className="w-[260px] h-[260px] rounded-lg select-none pointer-events-none"
            />
            <div className="text-[10px] text-stone-400 font-mono tracking-wider mt-1">
              DISINKRONKAN PUKUL {lastRefreshed}
            </div>
          </>
        )}

        {/* Progress bar countdown */}
        <div className="w-full mt-3">
          <div className="flex justify-between items-center text-xs text-stone-600 mb-1">
            <span className="flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-fisip-800" />
              Berganti otomatis:
            </span>
            <span className="font-bold text-fisip-900 font-mono">{remainingSec} detik</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
            <div
              className="bg-fisip-700 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(remainingSec / 30) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Warning anti-screenshot notice */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs flex items-start gap-2.5 max-w-sm">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Perhatian Verifikasi:</strong> Tunjukkan QR ini langsung dari layar ponsel Anda kepada petugas verifikator di ruangan. <strong>Foto cetak atau tangkapan layar (screenshot) akan otomatis tertolak.</strong>
        </p>
      </div>
    </div>
  );
}
