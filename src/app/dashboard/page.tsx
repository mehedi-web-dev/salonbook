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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { getMyAppointments } from "@/lib/appointments-api";
import type { Appointment } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  // Redirect to login if unauthenticated once check finishes
  useEffect(() => {
    if (!isPending && !session?.user) {
      toast.info("Please sign in to access your dashboard");
      router.replace("/login");
    }
  }, [isPending, session, router]);

  // Load customer appointments
  useEffect(() => {
    let isCurrent = true;

    async function loadRecent() {
      if (!session?.user || session.user.role === "admin") {
        if (isCurrent) setIsLoadingAppointments(false);
        return;
      }
      try {
        const response = await getMyAppointments({ limit: 3 });
        if (isCurrent) {
          setRecentAppointments(response.data || []);
        }
      } catch {
        // Fallback for dashboard preview
      } finally {
        if (isCurrent) {
          setIsLoadingAppointments(false);
        }
      }
    }

    loadRecent();

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
  const isAdmin = user.role === "admin";

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
            Manage your personal profile, active bookings, and salon appointments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isAdmin && (
            <Link href="/dashboard/appointments">
              <Button variant="outline" size="sm">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                <span>My Appointments</span>
              </Button>
            </Link>
          )}
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

      {/* Dashboard Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Profile Card */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-xs lg:col-span-1">
          <div className="flex items-center gap-3.5 border-b border-border pb-4">
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
                <span
                  className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    isAdmin
                      ? "bg-rose-100 text-rose-800"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {isAdmin ? "Administrator" : user.role || "Customer"}
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
                Account Role: <strong className="capitalize">{user.role || "Customer"}</strong>
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-6 rounded-md border border-rose-200 bg-rose-50/60 p-4 text-xs text-rose-900">
              <p className="font-semibold flex items-center gap-1.5 text-rose-950">
                <Shield className="h-4 w-4 text-rose-700" />
                Admin Privileges Active
              </p>
              <p className="mt-1.5 text-[11px] text-rose-800 leading-relaxed">
                You have full administrative access to treatment pricing, catalog availability,
                and image uploads.
              </p>
              <div className="mt-3.5">
                <Link href="/dashboard/admin/services" className="block w-full">
                  <Button variant="primary" size="sm" className="w-full gap-1.5 text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Manage Services Catalog</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Appointments Section */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Your Appointments
              </h2>
            </div>
            {!isAdmin && (
              <Link
                href="/dashboard/appointments"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {isLoadingAppointments ? (
            <div className="mt-6 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-md bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : recentAppointments.length > 0 ? (
            <div className="mt-6 space-y-3">
              {recentAppointments.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4 transition-colors hover:bg-secondary/40"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <h3 className="font-medium text-foreground text-sm truncate">
                      {app.service?.name || "Salon Treatment"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-foreground font-medium">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span>{app.appointmentDate}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-foreground font-medium">
                        <Clock className="h-3 w-3 text-primary" />
                        <span>{app.timeSlot}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-foreground text-sm">
                      ${app.servicePrice}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        app.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-800"
                          : app.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-2 text-center">
                <Link href="/dashboard/appointments">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <span>Manage Full Appointments History</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
              <h3 className="text-sm font-medium text-foreground">No bookings recorded yet</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                Explore our signature salon treatments and reserve your preferred appointment time.
              </p>
              <div className="mt-5">
                <Link href="/services">
                  <Button variant="outline" size="sm" disabled={isBlocked}>
                    Browse Salon Services
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
