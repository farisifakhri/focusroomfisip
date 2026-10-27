import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getRooms, getUserActiveBooking, getBookingsForDate } from "@/lib/data";
import BookingClient from "./BookingClient";
import { Calendar } from "lucide-react";

interface BookingPageProps {
  searchParams: {
    room?: string;
  };
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const rooms = await getRooms();
  const activeBooking = await getUserActiveBooking(user.id);
  
  const todayStr = new Date().toISOString().split("T")[0];
  const existingBookings = await getBookingsForDate(todayStr);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <Calendar className="w-4 h-4" />
          Formulir Pemesanan Sesi
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Reservasi Focus Room FISIP
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Halo, <strong className="text-slate-800">{user.name}</strong> ({user.nim}). Silakan tentukan tanggal, ruangan, dan slot sesi.
        </p>
      </div>

      <BookingClient
        rooms={rooms}
        initialActiveBooking={activeBooking}
        existingBookings={existingBookings}
        initialRoomId={searchParams.room}
      />
    </div>
  );
}
