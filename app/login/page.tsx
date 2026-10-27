"use client";

import React, { useState } from "react";
import { loginUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { User, ArrowRight, Building, AlertCircle, Shield } from "lucide-react";
import NextLink from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<"MAHASISWA" | "DOSEN_PEGAWAI">("MAHASISWA");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [prodi, setProdi] = useState("Ilmu Politik");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginUser({
        identifier,
        name,
        email,
        phone,
        prodi,
        userType,
      });

      if (res.success) {
        router.push("/booking");
        router.refresh();
      } else {
        setError(res.error || "Gagal masuk. Silakan cek kembali data Anda.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (type: "MHS" | "DOSEN") => {
    if (type === "MHS") {
      setUserType("MAHASISWA");
      setIdentifier("11220910000001");
      setName("Ahmad Fauzi");
      setEmail("ahmad.fauzi@mhs.uinjkt.ac.id");
      setPhone("081234567890");
      setProdi("Ilmu Politik");
    } else {
      setUserType("DOSEN_PEGAWAI");
      setIdentifier("198501152010011002");
      setName("Dr. Budi Santoso, M.Si");
      setEmail("budi.santoso@uinjkt.ac.id");
      setPhone("081188990011");
      setProdi("Hubungan Internasional");
    }
  };

  return (
    <div className="min-h-[85vh] bg-stone-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-stone-300 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-fisip-900 p-8 text-white text-center border-b-4 border-fisip-700">
          <div className="w-14 h-14 bg-fisip-800 border border-fisip-700 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Building className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Portal Pemesanan Focus Room</h1>
          <p className="text-xs text-stone-300 mt-1">
            Fakultas Ilmu Sosial dan Ilmu Politik • UIN Syarif Hidayatullah Jakarta
          </p>
        </div>

        {/* Tab Role Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={() => setUserType("MAHASISWA")}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${
              userType === "MAHASISWA"
                ? "border-fisip-800 text-fisip-900 bg-white"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Mahasiswa FISIP
          </button>
          <button
            type="button"
            onClick={() => setUserType("DOSEN_PEGAWAI")}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${
              userType === "DOSEN_PEGAWAI"
                ? "border-fisip-800 text-fisip-900 bg-white"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Dosen / Tenaga Kependidikan
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="user-identifier"
                className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1"
              >
                {userType === "MAHASISWA" ? "NIM Mahasiswa" : "NIP / NIDN"} <span className="text-red-600">*</span>
              </label>
              <input
                id="user-identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={userType === "MAHASISWA" ? "11220910000001" : "19850115..."}
                required
                inputMode="numeric"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="user-name"
                className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1"
              >
                Nama Lengkap <span className="text-red-600">*</span>
              </label>
              <input
                id="user-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap sesuai SIAKAD"
                required
                autoComplete="name"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="user-email"
                className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1"
              >
                Email Aktif <span className="text-red-600">*</span>
              </label>
              <input
                id="user-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@uinjkt.ac.id"
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="user-phone"
                className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1"
              >
                No. WhatsApp / HP <span className="text-red-600">*</span>
              </label>
              <input
                id="user-phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                required
                inputMode="tel"
                autoComplete="tel"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="user-prodi"
              className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1"
            >
              Program Studi / Unit Kerja <span className="text-red-600">*</span>
            </label>
            <select
              id="user-prodi"
              name="prodi"
              value={prodi}
              onChange={(e) => setProdi(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none font-medium text-stone-800"
            >
              <option value="Ilmu Politik">S1 Ilmu Politik</option>
              <option value="Sosiologi">S1 Sosiologi</option>
              <option value="Hubungan Internasional">S1 Hubungan Internasional</option>
              <option value="Magister Sosiologi">S2 Sosiologi</option>
              <option value="Dosen FISIP">Dosen / Tenaga Pengajar FISIP</option>
              <option value="Tenaga Kependidikan FISIP">Tenaga Kependidikan / Pegawai FISIP</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-fisip-800 hover:bg-fisip-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Menyiapkan Sesi..." : "Lanjutkan ke Formulir Peminjaman"}
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-stone-200">
            <span className="text-[11px] font-semibold text-stone-400 block uppercase tracking-wider text-center mb-2">
              Isi Data Simulasi Cepat
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("MHS")}
                className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-left transition-colors"
              >
                <div className="text-xs font-bold text-fisip-900">Mahasiswa FISIP</div>
                <div className="text-[10px] text-stone-500 font-mono mt-0.5">Ahmad Fauzi (11220910000001)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("DOSEN")}
                className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-left transition-colors"
              >
                <div className="text-xs font-bold text-fisip-900">Dosen FISIP</div>
                <div className="text-[10px] text-stone-500 font-mono mt-0.5">Dr. Budi Santoso (19850115...)</div>
              </button>
            </div>
          </div>

          {/* Separate Admin Portal Link */}
          <div className="pt-3 text-center border-t border-stone-100">
            <NextLink
              href="/admin/login"
              className="text-xs text-stone-500 hover:text-fisip-900 font-medium inline-flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Petugas Verifikator Kampus? <strong>Masuk di Portal Admin khusus</strong>
            </NextLink>
          </div>
        </form>
      </div>
    </div>
  );
}
