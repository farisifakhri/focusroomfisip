export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  cookieStore.delete("focus_room_session");
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  cookieStore.delete("focus_room_session");
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get("to") || "/login";
  return NextResponse.redirect(new URL(redirectTo, req.url));
}

