import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Dashboard Access & Role-Based Authorization Policy", () => {
  // Helper simulating middleware decision logic
  function evaluateMiddlewareAccess({ pathname, cookies, sessionUser }) {
    if (!pathname.startsWith("/dashboard")) {
      return { action: "next" };
    }

    const sessionToken =
      cookies["better-auth.session_token"] ||
      cookies["__Secure-better-auth.session_token"];

    if (!sessionToken || !sessionToken.trim()) {
      return {
        action: "redirect",
        destination: "/login",
      };
    }

    if (!sessionUser) {
      return {
        action: "redirect",
        destination: "/login",
      };
    }

    const isAdmin = sessionUser.role === "admin";
    const isAdminRoute = pathname.startsWith("/dashboard/admin");

    if (isAdminRoute && !isAdmin) {
      return {
        action: "redirect",
        destination: "/dashboard",
      };
    }

    if (pathname === "/dashboard" && isAdmin) {
      return {
        action: "redirect",
        destination: "/dashboard/admin",
      };
    }

    return { action: "next" };
  }

  it("blocks unauthenticated visitors from /dashboard and redirects to /login", () => {
    const result = evaluateMiddlewareAccess({
      pathname: "/dashboard",
      cookies: {},
      sessionUser: null,
    });

    assert.equal(result.action, "redirect");
    assert.equal(result.destination, "/login");
  });

  it("blocks unauthenticated visitors from /dashboard/admin and subroutes", () => {
    const resultAdmin = evaluateMiddlewareAccess({
      pathname: "/dashboard/admin/services",
      cookies: {},
      sessionUser: null,
    });
    assert.equal(resultAdmin.action, "redirect");
    assert.equal(resultAdmin.destination, "/login");

    const resultAppointments = evaluateMiddlewareAccess({
      pathname: "/dashboard/appointments",
      cookies: {},
      sessionUser: null,
    });
    assert.equal(resultAppointments.action, "redirect");
    assert.equal(resultAppointments.destination, "/login");
  });

  it("accepts valid session cookie for customer on /dashboard", () => {
    const result = evaluateMiddlewareAccess({
      pathname: "/dashboard",
      cookies: { "better-auth.session_token": "valid-token-123" },
      sessionUser: { id: "u1", role: "customer" },
    });

    assert.equal(result.action, "next");
  });

  it("accepts production __Secure-better-auth.session_token cookie", () => {
    const result = evaluateMiddlewareAccess({
      pathname: "/dashboard/appointments",
      cookies: { "__Secure-better-auth.session_token": "secure-prod-token" },
      sessionUser: { id: "u1", role: "customer" },
    });

    assert.equal(result.action, "next");
  });

  it("redirects authenticated customer attempting to access /dashboard/admin to /dashboard", () => {
    const result = evaluateMiddlewareAccess({
      pathname: "/dashboard/admin",
      cookies: { "better-auth.session_token": "customer-token" },
      sessionUser: { id: "c1", role: "customer" },
    });

    assert.equal(result.action, "redirect");
    assert.equal(result.destination, "/dashboard");
  });

  it("redirects authenticated admin visiting root /dashboard to /dashboard/admin", () => {
    const result = evaluateMiddlewareAccess({
      pathname: "/dashboard",
      cookies: { "better-auth.session_token": "admin-token" },
      sessionUser: { id: "a1", role: "admin" },
    });

    assert.equal(result.action, "redirect");
    assert.equal(result.destination, "/dashboard/admin");
  });

  it("allows authenticated admin to access /dashboard/admin/services", () => {
    const result = evaluateMiddlewareAccess({
      pathname: "/dashboard/admin/services",
      cookies: { "better-auth.session_token": "admin-token" },
      sessionUser: { id: "a1", role: "admin" },
    });

    assert.equal(result.action, "next");
  });
});

describe("Navbar Visibility & Navigation Policy", () => {
  function getNavbarItems({ user }) {
    if (!user) {
      return {
        showDashboardLink: false,
        showSignInLink: true,
        showSignUpLink: true,
        showProfile: false,
        showSignOut: false,
        links: ["Services", "About", "Contact"],
      };
    }

    if (user.role === "admin") {
      return {
        showDashboardLink: true,
        showSignInLink: false,
        showSignUpLink: false,
        showProfile: true,
        showSignOut: true,
        links: [
          "Overview",
          "Manage Services",
          "Manage Appointments",
          "Manage Customers",
          "Transactions",
          "Profile",
        ],
      };
    }

    // Customer
    return {
      showDashboardLink: true,
      showSignInLink: false,
      showSignUpLink: false,
      showProfile: true,
      showSignOut: true,
      links: [
        "Services",
        "About",
        "Contact",
        "Dashboard",
        "My Appointments",
        "Payment History",
        "Profile",
      ],
    };
  }

  it("hides Dashboard link and shows Sign In & Sign Up for logged-out visitors", () => {
    const nav = getNavbarItems({ user: null });
    assert.equal(nav.showDashboardLink, false);
    assert.equal(nav.showSignInLink, true);
    assert.equal(nav.showSignUpLink, true);
    assert.equal(nav.showSignOut, false);
    assert.ok(!nav.links.includes("Dashboard"));
  });

  it("shows Dashboard and customer navigation for authenticated customer", () => {
    const nav = getNavbarItems({ user: { name: "Alice", role: "customer" } });
    assert.equal(nav.showDashboardLink, true);
    assert.equal(nav.showSignInLink, false);
    assert.equal(nav.showSignUpLink, false);
    assert.equal(nav.showSignOut, true);
    assert.ok(nav.links.includes("Dashboard"));
    assert.ok(nav.links.includes("My Appointments"));
  });

  it("shows administrative navigation links for authenticated admin", () => {
    const nav = getNavbarItems({ user: { name: "Admin", role: "admin" } });
    assert.equal(nav.showDashboardLink, true);
    assert.equal(nav.showSignInLink, false);
    assert.equal(nav.showSignUpLink, false);
    assert.equal(nav.showSignOut, true);
    assert.ok(nav.links.includes("Manage Services"));
    assert.ok(nav.links.includes("Manage Appointments"));
  });
});
