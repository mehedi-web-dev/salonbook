import Image from "next/image";
import { Star, Sparkles, Quote } from "lucide-react";
import { DEMO_TESTIMONIALS } from "@/data/testimonials";

export function Testimonials() {
  return (
    <section className="py-16 sm:py-24 border-t border-border bg-gradient-to-b from-background via-secondary/15 to-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3.5 py-1 text-xs font-medium text-accent-foreground mb-3 shadow-2xs">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Community Stories &bull; Demo Highlights</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            What Our Customers Say
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Real experiences make every visit special.
          </p>
          <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground/70 italic">
            (Sample customer feedback for demonstration purposes)
          </p>
        </div>

        {/* Testimonials 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {DEMO_TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              {/* Quote Icon & Star Rating */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary group-hover:bg-accent transition-colors">
                    <Quote className="h-4 w-4" />
                  </div>
                  <div
                    className="flex items-center gap-1 text-amber-500"
                    aria-label={`${item.rating} out of 5 stars`}
                  >
                    {Array.from({ length: item.rating }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground italic mb-6">
                  &ldquo;{item.review}&rdquo;
                </p>
              </div>

              {/* Customer Avatar & Bio */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-border/60">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold text-foreground">
                    {item.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
