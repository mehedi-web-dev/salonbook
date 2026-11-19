"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Tag, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [imgError, setImgError] = useState(false);
  const duration = service.duration ?? service.durationMinutes ?? 0;
  const description = service.shortDescription || service.description;

  return (
    <div className="group flex flex-col justify-between h-full rounded-lg border border-border bg-card overflow-hidden shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/40">
      <div>
        {/* Service Image / Fallback Container */}
        <div className="relative h-48 w-full overflow-hidden bg-secondary/60">
          {service.image && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={service.image}
              alt={service.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-secondary/40 to-secondary text-muted-foreground/80">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Sparkles className="h-6 w-6" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {service.category || "Salon Service"}
              </span>
            </div>
          )}

          {/* Category Tag Overlay */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-medium text-foreground shadow-xs">
              <Tag className="h-3 w-3 text-primary" />
              {service.category}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {service.name}
            </h3>
            <span className="text-lg font-semibold text-foreground shrink-0">
              ${service.price}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {description}
          </p>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-foreground/60" />
            <span>{duration} mins</span>
          </div>
        </div>
      </div>

      {/* Card Action Link */}
      <div className="p-5 pt-0">
        <Link href={`/services/${service._id}`} className="block w-full">
          <Button
            variant="outline"
            size="md"
            className="w-full justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
