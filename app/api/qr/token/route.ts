import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/auth";
import { getBookingById } from "@/lib/data";
import { createDynamicQRPayload, QR_WINDOW_SECONDS } from "@/lib/qr";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");

  if (!bookingId) {
    return NextResponse.json({ error: "Booking ID diperlukan." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  }

  if (booking.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const now = Date.now();
  const payload = createDynamicQRPayload(booking.id, now);
  const currentWindowElapsedSec = Math.floor((now % (QR_WINDOW_SECONDS * 1000)) / 1000);
  const remainingSeconds = QR_WINDOW_SECONDS - currentWindowElapsedSec;

  return NextResponse.json({
    payload,
    remainingSeconds,
    status: booking.status,
    checkedInAt: booking.checkedInAt,
  });
}
