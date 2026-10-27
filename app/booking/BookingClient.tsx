"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/actions/booking";
import { TIME_SLOTS } from "@/lib/slots";
import { RoomRecord, BookingRecord } from "@/lib/data";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Info,
  CalendarCheck,
} from "lucide-react";

interface BookingClientProps {
  rooms: RoomRecord[];
  initialActiveBooking: BookingRecord | null;
  existingBookings: BookingRecord[];
  initialRoomId?: string;
}

export default function BookingClient({
  rooms,
  initialActiveBooking,
  existingBookings,
  initialRoomId,
}: BookingClientProps) {
  const router = useRouter();

  // Hari ini dalam format YYYY-MM-DD lokal
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    initialRoomId || rooms[0]?.id || ""
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string>(TIME_SLOTS[0].id);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  // Cek ketersediaan tiap slot pada hari dan ruangan terpilih
  const isSlotBooked = (slotId: string) => {
    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    if (!slot) return false;

    return existingBookings.some((b) => {
      if (b.roomId !== selectedRoomId) return false;
      const bDate = b.startTime.split("T")[0];
      if (bDate !== selectedDate) return false;

      const bStart = new Date(b.startTime);
      return bStart.getHours() === slot.startHour && bStart.getMinutes() === slot.startMinute;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await createBookingAction({
        roomId: selectedRoomId,
        date: selectedDate,
        slotId: selectedSlotId,
        notes,
      });

      if (res.success) {
        router.push("/ticket");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal melakukan pemesanan.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  // Jika user sudah memiliki booking aktif
  if (initialActiveBooking) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-emerald-200 p-8 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Anda Memiliki Booking Aktif</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Sesuai aturan kebijakan FISIP, setiap mahasiswa hanya dapat memiliki{" "}
          <strong>1 booking aktif</strong> dalam satu waktu agar seluruh mahasiswa mendapatkan kesempatan yang sama.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between">
            <span className="text-slate-500">Ruangan:</span>
            <span className="font-bold text-slate-800">{initialActiveBooking.room?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Waktu Sesi:</span>
            <span className="font-bold text-emerald-700 font-mono">
              {new Date(initialActiveBooking.startTime).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(initialActiveBooking.endTime).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              WIB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
              {initialActiveBooking.status}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => router.push("/ticket")}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 mx-auto"
          >
            Buka Tiket & QR Code Saya
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Pilih Tanggal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-600" />
          1. Pilih Tanggal Pemakaian
        </label>
        <input
          type="date"
          value={selectedDate}
          min={todayStr}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        <p className="text-[11px] text-slate-400">
          *Pemesanan dapat dilakukan untuk hari ini dan hari mendatang.
        </p>
      </div>

      {/* Step 2: Pilih Ruangan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-600" />
          2. Pilih Salah Satu dari 4 Focus Room FISIP
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{room.name}</h4>
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-emerald-600 bg-emerald-600" : "border-slate-300"
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{room.description}</p>
                <div className="mt-2 text-[11px] font-semibold text-emerald-800">
                  Kapasitas {room.capacity} orang
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3: Pilih Slot Waktu */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-600" />
          3. Pilih Slot Waktu Sesi ({selectedRoom?.name || "Ruangan"})
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIME_SLOTS.map((slot) => {
            const booked = isSlotBooked(slot.id);
            const isSelected = selectedSlotId === slot.id;

            return (
              <button
                type="button"
                key={slot.id}
                disabled={booked}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                  booked
                    ? "border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed"
                    : isSelected
                    ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">{slot.name}</span>
                  {booked ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      TERISI
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      TERSEDIA
                    </span>
                  )}
                </div>

                <div className="font-mono text-base font-extrabold text-slate-800">
                  {slot.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{slot.durationLabel}</div>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Antar sesi terdapat jeda 30 menit untuk persiapan dan pembersihan ruangan oleh petugas.</span>
        </div>
      </div>

      {/* Step 4: Catatan / Keperluan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          4. Keperluan Pemakaian (Opsional)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Contoh: Diskusi Skripsi Bab 4, Rapat Kelompok KKN, atau Riset Jurnal"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || isSlotBooked(selectedSlotId)}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Memproses Pemesanan..." : "Konfirmasi & Dapatkan Tiket QR Dinamis"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
