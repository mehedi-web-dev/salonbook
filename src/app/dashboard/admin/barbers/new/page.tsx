"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/admin-guard";
import { BarberForm } from "@/components/barbers/barber-form";
import { createBarber } from "@/lib/barbers-api";
import type { CreateBarberInput } from "@/types";

export default function NewBarberPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBarber = async (formData: CreateBarberInput) => {
    setIsSubmitting(true);
    try {
      await createBarber(formData);
      toast.success("Barber profile created successfully!");
      router.push("/dashboard/admin/barbers");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create barber profile";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/dashboard/admin" className="hover:text-foreground transition-colors">
                Admin Console
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/dashboard/admin/barbers" className="hover:text-foreground transition-colors">
                Manage Barbers
              </Link>
            </li>
            <li>/</li>
            <li>
              <span className="text-foreground font-semibold">New Barber</span>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900 mb-3">
            <Scissors className="h-3.5 w-3.5 text-rose-700" />
            <span>Add Barber or Stylist</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Register New Specialist
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Fill in the specialist&apos;s details, credentials, specializations, and associate them with
            relevant treatments in your catalog.
          </p>
        </div>

        {/* Barber Form */}
        <BarberForm
          onSubmit={handleCreateBarber}
          isSubmitting={isSubmitting}
        />
      </div>
    </AdminGuard>
  );
}
