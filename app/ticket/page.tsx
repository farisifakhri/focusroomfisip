import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getUserActiveBooking } from "@/lib/data";
import TicketClient from "./TicketClient";

export default async function TicketPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const activeBooking = await getUserActiveBooking(user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <TicketClient booking={activeBooking} />
    </div>
  );
}
