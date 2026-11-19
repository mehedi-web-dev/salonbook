import { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore our range of salon and spa services.",
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-medium text-accent-foreground mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Services Catalog</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Salon & Spa Services
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Our complete collection of hair styling, skincare, nail care, and spa treatments will be listed here once backend APIs are integrated in the upcoming phase.
        </p>
      </div>

      <div className="mt-12 rounded-lg border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
        Services catalog placeholder &mdash; ready for API integration in Phase 2/3.
      </div>
    </div>
  );
}
