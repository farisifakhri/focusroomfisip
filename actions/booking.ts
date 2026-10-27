"use server";

import { getCurrentUser } from "./auth";
import {
  createBooking,
  getBookingById,
  getBookingsForDate,
  getUserActiveBooking,
  updateBookingStatus,
  verifyAndCheckInQR,
} from "@/lib/data";
import { getSlotDates, TIME_SLOTS } from "@/lib/slots";
import { revalidatePath } from "next/cache";

export async function createBookingAction(formData: {
  roomId: string;
  date: string; // YYYY-MM-DD
  slotId: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Sesi login telah berakhir. Silakan login kembali." };
  }

  if (user.role === "ADMIN") {
    return { success: false, error: "Akun admin bertugas sebagai verifikator, bukan pemesan." };
  }

  const slotDates = getSlotDates(formData.date, formData.slotId);
  if (!slotDates) {
    return { success: false, error: "Slot waktu tidak valid." };
  }

  // Cek agar tidak booking waktu lampau
  if (slotDates.endTime.getTime() < Date.now()) {
    return { success: false, error: "Tidak dapat memesan slot waktu yang sudah terlewat." };
  }

  const res = await createBooking({
    userId: user.id,
    roomId: formData.roomId,
    startTime: slotDates.startTime,
    endTime: slotDates.endTime,
    notes: formData.notes,
  });

  if (res.success) {
    revalidatePath("/booking");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
  }

  return res;
}

export async function cancelBookingAction(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Silakan login kembali." };
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return { success: false, error: "Booking tidak ditemukan." };
  }

  if (booking.userId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Anda tidak berhak membatalkan booking ini." };
  }

  if (booking.status !== "ACTIVE") {
    return { success: false, error: "Hanya booking aktif yang dapat dibatalkan." };
  }

  await updateBookingStatus(bookingId, "CANCELLED");
  revalidatePath("/booking");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

export async function verifyQRAction(payload: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, message: "Akses ditolak. Hanya petugas/admin yang dapat memverifikasi QR." };
  }

  const result = await verifyAndCheckInQR(payload);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return result;
}

export async function getRoomSlotAvailability(dateStr: string) {
  const bookings = await getBookingsForDate(dateStr);
  return bookings;
}
