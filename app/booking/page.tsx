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

  // Tampilkan semua ruangan (termasuk yang nonaktif) agar user dapat melihat statusnya
  const rooms = await getRooms(true);
  const activeBooking = await getUserActiveBooking(user.id);
  
  const todayStr = new Date().toISOString().split("T")[0];
  const existingBookings = await getBookingsForDate(todayStr);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b-2 border-stone-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-fisip-800 uppercase tracking-wider mb-1">
          <Calendar className="w-4 h-4" />
          Formulir Peminjaman Ruang
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Reservasi Focus Room FISIP
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Penanggung Jawab: <strong className="text-stone-900">{user.name}</strong> ({user.nim}) • Lengkapi formulir di bawah ini dengan data yang valid.
        </p>
      </div>

      <BookingClient
        rooms={rooms}
        initialActiveBooking={activeBooking}
        existingBookings={existingBookings}
        initialRoomId={searchParams.room}
        currentUser={user}
      />
    </div>
  );
}
