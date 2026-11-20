"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { UserStatusDialog } from "@/components/admin/user-status-dialog";
import { useSession } from "@/lib/auth-client";
import { getAdminUsers, updateAdminUserStatus } from "@/lib/admin-api";
import type { AdminUser, PaginationMeta } from "@/types";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status dialog state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [targetBlocked, setTargetBlocked] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadUsers = async (page: number, search: string, status: "all" | "active" | "blocked") => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getAdminUsers({
        page,
        limit: 10,
        search,
        status,
      });
      setUsers(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
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
        const response = await getAdminUsers({
          page: currentPage,
          limit: 10,
          search: searchQuery,
          status: statusFilter,
        });
        if (isCurrent) {
          setUsers(response.data || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
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
  }, [currentPage, searchQuery, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
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
      // Refresh customer list
      loadUsers(currentPage, searchQuery, statusFilter);
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
              onClick={() => loadUsers(currentPage, searchQuery, statusFilter)}
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

        {/* Filter and Search Bar */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button type="submit" variant="primary" size="sm" className="text-xs">
              Search
            </Button>
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </form>

          {/* Status Tabs */}
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
              All Clients
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("active");
                setCurrentPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("blocked");
                setCurrentPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === "blocked"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Blocked
            </button>
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
                    Failed to Load Customers
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-rose-800">
                    {errorMessage}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadUsers(currentPage, searchQuery, statusFilter)}
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
          ) : users.length > 0 ? (
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
                    {users.map((user) => {
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
                                    <span className="rounded bg-rose-100 text-rose-800 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider">
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
                                  className="gap-1 text-xs border-rose-300 text-rose-800 hover:bg-rose-50 hover:text-rose-900 disabled:opacity-40"
                                  title={isSelf ? "Cannot modify own status" : "Suspend account"}
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
                {users.map((user) => {
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
                              className="h-9 w-9 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-xs">
                              {user.name ? user.name.charAt(0).toUpperCase() : "C"}
                            </span>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isSelf && (
                                <span className="rounded bg-rose-100 text-rose-800 px-1 py-0.2 text-[9px] font-bold uppercase">
                                  You
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
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

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span>Phone: </span>
                          <span className="font-medium text-foreground">
                            {user.phone || "None"}
                          </span>
                        </div>
                        <div>
                          <span>Joined: </span>
                          <span className="font-medium text-foreground">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <Link href={`/dashboard/admin/users/${user._id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
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
                            className="flex-1 text-xs gap-1 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Unblock</span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSelf}
                            onClick={() => openStatusDialog(user, true)}
                            className="flex-1 text-xs gap-1 border-rose-300 text-rose-800 hover:bg-rose-50 disabled:opacity-40"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            <span>Block</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                  <p className="text-xs text-muted-foreground">
                    Showing Page <strong className="text-foreground">{pagination.page}</strong> of{" "}
                    <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.total} total clients)
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
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-foreground">
                No Customers Found
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {searchQuery || statusFilter !== "all"
                  ? "No registered customers match your current filter criteria. Try adjusting your search term or status filter."
                  : "No customer accounts have registered on the SalonBook platform yet."}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <div className="mt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchInput("");
                      setSearchQuery("");
                      setStatusFilter("all");
                      setCurrentPage(1);
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <UserStatusDialog
        isOpen={isDialogOpen}
        user={selectedUser}
        targetBlocked={targetBlocked}
        isSubmitting={isUpdatingStatus}
        onConfirm={handleConfirmStatusChange}
        onClose={() => setIsDialogOpen(false)}
      />
    </AdminGuard>
  );
}
