"use client";

import { useMemo } from "react";
import { Clock, Check, AlertCircle, UserCheck, Info } from "lucide-react";
import {
  SALON_TIME_SLOTS,
  resolveSlotAvailability,
  type TimeSlotItem,
} from "@/lib/booking-utils";

export { SALON_TIME_SLOTS };
export type { TimeSlotItem };

interface TimeSlotSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  selectedSlot: string; // "10:00"
  onSelectSlot: (slot: string) => void;
  userBookedSlots?: Set<string>; // Slots already booked by the logged-in customer on this date
  conflictSlots?: Set<string>; // Slots reported as booked by the backend (409 conflict)
  disabled?: boolean;
}

export function TimeSlotSelector({
  selectedDate,
  selectedSlot,
  onSelectSlot,
  userBookedSlots = new Set(),
  conflictSlots = new Set(),
  disabled = false,
}: TimeSlotSelectorProps) {
  // Determine availability status for each slot using centralized utility
  const slotStatuses = useMemo(() => {
    return resolveSlotAvailability(selectedDate, userBookedSlots, conflictSlots);
  }, [selectedDate, userBookedSlots, conflictSlots]);

  const availableCount = slotStatuses.filter((s) => s.isAvailable).length;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-border/70">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Salon Time Slots</span>
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Select a preferred session time slot for your service
          </p>
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>{availableCount} Available</span>
          </span>
        </div>
      </div>

      {/* Notice regarding live server booking validation */}
      <div className="mb-4 rounded-lg border border-border/60 bg-secondary/30 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
        <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Operating hours: 9:00 AM – 7:00 PM. Slots are reserved directly on salon reservation servers with duplicate-booking protection.
        </span>
      </div>

      {/* Time Slot Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {slotStatuses.map((slot) => {
          const isSelected = selectedSlot === slot.value;

          if (!slot.isAvailable) {
            return (
              <div
                key={slot.value}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-border/40 bg-muted/40 text-muted-foreground/60 cursor-not-allowed select-none min-h-[56px]"
                title={`${slot.label} is unavailable (${slot.statusReason})`}
              >
                <div className="flex items-center gap-1 text-xs line-through opacity-70">
                  <Clock className="h-3 w-3" />
                  <span>{slot.label}</span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/80 mt-0.5">
                  {slot.isUserBooked ? (
                    <span className="flex items-center gap-0.5 text-primary/80 font-semibold">
                      <UserCheck className="h-2.5 w-2.5" />
                      <span>Reserved</span>
                    </span>
                  ) : slot.isConflicted ? (
                    <span className="flex items-center gap-0.5 text-amber-700 font-semibold">
                      <AlertCircle className="h-2.5 w-2.5" />
                      <span>Booked</span>
                    </span>
                  ) : (
                    <span>{slot.statusReason}</span>
                  )}
                </span>
              </div>
            );
          }

          return (
            <button
              key={slot.value}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSlot(slot.value)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all min-h-[56px] ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold ring-2 ring-primary/20"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/60"
              }`}
              aria-label={`Select time slot ${slot.label}`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>{slot.label}</span>
              </div>
              <span
                className={`text-[10px] mt-0.5 ${
                  isSelected ? "text-primary-foreground/90 font-medium" : "text-muted-foreground"
                }`}
              >
                {slot.period}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Slot Information */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Selected Time:</span>
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-primary" />
          <span>
            {SALON_TIME_SLOTS.find((s) => s.value === selectedSlot)?.label || selectedSlot}
          </span>
        </span>
      </div>
    </div>
  );
}
