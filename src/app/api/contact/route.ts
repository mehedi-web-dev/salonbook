import { processContactSubmission } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // 1. Identify Client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : req.headers.get("x-real-ip") || "127.0.0.1";

    // 2. Parse JSON body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: "Invalid request payload. Expected JSON body.",
        },
        { status: 400 }
      );
    }

    // 3. Process submission via core pipeline
    const result = await processContactSubmission(body, ip);
    return Response.json(result.body, { status: result.status });
  } catch (err) {
    console.error(
      "Unhandled contact route error:",
      err instanceof Error ? err.message : "Unknown error"
    );

    return Response.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
