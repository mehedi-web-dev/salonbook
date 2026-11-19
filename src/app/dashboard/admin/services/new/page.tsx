"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ServiceForm } from "@/components/services/service-form";
import { createService } from "@/lib/services-api";
import type { CreateServiceInput } from "@/types";

export default function NewServicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: CreateServiceInput) => {
    setIsSubmitting(true);
    try {
      const created = await createService(data);
      toast.success(`"${created.name}" created successfully!`);
      router.push("/dashboard/admin/services");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create service";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors font-medium"
          >
            Dashboard
          </Link>
          <span>/</span>
          <Link
            href="/dashboard/admin/services"
            className="hover:text-foreground transition-colors font-medium"
          >
            Services Management
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">New Treatment</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground mb-3">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Service Catalog Authoring</span>
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            Create New Service
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Add a new treatment to your salon offerings, specify pricing, set duration, and upload showcase imagery.
          </p>
        </div>

        {/* Create Service Form */}
        <ServiceForm
          isEditing={false}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
        />
      </div>
    </AdminGuard>
  );
}
