"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { getAdminTransactionById } from "@/lib/admin-api";
import type { AdminTransaction, TransactionStatus } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminTransactionDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const [transaction, setTransaction] = useState<AdminTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTransaction = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAdminTransactionById(id);
      setTransaction(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "TRANSACTION_NOT_FOUND") {
        setErrorMessage("Transaction not found. The record may not exist or the ID is invalid.");
      } else {
        const message =
          err instanceof Error ? err.message : "Failed to load transaction details";
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
        const data = await getAdminTransactionById(id);
        if (isCurrent) setTransaction(data);
      } catch (err: unknown) {
        if (!isCurrent) return;
        if (err instanceof Error && err.message === "TRANSACTION_NOT_FOUND") {
          setErrorMessage("Transaction not found. The record may not exist or the ID is invalid.");
        } else {
          const message =
            err instanceof Error ? err.message : "Failed to load transaction details";
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
            <span>Settled / Paid</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
            <XCircle className="h-3.5 w-3.5" />
            <span>Authorization Failed</span>
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
    <AdminGuard>
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Navigation Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/admin/transactions"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Transactions</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin">
              <Button variant="outline" size="sm" className="text-xs">
                <span>Overview</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-28 rounded-2xl bg-card border border-border p-6" />
            <div className="h-72 rounded-2xl bg-card border border-border p-6" />
          </div>
        ) : errorMessage ? (
          /* Error State */
          <div
            role="alert"
            className="rounded-xl border border-rose-300 bg-rose-50/90 p-8 text-center text-rose-900 shadow-xs"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-rose-950">
              Unable to Retrieve Transaction
            </h2>
            <p className="mt-2 text-sm text-rose-800 max-w-md mx-auto">
              {errorMessage}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTransaction}
                className="gap-1.5 text-xs border-rose-300 text-rose-900 hover:bg-rose-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </Button>
              <Link href="/dashboard/admin/transactions">
                <Button variant="primary" size="sm" className="text-xs">
                  <span>Return to Ledger</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : transaction ? (
          /* Transaction Record View */
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Header Banner */}
            <div className="border-b border-border bg-gradient-to-r from-accent/50 to-secondary/30 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-0.5 text-xs font-semibold text-foreground mb-2">
                    <Receipt className="h-3 w-3 text-primary" />
                    <span>Audit Record (Read-Only)</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                    Transaction #{transaction._id.slice(-8).toUpperCase()}
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground font-mono select-all">
                    System ID: {transaction._id}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  {renderStatusBadge(transaction.status)}
                  <div className="mt-2 text-left sm:text-right">
                    <span className="text-xs text-muted-foreground block font-medium">Recorded Volume:</span>
                    <span className="font-serif text-3xl font-bold text-foreground">
                      ${Number(transaction.amount).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1 font-semibold uppercase">
                      {transaction.currency || "USD"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Customer Information */}
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Customer & Billing Identity
                </h2>
                <div className="rounded-xl border border-border bg-card p-5 text-xs">
                  {transaction.customer ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-foreground text-sm">
                          {transaction.customer.name}
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          {transaction.customer.email}
                        </div>
                        {transaction.customer.phone && (
                          <div className="text-muted-foreground mt-0.5">
                            Tel: {transaction.customer.phone}
                          </div>
                        )}
                      </div>
                      <Link href={`/dashboard/admin/users/${transaction.customer._id}`}>
                        <Button variant="outline" size="sm" className="text-xs gap-1">
                          <UserIcon className="h-3.5 w-3.5" />
                          <span>View Customer Profile</span>
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      Customer ID: <code className="font-mono text-foreground">{transaction.customerId}</code>
                    </div>
                  )}
                </div>
              </div>

              {/* Service & Appointment Context */}
              {transaction.appointment && (
                <div>
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Appointment & Service Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-xl border border-border bg-secondary/20 p-5 space-y-2">
                      <span className="text-muted-foreground block font-medium">Service Information:</span>
                      <div className="font-serif text-base font-semibold text-foreground">
                        {transaction.appointment.serviceName || "Salon Treatment"}
                      </div>
                      {transaction.appointment.service && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="capitalize">{transaction.appointment.service.category}</span>
                          <span>&bull;</span>
                          <span>{transaction.appointment.service.duration} mins</span>
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/20 p-5 space-y-2">
                      <span className="text-muted-foreground block font-medium">Appointment Schedule:</span>
                      <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{transaction.appointment.appointmentDate}</span>
                        </span>
                        <span className="text-muted-foreground">&bull;</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{transaction.appointment.timeSlot}</span>
                        </span>
                      </div>
                      <div className="text-muted-foreground capitalize">
                        Booking Status: <strong className="text-foreground">{transaction.appointment.status}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Gateway Metadata */}
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Payment Verification & Gateway Records
                </h2>
                <div className="rounded-xl border border-border bg-card p-5 divide-y divide-border text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Processor:</span>
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Stripe Checkout</span>
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Stripe Session Reference:</span>
                    <span className="font-mono text-foreground font-medium select-all">
                      {transaction.stripeSessionId || "N/A"}
                    </span>
                  </div>
                  {transaction.stripePaymentIntentId && (
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-muted-foreground">Payment Intent ID:</span>
                      <span className="font-mono text-foreground font-medium select-all">
                        {transaction.stripePaymentIntentId}
                      </span>
                    </div>
                  )}
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <span className="font-semibold capitalize text-foreground">
                      {transaction.status}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Recorded Timestamp:</span>
                    <span className="font-medium text-foreground">
                      {formatDate(transaction.createdAt)}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-muted-foreground">Last Reconciled:</span>
                    <span className="font-medium text-foreground">
                      {formatDate(transaction.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Read-Only Guarantee Note */}
              <div className="rounded-lg border border-border bg-secondary/30 p-4 flex items-start gap-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Financial records are immutable. Transactions reflect verified webhook events directly from Stripe and cannot be altered or manually edited through administrative controls.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-muted/20 p-6 flex items-center justify-between">
              <Link href="/dashboard/admin/transactions">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Ledger</span>
                </Button>
              </Link>
              <Link href="/dashboard/admin">
                <Button variant="outline" size="sm" className="text-xs">
                  <span>Admin Overview</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </AdminGuard>
  );
}
