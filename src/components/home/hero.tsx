import Link from "next/link";
import { Sparkles, Calendar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/60 px-3.5 py-1 text-xs font-medium text-accent-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Elevated Salon & Wellness Experience</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.15]">
            Effortless beauty appointments at your fingertips.
          </h1>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground">
            Discover premier hair, skincare, and spa treatments. Select your preferred specialist, pick a suitable time slot, and manage your bookings effortlessly.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/services">
              <Button size="lg" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-4 w-4" />
                Explore Services
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <ShieldCheck className="mr-2 h-4 w-4" />
                View Appointments
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
