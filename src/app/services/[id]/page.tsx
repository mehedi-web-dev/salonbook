"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Tag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BookingForm } from "@/components/booking/booking-form";
import { fetchServiceById } from "@/lib/services-api";
import { useSession } from "@/lib/auth-client";
import type { Service } from "@/types";

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const { data: session, isPending: isSessionLoading } = useSession();

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // Route protection: redirect unauthenticated users to /login
  useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      toast.info("Please sign in to view treatment details");
      router.replace("/login");
    }
  }, [isSessionLoading, session, router]);

  useEffect(() => {
    if (!id || isSessionLoading || !session?.user) return;
    let isCurrent = true;

    async function executeFetch() {
      try {
        const data = await fetchServiceById(id);
        if (isCurrent) {
          const isAdmin = session?.user?.role === "admin";
          if (!data || (!data.isActive && !isAdmin)) {
            setIsNotFound(true);
          } else {
            setService(data);
            setIsNotFound(false);
            setErrorMessage(null);
          }
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          if (err instanceof Error) {
            if (err.message === "NOT_FOUND" || err.message === "INVALID_ID") {
              setIsNotFound(true);
            } else {
              setErrorMessage(err.message);
            }
          } else {
            setErrorMessage("An unexpected error occurred while loading this service.");
          }
          setIsLoading(false);
        }
      }
    }

    executeFetch();

    return () => {
      isCurrent = false;
    };
  }, [id, isSessionLoading, session]);

  const handleRetry = () => {
    if (!id) return;
    setIsLoading(true);
    setIsNotFound(false);
    setErrorMessage(null);

    fetchServiceById(id)
      .then((data) => {
        const isAdmin = session?.user?.role === "admin";
        if (!data || (!data.isActive && !isAdmin)) {
          setIsNotFound(true);
        } else {
          setService(data);
        }
      })
      .catch((err) => {
        if (err instanceof Error) {
          if (err.message === "NOT_FOUND" || err.message === "INVALID_ID") {
            setIsNotFound(true);
          } else {
            setErrorMessage(err.message);
          }
        } else {
          setErrorMessage("An unexpected error occurred while loading this service.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // While checking session authentication, show minimal loading state
  if (isSessionLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-medium text-muted-foreground">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirecting to /login
  if (!session?.user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="h-6 w-36 rounded bg-muted animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-[380px] rounded-lg bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-24 rounded bg-muted animate-pulse" />
            <div className="h-10 w-4/5 rounded bg-muted animate-pulse" />
            <div className="h-6 w-32 rounded bg-muted animate-pulse" />
            <div className="h-20 w-full rounded bg-muted animate-pulse" />
            <div className="h-12 w-full rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground mb-4">
          <HelpCircle className="h-7 w-7" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Service Not Found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          The requested salon treatment could not be found or is currently unavailable in our
          active catalog.
        </p>
        <div className="mt-8">
          <Link href="/services">
            <Button variant="primary" size="md">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to Services Catalog</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (errorMessage || !service) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold text-rose-900">
          Error Loading Service Details
        </h2>
        <p className="mt-1 text-xs text-rose-800 max-w-md mx-auto mb-6">
          {errorMessage || "Unable to reach service details."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
          <Link href="/services">
            <Button variant="ghost" size="sm">
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const duration = service.duration ?? service.durationMinutes ?? 0;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Breadcrumb / Back Link */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Services Catalog</span>
        </Link>
        <span>/</span>
        <span className="capitalize">{service.category}</span>
        <span>/</span>
        <span className="text-foreground truncate font-medium max-w-[200px]">
          {service.name}
        </span>
      </nav>

      {/* Main Details Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column: Service Media */}
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
          <div className="relative aspect-4/3 w-full bg-secondary/50">
            {service.image && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.image}
                alt={service.name}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-secondary/30 to-secondary p-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-xs">
                  <Sparkles className="h-8 w-8" />
                </span>
                <span className="font-serif text-lg font-medium text-foreground">
                  {service.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  Premium {service.category} Experience
                </span>
              </div>
            )}

            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-foreground shadow-xs">
                <Tag className="h-3.5 w-3.5 text-primary" />
                {service.category}
              </span>
            </div>
          </div>

          <div className="p-5 border-t border-border bg-secondary/20">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-md border border-border bg-card p-3">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Session Duration
                </p>
                <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{duration} minutes</span>
                </p>
              </div>
              <div className="rounded-md border border-border bg-card p-3">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Service Rate
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  ${service.price}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Service Information */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="inline-flex items-center gap-1 rounded bg-accent/70 px-2 py-0.5 text-xs font-medium text-accent-foreground mb-3">
              <Sparkles className="h-3 w-3" />
              <span>Verified Specialist Treatment</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight">
              {service.name}
            </h1>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                ${service.price}
              </span>
              <span className="text-xs text-muted-foreground">
                &bull; {duration} mins duration
              </span>
            </div>
          </div>

          {/* Short description if available */}
          {service.shortDescription && (
            <p className="text-sm font-medium text-foreground/80 bg-secondary/40 p-4 rounded-md border border-border/60 leading-relaxed">
              {service.shortDescription}
            </p>
          )}

          {/* Full description */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Treatment Overview
            </h2>
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line space-y-3">
              {service.description}
            </div>
          </div>

          {/* Salon Assurance / Highlights */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-2.5">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Included In Every Session
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Complimentary personalized hair &amp; skin consultation</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <span>Premium, sanitized salon grade instruments and organic products</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Tailored aftercare recommendations from your stylist</span>
            </div>
          </div>

          {/* Customer Appointment Booking Form */}
          <BookingForm service={service} />
        </div>
      </div>
    </div>
  );
}
