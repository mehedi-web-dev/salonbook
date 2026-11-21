"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  X,
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FilterX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/services/service-card";
import { fetchServices } from "@/lib/services-api";
import type { Service, PaginationMeta } from "@/types";

const DEFAULT_CATEGORIES = [
  "All",
  "Hair",
  "Color & Treatment",
  "Bridal",
  "Spa",
  "Nails",
  "Skin",
];

const SORT_OPTIONS = [
  { value: "", label: "Featured / Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

function ServicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get("category") || "All";

  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isCurrent = true;

    async function executeFetch() {
      try {
        const response = await fetchServices({
          search: activeSearch,
          category: selectedCategory,
          sort: selectedSort,
          page: currentPage,
          limit: 9,
        });

        if (isCurrent) {
          setServices(response.data || []);
          setPagination(
            response.pagination || {
              total: response.data?.length || 0,
              page: currentPage,
              limit: 9,
              totalPages: 1,
            }
          );
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const msg =
            err instanceof Error ? err.message : "Failed to load salon services";
          setError(msg);
          setIsLoading(false);
        }
      }
    }

    executeFetch();

    return () => {
      isCurrent = false;
    };
  }, [activeSearch, selectedCategory, selectedSort, currentPage]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchServices({
      search: activeSearch,
      category: selectedCategory,
      sort: selectedSort,
      page: currentPage,
      limit: 9,
    })
      .then((res) => {
        setServices(res.data || []);
        setPagination(
          res.pagination || {
            total: res.data?.length || 0,
            page: currentPage,
            limit: 9,
            totalPages: 1,
          }
        );
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load salon services");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setActiveSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setIsLoading(true);
    setActiveSearch("");
    setCurrentPage(1);
  };

  const handleCategorySelect = (category: string) => {
    setIsLoading(true);
    setCurrentPage(1);
    if (category === "All") {
      router.replace("/services", { scroll: false });
    } else {
      router.replace(`/services?category=${encodeURIComponent(category)}`, { scroll: false });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsLoading(true);
    setSelectedSort(e.target.value);
    setCurrentPage(1);
  };

  const handleResetAll = () => {
    setSearchInput("");
    setIsLoading(true);
    setActiveSearch("");
    setSelectedSort("");
    setCurrentPage(1);
    router.replace("/services", { scroll: false });
  };

  const categoriesList = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...(selectedCategory && selectedCategory !== "All" ? [selectedCategory] : []),
    ])
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3.5 py-1 text-xs font-medium text-accent-foreground mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Curated Treatment Menu</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
          Salon &amp; Spa Services
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          Indulge in tailored haircuts, radiant skincare, bridal styling, and restorative spa
          therapies delivered by our master specialists.
        </p>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search services by title or description..."
              aria-label="Search services"
              className="w-full rounded-md border border-border bg-card py-2.5 pl-10 pr-10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Sort By:</span>
          </span>
          <select
            value={selectedSort}
            onChange={handleSortChange}
            aria-label="Sort services"
            className="rounded-md border border-border bg-card py-2.5 px-3 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between h-[380px] rounded-lg border border-border bg-card p-5 animate-pulse"
            >
              <div>
                <div className="h-44 w-full rounded-md bg-muted mb-4" />
                <div className="flex justify-between items-center mb-2">
                  <div className="h-5 w-3/5 rounded bg-muted" />
                  <div className="h-5 w-14 rounded bg-muted" />
                </div>
                <div className="h-3.5 w-full rounded bg-muted mb-1.5" />
                <div className="h-3.5 w-4/5 rounded bg-muted" />
              </div>
              <div className="h-9 w-full rounded-md bg-muted mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center my-8">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
            Unable to Load Services
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">{error}</p>
          <Button onClick={handleRetry} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      ) : services.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card/60 p-12 text-center my-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground mb-4">
            <FilterX className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
            No Services Found
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            {activeSearch || selectedCategory !== "All"
              ? "We couldn't find any services matching your criteria. Try adjusting your filters or search terms."
              : "There are currently no active services listed. Please check back soon."}
          </p>
          {(activeSearch || selectedCategory !== "All" || selectedSort) && (
            <Button onClick={handleResetAll} variant="outline" size="sm">
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        /* Services Grid */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
              <p className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  disabled={currentPage <= 1 || isLoading}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>
                <div className="flex items-center gap-1 px-2 text-xs font-medium text-foreground">
                  {currentPage} / {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    setCurrentPage((p) =>
                      Math.min(pagination.totalPages, p + 1)
                    );
                  }}
                  disabled={currentPage >= pagination.totalPages || isLoading}
                  className="gap-1 text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <div className="h-6 w-36 bg-muted animate-pulse rounded-full mx-auto mb-4" />
            <div className="h-10 w-64 bg-muted animate-pulse rounded mx-auto mb-3" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-lg border border-border bg-card p-5 animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
