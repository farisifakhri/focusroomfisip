"use client";

import Link from "next/navigation";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { Shield, User, LogOut, Calendar, QrCode, Home, Building2 } from "lucide-react";
import { logoutUser } from "@/actions/auth";

interface NavbarProps {
  user?: {
    id: string;
    nim: string;
    name: string;
    role: "MAHASISWA" | "ADMIN";
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800 text-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <NextLink href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-white shadow-md group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6 text-emerald-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base">FOCUS ROOM</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.5 rounded border border-emerald-400/30">
                FISIP UIN
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 -mt-0.5">UIN Syarif Hidayatullah Jakarta</p>
          </div>
        </NextLink>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <NextLink
            href="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname === "/" ? "bg-emerald-800 text-white" : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
            }`}
          >
            Ruangan
          </NextLink>
          <NextLink
            href="/booking"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname === "/booking"
                ? "bg-emerald-800 text-white"
                : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
            }`}
          >
            Pesan Slot
          </NextLink>
          <NextLink
            href="/ticket"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname === "/ticket"
                ? "bg-emerald-800 text-white"
                : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
            }`}
          >
            Tiket Saya
          </NextLink>
          {user?.role === "ADMIN" && (
            <NextLink
              href="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-emerald-500 text-emerald-950 font-bold"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-800"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Panel Verifikator
            </NextLink>
          )}
        </nav>

        {/* User / Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white leading-tight">{user.name}</span>
                <span className="text-[10px] text-emerald-300/80 font-mono">
                  {user.role === "ADMIN" ? "Petugas Verifikator" : `NIM: ${user.nim}`}
                </span>
              </div>
              <form action={logoutUser}>
                <button
                  type="submit"
                  title="Keluar"
                  className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-900/80 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <NextLink
              href="/login"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Masuk Mahasiswa / Admin
            </NextLink>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden border-t border-emerald-900 px-4 py-2 flex justify-around text-xs">
        <NextLink
          href="/"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/" ? "text-emerald-400 font-bold" : "text-emerald-200"}`}
        >
          <Home className="w-4 h-4" />
          <span>Ruangan</span>
        </NextLink>
        <NextLink
          href="/booking"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/booking" ? "text-emerald-400 font-bold" : "text-emerald-200"}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Pesan</span>
        </NextLink>
        <NextLink
          href="/ticket"
          className={`flex flex-col items-center gap-0.5 ${pathname === "/ticket" ? "text-emerald-400 font-bold" : "text-emerald-200"}`}
        >
          <QrCode className="w-4 h-4" />
          <span>Tiket QR</span>
        </NextLink>
        {user?.role === "ADMIN" && (
          <NextLink
            href="/admin"
            className={`flex flex-col items-center gap-0.5 ${pathname.startsWith("/admin") ? "text-emerald-400 font-bold" : "text-emerald-200"}`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </NextLink>
        )}
      </div>
    </header>
  );
}
