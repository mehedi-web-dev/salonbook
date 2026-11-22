"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  Clock,
  Tag,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Loader2,
  Eye,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { DeleteDialog } from "@/components/services/delete-dialog";
import {
  fetchServices,
  updateServiceStatus,
  deleteService,
} from "@/lib/services-api";
import type { Service } from "@/types";
import { filterServices } from "@/lib/filter-utils";
import {
  AdminFilterToolbar,
  type ActiveFilterTag,
} from "@/components/admin/admin-filter-toolbar";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "price_asc" | "price_desc" | "newest" | "oldest" | "name_asc" | "name_desc"
  >("newest");

  // Status toggle in-progress tracking by serviceId
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchServices({ status: "all", limit: 100 });
      setServices(response.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load services";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    async function loadData() {
      try {
        const response = await fetchServices({ status: "all", limit: 100 });
        if (isCurrent) {
          setServices(response.data || []);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const msg = err instanceof Error ? err.message : "Failed to load services";
          setErrorMessage(msg);
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCurrent = false;
    };
  }, []);

  // Compute available categories from loaded services
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set).sort();
  }, [services]);

  // Filtered and sorted services using pure utility
  const filteredServices = useMemo(() => {
    return filterServices(services, {
      search: searchQuery,
      category: categoryFilter,
      status: statusFilter,
      sortBy,
    });
  }, [services, searchQuery, categoryFilter, statusFilter, sortBy]);

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
    if (categoryFilter !== "all") {
      tags.push({
        id: "category",
        label: "Category",
        value: categoryFilter,
        onRemove: () => setCategoryFilter("all"),
      });
    }
    if (sortBy !== "newest") {
      const sortLabels: Record<string, string> = {
        price_asc: "Price: Low to High",
        price_desc: "Price: High to Low",
        oldest: "Oldest First",
        name_asc: "Name: A to Z",
      };
      tags.push({
        id: "sort",
        label: "Sort",
        value: sortLabels[sortBy] || sortBy,
        onRemove: () => setSortBy("newest"),
      });
    }
    return tags;
  }, [statusFilter, categoryFilter, sortBy]);

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSortBy("newest");
  };

  // Handle status toggle (Activate / Deactivate)
  const handleToggleStatus = async (service: Service) => {
    const newStatus = !service.isActive;
    setUpdatingStatusId(service._id);

    try {
      const updated = await updateServiceStatus(service._id, newStatus);
      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? { ...s, isActive: updated.isActive } : s))
      );
      toast.success(
        `"${service.name}" ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update service status";
      toast.error(msg);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await deleteService(deleteTarget._id);
      setServices((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      toast.success(`"${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete service";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/dashboard/admin" className="hover:text-foreground transition-colors font-medium">
            Admin Overview
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Services Management</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground mb-3">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Operations Control</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Service Management
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
              Create, update, activate, and manage your full salon treatment offerings, pricing tiers, and session durations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Catalog</span>
            </Button>
            <Link href="/dashboard/admin/services/new">
              <Button variant="primary" size="sm" className="gap-2 shadow-xs text-xs">
                <Plus className="h-4 w-4" />
                <span>Add New Service</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Advanced Filter Toolbar */}
        <div className="mt-8">
          <AdminFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search treatment name or description..."
            activeTags={activeTags}
            onClearAll={handleClearAllFilters}
            totalCount={services.length}
            filteredCount={filteredServices.length}
            itemName="services"
          >
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              aria-label="Filter by status"
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | "price_asc"
                    | "price_desc"
                    | "newest"
                    | "oldest"
                    | "name_asc"
                    | "name_desc"
                )
              }
              aria-label="Sort services"
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </AdminFilterToolbar>
        </div>

        {/* Services Content Section */}
        <div className="mt-8">
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="divide-y divide-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-5 gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-14 w-20 rounded bg-muted animate-pulse shrink-0" />
                      <div className="space-y-2 flex-1 max-w-sm">
                        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                      </div>
                    </div>
                    <div className="h-6 w-16 rounded bg-muted animate-pulse" />
                    <div className="h-8 w-24 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : errorMessage ? (
            /* Error State */
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700 mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="text-base font-semibold text-rose-900">
                Failed to Load Treatments
              </h2>
              <p className="mt-1 text-xs text-rose-800 max-w-sm mx-auto mb-6">
                {errorMessage}
              </p>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 text-xs">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </Button>
            </div>
          ) : filteredServices.length === 0 ? (
            /* Empty State */
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground mb-3">
                <SlidersHorizontal className="h-6 w-6" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-foreground">
                No Services Found
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                {services.length === 0
                  ? "Your salon catalog is currently empty. Click 'Add New Service' above to create your first treatment offering."
                  : "No services match your active search and filter criteria. Try adjusting your parameters or reset filters."}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                {services.length === 0 ? (
                  <Link href="/dashboard/admin/services/new">
                    <Button variant="primary" size="sm" className="gap-2 text-xs">
                      <Plus className="h-4 w-4" />
                      <span>Create First Service</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="gap-1.5 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset All Filters</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Responsive Services Table & Card Layout */
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              {/* Desktop & Tablet Table (Hidden on small mobile) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-secondary/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th scope="col" className="py-3.5 pl-6 pr-4">Service</th>
                      <th scope="col" className="px-4 py-3.5">Category</th>
                      <th scope="col" className="px-4 py-3.5">Price</th>
                      <th scope="col" className="px-4 py-3.5">Duration</th>
                      <th scope="col" className="px-4 py-3.5">Status</th>
                      <th scope="col" className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {filteredServices.map((service) => {
                      const duration = service.duration ?? service.durationMinutes ?? 0;
                      const isUpdating = updatingStatusId === service._id;

                      return (
                        <tr
                          key={service._id}
                          className="hover:bg-secondary/20 transition-colors"
                        >
                          {/* Service Details with Image */}
                          <td className="py-4 pl-6 pr-4">
                            <div className="flex items-center gap-3.5">
                              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/60">
                                {service.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={service.image}
                                    alt={service.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <Sparkles className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/services/${service._id}`}
                                  className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                                >
                                  {service.name}
                                </Link>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {service.shortDescription || service.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 rounded bg-accent/60 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                              <Tag className="h-3 w-3" />
                              <span>{service.category}</span>
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-4 whitespace-nowrap font-serif text-base font-semibold text-foreground">
                            ${service.price}
                          </td>

                          {/* Duration */}
                          <td className="px-4 py-4 whitespace-nowrap text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-foreground/50" />
                              <span>{duration} mins</span>
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                service.isActive
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  service.isActive ? "bg-emerald-600" : "bg-amber-600"
                                }`}
                              />
                              <span>{service.isActive ? "Active" : "Inactive"}</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details Public Route */}
                              <Link
                                href={`/services/${service._id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="View treatment preview"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Link>

                              {/* Status Toggle Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(service)}
                                disabled={isUpdating}
                                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
                                  service.isActive
                                    ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                }`}
                                title={service.isActive ? "Deactivate service" : "Activate service"}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Power className="h-3 w-3" />
                                )}
                                <span>{service.isActive ? "Deactivate" : "Activate"}</span>
                              </button>

                              {/* Edit Button */}
                              <Link
                                href={`/dashboard/admin/services/${service._id}/edit`}
                                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                              >
                                <Edit2 className="h-3 w-3 text-foreground/70" />
                                <span>Edit</span>
                              </Link>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(service)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete service permanently"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Stack (Visible on small screens) */}
              <div className="divide-y divide-border sm:hidden">
                {filteredServices.map((service) => {
                  const duration = service.duration ?? service.durationMinutes ?? 0;
                  const isUpdating = updatingStatusId === service._id;

                  return (
                    <div key={service._id} className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/60">
                          {service.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={service.image}
                              alt={service.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Sparkles className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-foreground text-sm line-clamp-1">
                              {service.name}
                            </h3>
                            <span className="font-serif font-semibold text-foreground text-sm shrink-0">
                              ${service.price}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Tag className="h-3 w-3" />
                              <span>{service.category}</span>
                            </span>
                            <span>&bull;</span>
                            <span className="text-muted-foreground">{duration} mins</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/60">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            service.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              service.isActive ? "bg-emerald-600" : "bg-amber-600"
                            }`}
                          />
                          <span>{service.isActive ? "Active" : "Inactive"}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(service)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium border transition-colors ${
                              service.isActive
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : "border-emerald-200 bg-emerald-50 text-emerald-800"
                            }`}
                          >
                            <Power className="h-3 w-3" />
                            <span>{service.isActive ? "Deactivate" : "Activate"}</span>
                          </button>

                          <Link
                            href={`/dashboard/admin/services/${service._id}/edit`}
                            className="inline-flex items-center rounded-md border border-border bg-card p-1.5 text-foreground hover:bg-muted"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-foreground/70" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(service)}
                            className="inline-flex items-center rounded-md border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteDialog
          isOpen={!!deleteTarget}
          serviceName={deleteTarget?.name || ""}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      </div>
    </AdminGuard>
  );
}
