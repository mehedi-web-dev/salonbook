"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ServiceForm } from "@/components/services/service-form";
import { fetchServiceById, updateService } from "@/lib/services-api";
import type { Service, CreateServiceInput } from "@/types";

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isCurrent = true;

    async function loadService() {
      try {
        const data = await fetchServiceById(id);
        if (isCurrent) {
          setService(data);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const msg =
            err instanceof Error ? err.message : "Failed to load treatment details";
          setErrorMessage(msg);
          setIsLoading(false);
        }
      }
    }

    loadService();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const handleUpdate = async (data: CreateServiceInput) => {
    if (!id) return;
    setIsSubmitting(true);

    try {
      const updated = await updateService(id, data);
      toast.success(`"${updated.name}" updated successfully!`);
      router.push("/dashboard/admin/services");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update service";
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
          <span className="text-foreground font-semibold truncate max-w-[200px]">
            {service ? service.name : "Edit Service"}
          </span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground mb-3">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Service Catalog Configuration</span>
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            Edit Service
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Update pricing, descriptions, duration, active status, or replace service imagery via ImgBB.
          </p>
        </div>

        {/* Content Loading & Error States */}
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-xs font-medium text-muted-foreground">
              Loading treatment specifications...
            </p>
          </div>
        ) : errorMessage || !service ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700 mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold text-rose-900">
              Treatment Not Found
            </h2>
            <p className="mt-1 text-xs text-rose-800 max-w-sm mx-auto mb-6">
              {errorMessage || "The requested service could not be retrieved from the catalog."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/dashboard/admin/services">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  <span>Back to Services List</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ServiceForm
            initialData={service}
            isEditing={true}
            onSubmit={handleUpdate}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </AdminGuard>
  );
}
