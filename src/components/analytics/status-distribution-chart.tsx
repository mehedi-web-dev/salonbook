"use client";

import * as React from "react";
import { Clock, PieChart } from "lucide-react";

interface StatusDistributionChartProps {
  title?: string;
  subtitle?: string;
  pending: number;
  confirmed: number;
  cancelled: number;
  className?: string;
}

export function StatusDistributionChart({
  title = "Appointment Status Distribution",
  subtitle = "Proportion of active reservations across lifecycle stages",
  pending,
  confirmed,
  cancelled,
  className = "",
}: StatusDistributionChartProps) {
  const total = pending + confirmed + cancelled;

  const confirmedPct = total > 0 ? (confirmed / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;
  const cancelledPct = total > 0 ? (cancelled / total) * 100 : 0;

  // SVG Donut calculation
  // Radius = 40, Circumference = 2 * PI * 40 = 251.327
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const confirmedStroke = (confirmedPct / 100) * circumference;
  const pendingStroke = (pendingPct / 100) * circumference;
  const cancelledStroke = (cancelledPct / 100) * circumference;

  const confirmedOffset = 0;
  const pendingOffset = -confirmedStroke;
  const cancelledOffset = -(confirmedStroke + pendingStroke);

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <h3 className="font-serif text-base font-semibold text-foreground">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="rounded-lg bg-accent/60 p-2 text-primary">
            <PieChart className="h-4 w-4" />
          </div>
        </div>

        {total === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Clock className="h-6 w-6" />
            </div>
            <p className="mt-3 text-xs font-medium text-foreground">
              No appointments to analyze yet
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground max-w-xs mx-auto">
              Once appointments are booked, their status distribution will display here.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* SVG Donut Chart */}
            <div className="relative flex items-center justify-center">
              <svg
                width="140"
                height="140"
                viewBox="0 0 100 100"
                className="-rotate-90 transform"
                aria-hidden="true"
              >
                {/* Background ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-secondary"
                />

                {/* Confirmed segment (Emerald) */}
                {confirmed > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#059669" // emerald-600
                    strokeWidth="12"
                    strokeDasharray={`${confirmedStroke} ${circumference}`}
                    strokeDashoffset={confirmedOffset}
                    className="transition-all duration-500 ease-out"
                  />
                )}

                {/* Pending segment (Amber) */}
                {pending > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#d97706" // amber-600
                    strokeWidth="12"
                    strokeDasharray={`${pendingStroke} ${circumference}`}
                    strokeDashoffset={pendingOffset}
                    className="transition-all duration-500 ease-out"
                  />
                )}

                {/* Cancelled segment (Rose) */}
                {cancelled > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#e11d48" // rose-600
                    strokeWidth="12"
                    strokeDasharray={`${cancelledStroke} ${circumference}`}
                    strokeDashoffset={cancelledOffset}
                    className="transition-all duration-500 ease-out"
                  />
                )}
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                  {total}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Total
                </span>
              </div>
            </div>

            {/* Legend & Breakdown List */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/80 bg-background/80 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  <span className="text-xs font-medium text-foreground">Confirmed</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-serif font-bold text-emerald-800">
                    {confirmed}
                  </span>
                  <span className="text-muted-foreground">
                    ({Math.round(confirmedPct)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/80 bg-background/80 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-600" />
                  <span className="text-xs font-medium text-foreground">Pending</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-serif font-bold text-amber-800">
                    {pending}
                  </span>
                  <span className="text-muted-foreground">
                    ({Math.round(pendingPct)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/80 bg-background/80 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-600" />
                  <span className="text-xs font-medium text-foreground">Cancelled</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-serif font-bold text-rose-800">
                    {cancelled}
                  </span>
                  <span className="text-muted-foreground">
                    ({Math.round(cancelledPct)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Segmented Progress Bar Footer */}
      {total > 0 && (
        <div className="mt-6 pt-4 border-t border-border/60">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary flex">
            {confirmed > 0 && (
              <div
                style={{ width: `${confirmedPct}%` }}
                className="bg-emerald-600 transition-all duration-500"
                title={`Confirmed: ${confirmed} (${Math.round(confirmedPct)}%)`}
              />
            )}
            {pending > 0 && (
              <div
                style={{ width: `${pendingPct}%` }}
                className="bg-amber-600 transition-all duration-500"
                title={`Pending: ${pending} (${Math.round(pendingPct)}%)`}
              />
            )}
            {cancelled > 0 && (
              <div
                style={{ width: `${cancelledPct}%` }}
                className="bg-rose-600 transition-all duration-500"
                title={`Cancelled: ${cancelled} (${Math.round(cancelledPct)}%)`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
