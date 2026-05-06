import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Star, MessageSquareQuote, Search, User, Quote, Inbox, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem('admin_token');

export const Route = createFileRoute("/admin/reviews")({
  component: () => (
    <AdminShell>
      <ReviewsPage />
    </AdminShell>
  ),
});

type Review = {
  id: string;
  name: string;
  location: string;
  rating: number;
  message: string;
};

const empty: Omit<Review, "id"> = { name: "", location: "", rating: 5, message: "" };

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-emerald-100 text-emerald-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
    'bg-indigo-100 text-indigo-700',
    'bg-amber-100 text-amber-700',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function ReviewsPage() {
  const [items, setItems] = useState<Review[] | null>(null);
  const [filteredItems, setFilteredItems] = useState<Review[] | null>(null);
  const [editing, setEditing] = useState<Review | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');

  async function load() {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/testimonials/admin`, {
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
      if (!response.ok) throw new Error(data.message || 'Failed to load reviews');
      const reviewData = data.testimonials ?? [];
      setItems(reviewData);
      setFilteredItems(reviewData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load reviews');
      setItems([]);
      setFilteredItems([]);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!items) return;
    let filtered = items;
    if (ratingFilter !== 'All') {
      filtered = filtered.filter(t => t.rating === ratingFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q)
      );
    }
    setFilteredItems(filtered);
  }, [items, ratingFilter, searchQuery]);

  async function onDelete(id: string) {
    setDeletingId(id);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete review');
      toast.success("Review deleted");
      load();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  }

  const avgRating = items?.length ? (items.reduce((sum, t) => sum + t.rating, 0) / items.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="mt-1 text-muted-foreground">
            {items ? `${items.length} reviews • Average rating: ${avgRating} ⭐` : 'Manage customer reviews shown on the landing page.'}
          </p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Review
        </button>
      </div>

      {/* Stats Cards */}
      {items && (
        <div className="grid gap-4 sm:grid-cols-4">
          {[5, 4, 3, 2, 1].slice(0, 4).map((rating) => {
            const count = items.filter(t => t.rating === rating).length;
            const percentage = items.length ? Math.round((count / items.length) * 100) : 0;
            return (
              <button
                key={rating}
                onClick={() => setRatingFilter(ratingFilter === rating ? 'All' : rating)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  ratingFilter === rating 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-white hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold">{rating}</span>
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-muted-foreground">{percentage}% of reviews</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reviews by name, message, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setRatingFilter('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              ratingFilter === 'All'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-border hover:bg-muted/50'
            }`}
          >
            All Reviews
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setRatingFilter(rating)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap inline-flex items-center gap-1 ${
                ratingFilter === rating
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-border hover:bg-muted/50'
              }`}
            >
              {rating} <Star className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items === null
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)
          : filteredItems?.length === 0
          ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquareQuote className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {searchQuery || ratingFilter !== 'All' ? 'No matching reviews' : 'No reviews yet'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                {searchQuery || ratingFilter !== 'All' 
                  ? 'Try adjusting your filters or search query.'
                  : 'Add your first review to get started.'
                }
              </p>
              {(searchQuery || ratingFilter !== 'All') && (
                <button 
                  onClick={() => { setSearchQuery(''); setRatingFilter('All'); }}
                  className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )
          : filteredItems?.map((review, index) => (
              <article key={review.id || index} className="group rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                {/* Quote Icon */}
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getAvatarColor(review.name)}`}>
                    <span className="text-sm font-bold">{getInitials(review.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Stars */}
                    <div className="mb-2 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star 
                          key={k} 
                          className={k < review.rating ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 text-slate-200"} 
                        />
                      ))}
                    </div>
                    {/* Message */}
                    <div className="relative">
                      <Quote className="absolute -left-1 -top-1 h-4 w-4 text-slate-200" />
                      <p className="pl-4 text-sm leading-relaxed text-slate-700">{review.message}</p>
                    </div>
                  </div>
                </div>
                
                {/* Author */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{review.name}</div>
                    {review.location && <div className="text-xs text-muted-foreground">{review.location}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditing(review)} 
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(review.id)} 
                      disabled={deletingId === review.id} 
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      title="Delete"
                    >
                      {deletingId === review.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </article>
            ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Review?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  This action cannot be undone. The review will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingId === showDeleteConfirm}
                className="flex-1 h-11 inline-flex items-center justify-center rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm}
                className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deletingId === showDeleteConfirm ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="h-4 w-4" /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <TForm
          initial={editing === "new" ? empty : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function TForm({
  initial, onClose, onSaved,
}: {
  initial: Omit<Review, "id"> & { id?: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ ...initial });
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) { toast.error("Name and message required"); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      location: form.location,
      rating: Math.min(5, Math.max(1, form.rating)),
      message: form.message.trim(),
    };
    try {
      const token = getToken();
      const isEditing = "id" in form && form.id;
      const url = isEditing ? `${API_URL}/testimonials/${form.id}` : `${API_URL}/testimonials`;
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save review');
      
      toast.success("Saved");
      onSaved();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{("id" in form && form.id) ? "Edit review" : "New review"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={saving} />
          </div>
          <div className="space-y-1.5">
            <Label>Location (optional)</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} disabled={saving} />
          </div>
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setForm({ ...form, rating: k + 1 })}
                  className="rounded p-1 transition hover:scale-110"
                >
                  <Star className={k < form.rating ? "h-6 w-6 fill-warning text-warning" : "h-6 w-6 text-muted-foreground/40"} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required disabled={saving} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm hover:bg-muted/50">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
