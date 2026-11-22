"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { getAdminTransactions } from "@/lib/admin-api";
import type { AdminTransaction, TransactionStatus } from "@/types";
import { filterTransactions } from "@/lib/filter-utils";
import {
  AdminFilterToolbar,
  type ActiveFilterTag,
} from "@/components/admin/admin-filter-toolbar";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TransactionStatus>("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount_desc" | "amount_asc">("newest");

  const loadTransactions = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getAdminTransactions({ limit: 100 });
      setTransactions(response.data || []);
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
        const response = await getAdminTransactions({ limit: 100 });
        if (isCurrent) {
          setTransactions(response.data || []);
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
  }, []);

  // Compute available unique currencies dynamically
  const uniqueCurrencies = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.currency) set.add(tx.currency.toLowerCase());
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Combined filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, {
      search: searchQuery,
      status: statusFilter,
      currency: currencyFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
    });
  }, [transactions, searchQuery, statusFilter, currencyFilter, startDate, endDate, sortBy]);

  // Construct active filter tags for one-click removal
  const activeTags = useMemo(() => {
    const tags: ActiveFilterTag[] = [];
    if (statusFilter !== "all") {
      const statusLabel =
        statusFilter === "reconciliation_required" ? "Review" : statusFilter.toUpperCase();
      tags.push({
        id: "status",
        label: "Status",
        value: statusLabel,
        onRemove: () => setStatusFilter("all"),
      });
    }
    if (currencyFilter !== "all") {
      tags.push({
        id: "currency",
        label: "Currency",
        value: currencyFilter.toUpperCase(),
        onRemove: () => setCurrencyFilter("all"),
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
      const sortLabels: Record<string, string> = {
        oldest: "Oldest First",
        amount_desc: "Amount: High to Low",
        amount_asc: "Amount: Low to High",
      };
      tags.push({
        id: "sort",
        label: "Sort",
        value: sortLabels[sortBy] || sortBy,
        onRemove: () => setSortBy("newest"),
      });
    }
    return tags;
  }, [statusFilter, currencyFilter, startDate, endDate, sortBy]);

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCurrencyFilter("all");
    setStartDate("");
    setEndDate("");
    setSortBy("newest");
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
              onClick={loadTransactions}
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

        {/* Advanced Filter Toolbar */}
        <div className="mt-8">
          <AdminFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search customer, email, service, or Stripe ID..."
            activeTags={activeTags}
            onClearAll={handleClearAllFilters}
            totalCount={transactions.length}
            filteredCount={filteredTransactions.length}
            itemName="transactions"
          >
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | TransactionStatus)}
              aria-label="Filter by payment status"
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="reconciliation_required">Review</option>
            </select>

            {/* Currency Dropdown */}
            {uniqueCurrencies.length > 0 && (
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                aria-label="Filter by currency"
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="all">All Currencies</option>
                {uniqueCurrencies.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
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

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "newest" | "oldest" | "amount_desc" | "amount_asc"
                )
              }
              aria-label="Sort transactions"
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
            </select>
          </AdminFilterToolbar>
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
                    onClick={loadTransactions}
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
          ) : filteredTransactions.length > 0 ? (
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
                    {filteredTransactions.map((tx) => (
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
                {filteredTransactions.map((tx) => (
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

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </span>
                      <Link href={`/dashboard/admin/transactions/${tx._id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <Eye className="h-3 w-3 text-primary" />
                          <span>Details</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-xs">
              <CreditCard className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
              <h2 className="font-serif text-xl font-semibold text-foreground">
                No Transactions Match Filters
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                No Stripe payment transactions match your active search and filter criteria. Try adjusting or resetting your filters.
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
