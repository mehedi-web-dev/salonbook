import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  CalendarCheck,
  Clock,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Search,
  CheckCircle2,
  HeartHandshake,
  Compass,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us | SalonBook — Modern Salon Appointment Platform",
  description:
    "Discover SalonBook, the premier salon appointment booking platform connecting customers with quality salon treatments through seamless discovery, convenient scheduling, and secure payments.",
};

export default function AboutPage() {
  const whyChooseFeatures = [
    {
      icon: CalendarCheck,
      title: "Easy Online Booking",
      description:
        "Browse curated salon treatments and submit appointment requests anytime from your computer, tablet, or phone.",
    },
    {
      icon: Clock,
      title: "Convenient Scheduling",
      description:
        "Select available dates and time slots that naturally fit your personal calendar without telephone delays.",
    },
    {
      icon: ShieldCheck,
      title: "Service Transparency",
      description:
        "Review clear upfront pricing, estimated treatment durations, and comprehensive service details with zero surprises.",
    },
    {
      icon: CreditCard,
      title: "Secure Online Payments",
      description:
        "Complete payment transactions safely via trusted Stripe checkout, with comprehensive digital receipts and history.",
    },
  ];

  const howItWorksSteps = [
    {
      step: "01",
      icon: Search,
      title: "Explore Services",
      description:
        "Browse our extensive catalog of haircuts, styling, color treatments, skincare, and bridal packages with full transparency.",
    },
    {
      step: "02",
      icon: CalendarCheck,
      title: "Request an Appointment",
      description:
        "Select your preferred service, pick a date and time slot that fits your schedule, and submit your booking details in minutes.",
    },
    {
      step: "03",
      icon: CheckCircle2,
      title: "Confirm and Pay",
      description:
        "Receive prompt status confirmations, manage your appointment through your personal dashboard, and complete payment securely.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* ─────────────────────────────────────────────────────────────
          SECTION A: HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-border/60 bg-gradient-to-b from-secondary/40 via-background to-background">
        {/* Soft background ambient glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/80 px-3.5 py-1 text-xs font-semibold text-accent-foreground mb-6 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>ABOUT SALONBOOK</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
                A Better Way to Experience Salon Care
              </h1>

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl">
                SalonBook is a modern salon appointment booking platform designed to simplify how
                you discover, schedule, and enjoy beauty and wellness care. We connect customers
                with quality treatments through clear information, effortless digital scheduling,
                and secure online payment management.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href="/services">
                  <Button size="lg" className="w-full sm:w-auto px-7 py-3 text-sm font-medium shadow-xs">
                    Explore Our Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-7 py-3 text-sm font-medium">
                    Book an Appointment
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Right Image */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-[4/3] sm:aspect-[5/4] w-full overflow-hidden rounded-2xl border border-border bg-secondary shadow-md">
                  <Image
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
                    alt="Warm and modern luxury salon interior with styling stations"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 480px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Aesthetic Tag */}
                <div className="absolute -bottom-4 right-4 sm:-bottom-5 sm:right-6 rounded-xl border border-border bg-card/95 backdrop-blur-md px-4 py-2.5 shadow-md flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Curated Care</p>
                    <p className="text-[11px] text-muted-foreground">Effortless Digital Booking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION B: OUR STORY
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-card/40 border-b border-border/60">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Story Left Image */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-[4/3] sm:aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-secondary shadow-md">
                <Image
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80"
                  alt="Stylist preparing professional salon care and styling tools"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 420px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Story Right Content */}
            <div className="lg:col-span-7 order-1 lg:order-2 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/60 px-3.5 py-1 text-xs font-medium text-accent-foreground mb-4">
                <HeartHandshake className="h-3.5 w-3.5 text-primary" />
                <span>OUR STORY</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground leading-snug">
                Making Salon Experiences Simpler
              </h2>

              <p className="mt-5 text-sm sm:text-base leading-relaxed text-muted-foreground">
                Scheduling a beauty treatment shouldn&apos;t feel complicated or time-consuming.
                Traditional booking often meant phone tag, unclear pricing, and uncertain appointment
                status. SalonBook was created to bring clarity and ease to the entire process.
              </p>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                As a specialized booking platform, SalonBook provides a seamless digital bridge
                between clients seeking premium salon care and professionals delivering quality
                services. From exploring service menus and reading detailed descriptions to selecting
                convenient appointment times and tracking status confirmations in real time, every step
                is designed with simplicity in mind.
              </p>

              <div className="mt-6 pt-6 border-t border-border/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">Clear Transparency</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Detailed treatment summaries, durations, and upfront pricing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">Streamlined Workflow</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Personalized customer dashboard with instant visit and payment tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C: MISSION & VISION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background border-b border-border/60">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              Our Mission &amp; Vision
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Guiding our dedication to delivering a smooth and accessible salon scheduling experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Mission Card */}
            <div className="group rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/40 relative overflow-hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground mb-6">
                <Target className="h-6 w-6 text-primary" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Our Purpose
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-4">
                Our Mission
              </h3>

              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                To make salon service discovery and appointment booking simple, transparent, and
                convenient for everyone. We eliminate scheduling friction so clients can focus on
                enjoying their wellness and styling experiences.
              </p>
            </div>

            {/* Vision Card */}
            <div className="group rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/40 relative overflow-hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground mb-6">
                <Compass className="h-6 w-6 text-primary" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Our Aspiration
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-4">
                Our Vision
              </h3>

              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                To provide a smooth, reliable, and accessible digital platform that empowers both
                customers and salon administrators. We envision effortless salon coordination where
                convenience, trust, and craftsmanship come together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION D: WHY CHOOSE SALONBOOK
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-secondary/30 border-b border-border/60">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-0.5 text-xs font-medium text-accent-foreground mb-3">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              <span>THE SALONBOOK ADVANTAGE</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              Why Choose SalonBook
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Designed with care to deliver peace of mind from browsing to appointment day.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group rounded-xl border border-border bg-card p-6 shadow-2xs transition-all duration-200 hover:shadow-sm hover:border-primary/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION E: HOW IT WORKS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background border-b border-border/60">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Three simple steps from discovery to your confirmed salon appointment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {howItWorksSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-border bg-card p-7 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Step indicator */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-serif text-2xl font-bold text-primary/40">
                        {step.step}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="h-4.5 w-4.5 text-primary" />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2.5">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION F: FINAL CTA
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-secondary/40">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
            {/* Subtle glow accent */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl"
              aria-hidden="true"
            />

            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/80 px-3.5 py-1 text-xs font-semibold text-accent-foreground mb-4">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>READY TO BEGIN?</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              Your Next Salon Experience Starts Here
            </h2>

            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Explore our wide variety of professional beauty and wellness treatments, select your
              convenient time slot, and reserve your appointment with total confidence.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/services" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-7 py-3 text-sm font-medium shadow-xs">
                  Explore Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-7 py-3 text-sm font-medium">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
