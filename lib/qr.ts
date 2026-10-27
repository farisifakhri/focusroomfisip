import crypto from "crypto";

const SECRET = process.env.QR_SECRET_KEY || "focus-room-uin-fisip-secure-secret-key-2026";
// Jendela waktu (time window) dalam detik untuk pembaruan QR Code dinamis (misal 30 detik)
export const QR_WINDOW_SECONDS = 30;

export interface DynamicQRPayload {
  b: string; // bookingId
  t: number; // time window counter (epoch / 30s)
  s: string; // signature
}

/**
 * Generate signature untuk time window tertentu
 */
export function generateQRSignature(bookingId: string, timeWindow: number): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(`${bookingId}:${timeWindow}`)
    .digest("hex")
    .substring(0, 16); // 16 karakter cukup dan ringkas untuk QR code
}

/**
 * Buat string payload QR dinamis saat ini
 */
export function createDynamicQRPayload(bookingId: string, timestamp: number = Date.now()): string {
  const timeWindow = Math.floor(timestamp / (QR_WINDOW_SECONDS * 1000));
  const signature = generateQRSignature(bookingId, timeWindow);
  
  // Format ringkas agar QR Code mudah dibaca oleh kamera HP
  return `FR-UIN:${bookingId}:${timeWindow}:${signature}`;
}

/**
 * Verifikasi payload QR dinamis dari hasil scan scanner
 * Memeriksa validitas tanda tangan dan toleransi waktu (maksimal toleransi +- 1 interval = 60 detik)
 */
export function verifyDynamicQRPayload(rawPayload: string): {
  valid: boolean;
  bookingId?: string;
  error?: "INVALID_FORMAT" | "EXPIRED_QR_SCREENSHOT" | "INVALID_SIGNATURE";
} {
  if (!rawPayload.startsWith("FR-UIN:")) {
    return { valid: false, error: "INVALID_FORMAT" };
  }

  const parts = rawPayload.split(":");
  if (parts.length !== 4) {
    return { valid: false, error: "INVALID_FORMAT" };
  }

  const [, bookingId, timeWindowStr, signature] = parts;
  const timeWindow = parseInt(timeWindowStr, 10);
  if (isNaN(timeWindow)) {
    return { valid: false, error: "INVALID_FORMAT" };
  }

  const currentWindow = Math.floor(Date.now() / (QR_WINDOW_SECONDS * 1000));
  
  // Cek apakah time window sudah terlalu lampau (lebih dari 2 interval / 60 detik)
  // Menandakan QR didapat dari foto / screenshot lama
  if (Math.abs(currentWindow - timeWindow) > 2) {
    return { valid: false, error: "EXPIRED_QR_SCREENSHOT", bookingId };
  }

  // Verifikasi signature
  const expectedSig = generateQRSignature(bookingId, timeWindow);
  if (signature !== expectedSig) {
    return { valid: false, error: "INVALID_SIGNATURE" };
  }

  return { valid: true, bookingId };
}

