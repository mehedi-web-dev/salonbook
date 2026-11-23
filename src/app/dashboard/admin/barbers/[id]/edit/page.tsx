"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Scissors, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin/admin-guard";
import { BarberForm } from "@/components/barbers/barber-form";
import { fetchBarberById, updateBarber } from "@/lib/barbers-api";
import type { Barber, CreateBarberInput } from "@/types";

export default function EditBarberPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [barber, setBarber] = useState<Barber | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isCurrent = true;

    async function loadBarber() {
      try {
        const data = await fetchBarberById(id, { populate: "services" });
        if (isCurrent) {
          setBarber(data);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const msg =
            err instanceof Error ? err.message : "Failed to load specialist details";
          setErrorMessage(msg);
          setIsLoading(false);
        }
      }
    }

    loadBarber();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const handleUpdateBarber = async (formData: CreateBarberInput) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await updateBarber(id, formData);
      toast.success("Barber profile updated successfully!");
      router.push("/dashboard/admin/barbers");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update barber profile";
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
              <span className="text-foreground font-semibold">Edit Profile</span>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900 mb-3">
            <Scissors className="h-3.5 w-3.5 text-rose-700" />
            <span>Update Specialist Profile</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            {barber ? `Edit ${barber.name}` : "Edit Barber Profile"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Modify credentials, specializations, biography, active status, and associated treatments.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-medium text-muted-foreground">
              Retrieving specialist record...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && (errorMessage || !barber) && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center max-w-md mx-auto my-8">
            <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-rose-950 mb-1">
              Barber Not Found
            </h2>
            <p className="text-xs text-rose-800 mb-4">
              {errorMessage || "The requested specialist profile could not be located."}
            </p>
            <Link href="/dashboard/admin/barbers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>Back to Manage Barbers</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Form Body */}
        {!isLoading && barber && (
          <BarberForm
            initialData={barber}
            isEditing={true}
            onSubmit={handleUpdateBarber}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </AdminGuard>
  );
}
