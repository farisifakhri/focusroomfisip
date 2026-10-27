import { getCurrentUser } from "@/actions/auth";
import { getRooms, getAllBookingsList } from "@/lib/data";
import AdminClient from "./AdminClient";
import NextLink from "next/link";
import { ShieldAlert, ArrowRight, User } from "lucide-react";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Akses Khusus Verifikator</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman ini khusus untuk petugas verifikator FISIP UIN Jakarta untuk memindai QR dinamis mahasiswa dan memantau status ruangan.
          </p>

          <div className="pt-2 space-y-2">
            <NextLink
              href="/login"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Masuk sebagai Petugas Verifikator
              <ArrowRight className="w-4 h-4" />
            </NextLink>

            <NextLink
              href="/"
              className="block text-xs text-slate-500 hover:text-slate-700 py-1"
            >
              Kembali ke Halaman Utama
            </NextLink>
          </div>
        </div>
      </div>
    );
  }

  const rooms = await getRooms();
  const allBookings = await getAllBookingsList();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <AdminClient rooms={rooms} allBookings={allBookings} />
    </div>
  );
}
