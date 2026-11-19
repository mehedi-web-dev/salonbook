"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Menu, X, LogOut, User as UserIcon, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";

export function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: session, isPending: isSessionLoading } = useSession();

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

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            setIsOpen(false);
            router.push("/login");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to sign out");
          },
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error signing out";
      toast.error(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const user = session?.user;
  const isAdmin = user?.role === "admin";

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
          {user && !isAdmin && (
            <Link
              href="/dashboard/appointments"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1.5 py-1"
            >
              My Appointments
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/dashboard/admin/services"
              className="inline-flex items-center gap-1 rounded bg-accent/70 px-2 py-0.5 text-xs font-semibold text-accent-foreground hover:bg-accent transition-colors"
            >
              <Shield className="h-3 w-3" />
              <span>Admin Services</span>
            </Link>
          )}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isSessionLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* User Profile Badge */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User avatar"}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
                  </span>
                )}
                <span className="text-xs font-medium text-foreground max-w-[120px] truncate">
                  {user.name}
                </span>
                {isAdmin && (
                  <span className="rounded bg-rose-100 px-1 py-0.2 text-[9px] font-bold text-rose-800 uppercase tracking-wide">
                    Admin
                  </span>
                )}
              </Link>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                <span>Logout</span>
              </Button>

              {/* Book Appointment CTA */}
              <Link href="/services">
                <Button variant="primary" size="sm">
                  Book Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
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
          )}
        </div>

        {/* Mobile Header Right */}
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
          {/* User profile card in mobile drawer if logged in */}
          {user && (
            <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-background p-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User avatar"}
                    className="h-8 w-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground uppercase shrink-0">
                {user.role || "customer"}
              </span>
            </div>
          )}

          {/* Navigation links */}
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
            {user && !isAdmin && (
              <Link
                href="/dashboard/appointments"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                My Appointments
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/dashboard/admin/services"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-rose-800 hover:bg-rose-50 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Services Management</span>
              </Link>
            )}
          </div>

          {/* Drawer Actions */}
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2.5">
            {user ? (
              <>
                <Link
                  href="/services"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button variant="primary" size="md" className="w-full">
                    Book Appointment
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full gap-2 text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
