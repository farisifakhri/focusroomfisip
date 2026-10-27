"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { verifyQRAction } from "@/actions/booking";
import { Camera, CheckCircle2, XCircle, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";

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

  // Efek suara sintetis (Web Audio API)
  const playBeep = (type: "success" | "error") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(280, audioCtx.currentTime);
        osc.frequency.setValueAtTime(180, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {
      // Audio context fallback
    }
  };

  const handleVerify = async (code: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setScanResult({
      status: "processing",
      message: "Sedang memverifikasi keabsahan tanda tangan token dan masa berlaku QR...",
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
        message: err.message || "Gagal memproses verifikasi kode QR.",
      });
    } finally {
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
          // ignore stream ticks
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera start error:", err);
      setCameraError(
        "Kamera tidak dapat diakses atau izin ditolak. Pastikan izin kamera aktif pada browser Anda atau gunakan uji coba manual di bawah."
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
    <div className="bg-white rounded-2xl shadow-md border-2 border-stone-300 overflow-hidden">
      <div className="bg-fisip-950 text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-500">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-300" />
            Pemindai Kamera Presensi Langsung
          </h2>
          <p className="text-[11px] text-stone-300 mt-0.5">
            Pindai QR dinamis pemesan saat memasuki ruangan untuk verifikasi check-in fisik
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Scanner Area */}
        <div className="flex flex-col items-center">
          <div
            id="qr-reader-container"
            className="w-full max-w-sm rounded-xl overflow-hidden bg-stone-900 aspect-square flex items-center justify-center relative border-2 border-stone-800 shadow-inner"
          >
            {!isScanning && (
              <div className="text-center p-6 text-stone-300">
                <Camera className="w-12 h-12 mx-auto mb-3 text-stone-500" />
                <p className="text-xs font-bold text-stone-200">Kamera Belum Aktif</p>
                <p className="text-[11px] text-stone-400 mt-1 max-w-xs">
                  Arahkan kamera ke ponsel pemesan. Sistem akan mengecek keaslian token 30 detik.
                </p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs max-w-sm text-center">
              {cameraError}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            {!isScanning ? (
              <button
                type="button"
                onClick={startScanner}
                className="px-5 py-2.5 bg-fisip-800 hover:bg-fisip-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                Aktifkan Kamera Scanner
              </button>
            ) : (
              <button
                type="button"
                onClick={stopScanner}
                className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Matikan Kamera
              </button>
            )}
          </div>
        </div>

        {/* Verification Result Display */}
        {scanResult.status !== "idle" && (
          <div
            className={`mt-6 p-5 rounded-xl border-2 transition-all ${
              scanResult.status === "success"
                ? "bg-emerald-50 border-emerald-600 text-emerald-950"
                : scanResult.status === "error"
                ? "bg-rose-50 border-rose-600 text-rose-950"
                : "bg-stone-50 border-stone-300 text-stone-800"
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
                <RefreshCw className="w-6 h-6 text-stone-600 animate-spin shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <h4 className="font-bold text-sm">
                  {scanResult.status === "success"
                    ? "Hasil Verifikasi: SAH / CHECK-IN BERHASIL"
                    : scanResult.status === "error"
                    ? "Hasil Verifikasi: DITOLAK (TIDAK SAH)"
                    : "Memproses Verifikasi..."}
                </h4>
                <p className="text-xs mt-1 whitespace-pre-line leading-relaxed">{scanResult.message}</p>

                {scanResult.booking && (
                  <div className="mt-3 pt-3 border-t border-stone-200/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-stone-500 text-[10px] block uppercase">Ruangan:</span>
                      <p className="font-bold text-stone-900">{scanResult.booking.room?.name || "-"}</p>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block uppercase">Penanggung Jawab:</span>
                      <p className="font-bold text-stone-900">{scanResult.booking.responsibleName || "-"}</p>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block uppercase">NIM / NIP:</span>
                      <p className="font-mono font-medium text-stone-900">{scanResult.booking.identifier || "-"}</p>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block uppercase">Jumlah Peserta:</span>
                      <p className="font-bold text-stone-900">{scanResult.booking.userCount || "-"} Orang</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Input Fallback */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
            Uji Coba Verifikasi Manual (String QR)
          </h3>
          <p className="text-[11px] text-stone-500 mb-2">
            Masukkan string token (format: <code>FR-UIN:id:window:signature</code>) untuk menguji validasi:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="FR-UIN:xxxx-xxxx-xxxx..."
              className="flex-1 px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-fisip-700 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleVerify(manualCode)}
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"
            >
              Uji Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
