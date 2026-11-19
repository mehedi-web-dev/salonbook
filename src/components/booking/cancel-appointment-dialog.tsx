"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/types";

interface CancelAppointmentDialogProps {
  isOpen: boolean;
  appointment: Appointment | null;
  isCancelling: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function CancelAppointmentDialog({
  isOpen,
  appointment,
  isCancelling,
  onConfirm,
  onClose,
}: CancelAppointmentDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isCancelling) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCancelling, onClose]);

  if (!isOpen || !appointment) return null;

  const serviceName = appointment.service?.name || "Salon Treatment";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
      aria-describedby="cancel-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3
              id="cancel-dialog-title"
              className="text-base font-semibold text-foreground tracking-tight"
            >
              Cancel Appointment
            </h3>
            <p
              id="cancel-dialog-description"
              className="text-xs text-muted-foreground leading-relaxed"
            >
              Are you sure you want to cancel your session for{" "}
              <strong className="text-foreground font-medium">
                &ldquo;{serviceName}&rdquo;
              </strong>{" "}
              on{" "}
              <strong className="text-foreground font-medium">
                {appointment.appointmentDate} at {appointment.timeSlot}
              </strong>
              ? Your reserved slot will be released.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isCancelling}
          >
            Keep Appointment
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isCancelling}
            className="bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500"
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Confirm Cancellation</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
