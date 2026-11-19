import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            SalonBook
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/services"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Services
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        </nav>

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
      </div>
    </header>
  );
}
