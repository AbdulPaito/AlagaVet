import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, UploadCloud, ImageIcon, Search, Package, Filter, Grid3X3, List, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ImageLightbox } from "@/components/site/ImageLightbox";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem('admin_token');

export const Route = createFileRoute("/admin/products")({
  component: () => (
    <AdminShell>
      <ProductsPage />
    </AdminShell>
  ),
});

type Product = {
  id: string;
  name: string;
  description: string;
  price: number | "";
  category: string;
  image: string;
  stock: number | "";
  labels: string[];
};

const empty: Omit<Product, "id"> = {
  name: "", description: "", price: "", category: "", image: "", stock: "", labels: [],
};

const categoryColors: Record<string, string> = {
  chicken: "bg-orange-100 text-orange-700 border-orange-200",
  swine: "bg-pink-100 text-pink-700 border-pink-200",
  pig: "bg-pink-100 text-pink-700 border-pink-200",
  cattle: "bg-amber-100 text-amber-700 border-amber-200",
  cow: "bg-amber-100 text-amber-700 border-amber-200",
  goat: "bg-emerald-100 text-emerald-700 border-emerald-200",
  sheep: "bg-teal-100 text-teal-700 border-teal-200",
  dog: "bg-blue-100 text-blue-700 border-blue-200",
  cat: "bg-purple-100 text-purple-700 border-purple-200",
  feed: "bg-yellow-100 text-yellow-700 border-yellow-200",
  medicine: "bg-red-100 text-red-700 border-red-200",
  supplement: "bg-cyan-100 text-cyan-700 border-cyan-200",
  default: "bg-slate-100 text-slate-700 border-slate-200",
};

function ProductsPage() {
  const [items, setItems] = useState<Product[] | null>(null);
  const [filteredItems, setFilteredItems] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  async function load() {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/products`, {
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
      if (!response.ok) throw new Error(data.message || 'Failed to load products');
      const productData = data.products ?? [];
      setItems(productData);
      setFilteredItems(productData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load products');
      setItems([]);
      setFilteredItems([]);
    }
  }

  useEffect(() => {
    if (!items) return;
    let filtered = items;
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    setFilteredItems(filtered);
  }, [items, categoryFilter, searchQuery]);

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete product');
      toast.success("Product deleted");
      load();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  }

  const categories = items ? ['All', ...Array.from(new Set(items.map(p => p.category)))] : ['All'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-muted-foreground">
            {items ? `${items.length} products in your catalog` : 'Manage your product catalog.'}
          </p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap capitalize ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-border hover:bg-muted/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
        {items === null
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
          : filteredItems?.length === 0
          ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {searchQuery || categoryFilter !== 'All' ? 'No matching products' : 'No products yet'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                {searchQuery || categoryFilter !== 'All' 
                  ? 'Try adjusting your filters or search query.'
                  : 'Add your first product to get started.'
                }
              </p>
              {(searchQuery || categoryFilter !== 'All') && (
                <button 
                  onClick={() => { setSearchQuery(''); setCategoryFilter('All'); }}
                  className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )
          : filteredItems?.map((p) => {
              const categoryClass = categoryColors[p.category.toLowerCase()] || categoryColors.default;
              return (
                <article key={p.id} className="group rounded-xl border bg-white overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <button type="button" onClick={() => p.image && setZoom(p.image)} className="block aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                    {p.image ? (
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            const fallback = parent.querySelector('.image-fallback');
                            if (fallback) fallback.classList.remove('hidden');
                          }
                        }}
                      />
                    ) : null}
                    <div className={`image-fallback flex h-full items-center justify-center text-muted-foreground ${p.image ? 'hidden' : ''}`}>
                      <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    {typeof p.stock === 'number' && p.stock <= 10 && p.stock > 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-amber-500 text-white text-xs font-medium">
                        Low stock: {p.stock}
                      </div>
                    )}
                    {p.stock === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-red-500 text-white text-xs font-medium">
                        Out of stock
                      </div>
                    )}
                  </button>
                  <div className="p-2 sm:p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs sm:text-sm truncate">{p.name}</h3>
                        <p className="text-sm sm:text-base font-bold text-emerald-600">₱{p.price ? Number(p.price).toLocaleString() : '0'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize border ${categoryClass}`}>
                        {p.category}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        Stock: <span className={typeof p.stock === 'number' && p.stock <= 10 ? 'text-amber-600 font-medium' : ''}>{p.stock || 0}</span>
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setEditing(p)} className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-border text-xs hover:bg-muted/50 transition-colors">
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs transition-colors disabled:opacity-50"
                      >
                        {deletingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
      </div>

      {editing && (
        <ProductFormDialog
          initial={editing === "new" ? empty : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
      <ImageLightbox src={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}

function ProductFormDialog({
  initial, onClose, onSaved,
}: {
  initial: Omit<Product, "id"> & { id?: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  // Initialize form with initial data only once when dialog opens
  const [form, setForm] = useState<{ name: string; description: string; price: number | ""; category: string; image: string; stock: number | ""; labels: string[] | string; id?: string }>({ ...initial });
  const prevInitialId = useRef<string | undefined>(initial.id);
  
  // Reset form only when dialog opens with different product
  useEffect(() => {
    if (prevInitialId.current !== initial.id) {
      setForm(() => ({ ...initial }));
      prevInitialId.current = initial.id;
    }
  }, [initial]); // Reset when initial object changes
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_URL}/products/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to upload image');
      
      setForm(prevForm => ({ ...prevForm, image: data.imageUrl }));
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    
    // Parse labels properly - handle empty strings and arrays
    let parsedLabels: string[] = [];
    const formLabels = form.labels as string[] | string | undefined;
    if (Array.isArray(formLabels)) {
      parsedLabels = formLabels.filter(Boolean); // Remove empty strings
    } else if (typeof formLabels === 'string' && formLabels.trim()) {
      parsedLabels = formLabels.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    
    const payload = {
      name: form.name.trim(),
      description: form.description,
      price: Number(form.price) || 0,
      category: form.category,
      image: form.image || '',
      stock: Number(form.stock) || 0,
      labels: parsedLabels,
    };
    try {
      const token = getToken();
      const isEditing = "id" in form && form.id;
      const url = isEditing ? `${API_URL}/products/${form.id}` : `${API_URL}/products`;
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} - ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) throw new Error(data.message || 'Failed to save product');
      
      toast.success("Product saved");
      onSaved();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{("id" in form && form.id) ? "Edit product" : "New product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-1.5">
            <Label>Product Image</Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) uploadFile(f); }}
              onClick={() => fileRef.current?.click()}
              className={"relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition " + (dragOver ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:bg-muted/50")}
            >
              {form.image ? (
                <div className="rounded-xl overflow-hidden">
                  <img 
                    src={form.image} 
                    alt="preview" 
                    className="aspect-video w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/image/vet-products.png';
                    }}
                  />
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-2 text-muted-foreground">
                  <UploadCloud className="h-8 w-8" />
                  <p className="text-sm">Drag & drop or click to upload</p>
                  <p className="text-xs">PNG / JPG up to 5MB</p>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
              />
            </div>
            {form.image && (
              <p className="text-xs text-muted-foreground">Click or drag to change image</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required disabled={saving} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>Price (₱)</Label>
              <Input type="number" step="0.01" min={0} placeholder="0" value={form.price} onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value === "" ? "" : Number(e.target.value) }))} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>Stock</Label>
              <Input type="number" min={0} placeholder="0" value={form.stock} onChange={(e) => setForm(prev => ({ ...prev, stock: e.target.value === "" ? "" : Number(e.target.value) }))} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input placeholder="chicken, pig, cattle..." value={form.category} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label>Labels</Label>
              <Input
                value={Array.isArray(form.labels) ? form.labels.join(", ") : (form.labels as string || "")}
                onChange={(e) => setForm(prev => ({ ...prev, labels: e.target.value }))}
                placeholder="growth booster, swine, feed additive, vitamins"
                disabled={saving}
              />
            </div>
            
            {/* Best Seller Toggle */}
            <div className="col-span-2 flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
              <input
                type="checkbox"
                id="bestSeller"
                checked={Array.isArray(form.labels) ? form.labels.includes("Best Seller") : (form.labels as string).includes("Best Seller")}
                onChange={(e) => {
                  const currentLabels = Array.isArray(form.labels) ? form.labels : (form.labels as string).split(",").map(s => s.trim()).filter(Boolean);
                  if (e.target.checked) {
                    if (!currentLabels.includes("Best Seller")) {
                      setForm(prev => ({ ...prev, labels: [...currentLabels, "Best Seller"] }));
                    }
                  } else {
                    setForm(prev => ({ ...prev, labels: currentLabels.filter(l => l !== "Best Seller") }));
                  }
                }}
                disabled={saving}
                className="h-5 w-5 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="bestSeller" className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-semibold text-rose-700">🔥 Mark as Best Seller</span>
                <span className="text-xs text-rose-600">- Featured at top of landing page</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm hover:bg-muted/50">Cancel</button>
            <button type="submit" disabled={saving || uploading} className="btn-primary">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save product"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
