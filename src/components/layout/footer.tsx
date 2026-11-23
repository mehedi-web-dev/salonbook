import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-secondary/50 py-10 text-muted-foreground">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg shrink-0 transition-opacity hover:opacity-90"
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

          <p className="text-xs text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} SalonBook. Premium Salon &amp; Spa Booking. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-xs">
            <Link href="/services" className="hover:text-foreground">
              Services
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
            
            <Link href="/login" className="hover:text-foreground">
              Account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
