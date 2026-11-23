"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarberDeleteDialogProps {
  isOpen: boolean;
  barberName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function BarberDeleteDialog({
  isOpen,
  barberName,
  isDeleting,
  onConfirm,
  onClose,
}: BarberDeleteDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
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
              id="delete-dialog-title"
              className="text-base font-semibold text-foreground tracking-tight"
            >
              Delete Barber Profile
            </h3>
            <p
              id="delete-dialog-description"
              className="text-xs text-muted-foreground leading-relaxed"
            >
              Are you sure you want to delete{" "}
              <strong className="text-foreground font-medium">&ldquo;{barberName}&rdquo;</strong>? This
              action permanently removes the specialist profile from the system and cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Barber</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
