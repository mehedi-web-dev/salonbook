"use client";

import { use, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AppointmentForwarderProps {
  params: Promise<{ id: string }>;
}

function ForwarderContent({ params }: AppointmentForwarderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (payment === "success") {
      const redirectUrl = sessionId
        ? `/dashboard/payments/success?appointment_id=${id}&session_id=${sessionId}`
        : `/dashboard/payments/success?appointment_id=${id}`;
      router.replace(redirectUrl);
    } else if (payment === "cancelled") {
      router.replace(`/dashboard/payments/cancel?appointment_id=${id}`);
    } else {
      router.replace("/dashboard/appointments");
    }
  }, [id, searchParams, router]);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-2.5">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">
          Redirecting to appointment details...
        </p>
      </div>
    </div>
  );
}

export default function AppointmentForwarderPage({ params }: AppointmentForwarderProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
          <div className="flex flex-col items-center gap-2.5">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs font-medium text-muted-foreground">
              Redirecting...
            </p>
          </div>
        </div>
      }
    >
      <ForwarderContent params={params} />
    </Suspense>
  );
}
