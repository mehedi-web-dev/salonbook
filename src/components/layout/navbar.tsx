"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close mobile menu when viewport expands to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            SalonBook
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Desktop Navigation"
          className="hidden items-center gap-6 md:flex"
        >
          <Link
            href="/services"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1.5 py-1"
          >
            Services
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1.5 py-1"
          >
            Dashboard
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="primary" size="sm">
              Book Now
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/services">
            <Button variant="primary" size="sm" className="h-8 px-2.5 text-xs">
              Book Now
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {isOpen && (
        <div
          id="mobile-navigation-drawer"
          role="navigation"
          aria-label="Mobile Navigation Menu"
          className="border-b border-border bg-card px-4 pt-3 pb-6 shadow-md md:hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Home
            </Link>
            <Link
              href="/services"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Services
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Dashboard
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              <Button variant="outline" size="md" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link
              href="/services"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              <Button variant="primary" size="md" className="w-full">
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
