import { useEffect, useState } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";

export function ImageLightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!src) return;
    setScale(1);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [src, onClose]);

  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setScale((s) => Math.max(0.5, s - 0.25)); }}
          className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setScale((s) => Math.min(4, s + 0.25)); }}
          className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <img
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{ transform: `scale(${scale})` }}
        className="max-h-full max-w-full rounded-xl object-contain shadow-2xl transition-transform duration-200"
      />
    </div>
  );
}
