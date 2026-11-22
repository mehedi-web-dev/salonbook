"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Ban,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { UserStatusDialog } from "@/components/admin/user-status-dialog";
import { useSession } from "@/lib/auth-client";
import { getAdminUsers, updateAdminUserStatus } from "@/lib/admin-api";
import type { AdminUser } from "@/types";
import { filterUsers } from "@/lib/filter-utils";
import {
  AdminFilterToolbar,
  type ActiveFilterTag,
} from "@/components/admin/admin-filter-toolbar";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [sortBy, setSortBy] = useState<"name_asc" | "name_desc" | "newest" | "oldest">("newest");

  // Status dialog state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [targetBlocked, setTargetBlocked] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getAdminUsers({ limit: 100 });
      setUsers(response.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load customers";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    const fetchList = async () => {
      try {
        const response = await getAdminUsers({ limit: 100 });
        if (isCurrent) {
          setUsers(response.data || []);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const msg = err instanceof Error ? err.message : "Failed to load customers";
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

  // Filtered and sorted users via pure filter utility
  const filteredUsers = useMemo(() => {
    return filterUsers(users, {
      search: searchQuery,
      status: statusFilter,
      sortBy,
    });
  }, [users, searchQuery, statusFilter, sortBy]);

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
    if (sortBy !== "newest") {
      const sortLabels: Record<string, string> = {
        oldest: "Oldest Registered",
        name_asc: "Name: A to Z",
        name_desc: "Name: Z to A",
      };
      tags.push({
        id: "sort",
        label: "Sort",
        value: sortLabels[sortBy] || sortBy,
        onRemove: () => setSortBy("newest"),
      });
    }
    return tags;
  }, [statusFilter, sortBy]);

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("newest");
  };

  const openStatusDialog = (user: AdminUser, willBlock: boolean) => {
    setSelectedUser(user);
    setTargetBlocked(willBlock);
    setIsDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedUser) return;
    setIsUpdatingStatus(true);
    try {
      await updateAdminUserStatus(selectedUser._id, targetBlocked);
      toast.success(
        `Customer account successfully ${targetBlocked ? "blocked" : "unblocked"}`
      );
      setIsDialogOpen(false);
      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? { ...u, isBlocked: targetBlocked } : u))
      );
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
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const currentAdminEmail = session?.user?.email?.toLowerCase();
  const currentAdminId = session?.user?.id;

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
            <li className="text-foreground font-semibold">Customers</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900 mb-3">
              <Users className="h-3.5 w-3.5 text-rose-700" />
              <span>Customer Administration</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Customer Directory
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Manage client records, review booking histories, and maintain account status controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              disabled={isLoading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh List</span>
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
            searchPlaceholder="Search customer by name, email, or phone..."
            activeTags={activeTags}
            onClearAll={handleClearAllFilters}
            totalCount={users.length}
            filteredCount={filteredUsers.length}
            itemName="customers"
          >
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "blocked")}
              aria-label="Filter by account status"
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name_asc" | "name_desc" | "newest" | "oldest")
              }
              aria-label="Sort customer directory"
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="newest">Newest Registered</option>
              <option value="oldest">Oldest Registered</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
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
                    Failed to Load Customers
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-rose-800">
                    {errorMessage}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadUsers}
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
                    <div className="h-4 w-40 rounded bg-muted/60" />
                    <div className="h-3 w-60 rounded bg-muted/40" />
                  </div>
                  <div className="h-8 w-24 rounded bg-muted/40" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-4">Customer</th>
                      <th scope="col" className="px-6 py-4">Phone</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4">Registered</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => {
                      const isSelf =
                        (user.email && user.email.toLowerCase() === currentAdminEmail) ||
                        user._id === currentAdminId;

                      return (
                        <tr
                          key={user._id}
                          className="transition-colors hover:bg-muted/20"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {user.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={user.image}
                                  alt={user.name || "Customer"}
                                  className="h-9 w-9 rounded-full object-cover border border-border"
                                />
                              ) : (
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-xs">
                                  {user.name ? user.name.charAt(0).toUpperCase() : "C"}
                                </span>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {isSelf && (
                                    <span className="rounded bg-rose-100 text-rose-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-xs text-foreground font-medium">
                            {user.phone || (
                              <span className="text-muted-foreground italic">None</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {user.isBlocked ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                                <XCircle className="h-3 w-3" />
                                <span>Blocked</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Active</span>
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-xs text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboard/admin/users/${user._id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 text-xs"
                                  title="View customer profile and stats"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>Details</span>
                                </Button>
                              </Link>

                              {user.isBlocked ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={isSelf}
                                  onClick={() => openStatusDialog(user, false)}
                                  className="gap-1 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                                  title={isSelf ? "Cannot modify own status" : "Restore account"}
                                >
                                  <ShieldCheck className="h-3 w-3" />
                                  <span>Unblock</span>
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={isSelf}
                                  onClick={() => openStatusDialog(user, true)}
                                  className="gap-1 text-xs border-rose-300 text-rose-800 hover:bg-rose-50 hover:text-rose-900"
                                  title={isSelf ? "Cannot block own account" : "Suspend account"}
                                >
                                  <Ban className="h-3 w-3" />
                                  <span>Block</span>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredUsers.map((user) => {
                  const isSelf =
                    (user.email && user.email.toLowerCase() === currentAdminEmail) ||
                    user._id === currentAdminId;

                  return (
                    <div
                      key={user._id}
                      className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                        <div className="flex items-center gap-2.5">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.image}
                              alt={user.name || "Customer"}
                              className="h-10 w-10 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
                              {user.name ? user.name.charAt(0).toUpperCase() : "C"}
                            </span>
                          )}
                          <div>
                            <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isSelf && (
                                <span className="rounded bg-rose-100 text-rose-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {user.isBlocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
                            <XCircle className="h-3 w-3" />
                            <span>Blocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Phone:</span>
                          <span className="font-medium text-foreground">
                            {user.phone || "None"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Registered:</span>
                          <span className="font-medium text-foreground">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                        <Link href={`/dashboard/admin/users/${user._id}`}>
                          <Button variant="outline" size="sm" className="gap-1 text-xs">
                            <Eye className="h-3 w-3" />
                            <span>Details</span>
                          </Button>
                        </Link>

                        {user.isBlocked ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSelf}
                            onClick={() => openStatusDialog(user, false)}
                            className="gap-1 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            <span>Unblock</span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSelf}
                            onClick={() => openStatusDialog(user, true)}
                            className="gap-1 text-xs border-rose-300 text-rose-800 hover:bg-rose-50"
                          >
                            <Ban className="h-3 w-3" />
                            <span>Block</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-xs">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
              <h2 className="font-serif text-xl font-semibold text-foreground">
                No Customers Match Filters
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                No customer accounts match your active search and filter criteria. Try adjusting or clearing your filters.
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

        {/* Status Confirmation Dialog */}
        <UserStatusDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onConfirm={handleConfirmStatusChange}
          user={selectedUser}
          targetBlocked={targetBlocked}
          isSubmitting={isUpdatingStatus}
        />
      </div>
    </AdminGuard>
  );
}
