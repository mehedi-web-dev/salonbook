import nodemailer from "nodemailer";
import { z } from "zod";

export interface ContactEmailPayload {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

// Server-side Zod validation schema
export const contactRequestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name cannot exceed 80 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .max(120, "Email address cannot exceed 120 characters")
    .email("Please enter a valid email address"),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(120, "Subject cannot exceed 120 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
  // Honeypot field for bot/spam detection (must be empty)
  honeypot: z.string().max(100).optional(),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;

// In-memory rate limiter per IP: max 5 requests per 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const rateLimitMap = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Periodically clean up stale IPs if map grows large
  if (rateLimitMap.size > 1000) {
    for (const [key, times] of rateLimitMap.entries()) {
      const active = times.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (active.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, active);
      }
    }
  }

  return false;
}

/**
 * Escapes HTML characters in user-provided content to prevent HTML/XSS injection in email clients.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Retrieves and validates the SMTP configuration from environment variables.
 * Client is NEVER allowed to specify or override the recipient email.
 */
export function getEmailConfig() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE !== "false";
  const user = process.env.SMTP_USER || "mehedihasan958327@gmail.com";
  const pass = process.env.SMTP_PASS;
  // Target recipient email must strictly be mehedihasan958327@gmail.com or configured receiver
  const receiver =
    process.env.CONTACT_RECEIVER_EMAIL || "mehedihasan958327@gmail.com";

  const isPlaceholderPass =
    !pass ||
    pass === "YOUR_GMAIL_APP_PASSWORD" ||
    pass === "your_gmail_app_password_here" ||
    pass.trim() === "";

  return {
    host,
    port,
    secure,
    user,
    pass,
    receiver,
    isConfigured: Boolean(user && !isPlaceholderPass),
  };
}

/**
 * Sends a contact inquiry email via Nodemailer.
 */
export async function sendContactEmail(payload: ContactEmailPayload) {
  const config = getEmailConfig();

  if (!config.isConfigured || !config.pass) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  const escapedName = escapeHtml(payload.fullName);
  const escapedEmail = escapeHtml(payload.email);
  const escapedSubject = escapeHtml(payload.subject);
  const escapedMessage = escapeHtml(payload.message).replace(/\n/g, "<br/>");
  const formattedDate = new Date().toUTCString();

  const plainTextContent = `
SalonBook — New Contact Inquiry
================================

From: ${payload.fullName} (${payload.email})
Subject: ${payload.subject}
Date: ${formattedDate}

Message:
${payload.message}

------------------------------------------------
Reply directly to this email to respond to ${payload.fullName}.
Sent securely via SalonBook Contact System.
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Contact Message - SalonBook</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fdfbf7; color: #1c1917; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e8e0d8; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background-color: #9f5b66; color: #ffffff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
    .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px; }
    .field-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .field-table td { padding: 8px 0; font-size: 14px; vertical-align: top; }
    .field-label { width: 110px; color: #78716c; font-weight: 600; }
    .field-value { color: #1c1917; }
    .message-box { background-color: #f6efe9; border-left: 4px solid #9f5b66; border-radius: 4px; padding: 16px 20px; font-size: 14px; line-height: 1.6; color: #1c1917; white-space: normal; word-break: break-word; }
    .footer { border-top: 1px solid #e8e0d8; padding: 20px 32px; font-size: 12px; color: #78716c; text-align: center; background-color: #faf7f2; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SalonBook — Contact Inquiry</h1>
      <p>A new visitor message has been submitted from the website</p>
    </div>
    <div class="content">
      <table class="field-table">
        <tr>
          <td class="field-label">Sender:</td>
          <td class="field-value"><strong>${escapedName}</strong></td>
        </tr>
        <tr>
          <td class="field-label">Email:</td>
          <td class="field-value"><a href="mailto:${escapedEmail}" style="color: #9f5b66; text-decoration: none;">${escapedEmail}</a></td>
        </tr>
        <tr>
          <td class="field-label">Subject:</td>
          <td class="field-value">${escapedSubject}</td>
        </tr>
        <tr>
          <td class="field-label">Received:</td>
          <td class="field-value">${formattedDate}</td>
        </tr>
      </table>

      <h3 style="font-size: 14px; font-weight: 600; color: #1c1917; margin: 0 0 8px 0;">Message Content:</h3>
      <div class="message-box">
        ${escapedMessage}
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">Reply directly to this email to contact <strong>${escapedName}</strong>.</p>
      <p style="margin: 6px 0 0 0; font-size: 11px; color: #a8a29e;">Sent automatically via SalonBook Platform • Recipient: ${config.receiver}</p>
    </div>
  </div>
</body>
</html>
`.trim();

  const mailOptions = {
    from: `"${escapedName} via SalonBook" <${config.user}>`,
    to: config.receiver,
    replyTo: payload.email,
    subject: `[SalonBook Contact] ${payload.subject}`,
    text: plainTextContent,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

export interface ContactProcessResult {
  status: number;
  body: {
    success: boolean;
    message?: string;
    error?: string;
    details?: { field: string; message: string }[];
  };
}

/**
 * Core processing pipeline for contact form submissions.
 */
export async function processContactSubmission(
  rawBody: unknown,
  clientIp = "127.0.0.1"
): Promise<ContactProcessResult> {
  // 1. Rate limiting check
  if (isRateLimited(clientIp)) {
    return {
      status: 429,
      body: {
        success: false,
        error: "Too many messages sent. Please wait a few minutes before trying again.",
      },
    };
  }

  // 2. Validate body schema
  const parseResult = contactRequestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || "Validation failed";
    return {
      status: 400,
      body: {
        success: false,
        error: firstError,
        details: parseResult.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
    };
  }

  const { fullName, email, subject, message, honeypot } = parseResult.data;

  // 3. Honeypot check
  if (honeypot && honeypot.trim().length > 0) {
    return {
      status: 400,
      body: {
        success: false,
        error: "Spam submission detected.",
      },
    };
  }

  // 4. SMTP configuration check
  const emailConfig = getEmailConfig();
  if (!emailConfig.isConfigured) {
    return {
      status: 503,
      body: {
        success: false,
        error:
          "Email messaging service is currently not configured. Please contact our support team directly.",
      },
    };
  }

  // 5. Send Email via Nodemailer
  try {
    await sendContactEmail({
      fullName,
      email,
      subject,
      message,
    });

    return {
      status: 200,
      body: {
        success: true,
        message: "Thank you! Your message has been sent successfully.",
      },
    };
  } catch (sendError) {
    console.error(
      "Nodemailer delivery error:",
      sendError instanceof Error ? sendError.message : "Unknown error"
    );

    return {
      status: 500,
      body: {
        success: false,
        error: "Failed to deliver message. Please try again later or contact us directly.",
      },
    };
  }
}
