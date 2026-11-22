import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  filterAppointments,
  filterServices,
  filterUsers,
  filterTransactions,
} from "../src/lib/filter-utils.ts";

describe("Admin Filter Utils - filterAppointments", () => {
  const mockAppointments = [
    {
      _id: "app-1",
      serviceId: "srv-1",
      appointmentDate: "2026-11-20",
      timeSlot: "10:00",
      servicePrice: 120,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: "2026-11-19T10:00:00.000Z",
      service: { _id: "srv-1", name: "Balayage Highlights", category: "Hair" },
      customer: { _id: "c-1", name: "Alice Smith", email: "alice@example.com" },
    },
    {
      _id: "app-2",
      serviceId: "srv-2",
      appointmentDate: "2026-11-22",
      timeSlot: "14:00",
      servicePrice: 65,
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: "2026-11-21T09:00:00.000Z",
      service: { _id: "srv-2", name: "Classic Gel Manicure", category: "Nails" },
      customer: { _id: "c-2", name: "Bob Jones", email: "bob@example.com" },
    },
    {
      _id: "app-3",
      serviceId: "srv-1",
      appointmentDate: "2026-11-25",
      timeSlot: "16:00",
      servicePrice: 120,
      status: "cancelled",
      paymentStatus: "unpaid",
      createdAt: "2026-11-15T12:00:00.000Z",
      service: { _id: "srv-1", name: "Balayage Highlights", category: "Hair" },
      customer: { _id: "c-3", name: "Charlie Brown", email: "charlie@example.com" },
    },
  ];

  it("searches appointments by customer name or email", () => {
    const results = filterAppointments(mockAppointments, { search: "alice" });
    assert.equal(results.length, 1);
    assert.equal(results[0]._id, "app-1");

    const emailResults = filterAppointments(mockAppointments, { search: "bob@example.com" });
    assert.equal(emailResults.length, 1);
    assert.equal(emailResults[0]._id, "app-2");
  });

  it("searches appointments by service name", () => {
    const results = filterAppointments(mockAppointments, { search: "manicure" });
    assert.equal(results.length, 1);
    assert.equal(results[0]._id, "app-2");
  });

  it("filters by status and payment status", () => {
    const pendingOnly = filterAppointments(mockAppointments, { status: "pending" });
    assert.equal(pendingOnly.length, 1);
    assert.equal(pendingOnly[0].status, "pending");

    const paidOnly = filterAppointments(mockAppointments, { paymentStatus: "paid" });
    assert.equal(paidOnly.length, 1);
    assert.equal(paidOnly[0]._id, "app-2");
  });

  it("filters by date range", () => {
    const rangeResults = filterAppointments(mockAppointments, {
      startDate: "2026-11-21",
      endDate: "2026-11-23",
    });
    assert.equal(rangeResults.length, 1);
    assert.equal(rangeResults[0]._id, "app-2");
  });

  it("sorts by newest and oldest appointment date", () => {
    const newest = filterAppointments(mockAppointments, { sortBy: "newest" });
    assert.equal(newest[0]._id, "app-3"); // 2026-11-25

    const oldest = filterAppointments(mockAppointments, { sortBy: "oldest" });
    assert.equal(oldest[0]._id, "app-1"); // 2026-11-20
  });

  it("handles combined multi-criteria filters together", () => {
    const combined = filterAppointments(mockAppointments, {
      search: "balayage",
      status: "pending",
      paymentStatus: "unpaid",
      serviceId: "srv-1",
    });
    assert.equal(combined.length, 1);
    assert.equal(combined[0]._id, "app-1");
  });

  it("handles empty or invalid list gracefully", () => {
    assert.deepEqual(filterAppointments([], {}), []);
  });
});

describe("Admin Filter Utils - filterServices", () => {
  const mockServices = [
    {
      _id: "s-1",
      name: "Deluxe Haircut",
      category: "Hair",
      price: 85,
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      _id: "s-2",
      name: "Facial Glow",
      category: "Skin Care",
      price: 130,
      isActive: false,
      createdAt: "2026-03-01T00:00:00.000Z",
    },
    {
      _id: "s-3",
      name: "Express Blowout",
      category: "Hair",
      price: 45,
      isActive: true,
      createdAt: "2026-02-01T00:00:00.000Z",
    },
  ];

  it("filters services by category and active status", () => {
    const hairActive = filterServices(mockServices, {
      category: "Hair",
      status: "active",
    });
    assert.equal(hairActive.length, 2);

    const inactiveOnly = filterServices(mockServices, { status: "inactive" });
    assert.equal(inactiveOnly.length, 1);
    assert.equal(inactiveOnly[0]._id, "s-2");
  });

  it("sorts services by price ascending and descending", () => {
    const priceAsc = filterServices(mockServices, { sortBy: "price_asc" });
    assert.equal(priceAsc[0].price, 45);
    assert.equal(priceAsc[2].price, 130);

    const priceDesc = filterServices(mockServices, { sortBy: "price_desc" });
    assert.equal(priceDesc[0].price, 130);
    assert.equal(priceDesc[2].price, 45);
  });

  it("sorts services by newest and oldest", () => {
    const newest = filterServices(mockServices, { sortBy: "newest" });
    assert.equal(newest[0]._id, "s-2"); // March

    const oldest = filterServices(mockServices, { sortBy: "oldest" });
    assert.equal(oldest[0]._id, "s-1"); // Jan
  });
});

describe("Admin Filter Utils - filterUsers", () => {
  const mockUsers = [
    {
      _id: "u-1",
      name: "Zara Davis",
      email: "zara@example.com",
      phone: "+15551234",
      role: "customer",
      isBlocked: false,
      createdAt: "2026-01-10T00:00:00.000Z",
    },
    {
      _id: "u-2",
      name: "Aaron Miller",
      email: "aaron@example.com",
      phone: "+15555678",
      role: "customer",
      isBlocked: true,
      createdAt: "2026-02-15T00:00:00.000Z",
    },
  ];

  it("filters users by search and blocked status", () => {
    const searchResult = filterUsers(mockUsers, { search: "zara" });
    assert.equal(searchResult.length, 1);
    assert.equal(searchResult[0]._id, "u-1");

    const blockedOnly = filterUsers(mockUsers, { status: "blocked" });
    assert.equal(blockedOnly.length, 1);
    assert.equal(blockedOnly[0]._id, "u-2");

    const activeOnly = filterUsers(mockUsers, { status: "active" });
    assert.equal(activeOnly.length, 1);
    assert.equal(activeOnly[0]._id, "u-1");
  });

  it("sorts users alphabetically by name", () => {
    const sorted = filterUsers(mockUsers, { sortBy: "name_asc" });
    assert.equal(sorted[0].name, "Aaron Miller");
    assert.equal(sorted[1].name, "Zara Davis");
  });
});

describe("Admin Filter Utils - filterTransactions", () => {
  const mockTransactions = [
    {
      _id: "tx-1",
      amount: 150,
      currency: "usd",
      status: "paid",
      stripeSessionId: "cs_test_1",
      createdAt: "2026-11-20T10:00:00.000Z",
      customer: { name: "Emma Watson", email: "emma@example.com" },
    },
    {
      _id: "tx-2",
      amount: 75,
      currency: "eur",
      status: "failed",
      stripeSessionId: "cs_test_2",
      createdAt: "2026-11-22T14:00:00.000Z",
      customer: { name: "Lucas Vance", email: "lucas@example.com" },
    },
  ];

  it("filters transactions by status and currency", () => {
    const paidOnly = filterTransactions(mockTransactions, { status: "paid" });
    assert.equal(paidOnly.length, 1);
    assert.equal(paidOnly[0]._id, "tx-1");

    const eurOnly = filterTransactions(mockTransactions, { currency: "eur" });
    assert.equal(eurOnly.length, 1);
    assert.equal(eurOnly[0]._id, "tx-2");
  });

  it("sorts transactions by amount and date", () => {
    const amountDesc = filterTransactions(mockTransactions, { sortBy: "amount_desc" });
    assert.equal(amountDesc[0].amount, 150);

    const newest = filterTransactions(mockTransactions, { sortBy: "newest" });
    assert.equal(newest[0]._id, "tx-2");
  });
});
