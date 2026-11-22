import test from "node:test";
import assert from "node:assert/strict";

test("Salon Time Slots - Structure & Canonical 24-Hour Formats", async (t) => {
  const {
    SALON_TIME_SLOTS,
    isValidDateFormat,
    isPastDateTime,
    resolveSlotAvailability,
    formatLocalDate,
    parseLocalDate,
  } = await import("../src/lib/booking-utils.ts");

  await t.test("Defines 10 operating time slots from 09:00 to 18:00", () => {
    assert.strictEqual(SALON_TIME_SLOTS.length, 10);
    assert.strictEqual(SALON_TIME_SLOTS[0].value, "09:00");
    assert.strictEqual(SALON_TIME_SLOTS[0].label, "09:00 AM");
    assert.strictEqual(SALON_TIME_SLOTS[SALON_TIME_SLOTS.length - 1].value, "18:00");
    assert.strictEqual(
      SALON_TIME_SLOTS[SALON_TIME_SLOTS.length - 1].label,
      "06:00 PM"
    );
  });

  await t.test("All slots follow canonical 24-hour HH:mm format required by backend", () => {
    const canonicalRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (const slot of SALON_TIME_SLOTS) {
      assert.match(
        slot.value,
        canonicalRegex,
        `Slot ${slot.value} must follow HH:mm format`
      );
    }
  });

  await t.test("Slots are correctly categorized into Morning, Afternoon, and Evening", () => {
    const morning = SALON_TIME_SLOTS.filter((s) => s.period === "Morning");
    const afternoon = SALON_TIME_SLOTS.filter((s) => s.period === "Afternoon");
    const evening = SALON_TIME_SLOTS.filter((s) => s.period === "Evening");

    assert.strictEqual(morning.length, 3); // 09:00, 10:00, 11:00
    assert.strictEqual(afternoon.length, 4); // 12:00, 13:00, 14:00, 15:00
    assert.strictEqual(evening.length, 3); // 16:00, 17:00, 18:00
  });

  await t.test("isValidDateFormat validates YYYY-MM-DD calendar dates", () => {
    assert.strictEqual(isValidDateFormat("2026-11-25"), true);
    assert.strictEqual(isValidDateFormat("2026-12-01"), true);
    assert.strictEqual(isValidDateFormat("2026-02-30"), false); // invalid leap/feb date
    assert.strictEqual(isValidDateFormat("25-11-2026"), false); // non-standard
    assert.strictEqual(isValidDateFormat("invalid"), false);
  });

  await t.test("formatLocalDate and parseLocalDate preserve date boundaries without timezone drift", () => {
    const parsed = parseLocalDate("2026-12-15");
    assert.strictEqual(parsed.getFullYear(), 2026);
    assert.strictEqual(parsed.getMonth(), 11); // 0-indexed December
    assert.strictEqual(parsed.getDate(), 15);

    const formatted = formatLocalDate(parsed);
    assert.strictEqual(formatted, "2026-12-15");
  });

  await t.test("isPastDateTime correctly detects past vs future date/time slots", () => {
    // Simulated fixed time: 2026-11-22 at 14:30
    const fixedNow = new Date(2026, 10, 22, 14, 30);

    // Yesterday: always past
    assert.strictEqual(isPastDateTime("2026-11-21", "10:00", fixedNow), true);

    // Tomorrow: always future
    assert.strictEqual(isPastDateTime("2026-11-23", "09:00", fixedNow), false);

    // Today at 09:00 (< 14:30): past
    assert.strictEqual(isPastDateTime("2026-11-22", "09:00", fixedNow), true);
    assert.strictEqual(isPastDateTime("2026-11-22", "14:00", fixedNow), true);

    // Today at 15:00 (> 14:30): future/available
    assert.strictEqual(isPastDateTime("2026-11-22", "15:00", fixedNow), false);
    assert.strictEqual(isPastDateTime("2026-11-22", "18:00", fixedNow), false);
  });

  await t.test("resolveSlotAvailability correctly marks user bookings, conflicts, and availability", () => {
    const futureDate = "2026-12-05";
    const userBooked = new Set(["10:00"]);
    const conflict = new Set(["14:00"]);
    const fixedNow = new Date(2026, 10, 22, 12, 0);

    const slots = resolveSlotAvailability(futureDate, userBooked, conflict, fixedNow);

    const slot10 = slots.find((s) => s.value === "10:00");
    assert.strictEqual(slot10.isAvailable, false);
    assert.strictEqual(slot10.isUserBooked, true);
    assert.strictEqual(slot10.statusReason, "Your Booking");

    const slot14 = slots.find((s) => s.value === "14:00");
    assert.strictEqual(slot14.isAvailable, false);
    assert.strictEqual(slot14.isConflicted, true);
    assert.strictEqual(slot14.statusReason, "Booked");

    const slot11 = slots.find((s) => s.value === "11:00");
    assert.strictEqual(slot11.isAvailable, true);
    assert.strictEqual(slot11.statusReason, "Available");
  });
});
