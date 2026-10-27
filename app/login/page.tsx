"use client";

import React, { useState } from "react";
import { loginUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { User, Shield, ArrowRight, Building2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginUser(nim, name);
      if (res.success && res.user) {
        if (res.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/booking");
        }
        router.refresh();
      } else {
        setError(res.error || "Gagal masuk. Silakan cek kembali NIM Anda.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoNim: string, demoName: string) => {
    setNim(demoNim);
    setName(demoName);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 p-8 text-white text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Building2 className="w-8 h-8 text-emerald-950" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Portal Masuk Focus Room</h1>
          <p className="text-xs text-emerald-200 mt-1">
            Fakultas Ilmu Sosial dan Ilmu Politik (FISIP) UIN Jakarta
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              NIM Mahasiswa / ID Petugas
            </label>
            <input
              type="text"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Contoh: 11220910000001 atau ADMIN_FISIP"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Memverifikasi..." : "Masuk ke Sistem"}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider text-center">
              Pilihan Akun Uji Coba Cepat
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("11220910000001", "Ahmad Fauzi (Mahasiswa)")}
                className="p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <User className="w-3.5 h-3.5" />
                  Mahasiswa
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">Ahmad Fauzi</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("ADMIN_FISIP", "Petugas Verifikator FISIP")}
                className="p-2.5 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 rounded-xl text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                  <Shield className="w-3.5 h-3.5" />
                  Verifikator
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">ADMIN_FISIP</div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
