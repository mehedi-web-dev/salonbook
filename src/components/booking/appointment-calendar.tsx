"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentCalendarProps {
  selectedDate: string; // Canonical YYYY-MM-DD
  onSelectDate: (date: string) => void;
  disabled?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Parses YYYY-MM-DD into a local Date without UTC offset issues.
 */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Formats a local Date into canonical YYYY-MM-DD.
 */
function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AppointmentCalendar({
  selectedDate,
  onSelectDate,
  disabled = false,
}: AppointmentCalendarProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => formatLocalDate(today), [today]);

  const tomorrowStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return formatLocalDate(d);
  }, [today]);

  // Selected date parsed
  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return today;
    return parseLocalDate(selectedDate);
  }, [selectedDate, today]);

  // Current viewing month and year
  const [viewYear, setViewYear] = useState<number>(selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDateObj.getMonth());

  // Check if viewing current month (to disable "Previous Month" button for past months)
  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const handlePrevMonth = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Build calendar matrix
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday...
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // 1. Trailing days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, d);
      days.push({
        dateStr: formatLocalDate(prevDate),
        dayNumber: d,
        isCurrentMonth: false,
        isPast: true,
        isToday: false,
        isSelected: false,
      });
    }

    // 2. Days of current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateObj = new Date(viewYear, viewMonth, day);
      dateObj.setHours(0, 0, 0, 0);
      const dateStr = formatLocalDate(dateObj);
      const isPast = dateObj < today;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;

      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isPast,
        isToday,
        isSelected,
      });
    }

    // 3. Leading days for next month (fill up to multiple of 7, up to 35 or 42)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
      const nextDate = new Date(viewYear, viewMonth + 1, nextDay);
      days.push({
        dateStr: formatLocalDate(nextDate),
        dayNumber: nextDay,
        isCurrentMonth: false,
        isPast: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  }, [viewYear, viewMonth, today, todayStr, selectedDate]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
      {/* Calendar Header with Month Navigation */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/70">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Select an available date for your salon appointment
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            disabled={disabled || isCurrentMonth}
            aria-label="Previous Month"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            disabled={disabled}
            aria-label="Next Month"
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onSelectDate(todayStr);
            setViewYear(today.getFullYear());
            setViewMonth(today.getMonth());
          }}
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border ${
            selectedDate === todayStr
              ? "border-primary bg-primary text-primary-foreground font-semibold"
              : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
          }`}
        >
          Today
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onSelectDate(tomorrowStr);
            const d = parseLocalDate(tomorrowStr);
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
          }}
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border ${
            selectedDate === tomorrowStr
              ? "border-primary bg-primary text-primary-foreground font-semibold"
              : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
          }`}
        >
          Tomorrow
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5" role="row">
        {DAY_LABELS.map((day) => (
          <div
            key={day}
            className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Appointment Calendar">
        {calendarDays.map((day, idx) => {
          if (!day.isCurrentMonth) {
            return (
              <div
                key={idx}
                className="h-9 sm:h-10 flex items-center justify-center text-xs text-muted-foreground/30 select-none"
              >
                {day.dayNumber}
              </div>
            );
          }

          if (day.isPast) {
            return (
              <div
                key={idx}
                title="Past date unavailable for booking"
                className="h-9 sm:h-10 flex items-center justify-center text-xs text-muted-foreground/40 cursor-not-allowed select-none rounded-md"
              >
                {day.dayNumber}
              </div>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(day.dateStr)}
              className={`h-9 sm:h-10 text-xs rounded-md font-medium transition-all flex flex-col items-center justify-center relative ${
                day.isSelected
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : day.isToday
                  ? "border border-primary/60 text-primary font-semibold hover:bg-accent/80 hover:text-accent-foreground"
                  : "text-foreground hover:bg-secondary/80"
              }`}
              aria-label={`Select ${day.dateStr}`}
              aria-pressed={day.isSelected}
            >
              <span>{day.dayNumber}</span>
              {day.isToday && !day.isSelected && (
                <span className="h-1 w-1 rounded-full bg-primary absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Summary Tag */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Chosen Date:</span>
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>
            {new Date(selectedDateObj.getTime() + selectedDateObj.getTimezoneOffset() * 60000).toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )}
          </span>
        </span>
      </div>
    </div>
  );
}
