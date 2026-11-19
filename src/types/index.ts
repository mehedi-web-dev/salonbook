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
  category: ServiceCategory;
  description: string;
  durationMinutes: number;
  price: number;
  image?: string;
  isFeatured?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
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
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "stylist";
  phone?: string;
  avatar?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
