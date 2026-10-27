import { prisma } from "./prisma";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { verifyDynamicQRPayload } from "./qr";

export type Role = "MAHASISWA" | "ADMIN";
export type BookingStatus = "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED";

export interface UserRecord {
  id: string;
  nim: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface RoomRecord {
  id: string;
  name: string;
  capacity: number;
  description: string;
  isActive: boolean;
}

export interface BookingRecord {
  id: string;
  userId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  qrCode: string;
  status: BookingStatus;
  notes?: string;
  checkedInAt?: string | null;
  createdAt: string;
  user?: UserRecord;
  room?: RoomRecord;
}

// 4 Focus Rooms FISIP UIN Jakarta sesuai PRD
export const INITIAL_ROOMS: RoomRecord[] = [
  {
    id: "room-1",
    name: "Focus Room 1 (Lt. 2)",
    capacity: 6,
    description: "Kapasitas 6 orang, Smart TV 55\", Whiteboard, Full AC, High-speed Wi-Fi, Multi Power Plug.",
    isActive: true,
  },
  {
    id: "room-2",
    name: "Focus Room 2 (Lt. 2)",
    capacity: 6,
    description: "Kapasitas 6 orang, Smart TV 55\", Whiteboard, Full AC, High-speed Wi-Fi, Multi Power Plug.",
    isActive: true,
  },
  {
    id: "room-3",
    name: "Focus Room 3 (Lt. 3)",
    capacity: 4,
    description: "Kapasitas 4 orang, Whiteboard Kaca, Full AC, Port Charger Meja, Cocok untuk bimbingan/diskusi intensif.",
    isActive: true,
  },
  {
    id: "room-4",
    name: "Focus Room 4 (Lt. 3)",
    capacity: 4,
    description: "Kapasitas 4 orang, Whiteboard Kaca, Full AC, Port Charger Meja, Cocok untuk riset & persiapan sidang.",
    isActive: true,
  },
];

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "local-db.json");

interface LocalDB {
  users: UserRecord[];
  rooms: RoomRecord[];
  bookings: BookingRecord[];
}

function readLocalDB(): LocalDB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: LocalDB = {
        users: [
          {
            id: "admin-1",
            nim: "ADMIN_FISIP",
            name: "Petugas Verifikator FISIP",
            role: "ADMIN",
            createdAt: new Date().toISOString(),
          },
          {
            id: "mhs-1",
            nim: "11220910000001",
            name: "Ahmad Fauzi",
            role: "MAHASISWA",
            createdAt: new Date().toISOString(),
          },
        ],
        rooms: INITIAL_ROOMS,
        bookings: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading local db file:", err);
    return { users: [], rooms: INITIAL_ROOMS, bookings: [] };
  }
}

function writeLocalDB(data: LocalDB) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing local db file:", err);
  }
}

// Helper untuk mengecek apakah Prisma dapat terhubung
let isPrismaAvailable: boolean | null = null;
async function checkPrisma(): Promise<boolean> {
  if (isPrismaAvailable !== null) return isPrismaAvailable;
  try {
    // Timeout cepat 1 detik
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000)),
    ]);
    isPrismaAvailable = true;
    return true;
  } catch {
    isPrismaAvailable = false;
    return false;
  }
}

// User methods
export async function getOrCreateUser(nim: string, name: string): Promise<UserRecord> {
  const usePrisma = await checkPrisma();
  const trimmedNim = nim.trim();
  const trimmedName = name.trim() || `Mahasiswa ${trimmedNim}`;
  const isAdmin = trimmedNim.toUpperCase().startsWith("ADMIN");

  if (usePrisma) {
    try {
      const existing = await prisma.user.findUnique({ where: { nim: trimmedNim } });
      if (existing) {
        return {
          id: existing.id,
          nim: existing.nim,
          name: existing.name,
          role: existing.role as Role,
          createdAt: existing.createdAt.toISOString(),
        };
      }
      const created = await prisma.user.create({
        data: {
          nim: trimmedNim,
          name: trimmedName,
          role: isAdmin ? "ADMIN" : "MAHASISWA",
        },
      });
      return {
        id: created.id,
        nim: created.nim,
        name: created.name,
        role: created.role as Role,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (e) {
      console.warn("Prisma error in getOrCreateUser, fallback to local:", e);
    }
  }

  // Local fallback
  const db = readLocalDB();
  let user = db.users.find((u) => u.nim.toLowerCase() === trimmedNim.toLowerCase());
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      nim: trimmedNim,
      name: trimmedName,
      role: isAdmin ? "ADMIN" : "MAHASISWA",
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeLocalDB(db);
  }
  return user;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      const u = await prisma.user.findUnique({ where: { id } });
      if (u) {
        return {
          id: u.id,
          nim: u.nim,
          name: u.name,
          role: u.role as Role,
          createdAt: u.createdAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("Prisma error in getUserById:", e);
    }
  }
  const db = readLocalDB();
  return db.users.find((u) => u.id === id) || null;
}

// Room methods
export async function getRooms(): Promise<RoomRecord[]> {
  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      const rooms = await prisma.room.findMany({ where: { isActive: true } });
      if (rooms.length > 0) {
        return rooms.map((r) => ({
          id: r.id,
          name: r.name,
          capacity: r.capacity,
          description: r.description || "",
          isActive: r.isActive,
        }));
      }
    } catch (e) {
      console.warn("Prisma error in getRooms:", e);
    }
  }
  const db = readLocalDB();
  return db.rooms.filter((r) => r.isActive);
}

// Booking methods
export async function getUserActiveBooking(userId: string): Promise<BookingRecord | null> {
  const now = new Date();
  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      const active = await prisma.booking.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          endTime: { gt: now },
        },
        include: { room: true, user: true },
        orderBy: { startTime: "asc" },
      });
      if (active) {
        return {
          id: active.id,
          userId: active.userId,
          roomId: active.roomId,
          startTime: active.startTime.toISOString(),
          endTime: active.endTime.toISOString(),
          qrCode: active.qrCode,
          status: active.status as BookingStatus,
          notes: active.notes || undefined,
          checkedInAt: active.checkedInAt?.toISOString() || null,
          createdAt: active.createdAt.toISOString(),
          room: {
            id: active.room.id,
            name: active.room.name,
            capacity: active.room.capacity,
            description: active.room.description || "",
            isActive: active.room.isActive,
          },
          user: {
            id: active.user.id,
            nim: active.user.nim,
            name: active.user.name,
            role: active.user.role as Role,
            createdAt: active.user.createdAt.toISOString(),
          },
        };
      }
    } catch (e) {
      console.warn("Prisma error in getUserActiveBooking:", e);
    }
  }

  // Local fallback
  const db = readLocalDB();
  const booking = db.bookings.find(
    (b) => b.userId === userId && b.status === "ACTIVE" && new Date(b.endTime) > now
  );
  if (!booking) return null;

  return {
    ...booking,
    room: db.rooms.find((r) => r.id === booking.roomId),
    user: db.users.find((u) => u.id === booking.userId),
  };
}

export async function getBookingsForDate(dateStr: string): Promise<BookingRecord[]> {
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      const list = await prisma.booking.findMany({
        where: {
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ["ACTIVE", "USED"] },
        },
        include: { room: true, user: true },
      });
      return list.map((b) => ({
        id: b.id,
        userId: b.userId,
        roomId: b.roomId,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        qrCode: b.qrCode,
        status: b.status as BookingStatus,
        notes: b.notes || undefined,
        checkedInAt: b.checkedInAt?.toISOString() || null,
        createdAt: b.createdAt.toISOString(),
        room: {
          id: b.room.id,
          name: b.room.name,
          capacity: b.room.capacity,
          description: b.room.description || "",
          isActive: b.room.isActive,
        },
        user: {
          id: b.user.id,
          nim: b.user.nim,
          name: b.user.name,
          role: b.user.role as Role,
          createdAt: b.user.createdAt.toISOString(),
        },
      }));
    } catch (e) {
      console.warn("Prisma error in getBookingsForDate:", e);
    }
  }

  // Local fallback
  const db = readLocalDB();
  return db.bookings
    .filter((b) => {
      const bDate = new Date(b.startTime);
      return (
        bDate >= startOfDay &&
        bDate <= endOfDay &&
        (b.status === "ACTIVE" || b.status === "USED")
      );
    })
    .map((b) => ({
      ...b,
      room: db.rooms.find((r) => r.id === b.roomId),
      user: db.users.find((u) => u.id === b.userId),
    }));
}

export async function createBooking(data: {
  userId: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}): Promise<{ success: boolean; booking?: BookingRecord; error?: string }> {
  // 1. Validasi: Satu user hanya boleh memiliki 1 booking aktif pada rentang waktu yang sama
  const existingActive = await getUserActiveBooking(data.userId);
  if (existingActive) {
    return {
      success: false,
      error: "Anda masih memiliki jadwal booking aktif yang belum selesai. Maksimal 1 booking aktif per mahasiswa.",
    };
  }

  // 2. Validasi: Cek apakah ruangan sudah dibooking orang lain di slot tersebut
  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      const conflict = await prisma.booking.findFirst({
        where: {
          roomId: data.roomId,
          status: { in: ["ACTIVE", "USED"] },
          OR: [
            {
              startTime: { lte: data.startTime },
              endTime: { gt: data.startTime },
            },
            {
              startTime: { lt: data.endTime },
              endTime: { gte: data.endTime },
            },
          ],
        },
      });

      if (conflict) {
        return {
          success: false,
          error: "Ruangan ini sudah dipesan oleh mahasiswa lain pada slot waktu tersebut. Silakan pilih ruangan atau slot lain.",
        };
      }

      const qrCodeSecret = crypto.randomUUID();
      const created = await prisma.booking.create({
        data: {
          userId: data.userId,
          roomId: data.roomId,
          startTime: data.startTime,
          endTime: data.endTime,
          qrCode: qrCodeSecret,
          notes: data.notes || "Belajar kelompok / Diskusi",
          status: "ACTIVE",
        },
        include: { room: true, user: true },
      });

      return {
        success: true,
        booking: {
          id: created.id,
          userId: created.userId,
          roomId: created.roomId,
          startTime: created.startTime.toISOString(),
          endTime: created.endTime.toISOString(),
          qrCode: created.qrCode,
          status: created.status as BookingStatus,
          notes: created.notes || undefined,
          checkedInAt: created.checkedInAt?.toISOString() || null,
          createdAt: created.createdAt.toISOString(),
          room: {
            id: created.room.id,
            name: created.room.name,
            capacity: created.room.capacity,
            description: created.room.description || "",
            isActive: created.room.isActive,
          },
          user: {
            id: created.user.id,
            nim: created.user.nim,
            name: created.user.name,
            role: created.user.role as Role,
            createdAt: created.user.createdAt.toISOString(),
          },
        },
      };
    } catch (e) {
      console.warn("Prisma error in createBooking:", e);
    }
  }

  // Local fallback
  const db = readLocalDB();
  const conflict = db.bookings.find(
    (b) =>
      b.roomId === data.roomId &&
      (b.status === "ACTIVE" || b.status === "USED") &&
      new Date(b.startTime) < data.endTime &&
      new Date(b.endTime) > data.startTime
  );

  if (conflict) {
    return {
      success: false,
      error: "Ruangan ini sudah dipesan oleh mahasiswa lain pada slot waktu tersebut. Silakan pilih ruangan atau slot lain.",
    };
  }

  const newBooking: BookingRecord = {
    id: crypto.randomUUID(),
    userId: data.userId,
    roomId: data.roomId,
    startTime: data.startTime.toISOString(),
    endTime: data.endTime.toISOString(),
    qrCode: crypto.randomUUID(),
    status: "ACTIVE",
    notes: data.notes || "Belajar kelompok / Diskusi",
    checkedInAt: null,
    createdAt: new Date().toISOString(),
  };

  db.bookings.push(newBooking);
  writeLocalDB(db);

  return {
    success: true,
    booking: {
      ...newBooking,
      room: db.rooms.find((r) => r.id === newBooking.roomId),
      user: db.users.find((u) => u.id === newBooking.userId),
    },
  };
}

export async function getBookingById(id: string): Promise<BookingRecord | null> {
  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      const b = await prisma.booking.findUnique({
        where: { id },
        include: { room: true, user: true },
      });
      if (b) {
        return {
          id: b.id,
          userId: b.userId,
          roomId: b.roomId,
          startTime: b.startTime.toISOString(),
          endTime: b.endTime.toISOString(),
          qrCode: b.qrCode,
          status: b.status as BookingStatus,
          notes: b.notes || undefined,
          checkedInAt: b.checkedInAt?.toISOString() || null,
          createdAt: b.createdAt.toISOString(),
          room: {
            id: b.room.id,
            name: b.room.name,
            capacity: b.room.capacity,
            description: b.room.description || "",
            isActive: b.room.isActive,
          },
          user: {
            id: b.user.id,
            nim: b.user.nim,
            name: b.user.name,
            role: b.user.role as Role,
            createdAt: b.user.createdAt.toISOString(),
          },
        };
      }
    } catch (e) {
      console.warn("Prisma error in getBookingById:", e);
    }
  }

  const db = readLocalDB();
  const b = db.bookings.find((item) => item.id === id);
  if (!b) return null;
  return {
    ...b,
    room: db.rooms.find((r) => r.id === b.roomId),
    user: db.users.find((u) => u.id === b.userId),
  };
}

export async function verifyAndCheckInQR(rawPayload: string): Promise<{
  success: boolean;
  message: string;
  booking?: BookingRecord;
}> {
  // 1. Verifikasi payload dinamis dan signature
  const verification = verifyDynamicQRPayload(rawPayload);
  if (!verification.valid) {
    if (verification.error === "EXPIRED_QR_SCREENSHOT") {
      return {
        success: false,
        message: "❌ KODE QR SUDAH KADALUWARSA! Terdeteksi foto/screenshot lama yang dioper. Harap minta mahasiswa menunjukkan kode QR langsung dari aplikasi secara real-time.",
      };
    }
    return {
      success: false,
      message: "❌ FORMAT QR TIDAK VALID! Kode QR ini bukan kode tiket Focus Room FISIP UIN Jakarta yang sah.",
    };
  }

  const bookingId = verification.bookingId!;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return {
      success: false,
      message: "❌ DATA BOOKING TIDAK DITEMUKAN dalam sistem.",
    };
  }

  if (booking.status === "USED") {
    return {
      success: false,
      message: `⚠️ TIKET SUDAH PERNAH DIGUNAKAN pada ${booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleTimeString("id-ID") : "sebelumnya"}.`,
      booking,
    };
  }

  if (booking.status === "CANCELLED") {
    return {
      success: false,
      message: "❌ TIKET TELAH DIBATALKAN oleh pemesan.",
      booking,
    };
  }

  const now = new Date();
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);

  // Toleransi: Check-in dibuka 15 menit sebelum sesi mulai hingga sesi berakhir
  const earlyCheckInTolerance = 15 * 60 * 1000; // 15 menit
  if (now.getTime() < startTime.getTime() - earlyCheckInTolerance) {
    return {
      success: false,
      message: `⏳ TERLALU CEPAT. Sesi baru dimulai pada pukul ${startTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}. Check-in dibuka 15 menit sebelumnya.`,
      booking,
    };
  }

  if (now > endTime) {
    // Otomatis expired jika lewat
    await updateBookingStatus(booking.id, "EXPIRED");
    return {
      success: false,
      message: "❌ WAKTU SESI TELAH BERAKHIR. Tiket dinyatakan EXPIRED.",
      booking,
    };
  }

  // Berhasil! Check in dan ubah status jadi USED
  const checkInTime = new Date().toISOString();
  await updateBookingStatus(booking.id, "USED", checkInTime);

  const updatedBooking = await getBookingById(booking.id);
  return {
    success: true,
    message: `✅ CHECK-IN BERHASIL! Selamat datang di ${booking.room?.name}. Mahasiswa: ${booking.user?.name} (${booking.user?.nim}).`,
    booking: updatedBooking || booking,
  };
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  checkedInAt?: string
) {
  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      await prisma.booking.update({
        where: { id },
        data: {
          status,
          ...(checkedInAt ? { checkedInAt: new Date(checkedInAt) } : {}),
        },
      });
      return;
    } catch (e) {
      console.warn("Prisma error in updateBookingStatus:", e);
    }
  }

  const db = readLocalDB();
  const b = db.bookings.find((item) => item.id === id);
  if (b) {
    b.status = status;
    if (checkedInAt) b.checkedInAt = checkedInAt;
    writeLocalDB(db);
  }
}

export async function getAllBookingsList(): Promise<BookingRecord[]> {
  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      const list = await prisma.booking.findMany({
        include: { room: true, user: true },
        orderBy: { startTime: "desc" },
        take: 100,
      });
      return list.map((b) => ({
        id: b.id,
        userId: b.userId,
        roomId: b.roomId,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        qrCode: b.qrCode,
        status: b.status as BookingStatus,
        notes: b.notes || undefined,
        checkedInAt: b.checkedInAt?.toISOString() || null,
        createdAt: b.createdAt.toISOString(),
        room: {
          id: b.room.id,
          name: b.room.name,
          capacity: b.room.capacity,
          description: b.room.description || "",
          isActive: b.room.isActive,
        },
        user: {
          id: b.user.id,
          nim: b.user.nim,
          name: b.user.name,
          role: b.user.role as Role,
          createdAt: b.user.createdAt.toISOString(),
        },
      }));
    } catch (e) {
      console.warn("Prisma error in getAllBookingsList:", e);
    }
  }

  const db = readLocalDB();
  return db.bookings
    .map((b) => ({
      ...b,
      room: db.rooms.find((r) => r.id === b.roomId),
      user: db.users.find((u) => u.id === b.userId),
    }))
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}
