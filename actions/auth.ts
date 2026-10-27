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

export async function loginUser(nim: string, name: string) {
  if (!nim || nim.trim().length < 3) {
    return { success: false, error: "NIM / ID Petugas tidak valid." };
  }

  const user = await getOrCreateUser(nim, name);
  
  // Set cookie session (14 hari)
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

export async function logoutUser() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
