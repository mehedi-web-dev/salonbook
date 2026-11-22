/**
 * Pure filtering and sorting utility functions for SalonBook Admin Dashboard.
 * Supports combined multi-criteria search, date-range filtering, and sorting.
 */

import type {
  Appointment,
  Service,
  AdminUser,
  AdminTransaction,
  AppointmentStatus,
  PaymentStatus,
  TransactionStatus,
} from "@/types";

export interface AppointmentFilterCriteria {
  search?: string;
  status?: "all" | AppointmentStatus;
  paymentStatus?: "all" | PaymentStatus;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "newest" | "oldest";
}

export interface ServiceFilterCriteria {
  search?: string;
  category?: string;
  status?: "all" | "active" | "inactive";
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest" | "name_asc" | "name_desc";
}

export interface UserFilterCriteria {
  search?: string;
  status?: "all" | "active" | "blocked";
  sortBy?: "name_asc" | "name_desc" | "newest" | "oldest";
}

export interface TransactionFilterCriteria {
  search?: string;
  status?: "all" | TransactionStatus;
  currency?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "newest" | "oldest" | "amount_desc" | "amount_asc";
}

/**
 * Filters and sorts appointments based on combined search, status, payment status, service, date range, and sorting.
 */
export function filterAppointments(
  appointments: Appointment[],
  criteria: AppointmentFilterCriteria
): Appointment[] {
  if (!Array.isArray(appointments)) return [];

  const search = (criteria.search || "").toLowerCase().trim();
  const status = (criteria.status || "all").toLowerCase().trim();
  const paymentStatus = (criteria.paymentStatus || "all").toLowerCase().trim();
  const serviceId = (criteria.serviceId || "all").trim();
  const startDate = (criteria.startDate || "").trim();
  const endDate = (criteria.endDate || "").trim();
  const sortBy = criteria.sortBy || "newest";

  const filtered = appointments.filter((app) => {
    if (!app) return false;

    // Search by customer name, email, service name, or appointment ID
    if (search) {
      const custName = (app.customer?.name || "").toLowerCase();
      const custEmail = (app.customer?.email || "").toLowerCase();
      const servName = (app.service?.name || "").toLowerCase();
      const refId = (app._id || "").toLowerCase();

      const matchesSearch =
        custName.includes(search) ||
        custEmail.includes(search) ||
        servName.includes(search) ||
        refId.includes(search);

      if (!matchesSearch) return false;
    }

    // Filter by appointment status
    if (status !== "all" && app.status?.toLowerCase() !== status) {
      return false;
    }

    // Filter by payment status
    if (paymentStatus !== "all" && app.paymentStatus?.toLowerCase() !== paymentStatus) {
      return false;
    }

    // Filter by service
    if (serviceId !== "all" && serviceId) {
      const matchServiceId = app.serviceId === serviceId || app.service?._id === serviceId;
      const matchServiceName =
        (app.service?.name || "").toLowerCase() === serviceId.toLowerCase();
      if (!matchServiceId && !matchServiceName) return false;
    }

    // Filter by date range (operating over YYYY-MM-DD)
    const appDate = app.appointmentDate ? app.appointmentDate.slice(0, 10) : "";
    if (startDate && appDate && appDate < startDate) {
      return false;
    }
    if (endDate && appDate && appDate > endDate) {
      return false;
    }

    return true;
  });

  // Sort appointments
  return filtered.sort((a, b) => {
    // Composite date key: appointmentDate + timeSlot, fallback to createdAt
    const dateA = `${a.appointmentDate || ""}T${a.timeSlot || "00:00"}`;
    const dateB = `${b.appointmentDate || ""}T${b.timeSlot || "00:00"}`;

    const timeA = dateA.length >= 10 ? new Date(dateA).getTime() : new Date(a.createdAt || 0).getTime();
    const timeB = dateB.length >= 10 ? new Date(dateB).getTime() : new Date(b.createdAt || 0).getTime();

    if (sortBy === "oldest") {
      return timeA - timeB;
    }
    return timeB - timeA; // default: newest
  });
}

/**
 * Filters and sorts salon services by name search, category, active status, price, and creation date.
 */
export function filterServices(
  services: Service[],
  criteria: ServiceFilterCriteria
): Service[] {
  if (!Array.isArray(services)) return [];

  const search = (criteria.search || "").toLowerCase().trim();
  const category = (criteria.category || "all").toLowerCase().trim();
  const status = (criteria.status || "all").toLowerCase().trim();
  const sortBy = criteria.sortBy || "newest";

  const filtered = services.filter((s) => {
    if (!s) return false;

    // Search by name, category, or description
    if (search) {
      const name = (s.name || "").toLowerCase();
      const cat = (s.category || "").toLowerCase();
      const desc = (s.description || "").toLowerCase();
      if (!name.includes(search) && !cat.includes(search) && !desc.includes(search)) {
        return false;
      }
    }

    // Filter by category
    if (category !== "all" && s.category?.toLowerCase() !== category) {
      return false;
    }

    // Filter by active status
    if (status === "active" && !s.isActive) return false;
    if (status === "inactive" && s.isActive) return false;

    return true;
  });

  // Sort services
  return filtered.sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return (a.price || 0) - (b.price || 0);
      case "price_desc":
        return (b.price || 0) - (a.price || 0);
      case "name_asc":
        return (a.name || "").localeCompare(b.name || "");
      case "name_desc":
        return (b.name || "").localeCompare(a.name || "");
      case "oldest": {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      }
      case "newest":
      default: {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }
    }
  });
}

/**
 * Filters and sorts customer user accounts by search query, account status, and sorting order.
 */
export function filterUsers(
  users: AdminUser[],
  criteria: UserFilterCriteria
): AdminUser[] {
  if (!Array.isArray(users)) return [];

  const search = (criteria.search || "").toLowerCase().trim();
  const status = (criteria.status || "all").toLowerCase().trim();
  const sortBy = criteria.sortBy || "newest";

  const filtered = users.filter((u) => {
    if (!u) return false;

    // Search by customer name, email, or phone
    if (search) {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      if (!name.includes(search) && !email.includes(search) && !phone.includes(search)) {
        return false;
      }
    }

    // Filter by account status (Active vs Blocked)
    if (status === "active" && u.isBlocked) return false;
    if (status === "blocked" && !u.isBlocked) return false;

    return true;
  });

  // Sort users
  return filtered.sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return (a.name || "").localeCompare(b.name || "");
      case "name_desc":
        return (b.name || "").localeCompare(a.name || "");
      case "oldest": {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      }
      case "newest":
      default: {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }
    }
  });
}

/**
 * Filters and sorts transactions by search query, payment status, currency, date range, and sorting order.
 */
export function filterTransactions(
  transactions: AdminTransaction[],
  criteria: TransactionFilterCriteria
): AdminTransaction[] {
  if (!Array.isArray(transactions)) return [];

  const search = (criteria.search || "").toLowerCase().trim();
  const status = (criteria.status || "all").toLowerCase().trim();
  const currency = (criteria.currency || "all").toLowerCase().trim();
  const startDate = (criteria.startDate || "").trim();
  const endDate = (criteria.endDate || "").trim();
  const sortBy = criteria.sortBy || "newest";

  const filtered = transactions.filter((tx) => {
    if (!tx) return false;

    // Search by customer name, customer email, service name, Stripe IDs, or ID
    if (search) {
      const custName = (tx.customer?.name || "").toLowerCase();
      const custEmail = (tx.customer?.email || "").toLowerCase();
      const servName = (tx.appointment?.serviceName || "").toLowerCase();
      const sessId = (tx.stripeSessionId || "").toLowerCase();
      const intentId = (tx.stripePaymentIntentId || "").toLowerCase();
      const txId = (tx._id || "").toLowerCase();

      const matchesSearch =
        custName.includes(search) ||
        custEmail.includes(search) ||
        servName.includes(search) ||
        sessId.includes(search) ||
        intentId.includes(search) ||
        txId.includes(search);

      if (!matchesSearch) return false;
    }

    // Filter by payment status
    if (status !== "all" && tx.status?.toLowerCase() !== status) {
      return false;
    }

    // Filter by currency
    if (currency !== "all" && tx.currency?.toLowerCase() !== currency) {
      return false;
    }

    // Filter by date range (operating over createdAt)
    if (tx.createdAt) {
      const txDate = tx.createdAt.slice(0, 10);
      if (startDate && txDate < startDate) return false;
      if (endDate && txDate > endDate) return false;
    }

    return true;
  });

  // Sort transactions
  return filtered.sort((a, b) => {
    switch (sortBy) {
      case "amount_desc":
        return (b.amount || 0) - (a.amount || 0);
      case "amount_asc":
        return (a.amount || 0) - (b.amount || 0);
      case "oldest": {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      }
      case "newest":
      default: {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }
    }
  });
}
