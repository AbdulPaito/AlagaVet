import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { OrderNowModal } from "@/components/site/OrderNowModal";

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import { ImageLightbox } from "@/components/site/ImageLightbox";
import { ProductDetailModal } from "@/components/site/ProductDetailModal";
import { cn } from "@/lib/utils";
import {
  ShieldCheck, Truck, Wallet, Star, ArrowRight, Eye, Menu, X,
  Phone, Mail, MapPin, Facebook, Instagram, Twitter, Sparkles,
  PackageCheck, Stethoscope, Award, ChevronRight, PlayCircle,
  CheckCircle2, Search, Egg, Beef, Bug, ShoppingBag,
} from "lucide-react";

export const Route = createFileRoute("/landing-page")({
  component: Landing,
});

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  labels: string[];
};

const Container = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("mx-auto w-full max-w-7xl px-5 md:px-8", className)}>{children}</div>
);

/* ---------- header ---------- */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { href: "#home", label: "Home" },
    { href: "#products", label: "Products" },
    { href: "#categories", label: "Categories" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all",
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-emerald-900/10 shadow-[0_4px_20px_-12px_rgba(16,185,129,0.25)]"
          : "bg-transparent"
      )}
    >
      <Container className="h-16 md:h-20 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3 group">
          <img 
            src="/image/logo.png" 
            alt="AlagaVet Supply" 
            className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-full group-hover:scale-105 transition shadow-sm" 
          />
          <div className="leading-tight">
            <p className="font-display font-bold text-lg md:text-xl text-slate-900">Alaga<span className="text-emerald-600">Vet</span></p>
            <p className="text-[10px] text-slate-500 tracking-wide uppercase font-medium">SUPPLY</p>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => setOpen((v) => !v)} className="md:hidden h-10 w-10 grid place-items-center rounded-xl border border-slate-200 text-slate-700">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="md:hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-xl animate-fade-in">
          <Container className="py-3 space-y-1">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 rounded-lg">
                {l.label}
              </a>
            ))}
          </Container>
        </div>
      )}
    </header>
  );
}

/* ---------- hero ---------- */
function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/80 via-white to-white" />
      <div className="absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_1px_1px,rgba(16,185,129,0.12)_1px,transparent_0)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-emerald-300/30 blur-3xl -z-10" />
      <div className="absolute -top-20 right-0 h-[360px] w-[360px] rounded-full bg-teal-300/30 blur-3xl -z-10" />

      <Container className="pt-12 md:pt-20 pb-16 md:pb-28 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-7 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 h-9 rounded-full bg-white border border-emerald-200/70 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">Trusted by 10,000+ Filipino farmers</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
            Reliable Animal Medicines,
            <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Delivered Fast Across the Philippines
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-xl leading-relaxed">
            Safe, effective, and affordable veterinary products trusted by thousands of farms.
            From poultry to livestock — we keep your animals healthy and your business growing.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a href="#products" className="group inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5 transition">
              Order Now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a href="#products" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-slate-800 font-semibold border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 transition">
              <PlayCircle className="h-4 w-4" /> View Products
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-slate-200/70">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700">4.9</span>
              <span className="text-xs text-slate-500">(2,400+ reviews)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold">🇵🇭 Luzon, Visayas, Mindanao</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone className="h-4 w-4 text-emerald-600" />
              <a href="tel:+639176052089" className="font-semibold hover:text-emerald-600 transition">📞 Call/Text: 0917-605-2089</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold">💵 COD – Pay when you receive</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold">🚚 2–5 Days Delivery</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative animate-scale-in">
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-400/30 via-teal-300/20 to-transparent blur-2xl rounded-[3rem]" />
            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white border border-white shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-100">
              <img src="/image/vet-products.png" alt="Premium veterinary medicines for poultry and livestock" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- categories ---------- */
const ANIMALS = [
  { key: "chicken", label: "Poultry", desc: "Layers, broilers & gamefowl", image: "/image/chicken.png", bgColor: "bg-amber-100", popular: true },
  { key: "pig", label: "Swine", desc: "Boosters & feed additives", image: "/image/pig.png", bgColor: "bg-rose-100", popular: true },
  { key: "cattle", label: "Cattle", desc: "Minerals & supplements", image: "/image/cow.png", bgColor: "bg-indigo-100" },
  { key: "fly", label: "Fly Control", desc: "Insecticides & sprays", image: "/image/fly.png", bgColor: "bg-emerald-100" },
];

function Categories() {
  return (
    <section id="categories" className="py-20 md:py-28">
      <Container>
        <div className="flex items-end justify-between gap-6 mb-10 md:mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Shop by Animal</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">Find products for every animal</h2>
          </div>
          <a href="#products" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            View all <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-flow-col auto-cols-[80%] sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-4 sm:pb-0 -mx-5 px-5 sm:mx-0 sm:px-0">
          {ANIMALS.map((a) => (
            <a key={a.key} href="#products" className="snap-start group relative rounded-3xl border border-slate-200 bg-white p-6 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/10 hover:border-emerald-200 transition-all duration-300">
              {a.popular && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200">Popular</span>
              )}
              <div className={cn("h-14 w-14 rounded-2xl overflow-hidden shadow-lg transition group-hover:scale-110 group-hover:rotate-3", a.bgColor)}>
                <img src={a.image} alt={a.label} className="h-full w-full object-cover" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mt-5">{a.label}</h3>
              <p className="text-sm text-slate-500 mt-1">{a.desc}</p>
              <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                Browse products <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- product card (Order Now → modal) ---------- */
function ProductCard({ p, onView, onOrder, onViewDetail }: { p: Product; onView: (src: string) => void; onOrder: (name: string) => void; onViewDetail: (p: Product) => void }) {
  const stockLow = p.stock < 60;
  const labels = p.labels ?? [];
  return (
    <article 
      onClick={() => onViewDetail(p)}
      className="group relative rounded-3xl bg-white border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 cursor-pointer"
    >
      {/* Click hint - appears on hover for desktop only */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:block">
        <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg border border-slate-200">
          👆 Click to view details
        </span>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {p.image ? (
          <img 
            src={p.image} 
            alt={p.name} 
            loading="lazy" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            onClick={(e) => { e.stopPropagation(); p.image && onView(p.image); }}
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-400 text-sm">No image</div>
        )}
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {labels.includes("Best Seller") && <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500 text-white shadow-md">🔥 Best Seller</span>}
          {labels.includes("Fast Moving") && <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-md">⚡ Fast Moving</span>}
          {labels.includes("New") && <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-md">✨ New</span>}
        </div>
        {p.image && (
          <button 
            onClick={(e) => { e.stopPropagation(); onView(p.image); }} 
            className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-white/90 backdrop-blur text-slate-700 shadow-md opacity-0 group-hover:opacity-100 transition translate-y-1 group-hover:translate-y-0 hover:bg-white" 
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-5">
        {/* Mobile hint - tap to view */}
        <div className="sm:hidden mb-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            👆 Tap card to view details
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <span>{p.category}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className={cn("flex items-center gap-1", stockLow ? "text-amber-600" : "text-emerald-600")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", stockLow ? "bg-amber-500" : "bg-emerald-500")} />
            {stockLow ? "Low Stock" : "In Stock"}
          </span>
        </div>
        <h3 className="mt-2 font-display font-bold text-lg text-slate-900 line-clamp-1">{p.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-3 mt-1 min-h-[60px]">{p.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500">Price</p>
            <p className="font-display font-bold text-xl text-slate-900 tabular-nums">₱{Number(p.price).toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">💵 COD Available</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onOrder(p.name); }} 
              className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-600/30 transition"
            >
              <ShoppingBag className="h-4 w-4" /> Order
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Products({ products, onView, onOrder, onViewDetail }: { products: Product[] | null; onView: (s: string) => void; onOrder: (n: string) => void; onViewDetail: (p: Product) => void }) {
  const [filter, setFilter] = useState<string>("all");
  const filtered = !products ? [] : filter === "all" ? products : products.filter((p) => p.category === filter);
  const tabs = [
    { key: "all", label: "All Products" },
    { key: "chicken", label: "Poultry" },
    { key: "pig", label: "Swine" },
    { key: "cattle", label: "Cattle" },
    { key: "fly", label: "Fly Control" },
  ];
  return (
    <section id="products" className="py-20 md:py-28 bg-gradient-to-b from-white to-emerald-50/50">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Featured Products</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">Bestsellers loved by Filipino farmers</h2>
          <p className="text-slate-600 mt-3">Veterinary-grade formulas designed to keep your animals strong, healthy, and productive.</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-wrap justify-center gap-1 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setFilter(t.key)} className={cn(
                "px-4 h-10 rounded-xl text-sm font-semibold transition",
                filter === t.key ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {products === null ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[420px] rounded-3xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-500 py-12 rounded-3xl bg-white border border-slate-200">No products in this category yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => <ProductCard key={p.id} p={p} onView={onView} onOrder={onOrder} onViewDetail={onViewDetail} />)} 
          </div>
        )}
      </Container>
    </section>
  );
}

/* ---------- why us ---------- */
const REASONS = [
  { icon: ShieldCheck, title: "Trusted Quality", desc: "FDA-approved, lab-tested formulations only.", color: "emerald" },
  { icon: Truck, title: "Fast Delivery", desc: "Philippines-wide shipping with same-day dispatch.", color: "sky" },
  { icon: Wallet, title: "Affordable Pricing", desc: "Wholesale rates with bulk-order discounts.", color: "amber" },
  { icon: Stethoscope, title: "Expert Approved", desc: "Backed by licensed veterinarians.", color: "rose" },
];
const colorMap: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
};
function WhyUs() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Why Choose Us</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">Built on trust, delivered with care</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REASONS.map((r) => (
            <div key={r.title} className="rounded-3xl bg-white border border-slate-200 p-6 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300">
              <div className={cn("h-12 w-12 rounded-2xl grid place-items-center", colorMap[r.color])}>
                <r.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mt-5">{r.title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- how it works ---------- */
const STEPS = [
  { n: "01", title: "Choose Product", desc: "Browse our catalog and pick the right medicine for your animals.", icon: PackageCheck },
  { n: "02", title: "Place Order", desc: "Fill in your details — COD available, no prepayment needed.", icon: ShoppingBag },
  { n: "03", title: "We Deliver", desc: "Fast delivery anywhere in the Philippines — Luzon, Visayas, Mindanao.", icon: Truck },
];
function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-emerald-50/60 to-white">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">How It Works</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">Order in three simple steps</h2>
          <p className="text-slate-600 mt-3">Serving farmers across the Philippines 🇵🇭</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative rounded-3xl bg-white border border-slate-200 p-8 hover:shadow-xl hover:-translate-y-1 transition">
              <div className="flex items-center justify-between">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white shadow-lg shadow-emerald-600/30">
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="font-display text-5xl font-bold text-slate-100">{s.n}</span>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 mt-6">{s.title}</h3>
              <p className="text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                  <div className="h-8 w-8 rounded-full bg-white border border-slate-200 grid place-items-center text-emerald-600">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- testimonials ---------- */
type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: number;
  message: string;
};

function Reviews() {
  const [testimonials, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/testimonials?limit=6`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReviews(data.testimonials ?? []);
        } else {
          setReviews([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setReviews([]);
        setLoading(false);
      });
  }, []);

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Reviews</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-2">Trusted by Farmers</h2>
          <p className="text-slate-600 mt-3">Real stories from real customers.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <article key={t.id} className="rounded-3xl bg-white border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className={k < t.rating ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 text-slate-200"} />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">"{t.message}"</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white font-semibold text-sm">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  {t.location && <p className="text-xs text-slate-500">{t.location}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- CTA ---------- */
function CTA({ onOrder }: { onOrder: () => void }) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-10 md:p-16 text-white">
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:24px_24px] opacity-40" />
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-white/15 backdrop-blur text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> 🇵🇭 Serving farmers across the Philippines
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-4 leading-tight">Ready to order for your farm?</h2>
              <p className="text-emerald-50/90 mt-3 max-w-xl">Order online or call/text us for faster assistance. Free shipping on bulk orders.</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 🇵🇭 Luzon, Visayas, Mindanao</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 💵 COD Available – Pay on delivery</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 🚚 2–5 Days Delivery</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Free Shipping ₱5k+</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={onOrder} className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-emerald-700 font-bold hover:bg-emerald-50 transition shadow-lg">Order Now <ArrowRight className="h-4 w-4" /></button>
              <a href="tel:+639176052089" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white/10 backdrop-blur border border-white/30 text-white font-semibold hover:bg-white/20 transition">
                <Phone className="h-4 w-4" /> Call 0917-605-2089
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- floating contact button ---------- */
function FloatingContactButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <span className="text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full shadow-lg border border-slate-200">
        📞 Call or Text us for faster orders
      </span>
      <div className="flex gap-2">
        <a
          href="sms:+639176052089?body=Hi AlagaVet! I want to place an order. Product: [Product Name], Qty: [Quantity], Name: [Your Name], Address: [Your Address]. Please confirm availability. Thank you!"
          className="flex items-center gap-2 h-12 px-5 rounded-full bg-white text-emerald-700 font-semibold shadow-xl shadow-emerald-900/20 border border-emerald-100 hover:shadow-2xl hover:scale-105 transition-all"
        >
          <span className="text-lg">💬</span>
          <span className="hidden sm:inline">Text</span>
        </a>
        <a
          href="tel:+639176052089"
          className="flex items-center gap-2 h-12 px-5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-xl shadow-emerald-900/30 hover:shadow-2xl hover:scale-105 transition-all animate-pulse-slow"
        >
          <Phone className="h-5 w-5" />
          <span className="hidden sm:inline">Call Now</span>
          <span className="sm:hidden">0917-605-2089</span>
        </a>
      </div>
    </div>
  );
}

/* ---------- footer ---------- */
function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-300">
      <Container className="py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex flex-col items-start gap-4">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-white shadow-lg border-2 border-emerald-500/30">
              <img src="/image/logo.png" alt="AlagaVet Supply" className="h-full w-full object-cover" />
            </div>
            <p className="font-display font-bold text-2xl text-white">Alaga<span className="text-emerald-400">Vet</span></p>
          </div>
          <p className="text-sm text-slate-400 mt-3 max-w-sm leading-relaxed">Premium animal health products trusted by Filipino farmers. Veterinary-grade quality, delivered across the Philippines (Luzon, Visayas, Mindanao).</p>
          <div className="flex gap-2 mt-5">
            {[Facebook, Instagram, Twitter].map((I, i) => (
              <a key={i} href="#" className="h-10 w-10 grid place-items-center rounded-xl bg-white/5 hover:bg-emerald-600 hover:text-white transition border border-white/10">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="font-display font-bold text-white mb-4">Company</p>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><a href="#" className="hover:text-emerald-400 transition">About Us</a></li>
            <li><a href="#products" className="hover:text-emerald-400 transition">Products</a></li>
            <li><a href="#categories" className="hover:text-emerald-400 transition">Categories</a></li>
            <li><Link to="/admin-login" className="hover:text-emerald-400 transition">Admin Console</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-display font-bold text-white mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 mt-0.5 text-emerald-400" />
              <a href="tel:+639176052089" className="hover:text-emerald-400 transition">0917-605-2089</a>
            </li>
            <li className="flex items-start gap-2.5"><Mail className="h-4 w-4 mt-0.5 text-emerald-400" /> hello@alagavet.ph</li>
            <li className="flex items-start gap-2.5"><MapPin className="h-4 w-4 mt-0.5 text-emerald-400" /> Luzon, Visayas, Mindanao</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/5">
        <Container className="py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AlagaVet Animal Health Co. All rights reserved. | 💵 COD Available</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-emerald-400">Privacy</a>
            <a href="#" className="hover:text-emerald-400">Terms</a>
          </div>
        </Container>
      </div>
    </footer>
  );
}

/* ---------- page ---------- */
function Landing() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orderProduct, setOrderProduct] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [ctaOrderOpen, setCtaOrderOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Header />
      <main>
        <Hero />
        <Categories />
        <Products 
          products={products} 
          onView={setZoomImage} 
          onOrder={setOrderProduct}
          onViewDetail={setSelectedProduct}
        />
        <WhyUs />
        <HowItWorks />
        <Reviews />
        <CTA onOrder={() => setCtaOrderOpen(true)} />
      </main>
      <Footer />

      {orderProduct && (
        <OrderNowModal
          open={!!orderProduct}
          onOpenChange={(v) => !v && setOrderProduct(null)}
          productName={orderProduct}
        />
      )}
      <OrderNowModal
        open={ctaOrderOpen}
        onOpenChange={setCtaOrderOpen}
      />
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(v) => !v && setSelectedProduct(null)}
        allProducts={products || []}
        onOrder={setOrderProduct}
        onViewProduct={setSelectedProduct}
      />
      <ImageLightbox src={zoomImage} onClose={() => setZoomImage(null)} />
      <FloatingContactButton />
    </div>
  );
}
