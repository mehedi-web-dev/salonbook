"use client";

import * as React from "react";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";
import type { MonthlyAppointmentBucket } from "@/lib/analytics-utils";

interface MonthlyTrendChartProps {
  data: MonthlyAppointmentBucket[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function MonthlyTrendChart({
  data,
  title = "Appointment Booking Trends",
  subtitle = "Monthly reservation volume over the last 6 months",
  className = "",
}: MonthlyTrendChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 0);
  const totalInPeriod = data.reduce((acc, d) => acc + d.count, 0);

  // Use a sensible baseline ceiling for nice visual proportion
  const chartCeiling = maxCount > 0 ? Math.max(maxCount, 4) : 4;

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
          <div>
            <h3 className="font-serif text-base font-semibold text-foreground">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground">
              <Calendar className="h-3 w-3 text-primary" />
              <span>{totalInPeriod} Total Bookings</span>
            </span>
            <div className="rounded-lg bg-accent/60 p-2 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
        </div>

        {totalInPeriod === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="mt-3 text-xs font-medium text-foreground">
              No reservation activity in this period
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground max-w-xs mx-auto">
              As appointments are booked throughout the months, monthly trend volume will graph here.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            {/* Chart Area */}
            <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 pt-6 pb-2 px-2 border-b border-border/60">
              {data.map((item) => {
                const heightPct =
                  item.count > 0 ? (item.count / chartCeiling) * 100 : 0;

                return (
                  <div
                    key={item.monthKey}
                    className="group relative flex flex-1 flex-col items-center h-full justify-end"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 hidden group-hover:flex items-center justify-center rounded bg-foreground px-2 py-1 text-[10px] font-medium text-background shadow-xs whitespace-nowrap z-10 transition-opacity">
                      {item.fullLabel}: {item.count} {item.count === 1 ? "booking" : "bookings"}
                    </div>

                    {/* Count label above bar */}
                    <span
                      className={`mb-1.5 text-xs font-bold transition-colors ${
                        item.count > 0
                          ? "text-primary"
                          : "text-muted-foreground/40 font-normal"
                      }`}
                    >
                      {item.count}
                    </span>

                    {/* Bar container */}
                    <div className="w-full max-w-[42px] bg-secondary/50 rounded-t-md h-full flex items-end overflow-hidden">
                      <div
                        style={{ height: `${Math.max(heightPct, item.count > 0 ? 8 : 2)}%` }}
                        className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                          item.count > 0
                            ? "bg-primary group-hover:bg-primary/80"
                            : "bg-muted-foreground/10"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 pt-2 text-center">
              {data.map((item) => (
                <div key={item.monthKey} className="flex-1">
                  <span className="block text-xs font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {item.monthKey.slice(2, 4)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Timeline: Last 6 Operating Months</span>
        <span className="flex items-center gap-1 font-medium text-foreground">
          <TrendingUp className="h-3 w-3 text-emerald-600" />
          <span>Live Appointment Telemetry</span>
        </span>
      </div>
    </div>
  );
}
