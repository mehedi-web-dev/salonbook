"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Scissors, Award, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchBarbers } from "@/lib/barbers-api";
import type { Barber } from "@/types";

export function FeaturedBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBarbers() {
      try {
        const response = await fetchBarbers({ populate: "services" });
        if (isMounted) {
          setBarbers(response.data || []);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("[FeaturedBarbers] Could not load barbers:", err);
          setHasError(true);
          setIsLoading(false);
        }
      }
    }

    loadBarbers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 sm:py-24 border-t border-border bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3.5 py-1 text-xs font-medium text-accent-foreground mb-3 shadow-2xs">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Master Stylists &amp; Estheticians</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Meet Our Expert Barbers
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Skilled professionals dedicated to making you look and feel your best.
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-2xs animate-pulse"
              >
                <div className="w-full h-56 rounded-xl bg-muted mb-4" />
                <div className="h-5 w-3/4 rounded bg-muted mb-2" />
                <div className="h-4 w-1/2 rounded bg-muted/70 mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="h-5 w-16 rounded-full bg-muted/60" />
                  <div className="h-5 w-20 rounded-full bg-muted/60" />
                </div>
                <div className="h-3 w-full rounded bg-muted/50 mb-2" />
                <div className="h-3 w-4/5 rounded bg-muted/50" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (barbers.length === 0 || hasError) && (
          <div className="mx-auto max-w-md text-center py-12 px-6 rounded-2xl border border-dashed border-border bg-card/60 shadow-2xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground mb-4">
              <Scissors className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Our Specialists Are Being Curated
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
              We are finalizing our featured lineup of master stylists and barbers.
              In the meantime, explore our full menu of premier salon treatments.
            </p>
            <Link href="/services">
              <Button size="md" className="gap-2 font-medium">
                <span>Browse Services</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Barbers Grid */}
        {!isLoading && barbers.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {barbers.map((barber) => (
                <div
                  key={barber._id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div>
                    {/* Barber Image with Overlay */}
                    <div className="relative h-64 w-full overflow-hidden bg-muted">
                      {barber.image ? (
                        <Image
                          src={barber.image}
                          alt={barber.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary/60 text-muted-foreground">
                          <User className="h-16 w-16 opacity-40" />
                        </div>
                      )}
                      {/* Gradient overlay for text contrast */}
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-hidden="true"
                      />

                      {/* Experience Badge */}
                      {barber.experience > 0 && (
                        <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-medium text-foreground shadow-xs">
                          <Award className="h-3 w-3 text-primary" />
                          <span>{barber.experience}+ yrs exp</span>
                        </div>
                      )}
                    </div>

                    {/* Barber Details */}
                    <div className="p-6">
                      <div className="mb-2">
                        <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {barber.name}
                        </h3>
                        <p className="text-xs font-medium text-primary">
                          {barber.designation}
                        </p>
                      </div>

                      {/* Specializations */}
                      {barber.specialization && barber.specialization.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3.5">
                          {barber.specialization.slice(0, 3).map((spec, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-md border border-border/70 bg-secondary/50 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                            >
                              {spec}
                            </span>
                          ))}
                          {barber.specialization.length > 3 && (
                            <span className="inline-flex items-center rounded-md border border-border/70 bg-secondary/30 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              +{barber.specialization.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bio */}
                      {barber.bio && (
                        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                          {barber.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Associated services info / action */}
                  <div className="p-6 pt-0 mt-2">
                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                      {barber.services && barber.services.length > 0 ? (
                        <span className="text-[11px] text-muted-foreground">
                          Offers {barber.services.length} signature service{barber.services.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Dedicated Salon Care
                        </span>
                      )}
                      <Link
                        href="/services"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover transition-colors"
                      >
                        <span>Book Service</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Services Callout */}
            <div className="mt-12 text-center">
              <Link href="/services">
                <Button variant="outline" size="md" className="gap-2 font-medium">
                  <span>Explore All Services &amp; Specialists</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
