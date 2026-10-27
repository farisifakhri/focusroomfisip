"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, Calendar, QrCode, Building, ShieldCheck } from "lucide-react";
import { logoutUser } from "@/actions/auth";

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

  // Jika sedang di rute /admin atau /admin/login, kita jangan tampilkan navbar mahasiswa standar
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <header className="bg-fisip-950 border-b border-fisip-800 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <NextLink href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-fisip-700 border border-fisip-600 flex items-center justify-center font-bold text-white shadow-inner">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-white text-sm">PORTAL VERIFIKATOR</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/30 uppercase">
                  Admin FISIP
                </span>
              </div>
              <p className="text-[11px] text-stone-300">Fakultas Ilmu Sosial dan Ilmu Politik UIN Jakarta</p>
            </div>
          </NextLink>

          <div className="flex items-center gap-3">
            <NextLink
              href="/"
              className="text-xs text-stone-300 hover:text-white px-3 py-1.5 rounded-lg border border-fisip-800 hover:bg-fisip-900 transition-colors"
            >
              Lihat Portal Pemesan
            </NextLink>

            {user?.role === "ADMIN" && (
              <form action={() => logoutUser("/admin/login")}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fisip-800 hover:bg-fisip-700 text-stone-200 hover:text-white text-xs font-medium border border-fisip-700 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar Admin
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-fisip-900 border-b border-fisip-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <NextLink href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-fisip-800 border border-fisip-700 flex items-center justify-center text-white shadow-sm group-hover:bg-fisip-700 transition-colors">
            <Building className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-white text-base">FOCUS ROOM</span>
              <span className="text-[10px] bg-white/10 text-amber-200 font-bold px-1.5 py-0.5 rounded border border-white/20">
                FISIP
              </span>
            </div>
            <p className="text-[11px] text-stone-300 leading-none mt-0.5">UIN Syarif Hidayatullah Jakarta</p>
          </div>
        </NextLink>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NextLink
            href="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              pathname === "/" ? "bg-fisip-800 text-amber-200 shadow-inner" : "text-stone-200 hover:text-white hover:bg-fisip-800/60"
            }`}
          >
            Katalog Ruang
          </NextLink>
          <NextLink
            href="/booking"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              pathname === "/booking"
                ? "bg-fisip-800 text-amber-200 shadow-inner"
                : "text-stone-200 hover:text-white hover:bg-fisip-800/60"
            }`}
          >
            Formulir Peminjaman
          </NextLink>
          <NextLink
            href="/ticket"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              pathname === "/ticket"
                ? "bg-fisip-800 text-amber-200 shadow-inner"
                : "text-stone-200 hover:text-white hover:bg-fisip-800/60"
            }`}
          >
            E-Tiket Presensi
          </NextLink>
        </nav>

        {/* User Info / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white">{user.name}</span>
                <span className="text-[10px] text-amber-200/90 font-mono">
                  {user.role === "DOSEN_PEGAWAI" ? `NIP/NIDN: ${user.nim}` : `NIM: ${user.nim}`}
                </span>
              </div>
              <form action={() => logoutUser("/login")}>
                <button
                  type="submit"
                  title="Keluar"
                  className="p-2 text-stone-300 hover:text-white hover:bg-fisip-800 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <NextLink
              href="/login"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-fisip-950 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Masuk Pemesan
            </NextLink>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden border-t border-fisip-800/80 px-4 py-2 flex justify-around text-xs bg-fisip-950">
        <NextLink
          href="/"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/" ? "text-amber-400 font-bold" : "text-stone-300"}`}
        >
          <Building className="w-4 h-4" />
          <span>Katalog</span>
        </NextLink>
        <NextLink
          href="/booking"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/booking" ? "text-amber-400 font-bold" : "text-stone-300"}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Pinjam</span>
        </NextLink>
        <NextLink
          href="/ticket"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/ticket" ? "text-amber-400 font-bold" : "text-stone-300"}`}
        >
          <QrCode className="w-4 h-4" />
          <span>Tiket QR</span>
        </NextLink>
      </div>
    </header>
  );
}
