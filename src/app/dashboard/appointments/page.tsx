"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Tag,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Filter,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CustomerGuard } from "@/components/booking/customer-guard";
import { CancelAppointmentDialog } from "@/components/booking/cancel-appointment-dialog";
import { SALON_TIME_SLOTS } from "@/components/booking/booking-form";
import {
  getMyAppointments,
  cancelMyAppointment,
} from "@/lib/appointments-api";
import type { Appointment, AppointmentStatus, PaginationMeta } from "@/types";

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cancellation modal state
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchAppointmentsData = async (page: number, status: "all" | AppointmentStatus) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getMyAppointments({
        page,
        limit: 10,
        status: status === "all" ? undefined : status,
      });
      setAppointments(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load appointments";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    async function loadData() {
      try {
        const response = await getMyAppointments({
          page: currentPage,
          limit: 10,
          status: statusFilter === "all" ? undefined : statusFilter,
        });
        if (isCurrent) {
          setAppointments(response.data || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const msg = err instanceof Error ? err.message : "Failed to load appointments";
          setErrorMessage(msg);
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCurrent = false;
    };
  }, [currentPage, statusFilter]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);

    try {
      await cancelMyAppointment(cancelTarget._id);
      setAppointments((prev) =>
        prev.map((app) => (app._id === cancelTarget._id ? { ...app, status: "cancelled" } : app))
      );
      toast.success("Appointment cancelled successfully");
      setCancelTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel appointment";
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  // Helper to get formatted slot label
  const formatSlot = (timeSlot: string) => {
    const found = SALON_TIME_SLOTS.find((s) => s.value === timeSlot);
    return found ? `${found.label} (${timeSlot})` : timeSlot;
  };

  // Helper to format creation date
  const formatCreatedAt = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <CustomerGuard>
      <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors font-medium"
          >
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">My Appointments</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground mb-3">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Customer Reservations</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              My Appointments
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
              View your upcoming salon sessions, track confirmation statuses, or manage cancellations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/services">
              <Button variant="primary" size="md" className="gap-2 shadow-xs">
                <Calendar className="h-4 w-4" />
                <span>Book New Treatment</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-border pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </span>
          {(["all", "pending", "confirmed", "cancelled"] as const).map((st) => {
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`rounded-full px-3.5 py-1 text-xs font-medium capitalize transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border border-border bg-card text-foreground hover:bg-secondary/60"
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>

        {/* Appointments Content */}
        <div className="mt-6">
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-6 animate-pulse space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-48 rounded bg-muted" />
                    <div className="h-6 w-20 rounded bg-muted" />
                  </div>
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-10 w-full rounded bg-muted/60" />
                </div>
              ))}
            </div>
          ) : errorMessage ? (
            /* Error State */
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700 mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="text-base font-semibold text-rose-900">
                Failed to Load Appointments
              </h2>
              <p className="mt-1 text-xs text-rose-800 max-w-sm mx-auto mb-6">
                {errorMessage}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAppointmentsData(currentPage, statusFilter)}
                className="gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </Button>
            </div>
          ) : appointments.length === 0 ? (
            /* Empty State */
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground mb-4">
                <Calendar className="h-7 w-7" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-foreground">
                {statusFilter === "all"
                  ? "No Appointments Booked Yet"
                  : `No ${statusFilter} Appointments`}
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {statusFilter === "all"
                  ? "You have not scheduled any salon sessions yet. Browse our signature treatments and reserve your preferred time."
                  : `There are no appointments matching the "${statusFilter}" filter. Try selecting another status or reset filters.`}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                {statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("all");
                      setCurrentPage(1);
                    }}
                  >
                    Reset Filter
                  </Button>
                ) : (
                  <Link href="/services">
                    <Button variant="primary" size="md" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Browse Salon Services</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* Appointments List */
            <div className="space-y-4">
              {appointments.map((app) => {
                const serviceName = app.service?.name || "Salon Treatment";
                const isPending = app.status === "pending";
                const isConfirmed = app.status === "confirmed";
                const isCancelled = app.status === "cancelled";

                return (
                  <div
                    key={app._id}
                    className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left Side: Thumbnail & Title */}
                      <div className="flex items-start gap-4">
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary/60">
                          {app.service?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={app.service.image}
                              alt={serviceName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Sparkles className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {app.service?.category && (
                              <span className="inline-flex items-center gap-1 rounded bg-accent/70 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground uppercase tracking-wider">
                                <Tag className="h-2.5 w-2.5" />
                                <span>{app.service.category}</span>
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              Booked on {formatCreatedAt(app.createdAt)}
                            </span>
                          </div>

                          <h3 className="font-serif text-lg font-semibold text-foreground">
                            {serviceName}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span>{app.appointmentDate}</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span>{formatSlot(app.timeSlot)}</span>
                            </span>
                            {app.service?.duration && (
                              <span>&bull; {app.service.duration} mins</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Status Badges & Price */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
                        <div className="text-left sm:text-right">
                          <p className="text-lg font-bold text-foreground">
                            ${app.servicePrice}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              app.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            Payment: {app.paymentStatus}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isConfirmed
                              ? "bg-emerald-100 text-emerald-800"
                              : isPending
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isConfirmed
                                ? "bg-emerald-600"
                                : isPending
                                ? "bg-amber-600"
                                : "bg-rose-600"
                            }`}
                          />
                          <span className="capitalize">{app.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Customer Message / Special Instructions if any */}
                    {app.message && (
                      <div className="mt-4 rounded-md border border-border/60 bg-secondary/30 p-3 text-xs text-muted-foreground flex items-start gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-foreground/60 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground">Special Request: </span>
                          <span className="text-foreground/80">{app.message}</span>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="mt-4 pt-3.5 border-t border-border flex items-center justify-between">
                      <div className="text-[11px] text-muted-foreground">
                        {isPending && (
                          <span className="text-amber-800">
                            Awaiting stylist confirmation. You may cancel if needed.
                          </span>
                        )}
                        {isConfirmed && (
                          <span className="text-emerald-800">
                            Confirmed reservation. Please arrive 10 minutes prior.
                          </span>
                        )}
                        {isCancelled && (
                          <span className="text-muted-foreground">
                            This appointment has been cancelled.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Cancel Button only active for pending appointments */}
                        {isPending && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCancelTarget(app)}
                            className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                          >
                            <span>Cancel Appointment</span>
                          </Button>
                        )}
                        {app.service?._id && (
                          <Link href={`/services/${app.service._id}`}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                            >
                              <span>View Service Details</span>
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <p>
                Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || isLoading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="gap-1 text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Cancel Confirmation Dialog */}
        <CancelAppointmentDialog
          isOpen={!!cancelTarget}
          appointment={cancelTarget}
          isCancelling={isCancelling}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelTarget(null)}
        />
      </div>
    </CustomerGuard>
  );
}
