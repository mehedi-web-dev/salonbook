import * as React from "react";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    label: string;
    positive?: boolean;
  };
  accentColor?: "primary" | "emerald" | "amber" | "rose" | "neutral";
  footer?: React.ReactNode;
}

const ACCENT_STYLES = {
  primary: {
    bg: "bg-accent/60",
    text: "text-primary",
    border: "border-primary/20",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/60",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/60",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/60",
  },
  neutral: {
    bg: "bg-secondary",
    text: "text-muted-foreground",
    border: "border-border",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "primary",
  footer,
}: StatCardProps) {
  const styles = ACCENT_STYLES[accentColor];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-primary/30 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <div className={`rounded-lg p-2 ${styles.bg} ${styles.text}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>

        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}

        {trend && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span
              className={`font-medium ${
                trend.positive ? "text-emerald-700" : "text-muted-foreground"
              }`}
            >
              {trend.label}
            </span>
          </div>
        )}
      </div>

      {footer && <div className="mt-4 pt-3 border-t border-border/60">{footer}</div>}
    </div>
  );
}
