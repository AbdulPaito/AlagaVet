import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, CheckCircle2, Truck, X, Phone, MapPin, MessageCircle, Package, Search, Inbox, Filter, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem('admin_token');

export const Route = createFileRoute("/admin/orders")({
  component: () => (
    <AdminShell>
      <OrdersPage />
    </AdminShell>
  ),
});

type OrderStatus = "Pending" | "Confirmed" | "Delivered" | "Cancelled";
type Order = {
  id: string;
  code: string;
  customer_name: string;
  phone: string;
  address: string;
  product_name: string;
  quantity: number;
  delivery_days?: string | null;
  message: string;
  status: OrderStatus;
  created_at: string;
  estimated_delivery_date?: string;
};

function formatOrderDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const datePart = date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    const timePart = date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} · ${timePart}`;
  } catch {
    return '';
  }
}

const statusStyles: Record<OrderStatus, { bg: string; text: string; border: string; icon: string }> = {
  Pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "🕐" },
  Confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "✅" },
  Delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "🚚" },
  Cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "❌" },
};

function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{ id: string; status: OrderStatus } | null>(null);
  const [confirmDeliveryDate, setConfirmDeliveryDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin-login';
        return;
      }
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(response.status === 429
          ? 'Too many requests, please wait a moment and try again.'
          : `Server error (${response.status})`
        );
      }
      if (!response.ok) throw new Error(data.message || 'Failed to load orders');
      const orderData = data.orders ?? [];
      setOrders(orderData);
      setFilteredOrders(orderData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load orders');
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!orders) return;
    let filtered = orders;
    if (statusFilter !== 'All') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.customer_name.toLowerCase().includes(q) ||
        o.code?.toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q)
      );
    }
    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery]);

  useEffect(() => {
    load();
    // Poll every 30 seconds for updates (since we don't have real-time with Express)
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(id: string, status: OrderStatus, estimatedDeliveryDate?: string) {
    setPendingId(id);
    try {
      const token = getToken();
      const body: any = { status };
      if (estimatedDeliveryDate) {
        body.estimatedDeliveryDate = estimatedDeliveryDate;
      }
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update status');
      toast.success(`Order marked as ${status}`);
      load(); // Refresh orders
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setPendingId(null);
      setConfirmDeliveryDate('');
    }
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete order');
      toast.success('Order deleted successfully');
      setShowDeleteConfirm(null);
      load(); // Refresh orders
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete order');
    } finally {
      setDeleteId(null);
    }
  }

  const statusCounts = orders ? {
    All: orders.length,
    Pending: orders.filter(o => o.status === 'Pending').length,
    Confirmed: orders.filter(o => o.status === 'Confirmed').length,
    Delivered: orders.filter(o => o.status === 'Delivered').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  } : {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="mt-1 text-muted-foreground">Manage and track customer orders.</p>
        </div>
        <button
          type="button"
          disabled={refreshing}
          onClick={() => load()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted/50 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 pointer-events-none ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders, customers, or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['All', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-border hover:bg-muted/50'
              }`}
            >
              {status} {statusCounts[status] && statusCounts[status] > 0 && <span className="ml-1 opacity-80">({statusCounts[status]})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid - More compact on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {orders === null
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)
          : filteredOrders?.length === 0
          ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {searchQuery || statusFilter !== 'All' ? 'No matching orders' : 'No orders yet'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                {searchQuery || statusFilter !== 'All' 
                  ? 'Try adjusting your filters or search query to find what you\'re looking for.'
                  : 'When customers place orders, they will appear here.'
                }
              </p>
              {(searchQuery || statusFilter !== 'All') && (
                <button 
                  onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
                  className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )
          : filteredOrders?.map((o) => {
              const busy = pendingId === o.id;
              return (
                <article key={o.id} className="group bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-emerald-200/50 transition-all duration-200 overflow-hidden">
                  {/* Header - Order Code, Date & Status */}
                  <div className="bg-emerald-50/50 px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-emerald-800">{o.code}</span>
                      {o.created_at && (
                        <span className="text-[10px] text-slate-400">
                          {formatOrderDate(o.created_at)}
                        </span>
                      )}
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[o.status].bg} ${statusStyles[o.status].text}`}>
                      {o.status}
                    </span>
                  </div>
                  
                  <div className="p-2.5">
                    {/* Customer & Product */}
                    <div className="mb-1.5">
                      <h3 className="font-bold text-sm text-slate-800 leading-tight">{o.customer_name}</h3>
                      <p className="text-[11px] text-emerald-600 font-medium">{o.product_name}</p>
                    </div>
                    
                    {/* Compact Details */}
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mb-2">
                      <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{o.phone}</span>
                      <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{o.address}</span>
                      <span className="flex items-center gap-0.5">📦 {o.quantity}</span>
                      {o.estimated_delivery_date && o.status === 'Confirmed' && (
                        <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                          📅 Deliver by: {new Date(o.estimated_delivery_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {o.status === 'Delivered' && o.estimated_delivery_date && (
                        <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                          📦 Delivered: {new Date(o.estimated_delivery_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Emoji Timeline - Clean & Simple */}
                    <div className="flex items-center gap-1 mb-2 py-1">
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px]">🕐</span>
                        <span className="text-[10px] text-slate-500">{new Date(o.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <span className="text-[10px] text-slate-300">→</span>
                      <div className={`flex items-center gap-0.5 ${o.status === 'Pending' || o.status === 'Cancelled' ? 'opacity-40' : ''}`}>
                        <span className="text-[10px]">✅</span>
                        <span className={`text-[10px] ${o.status === 'Pending' || o.status === 'Cancelled' ? 'text-slate-400' : 'text-emerald-600 font-medium'}`}>
                          {o.status === 'Pending' ? 'Pending' : 'Confirmed'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-300">→</span>
                      <div className={`flex items-center gap-0.5 ${o.status !== 'Delivered' ? 'opacity-40' : ''}`}>
                        <span className="text-[10px]">🚚</span>
                        <span className={`text-[10px] ${o.status === 'Delivered' ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                          {o.status === 'Delivered' ? 'Delivered' : 'Delivery'}
                        </span>
                      </div>
                      {o.status === 'Cancelled' && (
                        <>
                          <span className="text-[10px] text-slate-300">→</span>
                          <span className="text-[10px] text-red-600 font-medium">❌ Cancelled</span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons - Compact */}
                    <div className="flex items-center gap-1 pt-1.5 border-t">
                      <button
                        disabled={busy || o.status === "Confirmed"}
                        onClick={() => setShowConfirmDialog({ id: o.id, status: "Confirmed" })}
                        className="inline-flex h-6 items-center gap-1 rounded bg-emerald-600 px-1.5 text-[11px] font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                        <span>Confirm</span>
                      </button>
                      <button
                        disabled={busy || o.status !== "Confirmed"}
                        onClick={() => setShowConfirmDialog({ id: o.id, status: "Delivered" })}
                        className="inline-flex h-6 items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Truck className="h-3 w-3" />}
                        <span>Deliver</span>
                      </button>
                      <button
                        disabled={busy || o.status === "Cancelled"}
                        onClick={() => setShowConfirmDialog({ id: o.id, status: "Cancelled" })}
                        className="inline-flex h-6 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        <span>Cancel</span>
                      </button>
                      <div className="flex-1"></div>
                      <button
                        disabled={deleteId === o.id}
                        onClick={() => setShowDeleteConfirm(o.id)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded border border-red-200 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deleteId === o.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Delete Order?</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this order? The order will be permanently removed from the system.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleteId === showDeleteConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteId === showDeleteConfirm ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                  </span>
                ) : (
                  'Delete Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                showConfirmDialog.status === 'Confirmed' ? 'bg-emerald-100' :
                showConfirmDialog.status === 'Delivered' ? 'bg-green-100' :
                'bg-red-100'
              }`}>
                {showConfirmDialog.status === 'Confirmed' && <CheckCircle2 className="h-6 w-6 text-emerald-600" />}
                {showConfirmDialog.status === 'Delivered' && <Truck className="h-6 w-6 text-green-600" />}
                {showConfirmDialog.status === 'Cancelled' && <X className="h-6 w-6 text-red-600" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {showConfirmDialog.status === 'Confirmed' && 'Confirm Order?'}
                  {showConfirmDialog.status === 'Delivered' && 'Mark as Delivered?'}
                  {showConfirmDialog.status === 'Cancelled' && 'Cancel Order?'}
                </h3>
                <p className="text-sm text-muted-foreground">This action will update the order status.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to {showConfirmDialog.status === 'Confirmed' ? 'confirm' : showConfirmDialog.status === 'Delivered' ? 'mark as delivered' : 'cancel'} this order?
            </p>
            
            {/* Estimated Delivery Date - Only show when Confirming */}
            {showConfirmDialog.status === 'Confirmed' && (
              <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  📅 Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={confirmDeliveryDate}
                  onChange={(e) => setConfirmDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Optional: Set when you expect to deliver this order
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(null);
                  setConfirmDeliveryDate('');
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition"
              >
                No, Go Back
              </button>
              <button
                onClick={() => {
                  updateStatus(showConfirmDialog.id, showConfirmDialog.status, confirmDeliveryDate || undefined);
                  setShowConfirmDialog(null);
                }}
                disabled={pendingId === showConfirmDialog.id}
                className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition disabled:opacity-50 ${
                  showConfirmDialog.status === 'Confirmed' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  showConfirmDialog.status === 'Delivered' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {pendingId === showConfirmDialog.id ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                  </span>
                ) : (
                  `Yes, ${showConfirmDialog.status === 'Confirmed' ? 'Confirm' : showConfirmDialog.status === 'Delivered' ? 'Deliver' : 'Cancel'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
