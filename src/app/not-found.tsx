import Link from "next/link";
import { Home, Sparkles, ArrowRight, Compass, Calendar, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-16 sm:py-24 bg-background text-foreground relative overflow-hidden">
      {/* Soft ambient background glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-2xl text-center">
        {/* Minimal, elegant typographic & icon visual element */}
        <div className="relative mx-auto mb-8 flex items-center justify-center">
          {/* Subtle large typographic numeral */}
          <span
            className="font-serif text-8xl sm:text-9xl font-bold tracking-tighter text-primary/15 select-none"
            aria-hidden="true"
          >
            404
          </span>

          {/* Centered floating decorative card badge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-md shadow-primary/5 transition-transform duration-300 hover:scale-105">
              <Compass className="h-10 w-10 sm:h-12 sm:w-12 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/80 px-3.5 py-1 text-xs font-semibold text-accent-foreground mb-4 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>PAGE NOT FOUND</span>
        </div>

        {/* Main Heading */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight">
          Oops! This Page Is Missing.
        </h1>

        {/* Description */}
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
          The page you&apos;re looking for may have been moved, removed, or is temporarily unavailable.
        </p>

        {/* Primary Navigation Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-7 py-3 text-sm font-medium shadow-xs">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/services" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-7 py-3 text-sm font-medium">
              Explore Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Quick Navigation Links */}
        <div className="mt-12 pt-8 border-t border-border/60">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Book Appointment</span>
            </Link>
            <span className="text-border" aria-hidden="true">•</span>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>About Us</span>
            </Link>
            <span className="text-border" aria-hidden="true">•</span>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
