import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getRooms, getAllBookingsList } from "@/lib/data";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Jika belum masuk atau bukan admin, alihkan ke portal login admin khusus
  if (!user || user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  // Admin berhak melihat semua ruangan termasuk yang nonaktif
  const rooms = await getRooms(true);
  const allBookings = await getAllBookingsList();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <AdminClient rooms={rooms} allBookings={allBookings} />
    </div>
  );
}
