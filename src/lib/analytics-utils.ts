/**
 * Analytics and statistics utility functions for SalonBook dashboards.
 * Pure computation helpers supporting both Customer and Admin portals.
 */

export interface AppointmentStatusCounts {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  pendingPct: number;
  confirmedPct: number;
  cancelledPct: number;
}

export interface CurrencyExpenditure {
  currency: string;
  totalAmount: number;
  count: number;
}

export interface CustomerExpenditureSummary {
  totalTransactions: number;
  paidCount: number;
  failedCount: number;
  byCurrency: CurrencyExpenditure[];
  primaryTotalDisplay: string;
}

export interface MonthlyAppointmentBucket {
  monthKey: string; // e.g. "2026-11"
  label: string; // e.g. "Nov"
  fullLabel: string; // e.g. "Nov 2026"
  count: number;
}

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Computes appointment counts and percentages from an array of appointment records.
 */
export function computeAppointmentStats(
  appointments: Array<{ status?: string } | null | undefined>
): AppointmentStatusCounts {
  if (!Array.isArray(appointments) || appointments.length === 0) {
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      pendingPct: 0,
      confirmedPct: 0,
      cancelledPct: 0,
    };
  }

  let pending = 0;
  let confirmed = 0;
  let cancelled = 0;

  for (const item of appointments) {
    if (!item) continue;
    const status = (item.status || "").toLowerCase().trim();
    if (status === "pending") pending++;
    else if (status === "confirmed") confirmed++;
    else if (status === "cancelled") cancelled++;
  }

  const total = appointments.length;

  return {
    total,
    pending,
    confirmed,
    cancelled,
    pendingPct: total > 0 ? Math.round((pending / total) * 100) : 0,
    confirmedPct: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    cancelledPct: total > 0 ? Math.round((cancelled / total) * 100) : 0,
  };
}

/**
 * Formats a numeric currency value with appropriate symbol and decimals.
 */
export function formatCurrency(amount: number, currency = "usd"): string {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const curr = (currency || "usd").toLowerCase().trim();

  let symbol = "$";
  if (curr === "eur") symbol = "€";
  else if (curr === "gbp") symbol = "£";
  else if (curr !== "usd") symbol = `${curr.toUpperCase()} `;

  const formattedNumber = safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formattedNumber}`;
}

/**
 * Computes customer expenditure summary strictly from verified paid transactions.
 * Note: Revenue or expenditure is NEVER calculated from pending or cancelled appointments.
 */
export function computeCustomerExpenditure(
  payments: Array<{
    amount?: number;
    currency?: string;
    status?: string;
  } | null | undefined>
): CustomerExpenditureSummary {
  if (!Array.isArray(payments) || payments.length === 0) {
    return {
      totalTransactions: 0,
      paidCount: 0,
      failedCount: 0,
      byCurrency: [],
      primaryTotalDisplay: "$0.00",
    };
  }

  const currencyMap = new Map<string, { totalAmount: number; count: number }>();
  let paidCount = 0;
  let failedCount = 0;

  for (const item of payments) {
    if (!item) continue;
    const status = (item.status || "").toLowerCase().trim();

    if (status === "paid") {
      paidCount++;
      const curr = (item.currency || "usd").toLowerCase().trim();
      const amt = typeof item.amount === "number" && !isNaN(item.amount) ? item.amount : 0;

      const existing = currencyMap.get(curr) || { totalAmount: 0, count: 0 };
      existing.totalAmount += amt;
      existing.count += 1;
      currencyMap.set(curr, existing);
    } else if (status === "failed") {
      failedCount++;
    }
  }

  const byCurrency: CurrencyExpenditure[] = Array.from(currencyMap.entries()).map(
    ([currency, data]) => ({
      currency,
      totalAmount: Math.round(data.totalAmount * 100) / 100,
      count: data.count,
    })
  );

  // Pick primary display: USD if exists, else first currency, else $0.00
  let primaryTotalDisplay = "$0.00";
  if (byCurrency.length > 0) {
    const usdItem = byCurrency.find((c) => c.currency === "usd");
    const target = usdItem || byCurrency[0];
    primaryTotalDisplay = formatCurrency(target.totalAmount, target.currency);
  }

  return {
    totalTransactions: payments.length,
    paidCount,
    failedCount,
    byCurrency,
    primaryTotalDisplay,
  };
}

/**
 * Groups appointments by month based on appointmentDate (YYYY-MM-DD) or createdAt.
 * Produces a contiguous timeline of the most recent N months ending in the reference date.
 */
export function groupAppointmentsByMonth(
  appointments: Array<{
    appointmentDate?: string;
    createdAt?: string;
  } | null | undefined>,
  monthsCount = 6,
  referenceDate = new Date()
): MonthlyAppointmentBucket[] {
  // Generate the rolling window of months (oldest to newest)
  const buckets: MonthlyAppointmentBucket[] = [];
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth(); // 0-11

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(refYear, refMonth - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const label = MONTH_NAMES_SHORT[month];
    const fullLabel = `${label} ${year}`;
    buckets.push({
      monthKey,
      label,
      fullLabel,
      count: 0,
    });
  }

  if (!Array.isArray(appointments) || appointments.length === 0) {
    return buckets;
  }

  const bucketMap = new Map<string, number>();
  for (const b of buckets) {
    bucketMap.set(b.monthKey, 0);
  }

  for (const app of appointments) {
    if (!app) continue;
    // Prefer appointmentDate (YYYY-MM-DD) then createdAt (ISO)
    const rawDate = app.appointmentDate || app.createdAt;
    if (!rawDate) continue;

    const key = rawDate.slice(0, 7); // "YYYY-MM"
    if (bucketMap.has(key)) {
      bucketMap.set(key, (bucketMap.get(key) || 0) + 1);
    }
  }

  return buckets.map((b) => ({
    ...b,
    count: bucketMap.get(b.monthKey) || 0,
  }));
}
