import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { FeaturedServices } from "@/components/home/featured-services";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { HowItWorks } from "@/components/home/how-it-works";
import { CtaBanner } from "@/components/home/cta-banner";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section with Trust Metrics */}
      <Hero />

      {/* 2. Dynamic Categories Section */}
      <FeaturedCategories />

      {/* 3. Dynamic Featured Services Section */}
      <FeaturedServices />

      {/* 4. Why Choose SalonBook? Benefits Section */}
      <WhyChooseUs />

      {/* 5. How It Works (3 Simple Steps) */}
      <HowItWorks />

      {/* 6. Call to Action Banner */}
      <CtaBanner />
    </div>
  );
}
