import { Sparkles, Calendar, HeartHandshake, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Sparkles,
      title: "Discover Your Service",
      description:
        "Browse our curated catalog of haircuts, radiant color treatments, bridal styling, nail care, and spa therapy.",
    },
    {
      step: "02",
      icon: Calendar,
      title: "Select Slot & Specialist",
      description:
        "Choose a convenient date and time with real-time schedule availability that fits seamlessly into your day.",
    },
    {
      step: "03",
      icon: HeartHandshake,
      title: "Relax & Glow",
      description:
        "Arrive at our serene salon sanctuary. Let our certified specialists pamper you and bring your beauty goals to life.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-t border-border bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-0.5 text-xs font-medium text-accent-foreground mb-3">
            <span className="font-semibold text-primary">Simple &amp; Seamless</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            How SalonBook Works
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Three simple steps between you and a rejuvenating salon experience.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col rounded-xl border border-border/70 bg-card p-6 shadow-2xs transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-serif text-2xl font-bold text-muted-foreground/30">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action Callout */}
        <div className="mt-12 text-center">
          <Link href="/services">
            <Button size="md" className="gap-2 font-medium">
              <span>Start Booking Now</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
