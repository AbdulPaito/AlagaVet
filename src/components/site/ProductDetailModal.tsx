import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ShoppingBag, Truck, ShieldCheck, Package, Eye, Star, Sparkles, TrendingUp, Zap, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/routes/index";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allProducts: Product[];
  onOrder: (productName: string) => void;
  onViewProduct?: (product: Product) => void;
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  allProducts,
  onOrder,
  onViewProduct,
}: ProductDetailModalProps) {
  const [imageError, setImageError] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(product);

  // Get related products (same category, excluding current)
  const relatedProducts = useMemo(() => {
    if (!currentProduct) return [];
    return allProducts
      .filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id)
      .slice(0, 4);
  }, [allProducts, currentProduct]);

  // Get frequently bought together (different categories, bestsellers)
  const frequentlyBought = useMemo(() => {
    if (!currentProduct) return [];

    return allProducts
      .filter((p) => {
        if (p.id === currentProduct.id) return false;
        const pLabels = p.labels || [];
        // Include if it's a bestseller or fast moving from different category
        return (
          p.category !== currentProduct.category &&
          (pLabels.includes("Best Seller") || pLabels.includes("Fast Moving"))
        );
      })
      .slice(0, 3);
  }, [allProducts, currentProduct]);

  // Update current product when prop changes
  useEffect(() => {
    if (product) {
      setCurrentProduct(product);
      setImageError(false);
    }
  }, [product?.id]);

  if (!currentProduct) return null;

  const displayProduct = currentProduct;
  const stockLow = displayProduct.stock < 60;
  const labels = displayProduct.labels || [];

  const handleOrder = () => {
    onOrder(displayProduct.name);
    onOpenChange(false);
  };

  const handleViewRelated = (p: Product) => {
    if (onViewProduct) {
      onViewProduct(p);
    } else {
      setCurrentProduct(p);
      setImageError(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{displayProduct?.name || "Product"}</DialogTitle>
        </DialogHeader>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 h-10 w-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:bg-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image Section - Full width on mobile, half on desktop */}
          <div className="relative bg-slate-100 w-full h-[300px] sm:h-[400px] md:h-auto md:min-h-[500px]">
            {!imageError && displayProduct.image ? (
              <img
                src={displayProduct.image}
                alt={displayProduct.name}
                className="w-full h-full object-cover object-center"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Package className="h-20 w-20" />
              </div>
            )}

            {/* Labels overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {labels.includes("Best Seller") && (
                <Badge className="bg-rose-500 hover:bg-rose-500 text-white border-0">
                  🔥 Best Seller
                </Badge>
              )}
              {labels.includes("Fast Moving") && (
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0">
                  ⚡ Fast Moving
                </Badge>
              )}
              {labels.includes("New") && (
                <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-0">
                  ✨ New
                </Badge>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-8 flex flex-col">
            {/* Category & Stock */}
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="text-xs uppercase tracking-wider">
                {displayProduct.category}
              </Badge>
              <span
                className={`text-xs font-medium flex items-center gap-1 ${
                  stockLow ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    stockLow ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
                {stockLow ? "Low Stock" : "In Stock"} ({displayProduct.stock} units)
              </span>
            </div>

            {/* Name & Price */}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {displayProduct.name}
            </h1>
            <p className="text-3xl md:text-4xl font-bold text-emerald-600 mb-4">
              ₱{Number(displayProduct.price).toLocaleString()}
            </p>

            {/* Full Description */}
            <div className="max-h-[200px] overflow-y-auto mb-6">
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
                {displayProduct.description}
              </p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <Truck className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                <p className="text-xs text-slate-600">Fast Delivery</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <ShieldCheck className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                <p className="text-xs text-slate-600">Authentic</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <span className="text-lg">💵</span>
                <p className="text-xs text-slate-600">COD Available</p>
              </div>
            </div>

            {/* Order Button */}
            <Button
              onClick={handleOrder}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 mb-6"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Order Now
            </Button>

            {/* Additional Info */}
            <div className="space-y-3 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="font-medium capitalize">{displayProduct.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stock</span>
                <span className="font-medium">{displayProduct.stock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery</span>
                <span className="font-medium">2-5 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t px-6 py-6 bg-slate-50">
            <h3 className="font-semibold text-lg mb-4">Related Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <RelatedProductCard
                  key={p.id}
                  product={p}
                  onClick={() => {
                    setImageError(false);
                    handleViewRelated(p);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Frequently Bought Together - Improved Design */}
        {frequentlyBought.length > 0 && (
          <div className="border-t px-6 py-6 bg-gradient-to-b from-slate-50 to-white">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Frequently Bought Together</h3>
                <p className="text-xs text-slate-500">Complete your farm essentials</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {frequentlyBought.map((p, index) => (
                <FrequentlyBoughtCard
                  key={p.id}
                  product={p}
                  index={index}
                  onClick={() => {
                    setImageError(false);
                    handleViewRelated(p);
                  }}
                  onOrder={(e) => {
                    e.stopPropagation();
                    onOrder(p.name);
                    onOpenChange(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Small product card for related section
function RelatedProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const labels = product.labels || [];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all group"
    >
      <div className="aspect-square bg-slate-100 relative">
        {!imgError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Package className="h-10 w-10" />
          </div>
        )}
        {labels.includes("Best Seller") && (
          <Badge className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] border-0">
            BEST SELLER
          </Badge>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm line-clamp-1 mb-1">{product.name}</h4>
        <p className="text-emerald-600 font-bold text-sm">
          ₱{Number(product.price).toLocaleString()}
        </p>
        <button className="w-full mt-2 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition opacity-0 group-hover:opacity-100">
          Order Now
        </button>
      </div>
    </div>
  );
}

// Enhanced card for frequently bought together
function FrequentlyBoughtCard({
  product,
  index,
  onClick,
  onOrder,
}: {
  product: Product;
  index: number;
  onClick: () => void;
  onOrder: (e: React.MouseEvent) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const labels = product.labels || [];
  
  const badges = [
    { icon: Star, color: "bg-amber-100 text-amber-700", label: "Top Rated" },
    { icon: TrendingUp, color: "bg-emerald-100 text-emerald-700", label: "Best Seller" },
    { icon: Zap, color: "bg-blue-100 text-blue-700", label: "Fast Moving" },
  ];
  const badge = badges[index % badges.length];

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Rank Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${badge.color} text-xs font-semibold shadow-sm`}>
          <badge.icon className="h-3 w-3" />
          {badge.label}
        </div>
      </div>

      {/* Quick Add Button */}
      <button
        onClick={onOrder}
        className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-emerald-600 hover:text-white"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Image */}
      <div 
        onClick={onClick}
        className="aspect-[4/3] bg-slate-100 relative cursor-pointer overflow-hidden"
      >
        {!imgError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Package className="h-12 w-12" />
          </div>
        )}
        
        {/* Category Tag */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="outline" className="bg-white/90 backdrop-blur text-xs capitalize border-0">
            {product.category}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 
          onClick={onClick}
          className="font-bold text-sm text-slate-800 line-clamp-1 mb-1 cursor-pointer hover:text-emerald-600 transition"
        >
          {product.name}
        </h4>
        
        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < 4 ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
            ))}
          </div>
          <span className="text-xs text-slate-500">(4.8)</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Price</p>
            <p className="text-lg font-bold text-emerald-600">
              ₱{Number(product.price).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onOrder}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        {/* Stock Info */}
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={`h-1.5 w-1.5 rounded-full ${product.stock < 60 ? "bg-amber-500" : "bg-emerald-500"}`} />
          <span className={product.stock < 60 ? "text-amber-600" : "text-emerald-600"}>
            {product.stock < 60 ? "Low Stock" : "In Stock"}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">{product.stock} units</span>
        </div>
      </div>
    </div>
  );
}
