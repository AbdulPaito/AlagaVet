import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Eye, EyeOff, Home } from "lucide-react";
import { toast } from "sonner";

// API Base URL - Production backend
const API_URL = "https://alagavet-backend.onrender.com/api";

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
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
      <div className="w-full max-w-md">
        <div style={{ 
          background: 'white',
          borderRadius: '1rem',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          {/* Logo & Brand Header */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <img 
              src="/image/logo.png" 
              alt="AlagaVet Supply" 
              className="h-16 w-16 object-contain rounded-full shadow-md" 
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Alaga<span style={{ color: '#059669' }}>Vet</span> Supply
              </h1>
              <p className="text-sm mt-1" style={{ color: '#059669' }}>
                Animal Health Supply for Poultry, Swine & Livestock
              </p>
            </div>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" style={{ pointerEvents: 'none' }} />
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-9" 
                  placeholder="you@example.com" 
                  disabled={submitting}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" style={{ pointerEvents: 'none' }} />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pl-9 pr-10" 
                  placeholder="••••••••" 
                  disabled={submitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  style={{ zIndex: 10 }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={submitting} 
              className="w-full justify-center"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: 'white',
                fontWeight: 600,
                borderRadius: '0.75rem',
                padding: '0.625rem 1rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>) : "Login"}
            </button>
          </form>

          {/* Landing page button */}
          <div className="mt-5 pt-5 border-t border-gray-200">
            <Link 
              to="/" 
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              style={{ textDecoration: 'none' }}
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
