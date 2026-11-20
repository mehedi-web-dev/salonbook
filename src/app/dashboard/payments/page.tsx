"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerGuard } from "@/components/booking/customer-guard";
import { getMyPayments } from "@/lib/payments-api";
import type { PaymentTransaction, PaginationMeta, TransactionStatus } from "@/types";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshPayments = async (page: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getMyPayments({ page, limit: 10 });
      setPayments(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load payment history";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      try {
        const response = await getMyPayments({ page: currentPage, limit: 10 });
        if (isCurrent) {
          setPayments(response.data || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const message =
            err instanceof Error ? err.message : "Failed to load payment history";
          setErrorMessage(message);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      isCurrent = false;
    };
  }, [currentPage]);

  const renderStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-3 w-3" />
            <span>Paid</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
            <XCircle className="h-3 w-3" />
            <span>Failed</span>
          </span>
        );
      case "reconciliation_required":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <AlertTriangle className="h-3 w-3" />
            <span>Under Review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground uppercase">
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
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-semibold">Payment History</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-medium text-accent-foreground mb-3">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Customer Billing</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Payment History
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Review all completed transactions, digital receipts, and payment records for your salon appointments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/appointments">
              <Button variant="outline" size="sm">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                <span>My Appointments</span>
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="primary" size="sm">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                <span>Book Service</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-rose-300 bg-rose-50/90 p-5 text-rose-900 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-rose-900">
                    Failed to Load Payment Records
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-rose-800">
                    {errorMessage}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshPayments(currentPage)}
                    className="mt-3 gap-1.5 text-xs border-rose-300 text-rose-900 hover:bg-rose-100"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Try Again</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-10 w-48 rounded bg-muted/40 animate-pulse" />
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-5 space-y-3 animate-pulse"
                >
                  <div className="flex justify-between">
                    <div className="h-4 w-40 rounded bg-muted/60" />
                    <div className="h-4 w-20 rounded bg-muted/60" />
                  </div>
                  <div className="h-3 w-64 rounded bg-muted/40" />
                </div>
              ))}
            </div>
          ) : payments.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-card shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-4">Treatment & Details</th>
                      <th scope="col" className="px-6 py-4">Appointment Schedule</th>
                      <th scope="col" className="px-6 py-4">Amount</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4">Transaction Date</th>
                      <th scope="col" className="px-6 py-4 text-right">Receipt / Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">
                            {payment.service?.name || "Salon Treatment"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Ref: {payment._id.slice(-8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {payment.appointment ? (
                            <div className="space-y-0.5">
                              <div className="font-medium text-foreground flex items-center gap-1.5">
                                <Calendar className="h-3 w-3 text-primary" />
                                <span>{payment.appointment.appointmentDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{payment.appointment.timeSlot}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="italic text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-serif text-base font-semibold text-foreground">
                            ${Number(payment.amount).toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1 uppercase">
                            {payment.currency || "USD"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {renderStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/payments/${payment._id}`}>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                              <span>View Receipt</span>
                              <ExternalLink className="h-3 w-3 text-primary" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                      <div>
                        <h3 className="font-serif text-base font-semibold text-foreground">
                          {payment.service?.name || "Salon Treatment"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Ref: {payment._id.slice(-8)}
                        </p>
                      </div>
                      {renderStatusBadge(payment.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Amount:</span>
                        <span className="font-serif text-base font-semibold text-foreground">
                          ${Number(payment.amount).toFixed(2)}{" "}
                          <span className="text-xs font-sans text-muted-foreground uppercase">
                            {payment.currency || "USD"}
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Transaction Date:</span>
                        <span className="font-medium text-foreground">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {payment.appointment && (
                      <div className="rounded-md bg-secondary/30 p-2.5 text-xs text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-foreground font-medium">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{payment.appointment.appointmentDate}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-foreground font-medium">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>{payment.appointment.timeSlot}</span>
                        </span>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link href={`/dashboard/payments/${payment._id}`} className="block w-full">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                          <Receipt className="h-3.5 w-3.5 text-primary" />
                          <span>View Full Payment Details</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                  <p className="text-xs text-muted-foreground">
                    Showing Page <strong className="text-foreground">{pagination.page}</strong> of{" "}
                    <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.total} total transactions)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage <= 1 || isLoading}
                      className="gap-1 text-xs"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage >= pagination.totalPages || isLoading}
                      className="gap-1 text-xs"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground mb-4">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-foreground">
                No Payment Records Found
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                You haven&apos;t made any online appointment payments yet. When your salon appointments are confirmed, you can securely pay for them via Stripe.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/dashboard/appointments">
                  <Button variant="primary" size="md">
                    <span>View Active Appointments</span>
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="md">
                    Browse Services
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomerGuard>
  );
}
