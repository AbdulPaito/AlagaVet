import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type User = {
  id: string;
  email: string;
  role: string;
};

type AdminAuth = {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
};

const Ctx = createContext<AdminAuth | undefined>(undefined);

// Helper to safely access localStorage
const getTokenFromStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getTokenFromStorage());
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!isMounted) return;
        if (data.success && data.user) {
          setUser(data.user);
          setIsAdmin(data.user.role === 'admin');
        } else {
          // Token invalid
          localStorage.removeItem('admin_token');
          setToken(null);
        }
      } catch (error) {
        if (!isMounted) return;
        localStorage.removeItem('admin_token');
        setToken(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadUser();
    return () => { isMounted = false; };
  }, [token]);

  async function signIn(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.message || 'Invalid credentials' };
      }
      
      // Save token
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAdmin(data.user.role === 'admin');
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  }
  
  function signOut() {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  }

  return (
    <Ctx.Provider value={{ user, token, isAdmin, loading, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return v;
}
