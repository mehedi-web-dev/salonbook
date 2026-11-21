import test from "node:test";
import assert from "node:assert/strict";

test("API Configuration - Production URL Resolution", async (t) => {
  await t.test("Production environment resolves strictly to production backend", async () => {
    // Simulate production server environment
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_SERVER_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    // Dynamically import to test fresh resolution
    const { resolveApiBaseUrl, PRODUCTION_API_URL, isProductionEnvironment } =
      await import("../src/lib/api-config.ts");

    assert.strictEqual(isProductionEnvironment(), true);
    assert.strictEqual(resolveApiBaseUrl(), PRODUCTION_API_URL);
    assert.strictEqual(
      resolveApiBaseUrl(),
      "https://salonbook-server-roan.vercel.app"
    );
  });

  await t.test("Production environment rejects accidental localhost env vars", async () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:5000";

    const { resolveApiBaseUrl, PRODUCTION_API_URL } = await import(
      "../src/lib/api-config.ts"
    );

    assert.strictEqual(resolveApiBaseUrl(), PRODUCTION_API_URL);
    assert.doesNotMatch(resolveApiBaseUrl(), /localhost:5000/);
  });

  await t.test("Browser client on Vercel domain resolves to production backend", async () => {
    // Simulate browser runtime on Vercel domain
    globalThis.window = {
      location: {
        hostname: "salonbook-virid.vercel.app",
        origin: "https://salonbook-virid.vercel.app",
      },
    };

    const { resolveApiBaseUrl, PRODUCTION_API_URL, isProductionEnvironment } =
      await import("../src/lib/api-config.ts");

    assert.strictEqual(isProductionEnvironment(), true);
    assert.strictEqual(resolveApiBaseUrl(), PRODUCTION_API_URL);
  });

  await t.test("Local development environment safely defaults to localhost:5000", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.NEXT_PUBLIC_SERVER_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    globalThis.window = {
      location: {
        hostname: "localhost",
        origin: "http://localhost:3000",
      },
    };

    const { resolveApiBaseUrl, LOCAL_API_URL } = await import(
      "../src/lib/api-config.ts"
    );

    assert.strictEqual(resolveApiBaseUrl(), LOCAL_API_URL);
    assert.strictEqual(resolveApiBaseUrl(), "http://localhost:5000");
  });
});

test("Better Auth - Google Sign-In Production Request URL", async (t) => {
  await t.test("signIn.social sends POST to production backend, not localhost", async () => {
    // Set production environment
    process.env.NODE_ENV = "production";
    globalThis.window = {
      location: {
        hostname: "salonbook-virid.vercel.app",
        origin: "https://salonbook-virid.vercel.app",
      },
    };

    const interceptedRequests = [];

    // Mock global fetch to capture Better Auth network traffic
    globalThis.fetch = async (url, options = {}) => {
      const urlStr = url?.toString() || String(url);
      interceptedRequests.push({
        url: urlStr,
        method: options.method || "GET",
        headers: options.headers,
        body: options.body,
        credentials: options.credentials,
      });

      return new Response(
        JSON.stringify({
          url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=test",
          redirect: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    };

    const { createAuthClient } = await import(
      "../node_modules/better-auth/dist/client/index.mjs"
    );
    const { resolveApiBaseUrl } = await import("../src/lib/api-config.ts");

    const client = createAuthClient({
      baseURL: resolveApiBaseUrl(),
      basePath: "/api/auth",
      fetchOptions: {
        credentials: "include",
      },
    });

    await client.signIn.social({
      provider: "google",
      callbackURL: "https://salonbook-virid.vercel.app/dashboard",
    });

    assert.strictEqual(interceptedRequests.length, 1);
    const req = interceptedRequests[0];

    // Verify exact production endpoint
    assert.strictEqual(
      req.url,
      "https://salonbook-server-roan.vercel.app/api/auth/sign-in/social"
    );
    assert.strictEqual(req.method, "POST");
    assert.strictEqual(req.credentials, "include");

    // Verify payload
    const parsedBody = JSON.parse(req.body);
    assert.strictEqual(parsedBody.provider, "google");
    assert.strictEqual(
      parsedBody.callbackURL,
      "https://salonbook-virid.vercel.app/dashboard"
    );

    // Verify no localhost references anywhere in request
    assert.doesNotMatch(req.url, /localhost:5000/);
    assert.doesNotMatch(req.url, /127\.0\.0\.1/);
  });
});
