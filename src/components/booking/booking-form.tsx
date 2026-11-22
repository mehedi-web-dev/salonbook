"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ArrowRight,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { createAppointment, getMyAppointments } from "@/lib/appointments-api";
import { AppointmentCalendar } from "@/components/booking/appointment-calendar";
import {
  TimeSlotSelector,
  SALON_TIME_SLOTS,
} from "@/components/booking/time-slot-selector";
import type { Service, Appointment } from "@/types";

export { SALON_TIME_SLOTS };

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
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const [appointmentDate, setAppointmentDate] = useState<string>(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState<string>("10:00");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // In-memory record of slots confirmed as unavailable/conflicted for a given date
  const [conflictSlotsMap, setConflictSlotsMap] = useState<Record<string, Set<string>>>({});

  // Slots already booked by the current authenticated user on dates
  const [userBookedDatesMap, setUserBookedDatesMap] = useState<Record<string, Set<string>>>({});

  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const duration = service.duration ?? service.durationMinutes ?? 45;

  // Retrieve customer's own active bookings to mark their own booked slots as taken
  const refreshCustomerBookings = useCallback(async () => {
    if (!user || isAdmin) return;
    try {
      const response = await getMyAppointments({ status: "all", limit: 50 });
      if (response?.data) {
        const bookedMap: Record<string, Set<string>> = {};
        for (const appt of response.data) {
          if (appt.status === "pending" || appt.status === "confirmed") {
            const date = appt.appointmentDate;
            if (!bookedMap[date]) {
              bookedMap[date] = new Set();
            }
            bookedMap[date].add(appt.timeSlot);
          }
        }
        setUserBookedDatesMap(bookedMap);
      }
    } catch {
      // Non-critical background enhancement; if it fails, server validation remains authoritative
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user || isAdmin) return;
    let isMounted = true;

    getMyAppointments({ status: "all", limit: 50 })
      .then((response) => {
        if (isMounted && response?.data) {
          const bookedMap: Record<string, Set<string>> = {};
          for (const appt of response.data) {
            if (appt.status === "pending" || appt.status === "confirmed") {
              const date = appt.appointmentDate;
              if (!bookedMap[date]) {
                bookedMap[date] = new Set();
              }
              bookedMap[date].add(appt.timeSlot);
            }
          }
          setUserBookedDatesMap(bookedMap);
        }
      })
      .catch(() => {
        // Non-blocking
      });

    return () => {
      isMounted = false;
    };
  }, [user, isAdmin]);

  // Current date's user-booked and conflicted slots
  const currentUserBookedSlots = useMemo(() => {
    return userBookedDatesMap[appointmentDate] || new Set();
  }, [userBookedDatesMap, appointmentDate]);

  const currentConflictSlots = useMemo(() => {
    return conflictSlotsMap[appointmentDate] || new Set();
  }, [conflictSlotsMap, appointmentDate]);

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

    // Check if slot was already booked by this user
    if (currentUserBookedSlots.has(timeSlot)) {
      toast.error("You already have an appointment booked for this slot");
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

      // Refresh customer bookings in background
      refreshCustomerBookings();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to book appointment";

      if (
        errorMsg.toLowerCase().includes("already booked") ||
        errorMsg.toLowerCase().includes("slot")
      ) {
        setConflictError(errorMsg);
        // Record this slot as conflicted for the chosen date so UI marks it as Booked
        setConflictSlotsMap((prev) => {
          const currentSet = new Set(prev[appointmentDate] || []);
          currentSet.add(timeSlot);
          return {
            ...prev,
            [appointmentDate]: currentSet,
          };
        });
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
              Your reservation has been received and is pending specialist confirmation.
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
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Select a date on our appointment calendar and choose your preferred time slot.
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
        {/* Step 1: Appointment Calendar (Interactive Month / Date Selection) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
            1. Select Appointment Date <span className="text-primary">*</span>
          </label>
          <AppointmentCalendar
            selectedDate={appointmentDate}
            onSelectDate={(newDate) => {
              setAppointmentDate(newDate);
              setConflictError(null);
            }}
            disabled={isSubmitting || isAdmin}
          />
        </div>

        {/* Step 2: Time Slot Selector (Salon Operating Hours & Availability) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
            2. Choose Available Time Slot <span className="text-primary">*</span>
          </label>
          <TimeSlotSelector
            selectedDate={appointmentDate}
            selectedSlot={timeSlot}
            onSelectSlot={(slot) => {
              setTimeSlot(slot);
              setConflictError(null);
            }}
            userBookedSlots={currentUserBookedSlots}
            conflictSlots={currentConflictSlots}
            disabled={isSubmitting || isAdmin}
          />
        </div>

        {/* Step 3: Special Requests / Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="bookingMessage"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground"
            >
              3. Special Requests or Notes <span className="text-muted-foreground font-normal">(Optional)</span>
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
              placeholder="e.g. Sensitive scalp, styling preferences, or allergies..."
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
            <span>Session Duration:</span>
            <span className="text-foreground">{duration} minutes</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Scheduled Date &amp; Time:</span>
            <span className="font-medium text-foreground flex items-center gap-1">
              <CalendarCheck className="h-3.5 w-3.5 text-primary" />
              <span>
                {appointmentDate} at {SALON_TIME_SLOTS.find((s) => s.value === timeSlot)?.label || timeSlot}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold text-foreground pt-2.5 border-t border-border/60">
            <span>Total Treatment Rate:</span>
            <span className="text-base text-primary font-bold">${service.price}</span>
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
              disabled={isSubmitting || currentUserBookedSlots.has(timeSlot) || currentConflictSlots.has(timeSlot)}
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
