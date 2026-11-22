import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-secondary/50 py-10 text-muted-foreground">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-medium text-foreground">
              SalonBook
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SalonBook. Premium Salon & Spa Booking. All rights reserved.
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
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
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
