import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact/contact-form";
import { CONTACT_CONFIG, FAQ_ITEMS } from "@/lib/contact-config";

export const metadata: Metadata = {
  title: "Contact Us | SalonBook — Salon Appointment Support",
  description:
    "Get in touch with the SalonBook team. Have questions about our salon treatments, appointment booking, or secure payments? We are here to help.",
};

export default function ContactPage() {
  const contactCards = [
    {
      icon: Mail,
      item: CONTACT_CONFIG.email,
    },
    {
      icon: Phone,
      item: CONTACT_CONFIG.phone,
    },
    {
      icon: MapPin,
      item: CONTACT_CONFIG.location,
    },
    {
      icon: Clock,
      item: CONTACT_CONFIG.openingHours,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* ─────────────────────────────────────────────────────────────
          SECTION A: CONTACT HERO
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
                <span>GET IN TOUCH</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
                We&apos;d Love to Hear From You
              </h1>

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl">
                Have a question about our services, appointments, or payments? We&apos;re here to
                help. Reach out through our contact information or submit an inquiry below, and
                we will get back to you promptly.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href="/services">
                  <Button size="lg" className="w-full sm:w-auto px-7 py-3 text-sm font-medium shadow-xs">
                    Explore Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#contact-form-section">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-7 py-3 text-sm font-medium">
                    Send a Message
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Right Image */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-[4/3] sm:aspect-[5/4] w-full overflow-hidden rounded-2xl border border-border bg-secondary shadow-md">
                  <Image
                    src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80"
                    alt="Warm salon studio reception and professional styling consultation atmosphere"
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
                    <p className="text-xs font-semibold text-foreground">Customer Support</p>
                    <p className="text-[11px] text-muted-foreground">Dedicated Booking Assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION B: CONTACT INFORMATION CARDS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-secondary/30 border-b border-border/60">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Contact Information
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Find our general channels below or reach out directly for appointment guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((card, idx) => {
              const Icon = card.icon;
              const { label, value, description, actionUrl, badge } = card.item;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card p-6 shadow-2xs transition-all duration-200 hover:shadow-sm hover:border-primary/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      {badge && (
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-foreground mb-1">{label}</h3>

                    {actionUrl ? (
                      <a
                        href={actionUrl}
                        className="text-xs sm:text-sm font-medium text-primary hover:underline break-words block"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-xs sm:text-sm font-medium text-foreground whitespace-pre-line">
                        {value}
                      </p>
                    )}
                  </div>

                  <p className="mt-4 text-[11px] sm:text-xs text-muted-foreground leading-relaxed pt-3 border-t border-border/60">
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C: CONTACT FORM
      ───────────────────────────────────────────────────────────── */}
      <section id="contact-form-section" className="py-16 sm:py-24 bg-background border-b border-border/60">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <ContactForm />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION D: QUICK HELP & FAQ
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-secondary/30 border-b border-border/60">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-0.5 text-xs font-medium text-accent-foreground mb-3">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              Quick Help &amp; FAQ
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Find fast answers about booking appointments, managing visit status, and Stripe payments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQ_ITEMS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-6 shadow-2xs transition-all duration-200 hover:shadow-sm hover:border-primary/30 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 flex items-start gap-2">
                    <span className="font-serif text-primary text-base font-bold shrink-0">
                      Q{idx + 1}.
                    </span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2 pl-6">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION E: FINAL CTA
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
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>BOOK WITH EASE</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              Ready for Your Next Salon Experience?
            </h2>

            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Browse our curated collection of professional salon and spa treatments and reserve
              your appointment with peace of mind.
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
                  Book an Appointment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
