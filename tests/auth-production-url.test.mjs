import test from "node:test";
import assert from "node:assert/strict";

test("API Configuration - Same-Origin URL Resolution", async (t) => {
  await t.test("Production environment resolves strictly to same-origin frontend URL", async () => {
    // Simulate production server environment
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_SERVER_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    delete globalThis.window;

    // Dynamically import to test fresh resolution
    const { resolveApiBaseUrl, PRODUCTION_FRONTEND_URL, isProductionEnvironment } =
      await import("../src/lib/api-config.ts");

    assert.strictEqual(isProductionEnvironment(), true);
    assert.strictEqual(resolveApiBaseUrl(), PRODUCTION_FRONTEND_URL);
    assert.strictEqual(
      resolveApiBaseUrl(),
      "https://salonbook-virid.vercel.app"
    );
  });

  await t.test("Production environment rejects accidental localhost env vars", async () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:5000";
    delete globalThis.window;

    const { resolveApiBaseUrl, PRODUCTION_FRONTEND_URL } = await import(
      "../src/lib/api-config.ts"
    );

    assert.strictEqual(resolveApiBaseUrl(), PRODUCTION_FRONTEND_URL);
    assert.doesNotMatch(resolveApiBaseUrl(), /localhost:5000/);
  });

  await t.test("Browser client on Vercel domain resolves to same-origin frontend URL", async () => {
    // Simulate browser runtime on Vercel domain
    globalThis.window = {
      location: {
        hostname: "salonbook-virid.vercel.app",
        origin: "https://salonbook-virid.vercel.app",
      },
    };

    const { resolveApiBaseUrl, PRODUCTION_FRONTEND_URL, isProductionEnvironment } =
      await import("../src/lib/api-config.ts");

    assert.strictEqual(isProductionEnvironment(), true);
    assert.strictEqual(resolveApiBaseUrl(), PRODUCTION_FRONTEND_URL);
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

    const { resolveApiBaseUrl, LOCAL_DEV_URL } = await import(
      "../src/lib/api-config.ts"
    );

    assert.strictEqual(resolveApiBaseUrl(), LOCAL_DEV_URL);
    assert.strictEqual(resolveApiBaseUrl(), "http://localhost:5000");
  });
});

test("Better Auth - Same-Origin Request Generation", async (t) => {
  await t.test("signIn.social generates same-origin request to frontend proxy, not backend absolute URL", async () => {
    process.env.NODE_ENV = "production";
    globalThis.window = {
      location: {
        hostname: "salonbook-virid.vercel.app",
        origin: "https://salonbook-virid.vercel.app",
      },
    };

    const interceptedRequests = [];

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
          url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=test&redirect_uri=https%3A%2F%2Fsalonbook-virid.vercel.app%2Fapi%2Fauth%2Fcallback%2Fgoogle",
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
    const { getAuthClientBaseUrl } = await import("../src/lib/api-config.ts");

    const client = createAuthClient({
      baseURL: getAuthClientBaseUrl(),
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

    // Verify exact same-origin proxy endpoint
    assert.strictEqual(
      req.url,
      "https://salonbook-virid.vercel.app/api/auth/sign-in/social"
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

    // Verify NO localhost and NO direct backend server call in request URL
    assert.doesNotMatch(req.url, /localhost:5000/);
    assert.doesNotMatch(req.url, /salonbook-server-roan/);
  });

  await t.test("signIn.email generates same-origin request to frontend proxy", async () => {
    process.env.NODE_ENV = "production";
    globalThis.window = {
      location: {
        hostname: "salonbook-virid.vercel.app",
        origin: "https://salonbook-virid.vercel.app",
      },
    };

    const interceptedRequests = [];

    globalThis.fetch = async (url, options = {}) => {
      interceptedRequests.push({
        url: url?.toString() || String(url),
        method: options.method || "GET",
      });

      return new Response(
        JSON.stringify({
          user: { id: "u123", email: "test@example.com", role: "customer" },
          session: { id: "s123", token: "tok123" },
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
    const { getAuthClientBaseUrl } = await import("../src/lib/api-config.ts");

    const client = createAuthClient({
      baseURL: getAuthClientBaseUrl(),
      basePath: "/api/auth",
      fetchOptions: {
        credentials: "include",
      },
    });

    await client.signIn.email({
      email: "test@example.com",
      password: "password123",
    });

    assert.strictEqual(interceptedRequests.length, 1);
    assert.strictEqual(
      interceptedRequests[0].url,
      "https://salonbook-virid.vercel.app/api/auth/sign-in/email"
    );
  });

  await t.test("signOut generates same-origin request to frontend proxy", async () => {
    process.env.NODE_ENV = "production";
    globalThis.window = {
      location: {
        hostname: "salonbook-virid.vercel.app",
        origin: "https://salonbook-virid.vercel.app",
      },
    };

    const interceptedRequests = [];

    globalThis.fetch = async (url, options = {}) => {
      interceptedRequests.push({
        url: url?.toString() || String(url),
        method: options.method || "GET",
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const { createAuthClient } = await import(
      "../node_modules/better-auth/dist/client/index.mjs"
    );
    const { getAuthClientBaseUrl } = await import("../src/lib/api-config.ts");

    const client = createAuthClient({
      baseURL: getAuthClientBaseUrl(),
      basePath: "/api/auth",
      fetchOptions: {
        credentials: "include",
      },
    });

    await client.signOut();

    assert.strictEqual(interceptedRequests.length, 1);
    assert.strictEqual(
      interceptedRequests[0].url,
      "https://salonbook-virid.vercel.app/api/auth/sign-out"
    );
  });

  await t.test("getSession generates same-origin request to frontend proxy", async () => {
    process.env.NODE_ENV = "production";
    globalThis.window = {
      location: {
        hostname: "salonbook-virid.vercel.app",
        origin: "https://salonbook-virid.vercel.app",
      },
    };

    const interceptedRequests = [];

    globalThis.fetch = async (url, options = {}) => {
      interceptedRequests.push({
        url: url?.toString() || String(url),
        method: options.method || "GET",
      });

      return new Response(
        JSON.stringify({
          user: { id: "u123", email: "test@example.com", role: "customer" },
          session: { id: "s123", token: "tok123" },
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
    const { getAuthClientBaseUrl } = await import("../src/lib/api-config.ts");

    const client = createAuthClient({
      baseURL: getAuthClientBaseUrl(),
      basePath: "/api/auth",
      fetchOptions: {
        credentials: "include",
      },
    });

    await client.getSession();

    assert.strictEqual(interceptedRequests.length, 1);
    assert.strictEqual(
      interceptedRequests[0].url,
      "https://salonbook-virid.vercel.app/api/auth/get-session"
    );
  });
});

test("REST API Endpoints - Same-Origin Resolution in Production", async (t) => {
  await t.test("All API_ENDPOINTS route through frontend same-origin proxy in production", async () => {
    process.env.NODE_ENV = "production";
    globalThis.window = {
      location: {
        hostname: "salonbook-virid.vercel.app",
        origin: "https://salonbook-virid.vercel.app",
      },
    };

    const { API_ENDPOINTS } = await import("../src/lib/api-config.ts");

    assert.strictEqual(
      API_ENDPOINTS.SERVICES,
      "https://salonbook-virid.vercel.app/api/services"
    );
    assert.strictEqual(
      API_ENDPOINTS.PROFILE.ME,
      "https://salonbook-virid.vercel.app/api/profile/me"
    );
    assert.strictEqual(
      API_ENDPOINTS.APPOINTMENTS.MY,
      "https://salonbook-virid.vercel.app/api/appointments/my"
    );
    assert.strictEqual(
      API_ENDPOINTS.PAYMENTS.CREATE_CHECKOUT,
      "https://salonbook-virid.vercel.app/api/payments/create-checkout-session"
    );
    assert.strictEqual(
      API_ENDPOINTS.ADMIN.STATS,
      "https://salonbook-virid.vercel.app/api/admin/dashboard/stats"
    );
    assert.strictEqual(
      API_ENDPOINTS.UPLOADS.SERVICE_IMAGE,
      "https://salonbook-virid.vercel.app/api/uploads/service-image"
    );
    assert.strictEqual(
      API_ENDPOINTS.UPLOADS.PROFILE_IMAGE,
      "https://salonbook-virid.vercel.app/api/uploads/profile-image"
    );
  });
});

test("Next.js Rewrite Configuration - Route Mapping & Target Resolution", async (t) => {
  const { default: nextConfig, getBackendTargetUrl } = await import(
    "../next.config.ts"
  );

  await t.test("getBackendTargetUrl resolves to authoritative backend in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.BACKEND_INTERNAL_URL;
    delete process.env.BACKEND_URL;
    delete process.env.NEXT_PUBLIC_SERVER_BASE_URL;

    assert.strictEqual(
      getBackendTargetUrl(),
      "https://salonbook-server-roan.vercel.app"
    );
  });

  await t.test("getBackendTargetUrl resolves to localhost in development", () => {
    process.env.NODE_ENV = "development";
    delete process.env.BACKEND_INTERNAL_URL;
    delete process.env.BACKEND_URL;
    delete process.env.NEXT_PUBLIC_SERVER_BASE_URL;

    assert.strictEqual(getBackendTargetUrl(), "http://localhost:5000");
  });

  await t.test("next.config rewrites() proxies /api/auth/* and /api/* to backend", async () => {
    process.env.NODE_ENV = "production";
    const rewrites = await nextConfig.rewrites();

    assert.ok(Array.isArray(rewrites));
    assert.strictEqual(rewrites.length, 2);

    // Rule 1: Better Auth endpoints
    assert.strictEqual(rewrites[0].source, "/api/auth/:path*");
    assert.strictEqual(
      rewrites[0].destination,
      "https://salonbook-server-roan.vercel.app/api/auth/:path*"
    );

    // Rule 2: REST API endpoints
    assert.strictEqual(rewrites[1].source, "/api/:path*");
    assert.strictEqual(
      rewrites[1].destination,
      "https://salonbook-server-roan.vercel.app/api/:path*"
    );
  });

  await t.test("Rewrite mapping accurately projects key endpoints", async () => {
    process.env.NODE_ENV = "production";
    const backendTarget = getBackendTargetUrl();

    const testRoutes = [
      "/api/auth/sign-in/social",
      "/api/auth/callback/google",
      "/api/auth/get-session",
      "/api/auth/sign-in/email",
      "/api/auth/sign-out",
      "/api/services",
      "/api/profile/me",
    ];

    for (const route of testRoutes) {
      const destination = route.startsWith("/api/auth/")
        ? route.replace("/api/auth/", `${backendTarget}/api/auth/`)
        : route.replace("/api/", `${backendTarget}/api/`);

      assert.strictEqual(
        destination,
        `https://salonbook-server-roan.vercel.app${route}`
      );
      assert.doesNotMatch(destination, /localhost:5000/);
    }
  });
});
