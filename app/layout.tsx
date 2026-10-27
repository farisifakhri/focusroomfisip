import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/actions/auth";

export const metadata: Metadata = {
  title: "Focus Room FISIP - UIN Syarif Hidayatullah Jakarta",
  description: "Sistem Pemesanan Ruangan Focus Room FISIP UIN Jakarta dengan Verifikasi QR Dinamis Anti-Kecurangan",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="id">
      <body className="bg-slate-50 min-h-screen flex flex-col text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FISIP UIN Syarif Hidayatullah Jakarta • Sistem Pemesanan Focus Room</p>
          <p className="mt-1 text-slate-400">Terintegrasi QR Dinamis Anti-Kecurangan & Presensi Real-Time</p>
        </footer>
      </body>
    </html>
  );
}
