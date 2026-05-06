import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { 
  Package, ShoppingCart, MessageSquareQuote, Clock, CheckCircle2, Truck, Star, Zap, Calendar, ChevronRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem('admin_token');

export const Route = createFileRoute("/admin/")({
  component: () => (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  ),
});

function Dashboard() {
  const [stats, setStats] = useState<{ products: number; orders: number; pending: number; confirmed: number; delivered: number; reviews: number } | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  async function loadStats() {
    try {
      const token = getToken();
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch all data from backend
      const [productsRes, ordersRes, testimonialsRes] = await Promise.all([
        fetch(`${API_URL}/products`, { headers }),
        fetch(`${API_URL}/orders`, { headers }),
        fetch(`${API_URL}/testimonials`, { headers }),
      ]);

      // Handle auth errors silently
      if (productsRes.status === 401 || ordersRes.status === 401 || testimonialsRes.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin-login';
        return;
      }

      let productsData, ordersData, testimonialsData;
      try {
        productsData = await productsRes.json();
        ordersData = await ordersRes.json();
        testimonialsData = await testimonialsRes.json();
      } catch {
        toast.error('Server returned invalid response. Please try again.');
        return;
      }

      const products = productsData.products || [];
      const orders = ordersData.orders || [];
      const testimonials = testimonialsData.testimonials || [];

      // Calculate stats
      const pending = orders.filter((o: any) => o.status === 'Pending').length;
      const confirmed = orders.filter((o: any) => o.status === 'Confirmed').length;
      const delivered = orders.filter((o: any) => o.status === 'Delivered').length;

      setStats({
        products: products.length,
        orders: orders.length,
        pending,
        confirmed,
        delivered,
        reviews: testimonials.length,
      });

      // Get recent 5 orders
      const sortedOrders = [...orders].sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5);
      setRecentOrders(sortedOrders);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }

  useEffect(() => {
    loadStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = stats ? [
    { 
      label: "Products", 
      value: stats.products, 
      icon: Package, 
      color: "emerald", 
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      link: "/admin/products"
    },
    { 
      label: "Total Orders", 
      value: stats.orders, 
      icon: ShoppingCart, 
      color: "blue", 
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      link: "/admin/orders"
    },
    { 
      label: "Pending Orders", 
      value: stats.pending, 
      icon: Clock, 
      color: "amber", 
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      link: "/admin/orders",
      alert: stats.pending > 0
    },
    { 
      label: "Reviews", 
      value: stats.reviews, 
      icon: MessageSquareQuote, 
      color: "purple", 
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      link: "/admin/reviews"
    },
  ] : [];

  const statusColors: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {!stats
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          : statCards.map((card) => (
              <Link
                key={card.label}
                to={card.link}
                className="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight">{card.value}</p>
                    {card.alert && (
                      <Badge className="mt-2 bg-amber-100 text-amber-700 hover:bg-amber-100">
                        Needs attention
                      </Badge>
                    )}
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity group-hover:opacity-100" 
                  style={{ color: card.color === 'emerald' ? '#10b981' : card.color === 'blue' ? '#3b82f6' : card.color === 'amber' ? '#f59e0b' : '#8b5cf6' }} 
                />
              </Link>
            ))}
      </div>

      {/* Order Status Overview */}
      {stats && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Order Status Overview</h2>
            <Link to="/admin/orders" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-xl bg-amber-50 p-4 border border-amber-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
                <p className="text-sm text-amber-600">Pending Orders</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-4 border border-blue-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.confirmed}</p>
                <p className="text-sm text-blue-600">Confirmed</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-emerald-50 p-4 border border-emerald-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Truck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{stats.delivered}</p>
                <p className="text-sm text-emerald-600">Delivered</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View all orders <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {!stats ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 font-mono text-xs">
                    {order.code?.slice(-4) || order.id.slice(-4)}
                  </div>
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-700"}>
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/products" className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <Package className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Manage Products</p>
            <p className="text-sm text-muted-foreground">Add, edit, or remove products</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
        <Link to="/admin/orders" className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Process Orders</p>
            <p className="text-sm text-muted-foreground">Confirm and track deliveries</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
        <Link to="/admin/reviews" className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
            <Star className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Reviews</p>
            <p className="text-sm text-muted-foreground">Manage customer reviews</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
