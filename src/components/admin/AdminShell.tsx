import { type ReactNode, useState } from "react";
import { Link, useRouterState, useNavigate, Navigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { LayoutDashboard, Package, ShoppingCart, MessageSquareQuote, LogOut, Loader2, Menu, X } from "lucide-react";
import { toast } from "sonner";

const nav: { to: "/admin" | "/admin/orders" | "/admin/products" | "/admin/reviews"; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/admin-login" />;

  // Show access denied if user is not admin
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <LogOut className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
          Your account does not have admin access. Please contact the administrator.
        </p>
        <button 
          onClick={async () => { await signOut(); navigate({ to: "/admin-login" }); }} 
          className="btn-primary mt-4"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    );
  }

  // Get user initials for avatar
  const initials = user.email 
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : "AD";

  async function onLogout() {
    await signOut();
    toast.success("Signed out successfully");
    navigate({ to: "/admin-login" });
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden sticky top-0 h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <img 
            src="/image/logo.png" 
            alt="Psalmer Agrivet Trading" 
            className="h-10 w-10 object-contain rounded-full shadow-sm" 
          />
          <span className="font-bold">Psalmer <span className="text-emerald-500">Agrivet</span> <span className="text-xs font-normal text-muted-foreground">Admin</span></span>
        </div>
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? path === to : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition " +
                  (active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--shadow-elegant)]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        {/* User info & Logout */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
              {initials}
            </div>
            <div className="min-w-0">
                <div className="text-sm font-medium leading-tight truncate">{user?.email}</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition hover:bg-destructive/15 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur sm:px-6">
          <div className="md:hidden flex items-center gap-2">
            <img 
              src="/image/logo.png" 
              alt="Psalmer Agrivet Trading" 
              className="h-8 w-8 object-contain" 
            />
            <span className="font-bold">Psalmer <span className="text-emerald-500">Agrivet</span></span>
          </div>
          {/* Mobile: Menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden ml-auto h-10 w-10 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
            <div className="flex flex-col h-full">
              <div className="flex h-16 items-center justify-between px-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <img 
                    src="/image/logo.png" 
                    alt="Psalmer Agrivet Trading" 
                    className="h-8 w-8 object-contain" 
                  />
                  <span className="font-bold">Psalmer <span className="text-emerald-500">Agrivet</span></span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                {nav.map(({ to, label, icon: Icon, exact }) => {
                  const active = exact ? path === to : path.startsWith(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition " +
                        (active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-foreground hover:bg-muted")
                      }
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
              {/* Mobile User Info */}
              <div className="border-t border-border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{user?.email}</div>
                    <div className="text-xs text-muted-foreground">Admin</div>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-destructive transition hover:bg-destructive/15"
                >
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
