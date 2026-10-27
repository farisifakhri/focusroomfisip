"use client";

import React, { useState } from "react";
import DynamicQRView from "@/components/DynamicQRView";
import { BookingRecord } from "@/lib/data";
import { formatDateTimeIndo } from "@/lib/slots";
import { cancelBookingAction } from "@/actions/booking";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  AlertTriangle,
  X,
  Building2,
  CalendarX,
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
      "Apakah Anda yakin ingin membatalkan pemesanan ini? Slot ruangan akan dibuka kembali untuk mahasiswa lain."
    );
    if (!confirm) return;

    setCancelling(true);
    setCancelError(null);
    try {
      const res = await cancelBookingAction(booking.id);
      if (res.success) {
        router.refresh();
      } else {
        setCancelError(res.error || "Gagal membatalkan booking.");
      }
    } catch (err: any) {
      setCancelError(err.message || "Terjadi kesalahan.");
    } finally {
      setCancelling(false);
    }
  };

  if (!booking) {
    return (
      <div className="max-w-md mx-auto text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4 my-8">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <CalendarX className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Tidak Ada Tiket Aktif</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Anda belum memiliki reservasi Focus Room yang aktif saat ini. Silakan lakukan pemesanan terlebih dahulu.
        </p>
        <NextLink
          href="/booking"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
        >
          Pesan Focus Room Sekarang
        </NextLink>
      </div>
    );
  }

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      {cancelError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{cancelError}</span>
        </div>
      )}

      {/* Ticket Boarding Pass Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-300">
                E-Tiket Presensi Focus Room
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                booking.status === "ACTIVE"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                  : booking.status === "USED"
                  ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
                  : "bg-red-500/20 text-red-300 border-red-400/40"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-black tracking-tight">{booking.room?.name}</h1>
            <p className="text-xs text-emerald-200/80 mt-0.5">Gedung FISIP UIN Syarif Hidayatullah Jakarta</p>
          </div>
        </div>

        {/* Dynamic QR Code Section */}
        <div className="p-6 bg-slate-50 border-b border-dashed border-slate-300 flex flex-col items-center">
          <DynamicQRView bookingId={booking.id} initialStatus={booking.status} />
        </div>

        {/* Ticket Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Nama Pemesan</span>
              <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                {booking.user?.name}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">NIM UIN</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{booking.user?.nim}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Hari & Tanggal</span>
              <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {startDate.toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Jam Sesi</span>
              <p className="font-mono font-bold text-emerald-800 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {startDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
                {endDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </p>
            </div>
          </div>

          {booking.notes && (
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Keperluan:</span> {booking.notes}
            </div>
          )}

          {booking.status === "ACTIVE" && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                {cancelling ? "Membatalkan..." : "Batalkan Pemesanan Ini"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
