"use client";

import { useEffect } from "react";
import { AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/types";

interface UserStatusDialogProps {
  isOpen: boolean;
  user: AdminUser | null;
  targetBlocked: boolean; // true = block, false = unblock
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function UserStatusDialog({
  isOpen,
  user,
  targetBlocked,
  isSubmitting,
  onConfirm,
  onClose,
}: UserStatusDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !user) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-status-dialog-title"
      aria-describedby="user-status-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              targetBlocked
                ? "bg-rose-100 text-rose-600"
                : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {targetBlocked ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3
              id="user-status-dialog-title"
              className="text-base font-semibold text-foreground tracking-tight"
            >
              {targetBlocked ? "Block Customer Account" : "Unblock Customer Account"}
            </h3>
            <p
              id="user-status-dialog-description"
              className="text-xs text-muted-foreground leading-relaxed"
            >
              {targetBlocked ? (
                <>
                  Are you sure you want to suspend account access for{" "}
                  <strong className="text-foreground font-medium">
                    {user.name} ({user.email})
                  </strong>
                  ? They will be prevented from booking appointments and completing checkout.
                </>
              ) : (
                <>
                  Are you sure you want to restore active status for{" "}
                  <strong className="text-foreground font-medium">
                    {user.name} ({user.email})
                  </strong>
                  ? Their booking privileges and salon services access will be reactivated.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={
              targetBlocked
                ? "bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500"
                : "bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-emerald-500"
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                <span>{targetBlocked ? "Blocking..." : "Unblocking..."}</span>
              </>
            ) : (
              <span>{targetBlocked ? "Confirm Block" : "Confirm Unblock"}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
