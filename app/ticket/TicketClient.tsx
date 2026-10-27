"use client";

import React, { useState } from "react";
import DynamicQRView from "@/components/DynamicQRView";
import { BookingRecord } from "@/lib/data";
import { cancelBookingAction } from "@/actions/booking";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  X,
  Building,
  CalendarX,
  Mail,
  Phone,
  FileText,
  Users,
} from "lucide-react";
import NextLink from "next/link";

interface TicketClientProps {
  booking: BookingRecord | null;
}

export default function TicketClient({ booking }: TicketClientProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!booking) return;
    const confirm = window.confirm(
      "Apakah Anda yakin ingin membatalkan jadwal peminjaman ini? Ruangan akan segera dibuka kembali untuk pemesan lain."
    );
    if (!confirm) return;

    setCancelling(true);
    setCancelError(null);
    try {
      const res = await cancelBookingAction(booking.id);
      if (res.success) {
        router.refresh();
      } else {
        setCancelError(res.error || "Gagal membatalkan peminjaman.");
      }
    } catch (err: any) {
      setCancelError(err.message || "Terjadi kesalahan.");
    } finally {
      setCancelling(false);
    }
  };

  if (!booking) {
    return (
      <div className="max-w-md mx-auto text-center bg-white rounded-2xl border-2 border-stone-300 p-8 shadow-sm space-y-4 my-8">
        <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
          <CalendarX className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Belum Ada E-Tiket Aktif</h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          Anda tidak memiliki jadwal reservasi Focus Room yang sedang aktif saat ini.
        </p>
        <NextLink
          href="/booking"
          className="inline-flex items-center gap-2 px-6 py-3 bg-fisip-800 hover:bg-fisip-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all"
        >
          Isi Formulir Peminjaman Sekarang
        </NextLink>
      </div>
    );
  }

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {cancelError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{cancelError}</span>
        </div>
      )}

      {/* Ticket Boarding Pass Card */}
      <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-xl overflow-hidden">
        {/* Ticket Header FISIP Maroon */}
        <div className="bg-gradient-to-r from-fisip-950 via-fisip-900 to-fisip-800 text-white p-6 border-b-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-black tracking-wider uppercase text-amber-200">
                E-Tiket Presensi Focus Room FISIP
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                booking.status === "ACTIVE"
                  ? "bg-amber-400/20 text-amber-200 border-amber-300/40"
                  : booking.status === "USED"
                  ? "bg-emerald-400/20 text-emerald-200 border-emerald-300/40"
                  : "bg-rose-400/20 text-rose-200 border-rose-300/40"
              }`}
            >
              {booking.status === "USED" ? "TERVERIFIKASI HADIR" : booking.status}
            </span>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-black tracking-tight">{booking.room?.name}</h1>
            <p className="text-xs text-stone-300 mt-0.5">
              Gedung Fakultas Ilmu Sosial dan Ilmu Politik • UIN Syarif Hidayatullah Jakarta
            </p>
          </div>
        </div>

        {/* Dynamic QR Code Section */}
        <div className="p-6 bg-stone-50 border-b-2 border-dashed border-stone-300 flex flex-col items-center">
          <DynamicQRView bookingId={booking.id} initialStatus={booking.status} />
        </div>

        {/* Complete Ticket Details */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-fisip-900 border-b border-stone-200 pb-2">
            Data Rincian Peminjaman Ruang
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-stone-400 font-semibold block uppercase text-[10px]">Penanggung Jawab</span>
              <p className="font-bold text-stone-900 mt-0.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-fisip-700" />
                {booking.responsibleName}
              </p>
            </div>

            <div>
              <span className="text-stone-400 font-semibold block uppercase text-[10px]">NIM / NIP</span>
              <p className="font-mono font-bold text-stone-900 mt-0.5">{booking.identifier}</p>
            </div>

            <div>
              <span className="text-stone-400 font-semibold block uppercase text-[10px]">Email</span>
              <p className="font-medium text-stone-800 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                {booking.email}
              </p>
            </div>

            <div>
              <span className="text-stone-400 font-semibold block uppercase text-[10px]">No. WhatsApp</span>
              <p className="font-mono font-medium text-stone-800 mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                {booking.phone}
              </p>
            </div>

            <div>
              <span className="text-stone-400 font-semibold block uppercase text-[10px]">Program Studi / Bagian</span>
              <p className="font-semibold text-stone-800 mt-0.5">{booking.prodi}</p>
            </div>

            <div>
              <span className="text-stone-400 font-semibold block uppercase text-[10px]">Jumlah Pengguna</span>
              <p className="font-bold text-stone-800 mt-0.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-fisip-700" />
                {booking.userCount} Orang
              </p>
            </div>

            <div>
              <span className="text-stone-400 font-semibold block uppercase text-[10px]">Hari & Tanggal</span>
              <p className="font-semibold text-stone-800 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-fisip-700" />
                {startDate.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div>
              <span className="text-stone-400 font-semibold block uppercase text-[10px]">Jam Sesi Pemakaian</span>
              <p className="font-mono font-bold text-fisip-800 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-fisip-700" />
                {startDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
                {endDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </p>
            </div>
          </div>

          <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-700">
            <span className="font-bold text-stone-900 block mb-0.5">Keperluan Penggunaan:</span>
            {booking.purpose}
          </div>

          {booking.status === "ACTIVE" && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-semibold border border-rose-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4 text-rose-600" />
                {cancelling ? "Membatalkan Jadwal..." : "Batalkan Peminjaman Ini"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
