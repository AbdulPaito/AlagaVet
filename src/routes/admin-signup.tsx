import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-signup")({
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    toast.success("Account created. Signing you in...");
    navigate({ to: "/admin" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <Link to="/admin-login" className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img 
            src="/image/logo.png" 
            alt="AlagaVet Supply" 
            className="h-16 w-16 object-contain" 
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Alaga<span className="text-emerald-600">Vet</span> Supply
            </h1>
            <p className="text-sm text-emerald-600 mt-1">
              Animal Health Supply for Poultry, Swine & Livestock
            </p>
          </div>
          <div className="h-px w-16 bg-emerald-200 mt-2" />
          <h2 className="text-lg font-semibold">Create Admin Account</h2>
          <p className="text-xs text-muted-foreground">The first user to sign up becomes admin.</p>
        </div>
        <div className="card-premium p-7">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password (min 6 characters)</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} disabled={submitting} />
            </div>
            {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>) : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
