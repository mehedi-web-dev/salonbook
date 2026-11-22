"use client";

import * as React from "react";
import {
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/analytics-utils";

interface CurrencyRevenue {
  currency: string;
  totalAmount: number;
  count: number;
}

interface TransactionHealth {
  total: number;
  paid: number;
  failed: number;
  reconciliationRequired: number;
}

interface RevenueOverviewChartProps {
  byCurrency: CurrencyRevenue[];
  transactions?: TransactionHealth;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function RevenueOverviewChart({
  byCurrency,
  transactions,
  title = "Verified Paid Revenue",
  subtitle = "Reconciled funds strictly from verified Stripe transactions",
  className = "",
}: RevenueOverviewChartProps) {
  const hasRevenue = byCurrency && byCurrency.length > 0;

  // Compute transaction health percentages if provided
  const totalTx = transactions?.total || 0;
  const paidPct = totalTx > 0 ? ((transactions?.paid || 0) / totalTx) * 100 : 0;
  const failedPct = totalTx > 0 ? ((transactions?.failed || 0) / totalTx) * 100 : 0;
  const reconPct =
    totalTx > 0 ? ((transactions?.reconciliationRequired || 0) / totalTx) * 100 : 0;

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200/60 p-2 text-emerald-700">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[11px] font-medium text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Stripe Webhook Verified</span>
          </div>
        </div>

        {/* Currency Cards */}
        <div className="mt-6">
          {hasRevenue ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {byCurrency.map((item) => {
                const avgSize =
                  item.count > 0 ? item.totalAmount / item.count : 0;

                return (
                  <div
                    key={item.currency}
                    className="rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:border-primary/40 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-background px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-foreground border border-border">
                        {item.currency.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.count} {item.count === 1 ? "payment" : "payments"}
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Settled Volume
                      </span>
                      <div className="font-serif text-2xl font-bold tracking-tight text-foreground">
                        {formatCurrency(item.totalAmount, item.currency)}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Avg Transaction:</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(avgSize, item.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center rounded-xl border border-dashed border-border bg-secondary/10">
              <DollarSign className="mx-auto h-7 w-7 text-muted-foreground/50 mb-1" />
              <p className="text-xs font-medium text-foreground">
                No verified payments recorded yet
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground max-w-sm mx-auto">
                Completed customer checkouts processed through Stripe will appear here with isolated currency totals.
              </p>
            </div>
          )}
        </div>

        {/* Transaction Health Strip */}
        {transactions && totalTx > 0 && (
          <div className="mt-6 pt-5 border-t border-border/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transaction Pipeline Health
              </span>
              <span className="text-xs text-muted-foreground">
                {totalTx} Total Transactions
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary flex">
              {transactions.paid > 0 && (
                <div
                  style={{ width: `${paidPct}%` }}
                  className="bg-emerald-600 transition-all duration-500"
                  title={`Paid: ${transactions.paid} (${Math.round(paidPct)}%)`}
                />
              )}
              {transactions.reconciliationRequired > 0 && (
                <div
                  style={{ width: `${reconPct}%` }}
                  className="bg-amber-600 transition-all duration-500"
                  title={`Reconciliation: ${transactions.reconciliationRequired} (${Math.round(reconPct)}%)`}
                />
              )}
              {transactions.failed > 0 && (
                <div
                  style={{ width: `${failedPct}%` }}
                  className="bg-rose-600 transition-all duration-500"
                  title={`Failed: ${transactions.failed} (${Math.round(failedPct)}%)`}
                />
              )}
            </div>

            {/* Health Legend */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-foreground font-medium">
                  {transactions.paid} Paid
                </span>
                <span className="text-muted-foreground">
                  ({Math.round(paidPct)}%)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-foreground font-medium">
                  {transactions.reconciliationRequired} Review
                </span>
                <span className="text-muted-foreground">
                  ({Math.round(reconPct)}%)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                <span className="text-foreground font-medium">
                  {transactions.failed} Failed
                </span>
                <span className="text-muted-foreground">
                  ({Math.round(failedPct)}%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-primary" />
          <span>Strict isolation by currency — never combined</span>
        </span>
        <span className="text-[10px] text-muted-foreground">
          Pending appointments excluded
        </span>
      </div>
    </div>
  );
}
