"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  XCircle,
  Clock,
  Calendar,
  CreditCard,
  Loader2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CustomerGuard } from "@/components/booking/customer-guard";
import { getMyAppointmentById } from "@/lib/appointments-api";
import { createCheckoutSession } from "@/lib/payments-api";
import type { Appointment } from "@/types";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment_id") || searchParams.get("id");

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(!!appointmentId);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;

    let isMounted = true;
    async function loadAppointment() {
      try {
        const data = await getMyAppointmentById(appointmentId as string);
        if (isMounted) setAppointment(data);
      } catch {
        // Ignored fallback
      } finally {
        if (isMounted) setIsLoadingAppointment(false);
      }
    }

    loadAppointment();
    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  const handleRetryPayment = async () => {
    if (!appointment) return;
    setIsRetryingPayment(true);
    try {
      const data = await createCheckoutSession(appointment._id);
      if (data?.url) {
        toast.info("Redirecting to secure Stripe Checkout...");
        window.location.assign(data.url);
      } else {
        toast.error("Failed to generate checkout session. Please try again.");
        setIsRetryingPayment(false);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Payment initialization failed";
      toast.error(message);
      setIsRetryingPayment(false);
    }
  };

  const isEligibleToPay =
    appointment &&
    appointment.status === "confirmed" &&
    appointment.paymentStatus === "unpaid";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm text-center">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-b from-secondary/40 to-background p-8 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-4 shadow-xs border border-rose-100">
            <XCircle className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground mb-3">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Stripe Checkout</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Checkout Cancelled
          </h1>

          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your payment session was cancelled. No charges have been made to your card or payment method.
          </p>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-6 text-left">
          {/* Appointment Context if available */}
          {isLoadingAppointment ? (
            <div className="h-24 rounded-lg bg-muted/40 animate-pulse" />
          ) : appointment ? (
            <div className="rounded-lg border border-border bg-secondary/20 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-serif text-base font-semibold text-foreground">
                    {appointment.service?.name || "Salon Treatment"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Appointment #{appointment._id.slice(-8)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg font-bold text-foreground">
                    ${appointment.servicePrice}
                  </span>
                  <span className="block text-[11px] font-semibold uppercase text-amber-700">
                    Status: {appointment.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>{appointment.appointmentDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>{appointment.timeSlot}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <AlertTriangle className="h-4 w-4 text-primary shrink-0" />
              <span>Your Appointment Reservation</span>
            </div>
            <p className="leading-relaxed">
              If your appointment is confirmed, your reservation slot is held for you. You can complete payment at any time prior to your visit from your appointments dashboard.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            {isEligibleToPay && (
              <Button
                variant="primary"
                size="md"
                onClick={handleRetryPayment}
                disabled={isRetryingPayment}
                className="w-full sm:w-auto gap-2"
              >
                {isRetryingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                <span>Try Checkout Again</span>
              </Button>
            )}

            <Link href="/dashboard/appointments" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full gap-2">
                <Calendar className="h-4 w-4" />
                <span>My Appointments</span>
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="ghost" size="md" className="w-full">
                Dashboard Overview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <CustomerGuard>
      <Suspense
        fallback={
          <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
            <div className="flex flex-col items-center gap-2.5">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-xs font-medium text-muted-foreground">
                Loading status...
              </p>
            </div>
          </div>
        }
      >
        <PaymentCancelContent />
      </Suspense>
    </CustomerGuard>
  );
}
