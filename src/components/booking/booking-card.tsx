import { Calendar, Clock, DollarSign, User } from "lucide-react";
import type { Booking } from "@/types";

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const statusColors: Record<Booking["status"], string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
    cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <h4 className="font-serif text-base font-semibold text-foreground">
          {booking.serviceName}
        </h4>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize w-fit ${
            statusColors[booking.status] || "bg-muted text-muted-foreground"
          }`}
        >
          {booking.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-foreground/60" />
          <span>{booking.appointmentDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-foreground/60" />
          <span>{booking.timeSlot}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="h-4 w-4 text-foreground/60" />
          <span>{booking.customerName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-4 w-4 text-foreground/60" />
          <span className="font-medium text-foreground">${booking.servicePrice}</span>
        </div>
      </div>

      {onCancel && booking.status !== "cancelled" && (
        <div className="mt-4 pt-3 border-t border-border flex justify-end">
          <button
            onClick={() => onCancel(booking._id)}
            className="text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors"
          >
            Cancel Appointment
          </button>
        </div>
      )}
    </div>
  );
}
