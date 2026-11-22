"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Sparkles,
  Calendar,
  CreditCard,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Tag,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import {
  getAdminDashboardStats,
  getAdminAppointments,
  getAdminTransactions,
} from "@/lib/admin-api";
import type { AdminDashboardStats, Appointment, AdminTransaction } from "@/types";
import {
  groupAppointmentsByMonth,
  formatCurrency,
} from "@/lib/analytics-utils";
import { StatCard } from "@/components/analytics/stat-card";
import { StatusDistributionChart } from "@/components/analytics/status-distribution-chart";
import { MonthlyTrendChart } from "@/components/analytics/monthly-trend-chart";
import { RevenueOverviewChart } from "@/components/analytics/revenue-overview-chart";
import { RecentActivityList } from "@/components/analytics/recent-activity-list";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [statsRes, appRes, txRes] = await Promise.allSettled([
        getAdminDashboardStats(),
        getAdminAppointments({ limit: 100 }),
        getAdminTransactions({ limit: 5 }),
      ]);

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value);
      } else {
        const message =
          statsRes.reason instanceof Error
            ? statsRes.reason.message
            : "Failed to load dashboard statistics";
        setErrorMessage(message);
      }

      if (appRes.status === "fulfilled" && appRes.value?.data) {
        setAppointments(appRes.value.data);
      }

      if (txRes.status === "fulfilled" && txRes.value?.data) {
        setTransactions(txRes.value.data);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load administrative statistics";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    const loadInitial = async () => {
      try {
        const [statsRes, appRes, txRes] = await Promise.allSettled([
          getAdminDashboardStats(),
          getAdminAppointments({ limit: 100 }),
          getAdminTransactions({ limit: 5 }),
        ]);

        if (isCurrent) {
          if (statsRes.status === "fulfilled") {
            setStats(statsRes.value);
          } else {
            const message =
              statsRes.reason instanceof Error
                ? statsRes.reason.message
                : "Failed to load dashboard statistics";
            setErrorMessage(message);
          }

          if (appRes.status === "fulfilled" && appRes.value?.data) {
            setAppointments(appRes.value.data);
          }

          if (txRes.status === "fulfilled" && txRes.value?.data) {
            setTransactions(txRes.value.data);
          }
        }
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

    loadInitial();

    return () => {
      isCurrent = false;
    };
  }, []);

  // Compute monthly trends from real appointment records
  const monthlyBuckets = groupAppointmentsByMonth(appointments);

  // Map recent appointments for the activity list
  const recentAppointmentItems = appointments.slice(0, 5).map((app) => ({
    id: app._id,
    title: app.service?.name || "Salon Treatment",
    subtitle: `${app.appointmentDate} at ${app.timeSlot}`,
    timestamp: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : app.appointmentDate,
    amount: `$${app.servicePrice}`,
    status: app.status,
    badgeLabel: app.status,
    href: "/dashboard/admin/appointments",
  }));

  // Map recent transactions for the activity list
  const recentTransactionItems = transactions.slice(0, 5).map((tx) => ({
    id: tx._id,
    title: tx.customer?.name || tx.customer?.email || "Customer Checkout",
    subtitle: tx.appointment?.serviceName || "Service Payment",
    timestamp: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "Recent",
    amount: formatCurrency(tx.amount, tx.currency),
    status: tx.status,
    badgeLabel: tx.status === "paid" ? "Paid" : tx.status === "failed" ? "Failed" : "Review",
    href: "/dashboard/admin/transactions",
  }));

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
              onClick={fetchDashboardData}
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
                    onClick={fetchDashboardData}
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
                <StatCard
                  title="Registered Customers"
                  value={stats.customers.total}
                  subtitle="Active client accounts"
                  icon={Users}
                  accentColor="primary"
                  footer={
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{stats.customers.active} Active</span>
                      </span>
                      <span className="flex items-center gap-1 text-rose-800 font-medium">
                        <XCircle className="h-3 w-3" />
                        <span>{stats.customers.blocked} Blocked</span>
                      </span>
                    </div>
                  }
                />

                {/* Services Metric */}
                <StatCard
                  title="Services Catalog"
                  value={stats.services.total}
                  subtitle="Treatment offerings"
                  icon={Sparkles}
                  accentColor="primary"
                  footer={
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{stats.services.active} Live</span>
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground font-medium">
                        <Tag className="h-3 w-3" />
                        <span>{stats.services.inactive} Inactive</span>
                      </span>
                    </div>
                  }
                />

                {/* Appointments Metric */}
                <StatCard
                  title="Total Reservations"
                  value={stats.appointments.total}
                  subtitle="All client bookings"
                  icon={Calendar}
                  accentColor="primary"
                  footer={
                    <div className="flex items-center justify-between text-[11px]">
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
                  }
                />

                {/* Transactions Metric */}
                <StatCard
                  title="Total Transactions"
                  value={stats.transactions.total}
                  subtitle="Stripe payment attempts"
                  icon={CreditCard}
                  accentColor="primary"
                  footer={
                    <div className="flex items-center justify-between text-[11px]">
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
                  }
                />
              </div>

              {/* Verified Revenue Section — Currency Isolated */}
              <RevenueOverviewChart
                byCurrency={stats.revenue.byCurrency}
                transactions={stats.transactions}
                title="Verified Paid Revenue"
                subtitle="Reconciled revenue from verified Stripe transactions, isolated strictly by currency."
              />

              {/* Operational Visualizations: Status Pipeline & Monthly Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointment Status Pipeline */}
                <StatusDistributionChart
                  pending={stats.appointments.pending}
                  confirmed={stats.appointments.confirmed}
                  cancelled={stats.appointments.cancelled}
                  title="Salon Reservation Pipeline"
                  subtitle="Proportion of bookings across confirmed, pending, and cancelled stages"
                />

                {/* Monthly Booking Trends */}
                <MonthlyTrendChart
                  data={monthlyBuckets}
                  title="Salon Booking Trends"
                  subtitle="Monthly reservation volume across the salon over the last 6 operating months"
                />
              </div>

              {/* Live Feeds: Recent Appointments & Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Appointments */}
                <RecentActivityList
                  title="Latest Appointment Reservations"
                  subtitle="Most recent bookings made by salon clients"
                  items={recentAppointmentItems}
                  emptyMessage="No reservations recorded yet"
                  emptySubtext="When clients book appointments, they will be listed here."
                  viewAllHref="/dashboard/admin/appointments"
                  viewAllLabel="Manage All Appointments"
                  type="appointments"
                />

                {/* Recent Transactions */}
                <RecentActivityList
                  title="Recent Stripe Transactions"
                  subtitle="Latest payment attempts and checkout sessions"
                  items={recentTransactionItems}
                  emptyMessage="No transactions recorded yet"
                  emptySubtext="When clients complete Stripe checkout, payments will be listed here."
                  viewAllHref="/dashboard/admin/transactions"
                  viewAllLabel="View All Transactions"
                  type="transactions"
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </AdminGuard>
  );
}
