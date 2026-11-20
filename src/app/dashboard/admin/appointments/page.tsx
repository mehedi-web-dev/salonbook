"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { getAdminAppointments, updateAdminAppointmentStatus } from "@/lib/admin-api";
import type { Appointment, AppointmentStatus, PaginationMeta } from "@/types";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAppointments = async (page: number, status: "all" | AppointmentStatus) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getAdminAppointments({
        page,
        limit: 10,
        status,
      });
      setAppointments(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load salon appointments";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    const fetchList = async () => {
      try {
        const response = await getAdminAppointments({
          page: currentPage,
          limit: 10,
          status: statusFilter,
        });
        if (isCurrent) {
          setAppointments(response.data || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const msg = err instanceof Error ? err.message : "Failed to load salon appointments";
          setErrorMessage(msg);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };
    fetchList();
    return () => {
      isCurrent = false;
    };
  }, [currentPage, statusFilter]);

  const handleUpdateStatus = async (
    id: string,
    newStatus: "pending" | "confirmed" | "cancelled"
  ) => {
    setUpdatingId(id);
    try {
      await updateAdminAppointmentStatus(id, newStatus);
      toast.success(`Appointment status updated to "${newStatus}"`);
      loadAppointments(currentPage, statusFilter);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update appointment status";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-3 w-3" />
            <span>Confirmed</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
            <XCircle className="h-3 w-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/dashboard/admin" className="hover:text-foreground transition-colors">
                Admin Overview
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-semibold">Appointments</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900 mb-3">
              <Calendar className="h-3.5 w-3.5 text-rose-700" />
              <span>Salon Schedule Management</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Client Appointments
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Monitor treatment reservations, review stylist schedules, and confirm or update customer booking statuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAppointments(currentPage, statusFilter)}
              disabled={isLoading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Schedule</span>
            </Button>
            <Link href="/dashboard/admin">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span>Overview</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Bookings
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("pending");
                setCurrentPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("confirmed");
                setCurrentPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "confirmed"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Confirmed
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("cancelled");
                setCurrentPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "cancelled"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-6">
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-rose-300 bg-rose-50/90 p-5 text-rose-900 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-rose-900">
                    Failed to Load Appointments
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-rose-800">{errorMessage}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAppointments(currentPage, statusFilter)}
                    className="mt-3 gap-1.5 text-xs border-rose-300 text-rose-900 hover:bg-rose-100"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Try Again</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-5 animate-pulse flex items-center justify-between"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-48 rounded bg-muted/60" />
                    <div className="h-3 w-64 rounded bg-muted/40" />
                  </div>
                  <div className="h-8 w-24 rounded bg-muted/40" />
                </div>
              ))}
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-4">Treatment</th>
                      <th scope="col" className="px-6 py-4">Schedule</th>
                      <th scope="col" className="px-6 py-4">Price & Payment</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {appointments.map((app) => (
                      <tr key={app._id} className="transition-colors hover:bg-muted/20">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">
                            {app.service?.name || "Salon Treatment"}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            Ref: #{app._id.slice(-8).toUpperCase()}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs">
                          <div className="font-medium text-foreground flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>{app.appointmentDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{app.timeSlot}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs">
                          <div className="font-serif text-base font-bold text-foreground">
                            ${app.servicePrice}
                          </div>
                          <span
                            className={`inline-block text-[10px] font-bold uppercase rounded px-1.5 py-0.2 mt-0.5 ${
                              app.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {app.paymentStatus}
                          </span>
                        </td>

                        <td className="px-6 py-4">{renderStatusBadge(app.status)}</td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {app.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updatingId === app._id}
                                onClick={() => handleUpdateStatus(app._id, "confirmed")}
                                className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                              >
                                {updatingId === app._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Confirm"
                                )}
                              </Button>
                            )}

                            {app.status !== "cancelled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updatingId === app._id}
                                onClick={() => handleUpdateStatus(app._id, "cancelled")}
                                className="text-xs border-rose-300 text-rose-800 hover:bg-rose-50"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {appointments.map((app) => (
                  <div
                    key={app._id}
                    className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                      <div>
                        <h3 className="font-serif text-base font-semibold text-foreground">
                          {app.service?.name || "Salon Treatment"}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono">
                          Ref: #{app._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      {renderStatusBadge(app.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Schedule:</span>
                        <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3 text-primary" />
                          <span>{app.appointmentDate}</span>
                        </span>
                        <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-primary" />
                          <span>{app.timeSlot}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground block">Pricing:</span>
                        <span className="font-serif text-base font-bold text-foreground">
                          ${app.servicePrice}
                        </span>
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground mt-0.5">
                          Payment: {app.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {app.status === "pending" && (
                      <div className="pt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingId === app._id}
                          onClick={() => handleUpdateStatus(app._id, "confirmed")}
                          className="flex-1 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                        >
                          Confirm Reservation
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingId === app._id}
                          onClick={() => handleUpdateStatus(app._id, "cancelled")}
                          className="flex-1 text-xs border-rose-300 text-rose-800 hover:bg-rose-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                  <p className="text-xs text-muted-foreground">
                    Showing Page <strong className="text-foreground">{pagination.page}</strong> of{" "}
                    <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.total} total bookings)
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
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-xs">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
              <h2 className="font-serif text-xl font-semibold text-foreground">
                No Appointments Recorded
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                No customer bookings match your selected status filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
