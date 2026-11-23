/**
 * Centralized Contact Configuration for SalonBook
 * 
 * IMPORTANT:
 * - SalonBook is the booking platform. Specific salon studio details (phone, email, address, hours)
 *   are configured by salon administrators.
 * - To ensure compliance with project guidelines, clearly identifiable editable placeholders
 *   are defined here rather than presenting fictional contact details as real business information.
 * - Administrators can update these values directly or via environment variables when live studio details are assigned.
 */

export interface ContactInfoItem {
  id: string;
  label: string;
  value: string;
  description: string;
  isPlaceholder: boolean;
  actionUrl?: string;
  badge?: string;
}

export const CONTACT_CONFIG = {
  email: {
    id: "email",
    label: "Email Address",
    value: "support@salonbook.example.com",
    description: "For booking assistance, service inquiries, and general support.",
    isPlaceholder: true,
    actionUrl: "mailto:support@salonbook.example.com",
    badge: "Placeholder (Configurable)",
  },
  phone: {
    id: "phone",
    label: "Phone Number",
    value: "+1 (555) 000-SALON",
    description: "Reception and customer care line during salon operating hours.",
    isPlaceholder: true,
    actionUrl: "tel:+15550007256",
    badge: "Placeholder (Configurable)",
  },
  location: {
    id: "location",
    label: "Studio Location",
    value: "100 Beauty Way, Suite 400, New York, NY",
    description: "Flagship salon suites and appointment treatment studios.",
    isPlaceholder: true,
    actionUrl: undefined,
    badge: "Placeholder (Configurable)",
  },
  openingHours: {
    id: "hours",
    label: "Opening Hours",
    value: "Monday – Saturday: 9:00 AM – 7:00 PM\nSunday: 10:00 AM – 5:00 PM",
    description: "Online appointment booking is available 24/7 through the platform.",
    isPlaceholder: true,
    actionUrl: undefined,
    badge: "Placeholder (Configurable)",
  },
  socialMedia: {
    facebook: {
      name: "Facebook",
      url: "https://facebook.com/salonbook.placeholder",
      isPlaceholder: true,
      description: "Official SalonBook Facebook page (Configurable)",
    },
    instagram: {
      name: "Instagram",
      url: "https://instagram.com/salonbook.placeholder",
      isPlaceholder: true,
      description: "Official SalonBook Instagram profile (Configurable)",
    },
    youtube: {
      name: "YouTube",
      url: "https://youtube.com/@salonbook.placeholder",
      isPlaceholder: true,
      description: "Official SalonBook YouTube channel (Configurable)",
    },
  },
} as const;

export const FAQ_ITEMS = [
  {
    question: "How can I book a salon service?",
    answer:
      "You can browse our wide variety of professional beauty treatments on the Services page. Select any service to review its duration, price, and description, then choose your preferred specialist, date, and convenient time slot to submit your appointment request.",
  },
  {
    question: "When can I pay for an appointment?",
    answer:
      "Once an administrator reviews and approves your requested appointment, its status changes to 'Confirmed'. You can then complete your payment securely via our integrated Stripe checkout directly from your Dashboard.",
  },
  {
    question: "How can I check appointment status?",
    answer:
      "Log in and navigate to your Dashboard (or 'My Appointments'). Every appointment displays its real-time status: Pending (awaiting administrator confirmation), Confirmed (ready for payment or service), Completed, or Cancelled.",
  },
  {
    question: "What should I do if payment fails?",
    answer:
      "If a Stripe checkout session is interrupted or fails, your appointment remains safely saved with an unpaid status. Simply visit 'My Appointments' or 'Payment History' in your Dashboard and click 'Pay Now' to reinitiate checkout at your convenience.",
  },
] as const;
