"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Route protection wrapper for administrative pages.
 * - Redirects unauthenticated visitors to /login.
 * - Blocks authenticated customers with a clear unauthorized view and return link.
 * - Grants full access to users with role="admin".
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      toast.info("Please sign in with administrator credentials");
      router.replace("/login");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-medium text-muted-foreground">
            Verifying administrator permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const isAdmin = session.user.role === "admin";

  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-700 mb-4 shadow-xs">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900 mb-3">
          <Sparkles className="h-3 w-3 text-rose-600" />
          <span>Access Restricted</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Administrative Privileges Required
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          You are currently signed in as a <strong className="text-foreground capitalize">{session.user.role || "Customer"}</strong>.
          Service creation, modifications, image uploads, and status management are reserved exclusively for salon administrators.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="primary" size="md">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to Customer Dashboard</span>
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="outline" size="md">
              Browse Services
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
