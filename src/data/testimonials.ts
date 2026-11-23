export interface DemoTestimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  review: string;
}

export const DEMO_TESTIMONIALS: DemoTestimonial[] = [
  {
    id: "testimonial-1",
    name: "Elena Vance",
    role: "Balayage & Styling Client",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    rating: 5,
    review:
      "Booking my color consultation through SalonBook was effortless. The specialist listened carefully to what I wanted, and the outcome exceeded my expectations. The serene ambiance made the entire visit feel like a retreat.",
  },
  {
    id: "testimonial-2",
    name: "Sophia Chen",
    role: "Facial & Skincare Client",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80",
    rating: 5,
    review:
      "I appreciate the upfront pricing and real-time scheduling. My esthetician was gentle, highly skilled, and gave me personalized skincare advice that truly worked. I will definitely be booking my monthly visits here.",
  },
  {
    id: "testimonial-3",
    name: "Camilla Morgan",
    role: "Hair Spa & Blowout Client",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80",
    rating: 5,
    review:
      "From instant slot confirmation to the relaxing treatment itself, the whole experience was seamless. My hair felt so soft and vibrant for days afterwards. A wonderful salon platform with attention to every detail.",
  },
];
