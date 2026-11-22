export interface TimeSlotItem {
  value: string; // "09:00"
  label: string; // "09:00 AM"
  period: "Morning" | "Afternoon" | "Evening";
}

/**
 * Standard operating time slots for SalonBook.
 * Canonical 24-hour 'HH:mm' values matching backend schema and database compound indexes.
 */
export const SALON_TIME_SLOTS: TimeSlotItem[] = [
  { value: "09:00", label: "09:00 AM", period: "Morning" },
  { value: "10:00", label: "10:00 AM", period: "Morning" },
  { value: "11:00", label: "11:00 AM", period: "Morning" },
  { value: "12:00", label: "12:00 PM", period: "Afternoon" },
  { value: "13:00", label: "01:00 PM", period: "Afternoon" },
  { value: "14:00", label: "02:00 PM", period: "Afternoon" },
  { value: "15:00", label: "03:00 PM", period: "Afternoon" },
  { value: "16:00", label: "04:00 PM", period: "Evening" },
  { value: "17:00", label: "05:00 PM", period: "Evening" },
  { value: "18:00", label: "06:00 PM", period: "Evening" },
];

/**
 * Validates whether a date string conforms strictly to canonical YYYY-MM-DD calendar format.
 */
export function isValidDateFormat(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  return (
    dateObj.getFullYear() === y &&
    dateObj.getMonth() === m - 1 &&
    dateObj.getDate() === d
  );
}

/**
 * Formats a local Date object into YYYY-MM-DD.
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date without UTC offset issues.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Determines whether a given timeSlot on a specific date is already in the past.
 */
export function isPastDateTime(dateStr: string, timeSlot: string, now = new Date()): boolean {
  const todayStr = formatLocalDate(now);
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  // On today's date, compare slot minutes against current time
  const [slotH, slotM] = timeSlot.split(":").map(Number);
  const slotMinutes = slotH * 60 + slotM;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slotMinutes <= currentMinutes;
}

/**
 * Resolves availability status for all time slots on a given date.
 */
export function resolveSlotAvailability(
  dateStr: string,
  userBookedSlots: Set<string> = new Set(),
  conflictSlots: Set<string> = new Set(),
  now = new Date()
) {
  return SALON_TIME_SLOTS.map((slot) => {
    const isPast = isPastDateTime(dateStr, slot.value, now);
    const isUserBooked = userBookedSlots.has(slot.value);
    const isConflicted = conflictSlots.has(slot.value);
    const isAvailable = !isPast && !isUserBooked && !isConflicted;

    let statusReason = "Available";
    if (isPast) statusReason = "Past";
    else if (isUserBooked) statusReason = "Your Booking";
    else if (isConflicted) statusReason = "Booked";

    return {
      ...slot,
      isAvailable,
      isPast,
      isUserBooked,
      isConflicted,
      statusReason,
    };
  });
}
