"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Sparkles,
  Calendar,
  CreditCard,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  Tag,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { getAdminDashboardStats } from "@/lib/admin-api";
import type { AdminDashboardStats } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load dashboard statistics";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      try {
        const data = await getAdminDashboardStats();
        if (isCurrent) setStats(data);
      } catch (err: unknown) {
        if (isCurrent) {
          const message =
            err instanceof Error ? err.message : "Failed to load dashboard statistics";
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
  }, []);

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
              <span className="text-foreground font-semibold">Admin Overview</span>
            </li>
          </ol>
        </nav>

        {/* Header / Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900 mb-3">
              <Shield className="h-3.5 w-3.5 text-rose-700" />
              <span>Administrative Console</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Salon Operations & Analytics
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Real-time operational metrics across registered customers, treatments catalog, appointment reservations, and verified Stripe transactions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={isLoading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </Button>
            <Link href="/dashboard/profile">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <UserIcon className="h-3.5 w-3.5" />
                <span>My Profile</span>
              </Button>
            </Link>
            <Link href="/dashboard/admin/services">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Manage Services</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 space-y-8">
          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-rose-300 bg-rose-50/90 p-5 text-rose-900 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-rose-900">
                    Failed to Load Administrative Statistics
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-rose-800">
                    {errorMessage}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchStats}
                    className="mt-3 gap-1.5 text-xs border-rose-300 text-rose-900 hover:bg-rose-100"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Retry Connection</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Nav Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/dashboard/admin/users"
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/60 p-2 text-accent-foreground">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-3">
                <div className="text-sm font-semibold text-foreground">Customers</div>
                <div className="text-xs text-muted-foreground">Accounts & status</div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/services"
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/60 p-2 text-accent-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-3">
                <div className="text-sm font-semibold text-foreground">Services</div>
                <div className="text-xs text-muted-foreground">Catalog & pricing</div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/appointments"
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/60 p-2 text-accent-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-3">
                <div className="text-sm font-semibold text-foreground">Appointments</div>
                <div className="text-xs text-muted-foreground">Bookings & schedules</div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/transactions"
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/60 p-2 text-accent-foreground">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-3">
                <div className="text-sm font-semibold text-foreground">Transactions</div>
                <div className="text-xs text-muted-foreground">Payments & Stripe logs</div>
              </div>
            </Link>
          </div>

          {/* Skeletons vs Data Cards */}
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-muted/40 border border-border p-5" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                <div className="h-64 rounded-xl bg-muted/40 border border-border" />
                <div className="h-64 rounded-xl bg-muted/40 border border-border" />
              </div>
            </div>
          ) : stats ? (
            <>
              {/* Top Operational Metrics KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Customers Metric */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Customers
                    </span>
                    <div className="rounded-md bg-accent/60 p-1.5 text-accent-foreground">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 font-serif text-3xl font-bold text-foreground">
                    {stats.customers.total}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs border-t border-border pt-2 text-muted-foreground">
                    <span className="flex items-center gap-1 text-emerald-800 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{stats.customers.active} Active</span>
                    </span>
                    <span className="flex items-center gap-1 text-rose-800 font-medium">
                      <XCircle className="h-3 w-3" />
                      <span>{stats.customers.blocked} Blocked</span>
                    </span>
                  </div>
                </div>

                {/* Services Metric */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Services Catalog
                    </span>
                    <div className="rounded-md bg-accent/60 p-1.5 text-accent-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 font-serif text-3xl font-bold text-foreground">
                    {stats.services.total}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs border-t border-border pt-2 text-muted-foreground">
                    <span className="flex items-center gap-1 text-emerald-800 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{stats.services.active} Available</span>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground font-medium">
                      <Tag className="h-3 w-3" />
                      <span>{stats.services.inactive} Inactive</span>
                    </span>
                  </div>
                </div>

                {/* Appointments Metric */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Appointments
                    </span>
                    <div className="rounded-md bg-accent/60 p-1.5 text-accent-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 font-serif text-3xl font-bold text-foreground">
                    {stats.appointments.total}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] border-t border-border pt-2 text-muted-foreground">
                    <span className="text-amber-800 font-medium">
                      {stats.appointments.pending} Pending
                    </span>
                    <span className="text-emerald-800 font-medium">
                      {stats.appointments.confirmed} Confirmed
                    </span>
                    <span className="text-rose-800 font-medium">
                      {stats.appointments.cancelled} Cancelled
                    </span>
                  </div>
                </div>

                {/* Transactions Metric */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Transactions
                    </span>
                    <div className="rounded-md bg-accent/60 p-1.5 text-accent-foreground">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 font-serif text-3xl font-bold text-foreground">
                    {stats.transactions.total}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] border-t border-border pt-2 text-muted-foreground">
                    <span className="text-emerald-800 font-medium">
                      {stats.transactions.paid} Paid
                    </span>
                    <span className="text-rose-800 font-medium">
                      {stats.transactions.failed} Failed
                    </span>
                    <span className="text-amber-800 font-medium">
                      {stats.transactions.reconciliationRequired} Review
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Revenue Section — Currency Isolated */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-semibold text-foreground">
                        Verified Paid Revenue
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Reconciled revenue from verified Stripe transactions, isolated strictly by currency.
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Stripe Webhook Verified</span>
                  </div>
                </div>

                <div className="mt-6">
                  {stats.revenue.byCurrency && stats.revenue.byCurrency.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {stats.revenue.byCurrency.map((rev) => {
                        const isUsd = rev.currency.toLowerCase() === "usd";
                        const isEur = rev.currency.toLowerCase() === "eur";
                        const symbol = isUsd ? "$" : isEur ? "€" : rev.currency.toUpperCase() + " ";

                        return (
                          <div
                            key={rev.currency}
                            className="rounded-xl border border-border bg-secondary/20 p-5 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between">
                              <span className="rounded bg-background px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-foreground border border-border">
                                {rev.currency.toUpperCase()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {rev.count} {rev.count === 1 ? "payment" : "payments"}
                              </span>
                            </div>

                            <div className="mt-4">
                              <span className="text-xs text-muted-foreground block font-medium">
                                Total Paid Volume
                              </span>
                              <div className="mt-1 font-serif text-3xl font-bold text-foreground">
                                {symbol}
                                {Number(rev.totalAmount).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                      <DollarSign className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                      <p className="text-sm font-medium text-foreground">No verified revenue recorded yet</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        When customers complete payments via Stripe Checkout and the webhook verification processes, revenue balances will display here.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Operational Breakdown Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointment Pipeline Status */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="font-serif text-base font-semibold text-foreground">
                        Appointment Pipeline
                      </h3>
                    </div>
                    <Link
                      href="/dashboard/admin/appointments"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Manage All</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-medium text-foreground">Pending Reservations</span>
                      </div>
                      <span className="font-serif text-base font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        {stats.appointments.pending}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-foreground">Confirmed Treatments</span>
                      </div>
                      <span className="font-serif text-base font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        {stats.appointments.confirmed}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
                      <div className="flex items-center gap-2.5">
                        <XCircle className="h-4 w-4 text-rose-600" />
                        <span className="text-xs font-medium text-foreground">Cancelled Reservations</span>
                      </div>
                      <span className="font-serif text-base font-bold text-rose-900 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        {stats.appointments.cancelled}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transaction Health Status */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h3 className="font-serif text-base font-semibold text-foreground">
                        Transaction Health
                      </h3>
                    </div>
                    <Link
                      href="/dashboard/admin/transactions"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>View Transactions</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-foreground">Successfully Settled</span>
                      </div>
                      <span className="font-serif text-base font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        {stats.transactions.paid}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
                      <div className="flex items-center gap-2.5">
                        <XCircle className="h-4 w-4 text-rose-600" />
                        <span className="text-xs font-medium text-foreground">Failed Authorizations</span>
                      </div>
                      <span className="font-serif text-base font-bold text-rose-900 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        {stats.transactions.failed}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-medium text-foreground">Reconciliation Required</span>
                      </div>
                      <span className="font-serif text-base font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        {stats.transactions.reconciliationRequired}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </AdminGuard>
  );
}
