"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { verifyQRAction } from "@/actions/booking";
import { Camera, CheckCircle2, XCircle, AlertCircle, RefreshCw, Volume2 } from "lucide-react";

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: "idle" | "success" | "error" | "processing";
    message: string;
    booking?: any;
  }>({ status: "idle", message: "" });
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Sound feedback generator using standard Web Audio API
  const playBeep = (type: "success" | "error") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {
      // Audio context might be blocked if no user interaction yet
    }
  };

  const handleVerify = async (code: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setScanResult({
      status: "processing",
      message: "Sedang memverifikasi keaslian dan batas waktu QR...",
    });

    try {
      const res = await verifyQRAction(code.trim());
      if (res.success) {
        playBeep("success");
        setScanResult({
          status: "success",
          message: res.message,
          booking: res.booking,
        });
      } else {
        playBeep("error");
        setScanResult({
          status: "error",
          message: res.message,
          booking: res.booking,
        });
      }
    } catch (err: any) {
      playBeep("error");
      setScanResult({
        status: "error",
        message: err.message || "Gagal memproses verifikasi.",
      });
    } finally {
      // Tunggu 3 detik sebelum mengizinkan scan baru berikutnya
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 3000);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    try {
      const scanner = new Html5Qrcode("qr-reader-container", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleVerify(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera start error:", err);
      setCameraError(
        "Kamera tidak dapat diakses. Pastikan izin kamera aktif atau gunakan mode verifikasi manual di bawah."
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (e) {
        console.error("Error stopping scanner:", e);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
      <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            Scanner Presensi QR Dinamis
          </h2>
          <p className="text-xs text-emerald-200 mt-0.5">
            Pindai QR mahasiswa secara live untuk verifikasi akses masuk Focus Room
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Scanner Area */}
        <div className="flex flex-col items-center">
          <div
            id="qr-reader-container"
            className="w-full max-w-sm rounded-xl overflow-hidden bg-slate-900 aspect-square flex items-center justify-center relative"
          >
            {!isScanning && (
              <div className="text-center p-6 text-slate-300">
                <Camera className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-60" />
                <p className="text-sm font-medium">Kamera belum diaktifkan</p>
                <p className="text-xs text-slate-400 mt-1">
                  Klik tombol di bawah untuk menyalakan kamera verifikator
                </p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs max-w-sm text-center">
              {cameraError}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            {!isScanning ? (
              <button
                onClick={startScanner}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Buka Kamera Scanner
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
              >
                Matikan Kamera
              </button>
            )}
          </div>
        </div>

        {/* Verification Result Display */}
        {scanResult.status !== "idle" && (
          <div
            className={`mt-6 p-5 rounded-2xl border-2 transition-all ${
              scanResult.status === "success"
                ? "bg-emerald-50 border-emerald-500 text-emerald-950"
                : scanResult.status === "error"
                ? "bg-rose-50 border-rose-500 text-rose-950"
                : "bg-slate-50 border-slate-300 text-slate-800"
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.status === "success" && (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              )}
              {scanResult.status === "error" && (
                <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              )}
              {scanResult.status === "processing" && (
                <RefreshCw className="w-6 h-6 text-slate-600 animate-spin shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <h4 className="font-bold text-base">
                  {scanResult.status === "success"
                    ? "Verifikasi Berhasil"
                    : scanResult.status === "error"
                    ? "Verifikasi Ditolak"
                    : "Memproses..."}
                </h4>
                <p className="text-sm mt-1 whitespace-pre-line leading-relaxed">{scanResult.message}</p>

                {scanResult.booking && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Ruangan:</span>
                      <p className="font-bold">{scanResult.booking.room?.name || "-"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Mahasiswa:</span>
                      <p className="font-bold">{scanResult.booking.user?.name || "-"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">NIM:</span>
                      <p className="font-mono font-medium">{scanResult.booking.user?.nim || "-"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Status Terkini:</span>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-white border">
                        {scanResult.booking.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Input Fallback */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            Verifikasi Manual (Uji Coba / Alternatif Tanpa Kamera)
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Masukkan string payload QR (format: <code>FR-UIN:id:window:sig</code>) untuk memverifikasi secara langsung:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Contoh: FR-UIN:xxx:xxx:xxx"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              onClick={() => handleVerify(manualCode)}
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all"
            >
              Cek Validitas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
