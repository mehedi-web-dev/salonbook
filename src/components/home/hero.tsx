import Link from "next/link";
import { Sparkles, Calendar, ShieldCheck, Star, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const trustMetrics = [
    { icon: Star, label: "4.9 / 5 Client Rating" },
    { icon: Users, label: "Master Stylists & Estheticians" },
    { icon: Clock, label: "Instant Real-Time Confirmation" },
    { icon: ShieldCheck, label: "Transparent Upfront Pricing" },
  ];

  return (
    <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-secondary/30 via-background to-background">
      {/* Subtle Warm Background Glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/70 px-4 py-1.5 text-xs font-medium text-accent-foreground mb-6 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Elevated Salon &amp; Wellness Experience</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.12]">
            Effortless beauty appointments at your fingertips.
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            Discover premier hair, skincare, and spa treatments. Select your preferred specialist,
            pick a suitable time slot, and manage your bookings effortlessly.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/services" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-7 py-3 text-sm font-medium shadow-xs">
                <Calendar className="mr-2 h-4 w-4" />
                Explore Services
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-7 py-3 text-sm font-medium">
                <ShieldCheck className="mr-2 h-4 w-4" />
                My Appointments
              </Button>
            </Link>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-border/70 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
            {trustMetrics.map((metric, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card/70 px-3.5 py-2.5 shadow-2xs"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <metric.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground line-clamp-1">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
