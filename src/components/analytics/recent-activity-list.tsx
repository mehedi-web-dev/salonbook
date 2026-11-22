"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  amount?: string;
  status: "pending" | "confirmed" | "cancelled" | "paid" | "failed" | "reconciliation_required" | string;
  badgeLabel?: string;
  href?: string;
}

interface RecentActivityListProps {
  title: string;
  subtitle?: string;
  items: ActivityItem[];
  emptyMessage?: string;
  emptySubtext?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  type?: "appointments" | "transactions";
  className?: string;
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  reconciliation_required: "bg-amber-100 text-amber-800 border-amber-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  failed: "bg-rose-100 text-rose-800 border-rose-200",
};

export function RecentActivityList({
  title,
  subtitle,
  items,
  emptyMessage = "No activity recorded yet",
  emptySubtext = "When new activity occurs, it will display here.",
  viewAllHref,
  viewAllLabel = "View All",
  type = "appointments",
  className = "",
}: RecentActivityListProps) {
  const Icon = type === "appointments" ? Calendar : CreditCard;

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-accent/60 p-2 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-foreground">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>{viewAllLabel}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-10 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs font-medium text-foreground">{emptyMessage}</p>
            <p className="mt-1 text-[11px] text-muted-foreground max-w-xs mx-auto">
              {emptySubtext}
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border/60">
            {items.map((item) => {
              const statusNormalized = item.status.toLowerCase();
              const badgeStyle =
                STATUS_BADGE_STYLES[statusNormalized] ||
                "bg-secondary text-secondary-foreground border-border";

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3.5 first:pt-2 last:pb-2 transition-colors hover:bg-secondary/20 px-2 rounded-lg"
                >
                  <div className="min-w-0 pr-3 space-y-0.5">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.subtitle}</span>
                      <span>&bull;</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.amount && (
                      <span className="font-serif text-sm font-bold text-foreground">
                        {item.amount}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${badgeStyle}`}
                    >
                      {item.badgeLabel || item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewAllHref && items.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/60">
          <Link href={viewAllHref} className="block w-full">
            <Button variant="outline" size="sm" className="w-full text-xs">
              <span>{viewAllLabel}</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
