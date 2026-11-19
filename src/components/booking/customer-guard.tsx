"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

interface CustomerGuardProps {
  children: ReactNode;
}

/**
 * Route protection wrapper for customer portal pages.
 * - Redirects unauthenticated visitors to /login.
 * - Blocks administrators from customer-specific flows with a redirection surface.
 * - Grants full access to authenticated customers.
 */
export function CustomerGuard({ children }: CustomerGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      toast.info("Please sign in to view your appointments");
      router.replace("/login");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-medium text-muted-foreground">
            Verifying customer session...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const isAdmin = session.user.role === "admin";

  if (isAdmin) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground mb-4 shadow-xs">
          <Shield className="h-7 w-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground mb-3">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Administrator Profile</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Customer Area Restricted
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          You are currently signed in as an <strong className="text-foreground">Administrator</strong>.
          Personal appointment reservations are managed by customer accounts.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/dashboard/admin/services">
            <Button variant="primary" size="md">
              <span>Admin Services Portal</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="md">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Dashboard Overview</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
