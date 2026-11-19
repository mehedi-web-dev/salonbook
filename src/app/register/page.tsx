import { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your new SalonBook customer account.",
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-md items-center justify-center px-4 py-16">
      <div className="w-full rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground mb-3">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Create an Account
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Join SalonBook to schedule and manage appointments.
          </p>
        </div>

        <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-xs text-muted-foreground">
          Registration interface placeholder &mdash; scheduled for authentication integration.
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
