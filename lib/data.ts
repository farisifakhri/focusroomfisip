import { prisma } from "./prisma";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { verifyDynamicQRPayload } from "./qr";

export type Role = "MAHASISWA" | "DOSEN_PEGAWAI" | "ADMIN";
export type BookingStatus = "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED";

export interface UserRecord {
  id: string;
  nim: string;
  name: string;
  email?: string;
  phone?: string;
  prodi?: string;
  role: Role;
  createdAt: string;
}

export interface RoomRecord {
  id: string;
  name: string;
  capacity: number;
  description: string;
  facilities: string;
  isActive: boolean;
}

export interface BookingRecord {
  id: string;
  userId: string;
  roomId: string;
  email: string;
  responsibleName: string;
  identifier: string; // NIM atau NIP
  phone: string;
  prodi: string;
  userType: "MAHASISWA" | "DOSEN_PEGAWAI";
  userCount: number;
  purpose: string;
  startTime: string;
  endTime: string;
  qrCode: string;
  status: BookingStatus;
  checkedInAt?: string | null;
  createdAt: string;
  user?: UserRecord;
  room?: RoomRecord;
}

// 4 Focus Rooms FISIP UIN Jakarta
export const INITIAL_ROOMS: RoomRecord[] = [
  {
    id: "room-1",
    name: "Focus Room 1 (Khusus Dosen / Rapat Besar)",
    capacity: 20, // Lebih dari 15 orang
    description: "Ruang rapat dan pertemuan skala besar, biasa digunakan oleh Dosen dan Rapat Struktural FISIP. Akses umum tertutup kecuali diaktifkan oleh Admin.",
    facilities: "2 Unit Komputer (PC Desktop), Port Charger Meja di setiap sisi, Whiteboard Kaca Besar, Full AC.",
    isActive: false, // Default mati/nonaktif
  },
  {
    id: "room-2",
    name: "Focus Room 2",
    capacity: 10, // Maksimal 10 orang
    description: "Ruang diskusi kelompok menengah, riset kolaboratif, dan persiapan bimbingan.",
    facilities: "Port Charger Meja, Whiteboard Kaca, Full AC, Meja Konferensi.",
    isActive: true,
  },
  {
    id: "room-3",
    name: "Focus Room 3",
    capacity: 6, // Maksimal 6 orang
    description: "Ruang diskusi kelompok fokus, bimbingan tugas akhir, dan riset intensif.",
    facilities: "Port Charger Meja, Whiteboard Kaca, Full AC.",
    isActive: true,
  },
  {
    id: "room-4",
    name: "Focus Room 4",
    capacity: 6, // Maksimal 6 orang
    description: "Ruang belajar kelompok fokus, persiapan ujian komprehensif / sidang skripsi.",
    facilities: "Port Charger Meja, Whiteboard Kaca, Full AC.",
    isActive: true,
  },
];

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "local-db.json");

interface LocalDB {
  users: UserRecord[];
  rooms: RoomRecord[];
  bookings: any[];
}

function normalizeBooking(b: any, db: LocalDB): BookingRecord {
  const user = db.users.find((u) => u.id === b.userId);
  const room = db.rooms.find((r) => r.id === b.roomId);

  return {
    id: b.id,
    userId: b.userId,
    roomId: b.roomId,
    email: b.email || user?.email || "mhs@uinjkt.ac.id",
    responsibleName: b.responsibleName || user?.name || "Penanggung Jawab",
    identifier: b.identifier || user?.nim || "-",
    phone: b.phone || user?.phone || "081234567890",
    prodi: b.prodi || user?.prodi || "FISIP",
    userType: (b.userType || (user?.role === "DOSEN_PEGAWAI" ? "DOSEN_PEGAWAI" : "MAHASISWA")) as "MAHASISWA" | "DOSEN_PEGAWAI",
    userCount: b.userCount || 2,
    purpose: b.purpose || b.notes || "Diskusi Akademik",
    startTime: b.startTime,
    endTime: b.endTime,
    qrCode: b.qrCode,
    status: (b.status || "ACTIVE") as BookingStatus,
    checkedInAt: b.checkedInAt || null,
    createdAt: b.createdAt || new Date().toISOString(),
    room,
    user,
  };
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
            name: "Admin & Verifikator FISIP",
            email: "verifikator.fisip@uinjkt.ac.id",
            phone: "081298765432",
            prodi: "Sekretariat Dekanat & Akademik FISIP",
            role: "ADMIN",
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
    const parsed = JSON.parse(content);

    // Sinkronisasi ruangan jika kapasitas lama
    if (!parsed.rooms || parsed.rooms.length === 0 || parsed.rooms[0].capacity < 15) {
      parsed.rooms = INITIAL_ROOMS;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
    }
    return parsed;
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

// Global cache agar tidak mencoba query raw berulang-ulang jika DB lokal belum diset
const globalForDB = globalThis as unknown as {
  isPrismaAvailable?: boolean;
};

async function checkPrisma(): Promise<boolean> {
  if (globalForDB.isPrismaAvailable !== undefined) {
    return globalForDB.isPrismaAvailable;
  }

  const dbUrl = process.env.DATABASE_URL || "";
  // Jika URL masih menggunakan localhost atau belum diset ke host remote valid
  if (!dbUrl || dbUrl.includes("localhost:5432") || dbUrl.includes("@localhost")) {
    globalForDB.isPrismaAvailable = false;
    return false;
  }

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000)),
    ]);
    globalForDB.isPrismaAvailable = true;
    return true;
  } catch {
    globalForDB.isPrismaAvailable = false;
    return false;
  }
}

// User methods
export async function getOrCreateUser(data: {
  nim: string;
  name: string;
  email?: string;
  phone?: string;
  prodi?: string;
  userType?: "MAHASISWA" | "DOSEN_PEGAWAI";
}): Promise<UserRecord> {
  const trimmedNim = data.nim.trim();
  const trimmedName = data.name.trim() || `Pengguna ${trimmedNim}`;
  const isAdmin = trimmedNim.toUpperCase().startsWith("ADMIN");
  const role: Role = isAdmin
    ? "ADMIN"
    : data.userType === "DOSEN_PEGAWAI"
    ? "DOSEN_PEGAWAI"
    : "MAHASISWA";

  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      const existing = await prisma.user.findUnique({ where: { nim: trimmedNim } });
      if (existing) {
        return {
          id: existing.id,
          nim: existing.nim,
          name: existing.name,
          email: existing.email || data.email,
          phone: existing.phone || data.phone,
          prodi: existing.prodi || data.prodi,
          role: existing.role as Role,
          createdAt: existing.createdAt.toISOString(),
        };
      }
      const created = await prisma.user.create({
        data: {
          nim: trimmedNim,
          name: trimmedName,
          email: data.email,
          phone: data.phone,
          prodi: data.prodi,
          role,
        },
      });
      return {
        id: created.id,
        nim: created.nim,
        name: created.name,
        email: created.email || undefined,
        phone: created.phone || undefined,
        prodi: created.prodi || undefined,
        role: created.role as Role,
        createdAt: created.createdAt.toISOString(),
      };
    } catch {
      // Graceful fallback to local
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
      email: data.email,
      phone: data.phone,
      prodi: data.prodi,
      role,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeLocalDB(db);
  } else {
    if (data.email) user.email = data.email;
    if (data.phone) user.phone = data.phone;
    if (data.prodi) user.prodi = data.prodi;
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
          email: u.email || undefined,
          phone: u.phone || undefined,
          prodi: u.prodi || undefined,
          role: u.role as Role,
          createdAt: u.createdAt.toISOString(),
        };
      }
    } catch {
      // Graceful fallback
    }
  }
  const db = readLocalDB();
  return db.users.find((u) => u.id === id) || null;
}

// Room methods
export async function getRooms(includeInactive = false): Promise<RoomRecord[]> {
  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      const whereClause = includeInactive ? {} : { isActive: true };
      const rooms = await prisma.room.findMany({ where: whereClause, orderBy: { name: "asc" } });
      if (rooms.length > 0) {
        return rooms.map((r) => ({
          id: r.id,
          name: r.name,
          capacity: r.capacity,
          description: r.description || "",
          facilities: r.facilities || "",
          isActive: r.isActive,
        }));
      }
    } catch {
      // Graceful fallback
    }
  }
  const db = readLocalDB();
  return includeInactive ? db.rooms : db.rooms.filter((r) => r.isActive);
}

export async function toggleRoomActive(roomId: string, isActive: boolean): Promise<boolean> {
  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      await prisma.room.update({
        where: { id: roomId },
        data: { isActive },
      });
      return true;
    } catch {
      // Graceful fallback
    }
  }

  const db = readLocalDB();
  const room = db.rooms.find((r) => r.id === roomId);
  if (room) {
    room.isActive = isActive;
    writeLocalDB(db);
    return true;
  }
  return false;
}

// Booking methods
export async function getUserActiveBooking(
  userId: string,
  identifier?: string
): Promise<BookingRecord | null> {
  const usePrisma = await checkPrisma();
  if (usePrisma) {
    try {
      const orConditions: any[] = [{ userId }];
      if (identifier) orConditions.push({ identifier });

      // 1. Cari booking ACTIVE terbaru untuk pengguna ini
      let active = await prisma.booking.findFirst({
        where: {
          OR: orConditions,
          status: "ACTIVE",
        },
        include: { room: true, user: true },
        orderBy: { createdAt: "desc" },
      });

      // 2. Jika tidak ada ACTIVE, cari booking terbaru (misal yang baru digunakan/USED)
      if (!active) {
        active = await prisma.booking.findFirst({
          where: { OR: orConditions },
          include: { room: true, user: true },
          orderBy: { createdAt: "desc" },
        });
      }

      if (active) {
        return {
          id: active.id,
          userId: active.userId,
          roomId: active.roomId,
          email: active.email,
          responsibleName: active.responsibleName,
          identifier: active.identifier,
          phone: active.phone,
          prodi: active.prodi,
          userType: active.userType as "MAHASISWA" | "DOSEN_PEGAWAI",
          userCount: active.userCount,
          purpose: active.purpose,
          startTime: active.startTime.toISOString(),
          endTime: active.endTime.toISOString(),
          qrCode: active.qrCode,
          status: active.status as BookingStatus,
          checkedInAt: active.checkedInAt?.toISOString() || null,
          createdAt: active.createdAt.toISOString(),
          room: {
            id: active.room.id,
            name: active.room.name,
            capacity: active.room.capacity,
            description: active.room.description || "",
            facilities: active.room.facilities || "",
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
    } catch {
      // Graceful fallback
    }
  }

  // Local fallback
  const db = readLocalDB();
  const userBookings = db.bookings
    .filter((b) => b.userId === userId || (identifier && b.identifier === identifier))
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.startTime).getTime() -
        new Date(a.createdAt || a.startTime).getTime()
    );

  // Prioritas booking ACTIVE terbaru
  const rawBooking = userBookings.find((b) => b.status === "ACTIVE") || userBookings[0];
  if (!rawBooking) return null;

  return normalizeBooking(rawBooking, db);
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
        email: b.email,
        responsibleName: b.responsibleName,
        identifier: b.identifier,
        phone: b.phone,
        prodi: b.prodi,
        userType: b.userType as "MAHASISWA" | "DOSEN_PEGAWAI",
        userCount: b.userCount,
        purpose: b.purpose,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        qrCode: b.qrCode,
        status: b.status as BookingStatus,
        checkedInAt: b.checkedInAt?.toISOString() || null,
        createdAt: b.createdAt.toISOString(),
        room: {
          id: b.room.id,
          name: b.room.name,
          capacity: b.room.capacity,
          description: b.room.description || "",
          facilities: b.room.facilities || "",
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
    } catch {
      // Graceful fallback
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
    .map((b) => normalizeBooking(b, db));
}

export async function createBooking(data: {
  userId: string;
  roomId: string;
  email: string;
  responsibleName: string;
  identifier: string;
  phone: string;
  prodi: string;
  userType: "MAHASISWA" | "DOSEN_PEGAWAI";
  userCount: number;
  purpose: string;
  startTime: Date;
  endTime: Date;
}): Promise<{ success: boolean; booking?: BookingRecord; error?: string }> {
  const rooms = await getRooms(true);
  const targetRoom = rooms.find((r) => r.id === data.roomId);
  if (!targetRoom) {
    return { success: false, error: "Ruangan tidak ditemukan." };
  }
  if (!targetRoom.isActive) {
    return {
      success: false,
      error: `${targetRoom.name} saat ini sedang dinonaktifkan atau dikunci khusus kegiatan Dosen/Fakultas oleh Admin.`,
    };
  }

  if (data.userCount > targetRoom.capacity) {
    return {
      success: false,
      error: `Jumlah pengguna (${data.userCount} orang) melebihi kapasitas maksimal ${targetRoom.name} (${targetRoom.capacity} orang).`,
    };
  }

  const existingActive = await getUserActiveBooking(data.userId, data.identifier);
  if (existingActive && existingActive.status === "ACTIVE") {
    return {
      success: false,
      error: "Anda masih memiliki jadwal booking aktif yang belum selesai. Maksimal 1 reservasi aktif per penanggung jawab.",
    };
  }

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
          error: "Ruangan ini sudah dipesan oleh penanggung jawab lain pada slot waktu tersebut. Silakan pilih ruangan atau slot lain.",
        };
      }

      const qrCodeSecret = crypto.randomUUID();
      const created = await prisma.booking.create({
        data: {
          userId: data.userId,
          roomId: data.roomId,
          email: data.email,
          responsibleName: data.responsibleName,
          identifier: data.identifier,
          phone: data.phone,
          prodi: data.prodi,
          userType: data.userType,
          userCount: data.userCount,
          purpose: data.purpose,
          startTime: data.startTime,
          endTime: data.endTime,
          qrCode: qrCodeSecret,
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
          email: created.email,
          responsibleName: created.responsibleName,
          identifier: created.identifier,
          phone: created.phone,
          prodi: created.prodi,
          userType: created.userType as "MAHASISWA" | "DOSEN_PEGAWAI",
          userCount: created.userCount,
          purpose: created.purpose,
          startTime: created.startTime.toISOString(),
          endTime: created.endTime.toISOString(),
          qrCode: created.qrCode,
          status: created.status as BookingStatus,
          checkedInAt: created.checkedInAt?.toISOString() || null,
          createdAt: created.createdAt.toISOString(),
          room: {
            id: created.room.id,
            name: created.room.name,
            capacity: created.room.capacity,
            description: created.room.description || "",
            facilities: created.room.facilities || "",
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
    } catch {
      // Fallback to local
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
      error: "Ruangan ini sudah dipesan oleh penanggung jawab lain pada slot waktu tersebut. Silakan pilih ruangan atau slot lain.",
    };
  }

  const newBooking = {
    id: crypto.randomUUID(),
    userId: data.userId,
    roomId: data.roomId,
    email: data.email,
    responsibleName: data.responsibleName,
    identifier: data.identifier,
    phone: data.phone,
    prodi: data.prodi,
    userType: data.userType,
    userCount: data.userCount,
    purpose: data.purpose,
    startTime: data.startTime.toISOString(),
    endTime: data.endTime.toISOString(),
    qrCode: crypto.randomUUID(),
    status: "ACTIVE",
    checkedInAt: null,
    createdAt: new Date().toISOString(),
  };

  db.bookings.push(newBooking);
  writeLocalDB(db);

  return {
    success: true,
    booking: normalizeBooking(newBooking, db),
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
          email: b.email,
          responsibleName: b.responsibleName,
          identifier: b.identifier,
          phone: b.phone,
          prodi: b.prodi,
          userType: b.userType as "MAHASISWA" | "DOSEN_PEGAWAI",
          userCount: b.userCount,
          purpose: b.purpose,
          startTime: b.startTime.toISOString(),
          endTime: b.endTime.toISOString(),
          qrCode: b.qrCode,
          status: b.status as BookingStatus,
          checkedInAt: b.checkedInAt?.toISOString() || null,
          createdAt: b.createdAt.toISOString(),
          room: {
            id: b.room.id,
            name: b.room.name,
            capacity: b.room.capacity,
            description: b.room.description || "",
            facilities: b.room.facilities || "",
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
    } catch {
      // Fallback
    }
  }

  const db = readLocalDB();
  const b = db.bookings.find((item) => item.id === id);
  if (!b) return null;
  return normalizeBooking(b, db);
}

export async function verifyAndCheckInQR(rawPayload: string): Promise<{
  success: boolean;
  message: string;
  booking?: BookingRecord;
}> {
  const verification = verifyDynamicQRPayload(rawPayload);
  if (!verification.valid) {
    if (verification.error === "EXPIRED_QR_SCREENSHOT") {
      return {
        success: false,
        message: "❌ KODE QR KADALUWARSA! Terdeteksi tangkapan layar (screenshot) atau foto lama yang diteruskan. Pemesan wajib membuka aplikasi dan menunjukkan QR dinamis secara langsung.",
      };
    }
    return {
      success: false,
      message: "❌ FORMAT QR TIDAK DIKENALI! Kode QR ini bukan kode resmi Focus Room FISIP UIN Jakarta.",
    };
  }

  const bookingId = verification.bookingId!;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return {
      success: false,
      message: "❌ DATA RESERVASI TIDAK DITEMUKAN dalam pangkalan data.",
    };
  }

  if (booking.status === "USED") {
    return {
      success: false,
      message: `⚠️ TIKET SUDAH DIGUNAKAN pada ${
        booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleTimeString("id-ID") : "sebelumnya"
      }.`,
      booking,
    };
  }

  if (booking.status === "CANCELLED") {
    return {
      success: false,
      message: "❌ TIKET TELAH DIBATALKAN oleh pemesan yang bersangkutan.",
      booking,
    };
  }

  const now = new Date();
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);

  const earlyTolerance = 15 * 60 * 1000;
  if (now.getTime() < startTime.getTime() - earlyTolerance) {
    return {
      success: false,
      message: `⏳ BELUM WAKTUNYA. Sesi baru dimulai pada pukul ${startTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })} WIB. Presensi dibuka 15 menit sebelumnya.`,
      booking,
    };
  }

  if (now > endTime) {
    await updateBookingStatus(booking.id, "EXPIRED");
    return {
      success: false,
      message: "❌ WAKTU SESI TELAH BERAKHIR. Tiket dinyatakan EXPIRED.",
      booking,
    };
  }

  const checkInTime = new Date().toISOString();
  await updateBookingStatus(booking.id, "USED", checkInTime);

  const updatedBooking = await getBookingById(booking.id);
  return {
    success: true,
    message: `✅ PRESENSI TERVERIFIKASI! Akses dibuka untuk ${booking.room?.name}. Penanggung Jawab: ${booking.responsibleName} (${booking.identifier}) - ${booking.userCount} Orang.`,
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
    } catch {
      // Fallback
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
        take: 300,
      });
      return list.map((b) => ({
        id: b.id,
        userId: b.userId,
        roomId: b.roomId,
        email: b.email,
        responsibleName: b.responsibleName,
        identifier: b.identifier,
        phone: b.phone,
        prodi: b.prodi,
        userType: b.userType as "MAHASISWA" | "DOSEN_PEGAWAI",
        userCount: b.userCount,
        purpose: b.purpose,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        qrCode: b.qrCode,
        status: b.status as BookingStatus,
        checkedInAt: b.checkedInAt?.toISOString() || null,
        createdAt: b.createdAt.toISOString(),
        room: {
          id: b.room.id,
          name: b.room.name,
          capacity: b.room.capacity,
          description: b.room.description || "",
          facilities: b.room.facilities || "",
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
    } catch {
      // Fallback
    }
  }

  const db = readLocalDB();
  return db.bookings
    .map((b) => normalizeBooking(b, db))
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}
