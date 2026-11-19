import { Metadata } from "next";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View and manage your SalonBook appointments.",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-medium text-accent-foreground mb-4">
          <Calendar className="h-3.5 w-3.5" />
          <span>Customer Portal</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Appointment Dashboard
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Manage your upcoming appointments, track booking statuses, and view history.
        </p>
      </div>

      <div className="mt-12 rounded-lg border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
        Appointments dashboard placeholder &mdash; ready for user authentication & bookings API integration.
      </div>
    </div>
  );
}
