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
