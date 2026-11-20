"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  Tag,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerGuard } from "@/components/booking/customer-guard";
import { getMyPaymentById } from "@/lib/payments-api";
import type { PaymentTransaction, TransactionStatus } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const [payment, setPayment] = useState<PaymentTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPayment = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getMyPaymentById(id);
      setPayment(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        setErrorMessage("Payment record not found. It may belong to another user or have been deleted.");
      } else {
        const message =
          err instanceof Error ? err.message : "Failed to load payment details";
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      try {
        const data = await getMyPaymentById(id);
        if (isCurrent) setPayment(data);
      } catch (err: unknown) {
        if (!isCurrent) return;
        if (err instanceof Error && err.message === "NOT_FOUND") {
          setErrorMessage("Payment record not found. It may belong to another user or have been deleted.");
        } else {
          const message =
            err instanceof Error ? err.message : "Failed to load payment details";
          setErrorMessage(message);
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    load();
    return () => {
      isCurrent = false;
    };
  }, [id]);

  const renderStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Payment Completed</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
            <XCircle className="h-3.5 w-3.5" />
            <span>Payment Failed</span>
          </span>
        );
      case "reconciliation_required":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Reconciliation Required</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <CustomerGuard>
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Navigation Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/payments"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Payment History</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/appointments">
              <Button variant="outline" size="sm" className="text-xs">
                <span>My Appointments</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-20 rounded-lg bg-card border border-border p-6" />
            <div className="h-72 rounded-lg bg-card border border-border p-6" />
          </div>
        ) : errorMessage ? (
          /* Error State */
          <div
            role="alert"
            className="rounded-lg border border-rose-300 bg-rose-50/90 p-8 text-center text-rose-900 shadow-xs"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-rose-950">
              Unable to Retrieve Payment
            </h2>
            <p className="mt-2 text-sm text-rose-800 max-w-md mx-auto">
              {errorMessage}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPayment}
                className="gap-1.5 text-xs border-rose-300 text-rose-900 hover:bg-rose-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </Button>
              <Link href="/dashboard/payments">
                <Button variant="primary" size="sm" className="text-xs">
                  <span>Return to History</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : payment ? (
          /* Digital Receipt Card */
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Header / Receipt Banner */}
            <div className="border-b border-border bg-gradient-to-r from-accent/50 to-secondary/30 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-0.5 text-xs font-semibold text-foreground mb-2">
                    <Receipt className="h-3 w-3 text-primary" />
                    <span>Official Receipt</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                    Payment #{payment._id.slice(-8).toUpperCase()}
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Issued on {formatDate(payment.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  {renderStatusBadge(payment.status)}
                  <div className="mt-2 text-left sm:text-right">
                    <span className="text-xs text-muted-foreground block">Total Amount:</span>
                    <span className="font-serif text-3xl font-bold text-foreground">
                      ${Number(payment.amount).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1 font-semibold uppercase">
                      {payment.currency || "USD"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Treatment Information */}
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Treatment & Service Information
                </h2>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        {payment.service?.name || "Salon Treatment"}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {payment.service?.category && (
                          <span className="inline-flex items-center gap-1 rounded bg-accent/60 px-2 py-0.5 font-medium text-accent-foreground capitalize">
                            <Tag className="h-3 w-3 text-primary" />
                            <span>{payment.service.category}</span>
                          </span>
                        )}
                        {payment.service?.duration && (
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            <Clock className="h-3 w-3 text-primary" />
                            <span>{payment.service.duration} mins</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-serif text-lg font-semibold text-foreground">
                      ${Number(payment.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Schedule Details */}
              {payment.appointment && (
                <div>
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Appointment Schedule
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <span className="text-xs text-muted-foreground block">Reserved Date & Time:</span>
                      <div className="mt-1.5 flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{payment.appointment.appointmentDate}</span>
                        </div>
                        <span className="text-muted-foreground">&bull;</span>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{payment.appointment.timeSlot}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                      <span className="text-xs text-muted-foreground block">Appointment Reference:</span>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-sm font-mono font-medium text-foreground">
                          {payment.appointment._id}
                        </span>
                        <Link href="/dashboard/appointments">
                          <span className="text-xs font-semibold text-primary hover:underline">
                            View Appointment &rarr;
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Processing & Gateway Information */}
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Payment Verification & Gateway Details
                </h2>
                <div className="rounded-lg border border-border bg-card p-4 divide-y divide-border text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Processor:</span>
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Stripe Secure Payments</span>
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Transaction ID:</span>
                    <span className="font-mono text-foreground font-medium select-all">
                      {payment._id}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Customer ID:</span>
                    <span className="font-mono text-muted-foreground select-all">
                      {payment.customerId}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <span className="font-semibold capitalize text-foreground">
                      {payment.status}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Processed At:</span>
                    <span className="font-medium text-foreground">
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>
                  {payment.notes && (
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-muted-foreground">Notes:</span>
                      <span className="text-foreground italic">{payment.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Guarantee Note */}
              <div className="rounded-lg border border-border bg-secondary/30 p-4 flex items-start gap-3 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Thank you for booking with <strong className="text-foreground">SalonBook</strong>. This digital receipt serves as your official proof of payment for your scheduled beauty treatment.
                </p>
              </div>
            </div>

            {/* Receipt Footer Actions */}
            <div className="border-t border-border bg-muted/20 p-6 flex flex-wrap items-center justify-between gap-3">
              <Link href="/dashboard/payments">
                <Button variant="outline" size="sm" className="text-xs">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  <span>All Transactions</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/appointments">
                  <Button variant="primary" size="sm" className="text-xs">
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    <span>View Scheduled Appointment</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </CustomerGuard>
  );
}
