import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAdminAuth, AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Eye, EyeOff, Home } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-login")({
  component: AdminLoginWrapper,
});

function AdminLoginWrapper() {
  return (
    <AdminAuthProvider>
      <AdminLoginPage />
    </AdminAuthProvider>
  );
}

function AdminLoginPage() {
  const { signIn, user, isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in as admin → redirect
  if (!loading && user && isAdmin) {
    navigate({ to: "/admin" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/admin" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card-premium p-7">
          {/* Logo & Brand Header */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <img 
              src="/image/logo.png" 
              alt="AlagaVet Supply" 
              className="h-16 w-16 object-contain rounded-full shadow-md" 
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Alaga<span className="text-emerald-600">Vet</span> Supply
              </h1>
              <p className="text-sm text-emerald-600 mt-1">
                Animal Health Supply for Poultry, Swine & Livestock
              </p>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" disabled={submitting} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pl-9 pr-10" 
                  placeholder="••••••••" 
                  disabled={submitting} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>) : "Login"}
            </button>
          </form>

          {/* Landing page button */}
          <div className="mt-5 pt-5 border-t border-border/50">
            <Link 
              to="/landing-page" 
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              Go to Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
