import Image from "next/image";
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
    <section className="relative overflow-hidden pt-16 pb-16 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28">
      {/* Luxury Salon Interior Background Image */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury salon interior styling stations"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-center scale-[1.01]"
        />
        {/* Warm cream/beige overlay with subtle gradient for optimal text readability */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7]/92 via-[#fdfbf7]/82 to-[#fdfbf7]"
          aria-hidden="true"
        />
        {/* Soft radial blush & warm neutral vignette */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/25 via-secondary/35 to-background/90"
          aria-hidden="true"
        />
      </div>

      {/* Subtle Warm Background Glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-accent/80 backdrop-blur-xs px-4 py-1.5 text-xs font-medium text-accent-foreground mb-6 shadow-2xs">
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
                className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-card/85 backdrop-blur-xs px-3.5 py-2.5 shadow-2xs transition-colors hover:bg-card"
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
