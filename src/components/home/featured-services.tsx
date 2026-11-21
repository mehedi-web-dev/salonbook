"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, RefreshCw, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/services/service-card";
import { fetchServices } from "@/lib/services-api";
import type { Service } from "@/types";

export function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function executeFetch() {
      try {
        // Fetch up to 12 active services to select at least 6 featured
        const response = await fetchServices({ limit: 12 });
        if (!isCurrent) return;

        const allServices = response.data || [];
        const activeServices = allServices.filter((s: Service) => s.isActive !== false);

        setTotalCount(response.pagination?.total || activeServices.length);

        // Display at least 6 featured services if 6 or more exist; otherwise show all available
        if (activeServices.length >= 6) {
          setServices(activeServices.slice(0, 6));
        } else {
          setServices(activeServices);
        }
        setError(null);
      } catch (err) {
        if (!isCurrent) return;
        setError(
          err instanceof Error ? err.message : "Failed to load featured salon services"
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
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-0.5 text-xs font-medium text-accent-foreground mb-3">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Signature Experiences</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              Featured Salon Services
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl">
              Handpicked treatments popular among our clientele for their transformative artistry,
              nourishing care, and radiant results.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            <span>View All Services</span>
            {totalCount > 0 && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                {totalCount}
              </span>
            )}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Dynamic Services Grid */}
        {isLoading ? (
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
          <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center my-6">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground mb-1">
              Unable to Load Featured Services
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-5">{error}</p>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Loading Services</span>
            </Button>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card/60 p-12 text-center my-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
              No Services Currently Available
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-5">
              Our specialists are currently curating new treatments. Please check back shortly.
            </p>
            <Link href="/services">
              <Button variant="outline" size="sm">
                Check Full Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>

            {/* Bottom Callout & Link */}
            <div className="mt-12 text-center pt-6 border-t border-border/60">
              <Link href="/services">
                <Button size="lg" variant="outline" className="px-8 font-medium shadow-2xs">
                  <span>Explore Full Menu ({totalCount} Services)</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
