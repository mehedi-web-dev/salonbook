"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  User,
  Sparkles,
  Scissors,
  Users,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Home,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const CUSTOMER_NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Appointments",
    href: "/dashboard/appointments",
    icon: Calendar,
  },
  {
    label: "Payment History",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Services Management",
    href: "/dashboard/admin/services",
    icon: Sparkles,
  },
  {
    label: "Barber Management",
    href: "/dashboard/admin/barbers",
    icon: Scissors,
  },
  {
    label: "Appointments Management",
    href: "/dashboard/admin/appointments",
    icon: Calendar,
  },
  {
    label: "Customer Management",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    label: "Transactions",
    href: "/dashboard/admin/transactions",
    icon: CreditCard,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Auto-close mobile drawer upon navigation
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMobileOpen(false);
  }

  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : CUSTOMER_NAV_ITEMS;

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/admin") return pathname === "/dashboard/admin";
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/login");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to sign out");
          },
        },
      });
    } catch {
      toast.error("Error signing out");
    }
  };

  // Find active label for the mobile header
  const currentItem = navItems.find((item) => isLinkActive(item.href));
  const activeTitle = currentItem?.label || (isAdmin ? "Admin Console" : "Dashboard");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full bg-background">
      {/* 1. Desktop & Tablet Sidebar (Side by side with content) */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-card/60 transition-all duration-300 shrink-0 sticky top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] z-20 ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
        aria-label="Dashboard Sidebar"
      >
        {/* Sidebar Header with Role Badge & Collapse Toggle */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3.5">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-semibold ${
                  isAdmin
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-accent text-accent-foreground border border-border"
                }`}
              >
                {isAdmin ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground tracking-tight">
                  {isAdmin ? "Admin Portal" : "Customer Portal"}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  {isAdmin ? "Management" : "Account Area"}
                </span>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground mx-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150 ${
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Quick Shortcut (Book service or View Home) */}
        {!isCollapsed && (
          <div className="p-3 border-t border-border/80">
            {isAdmin ? (
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
              >
                <Home className="h-3.5 w-3.5 text-primary" />
                <span>View Public Site</span>
              </Link>
            ) : (
              <Link
                href="/services"
                className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Book New Service</span>
              </Link>
            )}
          </div>
        )}

        {/* User Card & Sign Out at Bottom */}
        <div className="border-t border-border/80 p-3 bg-secondary/30">
          <div
            className={`flex items-center gap-2.5 ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground shrink-0 border border-border">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </span>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{user?.name || "User"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email || ""}</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                aria-label="Sign out"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Main Content Container */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Dashboard Top Bar with Drawer Toggle (< lg) */}
        <div className="lg:hidden sticky top-16 sm:top-20 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur-sm shadow-2xs">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open dashboard navigation"
            className="gap-2 text-xs h-8 border-border bg-card"
          >
            <Menu className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">Dashboard Menu</span>
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground truncate max-w-[150px] sm:max-w-[200px]">
              {activeTitle}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                isAdmin
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : "bg-accent text-accent-foreground border-border"
              }`}
            >
              {isAdmin ? "Admin" : "Client"}
            </span>
          </div>
        </div>

        {/* Mobile Slide-Out Navigation Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Sheet */}
            <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-background border-r border-border shadow-xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${
                      isAdmin
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-accent text-accent-foreground border border-border"
                    }`}
                  >
                    {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      {isAdmin ? "Admin Dashboard" : "Customer Dashboard"}
                    </h2>
                    <p className="text-[11px] text-muted-foreground">SalonBook Platform</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close navigation"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Drawer Nav Items */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Bottom User Info & Sign Out */}
              <div className="border-t border-border p-4 bg-secondary/30 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground shrink-0 border border-border">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{user?.name || "User"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.email || ""}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-center gap-2 text-xs border-border text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Actual Page Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
