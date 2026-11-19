import { Hero } from "@/components/home/hero";
import Link from "next/link";
import { Scissors, Sparkles, HeartHandshake, CalendarCheck } from "lucide-react";

export default function Home() {
  const highlights = [
    {
      icon: Scissors,
      title: "Expert Stylists",
      description: "Certified professionals tailored to your aesthetic and care goals.",
    },
    {
      icon: Sparkles,
      title: "Premium Treatments",
      description: "Organic, top-tier products for hair, skin, and wellness.",
    },
    {
      icon: CalendarCheck,
      title: "Real-time Booking",
      description: "Seamless scheduling with instant slot selection and status tracking.",
    },
    {
      icon: HeartHandshake,
      title: "Personalized Care",
      description: "Customized salon consultations curated for your convenience.",
    },
  ];

  return (
    <div className="flex flex-col">
      <Hero />

      {/* Highlights / Features Preview */}
      <section className="border-t border-border bg-card/60 py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              A refined salon journey
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Experience tranquility and craftsmanship in every appointment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border bg-background p-6 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Navigation Banner */}
      <section className="py-12 bg-secondary/40 border-t border-border">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Frontend Foundation Ready
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-foreground">
            <Link
              href="/services"
              className="rounded-md border border-border bg-card px-3 py-1.5 hover:bg-muted"
            >
              /services &rarr;
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-border bg-card px-3 py-1.5 hover:bg-muted"
            >
              /dashboard &rarr;
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-border bg-card px-3 py-1.5 hover:bg-muted"
            >
              /login &rarr;
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-border bg-card px-3 py-1.5 hover:bg-muted"
            >
              /register &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
