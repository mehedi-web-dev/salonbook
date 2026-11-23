"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  Sparkles,
  LogOut,
  Loader2,
  Clock,
  ArrowRight,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { getMyAppointments } from "@/lib/appointments-api";
import { getMyPayments } from "@/lib/payments-api";
import type { Appointment, PaymentTransaction } from "@/types";
import {
  computeAppointmentStats,
  computeCustomerExpenditure,
  groupAppointmentsByMonth,
} from "@/lib/analytics-utils";
import { StatCard } from "@/components/analytics/stat-card";
import { StatusDistributionChart } from "@/components/analytics/status-distribution-chart";
import { MonthlyTrendChart } from "@/components/analytics/monthly-trend-chart";
import { RecentActivityList } from "@/components/analytics/recent-activity-list";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Redirect unauthenticated customers to login; redirect administrators to admin console
  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        toast.info("Please sign in to access your dashboard");
        router.replace("/login");
      } else if (session.user.role === "admin") {
        router.replace("/dashboard/admin");
      }
    }
  }, [isPending, session, router]);

  // Load customer appointments and verified payment transactions
  useEffect(() => {
    let isCurrent = true;

    async function loadCustomerData() {
      if (!session?.user || session.user.role === "admin") {
        if (isCurrent) setIsLoadingData(false);
        return;
      }

      try {
        const [appRes, payRes] = await Promise.allSettled([
          getMyAppointments({ limit: 100 }),
          getMyPayments({ limit: 100 }),
        ]);

        if (isCurrent) {
          if (appRes.status === "fulfilled" && appRes.value?.data) {
            setAppointments(appRes.value.data);
          }
          if (payRes.status === "fulfilled" && payRes.value?.data) {
            setPayments(payRes.value.data);
          }
        }
      } catch {
        // Handled gracefully via state fallbacks
      } finally {
        if (isCurrent) {
          setIsLoadingData(false);
        }
      }
    }

    loadCustomerData();

    return () => {
      isCurrent = false;
    };
  }, [session]);

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/login");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to sign out");
          },
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error signing out";
      toast.error(message);
    }
  };

  if (isPending) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-medium text-muted-foreground">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const isBlocked = !!user.isBlocked;

  // Compute live customer analytics
  const appStats = computeAppointmentStats(appointments);
  const expenditureStats = computeCustomerExpenditure(payments);
  const monthlyBuckets = groupAppointmentsByMonth(appointments);
  const paidAppointmentsCount = appointments.filter((a) => a.paymentStatus === "paid").length;

  // Transform recent appointments for activity feed
  const recentActivityItems = appointments.slice(0, 5).map((app) => ({
    id: app._id,
    title: app.service?.name || "Salon Treatment",
    subtitle: `${app.appointmentDate} at ${app.timeSlot}`,
    timestamp: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : app.appointmentDate,
    amount: `$${app.servicePrice}`,
    status: app.status,
    badgeLabel: app.status,
    href: "/dashboard/appointments",
  }));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Blocked Account Warning Banner */}
      {isBlocked && (
        <div
          role="alert"
          className="mb-8 rounded-lg border border-rose-300 bg-rose-50/90 p-5 text-rose-900 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-rose-900">
                Account Suspended / Restricted
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-rose-800">
                Your account is currently flagged as restricted by administration. Appointment
                scheduling and modifications are paused. Please contact our salon concierge or
                email support@salonbook.com for assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header / Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-medium text-accent-foreground mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Customer Portal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Welcome, {user.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your appointment history, pending requests, and verified payment transactions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/appointments">
            <Button variant="outline" size="sm">
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              <span>My Appointments</span>
            </Button>
          </Link>
          <Link href="/dashboard/payments">
            <Button variant="outline" size="sm">
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              <span>Payment History</span>
            </Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button variant="outline" size="sm">
              <UserIcon className="mr-1.5 h-3.5 w-3.5" />
              <span>Profile Settings</span>
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="primary" size="sm" disabled={isBlocked}>
              <Calendar className="mr-2 h-4 w-4" />
              Book New Service
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-8 space-y-8">
        {/* Customer KPI Metric Cards */}
        {isLoadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted/40 border border-border p-5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Appointments */}
            <StatCard
              title="Total Appointments"
              value={appStats.total}
              subtitle="All reservations initiated"
              icon={Calendar}
              accentColor="primary"
              footer={
                <Link
                  href="/dashboard/appointments"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>View full history</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              }
            />

            {/* Pending Appointments */}
            <StatCard
              title="Pending Appointments"
              value={appStats.pending}
              subtitle={`${appStats.pendingPct}% awaiting stylist review`}
              icon={Clock}
              accentColor="amber"
              footer={
                <span className="text-[11px] font-medium text-amber-800">
                  Salon response within 24h
                </span>
              }
            />

            {/* Confirmed Appointments */}
            <StatCard
              title="Confirmed Appointments"
              value={appStats.confirmed}
              subtitle={`${appStats.confirmedPct}% of your total bookings`}
              icon={CheckCircle2}
              accentColor="emerald"
              footer={
                <span className="text-[11px] font-medium text-emerald-800">
                  Ready for salon attendance
                </span>
              }
            />

            {/* Paid Appointments */}
            <StatCard
              title="Paid Appointments"
              value={paidAppointmentsCount}
              subtitle={`${expenditureStats.paidCount} verified paid transactions`}
              icon={CreditCard}
              accentColor="primary"
              footer={
                <Link
                  href="/dashboard/payments"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Total spent: {expenditureStats.primaryTotalDisplay}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              }
            />
          </div>
        )}

        {/* Analytical Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Donut Chart */}
          <StatusDistributionChart
            pending={appStats.pending}
            confirmed={appStats.confirmed}
            cancelled={appStats.cancelled}
            title="Appointment Pipeline Status"
            subtitle="Breakdown of your booked treatments by lifecycle stage"
          />

          {/* Monthly Trend Bar Chart */}
          <MonthlyTrendChart
            data={monthlyBuckets}
            title="Monthly Booking Activity"
            subtitle="Reservation frequency over the past 6 operating months"
          />
        </div>

        {/* Profile Card & Recent Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs lg:col-span-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 border-b border-border/80 pb-4">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "Avatar"}
                    className="h-12 w-12 rounded-full object-cover border border-border"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-6 w-6" />}
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-foreground truncate">{user.name}</h2>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase bg-secondary text-secondary-foreground">
                      {user.role || "Customer"}
                    </span>
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold ${
                        isBlocked
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isBlocked ? "Suspended" : "Active"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3.5 text-xs">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-foreground/60" />
                  <span className="truncate text-foreground font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-foreground/60" />
                  <span className="text-foreground">
                    {user.phone || "No phone number added"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Shield className="h-4 w-4 shrink-0 text-foreground/60" />
                  <span className="text-foreground">
                    Role: <strong className="capitalize">{user.role || "Customer"}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60">
              <Link href="/dashboard/profile" className="block w-full">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <UserIcon className="mr-1.5 h-3.5 w-3.5" />
                  <span>Edit Profile & Preferences</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Appointments Activity Feed */}
          <div className="lg:col-span-2">
            <RecentActivityList
              title="Recent Appointment Requests"
              subtitle="Your latest bookings and scheduling updates"
              items={recentActivityItems}
              emptyMessage="No reservations recorded yet"
              emptySubtext="Choose from our luxury hair, skin, and wellness treatments to book your first visit."
              viewAllHref="/dashboard/appointments"
              viewAllLabel="View All Bookings"
              type="appointments"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
