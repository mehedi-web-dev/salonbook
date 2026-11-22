"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send, Loader2, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name cannot exceed 80 characters"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address")
    .max(120, "Email address cannot exceed 120 characters"),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(120, "Subject cannot exceed 120 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
  honeypot: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const [submissionState, setSubmissionState] = useState<{
    status: "idle" | "success" | "error";
    message: string | null;
  }>({
    status: "idle",
    message: null,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      subject: "",
      message: "",
      honeypot: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: ContactFormData) => {
    // Clear previous status
    setSubmissionState({ status: "idle", message: null });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        setSubmissionState({
          status: "success",
          message:
            result.message ||
            "Thank you! Your message has been sent successfully. We will get back to you shortly.",
        });
        toast.success("Message sent successfully!");
        reset({
          fullName: "",
          email: "",
          subject: "",
          message: "",
          honeypot: "",
        });
      } else {
        const errorMsg =
          result.error ||
          "Failed to deliver your message. Please try again later or reach out to us directly.";
        setSubmissionState({
          status: "error",
          message: errorMsg,
        });
        toast.error(errorMsg);
        // Preserves entered form values so user doesn't lose their input
      }
    } catch (err) {
      console.error("Contact form submission error:", err);
      const networkError =
        "Network error. Please check your connection and try again.";
      setSubmissionState({
        status: "error",
        message: networkError,
      });
      toast.error(networkError);
    }
  };

  const handleSendAnother = () => {
    setSubmissionState({ status: "idle", message: null });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-xs relative">
      <div className="mb-6">
        <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
          Send Us a Message
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Fill out the form below. We will review your inquiry as soon as possible.
        </p>
      </div>

      {/* Success Notification Banner */}
      {submissionState.status === "success" && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 text-emerald-950 mb-6 space-y-3"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-900">
                Message Sent Successfully
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-emerald-800 leading-relaxed">
                {submissionState.message}
              </p>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendAnother}
              className="text-xs border-emerald-300 text-emerald-900 hover:bg-emerald-100"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Send Another Message
            </Button>
          </div>
        </div>
      )}

      {/* Error Notification Banner */}
      {submissionState.status === "error" && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-rose-200 bg-rose-50/80 p-5 text-rose-950 mb-6 space-y-2"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-900">
                Unable to Send Message
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-rose-800 leading-relaxed">
                {submissionState.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Anti-spam Honeypot Field (Hidden from humans & screen readers) */}
        <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
          <label htmlFor="contact-honeypot">Leave this field blank</label>
          <input
            id="contact-honeypot"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("honeypot")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="contact-fullName"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              Full Name <span className="text-primary">*</span>
            </label>
            <input
              id="contact-fullName"
              type="text"
              autoComplete="name"
              disabled={isSubmitting}
              placeholder="e.g. Eleanor Vance"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              className={`w-full rounded-md border px-3.5 py-2 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors disabled:opacity-50 ${
                errors.fullName ? "border-rose-500 bg-rose-50/20" : "border-border"
              }`}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p id="fullName-error" className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.fullName.message}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="contact-email"
              className="block text-xs font-medium text-foreground mb-1.5"
            >
              Email Address <span className="text-primary">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              placeholder="e.g. eleanor@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full rounded-md border px-3.5 py-2 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors disabled:opacity-50 ${
                errors.email ? "border-rose-500 bg-rose-50/20" : "border-border"
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor="contact-subject"
            className="block text-xs font-medium text-foreground mb-1.5"
          >
            Subject <span className="text-primary">*</span>
          </label>
          <input
            id="contact-subject"
            type="text"
            disabled={isSubmitting}
            placeholder="e.g. Question regarding hair styling appointments"
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "subject-error" : undefined}
            className={`w-full rounded-md border px-3.5 py-2 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors disabled:opacity-50 ${
              errors.subject ? "border-rose-500 bg-rose-50/20" : "border-border"
            }`}
            {...register("subject")}
          />
          {errors.subject && (
            <p id="subject-error" className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{errors.subject.message}</span>
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="contact-message"
            className="block text-xs font-medium text-foreground mb-1.5"
          >
            Message <span className="text-primary">*</span>
          </label>
          <textarea
            id="contact-message"
            rows={5}
            disabled={isSubmitting}
            placeholder="Please write your questions or request here..."
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={`w-full rounded-md border px-3.5 py-2 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-y disabled:opacity-50 ${
              errors.message ? "border-rose-500 bg-rose-50/20" : "border-border"
            }`}
            {...register("message")}
          />
          {errors.message && (
            <p id="message-error" className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{errors.message.message}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-7 py-2.5 text-sm font-medium shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                <span>Send Message</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
