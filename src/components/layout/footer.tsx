import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { CONTACT_CONFIG } from "@/lib/contact-config";

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" />
    </svg>
  );
}

const NAVIGATION_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Meet Our Barbers", href: "/#barbers" },
  { label: "My Appointments", href: "/dashboard/appointments" },
];

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: CONTACT_CONFIG.socialMedia.facebook.url,
    icon: FacebookIcon,
    ariaLabel: "SalonBook on Facebook (Editable Demo Placeholder)",
  },
  {
    name: "Instagram",
    href: CONTACT_CONFIG.socialMedia.instagram.url,
    icon: InstagramIcon,
    ariaLabel: "SalonBook on Instagram (Editable Demo Placeholder)",
  },
  {
    name: "YouTube",
    href: CONTACT_CONFIG.socialMedia.youtube.url,
    icon: YoutubeIcon,
    ariaLabel: "SalonBook on YouTube (Editable Demo Placeholder)",
  },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-secondary/40 pt-14 pb-8 text-muted-foreground">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* 1. Brand Logo, Short Description & Social Links */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            <Link
              href="/"
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-opacity hover:opacity-90 w-fit"
              aria-label="SalonBook Barber & Grooming Homepage"
            >
              <div className="relative h-[80px] w-[120px] sm:h-[114px] sm:w-[170px] shrink-0">
                <Image
                  src="/images/salonbook-barber-logo.png"
                  alt="SalonBook Barber & Grooming"
                  fill
                  sizes="(max-width: 640px) 120px, 170px"
                  className="object-contain"
                />
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Your trusted destination for premium salon, beauty, and grooming experiences. Book your appointment with ease and enjoy professional care.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-2.5 pt-1">
              {SOCIAL_LINKS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.ariaLabel}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-all duration-200 hover:text-primary hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                  >
                    <IconComponent className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 2. Important Navigation Links */}
          <div className="flex flex-col gap-3 lg:col-span-2 lg:pl-2">
            <h3 className="font-serif text-sm font-semibold text-foreground tracking-wide">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
              {NAVIGATION_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Salon Contact Information */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <h3 className="font-serif text-sm font-semibold text-foreground tracking-wide">
              Contact Info
            </h3>
            <ul className="flex flex-col gap-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-foreground">Email</span>
                  <a
                    href={CONTACT_CONFIG.email.actionUrl}
                    className="transition-colors hover:text-foreground hover:underline break-all"
                  >
                    {CONTACT_CONFIG.email.value}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-foreground">Phone</span>
                  <a
                    href={CONTACT_CONFIG.phone.actionUrl}
                    className="transition-colors hover:text-foreground hover:underline"
                  >
                    {CONTACT_CONFIG.phone.value}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-foreground">Salon Studio</span>
                  <span className="leading-relaxed">
                    {CONTACT_CONFIG.location.value}
                  </span>
                  <span className="text-[10px] text-muted-foreground/75 italic mt-0.5">
                    (Editable studio placeholder)
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* 4. Opening Hours */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <h3 className="font-serif text-sm font-semibold text-foreground tracking-wide">
              Opening Hours
            </h3>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 border-b border-border/50 pb-1.5">
                    <span className="font-medium text-foreground">Mon – Sat:</span>
                    <span>9:00 AM – 7:00 PM</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 border-b border-border/50 pb-1.5">
                    <span className="font-medium text-foreground">Sunday:</span>
                    <span>10:00 AM – 5:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-border/60 bg-background/50 px-3 py-2 text-[11px] leading-relaxed">
                <p className="font-medium text-foreground">24/7 Online Booking</p>
                <p className="text-muted-foreground mt-0.5">
                  Appointments can be booked anytime through our platform.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Copyright Information & Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 SalonBook. All rights reserved.</p>

          <p className="text-[11px] text-muted-foreground/80 text-center sm:text-right">
            Premium Salon, Beauty &amp; Grooming Experience
          </p>
        </div>
      </div>
    </footer>
  );
}
