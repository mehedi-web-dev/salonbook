import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
            <Tag className="h-3 w-3" />
            {service.category}
          </span>
          <span className="text-base font-semibold text-foreground">
            ${service.price}
          </span>
        </div>

        <h3 className="font-serif text-lg font-semibold text-foreground">
          {service.name}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {service.description}
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{service.durationMinutes} mins</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <Link href={`/services/${service._id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
