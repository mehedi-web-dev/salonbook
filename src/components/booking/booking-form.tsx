"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { createAppointment } from "@/lib/appointments-api";
import type { Service, Appointment } from "@/types";

export const SALON_TIME_SLOTS = [
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "01:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "17:00", label: "05:00 PM" },
  { value: "18:00", label: "06:00 PM" },
] as const;

interface BookingFormProps {
  service: Service;
}

export function BookingForm({ service }: BookingFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // Tomorrow as default date in YYYY-MM-DD format
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const todayStr = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const [appointmentDate, setAppointmentDate] = useState<string>(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState<string>("10:00");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const duration = service.duration ?? service.durationMinutes ?? 45;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.info("Please sign in to schedule an appointment");
      router.push("/login");
      return;
    }

    if (isAdmin) {
      toast.error("Administrators cannot create customer appointments");
      return;
    }

    if (!appointmentDate || appointmentDate < todayStr) {
      toast.error("Please select a valid future appointment date");
      return;
    }

    if (!timeSlot) {
      toast.error("Please choose a time slot");
      return;
    }

    setConflictError(null);
    setIsSubmitting(true);

    try {
      const result = await createAppointment({
        serviceId: service._id,
        appointmentDate,
        timeSlot, // Canonical 24-hour HH:mm
        message: message.trim() || undefined,
      });

      setConfirmedBooking(result);
      toast.success("Appointment booked successfully!");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to book appointment";

      if (
        errorMsg.toLowerCase().includes("already booked") ||
        errorMsg.toLowerCase().includes("slot")
      ) {
        setConflictError(errorMsg);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If appointment was just booked, render confirmation card
  if (confirmedBooking) {
    const slotLabel =
      SALON_TIME_SLOTS.find((s) => s.value === confirmedBooking.timeSlot)?.label ||
      confirmedBooking.timeSlot;

    return (
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 text-emerald-800 mb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Booking Confirmed
            </h3>
            <p className="text-xs text-muted-foreground">
              Your session reservation has been received and is pending stylist review.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-5 space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className="text-muted-foreground">Treatment:</span>
            <span className="font-semibold text-foreground">{service.name}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium text-foreground">{confirmedBooking.appointmentDate}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className="text-muted-foreground">Time Slot:</span>
            <span className="font-medium text-foreground">{slotLabel}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium text-foreground">{duration} minutes</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className="text-muted-foreground">Service Price:</span>
            <span className="font-bold text-foreground text-sm">${confirmedBooking.servicePrice}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
              {confirmedBooking.status}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/appointments" className="flex-1">
            <Button variant="primary" size="md" className="w-full gap-2">
              <span>View My Appointments</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              setConfirmedBooking(null);
              setMessage("");
            }}
          >
            Book Another Slot
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs">
      <div className="mb-6 border-b border-border pb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground mb-3">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Appointment Scheduling</span>
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          Schedule Your Session
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose a preferred appointment date and time slot. Our salon specialists will confirm your booking.
        </p>
      </div>

      {/* Admin Notice if Logged In As Admin */}
      {isAdmin && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-rose-300 bg-rose-50/90 p-4 text-xs text-rose-900"
        >
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-950">
                Administrator Account Active
              </p>
              <p className="mt-1 text-rose-800 leading-relaxed">
                Customer appointment booking is reserved for customer accounts. As an administrator,
                you manage services and schedules from the Operations Portal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 409 Conflict Error Alert */}
      {conflictError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Slot Unavailable</p>
              <p className="mt-1 text-amber-800 leading-relaxed">
                {conflictError}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleBookingSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label
            htmlFor="appointmentDate"
            className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
          >
            Select Date <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
            </span>
            <input
              id="appointmentDate"
              type="date"
              min={todayStr}
              value={appointmentDate}
              onChange={(e) => {
                setAppointmentDate(e.target.value);
                setConflictError(null);
              }}
              required
              disabled={isSubmitting || isAdmin}
              className="w-full rounded-md border border-border bg-background pl-9 pr-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Please select today or an upcoming calendar date.
          </p>
        </div>

        {/* Time Slot Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
            Select Time Slot (Salon Hours) <span className="text-primary">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SALON_TIME_SLOTS.map((slot) => {
              const isSelected = timeSlot === slot.value;
              return (
                <button
                  key={slot.value}
                  type="button"
                  disabled={isSubmitting || isAdmin}
                  onClick={() => {
                    setTimeSlot(slot.value);
                    setConflictError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium border transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "border-border bg-secondary/40 text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  <span>{slot.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3 text-muted-foreground/70" />
            <span>Time slots are reserved on a first-come basis and validated by salon servers.</span>
          </p>
        </div>

        {/* Special Instructions / Message */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="bookingMessage"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground"
            >
              Special Requests or Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              {message.length} / 500
            </span>
          </div>
          <div className="relative">
            <textarea
              id="bookingMessage"
              rows={3}
              maxLength={500}
              placeholder="e.g. Sensitive scalp, allergies, or styling preferences..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting || isAdmin}
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary leading-relaxed"
            />
          </div>
        </div>

        {/* Booking Summary Box */}
        <div className="rounded-lg border border-border bg-secondary/20 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Selected Treatment:</span>
            <span className="font-semibold text-foreground">{service.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Duration:</span>
            <span className="text-foreground">{duration} minutes</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Scheduled Date &amp; Time:</span>
            <span className="font-medium text-foreground">
              {appointmentDate} at {SALON_TIME_SLOTS.find((s) => s.value === timeSlot)?.label || timeSlot}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold text-foreground pt-2.5 border-t border-border/60">
            <span>Total Treatment Rate:</span>
            <span className="text-base text-primary">${service.price}</span>
          </div>
        </div>

        {/* Submit Actions */}
        <div>
          {!user ? (
            <Link href="/login" className="block w-full">
              <Button type="button" variant="primary" size="md" className="w-full">
                <span>Sign In to Book Appointment</span>
              </Button>
            </Link>
          ) : isAdmin ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled
              className="w-full cursor-not-allowed opacity-60"
            >
              <span>Booking Disabled for Administrators</span>
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="w-full min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Reserving Time Slot...</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Confirm Appointment Booking (${service.price})</span>
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
