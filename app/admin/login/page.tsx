"use client";

import React, { useState } from "react";
import { adminLogin } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Building } from "lucide-react";
import NextLink from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminLogin(adminId, passcode);
      if (res.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(res.error || "Akses ditolak. Periksa kembali ID Petugas dan Kata Sandi.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memverifikasi kredensial.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setAdminId("ADMIN_FISIP");
    setPasscode("admin123");
  };

  return (
    <div className="min-h-[85vh] bg-stone-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-300 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-fisip-950 p-8 text-white text-center border-b-4 border-fisip-700">
          <div className="w-14 h-14 bg-fisip-800 border border-fisip-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Portal Verifikator & Admin</h1>
          <p className="text-xs text-stone-300 mt-1">
            Fakultas Ilmu Sosial dan Ilmu Politik (FISIP) UIN Syarif Hidayatullah Jakarta
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="admin-id"
              className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              ID Petugas Verifikator
            </label>
            <input
              id="admin-id"
              name="admin-id"
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="Contoh: ADMIN_FISIP"
              required
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fisip-700 focus:bg-white transition-all font-mono"
            />
          </div>

          <div>
            <label
              htmlFor="passcode"
              className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              Kata Sandi Verifikator
            </label>
            <input
              id="passcode"
              name="passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Masukkan sandi akses verifikator"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fisip-700 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-fisip-800 hover:bg-fisip-900 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Memverifikasi Otorisasi..." : "Masuk ke Panel Admin"}
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>

          <div className="pt-4 border-t border-stone-200 space-y-3 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-fisip-800 hover:text-fisip-900 font-semibold underline underline-offset-2"
            >
              Gunakan Kredensial Uji Coba Cepat (ADMIN_FISIP / admin123)
            </button>

            <div className="pt-2">
              <NextLink
                href="/login"
                className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1"
              >
                <Building className="w-3.5 h-3.5" />
                Beralih ke Portal Mahasiswa / Dosen Pemesan
              </NextLink>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
