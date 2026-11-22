"use client";

import * as React from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ActiveFilterTag {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface AdminFilterToolbarProps {
  // Search
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;

  // Filter Controls (Dropdowns, date pickers, etc.)
  children?: React.ReactNode;

  // Active filter indicators
  activeTags?: ActiveFilterTag[];
  onClearAll?: () => void;

  // Results Counter
  totalCount: number;
  filteredCount: number;
  itemName?: string;

  // Optional mobile toggle or layout props
  className?: string;
}

export function AdminFilterToolbar({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
  children,
  activeTags = [],
  onClearAll,
  totalCount,
  filteredCount,
  itemName = "records",
  className = "",
}: AdminFilterToolbarProps) {
  const hasActiveFilters = activeTags.length > 0 || (searchQuery && searchQuery.trim().length > 0);
  const isFiltered = filteredCount !== totalCount;

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4 ${className}`}
    >
      {/* Top Bar: Search Input & Dropdown Slots */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Field */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-border bg-background pl-10 pr-9 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Clear search"
                aria-label="Clear search input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Custom Filter Controls Slots */}
        {children && (
          <div className="flex flex-wrap items-center gap-2.5 flex-1 lg:justify-end">
            {children}
          </div>
        )}
      </div>

      {/* Bottom Bar: Results Count & Active Tags */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
        {/* Counter */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">
            Showing <strong className="font-semibold text-primary">{filteredCount}</strong> of{" "}
            <strong>{totalCount}</strong> {itemName}
          </span>
          {isFiltered && (
            <span className="inline-flex items-center rounded-md bg-accent/60 px-2 py-0.5 text-[11px] font-medium text-primary">
              Filtered
            </span>
          )}
        </div>

        {/* Active Filter Pills & Clear All */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground mr-1">Active filters:</span>
            {activeTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/80 pl-2.5 pr-1 py-0.5 text-[11px] text-foreground transition-colors hover:border-primary/40"
              >
                <span className="text-muted-foreground">{tag.label}:</span>
                <span className="font-semibold">{tag.value}</span>
                <button
                  type="button"
                  onClick={tag.onRemove}
                  className="rounded-full p-0.5 hover:bg-background hover:text-rose-700 transition-colors ml-0.5"
                  aria-label={`Remove filter ${tag.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {onClearAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 ml-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset all</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
