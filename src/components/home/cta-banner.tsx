import Link from "next/link";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="py-16 sm:py-20 border-t border-border bg-gradient-to-r from-secondary/40 via-secondary/60 to-secondary/40">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1 text-xs font-medium text-foreground mb-6 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Elevate Your Beauty Routine</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight">
          Ready for your next salon experience?
        </h2>

        <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
          Reserve your preferred treatment in seconds. Experience tranquility, certified master
          craftsmanship, and radiant results with SalonBook.
        </p>

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
              className="w-full sm:w-auto px-7 font-medium bg-background/80 hover:bg-background"
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
