"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  User as UserIcon,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { getAdminAppointments, updateAdminAppointmentStatus } from "@/lib/admin-api";
import type { Appointment, AppointmentStatus, PaymentStatus } from "@/types";
import { filterAppointments } from "@/lib/filter-utils";
import {
  AdminFilterToolbar,
  type ActiveFilterTag,
} from "@/components/admin/admin-filter-toolbar";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const loadAppointments = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getAdminAppointments({ limit: 100 });
      setAppointments(response.data || []);
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
        const response = await getAdminAppointments({ limit: 100 });
        if (isCurrent) {
          setAppointments(response.data || []);
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
  }, []);

  // Compute unique services list from appointments for dropdown
  const uniqueServices = useMemo(() => {
    const map = new Map<string, string>();
    appointments.forEach((app) => {
      if (app.service?.name) {
        map.set(app.service.name, app.service.name);
      }
    });
    return Array.from(map.values()).sort();
  }, [appointments]);

  // Combined filtered appointments
  const filteredAppointments = useMemo(() => {
    return filterAppointments(appointments, {
      search: searchQuery,
      status: statusFilter,
      paymentStatus: paymentFilter,
      serviceId: serviceFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
    });
  }, [appointments, searchQuery, statusFilter, paymentFilter, serviceFilter, startDate, endDate, sortBy]);

  // Construct active filter tags for one-click removal
  const activeTags = useMemo(() => {
    const tags: ActiveFilterTag[] = [];
    if (statusFilter !== "all") {
      tags.push({
        id: "status",
        label: "Status",
        value: statusFilter.toUpperCase(),
        onRemove: () => setStatusFilter("all"),
      });
    }
    if (paymentFilter !== "all") {
      tags.push({
        id: "payment",
        label: "Payment",
        value: paymentFilter.toUpperCase(),
        onRemove: () => setPaymentFilter("all"),
      });
    }
    if (serviceFilter !== "all") {
      tags.push({
        id: "service",
        label: "Service",
        value: serviceFilter,
        onRemove: () => setServiceFilter("all"),
      });
    }
    if (startDate) {
      tags.push({
        id: "startDate",
        label: "From",
        value: startDate,
        onRemove: () => setStartDate(""),
      });
    }
    if (endDate) {
      tags.push({
        id: "endDate",
        label: "To",
        value: endDate,
        onRemove: () => setEndDate(""),
      });
    }
    if (sortBy !== "newest") {
      tags.push({
        id: "sort",
        label: "Sort",
        value: "Oldest First",
        onRemove: () => setSortBy("newest"),
      });
    }
    return tags;
  }, [statusFilter, paymentFilter, serviceFilter, startDate, endDate, sortBy]);

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setServiceFilter("all");
    setStartDate("");
    setEndDate("");
    setSortBy("newest");
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: "pending" | "confirmed" | "cancelled"
  ) => {
    setUpdatingId(id);
    try {
      await updateAdminAppointmentStatus(id, newStatus);
      toast.success(`Appointment status updated to "${newStatus}"`);
      setAppointments((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
      );
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
              onClick={loadAppointments}
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

        {/* Advanced Filter Toolbar */}
        <div className="mt-8">
          <AdminFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search customer name, email, service..."
            activeTags={activeTags}
            onClearAll={handleClearAllFilters}
            totalCount={appointments.length}
            filteredCount={filteredAppointments.length}
            itemName="appointments"
          >
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | AppointmentStatus)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              aria-label="Filter by appointment status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Status Dropdown */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as "all" | PaymentStatus)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              aria-label="Filter by payment status"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>

            {/* Service Filter Dropdown */}
            {uniqueServices.length > 0 && (
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all max-w-[160px] truncate"
                aria-label="Filter by service"
              >
                <option value="all">All Services</option>
                {uniqueServices.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            )}

            {/* Date Range Inputs */}
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Start date"
                className="rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                aria-label="Start date filter"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="End date"
                className="rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                aria-label="End date filter"
              />
            </div>

            {/* Sort Order Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              aria-label="Sort appointments"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </AdminFilterToolbar>
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
                    onClick={loadAppointments}
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
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Appointments Table */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-4">Treatment</th>
                      <th scope="col" className="px-6 py-4">Customer</th>
                      <th scope="col" className="px-6 py-4">Schedule</th>
                      <th scope="col" className="px-6 py-4">Price & Payment</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAppointments.map((app) => (
                      <tr key={app._id} className="transition-colors hover:bg-muted/20">
                        {/* Treatment Column */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">
                            {app.service?.name || "Salon Treatment"}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            Ref: #{app._id.slice(-8).toUpperCase()}
                          </div>
                        </td>

                        {/* Customer Column */}
                        <td className="px-6 py-4 text-xs">
                          <div className="font-medium text-foreground flex items-center gap-1.5">
                            <UserIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[150px]">
                              {app.customer?.name || "Salon Client"}
                            </span>
                          </div>
                          <div className="text-muted-foreground mt-0.5 truncate max-w-[150px]">
                            {app.customer?.email || "No email on record"}
                          </div>
                        </td>

                        {/* Schedule Column */}
                        <td className="px-6 py-4 text-xs">
                          <div className="font-medium text-foreground flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{app.appointmentDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>{app.timeSlot}</span>
                          </div>
                        </td>

                        {/* Price & Payment Column */}
                        <td className="px-6 py-4 text-xs">
                          <div className="font-serif text-base font-bold text-foreground">
                            ${app.servicePrice}
                          </div>
                          <span
                            className={`inline-block text-[10px] font-bold uppercase rounded px-1.5 py-0.5 mt-0.5 ${
                              app.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {app.paymentStatus}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td className="px-6 py-4">{renderStatusBadge(app.status)}</td>

                        {/* Actions Column */}
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

              {/* Mobile Appointment Cards */}
              <div className="md:hidden space-y-3">
                {filteredAppointments.map((app) => (
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
                        <span className="text-muted-foreground block">Customer:</span>
                        <span className="font-medium text-foreground flex items-center gap-1 mt-0.5 truncate">
                          <UserIcon className="h-3 w-3 text-primary shrink-0" />
                          <span>{app.customer?.name || "Salon Client"}</span>
                        </span>
                        <span className="text-muted-foreground block mt-0.5 truncate text-[11px]">
                          {app.customer?.email || "No email"}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground block">Schedule:</span>
                        <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3 text-primary shrink-0" />
                          <span>{app.appointmentDate}</span>
                        </span>
                        <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-primary shrink-0" />
                          <span>{app.timeSlot}</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-muted-foreground mr-1.5">Price:</span>
                        <span className="font-serif text-base font-bold text-foreground">
                          ${app.servicePrice}
                        </span>
                        <span
                          className={`ml-2 inline-block text-[10px] font-bold uppercase rounded px-1.5 py-0.5 ${
                            app.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {app.paymentStatus}
                        </span>
                      </div>

                      {app.status === "pending" && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updatingId === app._id}
                            onClick={() => handleUpdateStatus(app._id, "confirmed")}
                            className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 h-7 px-2.5"
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updatingId === app._id}
                            onClick={() => handleUpdateStatus(app._id, "cancelled")}
                            className="text-xs border-rose-300 text-rose-800 hover:bg-rose-50 h-7 px-2.5"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-xs">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
              <h2 className="font-serif text-xl font-semibold text-foreground">
                No Appointments Match Filters
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                No client bookings match your active search and filter criteria. Try adjusting or clearing your filters to see more results.
              </p>
              <div className="mt-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear All Filters</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
