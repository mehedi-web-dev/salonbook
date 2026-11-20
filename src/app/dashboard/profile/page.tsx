"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Sparkles,
  ShieldAlert,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  CreditCard,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileImageUpload } from "@/components/profile/profile-image-upload";
import { getMyProfile } from "@/lib/profile-api";
import { useSession } from "@/lib/auth-client";
import type { UserProfile } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect to login if unauthenticated once initial check completes
  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      toast.info("Please sign in to manage your profile");
      router.replace("/login");
    }
  }, [isSessionPending, session, router]);

  const loadProfile = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load account profile";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        if (isCurrent) setProfile(data);
      } catch (err: unknown) {
        if (isCurrent) {
          const msg = err instanceof Error ? err.message : "Failed to load account profile";
          setErrorMessage(msg);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    if (session?.user) {
      fetchProfile();
    }

    return () => {
      isCurrent = false;
    };
  }, [session]);

  const handleProfileUpdated = (updated: UserProfile) => {
    setProfile(updated);
  };

  const handleImageUpdated = (newImageUrl: string) => {
    if (profile) {
      setProfile({ ...profile, image: newImageUrl });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isSessionPending) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-medium text-muted-foreground">
            Verifying account session...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const isAdmin = profile?.role === "admin" || session.user.role === "admin";
  const isBlocked = profile?.isBlocked || !!session.user.isBlocked;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6">
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
            <Link
              href={isAdmin ? "/dashboard/admin" : "/dashboard"}
              className="hover:text-foreground transition-colors"
            >
              {isAdmin ? "Admin Overview" : "Dashboard"}
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-semibold">Profile Settings</li>
        </ol>
      </nav>

      {/* Blocked Account Notice */}
      {isBlocked && (
        <div
          role="alert"
          className="mb-8 rounded-xl border border-rose-300 bg-rose-50/90 p-5 text-rose-900 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-rose-900">
                Account Suspended / Restricted
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-rose-800">
                Your account is currently flagged as restricted by administration. Profile updates and new salon bookings are disabled. Please contact concierge support for assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-medium text-accent-foreground mb-3">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Account Management</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Personal Profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Update your personal contact information, manage your profile avatar, and review account security details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadProfile}
            disabled={isLoading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Profile</span>
          </Button>

          {isAdmin ? (
            <Link href="/dashboard/admin">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Shield className="h-3.5 w-3.5 text-rose-700" />
                <span>Admin Console</span>
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/appointments">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5" />
                <span>My Appointments</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8">
        {/* Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-8 rounded-xl border border-rose-300 bg-rose-50/90 p-5 text-rose-900 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-rose-900">
                  Unable to Load Profile Information
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-rose-800">{errorMessage}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadProfile}
                  className="mt-3 gap-1.5 text-xs border-rose-300 text-rose-900 hover:bg-rose-100"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Try Again</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            <div className="h-72 rounded-2xl bg-card border border-border p-6" />
            <div className="md:col-span-2 h-96 rounded-2xl bg-card border border-border p-6" />
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Avatar & Summary Info */}
            <div className="space-y-6">
              {/* Profile Image Upload Card */}
              <ProfileImageUpload
                profile={profile}
                onImageUpdated={handleImageUpdated}
              />

              {/* Account Metadata Card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 text-xs">
                <div className="border-b border-border pb-3">
                  <h3 className="font-semibold text-foreground text-sm">Account Overview</h3>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    SalonBook registered membership details
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Role:</span>
                    <span className="font-semibold uppercase text-foreground">
                      {profile.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member Since:</span>
                    <span className="font-medium text-foreground">
                      {formatDate(profile.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium text-foreground">
                      {formatDate(profile.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Role Specific Shortcuts */}
                <div className="pt-3 border-t border-border">
                  {isAdmin ? (
                    <Link href="/dashboard/admin/users" className="block w-full">
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>Customer Directory</span>
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard/payments" className="block w-full">
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Payment History</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Edit Profile Details Form */}
            <div className="md:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
                <div className="border-b border-border pb-4 mb-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    Profile Information
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep your contact information up to date for appointment notifications and salon reminders.
                  </p>
                </div>

                <ProfileForm
                  key={`${profile.id}-${profile.updatedAt}`}
                  profile={profile}
                  onProfileUpdated={handleProfileUpdated}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
