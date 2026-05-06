import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Eye, EyeOff, Home } from "lucide-react";
import { toast } from "sonner";

// API Base URL - Use env var or fallback to local backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const Route = createFileRoute("/admin-login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Form submitted", { email, password });
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      
      const data = await response.json();
      console.log("Login response", data);
      
      if (!response.ok) {
        setError(data.message || 'Invalid credentials');
        return;
      }
      
      // Save token
      localStorage.setItem('admin_token', data.token);
      
      toast.success("Welcome back!");
      navigate({ to: "/admin" });
    } catch (err: any) {
      console.error("Login error", err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #059669 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl" />

      <div className="w-full max-w-[400px] relative z-10">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-7 sm:p-8">
          {/* Logo & Brand Header */}
          <div className="mb-7 flex flex-col items-center gap-3 text-center">
            <div className="relative">
              <img 
                src="/image/logo.png" 
                alt="AlagaVet Supply" 
                className="h-18 w-18 object-contain rounded-full shadow-sm ring-2 ring-emerald-100 ring-offset-2" 
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Alaga<span className="text-emerald-600">Vet</span> Supply
              </h1>
              <p className="text-xs font-medium text-emerald-600/80 mt-1 uppercase tracking-wider">
                Admin Portal
              </p>
            </div>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-10 h-11 border-slate-200 focus:border-emerald-400 focus:ring-emerald-100 transition-all rounded-xl text-sm" 
                  placeholder="Enter your email" 
                  disabled={submitting}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pl-10 pr-10 h-11 border-slate-200 focus:border-emerald-400 focus:ring-emerald-100 transition-all rounded-xl text-sm" 
                  placeholder="Enter your password" 
                  disabled={submitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-2.5 text-sm text-red-600 flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={submitting} 
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            >
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>) : "Sign In"}
            </button>
          </form>

          {/* Landing page link */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center gap-1.5 w-full text-sm text-slate-500 hover:text-emerald-600 transition-colors group"
            >
              <Home className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to landing page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
