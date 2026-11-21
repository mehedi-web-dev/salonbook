import {
  CalendarCheck,
  Scissors,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";

export function WhyChooseUs() {
  const benefits = [
    {
      icon: CalendarCheck,
      title: "Easy Online Booking",
      description:
        "Reserve your preferred specialist and time slot 24/7 with real-time slot selection and instant confirmation.",
    },
    {
      icon: Scissors,
      title: "Master Salon Stylists",
      description:
        "Certified beauty professionals dedicated to exceptional craftsmanship, personalized consultations, and luxury care.",
    },
    {
      icon: ShieldCheck,
      title: "Transparent Service Pricing",
      description:
        "Clear upfront pricing with zero hidden salon fees. Review durations and treatment costs before you sit down.",
    },
    {
      icon: HeartHandshake,
      title: "Convenient Management",
      description:
        "Centralized customer dashboard to track appointment status, view visit history, and manage bookings effortlessly.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-t border-border bg-card/60">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-0.5 text-xs font-medium text-accent-foreground mb-3">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            <span>The SalonBook Difference</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Why Choose SalonBook?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We blend modern scheduling convenience with the timeless serenity and craftsmanship
            of a luxury salon experience.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group flex flex-col justify-between rounded-xl border border-border bg-background p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
