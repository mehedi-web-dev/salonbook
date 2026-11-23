import Image from "next/image";
import Link from "next/link";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 border-t border-border">
      {/* Luxury Salon Interior Background Image */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury salon sanctuary styling area"
          fill
          sizes="100vw"
          quality={85}
          className="object-cover object-center scale-[1.01]"
        />
        {/* Warm cream/beige overlay with subtle gradient for optimal text readability */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-background/95 via-secondary/85 to-background/95"
          aria-hidden="true"
        />
        {/* Soft radial blush & warm ambient vignette */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/35 via-transparent to-background/90"
          aria-hidden="true"
        />
      </div>

      {/* Subtle Warm Background Glow */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-72 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 backdrop-blur-xs px-4 py-1.5 text-xs font-medium text-foreground mb-6 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Elevate Your Beauty Routine</span>
        </div>

        {/* Heading */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight">
          Ready for your next salon experience?
        </h2>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
          Reserve your preferred treatment in seconds. Experience tranquility, certified master
          craftsmanship, and radiant results with SalonBook.
        </p>

        {/* CTA Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link href="/services" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 font-medium shadow-xs">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Explore Services &amp; Book</span>
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-7 font-medium bg-background/90 backdrop-blur-xs hover:bg-background border-border/80"
            >
              <span>View My Appointments</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
