import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeAppointmentStats,
  formatCurrency,
  computeCustomerExpenditure,
  groupAppointmentsByMonth,
} from "../src/lib/analytics-utils.ts";

describe("Dashboard Analytics - computeAppointmentStats", () => {
  it("computes accurate status counts and percentages for mixed appointments", () => {
    const mockAppointments = [
      { status: "pending" },
      { status: "confirmed" },
      { status: "confirmed" },
      { status: "cancelled" },
    ];

    const stats = computeAppointmentStats(mockAppointments);

    assert.equal(stats.total, 4);
    assert.equal(stats.pending, 1);
    assert.equal(stats.confirmed, 2);
    assert.equal(stats.cancelled, 1);
    assert.equal(stats.pendingPct, 25);
    assert.equal(stats.confirmedPct, 50);
    assert.equal(stats.cancelledPct, 25);
  });

  it("handles empty appointments array without division by zero", () => {
    const stats = computeAppointmentStats([]);

    assert.equal(stats.total, 0);
    assert.equal(stats.pending, 0);
    assert.equal(stats.confirmed, 0);
    assert.equal(stats.cancelled, 0);
    assert.equal(stats.pendingPct, 0);
    assert.equal(stats.confirmedPct, 0);
    assert.equal(stats.cancelledPct, 0);
  });

  it("handles null or undefined elements gracefully", () => {
    const stats = computeAppointmentStats([null, undefined, { status: "confirmed" }]);

    assert.equal(stats.total, 3);
    assert.equal(stats.confirmed, 1);
    assert.equal(stats.pending, 0);
    assert.equal(stats.cancelled, 0);
  });
});

describe("Dashboard Analytics - formatCurrency", () => {
  it("formats USD currency with dollar sign and commas", () => {
    assert.equal(formatCurrency(1250.5), "$1,250.50");
    assert.equal(formatCurrency(0, "usd"), "$0.00");
  });

  it("formats EUR with euro symbol", () => {
    assert.equal(formatCurrency(75, "eur"), "€75.00");
  });

  it("formats GBP with pound symbol", () => {
    assert.equal(formatCurrency(99.99, "gbp"), "£99.99");
  });

  it("formats other currencies with uppercase code", () => {
    assert.equal(formatCurrency(500, "cad"), "CAD 500.00");
  });

  it("handles NaN or undefined gracefully", () => {
    assert.equal(formatCurrency(Number.NaN), "$0.00");
  });
});

describe("Dashboard Analytics - computeCustomerExpenditure", () => {
  it("computes revenue strictly from verified paid transactions and ignores failed/pending", () => {
    const mockPayments = [
      { amount: 120, currency: "usd", status: "paid" },
      { amount: 50, currency: "usd", status: "paid" },
      { amount: 200, currency: "usd", status: "failed" },
      { amount: 80, currency: "usd", status: "pending" },
      { amount: 75, currency: "eur", status: "paid" },
    ];

    const result = computeCustomerExpenditure(mockPayments);

    assert.equal(result.totalTransactions, 5);
    assert.equal(result.paidCount, 3);
    assert.equal(result.failedCount, 1);

    // Check currency isolation
    const usd = result.byCurrency.find((c) => c.currency === "usd");
    assert.ok(usd);
    assert.equal(usd.totalAmount, 170); // 120 + 50
    assert.equal(usd.count, 2);

    const eur = result.byCurrency.find((c) => c.currency === "eur");
    assert.ok(eur);
    assert.equal(eur.totalAmount, 75);
    assert.equal(eur.count, 1);

    assert.equal(result.primaryTotalDisplay, "$170.00");
  });

  it("returns zero expenditure for empty payments array", () => {
    const result = computeCustomerExpenditure([]);

    assert.equal(result.totalTransactions, 0);
    assert.equal(result.paidCount, 0);
    assert.equal(result.failedCount, 0);
    assert.deepEqual(result.byCurrency, []);
    assert.equal(result.primaryTotalDisplay, "$0.00");
  });
});

describe("Dashboard Analytics - groupAppointmentsByMonth", () => {
  it("generates a continuous rolling 6-month timeline with counts", () => {
    const refDate = new Date(2026, 10, 22); // Nov 2026

    const mockAppointments = [
      { appointmentDate: "2026-11-05" },
      { appointmentDate: "2026-11-15" },
      { appointmentDate: "2026-10-20" },
      { appointmentDate: "2026-08-12" },
      { appointmentDate: "2025-01-01" }, // outside 6-month window
    ];

    const timeline = groupAppointmentsByMonth(mockAppointments, 6, refDate);

    assert.equal(timeline.length, 6);
    assert.equal(timeline[5].monthKey, "2026-11");
    assert.equal(timeline[5].label, "Nov");
    assert.equal(timeline[5].count, 2);

    assert.equal(timeline[4].monthKey, "2026-10");
    assert.equal(timeline[4].label, "Oct");
    assert.equal(timeline[4].count, 1);

    assert.equal(timeline[2].monthKey, "2026-08");
    assert.equal(timeline[2].label, "Aug");
    assert.equal(timeline[2].count, 1);

    assert.equal(timeline[3].monthKey, "2026-09");
    assert.equal(timeline[3].count, 0);
  });

  it("handles empty appointments array by returning 0 counts for all months", () => {
    const refDate = new Date(2026, 10, 22);
    const timeline = groupAppointmentsByMonth([], 6, refDate);

    assert.equal(timeline.length, 6);
    assert.ok(timeline.every((t) => t.count === 0));
  });
});
