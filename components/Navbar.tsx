"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, Calendar, QrCode, Building2, ShieldCheck, MapPin, Phone, Globe } from "lucide-react";

interface NavbarProps {
  user?: {
    id: string;
    nim: string;
    name: string;
    role: "MAHASISWA" | "DOSEN_PEGAWAI" | "ADMIN";
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdminRoute = pathname.startsWith("/admin");

  const handleLogout = async (target = "/login") => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push(target);
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      // Fallback redirect
      window.location.href = target;
    } finally {
      setLoggingOut(false);
    }
  };

  // Navigasi Khusus Portal Admin / Verifikator
  if (isAdminRoute) {
    return (
      <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-50 shadow-sm">
        {/* Top utility bar */}
        <div className="bg-uin-900 text-slate-300 text-[11px] px-4 py-1.5 border-b border-uin-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="font-semibold tracking-wide text-white">
              PORTAL ADMINISTRASI & VERIFIKATOR • FISIP UIN SYARIF HIDAYATULLAH JAKARTA
            </span>
            <div className="hidden sm:flex items-center gap-4">
              <span>Jl. Kertamukti No. 5 Cirendeu, Ciputat Timur</span>
              <a href="https://fisip.uinjkt.ac.id" target="_blank" rel="noreferrer" className="hover:text-gold-400">
                fisip.uinjkt.ac.id
              </a>
            </div>
          </div>
        </div>

        {/* Main Admin Navbar */}
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <NextLink href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-fisip-800 flex items-center justify-center text-white shadow-sm font-black">
              FR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-uin-900 tracking-tight">SISTEM FOCUS ROOM</span>
                <span className="text-[10px] font-bold uppercase bg-fisip-100 text-fisip-800 px-2 py-0.5 rounded border border-fisip-200">
                  Panel Verifikator
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Fakultas Ilmu Sosial dan Ilmu Politik</p>
            </div>
          </NextLink>

          <div className="flex items-center gap-3">
            <NextLink
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Lihat Portal Pemesan
            </NextLink>

            {user?.role === "ADMIN" && (
              <button
                type="button"
                onClick={() => handleLogout("/admin/login")}
                disabled={loggingOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-fisip-800 hover:bg-fisip-900 text-white text-xs font-bold transition-all shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                {loggingOut ? "Keluar..." : "Keluar Petugas"}
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Navigasi Utama Mahasiswa & Dosen
  return (
    <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Top Academic Ribbon (Khas Kampus Negeri) */}
      <div className="bg-uin-900 text-slate-300 text-[11px] px-4 py-1 border-b border-uin-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">KEMENTERIAN AGAMA REPUBLIK INDONESIA</span>
            <span className="text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-300">UIN SYARIF HIDAYATULLAH JAKARTA</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="hidden md:inline">Kampus 2 Cirendeu</span>
            <a
              href="https://fisip.uinjkt.ac.id"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold-400 text-slate-300 font-semibold flex items-center gap-1"
            >
              <Globe className="w-3 h-3" />
              fisip.uinjkt.ac.id
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <NextLink href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-fisip-800 border-2 border-gold-500 flex items-center justify-center text-white shadow-sm font-black text-sm">
            FR
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black tracking-tight text-uin-900 text-base">FOCUS ROOM</span>
              <span className="text-[10px] bg-fisip-800 text-white font-extrabold px-1.5 py-0.2 rounded">
                FISIP
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium -mt-0.5">
              Fakultas Ilmu Sosial dan Ilmu Politik
            </p>
          </div>
        </NextLink>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <NextLink
            href="/"
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              pathname === "/"
                ? "bg-slate-100 text-fisip-800 border-b-2 border-fisip-800"
                : "text-slate-600 hover:text-uin-900 hover:bg-slate-50"
            }`}
          >
            Katalog Ruang
          </NextLink>

          <NextLink
            href="/booking"
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              pathname === "/booking"
                ? "bg-slate-100 text-fisip-800 border-b-2 border-fisip-800"
                : "text-slate-600 hover:text-uin-900 hover:bg-slate-50"
            }`}
          >
            Formulir Peminjaman
          </NextLink>

          <NextLink
            href="/ticket"
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              pathname === "/ticket"
                ? "bg-slate-100 text-fisip-800 border-b-2 border-fisip-800"
                : "text-slate-600 hover:text-uin-900 hover:bg-slate-50"
            }`}
          >
            E-Tiket Presensi
          </NextLink>
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-uin-900 leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {user.role === "DOSEN_PEGAWAI" ? `NIP ${user.nim}` : `NIM ${user.nim}`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleLogout("/login")}
                disabled={loggingOut}
                title="Keluar Akun"
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-fisip-50 hover:text-fisip-800 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-fisip-800" />
                <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
              </button>
            </div>
          ) : (
            <NextLink
              href="/login"
              className="px-4 py-2 bg-fisip-800 hover:bg-fisip-900 text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Masuk Pemesan
            </NextLink>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden border-t border-slate-200 px-4 py-2 flex justify-around text-xs bg-slate-50">
        <NextLink
          href="/"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/" ? "text-fisip-800 font-bold" : "text-slate-600"}`}
        >
          <Building2 className="w-4 h-4" />
          <span>Katalog</span>
        </NextLink>
        <NextLink
          href="/booking"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/booking" ? "text-fisip-800 font-bold" : "text-slate-600"}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Pinjam</span>
        </NextLink>
        <NextLink
          href="/ticket"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/ticket" ? "text-fisip-800 font-bold" : "text-slate-600"}`}
        >
          <QrCode className="w-4 h-4" />
          <span>Tiket QR</span>
        </NextLink>
      </div>
    </header>
  );
}
