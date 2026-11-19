import { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your SalonBook account.",
};

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-md items-center justify-center px-4 py-16">
      <div className="w-full rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground mb-3">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Sign In to SalonBook
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Access your bookings and personal beauty profile.
          </p>
        </div>

        <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-xs text-muted-foreground">
          Authentication interface placeholder &mdash; scheduled for authentication integration.
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
