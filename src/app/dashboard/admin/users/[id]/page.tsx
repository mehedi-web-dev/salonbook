"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Ban,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { UserStatusDialog } from "@/components/admin/user-status-dialog";
import { useSession } from "@/lib/auth-client";
import { getAdminUserById, updateAdminUserStatus } from "@/lib/admin-api";
import type { AdminUser } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: session } = useSession();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetBlocked, setTargetBlocked] = useState<boolean>(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAdminUserById(id);
      setUser(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "USER_NOT_FOUND") {
        setErrorMessage("Customer not found. The account may have been deleted or the ID is invalid.");
      } else {
        const message = err instanceof Error ? err.message : "Failed to load customer profile";
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      try {
        const data = await getAdminUserById(id);
        if (isCurrent) setUser(data);
      } catch (err: unknown) {
        if (!isCurrent) return;
        if (err instanceof Error && err.message === "USER_NOT_FOUND") {
          setErrorMessage("Customer not found. The account may have been deleted or the ID is invalid.");
        } else {
          const message = err instanceof Error ? err.message : "Failed to load customer profile";
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
  }, [id]);

  const openStatusDialog = (willBlock: boolean) => {
    setTargetBlocked(willBlock);
    setIsDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!user) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateAdminUserStatus(user._id, targetBlocked);
      setUser(updated);
      toast.success(
        `Customer account successfully ${targetBlocked ? "blocked" : "unblocked"}`
      );
      setIsDialogOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update customer status";
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isSelf =
    (user?.email && user.email.toLowerCase() === session?.user?.email?.toLowerCase()) ||
    user?._id === session?.user?.id;

  return (
    <AdminGuard>
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Navigation Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/admin/users"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Customer Directory</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin">
              <Button variant="outline" size="sm" className="text-xs">
                <span>Overview</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 rounded-xl bg-card border border-border p-6" />
            <div className="h-64 rounded-xl bg-card border border-border p-6" />
          </div>
        ) : errorMessage ? (
          /* Error State */
          <div
            role="alert"
            className="rounded-xl border border-rose-300 bg-rose-50/90 p-8 text-center text-rose-900 shadow-xs"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-rose-950">
              Customer Profile Unavailable
            </h2>
            <p className="mt-2 text-sm text-rose-800 max-w-md mx-auto">
              {errorMessage}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUserDetails}
                className="gap-1.5 text-xs border-rose-300 text-rose-900 hover:bg-rose-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </Button>
              <Link href="/dashboard/admin/users">
                <Button variant="primary" size="sm" className="text-xs">
                  <span>Return to Directory</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Customer Profile Card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
              {/* Header Banner */}
              <div className="border-b border-border bg-gradient-to-r from-accent/50 to-secondary/30 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name || "Customer avatar"}
                        className="h-16 w-16 rounded-full object-cover border-2 border-border shadow-xs"
                      />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground font-serif text-2xl font-bold border border-border shadow-xs">
                        {user.name ? user.name.charAt(0).toUpperCase() : "C"}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                          {user.name}
                        </h1>
                        {isSelf && (
                          <span className="rounded bg-rose-100 text-rose-800 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                            Your Account
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{user.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Action */}
                  <div className="flex flex-col sm:items-end gap-2.5">
                    {user.isBlocked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Account Suspended</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Active Account</span>
                      </span>
                    )}

                    <div>
                      {user.isBlocked ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSelf}
                          onClick={() => openStatusDialog(false)}
                          className="gap-1.5 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Unblock Account</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSelf}
                          onClick={() => openStatusDialog(true)}
                          className="gap-1.5 text-xs border-rose-300 text-rose-800 hover:bg-rose-50 disabled:opacity-40"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>Block Account</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Account Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
                      <span className="text-muted-foreground block">Customer ID:</span>
                      <span className="font-mono font-medium text-foreground select-all text-xs">
                        {user._id}
                      </span>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
                      <span className="text-muted-foreground block">Role:</span>
                      <span className="font-semibold uppercase text-foreground">
                        {user.role}
                      </span>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
                      <span className="text-muted-foreground block">Telephone:</span>
                      <span className="font-medium text-foreground">
                        {user.phone || "No phone registered"}
                      </span>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
                      <span className="text-muted-foreground block">Registered Date:</span>
                      <span className="font-medium text-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity Summary Stats */}
                <div>
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Salon Activity Summary
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Appointments Count Card */}
                    <div className="rounded-xl border border-border bg-secondary/20 p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block font-medium">
                          Total Appointments Booked
                        </span>
                        <div className="font-serif text-3xl font-bold text-foreground">
                          {user.stats?.totalAppointments ?? 0}
                        </div>
                      </div>
                      <Link href={`/dashboard/admin/appointments?customerId=${user._id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <span>View</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>

                    {/* Transactions Count Card */}
                    <div className="rounded-xl border border-border bg-secondary/20 p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block font-medium">
                          Payment Transactions
                        </span>
                        <div className="font-serif text-3xl font-bold text-foreground">
                          {user.stats?.totalTransactions ?? 0}
                        </div>
                      </div>
                      <Link href={`/dashboard/admin/transactions?search=${encodeURIComponent(user.email)}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <span>View</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-border bg-muted/20 p-6 flex items-center justify-between">
                <Link href="/dashboard/admin/users">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Return to Customer List</span>
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/admin/transactions?search=${encodeURIComponent(user.email)}`}>
                    <Button variant="primary" size="sm" className="text-xs gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Review Client Payments</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Confirmation Dialog */}
      <UserStatusDialog
        isOpen={isDialogOpen}
        user={user}
        targetBlocked={targetBlocked}
        isSubmitting={isUpdatingStatus}
        onConfirm={handleConfirmStatusChange}
        onClose={() => setIsDialogOpen(false)}
      />
    </AdminGuard>
  );
}
