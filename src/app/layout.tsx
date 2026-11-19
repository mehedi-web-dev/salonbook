import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SalonBook | Premium Salon & Spa Booking",
    template: "%s | SalonBook",
  },
  description:
    "Elevate your beauty and wellness routine. Book premier salon, hair, skincare, and spa appointments with trusted professionals.",
  keywords: [
    "salon booking",
    "beauty parlor",
    "hair styling",
    "spa appointments",
    "wellness",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} h-full antialiased light`}
      style={{ colorScheme: "light" }}
    >
      <body className="flex min-h-screen flex-col font-sans bg-background text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
