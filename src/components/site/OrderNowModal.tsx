import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PhoneCall, Truck, Package, User, MapPin, MessageSquare, Clock, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// API Base URL - change this to your backend URL when deployed
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const orderSchema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().min(5, "Phone is too short").max(30, "Phone is too long"),
  address: z.string().trim().min(3, "Please enter your address").max(300),
  product_name: z.string().min(1),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(9999),
  delivery_days: z.enum(["3", "5", "7"]),
  message: z.string().max(1000).optional().default(""),
});

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productName?: string;
};

export function OrderNowModal({ open, onOpenChange, productName }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    product_name_input: "",
    quantity: 1,
    delivery_days: "5" as "3" | "5" | "7",
    message: "",
  });

  // Use either the pre-selected product or the manual input
  const finalProductName = productName || form.product_name_input;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = orderSchema.safeParse({ 
      customer_name: form.customer_name,
      phone: form.phone,
      address: form.address,
      product_name: finalProductName,
      quantity: form.quantity,
      delivery_days: form.delivery_days,
      message: form.message,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: parsed.data.customer_name,
          phone: parsed.data.phone,
          address: parsed.data.address,
          productName: parsed.data.product_name,
          quantity: parsed.data.quantity,
          deliveryDays: parseInt(parsed.data.delivery_days),
          deliveryNote: parsed.data.message ?? "",
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Could not submit your order");
      }
      
      toast.success("Order submitted! Admin will call you for confirmation.");
      setForm({ customer_name: "", phone: "", address: "", product_name_input: "", quantity: 1, delivery_days: "5", message: "" });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Could not submit your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-5">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2 text-white/90">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Quick Order</span>
            </div>
            <DialogTitle className="text-xl font-bold text-white">Place Your Order</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-emerald-50">
              <PhoneCall className="h-4 w-4" />
              We will contact you to confirm your order
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Product Card */}
          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-emerald-600" />
              <Label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Product</Label>
            </div>
            {productName ? (
              <div className="font-semibold text-emerald-900 bg-white rounded-lg px-3 py-2 border border-emerald-200">
                {productName}
              </div>
            ) : (
              <Input 
                value={form.product_name_input} 
                onChange={(e) => setForm({ ...form, product_name_input: e.target.value })} 
                placeholder="Enter product name or describe what you need" 
                required 
                disabled={submitting}
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            )}
          </div>

          {/* Customer Info Card */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-slate-600" />
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Customer Info</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Full Name *</Label>
                <Input id="name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Juan Dela Cruz" required disabled={submitting} className="bg-white border-slate-200 focus:border-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">Phone *</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0917 123 4567" required disabled={submitting} className="bg-white border-slate-200 focus:border-emerald-400" />
              </div>
            </div>
          </div>

          {/* Delivery Card */}
          <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-amber-600" />
              <Label className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Delivery Details</Label>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs">Delivery Address *</Label>
                <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, Province" required disabled={submitting} className="bg-white border-amber-200 focus:border-amber-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="qty" className="text-xs">Quantity *</Label>
                  <Input id="qty" type="number" min={1} max={9999} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value) || 1) })} required disabled={submitting} className="bg-white border-amber-200 focus:border-amber-400" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="delivery" className="text-xs">Delivery</Label>
                  <Select
                    value={form.delivery_days}
                    onValueChange={(v) => setForm({ ...form, delivery_days: v as "3" | "5" | "7" })}
                    disabled={submitting}
                  >
                    <SelectTrigger className="bg-white border-amber-200">
                      <Clock className="h-3.5 w-3.5 text-amber-600 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Days (Express)</SelectItem>
                      <SelectItem value="5">5 Days (Standard)</SelectItem>
                      <SelectItem value="7">7 Days (Economy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Message Card */}
          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <Label htmlFor="msg" className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Message (Optional)</Label>
            </div>
            <Textarea id="msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Special requests, delivery notes..." rows={2} disabled={submitting} className="bg-white border-blue-200 focus:border-blue-400 text-sm" />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={submitting} className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
            ) : (
              <>Submit Order <Truck className="h-5 w-5" /></>
            )}
          </button>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2">
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-emerald-500" /> COD Available</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-amber-500" /> Fast Delivery</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1"><PhoneCall className="h-3.5 w-3.5 text-blue-500" /> Confirmed</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
