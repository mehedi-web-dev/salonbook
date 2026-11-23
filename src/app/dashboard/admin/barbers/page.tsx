"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  Award,
  Scissors,
  AlertCircle,
  RefreshCw,
  Loader2,
  Search,
  User,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { BarberDeleteDialog } from "@/components/barbers/barber-delete-dialog";
import {
  fetchBarbers,
  updateBarberStatus,
  deleteBarber,
} from "@/lib/barbers-api";
import type { Barber } from "@/types";

export default function AdminBarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // In-progress action tracking
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Barber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Pass all: true to retrieve both active and inactive barbers
      const response = await fetchBarbers({ all: true, populate: "services" });
      setBarbers(response.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load barbers";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    async function init() {
      try {
        const response = await fetchBarbers({ all: true, populate: "services" });
        if (isCurrent) {
          setBarbers(response.data || []);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const msg = err instanceof Error ? err.message : "Failed to load barbers";
          setErrorMessage(msg);
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      isCurrent = false;
    };
  }, []);

  // Filter and search barbers in memory
  const filteredBarbers = useMemo(() => {
    return barbers.filter((barber) => {
      // Status filter
      if (statusFilter === "active" && !barber.isActive) return false;
      if (statusFilter === "inactive" && barber.isActive) return false;

      // Search query filter (matches name, designation, specialization, bio)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = barber.name.toLowerCase().includes(q);
        const matchesDesignation = barber.designation.toLowerCase().includes(q);
        const matchesBio = (barber.bio || "").toLowerCase().includes(q);
        const matchesSpecs = (barber.specialization || []).some((s) =>
          s.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesDesignation && !matchesBio && !matchesSpecs) {
          return false;
        }
      }

      return true;
    });
  }, [barbers, statusFilter, searchQuery]);

  // Handle active/inactive status toggle
  const handleToggleStatus = async (barber: Barber) => {
    const newStatus = !barber.isActive;
    setUpdatingStatusId(barber._id);

    try {
      await updateBarberStatus(barber._id, newStatus);
      setBarbers((prev) =>
        prev.map((b) => (b._id === barber._id ? { ...b, isActive: newStatus } : b))
      );
      toast.success(
        `${barber.name} is now ${newStatus ? "active and visible" : "inactive and hidden"}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      toast.error(msg);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Handle barber deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteBarber(deleteTarget._id);
      setBarbers((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      toast.success(`${deleteTarget.name} was deleted successfully`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete barber";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
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
                Admin Console
              </Link>
            </li>
            <li>/</li>
            <li>
              <span className="text-foreground font-semibold">Manage Barbers</span>
            </li>
          </ol>
        </nav>

        {/* Header / Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900 mb-3">
              <Scissors className="h-3.5 w-3.5 text-rose-700" />
              <span>Specialist Roster Management</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Barber &amp; Stylist Profiles
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Create, update, activate, and manage your team of certified salon specialists, their
              specializations, experience, and associated treatments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Link href="/dashboard/admin/barbers/new">
              <Button variant="primary" size="sm" className="gap-1.5 shadow-xs">
                <Plus className="h-4 w-4" />
                <span>Add New Barber</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-2xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, designation, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Segment Filter */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({barbers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-background text-emerald-700 shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active ({barbers.filter((b) => b.isActive).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                statusFilter === "inactive"
                  ? "bg-background text-neutral-700 shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Inactive ({barbers.filter((b) => !b.isActive).length})
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">Unable to load barbers</p>
              <p className="mt-0.5 text-rose-800">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Content Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-medium text-muted-foreground">
              Retrieving barber roster...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredBarbers.length === 0 && (
          <div className="mt-8 text-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground mb-3">
              <Scissors className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
              No Barbers Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
              {searchQuery || statusFilter !== "all"
                ? "No specialists match the current filter criteria. Try resetting filters."
                : "Your specialist catalog is currently empty. Get started by adding your first barber or stylist."}
            </p>
            {searchQuery || statusFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Link href="/dashboard/admin/barbers/new">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span>Add First Barber</span>
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Barbers Grid */}
        {!isLoading && filteredBarbers.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBarbers.map((barber) => (
              <div
                key={barber._id}
                className={`relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-2xs transition-all duration-200 hover:shadow-sm ${
                  barber.isActive ? "border-border/90" : "border-neutral-200 bg-neutral-50/60 opacity-85"
                }`}
              >
                <div>
                  {/* Top Bar: Status Badge & Quick Actions */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                        barber.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-neutral-100 text-neutral-600 border-neutral-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          barber.isActive ? "bg-emerald-600" : "bg-neutral-400"
                        }`}
                      />
                      {barber.isActive ? "Active" : "Inactive"}
                    </span>

                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/admin/barbers/${barber._id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit Barber"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(barber)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                        title="Delete Barber"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Specialist Avatar & Identity */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                      {barber.image ? (
                        <Image
                          src={barber.image}
                          alt={barber.name}
                          fill
                          sizes="64px"
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                          <User className="h-7 w-7 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-base font-semibold text-foreground truncate">
                        {barber.name}
                      </h3>
                      <p className="text-xs font-medium text-primary truncate">
                        {barber.designation}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                        <Award className="h-3 w-3 text-muted-foreground/70" />
                        <span>{barber.experience} Year{barber.experience !== 1 ? "s" : ""} Experience</span>
                      </div>
                    </div>
                  </div>

                  {/* Specializations */}
                  {barber.specialization && barber.specialization.length > 0 && (
                    <div className="mb-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                        Specializations
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {barber.specialization.map((spec, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-md border border-border/70 bg-secondary/40 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Associated Services */}
                  {barber.services && barber.services.length > 0 && (
                    <div className="mb-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                        Associated Services ({barber.services.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {barber.services.slice(0, 2).map((srv) => (
                          <span
                            key={srv._id}
                            className="inline-flex items-center gap-1 rounded border border-border/60 bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground truncate max-w-[130px]"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            <span className="truncate">{srv.name}</span>
                          </span>
                        ))}
                        {barber.services.length > 2 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{barber.services.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bio snippet */}
                  {barber.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 italic mb-4">
                      &ldquo;{barber.bio}&rdquo;
                    </p>
                  )}
                </div>

                {/* Footer Controls: Status Toggle */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Status Toggle
                  </span>
                  <Button
                    type="button"
                    variant={barber.isActive ? "outline" : "primary"}
                    size="sm"
                    disabled={updatingStatusId === barber._id}
                    onClick={() => handleToggleStatus(barber)}
                    className="h-7 text-xs px-2.5 gap-1.5"
                  >
                    {updatingStatusId === barber._id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Power className="h-3 w-3" />
                    )}
                    <span>{barber.isActive ? "Deactivate" : "Activate"}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <BarberDeleteDialog
          isOpen={Boolean(deleteTarget)}
          barberName={deleteTarget?.name || ""}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      </div>
    </AdminGuard>
  );
}
