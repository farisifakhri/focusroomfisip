"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/actions/booking";
import { TIME_SLOTS, TimeSlot } from "@/lib/slots";
import { RoomRecord, BookingRecord, UserRecord } from "@/lib/data";
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  ArrowRight,
  Info,
  CalendarCheck,
  Building,
  Monitor,
  Zap,
  Lock,
  Mail,
  Phone,
  FileText,
} from "lucide-react";

interface BookingClientProps {
  rooms: RoomRecord[];
  initialActiveBooking: BookingRecord | null;
  existingBookings: BookingRecord[];
  initialRoomId?: string;
  currentUser: UserRecord;
}

export default function BookingClient({
  rooms,
  initialActiveBooking,
  existingBookings,
  initialRoomId,
  currentUser,
}: BookingClientProps) {
  const router = useRouter();

  const todayStr = new Date().toISOString().split("T")[0];

  // Cari default ruangan yang sedang aktif (bukan yang terkunci)
  const defaultRoom =
    rooms.find((r) => r.id === initialRoomId && r.isActive) ||
    rooms.find((r) => r.isActive) ||
    rooms[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(defaultRoom?.id || "");

  // Form Fields Penanggung Jawab
  const [email, setEmail] = useState<string>(currentUser.email || "");
  const [responsibleName, setResponsibleName] = useState<string>(currentUser.name || "");
  const [identifier, setIdentifier] = useState<string>(currentUser.nim || "");
  const [phone, setPhone] = useState<string>(currentUser.phone || "");
  const [prodi, setProdi] = useState<string>(currentUser.prodi || "Ilmu Politik");
  const [userType, setUserType] = useState<"MAHASISWA" | "DOSEN_PEGAWAI">(
    currentUser.role === "DOSEN_PEGAWAI" ? "DOSEN_PEGAWAI" : "MAHASISWA"
  );
  const [userCount, setUserCount] = useState<number>(2);
  const [purpose, setPurpose] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  // Cek apakah slot sudah lewat untuk tanggal hari ini
  const isSlotPast = (slotId: string, date: string) => {
    if (date !== todayStr) return false;
    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    if (!slot) return false;
    const [year, month, day] = date.split("-").map(Number);
    const endTime = new Date(year, month - 1, day, slot.endHour, slot.endMinute, 0, 0);
    return endTime.getTime() < Date.now();
  };

  // Cek ketersediaan slot waktu
  const isSlotBooked = (slotId: string, date: string, roomId: string) => {
    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    if (!slot) return false;

    return existingBookings.some((b) => {
      if (b.roomId !== roomId) return false;
      const bDate = b.startTime.split("T")[0];
      if (bDate !== date) return false;

      const bStart = new Date(b.startTime);
      return bStart.getHours() === slot.startHour && bStart.getMinutes() === slot.startMinute;
    });
  };

  // Otomatis tentukan slot default yang tersedia dan belum lewat
  const getFirstAvailableSlot = (date: string, roomId: string) => {
    for (const s of TIME_SLOTS) {
      const booked = isSlotBooked(s.id, date, roomId);
      const past = isSlotPast(s.id, date);
      if (!booked && !past) return s.id;
    }
    return TIME_SLOTS[0].id;
  };

  const [selectedSlotId, setSelectedSlotId] = useState<string>(() =>
    getFirstAvailableSlot(todayStr, defaultRoom?.id || "")
  );

  // Jika tanggal atau ruangan berganti, sesuaikan slot otomatis jika slot saat ini tidak valid
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const currentPast = isSlotPast(selectedSlotId, newDate);
    const currentBooked = isSlotBooked(selectedSlotId, newDate, selectedRoomId);
    if (currentPast || currentBooked) {
      setSelectedSlotId(getFirstAvailableSlot(newDate, selectedRoomId));
    }
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    const currentBooked = isSlotBooked(selectedSlotId, selectedDate, roomId);
    if (currentBooked) {
      setSelectedSlotId(getFirstAvailableSlot(selectedDate, roomId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedRoom?.isActive) {
      setErrorMessage("Ruangan yang dipilih sedang nonaktif atau dikunci khusus Dosen/Fakultas.");
      return;
    }

    if (userCount > (selectedRoom?.capacity || 0)) {
      setErrorMessage(
        `Jumlah pengguna (${userCount} orang) melebihi kapasitas maksimal ${selectedRoom.name} (${selectedRoom.capacity} orang).`
      );
      return;
    }

    if (isSlotBooked(selectedSlotId, selectedDate, selectedRoomId)) {
      setErrorMessage("Sesi waktu yang dipilih sudah dipesan oleh pihak lain. Silakan pilih sesi lainnya.");
      return;
    }

    if (isSlotPast(selectedSlotId, selectedDate)) {
      setErrorMessage("Sesi waktu yang dipilih sudah terlewat untuk hari ini. Silakan pilih sesi berikutnya atau tanggal besok.");
      return;
    }

    setLoading(true);

    try {
      const res = await createBookingAction({
        roomId: selectedRoomId,
        date: selectedDate,
        slotId: selectedSlotId,
        email,
        responsibleName,
        identifier,
        phone,
        prodi,
        userType,
        userCount,
        purpose,
      });

      if (res.success && res.booking) {
        // Navigasi langsung ke e-tiket dengan query parameter ID agar instan dan segar
        window.location.href = `/ticket?id=${res.booking.id}`;
      } else if (res.success) {
        window.location.href = "/ticket";
      } else {
        setErrorMessage(res.error || "Gagal melakukan pemesanan.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses formulir.");
      setLoading(false);
    }
  };

  // Jika user sudah memiliki booking aktif
  if (initialActiveBooking && initialActiveBooking.status === "ACTIVE") {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-stone-300 p-8 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 bg-fisip-100 text-fisip-800 rounded-full flex items-center justify-center mx-auto">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Anda Telah Memiliki Jadwal Peminjaman Aktif</h2>
        <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
          Berdasarkan tata tertib FISIP, setiap penanggung jawab hanya diperkenankan memiliki{" "}
          <strong>1 jadwal reservasi aktif</strong> agar kesempatan pemanfaatan ruangan terbagi merata.
        </p>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between">
            <span className="text-stone-500">Ruangan:</span>
            <span className="font-bold text-stone-800">{initialActiveBooking.room?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Penanggung Jawab:</span>
            <span className="font-bold text-stone-800">
              {initialActiveBooking.responsibleName} ({initialActiveBooking.identifier})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Jam Sesi:</span>
            <span className="font-mono font-bold text-fisip-800">
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
            <span className="text-stone-500">Status Presensi:</span>
            <span className="px-2 py-0.5 rounded-full bg-fisip-100 text-fisip-900 font-bold uppercase text-[10px]">
              {initialActiveBooking.status}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => (window.location.href = `/ticket?id=${initialActiveBooking.id}`)}
            className="px-6 py-3 bg-fisip-800 hover:bg-fisip-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 mx-auto"
          >
            Buka E-Tiket & QR Dinamis Saya
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 text-xs flex items-start gap-2.5 shadow-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-700 mt-0.5" />
          <div>
            <strong className="block font-bold">Pemberitahuan Formulir:</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Bagian 1: Data Identitas Penanggung Jawab */}
      <fieldset className="bg-white p-6 rounded-xl border border-stone-300 shadow-sm space-y-4">
        <legend className="text-xs font-bold text-fisip-900 uppercase tracking-wider flex items-center gap-1.5 px-1">
          <Users className="w-4 h-4 text-fisip-800" />
          1. Data Lengkap Penanggung Jawab Peminjaman
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="responsibleName" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Nama Lengkap <span className="text-red-600">*</span>
            </label>
            <input
              id="responsibleName"
              name="responsibleName"
              type="text"
              required
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              placeholder="Nama lengkap penanggung jawab"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="identifier" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              {userType === "MAHASISWA" ? "NIM Mahasiswa" : "NIP / NIDN Dosen"} <span className="text-red-600">*</span>
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Contoh: 11220910000001"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Alamat Email UIN / Pribadi <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@uinjkt.ac.id"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Nomor WhatsApp / HP Aktif <span className="text-red-600">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prodi" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Program Studi / Unit Kerja FISIP <span className="text-red-600">*</span>
            </label>
            <select
              id="prodi"
              name="prodi"
              value={prodi}
              onChange={(e) => setProdi(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-800 focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none"
            >
              <option value="Ilmu Politik">S1 Ilmu Politik</option>
              <option value="Sosiologi">S1 Sosiologi</option>
              <option value="Hubungan Internasional">S1 Hubungan Internasional</option>
              <option value="Magister Sosiologi">S2 Sosiologi</option>
              <option value="Dosen FISIP">Dosen / Pengajar FISIP</option>
              <option value="Tenaga Kependidikan">Tenaga Kependidikan / Pegawai</option>
            </select>
          </div>

          <div>
            <label htmlFor="userCount" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Jumlah Pengguna / Peserta <span className="text-red-600">*</span>
            </label>
            <input
              id="userCount"
              name="userCount"
              type="number"
              min={1}
              max={selectedRoom?.capacity || 20}
              required
              value={userCount}
              onChange={(e) => setUserCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none"
            />
            <span className="text-[11px] text-stone-500 mt-1 block">
              Maksimal kapasitas {selectedRoom?.name}: <strong>{selectedRoom?.capacity} orang</strong>
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="purpose" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Keperluan Penggunaan Ruangan <span className="text-red-600">*</span>
          </label>
          <input
            id="purpose"
            name="purpose"
            type="text"
            required
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Contoh: Bimbingan Skripsi Bab 4, Diskusi Analisis Kebijakan, atau Rapat Riset Dosen"
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-fisip-700 focus:bg-white focus:outline-none"
          />
        </div>
      </fieldset>

      {/* Bagian 2: Pemilihan Ruangan */}
      <fieldset className="bg-white p-6 rounded-xl border border-stone-300 shadow-sm space-y-4">
        <legend className="text-xs font-bold text-fisip-900 uppercase tracking-wider flex items-center gap-1.5 px-1">
          <Building className="w-4 h-4 text-fisip-800" />
          2. Pemilihan Ruang Focus Room FISIP
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const isLocked = !room.isActive;
            const isRoom1 = room.id === "room-1";

            return (
              <button
                type="button"
                key={room.id}
                onClick={() => {
                  if (!isLocked) handleRoomSelect(room.id);
                }}
                disabled={isLocked}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${
                  isLocked
                    ? "bg-stone-100 border-stone-300 opacity-75 cursor-not-allowed"
                    : isSelected
                    ? "border-fisip-800 bg-fisip-50/60 shadow-sm ring-2 ring-fisip-800/20"
                    : "border-stone-200 hover:border-stone-400 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-stone-900">{room.name}</h4>
                  {isLocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      <Lock className="w-3 h-3 text-amber-800" />
                      Terkunci Dosen
                    </span>
                  ) : (
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-fisip-800 bg-fisip-800" : "border-stone-300"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{room.description}</p>

                <div className="mt-3 pt-2 border-t border-stone-200/80 flex flex-wrap gap-2 text-[11px]">
                  <span className="font-bold text-fisip-900">
                    Kapasitas: {isRoom1 ? "> 15 Orang (Hingga 20)" : `Maksimal ${room.capacity} Orang`}
                  </span>
                  {isRoom1 && (
                    <span className="bg-fisip-100 text-fisip-900 px-2 py-0.5 rounded font-bold">
                      2 PC Komputer
                    </span>
                  )}
                  <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                    Port Charger Meja
                  </span>
                </div>

                {isLocked && (
                  <p className="text-[10px] text-amber-800 mt-2 font-medium">
                    *Hanya dapat diaktifkan melalui izin/akses Panel Admin FISIP.
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Bagian 3: Tanggal & Jam Pemakaian (Slot Sesi) */}
      <fieldset className="bg-white p-6 rounded-xl border border-stone-300 shadow-sm space-y-4">
        <legend className="text-xs font-bold text-fisip-900 uppercase tracking-wider flex items-center gap-1.5 px-1">
          <Clock className="w-4 h-4 text-fisip-800" />
          3. Tanggal & Jam Pemakaian ({selectedRoom?.name || "Ruangan Terpilih"})
        </legend>

        <div>
          <label htmlFor="bookingDate" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Pilih Tanggal Peminjaman
          </label>
          <input
            id="bookingDate"
            name="bookingDate"
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            required
            className="px-4 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-fisip-700 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
            Pilih Slot Sesi Waktu:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TIME_SLOTS.map((slot) => {
              const booked = isSlotBooked(slot.id, selectedDate, selectedRoomId);
              const past = isSlotPast(slot.id, selectedDate);
              const disabled = booked || past;
              const isSelected = selectedSlotId === slot.id;

              return (
                <button
                  type="button"
                  key={slot.id}
                  disabled={disabled}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                    disabled
                      ? "border-stone-200 bg-stone-100 opacity-60 cursor-not-allowed"
                      : isSelected
                      ? "border-fisip-800 bg-fisip-50 shadow-sm ring-2 ring-fisip-800/20"
                      : "border-stone-200 hover:border-stone-400 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-stone-900">{slot.name}</span>
                    {past ? (
                      <span className="text-[10px] font-bold text-stone-600 bg-stone-200 px-2 py-0.5 rounded border border-stone-300">
                        SUDAH BERAKHIR
                      </span>
                    ) : booked ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        SUDAH TERISI
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        TERSEDIA
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-base font-black text-stone-900">
                    {slot.label} WIB
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">{slot.durationLabel}</div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-stone-100 rounded-lg text-[11px] text-stone-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-stone-500 shrink-0" />
            <span>Terdapat jeda 30 menit antar sesi untuk pembersihan dan persiapan ruangan oleh petugas.</span>
          </div>
        </div>
      </fieldset>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-fisip-800 hover:bg-fisip-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Menyimpan Data Peminjaman..." : "Konfirmasi Peminjaman & Terbitkan QR Dinamis"}
          <ArrowRight className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </form>
  );
}
