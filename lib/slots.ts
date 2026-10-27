export interface TimeSlot {
  id: string;
  name: string;
  label: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  durationLabel: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  {
    id: "pagi-1",
    name: "Sesi Pagi 1",
    label: "07:30 - 09:30",
    startHour: 7,
    startMinute: 30,
    endHour: 9,
    endMinute: 30,
    durationLabel: "2 Jam",
  },
  {
    id: "pagi-2",
    name: "Sesi Pagi 2",
    label: "10:00 - 12:00",
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    durationLabel: "2 Jam (Jeda pembersihan 30 menit)",
  },
  {
    id: "siang-1",
    name: "Sesi Siang",
    label: "13:00 - 15:30",
    startHour: 13,
    startMinute: 0,
    endHour: 15,
    endMinute: 30,
    durationLabel: "2 Jam 30 Menit",
  },
];

export function getSlotDates(dateString: string, slotId: string): { startTime: Date; endTime: Date } | null {
  const slot = TIME_SLOTS.find((s) => s.id === slotId);
  if (!slot) return null;

  // Format: YYYY-MM-DD
  const [year, month, day] = dateString.split("-").map(Number);
  
  const startTime = new Date(year, month - 1, day, slot.startHour, slot.startMinute, 0, 0);
  const endTime = new Date(year, month - 1, day, slot.endHour, slot.endMinute, 0, 0);

  return { startTime, endTime };
}

export function formatDateTimeIndo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function formatDateOnlyIndo(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

