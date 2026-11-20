"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Calendar,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Sparkles,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerGuard } from "@/components/booking/customer-guard";
import { getMyAppointmentById } from "@/lib/appointments-api";
import type { Appointment } from "@/types";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment_id") || searchParams.get("id");
  const sessionId = searchParams.get("session_id");

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isVerifying, setIsVerifying] = useState(!!appointmentId);
  const [pollCount, setPollCount] = useState(0);

  const handleManualCheck = async () => {
    if (!appointmentId) return;
    setIsVerifying(true);
    try {
      const data = await getMyAppointmentById(appointmentId);
      setAppointment(data);
    } catch {
      // Failed to load appointment
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!appointmentId) return;
    let isCurrent = true;
    const verify = async () => {
      try {
        const data = await getMyAppointmentById(appointmentId);
        if (isCurrent) setAppointment(data);
      } catch {
        // Fallback
      } finally {
        if (isCurrent) setIsVerifying(false);
      }
    };
    verify();
    return () => {
      isCurrent = false;
    };
  }, [appointmentId, pollCount]);

  // If appointment is unpaid, auto-poll up to 3 times with interval to catch webhook completion
  useEffect(() => {
    if (appointment && appointment.paymentStatus !== "paid" && pollCount < 3) {
      const timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appointment, pollCount]);

  const isPaid = appointment?.paymentStatus === "paid";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm text-center">
        {/* Status Header */}
        <div className="border-b border-border bg-gradient-to-b from-accent/50 to-secondary/20 p-8 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-xs">
            {isVerifying ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : isPaid ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            ) : (
              <ShieldCheck className="h-8 w-8 text-primary" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-semibold text-foreground mb-3">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Stripe Checkout</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            {isPaid
              ? "Payment Verified & Confirmed!"
              : "Checkout Received"}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {isPaid
              ? "Your payment has been verified by our secure billing system. Your appointment reservation is confirmed."
              : "Thank you for completing the checkout session. Our payment processor is finalizing the transaction verification."}
          </p>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-6 text-left">
          {/* Webhook Pending Notice (when paymentStatus is still unpaid) */}
          {!isPaid && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-950">
                <Clock className="h-4 w-4 text-amber-700 shrink-0" />
                <span>Verification In Progress</span>
              </div>
              <p className="leading-relaxed">
                Stripe has processed your checkout. Final status updates occur automatically once our backend webhook verifies the payment event.
              </p>
              {appointmentId && (
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualCheck}
                    disabled={isVerifying}
                    className="gap-1.5 text-xs border-amber-300 text-amber-900 hover:bg-amber-100"
                  >
                    {isVerifying ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    <span>Re-check Verification Status</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Appointment Details Summary */}
          {appointment && (
            <div className="rounded-lg border border-border bg-card p-5 space-y-4">
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
                  <span className="block text-[11px] font-semibold uppercase text-muted-foreground">
                    Status:{" "}
                    <span
                      className={
                        appointment.paymentStatus === "paid"
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }
                    >
                      {appointment.paymentStatus}
                    </span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Date:</span>
                  <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>{appointment.appointmentDate}</span>
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Time Slot:</span>
                  <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{appointment.timeSlot}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Metadata */}
          {sessionId && (
            <div className="text-center text-xs text-muted-foreground">
              <span>Checkout Session Reference: </span>
              <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px] text-foreground">
                {sessionId.length > 28 ? `${sessionId.slice(0, 28)}...` : sessionId}
              </code>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/appointments" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full gap-2">
                <Calendar className="h-4 w-4" />
                <span>View My Appointments</span>
              </Button>
            </Link>
            <Link href="/dashboard/payments" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full gap-2">
                <Receipt className="h-4 w-4" />
                <span>Payment History</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <CustomerGuard>
      <Suspense
        fallback={
          <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
            <div className="flex flex-col items-center gap-2.5">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-xs font-medium text-muted-foreground">
                Loading payment confirmation...
              </p>
            </div>
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </CustomerGuard>
  );
}
