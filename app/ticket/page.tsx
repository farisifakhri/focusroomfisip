export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getBookingById, getUserActiveBooking } from "@/lib/data";
import TicketClient from "./TicketClient";

interface TicketPageProps {
  searchParams?: {
    id?: string;
  };
}

export default async function TicketPage({ searchParams }: TicketPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let booking = null;

  // 1. Jika ada parameter ID tiket spesifik
  if (searchParams?.id) {
    const directBooking = await getBookingById(searchParams.id);
    if (
      directBooking &&
      (directBooking.userId === user.id ||
        directBooking.identifier === user.nim ||
        user.role === "ADMIN")
    ) {
      booking = directBooking;
    }
  }

  // 2. Jika tidak ada ID atau tidak cocok, cari tiket aktif milik penanggung jawab
  if (!booking) {
    booking = await getUserActiveBooking(user.id, user.nim);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <TicketClient booking={booking} />
    </div>
  );
}

