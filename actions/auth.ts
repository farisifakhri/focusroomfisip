"use server";

import { cookies } from "next/headers";
import { getOrCreateUser, getUserById, UserRecord } from "@/lib/data";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "focus_room_session";

export async function getCurrentUser(): Promise<UserRecord | null> {
  const cookieStore = cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return null;

  try {
    const data = JSON.parse(session.value);
    if (!data.id) return null;
    return await getUserById(data.id);
  } catch {
    return null;
  }
}

export async function loginUser(data: {
  identifier: string; // NIM atau NIP
  name: string;
  email?: string;
  phone?: string;
  prodi?: string;
  userType?: "MAHASISWA" | "DOSEN_PEGAWAI";
}) {
  const trimmedId = data.identifier?.trim();
  if (!trimmedId || trimmedId.length < 3) {
    return { success: false, error: "NIM / NIP / ID Petugas tidak valid." };
  }

  const user = await getOrCreateUser({
    nim: trimmedId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    prodi: data.prodi,
    userType: data.userType,
  });

  const cookieStore = cookies();
  cookieStore.set(
    SESSION_COOKIE,
    JSON.stringify({ id: user.id, nim: user.nim, name: user.name, role: user.role }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14,
      path: "/",
    }
  );

  return { success: true, user };
}

export async function adminLogin(adminId: string, secretKey: string) {
  const trimmedId = adminId?.trim();
  // Validasi ID admin dan kunci sandi administrasi sederhana
  if (trimmedId !== "ADMIN_FISIP" && !trimmedId.toUpperCase().startsWith("ADMIN")) {
    return { success: false, error: "ID Petugas Administrasi tidak dikenali." };
  }

  if (secretKey !== "admin123" && secretKey !== "fisip2026") {
    return { success: false, error: "Kunci sandi verifikator tidak sesuai." };
  }

  const user = await getOrCreateUser({
    nim: "ADMIN_FISIP",
    name: "Petugas Verifikator FISIP",
    email: "verifikator.fisip@uinjkt.ac.id",
    phone: "081298765432",
    prodi: "Sekretariat Dekanat & Akademik FISIP",
  });

  const cookieStore = cookies();
  cookieStore.set(
    SESSION_COOKIE,
    JSON.stringify({ id: user.id, nim: user.nim, name: user.name, role: "ADMIN" }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    }
  );

  return { success: true, user };
}

export async function logoutUser(redirectTo = "/login") {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect(redirectTo);
}
