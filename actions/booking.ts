"use server";

import { getCurrentUser } from "./auth";
import {
  createBooking,
  getBookingById,
  getBookingsForDate,
  getUserActiveBooking,
  updateBookingStatus,
  verifyAndCheckInQR,
  toggleRoomActive,
  getRooms,
} from "@/lib/data";
import { getSlotDates, TIME_SLOTS } from "@/lib/slots";
import { revalidatePath } from "next/cache";

export async function createBookingAction(formData: {
  roomId: string;
  date: string; // YYYY-MM-DD
  slotId: string;
  email: string;
  responsibleName: string;
  identifier: string; // NIM atau NIP
  phone: string;
  prodi: string;
  userType: "MAHASISWA" | "DOSEN_PEGAWAI";
  userCount: number;
  purpose: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Sesi Anda telah berakhir. Silakan isi data penanggung jawab dan masuk kembali." };
  }

  if (user.role === "ADMIN") {
    return { success: false, error: "Akun admin bertugas sebagai verifikator dan pengelola, bukan sebagai pemesan publik." };
  }

  // Validasi kolom-kolom wajib sesuai permintaan
  if (!formData.email?.includes("@")) {
    return { success: false, error: "Format alamat email tidak valid." };
  }
  if (!formData.responsibleName?.trim()) {
    return { success: false, error: "Nama lengkap penanggung jawab wajib diisi." };
  }
  if (!formData.identifier?.trim()) {
    return { success: false, error: "NIM / NIP penanggung jawab wajib diisi." };
  }
  if (!formData.phone?.trim() || formData.phone.length < 8) {
    return { success: false, error: "Nomor WhatsApp / HP tidak valid." };
  }
  if (!formData.prodi?.trim()) {
    return { success: false, error: "Program Studi / Instansi wajib diisi." };
  }
  if (!formData.purpose?.trim()) {
    return { success: false, error: "Keperluan penggunaan ruangan wajib diisi." };
  }
  if (!formData.userCount || formData.userCount < 1) {
    return { success: false, error: "Jumlah pengguna minimal 1 orang." };
  }

  const slotDates = getSlotDates(formData.date, formData.slotId);
  if (!slotDates) {
    return { success: false, error: "Slot waktu tidak valid." };
  }

  // Toleransi 15 menit jika sesi baru saja dimulai dan pengguna memesan untuk langsung digunakan
  const toleranceMs = 15 * 60 * 1000;
  if (slotDates.endTime.getTime() + toleranceMs < Date.now()) {
    return {
      success: false,
      error: "Sesi waktu yang dipilih sudah berakhir untuk hari ini. Silakan pilih sesi berikutnya atau tentukan tanggal hari berikutnya.",
    };
  }

  const res = await createBooking({
    userId: user.id,
    roomId: formData.roomId,
    email: formData.email.trim(),
    responsibleName: formData.responsibleName.trim(),
    identifier: formData.identifier.trim(),
    phone: formData.phone.trim(),
    prodi: formData.prodi.trim(),
    userType: formData.userType,
    userCount: Number(formData.userCount),
    purpose: formData.purpose.trim(),
    startTime: slotDates.startTime,
    endTime: slotDates.endTime,
  });

  if (res.success) {
    revalidatePath("/booking");
    revalidatePath("/ticket");
    revalidatePath("/admin");
    revalidatePath("/");
  }

  return res;
}

export async function cancelBookingAction(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Silakan masuk kembali." };
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return { success: false, error: "Data booking tidak ditemukan." };
  }

  if (booking.userId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Anda tidak berhak membatalkan booking ini." };
  }

  if (booking.status !== "ACTIVE") {
    return { success: false, error: "Hanya booking berstatus aktif yang dapat dibatalkan." };
  }

  await updateBookingStatus(bookingId, "CANCELLED");
  revalidatePath("/booking");
  revalidatePath("/ticket");
  revalidatePath("/admin");
  return { success: true };
}

export async function verifyQRAction(payload: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, message: "Akses ditolak. Hanya petugas verifikator FISIP yang berhak memindai QR." };
  }

  const result = await verifyAndCheckInQR(payload);
  revalidatePath("/admin");
  revalidatePath("/ticket");
  return result;
}

export async function adminManualCheckIn(bookingId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, message: "Akses ditolak." };
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return { success: false, message: "Booking tidak ditemukan." };
  }

  await updateBookingStatus(bookingId, "USED", new Date().toISOString());
  revalidatePath("/admin");
  return { success: true, message: `Check-in manual berhasil untuk ${booking.responsibleName}.` };
}

export async function toggleRoomStatusAction(roomId: string, isActive: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Hanya admin yang dapat mengubah status ketersediaan ruangan." };
  }

  const ok = await toggleRoomActive(roomId, isActive);
  if (ok) {
    revalidatePath("/");
    revalidatePath("/booking");
    revalidatePath("/admin");
    return { success: true };
  }
  return { success: false, error: "Gagal memperbarui status ruangan." };
}
