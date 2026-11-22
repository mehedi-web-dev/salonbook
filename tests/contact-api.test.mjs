import test from "node:test";
import assert from "node:assert/strict";

test("Contact Email Utility - Sanitization & Config Resolution", async (t) => {
  const { escapeHtml, getEmailConfig } = await import("../src/lib/email.ts");

  await t.test("escapeHtml prevents HTML and XSS injection in email body", () => {
    const raw = `<script>alert('xss')</script> & "quotes" 'single'`;
    const escaped = escapeHtml(raw);

    assert.strictEqual(
      escaped,
      "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt; &amp; &quot;quotes&quot; &#039;single&#039;"
    );
    assert.doesNotMatch(escaped, /<script>/);
  });

  await t.test("getEmailConfig defaults to mehedihasan958327@gmail.com as recipient", () => {
    delete process.env.CONTACT_RECEIVER_EMAIL;
    const config = getEmailConfig();

    assert.strictEqual(config.receiver, "mehedihasan958327@gmail.com");
    assert.strictEqual(config.host, "smtp.gmail.com");
    assert.strictEqual(config.port, 465);
    assert.strictEqual(config.secure, true);
  });

  await t.test("getEmailConfig flags unconfigured or placeholder password safely", () => {
    process.env.SMTP_USER = "mehedihasan958327@gmail.com";
    process.env.SMTP_PASS = "YOUR_GMAIL_APP_PASSWORD";
    const config = getEmailConfig();
    assert.strictEqual(config.isConfigured, false);

    delete process.env.SMTP_PASS;
    const config2 = getEmailConfig();
    assert.strictEqual(config2.isConfigured, false);
  });
});

test("Contact API Route - processContactSubmission Pipeline", async (t) => {
  const { processContactSubmission } = await import("../src/lib/email.ts");

  let testIpCounter = 1;
  const getUniqueIp = () => `10.42.0.${testIpCounter++}`;

  await t.test("Rejects missing required fields with HTTP 400", async () => {
    const res = await processContactSubmission(
      {
        fullName: "John",
        // missing email, subject, message
      },
      getUniqueIp()
    );

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error);
    assert.ok(Array.isArray(res.body.details));
  });

  await t.test("Rejects invalid email format with HTTP 400", async () => {
    const res = await processContactSubmission(
      {
        fullName: "Jane Doe",
        email: "not-a-valid-email",
        subject: "Appointment Inquiry",
        message: "Hello, I would like to book a salon service.",
      },
      getUniqueIp()
    );

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /valid email/i);
  });

  await t.test("Rejects excessively short input with HTTP 400", async () => {
    const res = await processContactSubmission(
      {
        fullName: "J", // < 2 chars
        email: "jane@example.com",
        subject: "Hi", // < 3 chars
        message: "Short", // < 10 chars
      },
      getUniqueIp()
    );

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await t.test("Rejects excessively long input exceeding limits with HTTP 400", async () => {
    const res = await processContactSubmission(
      {
        fullName: "A".repeat(85), // > 80 chars
        email: "jane@example.com",
        subject: "Valid Subject",
        message: "Valid message content over 10 chars.",
      },
      getUniqueIp()
    );

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /80 characters/i);
  });

  await t.test("Honeypot spam detection rejects bot submission with HTTP 400", async () => {
    const res = await processContactSubmission(
      {
        fullName: "Spam Bot",
        email: "bot@spammer.org",
        subject: "Buy Cheap Meds",
        message: "This is a spam message that should be trapped by honeypot.",
        honeypot: "https://spamlink.ru", // bot filled this hidden field!
      },
      getUniqueIp()
    );

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /spam/i);
  });

  await t.test("Returns HTTP 503 when SMTP credentials are unconfigured or placeholder", async () => {
    delete process.env.SMTP_PASS;
    const res = await processContactSubmission(
      {
        fullName: "Eleanor Vance",
        email: "eleanor@example.com",
        subject: "Hair Treatment Inquiry",
        message: "I would like to inquire about keratin hair treatment availability.",
      },
      getUniqueIp()
    );

    assert.strictEqual(res.status, 503);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /not configured/i);
  });

  await t.test("Rate limiter blocks abuse after threshold from same IP with HTTP 429", async () => {
    const spamIp = "203.0.113.99";

    // Submit 5 valid requests (reaching limit)
    for (let i = 0; i < 5; i++) {
      await processContactSubmission(
        {
          fullName: `User ${i}`,
          email: `user${i}@example.com`,
          subject: "Test Inquiry",
          message: "Valid message content for rate limiting test.",
        },
        spamIp
      );
    }

    // 6th request from same IP should be rate limited
    const res = await processContactSubmission(
      {
        fullName: "Abusive User",
        email: "abusive@example.com",
        subject: "Another Inquiry",
        message: "Another inquiry that exceeds the per-window rate limit.",
      },
      spamIp
    );

    assert.strictEqual(res.status, 429);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /too many/i);
  });
});
