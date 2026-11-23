/**
 * Core type definitions for SalonBook.
 */

export type ServiceCategory =
  | "Hair"
  | "Skin Care"
  | "Nails"
  | "Spa & Massage"
  | "Bridal"
  | "Makeup"
  | "All";

export interface Service {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  category: string;
  price: number;
  duration: number; // in minutes
  durationMinutes?: number; // compatibility alias
  image?: string;
  isActive: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServicesResponse {
  success: boolean;
  count: number;
  pagination: PaginationMeta;
  data: Service[];
}

export interface SingleServiceResponse {
  success: boolean;
  data?: Service;
  message?: string;
}

export interface CreateServiceInput {
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  category: string;
  price: number;
  duration: number;
  image?: string;
  isActive?: boolean;
}

export type UpdateServiceInput = Partial<CreateServiceInput>;

export interface ImageUploadData {
  url: string;
  displayUrl: string;
  deleteUrl?: string | null;
  thumbUrl?: string | null;
  title?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data?: ImageUploadData;
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";

export interface AppointmentServiceInfo {
  _id: string;
  name: string;
  slug?: string;
  category: string;
  duration: number;
  image?: string;
  description?: string;
}

export interface Appointment {
  _id: string;
  serviceId: string;
  customerId: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // Canonical 24-hour HH:mm
  message?: string;
  servicePrice: number;
  paymentStatus: PaymentStatus;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  service?: AppointmentServiceInfo | null;
  customer?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  } | null;
}

export interface CreateAppointmentInput {
  serviceId: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // Canonical 24-hour HH:mm
  message?: string;
}

export interface AppointmentsResponse {
  success: boolean;
  count: number;
  pagination: PaginationMeta;
  data: Appointment[];
}

export interface SingleAppointmentResponse {
  success: boolean;
  message?: string;
  data: Appointment;
}

export type TransactionStatus = "paid" | "failed" | "reconciliation_required";

export interface PaymentTransaction {
  _id: string;
  appointmentId: string;
  customerId: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  appointment?: {
    _id: string;
    appointmentDate: string;
    timeSlot: string;
    status: string;
    paymentStatus: string;
    serviceId: string;
  } | null;
  service?: {
    _id: string;
    name: string;
    slug?: string;
    category: string;
    duration: number;
    image?: string;
  } | null;
}

export interface CreateCheckoutSessionResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    url: string;
  };
}

export interface PaymentsResponse {
  success: boolean;
  count: number;
  pagination: PaginationMeta;
  data: PaymentTransaction[];
}

export interface SinglePaymentResponse {
  success: boolean;
  message?: string;
  data: PaymentTransaction;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  _id: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
  role: "customer" | "admin" | "stylist";
  isBlocked?: boolean;
  phone?: string;
  avatar?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ==========================================
// Admin Dashboard, User & Transaction Types
// ==========================================

export interface RevenueByCurrencyItem {
  currency: string;
  totalAmount: number;
  count: number;
}

export interface AdminDashboardStats {
  customers: {
    total: number;
    active: number;
    blocked: number;
  };
  services: {
    total: number;
    active: number;
    inactive: number;
  };
  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  transactions: {
    total: number;
    paid: number;
    failed: number;
    reconciliationRequired: number;
  };
  revenue: {
    byCurrency: RevenueByCurrencyItem[];
    summary: Record<string, number>;
  };
}

export interface AdminDashboardStatsResponse {
  success: boolean;
  data: AdminDashboardStats;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  phone?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalAppointments: number;
    totalTransactions: number;
  };
}

export interface AdminUsersResponse {
  success: boolean;
  count: number;
  pagination: PaginationMeta;
  data: AdminUser[];
}

export interface SingleAdminUserResponse {
  success: boolean;
  message?: string;
  data: AdminUser;
}

export interface AdminTransactionCustomer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AdminTransactionAppointment {
  _id: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  service?: {
    _id: string;
    name: string;
    slug?: string;
    category: string;
    price: number;
    duration: number;
  } | null;
}

export interface AdminTransaction {
  _id: string;
  appointmentId: string;
  customerId: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: AdminTransactionCustomer | null;
  appointment?: AdminTransactionAppointment | null;
}

export interface AdminTransactionsResponse {
  success: boolean;
  count: number;
  pagination: PaginationMeta;
  data: AdminTransaction[];
}

export interface SingleAdminTransactionResponse {
  success: boolean;
  message?: string;
  data: AdminTransaction;
}

// ==========================================
// User Profile & Image Upload Types
// ==========================================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  role: "customer" | "admin" | "stylist" | string;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data: UserProfile;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
  image?: string | null;
}

// ==========================================
// Barber Management Types
// ==========================================

export interface Barber {
  _id: string;
  name: string;
  image: string;
  designation: string;
  specialization: string[];
  experience: number; // in years
  bio?: string;
  serviceIds: string[];
  services?: Service[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BarbersResponse {
  success: boolean;
  count: number;
  data: Barber[];
  message?: string;
}

export interface SingleBarberResponse {
  success: boolean;
  data?: Barber;
  message?: string;
}

export interface CreateBarberInput {
  name: string;
  designation: string;
  specialization: string[] | string;
  experience: number | string;
  bio?: string;
  serviceIds?: string[] | string;
  isActive?: boolean;
  image?: string;
}

export type UpdateBarberInput = Partial<CreateBarberInput>;

