"use client";

import { useState } from "react";
import { User, Mail, Phone, Shield, ShieldAlert, CheckCircle2, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateMyProfile } from "@/lib/profile-api";
import { useSession } from "@/lib/auth-client";
import type { UserProfile } from "@/types";

interface ProfileFormProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export function ProfileForm({ profile, onProfileUpdated }: ProfileFormProps) {
  const { refetch } = useSession();
  const [name, setName] = useState(profile.name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; phone?: string } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = "Full name is required.";
    } else if (trimmedName.length > 100) {
      newErrors.name = "Full name cannot exceed 100 characters.";
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone) {
      if (trimmedPhone.length < 3 || trimmedPhone.length > 30) {
        newErrors.phone = "Phone number must be between 3 and 30 characters.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setName(profile.name || "");
    setPhone(profile.phone || "");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateMyProfile({
        name: name.trim(),
        phone: phone.trim() ? phone.trim() : null,
      });

      // Synchronize Better Auth session so Navbar and Dashboard reflect updated name
      await refetch?.();

      // Dispatch global window event for components that listen for profile updates
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("salonbook:profile-updated", { detail: updated }));
      }

      toast.success("Profile details updated successfully");
      onProfileUpdated(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isChanged =
    name.trim() !== (profile.name || "").trim() ||
    phone.trim() !== (profile.phone || "").trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Read-Only Account Identity Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-secondary/20 p-4">
        <div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Account Role
          </span>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-primary" />
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${
                profile.role === "admin"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {profile.role === "admin" ? "Administrator" : profile.role || "Customer"}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Account Status
          </span>
          <div className="flex items-center gap-1.5">
            {profile.isBlocked ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 text-rose-800 px-2 py-0.5 text-xs font-semibold">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-700" />
                <span>Restricted / Suspended</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                <span>Active Account</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="profile-name" className="block text-xs font-semibold text-foreground mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              disabled={isSubmitting || profile.isBlocked}
              placeholder="e.g. Sarah Jenkins"
              maxLength={100}
              className={`w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? "border-rose-400 focus:ring-rose-400" : "border-border"
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Email Address (Read-Only) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="profile-email" className="block text-xs font-semibold text-foreground">
              Email Address
            </label>
            <span className="text-[11px] text-muted-foreground italic">
              Managed by authentication provider
            </span>
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="profile-email"
              type="email"
              value={profile.email}
              disabled
              readOnly
              className="w-full rounded-md border border-border bg-muted/50 py-2 pl-9 pr-3 text-sm text-muted-foreground cursor-not-allowed select-all"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="profile-phone" className="block text-xs font-semibold text-foreground mb-1.5">
            Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              disabled={isSubmitting || profile.isBlocked}
              placeholder="e.g. +1 (555) 234-5678"
              maxLength={30}
              className={`w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.phone ? "border-rose-400 focus:ring-rose-400" : "border-border"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {isChanged && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-xs gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            <span>Discard Changes</span>
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitting || !isChanged || profile.isBlocked}
          className="text-xs gap-1.5 min-w-[130px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
