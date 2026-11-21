"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scissors,
  Sparkles,
  Heart,
  Flower2,
  Gem,
  Droplets,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Tag,
} from "lucide-react";
import { fetchServices } from "@/lib/services-api";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types";

interface CategoryItem {
  name: string;
  count: number;
}

// Map category names to Lucide icons
function getCategoryIcon(categoryName: string) {
  const normalized = categoryName.toLowerCase();
  if (normalized.includes("hair")) return Scissors;
  if (normalized.includes("color") || normalized.includes("treatment")) return Sparkles;
  if (normalized.includes("bridal") || normalized.includes("wedding")) return Heart;
  if (normalized.includes("spa") || normalized.includes("massage")) return Flower2;
  if (normalized.includes("nail") || normalized.includes("manicure") || normalized.includes("pedicure")) return Gem;
  if (normalized.includes("skin") || normalized.includes("facial")) return Droplets;
  return Sparkles;
}

export function FeaturedCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function executeFetch() {
      try {
        const response = await fetchServices({ limit: 50 });
        if (!isCurrent) return;

        const services = response.data || [];
        const activeServices = services.filter((s: Service) => s.isActive !== false);

        // Deduplicate categories and calculate service counts
        const countsMap = new Map<string, number>();
        for (const service of activeServices) {
          const cat = service.category?.trim();
          if (cat) {
            countsMap.set(cat, (countsMap.get(cat) || 0) + 1);
          }
        }

        const list: CategoryItem[] = Array.from(countsMap.entries()).map(
          ([name, count]) => ({ name, count })
        );

        // Sort categories: highest count first, then alphabetical
        list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

        setCategories(list);
        setError(null);
      } catch (err) {
        if (!isCurrent) return;
        setError(
          err instanceof Error ? err.message : "Failed to load salon categories"
        );
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    executeFetch();

    return () => {
      isCurrent = false;
    };
  }, [retryTrigger]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryTrigger((prev) => prev + 1);
  };

  return (
    <section className="py-16 sm:py-20 border-t border-border bg-card/40">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-0.5 text-xs font-medium text-accent-foreground mb-3">
              <Tag className="h-3 w-3 text-primary" />
              <span>Artisanal Specialties</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              Browse by Category
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl">
              Explore specialized treatments crafted by our master stylists, colorists, and estheticians.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Dynamic Categories Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-background animate-pulse"
              >
                <div className="h-10 w-10 rounded-full bg-muted mb-3" />
                <div className="h-4 w-20 rounded bg-muted mb-2" />
                <div className="h-3 w-12 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
              Unable to load service categories
            </p>
            <p className="text-xs text-muted-foreground max-w-md mb-4">{error}</p>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
            No service categories available at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              return (
                <Link
                  key={cat.name}
                  href={`/services?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col items-center text-center p-4 rounded-xl border border-border bg-background transition-all duration-200 hover:border-primary/50 hover:shadow-sm hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <span className="mt-1 text-[11px] text-muted-foreground">
                    {cat.count} {cat.count === 1 ? "Service" : "Services"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
