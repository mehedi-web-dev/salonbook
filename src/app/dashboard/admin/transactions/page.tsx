"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { getAdminTransactions } from "@/lib/admin-api";
import type { AdminTransaction, PaginationMeta, TransactionStatus } from "@/types";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | TransactionStatus>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTransactions = async (
    page: number,
    status: "all" | TransactionStatus,
    search: string,
    start: string,
    end: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getAdminTransactions({
        page,
        limit: 10,
        status,
        search,
        startDate: start || undefined,
        endDate: end || undefined,
      });
      setTransactions(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load transactions";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    const fetchList = async () => {
      try {
        const response = await getAdminTransactions({
          page: currentPage,
          limit: 10,
          status: statusFilter,
          search: searchQuery,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        if (isCurrent) {
          setTransactions(response.data || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const msg = err instanceof Error ? err.message : "Failed to load transactions";
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
  }, [currentPage, statusFilter, searchQuery, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

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
            <span>Review</span>
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
    <AdminGuard>
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
              <Link href="/dashboard/admin" className="hover:text-foreground transition-colors">
                Admin Overview
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-semibold">Transactions</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900 mb-3">
              <CreditCard className="h-3.5 w-3.5 text-rose-700" />
              <span>Billing & Payments Audit</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Payment Transactions
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Auditable read-only ledger of Stripe Checkout settlements, customer charges, and payment verification events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                loadTransactions(currentPage, statusFilter, searchQuery, startDate, endDate)
              }
              disabled={isLoading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Ledger</span>
            </Button>
            <Link href="/dashboard/admin">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span>Overview</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search customer, email, or Stripe ID..."
                  className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Button type="submit" variant="primary" size="sm" className="text-xs">
                Search
              </Button>
            </form>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Statuses
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("paid");
                  setCurrentPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === "paid"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("failed");
                  setCurrentPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === "failed"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Failed
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("reconciliation_required");
                  setCurrentPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === "reconciliation_required"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Review
              </button>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-wrap items-center gap-3 text-xs bg-card p-3 rounded-lg border border-border">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Date Range:</span>
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="startDate" className="text-muted-foreground">From:</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="endDate" className="text-muted-foreground">To:</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {(searchQuery || statusFilter !== "all" || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
              >
                Reset All Filters
              </Button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-6">
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
                    Failed to Load Payment Transactions
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-rose-800">
                    {errorMessage}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      loadTransactions(currentPage, statusFilter, searchQuery, startDate, endDate)
                    }
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
                  <div className="h-8 w-20 rounded bg-muted/40" />
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-4">Reference & Treatment</th>
                      <th scope="col" className="px-6 py-4">Customer</th>
                      <th scope="col" className="px-6 py-4">Schedule</th>
                      <th scope="col" className="px-6 py-4">Amount</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4">Timestamp</th>
                      <th scope="col" className="px-6 py-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((tx) => (
                      <tr
                        key={tx._id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">
                            {tx.appointment?.serviceName || "Salon Treatment"}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            ID: {tx._id.slice(-8).toUpperCase()}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs">
                          {tx.customer ? (
                            <div>
                              <div className="font-medium text-foreground">{tx.customer.name}</div>
                              <div className="text-muted-foreground truncate max-w-[140px]">
                                {tx.customer.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Customer ID: {tx.customerId.slice(-6)}</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {tx.appointment ? (
                            <div>
                              <div className="font-medium text-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-primary" />
                                <span>{tx.appointment.appointmentDate}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{tx.appointment.timeSlot}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="italic">N/A</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-serif text-base font-semibold text-foreground">
                            ${Number(tx.amount).toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1 uppercase">
                            {tx.currency || "USD"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {renderStatusBadge(tx.status)}
                        </td>

                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/admin/transactions/${tx._id}`}>
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                              <Eye className="h-3 w-3 text-primary" />
                              <span>Details</span>
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                      <div>
                        <h3 className="font-serif text-base font-semibold text-foreground">
                          {tx.appointment?.serviceName || "Salon Treatment"}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono">
                          Ref: #{tx._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      {renderStatusBadge(tx.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Customer:</span>
                        <span className="font-medium text-foreground">
                          {tx.customer?.name || "Client"}
                        </span>
                        <span className="text-muted-foreground block text-[11px] truncate">
                          {tx.customer?.email}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground block">Amount:</span>
                        <span className="font-serif text-base font-semibold text-foreground">
                          ${Number(tx.amount).toFixed(2)}{" "}
                          <span className="text-xs font-sans text-muted-foreground uppercase">
                            {tx.currency || "USD"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {tx.appointment && (
                      <div className="rounded-md bg-secondary/30 p-2.5 text-xs text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-foreground font-medium">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{tx.appointment.appointmentDate}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-foreground font-medium">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>{tx.appointment.timeSlot}</span>
                        </span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
                      <span>{formatDate(tx.createdAt)}</span>
                      <Link href={`/dashboard/admin/transactions/${tx._id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <Eye className="h-3 w-3" />
                          <span>View Details</span>
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
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground mb-4">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-foreground">
                No Transactions Found
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {searchQuery || statusFilter !== "all" || startDate || endDate
                  ? "No payment records match your selected filter criteria. Try resetting your search filters."
                  : "No customer payments have been processed yet through Stripe Checkout."}
              </p>
              {(searchQuery || statusFilter !== "all" || startDate || endDate) && (
                <div className="mt-5">
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Reset Filter Criteria
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
